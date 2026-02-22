/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardData, GameState, Turn, Suit, SUITS } from './types';
import { createDeck, shuffle, isValidMove } from './utils';
import { Card } from './components/Card';
import { SuitPicker } from './components/SuitPicker';
import { Trophy, RotateCcw, User, Cpu, Info, Play, HelpCircle, Settings } from 'lucide-react';

export default function App() {
  const [deck, setDeck] = useState<CardData[]>([]);
  const [playerHand, setPlayerHand] = useState<CardData[]>([]);
  const [aiHand, setAiHand] = useState<CardData[]>([]);
  const [discardPile, setDiscardPile] = useState<CardData[]>([]);
  const [currentSuit, setCurrentSuit] = useState<Suit | null>(null);
  const [turn, setTurn] = useState<Turn>('player');
  const [gameState, setGameState] = useState<GameState>('menu');
  const [message, setMessage] = useState<string>("Welcome to 光头强!");
  const [isAiThinking, setIsAiThinking] = useState(false);

  const initGame = () => {
    const fullDeck = shuffle(createDeck());
    const pHand = fullDeck.splice(0, 8);
    const aHand = fullDeck.splice(0, 8);
    
    // Find a non-8 card for the start of discard pile
    let firstDiscardIndex = 0;
    while (fullDeck[firstDiscardIndex].rank === '8') {
      firstDiscardIndex++;
    }
    const firstDiscard = fullDeck.splice(firstDiscardIndex, 1)[0];

    setDeck(fullDeck);
    setPlayerHand(pHand);
    setAiHand(aHand);
    setDiscardPile([firstDiscard]);
    setCurrentSuit(firstDiscard.suit);
    setTurn('player');
    setGameState('playing');
    setMessage("Your turn! Match the suit or rank.");
    setIsAiThinking(false);
  };

  // No auto-init, wait for user to click play
  useEffect(() => {
    // Optional: pre-load something
  }, []);

  const handlePlayerPlay = (card: CardData) => {
    if (turn !== 'player' || gameState !== 'playing') return;

    if (isValidMove(card, discardPile[discardPile.length - 1], currentSuit!)) {
      const newHand = playerHand.filter(c => c.id !== card.id);
      setPlayerHand(newHand);
      setDiscardPile(prev => [...prev, card]);
      
      if (newHand.length === 0) {
        setGameState('game-over');
        setMessage("Congratulations! You won!");
        return;
      }

      if (card.rank === '8') {
        setGameState('suit-selection');
        setMessage("Choose a new suit!");
      } else {
        setCurrentSuit(card.suit);
        setTurn('ai');
        setMessage("AI is thinking...");
      }
    } else {
      setMessage("Invalid move! Match the suit or rank.");
    }
  };

  const handleSuitSelect = (suit: Suit) => {
    setCurrentSuit(suit);
    setGameState('playing');
    setTurn('ai');
    setMessage(`Suit changed to ${suit}. AI's turn.`);
  };

  const handleDraw = () => {
    if (turn !== 'player' || gameState !== 'playing') return;

    if (deck.length > 0) {
      const newDeck = [...deck];
      const drawnCard = newDeck.pop()!;
      setDeck(newDeck);
      setPlayerHand(prev => [...prev, drawnCard]);
      setMessage("You drew a card.");
      
      // Check if the drawn card can be played
      if (!isValidMove(drawnCard, discardPile[discardPile.length - 1], currentSuit!)) {
        setTurn('ai');
        setMessage("No valid moves. AI's turn.");
      }
    } else {
      setTurn('ai');
      setMessage("Deck empty! Skipping turn.");
    }
  };

  const aiTurn = useCallback(async () => {
    if (turn !== 'ai' || gameState !== 'playing') return;

    setIsAiThinking(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const topCard = discardPile[discardPile.length - 1];
    const playableCard = aiHand.find(c => isValidMove(c, topCard, currentSuit!));

    if (playableCard) {
      const newHand = aiHand.filter(c => c.id !== playableCard.id);
      setAiHand(newHand);
      setDiscardPile(prev => [...prev, playableCard]);

      if (newHand.length === 0) {
        setGameState('game-over');
        setMessage("AI won! Better luck next time.");
        setIsAiThinking(false);
        return;
      }

      if (playableCard.rank === '8') {
        // AI logic for choosing suit: pick the suit it has the most of
        const suitCounts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
        newHand.forEach(c => suitCounts[c.suit]++);
        const bestSuit = (Object.keys(suitCounts) as Suit[]).reduce((a, b) => suitCounts[a] > suitCounts[b] ? a : b);
        setCurrentSuit(bestSuit);
        setMessage(`AI played an 8 and chose ${bestSuit}.`);
      } else {
        setCurrentSuit(playableCard.suit);
        setMessage(`AI played ${playableCard.rank} of ${playableCard.suit}.`);
      }
      setTurn('player');
    } else {
      if (deck.length > 0) {
        const newDeck = [...deck];
        const drawnCard = newDeck.pop()!;
        setDeck(newDeck);
        setAiHand(prev => [...prev, drawnCard]);
        
        if (isValidMove(drawnCard, topCard, currentSuit!)) {
          // AI plays the drawn card immediately if valid (optional rule, let's keep it simple)
          // For now, let's just end turn after drawing
          setMessage("AI drew a card and ended its turn.");
          setTurn('player');
        } else {
          setMessage("AI drew a card and ended its turn.");
          setTurn('player');
        }
      } else {
        setMessage("AI couldn't move and deck is empty. Your turn.");
        setTurn('player');
      }
    }
    setIsAiThinking(false);
  }, [turn, gameState, aiHand, discardPile, currentSuit, deck]);

  useEffect(() => {
    if (turn === 'ai' && gameState === 'playing') {
      aiTurn();
    }
  }, [turn, gameState, aiTurn]);

  return (
    <div className="min-h-screen bg-emerald-900 text-white font-sans selection:bg-yellow-400 selection:text-emerald-900 overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {gameState === 'menu' ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col items-center justify-center relative p-6"
          >
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-800/50 rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-900/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-12 text-center"
              >
                <div className="inline-block p-4 bg-yellow-400 rounded-3xl shadow-2xl mb-6 rotate-3">
                  <span className="text-6xl font-black text-emerald-900">8</span>
                </div>
                <h1 className="text-7xl font-black tracking-tighter mb-2 drop-shadow-2xl">光头强</h1>
                <p className="text-emerald-200 font-medium tracking-widest uppercase text-sm">Crazy Eights Edition</p>
              </motion.div>

              <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={initGame}
                  className="group relative flex items-center justify-center gap-3 py-5 bg-white text-emerald-900 rounded-2xl font-bold text-xl transition-all shadow-xl hover:shadow-white/20"
                >
                  <Play size={24} className="fill-emerald-900" />
                  开始游戏
                  <div className="absolute inset-0 rounded-2xl border-2 border-white scale-105 opacity-0 group-hover:opacity-100 transition-all"></div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-3 py-4 bg-emerald-800/50 hover:bg-emerald-800 text-white rounded-2xl font-bold text-lg transition-all border border-white/10"
                >
                  <HelpCircle size={20} />
                  游戏规则
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-3 py-4 bg-emerald-800/50 hover:bg-emerald-800 text-white rounded-2xl font-bold text-lg transition-all border border-white/10"
                >
                  <Settings size={20} />
                  设置
                </motion.button>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-16 flex gap-8 text-emerald-300/50"
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-white">52</span>
                  <span className="text-[10px] uppercase tracking-widest">Cards</span>
                </div>
                <div className="w-px h-8 bg-white/10 self-center"></div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-white">2</span>
                  <span className="text-[10px] uppercase tracking-widest">Players</span>
                </div>
                <div className="w-px h-8 bg-white/10 self-center"></div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-white">∞</span>
                  <span className="text-[10px] uppercase tracking-widest">Fun</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col"
          >
            {/* Header */}
            <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-emerald-900 font-bold text-xl">8</div>
                <h1 className="text-xl font-bold tracking-tight">光头强</h1>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setGameState('menu')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm font-medium"
                >
                  返回主页
                </button>
                <button 
                  onClick={initGame}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm font-medium"
                >
                  <RotateCcw size={16} />
                  重新开始
                </button>
              </div>
            </header>

            {/* Game Board */}
            <main className="flex-grow relative flex flex-col items-center justify-between p-4 sm:p-8">
              
              {/* AI Area */}
              <div className="w-full flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-1 bg-black/30 rounded-full text-sm">
                  <Cpu size={16} className={isAiThinking ? "animate-pulse text-yellow-400" : ""} />
                  <span>AI Opponent ({aiHand.length} cards)</span>
                </div>
                <div className="flex -space-x-12 sm:-space-x-16 overflow-visible h-40 items-center">
                  {aiHand.map((card, i) => (
                    <Card key={card.id} card={card} isFaceUp={false} disabled className="shadow-2xl" />
                  ))}
                </div>
              </div>

              {/* Center Area (Deck & Discard) */}
              <div className="flex items-center gap-8 sm:gap-16 my-8">
                {/* Draw Pile */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative group" onClick={handleDraw}>
                    <div className="absolute -inset-1 bg-yellow-400 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                    <Card 
                      card={{} as CardData} 
                      isFaceUp={false} 
                      disabled={turn !== 'player' || gameState !== 'playing' || deck.length === 0}
                      className={`relative z-10 ${deck.length > 0 ? 'cursor-pointer' : 'opacity-50'}`}
                    />
                    {deck.length > 0 && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-emerald-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg z-20">
                        {deck.length}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-white/60 uppercase tracking-widest">Draw</span>
                </div>

                {/* Discard Pile */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <AnimatePresence mode="popLayout">
                      {discardPile.slice(-1).map((card) => (
                        <Card 
                          key={card.id} 
                          card={card} 
                          disabled 
                          className="shadow-2xl"
                        />
                      ))}
                    </AnimatePresence>
                    {currentSuit && (
                      <div className="absolute -bottom-2 -right-2 bg-white text-emerald-900 p-2 rounded-full shadow-xl border-2 border-emerald-900 z-20">
                        {currentSuit === 'hearts' && <span className="text-red-500 text-xl">♥</span>}
                        {currentSuit === 'diamonds' && <span className="text-red-500 text-xl">♦</span>}
                        {currentSuit === 'clubs' && <span className="text-black text-xl">♣</span>}
                        {currentSuit === 'spades' && <span className="text-black text-xl">♠</span>}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-white/60 uppercase tracking-widest">Discard</span>
                </div>
              </div>

              {/* Player Area */}
              <div className="w-full flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-1 bg-black/30 rounded-full text-sm">
                  <User size={16} className={turn === 'player' ? "text-yellow-400" : ""} />
                  <span>Your Hand ({playerHand.length} cards)</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-4xl">
                  {playerHand.map((card) => (
                    <Card 
                      key={card.id} 
                      card={card} 
                      onClick={() => handlePlayerPlay(card)}
                      disabled={turn !== 'player' || gameState !== 'playing'}
                      isPlayable={turn === 'player' && gameState === 'playing' && isValidMove(card, discardPile[discardPile.length - 1], currentSuit!)}
                    />
                  ))}
                </div>
              </div>
            </main>

            {/* Status Bar */}
            <footer className="p-4 bg-black/40 backdrop-blur-md border-t border-white/10 flex justify-center items-center">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-yellow-400" />
                <p className="text-sm font-medium tracking-wide">{message}</p>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {gameState === 'suit-selection' && (
          <SuitPicker onSelect={handleSuitSelect} />
        )}

        {gameState === 'game-over' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4"
            >
              <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy size={40} className="text-emerald-900" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Game Over!</h2>
              <p className="text-gray-600 mb-8 font-medium">{message}</p>
              <button
                onClick={initGame}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
