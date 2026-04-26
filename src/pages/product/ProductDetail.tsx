import { Link } from "react-router-dom";
import Button from "../../component/ui/Button";
import Alert from "../../component/ui/Alert";
import ReviewSummary from "../../component/ui/ReviewSummary";
import ProductCard from "../../component/ui/ProductCard";
import "./ProductDetail.css";
import { LuSparkles } from "react-icons/lu";
import { useProductDetail, type ApiProductVariant } from "../../hooks/features/product/useProductDetail";

function ProductDetail() {
    const {
        navigate, product, isLoading, images, activeImage, setActiveImage, selectedColor, setSelectedColor, quantity, setQuantity,
        reviews, reviewText, setReviewText, reviewRating, setReviewRating, hoverRating, setHoverRating, isSubmittingReview, alertMessage, setAlertMessage, relatedProducts, isRelatedLoading, isLoggedIn, formatCurrency, hasRated, handleReviewSubmit, totalReviews, ratingBreakdown, availableStock, specsArray, handleAddToCart, handleBuyNow, getAlertTitle
    } = useProductDetail();

    // Hàm render số sao đánh giá
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(<span key={i} className={i < rating ? "star active" : "star"}>★</span>);
        }
        return stars;
    };

    // Hàm render selector chọn số sao khi đánh giá
    const renderRatingSelect = () => {
        return (
            <div className="rating-select" style={{ marginBottom: '10px', display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={`select-${star}`}
                        className={`star ${star <= (hoverRating || reviewRating) ? 'active' : ''}`}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                            cursor: 'pointer',
                            fontSize: '28px',
                            color: star <= (hoverRating || reviewRating) ? '#ffc107' : '#e4e5e9', // Màu vàng cho sao đang chọn/hover
                            transition: 'color 0.2s ease-in-out'
                        }}
                    >★</span>
                ))}
            </div>
        );
    };

    if (isLoading) {
        return <div className="product-detail-container" style={{ textAlign: 'center', padding: '50px' }}><h3>Đang tải thông tin sản phẩm...</h3></div>;
    }

    if (!product) {
        return <div className="product-detail-container" style={{ textAlign: 'center', padding: '50px' }}><h3>Không tìm thấy sản phẩm.</h3><Button variant="primary" width="150px" height="40px" onClick={() => navigate('/')}>Về trang chủ</Button></div>;
    }

    return (
        <div className="product-detail-container">
            <Alert
                show={!!alertMessage}
                title={getAlertTitle()}
                type={alertMessage?.type || "info"}
                message={alertMessage?.text || ""}
                action={
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <Button variant={alertMessage?.text.includes("đăng nhập") ? "secondary" : "primary"} width="100px" height="40px" onClick={() => setAlertMessage(null)}>Đóng</Button>
                        {alertMessage?.text.includes("đăng nhập") && (
                            <Button variant="primary" width="140px" height="40px" onClick={() => navigate('/login')}>Đăng nhập ngay</Button>
                        )}
                    </div>
                }
            />

            {/* --- 1. THÔNG TIN SẢN PHẨM CHÍNH --- */}
            <div className="product-main-section">
                <div className="product-image-wrapper">
                    <div className="main-image-container">
                        <img src={activeImage} alt={product.name} className="product-main-image" />
                    </div>
                    {/* Danh sách ảnh thu nhỏ (Thumbnails) */}
                    <div className="thumbnail-list">
                        {images.map((img, index) => (
                            <div
                                key={index}
                                className={`thumbnail-item ${activeImage === img ? 'active' : ''}`}
                                onClick={() => setActiveImage(img)}
                            >
                                <img src={img} alt={`${product.name} hình ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="product-info-wrapper">
                    <h1 className="product-title">{product.name}</h1>

                    {totalReviews > 0 ? (
                        <div className="product-rating-row">
                            <div className="stars">{renderStars(product.rating || 0)}</div>
                            <span className="rating-text">({totalReviews} đánh giá)</span>
                        </div>
                    ) : (
                        <div className="product-rating-row">
                            <span className="rating-text">Chưa có đánh giá</span>
                        </div>
                    )}

                    <div className="product-price-row">
                        <span className="current-price">{formatCurrency(product.price)}</span>
                    </div>

                    <p className="product-description">{product.description}</p>

                    {/* --- VÙNG CHỌN PHIÊN BẢN --- */}
                    <div className="product-variants">
                        <label>Phiên bản:</label>
                        <div className="variant-buttons">
                            {product.variants?.map((variant: ApiProductVariant, index: number) => (
                                <button
                                    key={index}
                                    className={`variant-btn ${selectedColor === variant.color ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedColor(variant.color);
                                        if (variant.image) setActiveImage(variant.image);
                                    }}
                                >
                                    {variant.color}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="product-stock">
                        <span>Kho: <strong>{availableStock}</strong> sản phẩm</span>
                    </div>

                    <div className="product-quantity">
                        <label>Số lượng:</label>
                        <div className="quantity-control">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>
                    </div>

                    <div className="product-action-buttons">
                        <Button variant="secondary" width="200px" height="48px" onClick={handleAddToCart}>
                            Thêm vào giỏ hàng
                        </Button>
                        <Button variant="primary" width="200px" height="48px" onClick={handleBuyNow}>
                            Mua ngay
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- 2. THÔNG SỐ KỸ THUẬT --- */}
            <div className="product-specs-section">
                <h2 className="section-title">Thông số kỹ thuật</h2>
                <table className="specs-table">
                    <tbody>
                        {specsArray.map((spec, index) => (
                            <tr key={index}>
                                <td className="spec-label">{spec.label}</td>
                                <td className="spec-value">{spec.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- 3. NHẬN XÉT SẢN PHẨM --- */}
            <div className="product-reviews-section">
                <h2 className="section-title">Đánh giá & Nhận xét</h2>

                {/* Phần tổng quan đánh giá */}
                <ReviewSummary
                    averageRating={product.rating || 0}
                    totalReviews={totalReviews}
                    ratingBreakdown={ratingBreakdown}
                />

                {/* Vùng Form Thêm Nhận Xét */}
                {isLoggedIn ? (
                    <div className="review-form">
                        <h3 className="review-form-title">Viết nhận xét của bạn</h3>
                        {/* Chỉ hiện chọn sao nếu chưa từng đánh giá sao */}
                        {!hasRated ? (
                            renderRatingSelect()
                        ) : (
                            <div className="rated-notice" style={{ color: '#10b981', marginBottom: '15px', fontSize: '0.95rem', fontWeight: 500 }}>
                                ✓ Bạn đã đánh giá sao cho sản phẩm này. Dưới đây bạn có thể bình luận thêm.
                            </div>
                        )}
                        <textarea
                            className="review-textarea"
                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={4}
                        ></textarea>
                        <Button variant="primary" width="160px" height="40px" onClick={handleReviewSubmit} disabled={isSubmittingReview}>
                            {isSubmittingReview ? "Đang gửi..." : "Gửi nhận xét"}
                        </Button>
                    </div>
                ) : (
                    <div className="login-prompt">
                        <p>Vui lòng <Link to="/login">đăng nhập</Link> để gửi nhận xét của bạn.</p>
                    </div>
                )}

                {/* Danh sách các nhận xét đã có */}
                <div className="reviews-list">
                    {reviews.length > 0 ? reviews.map(review => (
                        <div key={review._id} className="review-item">
                            <div className="review-header">
                                <span className="review-author">{review.user?.fullname || 'Người dùng ẩn danh'}</span>
                                <span className="review-date">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            {review.rating > 0 && <div className="review-rating"><div className="stars">{renderStars(review.rating)}</div></div>}
                            <p className="review-content">{review.comment}</p>
                        </div>
                    )) : (
                        <p>Chưa có nhận xét nào cho sản phẩm này. Hãy là người đầu tiên để lại nhận xét!</p>
                    )}
                </div>
            </div>

            {/* --- 4. SẢN PHẨM ĐỀ XUẤT ĐI KÈM --- */}
            <div className="related-products-section" style={{ marginTop: '40px' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LuSparkles style={{ color: '#3b82f6' }} /> AI ĐỀ XUẤT PHỤ KIỆN ĐI KÈM
                </h2>
                {isRelatedLoading ? (
                    <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>🤖 AI đang phân tích và tìm các phụ kiện phù hợp nhất cho bạn...</p>
                ) : relatedProducts.length > 0 ? (
                    <div className="product-grid">
                        {relatedProducts.map(product => (
                            <Link to={`/product/${product.id}`} key={`related-${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    imageUrl={product.imageUrl}
                                    rating={product.rating}
                                    reviewCount={product.reviewCount}
                                    isOutOfStock={product.isOutOfStock}
                                />
                            </Link>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default ProductDetail;