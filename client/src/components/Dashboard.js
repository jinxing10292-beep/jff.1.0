import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

function Dashboard({ user, token, onLogout }) {
  const [wallet, setWallet] = useState({ test_money: 0, real_money: 0 });
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
    fetchStats();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await axios.get('/wallet/balance');
      setWallet(response.data);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/wallet/transactions?limit=10');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/games/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <h1>🎰 Casino Platform</h1>
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
          <button className="btn btn-primary" onClick={() => navigate('/games')}>
            게임 시작
          </button>
          <button className="btn btn-secondary" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </nav>

      <div className="container">
        <h2>환영합니다, {user.username}님!</h2>

        <div style={{ marginTop: '30px' }}>
          <h3>게임 통계</h3>
          {stats.length > 0 ? (
            <div style={{ marginTop: '20px' }}>
              {stats.map((stat, index) => (
                <div key={index} style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  padding: '15px', 
                  borderRadius: '10px',
                  marginBottom: '10px'
                }}>
                  <strong>{stat.game_type}</strong>: {stat.games_played}게임 플레이, 
                  총 베팅: {parseFloat(stat.total_bet).toFixed(2)}, 
                  총 획득: {parseFloat(stat.total_won).toFixed(2)}, 
                  순이익: {parseFloat(stat.net_profit).toFixed(2)}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: '20px', opacity: 0.7 }}>아직 게임 기록이 없습니다.</p>
          )}
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>최근 거래 내역</h3>
          {transactions.length > 0 ? (
            <div style={{ marginTop: '20px' }}>
              {transactions.map((tx) => (
                <div key={tx.id} style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  padding: '10px', 
                  borderRadius: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{tx.transaction_type} - {tx.game_type || 'N/A'}</span>
                  <span>{tx.money_type}: {parseFloat(tx.amount).toFixed(2)}</span>
                  <span>{new Date(tx.created_at).toLocaleString('ko-KR')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: '20px', opacity: 0.7 }}>거래 내역이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
