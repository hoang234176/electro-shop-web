import React from 'react';
import './OrderDetailModal.css';

interface OrderDetailModalProps {
    order: any;
    onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
    if (!order) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="order-modal-overlay" onClick={onClose}>
            <div className="order-modal-content" onClick={e => e.stopPropagation()}>
                <div className="order-modal-header">
                    <h2>Chi tiết đơn hàng #{order._id.slice(-6).toUpperCase()}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <div className="order-modal-body">
                    <div className="info-grid">
                        <div className="info-card">
                            <h3>Thông tin khách hàng</h3>
                            <p><strong>Tên:</strong> {order.user?.fullname || 'N/A'}</p>
                            <p><strong>Email:</strong> {order.user?.email || 'N/A'}</p>
                            <p><strong>Điện thoại:</strong> {order.user?.phone || 'N/A'}</p>
                        </div>
                        <div className="info-card">
                            <h3>Thông tin giao hàng</h3>
                            <p><strong>Người nhận:</strong> {order.shippingInfo?.fullName}</p>
                            <p><strong>Điện thoại:</strong> {order.shippingInfo?.phone}</p>
                            <p><strong>Địa chỉ:</strong> {order.shippingInfo?.address}</p>
                            {order.shippingInfo?.note && <p><strong>Ghi chú:</strong> {order.shippingInfo.note}</p>}
                        </div>
                    </div>

                    <div className="info-card" style={{ marginTop: '20px' }}>
                        <h3>Danh sách sản phẩm</h3>
                        <table className="modal-items-table">
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Đơn giá</th>
                                    <th>SL</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item: any, index: number) => {
                                    const product = item.product || {};
                                    const variant = product.variants?.find((v: any) => v.color === item.color);
                                    const imageUrl = variant?.image || product.variants?.[0]?.image || 'https://via.placeholder.com/150?text=No+Image';
                                    
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <div className="modal-item-info">
                                                    <img src={imageUrl} alt={product.name} />
                                                    <span>{product.name || 'Sản phẩm đã bị xóa'} - {item.color}</span>
                                                </div>
                                            </td>
                                            <td>{formatCurrency(item.price)}</td>
                                            <td>{item.quantity}</td>
                                            <td>{formatCurrency(item.price * item.quantity)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        <div className="modal-summary">
                            <div className="modal-summary-row"><span>Tạm tính:</span> <span>{formatCurrency(order.subtotal)}</span></div>
                            <div className="modal-summary-row"><span>Phí vận chuyển:</span> <span>{formatCurrency(order.shippingFee)}</span></div>
                            <div className="modal-summary-row total"><span>Tổng cộng:</span> <span>{formatCurrency(order.totalAmount)}</span></div>
                            <div className="modal-summary-row"><span>Phương thức:</span> <span>{order.paymentMethod.toUpperCase()}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;