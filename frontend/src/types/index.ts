export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Customer {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  address?: string;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  createdBy?: { id: number; name: string; email: string };
  _count?: { followUps: number; challans: number };
}

export interface FollowUp {
  id: number;
  customerId: number;
  notes: string;
  followUpDate: string;
  completed: boolean;
  createdAt: string;
  createdBy: { id: number; name: string };
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockQuantity: number;
  warehouseLocation?: string;
  isLowStock: boolean;
  createdAt: string;
  _count?: { stockMovements: number };
}

export interface StockMovement {
  id: number;
  productId: number;
  quantity: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdAt: string;
  createdBy: { id: number; name: string; role: string };
}

export interface ChallanItem {
  id: number;
  challanId: number;
  productId: number;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
  product?: { id: number; currentStock: number; minStockQuantity: number };
}

export interface Challan {
  id: number;
  challanNumber: string;
  customerId: number;
  totalQuantity: number;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  customer?: { id: number; name: string; businessName?: string; mobile?: string; email?: string };
  createdBy?: { id: number; name: string; email?: string; role?: string };
  items?: ChallanItem[];
  _count?: { items: number };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
