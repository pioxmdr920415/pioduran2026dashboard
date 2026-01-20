import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Minimize2, Maximize2, GripHorizontal } from 'lucide-react';
import { sendMessage } from '../../services/openaiService';

const ChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m the MDRRMO AI Assistant. I can help you with:\n\n• Navigating the File Inventory System\n• Disaster preparedness information\n• Emergency response guidance\n• System module assistance\n\nHow can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Center modal on smaller screens
    if (window.innerWidth < 768) {
      setPosition({ x: 10, y: 60 });
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await sendMessage(chatHistory);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const modalWidth = isMinimized ? 300 : 380;
    const modalHeight = isMinimized ? 60 : 500;
    
    setPosition({
      x: Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - modalWidth)),
      y: Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - modalHeight))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (e.target.closest('.no-drag')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const modalWidth = isMinimized ? 300 : 380;
    const modalHeight = isMinimized ? 60 : 500;
    
    setPosition({
      x: Math.max(0, Math.min(touch.clientX - dragStart.x, window.innerWidth - modalWidth)),
      y: Math.max(0, Math.min(touch.clientY - dragStart.y, window.innerHeight - modalHeight))
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className={`fixed z-50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isDragging ? 'cursor-grabbing' : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? '300px' : '380px',
        height: isMinimized ? '60px' : '500px',
        background: 'linear-gradient(180deg, #1e1e2e 0%, #2d2d44 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Header - Draggable Area */}
      <div
        className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">MDRRMO AI Assistant</h3>
            {!isMinimized && (
              <p className="text-white/70 text-xs">Disaster Management Support</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <GripHorizontal className="w-4 h-4 text-white/50 mr-2" />
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="no-drag p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-white" />
            ) : (
              <Minimize2 className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={onClose}
            className="no-drag p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="h-[360px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-500'
                      : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-tr-sm'
                      : 'bg-gray-700/50 text-gray-100 rounded-tl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-700/50 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-700/50">
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-3 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="no-drag flex-1 bg-transparent text-white text-sm placeholder-gray-400 outline-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="no-drag p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-2 text-center">
              Powered by OpenAI GPT • Drag header to move
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatModal;
