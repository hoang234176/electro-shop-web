import { jwtDecode } from "jwt-decode"

interface TokenPayLoad{
    user_id: string,
    username: string,
    role: string,
    avatar: string,
}

export const getRole = () => {
    const token = localStorage.getItem('token');
    if(!token) return null;
    const {role} = jwtDecode<TokenPayLoad>(token)
    return role;
}

export const getUserId = () => {
    const token = localStorage.getItem('token');
    if(!token) return null;
    const {user_id} = jwtDecode<TokenPayLoad>(token)
    return user_id;
}

export const setToken = (token: string) => {
    localStorage.setItem('token', token);
}

export const getToken = () => {
    return localStorage.getItem('token');
}

export const removeToken = () => {
    localStorage.removeItem('token');
}