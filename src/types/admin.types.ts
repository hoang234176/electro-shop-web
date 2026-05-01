// --- QUẢN LÝ SẢN PHẨM ---
export interface AdminDisplayProduct {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    imageUrl: string;
}

// --- QUẢN LÝ ĐƠN HÀNG ---
export interface DisplayOrder {
    id: string;
    customer: string;
    phone: string;
    date: string;
    total: number;
    status: string;
    payment: string;
    paymentStatus: string;
    cancelRequest: boolean;
}

export interface RawOrder {
    _id: string;
    user?: { fullname?: string; phone?: string };
    createdAt: string;
    totalAmount: number;
    orderStatus: string;
    paymentMethod: string;
    paymentStatus: string;
    cancelRequest?: boolean;
    [key: string]: unknown;
}

// --- NHẬP VÀ SỬA SẢN PHẨM ---
export interface ExistingVariant {
    color: string;
    currentQuantity: number;
    addQuantity: string;
    image: string | File;
    isOldImage: boolean;
}

export interface NewVariant {
    color: string;
    quantity: string;
    image: File | null;
}

export interface ProductBaseInfo {
    name: string;
    brand: string;
    category: string;
    importPrice: number;
    price: number;
    description: string;
    specifications: Record<string, string | number>;
}

export interface EditApiProductData {
    name?: string;
    brand?: { name?: string };
    category?: { name?: string };
    importPrice?: number | string;
    price?: number | string;
    description?: string;
    variants?: { color: string; quantity?: number; image?: string; }[];
    specifications?: Record<string, string | number>;
}

// --- THÊM SẢN PHẨM (TÍCH HỢP GEMINI) ---
export interface GeminiVariant { color?: string; quantity?: string; image?: string; }
export interface GeminiSpec { label?: string; value?: string; }
export interface GeminiProductData { name?: string; brand?: string; category?: string; importPrice?: string; price?: string; description?: string; variants?: GeminiVariant[]; specifications?: GeminiSpec[]; }

// --- DASHBOARD ---
export interface RevenueData { name: string; revenue: number; cost: number; profit: number; }
export interface OrderStatusData { name: string; value: number; }
export interface DashboardProduct { _id?: string; id?: string; importPrice?: string | number; }
export interface DashboardOrderItem { product?: DashboardProduct | string; quantity?: number | string; }
export interface DashboardOrder { orderStatus?: string; createdAt?: string | Date; totalAmount?: number | string; items?: DashboardOrderItem[]; }