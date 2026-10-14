export type CategoryId =
  | 'dining'
  | 'groceries'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'fun'
  | 'health'
  | 'income'
  | 'more';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  textColor: string;
  iconName: string;
}

export type PaymentMethodId =
  | 'apple_pay_chase'
  | 'cash'
  | 'amex'
  | 'debit'
  | 'direct_deposit'
  | 'credit';

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  detail: string;
  icon: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number; // positive for expense or income, sign indicated by type
  type: 'expense' | 'income';
  category: CategoryId;
  paymentMethod: string;
  date: string; // ISO string e.g. 2024-05-18T11:42:00
  note?: string;
  receiptName?: string;
  receiptUrl?: string;
}

export interface BudgetConfig {
  monthlyCap: number;
  initialBalance: number;
  categoryBudgets: Record<string, number>;
}

export type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

export interface FilterOptions {
  search: string;
  category: string; // 'all' or CategoryId
  dateRange: 'all' | 'this_month' | 'last_30_days' | 'custom';
  paymentMethod: string; // 'all' or payment method name
  minAmount?: number;
  maxAmount?: number;
}
