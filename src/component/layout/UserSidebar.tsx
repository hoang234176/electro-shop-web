import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./UserSidebar.css";
import { getUserOrders } from "../../services/order.service";
import { useUserData } from "../../hooks/useUserData";
import { FiUser, FiPackage, FiKey, FiEdit, FiClock, FiTruck, FiCheckCircle, FiXCircle } from "react-icons/fi";

const UserSidebar = () => {
    const [avatar, setAvatar] = useState(
        localStorage.getItem("avatar") ? localStorage.getItem("avatar") : null
    );

    const location = useLocation(); // Hook lấy đường dẫn hiện tại để active menu

    // Quản lý trạng thái đóng/mở của menu con (Mặc định mở nếu đang ở trong trang orders)
    const [isOrderMenuOpen, setIsOrderMenuOpen] = useState(location.pathname.startsWith('/user/orders'));

    // Lấy trạng thái bộ lọc (pending, shipping, delivered) từ URL
    const queryParams = new URLSearchParams(location.search);
    const currentStatus = queryParams.get("status");

    // State quản lý hiệu ứng hover cho từng dòng menu con
    const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

    // Giả lập số lượng thông báo (sau này có thể truyền từ Context/Redux xuống)
    // const [notificationCount] = useState(1);

    // Sử dụng custom hook để lấy dữ liệu người dùng
    const { userInfo } = useUserData();

    const [orderCounts, setOrderCounts] = useState({ pending: 0, shipping: 0, delivered: 0, cancelled: 0 });

    useEffect(() => {
        const fetchOrderCounts = async () => {
            try {
                const orders = await getUserOrders();
                const counts = { pending: 0, shipping: 0, delivered: 0, cancelled: 0 };
                orders.forEach((order: any) => {
                    // Bỏ qua đếm các đơn hàng VNPay chưa thanh toán (đơn hàng ảo/bị bỏ dở)
                    if (order.paymentMethod === 'vnpay' && order.paymentStatus === 'unpaid') return;
                    if (counts.hasOwnProperty(order.orderStatus)) {
                        counts[order.orderStatus as keyof typeof counts]++;
                    }
                });
                setOrderCounts(counts);
            } catch (error) {
                console.error("Lỗi lấy thống kê đơn hàng cho Sidebar:", error);
            }
        };

        fetchOrderCounts();
        window.addEventListener('orderStatusChanged', fetchOrderCounts);
        return () => window.removeEventListener('orderStatusChanged', fetchOrderCounts);
    }, []);

    useEffect(() => {
        const handleUpdateAvatar = () => {
            const newAvatar = localStorage.getItem("avatar");
            if (newAvatar && newAvatar !== avatar) {
                setAvatar(newAvatar);
            }
        }

        // Lắng nghe cái "loa" tự chế của mình
        window.addEventListener("avatarChanged", handleUpdateAvatar);

        return () => {
            window.removeEventListener("avatarChanged", handleUpdateAvatar);
        }
    }, [avatar]); 

    return (
        <div className="user-sidebar">
            <div className="sidebar-profile">
                <img src={avatar || ""} alt="Avatar" className="profile-avatar" />
                <div className="profile-brief">
                    <h3 className="profile-name">{userInfo?.fullname}</h3>
                    <span className="profile-edit-link">
                        <Link to="/user/edit" state={{userData: userInfo}} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiEdit size={12} /> Sửa hồ sơ
                        </Link>
                    </span>
                </div>
            </div>
            <nav className="sidebar-nav">
                <Link to="/user/info" state={{userData: userInfo}} className={`nav-item ${location.pathname === '/user/info' ? 'active' : ''}`}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiUser strokeWidth={3} fontSize={16} /> Thông tin tài khoản</span>
                </Link>

                <div className="nav-item-wrapper">
                    <Link
                        to="/user/orders"
                        state={{userData: userInfo}}
                        className={`nav-item ${location.pathname === '/user/orders' && !currentStatus ? 'active' : ''}`}
                        onClick={(e) => {
                            if (location.pathname === '/user/orders' && !currentStatus) {
                                e.preventDefault(); // Nếu đang ở Tất cả đơn hàng thì chỉ mở/đóng menu
                                setIsOrderMenuOpen(!isOrderMenuOpen);
                            } else {
                                setIsOrderMenuOpen(true); // Còn không thì nhảy sang Tất cả đơn hàng và mở menu
                            }
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiPackage strokeWidth={3} fontSize={16}  /> Quản lý đơn hàng</span>
                        <span className={`toggle-icon ${isOrderMenuOpen ? 'open' : ''}`}>▼</span>
                    </Link>
                    {isOrderMenuOpen && (
                        <div className="sidebar-submenu">
                            <Link 
                                to="/user/orders?status=pending" 
                                state={{userData: userInfo}} 
                                className={`submenu-item ${currentStatus === 'pending' ? 'active' : ''}`} 
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                onMouseEnter={() => setHoveredStatus('pending')}
                                onMouseLeave={() => setHoveredStatus(null)}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiClock strokeWidth={3} fontSize={16} color={(hoveredStatus === 'pending' || currentStatus === 'pending') ? '#f59e0b' : undefined} /> Chờ lấy hàng</span>
                                {orderCounts.pending > 0 && <span style={{ backgroundColor: '#f59e0b', color: 'white', fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px' }}>{orderCounts.pending}</span>}
                            </Link>
                            <Link 
                                to="/user/orders?status=shipping" 
                                state={{userData: userInfo}} 
                                className={`submenu-item ${currentStatus === 'shipping' ? 'active' : ''}`} 
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                onMouseEnter={() => setHoveredStatus('shipping')}
                                onMouseLeave={() => setHoveredStatus(null)}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiTruck strokeWidth={3} fontSize={16} color={(hoveredStatus === 'shipping' || currentStatus === 'shipping') ? '#3b82f6' : undefined} /> Đang giao</span>
                                {orderCounts.shipping > 0 && <span style={{ backgroundColor: '#3b82f6', color: 'white', fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px' }}>{orderCounts.shipping}</span>}
                            </Link>
                            <Link 
                                to="/user/orders?status=delivered" 
                                state={{userData: userInfo}} 
                                className={`submenu-item ${currentStatus === 'delivered' ? 'active' : ''}`} 
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                onMouseEnter={() => setHoveredStatus('delivered')}
                                onMouseLeave={() => setHoveredStatus(null)}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiCheckCircle strokeWidth={3} fontSize={16} color={(hoveredStatus === 'delivered' || currentStatus === 'delivered') ? '#10b981' : undefined} /> Đã giao</span>
                                {orderCounts.delivered > 0 && <span style={{ backgroundColor: '#10b981', color: 'white', fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px' }}>{orderCounts.delivered}</span>}
                            </Link>
                            <Link 
                                to="/user/orders?status=cancelled" 
                                state={{userData: userInfo}} 
                                className={`submenu-item ${currentStatus === 'cancelled' ? 'active' : ''}`} 
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                onMouseEnter={() => setHoveredStatus('cancelled')}
                                onMouseLeave={() => setHoveredStatus(null)}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiXCircle strokeWidth={3} fontSize={16} color={(hoveredStatus === 'cancelled' || currentStatus === 'cancelled') ? '#ef4444' : undefined} /> Đã hủy</span>
                                {orderCounts.cancelled > 0 && <span style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px' }}>{orderCounts.cancelled}</span>}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Đổi mật khẩu */}
                <Link to="/user/change-password" state={{userData: userInfo}} className={`nav-item ${location.pathname === '/user/change-password' ? 'active' : ''}`}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiKey strokeWidth={3} fontSize={16}  /> Đổi mật khẩu</span>
                </Link>
                

                {/* <Link to="/user/notifications" state={{userData: state?.userData}} className={`nav-item ${location.pathname === '/user/notifications' ? 'active' : ''}`}>
                    <span>🔔 Thông báo</span>
                    {notificationCount > 0 && (
                        <span className="sidebar-badge">{notificationCount}</span>
                    )}
                </Link> */}
            </nav>
        </div>
    );
}

export default UserSidebar;