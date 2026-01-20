import React, { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';

const FloatingChatButton = ({ onClick, isOpen }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const hasMoved = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 70),
        y: Math.min(prev.y, window.innerHeight - 70)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    hasMoved.current = false;
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const moveDistance = Math.sqrt(
      Math.pow(e.clientX - (dragStart.x + position.x), 2) +
      Math.pow(e.clientY - (dragStart.y + position.y), 2)
    );
    
    if (moveDistance > 5) {
      hasMoved.current = true;
    }
    
    setPosition({
      x: Math.max(0, Math.min(newX, window.innerWidth - 70)),
      y: Math.max(0, Math.min(newY, window.innerHeight - 70))
    });
  };

  const handleMouseUp = (e) => {
    setIsDragging(false);
    if (!hasMoved.current) {
      onClick();
    }
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

  // Touch events for mobile
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    hasMoved.current = false;
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    
    const moveDistance = Math.sqrt(
      Math.pow(touch.clientX - (dragStart.x + position.x), 2) +
      Math.pow(touch.clientY - (dragStart.y + position.y), 2)
    );
    
    if (moveDistance > 5) {
      hasMoved.current = true;
    }
    
    setPosition({
      x: Math.max(0, Math.min(touch.clientX - dragStart.x, window.innerWidth - 70)),
      y: Math.max(0, Math.min(touch.clientY - dragStart.y, window.innerHeight - 70))
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (!hasMoved.current) {
      onClick();
    }
  };

  if (isOpen) return null;

  return (
    <button
      ref={buttonRef}
      className={`fixed z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
        isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-110'
      }`}
      style={{
        left: position.x,
        top: position.y,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Bot className="w-7 h-7 text-white" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
    </button>
  );
};

export default FloatingChatButton;
