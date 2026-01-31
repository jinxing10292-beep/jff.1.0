// Game logic implementations

const playGame = (gameType, gameData, betAmount) => {
  switch (gameType) {
    case 'blackjack':
      return playBlackjack(gameData, betAmount);
    case 'roulette':
      return playRoulette(gameData, betAmount);
    case 'baccarat':
      return playBaccarat(gameData, betAmount);
    case 'slots':
      return playSlots(betAmount);
    case 'poker':
      return playPoker(gameData, betAmount);
    case 'sicbo':
      return playSicBo(gameData, betAmount);
    case 'dragontiger':
      return playDragonTiger(betAmount);
    case 'craps':
      return playCraps(gameData, betAmount);
    case 'bingo':
      return playBingo(gameData, betAmount);
    case 'keno':
      return playKeno(gameData, betAmount);
    default:
      throw new Error('Invalid game type');
  }
};

// Blackjack
const playBlackjack = (gameData, betAmount) => {
  const deck = createDeck();
  const playerHand = [drawCard(deck), drawCard(deck)];
  const dealerHand = [drawCard(deck), drawCard(deck)];

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  let result, winAmount = 0;

  if (playerValue === 21 && playerHand.length === 2) {
    result = 'WIN';
    winAmount = betAmount * 2.5; // Blackjack pays 3:2
  } else if (playerValue > 21) {
    result = 'LOSS';
  } else if (dealerValue > 21 || playerValue > dealerValue) {
    result = 'WIN';
    winAmount = betAmount * 2;
  } else if (playerValue === dealerValue) {
    result = 'PUSH';
    winAmount = betAmount;
  } else {
    result = 'LOSS';
  }

  return {
    result,
    winAmount,
    gameData: { playerHand, dealerHand, playerValue, dealerValue },
  };
};

// Roulette
const playRoulette = (gameData, betAmount) => {
  const { betType, betValue } = gameData;
  const spinResult = Math.floor(Math.random() * 37); // 0-36

  let isWin = false;
  let multiplier = 0;

  if (betType === 'number' && spinResult === betValue) {
    isWin = true;
    multiplier = 35;
  } else if (betType === 'red' && isRed(spinResult)) {
    isWin = true;
    multiplier = 1;
  } else if (betType === 'black' && !isRed(spinResult) && spinResult !== 0) {
    isWin = true;
    multiplier = 1;
  } else if (betType === 'even' && spinResult % 2 === 0 && spinResult !== 0) {
    isWin = true;
    multiplier = 1;
  } else if (betType === 'odd' && spinResult % 2 === 1) {
    isWin = true;
    multiplier = 1;
  }

  return {
    result: isWin ? 'WIN' : 'LOSS',
    winAmount: isWin ? betAmount * (multiplier + 1) : 0,
    gameData: { spinResult, betType, betValue },
  };
};

// Baccarat
const playBaccarat = (gameData, betAmount) => {
  const { bet } = gameData; // 'player', 'banker', or 'tie'
  
  const playerHand = [randomCard(), randomCard()];
  const bankerHand = [randomCard(), randomCard()];

  const playerValue = (playerHand[0] + playerHand[1]) % 10;
  const bankerValue = (bankerHand[0] + bankerHand[1]) % 10;

  let result, winAmount = 0;

  if (playerValue === bankerValue) {
    if (bet === 'tie') {
      result = 'WIN';
      winAmount = betAmount * 9;
    } else {
      result = 'PUSH';
      winAmount = betAmount;
    }
  } else if (playerValue > bankerValue) {
    if (bet === 'player') {
      result = 'WIN';
      winAmount = betAmount * 2;
    } else {
      result = 'LOSS';
    }
  } else {
    if (bet === 'banker') {
      result = 'WIN';
      winAmount = betAmount * 1.95; // 5% commission
    } else {
      result = 'LOSS';
    }
  }

  return {
    result,
    winAmount,
    gameData: { playerHand, bankerHand, playerValue, bankerValue },
  };
};

// Slots
const playSlots = (betAmount) => {
  const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];
  const reels = [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  let multiplier = 0;

  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    if (reels[0] === '7️⃣') multiplier = 100;
    else if (reels[0] === '💎') multiplier = 50;
    else multiplier = 10;
  } else if (reels[0] === reels[1] || reels[1] === reels[2]) {
    multiplier = 2;
  }

  return {
    result: multiplier > 0 ? 'WIN' : 'LOSS',
    winAmount: betAmount * multiplier,
    gameData: { reels },
  };
};

