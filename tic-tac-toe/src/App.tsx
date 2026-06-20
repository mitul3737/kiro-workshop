import { useState } from 'react';
import type { Board, Cell, Player } from './gameLogic';
import { checkWinner, checkDraw, createEmptyBoard } from './gameLogic';
import './App.css';

function App() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });

  const result = checkWinner(board);
  const isDraw = !result && checkDraw(board);
  const gameOver = !!result || isDraw;
  const winningLine = result?.line ?? [];

  function handleCellClick(index: number) {
    if (board[index] || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const newResult = checkWinner(newBoard);
    const newDraw = !newResult && checkDraw(newBoard);

    if (newResult) {
      setScores((s) => ({ ...s, [newResult.winner]: s[newResult.winner as keyof typeof s] + 1 }));
    } else if (newDraw) {
      setScores((s) => ({ ...s, ties: s.ties + 1 }));
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  }

  function handleReset() {
    setBoard(createEmptyBoard());
    setCurrentPlayer('X');
  }

  function getStatusText() {
    if (result) return `Player ${result.winner} Wins!`;
    if (isDraw) return "It's a Draw!";
    return null;
  }

  return (
    <div className="app">
      <h1 className="title">TIC-TAC-TOE</h1>

      <div className="game-area">
        {/* Board */}
        <div className="board">
          {board.map((cell: Cell, i: number) => (
            <button
              key={i}
              className={`cell ${cell ? `cell--${cell.toLowerCase()}` : ''} ${winningLine.includes(i) ? 'cell--winning' : ''}`}
              onClick={() => handleCellClick(i)}
              aria-label={cell ? `Cell ${i + 1}: ${cell}` : `Cell ${i + 1}: empty`}
            >
              {cell}
            </button>
          ))}
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <div className="info-block">
            <div className="info-label">CURRENT TURN</div>
            <div className={`info-box turn-box turn-box--${currentPlayer.toLowerCase()}`}>
              <span>{currentPlayer}'s Turn</span>
            </div>
          </div>

          <div className="info-block">
            <div className="info-label">GAME STATUS</div>
            <div className={`info-box status-box ${result ? `status-box--${result.winner.toLowerCase()}` : ''} ${isDraw ? 'status-box--draw' : ''}`}>
              <span>{getStatusText() ?? 'In Progress'}</span>
            </div>
          </div>

          <div className="info-block">
            <div className="info-label">SCORE</div>
            <div className="info-box score-box">
              <span className="score-x">X: {scores.X}</span>
              <span className="score-o">O: {scores.O}</span>
              <span className="score-ties">Ties: {scores.ties}</span>
            </div>
          </div>
        </div>
      </div>

      <button className="reset-btn" onClick={handleReset}>
        RESET GAME
      </button>
    </div>
  );
}

export default App;
