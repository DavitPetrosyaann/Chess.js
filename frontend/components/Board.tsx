import React from 'react';
import { Chess } from 'chess.js';
import { Square as SquareType, Move, BoardTheme, PieceTheme } from '../types';
import { Square } from './Square';

interface BoardProps {
  game: Chess;
  selectedSquare: SquareType | null;
  hoveredSquare: SquareType | null;
  validMoves: Move[];
  theme: BoardTheme;
  pieceTheme: PieceTheme;
  onSquareClick: (square: SquareType) => void;
  onDragStartSquare: (square: SquareType) => void;
  onDragOverSquare: (square: SquareType) => void;
  onDragEnd: () => void;
  onSquareDrop: (from: SquareType, to: SquareType) => void;
}

export const Board: React.FC<BoardProps> = ({ 
  game, 
  selectedSquare, 
  hoveredSquare, 
  validMoves, 
  theme, 
  pieceTheme, 
  onSquareClick, 
  onDragStartSquare,
  onDragOverSquare,
  onDragEnd,
  onSquareDrop 
}) => {
  const board = game.board();
  const turn = game.turn();
  const inCheck = game.inCheck();
  const isCheckmate = game.isCheckmate();

  // Find the king's square if in check
  let kingSquare: SquareType | null = null;
  if (inCheck) {
    board.forEach(row => {
      row.forEach(cell => {
        if (cell && cell.type === 'k' && cell.color === turn) {
          kingSquare = cell.square;
        }
      });
    });
  }

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Helper to get SVG coordinates for the vector line (0-100 scale)
  const getSquareCoords = (sq: SquareType) => {
    const file = sq.charCodeAt(0) - 97; // 'a' is 97
    const rank = 8 - parseInt(sq[1], 10); // '8' is 0, '1' is 7
    return { x: (file + 0.5) * 12.5, y: (rank + 0.5) * 12.5 };
  };

  return (
    <div className="relative w-full h-full grid grid-cols-8 grid-rows-8 border-4 border-slate-800 rounded-sm shadow-2xl overflow-hidden bg-slate-800">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const square = `${files[colIndex]}${ranks[rowIndex]}` as SquareType;
          const isDark = (rowIndex + colIndex) % 2 !== 0;
          const isSelected = selectedSquare === square;
          const isHovered = hoveredSquare === square;
          const validMove = validMoves.find(m => m.to === square);
          const isValidMove = !!validMove;
          const isCapture = isValidMove && !!cell;
          const isCheck = kingSquare === square;

          return (
            <Square
              key={square}
              square={square}
              piece={cell}
              isDark={isDark}
              isSelected={isSelected}
              isHovered={isHovered}
              isValidMove={isValidMove}
              isCapture={isCapture}
              isCheck={isCheck}
              isCheckmate={isCheckmate}
              theme={theme}
              pieceTheme={pieceTheme}
              onClick={onSquareClick}
              onDragStartSquare={onDragStartSquare}
              onDragOverSquare={onDragOverSquare}
              onDragEnd={onDragEnd}
              onDrop={onSquareDrop}
              showRank={colIndex === 0 ? ranks[rowIndex] : null}
              showFile={rowIndex === 7 ? files[colIndex] : null}
            />
          );
        })
      )}

      {/* Drag Vector Overlay (All Valid Moves) */}
      {selectedSquare && validMoves.length > 0 && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-40 drop-shadow-md">
          <defs>
            <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
              <polygon points="0 0, 4 2, 0 4" fill="rgba(255, 255, 255, 0.3)" />
            </marker>
            <marker id="arrowhead-hover" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
              <polygon points="0 0, 4 2, 0 4" fill="rgba(255, 255, 255, 0.9)" />
            </marker>
          </defs>
          {validMoves.map((move, i) => {
            const isHoveredMove = hoveredSquare === move.to;
            return (
              <line
                key={i}
                x1={getSquareCoords(selectedSquare).x}
                y1={getSquareCoords(selectedSquare).y}
                x2={getSquareCoords(move.to).x}
                y2={getSquareCoords(move.to).y}
                stroke={isHoveredMove ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.3)"}
                strokeWidth={isHoveredMove ? "1.5" : "0.8"}
                strokeLinecap="round"
                markerEnd={isHoveredMove ? "url(#arrowhead-hover)" : "url(#arrowhead)"}
                className="transition-all duration-200"
              />
            );
          })}
        </svg>
      )}
    </div>
  );
};
