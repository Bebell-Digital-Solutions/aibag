
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';

interface ChatViewProps {
  messages: Message[];
}

const ChatView: React.FC<ChatViewProps> = ({ messages }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 sm:pb-32">
      <div className="max-w-4xl mx-auto">
        {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default ChatView;
