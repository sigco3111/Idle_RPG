
import { v4 as uuidv4 } from 'uuid';
import { EquipmentItem, EquipmentSlot, EquipmentRarity, CharacterClassName } from '../types';
import { RARITY_WEIGHTS, STAGE_RARITY_BONUS_THRESHOLD, BASE_LOOT_DROP_CHANCE, BOSS_LOOT_DROP_CHANCE_MULTIPLIER, EQUIPMENT_SLOTS_ORDER } from '../constants';

const ITEM_TIERS: Record<EquipmentRarity, { statMultiplier: number, namePrefix: string, maxEffects: number }> = {
  Common:    { statMultiplier: 1.0, namePrefix: "낡은", maxEffects: 1 },
  Uncommon:  { statMultiplier: 1.3, namePrefix: "쓸만한", maxEffects: 2 },
  Rare:      { statMultiplier: 1.7, namePrefix: "정교한", maxEffects: 3 },
  Epic:      { statMultiplier: 2.2, namePrefix: "명인의", maxEffects: 4 },
};

const SLOT_BASE_DATA: Record<EquipmentSlot, { baseName: string[], possibleEffects: (keyof EquipmentItem)[], classRestrictions?: Partial<Record<CharacterClassName, boolean>> }> = {
  weapon: {
    baseName: ["검", "도끼", "둔기", "단검", "활", "지팡이"],
    possibleEffects: ['weaponDamageDiceStrOverride', 'attackBonusMod', 'damageBonusMod', 'attackSpeedMod'],
  },
  armor: {
    baseName: ["천 갑옷", "가죽 갑옷", "사슬 갑옷", "판금 갑옷", "로브"],
    possibleEffects: ['armorClassMod', 'maxHealthMod', 'attackSpeedMod'],
  },
  shield: {
    baseName: ["버클러", "카이트 실드", "타워 실드"],
    possibleEffects: ['armorClassMod', 'maxHealthMod'],
    classRestrictions: { Warrior: true }
  },
  accessory: {
    baseName: ["반지", "목걸이", "망토", "부적"],
    possibleEffects: ['maxHealthMod', 'attackBonusMod', 'damageBonusMod', 'armorClassMod', 'attackSpeedMod'],
  }
};

const WEAPON_DICE_BY_RARITY_AND_SLOT: Record<EquipmentRarity, string[]> = {
    Common: ["1d4", "1d6"],
    Uncommon: ["1d6", "1d8", "2d4"],
    Rare: ["1d8", "1d10", "2d6"],
    Epic: ["1d10", "1d12", "2d8"],
};

function pickWeightedRarity(stage: number): EquipmentRarity {
  let totalWeight = 0;
  const stageBonusFactor = Math.floor(stage / STAGE_RARITY_BONUS_THRESHOLD); // More bonus for higher stages

  const adjustedWeights = { ...RARITY_WEIGHTS };
  adjustedWeights.Uncommon += stageBonusFactor * 2;
  adjustedWeights.Rare += stageBonusFactor * 1.5;
  adjustedWeights.Epic += stageBonusFactor * 1;
  
  for (const r in adjustedWeights) {
    totalWeight += adjustedWeights[r as EquipmentRarity];
  }

  let random = Math.random() * totalWeight;
  for (const r in adjustedWeights) {
    const rarity = r as EquipmentRarity;
    if (random < adjustedWeights[rarity]) return rarity;
    random -= adjustedWeights[rarity];
  }
  return 'Common'; // Fallback
}

function generateItemName(baseName: string, rarity: EquipmentRarity, adjectives: string[]): string {
  const prefix = ITEM_TIERS[rarity].namePrefix;
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)] || "";
  return `${prefix} ${randomAdjective} ${baseName}`.replace(/\s+/g, ' ').trim();
}

function determineClassRestriction(slot: EquipmentSlot, baseName: string): CharacterClassName[] | null {
    if (slot === 'shield') return ['Warrior'];
    if (slot === 'weapon') {
        if (baseName.includes("활")) return ['Archer'];
        if (baseName.includes("지팡이")) return ['Mage'];
        if (baseName.includes("검") || baseName.includes("도끼") || baseName.includes("둔기")) return ['Warrior'];
        if (baseName.includes("단검")) return ['Warrior', 'Archer', 'Mage'];
    }
    if (slot === 'armor') {
        if (baseName.includes("판금")) return ['Warrior'];
        if (baseName.includes("사슬")) return ['Warrior', 'Archer'];
        if (baseName.includes("로브")) return ['Mage'];
        if (baseName.includes("가죽") || baseName.includes("천")) return ['Warrior', 'Archer', 'Mage'];
    }
    return null; // Any class for accessories or broadly usable items
}

