import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import UserSidebar from "../../component/layout/UserSidebar";
import Button from "../../component/ui/Button";
import Alert, { type AlertProps } from "../../component/ui/Alert";
import Loading from "../../component/ui/Loading";
import "./Orders.css";
import { getUserOrders, cancelOrder } from "../../services/order.service";
import { FiClock, FiTruck, FiCheckCircle, FiXCircle } from "react-icons/fi";

function Orders() {
    const location = useLocation();

    // Lấy query parameter "status" từ URL (ví dụ: ?status=pending)
    const queryParams = new URLSearchParams(location.search);
    const statusFilter = queryParams.get("status");

    // State lưu trữ danh sách đơn hàng thật từ API
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState<AlertProps>({ show: false, type: 'info', message: '', title: '' });

    // State để lưu ID của đơn hàng đang chờ xác nhận hủy
    const [orderToCancelId, setOrderToCancelId] = useState<string | null>(null);
    const [isRequestingCancel, setIsRequestingCancel] = useState(false);

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 3; // Số đơn hàng hiển thị trên 1 trang

    // Kiểm tra trạng thái đăng nhập
    const isLoggedIn = !!localStorage.getItem("token");

    useEffect(() => {
        setCurrentPage(1); // Trở về trang 1 mỗi khi đổi trạng thái lọc (ví dụ từ "Tất cả" sang "Đang giao")
    }, [statusFilter]);

    // Gọi API lấy danh sách đơn hàng
    useEffect(() => {
        const fetchOrders = async () => {
            if (!isLoggedIn) return; // Nếu chưa đăng nhập thì không gọi API
            
            setIsLoading(true);
            try {
                const data = await getUserOrders();
                // Lọc bỏ các đơn hàng VNPay chưa thanh toán (bị bỏ dở) để không tạo ra đơn hàng ảo
                const validOrders = data.filter((order: any) => !(order.paymentMethod === 'vnpay' && order.paymentStatus === 'unpaid'));
                const formattedOrders = validOrders.map((order: any) => ({
                    id: order._id,
                    displayId: order._id.slice(-6).toUpperCase(), // Rút gọn ID cho dễ nhìn
                    status: order.orderStatus,
                    date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
                    total: order.totalAmount,
                    paymentMethod: order.paymentMethod, // Lấy phương thức thanh toán
                    paymentStatus: order.paymentStatus, // Lấy trạng thái thanh toán
                cancelRequest: order.cancelRequest || false,
                    items: order.items.map((item: any) => {
                        const product = item.product || {};
                        // Lấy ảnh của phiên bản màu tương ứng
                        const variant = product.variants?.find((v: any) => v.color === item.color);
                        const imageUrl = variant?.image || product.variants?.[0]?.image || 'https://via.placeholder.com/150?text=No+Image';
                        return {
                            id: product._id || item._id, 
                            name: `${product.name || 'Sản phẩm đã bị xóa'} - Bản màu ${item.color}`,
                            price: item.price,
                            quantity: item.quantity,
                            imageUrl: imageUrl
                        };
                    })
                }));
                setOrders(formattedOrders);
            } catch (error) {
                console.error("Lỗi lấy danh sách đơn hàng:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [isLoggedIn]);

    // Lọc đơn hàng theo trạng thái, nếu không có status thì hiển thị tất cả
    const filteredOrders = statusFilter 
        ? orders.filter(order => order.status === statusFilter)
        : orders;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };


    // Tính toán dữ liệu hiển thị cho trang hiện tại
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentOrdersToDisplay = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Thuật toán tạo dãy nút phân trang có dấu "..."
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

    // Hàm chuyển đổi mã trạng thái sang tiếng Việt và màu sắc tương ứng
    const getStatusInfo = (status: string) => {
        switch(status) {
            case 'pending': 
                return { text: 'Chờ lấy hàng', icon: <FiClock size={16} />, color: '#d97706', bg: '#fef3c7' };
            case 'shipping': 
                return { text: 'Đang giao hàng', icon: <FiTruck size={16} />, color: '#2563eb', bg: '#eff6ff' };
            case 'delivered': 
                return { text: 'Đã giao thành công', icon: <FiCheckCircle size={16} />, color: '#16a34a', bg: '#dcfce3' };
            case 'cancelled':
                return { text: 'Đã hủy', icon: <FiXCircle size={16} />, color: '#dc2626', bg: '#fee2e2' };
            default: 
                return { text: 'Không xác định', icon: null, color: '#4b5563', bg: '#f3f4f6' };
        }
    };

    // Hàm chuyển đổi mã thanh toán sang tiếng Việt
    const getPaymentMethodInfo = (method: string, status: string) => {
        let statusText = '';
        if (status === 'paid') statusText = ' (Đã thanh toán)';
        else if (status === 'unpaid') statusText = ' (Chưa thanh toán)';
        else if (status === 'refunded') statusText = ' (Đã hoàn tiền)';
        else if (status === 'refund_failed') statusText = ' (Lỗi hoàn tiền)';
        else if (status === 'payment_failed') statusText = ' (Thanh toán thất bại)';

        switch(method) {
            case 'cod': return 'Thanh toán khi nhận hàng';
            case 'vnpay': return `Thanh toán qua VNPay${statusText}`;
            default: return 'Chưa xác định';
        }
    };

    // Hàm này được gọi khi người dùng bấm nút "Hủy đơn" -> chỉ để mở Alert xác nhận
    const handleCancelClick = (orderId: string, isRequesting: boolean = false) => {
        setOrderToCancelId(orderId);
        setIsRequestingCancel(isRequesting);
    };

    // Hàm này được gọi khi người dùng bấm nút "Xác nhận hủy" trên Alert
    const handleConfirmCancel = async () => {
        if (!orderToCancelId) return;
        
        try {
            await cancelOrder(orderToCancelId);
            setAlert({ show: true, type: 'success', title: 'THÔNG BÁO', message: isRequestingCancel ? 'Đã gửi yêu cầu hủy đơn đến quản trị viên' : 'Đã hủy đơn hàng thành công' });
            
            // Cập nhật lại state danh sách đơn hàng (chỉ thay đổi UI, không cần gọi lại fetch API)
            setOrders(prevOrders => prevOrders.map(order => 
                order.id === orderToCancelId 
                    ? (isRequestingCancel ? { ...order, cancelRequest: true } : { ...order, status: 'cancelled' }) 
                    : order
            ));
            
            // Báo cho Sidebar biết có sự thay đổi trạng thái đơn hàng để đếm lại
            window.dispatchEvent(new Event('orderStatusChanged'));
        } catch (error: any) {
            setAlert({ show: true, type: 'error', title: 'LỖI', message: error.message || 'Lỗi khi hủy đơn hàng' });
        } finally {
            // Đóng Alert xác nhận sau khi hoàn tất
            setOrderToCancelId(null);
        }
    };

    // Tiêu đề của trang dựa theo bộ lọc
    const pageTitle = statusFilter 
        ? getStatusInfo(statusFilter).text
        : "Tất cả đơn hàng";

    // Hiển thị giao diện yêu cầu đăng nhập nếu chưa có token
    if (!isLoggedIn) {
        return (
            <div className="orders-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
                <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Vui lòng đăng nhập</h2>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>Bạn cần đăng nhập để xem và quản lý lịch sử đơn hàng của mình.</p>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <Button variant="primary" width="200px" height="48px">Đăng nhập ngay</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-container">
            {/* Alert cho các thông báo thành công/thất bại chung */}
            <Alert
                show={alert.show}
                title={alert.title}
                type={alert.type}
                message={alert.message}
                action={<Button variant="primary" width="100px" height="40px" onClick={() => setAlert({ ...alert, show: false })}>Đóng</Button>}
            />

            {/* Alert dùng riêng cho việc xác nhận hủy đơn */}
            <Alert
                show={orderToCancelId !== null}
                title="CẢNH BÁO"
                type="warning"
            message={isRequestingCancel ? "Đơn hàng đang được giao. Yêu cầu hủy sẽ được gửi đến quản trị viên để xem xét. Bạn có chắc chắn muốn yêu cầu hủy?" : "Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác."}
                action={
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <Button variant="secondary" width="100px" height="40px" onClick={() => setOrderToCancelId(null)}>Không</Button>
                    <Button variant="danger" width="140px" height="40px" onClick={handleConfirmCancel}>{isRequestingCancel ? "Gửi yêu cầu" : "Xác nhận hủy"}</Button>
                    </div>
                }
            />

            {/* Cột trái: Sidebar Người dùng */}
            <UserSidebar />

            {/* Cột phải: Nội dung chính */}
            <div className="orders-content">
                <div className="content-header">
                    <h2 className="content-title">{pageTitle}</h2>
                    <p className="content-subtitle">Theo dõi và quản lý lịch sử mua hàng của bạn</p>
                </div>

                <div className="orders-list">
                    {isLoading ? (
                        <Loading fullScreen={false} text="Đang tải lịch sử mua hàng của bạn..." />
                    ) : filteredOrders.length === 0 ? (
                        <div className="no-orders">
                            Bạn chưa có đơn hàng nào.
                        </div>
                    ) : (
                        currentOrdersToDisplay.map(order => {
                            const statusInfo = getStatusInfo(order.status);
                            const paymentMethodText = getPaymentMethodInfo(order.paymentMethod, order.paymentStatus);
                            
                            return (
                                <div key={order.id} className="order-card">
                                    {/* Phần Header Card */}
                                    <div className="order-header">
                                        <span className="order-id">Mã ĐH: #{order.displayId || order.id}</span>
                                        <div className="order-header-right">
                                            <span className="order-date">Ngày đặt: {order.date}</span>
                                            <span className="order-status" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: statusInfo.color, backgroundColor: statusInfo.bg }}>
                                                {statusInfo.icon} {statusInfo.text}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Phần Body: Danh sách sản phẩm */}
                                    <div className="order-body">
                                        {order.items.map((item: any) => (
                                            <div key={item.id} className="order-item">
                                                <img src={item.imageUrl} alt={String(item.name)} className="order-item-img" />
                                                <div className="order-item-info">
                                                    <Link to={`/product/${item.id}`} className="order-item-name" style={{ textDecoration: 'none' }}>{String(item.name)}</Link>
                                                    <span className="order-item-quantity">x{item.quantity}</span>
                                                </div>
                                                <span className="order-item-price">{formatCurrency(item.price)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Phần Footer: Tổng tiền & Nút thao tác */}
                                    <div className="order-footer">
                                        <div className="order-footer-left" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span className="order-payment-method" style={{ padding: 0, color: '#6b7280', fontWeight: 'normal' }}>
                                                Phương thức: <strong style={{ color: '#374151' }}>{paymentMethodText}</strong>
                                            </span>
                                            <div className="order-total">
                                                Thành tiền: <strong>{formatCurrency(order.total)}</strong>
                                            </div>
                                        </div>
                                        <div className="order-actions">
                                        {order.status === 'pending' && <Button variant="danger" width="120px" height="40px" onClick={() => handleCancelClick(order.id, false)}>Hủy đơn</Button>}
                                        {order.status === 'shipping' && !order.cancelRequest && <Button variant="secondary" width="140px" height="40px" onClick={() => handleCancelClick(order.id, true)}>Yêu cầu hủy</Button>}
                                        {order.status === 'shipping' && order.cancelRequest && <Button variant="secondary" width="160px" height="40px" disabled>Đang chờ duyệt hủy</Button>}
                                            {order.status === 'delivered' && <Button variant="primary" width="120px" height="40px">Mua lại</Button>}                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}

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
        </div>
    );
}

export default Orders;