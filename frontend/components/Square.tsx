import React from 'react';
import { Square as SquareType, PieceSymbol, Color, BoardTheme, PieceTheme } from '../types';
import { PIECE_IMAGES } from '../constants';

interface SquareProps {
  square: SquareType;
  piece: { type: PieceSymbol; color: Color } | null;
  isDark: boolean;
  isSelected: boolean;
  isHovered: boolean;
  isValidMove: boolean;
  isCapture: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  theme: BoardTheme;
  pieceTheme: PieceTheme;
  onClick: (square: SquareType) => void;
  onDragStartSquare: (square: SquareType) => void;
  onDragOverSquare: (square: SquareType) => void;
  onDragEnd: () => void;
  onDrop: (from: SquareType, to: SquareType) => void;
  showRank: string | null;
  showFile: string | null;
}

export const Square: React.FC<SquareProps> = ({
  square,
  piece,
  isDark,
  isSelected,
  isHovered,
  isValidMove,
  isCapture,
  isCheck,
  isCheckmate,
  theme,
  pieceTheme,
  onClick,
  onDragStartSquare,
  onDragOverSquare,
  onDragEnd,
  onDrop,
  showRank,
  showFile
}) => {
  // Dynamic colors based on the selected theme
  const bgColor = isDark ? theme.dark : theme.light;
  const textColor = isDark ? theme.light : theme.dark;

  // Determine if this square contains the king that just got checkmated
  const isLosingKing = isCheckmate && isCheck && piece?.type === 'k';

  const handleDragStart = (e: React.DragEvent<HTMLImageElement>) => {
    e.dataTransfer.setData('text/plain', square);
    e.dataTransfer.effectAllowed = 'move';
    onDragStartSquare(square);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOverSquare(square);
  };

  const handleDragEndEvent = () => {
    onDragEnd();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fromSquare = e.dataTransfer.getData('text/plain') as SquareType;
    if (fromSquare && fromSquare !== square) {
      onDrop(fromSquare, square);
    }
  };

  return (
    <div
      onClick={() => onClick(square)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ backgroundColor: bgColor }}
      className={`relative w-full h-full flex items-center justify-center cursor-pointer select-none`}
    >
      {/* Highlights */}
      {isSelected && <div className="absolute inset-0 bg-yellow-400/50 z-10 pointer-events-none" />}
      {isCheck && <div className="absolute inset-0 bg-red-500/60 z-10 pointer-events-none" />}
      
      {/* Valid Move Indicators (Dots and Rings) */}
      {isValidMove && !isCapture && (
        <div className="absolute w-[30%] h-[30%] bg-black/30 rounded-full z-20 pointer-events-none transition-all" />
      )}
      {isValidMove && isCapture && (
        <div className="absolute w-[85%] h-[85%] border-[6px] border-black/30 rounded-full z-20 pointer-events-none transition-all" />
      )}

      {/* Drag Hover Highlight */}
      {isHovered && (
        <div className={`absolute inset-0 z-20 pointer-events-none transition-colors ${isValidMove ? 'bg-white/40' : 'bg-red-900/50'}`} />
      )}

      {/* Coordinates */}
      {showRank && (
        <span style={{ color: textColor }} className={`absolute top-0.5 left-0.5 sm:top-1 sm:left-1 text-[8px] sm:text-xs font-bold z-20 pointer-events-none`}>
          {showRank}
        </span>
      )}
      {showFile && (
        <span style={{ color: textColor }} className={`absolute bottom-0 right-0.5 sm:bottom-0.5 sm:right-1 text-[8px] sm:text-xs font-bold z-20 pointer-events-none`}>
          {showFile}
        </span>
      )}

      {/* Piece Image */}
      {piece && (
        <img
          src={PIECE_IMAGES[`${piece.color}-${piece.type}`]}
          alt={`${piece.color} ${piece.type}`}
          draggable={!isLosingKing}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEndEvent}
          style={!isLosingKing ? { filter: pieceTheme.filter } : undefined}
          className={`w-[85%] h-[85%] object-contain z-30 ${
            isLosingKing 
              ? 'animate-king-epic-death' 
              : 'cursor-grab active:cursor-grabbing'
          }`}
        />
      )}

      {/* Epic Explosion Particles & Shockwave */}
      {isLosingKing && (
        <>
          <div className="shockwave" />
          {Array.from({ length: 30 }).map((_, i) => {
            const angle = (i / 30) * Math.PI * 2 + (Math.random() * 0.2);
            const distance = 100 + Math.random() * 150; // Fly far away
            const tx = `${Math.cos(angle) * distance}px`;
            const ty = `${Math.sin(angle) * distance}px`;
            const rot = `${Math.random() * 1080}deg`; // Lots of rotation
            const colors = ['#ef4444', '#f59e0b', '#fbbf24', '#b91c1c', '#ffffff'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const isStar = Math.random() > 0.7; // 30% chance to be a star shape
            
            return (
              <div
                key={i}
                className="epic-particle"
                style={{
                  '--tx': tx,
                  '--ty': ty,
                  '--rot': rot,
                  backgroundColor: color,
                  boxShadow: `0 0 15px ${color}`,
                  borderRadius: isStar ? '0' : '2px',
                  clipPath: isStar 
                    ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' 
                    : 'none'
                } as React.CSSProperties}
              />
            );
          })}
        </>
      )}
    </div>
  );
};
