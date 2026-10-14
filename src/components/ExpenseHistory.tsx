import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Transaction, CategoryId } from '../types';
import { CATEGORIES } from '../utils/constants';
import { formatCurrency, formatDateGroupHeader } from '../utils/formatters';

interface ExpenseHistoryProps {
  onSelectTransaction: (tx: Transaction) => void;
}

export const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({
  onSelectTransaction,
}) => {
  const { transactions, currency } = useExpenses();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Advanced filter states
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'this_month' | 'last_30_days'>('all');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>('all');
  const [maxAmountFilter, setMaxAmountFilter] = useState<number>(2500);
  const [selectedMonth, setSelectedMonth] = useState<string>('May');

  // Month options
  const months = ['All', 'May', 'Apr', 'Mar'];

  // Calculate counts for categories
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: transactions.length,
      dining: 0,
      groceries: 0,
      transport: 0,
      shopping: 0,
      bills: 0,
    };
    transactions.forEach((tx) => {
      if (counts[tx.category] !== undefined) {
        counts[tx.category]++;
      }
    });
    return counts;
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search filter
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchTitle = tx.title.toLowerCase().includes(q);
        const matchNote = tx.note?.toLowerCase().includes(q) || false;
        const matchMethod = tx.paymentMethod.toLowerCase().includes(q);
        const matchCat = (CATEGORIES[tx.category]?.name || '').toLowerCase().includes(q);
        if (!matchTitle && !matchNote && !matchMethod && !matchCat) {
          return false;
        }
      }

      // 2. Category quick chip
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }

      // 3. Payment method filter
      if (selectedPaymentFilter !== 'all') {
        if (!tx.paymentMethod.toLowerCase().includes(selectedPaymentFilter.toLowerCase())) {
          return false;
        }
      }

      // 4. Max Amount
      if (tx.amount > maxAmountFilter) {
        return false;
      }

      // 5. Month Filter
      if (selectedMonth !== 'All') {
        const txDate = new Date(tx.date);
        const monthName = txDate.toLocaleString('en-US', { month: 'short' });
        if (monthName.toLowerCase() !== selectedMonth.toLowerCase()) {
          return false;
        }
      }

      // 6. Date Range Filter
      if (dateRangeFilter === 'this_month') {
        const txDate = new Date(tx.date);
        const now = new Date();
        if (
          txDate.getMonth() !== now.getMonth() ||
          txDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      } else if (dateRangeFilter === 'last_30_days') {
        const txDate = new Date(tx.date).getTime();
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        if (txDate < thirtyDaysAgo) return false;
      }

      return true;
    });
  }, [
    transactions,
    searchQuery,
    selectedCategory,
    selectedPaymentFilter,
    maxAmountFilter,
    selectedMonth,
    dateRangeFilter,
  ]);

  // Group filtered transactions by Date string (YYYY-MM-DD)
  const groupedTransactions = useMemo(() => {
    const groups: {
      dateKey: string;
      headerLabel: string;
      subtotal: number;
      isIncomeNet: boolean;
      items: Transaction[];
    }[] = [];

    const dateMap = new Map<string, Transaction[]>();

    filteredTransactions.forEach((tx) => {
      const dateKey = tx.date.split('T')[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push(tx);
    });

    // Sort by date descending
    const sortedDateKeys = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));

    sortedDateKeys.forEach((dateKey) => {
      const items = dateMap.get(dateKey)!;
      let net = 0;
      let hasExpense = false;
      let hasIncome = false;

      items.forEach((item) => {
        if (item.type === 'expense') {
          net -= item.amount;
          hasExpense = true;
        } else {
          net += item.amount;
          hasIncome = true;
        }
      });

      groups.push({
        dateKey,
        headerLabel: formatDateGroupHeader(items[0].date),
        subtotal: net,
        isIncomeNet: net > 0,
        items,
      });
    });

    return groups;
  }, [filteredTransactions]);

  // Sum of filtered items
  const totalDisplaySpent = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedPaymentFilter !== 'all' ? 1 : 0) +
    (dateRangeFilter !== 'all' ? 1 : 0) +
    (maxAmountFilter < 2500 ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPaymentFilter('all');
    setDateRangeFilter('all');
    setMaxAmountFilter(2500);
    setSelectedMonth('May');
  };

  return (
    <div className="flex flex-col w-full pb-28 pt-2 max-w-xl mx-auto">
      {/* Sticky Control Surface with Month Overview & Search */}
      <div className="px-4 md:px-6 pt-1 pb-2 flex flex-col gap-3">
        {/* Month Summary Header Card */}
        <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[24px]">calendar_today</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
                {selectedMonth === 'All' ? 'Overall Total' : `${selectedMonth} 2024 Total`}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-[20px] md:text-[22px] font-bold text-on-surface tabular-nums">
                  {formatCurrency(totalDisplaySpent, currency)}
                </span>
                <span className="text-xs text-outline font-medium">
                  {filteredTransactions.length} txns
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-surface-container-low pl-3 pr-8 py-1.5 rounded-full text-xs font-bold text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-[18px] absolute right-2 top-1.5 pointer-events-none text-on-surface-variant">
              expand_more
            </span>
          </div>
        </div>

        {/* Search Bar with Dynamic Clear */}
        <div className="relative w-full">
          <div className="flex items-center w-full h-12 bg-surface-container-lowest rounded-xl px-3.5 shadow-sm border border-surface-container/60 focus-within:border-primary/50 transition-all">
            <span className="material-symbols-outlined text-outline text-[22px] shrink-0">
              search
            </span>
            <input
              autoComplete="off"
              className="w-full h-full bg-transparent border-0 outline-none px-2.5 text-sm text-on-surface placeholder:text-outline font-medium"
              placeholder="Search transactions, merchants, notes..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                aria-label="Clear Search"
                onClick={() => setSearchQuery('')}
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface active:scale-90 transition-all shrink-0"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Category Filter Chips & Advanced Filter Trigger */}
      <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar px-4 md:px-6 py-1.5">
        {/* Advanced Filter Trigger Button */}
        <button
          onClick={() => setIsFilterSheetOpen(true)}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold shadow-xs shrink-0 active:scale-95 transition-all ${
            activeFiltersCount > 0
              ? 'bg-primary-fixed text-on-primary-fixed border border-primary/30'
              : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span>Filters ({activeFiltersCount})</span>
        </button>

        <div className="w-px h-5 bg-surface-variant shrink-0 mx-0.5" />

        {/* Quick Chips */}
        <button
          onClick={() => setSelectedCategory('all')}
          className={`filter-chip flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold shrink-0 active:scale-95 transition-all ${
            selectedCategory === 'all'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-container-lowest text-on-surface-variant shadow-xs border border-surface-container/60'
          }`}
          type="button"
        >
          <span>All</span>
          <span
            className={`text-[10px] py-0.5 px-1.5 rounded-full font-bold ${
              selectedCategory === 'all' ? 'bg-white/20' : 'bg-surface-container text-outline'
            }`}
          >
            {categoryCounts.all || 0}
          </span>
        </button>

        {[
          { id: 'dining', name: 'Food', countKey: 'dining' },
          { id: 'groceries', name: 'Groceries', countKey: 'groceries' },
          { id: 'transport', name: 'Transport', countKey: 'transport' },
          { id: 'shopping', name: 'Shopping', countKey: 'shopping' },
          { id: 'bills', name: 'Bills', countKey: 'bills' },
        ].map((chip) => {
          const isActive = selectedCategory === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setSelectedCategory(chip.id)}
              className={`filter-chip flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold shrink-0 active:scale-95 transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface-variant shadow-xs border border-surface-container/60'
              }`}
              type="button"
            >
              <span>{chip.name}</span>
              <span
                className={`text-[10px] py-0.5 px-1.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20' : 'bg-surface-container text-outline'
                }`}
              >
                {categoryCounts[chip.countKey] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Transaction Timeline Container */}
      <div className="px-4 md:px-6 flex flex-col gap-4 mt-2">
        {groupedTransactions.map((group) => (
          <div key={group.dateKey} className="flex flex-col gap-2">
            {/* Sticky Date Header */}
            <div className="flex items-center justify-between pt-1 pb-0.5 px-1">
              <span className="text-xs font-bold text-on-surface tracking-wide">
                {group.headerLabel}
              </span>
              <span
                className={`text-xs font-semibold tabular-nums ${
                  group.isIncomeNet ? 'text-primary' : 'text-outline'
                }`}
              >
                {group.isIncomeNet ? 'Net: ' : 'Subtotal: '}
                {group.subtotal > 0 ? '+' : '-'}
                {formatCurrency(group.subtotal, currency)}
              </span>
            </div>

            {/* Transaction Card Stack */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container/60 overflow-hidden flex flex-col divide-y divide-surface-container-low">
              {group.items.map((tx) => {
                const cat = CATEGORIES[tx.category] || CATEGORIES.more;
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="flex items-center justify-between p-3.5 transition-colors active:bg-surface-container-low/80 hover:bg-surface-container-low/40 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs"
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
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              backgroundColor: cat.bgColor,
                              color: cat.textColor,
                            }}
                          >
                            {cat.name}
                          </span>
                          <span className="text-outline text-xs">•</span>
                          <span className="text-xs text-outline truncate max-w-[140px]">
                            {tx.paymentMethod}
                          </span>
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
                      <span className="text-[11px] text-outline font-medium">
                        {new Date(tx.date).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container/60 my-4">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mb-3">
              <span className="material-symbols-outlined text-[32px]">manage_search</span>
            </div>
            <span className="text-base font-bold text-on-surface">No expenses found</span>
            <p className="text-xs text-outline mt-1 max-w-xs">
              Try tweaking your search term or clearing category filters to find what you're looking for.
            </p>
            <button
              onClick={resetAllFilters}
              className="mt-4 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
              type="button"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Bottom Filter Drawer / Sheet Modal */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop Blur */}
          <div
            onClick={() => setIsFilterSheetOpen(false)}
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
          />

          {/* Sheet Card Content */}
          <div className="relative w-full max-w-xl mx-auto max-h-[85vh] bg-surface-container-lowest rounded-t-3xl shadow-2xl flex flex-col overflow-hidden pb-safe z-10 border-t border-surface-container">
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-surface-variant rounded-full" />
            </div>

            {/* Sheet Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-on-surface">Filter Expenses</span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                    Active ({activeFiltersCount})
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsFilterSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Sheet Scrollable Options */}
            <div className="overflow-y-auto px-6 flex flex-col gap-5 py-4">
              {/* Date Range Filter */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
                  Date Range
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setDateRangeFilter('all')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all ${
                      dateRangeFilter === 'all'
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                    type="button"
                  >
                    All Dates
                  </button>
                  <button
                    onClick={() => setDateRangeFilter('this_month')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all ${
                      dateRangeFilter === 'this_month'
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                    type="button"
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setDateRangeFilter('last_30_days')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all ${
                      dateRangeFilter === 'last_30_days'
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                    type="button"
                  >
                    Last 30 Days
                  </button>
                </div>
              </div>

              {/* Amount Range Filter */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
                    Amount Range
                  </span>
                  <span className="text-xs font-bold text-on-surface tabular-nums">
                    {currency}0 — {currency}{maxAmountFilter}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2500"
                  step="50"
                  value={maxAmountFilter}
                  onChange={(e) => setMaxAmountFilter(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                />
              </div>

              {/* Payment Method */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
                  Payment Method
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Methods' },
                    { id: 'apple pay', label: 'Apple Pay' },
                    { id: 'chase', label: 'Chase Card' },
                    { id: 'cash', label: 'Cash' },
                    { id: 'direct deposit', label: 'Direct Deposit' },
                  ].map((pm) => {
                    const isSelected = selectedPaymentFilter === pm.id;
                    return (
                      <button
                        key={pm.id}
                        onClick={() => setSelectedPaymentFilter(pm.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-primary-fixed text-on-primary-fixed border border-primary/40'
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                        }`}
                        type="button"
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        )}
                        <span>{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sheet Footer Actions */}
            <div className="p-4 flex items-center gap-3 bg-surface-container-low/60 border-t border-surface-container-low">
              <button
                onClick={resetAllFilters}
                className="flex-1 h-12 rounded-full bg-surface-container text-on-surface font-bold text-xs active:scale-95 transition-transform"
                type="button"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterSheetOpen(false)}
                className="flex-[2] h-12 rounded-full bg-primary text-white font-bold text-xs shadow-sm active:scale-95 transition-transform"
                type="button"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
