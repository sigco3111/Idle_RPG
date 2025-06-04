import { PlayerParty, PartyMember, UpgradeType, UpgradeConfig, CharacterClassName, EquipmentSlot, EquipmentItem, EquipmentRarity } from './types'; // FIX: Added EquipmentRarity
import { AttackIcon, DefenseIcon, HealthIcon, AttackSpeedIcon } from './components/Icons'; 
import React from 'react';

export const INITIAL_PARTY_MEMBERS_CONFIG: Omit<PartyMember, 'equipment' | 'currentHealth' | 'xp' | 'level' | 'xpToNextLevel' | 'lastAttackTime'>[] = [
  {
    id: 'member-1-warrior',
    name: '용사 브루투스',
    className: 'Warrior',
    baseMaxHealth: 130,
    baseAttack: 15, 
    baseDefense: 8, 
    baseAttackSpeed: 0.85,
    baseWeaponDamageDiceStr: "1d4", // Fist damage or basic dagger
    isUnlocked: true,
    isActiveInCombat: true,
    avatarSeed: 'warriorHeroDnD',
    unlockStageRequirement: 1,
  },
  {
    id: 'member-2-archer',
    name: '명궁 엘라라',
    className: 'Archer',
    baseMaxHealth: 90,
    baseAttack: 13, 
    baseDefense: 5,
    baseAttackSpeed: 1.3,
    baseWeaponDamageDiceStr: "1d3",
    isUnlocked: false,
    isActiveInCombat: false,
    avatarSeed: 'archerHeroDnD',
    unlockStageRequirement: 3,
  },
  {
    id: 'member-3-mage',
    name: '현자 마리우스',
    className: 'Mage',
    baseMaxHealth: 75,
    baseAttack: 11, 
    baseDefense: 3,
    baseAttackSpeed: 1.1,
    baseWeaponDamageDiceStr: "1d2",
    isUnlocked: false,
    isActiveInCombat: false,
    avatarSeed: 'mageHeroDnD',
    unlockStageRequirement: 5,
  },
];

export const COMMON_STARTER_EQUIPMENT: Record<CharacterClassName, Record<EquipmentSlot, EquipmentItem | null>> = {
  Warrior: {
    weapon: { id: 'starter-sword', name: '훈련용 검', slot: 'weapon', rarity: 'Common', iconSeed: 'commonSword', classRequirement: ['Warrior'], weaponDamageDiceStrOverride: '1d6', attackBonusMod: 0, description: '기본적인 전투 훈련에 사용되는 검입니다.' },
    armor: { id: 'starter-leather-armor', name: '가죽 조끼', slot: 'armor', rarity: 'Common', iconSeed: 'commonLeatherArmor', classRequirement: ['Warrior', 'Archer'], armorClassMod: 1, description: '간단한 가죽으로 만든 기본적인 갑옷입니다.' },
    shield: { id: 'starter-buckler', name: '나무 버클러', slot: 'shield', rarity: 'Common', iconSeed: 'commonBuckler', classRequirement: ['Warrior'], armorClassMod: 1, description: '작고 가벼운 나무 방패입니다.' },
    accessory: null,
  },
  Archer: {
    weapon: { id: 'starter-shortbow', name: '사냥용 단궁', slot: 'weapon', rarity: 'Common', iconSeed: 'commonShortbow', classRequirement: ['Archer'], weaponDamageDiceStrOverride: '1d6', description: '사냥에 사용되는 간단한 단궁입니다.' },
    armor: { id: 'starter-padded-armor', name: '누비 갑옷', slot: 'armor', rarity: 'Common', iconSeed: 'commonPaddedArmor', classRequirement: ['Warrior', 'Archer', 'Mage'], armorClassMod: 1, description: '천을 여러겹 누벼 만든 가벼운 갑옷입니다.' },
    shield: null,
    accessory: null,
  },
  Mage: {
    weapon: { id: 'starter-staff', name: '견습생 지팡이', slot: 'weapon', rarity: 'Common', iconSeed: 'commonStaff', classRequirement: ['Mage'], weaponDamageDiceStrOverride: '1d4', damageBonusMod: 1, description: '마법 견습생이 사용하는 지팡이입니다.' },
    armor: { id: 'starter-robes', name: '평범한 로브', slot: 'armor', rarity: 'Common', iconSeed: 'commonRobes', classRequirement: ['Mage'], armorClassMod: 0, description: '특별한 능력 없는 평범한 로브입니다.' },
    shield: null,
    accessory: null,
  }
};

export const MAX_INVENTORY_SIZE = 32;
export const INITIAL_NG_PLUS_LEVEL = 0; // New Game Plus starting level

