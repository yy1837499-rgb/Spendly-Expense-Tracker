import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';
import { TimePeriod } from '../types';

interface AnalyticsProps {
  onExportReport: () => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ onExportReport }) => {
  const {
    monthlySpent,
    currency,
    categorySpending,
    budget,
    sixMonthsTrend,
  } = useExpenses();

  const [period, setPeriod] = useState<TimePeriod>('month');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(4); // May

  const monthNames = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024'];

  // Calculate actual category proportions
  const totalCatSum = Math.max(
    1,
    Object.values(categorySpending).reduce((a, b) => a + b, 0)
  );

  const categoriesData = [
    {
      id: 'dining',
      name: 'Food & Dining',
      amount: categorySpending.dining > 0 ? categorySpending.dining : 965.6,
      budget: budget.categoryBudgets.dining || 1000,
      color: '#006948',
      bgColor: '#e2f5ec',
      icon: 'restaurant',
    },
    {
      id: 'bills',
      name: 'Housing & Utilities',
      amount: categorySpending.bills > 0 ? categorySpending.bills : 795.2,
      budget: budget.categoryBudgets.bills || 850,
      color: '#4648d4',
      bgColor: '#eaedff',
      icon: 'home',
    },
    {
      id: 'groceries',
      name: 'Groceries',
      amount: categorySpending.groceries > 0 ? categorySpending.groceries : 511.2,
      budget: budget.categoryBudgets.groceries || 600,
      color: '#e08e00',
      bgColor: '#fef3c7',
      icon: 'shopping_cart',
    },
    {
      id: 'transport',
      name: 'Transport',
      amount: categorySpending.transport > 0 ? categorySpending.transport : 340.8,
      budget: budget.categoryBudgets.transport || 400,
      color: '#0284c7',
      bgColor: '#e0f2fe',
      icon: 'directions_subway',
    },
    {
      id: 'fun',
      name: 'Entertainment & Other',
      amount:
        (categorySpending.fun || 0) +
        (categorySpending.shopping || 0) +
        (categorySpending.health || 0) >
        0
          ? (categorySpending.fun || 0) +
            (categorySpending.shopping || 0) +
            (categorySpending.health || 0)
          : 227.2,
      budget: (budget.categoryBudgets.fun || 300) + (budget.categoryBudgets.shopping || 200),
      color: '#e11d48',
      bgColor: '#ffe4e6',
      icon: 'theater_comedy',
    },
  ];

  const totalCalculated = categoriesData.reduce((sum, c) => sum + c.amount, 0);

  // Compute donut circumference & offsets
  // Total circumference for r = 38 is 2 * PI * 38 ≈ 238.76
  const circumference = 238.76;
  let accumulatedPercent = 0;

  const donutSegments = categoriesData.map((cat) => {
    const pct = cat.amount / totalCalculated;
    const strokeDash = pct * circumference;
    const strokeOffset = -(accumulatedPercent * circumference);
    accumulatedPercent += pct;
    return {
      ...cat,
      percent: Math.round(pct * 100),
      strokeDash,
      strokeOffset,
    };
  });

  return (
    <div className="flex flex-col w-full px-4 md:px-6 pb-28 pt-2 gap-4 max-w-xl mx-auto">
      {/* Period Selector */}
      <div className="w-full pt-1">
        <div className="flex items-center justify-between p-1 bg-surface-container rounded-full shadow-inner">
          {(['week', 'month', 'quarter', 'year'] as TimePeriod[]).map((p) => {
            const isSelected = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-1.5 px-3 rounded-full text-center text-xs capitalize transition-all ${
                  isSelected
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface font-semibold'
                }`}
                type="button"
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Month Navigator & Spending Spotlight Card */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <button
            aria-label="Previous Month"
            onClick={() => setSelectedMonthIndex((prev) => Math.max(0, prev - 1))}
            className="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container transition-colors active:scale-90"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-primary text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              calendar_month
            </span>
            <span className="text-base font-bold text-on-surface">
              {monthNames[selectedMonthIndex]}
            </span>
          </div>

          <button
            aria-label="Next Month"
            onClick={() =>
              setSelectedMonthIndex((prev) => Math.min(monthNames.length - 1, prev + 1))
            }
            className="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container transition-colors active:scale-90"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-2 text-center">
          <span className="text-[11px] font-bold text-outline tracking-wider uppercase mb-0.5">
            Total Outflow
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-[32px] md:text-[36px] text-on-surface font-extrabold tracking-tight tabular-nums">
              {formatCurrency(monthlySpent || 2840.0, currency)}
            </span>
          </div>

          {/* Comparison Pill */}
          <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/40 text-primary">
            <span className="material-symbols-outlined text-[16px]">trending_down</span>
            <span className="text-xs font-bold">-8.4% vs last month</span>
            <span className="text-xs text-on-surface-variant font-medium">· Saved $260.00</span>
          </div>
        </div>
      </div>

      {/* Smart Insight Card */}
      <div className="w-full bg-gradient-to-r from-secondary-fixed/50 to-surface-container-high/60 rounded-2xl p-4 shadow-sm border border-secondary-fixed/40 relative overflow-hidden flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container-lowest shrink-0 flex items-center justify-center shadow-xs text-secondary">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-bold text-secondary">Smart Growth Insight</span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          </div>
          <p className="text-xs text-on-surface leading-relaxed">
            Great job! You spent <strong className="text-primary font-bold">14% less</strong> on
            dining out this week. You could reach your{' '}
            <strong className="text-on-surface font-bold">$5,000 vacation goal</strong> 2 weeks
            earlier.
          </p>
        </div>
      </div>

      {/* Category Breakdown Circular Visualization */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-on-surface">Category Breakdown</h2>
          <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">info</span>
          </div>
        </div>

        {/* Chart and Legend Row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
          {/* Interactive SVG Donut Chart */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <svg
              aria-label="Spending donut chart"
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Background Base Ring */}
              <circle cx="50" cy="50" fill="none" r="38" stroke="#eaedff" strokeWidth="12" />

              {/* Dynamic Category Arcs */}
              {donutSegments.map((seg) => (
                <circle
                  key={seg.id}
                  className="transition-all duration-700 ease-out hover:opacity-90 cursor-pointer"
                  cx="50"
                  cy="50"
                  fill="none"
                  r="38"
                  stroke={seg.color}
                  strokeDasharray={`${seg.strokeDash} ${circumference}`}
                  strokeDashoffset={seg.strokeOffset}
                  strokeLinecap="round"
                  strokeWidth="12"
                />
              ))}
            </svg>

            {/* Center Donut Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[11px] text-on-surface-variant font-medium">Top Outflow</span>
              <span className="text-xl font-extrabold text-primary tracking-tight">
                {donutSegments[0]?.percent || 34}%
              </span>
              <span className="text-[11px] font-bold text-on-surface-variant">
                {donutSegments[0]?.name || 'Food & Dining'}
              </span>
            </div>
          </div>

          {/* Quick Category Color Badges Grid */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {donutSegments.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] text-on-surface font-bold truncate">
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-on-surface-variant tabular-nums">
                    {cat.percent}% · {formatCurrency(cat.amount, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Category Detail List */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-on-surface">Category Status</h2>
          <span className="text-xs text-on-surface-variant font-medium">
            {categoriesData.length} Categories
          </span>
        </div>

        {categoriesData.map((cat) => {
          const usedPct = Math.min(100, Math.round((cat.amount / cat.budget) * 100));
          return (
            <div key={cat.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.bgColor, color: cat.color }}
                  >
                    <span
                      className="material-symbols-outlined text-[19px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {cat.icon}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs md:text-sm font-bold text-on-surface truncate">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-on-surface-variant tabular-nums">
                      {formatCurrency(cat.amount, currency)} of{' '}
                      {formatCurrency(cat.budget, currency)} budget
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-xs font-bold text-on-surface tabular-nums">
                    {formatCurrency(cat.amount, currency)}
                  </span>
                  <span
                    className="text-[11px] font-bold flex items-center gap-0.5"
                    style={{ color: cat.color }}
                  >
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    On track ({usedPct}%)
                  </span>
                </div>
              </div>

              {/* Mini Progress Bar */}
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${usedPct}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Spending Trend Chart (6 Months) */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-base font-bold text-on-surface">6-Month Spending Trend</h2>
            <span className="text-xs text-on-surface-variant">Continuous drop under $3,500 target</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
            <span className="w-2.5 h-0.5 bg-outline rounded-full" />
            <span className="text-[11px] font-bold">$3,500 Budget</span>
          </div>
        </div>

        {/* Trend Visual Container */}
        <div className="relative w-full pt-6 pb-2">
          {/* Target Budget Dashed Guideline */}
          <div className="absolute top-10 left-0 right-0 flex items-center z-0">
            <div className="w-full border-t border-dashed border-outline-variant opacity-75" />
          </div>

          {/* Bars Flex Grid */}
          <div className="flex items-end justify-between h-40 pt-6 px-1 relative z-10">
            {sixMonthsTrend.map((item, idx) => {
              const maxScale = 4000;
              const barHeight = Math.round((item.amount / maxScale) * 130);
              return (
                <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                  <span
                    className={`text-[11px] tabular-nums ${
                      item.isCurrent
                        ? 'text-primary font-bold'
                        : 'text-on-surface-variant opacity-80'
                    }`}
                  >
                    ${(item.amount / 1000).toFixed(1)}k
                  </span>

                  <div
                    className={`w-7 rounded-t-lg transition-all relative group ${
                      item.isCurrent
                        ? 'bg-primary shadow-xs'
                        : idx === 4
                        ? 'bg-primary-fixed-dim hover:bg-primary-fixed'
                        : 'bg-surface-container-highest hover:bg-surface-dim'
                    }`}
                    style={{ height: `${barHeight}px` }}
                  >
                    {item.isCurrent && (
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary-fixed ring-2 ring-surface-container-lowest" />
                    )}
                  </div>

                  <span
                    className={`text-xs mt-1 ${
                      item.isCurrent ? 'text-primary font-bold' : 'text-on-surface-variant'
                    }`}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trend Footer Achievement */}
        <div className="mt-2 pt-2 border-t border-surface-container-low flex items-center justify-between text-on-surface-variant">
          <div className="flex items-center gap-1 text-primary">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span className="text-[11px] font-bold">6 consecutive months under budget</span>
          </div>
          <span className="text-[11px] text-on-surface-variant font-semibold">
            Avg: $3,136/mo
          </span>
        </div>
      </div>

      {/* Export Monthly Report Card */}
      <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-surface-container/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[20px]">download</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-on-surface">Export Monthly Report</span>
            <span className="text-[11px] text-on-surface-variant">
              Download PDF / CSV summary
            </span>
          </div>
        </div>

        <button
          onClick={onExportReport}
          className="px-4 py-2 rounded-full bg-surface-container-lowest text-on-surface shadow-xs text-xs font-bold hover:bg-surface-bright active:scale-95 transition-all border border-surface-container/60"
          type="button"
        >
          Export
        </button>
      </div>
    </div>
  );
};
