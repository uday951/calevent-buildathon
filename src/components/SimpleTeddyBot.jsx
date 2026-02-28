import React, { useState, useEffect } from 'react';

const SimpleTeddyBot = () => {
  const [position, setPosition] = useState({ x: window.innerWidth, y: 0 });
  const [showBubble, setShowBubble] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const messages = [
    "Hi! 🎉 Planning an event?",
    "Need help? Click me! 💒",
    "Let's plan your dream event! 🎂",
    "I'm here to help! ✨"
  ];

  useEffect(() => {
    // Walking animation
    const walkTimer = setTimeout(() => {
      setPosition({ x: window.innerWidth - 200, y: 0 });
      setTimeout(() => setShowBubble(true), 500);
    }, 1000);

    // Message rotation
    const messageTimer = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 3000);

    return () => {
      clearTimeout(walkTimer);
      clearInterval(messageTimer);
    };
  }, []);

  const handleTeddyClick = () => {
    setShowChat(true);
    setShowBubble(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Teddy Bot */}
      <div 
        className="fixed bottom-5 z-50 cursor-pointer transition-all duration-3000 ease-out"
        style={{ 
          right: `${window.innerWidth - position.x}px`,
          transform: showBubble ? 'scale(1)' : 'scale(0.8)'
        }}
        onClick={handleTeddyClick}
      >
        {/* Speech Bubble */}
        {showBubble && (
          <div className="absolute bottom-full right-0 mb-4 mr-4 animate-bounce">
            <div className="bg-purple-500 text-white px-4 py-2 rounded-2xl shadow-lg relative">
              <p className="text-sm whitespace-nowrap">{messages[currentMessage]}</p>
              <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-purple-500"></div>
            </div>
          </div>
        )}

        {/* Teddy Character */}
        <div className="text-6xl hover:scale-110 transition-transform duration-300 animate-bounce">
          🧸
        </div>

        {/* Sparkles */}
        <div className="absolute -top-2 -left-2 text-yellow-400 animate-pulse">✨</div>
        <div className="absolute -top-1 -right-1 text-pink-400 animate-pulse">🌟</div>
        <div className="absolute -bottom-1 -left-1 text-blue-400 animate-pulse">💫</div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 text-white rounded-full text-xs hover:bg-gray-600"
        >
          ×
        </button>
      </div>

      {/* Simple Chat Interface */}
      {showChat && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border z-50">
          {/* Header */}
          <div className="bg-purple-500 p-4 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🧸</span>
                <div>
                  <h3 className="font-bold">Teddy Assistant</h3>
                  <p className="text-xs opacity-90">CALEVENT Helper</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 h-64 overflow-y-auto bg-gray-50">
            <div className="bg-white p-3 rounded-2xl shadow-sm mb-4">
              <p className="text-sm">Hi! I'm Teddy, your CALEVENT assistant! 🧸 How can I help you plan your perfect event?</p>
            </div>
          </div>

          {/* Quick Replies */}
          <div className="p-4 bg-gray-100">
            <div className="grid grid-cols-2 gap-2">
              <button className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200">
                Plan Wedding 💒
              </button>
              <button className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200">
                Birthday Party 🎂
              </button>
              <button className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200">
                Find Providers 🔍
              </button>
              <button className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200">
                Get Pricing 💰
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Ask me about events..."
                className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <button className="w-10 h-10 bg-purple-500 text-white rounded-full hover:bg-purple-600 flex items-center justify-center">
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SimpleTeddyBot;