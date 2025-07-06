import React, { useState, useEffect, useCallback } from 'react';
import { Chat } from '@google/genai';
import { Message, MessageSender, UploadedFile } from './types';
import { streamChatResponse, createChatInstance } from './services/geminiService';

import Header from './components/Header';
import ChatView from './components/ChatView';
import TypingArea from './components/TypingArea';
import FileUploadModal from './components/FileUploadModal';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("mega-bot-theme");
    return savedTheme === 'light' || savedTheme === 'dark' 
      ? savedTheme 
      : window.matchMedia?.('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileModalOpen, setFileModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('mega-bot-api-key'));
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(!apiKey);
  const [chat, setChat] = useState<Chat | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('mega-bot-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (apiKey) {
      try {
        setChat(createChatInstance(apiKey));
        setShowApiKeyModal(false);
      } catch (error) {
        console.error("Failed to create chat instance:", error);
        alert("Failed to initialize AI. The API key might be invalid.");
        setApiKey(null);
        localStorage.removeItem('mega-bot-api-key');
        setShowApiKeyModal(true);
      }
    } else {
      setChat(null);
      setShowApiKeyModal(true);
    }
  }, [apiKey]);

  const handleSaveApiKey = useCallback((key: string) => {
    localStorage.setItem('mega-bot-api-key', key);
    setApiKey(key);
  }, []);

  const handleDeleteApiKey = useCallback(() => {
    localStorage.removeItem('mega-bot-api-key');
    setApiKey(null);
    setMessages([]);
    setUploadedFiles([]);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  }, []);

  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim() || isLoading || !apiKey || !chat) return;

    setIsLoading(true);
    const userMessage: Message = { id: Date.now(), sender: MessageSender.USER, text: inputText };
    const botMessageId = Date.now() + 1;
    const botMessage: Message = { id: botMessageId, sender: MessageSender.BOT, text: '', isError: false };
    
    setMessages(prev => [...prev, userMessage, botMessage]);
    
    try {
      const fileContext = uploadedFiles.map(f => `File: ${f.name}\nContent:\n${f.content}`).join('\n\n');
      const stream = await streamChatResponse(chat, inputText, fileContext);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: fullResponse } 
            : msg
        ));
      }
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: `Error: ${errorMessage}. Please check your API key or network connection.`, isError: true } 
          : msg
      ));
      if (errorMessage.toLowerCase().includes('api key not valid')) {
        handleDeleteApiKey();
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, apiKey, chat, messages, uploadedFiles, handleDeleteApiKey]);

  const handleDeleteChat = useCallback(() => {
    if (messages.length > 0 && window.confirm("Are you sure you want to delete the chat history? This will start a new conversation.")) {
      setMessages([]);
      setUploadedFiles([]);
      if (apiKey) {
        setChat(createChatInstance(apiKey));
      }
    }
  }, [messages.length, apiKey]);

  const isApiConfigured = !!apiKey;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {messages.length === 0 && isApiConfigured ? (
        <Header onSuggestionClick={handleSendMessage} />
      ) : (
        <ChatView messages={messages} />
      )}
      
      {!isApiConfigured && messages.length === 0 && (
         <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-4">
              <h1 className="text-4xl font-semibold text-gray-800 dark:text-gray-200">Welcome to Mega-Bot</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Please set your Gemini API key to get started.</p>
              <button 
                onClick={() => setShowApiKeyModal(true)}
                className="mt-6 px-6 py-2.5 bg-brand-pink text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Set API Key
              </button>
            </div>
         </div>
      )}

      <TypingArea
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        theme={theme}
        toggleTheme={toggleTheme}
        onDeleteChat={handleDeleteChat}
        onOpenUploadModal={() => setFileModalOpen(true)}
        onOpenApiKeyModal={() => setShowApiKeyModal(true)}
        isApiConfigured={isApiConfigured}
        uploadedFilesCount={uploadedFiles.length}
      />
      
      {showApiKeyModal && (
        <ApiKeyModal
          onSave={handleSaveApiKey}
          onDelete={handleDeleteApiKey}
          onClose={() => { if (apiKey) setShowApiKeyModal(false); }}
          currentKey={apiKey}
        />
      )}
      
      {isFileModalOpen && (
        <FileUploadModal
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          onClose={() => setFileModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
