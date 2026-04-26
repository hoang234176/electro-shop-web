import { Link } from "react-router-dom";
import Button from "../../component/ui/Button";
import Loading from "../../component/ui/Loading";
import "./Invoice.css";
import { useInvoice } from "../../hooks/features/cart/useInvoice";

interface InvoiceItem {
    compositeId?: string;
    name: string;
    color: string;
    quantity: number;
    price: number;
}

function Invoice() {
    const { stateData, isVNPayReturn, orderData, isLoading, formatCurrency, displayPaymentMethod, displayDate } = useInvoice();

    if (!stateData && !isVNPayReturn) return null; // Tránh render lỗi trong lúc chờ điều hướng

    if (isLoading || !orderData) {
        return (
            <div className="invoice-container">
                <Loading fullScreen={false} text="Đang xử lý kết quả giao dịch..." />
            </div>
        );
    }

    const { checkoutItems, shippingInfo, totalAmount, subtotal, shippingFee, orderId, isSuccess } = orderData;

    return (
        <div className="invoice-container">
            <div className="invoice-header-banner" style={{ backgroundColor: isSuccess ? '#e8f5e9' : '#ffebee' }}>
                <div className="success-icon" style={{ backgroundColor: isSuccess ? '#4caf50' : '#f44336' }}>{isSuccess ? '✓' : '✕'}</div>
                <h1 className="invoice-title" style={{ color: isSuccess ? '#2e7d32' : '#c62828' }}>
                    {isSuccess ? 'Đặt hàng thành công!' : 'Thanh toán thất bại!'}
                </h1>
                <p className="invoice-subtitle">
                    {isSuccess 
                        ? <>Cảm ơn bạn đã mua sắm tại ElectroShop. Mã đơn hàng của bạn là <strong>#{orderId ? orderId.slice(-6).toUpperCase() : "Đang cập nhật"}</strong>.</>
                        : <>Rất tiếc, giao dịch thanh toán của bạn không thành công hoặc đã bị hủy. Đơn hàng <strong>#{orderId ? orderId.slice(-6).toUpperCase() : ""}</strong> đã tự động hủy.</>
                    }
                </p>
            </div>

            <div className="invoice-content">
                <div className="invoice-details-grid">
                    {shippingInfo.fullName && (
                        <div className="invoice-info-card">
                            <h3>Thông tin giao hàng</h3>
                            <p><strong>Người nhận:</strong> {shippingInfo.fullName}</p>
                            <p><strong>Điện thoại:</strong> {shippingInfo.phone}</p>
                            <p><strong>Địa chỉ:</strong> {shippingInfo.address}</p>
                        </div>
                    )}
                    <div className="invoice-info-card">
                        <h3>Phương thức thanh toán</h3>
                        <p>{displayPaymentMethod}</p>
                        <p><strong>Ngày đặt:</strong> {displayDate}</p>
                    </div>
                </div>

                {(checkoutItems.length > 0 || totalAmount > 0) && (
                    <div className="invoice-items-table">
                        <h3>Chi tiết đơn hàng</h3>
                        {checkoutItems.length > 0 && (
                            <>
                                <div className="table-header">
                                    <div className="col-product">Sản phẩm</div>
                                    <div className="col-qty">SL</div>
                                    <div className="col-price">Đơn giá</div>
                                    <div className="col-total">Thành tiền</div>
                                </div>
                                {checkoutItems.map((item: InvoiceItem, index: number) => (
                                    <div className="table-row" key={item.compositeId || index}>
                                        <div className="col-product">{item.name} - Bản màu {item.color}</div>
                                        <div className="col-qty">{item.quantity}</div>
                                        <div className="col-price">{formatCurrency(item.price)}</div>
                                        <div className="col-total">{formatCurrency(item.price * item.quantity)}</div>
                                    </div>
                                ))}
                            </>
                        )}
                        <div className="table-footer">
                            {subtotal > 0 && <div className="summary-line"><span>Tạm tính:</span><span>{formatCurrency(subtotal)}</span></div>}
                            {shippingFee > 0 && <div className="summary-line"><span>Phí vận chuyển:</span><span>{formatCurrency(shippingFee)}</span></div>}
                            <div className="summary-line total-line"><span>Tổng cộng:</span><span className="total-amount">{formatCurrency(totalAmount)}</span></div>
                        </div>
                    </div>
                )}

                <div className="invoice-actions">
                    <Link to="/"><Button variant="secondary" width="200px" height="48px">Tiếp tục mua sắm</Button></Link>
                    <Link to="/user/orders"><Button variant="primary" width="200px" height="48px">Theo dõi đơn hàng</Button></Link>
                </div>
            </div>
        </div>
    );
}

export default Invoice;