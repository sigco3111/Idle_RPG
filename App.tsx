import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerParty, PartyMember, EnemyStats, GameLogMessage, UpgradeType, EffectiveMemberStats, DiceRollDisplayInfo, FloatingTextInstance, EquipmentItem, EquipmentSlot, EquipmentModalState, CharacterClassName, EquipmentRarity } from './types';
import { 
  INITIAL_PLAYER_PARTY_STATE, INITIAL_PARTY_MEMBERS_CONFIG, COMMON_STARTER_EQUIPMENT, MAX_INVENTORY_SIZE,
  UPGRADE_CONFIGS, GAME_TICK_INTERVAL_MS, ENEMY_ATTACK_INTERVAL_MS, MAX_LOG_MESSAGES, 
  STAT_INCREASE_PER_MEMBER_LEVEL, XP_TO_NEXT_LEVEL_MULTIPLIER_MEMBER, 
  PARTY_MEMBER_HEALTH_REGEN_PERCENT_PER_SECOND, IDLE_RPG_SAVE_KEY, AUTO_SAVE_INTERVAL_MS,
  AUTO_UPGRADE_INTERVAL_MS, BOSS_BATTLE_THRESHOLD, PARTY_WIPE_REVIVAL_DELAY_MS,
  PARTY_WIPE_REVIVAL_HEALTH_PERCENT, BASE_AC, CRITICAL_HIT_ROLL, CRITICAL_MISS_ROLL,
  FINAL_STAGE_FOR_NG_PLUS
} from './constants';
import { CharacterPanel } from './components/CharacterPanel';
import { EnemyPanel } from './components/EnemyPanel';
import { GameLog } from './components/GameLog';
import { InventoryPanel } from './components/InventoryPanel';
import EquipmentModal from './components/EquipmentModal';
import { generateNewEnemy, generateBossForStage } from './services/enemyService';
import { getLootDrop } from './services/lootService';
import { formatNumber } from './utils/formatters';
import { NextStageIcon, PreviousStageIcon, SaveIcon, RefreshIcon } from './components/Icons';
import { rollD20, rollDice, parseDiceString } from './utils/diceRoller';
import { getEquipmentEffectValue, getEquipmentDamageDice, isItemEquippable, getSlotDisplayName } from './utils/equipmentUtils';
import { v4 as uuidv4 } from 'uuid';

