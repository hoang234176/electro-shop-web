import axios from "axios";
import { getToken } from "../utils/tokenUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const GetAllUser = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: {
                'Authorization': `${localStorage.getItem('token')}`
            }
        });
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response) {
                throw {
                    status: 500,
                    message: "Lỗi kết nối máy chủ"
                }
            } else {
                throw {
                    status: error.response?.status,
                    message: error.response?.data.message
                }
            }
        } else {
            throw {
                status: 500,
                message: "Lỗi hệ thống không xác định"
            }
        }
    }
}

export const DeleteUser = async (userId: string) => {
    try {
        const res = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
            headers: {
                'Authorization': `${localStorage.getItem('token')}`
            }
        });
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response) {
                throw {
                    status: 500,
                    message: "Lỗi kết nối máy chủ"
                }
            }
            else {
                throw {
                    status: error.response?.status,
                    message: error.response?.data.message
                }
            }
        }
        else {
            throw {
                status: 500,
                message: "Lỗi hệ thống không xác định"
            }
        }
    }
}

/**
 * @description Xóa một sản phẩm (yêu cầu quyền ADMIN)
 * @param productId ID của sản phẩm cần xóa
 */
export const deleteProduct = async (productId: string) => {
    try {
        const res = await axios.delete(`${API_BASE_URL}/admin/products/${productId}`, {
            headers: {
                'Authorization': `${localStorage.getItem('token')}`
            }
        });
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
 * @description Thêm một sản phẩm mới (yêu cầu quyền ADMIN)
 * @param formData Dữ liệu sản phẩm dưới dạng FormData (để hỗ trợ upload file ảnh)
 */
export const addProduct = async (formData: FormData) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/admin/addProduct`, formData, {
            headers: {
                'Authorization': `${localStorage.getItem('token')}`
            }
        });
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

export const getAllOrdersAdmin = async () => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_BASE_URL}/admin/orders/all`, {
            headers: {
                Authorization: `${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lỗi kết nối đến server. Không thể lấy danh sách đơn hàng.');
    }
};

export const updateOrderStatusAdmin = async (orderId: string, status: string, rejectCancel: boolean = false) => {
    try {
        const token = getToken();
        const response = await axios.put(`${API_BASE_URL}/admin/orders/${orderId}/status`, { status, rejectCancel }, {
            headers: {
                Authorization: `${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lỗi kết nối đến server. Không thể cập nhật trạng thái.');
    }
};

export const updateProductAdmin = async (productId: string, formData: FormData) => {
    try {
        const token = getToken();
        const res = await axios.put(`${API_BASE_URL}/admin/products/${productId}`, formData, {
            headers: {
                Authorization: `${token}`
            }
        });
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
}

export const importProductAdmin = async (productId: string, formData: FormData) => {
    try {
        const token = getToken();
        const res = await axios.put(`${API_BASE_URL}/admin/products/${productId}/import`, formData, {
            headers: {
                Authorization: `${token}`
            }
        });
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
}
