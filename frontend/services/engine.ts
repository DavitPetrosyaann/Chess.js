import { Chess, Move } from 'chess.js';

// Standard piece values
const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Piece-Square Tables (PST) to encourage positional play
const pawnEvalWhite = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const knightEval = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];

const bishopEvalWhite = [
    [ -20,-10,-10,-10,-10,-10,-10,-20],
    [ -10,  0,  0,  0,  0,  0,  0,-10],
    [ -10,  0,  5, 10, 10,  5,  0,-10],
    [ -10,  5,  5, 10, 10,  5,  5,-10],
    [ -10,  0, 10, 10, 10, 10,  0,-10],
    [ -10, 10, 10, 10, 10, 10, 10,-10],
    [ -10,  5,  0,  0,  0,  0,  5,-10],
    [ -20,-10,-10,-10,-10,-10,-10,-20]
];

const rookEvalWhite = [
    [  0,  0,  0,  0,  0,  0,  0,  0],
    [  5, 10, 10, 10, 10, 10, 10,  5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [  0,  0,  0,  5,  5,  0,  0,  0]
];

const evalQueen = [
    [ -20,-10,-10, -5, -5,-10,-10,-20],
    [ -10,  0,  0,  0,  0,  0,  0,-10],
    [ -10,  0,  5,  5,  5,  5,  0,-10],
    [  -5,  0,  5,  5,  5,  5,  0, -5],
    [   0,  0,  5,  5,  5,  5,  0, -5],
    [ -10,  5,  5,  5,  5,  5,  0,-10],
    [ -10,  0,  5,  0,  0,  0,  0,-10],
    [ -20,-10,-10, -5, -5,-10,-10,-20]
];

const kingEvalWhite = [
    [ -30,-40,-40,-50,-50,-40,-40,-30],
    [ -30,-40,-40,-50,-50,-40,-40,-30],
    [ -30,-40,-40,-50,-50,-40,-40,-30],
    [ -30,-40,-40,-50,-50,-40,-40,-30],
    [ -20,-30,-30,-40,-40,-30,-30,-20],
    [ -10,-20,-20,-20,-20,-20,-20,-10],
    [  20, 20,  0,  0,  0,  0, 20, 20],
    [  20, 30, 10,  0,  0, 10, 30, 20]
];

// Reverse arrays for black pieces
const reverseArray = (arr: number[][]) => arr.slice().reverse();

const pawnEvalBlack = reverseArray(pawnEvalWhite);
const bishopEvalBlack = reverseArray(bishopEvalWhite);
const rookEvalBlack = reverseArray(rookEvalWhite);
const kingEvalBlack = reverseArray(kingEvalWhite);

const getPieceValue = (piece: { type: string; color: string } | null, x: number, y: number): number => {
    if (piece === null) return 0;
    
    const isWhite = piece.color === 'w';
    const val = pieceValues[piece.type as keyof typeof pieceValues];
    let pstVal = 0;

    switch (piece.type) {
        case 'p': pstVal = isWhite ? pawnEvalWhite[x][y] : pawnEvalBlack[x][y]; break;
        case 'n': pstVal = knightEval[x][y]; break;
        case 'b': pstVal = isWhite ? bishopEvalWhite[x][y] : bishopEvalBlack[x][y]; break;
        case 'r': pstVal = isWhite ? rookEvalWhite[x][y] : rookEvalBlack[x][y]; break;
        case 'q': pstVal = evalQueen[x][y]; break;
        case 'k': pstVal = isWhite ? kingEvalWhite[x][y] : kingEvalBlack[x][y]; break;
    }

    return isWhite ? val + pstVal : -(val + pstVal);
};

const evaluateBoard = (game: Chess): number => {
    let totalEvaluation = 0;
    const board = game.board();
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            totalEvaluation += getPieceValue(board[i][j], i, j);
        }
    }
    return totalEvaluation;
};

const minimax = (game: Chess, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): number => {
    if (depth === 0 || game.isGameOver()) {
        return evaluateBoard(game);
    }

    const moves = game.moves({ verbose: true }) as Move[];
    // Sort moves to improve alpha-beta pruning efficiency (captures first)
    moves.sort((a, b) => (b.flags.includes('c') ? 1 : 0) - (a.flags.includes('c') ? 1 : 0));

    if (isMaximizingPlayer) {
        let bestVal = -Infinity;
        for (const move of moves) {
            game.move(move);
            bestVal = Math.max(bestVal, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
            game.undo();
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    } else {
        let bestVal = Infinity;
        for (const move of moves) {
            game.move(move);
            bestVal = Math.min(bestVal, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
            game.undo();
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    }
};

export const getBestMove = (game: Chess, depth: number = 3): Move | null => {
    const moves = game.moves({ verbose: true }) as Move[];
    if (moves.length === 0) return null;

    moves.sort((a, b) => (b.flags.includes('c') ? 1 : 0) - (a.flags.includes('c') ? 1 : 0));

    let bestMove = null;
    let bestValue = game.turn() === 'w' ? -Infinity : Infinity;

    for (const move of moves) {
        game.move(move);
        const boardValue = minimax(game, depth - 1, -Infinity, Infinity, game.turn() === 'w');
        game.undo();

        if (game.turn() === 'w') {
            if (boardValue > bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        } else {
            if (boardValue < bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        }
    }

    return bestMove || moves[0];
};
