export interface Property {
  id: string;
  address: string;
  price: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: 'single-family' | 'multi-family' | 'commercial' | 'condo';
  yearBuilt: number;
  roi: number;
  monthlyRent: number;
  expenses: number;
  netIncome: number;
  capRate: number;
  location: {
    city: string;
    state: string;
    zip: string;
  };
}

export interface MarketData {
  location: string;
  averagePrice: number;
  priceChange: number;
  averageRent: number;
  rentChange: number;
  vacancyRate: number;
  capRate: number;
  appreciation: number;
  inventory: number;
}

export interface SimulationInput {
  purchasePrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  monthlyRent: number;
  propertyTax: number;
  insurance: number;
  maintenance: number;
  vacancy: number;
  propertyManagement: number;
}

export interface SimulationResult {
  monthlyMortgage: number;
  totalMonthlyExpenses: number;
  netCashFlow: number;
  capRate: number;
  cashOnCashReturn: number;
  totalReturn: number;
  breakEvenPoint: number;
}