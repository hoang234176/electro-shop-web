import { useState, useEffect } from "react";
import { DeleteUser, GetAllUser } from "../../../services/admin.service";

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

export const useUserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await GetAllUser();
                const dataList = Array.isArray(res) ? res : (res?.data || res?.users || []);
                setUsers(dataList);
            } catch (error) {
                console.error("Lỗi lấy danh sách người dùng:", error);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const displayName = user.name || user.fullname || user.username || "";
        return displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
               user.email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleDeleteClick = (id: string) => setUserToDelete(id);

    const confirmDelete = () => {
        if (userToDelete) {
            const user = users.find(u => u._id === userToDelete);
            try {
                if (user) {
                    DeleteUser(user._id);
                    setUsers(users.filter(u => u._id !== userToDelete));
                    setAlertMessage({ text: `Đã xóa tài khoản ${user.email} thành công!`, type: "success" });
                }
            } catch {
                setAlertMessage({ text: `Xóa tài khoản ${user?.email || 'người dùng'} thất bại!`, type: "error" });
            }
            setUserToDelete(null);
        }
    };

    const getRoleBadgeClass = (role: string) => role === 'ADMIN' ? "badge-purple" : "badge-secondary";

    const getPaginationGroup = () => {
        const pages = [];
        if (totalPages <= 5) for (let i = 1; i <= totalPages; i++) pages.push(i);
        else {
            if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
            else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
        return pages;
    };

    const getAlertTitle = (): "THÔNG BÁO" | "CẢNH BÁO" | "LỖI" => {
        if (alertMessage?.type === 'warning') return "CẢNH BÁO";
        if (alertMessage?.type === 'error') return "LỖI";
        return "THÔNG BÁO";
    };

    const userBeingDeleted = users.find(u => u._id === userToDelete);

    return {
        searchTerm, handleSearchChange, userToDelete, setUserToDelete, userBeingDeleted, confirmDelete,
        alertMessage, setAlertMessage, getAlertTitle, startIndex, currentUsers, handleDeleteClick,
        getRoleBadgeClass, totalPages, currentPage, setCurrentPage, getPaginationGroup
    };
};