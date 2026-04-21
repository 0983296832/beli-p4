'use client';

import type React from 'react';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@lib/utils';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  className?: string;
  headerClassName?: string;
}

export function CustomModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className,
  headerClassName
}: CustomModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/50 backdrop-blur-sm
        animate-in fade-in duration-200
        ${isOpen ? 'animate-in' : 'animate-out fade-out duration-150'}
      `}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={cn(
          `
          relative w-full ${sizeClasses[size]} 
          bg-background border border-border rounded-lg shadow-2xl
          animate-in zoom-in-95 slide-in-from-bottom-2 duration-200
          ${isOpen ? 'animate-in' : 'animate-out zoom-out-95 slide-out-to-bottom-2 duration-150'}
        `,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={cn('flex items-center justify-between p-6 pb-4', headerClassName)}>
            {title && <h2 className='text-lg font-semibold'>{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className='
                  ml-auto p-1 rounded-md 
                  hover:text-foreground hover:bg-accent
                  transition-colors duration-150
                  focus:outline-none focus:ring-2 focus:ring-ring
                '
                aria-label='Đóng modal'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`px-6 ${title || showCloseButton ? 'pb-6' : 'py-6'}`}>{children}</div>
      </div>
    </div>
  );

  // Render modal using portal
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

// Hook để quản lý trạng thái modal dễ dàng hơn
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const toggleModal = () => setIsOpen(!isOpen);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
}
