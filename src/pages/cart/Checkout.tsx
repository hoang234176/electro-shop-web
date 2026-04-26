import { Link } from "react-router-dom";
import Button from "../../component/ui/Button";
import Alert from "../../component/ui/Alert";
import "./Checkout.css";
import { useCheckout } from "../../hooks/features/cart/useCheckout";

interface CheckoutItemType {
    compositeId: string;
    imageUrl: string;
    name: string;
    quantity: number;
    price: number;
}

function Checkout() {
    const {
        checkoutItems, shippingInfo, paymentMethod, setPaymentMethod, alertMessage, isProcessing,
        formatCurrency, subtotal, shippingFee, totalAmount, handleInputChange, handlePlaceOrder, handleAlertClose, getAlertTitle
    } = useCheckout();

    return (
        <div className="checkout-page-container">
            <Alert 
                show={!!alertMessage} 
                title={getAlertTitle()} 
                type={alertMessage?.type || "info"} 
                message={alertMessage?.text || ""} 
                action={<Button variant="primary" width="100px" height="40px" onClick={handleAlertClose}>Đóng</Button>} 
            />
            
            {/* CỘT TRÁI: Form Thông tin */}
            <div className="checkout-main-content">
                <h1 className="checkout-title">Thông tin thanh toán</h1>
                
                <div className="checkout-section">
                    <h2 className="section-heading">1. Thông tin giao hàng</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Họ và tên *</label>
                            <input type="text" name="fullName" value={shippingInfo.fullName} onChange={handleInputChange} placeholder="Nhập họ và tên" />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại *</label>
                            <input type="text" name="phone" value={shippingInfo.phone} onChange={handleInputChange} placeholder="Nhập số điện thoại" />
                        </div>
                        <div className="form-group full-width">
                            <label>Địa chỉ nhận hàng *</label>
                            <input type="text" name="address" value={shippingInfo.address} onChange={handleInputChange} placeholder="Nhập địa chỉ chi tiết (Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)" />
                        </div>
                        <div className="form-group full-width">
                            <label>Ghi chú (Tùy chọn)</label>
                            <textarea name="note" value={shippingInfo.note} onChange={handleInputChange} placeholder="Ghi chú thêm về đơn hàng..." rows={3}></textarea>
                        </div>
                    </div>
                </div>

                <div className="checkout-section">
                    <h2 className="section-heading">2. Phương thức thanh toán</h2>
                    <div className="payment-methods">
                        <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                            <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <div className="payment-info">
                                <span className="payment-name">Thanh toán khi nhận hàng (COD)</span>
                                <span className="payment-desc">Thanh toán bằng tiền mặt khi hàng được giao đến tay bạn.</span>
                            </div>
                        </label>

                        <label className={`payment-option ${paymentMethod === 'vnpay' ? 'selected' : ''}`}>
                            <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <div className="payment-info">
                                <span className="payment-name">Thanh toán qua VNPay</span>
                                <span className="payment-desc">Quét mã QR qua ứng dụng ngân hàng hoặc ví điện tử.</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* CỘT PHẢI: Sidebar Tóm tắt đơn hàng */}
            <div className="checkout-summary-sidebar">
                <h2 className="summary-title">Đơn hàng của bạn</h2>
                
                <div className="checkout-items-list">
                    {checkoutItems.map((item: CheckoutItemType) => (
                        <div key={item.compositeId} className="checkout-item">
                            <div className="item-img-wrapper">
                                <img src={item.imageUrl} alt={item.name} />
                                <span className="item-qty-badge">{item.quantity}</span>
                            </div>
                            <div className="item-info">
                                <span className="item-name">{item.name}</span>
                                <span className="item-price">{formatCurrency(item.price)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row"><span>Tạm tính:</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="summary-row"><span>Phí vận chuyển:</span><span>{formatCurrency(shippingFee)}</span></div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total-row">
                    <span>Tổng cộng:</span>
                    <span className="summary-total-price">{formatCurrency(totalAmount)}</span>
                </div>
                
                <div className="checkout-action">
                    <Button variant="primary" width="100%" height="48px" onClick={handlePlaceOrder} disabled={isProcessing}>
                        {isProcessing ? 'Đang xử lý...' : 'Đặt hàng'}
                    </Button>
                    <Link to="/cart" className="back-to-cart">Quay lại giỏ hàng</Link>
                </div>
            </div>
        </div>
    );
}

export default Checkout;