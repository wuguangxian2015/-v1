import { CardData, Rank, Rank as RankType, Suit, SUITS, RANKS } from './types';

export const createDeck = (): CardData[] => {
  const deck: CardData[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({
        id: `${rank}-${suit}`,
        suit,
        rank,
        value: getRankValue(rank),
      });
    });
  });
  return deck;
};

const getRankValue = (rank: RankType): number => {
  if (rank === 'A') return 1;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank) || 10;
};

export const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const isValidMove = (card: CardData, topCard: CardData, currentSuit: Suit): boolean => {
  if (card.rank === '8') return true;
  return card.suit === currentSuit || card.rank === topCard.rank;
};
