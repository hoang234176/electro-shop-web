export interface User {
    _id: string;
    username: string;
    name?: string;
    fullname?: string;
    email: string;
    phone?: string;
    role: string;
    createdAt: string;
    updatedAt?: string;
    avatar?: string;
    status?: string;
}