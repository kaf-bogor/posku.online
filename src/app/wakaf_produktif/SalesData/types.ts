export interface TransactionData {
  date: string;
  previous_date: string;
  current_date: string;
  previous_count: number;
  previous_omzet: number;
  current_count: number;
  current_omzet: number;
  growth_percent: number;
}

export interface Transaction {
  date: string;
  previousDate: string;
  currentDate: string;
  previousCount: number;
  previousOmzet: number;
  currentCount: number;
  currentOmzet: number;
  growthPercent: number;
}
