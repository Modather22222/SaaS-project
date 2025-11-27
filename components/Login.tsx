
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-6 shadow-xl shadow-blue-900/20">
            <span className="text-3xl font-bold text-white">B</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Welcome to Builder.ai</h1>
          <p className="text-zinc-400 text-lg">Your AI-powered development studio.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1.5">
                What should we call you?
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Enter your name"
                autoFocus
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
              <SparklesIcon className="w-3 h-3 text-yellow-500" />
              <span>Powered by Gemini 3.0 Pro</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
