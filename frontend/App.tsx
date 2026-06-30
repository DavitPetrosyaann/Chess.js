import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import { RotateCcw, Trophy, Info, Users, Bot, Undo, ChevronRight, ChevronLeft, Palette, Crown } from 'lucide-react';
import { Square as SquareType, Move, Color, PieceSymbol } from './types';
import { Board } from './components/Board';
import { CapturedPieces } from './components/CapturedPieces';
import { MoveHistory } from './components/MoveHistory';
import { getBestMove } from './services/engine';
import { BOARD_THEMES, PIECE_THEMES, PIECE_IMAGES } from './constants';

// Helper to calculate captured pieces by comparing current board to initial state
const calculateCaptured = (game: Chess) => {
  const initialCounts = {
    w: { p: 8, n: 2, b: 2, r: 2, q: 1 },
    b: { p: 8, n: 2, b: 2, r: 2, q: 1 }
  };
  const currentCounts = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
  };

  const board = game.board();
  board.forEach(row => {
    row.forEach(cell => {
      if (cell && cell.type !== 'k') {
        currentCounts[cell.color][cell.type]++;
      }
    });
  });

  const captured = { w: [] as string[], b: [] as string[] };
  (['w', 'b'] as Color[]).forEach(color => {
    (['p', 'n', 'b', 'r', 'q'] as PieceSymbol[]).forEach(type => {
      const diff = initialCounts[color][type] - currentCounts[color][type];
      for (let i = 0; i < diff; i++) {
        captured[color].push(type);
      }
    });
  });

  return captured;
};

