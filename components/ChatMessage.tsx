
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, MessageSender } from '../types';
import { BotIcon, UserIcon } from './Icons';
import LoadingIndicator from './LoadingIndicator';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copyIcon, setCopyIcon] = useState('content_copy');
  const isBot = message.sender === MessageSender.BOT;
  const isLoading = isBot && message.text === '' && !message.isError;

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopyIcon('done');
      setTimeout(() => setCopyIcon('content_copy'), 1500);
    }
  };

  const messageContentClass = message.isError ? 'text-red-500' : 'text-gray-800 dark:text-gray-200';

  return (
    <div className="group mb-6">
      <div className="flex items-start gap-4 max-w-4xl mx-auto">
        <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-slate-100 dark:bg-gray-800">
          {isBot ? <BotIcon /> : <UserIcon />}
        </div>
        <div className="flex-1 pt-1.5 min-w-0">
          {isLoading ? <LoadingIndicator /> : (
            <div className={`markdown-content ${messageContentClass}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
            </div>
          )}
        </div>
        {isBot && !isLoading && !message.isError && (
          <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
            <span className="material-symbols-rounded text-lg">{copyIcon}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
