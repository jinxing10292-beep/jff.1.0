import React, { useState } from 'react';
import axios from '../api/axios';

function GameModal({ game, wallet, onClose }) {
  const [betAmount, setBetAmount] = useState('10');
  const [moneyType, setMoneyType] = useState('T');
  const [gameData, setGameData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlay = async () => {
    setError('');
    setResult(null);
    setLoading(true);

    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) {
      setError('올바른 베팅 금액을 입력하세요');
      setLoading(false);
      return;
    }

    const balance = moneyType === 'T' ? wallet.test_money : wallet.real_money;
    if (bet > parseFloat(balance)) {
      setError('잔액이 부족합니다');
      setLoading(false);
      return;
    }

    try {
      const payload = prepareGameData();
      const response = await axios.post('/games/play', {
        gameType: game.id,
        moneyType,
        betAmount: bet,
        gameData: payload,
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || '게임 실행 실패');
    } finally {
      setLoading(false);
    }
  };

  const prepareGameData = () => {
    switch (game.id) {
      case 'roulette':
        return { betType: gameData.betType || 'red', betValue: gameData.betValue || 0 };
      case 'baccarat':
        return { bet: gameData.bet || 'player' };
      case 'sicbo':
        return { betType: gameData.betType || 'big', betValue: gameData.betValue || 0 };
      case 'craps':
        return { betType: gameData.betType || 'pass' };
      case 'bingo':
        return { selectedNumbers: gameData.selectedNumbers || [1, 2, 3, 4, 5] };
      case 'keno':
        return { selectedNumbers: gameData.selectedNumbers || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
      default:
        return {};
    }
  };

  const renderGameControls = () => {
    switch (game.id) {
      case 'roulette':
        return (
          <div>
            <label>베팅 타입:</label>
            <select
              value={gameData.betType || 'red'}
              onChange={(e) => setGameData({ ...gameData, betType: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px' }}
            >
              <option value="red">빨강</option>
              <option value="black">검정</option>
              <option value="even">짝수</option>
              <option value="odd">홀수</option>
              <option value="number">특정 숫자</option>
            </select>
            {gameData.betType === 'number' && (
              <input
                type="number"
                min="0"
                max="36"
                value={gameData.betValue || 0}
                onChange={(e) => setGameData({ ...gameData, betValue: parseInt(e.target.value) })}
                className="bet-input"
                placeholder="0-36 숫자 선택"
              />
            )}
          </div>
        );
      case 'baccarat':
        return (
          <div>
            <label>베팅:</label>
            <select
              value={gameData.bet || 'player'}
              onChange={(e) => setGameData({ ...gameData, bet: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px' }}
            >
              <option value="player">플레이어</option>
              <option value="banker">뱅커</option>
              <option value="tie">타이</option>
            </select>
          </div>
        );
      case 'sicbo':
        return (
          <div>
            <label>베팅 타입:</label>
            <select
              value={gameData.betType || 'big'}
              onChange={(e) => setGameData({ ...gameData, betType: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px' }}
            >
              <option value="big">큰 수 (11-17)</option>
              <option value="small">작은 수 (4-10)</option>
              <option value="total">특정 합계</option>
            </select>
            {gameData.betType === 'total' && (
              <input
                type="number"
                min="3"
                max="18"
                value={gameData.betValue || 3}
                onChange={(e) => setGameData({ ...gameData, betValue: parseInt(e.target.value) })}
                className="bet-input"
                placeholder="3-18 합계 선택"
              />
            )}
          </div>
        );
      case 'craps':
        return (
          <div>
            <label>베팅 타입:</label>
            <select
              value={gameData.betType || 'pass'}
              onChange={(e) => setGameData({ ...gameData, betType: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px' }}
            >
              <option value="pass">패스 라인</option>
              <option value="dontpass">돈트 패스</option>
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className={`game-result ${result.result.toLowerCase()}`}>
        <h3>{result.result === 'WIN' ? '🎉 승리!' : result.result === 'PUSH' ? '🤝 무승부' : '😢 패배'}</h3>
        <p>획득 금액: {result.winAmount.toFixed(2)}</p>
        <p>새 잔액: {result.newBalance.toFixed(2)}</p>
        {result.gameData && (
          <div style={{ marginTop: '15px', fontSize: '0.9rem' }}>
            <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
              {JSON.stringify(result.gameData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-modal" onClick={onClose}>
      <div className="game-modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{game.icon} {game.name}</h2>
          <button onClick={onClose} style={{ background: 'none', color: '#fff', fontSize: '1.5rem' }}>✕</button>
        </div>

        <p style={{ opacity: 0.8, marginBottom: '20px' }}>{game.description}</p>

        {error && <div className="error">{error}</div>}

        <div className="game-controls">
          <div className="form-group">
            <label>머니 타입:</label>
            <select
              value={moneyType}
              onChange={(e) => setMoneyType(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px' }}
            >
              <option value="T">테스트 머니 (T) - 잔액: {parseFloat(wallet.test_money).toFixed(2)}</option>
              <option value="M">실제 머니 (M) - 잔액: {parseFloat(wallet.real_money).toFixed(2)}</option>
            </select>
          </div>

          <div className="form-group">
            <label>베팅 금액:</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="bet-input"
              min="0.01"
              step="0.01"
              placeholder="베팅 금액 입력"
            />
          </div>

          {renderGameControls()}

          <button
            onClick={handlePlay}
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '15px' }}
          >
            {loading ? '게임 진행 중...' : '게임 시작'}
          </button>
        </div>

        {renderResult()}
      </div>
    </div>
  );
}

export default GameModal;
