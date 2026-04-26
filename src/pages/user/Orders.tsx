import { Link } from "react-router-dom";
import UserSidebar from "../../component/layout/UserSidebar";
import Button from "../../component/ui/Button";
import Alert from "../../component/ui/Alert";
import Loading from "../../component/ui/Loading";
import "./Orders.css";
import { useOrders, type DisplayOrderItem } from "../../hooks/features/user/useOrders";

function Orders() {
    const {
        alert, setAlert, orderToCancelId, setOrderToCancelId, isRequestingCancel, handleConfirmCancel, 
        pageTitle, isLoading, filteredOrders, currentOrdersToDisplay, getStatusInfo, getPaymentMethodInfo, 
        formatCurrency, handleCancelClick, totalPages, currentPage, setCurrentPage, getPaginationGroup, isLoggedIn
    } = useOrders();

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
                                        {order.items.map((item: DisplayOrderItem) => (
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
                                onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={currentPage === 1}
                            >
                                Trước
                            </button>
                            
                            {getPaginationGroup().map((page, index) => (
                                <button 
                                    key={index} 
                                    className={`pagination-btn ${currentPage === page ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                                    onClick={() => { if (typeof page === 'number') { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                                    disabled={page === '...'}
                                >
                                    {page}
                                </button>
                            ))}
                            <button 
                                className="pagination-btn" 
                                onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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