export default function App() {
  const [game] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<SquareType | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<SquareType | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [gameMode, setGameMode] = useState<'1v1' | 'computer'>('1v1');
  
  // Player Names State
  const [whiteName, setWhiteName] = useState('White');
  const [blackName, setBlackName] = useState('Black');

  // Theme State
  const [currentTheme, setCurrentTheme] = useState(BOARD_THEMES[0]);
  const [currentPieceTheme, setCurrentPieceTheme] = useState(PIECE_THEMES[0]);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);

  const isGameOver = useMemo(() => game.isGameOver(), [fen, game]);
  const turn = useMemo(() => game.turn(), [fen, game]);
  const captured = useMemo(() => calculateCaptured(game), [fen, game]);

  // Display names based on mode
  const displayWhiteName = gameMode === '1v1' ? (whiteName.trim() || 'White') : 'White';
  const displayBlackName = gameMode === '1v1' ? (blackName.trim() || 'Black') : 'Black';

  // Computer AI Move Effect
  useEffect(() => {
    if (gameMode === 'computer' && turn === 'b' && !isGameOver) {
      // Small timeout allows the UI to render the player's move before the engine blocks the thread
      const timer = setTimeout(() => {
        const bestMove = getBestMove(game, 3); // Depth 3 provides ~1500 Elo performance
        if (bestMove) {
          game.move(bestMove);
          setFen(game.fen());
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [fen, gameMode, turn, isGameOver, game]);

  const handleSquareClick = useCallback((square: SquareType) => {
    if (isGameOver) return;
    
    // Block player input if it's the computer's turn
    if (gameMode === 'computer' && turn === 'b') return;

    const piece = game.get(square);

    if (selectedSquare) {
      const move = validMoves.find(m => m.to === square);
      
      if (move) {
        try {
          game.move({
            from: selectedSquare,
            to: square,
            promotion: 'q'
          });
          setFen(game.fen());
          setSelectedSquare(null);
          setValidMoves([]);
        } catch (e) {
          console.error("Invalid move", e);
        }
        return;
      }

      if (piece && piece.color === turn) {
        setSelectedSquare(square);
        setValidMoves(game.moves({ square, verbose: true }) as Move[]);
        return;
      }

      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      if (piece && piece.color === turn) {
        setSelectedSquare(square);
        setValidMoves(game.moves({ square, verbose: true }) as Move[]);
      }
    }
  }, [game, selectedSquare, validMoves, turn, isGameOver, gameMode]);

  const handleDragStartSquare = useCallback((square: SquareType) => {
    if (isGameOver || (gameMode === 'computer' && turn === 'b')) return;
    const piece = game.get(square);
    if (piece && piece.color === turn) {
      setSelectedSquare(square);
      setValidMoves(game.moves({ square, verbose: true }) as Move[]);
    }
  }, [game, isGameOver, gameMode, turn]);

  const handleDragOverSquare = useCallback((square: SquareType) => {
    setHoveredSquare(square);
  }, []);

  const handleDragEnd = useCallback(() => {
    setHoveredSquare(null);
  }, []);

  const handleDrop = useCallback((from: SquareType, to: SquareType) => {
    setHoveredSquare(null);
    if (isGameOver) return;
    if (gameMode === 'computer' && turn === 'b') return;

    try {
      game.move({
        from,
        to,
        promotion: 'q'
      });
      setFen(game.fen());
      setSelectedSquare(null);
      setValidMoves([]);
    } catch (e) {
      // Invalid move, ignore
    }
  }, [game, isGameOver, gameMode, turn]);

  const handleUndo = useCallback(() => {
    if (gameMode === 'computer') {
      // Undo twice to revert both the computer's move and the player's move
      if (game.history().length >= 2) {
        game.undo();
        game.undo();
      } else if (game.history().length === 1) {
        game.undo();
      }
    } else {
      game.undo();
    }
    setFen(game.fen());
    setSelectedSquare(null);
    setValidMoves([]);
  }, [game, gameMode]);

  const resetGame = useCallback(() => {
    game.reset();
    setFen(game.fen());
    setSelectedSquare(null);
    setValidMoves([]);
  }, [game]);

  return (
    <div 
      className="h-[100dvh] w-screen flex flex-col lg:flex-row p-2 sm:p-4 gap-2 sm:gap-4 box-border font-sans relative overflow-hidden bg-slate-950 text-slate-200"
      style={{
        '--theme-light': currentTheme.light,
        '--theme-dark': currentTheme.dark,
      } as React.CSSProperties}
    >
      
      {/* Theme Selector Panel (Left Side) */}
      <div 
        className={`absolute left-0 top-0 bottom-0 z-50 flex items-center transition-transform duration-300 ease-in-out ${
          isThemePanelOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="bg-slate-800/95 backdrop-blur-md border-r border-slate-700 shadow-[10px_0_30px_rgba(0,0,0,0.5)] p-3 sm:p-4 w-56 sm:w-64 h-full flex flex-col gap-4 sm:gap-6 overflow-y-auto custom-scrollbar">
          
          {/* Board Style */}
          <div className="flex flex-col gap-2 sm:gap-3 mt-4">
            <div className="flex items-center gap-2 text-white">
              <Palette size={16} className="sm:w-[18px] sm:h-[18px]" />
              <h3 className="font-bold text-sm sm:text-base">Board Style</h3>
            </div>
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {BOARD_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setCurrentTheme(theme)}
                  className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg transition-colors ${
                    currentTheme.id === theme.id ? 'bg-indigo-600/40 ring-1 ring-indigo-500' : 'hover:bg-slate-700'
                  }`}
                >
                  <div className="flex w-8 h-8 sm:w-10 sm:h-10 rounded-md overflow-hidden shadow-sm shrink-0 border border-slate-600">
                    <div style={{ backgroundColor: theme.light }} className="flex-1" />
                    <div style={{ backgroundColor: theme.dark }} className="flex-1" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-200">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Piece Style */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-white">
              <Crown size={16} className="sm:w-[18px] sm:h-[18px]" />
              <h3 className="font-bold text-sm sm:text-base">Piece Style</h3>
            </div>
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {PIECE_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setCurrentPieceTheme(theme)}
                  className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg transition-colors ${
                    currentPieceTheme.id === theme.id ? 'bg-indigo-600/40 ring-1 ring-indigo-500' : 'hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-slate-700 shadow-sm shrink-0 border border-slate-600">
                    <img 
                      src={PIECE_IMAGES['w-n']} 
                      alt="knight" 
                      className="w-5 h-5 sm:w-6 sm:h-6 object-contain" 
                      style={{ filter: theme.filter }} 
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-200">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
        
        {/* Toggle Tab */}
        <button
          onClick={() => setIsThemePanelOpen(!isThemePanelOpen)}
          className="absolute left-full top-1/2 -translate-y-1/2 bg-slate-800/95 backdrop-blur-md border-y border-r border-slate-700 text-slate-300 hover:text-white p-1.5 sm:p-2 rounded-r-xl shadow-[5px_0_15px_rgba(0,0,0,0.3)] transition-colors flex flex-col items-center justify-center gap-1 h-16 sm:h-24"
        >
          {!isThemePanelOpen && <Palette size={14} className="mb-0.5 sm:mb-1 opacity-70 sm:w-[16px] sm:h-[16px]" />}
          {isThemePanelOpen ? <ChevronLeft size={18} className="sm:w-[20px] sm:h-[20px]" /> : <ChevronRight size={18} className="sm:w-[20px] sm:h-[20px]" />}
        </button>
      </div>

      {/* Left Column: Board & Players */}
      <div className="flex-none lg:flex-1 flex flex-col items-center justify-center min-h-0 min-w-0 gap-1 sm:gap-2 w-full h-full">
        
        {/* Top Player (Black) */}
        <div className="w-full max-w-[min(100%,_calc(100dvh-22rem))] lg:max-w-[min(100%,_calc(100dvh-16rem))] flex justify-between items-center px-3 py-2 sm:px-4 sm:py-3 bg-slate-800/60 rounded-xl border border-slate-700/50 shadow-sm shrink-0 mt-2 lg:mt-6">
          <div className="flex flex-col justify-center">
            {gameMode === '1v1' ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={blackName}
                  onChange={(e) => setBlackName(e.target.value)}
                  className="font-bold text-sm sm:text-lg leading-tight text-slate-200 bg-transparent border-b border-slate-700 focus:border-slate-400 focus:outline-none transition-colors w-28 sm:w-40 px-1 py-0.5"
                  placeholder="Black Player"
                  maxLength={15}
                />
              </div>
            ) : (
              <h2 className="font-bold text-sm sm:text-lg leading-tight text-slate-200 px-1">
                Black <span className="text-slate-400 text-[10px] sm:text-sm font-normal">(Computer)</span>
              </h2>
            )}
            <div className="px-1">
              <CapturedPieces pieces={captured.w} color="w" pieceTheme={currentPieceTheme} />
            </div>
          </div>
        </div>

        {/* The Chess Board */}
        <div className="w-full max-w-[min(100%,_calc(100dvh-22rem))] lg:max-w-[min(100%,_calc(100dvh-16rem))] aspect-square shrink-0">
          <Board
            game={game}
            selectedSquare={selectedSquare}
            hoveredSquare={hoveredSquare}
            validMoves={validMoves}
            theme={currentTheme}
            pieceTheme={currentPieceTheme}
            onSquareClick={handleSquareClick}
            onDragStartSquare={handleDragStartSquare}
            onDragOverSquare={handleDragOverSquare}
            onDragEnd={handleDragEnd}
            onSquareDrop={handleDrop}
          />
        </div>

        {/* Bottom Player (White) */}
        <div className="w-full max-w-[min(100%,_calc(100dvh-22rem))] lg:max-w-[min(100%,_calc(100dvh-16rem))] flex justify-between items-center px-3 py-2 sm:px-4 sm:py-3 bg-slate-800/60 rounded-xl border border-slate-700/50 shadow-sm shrink-0 mb-2 lg:mb-6">
          <div className="flex flex-col justify-center">
            {gameMode === '1v1' ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={whiteName}
                  onChange={(e) => setWhiteName(e.target.value)}
                  className="font-bold text-sm sm:text-lg leading-tight text-slate-200 bg-transparent border-b border-slate-700 focus:border-slate-400 focus:outline-none transition-colors w-28 sm:w-40 px-1 py-0.5"
                  placeholder="White Player"
                  maxLength={15}
                />
              </div>
            ) : (
              <h2 className="font-bold text-sm sm:text-lg leading-tight text-slate-200 px-1">
                White <span className="text-slate-400 text-[10px] sm:text-sm font-normal">(You)</span>
              </h2>
            )}
            <div className="px-1">
              <CapturedPieces pieces={captured.b} color="b" pieceTheme={currentPieceTheme} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-2 sm:gap-4 shrink-0 flex-1 lg:flex-none min-h-0">
        
        {/* Status Card */}
        <div className="bg-slate-800 rounded-xl p-3 sm:p-6 shadow-xl border border-slate-700 shrink-0">
          
          {/* Animated Header */}
          <div className="mb-3 sm:mb-6 border-b border-slate-700/50 pb-2 sm:pb-4 cursor-default">
            <h1 className="text-xl sm:text-3xl font-black animate-shine tracking-tight dynamic-title-shadow">
              React Chess
            </h1>
            <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 text-slate-400 text-[10px] sm:text-sm font-medium relative w-max">
              <Info size={14} style={{ color: currentTheme.light }} />
              <span className="relative overflow-hidden px-1 -ml-1 rounded">
                Powered by PreZento.am
                <span className="absolute inset-0 animate-shimmer dynamic-shimmer" />
              </span>
            </div>
          </div>

          {/* Game Mode Selector */}
          <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-6 bg-slate-900/50 p-1 sm:p-1.5 rounded-lg border border-slate-700/50">
            <button
              onClick={() => { setGameMode('1v1'); resetGame(); }}
              className={`flex-1 py-1.5 sm:py-2 px-2 rounded-md font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors ${
                gameMode === '1v1' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Users size={14} className="sm:w-[16px] sm:h-[16px]" />
              1 vs 1
            </button>
            <button
              onClick={() => { setGameMode('computer'); resetGame(); }}
              className={`flex-1 py-1.5 sm:py-2 px-2 rounded-md font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors ${
                gameMode === 'computer' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Bot size={14} className="sm:w-[16px] sm:h-[16px]" />
              vs Computer
            </button>
          </div>

          <div className="bg-slate-900/80 rounded-lg p-2 sm:p-5 mb-2 sm:mb-6 text-center border border-slate-700/50 shadow-inner min-h-[80px] sm:min-h-[120px] flex items-center justify-center">
            {isGameOver ? (
              <div className="flex flex-col items-center gap-1 sm:gap-3 w-full">
                <Trophy className="drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] w-6 h-6 sm:w-11 sm:h-11" style={{ color: currentTheme.light }} />
                <span className="text-base sm:text-2xl font-black text-transparent bg-clip-text animate-shine drop-shadow-sm">
                  {game.isCheckmate() 
                    ? `Checkmate! ${turn === 'w' ? displayBlackName : displayWhiteName} Wins!` 
                    : 'Game Over (Draw)'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0.5 sm:gap-1 w-full">
                <span className="text-[9px] sm:text-xs text-slate-400 uppercase tracking-widest font-bold">Current Turn</span>
                <span key={turn} className="text-lg sm:text-3xl font-black text-white tracking-wide inline-block animate-turn-glow truncate max-w-full px-2">
                  {turn === 'w' ? displayWhiteName : displayBlackName}
                </span>
                {game.inCheck() && (
                  <span className="text-red-400 font-bold mt-0.5 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-red-500/10 rounded-full text-[10px] sm:text-sm">
                    Check!
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={handleUndo}
              disabled={game.history().length === 0}
              className="flex-1 py-2 sm:py-3.5 px-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors shadow-lg text-xs sm:text-base"
            >
              <Undo size={14} className="sm:w-[18px] sm:h-[18px]" />
              Undo
            </button>
            <button
              onClick={resetGame}
              className="flex-1 py-2 sm:py-3.5 px-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors shadow-lg text-xs sm:text-base"
            >
              <RotateCcw size={14} className="sm:w-[18px] sm:h-[18px]" />
              Restart
            </button>
          </div>
        </div>

        {/* Move History */}
        <div className="flex-1 min-h-0 flex flex-col shrink-0">
          <MoveHistory game={game} fen={fen} />
        </div>
        
      </div>
    </div>
  );
}
