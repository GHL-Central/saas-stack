
export interface SimulationData {
  month: number;
  newCustomers: number;
  totalCustomers: number;
  churnedCustomers: number;
  mrr: number;
  cumulativeRevenue: number;
  oneTimeComparison: number;
}

export interface SimulationParams {
  startingCustomers: number;
  monthlyNewCustomers: number;
  arpu: number; // Average Revenue Per User
  churnRate: number; // Percentage
  months: number;
  oneTimeSalePrice: number; // For comparison
}

export interface AIAnalysis {
  headline: string;
  insights: string[];
  verdict: string;
}
