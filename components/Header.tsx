
import React from 'react';
import { SUGGESTIONS } from '../constants';
import SuggestionCard from './SuggestionCard';

interface HeaderProps {
  onSuggestionClick: (text: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSuggestionClick }) => (
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

export default Header;
