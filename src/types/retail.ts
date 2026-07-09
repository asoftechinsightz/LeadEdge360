/** RetailEdge360 types */

export type RetailRisk = 'High' | 'Medium' | 'Low';

export interface RetailProduct {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  store?: string;
  stock?: number;
  price?: number;
  predictedShelfDays?: number;
  risk?: RetailRisk | string;
  engine?: string;
  orgId?: string;
}

export interface ProductsResponse {
  products: RetailProduct[];
}

export interface RetailKpis {
  total?: number;
  highRisk?: number;
  inventoryValue?: number;
  atRiskValue?: number;
  savedSoFar?: number;
  byCategory?: Array<{ name: string; value: number }>;
  byRisk?: Array<{ name: string; value: number }>;
}
