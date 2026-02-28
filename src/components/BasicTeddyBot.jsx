import React, { useState, useEffect } from 'react';

const BasicTeddyBot = () => {
  const [showTeddy, setShowTeddy] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Show teddy after 2 seconds
    const timer = setTimeout(() => {
      setShowTeddy(true);
      setTimeout(() => setShowBubble(true), 1000);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleTeddyClick = () => {
    setShowChat(true);
    setShowBubble(false);
  };

  return (
    <>
      {/* Teddy Bot */}
      {showTeddy && (
        <div 
          className="fixed bottom-5 right-5 z-50 cursor-pointer"
          onClick={handleTeddyClick}
          style={{
            animation: 'bounce 2s infinite'
          }}
        >
          {/* Speech Bubble */}
          {showBubble && !showChat && (
            <div className="absolute bottom-full right-0 mb-4">
              <div className="bg-purple-500 text-white px-4 py-2 rounded-2xl shadow-lg relative">
                <p className="text-sm">Hi! Need help planning an event? 🎉</p>
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-purple-500"></div>
              </div>
            </div>
          )}

          {/* Teddy */}
          <div className="text-6xl hover:scale-110 transition-transform">
            🧸
          </div>

          {/* Sparkles */}
          <div className="absolute -top-2 -left-2 text-yellow-400">✨</div>
          <div className="absolute -top-1 -right-1 text-pink-400">🌟</div>
        </div>
      )}

      {/* Chat Interface */}
      {showChat && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border z-50">
          <div className="bg-purple-500 p-4 text-white rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🧸</span>
              <span className="font-bold">Teddy Helper</span>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <div className="p-4 h-64 bg-gray-50">
            <div className="bg-white p-3 rounded-2xl shadow-sm">
              <p className="text-sm">Hi! I'm Teddy 🧸 How can I help you plan your event?</p>
            </div>
          </div>

          <div className="p-4 grid grid-cols-2 gap-2 bg-gray-100">
            <button className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-xs">
              Wedding 💒
            </button>
            <button className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-xs">
              Birthday 🎂
            </button>
          </div>

          <div className="p-4 border-t">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-10px,0);
          }
          70% {
            transform: translate3d(0,-5px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }
      `}</style>
    </>
  );
};

export default BasicTeddyBot;