export function generateEquipmentItem(stage: number, rarityHint?: EquipmentRarity): EquipmentItem {
  const rarity = rarityHint || pickWeightedRarity(stage);
  const tierInfo = ITEM_TIERS[rarity];
  const slot = EQUIPMENT_SLOTS_ORDER[Math.floor(Math.random() * EQUIPMENT_SLOTS_ORDER.length)];
  
  const slotInfo = SLOT_BASE_DATA[slot];
  const baseName = slotInfo.baseName[Math.floor(Math.random() * slotInfo.baseName.length)];
  
  const adjectives = ["수호의", "공격의", "신속의", "강타의", "곰의", "여우의", "거인의", "용기의", "그림자의"]; // Example adjectives
  const name = generateItemName(baseName, rarity, adjectives);

  const item: EquipmentItem = {
    id: uuidv4(),
    name,
    slot,
    rarity,
    iconSeed: `${rarity}${slot}${baseName}`.replace(/\s/g, ''),
    classRequirement: determineClassRestriction(slot, baseName),
  };

  const numEffects = Math.min(slotInfo.possibleEffects.length, Math.floor(Math.random() * tierInfo.maxEffects) + 1);
  const chosenEffects: Set<keyof EquipmentItem> = new Set();

  for (let i = 0; i < numEffects; i++) {
    const availableEffects = slotInfo.possibleEffects.filter(e => !chosenEffects.has(e));
    if (availableEffects.length === 0) break;
    const effectKey = availableEffects[Math.floor(Math.random() * availableEffects.length)] as keyof EquipmentItem;
    chosenEffects.add(effectKey);

    switch (effectKey) {
      case 'weaponDamageDiceStrOverride':
        const diceOptions = WEAPON_DICE_BY_RARITY_AND_SLOT[rarity] || ["1d4"];
        item.weaponDamageDiceStrOverride = diceOptions[Math.floor(Math.random() * diceOptions.length)];
        break;
      case 'attackBonusMod':
        item.attackBonusMod = Math.floor(Math.random() * (2 + ITEM_TIERS[rarity].statMultiplier) + (ITEM_TIERS[rarity].statMultiplier -1));
        break;
      case 'damageBonusMod':
        item.damageBonusMod = Math.floor(Math.random() * (3 + ITEM_TIERS[rarity].statMultiplier * 1.5) + (ITEM_TIERS[rarity].statMultiplier -1));
        break;
      case 'armorClassMod':
        if (slot === 'armor') item.armorClassMod = Math.floor(Math.random() * (3 * tierInfo.statMultiplier) + 1);
        else if (slot === 'shield') item.armorClassMod = Math.floor(Math.random() * (2 * tierInfo.statMultiplier) + 1);
        else item.armorClassMod = Math.floor(Math.random() * (1 * tierInfo.statMultiplier) + 1); // Accessories small AC
        break;
      case 'maxHealthMod':
        item.maxHealthMod = Math.floor((Math.random() * 10 + 5) * tierInfo.statMultiplier);
        break;
      case 'attackSpeedMod':
        // Positive for slower, negative for faster. Let's simplify: only faster weapons or slower armors.
        if (slot === 'weapon') item.attackSpeedMod = -(Math.random() * 0.05 * tierInfo.statMultiplier); 
        else if (slot === 'armor' && (baseName.includes("판금") || baseName.includes("사슬"))) item.attackSpeedMod = (Math.random() * 0.03 * tierInfo.statMultiplier);
        break;
    }
    // Ensure mods are integers where appropriate, or keep to 2 decimal places
    if (item.attackBonusMod) item.attackBonusMod = Math.max(0, Math.round(item.attackBonusMod));
    if (item.damageBonusMod) item.damageBonusMod = Math.max(0, Math.round(item.damageBonusMod));
    if (item.armorClassMod) item.armorClassMod = Math.max(0, Math.round(item.armorClassMod));
    if (item.maxHealthMod) item.maxHealthMod = Math.max(0, Math.round(item.maxHealthMod));
    if (item.attackSpeedMod) item.attackSpeedMod = parseFloat(item.attackSpeedMod.toFixed(3));

  }
  
  // Generate description based on effects
  let descParts: string[] = [];
  if (item.weaponDamageDiceStrOverride) descParts.push(`피해: ${item.weaponDamageDiceStrOverride}`);
  if (item.attackBonusMod) descParts.push(`명중 +${item.attackBonusMod}`);
  if (item.damageBonusMod) descParts.push(`피해 보너스 +${item.damageBonusMod}`);
  if (item.armorClassMod) descParts.push(`AC +${item.armorClassMod}`);
  if (item.maxHealthMod) descParts.push(`최대 HP +${item.maxHealthMod}`);
  if (item.attackSpeedMod) descParts.push(`공격 속도 ${item.attackSpeedMod > 0 ? '-' : '+'}${Math.abs(item.attackSpeedMod*100).toFixed(0)}%`);
  item.description = descParts.join(', ') || "특별한 효과가 없는 아이템입니다.";
  if (item.classRequirement) {
    item.description += ` (요구 클래스: ${item.classRequirement.join('/')})`;
  }


  return item;
}

export function getLootDrop(stage: number, isBoss: boolean): EquipmentItem | null {
  const dropChance = BASE_LOOT_DROP_CHANCE * (isBoss ? BOSS_LOOT_DROP_CHANCE_MULTIPLIER : 1);
  if (Math.random() < dropChance) {
    let rarityHint: EquipmentRarity | undefined = undefined;
    if (isBoss) { // Bosses have higher chance for better rarity
        const bossRarityRoll = Math.random();
        if (bossRarityRoll < 0.1) rarityHint = 'Epic'; // 10% for Epic
        else if (bossRarityRoll < 0.4) rarityHint = 'Rare'; // 30% for Rare
        else rarityHint = 'Uncommon'; // 60% for Uncommon
    }
    return generateEquipmentItem(stage, rarityHint);
  }
  return null;
}
