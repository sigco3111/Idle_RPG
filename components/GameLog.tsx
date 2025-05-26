
import React, { useRef, useEffect } from 'react';
import { GameLogMessage } from '../types';

interface GameLogProps {
  messages: GameLogMessage[];
}

const getMessageColor = (type: GameLogMessage['type']): string => {
  switch (type) {
    case 'combat': return 'text-slate-300';
    case 'crit': return 'text-yellow-400 font-semibold';
    case 'reward': return 'text-green-400';
    case 'system': return 'text-sky-400';
    case 'error': return 'text-red-400';
    case 'save': return 'text-purple-400 italic';
    case 'party': return 'text-indigo-400';
    case 'dice': return 'text-slate-500 italic text-xs'; // Style for dice roll details
    default: return 'text-slate-400';
  }
};

export const GameLog = ({ messages }: GameLogProps): React.ReactNode => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 50; 
      if (isScrolledToBottom || messages.length <= 10) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div ref={logContainerRef} className="bg-slate-800 p-3 rounded-lg shadow-xl border border-slate-700 h-48 md:h-full overflow-y-auto">
      <h3 className="text-md font-semibold mb-2 text-slate-300 sticky top-0 bg-slate-800 py-1 z-10 border-b border-slate-700/50">이벤트 로그</h3>
      {messages.length === 0 && <p className="text-sm text-slate-500 italic">아직 이벤트가 없습니다...</p>}
      <div className="space-y-1 text-xs">
        {messages.map((msg) => (
          <div key={msg.id} className={`break-words`}>
            <span className="text-slate-500 mr-1.5">[{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
            <span className={`${getMessageColor(msg.type)}`}>{msg.text}</span>
            {msg.details && msg.type !== 'dice' && <span className={`ml-1 ${getMessageColor('dice')}`}>{msg.details}</span>}
            {msg.type === 'dice' && msg.details && <span className={`ml-1 ${getMessageColor('dice')}`}>{msg.details}</span>} 
          </div>
        ))}
      </div>
    </div>
  );
};
