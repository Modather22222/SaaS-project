/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { Creation } from './CreationHistory';
import { PlusIcon, ClockIcon, DocumentIcon, SparklesIcon, TrashIcon, PencilSquareIcon, DocumentDuplicateIcon, LightBulbIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { generateAppIdeas } from '../services/gemini';

interface DashboardProps {
    history: Creation[];
    isLoading: boolean;
    error?: string | null;
    onRetry?: () => void;
    onSelect: (creation: Creation) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
    onRename: (id: string, currentName: string, e: React.MouseEvent) => void;
    onDuplicate: (creation: Creation, e: React.MouseEvent) => void;
    onNew: (initialPrompt?: string) => void;
}

const ProjectSkeleton = () => (
    <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-full">
        <div className="aspect-[4/3] w-full bg-zinc-800/50 animate-pulse"></div>
        <div className="p-5 flex flex-col flex-1 space-y-3">
            <div className="h-5 bg-zinc-800 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-zinc-800/50 rounded w-1/2 animate-pulse"></div>
            <div className="mt-auto pt-4 border-t border-zinc-800/50 flex justify-between">
                <div className="h-3 bg-zinc-800 rounded w-1/4 animate-pulse"></div>
            </div>
        </div>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ history, isLoading, error, onRetry, onSelect, onDelete, onRename, onDuplicate, onNew }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    useEffect(() => {
        if (!isLoading && !error && history.length === 0 && suggestions.length === 0) {
            setLoadingSuggestions(true);
            generateAppIdeas().then(ideas => {
                setSuggestions(ideas);
                setLoadingSuggestions(false);
            });
        }
    }, [isLoading, error, history.length]);

    return (
        <div className="flex-1 h-full overflow-y-auto bg-zinc-950 p-6 md:p-12 scrollbar-thin scrollbar-thumb-zinc-800">
            <div className="max-w-7xl mx-auto space-y-10 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
                        <p className="text-zinc-400 mt-2">Manage your generated artifacts and monitor usage.</p>
                    </div>
                    <button 
                        onClick={() => onNew()}
                        className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <PlusIcon className="w-4 h-4" />
                        New Project
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DocumentIcon className="w-24 h-24 text-zinc-500" />
                        </div>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Projects</p>
                        <p className="text-4xl font-bold text-white mt-2 tracking-tight">{isLoading ? '-' : history.length}</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <SparklesIcon className="w-24 h-24 text-blue-500" />
                        </div>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Generations</p>
                        <p className="text-4xl font-bold text-white mt-2 tracking-tight">{isLoading ? '-' : history.length * 2}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-900/20 to-zinc-900/50 border border-blue-900/30 p-6 rounded-2xl relative overflow-hidden">
                        <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">Plan Status</p>
                        <p className="text-2xl font-bold text-white mt-2 tracking-tight">Pro Active</p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-blue-300/80">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            System Operational
                        </div>
                    </div>
                </div>

                {/* Recent Projects Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Your Projects</h2>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                             <ProjectSkeleton />
                             <ProjectSkeleton />
                             <ProjectSkeleton />
                             <ProjectSkeleton />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 border border-zinc-800 border-dashed rounded-2xl bg-red-500/5">
                            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-white font-medium mb-2">Unable to load projects</h3>
                            <p className="text-zinc-500 text-sm mb-6">{error}</p>
                            {onRetry && (
                                <button 
                                    onClick={onRetry}
                                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white transition-colors"
                                >
                                    <ArrowPathIcon className="w-4 h-4" />
                                    Retry Connection
                                </button>
                            )}
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center">
                            <div className="w-full text-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 mb-8">
                                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                    <PlusIcon className="w-8 h-8 text-zinc-600" />
                                </div>
                                <h3 className="text-zinc-200 font-medium text-lg">No projects yet</h3>
                                <p className="text-zinc-500 text-sm mt-2 max-w-sm mx-auto mb-6">Start by uploading a sketch, image, or document to bring it to life.</p>
                                <button onClick={() => onNew()} className="text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline underline-offset-4">Create your first project &rarr;</button>
                            </div>
                            
                            {/* AI Suggestions */}
                            {(loadingSuggestions || suggestions.length > 0) && (
                                <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex items-center gap-2 mb-4 text-zinc-500 text-sm font-medium">
                                        <LightBulbIcon className="w-4 h-4" />
                                        <span>Or try one of these ideas</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {loadingSuggestions 
                                            ? [1,2,3].map(i => <div key={i} className="h-24 bg-zinc-900 rounded-lg animate-pulse border border-zinc-800"></div>)
                                            : suggestions.map((idea, idx) => (
                                                <button 
                                                    key={idx}
                                                    onClick={() => onNew(idea)}
                                                    className="p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/30 rounded-lg text-left transition-all hover:-translate-y-1 group"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <SparklesIcon className="w-5 h-5 text-blue-500 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <p className="text-sm text-zinc-300 font-medium">{idea}</p>
                                                </button>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {history.map(item => (
                                <button 
                                    key={item.id} 
                                    onClick={() => onSelect(item)}
                                    className="group flex flex-col bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 text-left h-full"
                                >
                                    <div className="aspect-[4/3] w-full bg-zinc-950 relative overflow-hidden border-b border-zinc-800/50">
                                        {item.originalImage ? (
                                            <div className="w-full h-full relative">
                                                <img src={item.originalImage} alt={item.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80"></div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-900/50 pattern-grid">
                                                <DocumentIcon className="w-10 h-10 text-zinc-700 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        )}
                                        {/* Overlay Tag */}
                                        <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-mono text-zinc-300 border border-white/10">
                                            WEB
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1 w-full">
                                        <div className="flex items-start justify-between w-full mb-1">
                                            <h3 className="text-sm font-bold text-zinc-200 group-hover:text-white truncate tracking-tight flex-1 mr-2">{item.name}</h3>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">Interactive artifact generated by Gemini 3.0.</p>
                                        
                                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-800/50 w-full group/actions">
                                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                                                <ClockIcon className="w-3 h-3" />
                                                <span>{item.timestamp.toLocaleDateString()}</span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover/actions:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                <div 
                                                    onClick={(e) => onRename(item.id, item.name, e)}
                                                    className="p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                                                    title="Rename"
                                                >
                                                    <PencilSquareIcon className="w-3.5 h-3.5" />
                                                </div>
                                                <div 
                                                    onClick={(e) => onDuplicate(item, e)}
                                                    className="p-1.5 text-zinc-500 hover:text-green-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                                                    title="Duplicate"
                                                >
                                                    <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                                                </div>
                                                <div 
                                                    onClick={(e) => onDelete(item.id, e)}
                                                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};