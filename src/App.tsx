import React, { useState } from 'react';
import { ExpenseProvider, useExpenses } from './context/ExpenseContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { ExpenseHistory } from './components/ExpenseHistory';
import { AddExpense } from './components/AddExpense';
import { Analytics } from './components/Analytics';
import { BudgetsTab } from './components/BudgetsTab';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { TransferModal } from './components/TransferModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ProfileModal } from './components/ProfileModal';
import { Transaction } from './types';

function SpendlyMainApp() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { transactions, currency, deleteTransaction } = useExpenses();

  // Export CSV handler
  const handleExportCSV = () => {
    if (!transactions.length) return;
    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method', 'Note'];
    const rows = transactions.map((t) => [
      `"${t.date}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.type}"`,
      `"${t.category}"`,
      t.amount.toFixed(2),
      `"${t.paymentMethod}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Spendly_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setCurrentTab('add-expense');
  };

  const handleSavedExpense = () => {
    setEditingTransaction(null);
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center">
      {/* Responsive Mobile Container */}
      <div className="w-full max-w-lg min-h-screen flex flex-col bg-surface shadow-2xl relative border-x border-surface-container/40">
        {/* Header */}
        <Header
          currentTab={currentTab}
          onNavigate={(tab) => {
            setEditingTransaction(null);
            setCurrentTab(tab);
          }}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Main Content View */}
        <main className="flex-1 flex flex-col relative w-full overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              onOpenTransfer={() => setIsTransferOpen(true)}
              onExportData={handleExportCSV}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpenseHistory
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
            />
          )}

          {currentTab === 'add-expense' && (
            <AddExpense
              initialTransaction={editingTransaction}
              onClose={() => {
                setEditingTransaction(null);
                setCurrentTab('dashboard');
              }}
              onSaved={handleSavedExpense}
            />
          )}

          {currentTab === 'statistics' && (
            <Analytics onExportReport={handleExportCSV} />
          )}

          {currentTab === 'budgets' && <BudgetsTab />}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onNavigate={(tab) => {
            if (tab === 'add-expense') {
              setEditingTransaction(null);
            }
            setCurrentTab(tab);
          }}
        />

        {/* Transaction Detail & Edit Modal */}
        <TransactionDetailModal
          transaction={selectedTransaction}
          currency={currency}
          onClose={() => setSelectedTransaction(null)}
          onEdit={handleStartEdit}
          onDelete={(id) => deleteTransaction(id)}
        />

        {/* Transfer Modal */}
        {isTransferOpen && (
          <TransferModal onClose={() => setIsTransferOpen(false)} />
        )}

        {/* Notifications Modal */}
        {isNotificationsOpen && (
          <NotificationsModal onClose={() => setIsNotificationsOpen(false)} />
        )}

        {/* Profile Modal */}
        {isProfileOpen && (
          <ProfileModal
            onClose={() => setIsProfileOpen(false)}
            onExport={handleExportCSV}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ExpenseProvider>
      <SpendlyMainApp />
    </ExpenseProvider>
  );
}
