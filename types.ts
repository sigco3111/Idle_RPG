

export type CharacterClassName = 'Warrior' | 'Archer' | 'Mage';

export type EquipmentRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic';
export type EquipmentSlot = 'weapon' | 'armor' | 'shield' | 'accessory';

export interface EquipmentEffect {
  stat: 'maxHealth' | 'attackBonus' | 'damageBonus' | 'armorClass' | 'attackSpeed';
  value: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  iconSeed: string; // For picsum
  classRequirement: CharacterClassName[] | null; // null means any class can use

  // Direct stat modifiers/overrides
  weaponDamageDiceStrOverride?: string; // e.g., "1d10"
  attackBonusMod?: number;
  damageBonusMod?: number;
  armorClassMod?: number;
  maxHealthMod?: number;
  attackSpeedMod?: number; // e.g., -0.1 (faster), 0.05 (slower)
  
  // Descriptive text for display, can be generated
  description?: string; 
}

export interface PartyMember {
  id: string;
  name: string;
  className: CharacterClassName; // Added for equipment restrictions
  level: number;
  xp: number;
  xpToNextLevel: number;
  baseMaxHealth: number;
  currentHealth: number;
  baseAttack: number; 
  baseDefense: number; 
  baseAttackSpeed: number; 
  baseWeaponDamageDiceStr: string; // Base for when no weapon is equipped
  isUnlocked: boolean;
  isActiveInCombat: boolean;
  avatarSeed: string;
  lastAttackTime?: number;
  unlockStageRequirement?: number;
  equipment: Record<EquipmentSlot, EquipmentItem | null>; // Equipped items
}

export interface PlayerParty {
  members: PartyMember[];
  gold: number;
  
  partyAttackUpgradeLevel: number;
  partyDefenseUpgradeLevel: number;
  partyMaxHealthUpgradeLevel: number;
  partyAttackSpeedUpgradeLevel: number;

  inventory: EquipmentItem[]; // Shared party inventory
  MAX_INVENTORY_SIZE: number; // Max items in inventory
  ngPlusLevel: number; // Current New Game Plus level
}

export interface EnemyStats {
  id: string;
  name: string;
  maxHealth: number;
  currentHealth: number;
  attack: number; 
  defense: number; 
  weaponDamageDiceStr: string; 
  goldReward: number;
  xpReward: number;
  imageUrl: string;
  isBoss?: boolean;
  armorClass: number;
  attackBonus: number;
  damageBonus: number;
}

export enum UpgradeType {
  Attack = 'attack', 
  Defense = 'defense', 
  MaxHealth = 'maxHealth',
  AttackSpeed = 'attackSpeed',
}

export interface GameLogMessage {
  id: string;
  text: string;
  type: 'combat' | 'system' | 'reward' | 'error' | 'crit' | 'save' | 'party' | 'dice' | 'loot'; // Added 'loot' type
  timestamp: number;
  details?: string; 
}

export interface UpgradeConfig {
  baseCost: number;
  scaleFactor: number;
  statIncrement: number; 
  statIncrementAttackBonus?: number; 
  statIncrementDamageBonus?: number; 
  statIncrementAC?: number; 
  maxLevel?: number;
  name: string;
  description: string;
}

export interface EffectiveMemberStats {
  maxHealth: number;
  attackSpeed: number; 
  armorClass: number;
  attackBonus: number;
  damageBonus: number;
  weaponDamageDiceStr: string;
}

export interface DiceRollDisplayInfo {
  key: string; 
  attackerName: string;
  targetName: string;
  d20Roll: number;
  bonus: number;
  totalToHit: number;
  targetAC: number;
  resultType: 'crit_hit' | 'hit' | 'miss' | 'crit_miss';
  isVisible: boolean;
}

export interface FloatingTextInstance {
  id: string;
  text: string;
  colorType: 'damage' | 'crit_damage' | 'miss' | 'heal' | 'ko' | 'info';
  targetId: string; 
  offsetX: number; 
  offsetY: number; 
  timestamp: number; 
}

// For equipment modal
export interface EquipmentModalState {
  isOpen: boolean;
  memberId: string | null; // Member to equip to
  slotType: EquipmentSlot | null; // Slot to equip in
  inventoryItemId: string | null; // If opened by clicking an inventory item
}