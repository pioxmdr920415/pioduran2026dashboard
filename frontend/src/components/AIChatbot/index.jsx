import React, { useState } from 'react';
import FloatingChatButton from './FloatingChatButton';
import ChatModal from './ChatModal';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <FloatingChatButton onClick={toggleChat} isOpen={isOpen} />
      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default AIChatbot;
