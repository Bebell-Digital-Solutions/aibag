import React, { useState } from 'react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
  onDelete: () => void;
  onClose: () => void;
  currentKey: string | null;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onDelete, onClose, currentKey }) => {
  const [key, setKey] = useState(currentKey || '');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('API key is required');
      return;
    }
    onSave(key.trim());
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    setKey('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg">
        <header className="p-5 border-b border-slate-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Manage Gemini API Key</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700" disabled={!currentKey}>
            <span className="material-symbols-rounded text-gray-600 dark:text-gray-300">close</span>
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-6">Your Gemini API key is stored in your browser's local storage and is never sent to our servers.</p>
            <input 
              type="password" 
              value={key} 
              onChange={e => {
                setKey(e.target.value);
                setError('');
              }} 
              placeholder="Paste your API key here" 
              className="w-full h-12 px-4 rounded-lg bg-slate-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-pink" 
            />
            {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-pink hover:underline">Get your API key from Google AI Studio</a>
            </div>
          </div>
          <footer className="px-6 py-4 bg-slate-50 dark:bg-gray-800/50 border-t border-slate-200 dark:border-gray-700 flex justify-between items-center">
            {currentKey ? (
              <button type="button" onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600/10 text-red-600 dark:text-red-400 rounded-full font-semibold hover:bg-red-600/20 transition-colors">Delete Key</button>
            ) : <div />}
            <button type="submit" className="px-6 py-2.5 bg-brand-pink text-white rounded-full font-semibold hover:opacity-90 transition-opacity">
              {currentKey ? 'Update Key' : 'Save and Start Chatting'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
