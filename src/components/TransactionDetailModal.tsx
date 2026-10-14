import React, { useState } from 'react';
import { Transaction } from '../types';
import { CATEGORIES } from '../utils/constants';
import { formatCurrency, formatShortDate } from '../utils/formatters';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  currency: string;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  currency,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!transaction) return null;

  const cat = CATEGORIES[transaction.category] || CATEGORIES.more;
  const isIncome = transaction.type === 'income';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 overflow-hidden z-10 border border-surface-container/70 pb-safe">
        {/* Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">
              Transaction Details
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Hero Amount & Merchant */}
        <div className="flex flex-col items-center justify-center py-5 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-xs"
            style={{ backgroundColor: cat.bgColor, color: cat.textColor }}
          >
            <span className="material-symbols-outlined text-[26px]">{cat.iconName}</span>
          </div>

          <h2 className="text-xl font-bold text-on-surface">{transaction.title}</h2>
          <span className="text-xs text-on-surface-variant mt-0.5">{cat.name}</span>

          <div className="mt-2 text-3xl font-extrabold tabular-nums tracking-tight">
            <span className={isIncome ? 'text-primary' : 'text-on-surface'}>
              {isIncome ? '+' : '-'}
              {formatCurrency(transaction.amount, currency)}
            </span>
          </div>
        </div>

        {/* Detail Rows */}
        <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-surface-container">
            <span className="text-outline font-medium">Date & Time</span>
            <span className="font-bold text-on-surface">
              {formatShortDate(transaction.date)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-surface-container">
            <span className="text-outline font-medium">Payment Method</span>
            <span className="font-bold text-on-surface">{transaction.paymentMethod}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-surface-container">
            <span className="text-outline font-medium">Category</span>
            <span className="font-bold text-on-surface flex items-center gap-1">
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </span>
          </div>

          {transaction.note && (
            <div className="flex flex-col gap-1 py-1 border-b border-surface-container">
              <span className="text-outline font-medium">Note</span>
              <p className="text-on-surface font-medium leading-relaxed">
                {transaction.note}
              </p>
            </div>
          )}

          {transaction.receiptName && (
            <div className="flex justify-between items-center py-1">
              <span className="text-outline font-medium">Receipt</span>
              <span className="font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">attachment</span>
                <span>{transaction.receiptName}</span>
              </span>
            </div>
          )}
        </div>

        {/* Receipt Image Preview if present */}
        {transaction.receiptUrl && (
          <div className="mt-3 rounded-xl overflow-hidden border border-surface-container max-h-40">
            <img
              src={transaction.receiptUrl}
              alt="Receipt Attachment"
              className="w-full object-cover max-h-40"
            />
          </div>
        )}

        {/* Delete Confirmation Warning */}
        {showDeleteConfirm && (
          <div className="mt-4 p-3 bg-error-container/30 border border-error/20 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-error font-bold text-xs">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>Are you sure you want to delete this transaction?</span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              This will automatically update your monthly spent and remaining budget.
            </p>
            <div className="flex items-center justify-end gap-2 mt-1">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-container text-on-surface"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(transaction.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-error text-white shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}

        {/* Actions Strip */}
        {!showDeleteConfirm && (
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 h-11 rounded-full bg-error-container/40 text-error font-bold text-xs hover:bg-error-container active:scale-95 transition-all flex items-center justify-center gap-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              <span>Delete</span>
            </button>

            <button
              onClick={() => {
                onEdit(transaction);
                onClose();
              }}
              className="flex-[2] h-11 rounded-full bg-primary text-white font-bold text-xs hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-1 shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Edit Expense</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
