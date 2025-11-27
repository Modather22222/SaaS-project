
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast: React.FC<ToastMessage & { onRemove: () => void }> = ({ type, message, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircleIcon className="w-5 h-5 text-green-400" />,
    error: <XCircleIcon className="w-5 h-5 text-red-400" />,
    info: <InformationCircleIcon className="w-5 h-5 text-blue-400" />,
  };

  const bgColors = {
    success: 'bg-zinc-900 border-green-500/20',
    error: 'bg-zinc-900 border-red-500/20',
    info: 'bg-zinc-900 border-blue-500/20',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl ${bgColors[type]} text-white animate-in slide-in-from-right-full duration-300`}>
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};
