
// Import dependencies from an ES module CDN. Babel will handle this.
import { GoogleGenAI } from 'https://esm.sh/@google/genai@0.14.2';
import ReactMarkdown from 'https://esm.sh/react-markdown@9.0.1';
import remarkGfm from 'https://esm.sh/remark-gfm@4.0.0';
import { Bot, User, Store, Globe, Lightbulb, TrendingUp, X, CloudUpload, FileText, Trash2, KeyRound, Send, Paperclip, Sun, Moon, Copy, Check } from 'https://esm.sh/lucide-react@0.417.0';

// Global variables from <script> tags
const { useState, useEffect, useRef, useCallback } = React;
const { createRoot } = ReactDOM;

// === From types.ts ===
const MessageSender = {
  USER: 'user',
  BOT: 'bot',
};

// === From constants.tsx ===
const SUGGESTIONS = [
  { text: "Outline a digital marketing strategy for a new e-commerce store.", icon: "store" },
  { text: "What are the key elements of a successful SaaS landing page?", icon: "web" },
  { text: "Generate 5 blog post ideas for a content marketing agency.", icon: "lightbulb_outline" },
  { text: "Explain SEO best practices for a small business website in 2024.", icon: "trending_up" },
];
const MASTER_PROMPT = `You are an expert online business development assistant named Mega-Bot.
Your goal is to provide actionable advice, strategies, and insights for entrepreneurs and businesses looking to grow online.
Your responses should be practical, clear, and well-structured using markdown.`;

// === From services/geminiService.ts ===
function createChatInstance(apiKey) {
    const ai = new GoogleGenAI({ apiKey });
    return ai.chats.create({
        model: 'gemini-2.5-flash-preview-04-17',
        config: {
            systemInstruction: MASTER_PROMPT,
        },
    });
}
async function* streamChatResponse(chatInstance, newMessage, fileContext) {
    const fullMessage = fileContext ? `${fileContext}\n\n---\n\n${newMessage}` : newMessage;
    const responseStream = await chatInstance.sendMessageStream({ message: fullMessage });
    for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
            yield text;
        }
    }
}

// === Component Definitions ===

const BotIcon = () => (
  <Bot className="w-6 h-6 text-brand-pink" />
);

const UserIcon = () => (
  <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
);

const LoadingIndicator = () => (
  <div className="flex flex-col gap-2 w-full">
    <div className="loading-bar-anim h-3 rounded-sm w-full"></div>
    <div className="loading-bar-anim h-3 rounded-sm w-4/5"></div>
    <div className="loading-bar-anim h-3 rounded-sm w-3/5"></div>
  </div>
);

const IconButton = ({ onClick, icon: Icon, label, disabled = false, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    disabled={disabled}
    className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    <Icon size={24} />
  </button>
);

const SuggestionCard = ({ text, icon, onClick }) => {
  const iconMap = {
    store: Store,
    web: Globe,
    lightbulb_outline: Lightbulb,
    trending_up: TrendingUp,
  };
  const IconComponent = iconMap[icon] || Lightbulb;
  
  return (
    <div onClick={onClick} className="group cursor-pointer p-5 flex-shrink-0 w-56 h-56 flex flex-col justify-between rounded-2xl bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors duration-200">
      <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">{text}</h4>
      <div className="self-end w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-gray-900 group-hover:bg-brand-pink transition-all duration-300">
        <IconComponent className="text-2xl text-gray-600 dark:text-gray-300 group-hover:text-white transition-colors duration-300" size={24} />
      </div>
    </div>
  );
};

const Header = ({ onSuggestionClick }) => (
  <header className={'flex-1 overflow-y-auto px-4 pt-16 pb-8 sm:pt-24 lg:pt-28'}>
    <div className="max-w-4xl mx-auto">
      <div>
        <h1 className="text-5xl sm:text-6xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-brand-pink to-purple-500">Hello, there</h1>
        <p className="text-4xl sm:text-5xl font-medium text-gray-400 dark:text-gray-500 mt-2">How can I help you today?</p>
      </div>
      <div className="mt-16 sm:mt-24">
        <div className="flex gap-5 pb-4 -mx-4 px-4 overflow-x-auto">
          {SUGGESTIONS.map((s, i) => (
            <SuggestionCard 
              key={i} 
              text={s.text} 
              icon={s.icon} 
              onClick={() => onSuggestionClick(s.text)} 
            />
          ))}
        </div>
      </div>
    </div>
  </header>
);

const ChatMessage = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isBot = message.sender === MessageSender.BOT;
  const isLoading = isBot && message.text === '' && !message.isError;

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

const ChatView = ({ messages }) => {
  const chatEndRef = useRef(null);
  
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

const FileUploadModal = ({ uploadedFiles, setUploadedFiles, onClose }) => {
  const [error, setError] = useState(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleFileChange = useCallback((e) => {
    const files = e.target.files;
    if (!files) return;
    setError(null);
    
    const validFiles = Array.from(files).filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" is too large (max 5MB).`);
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if(event.target?.result && typeof event.target.result === 'string') {
          setUploadedFiles(prev => [...prev.filter(f => f.name !== file.name), { 
            name: file.name, 
            content: event.target.result
          }]);
        }
      };
      reader.onerror = () => setError(`Error reading file "${file.name}".`);
      reader.readAsText(file);
    });
    e.target.value = '';
  }, [setUploadedFiles]);
  
  const removeFile = (fileName) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-5 border-b border-slate-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Upload Files for Context</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700">
            <X size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </header>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <CloudUpload size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
            <p className="mt-2 text-gray-600 dark:text-gray-300">Drag & drop files here, or click to select</p>
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept=".txt,.md,.json,.csv,.html,.js,.ts" 
            />
          </div>
          {error && <p className="mt-4 text-center text-red-500">{error}</p>}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Uploaded Files ({uploadedFiles.length})</h3>
            {uploadedFiles.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {uploadedFiles.map(file => (
                  <li key={file.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="text-gray-500 flex-shrink-0" />
                      <span className="truncate text-sm text-gray-700 dark:text-gray-200">{file.name}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(file.name); }} 
                      className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No files uploaded yet.</p>
            )}
          </div>
        </div>
        <footer className="p-5 border-t border-slate-200 dark:border-gray-700 text-right">
          <button onClick={onClose} className="px-6 py-2.5 bg-brand-pink text-white rounded-full font-semibold hover:opacity-90 transition-opacity">Done</button>
        </footer>
      </div>
    </div>
  );
};

