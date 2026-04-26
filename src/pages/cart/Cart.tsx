import { Link } from "react-router-dom";
import Button from "../../component/ui/Button";
import Alert from "../../component/ui/Alert";
import { FiTrash2 } from "react-icons/fi";
import "./Cart.css";
import { useCart } from "../../hooks/features/cart/useCart";

function Cart() {
    const {
        alertMessage, setAlertMessage, getAlertTitle, selectedIds, cartItems, handleRemoveSelected, isLoading, handleToggleSelectAll,
        formatCurrency, handleToggleSelect, updateQuantity, removeItem, totalAmount, selectedItems, isLoggedIn
    } = useCart();

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
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                            title="Xóa các sản phẩm đang được đánh dấu"
                        >
                            <FiTrash2 size={18} /> Xóa ({selectedIds.length}) mục đã chọn
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
                                    <button className="btn-remove-item" onClick={() => removeItem(item.productId, item.color, item.compositeId)} title="Xóa sản phẩm">
                                        <FiTrash2 size={20} />
                                    </button>
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