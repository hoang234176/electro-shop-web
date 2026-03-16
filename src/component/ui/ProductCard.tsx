import React from 'react';
import './ProductCard.css';

// Định nghĩa kiểu dữ liệu truyền vào
interface ProductCardProps {
    name: string;
    price: number;
    imageUrl: string;
    rating?: number; 
}

function ProductCard({ name, price, imageUrl, rating = 5 }: ProductCardProps) {
    // 1. Hàm format tiền Việt Nam
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // 2. Hàm in ra số lượng sao đánh giá
    const renderStars = () => {
        const stars = [];
        for (let i = 0; i < 10; i++) {
            stars.push(<span key={i}>{i < rating ? '★' : '☆'}</span>);
        }
        return stars;
    };

    // 3. Xử lý sự kiện bấm nút Thêm vào giỏ
    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn click lan ra ngoài
        alert(`Đã thêm [${name}] vào giỏ hàng của bạn! 🛒`);
    };

    // 4. Xử lý sự kiện bấm nút Mua ngay
    const handleBuyNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        alert(`Chuyển hướng đến trang thanh toán cho [${name}]! 🚀`);
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
                    {renderStars()}
                </div>

                {/* --- HÀNG 1: Giá tiền --- */}
                <div className="product-price-container">
                    <span className="product-price">{formatCurrency(price)}</span>
                </div>
                 
                {/* --- HÀNG 2: Hai nút bấm --- */}
                <div className="product-actions">
                    {/* Nút Giỏ hàng (Icon SVG) */}
                    <button className="cart-btn" onClick={handleAddToCart} title="Thêm vào giỏ hàng">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" height="20" 
                            viewBox="0 0 24 24" fill="none" 
                            stroke="currentColor" strokeWidth="2" 
                            strokeLinecap="round" strokeLinejoin="round"
                        >
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                    </button>
                    
                    {/* Nút Mua ngay */}
                    <button className="buy-btn" onClick={handleBuyNow}>
                        Mua ngay
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;