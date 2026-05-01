import Banner from "../../component/ui/Banner";
import ProductCard from "../../component/ui/ProductCard";
import { Link } from "react-router-dom";
import "./Home.css";
import Loading from "../../component/ui/Loading";
import { FiFolder, FiPackage } from 'react-icons/fi';
import { MdFiberNew } from 'react-icons/md'
import { useHome } from "../../hooks/features/home/useHome";
import { type ProductCardItem } from "../../types/product.types";

function Home() {
    const { newProducts, productsSaleTop, isLoading, categories } = useHome();

    // Hàm render một lưới sản phẩm, có xử lý loading và error
    const renderProductGrid = (title: string, products: ProductCardItem[], type: "new" | "selling" | "default") => {
        if (products.length === 0) return <p>Chưa có sản phẩm nào trong mục này.</p>;

        return (
            <div className="product-grid">
                {products.map((product) => {
                    // Kiểm tra sản phẩm còn hàng hay không
                    // Tính tổng số lượng của tất cả các phiên bản
                    const totalQuantity = product.variants?.reduce((sum, variant) => sum + (variant.quantity || 0), 0) || 0;
                    const isOutOfStock = totalQuantity <= 0;

                    return (
                        <Link
                            to={`/product/${product._id}`}
                            key={`${title}-${product._id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <ProductCard
                                id={product._id}
                                name={product.name}
                                price={product.price}
                                imageUrl={product.variants?.[0]?.image || 'https://via.placeholder.com/300?text=No+Image'}
                                rating={product.rating}
                                reviewCount={product.reviewCount}
                                isOutOfStock={isOutOfStock}
                                type={type}
                            />
                        </Link>
                    );
                })}
            </div>
        );
    };

    const renderCategorySection = () => {
        return categories.map((cat) => {
            const Icon = cat.Icon;
            return (
                <Link
                    to={`/category?name=${encodeURIComponent(cat.name)}`}
                    key={cat.id}
                    className="category-item"
                >
                    <div className="category-icon"><Icon /></div>
                    <span className="category-name">{cat.name}</span>
                </Link>
            );
        })
    }

    if (isLoading) {
        return <Loading fullScreen={true} />;
    }

    return (
        <div className="home-container">
            {/* --- 1. BANNER TRƯỢT NGANG --- */}
            <Banner newProducts={newProducts} />

            {/* --- 2. DANH MỤC NỔI BẬT --- */}
            <section className="home-section">
                <h2 className="section-title">
                    <FiFolder className="folder-icon" />
                    <span>Khám Phá Danh Mục</span>
                </h2>
                <div className="category-list">
                    {renderCategorySection()}
                </div>
            </section>

            {/* --- 3. SẢN PHẨM MỚI RA MẮT --- */}
            <section className="home-section">
                <h2 className="section-title">
                    <MdFiberNew className="fiber-new-icon" size={32} color="red" />
                    <span>Sản phẩm mới ra mắt</span>
                </h2>
                {/* Hiển thị tối đa 4 sản phẩm */}
                {renderProductGrid("new", newProducts.slice(0, 4), "new")}
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
                {renderProductGrid("all", productsSaleTop.slice(0, 8), "default")}
            </section>
        </div>
    );
}

export default Home;