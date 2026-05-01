import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface AddProductPayload {
    name: string;
    brand: string;
    category: string;
    importPrice: number;
    price: number;
    variants: { color: string; image: string | File; quantity: number }[];
    description: string;
    specifications: Record<string, string>;
}

export const getAllProducts = async (filters = {}) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/products`, {
            params: filters,
        });
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response) {
                throw { status: 500, message: "Lỗi kết nối máy chủ" };
            }
            // Giả định lỗi 404 là không tìm thấy sản phẩm
            if (error.response.status === 404) {
                return []; // Trả về mảng rỗng
            }
            throw { status: error.response?.status, message: error.response?.data.message };
        } else {
            throw { status: 500, message: "Lỗi hệ thống không xác định" };
        }
    }
};

export const getProductById = async (productId: string) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/products/${productId}`);
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response) {
                throw { status: 500, message: "Lỗi kết nối máy chủ" };
            }
            throw { status: error.response?.status, message: error.response?.data.message };
        } else {
            throw { status: 500, message: "Lỗi hệ thống không xác định" };
        }
    }
};

export const getNewProducts = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/products/new`);
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response) {
                throw { status: 500, message: "Lỗi kết nối máy chủ" };
            }
            if (error.response.status === 404) {
                return []; // Trả về mảng rỗng nếu không có sản phẩm mới
            }
            throw { status: error.response?.status, message: error.response?.data.message };
        } else {
            throw { status: 500, message: "Lỗi hệ thống không xác định" };
        }
    }
};

export const getProductsSaleTop = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/products/sale-top`);
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response) {
                throw { status: 500, message: "Lỗi kết nối máy chủ" };
            }
            if (error.response.status === 404) {
                return []; // Trả về mảng rỗng nếu không có sản phẩm bán chạy
            }
            throw { status: error.response?.status, message: error.response?.data.message };
        } else {
            throw { status: 500, message: "Lỗi hệ thống không xác định" };
        }
    }
};