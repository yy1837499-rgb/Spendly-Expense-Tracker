import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryId, Transaction } from '../types';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/constants';

interface AddExpenseProps {
  onClose: () => void;
  onSaved: (tx: Transaction) => void;
  initialTransaction?: Transaction | null;
}

export const AddExpense: React.FC<AddExpenseProps> = ({
  onClose,
  onSaved,
  initialTransaction,
}) => {
  const {
    currency,
    setCurrency,
    addTransaction,
    updateTransaction,
    budget,
    categorySpending,
  } = useExpenses();

  const [amountStr, setAmountStr] = useState<string>(
    initialTransaction ? initialTransaction.amount.toString() : '42.50'
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(
    initialTransaction ? initialTransaction.category : 'dining'
  );
  const [selectedPayment, setSelectedPayment] = useState<string>(
    initialTransaction ? initialTransaction.paymentMethod : 'Chase Sapphire •••• 4821 (Apple Pay)'
  );
  const [dateOption, setDateOption] = useState<'today' | 'yesterday' | 'other'>('today');
  const [customDateTime, setCustomDateTime] = useState<string>(() => {
    if (initialTransaction) {
      return initialTransaction.date.substring(0, 16);
    }
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().substring(0, 16);
  });
  const [title, setTitle] = useState<string>(
    initialTransaction ? initialTransaction.title : ''
  );
  const [note, setNote] = useState<string>(
    initialTransaction?.note || ''
  );
  const [receiptName, setReceiptName] = useState<string | null>(
    initialTransaction?.receiptName || null
  );
  const [receiptUrl, setReceiptUrl] = useState<string | null>(
    initialTransaction?.receiptUrl || null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus amount input on mount if not editing
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Calculate remaining category budget for insight microtag
  const catCap = budget.categoryBudgets[selectedCategory] || 600;
  const catSpent = categorySpending[selectedCategory] || 0;
  const catRemaining = Math.max(0, catCap - catSpent);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow valid decimal numbers
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
      setAmountStr(val);
      setErrorMessage(null);
    }
  };

  const handleDateShortcut = (choice: 'today' | 'yesterday' | 'other') => {
    setDateOption(choice);
    const now = new Date();
    if (choice === 'today') {
      const offset = now.getTimezoneOffset() * 60000;
      setCustomDateTime(new Date(now.getTime() - offset).toISOString().substring(0, 16));
    } else if (choice === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const offset = yesterday.getTimezoneOffset() * 60000;
      setCustomDateTime(new Date(yesterday.getTime() - offset).toISOString().substring(0, 16));
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setAmountStr('0.00');
    setTitle('');
    setNote('');
    setSelectedCategory('dining');
    setReceiptName(null);
    setReceiptUrl(null);
    setErrorMessage(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter an amount greater than 0');
      if (amountInputRef.current) amountInputRef.current.focus();
      return;
    }

    // Default title if empty
    const finalTitle = title.trim() || `${CATEGORIES[selectedCategory]?.name || 'Expense'}`;

    // Construct date ISO string
    let finalDate = new Date().toISOString();
    if (customDateTime) {
      try {
        finalDate = new Date(customDateTime).toISOString();
      } catch {
        finalDate = new Date().toISOString();
      }
    }

    setIsSaving(true);

    setTimeout(() => {
      let savedTx: Transaction;
      if (initialTransaction) {
        updateTransaction(initialTransaction.id, {
          title: finalTitle,
          amount: parsedAmount,
          category: selectedCategory,
          paymentMethod: selectedPayment,
          date: finalDate,
          note: note.trim() || undefined,
          receiptName: receiptName || undefined,
          receiptUrl: receiptUrl || undefined,
        });
        savedTx = {
          ...initialTransaction,
          title: finalTitle,
          amount: parsedAmount,
          category: selectedCategory,
          paymentMethod: selectedPayment,
          date: finalDate,
          note: note.trim() || undefined,
          receiptName: receiptName || undefined,
          receiptUrl: receiptUrl || undefined,
        };
      } else {
        savedTx = addTransaction({
          title: finalTitle,
          amount: parsedAmount,
          type: 'expense',
          category: selectedCategory,
          paymentMethod: selectedPayment,
          date: finalDate,
          note: note.trim() || undefined,
          receiptName: receiptName || undefined,
          receiptUrl: receiptUrl || undefined,
        });
      }

      setIsSaving(false);
      setSaveSuccess(true);
      setShowToast(true);

      // Trigger celebratory micro-confetti
      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#006948', '#85f8c4', '#4648d4'],
        });
      } catch {
        // ignore
      }

      setTimeout(() => {
        onSaved(savedTx);
      }, 1000);
    }, 450);
  };

  return (
    <div className="flex flex-col w-full px-4 md:px-6 pb-28 pt-2 gap-4 max-w-xl mx-auto">
      {/* Subheader Card */}
      <div className="pt-1 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            aria-label="Cancel"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <span className="text-lg font-bold text-on-surface">
            {initialTransaction ? 'Edit Expense' : 'New Expense'}
          </span>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded-full bg-surface-container-low text-on-surface-variant text-xs font-semibold hover:bg-surface-container transition-all active:scale-95 flex items-center gap-1"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          Reset
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Hero Amount Display Card */}
        <div className="w-full bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container/60 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Currency Switcher Pill */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-full mb-2 shadow-inner">
            {[
              { code: 'USD ($)', sym: '$' },
              { code: 'EUR (€)', sym: '€' },
              { code: 'GBP (£)', sym: '£' },
            ].map((c) => (
              <button
                key={c.sym}
                onClick={() => setCurrency(c.sym)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  currency === c.sym
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                {c.code}
              </button>
            ))}
          </div>

          {/* Live Editable Amount Area */}
          <div className="relative flex items-center justify-center w-full py-2">
            <span className="text-[36px] font-extrabold text-primary mr-1 select-none tabular-nums">
              {currency}
            </span>
            <div className="relative flex items-center">
              <input
                ref={amountInputRef}
                aria-label="Expense Amount"
                className="bg-transparent text-center text-[36px] md:text-[42px] font-extrabold text-on-surface focus:outline-none w-56 tracking-tight tabular-nums"
                inputMode="decimal"
                type="text"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0.00"
                autoFocus
              />
              <span className="inline-block w-[3px] h-9 bg-primary animate-pulse -ml-1 rounded-full" />
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs text-error font-semibold mt-1 animate-shake">
              {errorMessage}
            </p>
          )}

          {/* Spending insight micro-tag */}
          <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-primary text-xs font-semibold">
            <span
              className="material-symbols-outlined text-[15px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              insights
            </span>
            <span>
              Within May {CATEGORIES[selectedCategory]?.name} Budget ({currency}
              {catRemaining.toFixed(0)} left)
            </span>
          </div>
        </div>

        {/* Merchant / Description Input Field */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-3.5 shadow-sm border border-surface-container/60 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-outline text-[20px]">storefront</span>
          <input
            className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none font-medium"
            placeholder="Merchant or title (e.g. Whole Foods Market, Starbucks)"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Category Selector Section */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-bold text-on-surface">Select Category</span>
            <span className="text-xs text-primary font-bold">8 Options</span>
          </div>

          {/* Categories Grid (8 options matching design) */}
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { id: 'dining', name: 'Dining', emoji: '🍔' },
              { id: 'groceries', name: 'Groceries', emoji: '🛒' },
              { id: 'transport', name: 'Transport', emoji: '🚗' },
              { id: 'shopping', name: 'Shopping', emoji: '🛍️' },
              { id: 'bills', name: 'Bills', emoji: '💡' },
              { id: 'fun', name: 'Fun', emoji: '🎬' },
              { id: 'health', name: 'Health', emoji: '💊' },
              { id: 'more', name: 'More', emoji: '➕' },
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as CategoryId)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all active:scale-95 relative border ${
                    isSelected
                      ? 'bg-primary-fixed text-on-primary-fixed border-primary/40 shadow-xs ring-1 ring-primary'
                      : 'bg-surface-container-lowest text-on-surface border-surface-container/60 hover:bg-surface-container-low shadow-xs'
                  }`}
                  type="button"
                >
                  <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center mb-1 shadow-xs text-xl">
                    <span>{cat.emoji}</span>
                  </div>
                  <span className="text-xs font-bold text-center leading-tight truncate w-full">
                    {cat.name}
                  </span>

                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[13px] font-bold">
                        check
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Time Card */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-3.5 shadow-sm border border-surface-container/60 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              </div>
              <div>
                <div className="text-[11px] text-on-surface-variant font-medium">Date & Time</div>
                <div className="text-xs font-bold text-on-surface">
                  {new Date(customDateTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            <span className="text-xs text-primary font-bold bg-surface-container-low px-2.5 py-0.5 rounded-full">
              {new Date(customDateTime).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleDateShortcut('today')}
              className={`flex-1 py-1.5 px-2 rounded-full text-xs font-bold text-center transition-all ${
                dateOption === 'today'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
              type="button"
            >
              Today
            </button>

            <button
              onClick={() => handleDateShortcut('yesterday')}
              className={`flex-1 py-1.5 px-2 rounded-full text-xs font-bold text-center transition-all ${
                dateOption === 'yesterday'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
              type="button"
            >
              Yesterday
            </button>

            <label
              className={`flex-1 py-1.5 px-2 rounded-full text-xs font-bold text-center transition-all flex items-center justify-center gap-1 cursor-pointer ${
                dateOption === 'other'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span>Other</span>
              <span className="material-symbols-outlined text-[14px]">calendar_month</span>
              <input
                type="datetime-local"
                value={customDateTime}
                onChange={(e) => {
                  setDateOption('other');
                  setCustomDateTime(e.target.value);
                }}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="w-full flex flex-col gap-2">
          <span className="text-sm font-bold text-on-surface px-1">Payment Method</span>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedPayment.includes(method.name);
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(`${method.name} ${method.detail}`)}
                  className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-primary-fixed text-on-primary-fixed border-primary/40 shadow-xs'
                      : 'bg-surface-container-lowest text-on-surface border-surface-container/60 hover:bg-surface-container-low shadow-xs'
                  }`}
                  type="button"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface shrink-0">
                    <span className="material-symbols-outlined text-[18px]">
                      {method.icon}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">{method.name}</div>
                    <div className="text-[11px] text-on-surface-variant opacity-85">
                      {method.detail}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[18px] ml-1 text-primary">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes & Receipt Section */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-3.5 shadow-sm border border-surface-container/60 flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-outline text-[20px]">edit_note</span>
            <input
              className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
              placeholder="Add note (e.g., Team lunch with Alex)"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Attachment Strip */}
          <div className="flex items-center justify-between pt-1 border-t border-surface-container-low">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors active:scale-95 text-xs font-bold"
              type="button"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">
                add_a_photo
              </span>
              <span>{receiptName ? 'Change receipt photo' : 'Add receipt photo'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleReceiptUpload}
            />

            {receiptName && (
              <div className="text-xs text-primary font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">attachment</span>
                <span className="truncate max-w-[120px]">{receiptName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setReceiptName(null);
                    setReceiptUrl(null);
                  }}
                  className="text-error hover:text-error/80"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )}
          </div>

          {receiptUrl && (
            <div className="relative mt-2 rounded-xl overflow-hidden max-h-36 border border-surface-container">
              <img
                src={receiptUrl}
                alt="Receipt preview"
                className="w-full object-cover max-h-36"
              />
            </div>
          )}
        </div>

        {/* Bottom Prominent Button Card */}
        <div className="pt-2 pb-6 flex flex-col items-center gap-2">
          <button
            onClick={() => handleSubmit()}
            disabled={isSaving}
            className={`w-full h-12 rounded-full font-bold text-base shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
              saveSuccess
                ? 'bg-primary text-white ring-2 ring-primary-fixed'
                : 'bg-primary text-white hover:bg-primary-container'
            }`}
            type="button"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">
                  sync
                </span>
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  done_all
                </span>
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check
                </span>
                <span>{initialTransaction ? 'Update Expense' : 'Save Expense'}</span>
              </>
            )}
          </button>

          {/* Floating Toast Notification */}
          {showToast && (
            <div className="fixed bottom-20 inset-x-4 max-w-sm mx-auto bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 z-50 animate-bounce">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-inverse-primary text-[22px]">
                  check_circle
                </span>
                <span className="text-xs font-medium">
                  Expense of{' '}
                  <strong className="text-inverse-primary font-bold">
                    {currency}
                    {amountStr}
                  </strong>{' '}
                  saved!
                </span>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-inverse-primary font-bold text-xs"
                type="button"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
