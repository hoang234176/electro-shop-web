import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import Alert from "../../component/ui/Alert";
import "./UserManagement.css";
import { FiTrash2 } from "react-icons/fi";
import { useUserManagement } from "../../hooks/features/admin/useUserManagement";

function UserManagement() {
    const {
        searchTerm, handleSearchChange, userToDelete, setUserToDelete, userBeingDeleted, confirmDelete,
        alertMessage, setAlertMessage, getAlertTitle, startIndex, currentUsers, handleDeleteClick,
        getRoleBadgeClass, totalPages, currentPage, setCurrentPage, getPaginationGroup
    } = useUserManagement();

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