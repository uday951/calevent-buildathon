import React, { useState } from 'react';
import AnimatedTeddyBot from './AnimatedTeddyBot';
import TeddyChatInterface from './TeddyChatInterface';

const TeddyBotContainer = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatOpen = () => {
    setIsChatOpen(true);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      {/* Animated Teddy Bot */}
      {!isChatOpen && (
        <AnimatedTeddyBot onChatOpen={handleChatOpen} />
      )}

      {/* Chat Interface */}
      <TeddyChatInterface 
        isOpen={isChatOpen} 
        onClose={handleChatClose} 
      />

      {/* Floating Action Button when chat is open */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={handleChatClose}
            className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
          >
            🧸
          </button>
        </div>
      )}
    </>
  );
};

export default TeddyBotContainer;