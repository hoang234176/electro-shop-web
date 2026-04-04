import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ==================================================================
// INTERFACES (Định nghĩa cấu trúc dữ liệu)
// ==================================================================

/**
 * @description Dữ liệu gửi lên khi thêm sản phẩm (khớp với form AddProduct.tsx)
 */
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


// ==================================================================
// SERVICES (Các hàm gọi API)
// ==================================================================

/**
 * @description Lấy danh sách tất cả sản phẩm (route public)
 */
export const getAllProducts = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/products`);
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

/**
 * @description Lấy chi tiết một sản phẩm bằng ID (route public)
 * @param productId ID của sản phẩm cần lấy
 */
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

/**
 * @description Lấy danh sách sản phẩm mới (trong vòng 14 ngày, giới hạn 8 sản phẩm)
 */
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
