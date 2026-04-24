import { useState, useEffect } from "react";
import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import Alert from "../../component/ui/Alert";
import "./UserManagement.css";
import { DeleteUser } from "../../services/admin.service";
import { GetAllUser } from "../../services/admin.service";
import { FiTrash2 } from "react-icons/fi";

interface User {
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
    status?: string; // Trạng thái active/blocked (nếu sau này API Backend bổ sung)
}

function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // State cho Modal cảnh báo
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Gọi API lấy danh sách người dùng khi Component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await GetAllUser();
                // Hỗ trợ trường hợp backend trả về trực tiếp Array hoặc trả về { data: [...] }
                const dataList = Array.isArray(res) ? res : (res?.data || res?.users || []);
                setUsers(dataList);
            } catch (error) {
                console.error("Lỗi lấy danh sách người dùng:", error);
            }
        };
        fetchUsers();
    }, []);

    // Lọc người dùng theo từ khóa (Tên hoặc Email)
    const filteredUsers = users.filter(user => {
        const displayName = user.name || user.fullname || user.username || "";
        const matchSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchSearch;
    });

    // Phân trang
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleDeleteClick = (id: string) => {
        setUserToDelete(id);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            const user = users.find(u => u._id === userToDelete);
            try {
                if (user) {
                    const response =  DeleteUser(user._id);
                    // Cập nhật state (tạm thời) trước khi có API
                    setUsers(users.filter(u => u._id !== userToDelete));
                    setAlertMessage({ 
                        text: `Đã xóa tài khoản ${user.email} thành công!`, 
                        type: "success" 
                    });
                }
            } catch (error: any) {
                 setAlertMessage({ 
                        text: `Xóa tài khoản ${user?.email || 'người dùng'} thất bại!`, 
                        type: "error" 
                    });
            }
           
            setUserToDelete(null);
        }
    };

    const getRoleBadgeClass = (role: string) => {
        return role === 'ADMIN' ? "badge-purple" : "badge-secondary";
    };

    const getPaginationGroup = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const getAlertTitle = (): "THÔNG BÁO" | "CẢNH BÁO" | "LỖI" => {
        if (alertMessage?.type === 'warning') return "CẢNH BÁO";
        if (alertMessage?.type === 'error') return "LỖI";
        return "THÔNG BÁO";
    };

    const userBeingDeleted = users.find(u => u._id === userToDelete);

    return (
        <div className="admin-page-container">
            {/* Alert Xác nhận Xóa */}
            <Alert 
                show={userToDelete !== null} 
                title="CẢNH BÁO" 
                type="warning" 
                message={`Bạn có chắc chắn muốn xóa tài khoản ${userBeingDeleted?.email}? Hành động này không thể hoàn tác.`} 
                action={
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <Button variant="secondary" width="100px" height="40px" onClick={() => setUserToDelete(null)}>Hủy</Button>
                        <Button variant="danger" width="100px" height="40px" onClick={confirmDelete}>
                            Xác nhận
                        </Button>
                    </div>
                } 
            />

            {/* Alert Thông báo thành công */}
            <Alert 
                show={alertMessage !== null} 
                title={getAlertTitle()} 
                type={alertMessage?.type || "info"} 
                message={alertMessage?.text || ""} 
                action={<Button variant="primary" width="100px" height="40px" onClick={() => setAlertMessage(null)}>Đóng</Button>} 
            />

            <div className="admin-page-header">
                <h1 className="admin-page-title">Quản lý Người dùng</h1>
            </div>

            <div className="admin-toolbar">
                <div className="admin-search-bar" style={{ width: "400px" }}>
                    <Input 
                        placeholder="Tìm kiếm tên, email..." 
                        value={searchTerm} 
                        onChange={handleSearchChange} 
                    />
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Username</th>
                            <th>Người dùng</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                            <th>Ngày tham gia</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                    {currentUsers.map((user, index) => {
                        const displayName = user.name || user.fullname || user.username || "Chưa cập nhật";
                        const stt = startIndex + index + 1;
                        
                        return (
                            <tr key={user._id}>
                                <td>{stt}</td>
                                <td className="font-semibold">{user.username}</td>
                                <td>
                                    <div className="font-semibold">{displayName}</div>
                                    <div className="text-sm text-gray">{user.email}</div>
                                </td>
                                <td>{user.phone || 'Chưa cập nhật'}</td>
                                <td><span className={`status-badge ${getRoleBadgeClass(user.role)}`}>{user.role}</span></td>
                                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <div className="admin-action-btns">
                                        {user.role !== 'ADMIN' && (
                                            <button 
                                                className="btn-delete" 
                                                title="Xóa tài khoản"
                                                style={{ backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                                onClick={() => handleDeleteClick(user._id)}
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                        {currentUsers.length === 0 && (
                            <tr>
                                <td colSpan={7} className="empty-table-message">Không tìm thấy người dùng nào phù hợp.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                {/* Giao diện Phân trang */}
                {totalPages > 1 && (
                    <div className="pagination-container">
                        <button 
                            className="pagination-btn" 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Trước
                        </button>
                        
                        {getPaginationGroup().map((page, index) => (
                            <button 
                                key={index} 
                                className={`pagination-btn ${currentPage === page ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                disabled={page === '...'}
                            >
                                {page}
                            </button>
                        ))}
                        <button 
                            className="pagination-btn" 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserManagement;