import { EnemyStats } from '../types';
import {
  ENEMY_NAMES,
  BASE_ENEMY_HEALTH,
  BASE_ENEMY_ATTACK,
  BASE_ENEMY_DEFENSE,
  BASE_ENEMY_GOLD_REWARD,
  BASE_ENEMY_XP_REWARD,
  ENEMY_HEALTH_STAGE_SCALE,
  ENEMY_STAT_STAGE_SCALE,
  ENEMY_REWARD_STAGE_SCALE,
  BOSS_NAME_PREFIX,
  BOSS_STATS_MULTIPLIERS,
  BASE_AC,
  BASE_ENEMY_WEAPON_DAMAGE_DICE_STR,
  NG_PLUS_ENEMY_HEALTH_ADDITIVE_MULTIPLIER_PER_LEVEL,
  NG_PLUS_ENEMY_STAT_ADDITIVE_MULTIPLIER_PER_LEVEL,
  NG_PLUS_REWARD_ADDITIVE_MULTIPLIER_PER_LEVEL
} from '../constants';

const calculateEnemyDnDStats = (baseAttackForDnd: number, baseDefenseForDnd: number, level: number, isBoss: boolean = false): Pick<EnemyStats, 'armorClass' | 'attackBonus' | 'damageBonus' | 'weaponDamageDiceStr'> => {
  const ac = BASE_AC + Math.floor(baseDefenseForDnd / 3) + Math.floor(level / 5);
  const attackBonus = Math.floor(baseAttackForDnd / 4) + Math.floor(level / 4) + (isBoss ? 1 : 0);
  const damageBonus = Math.floor(baseAttackForDnd / 5) + Math.floor(level / 5) + (isBoss ? 1 : 0);
  
  let weaponDice = BASE_ENEMY_WEAPON_DAMAGE_DICE_STR;
  if (isBoss) {
    weaponDice = level > 15 ? "2d6" : level > 7 ? "1d8" : "1d6";
  } else {
     if (level > 20) weaponDice = "1d8";
     else if (level > 10) weaponDice = "1d6";
     else weaponDice = "1d4"; 
  }

  return {
    armorClass: ac,
    attackBonus: attackBonus,
    damageBonus: Math.max(0, damageBonus), 
    weaponDamageDiceStr: weaponDice,
  };
};

const applyNgPlusScaling = (
  stageScaledValue: number, 
  ngPlusLevel: number, 
  ngPlusMultiplierPerLevel: number
): number => {
  if (ngPlusLevel === 0) return stageScaledValue;
  return Math.floor(stageScaledValue * (1 + ngPlusLevel * ngPlusMultiplierPerLevel));
};

