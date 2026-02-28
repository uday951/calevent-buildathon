import React from 'react';
import { MessageCircle } from 'lucide-react';

const AnimatedTeddyBot = ({ onChatOpen }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onChatOpen}
        className="w-14 h-14 bg-gradient-to-r from-black to-[#333f63] text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default AnimatedTeddyBot;