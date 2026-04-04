import { useState, useEffect } from "react";
import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import Alert from "../../component/ui/Alert";
import "./OrderManagement.css";
import { getAllOrdersAdmin, updateOrderStatusAdmin } from "../../services/adminServices";
import OrderDetailModal from "../../component/ui/OrderDetailModal";
import Loading from "../../component/ui/Loading";

interface DisplayOrder {
    id: string;
    customer: string;
    phone: string;
    date: string;
    total: number;
    status: string;
    payment: string;
    paymentStatus: string;
    cancelRequest: boolean;
}

function OrderManagement() {
    const [orders, setOrders] = useState<DisplayOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);

    // State lưu dữ liệu đơn hàng gốc để hiển thị chi tiết
    const [rawOrders, setRawOrders] = useState<any[]>([]);
    
    // State cho Modal cảnh báo
    const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // State cho Modal Xem chi tiết đơn hàng
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const data = await getAllOrdersAdmin();
                setRawOrders(data); // Lưu lại dữ liệu gốc
                const formattedData: DisplayOrder[] = data.map((order: any) => ({
                    id: order._id,
                    customer: order.user?.fullname || 'N/A',
                    phone: order.user?.phone || 'N/A',
                    date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
                    total: order.totalAmount,
                    status: order.orderStatus,
                    payment: order.paymentMethod.toUpperCase(),
                    paymentStatus: order.paymentStatus,
                    cancelRequest: order.cancelRequest || false,
                }));
                setOrders(formattedData);
            } catch (error: any) {
                setAlertMessage({ text: error.message || "Không thể tải danh sách đơn hàng.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Lọc đơn hàng theo từ khóa (Mã ĐH hoặc Tên KH) và Trạng thái
    const filteredOrders = orders.filter(order => {
        const matchSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            order.customer.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Thêm logic lọc riêng cho "Yêu cầu hủy"
        const matchStatus = statusFilter === "all" || 
                            (statusFilter === "cancel_request" ? order.cancelRequest === true : order.status === statusFilter);
                            
        return matchSearch && matchStatus;
    });

    // Phân trang
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    // Xử lý thay đổi trạng thái trực tiếp
    const handleStatusChange = async (id: string, newStatus: string) => {
        if (newStatus === "cancelled") {
            setOrderToCancel(id);
        } else {
            try {
                await updateOrderStatusAdmin(id, newStatus);
                updateOrderStatus(id, newStatus);
                setAlertMessage({ text: `Đã cập nhật trạng thái đơn hàng #${id.slice(-6)} thành công!`, type: "success" });
                window.dispatchEvent(new Event('adminOrderChanged'));
            } catch (error: any) {
                setAlertMessage({ text: error.message || "Cập nhật trạng thái thất bại.", type: "error" });
            }
        }
    };

    const updateOrderStatus = (id: string, status: string) => {
        setOrders(prevOrders => prevOrders.map(o => o.id === id ? { ...o, status } : o));
    };

    const updateCancelRequest = (id: string, cancelRequest: boolean) => {
        setOrders(prevOrders => prevOrders.map(o => o.id === id ? { ...o, cancelRequest } : o));
    };

    const handleRejectCancel = async (id: string) => {
        const confirmReject = window.confirm("Bạn có chắc chắn muốn từ chối yêu cầu hủy đơn này?");
        if (!confirmReject) return;

        try {
            await updateOrderStatusAdmin(id, "shipping", true); // Bật cờ rejectCancel
            updateCancelRequest(id, false);
            setAlertMessage({ text: `Đã từ chối yêu cầu hủy đơn hàng #${id.slice(-6)}.`, type: "success" });
            window.dispatchEvent(new Event('adminOrderChanged'));
        } catch (error: any) {
            setAlertMessage({ text: error.message || "Từ chối thất bại.", type: "error" });
        }
    };

    const confirmCancel = async () => {
        if (orderToCancel) {
            try {
                await updateOrderStatusAdmin(orderToCancel, "cancelled");
                updateOrderStatus(orderToCancel, "cancelled");
                updateCancelRequest(orderToCancel, false);
                setAlertMessage({ text: `Đã hủy đơn hàng #${orderToCancel.slice(-6)}.`, type: "success" });
                window.dispatchEvent(new Event('adminOrderChanged'));
            } catch (error: any) {
                setAlertMessage({ text: error.message || "Hủy đơn hàng thất bại.", type: "error" });
            } finally {
                setOrderToCancel(null);
            }
        }
    };

    // Hàm mở Modal xem chi tiết
    const handleViewDetails = (id: string) => {
        const order = rawOrders.find(o => o._id === id);
        if (order) setSelectedOrderDetails(order);
    };

    // Render badge trạng thái
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "pending": return "badge-warning";
            case "shipping": return "badge-info";
            case "delivered": return "badge-success";
            case "cancelled": return "badge-danger";
            default: return "badge-secondary";
        }
    };

    const getPaymentStatusText = (status: string) => {
        switch (status) {
            case 'paid': return 'Đã thanh toán';
            case 'unpaid': return 'Chưa thanh toán';
            case 'refunded': return 'Đã hoàn tiền';
            case 'refund_failed': return 'Lỗi hoàn tiền';
            case 'payment_failed': return 'Thất bại';
            case 'paid_on_delivery': return 'Thanh toán khi nhận';
            default: return '';
        }
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

    return (
        <div className="admin-page-container">
            {/* Alert Hủy Đơn */}
            <Alert 
                show={orderToCancel !== null} 
                title="CẢNH BÁO" 
                type="warning" 
                message={`Bạn có chắc chắn muốn hủy đơn hàng ${orderToCancel}? Hành động này không thể hoàn tác.`} 
                action={
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <Button variant="secondary" width="100px" height="40px" onClick={() => setOrderToCancel(null)}>Đóng</Button>
                        <Button variant="danger" width="100px" height="40px" onClick={confirmCancel}>Hủy đơn</Button>
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
                <h1 className="admin-page-title">Quản lý Đơn hàng</h1>
                {/* <Button variant="secondary" width="160px" height="40px">📥 Xuất báo cáo</Button> */}
            </div>

            <div className="admin-toolbar">
                <div className="admin-search-bar" style={{ width: "400px" }}>
                    <Input 
                        placeholder="Tìm kiếm mã đơn hàng, tên khách hàng..." 
                        value={searchTerm} 
                        onChange={handleSearchChange} 
                    />
                </div>
                <div className="admin-filter-group">
                    <select className="admin-filter-select" value={statusFilter} onChange={handleFilterChange}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">⏳ Chờ lấy hàng</option>
                        <option value="shipping">🚚 Đang giao</option>
                        <option value="delivered">✅ Đã giao</option>
                        <option value="cancelled">❌ Đã hủy</option>
                        <option value="cancel_request">⚠️ Yêu cầu hủy</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã ĐH</th>
                            <th>Khách hàng</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Thanh toán</th>
                            <th>Trạng thái</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px 0' }}>
                                    <Loading fullScreen={false} text="Đang tải dữ liệu hệ thống..." />
                                </td>
                            </tr>
                        ) : currentOrders.length > 0 ? (
                            currentOrders.map(order => (
                            <tr key={order.id} style={{ backgroundColor: order.cancelRequest ? '#fee2e2' : 'transparent' }}>
                                    <td className="font-semibold">#{order.id.slice(-6).toUpperCase()}</td>
                                    <td>
                                        <div>{order.customer}</div>
                                        <div className="text-sm text-gray">{order.phone}</div>
                                    </td>
                                    <td>{order.date}</td>
                                    <td className="product-price-col">{formatCurrency(order.total)}</td>
                                    <td>
                                        <div className="font-semibold">{order.payment}</div>
                                        <div className="text-sm" style={{ color: order.paymentStatus === 'paid' || order.paymentStatus === 'refunded' ? '#10b981' : (order.paymentStatus === 'refund_failed' || order.paymentStatus === 'payment_failed' ? '#ef4444' : '#6b7280'), marginTop: '4px' }}>
                                            {getPaymentStatusText(order.paymentStatus)}
                                        </div>
                                    </td>
                                    <td>
                                    {order.cancelRequest ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span className="badge-danger" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', textAlign: 'center', fontWeight: 'bold', display: 'inline-block' }}>Yêu cầu hủy</span>
                                        </div>
                                    ) : (
                                        <select 
                                            className={`status-select ${getStatusBadgeClass(order.status)}`}
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            disabled={order.status === "cancelled" || order.status === "delivered"}
                                        >
                                            {order.status === "pending" && <option value="pending">Chờ lấy hàng</option>}
                                            {(order.status === "pending" || order.status === "shipping") && <option value="shipping">Đang giao</option>}
                                            {(order.status === "shipping" || order.status === "delivered") && <option value="delivered">Đã giao</option>}
                                            {order.status !== "delivered" && <option value="cancelled">Đã hủy</option>}
                                        </select>
                                    )}
                                    </td>
                                    <td>
                                        <div className="admin-action-btns">
                                            <button className="btn-edit" title="Xem chi tiết" onClick={() => handleViewDetails(order.id)}>📃</button>
                                        {order.cancelRequest && (
                                            <>
                                                <button className="btn-edit" style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }} title="Duyệt hủy" onClick={() => setOrderToCancel(order.id)}>Duyệt</button>
                                                <button className="btn-edit" style={{ backgroundColor: '#6b7280', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }} title="Từ chối hủy" onClick={() => handleRejectCancel(order.id)}>Từ chối</button>
                                            </>
                                        )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="empty-table-message">Không tìm thấy đơn hàng nào phù hợp.</td>
                            </tr>
                        )
                        }
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

            {/* Modal Chi tiết đơn hàng */}
            <OrderDetailModal 
                order={selectedOrderDetails} 
                onClose={() => setSelectedOrderDetails(null)} 
            />
        </div>
    );
}

export default OrderManagement;