

import React, { useState, useEffect } from 'react';
import { DiceRollDisplayInfo } from '../types';

interface AnimatedDiceRollDisplayProps {
  displayInfo: DiceRollDisplayInfo | null;
}

const AnimatedDiceRollDisplay: React.FC<AnimatedDiceRollDisplayProps> = ({ displayInfo }) => {
  const [animatedD20, setAnimatedD20] = useState<number>(1);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    if (displayInfo && displayInfo.isVisible) {
      setShowDetails(false);
      let currentAnimatedVal = 1;
      const animationIntervalTime = 50; // ms
      const totalAnimationDuration = 700; // ms
      let elapsed = 0;

      const intervalId = setInterval(() => {
        elapsed += animationIntervalTime;
        currentAnimatedVal = Math.floor(Math.random() * 20) + 1;
        setAnimatedD20(currentAnimatedVal);

        if (elapsed >= totalAnimationDuration) {
          clearInterval(intervalId);
          setAnimatedD20(displayInfo.d20Roll);
          setShowDetails(true);
        }
      }, animationIntervalTime);

      return () => clearInterval(intervalId);
    }
  }, [displayInfo]);

  if (!displayInfo || !displayInfo.isVisible) {
    return null;
  }

  const { attackerName, targetName, d20Roll, bonus, totalToHit, targetAC, resultType } = displayInfo;

  let resultText = '';
  let resultColorClass = '';
  switch (resultType) {
    case 'crit_hit':
      resultText = '치명타!';
      resultColorClass = 'text-yellow-300'; // Brighter yellow
      break;
    case 'hit':
      resultText = '명중!';
      resultColorClass = 'text-green-400';
      break;
    case 'miss':
      resultText = '빗나감!';
      resultColorClass = 'text-slate-400';
      break;
    case 'crit_miss':
      resultText = '대실패!';
      resultColorClass = 'text-red-400'; // Brighter red
      break;
  }

  return (
    <div 
      key={displayInfo.key} 
      // Removed fixed positioning, adjusted padding, max-width, and shadows for a more compact look
      className={`dice-roll-display visible z-10 bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-600 w-full max-w-[200px] md:max-w-xs text-center transition-all duration-300`}
    >
      <div className="mb-1 md:mb-2 text-xs md:text-sm">
        <span className="font-semibold text-sky-400 truncate max-w-[70px] inline-block">{attackerName}</span>
        <span className="text-slate-400 mx-0.5">→</span>
        <span className="font-semibold text-red-400 truncate max-w-[70px] inline-block">{targetName}</span>
      </div>
      
      {/* Scaled down dice and numbers */}
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold my-1 md:my-2 text-white flex items-center justify-center space-x-1 md:space-x-2">
        <span className="block w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-slate-900 rounded-md flex items-center justify-center border-2 border-sky-500 shadow-inner">
          {animatedD20}
        </span>
        {showDetails && (
          <>
            <span className="text-xl sm:text-2xl md:text-3xl text-slate-500">+</span>
            <span className="block w-8 h-8 sm:w-10 sm:h-10 md:w-10 md:h-10 text-lg sm:text-xl md:text-2xl bg-slate-700 rounded-md flex items-center justify-center border border-slate-600">
              {bonus}
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl text-slate-500">=</span>
            <span className={`block w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-slate-900 rounded-md flex items-center justify-center border-2 ${totalToHit >= targetAC && resultType !== 'crit_miss' ? 'border-green-500' : 'border-red-500'} shadow-inner`}>
              {totalToHit}
            </span>
          </>
        )}
      </div>

      {showDetails && (
        <>
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1 leading-tight">
            (롤: {d20Roll} + 보너스: {bonus} = <span className="font-bold text-slate-200">{totalToHit}</span>) vs AC: <span className="font-bold text-slate-200">{targetAC}</span>
          </p>
          <p className={`text-md sm:text-lg md:text-xl font-bold ${resultColorClass}`}>{resultText}</p>
        </>
      )}
      {!showDetails && <p className="text-xs sm:text-sm text-slate-400 animate-pulse h-10 flex items-center justify-center">주사위 굴리는 중...</p>}
    </div>
  );
};

export default AnimatedDiceRollDisplay;