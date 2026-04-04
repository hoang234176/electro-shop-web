import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

// Định nghĩa kiểu dữ liệu truyền vào
interface ProductCardProps {
    id?: string;
    name: string;
    price: number;
    imageUrl: string;
    rating?: number;
    reviewCount?: number;
    isOutOfStock?: boolean;
}

function ProductCard({ id, name, price, imageUrl, rating = 0, reviewCount = 0, isOutOfStock }: ProductCardProps) {
    const navigate = useNavigate();

    // 1. Hàm format tiền Việt Nam
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // 2. Hàm in ra số lượng sao đánh giá
    const renderStars = () => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(<span key={i}>{i < rating ? '★' : '☆'}</span>);
        }
        return stars;
    };

    // 3. Xử lý sự kiện bấm nút Mua ngay
    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault(); // Ngăn thẻ <Link> bọc bên ngoài kích hoạt chuyển hướng
        e.stopPropagation();
        const isLoggedIn = !!localStorage.getItem("token");
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }
        
        if (id) {
            const buyNowItem = {
                compositeId: `${id}_Mặc định`,
                productId: id,
                color: "Mặc định",
                name: name,
                price: price,
                imageUrl: imageUrl,
                quantity: 1
            };
            navigate("/checkout", { state: { selectedItems: [buyNowItem] } });
        }
    };

    return (
        <div className="product-card">
            {/* Khu vực 1: Ảnh sản phẩm */}
            <div className="product-image-container">
                <img src={imageUrl} alt={name} className="product-image" />
            </div>

            {/* Khu vực 2: Thông tin sản phẩm */}
            <div className="product-info">
                <h3 className="product-name">{name}</h3>
                
                <div className="product-rating">
                    {reviewCount > 0 ? (
                        <>
                            {renderStars()}
                            <span className="review-count-text">({reviewCount} đánh giá)</span>
                        </>
                    ) : (
                        <span className="no-review-text">Chưa có đánh giá sản phẩm</span>
                    )}
                </div>

                {/* --- HÀNG 1: Giá tiền --- */}
                <div className="product-price-container">
                    <span className="product-price">{formatCurrency(price)}</span>
                </div>
                 
                {/* --- HÀNG 2: Hai nút bấm --- */}
                <div className="product-actions">
                    {/* Nút Mua ngay */}
                    {isOutOfStock ? (
                        <button 
                            className="buy-btn" 
                            disabled 
                            style={{ backgroundColor: '#9ca3af', cursor: 'not-allowed' }}
                            onClick={(e) => e.preventDefault()} // Ngăn chặn chuyển trang khi click vào nút
                        >
                            Đã hết hàng
                        </button>
                    ) : (
                        <button className="buy-btn" onClick={handleBuyNow}>
                            Mua ngay
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductCard;