import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../component/ui/Button";
import UserSidebar from "../../component/layout/UserSidebar";
import Alert from "../../component/ui/Alert";
import "./InfoUser.css";
import { type InfoErrorRes } from "../../services/user.service";
import { useUserData } from "../../hooks/useUserData";
import { formatDate } from "../../utils/formatDate.util";

function InfoUser() {
    const navigate = useNavigate();
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const { userInfo, isLoading, error } = useUserData();

    const handleDeleteClick = () => {
        setShowDeleteAlert(true);
    };

    const confirmDelete = () => {
        // Giả lập hành động gọi API xóa tài khoản
        localStorage.removeItem("token"); // Xóa trạng thái đăng nhập
        setShowDeleteAlert(false);
        navigate("/"); // Chuyển về trang chủ
        window.location.reload(); // Reset lại toàn bộ giao diện Header
    };

    const cancelDelete = () => {
        setShowDeleteAlert(false);
    };

    const isLoggedIn = !!localStorage.getItem("token");

    useEffect(() => {
        if (error && (error as InfoErrorRes).status === 500) {
            navigate("/error500");
        }
    }, [error, navigate]);

    if (!isLoggedIn) {
        return (
            <div className="info-user-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
                <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Vui lòng đăng nhập</h2>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>Bạn cần đăng nhập để xem và quản lý hồ sơ cá nhân.</p>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <Button variant="primary" width="200px" height="48px">Đăng nhập ngay</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="info-user-container">
            {/* --- THÔNG BÁO XÁC NHẬN XÓA TÀI KHOẢN --- */}
            <Alert 
                show={showDeleteAlert} 
                title="CẢNH BÁO" 
                type="warning" 
                message="Bạn có chắc chắn muốn xóa tài khoản này vĩnh viễn? Hành động này không thể hoàn tác và toàn bộ dữ liệu mua hàng sẽ bị mất." 
                action={
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <Button variant="secondary" width="100px" height="40px" onClick={cancelDelete}>Hủy</Button>
                        <Button variant="danger" width="100px" height="40px" onClick={confirmDelete}>Xóa</Button>
                    </div>
                } 
            />

            {/* --- SIDEBAR BÊN TRÁI --- */}
            <UserSidebar />

            {/* --- NỘI DUNG CHÍNH BÊN PHẢI --- */}
            <div className="info-user-content">
                <div className="content-header">
                    <h2 className="content-title">Hồ Sơ Của Tôi</h2>
                </div>

                <div className="profile-details">
                    <div className="detail-row">
                        <span className="detail-label">Họ và tên</span>
                        <span className="detail-value">{userInfo.fullname}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{userInfo.email}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Số điện thoại</span>
                        <span className="detail-value">{userInfo.phone}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Địa chỉ</span>
                        <span className="detail-value">{userInfo.address}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Ngày tham gia</span>
                        <span className="detail-value">{userInfo.createdAt ? formatDate(userInfo.createdAt) : "..."}</span>
                    </div>
                </div>

                {/* Sử dụng style flex để 2 nút nằm cạnh nhau nếu InfoUser.css chưa có */}
                <div className="profile-actions" style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
                    <Link to="/user/edit" state={{userData: userInfo}}>
                        {/* Nút mượn tạm từ thiết kế Component Button của bạn */}
                        <Button variant="primary" width="160px" height="40px">Cập nhật thông tin</Button>
                    </Link>
                    
                    <Button variant="danger" width="200px" height="40px" onClick={handleDeleteClick}>Xóa tài khoản vĩnh viễn</Button>
                </div>
            </div>
        </div>
    );
}

export default InfoUser;