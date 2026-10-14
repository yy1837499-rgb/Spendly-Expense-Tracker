import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency, formatShortDate } from '../utils/formatters';
import { CATEGORIES } from '../utils/constants';
import { Transaction } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onSelectTransaction: (tx: Transaction) => void;
  onOpenTransfer: () => void;
  onExportData: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onSelectTransaction,
  onOpenTransfer,
  onExportData,
}) => {
  const {
    totalBalance,
    monthlySpent,
    remainingBudget,
    budgetPercentUsed,
    daysLeftInMonth,
    budget,
    currency,
    weeklyDays,
    transactions,
  } = useExpenses();

  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedDayAmount, setSelectedDayAmount] = useState<number | null>(null);

  // Take the 4 most recent transactions for the dashboard
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="flex flex-col w-full px-4 md:px-6 pb-28 pt-2 gap-4 max-w-xl mx-auto">
      {/* Greeting & Status */}
      <div className="flex items-start justify-between pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[22px] font-bold text-on-surface tracking-tight">
              Good morning, Sarah
            </h1>
            <span className="text-xl inline-block origin-bottom-right hover:rotate-12 transition-transform cursor-pointer">
              👋
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <p className="text-xs text-on-surface-variant font-medium">
              You're on track with your May budget
            </p>
          </div>
        </div>

        {/* Mini Streak Badge */}
        <div className="flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-full shadow-xs">
          <span
            className="material-symbols-outlined text-[16px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_fire_department
          </span>
          <span className="text-[12px] font-bold text-on-surface">14d</span>
        </div>
      </div>

      {/* Hero Balance & Budget Master Card */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 relative overflow-hidden">
        {/* Ambient subtle background glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col relative z-10 gap-2.5">
          {/* Balance Header */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-outline tracking-wider uppercase">
              Total Balance
            </span>
            <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
              <span className="material-symbols-outlined text-[13px]">trending_up</span>
              +4.2%
            </span>
          </div>

          {/* Main Balance Figure */}
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-[32px] md:text-[36px] text-on-surface font-extrabold tracking-tight tabular-nums">
              {formatCurrency(totalBalance, currency)}
            </span>
          </div>

          {/* Split Metric Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="flex flex-col p-3 bg-surface-container-low rounded-xl">
              <span className="text-[11px] text-on-surface-variant font-medium">
                Spent this Month
              </span>
              <span className="text-[18px] text-on-surface mt-0.5 font-bold tabular-nums">
                {formatCurrency(monthlySpent, currency)}
              </span>
            </div>

            <div className="flex flex-col p-3 bg-surface-container-low rounded-xl">
              <span className="text-[11px] text-on-surface-variant font-medium">
                Left to Spend
              </span>
              <span className="text-[18px] text-primary mt-0.5 font-bold tabular-nums">
                {formatCurrency(remainingBudget, currency)}
              </span>
            </div>
          </div>

          {/* Budget Progress Track */}
          <div className="flex flex-col gap-1.5 pt-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">
                Budget Cap: {formatCurrency(budget.monthlyCap, currency)}
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
                    : 'bg-gradient-to-r from-primary to-primary-container'
                }`}
                style={{ width: `${Math.min(100, budgetPercentUsed)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[12px] text-on-surface-variant mt-0.5">
              <span className="text-outline">
                {budgetPercentUsed > 100 ? 'Over monthly limit' : 'Pacing well'}
              </span>
              <span>
                {formatCurrency(remainingBudget, currency)} remaining for {daysLeftInMonth} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-4 gap-2.5">
        {/* Add */}
        <button
          onClick={() => onNavigate('add-expense')}
          className="flex flex-col items-center justify-center p-2.5 bg-primary text-white rounded-2xl shadow-sm hover:bg-primary-container active:scale-95 transition-all group"
          type="button"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">add</span>
          </div>
          <span className="text-[12px] font-bold truncate">Add</span>
        </button>

        {/* Transfer */}
        <button
          onClick={onOpenTransfer}
          className="flex flex-col items-center justify-center p-2.5 bg-surface-container-lowest text-on-surface rounded-2xl shadow-sm border border-surface-container/60 hover:bg-surface-container-low active:scale-95 transition-all group"
          type="button"
        >
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-on-surface">
            <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
          </div>
          <span className="text-[12px] font-semibold truncate">Transfer</span>
        </button>

        {/* Budget */}
        <button
          onClick={() => onNavigate('budgets')}
          className="flex flex-col items-center justify-center p-2.5 bg-surface-container-lowest text-on-surface rounded-2xl shadow-sm border border-surface-container/60 hover:bg-surface-container-low active:scale-95 transition-all group"
          type="button"
        >
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-on-surface">
            <span className="material-symbols-outlined text-[20px]">pie_chart</span>
          </div>
          <span className="text-[12px] font-semibold truncate">Budget</span>
        </button>

        {/* Export */}
        <button
          onClick={onExportData}
          className="flex flex-col items-center justify-center p-2.5 bg-surface-container-lowest text-on-surface rounded-2xl shadow-sm border border-surface-container/60 hover:bg-surface-container-low active:scale-95 transition-all group"
          type="button"
        >
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-on-surface">
            <span className="material-symbols-outlined text-[20px]">ios_share</span>
          </div>
          <span className="text-[12px] font-semibold truncate">Export</span>
        </button>
      </div>

      {/* Spending Outflow Sparkline & Chart Card */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[16px] font-bold text-on-surface">Spending Outflow</span>
            <span className="text-xs text-on-surface-variant">Daily expense breakdown</span>
          </div>

          {/* Segmented Timeframe Switcher */}
          <div className="flex p-0.5 bg-surface-container-low rounded-xl">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeframe === 'weekly'
                  ? 'text-primary bg-surface-container-lowest shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeframe === 'monthly'
                  ? 'text-primary bg-surface-container-lowest shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Micro Bar Chart Representation */}
        {timeframe === 'weekly' ? (
          <div className="flex items-end justify-between pt-5 pb-1 h-36 px-1 gap-2 select-none">
            {weeklyDays.map((d, index) => {
              // Calculate relative height
              const maxWeekly = Math.max(...weeklyDays.map((x) => x.amount), 120);
              const heightPercent = Math.max(16, Math.min(94, Math.round((d.amount / maxWeekly) * 90)));

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDayAmount(d.amount)}
                  className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer relative"
                >
                  {/* Floating Peak or Hover Badge */}
                  {d.isPeak ? (
                    <div className="absolute -top-3.5 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] leading-tight font-extrabold shadow-sm animate-bounce">
                      {currency}{d.amount}
                    </div>
                  ) : (
                    <span className="text-[10px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                      {currency}{d.amount}
                    </span>
                  )}

                  <div
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                      d.isPeak
                        ? 'bg-primary shadow-xs'
                        : 'bg-surface-container-high group-hover:bg-primary-fixed'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span
                    className={`text-xs ${
                      d.isPeak ? 'text-primary font-bold' : 'text-on-surface-variant'
                    }`}
                  >
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-end justify-between pt-6 pb-1 h-36 px-2 gap-3">
            {[
              { label: 'W1', amt: 640 },
              { label: 'W2', amt: 820 },
              { label: 'W3', amt: 710, isCurrent: true },
              { label: 'W4 (Est)', amt: 670 },
            ].map((wk, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] text-on-surface-variant font-semibold">
                  {currency}{wk.amt}
                </span>
                <div
                  className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                    wk.isCurrent
                      ? 'bg-primary shadow-xs'
                      : 'bg-surface-container-high group-hover:bg-primary-fixed'
                  }`}
                  style={{ height: `${(wk.amt / 850) * 88}%` }}
                />
                <span className={`text-xs ${wk.isCurrent ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                  {wk.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Smart Saving Tip / Delight Callout */}
      <div className="w-full bg-surface-container-low rounded-2xl p-3.5 flex items-center gap-3 border border-surface-container/60">
        <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center shrink-0 shadow-xs text-primary">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            insights
          </span>
        </div>
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-xs font-bold text-on-surface">Healthy Margin</span>
          <p className="text-xs text-on-surface-variant truncate">
            You're spending $18/day less than last week!
          </p>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-on-surface">Recent Transactions</h2>
          <button
            onClick={() => onNavigate('expenses')}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
            type="button"
          >
            See all
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Transactions List Feed */}
        <div className="flex flex-col bg-surface-container-lowest rounded-2xl p-2 shadow-sm border border-surface-container/60 divide-y divide-surface-container-low">
          {recentTransactions.map((tx) => {
            const cat = CATEGORIES[tx.category] || CATEGORIES.more;
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low/70 transition-colors active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.bgColor, color: cat.textColor }}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {cat.iconName}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-on-surface truncate">
                      {tx.title}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <span>{cat.name}</span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant" />
                      <span className="truncate">{formatShortDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span
                    className={`text-sm md:text-base font-bold tabular-nums tracking-tight ${
                      isIncome ? 'text-primary' : 'text-on-surface'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    {tx.paymentMethod}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
