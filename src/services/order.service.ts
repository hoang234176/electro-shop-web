import axios from 'axios';
import { getToken } from '../utils/token.util';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface CreateOrderPayload {
    items: {
        product: string;
        color: string;
        quantity: number;
        price: number;
    }[];
    shippingInfo: {
        fullName: string;
        phone: string;
        address: string;
        note?: string;
    };
    paymentMethod: string;
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
}

export const createOrder = async (orderData: CreateOrderPayload) => {
    try {
        const token = getToken();
        const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
            headers: {
                Authorization: `${token}`
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response){
                throw{
                    status: 500,
                    message: "Lỗi kết nối máy chủ"
                }
            } else {
                throw{
                    status: error.response?.status,
                    message: error.response?.data.message
                }
                // return error.response?.status;
            }
        } else {
           throw{
            status: 500,
            message: "Lỗi hệ thống không xác định"
           }
        }
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
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response){
                throw{
                    status: 500,
                    message: "Lỗi kết nối máy chủ"
                }
            } else {
                throw{
                    status: error.response?.status,
                    message: error.response?.data.message
                }
            }
        } else {
            throw{
                status: 500,
                message: "Lỗi hệ thống không xác định"
            }
        }
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
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response){
                throw{
                    status: 500,
                    message: "Lỗi kết nối máy chủ"
                }
            } else {
                throw{
                    status: error.response?.status,
                    message: error.response?.data.message
                }
            }
        } else {
            throw{
                status: 500,
                message: "Lỗi hệ thống không xác định"
            }
        }
    }
};

export const verifyVNPayReturn = async (queryString: string) => {
    try {
        const token = getToken();
        const response = await axios.get(`${API_BASE_URL}/orders/vnpay_return${queryString}`, {
            headers: {
                Authorization: `${token}`
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response){
                throw{
                    status: 500,
                    message: "Lỗi kết nối máy chủ"
                }
            } else {
                throw{
                    status: error.response?.status,
                    message: error.response?.data.message
                }
            }
        } else {
            throw{
                status: 500,
                message: "Lỗi hệ thống không xác định"
            }
        }
    }
};