export const INITIAL_PLAYER_PARTY_STATE: PlayerParty = {
  members: INITIAL_PARTY_MEMBERS_CONFIG.map(config => {
    const member: PartyMember = {
      ...config,
      level: 1,
      xp: 0,
      xpToNextLevel: 80, 
      currentHealth: config.baseMaxHealth, 
      equipment: {
        weapon: COMMON_STARTER_EQUIPMENT[config.className]?.weapon || null,
        armor: COMMON_STARTER_EQUIPMENT[config.className]?.armor || null,
        shield: COMMON_STARTER_EQUIPMENT[config.className]?.shield || null,
        accessory: COMMON_STARTER_EQUIPMENT[config.className]?.accessory || null,
      },
      lastAttackTime: 0,
    };
    if (config.className === 'Archer') member.xpToNextLevel = 100;
    if (config.className === 'Mage') member.xpToNextLevel = 120;
    return member;
  }),
  gold: 100, 
  partyAttackUpgradeLevel: 0,
  partyDefenseUpgradeLevel: 0,
  partyMaxHealthUpgradeLevel: 0,
  partyAttackSpeedUpgradeLevel: 0,
  inventory: [
    // 테스트용 아이템 추가
    { 
      id: 'test-item-1', 
      name: '테스트 검', 
      slot: 'weapon', 
      rarity: 'Common', 
      iconSeed: 'testSword', 
      classRequirement: ['Warrior'], 
      weaponDamageDiceStrOverride: '1d6', 
      attackBonusMod: 1, 
      description: '테스트용 아이템입니다. 판매해보세요!' 
    },
    { 
      id: 'test-item-2', 
      name: '테스트 갑옷', 
      slot: 'armor', 
      rarity: 'Uncommon', 
      iconSeed: 'testArmor', 
      classRequirement: ['Warrior', 'Archer'], 
      armorClassMod: 2, 
      description: '테스트용 갑옷입니다. 판매해보세요!' 
    },
    { 
      id: 'test-item-3', 
      name: '테스트 방패', 
      slot: 'shield', 
      rarity: 'Rare', 
      iconSeed: 'testShield', 
      classRequirement: ['Warrior'], 
      armorClassMod: 3, 
      description: '테스트용 방패입니다. 판매해보세요!' 
    }
  ],
  MAX_INVENTORY_SIZE: MAX_INVENTORY_SIZE,
  ngPlusLevel: INITIAL_NG_PLUS_LEVEL, // Initialize NG+ level
};

INITIAL_PLAYER_PARTY_STATE.members.forEach(member => {
    let initialMaxHealth = member.baseMaxHealth;
    if (member.equipment.armor?.maxHealthMod) initialMaxHealth += member.equipment.armor.maxHealthMod;
    if (member.equipment.accessory?.maxHealthMod) initialMaxHealth += member.equipment.accessory.maxHealthMod;
    member.currentHealth = initialMaxHealth;
});


export const BASE_ENEMY_HEALTH = 60;
export const BASE_ENEMY_ATTACK = 10; 
export const BASE_ENEMY_DEFENSE = 4;  
export const BASE_ENEMY_WEAPON_DAMAGE_DICE_STR = "1d6";
export const BASE_ENEMY_GOLD_REWARD = 10;
export const BASE_ENEMY_XP_REWARD = 15;

// Increased difficulty scaling
export const ENEMY_HEALTH_STAGE_SCALE = 1.35; // 적 체력 증가율 하향 조정 (1.5 -> 1.35)
export const ENEMY_STAT_STAGE_SCALE = 1.22;  // 적 스탯 증가율 하향 조정 (1.28 -> 1.22)
export const ENEMY_REWARD_STAGE_SCALE = 1.25; // 보상 증가율 상향 조정 (1.18 -> 1.25)

export const XP_TO_NEXT_LEVEL_MULTIPLIER_MEMBER = 1.30; // 레벨업 필요 XP 증가율 하향 조정 (1.35 -> 1.30)
export const STAT_INCREASE_PER_MEMBER_LEVEL = {
  maxHealth: 15, // 레벨당 체력 증가량 증가 (10 -> 15)
  attack: 2,     // 레벨당 공격력 증가량 증가 (1 -> 2)
  defense: 1,    // 방어력은 유지
};

