const { supabase } = require('./supabase');

// Wrapper functions to maintain compatibility with existing code
const query = async (text, params) => {
  try {
    // Convert PostgreSQL parameterized queries to Supabase format
    // This is a simplified conversion - you may need to adjust based on your queries
    const { data, error } = await supabase.rpc('execute_sql', {
      query_text: text,
      query_params: params || []
    });

    if (error) throw error;

    return {
      rows: data || [],
      rowCount: data?.length || 0
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper functions for common operations
const db = {
  // Users
  async findUserByUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createUser(username, email, passwordHash) {
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, email, password_hash: passwordHash }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Wallets
  async getWallet(userId) {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createWallet(userId) {
    const { data, error } = await supabase
      .from('wallets')
      .insert([{ user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateWallet(userId, moneyType, amount) {
    const column = moneyType === 'T' ? 'test_money' : 'real_money';
    const { data, error } = await supabase
      .from('wallets')
      .update({ [column]: amount })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Transactions
  async createTransaction(transaction) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTransactions(userId, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  },

  // Game Sessions
  async createGameSession(session) {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert([session])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getGameHistory(userId, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('id, game_type, money_type, bet_amount, win_amount, result, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  },

  async getGameStats(userId) {
    const { data, error } = await supabase
      .rpc('get_game_stats', { user_id_param: userId });
    
    if (error) throw error;
    return data;
  },

  // Security Logs
  async createSecurityLog(log) {
    const { data, error } = await supabase
      .from('security_logs')
      .insert([log])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

module.exports = {
  query,
  supabase,
  db
};
