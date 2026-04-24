import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../../component/ui/Button";
import Alert from "../../component/ui/Alert";
import "./Checkout.css";
import { getInfoProfile } from "../../services/user.service";
import { createOrder } from "../../services/order.service";

function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Lấy danh sách sản phẩm được truyền qua từ trang Cart
    const checkoutItems = location.state?.selectedItems || [];

    // Nếu người dùng truy cập thẳng link /checkout mà không có sản phẩm nào, tự động đá về giỏ hàng
    useEffect(() => {
        if (checkoutItems.length === 0) {
            navigate("/cart");
        }
    }, [checkoutItems, navigate]);
    
    // State lưu trữ thông tin giao hàng
    const [shippingInfo, setShippingInfo] = useState({
        fullName: "",
        phone: "",
        address: "",
        note: ""
    });

    // State phương thức thanh toán
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [alertMessage, setAlertMessage] = useState<{text: string, type: "success" | "warning" | "error"} | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Dùng useRef để lưu tạm thông tin order sau khi đặt thành công (tránh bị delay state)
    const createdOrderRef = useRef<any>(null);

    // Tự động điền thông tin người dùng
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Gọi API lấy thông tin người dùng dựa trên token
                const user = await getInfoProfile();
                if (user) {
                    setShippingInfo(prev => ({
                        ...prev,
                        fullName: user.fullname || prev.fullName,
                        phone: user.phone || prev.phone,
                        address: user.address || prev.address
                    }));
                }
            } catch (error) {
                console.error("Lỗi khi tự động điền thông tin người dùng:", error);
            }
        };
        
        fetchUserProfile();
    }, []);

    // Hàm format tiền tệ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Tính toán đơn hàng
    const subtotal = checkoutItems.reduce((total: number, item: any) => total + item.price * item.quantity, 0);
    const shippingFee = 30000; // Phí ship giả định
    const totalAmount = subtotal + shippingFee;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async () => {
        if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
            setAlertMessage({ text: "Vui lòng điền đầy đủ thông tin giao hàng!", type: "warning" });
            return;
        }
        
        setIsProcessing(true);

        try {
            const orderData = {
                items: checkoutItems.map((item: any) => ({
                    product: item.productId,
                    color: item.color,
                    quantity: item.quantity,
                    price: item.price
                })),
                shippingInfo,
                paymentMethod,
                subtotal,
                shippingFee,
                totalAmount
            };

            // Gọi API lưu vào cơ sở dữ liệu
            const response = await createOrder(orderData);
            
            // Báo cho Header cập nhật lại số lượng trên icon giỏ hàng
            window.dispatchEvent(new Event('cartUpdated'));

            if (paymentMethod === 'vnpay' && response.payUrl) {
                console.log("=== DEBUG: URL VNPay nhận được từ Backend ===", response.payUrl);
                if (response.payUrl.startsWith('http')) {
                    // Trả lại logic chuyển hướng trang thanh toán
                    setAlertMessage({ text: "Đang chuyển hướng đến cổng thanh toán VNPay...", type: "success" });
                    window.location.href = response.payUrl;
                } else {
                    console.error("=== LỖI: URL VNPay không hợp lệ (Không chứa http/https) ===", response.payUrl);
                    setAlertMessage({ text: "Hệ thống chưa cấu hình URL thanh toán VNPay. Vui lòng kiểm tra lại file .env ở Backend.", type: "error" });
                }
            } else {
                createdOrderRef.current = response.order;
                setAlertMessage({ text: "Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại ElectroShop.", type: "success" });
            }
        } catch (error: any) {
            console.error("=== LỖI KHI ĐẶT HÀNG / THANH TOÁN ===", error);
            setAlertMessage({ text: error.message || "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.", type: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAlertClose = () => {
        if (alertMessage?.type === "success" && paymentMethod !== 'vnpay') {
            setAlertMessage(null);
            navigate("/invoice", { 
                state: { checkoutItems, shippingInfo, paymentMethod, totalAmount, subtotal, shippingFee, orderId: createdOrderRef.current?._id } 
            }); 
        } else {
            setAlertMessage(null);
        }
    };

    const getAlertTitle = (): "THÔNG BÁO" | "CẢNH BÁO" | "LỖI" => {
        if (alertMessage?.type === 'warning') return "CẢNH BÁO";
        if (alertMessage?.type === 'error') return "LỖI";
        return "THÔNG BÁO";
    };

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
                    {checkoutItems.map((item: any) => (
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