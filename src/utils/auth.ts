import { jwtDecode } from "jwt-decode"

interface TokenPayLoad{
    user_id: string,
    username: string,
    role: string,
}

const getRole = () => {
    const token = localStorage.getItem('token');
    if(!token) return null;
    const {role} = jwtDecode<TokenPayLoad>(token)
    return role;
}

export default getRole;