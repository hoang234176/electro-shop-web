import { useState, useEffect } from "react";
import Banner from "../../component/ui/Banner";
import ProductCard from "../../component/ui/ProductCard";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css"; 
import { getAllProducts, getNewProducts } from "../../services/productServices";
import Loading from "../../component/ui/Loading";

// Định nghĩa cấu trúc dữ liệu Product để đảm bảo an toàn kiểu
interface Product {
    _id: string;
    name: string;
    price: number;
    variants: { image?: string; quantity?: number }[];
    rating?: number;
    reviewCount?: number;
}

function Home() {
    const navigate = useNavigate();
    const [isNavigating, setIsNavigating] = useState(false);

    // Dữ liệu cho danh mục vẫn có thể giữ lại vì nó tĩnh
    const categories = [
        { id: 1, name: "Điện thoại", icon: "📱" },
        { id: 2, name: "Laptop", icon: "💻" },
        { id: 3, name: "Tai nghe", icon: "🎧" },
        { id: 4, name: "Đồng hồ", icon: "⌚" },
        { id: 5, name: "Phụ kiện", icon: "🔌" },
        { id: 6, name: "Màn hình", icon: "🖥️" },
    ];

    // State để lưu trữ dữ liệu sản phẩm từ backend
    const [newProducts, setNewProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHomeData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Lấy dữ liệu sản phẩm mới và tất cả sản phẩm song song để tối ưu
                const [newProductsData, allProductsData] = await Promise.all([
                    getNewProducts(),
                    getAllProducts(),
                ]);

                setNewProducts(newProductsData);
                setAllProducts(allProductsData);
            } catch (err: any) {
                console.error("Lỗi khi tải dữ liệu trang chủ:", err);
                setError("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    const handleProductClick = (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        setIsNavigating(true);
        setTimeout(() => {
            setIsNavigating(false);
            navigate(`/product/${productId}`);
        }, 800);
    };

    // Hàm render một lưới sản phẩm, có xử lý loading và error
    const renderProductGrid = (title: string, products: Product[]) => {
        if (error) return <p>{error}</p>;
        if (products.length === 0) return <p>Chưa có sản phẩm nào trong mục này.</p>;

        return (
            <div className="product-grid">
                {products.map((product) => {
                    // Tính tổng số lượng của tất cả các phiên bản
                    const totalQuantity = product.variants?.reduce((sum, variant) => sum + (variant.quantity || 0), 0) || 0;
                    const isOutOfStock = totalQuantity <= 0;

                    return (
                        <Link 
                            to={`/product/${product._id}`} 
                            key={`${title}-${product._id}`} 
                            style={{ textDecoration: 'none', color: 'inherit' }}
                            onClick={(e) => handleProductClick(e, product._id)}
                            /* state={{ productData: product }} // Mở comment dòng này nếu bạn muốn truyền dữ liệu sản phẩm sang ProductDetail */
                        >
                            <ProductCard
                                id={product._id}
                                name={product.name}
                                price={product.price}
                                imageUrl={product.variants?.[0]?.image || 'https://via.placeholder.com/300?text=No+Image'}
                                rating={product.rating}
                                reviewCount={product.reviewCount}
                                isOutOfStock={isOutOfStock}
                            />
                        </Link>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="home-container">
            {/* Lớp Loading che toàn màn hình sẽ nối tiếp ngay sau khi chuyển từ trang Đăng nhập sang */}
            {isLoading && <Loading fullScreen={true} text="Đang đồng bộ dữ liệu trang chủ..." />}
            {isNavigating && <Loading fullScreen={true} />}

            {/* --- 1. BANNER TRƯỢT NGANG --- */}
            <Banner newProducts={newProducts} />

            {/* --- 2. DANH MỤC NỔI BẬT --- */}
            <section className="home-section">
                <h2 className="section-title">📂 Khám Phá Danh Mục</h2>
                <div className="category-list">
                    {categories.map((cat) => (
                        <Link
                            to={`/category?name=${encodeURIComponent(cat.name)}`}
                            key={cat.id}
                            className="category-item"
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="category-icon">{cat.icon}</div>
                            <span className="category-name">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* --- 3. SẢN PHẨM MỚI RA MẮT --- */}
            <section className="home-section">
                <h2 className="section-title">🆕 Sản phẩm mới ra mắt</h2>
                {/* Hiển thị tối đa 8 sản phẩm (2 hàng x 4 sản phẩm) */}
                {renderProductGrid("new", newProducts.slice(0, 8))}
            </section>

            {/* --- 4. TẤT CẢ SẢN PHẨM --- */}
            <section className="home-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="section-title" style={{ marginBottom: 0 }}>📦 Tất cả sản phẩm</h2>
                    <Link to="/products" style={{ textDecoration: 'none', color: '#3b82f6', fontWeight: 600 }}>
                        Xem tất cả &raquo;
                    </Link>
                </div>
                {/* Hiển thị tối đa 8 sản phẩm (2 hàng x 4 sản phẩm) */}
                {renderProductGrid("all", allProducts.slice(0, 8))}
            </section>
        </div>
    );
}

export default Home;