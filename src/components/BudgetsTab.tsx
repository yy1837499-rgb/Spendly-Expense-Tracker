import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';
import { CATEGORIES } from '../utils/constants';
import { CategoryId } from '../types';

export const BudgetsTab: React.FC = () => {
  const {
    budget,
    updateMonthlyCap,
    updateCategoryBudget,
    monthlySpent,
    remainingBudget,
    budgetPercentUsed,
    daysLeftInMonth,
    currency,
    categorySpending,
  } = useExpenses();

  const [isEditingCap, setIsEditingCap] = useState(false);
  const [newCapInput, setNewCapInput] = useState(budget.monthlyCap.toString());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryCap, setNewCategoryCap] = useState('');

  const handleSaveCap = () => {
    const val = parseFloat(newCapInput);
    if (!isNaN(val) && val > 0) {
      updateMonthlyCap(val);
      setIsEditingCap(false);
    }
  };

  const handleSaveCategoryCap = (catId: string) => {
    const val = parseFloat(newCategoryCap);
    if (!isNaN(val) && val > 0) {
      updateCategoryBudget(catId, val);
      setEditingCategory(null);
    }
  };

  const startEditCategory = (catId: string, currentVal: number) => {
    setEditingCategory(catId);
    setNewCategoryCap(currentVal.toString());
  };

  return (
    <div className="flex flex-col w-full px-4 md:px-6 pb-28 pt-2 gap-4 max-w-xl mx-auto">
      {/* Header Banner */}
      <div className="pt-1 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-on-surface">Budget Management</h1>
          <p className="text-xs text-on-surface-variant">Set monthly spending limits and category caps</p>
        </div>
      </div>

      {/* Main Budget Cap Card */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
            Overall Monthly Cap
          </span>
          <button
            onClick={() => {
              if (isEditingCap) {
                handleSaveCap();
              } else {
                setNewCapInput(budget.monthlyCap.toString());
                setIsEditingCap(true);
              }
            }}
            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isEditingCap ? 'check' : 'edit'}
            </span>
            {isEditingCap ? 'Save Cap' : 'Edit Cap'}
          </button>
        </div>

        {isEditingCap ? (
          <div className="flex items-center gap-2 my-2">
            <span className="text-2xl font-bold text-primary">{currency}</span>
            <input
              type="number"
              value={newCapInput}
              onChange={(e) => setNewCapInput(e.target.value)}
              className="text-2xl font-bold text-on-surface bg-surface-container-low px-3 py-1.5 rounded-xl w-40 border border-primary/40 focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleSaveCap}
              className="px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Update
            </button>
          </div>
        ) : (
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-[32px] md:text-[36px] font-extrabold text-on-surface tracking-tight tabular-nums">
              {formatCurrency(budget.monthlyCap, currency)}
            </span>
            <span className="text-xs text-outline font-medium ml-1">/ month</span>
          </div>
        )}

        {/* Progress Bar & Details */}
        <div className="flex flex-col gap-1.5 pt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant font-medium">
              Spent: {formatCurrency(monthlySpent, currency)}
            </span>
            <span
              className={`font-bold ${
                budgetPercentUsed > 90 ? 'text-error' : 'text-primary'
              }`}
            >
              {budgetPercentUsed}% used
            </span>
          </div>

          <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                budgetPercentUsed > 100
                  ? 'bg-error'
                  : budgetPercentUsed > 80
                  ? 'bg-amber-500'
                  : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, budgetPercentUsed)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[12px] text-on-surface-variant mt-0.5">
            <span>
              {formatCurrency(remainingBudget, currency)} remaining
            </span>
            <span className="font-medium text-outline">
              {daysLeftInMonth} days left this month
            </span>
          </div>
        </div>
      </div>

      {/* Category Budgets Allocation */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-on-surface">Category Allocations</h2>
          <span className="text-xs text-outline">Tap cap to adjust</span>
        </div>

        <div className="flex flex-col divide-y divide-surface-container-low">
          {[
            { id: 'dining', name: 'Food & Dining', defaultCap: 1000 },
            { id: 'bills', name: 'Housing & Utilities', defaultCap: 850 },
            { id: 'groceries', name: 'Groceries', defaultCap: 600 },
            { id: 'transport', name: 'Transport', defaultCap: 400 },
            { id: 'shopping', name: 'Shopping', defaultCap: 500 },
            { id: 'fun', name: 'Entertainment', defaultCap: 300 },
            { id: 'health', name: 'Health & Wellness', defaultCap: 200 },
          ].map((cat) => {
            const catInfo = CATEGORIES[cat.id as CategoryId] || CATEGORIES.more;
            const currentCap = budget.categoryBudgets[cat.id] || cat.defaultCap;
            const spent = categorySpending[cat.id as CategoryId] || 0;
            const pct = Math.min(100, Math.round((spent / currentCap) * 100));
            const isEditing = editingCategory === cat.id;

            return (
              <div key={cat.id} className="py-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: catInfo.bgColor, color: catInfo.textColor }}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {catInfo.iconName}
                      </span>
                    </div>
                    <span className="text-xs md:text-sm font-bold text-on-surface truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-primary">{currency}</span>
                        <input
                          type="number"
                          value={newCategoryCap}
                          onChange={(e) => setNewCategoryCap(e.target.value)}
                          className="w-20 text-xs font-bold text-on-surface bg-surface-container-low px-2 py-1 rounded-lg border border-primary/40 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveCategoryCap(cat.id)}
                          className="px-2 py-1 bg-primary text-white text-[11px] font-bold rounded-lg"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditCategory(cat.id, currentCap)}
                        className="text-xs font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1"
                        type="button"
                      >
                        <span className="tabular-nums">
                          {formatCurrency(spent, currency)} / {formatCurrency(currentCap, currency)}
                        </span>
                        <span className="material-symbols-outlined text-[14px] text-outline">
                          edit
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct > 90 ? 'bg-error' : pct > 75 ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-on-surface-variant">
                  <span>{pct}% utilized</span>
                  <span>{formatCurrency(Math.max(0, currentCap - spent), currency)} left</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safe Savings Target / Recommendation */}
      <div className="w-full bg-gradient-to-r from-primary-fixed/30 to-surface-container-low rounded-2xl p-4 border border-primary/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-primary shadow-xs">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            savings
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-on-surface">Recommended 50/30/20 Rule</span>
          <p className="text-[11px] text-on-surface-variant">
            Based on your monthly cash flow, saving $800/mo puts you in the top 10% of disciplined budgeters.
          </p>
        </div>
      </div>
    </div>
  );
};
