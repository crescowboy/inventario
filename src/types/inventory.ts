export interface Article {
  id: string;
  code: string;
  name: string;
  brand: string;
  units: number;
  unitPrice: number;
  totalValue: number;
  detal: number;
  mayor: number;
  reference: string;
  section: string;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  articles: Article[];
}

export interface RecentActivity {
  id: string;
  articleCode: string;
  articleName: string;
  action: 'created' | 'updated' | 'deleted';
  timestamp: string;
  details?: string;
}

export interface InventoryState {
  articles: Article[];
  sections: Section[];
  recentActivities: RecentActivity[];
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};