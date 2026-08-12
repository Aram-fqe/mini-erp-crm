import { apiClient } from './client';
import {
  Customer,
  FollowUp,
  Product,
  StockMovement,
  Challan,
  Pagination,
} from '../types';

// Auth API Services
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (name: string, email: string, password: string) => {
    const res = await apiClient.post('/auth/register', { name, email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
};

// Customer API Services
export const customerApi = {
  getCustomers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerType?: string;
  }) => {
    const res = await apiClient.get<{ success: boolean; data: { customers: Customer[]; pagination: Pagination } }>(
      '/customers',
      { params }
    );
    return res.data.data;
  },
  getCustomerById: async (id: number) => {
    const res = await apiClient.get<{ success: boolean; data: { customer: Customer } }>(`/customers/${id}`);
    return res.data.data.customer;
  },
  createCustomer: async (data: Partial<Customer>) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: { customer: Customer } }>(
      '/customers',
      data
    );
    return res.data;
  },
  updateCustomer: async (id: number, data: Partial<Customer>) => {
    const res = await apiClient.put<{ success: boolean; message: string; data: { customer: Customer } }>(
      `/customers/${id}`,
      data
    );
    return res.data;
  },
  deleteCustomer: async (id: number) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/customers/${id}`);
    return res.data;
  },
  getFollowUps: async (customerId: number) => {
    const res = await apiClient.get<{ success: boolean; data: { followUps: FollowUp[] } }>(
      `/customers/${customerId}/followups`
    );
    return res.data.data.followUps;
  },
  createFollowUp: async (customerId: number, data: { notes: string; followUpDate?: string }) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: { followUp: FollowUp } }>(
      `/customers/${customerId}/followups`,
      data
    );
    return res.data;
  },
};

// Product API Services
export const productApi = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    lowStock?: boolean;
  }) => {
    const res = await apiClient.get<{ success: boolean; data: { products: Product[]; pagination: Pagination } }>(
      '/products',
      { params }
    );
    return res.data.data;
  },
  getCategories: async () => {
    const res = await apiClient.get<{ success: boolean; data: { categories: string[] } }>('/products/categories');
    return res.data.data.categories;
  },
  getProductById: async (id: number) => {
    const res = await apiClient.get<{ success: boolean; data: { product: Product } }>(`/products/${id}`);
    return res.data.data.product;
  },
  createProduct: async (data: Partial<Product>) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: { product: Product } }>(
      '/products',
      data
    );
    return res.data;
  },
  updateProduct: async (id: number, data: Partial<Product>) => {
    const res = await apiClient.put<{ success: boolean; message: string; data: { product: Product } }>(
      `/products/${id}`,
      data
    );
    return res.data;
  },
  adjustStock: async (
    id: number,
    data: { quantity: number; movementType: 'IN' | 'OUT'; reason: string }
  ) => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: { product: Product; movement: StockMovement };
    }>(`/products/${id}/stock`, data);
    return res.data;
  },
  getStockMovements: async (id: number) => {
    const res = await apiClient.get<{ success: boolean; data: { movements: StockMovement[] } }>(
      `/products/${id}/stock-movements`
    );
    return res.data.data.movements;
  },
  uploadImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: { product: Product };
    }>(`/products/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};

// Challan API Services
export const challanApi = {
  getChallans: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const res = await apiClient.get<{ success: boolean; data: { challans: Challan[]; pagination: Pagination } }>(
      '/challans',
      { params }
    );
    return res.data.data;
  },
  getChallanById: async (id: number) => {
    const res = await apiClient.get<{ success: boolean; data: { challan: Challan } }>(`/challans/${id}`);
    return res.data.data.challan;
  },
  createChallan: async (data: { customerId: number; items: { productId: number; quantity: number }[] }) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: { challan: Challan } }>(
      '/challans',
      data
    );
    return res.data;
  },
  confirmChallan: async (id: number) => {
    const res = await apiClient.put<{ success: boolean; message: string; data: { challan: Challan } }>(
      `/challans/${id}/confirm`
    );
    return res.data;
  },
  cancelChallan: async (id: number) => {
    const res = await apiClient.put<{ success: boolean; message: string; data: { challan: Challan } }>(
      `/challans/${id}/cancel`
    );
    return res.data;
  },
  downloadPdf: async (id: number) => {
    const res = await apiClient.get(`/challans/${id}/pdf`, {
      responseType: 'blob',
    });
    // Create a temporary object URL and trigger a download
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `challan-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