export const generateNewEnemy = (stage: number, ngPlusLevel: number = 0): EnemyStats => {
  const nameIndex = (stage - 1) % ENEMY_NAMES.length;
  const baseEnemyName = ENEMY_NAMES[nameIndex];
  const enemyName = `${baseEnemyName} (레벨 ${stage}${ngPlusLevel > 0 ? ` NG+${ngPlusLevel}`: ''})`;

  const stageScaledHealth = Math.floor(BASE_ENEMY_HEALTH * Math.pow(ENEMY_HEALTH_STAGE_SCALE, stage - 1));
  const stageScaledAttack = Math.floor(BASE_ENEMY_ATTACK * Math.pow(ENEMY_STAT_STAGE_SCALE, stage - 1));
  const stageScaledDefense = Math.floor(BASE_ENEMY_DEFENSE * Math.pow(ENEMY_STAT_STAGE_SCALE, stage - 1));
  const stageScaledGoldReward = Math.floor(BASE_ENEMY_GOLD_REWARD * Math.pow(ENEMY_REWARD_STAGE_SCALE, stage - 1));
  const stageScaledXpReward = Math.floor(BASE_ENEMY_XP_REWARD * Math.pow(ENEMY_REWARD_STAGE_SCALE, stage - 1));

  // Apply NG+ scaling
  const finalHealth = applyNgPlusScaling(stageScaledHealth, ngPlusLevel, NG_PLUS_ENEMY_HEALTH_ADDITIVE_MULTIPLIER_PER_LEVEL);
  const baseAttackForDnd = applyNgPlusScaling(stageScaledAttack, ngPlusLevel, NG_PLUS_ENEMY_STAT_ADDITIVE_MULTIPLIER_PER_LEVEL);
  const baseDefenseForDnd = applyNgPlusScaling(stageScaledDefense, ngPlusLevel, NG_PLUS_ENEMY_STAT_ADDITIVE_MULTIPLIER_PER_LEVEL);
  const finalGoldReward = applyNgPlusScaling(stageScaledGoldReward, ngPlusLevel, NG_PLUS_REWARD_ADDITIVE_MULTIPLIER_PER_LEVEL);
  const finalXpReward = applyNgPlusScaling(stageScaledXpReward, ngPlusLevel, NG_PLUS_REWARD_ADDITIVE_MULTIPLIER_PER_LEVEL);
  
  const dndStats = calculateEnemyDnDStats(baseAttackForDnd, baseDefenseForDnd, stage);

  return {
    id: `enemy-${stage}-${ngPlusLevel}-${Date.now()}`,
    name: enemyName,
    maxHealth: Math.max(finalHealth, BASE_ENEMY_HEALTH),
    currentHealth: Math.max(finalHealth, BASE_ENEMY_HEALTH),
    attack: baseAttackForDnd, // This is the NG+ scaled base attack for D&D calc
    defense: baseDefenseForDnd, // This is the NG+ scaled base defense for D&D calc
    ...dndStats,
    goldReward: Math.max(finalGoldReward, BASE_ENEMY_GOLD_REWARD),
    xpReward: Math.max(finalXpReward, BASE_ENEMY_XP_REWARD),
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(baseEnemyName)}-${stage}-${ngPlusLevel}/200/200`,
    isBoss: false,
  };
};

export const generateBossForStage = (stage: number, ngPlusLevel: number = 0): EnemyStats => {
  const baseEnemyForBossName = ENEMY_NAMES[(stage - 1) % ENEMY_NAMES.length];
  
  const stageBaseHealth = Math.floor(BASE_ENEMY_HEALTH * Math.pow(ENEMY_HEALTH_STAGE_SCALE, stage - 1));
  const stageBaseAttack = Math.floor(BASE_ENEMY_ATTACK * Math.pow(ENEMY_STAT_STAGE_SCALE, stage - 1));
  const stageBaseDefense = Math.floor(BASE_ENEMY_DEFENSE * Math.pow(ENEMY_STAT_STAGE_SCALE, stage - 1));
  const stageBaseGoldReward = Math.floor(BASE_ENEMY_GOLD_REWARD * Math.pow(ENEMY_REWARD_STAGE_SCALE, stage - 1));
  const stageBaseXpReward = Math.floor(BASE_ENEMY_XP_REWARD * Math.pow(ENEMY_REWARD_STAGE_SCALE, stage - 1));

  const bossName = `${BOSS_NAME_PREFIX}${baseEnemyForBossName} (레벨 ${stage}${ngPlusLevel > 0 ? ` NG+${ngPlusLevel}`: ''} 보스)`;

  const bossStageScaledAttack = Math.floor(stageBaseAttack * BOSS_STATS_MULTIPLIERS.attack);
  const bossStageScaledDefense = Math.floor(stageBaseDefense * BOSS_STATS_MULTIPLIERS.defense);
  const bossStageScaledHealth = Math.floor(stageBaseHealth * BOSS_STATS_MULTIPLIERS.health);
  const bossStageScaledGold = Math.floor(stageBaseGoldReward * BOSS_STATS_MULTIPLIERS.goldReward);
  const bossStageScaledXp = Math.floor(stageBaseXpReward * BOSS_STATS_MULTIPLIERS.xpReward);

  // Apply NG+ scaling to boss's already multiplied stats
  const finalHealth = applyNgPlusScaling(bossStageScaledHealth, ngPlusLevel, NG_PLUS_ENEMY_HEALTH_ADDITIVE_MULTIPLIER_PER_LEVEL);
  const baseAttackForDnd = applyNgPlusScaling(bossStageScaledAttack, ngPlusLevel, NG_PLUS_ENEMY_STAT_ADDITIVE_MULTIPLIER_PER_LEVEL);
  const baseDefenseForDnd = applyNgPlusScaling(bossStageScaledDefense, ngPlusLevel, NG_PLUS_ENEMY_STAT_ADDITIVE_MULTIPLIER_PER_LEVEL);
  const finalGoldReward = applyNgPlusScaling(bossStageScaledGold, ngPlusLevel, NG_PLUS_REWARD_ADDITIVE_MULTIPLIER_PER_LEVEL);
  const finalXpReward = applyNgPlusScaling(bossStageScaledXp, ngPlusLevel, NG_PLUS_REWARD_ADDITIVE_MULTIPLIER_PER_LEVEL);

  const dndStats = calculateEnemyDnDStats(baseAttackForDnd, baseDefenseForDnd, stage, true);

  return {
    id: `boss-${stage}-${ngPlusLevel}-${Date.now()}`,
    name: bossName,
    maxHealth: Math.max(BASE_ENEMY_HEALTH, finalHealth),
    currentHealth: Math.max(BASE_ENEMY_HEALTH, finalHealth),
    attack: baseAttackForDnd,
    defense: baseDefenseForDnd,
    ...dndStats,
    goldReward: Math.max(BASE_ENEMY_GOLD_REWARD, finalGoldReward),
    xpReward: Math.max(BASE_ENEMY_XP_REWARD, finalXpReward),
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(baseEnemyForBossName)}-boss-${stage}-${ngPlusLevel}/250/250`,
    isBoss: true,
  };
};