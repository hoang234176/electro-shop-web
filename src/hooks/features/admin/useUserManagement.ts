import { useState, useEffect } from "react";
import { DeleteUser, GetAllUser } from "../../../services/admin.service";
import { type User } from "../../../types/user.types";

export type { User };

export const useUserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const filters: Record<string, string | number> = {};
                if (searchTerm.trim() !== "") filters.search = searchTerm;
                filters.page = currentPage;
                filters.limit = ITEMS_PER_PAGE;

                const res = await GetAllUser(filters);
                const dataList = res.users || res.data || res || [];
                setUsers(Array.isArray(dataList) ? dataList : []);
                
                if (res.totalPages) setTotalPages(res.totalPages);
            } catch (error) {
                console.error("Lỗi lấy danh sách người dùng:", error);
            }
        };
        fetchUsers();
    }, [currentPage, searchTerm]);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentUsers = users;

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