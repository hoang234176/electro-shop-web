import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, getAllProducts } from "../../../services/product.service";
import { getReviewsByProduct, createReview } from "../../../services/review.service";
import { getUserId } from "../../../utils/token.util";
import { addToCart } from "../../../services/cart.service";
import { getRelatedProductsFromAI } from "../../../services/ai.service";

export interface ApiProductVariant {
    color: string;
    image?: string;
    quantity?: number;
}

export interface ApiProduct {
    _id: string;
    name: string;
    price: number;
    description?: string;
    variants?: ApiProductVariant[];
    specifications?: Record<string, string | number>;
    rating?: number;
    reviewCount?: number;
    ratingBreakdown?: { star1: number; star2: number; star3: number; star4: number; star5: number };
}

export interface ReviewUser {
    _id: string;
    fullname?: string;
}

export interface Review {
    _id?: string;
    user?: ReviewUser;
    rating: number;
    comment?: string;
    createdAt: string | Date;
}

export interface RelatedProduct {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    isOutOfStock: boolean;
}

export const useProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);

    const [product, setProduct] = useState<ApiProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [images, setImages] = useState<string[]>([]);
    const [activeImage, setActiveImage] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
    const [isRelatedLoading, setIsRelatedLoading] = useState(false);

    const isLoggedIn = !!localStorage.getItem("token");
    const userId = getUserId();

    useEffect(() => {
        const fetchProductDetail = async () => {
            if (!id) return;
            setIsLoading(true); setReviews([]);
            try {
                const [productData, reviewsData] = await Promise.all([getProductById(id), getReviewsByProduct(id)]);
                setProduct(productData); setReviews(reviewsData);
                const uniqueVariantImages = Array.from(new Set(productData.variants?.map((v: ApiProductVariant) => v.image).filter(Boolean))) as string[];
                const productImages = uniqueVariantImages.length > 0 ? uniqueVariantImages : ["https://via.placeholder.com/500?text=No+Image"];
                setImages(productImages); setActiveImage(productImages[0]);
                if (productData.variants && productData.variants.length > 0) setSelectedColor(productData.variants[0].color);
                fetchRelatedProducts(productData);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết sản phẩm:", error);
                setAlertMessage({ text: "Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.", type: 'error' });
            } finally { setIsLoading(false); }
        };
        fetchProductDetail();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchRelatedProducts = async (currentProduct: ApiProduct) => {
        setIsRelatedLoading(true);
        try {
            const allProducts = await getAllProducts();
            const availableProducts = allProducts.filter((p: ApiProduct) => p._id !== currentProduct._id);
            if (availableProducts.length === 0) return;
            const recommendedIds = await getRelatedProductsFromAI(currentProduct, availableProducts);
            const related = availableProducts.filter((p: ApiProduct) => recommendedIds.includes(p._id)).map((p: ApiProduct) => ({
                id: p._id, name: p.name, price: p.price, imageUrl: p.variants?.[0]?.image || 'https://via.placeholder.com/300?text=No+Image',
                rating: p.rating || 0, reviewCount: p.reviewCount || 0, isOutOfStock: (p.variants?.reduce((sum: number, v: ApiProductVariant) => sum + (v.quantity || 0), 0) || 0) <= 0
            }));
            setRelatedProducts(related);
        } catch (error) { console.error("Lỗi khi lấy sản phẩm liên quan từ AI:", error); } finally { setIsRelatedLoading(false); }
    };

    useEffect(() => {
        if (images.length <= 1) return;
        const intervalId = setInterval(() => { setActiveImage(prev => { const nextIndex = (images.indexOf(prev) + 1) % images.length; return images[nextIndex]; }); }, 4000);
        return () => clearInterval(intervalId);
    }, [activeImage, images]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const hasRated = reviews.some(review => review.user && String(review.user._id) === String(userId) && review.rating > 0);

    const handleReviewSubmit = async () => {
        if (!id || !reviewText.trim() || isSubmittingReview) return;
        setIsSubmittingReview(true);
        try {
            const payload = { productId: id, comment: reviewText, rating: hasRated ? null : reviewRating };
            const response = await createReview(payload);
            setReviews([response.review, ...reviews]);
            if (payload.rating) { const updatedProduct = await getProductById(id); setProduct(updatedProduct); }
            setReviewText(""); setReviewRating(5); setAlertMessage({ text: response.message, type: 'success' });
        } catch (error: unknown) {
            setAlertMessage({ text: (error as Error).message || "Gửi nhận xét thất bại.", type: 'error' });
        } finally { setIsSubmittingReview(false); }
    };

    const totalReviews = Number(product?.reviewCount) || 0;
    const ratingBreakdown = product?.ratingBreakdown || { star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 };
    const selectedVariant = product?.variants?.find((v: ApiProductVariant) => v.color === selectedColor);
    const availableStock = selectedVariant?.quantity || 0;
    const specsArray = product?.specifications ? Object.entries(product.specifications).map(([label, value]) => ({ label, value: String(value) })) : [];

    const handleAddToCart = async () => {
        if (!product) return;
        if (!isLoggedIn) return setAlertMessage({ text: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", type: 'warning' });
        if (quantity > availableStock) return setAlertMessage({ text: `Số lượng chọn vượt quá số lượng tồn kho hiện tại (${availableStock} sản phẩm).`, type: 'error' });
        try {
            await addToCart({ productId: product._id, color: selectedColor, quantity });
            setAlertMessage({ text: `Đã thêm ${quantity} sản phẩm [${product.name}] phiên bản ${selectedColor} vào giỏ hàng!`, type: 'success' });
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error: unknown) { setAlertMessage({ text: (error as Error).message || "Lỗi khi thêm vào giỏ hàng", type: 'error' }); }
    };

    const handleBuyNow = () => {
        if (!product) return;
        if (!isLoggedIn) return setAlertMessage({ text: "Vui lòng đăng nhập để tiến hành thanh toán!", type: 'warning' });
        if (quantity > availableStock) return setAlertMessage({ text: `Số lượng chọn vượt quá số lượng tồn kho hiện tại (${availableStock} sản phẩm).`, type: 'error' });
        const buyNowItem = { compositeId: `${product._id}_${selectedColor}`, productId: product._id, color: selectedColor, name: `${product.name} - ${selectedColor}`, price: product.price, imageUrl: activeImage, quantity };
        navigate("/checkout", { state: { selectedItems: [buyNowItem] } });
    };

    const getAlertTitle = (): "THÔNG BÁO" | "CẢNH BÁO" | "LỖI" => alertMessage?.type === 'warning' ? "CẢNH BÁO" : alertMessage?.type === 'error' ? "LỖI" : "THÔNG BÁO";

    return {
        navigate, product, isLoading, images, activeImage, setActiveImage, selectedColor, setSelectedColor, quantity, setQuantity,
        reviews, reviewText, setReviewText, reviewRating, setReviewRating, hoverRating, setHoverRating, isSubmittingReview, alertMessage, setAlertMessage, relatedProducts, isRelatedLoading, isLoggedIn, formatCurrency, hasRated, handleReviewSubmit, totalReviews, ratingBreakdown, availableStock, specsArray, handleAddToCart, handleBuyNow, getAlertTitle
    };
};