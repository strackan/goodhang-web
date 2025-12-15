'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  variant?: 'paper' | 'postcard' | 'index-card';
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  variant = 'paper',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantClasses = {
    paper: 'rt-paper-note',
    postcard: 'rt-postcard',
    'index-card': 'rt-index-card',
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className={`${variantClasses[variant]} relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg p-6 pt-8`}
        style={{ marginTop: variant === 'paper' ? '8px' : '0' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-12 h-12 flex items-center justify-center text-[var(--rt-cork-dark)] hover:text-[var(--rt-rust)] hover:bg-[var(--rt-cork)]/20 transition-colors text-3xl font-bold rounded-full"
          aria-label="Close"
        >
          ×
        </button>

        {/* Title */}
        {title && (
          <h2 className="rt-heading-elegant text-2xl font-bold text-[var(--rt-navy)] mb-4 pr-8">
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>
  );
}
