import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import Alert from "../../component/ui/Alert";
import "./OrderManagement.css";
import OrderDetailModal, { type OrderDetail } from "../../component/ui/OrderDetailModal";
import Loading from "../../component/ui/Loading";
import { LuNewspaper } from "react-icons/lu"
import { useOrderManagement } from "../../hooks/features/admin/useOrderManagement";

function OrderManagement() {
    const {
        searchTerm, handleSearchChange, statusFilter, handleFilterChange, isLoading, currentOrders,
        formatCurrency, getPaymentStatusText, orderToCancel, setOrderToCancel, confirmCancel, handleStatusChange,
        getStatusBadgeClass, handleViewDetails, handleRejectCancel, alertMessage, setAlertMessage, getAlertTitle,
        totalPages, currentPage, setCurrentPage, getPaginationGroup, selectedOrderDetails, setSelectedOrderDetails
    } = useOrderManagement();

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
                                            <button className="btn-edit" title="Xem chi tiết" onClick={() => handleViewDetails(order.id)}>
                                                <LuNewspaper className="show-info-order" />
                                            </button>
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

            {/* Modal Chi tiết đơn hàng */}
            <OrderDetailModal 
                order={selectedOrderDetails as unknown as OrderDetail} 
                onClose={() => setSelectedOrderDetails(null)} 
            />
        </div>
    );
}

export default OrderManagement;