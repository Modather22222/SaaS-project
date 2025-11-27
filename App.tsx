/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { InputArea } from './components/InputArea';
import { Workspace } from './components/LivePreview';
import { Creation } from './components/CreationHistory';
import { bringToLife } from './services/gemini';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { Templates } from './components/Templates';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ArrowUpTrayIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { api, getUserId, setUserId } from './services/supabase';

type ViewMode = 'dashboard' | 'create' | 'workspace' | 'templates';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // App State
  const [activeCreation, setActiveCreation] = useState<Creation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [history, setHistory] = useState<Creation[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Shared View State
  const [isSharedView, setIsSharedView] = useState(false);

  const importInputRef = useRef<HTMLInputElement>(null);

  // Check Auth & URL Params on Mount
  useEffect(() => {
    const init = async () => {
      // 1. Check for Share URL
      const params = new URLSearchParams(window.location.search);
      const shareId = params.get('share');

      if (shareId) {
        setIsSharedView(true);
        setIsGenerating(true);
        setCurrentView('workspace');
        try {
            const project = await api.getPublicProject(shareId);
            if (project) {
                setActiveCreation({
                    id: project.id,
                    name: project.name,
                    html: project.html,
                    originalImage: project.original_image,
                    timestamp: new Date(project.created_at)
                });
                showToast('success', 'Project loaded from shared link');
            } else {
                showToast('error', 'Shared project not found or invalid');
                setIsSharedView(false);
                setCurrentView('dashboard');
            }
        } catch (e) {
            showToast('error', 'Failed to load shared project');
            setCurrentView('dashboard');
        } finally {
            setIsGenerating(false);
            setIsAuthChecking(false);
        }
        return;
      }

      // 2. Check Auth
      const userId = getUserId();
      if (userId) {
        setIsAuthenticated(true);
        loadHistory();
      } else {
        setIsAuthenticated(false);
      }
      setIsAuthChecking(false);
    };

    init();
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadHistory = async () => {
      try {
        setIsLoadingHistory(true);
        setHistoryError(null);
        const projects = await api.getProjects();
        const mappedHistory: Creation[] = projects.map(p => ({
            id: p.id,
            name: p.name,
            html: p.html,
            originalImage: p.original_image,
            timestamp: new Date(p.created_at)
        }));
        setHistory(mappedHistory);
      } catch (e: any) {
        console.error("Failed to load history", e);
        setHistoryError(e.message || 'Failed to load projects');
        showToast('error', 'Could not sync with database');
      } finally {
        setIsLoadingHistory(false);
      }
  };

  const handleLogin = (name: string) => {
    try {
        setUserId(name);
        setIsAuthenticated(true);
        loadHistory();
        showToast('success', `Welcome back, ${name}!`);
    } catch (e: any) {
        console.error("Login storage error", e);
        showToast('error', e.message || 'Failed to save session');
    }
  };

  const handleLogout = () => {
    try {
        localStorage.removeItem('gemini_saas_user_id');
        localStorage.removeItem('gemini_saas_user_name');
        setIsAuthenticated(false);
        setHistory([]);
    } catch (e) {
        console.error("Logout error", e);
    }
  };

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file. Please try a different image.'));
        }
      };
      reader.onerror = (error) => reject(new Error('Error reading file.'));
    });
  };

  const handleGenerate = async (promptText: string, file?: File) => {
    setIsGenerating(true);
    setActiveCreation(null);
    setCurrentView('workspace');

    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;
      let fullOriginalImage: string | undefined;

      if (file) {
        try {
            imageBase64 = await fileToBase64(file);
            mimeType = file.type.toLowerCase();
            fullOriginalImage = `data:${mimeType};base64,${imageBase64}`;
        } catch (fileErr: any) {
            throw new Error(fileErr.message || "File upload failed");
        }
      }

      const html = await bringToLife(promptText, imageBase64, mimeType);
      
      if (html) {
        const tempId = crypto.randomUUID();
        const newCreation: Creation = {
          id: tempId,
          name: file ? file.name : (promptText ? promptText.slice(0, 30) : 'New Creation'),
          html: html,
          originalImage: fullOriginalImage,
          timestamp: new Date(),
        };
        setActiveCreation(newCreation);
        
        const savedProject = await api.createProject({
            name: newCreation.name,
            html: newCreation.html,
            original_image: fullOriginalImage
        });

        if (savedProject) {
            const confirmedCreation: Creation = {
                id: savedProject.id,
                name: savedProject.name,
                html: savedProject.html,
                originalImage: savedProject.original_image,
                timestamp: new Date(savedProject.created_at)
            };
            setActiveCreation(confirmedCreation);
            setHistory(prev => [confirmedCreation, ...prev]);
            showToast('success', 'Project generated successfully!');
        } else {
            showToast('info', 'Project generated, but saving failed.');
        }
      }

    } catch (error: any) {
      console.error("Failed to generate:", error);
      showToast('error', error.message || 'Failed to generate project. Please try again.');
      setCurrentView('create');
    } finally {
      setIsGenerating(false);
      setInitialPrompt("");
    }
  };

  const handleUpdateCode = async (id: string, newHtml: string) => {
     try {
        await api.updateProject(id, { html: newHtml });
        // Update local state
        setHistory(prev => prev.map(p => p.id === id ? { ...p, html: newHtml } : p));
        if (activeCreation && activeCreation.id === id) {
            setActiveCreation({ ...activeCreation, html: newHtml });
        }
        showToast('success', 'Changes saved successfully');
     } catch (e: any) {
        console.error("Failed to save code", e);
        showToast('error', e.message || 'Failed to save changes');
     }
  };

  const handleShare = async () => {
      if (!activeCreation) return;
      const url = `${window.location.origin}${window.location.pathname}?share=${activeCreation.id}`;
      try {
        await navigator.clipboard.writeText(url);
        showToast('info', 'Public link copied to clipboard!');
      } catch (err) {
        console.error("Clipboard error", err);
        showToast('error', 'Could not copy link. Copy it manually from the browser bar.');
      }
  };

  const handleSelectCreation = (creation: Creation) => {
    setActiveCreation(creation);
    setCurrentView('workspace');
    setIsSidebarOpen(false); 
  };

  const handleDeleteCreation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    const previousHistory = history;
    setHistory(prev => prev.filter(item => item.id !== id));

    try {
        await api.deleteProject(id);
        if (activeCreation?.id === id) {
            setActiveCreation(null);
            setCurrentView('dashboard');
        }
        showToast('success', 'Project deleted');
    } catch (err: any) {
        console.error("Failed to delete project", err);
        setHistory(previousHistory);
        showToast('error', err.message || 'Failed to delete project');
    }
  };

  const handleRenameCreation = async (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt("Rename project:", currentName);
    if (!newName || newName === currentName) return;

    // Optimistic update
    setHistory(prev => prev.map(item => item.id === id ? { ...item, name: newName } : item));

    try {
        await api.updateProject(id, { name: newName });
        showToast('success', 'Project renamed');
    } catch (err: any) {
        console.error("Failed to rename project", err);
        // Revert on fail
        setHistory(prev => prev.map(item => item.id === id ? { ...item, name: currentName } : item));
        showToast('error', err.message || 'Failed to rename project');
    }
  };

  const handleDuplicateCreation = async (creation: Creation, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = `${creation.name} (Copy)`;
    
    try {
        const savedProject = await api.createProject({
            name: newName,
            html: creation.html,
            original_image: creation.originalImage
        });

        if (savedProject) {
            const duplicatedCreation: Creation = {
                id: savedProject.id,
                name: savedProject.name,
                html: savedProject.html,
                originalImage: savedProject.original_image,
                timestamp: new Date(savedProject.created_at)
            };
            setHistory(prev => [duplicatedCreation, ...prev]);
            showToast('success', 'Project duplicated');
        }
    } catch (err: any) {
        console.error("Failed to duplicate", err);
        showToast('error', err.message || 'Failed to duplicate project');
    }
  };

  const handleBackToDashboard = () => {
    if (isSharedView) {
        // If viewing a shared link, reload to go back to main app (reset url)
        window.location.href = window.location.pathname;
    } else {
        setCurrentView('dashboard');
        setActiveCreation(null);
    }
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const json = event.target?.result as string;
            const parsed = JSON.parse(json);
            
            if (parsed.html && parsed.name) {
                const savedProject = await api.createProject({
                    name: parsed.name,
                    html: parsed.html,
                    original_image: parsed.originalImage || parsed.original_image
                });

                if (savedProject) {
                    const importedCreation: Creation = {
                        id: savedProject.id,
                        name: savedProject.name,
                        html: savedProject.html,
                        originalImage: savedProject.original_image,
                        timestamp: new Date(savedProject.created_at)
                    };
                    
                    setHistory(prev => [importedCreation, ...prev]);
                    setActiveCreation(importedCreation);
                    setCurrentView('workspace');
                    showToast('success', 'Project imported successfully');
                }
            } else {
                showToast('error', 'Invalid creation file format');
            }
        } catch (err) {
            console.error("Import error", err);
            showToast('error', 'Failed to import creation. File may be corrupt.');
        }
        if (importInputRef.current) importInputRef.current.value = '';
    };
    reader.onerror = () => showToast('error', 'Failed to read file');
    reader.readAsText(file);
  };

  const handleNewProject = (prompt?: string) => {
    if (prompt) setInitialPrompt(prompt);
    setCurrentView('create');
  };

  if (isAuthChecking) {
      return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading...</div>;
  }

  // Not Authenticated and not viewing shared link -> Show Login
  if (!isAuthenticated && !isSharedView) {
      return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <Login onLogin={handleLogin} />
        </>
      );
  }

  return (
    <div className="flex h-[100dvh] bg-zinc-950 text-zinc-50 overflow-hidden font-sans relative">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && !isSharedView && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Hidden in Shared View) */}
      {!isSharedView && (
        <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Sidebar 
                currentView={currentView === 'workspace' ? 'dashboard' : currentView as any} 
                onChangeView={(view) => {
                    setCurrentView(view);
                    setIsSidebarOpen(false);
                }} 
                onLogout={handleLogout}
            />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden bg-zinc-950">
        
        {/* Mobile Header */}
        {!isSharedView && (
            <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur shrink-0 z-30">
                <div className="flex items-center gap-2 font-bold text-white">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs">B</div>
                    <span>Builder.ai</span>
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-zinc-400 hover:text-white"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
            </div>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && !isSharedView && (
             <Dashboard 
                history={history} 
                isLoading={isLoadingHistory}
                error={historyError}
                onRetry={loadHistory}
                onSelect={handleSelectCreation}
                onDelete={handleDeleteCreation}
                onRename={handleRenameCreation}
                onDuplicate={handleDuplicateCreation}
                onNew={handleNewProject} 
             />
        )}

        {/* Create View */}
        {currentView === 'create' && !isSharedView && (
            <div className="flex-1 overflow-y-auto bg-dot-grid relative">
                 <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center justify-center min-h-full">
                    <div className="w-full mb-8 md:mb-12">
                        <Hero />
                    </div>
                    <div className="w-full flex justify-center mb-8 relative z-20">
                        <InputArea 
                            onGenerate={handleGenerate} 
                            onError={(msg) => showToast('error', msg)}
                            isGenerating={isGenerating} 
                            initialPrompt={initialPrompt}
                        />
                    </div>
                 </div>
            </div>
        )}

        {/* Templates View */}
        {currentView === 'templates' && !isSharedView && (
            <Templates onUseTemplate={handleNewProject} />
        )}

        {/* Workspace View */}
        {currentView === 'workspace' && (
             <Workspace 
                creation={activeCreation} 
                isLoading={isGenerating} 
                onClose={handleBackToDashboard} 
                onUpdate={handleUpdateCode}
                isReadOnly={isSharedView}
                onShare={!isSharedView ? handleShare : undefined}
             />
        )}

        {/* Import FAB (only on Dashboard or Create) */}
        {currentView !== 'workspace' && !isSharedView && (
            <div className="absolute bottom-8 right-8 z-30">
                <button 
                    onClick={handleImportClick}
                    className="flex items-center justify-center w-12 h-12 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full shadow-lg transition-all border border-zinc-700"
                    title="Import Artifact"
                >
                    <ArrowUpTrayIcon className="w-5 h-5" />
                </button>
                <input 
                    type="file" 
                    ref={importInputRef} 
                    onChange={handleImportFile} 
                    accept=".json" 
                    className="hidden" 
                />
            </div>
        )}

      </main>
    </div>
  );
};

export default App;