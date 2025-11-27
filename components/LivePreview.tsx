/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useRef } from 'react';
import { ArrowDownTrayIcon, ArrowLeftIcon, ViewColumnsIcon, CodeBracketIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, ShareIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import { Creation } from './CreationHistory';

interface WorkspaceProps {
  creation: Creation | null;
  isLoading: boolean;
  onClose: () => void;
  onUpdate: (id: string, newHtml: string) => Promise<void>;
  isReadOnly?: boolean;
  onShare?: () => void;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const LoadingStep = ({ text, active, completed }: { text: string, active: boolean, completed: boolean }) => (
    <div className={`flex items-center space-x-3 transition-all duration-500 ${active || completed ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}>
        <div className={`w-4 h-4 flex items-center justify-center ${completed ? 'text-green-400' : active ? 'text-blue-400' : 'text-zinc-700'}`}>
            {completed ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : active ? (
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            ) : (
                <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
            )}
        </div>
        <span className={`font-mono text-xs tracking-wide uppercase ${active ? 'text-zinc-200' : completed ? 'text-zinc-400 line-through' : 'text-zinc-600'}`}>{text}</span>
    </div>
);

const PdfRenderer = ({ dataUrl }: { dataUrl: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderPdf = async () => {
      if (!window.pdfjsLib) {
        setError("PDF library not initialized");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const loadingTask = window.pdfjsLib.getDocument(dataUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 2.0 });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error("Error rendering PDF:", err);
        setError("Could not render PDF preview.");
        setLoading(false);
      }
    };

    renderPdf();
  }, [dataUrl]);

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-6 text-center">
            <p className="text-sm mb-2 text-red-400/80">{error}</p>
        </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        )}
        <canvas 
            ref={canvasRef} 
            className={`max-w-full max-h-full object-contain shadow-xl border border-zinc-800/50 rounded transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
        />
    </div>
  );
};

export const Workspace: React.FC<WorkspaceProps> = ({ creation, isLoading, onClose, onUpdate, isReadOnly = false, onShare }) => {
    const [loadingStep, setLoadingStep] = useState(0);
    const [showSplitView, setShowSplitView] = useState(false);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [localHtml, setLocalHtml] = useState(creation?.html || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (creation?.html) setLocalHtml(creation.html);
    }, [creation?.html]);

    // Handle loading animation steps
    useEffect(() => {
        if (isLoading) {
            setLoadingStep(0);
            const interval = setInterval(() => {
                setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
            }, 2000); 
            return () => clearInterval(interval);
        } else {
            setLoadingStep(0);
        }
    }, [isLoading]);

    // Default to Split View when a new creation with an image is loaded
    useEffect(() => {
        if (creation?.originalImage) {
            setShowSplitView(true);
        } else {
            setShowSplitView(false);
        }
    }, [creation]);

    const handleExport = () => {
        if (!creation) return;
        const dataStr = JSON.stringify(creation, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${creation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_artifact.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSaveCode = async () => {
        if (!creation || !localHtml) return;
        setIsSaving(true);
        await onUpdate(creation.id, localHtml);
        setIsSaving(false);
        setActiveTab('preview');
    };

  return (
    <div className="relative flex flex-col h-full bg-[#0E0E10] overflow-hidden">
      {/* Workspace Toolbar */}
      <div className="h-14 bg-[#121214] border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center space-x-4">
             <button 
                onClick={onClose}
                className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                title="Back to Dashboard"
             >
                <ArrowLeftIcon className="w-4 h-4" />
             </button>
             
             <div className="h-4 w-px bg-zinc-700"></div>

             <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-200">
                    {isLoading ? 'Generating Artifact...' : creation ? creation.name : 'Untitled Project'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                    {isReadOnly ? 'Read Only' : isLoading ? 'AI Processing' : 'Editing Allowed'}
                </span>
             </div>
        </div>

        {/* Center: View Controls */}
        <div className="hidden md:flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
             <button 
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
                Preview
             </button>
             <button 
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'code' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
                Code
             </button>
        </div>

        <div className="flex items-center space-x-2">
            {!isLoading && creation && (
                <>
                    {/* View Toggle Icons (Only in preview) */}
                    {activeTab === 'preview' && (
                        <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 mr-2">
                            <button 
                                onClick={() => setViewMode('desktop')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                title="Desktop View"
                            >
                                <ComputerDesktopIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('mobile')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                title="Mobile View"
                            >
                                <DevicePhoneMobileIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Split View Toggle */}
                    {creation.originalImage && activeTab === 'preview' && (
                         <button 
                            onClick={() => setShowSplitView(!showSplitView)}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${showSplitView ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'}`}
                        >
                            <ViewColumnsIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Split View</span>
                        </button>
                    )}
                    
                    {/* Share Button */}
                    {!isReadOnly && onShare && (
                        <button
                            onClick={onShare}
                            className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:bg-zinc-800 border border-zinc-700/50 transition-colors"
                        >
                            <ShareIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Share</span>
                        </button>
                    )}

                    {/* Export Button */}
                    <button 
                        onClick={handleExport}
                        className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:bg-zinc-800 border border-zinc-700/50 transition-colors"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </>
            )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden bg-[#09090b]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 w-full bg-grid-zinc-900/[0.2]">
             {/* Technical Loading State */}
             <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 mb-6 relative">
                        <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin-reverse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <CodeBracketIcon className="w-6 h-6 text-zinc-500" />
                        </div>
                    </div>
                    <h3 className="text-white font-mono text-xl tracking-tight">Constructing Environment</h3>
                    <p className="text-zinc-500 text-sm mt-2">Interpreting visual data...</p>
                </div>

                 {/* Terminal Steps */}
                 <div className="border border-zinc-800 bg-black/80 backdrop-blur rounded-lg p-6 space-y-4 font-mono text-sm shadow-2xl">
                     <LoadingStep text="Analyzing visual inputs" active={loadingStep === 0} completed={loadingStep > 0} />
                     <LoadingStep text="Identifying UI patterns" active={loadingStep === 1} completed={loadingStep > 1} />
                     <LoadingStep text="Generating functional logic" active={loadingStep === 2} completed={loadingStep > 2} />
                     <LoadingStep text="Compiling preview" active={loadingStep === 3} completed={loadingStep > 3} />
                 </div>
             </div>
          </div>
        ) : creation ? (
          <div className="flex w-full h-full">
            {/* Split View: Left Panel (Original Image) */}
            {showSplitView && creation.originalImage && activeTab === 'preview' && (
                <div className="w-full md:w-1/2 h-full border-r border-zinc-800 bg-[#0c0c0e] relative flex flex-col shrink-0">
                    <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur text-zinc-400 text-[10px] font-mono uppercase px-2 py-1 rounded border border-zinc-800">
                        Reference Input
                    </div>
                    <div className="w-full h-full p-8 flex items-center justify-center overflow-auto">
                        {creation.originalImage.startsWith('data:application/pdf') ? (
                            <PdfRenderer dataUrl={creation.originalImage} />
                        ) : (
                            <img 
                                src={creation.originalImage} 
                                alt="Original Input" 
                                className="max-w-full max-h-full object-contain shadow-2xl border border-zinc-800/50 rounded-lg"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Content Panel (Preview or Code) */}
            <div className={`relative h-full bg-[#18181b] flex items-center justify-center transition-all duration-500 ${showSplitView && creation.originalImage && activeTab === 'preview' ? 'w-full md:w-1/2' : 'w-full'}`}>
                 
                 {activeTab === 'preview' ? (
                     (!creation.html || creation.html.trim().length < 50) ? (
                         <div className="flex flex-col items-center justify-center text-center p-8 max-w-md">
                             <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                 <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                             </div>
                             <h3 className="text-white font-medium mb-2">Preview Unavailable</h3>
                             <p className="text-zinc-500 text-sm mb-4">The generated code is empty or invalid. This usually happens if the AI request was blocked or failed midway.</p>
                             <button onClick={() => setActiveTab('code')} className="text-blue-400 hover:text-blue-300 text-sm">Check Code Editor</button>
                         </div>
                     ) : (
                        <div className={`transition-all duration-500 ease-in-out bg-white shadow-2xl overflow-hidden ${viewMode === 'mobile' ? 'w-[375px] h-[812px] rounded-[3rem] border-8 border-zinc-900' : 'w-full h-full rounded-none'}`}>
                            <iframe
                                title="Gemini Generated App"
                                srcDoc={creation.html}
                                className="w-full h-full bg-white"
                                sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                            />
                        </div>
                     )
                 ) : (
                     <div className="w-full h-full flex flex-col bg-[#0d0d0d]">
                        <div className="flex-1 relative overflow-hidden">
                            <textarea
                                value={localHtml}
                                onChange={(e) => setLocalHtml(e.target.value)}
                                className="w-full h-full bg-[#0d0d0d] text-zinc-300 font-mono text-sm p-6 resize-none focus:outline-none leading-relaxed"
                                spellCheck="false"
                            />
                        </div>
                        {!isReadOnly && (
                            <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-3">
                                <button
                                    onClick={() => setLocalHtml(creation.html)} // Reset
                                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                                >
                                    Revert
                                </button>
                                <button
                                    onClick={handleSaveCode}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md shadow-lg shadow-blue-900/20 flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <PlayIcon className="w-4 h-4" />
                                            Save & Run
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                     </div>
                 )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};