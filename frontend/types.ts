import { Square, PieceSymbol, Color, Move } from 'chess.js';

export type { Square, PieceSymbol, Color, Move };

export interface PieceData {
  type: PieceSymbol;
  color: Color;
}

export interface CellData extends PieceData {
  square: Square;
}

export interface BoardTheme {
  id: string;
  name: string;
  light: string;
  dark: string;
}

export interface PieceTheme {
  id: string;
  name: string;
  filter: string;
}
