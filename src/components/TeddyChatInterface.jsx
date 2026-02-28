import React, { useState, useRef, useEffect } from 'react';

const TeddyChatInterface = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm EVO, your CALEVENT Event Organizer! 🚀 How can I help you plan your perfect event?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickReplies = [
    "Plan a wedding 💒",
    "Birthday party ideas 🎂", 
    "Corporate events 🏢",
    "Find providers 🔍",
    "Get pricing 💰"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(text);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userText) => {
    const text = userText.toLowerCase();
    
    if (text.includes('wedding')) {
      return "🎊 Wonderful! I can help you plan your dream wedding! We have amazing wedding planners, decorators, and venues. Would you like me to show you some AI-generated wedding concepts first? ✨";
    } else if (text.includes('birthday')) {
      return "🎂 Birthday parties are so much fun! I can help you find the perfect theme, decorators, and entertainment. What's the age group and how many guests? 🎈";
    } else if (text.includes('corporate')) {
      return "🏢 Corporate events are my specialty! Whether it's conferences, team building, or celebrations, I can connect you with professional event managers. What type of corporate event? 📊";
    } else if (text.includes('price') || text.includes('cost')) {
      return "💰 Great question! Pricing varies based on your needs. I can help you get quotes from multiple providers. What's your budget range and event type? 💳";
    } else if (text.includes('provider') || text.includes('find')) {
      return "🔍 I'll help you find the perfect providers! I can even generate AI images of your vision and match you with providers who can make it real. What kind of event are you planning? 🎯";
    } else {
      return "🤔 That's interesting! I'm here to help with all your event planning needs. You can ask me about weddings, birthdays, corporate events, or anything event-related! What would you like to explore? 🎪";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-black to-[#333f63] p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🚀</div>
            <div>
              <h3 className="font-bold">EVO Assistant</h3>
              <p className="text-xs opacity-90">Event Organizer AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 h-64 overflow-y-auto bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs px-4 py-2 rounded-2xl ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-800 shadow-md'
            }`}>
              <p className="text-sm">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-md">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-2 bg-gray-100">
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(reply)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me about events..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#333f63] text-sm"
          />
          <button
            onClick={() => handleSendMessage()}
            className="w-10 h-10 bg-gradient-to-r from-black to-[#333f63] text-white rounded-full hover:opacity-90 flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeddyChatInterface;