

import React from 'react';
import { EnemyStats, FloatingTextInstance, DiceRollDisplayInfo } from '../types';
import { ProgressBar } from './ProgressBar';
import { GoldIcon, XPIcon } from './Icons';
import { formatNumber } from '../utils/formatters';
import { parseDiceString } from '../utils/diceRoller';
import FloatingTextEffect from './FloatingTextEffect';
import AnimatedDiceRollDisplay from './AnimatedDiceRollDisplay'; // Import component

interface EnemyPanelProps {
  enemyStats: EnemyStats | null;
  floatingTexts: FloatingTextInstance[];
  onFloatingTextAnimationComplete: (id: string) => void;
  diceRollDisplay: DiceRollDisplayInfo | null; // Added prop
}

export const EnemyPanel = ({ enemyStats, floatingTexts, onFloatingTextAnimationComplete, diceRollDisplay }: EnemyPanelProps): React.ReactNode => {
  if (!enemyStats) {
    return (
      <div className="bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-700 h-full flex flex-col items-center justify-center">
        <p className="text-slate-400">현재 적이 없습니다...</p>
        {/* Render dice display even if no enemy, if a roll is somehow active (e.g. during transition) */}
        {diceRollDisplay && diceRollDisplay.isVisible && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"> 
            {/* Fallback positioning if no enemy context */}
            <AnimatedDiceRollDisplay displayInfo={diceRollDisplay} />
          </div>
        )}
      </div>
    );
  }

  const { 
    name, currentHealth, maxHealth, imageUrl, goldReward, xpReward, 
    isBoss, armorClass, attackBonus, damageBonus, weaponDamageDiceStr 
  } = enemyStats;

  const formatDamageString = (diceStr: string, bonus: number): string => {
    const diceParts = parseDiceString(diceStr);
    if (!diceParts) return `Bonus: ${bonus}`;
    return `${diceParts.count}d${diceParts.sides} + ${bonus}`;
  };
  
  const enemyFloatingTexts = floatingTexts.filter(ft => ft.targetId === 'enemy');

  return (
    <div className="relative bg-slate-800 p-4 rounded-lg shadow-xl border-2 border-slate-700 h-full flex flex-col items-center">
      {/* Floating Texts for the enemy */}
      {enemyFloatingTexts.map(ft => (
        <FloatingTextEffect 
          key={ft.id} 
          instance={ft} 
          onAnimationComplete={onFloatingTextAnimationComplete} 
        />
      ))}

      <h2 className={`text-xl font-bold mb-1 text-center ${isBoss ? 'text-purple-400 animate-pulse' : 'text-red-400'}`}>{name}</h2>
      {isBoss && <p className="text-center text-sm text-purple-300 mb-2">(강력한 우두머리)</p>}
      
      {/* Container for image and dice roll animation */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-x-2 sm:gap-x-4 my-3 w-full">
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 flex-shrink-0"> {/* Image container */}
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover rounded-lg border-2 border-slate-600 shadow-md"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/200'; }}
          />
        </div>
        {/* Dice Roll Display container */}
        <div className="w-full sm:w-auto mt-3 sm:mt-0 flex-grow sm:flex-grow-0 sm:max-w-[200px] md:max-w-xs"> {/* Adjusted max-width */}
          {diceRollDisplay && diceRollDisplay.isVisible && (
            <AnimatedDiceRollDisplay displayInfo={diceRollDisplay} />
          )}
        </div>
      </div>
      
      <div className="w-full mb-3">
        <ProgressBar current={currentHealth} max={maxHealth} colorClass={isBoss ? "bg-purple-600" : "bg-red-500"} label="체력" />
      </div>
      <div className="grid grid-cols-1 gap-2 text-sm w-full mb-3 text-slate-300">
        <div className="bg-slate-700/50 p-2 rounded-md">명중 보너스: <span className="font-semibold text-slate-100">+{attackBonus}</span></div>
        <div className="bg-slate-700/50 p-2 rounded-md">피해량: <span className="font-semibold text-slate-100">{formatDamageString(weaponDamageDiceStr, damageBonus)}</span></div>
        <div className="bg-slate-700/50 p-2 rounded-md">방어 등급 (AC): <span className="font-semibold text-slate-100">{armorClass}</span></div>
      </div>
      <div className="mt-auto w-full pt-3 border-t border-slate-700">
        <h3 className="text-sm font-semibold mb-1 text-center text-slate-400">보상</h3>
        <div className="flex justify-around text-sm">
          <div className="flex items-center text-yellow-400">
            <GoldIcon className="w-4 h-4 mr-1" /> {formatNumber(goldReward)}
          </div>
          <div className="flex items-center text-sky-400">
            <XPIcon className="w-4 h-4 mr-1" /> {formatNumber(xpReward)}
          </div>
        </div>
      </div>
    </div>
  );
};