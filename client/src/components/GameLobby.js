import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import GameModal from './GameModal';

const GAMES = [
  { id: 'blackjack', name: '블랙잭', icon: '🃏', description: '21에 가까운 숫자로 딜러를 이기세요' },
  { id: 'roulette', name: '룰렛', icon: '🎡', description: '회전하는 휠에 베팅하세요' },
  { id: 'baccarat', name: '바카라', icon: '🎴', description: '플레이어 vs 뱅커' },
  { id: 'slots', name: '슬롯머신', icon: '🎰', description: '3개의 릴을 맞추세요' },
  { id: 'poker', name: '포커', icon: '♠️', description: '텍사스 홀덤 포커' },
  { id: 'sicbo', name: '식보', icon: '🎲', description: '주사위 3개 게임' },
  { id: 'dragontiger', name: '드래곤 타이거', icon: '🐉', description: '간단한 카드 비교 게임' },
  { id: 'craps', name: '크랩스', icon: '🎲', description: '주사위 게임' },
  { id: 'bingo', name: '빙고', icon: '🔢', description: '숫자 맞추기 게임' },
  { id: 'keno', name: '키노', icon: '🎱', description: '복권 스타일 게임' },
];

function GameLobby({ user, token, onLogout }) {
  const [wallet, setWallet] = useState({ test_money: 0, real_money: 0 });
  const [selectedGame, setSelectedGame] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await axios.get('/wallet/balance');
      setWallet(response.data);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };

  const handleCloseGame = () => {
    setSelectedGame(null);
    fetchWallet();
  };

  return (
    <div>
      <nav className="navbar">
        <h1>🎰 게임 로비</h1>
        <div className="navbar-right">
          <div className="wallet-display">
            <div className="wallet-item">
              <span className="wallet-label">테스트 머니 (T)</span>
              <span className="wallet-amount">{parseFloat(wallet.test_money).toFixed(2)}</span>
            </div>
            <div className="wallet-item">
              <span className="wallet-label">실제 머니 (M)</span>
              <span className="wallet-amount">{parseFloat(wallet.real_money).toFixed(2)}</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            대시보드
          </button>
          <button className="btn btn-secondary" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </nav>

      <div className="container">
        <h2>게임을 선택하세요</h2>
        <div className="game-grid">
          {GAMES.map((game) => (
            <div
              key={game.id}
              className="game-card"
              onClick={() => handleGameSelect(game)}
            >
              <div className="game-icon">{game.icon}</div>
              <div className="game-name">{game.name}</div>
              <div className="game-description">{game.description}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedGame && (
        <GameModal
          game={selectedGame}
          wallet={wallet}
          onClose={handleCloseGame}
        />
      )}
    </div>
  );
}

export default GameLobby;