export const UPGRADE_CONFIGS: Record<UpgradeType, UpgradeConfig> = {
  [UpgradeType.Attack]: { baseCost: 30, scaleFactor: 1.18, statIncrement:0, statIncrementAttackBonus: 0.25, statIncrementDamageBonus: 0.35, name: "파티 전투 훈련", description: "모든 파티원의 명중률과 피해량 보너스 증가" },
  [UpgradeType.Defense]: { baseCost: 25, scaleFactor: 1.20, statIncrement:0, statIncrementAC: 0.3, name: "파티 방호 강화", description: "모든 파티원의 방어 등급(AC) 증가" },
  [UpgradeType.MaxHealth]: { baseCost: 18, scaleFactor: 1.12, statIncrement: 15, name: "파티 활력 증진", description: "모든 파티원의 최대 체력 증가" },
  [UpgradeType.AttackSpeed]: { baseCost: 120, scaleFactor: 1.30, statIncrement: 0.04, maxLevel: 50, name: "파티 신속함 부여", description: "모든 파티원의 공격 속도 증가" },
};

export const MAX_ATTACK_SPEED_DISPLAY = 5;

export const ENEMY_NAMES: string[] = [
  "홉고블린 정찰병", "굶주린 늑대", "해골 병사", "독침 거미", "코볼트 함정꾼",
  "오크 돌격병", "그림자 살쾡이", "늪지 괴물", "광신도 수련생", "고블린 주술사",
  "놀 전사", "동굴 트롤", "역병 구울", "무쇠가죽 멧돼지", "저주받은 망령"
];

export const GAME_TICK_INTERVAL_MS = 100;
export const ENEMY_ATTACK_INTERVAL_MS = 2500; 
export const MAX_LOG_MESSAGES = 100; 
export const PARTY_MEMBER_HEALTH_REGEN_PERCENT_PER_SECOND = 1.0;

export const UPGRADE_ICONS: Record<UpgradeType, (props: { className?: string }) => React.ReactNode> = {
    [UpgradeType.Attack]: AttackIcon,
    [UpgradeType.Defense]: DefenseIcon,
    [UpgradeType.MaxHealth]: HealthIcon,
    [UpgradeType.AttackSpeed]: AttackSpeedIcon,
};

export const IDLE_RPG_SAVE_KEY = 'idleRPGPartyDnDSaveData_v3_ngplus'; // Updated save key for NG+
export const AUTO_SAVE_INTERVAL_MS = 60000;
export const AUTO_UPGRADE_INTERVAL_MS = 2000;

export const BOSS_BATTLE_THRESHOLD = 8; // 보스 등장 배틀 수 감소 (10 -> 8)
export const BOSS_NAME_PREFIX = "[우두머리] ";
export const BOSS_STATS_MULTIPLIERS = { 
  health: 3.5, // 보스 체력 배율 하향 조정 (4.0 -> 3.5)
  attack: 1.3, 
  defense: 1.3, 
  goldReward: 6, // 보스 골드 보상 증가 (5 -> 6)
  xpReward: 6 // 보스 XP 보상 증가 (5 -> 6)
};

export const PARTY_WIPE_REVIVAL_DELAY_MS = 10000;
export const PARTY_WIPE_REVIVAL_HEALTH_PERCENT = 0.5;

export const BASE_AC = 10;
export const CRITICAL_HIT_ROLL = 20;
export const CRITICAL_MISS_ROLL = 1;

export const EQUIPMENT_SLOTS_ORDER: EquipmentSlot[] = ['weapon', 'armor', 'shield', 'accessory'];

// Loot System Constants
export const BASE_LOOT_DROP_CHANCE = 0.20; // 기본 아이템 드롭 확률 증가 (0.15 -> 0.20)
export const BOSS_LOOT_DROP_CHANCE_MULTIPLIER = 3; 
export const RARITY_WEIGHTS: Record<EquipmentRarity, number> = {
  Common: 55, // 일반 아이템 가중치 감소 (60 -> 55)
  Uncommon: 28, // 고급 아이템 가중치 증가 (25 -> 28)
  Rare: 12, // 희귀 아이템 가중치 증가 (10 -> 12)
  Epic: 5, // 에픽 가중치 유지
};
export const STAGE_RARITY_BONUS_THRESHOLD = 8; // 희귀 아이템 드롭 확률이 증가하는 스테이지 임계값 감소 (10 -> 8)

// New Game Plus Constants
export const FINAL_STAGE_FOR_NG_PLUS = 30; // Stage to defeat boss to unlock NG+
export const NG_PLUS_ENEMY_HEALTH_ADDITIVE_MULTIPLIER_PER_LEVEL = 0.65; // NG+ 레벨당 적 체력 증가율 하향 조정 (0.75 -> 0.65)
export const NG_PLUS_ENEMY_STAT_ADDITIVE_MULTIPLIER_PER_LEVEL = 0.45;   // NG+ 레벨당 적 스탯 증가율 하향 조정 (0.5 -> 0.45)
export const NG_PLUS_REWARD_ADDITIVE_MULTIPLIER_PER_LEVEL = 0.30;   // NG+ 레벨당 보상 증가율 상향 조정 (0.25 -> 0.30)