// Poker (simplified)
const playPoker = (gameData, betAmount) => {
  const playerHand = [drawCard([]), drawCard([]), drawCard([]), drawCard([]), drawCard([])];
  const dealerHand = [drawCard([]), drawCard([]), drawCard([]), drawCard([]), drawCard([])];

  const playerRank = evaluatePokerHand(playerHand);
  const dealerRank = evaluatePokerHand(dealerHand);

  let result, winAmount = 0;

  if (playerRank > dealerRank) {
    result = 'WIN';
    winAmount = betAmount * 2;
  } else if (playerRank === dealerRank) {
    result = 'PUSH';
    winAmount = betAmount;
  } else {
    result = 'LOSS';
  }

  return {
    result,
    winAmount,
    gameData: { playerHand, dealerHand, playerRank, dealerRank },
  };
};

// Sic Bo (dice game)
const playSicBo = (gameData, betAmount) => {
  const { betType, betValue } = gameData;
  const dice = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
  const total = dice.reduce((a, b) => a + b, 0);

  let isWin = false;
  let multiplier = 0;

  if (betType === 'total' && total === betValue) {
    isWin = true;
    multiplier = 10;
  } else if (betType === 'big' && total >= 11 && total <= 17) {
    isWin = true;
    multiplier = 1;
  } else if (betType === 'small' && total >= 4 && total <= 10) {
    isWin = true;
    multiplier = 1;
  }

  return {
    result: isWin ? 'WIN' : 'LOSS',
    winAmount: isWin ? betAmount * (multiplier + 1) : 0,
    gameData: { dice, total, betType, betValue },
  };
};

// Dragon Tiger
const playDragonTiger = (betAmount) => {
  const dragonCard = randomCard();
  const tigerCard = randomCard();

  let result, winAmount = 0;

  if (dragonCard > tigerCard) {
    result = 'WIN';
    winAmount = betAmount * 2;
  } else if (dragonCard === tigerCard) {
    result = 'PUSH';
    winAmount = betAmount;
  } else {
    result = 'LOSS';
  }

  return {
    result,
    winAmount,
    gameData: { dragonCard, tigerCard },
  };
};

// Craps
const playCraps = (gameData, betAmount) => {
  const { betType } = gameData;
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const total = dice1 + dice2;

  let isWin = false;
  let multiplier = 1;

  if (betType === 'pass') {
    if (total === 7 || total === 11) isWin = true;
    else if (total === 2 || total === 3 || total === 12) isWin = false;
  } else if (betType === 'dontpass') {
    if (total === 2 || total === 3) isWin = true;
    else if (total === 7 || total === 11) isWin = false;
  }

  return {
    result: isWin ? 'WIN' : 'LOSS',
    winAmount: isWin ? betAmount * (multiplier + 1) : 0,
    gameData: { dice1, dice2, total, betType },
  };
};

// Bingo (simplified)
const playBingo = (gameData, betAmount) => {
  const { selectedNumbers } = gameData;
  const drawnNumbers = [];
  
  for (let i = 0; i < 20; i++) {
    drawnNumbers.push(Math.floor(Math.random() * 75) + 1);
  }

  const matches = selectedNumbers.filter(num => drawnNumbers.includes(num)).length;
  let multiplier = 0;

  if (matches >= 5) multiplier = 100;
  else if (matches >= 4) multiplier = 10;
  else if (matches >= 3) multiplier = 2;

  return {
    result: multiplier > 0 ? 'WIN' : 'LOSS',
    winAmount: betAmount * multiplier,
    gameData: { selectedNumbers, drawnNumbers, matches },
  };
};

// Keno
const playKeno = (gameData, betAmount) => {
  const { selectedNumbers } = gameData;
  const drawnNumbers = [];
  
  for (let i = 0; i < 20; i++) {
    let num;
    do {
      num = Math.floor(Math.random() * 80) + 1;
    } while (drawnNumbers.includes(num));
    drawnNumbers.push(num);
  }

  const matches = selectedNumbers.filter(num => drawnNumbers.includes(num)).length;
  const payoutTable = { 0: 0, 1: 0, 2: 0, 3: 2, 4: 5, 5: 20, 6: 50, 7: 100, 8: 500, 9: 1000, 10: 5000 };
  const multiplier = payoutTable[matches] || 0;

  return {
    result: multiplier > 0 ? 'WIN' : 'LOSS',
    winAmount: betAmount * multiplier,
    gameData: { selectedNumbers, drawnNumbers, matches },
  };
};

// Helper functions
const createDeck = () => {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];
  
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  
  return shuffle(deck);
};

const drawCard = (deck) => {
  return deck.pop();
};

const calculateHandValue = (hand) => {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.value === 'A') {
      aces++;
      value += 11;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
};

const randomCard = () => Math.floor(Math.random() * 13) + 1;

const isRed = (number) => {
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  return redNumbers.includes(number);
};

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const evaluatePokerHand = (hand) => {
  return Math.floor(Math.random() * 10);
};

module.exports = { playGame };
