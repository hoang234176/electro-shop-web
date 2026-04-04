import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface InfoProfile {
    fullName: string,
    userName: string,
    email: string,
    phone: string,
    address: string,
    avatar: string,
    createdAt: string,
}

export interface InfoErrorRes {
    status: number,
    message: string
}

export interface UpdateInfoReq {
    fullName: string,
    email: string, 
    phone: string, 
    address: string, 
    fileAvatar: File | null,
}

export const getInfoProfile = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/user/info`, {
            headers: {
                'Authorization': `${localStorage.getItem('token')}`
            }
        })
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

export const updateInfoUser = async (
    { fullName, email, phone, address, fileAvatar }: UpdateInfoReq) => {
    try {
        const formData = new FormData()
        formData.append('fullName', fullName)
        formData.append('email', email)
        formData.append('phone', phone)
        formData.append('address', address)
        if (fileAvatar) {
            formData.append('fileAvatar', fileAvatar)
        }
        console.log(formData)
        const res = await axios.post(
            `${API_BASE_URL}/user/update`,
            formData,
            {
                headers: {
                    'Authorization': `${localStorage.getItem('token')}`
                }
            }
        );
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

export interface ChangePasswordReq {
    oldPassword: string;
    newPassword: string;
}

export const changePassword = async (data: ChangePasswordReq) => {
    try {
        const res = await axios.put(
            `${API_BASE_URL}/user/change-password`,
            data,
            {
                headers: {
                    'Authorization': `${localStorage.getItem('token')}`
                }
            }
        );
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response) {
                throw {
                    status: 500,
                    message: "Lỗi kết nối máy chủ"
                };
            } else {
                throw {
                    status: error.response?.status,
                    message: error.response?.data.message
                };
            }
        } else {
            throw {
                status: 500,
                message: "Lỗi hệ thống không xác định"
            };
        }
    }
};