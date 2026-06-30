import React, { useEffect, useRef } from 'react';
import { Chess } from 'chess.js';

interface MoveHistoryProps {
  game: Chess;
  fen: string;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ game, fen }) => {
  const history = game.history();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when a new move is made
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [fen]);

  // Group moves into pairs (White, Black)
  const pairs = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      w: history[i],
      b: history[i + 1]
    });
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 flex flex-col overflow-hidden h-full w-full">
      <div className="p-3 sm:p-4 border-b border-slate-700 bg-slate-800/80 shrink-0">
        <h3 className="font-semibold text-slate-200 text-sm sm:text-base">Move History</h3>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0">
        {pairs.length === 0 && (
          <div className="text-slate-500 text-center p-4 text-xs sm:text-sm italic">No moves yet</div>
        )}
        {pairs.map((pair, i) => (
          <div key={i} className="flex text-xs sm:text-sm even:bg-slate-700/30 rounded px-2 sm:px-3 py-1.5 sm:py-2 transition-colors hover:bg-slate-700/50">
            <div className="w-8 sm:w-10 text-slate-500 font-mono">{i + 1}.</div>
            <div className="flex-1 text-slate-300 font-mono font-medium">{pair.w}</div>
            <div className="flex-1 text-slate-300 font-mono font-medium">{pair.b || ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
