import React from 'react';
import { useExpenses } from '../context/ExpenseContext';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenNotifications,
  onOpenProfile,
  unreadCount = 2,
}) => {
  const isAddScreen = currentTab === 'add-expense';

  return (
    <header className="sticky top-0 inset-x-0 z-40 bg-[#faf8ff]/90 backdrop-blur-xl border-b border-surface-container/60 pt-safe">
      <div className="h-16 px-4 md:px-6 max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAddScreen ? (
            <button
              aria-label="Go back"
              onClick={() => onNavigate('dashboard')}
              className="w-10 h-10 flex items-center justify-center -ml-1 rounded-full text-on-surface hover:bg-surface-container/60 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          ) : null}

          {/* Spendly App Logo Icon */}
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-tight text-on-surface font-sans">
              Spendly
            </span>
            {isAddScreen && (
              <span className="text-sm font-semibold text-outline ml-1">
                • Add Expense
              </span>
            )}
          </div>
        </div>

        {/* Right Action Icons: Notifications & Profile Avatar */}
        <div className="flex items-center gap-1">
          <button
            aria-label="Notifications"
            onClick={onOpenNotifications}
            className="relative w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface animate-pulse" />
            )}
          </button>

          <button
            aria-label="User Profile"
            onClick={onOpenProfile}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:ring-2 hover:ring-primary/30 transition-all ml-0.5"
            type="button"
          >
            <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs ring-2 ring-surface shadow-xs">
              SJ
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
