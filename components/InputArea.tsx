/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useState, useEffect } from 'react';
import { ArrowUpTrayIcon, SparklesIcon, CpuChipIcon, PhotoIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface InputAreaProps {
  onGenerate: (prompt: string, file?: File) => void;
  onError: (message: string) => void;
  isGenerating: boolean;
  disabled?: boolean;
  initialPrompt?: string;
}

const CyclingText = () => {
    const words = [
        "a napkin sketch",
        "a chaotic whiteboard",
        "a game level design",
        "a sci-fi interface",
        "a diagram of a machine",
        "an ancient scroll"
    ];
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false); // fade out
            setTimeout(() => {
                setIndex(prev => (prev + 1) % words.length);
                setFade(true); // fade in
            }, 500); // Wait for fade out
        }, 3000); // Slower cycle to read longer text
        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <span className={`inline-block whitespace-nowrap transition-all duration-500 transform ${fade ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-2 blur-sm'} text-white font-medium pb-1 border-b-2 border-blue-500/50`}>
            {words[index]}
        </span>
    );
};

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, onError, isGenerating, disabled = false, initialPrompt = "" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      onError("Invalid file type. Please upload an image (PNG, JPG) or PDF.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled, isGenerating, onError]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!disabled && !isGenerating) {
        setIsDragging(true);
    }
  }, [disabled, isGenerating]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSubmit = () => {
    if (!prompt.trim() && !selectedFile) {
        onError("Please enter a prompt or upload a file to start.");
        return;
    }
    onGenerate(prompt, selectedFile || undefined);
    setPrompt("");
    setSelectedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div 
        className={`relative group transition-all duration-300 ${isDragging ? 'scale-[1.01]' : ''}`}
      >
        <label
          className={`
            relative flex flex-col items-center justify-center
            h-48 sm:h-56 md:h-72
            bg-zinc-900/30 
            backdrop-blur-sm
            rounded-2xl border border-dashed
            cursor-pointer overflow-hidden
            transition-all duration-300
            ${isDragging 
              ? 'border-blue-500 bg-zinc-900/50 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' 
              : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/40'
            }
            ${isGenerating ? 'pointer-events-none opacity-50' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
            {/* Technical Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px'}}>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center p-6 w-full">
                {selectedFile ? (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                         <div className="relative w-24 h-32 mb-4 bg-black rounded-lg border border-zinc-700 shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
                            {selectedFile.type.startsWith('image/') ? (
                                <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full bg-zinc-800 text-zinc-400">PDF</div>
                            )}
                            <button 
                                onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}
                                className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition-colors"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                         </div>
                         <p className="text-sm font-medium text-zinc-200">{selectedFile.name}</p>
                         <p className="text-xs text-zinc-500 mt-1">Ready to analyze</p>
                    </div>
                ) : (
                    <>
                         <div className="w-16 h-16 md:w-20 md:h-20 mb-6 rounded-2xl flex items-center justify-center bg-zinc-800/50 border border-zinc-700 group-hover:scale-105 transition-transform">
                             <ArrowUpTrayIcon className="w-8 h-8 md:w-10 md:h-10 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                         </div>
                         <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                             Bring <CyclingText /> to life
                         </h3>
                         <p className="text-zinc-500 text-sm">Drag & drop or click to upload</p>
                    </>
                )}
            </div>

            <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isGenerating || disabled}
            />
        </label>
      </div>

      {/* Input Row */}
      <div className={`relative flex items-center gap-2 transition-opacity duration-300 ${isGenerating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedFile ? "Describe what this is, or what you want to change..." : "Describe the app you want to build (e.g., 'A pomodoro timer with lofi aesthetic')"}
                className="relative w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-[60px] min-h-[60px]"
            />
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() && !selectedFile}
            className={`
                h-[60px] px-6 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200
                ${(!prompt.trim() && !selectedFile) 
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20'}
            `}
          >
            {isGenerating ? (
                <CpuChipIcon className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    <span>Generate</span>
                    <SparklesIcon className="w-5 h-5 text-blue-600" />
                </>
            )}
          </button>
      </div>
    </div>
  );
};