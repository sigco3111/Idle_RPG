
import React from 'react';
import { PlayerParty, PartyMember, UpgradeType, EffectiveMemberStats, FloatingTextInstance, EquipmentSlot, EquipmentItem } from '../types';
import { UPGRADE_CONFIGS, UPGRADE_ICONS, BASE_AC, EQUIPMENT_SLOTS_ORDER } from '../constants';
import { formatNumber, formatHealth } from '../utils/formatters';
import { ProgressBar } from './ProgressBar';
import { GoldIcon, WeaponSlotIcon, ArmorSlotIcon, ShieldSlotIcon, AccessorySlotIcon } from './Icons';
import { parseDiceString } from '../utils/diceRoller';
import FloatingTextEffect from './FloatingTextEffect';
import { getRarityColorClass, getSlotDisplayName } from '../utils/equipmentUtils';


interface PartyMemberCardProps {
  member: PartyMember;
  effectiveStats: EffectiveMemberStats;
  currentStage: number;
  onRecruitMember: (memberId: string) => void;
  floatingTexts: FloatingTextInstance[];
  onFloatingTextAnimationComplete: (id: string) => void;
  onOpenEquipmentModal: (memberId: string, slot: EquipmentSlot) => void;
}

const PartyMemberCard: React.FC<PartyMemberCardProps> = ({ 
  member, 
  effectiveStats, 
  currentStage, 
  onRecruitMember,
  floatingTexts,
  onFloatingTextAnimationComplete,
  onOpenEquipmentModal,
}) => {
  const canBeRecruited = member.unlockStageRequirement && currentStage >= member.unlockStageRequirement;
  
  const formatDamageString = (diceStr: string, bonus: number): string => {
    const diceParts = parseDiceString(diceStr);
    if (!diceParts) return `Bonus: ${bonus}`;
    return `${diceParts.count}d${diceParts.sides} + ${bonus}`;
  };

  const getSlotIcon = (slot: EquipmentSlot, className?: string): React.ReactNode => {
    const defaultClass = "w-5 h-5 text-slate-400 group-hover:text-sky-300";
    const effectiveClass = `${className || ''} ${defaultClass}`;
    switch (slot) {
      case 'weapon': return <WeaponSlotIcon className={effectiveClass} />;
      case 'armor': return <ArmorSlotIcon className={effectiveClass} />;
      case 'shield': return <ShieldSlotIcon className={effectiveClass} />;
      case 'accessory': return <AccessorySlotIcon className={effectiveClass} />;
      default: return null;
    }
  };

  return (
    <div className={`relative p-3 rounded-lg shadow-md border ${member.isActiveInCombat && member.isUnlocked ? 'bg-slate-700 border-sky-600/50' : 'bg-slate-600/70 border-slate-500/50'} ${!member.isUnlocked ? 'opacity-70' : ''}`}>
      {floatingTexts.map(ft => ( <FloatingTextEffect key={ft.id} instance={ft} onAnimationComplete={onFloatingTextAnimationComplete} /> ))}

      <div className="flex items-center mb-2">
        <img src={`https://picsum.photos/seed/${member.avatarSeed}/40/40`} alt={member.name} className="w-10 h-10 rounded-full mr-3 border-2 border-slate-500"/>
        <div>
          <h4 className={`font-semibold ${member.isUnlocked ? 'text-sky-300' : 'text-slate-400'}`}>{member.name} <span className="text-xs text-slate-500">({member.className})</span></h4>
          {member.isUnlocked ? (<p className="text-xs text-slate-400">레벨: {member.level}</p>) : (<p className="text-xs text-slate-400">미영입</p>)}
        </div>
      </div>

      {!member.isUnlocked && member.unlockStageRequirement && (
        <div className="my-2">
          {canBeRecruited ? (
            <button onClick={() => onRecruitMember(member.id)} className="w-full bg-green-600 hover:bg-green-500 text-white text-xs py-1.5 rounded-md transition-colors">
              영입하기 (스테이지 {member.unlockStageRequirement} 달성)
            </button>
          ) : (
            <p className="text-xs text-center text-slate-400 italic">스테이지 {member.unlockStageRequirement} 도달 시 영입 가능</p>
          )}
        </div>
      )}

      {member.isUnlocked && (
        <>
          <ProgressBar current={member.currentHealth} max={effectiveStats.maxHealth} colorClass={member.isActiveInCombat ? "bg-green-500" : "bg-red-600"} label="체력" />
          <ProgressBar current={member.xp} max={member.xpToNextLevel} colorClass="bg-sky-500" label="경험치" />
          
          {/* Equipment Slots Display */}
          <div className="mt-2.5 mb-1.5">
            <p className="text-xs text-slate-400 mb-1">장비:</p>
            <div className="grid grid-cols-4 gap-1.5">
              {EQUIPMENT_SLOTS_ORDER.map(slot => {
                const item = member.equipment[slot];
                // Shield slot only visible for Warriors or if they somehow have a shield
                if (slot === 'shield' && member.className !== 'Warrior' && !item) return null; 
                
                return (
                  <button 
                    key={slot} 
                    onClick={() => onOpenEquipmentModal(member.id, slot)}
                    title={item ? `${item.name} (${item.rarity})\n${getSlotDisplayName(slot)}\n${item.description}` : `${getSlotDisplayName(slot)} 슬롯 비어있음`}
                    className={`relative group aspect-square rounded-md flex items-center justify-center border-2 transition-colors hover:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300
                                ${item ? getRarityColorClass(item.rarity, 'border') : 'border-slate-600 bg-slate-700/50 hover:bg-slate-600/50'}
                                ${item ? getRarityColorClass(item.rarity, 'bg') : ''}`}
                  >
                    {item ? (
                      <img src={`https://picsum.photos/seed/${item.iconSeed}/30/30`} alt={item.name} className="w-5 h-5 object-cover rounded-sm"/>
                    ) : (
                      getSlotIcon(slot)
                    )}
                     {item && <span className={`absolute -top-0.5 -right-0.5 px-0.5 text-[7px] rounded-sm ${getRarityColorClass(item.rarity, 'bg')} ${getRarityColorClass(item.rarity, 'text')} bg-opacity-80 border ${getRarityColorClass(item.rarity, 'border')}`}>{item.rarity.substring(0,1)}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between text-slate-300"><span>명중 보너스:</span> <span className="font-medium text-slate-100">+{effectiveStats.attackBonus}</span></div>
            <div className="flex justify-between text-slate-300"><span>피해량:</span> <span className="font-medium text-slate-100">{formatDamageString(effectiveStats.weaponDamageDiceStr, effectiveStats.damageBonus)}</span></div>
            <div className="flex justify-between text-slate-300"><span>방어 등급 (AC):</span> <span className="font-medium text-slate-100">{effectiveStats.armorClass}</span></div>
            <div className="flex justify-between text-slate-300"><span>공격 속도:</span> <span className="font-medium text-slate-100">{effectiveStats.attackSpeed.toFixed(2)}/초</span></div>
            {!member.isActiveInCombat && member.currentHealth <= 0 && (<p className="text-center text-red-400 font-semibold mt-1">쓰러짐!</p>)}
          </div>
        </>
      )}
    </div>
  );
};

interface CharacterPanelProps {
  playerParty: PlayerParty;
  currentStage: number;
  onUpgrade: (type: UpgradeType) => void;
  getUpgradeCost: (type: UpgradeType) => number;
  getEffectiveMemberStats: (member: PartyMember, partyUpgrades: PlayerParty) => EffectiveMemberStats;
  onRecruitMember: (memberId: string) => void;
  isAutoUpgradeEnabled: boolean;
  onToggleAutoUpgrade: () => void;
  floatingTexts: FloatingTextInstance[]; 
  onFloatingTextAnimationComplete: (id: string) => void; 
  onOpenEquipmentModal: (memberId: string, slot: EquipmentSlot) => void;
}

export const CharacterPanel = ({ 
  playerParty, currentStage, onUpgrade, getUpgradeCost, getEffectiveMemberStats, 
  onRecruitMember, isAutoUpgradeEnabled, onToggleAutoUpgrade, floatingTexts,
  onFloatingTextAnimationComplete, onOpenEquipmentModal
}: CharacterPanelProps): React.ReactNode => {
  const { members, gold } = playerParty;

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-700 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-3 text-center text-sky-400">파티 정보</h2>
      
      <div className="space-y-3 mb-4 overflow-y-auto flex-grow pr-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700">
        {members.map(member => (
          <PartyMemberCard 
            key={member.id} member={member} 
            effectiveStats={getEffectiveMemberStats(member, playerParty)}
            currentStage={currentStage} onRecruitMember={onRecruitMember}
            floatingTexts={floatingTexts.filter(ft => ft.targetId === member.id)} 
            onFloatingTextAnimationComplete={onFloatingTextAnimationComplete}
            onOpenEquipmentModal={onOpenEquipmentModal}
          />
        ))}
      </div>
      
      <div className="mt-auto">
        <div className="mb-3 py-2 px-3 rounded-md bg-yellow-500/10 border border-yellow-500/30 flex justify-between items-center">
            <div className="flex items-center text-sm text-yellow-300"><GoldIcon className="w-5 h-5 mr-2 text-yellow-400" />골드:</div>
            <div className="text-lg font-semibold text-yellow-200">{formatNumber(gold)}</div>
        </div>
        
        <div className="flex justify-between items-center mb-2 pt-3 border-t border-slate-700">
          <h3 className="text-lg font-semibold text-sky-400">파티 강화</h3>
          <button onClick={onToggleAutoUpgrade} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${isAutoUpgradeEnabled ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-slate-300'}`} title={isAutoUpgradeEnabled ? "자동 강화 끄기" : "자동 강화 켜기"}>
            자동 강화: {isAutoUpgradeEnabled ? '켬' : '끔'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {(Object.keys(UPGRADE_CONFIGS) as UpgradeType[]).map((type) => {
            const config = UPGRADE_CONFIGS[type]; const cost = getUpgradeCost(type); const IconComponent = UPGRADE_ICONS[type];
            let currentUpgradeLevel: number;
            switch(type) { case UpgradeType.Attack: currentUpgradeLevel = playerParty.partyAttackUpgradeLevel; break; case UpgradeType.Defense: currentUpgradeLevel = playerParty.partyDefenseUpgradeLevel; break; case UpgradeType.MaxHealth: currentUpgradeLevel = playerParty.partyMaxHealthUpgradeLevel; break; case UpgradeType.AttackSpeed: currentUpgradeLevel = playerParty.partyAttackSpeedUpgradeLevel; break; default: currentUpgradeLevel = 0; }
            const isMaxLevel = config.maxLevel !== undefined && currentUpgradeLevel >= config.maxLevel; const canAfford = playerParty.gold >= cost;
            return (
              <button key={type} onClick={() => onUpgrade(type)} disabled={!canAfford || isMaxLevel} title={`${config.name}: ${config.description}\n현재 레벨: ${currentUpgradeLevel}${config.maxLevel ? `/${config.maxLevel}` : ''}\n비용: ${formatNumber(cost)} 골드`}
                className={`w-full p-2 rounded-md text-sm font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 ${isMaxLevel ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : canAfford ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
                <div className="flex items-center justify-center">{IconComponent && <IconComponent className="w-4 h-4 mr-2" />} <span>{config.name}</span></div>
                <div className="text-xs mt-0.5">Lv.{currentUpgradeLevel}{config.maxLevel ? `/${config.maxLevel}` : ''}</div>
                <div className="text-xs">{isMaxLevel ? '최대 레벨' : `비용: ${formatNumber(cost)}`}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
