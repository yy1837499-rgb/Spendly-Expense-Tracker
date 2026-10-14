import React from 'react';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#faf8ff]/95 backdrop-blur-xl border-t border-surface-container/70 shadow-[0_-2px_16px_rgba(19,27,46,0.04)]">
      <div className="max-w-xl mx-auto flex items-center justify-around h-16 px-2 relative">
        {/* Home */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
            currentTab === 'dashboard'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={currentTab === 'dashboard' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            grid_view
          </span>
          <span className="text-[11px] leading-tight font-semibold">Home</span>
        </button>

        {/* Expenses */}
        <button
          onClick={() => onNavigate('expenses')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
            currentTab === 'expenses'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={currentTab === 'expenses' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            receipt_long
          </span>
          <span className="text-[11px] leading-tight font-semibold">Expenses</span>
        </button>

        {/* Center Floating Elevated Add Button */}
        <div className="relative flex items-center justify-center -top-3">
          <button
            aria-label="Add Expense"
            onClick={() => onNavigate('add-expense')}
            className={`flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-[0_6px_20px_rgba(0,105,72,0.4)] active:scale-95 hover:bg-primary-container transition-all ${
              currentTab === 'add-expense' ? 'ring-4 ring-primary-fixed' : ''
            }`}
            type="button"
          >
            <span
              className="material-symbols-outlined text-[30px] font-bold"
              style={{ fontVariationSettings: "'wght' 600" }}
            >
              add
            </span>
          </button>
        </div>

        {/* Analytics */}
        <button
          onClick={() => onNavigate('statistics')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
            currentTab === 'statistics'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={currentTab === 'statistics' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            donut_large
          </span>
          <span className="text-[11px] leading-tight font-semibold">Analytics</span>
        </button>

        {/* Budgets */}
        <button
          onClick={() => onNavigate('budgets')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
            currentTab === 'budgets'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={currentTab === 'budgets' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            account_balance_wallet
          </span>
          <span className="text-[11px] leading-tight font-semibold">Budgets</span>
        </button>
      </div>
    </nav>
  );
};
