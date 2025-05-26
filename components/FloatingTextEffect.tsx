
import React, { useEffect, useRef } from 'react';
import { FloatingTextInstance } from '../types';

interface FloatingTextEffectProps {
  instance: FloatingTextInstance;
  onAnimationComplete: (id: string) => void;
}

const FloatingTextEffect: React.FC<FloatingTextEffectProps> = ({ instance, onAnimationComplete }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentElement = elementRef.current;
    const handleAnimationEnd = () => {
      onAnimationComplete(instance.id);
    };

    if (currentElement) {
      currentElement.addEventListener('animationend', handleAnimationEnd);
    }

    return () => {
      if (currentElement) {
        currentElement.removeEventListener('animationend', handleAnimationEnd);
      }
    };
  }, [instance.id, onAnimationComplete]);

  let colorClass = '';
  switch (instance.colorType) {
    case 'damage': colorClass = 'floating-text-damage'; break;
    case 'crit_damage': colorClass = 'floating-text-crit'; break;
    case 'miss': colorClass = 'floating-text-miss'; break;
    case 'heal': colorClass = 'floating-text-heal'; break;
    case 'ko': colorClass = 'floating-text-ko'; break;
    case 'info': colorClass = 'bg-sky-500/80 text-white border-sky-300/50'; break;
    default: colorClass = 'bg-slate-500/80 text-white border-slate-300/50';
  }
  
  // Ensure offsetX and offsetY provide some variation
  const xPos = `calc(50% + ${instance.offsetX}px)`;
  const yPos = `calc(50% + ${instance.offsetY}px)`;


  return (
    <div
      ref={elementRef}
      className={`floating-text-effect ${colorClass}`}
      style={{
        left: xPos,
        top: yPos,
        transform: 'translateX(-50%) translateY(-50%)', // Center the text initially then animation takes over
      }}
    >
      {instance.text}
    </div>
  );
};

export default FloatingTextEffect;
