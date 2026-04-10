import React, { createContext, useContext, useState, useCallback } from 'react';
import './DialogProvider.css';

const DialogContext = createContext(null);

export const useDialog = () => {
    const ctx = useContext(DialogContext);
    if (!ctx) throw new Error('useDialog must be used inside <DialogProvider>');
    return ctx;
};

/*
 * type: 'alert' | 'confirm'
 * variant: 'success' | 'error' | 'warning' | 'info'
 */
const ICONS = {
    success: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 12 11 14 15 10" />
        </svg>
    ),
    error: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    warning: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    info: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    delete: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" /><path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    ),
};

const DEFAULT_STATE = {
    open: false,
    type: 'alert',
    variant: 'info',
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    resolve: null,
};

export function DialogProvider({ children }) {
    const [dialog, setDialog] = useState(DEFAULT_STATE);

    const showAlert = useCallback((message, { variant = 'info', title } = {}) => {
        return new Promise((resolve) => {
            setDialog({
                open: true,
                type: 'alert',
                variant,
                title: title || variantTitle(variant),
                message,
                confirmLabel: 'OK',
                cancelLabel: '',
                resolve,
            });
        });
    }, []);

    const showConfirm = useCallback((message, { variant = 'warning', title, confirmLabel = 'Confirm', cancelLabel = 'Cancel' } = {}) => {
        return new Promise((resolve) => {
            setDialog({
                open: true,
                type: 'confirm',
                variant,
                title: title || variantTitle(variant),
                message,
                confirmLabel,
                cancelLabel,
                resolve,
            });
        });
    }, []);

    const handleConfirm = () => {
        dialog.resolve?.(true);
        setDialog(DEFAULT_STATE);
    };

    const handleCancel = () => {
        dialog.resolve?.(false);
        setDialog(DEFAULT_STATE);
    };

    return (
        <DialogContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            {dialog.open && (
                <div className="dlg-overlay" onClick={dialog.type === 'alert' ? handleConfirm : handleCancel}>
                    <div
                        className={`dlg-box dlg-${dialog.variant}`}
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="dlg-title"
                    >
                        {/* Glow ring */}
                        <div className="dlg-glow" />

                        {/* Icon */}
                        <div className={`dlg-icon-wrap dlg-icon-${dialog.variant}`}>
                            {ICONS[dialog.variant === 'error' && dialog.type === 'confirm' ? 'delete' : dialog.variant]}
                        </div>

                        {/* Content */}
                        <div className="dlg-content">
                            <h3 id="dlg-title" className="dlg-title">{dialog.title}</h3>
                            <p className="dlg-message">{dialog.message}</p>
                        </div>

                        {/* Actions */}
                        <div className="dlg-actions">
                            {dialog.type === 'confirm' && (
                                <button className="dlg-btn dlg-btn-cancel" onClick={handleCancel}>
                                    {dialog.cancelLabel}
                                </button>
                            )}
                            <button
                                className={`dlg-btn dlg-btn-confirm dlg-btn-${dialog.variant}`}
                                onClick={handleConfirm}
                                autoFocus
                            >
                                {dialog.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DialogContext.Provider>
    );
}

function variantTitle(variant) {
    return { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info', delete: 'Delete' }[variant] || 'Notice';
}
