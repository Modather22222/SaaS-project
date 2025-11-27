
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { HomeIcon, PlusIcon, RectangleStackIcon, CreditCardIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { getUserName } from '../services/supabase';

interface SidebarProps {
  currentView: 'dashboard' | 'create' | 'workspace' | 'templates';
  onChangeView: (view: 'dashboard' | 'create' | 'templates') => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout }) => {
  const userName = getUserName();
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <div className="w-64 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col flex-shrink-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight cursor-pointer" onClick={() => onChangeView('dashboard')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <span className="text-white font-mono text-lg">B</span>
          </div>
          <span>Builder<span className="text-blue-500">.ai</span></span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <button
          onClick={() => onChangeView('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            currentView === 'dashboard' 
              ? 'bg-blue-600/10 text-blue-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] border border-blue-500/20' 
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'
          }`}
        >
          <HomeIcon className="w-5 h-5" />
          <span className="font-medium text-sm">Dashboard</span>
        </button>

        <button
          onClick={() => onChangeView('create')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            currentView === 'create' 
              ? 'bg-blue-600/10 text-blue-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] border border-blue-500/20' 
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'
          }`}
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-medium text-sm">New Project</span>
        </button>

        <button
          onClick={() => onChangeView('templates')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            currentView === 'templates' 
              ? 'bg-blue-600/10 text-blue-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] border border-blue-500/20' 
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'
          }`}
        >
          <RectangleStackIcon className="w-5 h-5" />
          <span className="font-medium text-sm">Templates</span>
        </button>

        <div className="pt-8 pb-2">
          <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Workspace</p>
        </div>

        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors">
          <CreditCardIcon className="w-5 h-5" />
          <span className="font-medium text-sm">Billing</span>
        </button>

        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors">
          <Cog6ToothIcon className="w-5 h-5" />
          <span className="font-medium text-sm">Settings</span>
        </button>
      </nav>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                    {initials}
                </div>
                <div className="flex flex-col overflow-hidden">
                   <span className="text-sm font-semibold text-zinc-200 truncate max-w-[80px]" title={userName}>{userName}</span>
                   <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Pro Plan</span>
                </div>
             </div>
             <button onClick={onLogout} className="text-zinc-500 hover:text-red-400 transition-colors" title="Sign Out">
                 <ArrowRightOnRectangleIcon className="w-5 h-5" />
             </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-end">
                <span className="text-[10px] text-zinc-400 font-medium">Credits</span>
                <span className="text-[10px] text-zinc-300">15 / 20</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 w-3/4 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
