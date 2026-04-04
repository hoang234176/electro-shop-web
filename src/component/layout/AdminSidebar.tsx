import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";
import { getAllOrdersAdmin } from "../../services/adminServices";
import Loading from "../ui/Loading";

function AdminSidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const [cancelRequestCount, setCancelRequestCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCancelRequests = async () => {
        try {
            const data = await getAllOrdersAdmin();
            const count = data.filter((order: any) => order.cancelRequest === true).length;
            setCancelRequestCount(count);
        } catch (error) {
            console.error("Lỗi lấy số lượng yêu cầu hủy đơn", error);
        }
    };

    useEffect(() => {
        fetchCancelRequests();
        window.addEventListener('adminOrderChanged', fetchCancelRequests);
        return () => {
            window.removeEventListener('adminOrderChanged', fetchCancelRequests);
        };
    }, []);

    const handleNavigation = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate(path);
        }, 800); // Hiển thị UI loading 800ms
    };

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            localStorage.removeItem("token");
            navigate("/login");
            window.location.reload(); // Tải lại trang để reset trạng thái đăng nhập
        }, 800);
    };

    return (
        <aside className="admin-sidebar">
            {isLoading && <Loading fullScreen={true} />}
            <div className="admin-sidebar-logo">
                <Link to="/admin/dashboard" className="admin-logo-text" onClick={(e) => handleNavigation(e, "/admin/dashboard")}>
                    ADMIN
                </Link>
            </div>
            <nav className="admin-nav">
                <Link to="/admin/dashboard" className={`admin-nav-item ${location.pathname === '/admin/dashboard' ? 'active' : ''}`} onClick={(e) => handleNavigation(e, "/admin/dashboard")}>
                    📊 Bảng điều khiển
                </Link>
                <Link to="/admin/product" className={`admin-nav-item ${location.pathname.includes('/admin/product') ? 'active' : ''}`} onClick={(e) => handleNavigation(e, "/admin/product")}>
                    📦 Quản lý Sản phẩm
                </Link>
                {/* Chừa sẵn các route sẽ phát triển trong tương lai */}
                <Link to="/admin/orders" className={`admin-nav-item ${location.pathname.includes('/admin/orders') ? 'active' : ''}`} onClick={(e) => handleNavigation(e, "/admin/orders")}>
                    🛒 Quản lý Đơn hàng
                    {cancelRequestCount > 0 && (
                        <span className="badge-notification" style={{
                            backgroundColor: '#ef4444', color: 'white', padding: '2px 8px', 
                            borderRadius: '12px', fontSize: '12px', marginLeft: '8px',
                            display: 'inline-block', lineHeight: '1.2'
                        }}>
                            {cancelRequestCount}
                        </span>
                    )}
                </Link>
                <Link to="/admin/users" className={`admin-nav-item ${location.pathname.includes('/admin/users') ? 'active' : ''}`} onClick={(e) => handleNavigation(e, "/admin/users")}>
                    👥 Quản lý Người dùng
                </Link>
            </nav>
            <div className="admin-sidebar-footer">
                <button className="admin-nav-item sidebar-logout-btn" onClick={handleLogout}>
                    🚪 Đăng xuất
                </button>
            </div>
        </aside>
    );
}

export default AdminSidebar;