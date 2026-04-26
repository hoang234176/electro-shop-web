import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";
import { getAllOrdersAdmin } from "../../services/admin.service";
import Loading from "../ui/Loading";
import { LuLayoutDashboard, LuUsers, LuLogOut} from "react-icons/lu";
import { FiPackage, FiShoppingCart } from "react-icons/fi"

interface AdminOrder {
    cancelRequest?: boolean;
}

function AdminSidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const [cancelRequestCount, setCancelRequestCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCancelRequests = async () => {
            try {
                const data = await getAllOrdersAdmin();
                const count = data.filter((order: AdminOrder) => order.cancelRequest === true).length;
                setCancelRequestCount(count);
            } catch (error) {
                console.error("Lỗi lấy số lượng yêu cầu hủy đơn", error);
            }
        };

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
                    <LuLayoutDashboard className="admin-nav-icon" />
                    <span>Bảng điều khiển</span>
                </Link>
                <Link to="/admin/product" className={`admin-nav-item ${location.pathname.includes('/admin/product') ? 'active' : ''}`} onClick={(e) => handleNavigation(e, "/admin/product")}>
                    <FiPackage className="admin-nav-icon" />
                    <span> Quản lý Sản phẩm</span>
                </Link>
                {/* Chừa sẵn các route sẽ phát triển trong tương lai */}
                <Link to="/admin/orders" className={`admin-nav-item ${location.pathname.includes('/admin/orders') ? 'active' : ''}`} onClick={(e) => handleNavigation(e, "/admin/orders")}>
                    <FiShoppingCart className="admin-nav-icon" />
                    <span>Quản lý Đơn hàng</span>
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
                    <LuUsers className="admin-nav-icon" />
                    <span>Quản lý Tài khoản</span>
                </Link>
            </nav>
            <div className="admin-sidebar-footer">
                <button className="admin-nav-item sidebar-logout-btn" onClick={handleLogout}>
                    <LuLogOut className="admin-nav-icon" />
                    <span>Đăng xuất</span>  
                </button>
            </div>
        </aside>
    );
}

export default AdminSidebar;