import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';

interface TransferModalProps {
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ onClose }) => {
  const { addTransaction, currency } = useExpenses();
  const [amountStr, setAmountStr] = useState('250.00');
  const [transferType, setTransferType] = useState<'income' | 'expense'>('income');
  const [sourceAccount, setSourceAccount] = useState('External Bank Transfer');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amountStr);
    if (isNaN(parsed) || parsed <= 0) return;

    addTransaction({
      title: transferType === 'income' ? 'Account Deposit' : 'Savings Transfer',
      amount: parsed,
      type: transferType,
      category: transferType === 'income' ? 'income' : 'more',
      paymentMethod: sourceAccount,
      date: new Date().toISOString(),
      note: note.trim() || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10 border border-surface-container/70 pb-safe">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              swap_horiz
            </span>
            <span className="text-base font-bold text-on-surface">Record Transfer / Income</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          {/* Transfer Type Switcher */}
          <div className="flex p-1 bg-surface-container-low rounded-xl">
            <button
              type="button"
              onClick={() => setTransferType('income')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                transferType === 'income'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              + Deposit / Income
            </button>
            <button
              type="button"
              onClick={() => setTransferType('expense')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                transferType === 'expense'
                  ? 'bg-secondary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              - Transfer Out / Savings
            </button>
          </div>

          {/* Amount input */}
          <div className="flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-2xl">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1">
              Transfer Amount
            </span>
            <div className="flex items-baseline">
              <span className="text-2xl font-extrabold text-primary mr-1">{currency}</span>
              <input
                type="text"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="bg-transparent text-center text-3xl font-extrabold text-on-surface focus:outline-none w-44 tracking-tight tabular-nums"
                autoFocus
              />
            </div>
          </div>

          {/* Account Source */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Account / Method</label>
            <select
              value={sourceAccount}
              onChange={(e) => setSourceAccount(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl text-xs font-semibold text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Direct Deposit">Direct Deposit</option>
              <option value="Checking •••• 1042">Checking •••• 1042</option>
              <option value="External Bank Wire">External Bank Wire</option>
              <option value="Savings Vault">High-Yield Savings Vault</option>
              <option value="Cash Wallet">Cash Wallet</option>
            </select>
          </div>

          {/* Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Reference / Note</label>
            <input
              type="text"
              placeholder="e.g. Consulting payout, Transfer to emergency fund"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl text-xs text-on-surface placeholder:text-outline border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 mt-2 rounded-full bg-primary text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            {isSuccess ? (
              <>
                <span className="material-symbols-outlined text-[18px]">done</span>
                <span>Transfer Recorded!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>Confirm Transfer</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
