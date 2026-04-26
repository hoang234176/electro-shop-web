import Banner from "../../component/ui/Banner";
import ProductCard from "../../component/ui/ProductCard";
import { Link } from "react-router-dom";
import "./Home.css"; 
import Loading from "../../component/ui/Loading";
import { FiFolder, FiPackage } from 'react-icons/fi';
import { MdFiberNew } from 'react-icons/md' 
import { useHome, type Product } from "../../hooks/features/home/useHome";

function Home() {
    const { isNavigating, newProducts, allProducts, isLoading, error, categories, handleProductClick } = useHome();

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
                <h2 className="section-title">
                    <FiFolder className="folder-icon" color="#f59e0b" size={28} />
                    <span>Khám Phá Danh Mục</span>
                </h2>
                <div className="category-list">
                    {categories.map((cat) => {
                        const Icon = cat.Icon;
                        return (
                            <Link
                                to={`/category?name=${encodeURIComponent(cat.name)}`}
                                key={cat.id}
                                className="category-item"
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="category-icon"><Icon /></div>
                                <span className="category-name">{cat.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* --- 3. SẢN PHẨM MỚI RA MẮT --- */}
            <section className="home-section">
                <h2 className="section-title">
                    <MdFiberNew size={32} color="red" />
                    <span>Sản phẩm mới ra mắt</span>
                </h2>
                {/* Hiển thị tối đa 4 sản phẩm */}
                {renderProductGrid("new", newProducts.slice(0, 4))}
            </section>

            {/* --- 4. TẤT CẢ SẢN PHẨM --- */}
            <section className="home-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="section-title" style={{ marginBottom: 0 }}>
                        <FiPackage className="package-icon" color="#3b82f6" size={28} />
                        <span>Tất cả sản phẩm</span>
                    </h2>
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