import axios from "axios"
import { getRole, setToken } from "../utils/token.util";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface LoginResponse{
    token: string,
}

interface LoginRequest{
    userName: string,
    password: string,
}

interface RegisterReq{
    fullName: string,
    userName: string,
    password: string,
    email: string,
    phone: string,
    address: string
}

export interface LoginError{
    status: number,
    message: string
} 

export interface RegisterError{
    status: number,
    message: string
}

export const loginReq = async ( {userName, password}: LoginRequest) => {
    try{
        const data = {
            userName,
            password
        }
        const res = await axios.post(`${API_BASE_URL}/auth/login`, data);
        setToken(res.data.token);
        localStorage.setItem('avatar', res.data.avatar);
        const role = getRole();
        return role                                                                                                  
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
}

export const registerReq = async ( {fullName, userName, password, email, phone, address}: RegisterReq) => {
    try{
        const data = {
            fullName,
            userName,
            password,
            email,
            phone,
            address
        }
        const res = await axios.post(`${API_BASE_URL}/auth/register`, data);
        const resInfo = {
            message: res.data.message,
            status: res.status
        }
        return resInfo
    } catch (error){
        if(axios.isAxiosError(error)){
            if (!error.response){
                throw{
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
            throw{
                status: 500,
                message: "Lỗi hệ thống không xác định"
            }
        }
    }
}

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('avatar');  
}

export const forgotPasswordRequest = async (data: { username: string }) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, data);
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
            throw { status: 500, message: "Lỗi hệ thống không xác định" };
        }
    }
};

export const verifyResetCode = async (data: { username: string, code: string }) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/auth/verify-reset-code`, data);
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response) {
                throw { status: 500, message: "Lỗi kết nối máy chủ" };
            } else {
                throw { status: error.response?.status, message: error.response?.data.message };
            }
        } else {
            throw { status: 500, message: "Lỗi hệ thống không xác định" };
        }
    }
};

export const verifyAndResetPassword = async (data: { username: string, code: string, password: string }) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/auth/reset-password`, data);
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response) {
                throw { status: 500, message: "Lỗi kết nối máy chủ" };
            } else {
                throw { status: error.response?.status, message: error.response?.data.message };
            }
        } else {
            throw { status: 500, message: "Lỗi hệ thống không xác định" };
        }
    }
};