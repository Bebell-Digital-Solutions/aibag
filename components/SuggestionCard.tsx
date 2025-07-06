
import React from 'react';

interface SuggestionCardProps {
  text: string;
  icon: string;
  onClick: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ text, icon, onClick }) => (
  <div onClick={onClick} className="group cursor-pointer p-5 flex-shrink-0 w-56 h-56 flex flex-col justify-between rounded-2xl bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors duration-200">
    <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">{text}</h4>
    <div className="self-end w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-gray-900 group-hover:bg-brand-pink transition-all duration-300">
      <span className="material-symbols-rounded text-2xl text-gray-600 dark:text-gray-300 group-hover:text-white transition-colors duration-300">{icon}</span>
    </div>
  </div>
);

export default SuggestionCard;
