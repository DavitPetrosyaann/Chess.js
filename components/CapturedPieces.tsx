import React from 'react';
import { PIECE_IMAGES } from '../constants';
import { PieceTheme } from '../types';

interface CapturedPiecesProps {
  pieces: string[];
  color: 'w' | 'b';
  pieceTheme: PieceTheme;
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ pieces, color, pieceTheme }) => {
  if (pieces.length === 0) return <div className="h-4 sm:h-6" />; // Maintain layout height

  // Sort pieces by standard value: Queen, Rook, Bishop, Knight, Pawn
  const order = { q: 1, r: 2, b: 3, n: 4, p: 5 };
  const sorted = [...pieces].sort(
    (a, b) => order[a as keyof typeof order] - order[b as keyof typeof order]
  );

  return (
    <div className="flex items-center h-4 sm:h-6 -space-x-2 sm:-space-x-2.5 mt-0.5 sm:mt-1">
      {sorted.map((p, i) => (
        <img
          key={i}
          src={PIECE_IMAGES[`${color}-${p}`]}
          alt="captured piece"
          style={{ filter: pieceTheme.filter }}
          className="w-4 h-4 sm:w-6 sm:h-6 object-contain"
          draggable={false}
        />
      ))}
    </div>
  );
};
