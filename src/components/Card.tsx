import React from 'react';
import { motion } from 'motion/react';
import { CardData, Suit } from '../types';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface CardProps {
  card: CardData;
  isFaceUp?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  isPlayable?: boolean;
}

const SuitIcon = ({ suit, size = 20 }: { suit: Suit; size?: number }) => {
  switch (suit) {
    case 'hearts': return <Heart size={size} className="text-red-500 fill-red-500" />;
    case 'diamonds': return <Diamond size={size} className="text-red-500 fill-red-500" />;
    case 'clubs': return <Club size={size} className="text-black fill-black" />;
    case 'spades': return <Spade size={size} className="text-black fill-black" />;
  }
};

export const Card: React.FC<CardProps> = ({ 
  card, 
  isFaceUp = true, 
  onClick, 
  disabled = false,
  className = "",
  isPlayable = false
}) => {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={isFaceUp && !disabled ? { y: -20, scale: 1.05 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`
        relative w-24 h-36 sm:w-28 sm:h-40 rounded-xl shadow-lg cursor-pointer overflow-hidden
        transition-shadow duration-200
        ${isFaceUp ? 'bg-white' : 'bg-indigo-700 border-4 border-white/20'}
        ${isPlayable ? 'ring-4 ring-yellow-400 shadow-yellow-400/50' : ''}
        ${disabled ? 'cursor-not-allowed opacity-80' : ''}
        ${className}
      `}
    >
      {isFaceUp ? (
        <div className="flex flex-col h-full p-2 select-none">
          <div className={`flex flex-col items-start ${isRed ? 'text-red-500' : 'text-black'}`}>
            <span className="text-xl font-bold leading-none">{card.rank}</span>
            <SuitIcon suit={card.suit} size={16} />
          </div>
          
          <div className="flex-grow flex items-center justify-center">
            <SuitIcon suit={card.suit} size={40} />
          </div>
          
          <div className={`flex flex-col items-end rotate-180 ${isRed ? 'text-red-500' : 'text-black'}`}>
            <span className="text-xl font-bold leading-none">{card.rank}</span>
            <SuitIcon suit={card.suit} size={16} />
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-24 border-2 border-white/10 rounded-lg flex items-center justify-center">
            <div className="w-12 h-20 bg-white/5 rounded-md" />
          </div>
        </div>
      )}
    </motion.div>
  );
};
