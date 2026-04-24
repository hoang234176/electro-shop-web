import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../component/ui/Button";
import { getUserOrders, cancelOrder } from "../../services/order.service";
import Loading from "../../component/ui/Loading";
import "./Invoice.css";

function Invoice() {
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy dữ liệu được truyền sang từ trang Checkout
    const stateData = location.state;
    
    // Lấy query parameters từ URL (Dành cho VNPay return)
    const queryParams = new URLSearchParams(location.search);
    const isVNPayReturn = queryParams.has('vnp_TxnRef');
    const vnpResponseCode = queryParams.get('vnp_ResponseCode');
    const vnpTxnRef = queryParams.get('vnp_TxnRef');
    const vnpAmount = queryParams.get('vnp_Amount');

    const [orderData, setOrderData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Nếu không có state (truy cập trực tiếp) VÀ không phải là redirect từ VNPay về, điều hướng về trang chủ
        if (!stateData && !isVNPayReturn) {
            navigate("/");
            return;
        }

        if (stateData) {
            setOrderData({
                checkoutItems: stateData.checkoutItems || [],
                shippingInfo: stateData.shippingInfo || {},
                paymentMethod: stateData.paymentMethod || "cod",
                totalAmount: stateData.totalAmount || 0,
                subtotal: stateData.subtotal || 0,
                shippingFee: stateData.shippingFee || 0,
                orderId: stateData.orderId || "",
                isSuccess: true
            });
        } else if (isVNPayReturn) {
            const fetchOrderDetails = async () => {
                setIsLoading(true);
                try {
                    // Lấy tất cả đơn hàng và tìm đơn hàng hiện tại dựa theo vnpTxnRef (orderId)
                    const orders = await getUserOrders();
                    const order = orders.find((o: any) => o._id === vnpTxnRef);
                    if (order) {
                        const items = order.items.map((item: any) => ({
                            productId: item.product?._id || '',
                            name: item.product?.name || 'Sản phẩm',
                            color: item.color,
                            price: item.price,
                            quantity: item.quantity,
                            imageUrl: item.product?.variants?.find((v: any) => v.color === item.color)?.image || 'https://via.placeholder.com/150',
                            compositeId: `${item.product?._id}_${item.color}`
                        }));

                        setOrderData({
                            checkoutItems: items,
                            shippingInfo: order.shippingInfo || {},
                            paymentMethod: order.paymentMethod || "vnpay",
                            totalAmount: order.totalAmount || (vnpAmount ? parseInt(vnpAmount) / 100 : 0),
                            subtotal: order.subtotal || 0,
                            shippingFee: order.shippingFee || 0,
                            orderId: vnpTxnRef || "",
                            isSuccess: vnpResponseCode === "00"
                        });

                        // Nếu người dùng hủy thanh toán, tự động xóa giao dịch và về trang checkout
                        if (vnpResponseCode !== "00") {
                            try {
                                await cancelOrder(vnpTxnRef as string);
                            } catch (err) {
                                console.error("Lỗi khi tự động xóa đơn do thanh toán thất bại:", err);
                            }
                            navigate("/checkout", { state: { selectedItems: items }, replace: true });
                            return; // Dừng render
                        }
                    } else {
                        // Fallback nếu không tìm thấy đơn hàng trên DB
                        if (vnpResponseCode !== "00") {
                            navigate("/cart", { replace: true });
                            return;
                        }
                        setOrderData({
                            checkoutItems: [],
                            shippingInfo: {},
                            paymentMethod: "vnpay",
                            totalAmount: vnpAmount ? parseInt(vnpAmount) / 100 : 0,
                            subtotal: 0,
                            shippingFee: 0,
                            orderId: vnpTxnRef || "",
                            isSuccess: vnpResponseCode === "00"
                        });
                    }
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin đơn hàng:", error);
                    setOrderData({
                        checkoutItems: [],
                        shippingInfo: {},
                        paymentMethod: "vnpay",
                        totalAmount: vnpAmount ? parseInt(vnpAmount) / 100 : 0,
                        subtotal: 0,
                        shippingFee: 0,
                        orderId: vnpTxnRef || "",
                        isSuccess: vnpResponseCode === "00"
                    });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchOrderDetails();
        }
    }, [stateData, isVNPayReturn, navigate, vnpTxnRef, vnpAmount, vnpResponseCode]);

    if (!stateData && !isVNPayReturn) return null; // Tránh render lỗi trong lúc chờ điều hướng

    if (isLoading || !orderData) {
        return (
            <div className="invoice-container">
                <Loading fullScreen={false} text="Đang xử lý kết quả giao dịch..." />
            </div>
        );
    }

    const { checkoutItems, shippingInfo, paymentMethod, totalAmount, subtotal, shippingFee, orderId, isSuccess } = orderData;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const displayPaymentMethod = paymentMethod === 'vnpay' ? 'Thanh toán qua VNPay' : 'Thanh toán khi nhận hàng (COD)';
    const displayDate = new Date().toLocaleDateString("vi-VN");

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
                                {checkoutItems.map((item: any, index: number) => (
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