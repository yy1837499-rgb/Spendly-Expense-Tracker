import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';

interface ProfileModalProps {
  onClose: () => void;
  onExport: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onExport }) => {
  const { currency, setCurrency, resetToDefaults, transactions } = useExpenses();
  const [resetConfirm, setResetConfirm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10 border border-surface-container/70 pb-safe">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
          <span className="text-base font-bold text-on-surface">Account & Settings</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-3.5 py-4">
          <div className="w-14 h-14 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-lg ring-4 ring-primary/20 shadow-sm">
            SJ
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-on-surface">Sarah Jenkins</h2>
            <span className="text-xs text-on-surface-variant">sarah.jenkins@spendly.app</span>
            <span className="text-[11px] text-primary font-semibold mt-0.5">
              Spendly Pro Member • Offline Sync Active
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="bg-surface-container-low rounded-2xl p-3.5 flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-on-surface font-bold">Display Currency</span>
            <div className="flex bg-surface-container p-0.5 rounded-xl">
              {['$', '€', '£'].map((sym) => (
                <button
                  key={sym}
                  onClick={() => setCurrency(sym)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    currency === sym
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-1 border-t border-surface-container">
            <span className="text-on-surface font-bold">Stored Records</span>
            <span className="text-outline font-semibold">{transactions.length} transactions</span>
          </div>

          <div className="flex items-center justify-between py-1 border-t border-surface-container">
            <span className="text-on-surface font-bold">Local Device Storage</span>
            <span className="text-primary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">cloud_done</span>
              <span>Saved locally</span>
            </span>
          </div>
        </div>

        {/* Export and Reset actions */}
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={() => {
              onExport();
              onClose();
            }}
            className="w-full h-11 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Download All Transactions (.CSV)</span>
          </button>

          {resetConfirm ? (
            <div className="p-3 rounded-xl bg-error-container/30 border border-error/20 flex flex-col gap-2 mt-1">
              <span className="text-xs font-bold text-error">
                Restore initial sample transactions?
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setResetConfirm(false)}
                  className="flex-1 py-1.5 rounded-lg bg-surface-container text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetToDefaults();
                    setResetConfirm(false);
                    onClose();
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-error text-white text-xs font-bold"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm(true)}
              className="w-full h-10 rounded-full text-outline hover:text-error text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset to Sample Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
