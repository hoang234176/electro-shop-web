import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../../component/ui/Button";
import Alert from "../../component/ui/Alert";
import { getCart, updateCartQuantity, removeFromCart } from "../../services/cartServices";
import "./Cart.css";

// Interface định dạng lại dữ liệu lấy từ backend để dễ render
interface DisplayCartItem {
    compositeId: string; // ID kết hợp giữa productId và color (ví dụ: "123_Đen")
    productId: string;
    color: string;
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
    maxQuantity: number; // Thêm trường giới hạn số lượng trong kho
}

function Cart() {
    const [cartItems, setCartItems] = useState<DisplayCartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Quản lý danh sách compositeId các sản phẩm đang được check chọn
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [alertMessage, setAlertMessage] = useState<{text: string, type: 'success' | 'error' | 'warning' | 'info'} | null>(null);

    const isLoggedIn = !!localStorage.getItem("token");

    // Gọi API lấy dữ liệu giỏ hàng khi vào trang
    useEffect(() => {
        const fetchCartData = async () => {
            if (!isLoggedIn) return; // Nếu chưa đăng nhập thì không gọi API
            
            setIsLoading(true);
            try {
                const cart = await getCart();
                if (cart && cart.items) {
                    const formattedItems: DisplayCartItem[] = cart.items.map(item => {
                        // Tìm ảnh ứng với phiên bản màu đã chọn, nếu không có lấy ảnh rỗng
                        const variant = item.product.variants?.find((v: any) => v.color === item.color);
                        const imageUrl = variant?.image || 'https://via.placeholder.com/150?text=No+Image';
                        const maxQuantity = variant?.quantity || 0; // Lấy số lượng tồn kho của phiên bản này

                        return {
                            compositeId: `${item.product._id}_${item.color}`,
                            productId: item.product._id,
                            color: item.color,
                            name: `${item.product.name} - ${item.color}`, // Hiển thị kèm màu để dễ nhận biết
                            price: item.product.price,
                            imageUrl: imageUrl,
                            quantity: item.quantity,
                            maxQuantity: maxQuantity
                        };
                    });
                    setCartItems(formattedItems);
                    // Mặc định tick chọn tất cả các sản phẩm khi load xong
                    setSelectedIds(formattedItems.map(i => i.compositeId));
                }
            } catch (error: any) {
                console.error("Lỗi lấy giỏ hàng:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCartData();
    }, [isLoggedIn]);

    // Hàm format tiền tệ VNĐ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Hàm cập nhật số lượng sản phẩm
    const updateQuantity = async (productId: string, color: string, currentQuantity: number, delta: number, maxQuantity: number) => {
        const newQuantity = currentQuantity + delta;
        if (newQuantity < 1) return; // Không cho phép giảm dưới 1

        // Kiểm tra số lượng tồn kho
        if (newQuantity > maxQuantity) {
            setAlertMessage({ text: `Số lượng sản phẩm trong kho đã hết (chỉ còn tối đa ${maxQuantity} chiếc).`, type: 'warning' });
            return;
        }

        try {
            await updateCartQuantity({ productId, color, quantity: newQuantity });
            // Cập nhật lại UI ngay lập tức cho mượt
            setCartItems(prev => prev.map(item => 
                (item.productId === productId && item.color === color) ? { ...item, quantity: newQuantity } : item
            ));
        } catch (error: any) {
            setAlertMessage({ text: error.message || "Lỗi cập nhật số lượng", type: 'error' });
        }
    };

    // Hàm xóa sản phẩm khỏi giỏ
    const removeItem = async (productId: string, color: string, compositeId: string) => {
        try {
            await removeFromCart({ productId, color });
            setCartItems(prev => prev.filter(item => item.compositeId !== compositeId));
            setSelectedIds(prev => prev.filter(id => id !== compositeId));
            setAlertMessage({ text: "Đã xóa sản phẩm khỏi giỏ hàng", type: 'success' });
            
            // Báo cho Header biết giỏ hàng vừa thay đổi để cập nhật số lượng
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error: any) {
            setAlertMessage({ text: error.message || "Lỗi xóa sản phẩm", type: 'error' });
        }
    };

    // Hàm xử lý khi chọn/bỏ chọn 1 sản phẩm
    const handleToggleSelect = (compositeId: string) => {
        setSelectedIds(prev => 
            prev.includes(compositeId) ? prev.filter(id => id !== compositeId) : [...prev, compositeId]
        );
    };

    // Hàm xử lý chọn/bỏ chọn tất cả
    const handleToggleSelectAll = () => {
        if (selectedIds.length === cartItems.length && cartItems.length > 0) {
            setSelectedIds([]); // Bỏ chọn hết
        } else {
            setSelectedIds(cartItems.map(item => item.compositeId)); // Chọn tất cả
        }
    };

    // Hàm xóa các sản phẩm đã chọn
    const handleRemoveSelected = async () => {
        if (selectedIds.length === 0) return;
        
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn khỏi giỏ hàng?`);
        if (!confirmDelete) return;

        const itemsToRemove = cartItems.filter(item => selectedIds.includes(item.compositeId));

        try {
            // Gọi API xóa từng sản phẩm đã chọn (dùng Promise.all để chạy song song)
            await Promise.all(itemsToRemove.map(item => 
                removeFromCart({ productId: item.productId, color: item.color })
            ));

            // Cập nhật lại UI sau khi xóa thành công
            setCartItems(prev => prev.filter(item => !selectedIds.includes(item.compositeId)));
            setSelectedIds([]);
            setAlertMessage({ text: `Đã xóa ${itemsToRemove.length} sản phẩm khỏi giỏ hàng`, type: 'success' });
            
            // Báo cho Header biết để cập nhật số lượng
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error: any) {
            setAlertMessage({ text: "Có lỗi xảy ra khi xóa một số sản phẩm.", type: 'error' });
        }
    };

    // Tính tổng tiền CHỈ cho những sản phẩm đang được chọn
    const selectedItems = cartItems.filter(item => selectedIds.includes(item.compositeId));
    const totalAmount = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const getAlertTitle = (): "THÔNG BÁO" | "CẢNH BÁO" | "LỖI" => {
        if (alertMessage?.type === 'warning') return "CẢNH BÁO";
        if (alertMessage?.type === 'error') return "LỖI";
        return "THÔNG BÁO";
    };

    if (!isLoggedIn) {
        return (
            <div className="cart-page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
                <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Vui lòng đăng nhập</h2>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>Bạn cần đăng nhập để xem và quản lý giỏ hàng của mình.</p>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <Button variant="primary" width="200px" height="48px">Đăng nhập ngay</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <Alert 
                show={!!alertMessage} 
                title={getAlertTitle()} 
                type={alertMessage?.type || "info"} 
                message={alertMessage?.text || ""} 
                action={<Button variant="primary" width="100px" height="40px" onClick={() => setAlertMessage(null)}>Đóng</Button>} 
            />
            
            {/* Cột trái: Danh sách sản phẩm */}
            <div className="cart-main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h1 className="cart-title" style={{ marginBottom: 0 }}>Giỏ hàng của bạn</h1>
                    {selectedIds.length > 0 && cartItems.length > 0 && (
                        <button 
                            onClick={handleRemoveSelected}
                            style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                            title="Xóa các sản phẩm đang được đánh dấu"
                        >
                            🗑️ Xóa ({selectedIds.length}) mục đã chọn
                        </button>
                    )}
                </div>
                
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px 0', fontSize: '1.2rem', color: '#6b7280' }}>
                        Đang tải giỏ hàng...
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <p>Giỏ hàng của bạn đang trống.</p>
                        <Link to="/">
                            <Button variant="primary" width="200px" height="48px">Tiếp tục mua sắm</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="cart-items-list">
                        <div className="cart-header-row">
                            <div className="header-col select-col">
                                <input 
                                    type="checkbox" 
                                    checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                                    onChange={handleToggleSelectAll}
                                />
                            </div>
                            <div className="header-col product-col">Sản phẩm</div>
                            <div className="header-col price-col" style={{ paddingLeft: '24px' }}>Đơn giá</div>
                            <div className="header-col qty-col" style={{ paddingLeft: '24px'}}>Số lượng</div>
                            <div className="header-col total-col" style={{ paddingLeft: '24px'}}>Thành tiền</div>
                            <div className="header-col action-col"></div>
                        </div>

                        {cartItems.map(item => (
                            <div key={item.compositeId} className="cart-item-row">
                                <div className="cart-col select-col">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(item.compositeId)}
                                        onChange={() => handleToggleSelect(item.compositeId)}
                                    />
                                </div>
                                <div className="cart-col product-col">
                                    <img src={item.imageUrl} alt={item.name} className="cart-item-img" />
                                    <Link to={`/product/${item.productId}`} className="cart-item-name">{item.name}</Link>
                                </div>
                                <div className="cart-col price-col" style={{ paddingLeft: '24px' }}>{formatCurrency(item.price)}</div>
                                <div className="cart-col qty-col" style={{ paddingLeft: '24px' }}>
                                    <div className="cart-qty-control">
                                        <button onClick={() => updateQuantity(item.productId, item.color, item.quantity, -1, item.maxQuantity)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.productId, item.color, item.quantity, 1, item.maxQuantity)}
                                            style={{ 
                                                cursor: item.quantity >= item.maxQuantity ? 'not-allowed' : 'pointer',
                                                opacity: item.quantity >= item.maxQuantity ? 0.5 : 1,
                                                backgroundColor: item.quantity >= item.maxQuantity ? '#f3f4f6' : ''
                                            }}
                                            title={item.quantity >= item.maxQuantity ? "Đã đạt số lượng tối đa trong kho" : "Tăng số lượng"}
                                        >+</button>
                                    </div>
                                </div>
                                <div className="cart-col total-col item-total-price" style={{ paddingLeft: '24px' }}>
                                    {formatCurrency(item.price * item.quantity)}
                                </div>
                                <div className="cart-col action-col">
                                    <button className="btn-remove-item" onClick={() => removeItem(item.productId, item.color, item.compositeId)} title="Xóa sản phẩm">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cột phải: Tóm tắt đơn hàng */}
            {cartItems.length > 0 && (
                <div className="cart-summary-sidebar">
                    <h2 className="summary-title">Tóm tắt đơn hàng</h2>
                    <div className="summary-row"><span>Tạm tính ({selectedIds.length} sản phẩm):</span><span>{formatCurrency(totalAmount)}</span></div>
                    <div className="summary-row"><span>Giảm giá:</span><span>0 ₫</span></div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total-row"><span>Tổng tiền:</span><span className="summary-total-price">{formatCurrency(totalAmount)}</span></div>
                    <p className="summary-note">(Đã bao gồm VAT nếu có)</p>
                    
                    <Link 
                        to="/checkout"
                        state={{ selectedItems }}
                        className={`checkout-link ${selectedIds.length === 0 ? 'disabled' : ''}`}
                        onClick={(e) => {
                            if (selectedIds.length === 0) {
                                e.preventDefault(); // Ngăn chuyển trang nếu không có sp nào được chọn
                                setAlertMessage({ text: "Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!", type: 'warning' });
                            }
                        }}
                    >
                        <Button variant="primary" width="100%" height="48px">Tiến hành thanh toán</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}

export default Cart;