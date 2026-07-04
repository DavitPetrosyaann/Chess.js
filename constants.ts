import { BoardTheme, PieceTheme } from './types';

// High-quality SVG chess pieces from Wikimedia Commons
export const PIECE_IMAGES: Record<string, string> = {
  'w-p': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  'w-n': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  'w-b': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  'w-r': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  'w-q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  'w-k': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  'b-p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  'b-n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  'b-b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  'b-r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  'b-q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  'b-k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
};

export const BOARD_THEMES: BoardTheme[] = [
  { id: 'classic', name: 'Classic', light: '#ebecd0', dark: '#739552' },
  { id: 'wood', name: 'Walnut Wood', light: '#f0d9b5', dark: '#b58863' },
  { id: 'ocean', name: 'Ocean Blue', light: '#dee3e6', dark: '#8ca2ad' },
  { id: 'midnight', name: 'Midnight', light: '#cbd5e1', dark: '#334155' },
  { id: 'coral', name: 'Coral Red', light: '#fce7f3', dark: '#e11d48' },
  { id: 'amethyst', name: 'Amethyst', light: '#f3e8ff', dark: '#7e22ce' },
];

const shadow = 'drop-shadow(0 4px 4px rgba(0,0,0,0.4))';

export const PIECE_THEMES: PieceTheme[] = [
  { id: 'classic', name: 'Classic', filter: shadow },
  { id: 'golden', name: 'Golden', filter: `sepia(1) saturate(3) hue-rotate(10deg) brightness(1.1) ${shadow}` },
  { id: 'ice', name: 'Ice Blue', filter: `sepia(1) saturate(3) hue-rotate(180deg) brightness(1.2) ${shadow}` },
  { id: 'emerald', name: 'Emerald', filter: `sepia(1) saturate(3) hue-rotate(90deg) brightness(1.1) ${shadow}` },
  { id: 'amethyst', name: 'Amethyst', filter: `sepia(1) saturate(3) hue-rotate(250deg) brightness(1.1) ${shadow}` },
  { id: 'shadow', name: 'Shadow', filter: `grayscale(1) brightness(0.6) contrast(1.5) ${shadow}` },
];
