import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface CreateReviewPayload {
    productId: string;
    rating: number | null; // Có thể null nếu người dùng chỉ bình luận
    comment: string;
}

/**
 * @description Tạo một đánh giá/bình luận mới (yêu cầu đăng nhập)
 */
export const createReview = async (payload: CreateReviewPayload) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/reviews`, payload, {
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
 * @description Lấy danh sách đánh giá/bình luận của một sản phẩm
 * @param productId ID của sản phẩm cần lấy nhận xét
 */
export const getReviewsByProduct = async (productId: string) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/reviews/${productId}`);
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