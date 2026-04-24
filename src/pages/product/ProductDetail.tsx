import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Button from "../../component/ui/Button";
import Alert from "../../component/ui/Alert";
import { getProductById, getAllProducts } from "../../services/product.service";
import { getReviewsByProduct, createReview } from "../../services/review.service";
import ReviewSummary from "../../component/ui/ReviewSummary";
import { getUserId } from "../../utils/token.util";
import { addToCart } from "../../services/cart.service";
import { getRelatedProductsFromAI } from "../../services/ai.service";
import ProductCard from "../../component/ui/ProductCard";
import "./ProductDetail.css";
import { LuSparkles } from "react-icons/lu";

function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);

    // State cho dữ liệu sản phẩm từ API
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [images, setImages] = useState<string[]>([]);
    const [activeImage, setActiveImage] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    // State cho phần nhận xét
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0); // State mới xử lý hiệu ứng di chuột (hover)
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [isRelatedLoading, setIsRelatedLoading] = useState(false);

    // Lấy dữ liệu sản phẩm từ API và cuộn trang
    useEffect(() => {
        const fetchProductDetail = async () => {
            if (!id) return;
            setIsLoading(true);
            setReviews([]); // Reset reviews khi đổi sản phẩm
            try {
                // Lấy thông tin sản phẩm và review song song
                const [productData, reviewsData] = await Promise.all([
                    getProductById(id),
                    getReviewsByProduct(id)
                ]);

                setProduct(productData);
                setReviews(reviewsData);

                // Lấy tất cả ảnh từ các phiên bản (variants) và loại bỏ trùng lặp
                const uniqueVariantImages = Array.from(new Set(productData.variants?.map((v: any) => v.image).filter(Boolean))) as string[];
                const productImages = uniqueVariantImages.length > 0 ? uniqueVariantImages : ["https://via.placeholder.com/500?text=No+Image"];

                setImages(productImages);
                setActiveImage(productImages[0]);

                // Mặc định chọn màu đầu tiên
                if (productData.variants && productData.variants.length > 0) {
                    setSelectedColor(productData.variants[0].color);
                }

                // Gọi AI để lấy sản phẩm liên quan
                fetchRelatedProducts(productData);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết sản phẩm:", error);
                setAlertMessage({ text: "Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.", type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProductDetail();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchRelatedProducts = async (currentProduct: any) => {
        setIsRelatedLoading(true);
        try {
            const allProducts = await getAllProducts();
            const availableProducts = allProducts.filter((p: any) => p._id !== currentProduct._id);

            if (availableProducts.length === 0) return;

            const recommendedIds = await getRelatedProductsFromAI(currentProduct, availableProducts);

            const related = availableProducts
                .filter((p: any) => recommendedIds.includes(p._id))
                .map((p: any) => ({
                    id: p._id,
                    name: p.name,
                    price: p.price,
                    imageUrl: p.variants?.[0]?.image || 'https://via.placeholder.com/300?text=No+Image',
                    rating: p.rating || 0,
                    reviewCount: p.reviewCount || 0,
                    isOutOfStock: (p.variants?.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) || 0) <= 0
                }));

            setRelatedProducts(related);
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm liên quan từ AI:", error);
        } finally {
            setIsRelatedLoading(false);
        }
    };

    // Tự động chuyển đổi hình ảnh sau mỗi 4 giây (Slide show)
    useEffect(() => {
        if (images.length <= 1) return;
        const intervalId = setInterval(() => {
            setActiveImage(prev => {
                const currentIndex = images.indexOf(prev);
                const nextIndex = (currentIndex + 1) % images.length;
                return images[nextIndex];
            });
        }, 4000);
        return () => clearInterval(intervalId);
    }, [activeImage, images]); // Khởi động lại đếm giờ nếu người dùng tự tay click chọn ảnh

    // Hàm format tiền Việt Nam
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Hàm render số sao đánh giá
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(<span key={i} className={i < rating ? "star active" : "star"}>★</span>);
        }
        return stars;
    };

    // --- LOGIC PHẦN REVIEW ---
    const isLoggedIn = !!localStorage.getItem("token");
    const userId = getUserId(); // Sử dụng hàm getUserId để lấy ID người dùng từ token

    // Kiểm tra xem người dùng hiện tại đã từng đánh giá CÓ SAO cho sản phẩm này chưa
    const hasRated = reviews.some(review => review.user && String(review.user._id) === String(userId) && review.rating > 0);
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

    // Hàm xử lý gửi nhận xét mới
    const handleReviewSubmit = async () => {
        if (!id || !reviewText.trim() || isSubmittingReview) return;

        setIsSubmittingReview(true);
        try {
            const payload = {
                productId: id,
                comment: reviewText,
                // Nếu đã từng đánh giá sao rồi, các lần bình luận sau không gửi rating nữa
                rating: hasRated ? null : reviewRating,
            };
            const response = await createReview(payload);

            // Cập nhật UI ngay lập tức với review mới
            setReviews([response.review, ...reviews]);

            // Cập nhật lại state của sản phẩm với rating mới nếu có
            if (payload.rating) {
                const updatedProduct = await getProductById(id);
                setProduct(updatedProduct);
            }

            setReviewText("");
            setReviewRating(5);
            setAlertMessage({ text: response.message, type: 'success' });

        } catch (error: any) {
            console.error("Lỗi khi gửi nhận xét:", error);
            setAlertMessage({ text: error.message || "Gửi nhận xét thất bại.", type: 'error' });
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const totalReviews = Number(product?.reviewCount) || 0;
    const ratingBreakdown = product?.ratingBreakdown || { star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 };
    // --- KẾT THÚC LOGIC PHẦN REVIEW ---

    // Xác định phiên bản đang chọn và số lượng tồn kho tương ứng
    const selectedVariant = product?.variants?.find((v: any) => v.color === selectedColor);
    const availableStock = selectedVariant ? selectedVariant.quantity : 0;

    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            setAlertMessage({ text: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", type: 'warning' });
            return;
        }

        if (quantity > availableStock) {
            setAlertMessage({ text: `Số lượng chọn vượt quá số lượng tồn kho hiện tại (${availableStock} sản phẩm).`, type: 'error' });
            return;
        }

        try {
            await addToCart({
                productId: product._id,
                color: selectedColor,
                quantity: quantity
            });
            setAlertMessage({ text: `Đã thêm ${quantity} sản phẩm [${product.name}] phiên bản ${selectedColor} vào giỏ hàng!`, type: 'success' });

            // Báo cho Header biết giỏ hàng vừa thay đổi để cập nhật lại số lượng
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error: any) {
            setAlertMessage({ text: error.message || "Lỗi khi thêm vào giỏ hàng", type: 'error' });
        }
    };

    const handleBuyNow = () => {
        if (!isLoggedIn) {
            setAlertMessage({ text: "Vui lòng đăng nhập để tiến hành thanh toán!", type: 'warning' });
            return;
        }
        if (quantity > availableStock) {
            setAlertMessage({ text: `Số lượng chọn vượt quá số lượng tồn kho hiện tại (${availableStock} sản phẩm).`, type: 'error' });
            return;
        }

        const buyNowItem = {
            compositeId: `${product._id}_${selectedColor}`,
            productId: product._id,
            color: selectedColor,
            name: `${product.name} - ${selectedColor}`,
            price: product.price,
            imageUrl: activeImage,
            quantity: quantity
        };
        navigate("/checkout", { state: { selectedItems: [buyNowItem] } });
    };

    const getAlertTitle = (): "THÔNG BÁO" | "CẢNH BÁO" | "LỖI" => {
        if (alertMessage?.type === 'warning') return "CẢNH BÁO";
        if (alertMessage?.type === 'error') return "LỖI";
        return "THÔNG BÁO";
    };

    if (isLoading) {
        return <div className="product-detail-container" style={{ textAlign: 'center', padding: '50px' }}><h3>Đang tải thông tin sản phẩm...</h3></div>;
    }

    if (!product) {
        return <div className="product-detail-container" style={{ textAlign: 'center', padding: '50px' }}><h3>Không tìm thấy sản phẩm.</h3><Button variant="primary" width="150px" height="40px" onClick={() => navigate('/')}>Về trang chủ</Button></div>;
    }

    // Chuyển đổi specifications object thành mảng để hiển thị
    const specsArray = product.specifications ? Object.entries(product.specifications).map(([label, value]) => ({ label, value: String(value) })) : [];

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
                            {product.variants?.map((variant: any, index: number) => (
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