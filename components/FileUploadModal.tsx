
import React, { useState, useCallback } from 'react';
import { UploadedFile } from '../types';

interface FileUploadModalProps {
  uploadedFiles: UploadedFile[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  onClose: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ uploadedFiles, setUploadedFiles, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
            content: event.target.result as string
          }]);
        }
      };
      reader.onerror = () => setError(`Error reading file "${file.name}".`);
      reader.readAsText(file);
    });
  }, [setUploadedFiles]);
  
  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-5 border-b border-slate-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Upload Files for Context</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700">
            <span className="material-symbols-rounded text-gray-600 dark:text-gray-300">close</span>
          </button>
        </header>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <span className="material-symbols-rounded text-5xl text-gray-400 dark:text-gray-500">cloud_upload</span>
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
                      <span className="material-symbols-rounded text-gray-500">description</span>
                      <span className="truncate text-sm text-gray-700 dark:text-gray-200">{file.name}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.name);
                      }} 
                      className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500"
                    >
                      <span className="material-symbols-rounded text-lg">delete</span>
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
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 bg-brand-pink text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
};

export default FileUploadModal;
