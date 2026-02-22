import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Suit, SUITS } from '../types';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface SuitPickerProps {
  onSelect: (suit: Suit) => void;
}

const SuitIcon = ({ suit, size = 32 }: { suit: Suit; size?: number }) => {
  switch (suit) {
    case 'hearts': return <Heart size={size} className="text-red-500 fill-red-500" />;
    case 'diamonds': return <Diamond size={size} className="text-red-500 fill-red-500" />;
    case 'clubs': return <Club size={size} className="text-black fill-black" />;
    case 'spades': return <Spade size={size} className="text-black fill-black" />;
  }
};

export const SuitPicker: React.FC<SuitPickerProps> = ({ onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Choose a Suit</h2>
        <div className="grid grid-cols-2 gap-4">
          {SUITS.map((suit) => (
            <button
              key={suit}
              onClick={() => onSelect(suit)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <SuitIcon suit={suit} />
              <span className="mt-2 text-sm font-semibold capitalize text-gray-600 group-hover:text-indigo-600">
                {suit}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
