import axios from "axios";
import { API_BASE_URL } from "./apiServices";
import { getToken } from "../utils/tokenUtils";

// ==================================================================
// INTERFACES (Định nghĩa cấu trúc dữ liệu)
// ==================================================================

// Interface cho một sản phẩm đã được populate trong giỏ hàng
interface PopulatedProduct {
    _id: string;
    name: string;
    price: number;
    variants: {
        color: string;
        quantity: number;
        image?: string;
    }[];
}

// Interface cho một item trong giỏ hàng
export interface CartItem {
    product: PopulatedProduct;
    color: string;
    quantity: number;
}

// Interface cho toàn bộ giỏ hàng
export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
    createdAt: string;
    updatedAt: string;
}

// Interfaces cho payloads (dữ liệu gửi đi)
export interface AddToCartPayload {
    productId: string;
    color: string;
    quantity: number;
}

export interface UpdateQuantityPayload {
    productId: string;
    color: string;
    quantity: number;
}

export interface RemoveItemPayload {
    productId: string;
    color: string;
}

export interface RemoveMultipleItemsPayload {
    itemsToRemove: {
        productId: string;
        color: string;
    }[];
}

// Hàm helper để xử lý lỗi API chung
const handleApiError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        if (!error.response) {
            throw { status: 500, message: "Lỗi kết nối máy chủ" };
        }
        throw { status: error.response?.status, message: error.response?.data.message };
    } else {
        throw { status: 500, message: "Lỗi hệ thống không xác định" };
    }
};

// ==================================================================
// SERVICES (Các hàm gọi API)
// ==================================================================

/**
 * @description Lấy giỏ hàng của người dùng hiện tại
 */
export const getCart = async (): Promise<Cart> => {
    try {
        const res = await axios.get(`${API_BASE_URL}/cart`, {
            headers: { 'Authorization': getToken() }
        });
        return res.data;
    } catch (error) {
        handleApiError(error);
        throw error; // Dòng này sẽ không được thực thi nhưng cần để TypeScript không báo lỗi
    }
};

/**
 * @description Thêm một sản phẩm vào giỏ hàng
 */
export const addToCart = async (payload: AddToCartPayload): Promise<{ message: string, cart: Cart }> => {
    try {
        const res = await axios.post(`${API_BASE_URL}/cart/add`, payload, {
            headers: { 'Authorization': getToken() }
        });
        return res.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * @description Cập nhật số lượng của một sản phẩm trong giỏ
 */
export const updateCartQuantity = async (payload: UpdateQuantityPayload): Promise<{ message: string, cart: Cart }> => {
    try {
        const res = await axios.put(`${API_BASE_URL}/cart/update`, payload, {
            headers: { 'Authorization': getToken() }
        });
        return res.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * @description Xóa một sản phẩm khỏi giỏ hàng
 */
export const removeFromCart = async (payload: RemoveItemPayload): Promise<{ message: string, cart: Cart }> => {
    try {
        const res = await axios.post(`${API_BASE_URL}/cart/remove`, payload, {
            headers: { 'Authorization': getToken() }
        });
        return res.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * @description Xóa toàn bộ sản phẩm trong giỏ hàng
 */
export const clearCart = async (): Promise<{ message: string, cart: Cart }> => {
    try {
        const res = await axios.delete(`${API_BASE_URL}/cart/clear`, {
            headers: { 'Authorization': getToken() }
        });
        return res.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};