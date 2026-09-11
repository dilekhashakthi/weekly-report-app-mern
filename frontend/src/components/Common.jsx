import React from 'react';
import { FiChevronLeft, FiChevronRight, FiInbox, FiAlertCircle, FiAlertTriangle } from 'react-icons/fi';

export const Spinner = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center py-10 ${className}`}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
};

export const EmptyState = ({ title, description, action, icon: Icon = FiInbox }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-line bg-white px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper text-ink/40">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink/60 font-inter">{description}</p>}
      {action}
    </div>
  );
};

export const ErrorBanner = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-inter">
      <FiAlertCircle className="h-4 w-4 shrink-0 text-red-600" />
      <span>{message}</span>
    </div>
  );
};

export const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-line bg-white px-3 py-1.5 text-xs text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <FiChevronLeft className="h-3.5 w-3.5" />
        <span>Previous</span>
      </button>
      <span className="text-xs text-ink/60 font-inter">
        Page {page} of {pages}
      </span>
      <button
        className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-line bg-white px-3 py-1.5 text-xs text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        <span>Next</span>
        <FiChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export const ConfirmDialog = ({ open, title, description, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-5 shadow-lg">
        <div className="flex items-start gap-3">
          {danger && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FiAlertTriangle className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-ink">{title}</p>
            {description && <p className="mt-1 text-sm text-ink/60 font-inter">{description}</p>}
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={
              danger
                ? 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50'
                : 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border-0 bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50'
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SectionCard = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <div className={`rounded-xl border border-line bg-white p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-ink/50 font-inter">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
};
