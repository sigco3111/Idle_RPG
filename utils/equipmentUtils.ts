
import { EquipmentItem, CharacterClassName, EquipmentSlot, PartyMember } from '../types';

export const getEquipmentEffectValue = (item: EquipmentItem | null, effectKey: keyof EquipmentItem, defaultValue: number = 0): number => {
  if (!item) return defaultValue;
  const value = item[effectKey as keyof EquipmentItem];
  return typeof value === 'number' ? value : defaultValue;
};

export const getEquipmentDamageDice = (member: PartyMember): string => {
  if (member.equipment.weapon && member.equipment.weapon.weaponDamageDiceStrOverride) {
    return member.equipment.weapon.weaponDamageDiceStrOverride;
  }
  return member.baseWeaponDamageDiceStr; // Fallback to base member dice if no weapon or weapon has no override
};

export const isItemEquippable = (item: EquipmentItem, memberClassName: CharacterClassName, targetSlot: EquipmentSlot): boolean => {
  if (item.slot !== targetSlot) {
    return false; // Item doesn't match the target slot type
  }
  if (item.classRequirement && !item.classRequirement.includes(memberClassName)) {
    return false; // Character class cannot use this item
  }
  // Specific slot-class combinations (e.g., Mages can't use Shields even if classRequirement was null)
  if (targetSlot === 'shield' && memberClassName === 'Mage') return false;
  if (targetSlot === 'shield' && memberClassName === 'Archer') return false;
  
  // Add more specific rules if needed, e.g., heavy armor for mages
  if (targetSlot === 'armor' && item.name.toLowerCase().includes("판금") && memberClassName === 'Mage') return false;


  return true;
};

export const getSlotDisplayName = (slot: EquipmentSlot): string => {
  switch (slot) {
    case 'weapon': return '무기';
    case 'armor': return '갑옷';
    case 'shield': return '방패';
    case 'accessory': return '장신구';
    default: return '알 수 없음';
  }
};

export const getRarityColorClass = (rarity: EquipmentItem['rarity'] | undefined, type: 'border' | 'text' | 'bg' = 'border'): string => {
  if (!rarity) return type === 'text' ? 'text-slate-400' : (type === 'bg' ? 'bg-slate-700' : 'border-slate-600');
  switch (rarity) {
    case 'Common':
      return type === 'text' ? 'text-slate-300' : (type === 'bg' ? 'bg-slate-600' : 'border-slate-500');
    case 'Uncommon':
      return type === 'text' ? 'text-green-400' : (type === 'bg' ? 'bg-green-700/30' : 'border-green-500');
    case 'Rare':
      return type === 'text' ? 'text-sky-400' : (type === 'bg' ? 'bg-sky-700/30' : 'border-sky-500');
    case 'Epic':
      return type === 'text' ? 'text-purple-400' : (type === 'bg' ? 'bg-purple-700/30' : 'border-purple-500');
    default:
      return type === 'text' ? 'text-slate-400' : (type === 'bg' ? 'bg-slate-700' : 'border-slate-600');
  }
};