const ApiKeyModal = ({ onSave, onDelete, onClose, currentKey }) => {
  const [key, setKey] = useState(currentKey || '');
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
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
            <X size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-6">Your Gemini API key is stored in your browser's local storage and is never sent to our servers.</p>
            <input 
              type="password" 
              value={key} 
              onChange={e => { setKey(e.target.value); setError(''); }} 
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

const TypingArea = ({ 
  onSendMessage, isLoading, theme, toggleTheme, onDeleteChat, onOpenUploadModal,
  onOpenApiKeyModal, isApiConfigured, uploadedFilesCount
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
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
              <Paperclip size={16} />
              <span>{uploadedFilesCount} file{uploadedFilesCount > 1 ? 's' : ''} in context</span>
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
           <IconButton 
            onClick={onOpenApiKeyModal} 
            icon={KeyRound} 
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
              <Send size={24} />
            </button>
          </form>
          <div className="hidden sm:flex items-center gap-3">
            <IconButton onClick={onOpenUploadModal} icon={Paperclip} label="Upload Files" disabled={isLoading || !isApiConfigured} />
            <IconButton onClick={toggleTheme} icon={theme === 'dark' ? Sun : Moon} label="Toggle Theme" />
            <IconButton onClick={onDeleteChat} icon={Trash2} label="Delete Chat" disabled={isLoading || !isApiConfigured} />
          </div>
           <div className="sm:hidden flex">
            <IconButton onClick={onOpenApiKeyModal} icon={KeyRound} label="Manage API Key" />
          </div>
        </div>
        <p className="hidden sm:block text-center text-xs text-gray-400 dark:text-gray-500 mt-3 px-4">
          Mega-Bot may display inaccurate info. Always double-check its responses.
        </p>
      </div>
    </div>
  );
};

// === Main App Component ===
const App = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("mega-bot-theme");
    return savedTheme || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileModalOpen, setFileModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mega-bot-api-key'));
  const [showApiKeyModal, setShowApiKeyModal] = useState(!apiKey);
  const [chat, setChat] = useState(null);

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

  const handleSaveApiKey = useCallback((key) => {
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

  const handleSendMessage = useCallback(async (inputText) => {
    if (!inputText.trim() || isLoading || !apiKey || !chat) return;

    setIsLoading(true);
    const userMessage = { id: Date.now(), sender: MessageSender.USER, text: inputText };
    const botMessageId = Date.now() + 1;
    const botMessage = { id: botMessageId, sender: MessageSender.BOT, text: '', isError: false };
    
    setMessages(prev => [...prev, userMessage, botMessage]);
    
    try {
      const fileContext = uploadedFiles.map(f => `File: ${f.name}\nContent:\n${f.content}`).join('\n\n');
      const stream = streamChatResponse(chat, inputText, fileContext);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
        ));
      }
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { ...msg, text: `Error: ${errorMessage}. If this persists, please check your API key.`, isError: true } : msg
      ));
      if (errorMessage.toLowerCase().includes('api key not valid')) {
        handleDeleteApiKey();
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, apiKey, chat, uploadedFiles, handleDeleteApiKey]);

  const handleDeleteChat = useCallback(() => {
    if (messages.length > 0 && window.confirm("Are you sure? This will start a new conversation.")) {
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
      {messages.length > 0 ? (
        <ChatView messages={messages} />
      ) : isApiConfigured ? (
         <Header onSuggestionClick={handleSendMessage} />
      ) : (
         <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
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

// === Render the App ===
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
