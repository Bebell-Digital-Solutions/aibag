import React, { useState } from 'react';

interface IconButtonProps {
  onClick: () => void;
  icon: string;
  label: string;
  disabled?: boolean;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, icon, label, disabled = false, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    disabled={disabled}
    className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    <span className="material-symbols-rounded text-2xl">{icon}</span>
  </button>
);


interface TypingAreaProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  theme: string;
  toggleTheme: () => void;
  onDeleteChat: () => void;
  onOpenUploadModal: () => void;
  onOpenApiKeyModal: () => void;
  isApiConfigured: boolean;
  uploadedFilesCount: number;
}

const TypingArea: React.FC<TypingAreaProps> = ({ 
  onSendMessage, 
  isLoading, 
  theme, 
  toggleTheme, 
  onDeleteChat, 
  onOpenUploadModal,
  onOpenApiKeyModal,
  isApiConfigured,
  uploadedFilesCount
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && isApiConfigured) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 pt-2 pb-4 sm:pb-4">
        {uploadedFilesCount > 0 && isApiConfigured && (
          <div className="flex justify-center mb-2">
            <button 
              onClick={onOpenUploadModal} 
              className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-gray-800 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              aria-label={`View ${uploadedFilesCount} attached files`}
            >
              <span className="material-symbols-rounded text-base">attachment</span>
              <span>{uploadedFilesCount} file{uploadedFilesCount > 1 ? 's' : ''} in context</span>
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
           <IconButton 
            onClick={onOpenApiKeyModal} 
            icon="key" 
            label="Manage API Key" 
            className="hidden sm:flex" 
          />
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={isApiConfigured ? "Enter a prompt here..." : "Please set your API key to begin."}
              required
              disabled={isLoading || !isApiConfigured}
              className="w-full h-14 pl-6 pr-16 py-2 rounded-full bg-slate-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink transition disabled:opacity-70 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isLoading || !isApiConfigured || !inputValue.trim()}
              className={`absolute right-0 top-0 h-14 w-14 flex items-center justify-center text-white rounded-full transition-transform transform ${inputValue.trim() && isApiConfigured ? 'scale-100' : 'scale-0'} ${isLoading ? 'bg-gray-500' : 'bg-brand-pink'} disabled:bg-gray-500`}
              aria-label="Send Message"
            >
              <span className="material-symbols-rounded">send</span>
            </button>
          </form>
          <div className="hidden sm:flex items-center gap-3">
            <IconButton 
              onClick={onOpenUploadModal} 
              icon="upload_file" 
              label="Upload Files" 
              disabled={isLoading || !isApiConfigured} 
            />
            <IconButton 
              onClick={toggleTheme} 
              icon={theme === 'dark' ? 'light_mode' : 'dark_mode'} 
              label="Toggle Theme" 
            />
            <IconButton 
              onClick={onDeleteChat} 
              icon="delete" 
              label="Delete Chat" 
              disabled={isLoading || !isApiConfigured} 
            />
          </div>
           <div className="sm:hidden flex">
            <IconButton 
              onClick={onOpenApiKeyModal} 
              icon="key" 
              label="Manage API Key" 
            />
          </div>
        </div>
        <p className="hidden sm:block text-center text-xs text-gray-400 dark:text-gray-500 mt-3 px-4">
          Mega-Bot may display inaccurate info. Always double-check its responses.
        </p>
      </div>
    </div>
  );
};

export default TypingArea;