const App = (): React.ReactNode => {
  const [playerParty, setPlayerParty] = useState<PlayerParty>(() => {
    const initialState = JSON.parse(JSON.stringify(INITIAL_PLAYER_PARTY_STATE));
    initialState.members.forEach((member: PartyMember) => {
        member.currentHealth = getEffectiveMemberStatsForApp(member, initialState, true).maxHealth;
    });
    return initialState;
  });
  const [currentEnemy, setCurrentEnemy] = useState<EnemyStats | null>(null);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [gameLog, setGameLog] = useState<GameLogMessage[]>([]);
  const [lastEnemyAttackTime, setLastEnemyAttackTime] = useState<number>(0);
  const [lastHealTime, setLastHealTime] = useState<number>(0);
  const [isAutoUpgradeEnabled, setIsAutoUpgradeEnabled] = useState<boolean>(true);
  const [isAutoStageProgressionEnabled, setIsAutoStageProgressionEnabled] = useState<boolean>(true);
  const [isAutoEquipEnabled, setIsAutoEquipEnabled] = useState<boolean>(true); 
  const [isPartyWiped, setIsPartyWiped] = useState<boolean>(false);
  const [battlesUntilBoss, setBattlesUntilBoss] = useState<number>(BOSS_BATTLE_THRESHOLD);
  const [isBossBattleActive, setIsBossBattleActive] = useState<boolean>(false);
  const [isStageBossDefeated, setIsStageBossDefeated] = useState<boolean>(false);
  const [canStartNewGamePlus, setCanStartNewGamePlus] = useState<boolean>(false); 

  const [diceRollDisplay, setDiceRollDisplay] = useState<DiceRollDisplayInfo | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextInstance[]>([]);
  const diceDisplayTimeoutRef = useRef<number | null>(null);

  const [equipmentModalState, setEquipmentModalState] = useState<EquipmentModalState>({ isOpen: false, memberId: null, slotType: null, inventoryItemId: null });
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null);

  const playerPartyRef = useRef(playerParty);
  const currentStageRef = useRef(currentStage);
  const currentEnemyRef = useRef(currentEnemy);
  const battlesUntilBossRef = useRef(battlesUntilBoss);
  const isBossBattleActiveRef = useRef(isBossBattleActive);
  const isStageBossDefeatedRef = useRef(isStageBossDefeated);
  const isAutoUpgradeEnabledRef = useRef(isAutoUpgradeEnabled);
  const isAutoStageProgressionEnabledRef = useRef(isAutoStageProgressionEnabled);
  const isAutoEquipEnabledRef = useRef(isAutoEquipEnabled); 
  const isPartyWipedRef = useRef(isPartyWiped);
  const canStartNewGamePlusRef = useRef(canStartNewGamePlus);
  const lastEnemyAttackTimeRef = useRef(lastEnemyAttackTime);
  const lastHealTimeRef = useRef(lastHealTime);


  useEffect(() => { playerPartyRef.current = playerParty; }, [playerParty]);
  useEffect(() => { currentStageRef.current = currentStage; }, [currentStage]);
  useEffect(() => { currentEnemyRef.current = currentEnemy; }, [currentEnemy]);
  useEffect(() => { battlesUntilBossRef.current = battlesUntilBoss; }, [battlesUntilBoss]);
  useEffect(() => { isBossBattleActiveRef.current = isBossBattleActive; }, [isBossBattleActive]);
  useEffect(() => { isStageBossDefeatedRef.current = isStageBossDefeated; }, [isStageBossDefeated]);
  useEffect(() => { isAutoUpgradeEnabledRef.current = isAutoUpgradeEnabled; }, [isAutoUpgradeEnabled]);
  useEffect(() => { isAutoStageProgressionEnabledRef.current = isAutoStageProgressionEnabled; }, [isAutoStageProgressionEnabled]);
  useEffect(() => { isAutoEquipEnabledRef.current = isAutoEquipEnabled; }, [isAutoEquipEnabled]); 
  useEffect(() => { isPartyWipedRef.current = isPartyWiped; }, [isPartyWiped]);
  useEffect(() => { canStartNewGamePlusRef.current = canStartNewGamePlus; }, [canStartNewGamePlus]);
  useEffect(() => { lastEnemyAttackTimeRef.current = lastEnemyAttackTime; }, [lastEnemyAttackTime]);
  useEffect(() => { lastHealTimeRef.current = lastHealTime; }, [lastHealTime]);


  const addLogMessage = useCallback((text: string, type: GameLogMessage['type'], details?: string) => {
    setGameLog(prevLog => {
      const newLog = [...prevLog, { id: uuidv4(), text, type, timestamp: Date.now(), details }];
      return newLog.slice(-MAX_LOG_MESSAGES);
    });
  }, []);
  
  const createFloatingText = useCallback((text: string, colorType: FloatingTextInstance['colorType'], targetId: string) => {
    setFloatingTexts(prev => [...prev, { id: uuidv4(), text, colorType, targetId, offsetX: Math.random()*40-20, offsetY: Math.random()*20-10, timestamp: Date.now() }]);
  }, []);

  const handleFloatingTextAnimationComplete = useCallback((id: string) => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), []);
  const showDiceRollAnimation = useCallback((info: Omit<DiceRollDisplayInfo, 'isVisible' | 'key'>) => {
    if (diceDisplayTimeoutRef.current) clearTimeout(diceDisplayTimeoutRef.current);
    setDiceRollDisplay({ ...info, isVisible: true, key: uuidv4() });
    diceDisplayTimeoutRef.current = window.setTimeout(() => setDiceRollDisplay(prev => prev ? { ...prev, isVisible: false } : null), 3000);
  }, []);

  const getEffectiveMemberStats = useCallback((member: PartyMember, party: PlayerParty, forInitialHealth: boolean = false): EffectiveMemberStats => {
    let maxHealth = member.baseMaxHealth;
    let attackSpeed = member.baseAttackSpeed;
    let armorClass = BASE_AC + Math.floor(member.baseDefense / 3);
    let attackBonus = Math.floor(member.level / 2) + Math.floor(member.baseAttack / 4 - 1);
    let damageBonus = Math.max(0, Math.floor(member.baseAttack / 3 - 2));
    let weaponDamageDiceStr = member.baseWeaponDamageDiceStr;

    if (!forInitialHealth) {
        maxHealth += party.partyMaxHealthUpgradeLevel * UPGRADE_CONFIGS.maxHealth.statIncrement;
        armorClass += Math.floor(party.partyDefenseUpgradeLevel * (UPGRADE_CONFIGS.defense.statIncrementAC || 0));
        attackBonus += Math.floor(party.partyAttackUpgradeLevel * (UPGRADE_CONFIGS.attack.statIncrementAttackBonus || 0));
        damageBonus += Math.floor(party.partyAttackUpgradeLevel * (UPGRADE_CONFIGS.attack.statIncrementDamageBonus || 0));
        attackSpeed += party.partyAttackSpeedUpgradeLevel * UPGRADE_CONFIGS.attackSpeed.statIncrement;
    }
    
    for (const slotKey in member.equipment) {
        const item = member.equipment[slotKey as EquipmentSlot];
        if (item) {
            maxHealth += getEquipmentEffectValue(item, 'maxHealthMod');
            armorClass += getEquipmentEffectValue(item, 'armorClassMod');
            attackBonus += getEquipmentEffectValue(item, 'attackBonusMod');
            damageBonus += getEquipmentEffectValue(item, 'damageBonusMod');
            attackSpeed += getEquipmentEffectValue(item, 'attackSpeedMod');
            if (item.slot === 'weapon' && item.weaponDamageDiceStrOverride) {
                weaponDamageDiceStr = item.weaponDamageDiceStrOverride;
            }
        }
    }
    
    maxHealth = Math.max(1, maxHealth);
    attackSpeed = Math.max(0.1, attackSpeed); 
     if (UPGRADE_CONFIGS.attackSpeed.maxLevel) { 
        const baseSpeed = INITIAL_PARTY_MEMBERS_CONFIG.find(mConf => mConf.id === member.id)?.baseAttackSpeed || 1;
        const maxSpeedFromUpgrades = baseSpeed + (UPGRADE_CONFIGS.attackSpeed.maxLevel * UPGRADE_CONFIGS.attackSpeed.statIncrement);
        attackSpeed = Math.min(attackSpeed, maxSpeedFromUpgrades + (member.equipment.weapon?.attackSpeedMod || 0) + (member.equipment.armor?.attackSpeedMod || 0) + (member.equipment.accessory?.attackSpeedMod || 0));
     }

    return { maxHealth, attackSpeed, armorClass, attackBonus, damageBonus, weaponDamageDiceStr };
  }, []);
  
  function getEffectiveMemberStatsForApp(member: PartyMember, party: PlayerParty, forInitialHealth: boolean = false): EffectiveMemberStats {
    let maxHealth = member.baseMaxHealth;
    let attackSpeed = member.baseAttackSpeed;
    let armorClass = BASE_AC + Math.floor(member.baseDefense / 3);
    let attackBonus = Math.floor(member.level / 2) + Math.floor(member.baseAttack / 4 - 1);
    let damageBonus = Math.max(0, Math.floor(member.baseAttack / 3 - 2));
    let weaponDamageDiceStr = member.baseWeaponDamageDiceStr;

    // This function is used for initial health setup, so party upgrades are not applied yet.
    // It's simplified compared to getEffectiveMemberStats.
    
    for (const slotKey in member.equipment) {
        const item = member.equipment[slotKey as EquipmentSlot];
        if (item) {
            maxHealth += getEquipmentEffectValue(item, 'maxHealthMod');
            armorClass += getEquipmentEffectValue(item, 'armorClassMod');
            // Attack speed, attack bonus, damage bonus modifications from equipment are not calculated here
            // as this function is primarily for maxHealth initalization with starting gear.
            if (item.slot === 'weapon' && item.weaponDamageDiceStrOverride) weaponDamageDiceStr = item.weaponDamageDiceStrOverride;
        }
    }
    return { maxHealth, attackSpeed, armorClass, attackBonus, damageBonus, weaponDamageDiceStr };
  }

  useEffect(() => {
    const savedData = localStorage.getItem(IDLE_RPG_SAVE_KEY);
    let initialEnemyToSpawn: EnemyStats | null = null;
    let gameLoadedMessage = '새로운 모험을 불러왔습니다 (NG+ 업데이트 적용).';

    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            const loadedMembers = (parsedData.playerParty?.members || []).map((savedMemberData: any) => {
                const initialConfig = INITIAL_PARTY_MEMBERS_CONFIG.find(im => im.id === savedMemberData.id);
                if (!initialConfig) return null; 

                const loadedMember: PartyMember = {
                    ...initialConfig, 
                    level: savedMemberData.level || 1,
                    xp: savedMemberData.xp || 0,
                    xpToNextLevel: savedMemberData.xpToNextLevel || 100,
                    currentHealth: savedMemberData.currentHealth || initialConfig.baseMaxHealth,
                    isUnlocked: savedMemberData.isUnlocked !== undefined ? savedMemberData.isUnlocked : initialConfig.isUnlocked,
                    isActiveInCombat: savedMemberData.isActiveInCombat !== undefined ? savedMemberData.isActiveInCombat : initialConfig.isActiveInCombat,
                    lastAttackTime: savedMemberData.lastAttackTime || 0,
                    equipment: { weapon: null, armor: null, shield: null, accessory: null },
                };
                for (const slot in savedMemberData.equipment) {
                    if (savedMemberData.equipment[slot as EquipmentSlot]) {
                        loadedMember.equipment[slot as EquipmentSlot] = JSON.parse(JSON.stringify(savedMemberData.equipment[slot as EquipmentSlot]));
                    }
                }
                return loadedMember;
            }).filter((m): m is PartyMember => m !== null);

            INITIAL_PARTY_MEMBERS_CONFIG.forEach(initialConfig => {
                if (!loadedMembers.find(lm => lm.id === initialConfig.id)) {
                     const newMember: PartyMember = {
                        ...initialConfig, level: 1, xp:0, xpToNextLevel: 80, currentHealth: initialConfig.baseMaxHealth, 
                        equipment: JSON.parse(JSON.stringify(COMMON_STARTER_EQUIPMENT[initialConfig.className])),
                        lastAttackTime:0,
                    };
                    loadedMembers.push(newMember);
                }
            });
            
            const loadedPartyState: PlayerParty = {
                ...INITIAL_PLAYER_PARTY_STATE, 
                ...(parsedData.playerParty || {}),
                members: loadedMembers,
                inventory: parsedData.playerParty?.inventory ? parsedData.playerParty.inventory.map((item: any) => JSON.parse(JSON.stringify(item))) : [], 
                MAX_INVENTORY_SIZE: parsedData.playerParty?.MAX_INVENTORY_SIZE || MAX_INVENTORY_SIZE,
                ngPlusLevel: parsedData.playerParty?.ngPlusLevel || 0, 
            };
            
            loadedPartyState.members.forEach(m => {
                 const initialEffectiveStats = getEffectiveMemberStatsForApp(m, loadedPartyState, true);
                 m.currentHealth = Math.min(parsedData.playerParty?.members.find((sm:any) => sm.id === m.id)?.currentHealth || initialEffectiveStats.maxHealth, initialEffectiveStats.maxHealth);
            });

            setPlayerParty(loadedPartyState);
            const loadedStage = parsedData.currentStage || 1;
            setCurrentStage(loadedStage);
            setBattlesUntilBoss(parsedData.battlesUntilBoss !== undefined ? parsedData.battlesUntilBoss : BOSS_BATTLE_THRESHOLD);
            setIsBossBattleActive(parsedData.isBossBattleActive || false);
            setIsStageBossDefeated(parsedData.isStageBossDefeated || false);
            setCanStartNewGamePlus(parsedData.canStartNewGamePlus || false); 
            setIsAutoUpgradeEnabled(parsedData.isAutoUpgradeEnabled !== undefined ? parsedData.isAutoUpgradeEnabled : true);
            setIsAutoStageProgressionEnabled(parsedData.isAutoStageProgressionEnabled !== undefined ? parsedData.isAutoStageProgressionEnabled : true);
            setIsAutoEquipEnabled(parsedData.isAutoEquipEnabled !== undefined ? parsedData.isAutoEquipEnabled : true); 
            setLastEnemyAttackTime(parsedData.lastEnemyAttackTime || 0);
            setLastHealTime(parsedData.lastHealTime || 0);


            if (parsedData.canStartNewGamePlus) { 
                initialEnemyToSpawn = null;
            } else if (parsedData.isBossBattleActive) {
                 initialEnemyToSpawn = generateBossForStage(loadedStage, loadedPartyState.ngPlusLevel);
            } else if (parsedData.battlesUntilBoss <= 0 && !parsedData.isStageBossDefeated) { 
                setIsBossBattleActive(true); 
                initialEnemyToSpawn = generateBossForStage(loadedStage, loadedPartyState.ngPlusLevel); 
            } else {
                initialEnemyToSpawn = generateNewEnemy(loadedStage, loadedPartyState.ngPlusLevel);
            }

        } catch (error) { console.error('저장 데이터 불러오기 실패 (NG+):', error); gameLoadedMessage = '저장 데이터 오류. 새 모험으로 시작합니다.'; 
            const freshParty = JSON.parse(JSON.stringify(INITIAL_PLAYER_PARTY_STATE));
            freshParty.members.forEach((member: PartyMember) => { member.currentHealth = getEffectiveMemberStatsForApp(member, freshParty, true).maxHealth; });
            setPlayerParty(freshParty); 
            setCurrentStage(1); 
            initialEnemyToSpawn = generateNewEnemy(1, 0); 
        }
    } else { gameLoadedMessage = '새로운 D&D 파티 모험을 시작합니다! 행운을 빌어요!'; 
        const freshParty = JSON.parse(JSON.stringify(INITIAL_PLAYER_PARTY_STATE));
        freshParty.members.forEach((member: PartyMember) => { member.currentHealth = getEffectiveMemberStatsForApp(member, freshParty, true).maxHealth; });
        setPlayerParty(freshParty);
        initialEnemyToSpawn = generateNewEnemy(1, 0);
    }
    addLogMessage(gameLoadedMessage, gameLoadedMessage.includes('오류') ? 'error' : (savedData ? 'save' : 'system'));
    if (initialEnemyToSpawn && !currentEnemyRef.current && !canStartNewGamePlusRef.current) { 
        setCurrentEnemy(initialEnemyToSpawn);
    }
  }, [addLogMessage]); // getEffectiveMemberStats removed as getEffectiveMemberStatsForApp is used for init


  const saveGameState = useCallback(() => {
    try {
      const gameState = { playerParty: playerPartyRef.current, currentStage: currentStageRef.current, battlesUntilBoss: battlesUntilBossRef.current, isBossBattleActive: isBossBattleActiveRef.current, isStageBossDefeated: isStageBossDefeatedRef.current, canStartNewGamePlus: canStartNewGamePlusRef.current, isAutoUpgradeEnabled: isAutoUpgradeEnabledRef.current, isAutoStageProgressionEnabled: isAutoStageProgressionEnabledRef.current, isAutoEquipEnabled: isAutoEquipEnabledRef.current, lastEnemyAttackTime: lastEnemyAttackTimeRef.current, lastHealTime: lastHealTimeRef.current }; 
      localStorage.setItem(IDLE_RPG_SAVE_KEY, JSON.stringify(gameState));
      addLogMessage('게임이 자동 저장되었습니다.', 'save');
    } catch (error) { console.error('게임 저장 실패:', error); addLogMessage('게임 저장에 실패했습니다.', 'error'); }
  }, [addLogMessage]);

  useEffect(() => { const intervalId = setInterval(saveGameState, AUTO_SAVE_INTERVAL_MS); return () => clearInterval(intervalId); }, [saveGameState]);
  useEffect(() => { window.addEventListener('beforeunload', saveGameState); return () => window.removeEventListener('beforeunload', saveGameState); }, [saveGameState]);
  
  const getUpgradeCost = useCallback((type: UpgradeType): number => {
    const config = UPGRADE_CONFIGS[type]; const party = playerPartyRef.current; let level = 0;
    switch(type) { case UpgradeType.Attack: level = party.partyAttackUpgradeLevel; break; case UpgradeType.Defense: level = party.partyDefenseUpgradeLevel; break; case UpgradeType.MaxHealth: level = party.partyMaxHealthUpgradeLevel; break; case UpgradeType.AttackSpeed: level = party.partyAttackSpeedUpgradeLevel; break; }
    return Math.floor(config.baseCost * Math.pow(config.scaleFactor, level));
  }, []);

  const handleUpgrade = useCallback((type: UpgradeType, isAuto: boolean = false) => {
    const config = UPGRADE_CONFIGS[type];
    setPlayerParty(prevParty => {
      let currentLevelForCostCalc = 0;
      switch(type) { case UpgradeType.Attack: currentLevelForCostCalc = prevParty.partyAttackUpgradeLevel; break; case UpgradeType.Defense: currentLevelForCostCalc = prevParty.partyDefenseUpgradeLevel; break; case UpgradeType.MaxHealth: currentLevelForCostCalc = prevParty.partyMaxHealthUpgradeLevel; break; case UpgradeType.AttackSpeed: currentLevelForCostCalc = prevParty.partyAttackSpeedUpgradeLevel; break; }
      const cost = getUpgradeCost(type);
      if (prevParty.gold < cost) { if (!isAuto) addLogMessage(`${config.name} 강화에 골드가 부족합니다. (필요: ${formatNumber(cost)})`, 'error'); return prevParty; }
      if (config.maxLevel !== undefined && currentLevelForCostCalc >= config.maxLevel) { if (!isAuto) addLogMessage(`${config.name}은(는) 이미 최대 레벨입니다.`, 'system'); return prevParty; }
      let newParty = { ...prevParty, gold: prevParty.gold - cost };
      switch (type) {
        case UpgradeType.Attack: newParty.partyAttackUpgradeLevel += 1; break;
        case UpgradeType.Defense: newParty.partyDefenseUpgradeLevel += 1; break;
        case UpgradeType.MaxHealth: newParty.partyMaxHealthUpgradeLevel += 1; newParty.members = newParty.members.map(m => { if (m.isUnlocked) { const oldEffective = getEffectiveMemberStats(m, prevParty); const newEffective = getEffectiveMemberStats(m, {...prevParty, partyMaxHealthUpgradeLevel: newParty.partyMaxHealthUpgradeLevel }); const healthIncrease = newEffective.maxHealth - oldEffective.maxHealth; return {...m, currentHealth: Math.min(m.currentHealth + healthIncrease, newEffective.maxHealth)}; } return m; }); break;
        case UpgradeType.AttackSpeed: newParty.partyAttackSpeedUpgradeLevel +=1; break;
      }
      if (!isAuto) addLogMessage(`${config.name} 강화! (비용: ${formatNumber(cost)} 골드)`, 'system');
      return newParty;
    });
  }, [addLogMessage, getUpgradeCost, getEffectiveMemberStats]); 

  useEffect(() => { 
    if (!isAutoUpgradeEnabledRef.current) return;
    const autoUpgradeInterval = setInterval(() => {
      const currentPartySnapshot = playerPartyRef.current; let bestUpgrade: UpgradeType | null = null; let minCost = Infinity;
      (Object.keys(UPGRADE_CONFIGS) as UpgradeType[]).forEach(type => {
        const config = UPGRADE_CONFIGS[type]; let currentLevel = 0;
        switch(type) { case UpgradeType.Attack: currentLevel = currentPartySnapshot.partyAttackUpgradeLevel; break; case UpgradeType.Defense: currentLevel = currentPartySnapshot.partyDefenseUpgradeLevel; break; case UpgradeType.MaxHealth: currentLevel = currentPartySnapshot.partyMaxHealthUpgradeLevel; break; case UpgradeType.AttackSpeed: currentLevel = currentPartySnapshot.partyAttackSpeedUpgradeLevel; break; }
        if (config.maxLevel !== undefined && currentLevel >= config.maxLevel) return;
        const cost = getUpgradeCost(type); if (currentPartySnapshot.gold >= cost && cost < minCost) { minCost = cost; bestUpgrade = type; }
      });
      if (bestUpgrade) handleUpgrade(bestUpgrade, true);
    }, AUTO_UPGRADE_INTERVAL_MS);
    return () => clearInterval(autoUpgradeInterval);
  }, [isAutoUpgradeEnabled, handleUpgrade, getUpgradeCost]);

  const handleRecruitMember = useCallback((memberId: string) => {
    setPlayerParty(prevParty => {
      const memberToRecruit = prevParty.members.find(m => m.id === memberId);
      if (!memberToRecruit || memberToRecruit.isUnlocked) return prevParty;
      if (memberToRecruit.unlockStageRequirement && currentStageRef.current < memberToRecruit.unlockStageRequirement) { addLogMessage(`${memberToRecruit.name} 영입 조건 미달성 (스테이지 ${memberToRecruit.unlockStageRequirement} 필요).`, 'error'); return prevParty; }
      addLogMessage(`${memberToRecruit.name}이(가) 파티에 합류했습니다!`, 'party');
      return { ...prevParty, members: prevParty.members.map(m => m.id === memberId ? { ...m, isUnlocked: true, isActiveInCombat: true, currentHealth: getEffectiveMemberStats(m, prevParty).maxHealth } : m ) };
    });
  }, [addLogMessage, getEffectiveMemberStats]);

  const handleNextStage = useCallback(() => {
    if (canStartNewGamePlusRef.current) { addLogMessage("다음 회차를 시작해야 합니다.", "system"); return; }
    const activeMembers = playerPartyRef.current.members.filter(m => m.isUnlocked && m.isActiveInCombat);
    if (activeMembers.length === 0 && !isPartyWipedRef.current) { addLogMessage("활동 가능한 파티원이 없습니다. 다음 스테이지로 진행할 수 없습니다.", "error"); return; }
    if (!isStageBossDefeatedRef.current) { addLogMessage("현재 스테이지의 보스를 처치해야 다음 스테이지로 이동할 수 있습니다.", "error"); return; }
    
    const newStage = currentStageRef.current + 1; 
    setCurrentStage(newStage); 
    addLogMessage(`스테이지 ${newStage}(으)로 이동합니다.`, 'system');
    setPlayerParty(prevParty => ({ ...prevParty, members: prevParty.members.map(m => { if (m.isUnlocked) { const effectiveStats = getEffectiveMemberStats(m, prevParty); return { ...m, isActiveInCombat: true, currentHealth: effectiveStats.maxHealth, lastAttackTime: 0 }; } return m; }) }));
    setIsStageBossDefeated(false); 
    setBattlesUntilBoss(BOSS_BATTLE_THRESHOLD); 
    setIsBossBattleActive(false);
    const newEnemy = generateNewEnemy(newStage, playerPartyRef.current.ngPlusLevel); 
    setCurrentEnemy(newEnemy); 
    addLogMessage(`${newEnemy.name} 등장!`, 'system');
    saveGameState();
  }, [addLogMessage, getEffectiveMemberStats, saveGameState]);

  const handlePreviousStage = useCallback(() => {
    if (currentStageRef.current <= 1) { addLogMessage("이미 첫 번째 스테이지입니다.", "system"); return; }
    if (canStartNewGamePlusRef.current) { addLogMessage("다음 회차를 시작해야 합니다.", "system"); return; }
    if (isPartyWipedRef.current) { addLogMessage("파티가 전멸 상태입니다. 이전 스테이지로 이동할 수 없습니다.", "error"); return; }
    const activeMembers = playerPartyRef.current.members.filter(m => m.isUnlocked && m.isActiveInCombat);
    if (activeMembers.length === 0) { addLogMessage("활동 가능한 파티원이 없습니다. 이전 스테이지로 이동할 수 없습니다.", "error"); return; }

    const newStage = currentStageRef.current - 1;
    setCurrentStage(newStage);
    addLogMessage(`스테이지 ${newStage}(으)로 이동합니다.`, 'system');
    setPlayerParty(prevParty => ({ ...prevParty, members: prevParty.members.map(m => { if (m.isUnlocked) { const effectiveStats = getEffectiveMemberStats(m, prevParty); return { ...m, isActiveInCombat: true, currentHealth: effectiveStats.maxHealth, lastAttackTime: 0 }; } return m; }) }));
    setIsStageBossDefeated(true); 
    setBattlesUntilBoss(BOSS_BATTLE_THRESHOLD);
    setIsBossBattleActive(false);
    const newEnemy = generateNewEnemy(newStage, playerPartyRef.current.ngPlusLevel);
    setCurrentEnemy(newEnemy);
    addLogMessage(`${newEnemy.name} 등장!`, 'system');
    saveGameState();
  }, [addLogMessage, getEffectiveMemberStats, saveGameState]);


  const handleStartNewGamePlus = useCallback(() => {
    const currentParty = playerPartyRef.current;
    const newNgPlusLevel = currentParty.ngPlusLevel + 1;
    addLogMessage(`NG+${newNgPlusLevel} 모험을 시작합니다! 적들이 더욱 강력해졌습니다.`, 'system');

    setPlayerParty(prevParty => ({
      ...prevParty,
      ngPlusLevel: newNgPlusLevel,
      members: prevParty.members.map(m => {
        if (m.isUnlocked) {
          const effectiveStats = getEffectiveMemberStats(m, { ...prevParty, ngPlusLevel: newNgPlusLevel }); 
          return { ...m, currentHealth: effectiveStats.maxHealth, isActiveInCombat: true, lastAttackTime: 0 };
        }
        return m;
      })
    }));
    setCurrentStage(1);
    setBattlesUntilBoss(BOSS_BATTLE_THRESHOLD);
    setIsBossBattleActive(false);
    setIsStageBossDefeated(false);
    setCanStartNewGamePlus(false);
    setCurrentEnemy(generateNewEnemy(1, newNgPlusLevel));
    saveGameState();
  }, [addLogMessage, getEffectiveMemberStats, saveGameState]);


  // 인벤토리 아이템을 선택하는 함수 (모달 열지 않음)
  const handleSelectInventoryItem = useCallback((itemId: string) => {
    console.log("아이템 선택됨:", itemId);
    setSelectedInventoryItemId(itemId);
  }, []);

  const handleOpenEquipmentModal = useCallback((memberId: string | null, slotType: EquipmentSlot | null, inventoryItemId: string) => {
    console.log("handleOpenEquipmentModal called with:", { memberId, slotType, inventoryItemId });
    setSelectedInventoryItemId(inventoryItemId); 
    setEquipmentModalState({ isOpen: true, memberId, slotType, inventoryItemId });
  }, []);

  const handleCloseEquipmentModal = useCallback(() => {
    setEquipmentModalState({ isOpen: false, memberId: null, slotType: null, inventoryItemId: null });
    setSelectedInventoryItemId(null);
  }, []);

  const handleEquipItemToMember = useCallback((memberId: string, slotToEquip: EquipmentSlot, itemIdToEquip: string) => {
    setPlayerParty(prevParty => {
      const newParty = JSON.parse(JSON.stringify(prevParty)) as PlayerParty; 
      const member = newParty.members.find(m => m.id === memberId);
      const itemFromInventory = newParty.inventory.find(item => item.id === itemIdToEquip);

      if (!member || !itemFromInventory) { addLogMessage("장착 오류: 멤버 또는 아이템을 찾을 수 없습니다.", "error"); return prevParty; }
      if (!isItemEquippable(itemFromInventory, member.className, slotToEquip)) { addLogMessage(`${member.name}은(는) ${itemFromInventory.name}을(를) ${getSlotDisplayName(slotToEquip)} 슬롯에 장착할 수 없습니다.`, "error"); return prevParty; }

      const currentlyEquippedItem = member.equipment[slotToEquip];
      newParty.inventory = newParty.inventory.filter(item => item.id !== itemIdToEquip);
      member.equipment[slotToEquip] = itemFromInventory;
      if (currentlyEquippedItem) {
        if (newParty.inventory.length < newParty.MAX_INVENTORY_SIZE) { newParty.inventory.push(currentlyEquippedItem); addLogMessage(`${member.name}의 ${getSlotDisplayName(slotToEquip)} 슬롯에서 ${currentlyEquippedItem.name}을(를) 벗고 ${itemFromInventory.name}을(를) 장착했습니다.`, 'loot');
        } else { addLogMessage(`${itemFromInventory.name} 장착. 이전 아이템 ${currentlyEquippedItem.name}은(는) 가방 공간 부족으로 소멸되었습니다!`, 'error'); }
      } else { addLogMessage(`${member.name}이(가) ${itemFromInventory.name}을(를) ${getSlotDisplayName(slotToEquip)} 슬롯에 장착했습니다.`, 'loot'); }
      
      const newEffectiveStats = getEffectiveMemberStats(member, newParty);
      if (member.currentHealth > newEffectiveStats.maxHealth) member.currentHealth = newEffectiveStats.maxHealth;
      else if (member.currentHealth < newEffectiveStats.maxHealth && itemFromInventory.maxHealthMod && itemFromInventory.maxHealthMod > 0) {
         const oldMaxHealth = getEffectiveMemberStats(prevParty.members.find(m=>m.id === memberId)!, prevParty).maxHealth;
         member.currentHealth += (newEffectiveStats.maxHealth - oldMaxHealth);
         member.currentHealth = Math.min(member.currentHealth, newEffectiveStats.maxHealth);
      }
      return newParty;
    });
    handleCloseEquipmentModal(); 
  }, [addLogMessage, getEffectiveMemberStats, handleCloseEquipmentModal]);

  const calculateWeaponScore = (item: EquipmentItem | null, baseDiceStr: string, baseDmgBonus: number, baseAtkBonus: number): number => {
      const diceStr = item?.weaponDamageDiceStrOverride || baseDiceStr;
      const parsed = parseDiceString(diceStr);
      const avgRoll = parsed ? parsed.count * (parsed.sides + 1) / 2 : 0;
      const damageBonus = (item?.damageBonusMod || 0) + baseDmgBonus;
      const attackBonus = (item?.attackBonusMod || 0) + baseAtkBonus;
      return avgRoll + damageBonus + (attackBonus / 2);
  };


  const handleAutoEquipItem = useCallback((itemToAutoEquip: EquipmentItem) => {
    setPlayerParty(prevParty => {
        if (!isAutoEquipEnabledRef.current) return prevParty;

        let itemWasEquippedThisCall = false;
        const newParty = JSON.parse(JSON.stringify(prevParty)) as PlayerParty;

        for (let i = 0; i < newParty.members.length; i++) {
            const member = newParty.members[i];
            if (itemWasEquippedThisCall) break;
            if (!member.isUnlocked || !member.isActiveInCombat) continue;

            const slotToEquip = itemToAutoEquip.slot;
            if (isItemEquippable(itemToAutoEquip, member.className, slotToEquip)) {
                const currentEquippedItem = member.equipment[slotToEquip];
                let isUpgrade = false;
                const rarityOrder: EquipmentRarity[] = ['Common', 'Uncommon', 'Rare', 'Epic'];

                if (!currentEquippedItem) {
                    isUpgrade = true;
                } else if (rarityOrder.indexOf(itemToAutoEquip.rarity) > rarityOrder.indexOf(currentEquippedItem.rarity)) {
                    isUpgrade = true;
                } else if (itemToAutoEquip.rarity === currentEquippedItem.rarity) {
                    if (slotToEquip === 'weapon') {
                        const memberBaseStats = getEffectiveMemberStats(member, newParty); 
                        const newItemScore = calculateWeaponScore(itemToAutoEquip, member.baseWeaponDamageDiceStr, memberBaseStats.damageBonus - (currentEquippedItem?.damageBonusMod || 0), memberBaseStats.attackBonus - (currentEquippedItem?.attackBonusMod || 0) );
                        const currentItemScore = calculateWeaponScore(currentEquippedItem, member.baseWeaponDamageDiceStr, memberBaseStats.damageBonus - (currentEquippedItem?.damageBonusMod || 0), memberBaseStats.attackBonus - (currentEquippedItem?.attackBonusMod || 0));
                        if (newItemScore > currentItemScore * 1.05) isUpgrade = true;
                    } else if (slotToEquip === 'armor' || slotToEquip === 'shield') {
                        if ((itemToAutoEquip.armorClassMod || 0) > (currentEquippedItem.armorClassMod || 0)) isUpgrade = true;
                        if ((itemToAutoEquip.maxHealthMod || 0) > (currentEquippedItem.maxHealthMod || 0) + 5) isUpgrade = true;
                    } else if (slotToEquip === 'accessory') {
                        if ((itemToAutoEquip.maxHealthMod || 0) > (currentEquippedItem.maxHealthMod || 0)) isUpgrade = true;
                        if (itemToAutoEquip.attackBonusMod && (!currentEquippedItem.attackBonusMod || itemToAutoEquip.attackBonusMod > currentEquippedItem.attackBonusMod)) isUpgrade = true;
                        if (itemToAutoEquip.damageBonusMod && (!currentEquippedItem.damageBonusMod || itemToAutoEquip.damageBonusMod > currentEquippedItem.damageBonusMod)) isUpgrade = true;
                    }
                }

                if (isUpgrade) {
                    const itemIndexInInventory = newParty.inventory.findIndex(invItem => invItem.id === itemToAutoEquip.id);
                    if (itemIndexInInventory > -1) {
                        newParty.inventory.splice(itemIndexInInventory, 1);
                    } else { continue; }

                    if (currentEquippedItem) {
                        if (newParty.inventory.length < newParty.MAX_INVENTORY_SIZE) {
                            newParty.inventory.push(currentEquippedItem);
                        } else {
                            addLogMessage(`자동 장착 중 공간 부족: 이전 아이템 ${currentEquippedItem.name} 소멸.`, 'error');
                        }
                    }
                    member.equipment[slotToEquip] = itemToAutoEquip;
                    addLogMessage(`${member.name}에게 ${itemToAutoEquip.name}(${itemToAutoEquip.rarity}) 자동 장착됨.`, 'loot');
                    createFloatingText(`자동 장착!`, 'info', member.id);
                    itemWasEquippedThisCall = true;

                    const newEffectiveStats = getEffectiveMemberStats(member, newParty);
                    if (member.currentHealth > newEffectiveStats.maxHealth) member.currentHealth = newEffectiveStats.maxHealth;
                    else if (itemToAutoEquip.maxHealthMod && itemToAutoEquip.maxHealthMod > 0) {
                        const oldMaxHealth = getEffectiveMemberStats(prevParty.members.find(m=>m.id === member.id)!, prevParty).maxHealth;
                        const healthIncrease = newEffectiveStats.maxHealth - oldMaxHealth;
                        member.currentHealth = Math.min(newEffectiveStats.maxHealth, member.currentHealth + healthIncrease);
                    }
                }
            }
        }
        return itemWasEquippedThisCall ? newParty : prevParty;
    });
  }, [addLogMessage, createFloatingText, getEffectiveMemberStats]);


  const executeGameTickLogic = useCallback(() => {
    if (isPartyWipedRef.current || canStartNewGamePlusRef.current) return;
    const now = Date.now();
    const enemy = currentEnemyRef.current;

    setPlayerParty(prevParty => {
      let enemyDamagedThisTick = false;
      let enemyCurrentHealth = enemy?.currentHealth || 0;
      let partyStateAfterMemberActions = { ...prevParty };

      partyStateAfterMemberActions.members = prevParty.members.map(member => {
        if (!member.isUnlocked || !member.isActiveInCombat || !enemy || enemyCurrentHealth <= 0) return member;
        const effectiveStats = getEffectiveMemberStats(member, prevParty);
        if (now - (member.lastAttackTime || 0) >= 1000 / effectiveStats.attackSpeed) {
          const d20Roll = rollD20();
          const totalToHit = d20Roll + effectiveStats.attackBonus;
          const isCritHit = d20Roll === CRITICAL_HIT_ROLL;
          const isCritMiss = d20Roll === CRITICAL_MISS_ROLL;
          const isHit = !isCritMiss && (isCritHit || totalToHit >= enemy.armorClass);
          let resultType: DiceRollDisplayInfo['resultType'] = isCritHit ? 'crit_hit' : isHit ? 'hit' : isCritMiss ? 'crit_miss' : 'miss';
          showDiceRollAnimation({ attackerName: member.name, targetName: enemy.name, d20Roll, bonus: effectiveStats.attackBonus, totalToHit, targetAC: enemy.armorClass, resultType });
          const logDetails = `(d20: ${d20Roll} + 보너스: ${effectiveStats.attackBonus} = ${totalToHit} vs AC ${enemy.armorClass})`;

          if (isHit) {
            const diceParts = parseDiceString(effectiveStats.weaponDamageDiceStr);
            let damageDealt = 0;
            let damageRollDetail = "";
            if (diceParts) {
              let baseDamageRoll = rollDice(diceParts.count, diceParts.sides);
              damageRollDetail = `${diceParts.count}d${diceParts.sides}: ${baseDamageRoll}`;
              if (isCritHit) {
                const critDamageRoll = rollDice(diceParts.count, diceParts.sides);
                baseDamageRoll += critDamageRoll;
                damageRollDetail += ` + 추가 ${critDamageRoll} (치명타!)`;
              }
              damageDealt = Math.max(1, baseDamageRoll + effectiveStats.damageBonus);
            } else {
              damageDealt = Math.max(1, effectiveStats.damageBonus);
              damageRollDetail = "무기 오류";
            }
            createFloatingText(`${damageDealt}`, isCritHit ? 'crit_damage' : 'damage', 'enemy');
            enemyCurrentHealth -= damageDealt;
            enemyDamagedThisTick = true;
            addLogMessage(`${isCritHit ? '✨치명타! ' : ''}${member.name} → ${enemy.name}: ${formatNumber(damageDealt)} 피해. ${logDetails}`, isCritHit ? 'crit' : 'combat', `피해 상세: ${damageRollDetail} + 보너스: ${effectiveStats.damageBonus}`);
          } else {
            createFloatingText('빗나감!', 'miss', 'enemy');
            addLogMessage(`${member.name}의 공격이 ${enemy.name}에게 빗나갔습니다! ${logDetails}`, 'combat');
          }
          return { ...member, lastAttackTime: now };
        }
        return member;
      });

      let finalPartyState = partyStateAfterMemberActions;

      if (enemyDamagedThisTick && enemy) {
        setCurrentEnemy(prevEnemy => prevEnemy ? { ...prevEnemy, currentHealth: Math.max(0, enemyCurrentHealth) } : null);
        if (enemyCurrentHealth <= 0) {
          addLogMessage(`${enemy.name} 처치!`, 'reward');
          createFloatingText(`+${formatNumber(enemy.goldReward)} G`, 'info', 'enemy');
          createFloatingText(`+${formatNumber(enemy.xpReward)} XP`, 'info', 'enemy');

          const loot = getLootDrop(currentStageRef.current, enemy.isBoss || false);
          if (loot) {
            if (finalPartyState.inventory.length < finalPartyState.MAX_INVENTORY_SIZE) {
              finalPartyState.inventory = [...finalPartyState.inventory, loot];
              addLogMessage(`아이템 획득: ${loot.name} (${loot.rarity})!`, 'loot');
              createFloatingText(`${loot.name} 획득!`, 'info', 'enemy');
              if (isAutoEquipEnabledRef.current) {
                handleAutoEquipItem(loot);
              }
            } else {
              addLogMessage(`아이템 ${loot.name}을(를) 발견했지만 가방이 가득 찼습니다!`, 'error');
            }
          }

          const activeAttackers = finalPartyState.members.filter(m => m.isUnlocked && m.isActiveInCombat);
          const xpPerMember = activeAttackers.length > 0 ? Math.floor(enemy.xpReward / activeAttackers.length) : 0;

          finalPartyState.gold += enemy.goldReward;
          finalPartyState.members = finalPartyState.members.map(member => {
            if (activeAttackers.find(a => a.id === member.id)) {
              let newXp = member.xp + xpPerMember;
              let newLevel = member.level;
              let newBaseMaxHealth = member.baseMaxHealth;
              let newBaseAttack = member.baseAttack;
              let newBaseDefense = member.baseDefense;
              let newXpToNextLevel = member.xpToNextLevel;
              let memberCurrentHealth = member.currentHealth;
              while (newXp >= newXpToNextLevel) {
                newXp -= newXpToNextLevel;
                newLevel += 1;
                newBaseMaxHealth += STAT_INCREASE_PER_MEMBER_LEVEL.maxHealth;
                newBaseAttack += STAT_INCREASE_PER_MEMBER_LEVEL.attack;
                newBaseDefense += STAT_INCREASE_PER_MEMBER_LEVEL.defense;
                newXpToNextLevel = Math.floor(newXpToNextLevel * XP_TO_NEXT_LEVEL_MULTIPLIER_MEMBER);
                const tempMemberForStats = { ...member, baseMaxHealth: newBaseMaxHealth, baseAttack: newBaseAttack, baseDefense: newBaseDefense, level: newLevel };
                memberCurrentHealth = getEffectiveMemberStats(tempMemberForStats, finalPartyState).maxHealth;
                addLogMessage(`${member.name} 레벨 업! ${newLevel}레벨 달성.`, 'party');
                createFloatingText('레벨 업!', 'info', member.id);
              }
              return { ...member, xp: newXp, level: newLevel, baseMaxHealth: newBaseMaxHealth, baseAttack: newBaseAttack, baseDefense: newBaseDefense, xpToNextLevel: newXpToNextLevel, currentHealth: memberCurrentHealth };
            }
            return member;
          });

          if (isBossBattleActiveRef.current && enemy.isBoss) {
            if (currentStageRef.current === FINAL_STAGE_FOR_NG_PLUS) {
              addLogMessage(`최종 보스 ${enemy.name} 격파! 다음 회차 진행이 가능합니다.`, 'reward');
              setCanStartNewGamePlus(true);
            } else {
              addLogMessage(`보스 ${enemy.name} 격파! 다음 스테이지로 진행 가능.`, 'reward');
            }
            setIsBossBattleActive(false);
            setCurrentEnemy(null);
            setIsStageBossDefeated(true);
            saveGameState();
          } else {
            setBattlesUntilBoss(prevCount => {
              const newCount = prevCount - 1;
              if (newCount <= 0 && !isStageBossDefeatedRef.current) {
                setIsBossBattleActive(true);
                const boss = generateBossForStage(currentStageRef.current, finalPartyState.ngPlusLevel);
                setCurrentEnemy(boss);
                addLogMessage(`강력한 ${boss.name} 출현!`, 'system');
              } else {
                const newRegularEnemy = generateNewEnemy(currentStageRef.current, finalPartyState.ngPlusLevel);
                setCurrentEnemy(newRegularEnemy);
                addLogMessage(`${newRegularEnemy.name} 등장! (보스까지 ${BOSS_BATTLE_THRESHOLD - newCount}/${BOSS_BATTLE_THRESHOLD})`, 'system');
              }
              return newCount;
            });
            saveGameState();
          }
        }
      }

      // Enemy Attack Logic
      if (now - lastEnemyAttackTimeRef.current >= ENEMY_ATTACK_INTERVAL_MS) {
        if (enemy && enemyCurrentHealth > 0 && finalPartyState.members.some(m => m.isUnlocked && m.isActiveInCombat)) {
          const targetableMembers = finalPartyState.members.filter(m => m.isUnlocked && m.isActiveInCombat);
          if (targetableMembers.length > 0) {
            const targetMember = targetableMembers[Math.floor(Math.random() * targetableMembers.length)];
            const effectiveTargetStats = getEffectiveMemberStats(targetMember, finalPartyState);
            const d20Roll = rollD20();
            const totalToHit = d20Roll + enemy.attackBonus;
            const isCritHit = d20Roll === CRITICAL_HIT_ROLL;
            const isCritMiss = d20Roll === CRITICAL_MISS_ROLL;
            const isHit = !isCritMiss && (isCritHit || totalToHit >= effectiveTargetStats.armorClass);
            let resultType: DiceRollDisplayInfo['resultType'] = isCritHit ? 'crit_hit' : isHit ? 'hit' : isCritMiss ? 'crit_miss' : 'miss';
            showDiceRollAnimation({ attackerName: enemy.name, targetName: targetMember.name, d20Roll, bonus: enemy.attackBonus, totalToHit, targetAC: effectiveTargetStats.armorClass, resultType });
            const logDetails = `(d20: ${d20Roll} + 보너스: ${enemy.attackBonus} = ${totalToHit} vs AC ${effectiveTargetStats.armorClass})`;
            let newTargetHealth = targetMember.currentHealth;

            if (isHit) {
              const diceParts = parseDiceString(enemy.weaponDamageDiceStr);
              let damageDealt = 0;
              let damageRollDetail = "";
              if (diceParts) {
                let baseDamageRoll = rollDice(diceParts.count, diceParts.sides);
                damageRollDetail = `${diceParts.count}d${diceParts.sides}: ${baseDamageRoll}`;
                if (isCritHit) {
                  const critDamageRoll = rollDice(diceParts.count, diceParts.sides);
                  baseDamageRoll += critDamageRoll;
                  damageRollDetail += ` + 추가 ${critDamageRoll} (치명타!)`;
                }
                damageDealt = Math.max(1, baseDamageRoll + enemy.damageBonus);
              } else {
                damageDealt = Math.max(1, enemy.damageBonus);
                damageRollDetail = "무기 오류";
              }
              newTargetHealth -= damageDealt;
              createFloatingText(`${damageDealt}`, isCritHit ? 'crit_damage' : 'damage', targetMember.id);
              addLogMessage(`${isCritHit ? '💥적 치명타! ' : ''}${enemy.name} → ${targetMember.name}: ${formatNumber(damageDealt)} 피해 (체력: ${formatNumber(Math.max(0, newTargetHealth))}/${formatNumber(effectiveTargetStats.maxHealth)}). ${logDetails}`, isCritHit ? 'crit' : 'error', `피해 상세: ${damageRollDetail} + 보너스: ${enemy.damageBonus}`);
            } else {
              createFloatingText('빗나감!', 'miss', targetMember.id);
              addLogMessage(`${enemy.name}의 공격이 ${targetMember.name}에게 빗나갔습니다! ${logDetails}`, 'combat');
            }

            finalPartyState.members = finalPartyState.members.map(m => {
              if (m.id === targetMember.id) {
                const updatedMemberState = { ...m, currentHealth: Math.max(0, newTargetHealth) };
                if (updatedMemberState.currentHealth <= 0 && m.isActiveInCombat) {
                  updatedMemberState.isActiveInCombat = false;
                  addLogMessage(`${m.name}이(가) 쓰러졌습니다!`, 'party');
                  createFloatingText('쓰러짐!', 'ko', m.id);
                }
                return updatedMemberState;
              }
              return m;
            });

            if (finalPartyState.members.every(m => !m.isUnlocked || !m.isActiveInCombat)) {
              setIsPartyWiped(true);
              addLogMessage("파티가 전멸했습니다! 잠시 후 부활합니다...", "error");
              setTimeout(() => {
                setPlayerParty(currentWipedParty => {
                  const revivedMembers = currentWipedParty.members.map(mem => {
                    if (mem.isUnlocked) {
                      const effStats = getEffectiveMemberStats(mem, currentWipedParty);
                      return { ...mem, currentHealth: effStats.maxHealth * PARTY_WIPE_REVIVAL_HEALTH_PERCENT, isActiveInCombat: true, lastAttackTime: 0 };
                    }
                    return mem;
                  });
                  addLogMessage("파티가 부활했습니다!", "party");
                  revivedMembers.filter(m => m.isUnlocked).forEach(rm => createFloatingText('부활!', 'heal', rm.id));
                  if (isBossBattleActiveRef.current) {
                    setIsBossBattleActive(false);
                    setBattlesUntilBoss(BOSS_BATTLE_THRESHOLD);
                    setCurrentEnemy(generateNewEnemy(currentStageRef.current, currentWipedParty.ngPlusLevel));
                    addLogMessage("보스 전투 실패. 일반 몬스터부터 다시 시작합니다.", "system");
                  }
                  const partyAfterRevival = { ...currentWipedParty, members: revivedMembers };
                  saveGameState();
                  return partyAfterRevival;
                });
                setIsPartyWiped(false);
              }, PARTY_WIPE_REVIVAL_DELAY_MS);
            }
          }
        }
        setLastEnemyAttackTime(now);
      }

      // Health Regen
      if (now - lastHealTimeRef.current >= 1000) {
        finalPartyState.members = finalPartyState.members.map(member => {
          if (member.isUnlocked && member.isActiveInCombat && member.currentHealth > 0) {
            const effectiveStats = getEffectiveMemberStats(member, finalPartyState);
            if (member.currentHealth < effectiveStats.maxHealth) {
              const healAmount = Math.max(1, Math.floor(effectiveStats.maxHealth * (PARTY_MEMBER_HEALTH_REGEN_PERCENT_PER_SECOND / 100)));
              return { ...member, currentHealth: Math.min(effectiveStats.maxHealth, member.currentHealth + healAmount) };
            }
          }
          return member;
        });
        setLastHealTime(now);
      }
      return finalPartyState;
    });
  }, [addLogMessage, getEffectiveMemberStats, createFloatingText, showDiceRollAnimation, saveGameState, handleAutoEquipItem]);


  // Main Game Tick Loop
  useEffect(() => {
    const intervalId = setInterval(executeGameTickLogic, GAME_TICK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [executeGameTickLogic]);


  useEffect(() => {
    if (isStageBossDefeatedRef.current && !isBossBattleActiveRef.current && !currentEnemyRef.current && isAutoStageProgressionEnabledRef.current && playerPartyRef.current.members.some(m => m.isUnlocked && m.isActiveInCombat) && !isPartyWipedRef.current && !canStartNewGamePlusRef.current) { 
      const timeoutId = setTimeout(() => { if (isStageBossDefeatedRef.current && isAutoStageProgressionEnabledRef.current && playerPartyRef.current.members.some(m => m.isUnlocked && m.isActiveInCombat) && !isPartyWipedRef.current && !canStartNewGamePlusRef.current) { addLogMessage("스테이지 자동 이동: 다음 스테이지로 진행합니다.", "system"); handleNextStage(); } }, 750);
      return () => clearTimeout(timeoutId);
    }
  }, [isStageBossDefeated, isBossBattleActive, currentEnemy, isAutoStageProgressionEnabled, handleNextStage, addLogMessage, canStartNewGamePlus]);

  const toggleAutoUpgrade = () => setIsAutoUpgradeEnabled(prev => !prev);
  const toggleAutoStageProgression = () => setIsAutoStageProgressionEnabled(prev => !prev);
  const toggleAutoEquip = () => setIsAutoEquipEnabled(prev => !prev);

  const handleForceGameTick = useCallback(() => {
    if (isPartyWipedRef.current || canStartNewGamePlusRef.current) {
        addLogMessage("파티 전멸 또는 NG+ 대기 중에는 강제 진행할 수 없습니다.", "error");
        return;
    }
    addLogMessage("강제 진행 버튼 사용됨. 다음 게임 틱을 수동으로 실행합니다.", 'system');
    executeGameTickLogic();
  }, [executeGameTickLogic, addLogMessage]);
  
  const getBossStatusMessage = () => { 
    if (isPartyWiped) return <span className="text-red-500 animate-ping">파티 전멸! 부활 대기 중...</span>; 
    if (canStartNewGamePlus) return <span className="text-yellow-300 font-semibold">최종 보스 격파! 다음 회차 진행 가능.</span>;
    if (isBossBattleActive) return <span className="text-red-400 font-semibold animate-pulse">🔥 보스 전투 중! 🔥</span>; 
    if (isStageBossDefeated) return <span className="text-green-400">보스 처치 완료! 다음 스테이지로 이동하세요.</span>; 
    const battlesCompleted = BOSS_BATTLE_THRESHOLD - Math.max(0, battlesUntilBoss); 
    return `보스 출현까지: ${battlesCompleted} / ${BOSS_BATTLE_THRESHOLD} 전투 완료`; 
  };
  
  const canManuallyProgressToNextStage = playerParty.members.some(m => m.isUnlocked && m.isActiveInCombat) && isStageBossDefeated && !isPartyWiped && !canStartNewGamePlus;
  const canManuallyGoToPreviousStage = currentStage > 1 && playerParty.members.some(m => m.isUnlocked && m.isActiveInCombat) && !isPartyWiped && !canStartNewGamePlus;
  const canForceTick = !isPartyWiped && !canStartNewGamePlus;

  // 아이템 희귀도에 따른 판매 가격 설정
  const getItemSellPrice = useCallback((item: EquipmentItem): number => {
    // 아이템 희귀도에 따라 기본 가격 설정
    const basePrice = {
      'Common': 15,
      'Uncommon': 35,
      'Rare': 80,
      'Epic': 200
    }[item.rarity] || 10;
    
    // 스테이지에 따라 가격 보정 (스테이지가 높을수록 더 비싸게 판매)
    const stageMultiplier = Math.max(1, Math.sqrt(currentStage) * 0.3);
    
    // 랜덤 요소 추가 (가격 변동폭 ±15%)
    const randomFactor = 0.85 + (Math.random() * 0.3);
    
    // 최종 판매 가격 계산 및 정수로 반환
    return Math.floor(basePrice * stageMultiplier * randomFactor);
  }, [currentStage]);

  // 아이템 판매 처리 함수
  const handleSellItem = useCallback((itemId: string) => {
    setPlayerParty(prevParty => {
      // 판매할 아이템 찾기
      const itemToSell = prevParty.inventory.find(item => item.id === itemId);
      
      if (!itemToSell) {
        addLogMessage("판매할 아이템을 찾을 수 없습니다.", "error");
        return prevParty;
      }
      
      // 판매 가격 계산
      const sellPrice = getItemSellPrice(itemToSell);
      
      // 아이템 제거 및 골드 추가
      const newInventory = prevParty.inventory.filter(item => item.id !== itemId);
      
      // 아이템 판매 로그 추가
      addLogMessage(`${itemToSell.name} 아이템을 ${sellPrice} 골드에 판매했습니다.`, "reward");
      
      // 선택된 아이템 ID 초기화
      setSelectedInventoryItemId(null);
      
      return {
        ...prevParty,
        inventory: newInventory,
        gold: prevParty.gold + sellPrice
      };
    });
  }, [addLogMessage, getItemSellPrice]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-2 sm:p-4 flex flex-col">
      <header className="mb-4 p-3 sm:p-4 bg-slate-800/70 rounded-lg shadow-xl border border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sky-400 tracking-wider mb-2 sm:mb-0">방치형 모험가 노트</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleForceGameTick} 
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md transition-colors flex items-center disabled:bg-slate-500 disabled:cursor-not-allowed" 
              title="게임 진행이 멈춘 것 같을 때 강제로 다음 틱을 실행합니다. 주로 재부팅 후 문제 발생 시 사용하세요."
              disabled={!canForceTick}
            >
              <RefreshIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> 강제 진행
            </button>
            <button onClick={saveGameState} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md transition-colors flex items-center" title="현재 게임 상태를 수동으로 저장합니다.">
              <SaveIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> 게임 저장
            </button>
          </div>
        </div>
        <div className="text-center space-y-2">
            <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-4 md:space-x-6 space-y-2 sm:space-y-0">
                <p className="text-lg sm:text-xl text-slate-300">
                  스테이지: <span className="font-semibold text-sky-300">{currentStage}</span>
                  {playerParty.ngPlusLevel > 0 && <span className="font-semibold text-yellow-400 ml-1">(NG+{playerParty.ngPlusLevel})</span>}
                </p>
                {canStartNewGamePlus ? (
                  <button onClick={handleStartNewGamePlus} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm sm:text-base font-semibold rounded-lg shadow-md transition-colors flex items-center">
                    다음 회차 (NG+{playerParty.ngPlusLevel + 1}) 시작 <NextStageIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" />
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button onClick={handlePreviousStage} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-sky-700 hover:bg-sky-600 text-white text-sm sm:text-base font-semibold rounded-lg shadow-md transition-colors flex items-center disabled:bg-slate-500 disabled:cursor-not-allowed" title={!canManuallyGoToPreviousStage ? "조건 미충족 (첫 스테이지, 파티원 전멸 등)" : "이전 스테이지로 이동"} disabled={!canManuallyGoToPreviousStage}>
                        <PreviousStageIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> 이전 스테이지
                    </button>
                    <button onClick={handleNextStage} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-500 text-white text-sm sm:text-base font-semibold rounded-lg shadow-md transition-colors flex items-center disabled:bg-slate-500 disabled:cursor-not-allowed" title={!canManuallyProgressToNextStage ? "조건 미충족 (보스 미처치, 파티원 전멸 등)" : "다음 스테이지로 진행"} disabled={!canManuallyProgressToNextStage}>
                        다음 스테이지 <NextStageIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" />
                    </button>
                  </div>
                )}
            </div>
            <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
              {!canStartNewGamePlus && (
                  <button onClick={toggleAutoStageProgression} className={`px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${isAutoStageProgressionEnabled ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-slate-300'}`}>
                      스테이지 자동 이동: {isAutoStageProgressionEnabled ? '켬' : '끔'}
                  </button>
              )}
              <button onClick={toggleAutoEquip} className={`px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${isAutoEquipEnabled ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-slate-300'}`}>
                  장비 자동 장착: {isAutoEquipEnabled ? '켬' : '끔'}
              </button>
            </div>
            <p className="text-sm sm:text-md text-slate-400 h-5 sm:h-6 flex items-center justify-center">{getBossStatusMessage()}</p>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="lg:col-span-1 h-full min-h-[500px] sm:min-h-[600px] lg:min-h-0">
          <CharacterPanel playerParty={playerParty} currentStage={currentStage} onUpgrade={handleUpgrade} getUpgradeCost={getUpgradeCost} getEffectiveMemberStats={getEffectiveMemberStats} onRecruitMember={handleRecruitMember} isAutoUpgradeEnabled={isAutoUpgradeEnabled} onToggleAutoUpgrade={toggleAutoUpgrade} floatingTexts={floatingTexts} onFloatingTextAnimationComplete={handleFloatingTextAnimationComplete} onOpenEquipmentModal={handleOpenEquipmentModal} />
        </div>
        <div className="lg:col-span-1 h-full min-h-[350px] sm:min-h-[400px] lg:min-h-0">
          <EnemyPanel enemyStats={currentEnemy} floatingTexts={floatingTexts} onFloatingTextAnimationComplete={handleFloatingTextAnimationComplete} diceRollDisplay={diceRollDisplay} />
        </div>
        <div className="lg:col-span-1 h-full min-h-[300px] sm:min-h-[350px] lg:min-h-0">
          <InventoryPanel 
            inventory={playerParty.inventory} 
            maxInventorySize={playerParty.MAX_INVENTORY_SIZE} 
            onOpenEquipmentModal={handleOpenEquipmentModal}
            onSelectItem={handleSelectInventoryItem}
            selectedInventoryItemId={selectedInventoryItemId}
            onSellItem={handleSellItem} 
          />
        </div>
        <div className="lg:col-span-1 h-full lg:max-h-[calc(100vh-220px)] min-h-[250px] sm:min-h-[300px] lg:min-h-0">
           <GameLog messages={gameLog} />
        </div>
      </main>
      
      <EquipmentModal 
        isOpen={equipmentModalState.isOpen}
        onClose={handleCloseEquipmentModal}
        targetMember={playerParty.members.find(m => m.id === equipmentModalState.memberId) || null}
        targetSlot={equipmentModalState.slotType}
        inventoryItemIdToManage={equipmentModalState.inventoryItemId}
        inventory={playerParty.inventory}
        playerParty={playerParty}
        onEquipItem={handleEquipItemToMember}
        onSellItem={handleSellItem}
        getEffectiveMemberStats={getEffectiveMemberStats}
      />
      
      <footer className="text-center text-xs text-slate-500 py-2 mt-auto">
        <p>파티를 이끌고 계속해서 강화하세요! 주사위 신의 가호가 함께하길!</p>
        {playerParty.ngPlusLevel > 0 && <p className="font-semibold text-yellow-500">현재 NG+{playerParty.ngPlusLevel} 진행 중</p>}
      </footer>
    </div>
  );
};
export default App;
