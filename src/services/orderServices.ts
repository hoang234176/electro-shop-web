import axios from 'axios';
import { getToken } from '../utils/tokenUtils';
import { API_BASE_URL } from './apiServices';

export const createOrder = async (orderData: any) => {
    try {
        const token = getToken();
        const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
            headers: {
                Authorization: `${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lỗi kết nối đến server. Không thể tạo đơn hàng.');
    }
};

export const getUserOrders = async () => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
            headers: {
                Authorization: `${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lỗi kết nối đến server. Không thể lấy danh sách đơn hàng.');
    }
};

export const cancelOrder = async (orderId: string) => {
    try {
        const token = getToken();
        const response = await axios.put(`${API_BASE_URL}/orders/${orderId}/cancel`, {}, {
            headers: {
                Authorization: `${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lỗi kết nối đến server. Không thể hủy đơn hàng.');
    }
};