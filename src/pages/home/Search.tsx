import { useState, useEffect, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import ProductCard from "../../component/ui/ProductCard";
import { getAllProducts } from "../../services/product.service";
import Loading from "../../component/ui/Loading";
import "./Search.css";

// Hook lấy query parameter từ URL
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function Search() {
    const query = useQuery();
    const navigate = useNavigate();
    const [isNavigating, setIsNavigating] = useState(false);
    const searchQuery = query.get("q") || ""; // Lấy giá trị của tham số "q" (VD: ?q=iphone)

    const [priceRange, setPriceRange] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("default");

    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const data = await getAllProducts();
                const formattedData = data.map((p: any) => ({
                    id: p._id,
                    brand: p.brand?.name || 'Unknown',
                    category: p.category?.name || 'Unknown',
                    name: p.name,
                    price: p.price,
                    imageUrl: p.variants?.[0]?.image || 'https://via.placeholder.com/300?text=No+Image',
                    rating: p.rating || 0,
                    reviewCount: p.reviewCount || 0,
                    isOutOfStock: (p.variants?.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) || 0) <= 0
                }));
                setAllProducts(formattedData);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Tính toán kết quả hiển thị dựa trên search query và các bộ lọc
    const filteredProducts = useMemo(() => {
        let products = [...allProducts];

        // 1. Lọc theo từ khóa tìm kiếm (so sánh không phân biệt hoa thường với Tên, Hãng và Danh mục)
        if (searchQuery.trim() !== "") {
            const lowerQuery = searchQuery.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(lowerQuery) || 
                p.brand.toLowerCase().includes(lowerQuery) ||
                p.category.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Lọc theo khoảng giá
        products = products.filter((p) => {
            switch (priceRange) {
                case "under-10m":
                    return p.price < 10000000;
                case "10m-20m":
                    return p.price >= 10000000 && p.price <= 20000000;
                case "over-20m":
                    return p.price > 20000000;
                default:
                    return true;
            }
        });

        // 3. Sắp xếp
        return [...products].sort((a, b) => {
            switch (sortBy) {
                case "price-asc":
                    return a.price - b.price;
                case "price-desc":
                    return b.price - a.price;
                default:
                    return a.id - b.id;
            }
        });
    }, [allProducts, searchQuery, priceRange, sortBy]);

    const handleProductClick = (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        setIsNavigating(true);
        setTimeout(() => {
            setIsNavigating(false);
            navigate(`/product/${productId}`);
        }, 800);
    };

    return (
        <div className="search-page-container">
            {isNavigating && <Loading fullScreen={true} />}
            {/* Sidebar Bộ lọc */}
            <aside className="filter-sidebar">
                <div className="filter-group">
                    <h3 className="filter-title">Khoảng Giá</h3>

                    <div className="filter-option">
                        <input
                            type="radio"
                            id="price-all"
                            name="price"
                            value="all"
                            checked={priceRange === "all"}
                            onChange={(e) => setPriceRange(e.target.value)}
                        />
                        <label htmlFor="price-all">Tất cả mức giá</label>
                    </div>

                    <div className="filter-option">
                        <input
                            type="radio"
                            id="price-under-10m"
                            name="price"
                            value="under-10m"
                            checked={priceRange === "under-10m"}
                            onChange={(e) => setPriceRange(e.target.value)}
                        />
                        <label htmlFor="price-under-10m">Dưới 10 triệu</label>
                    </div>

                    <div className="filter-option">
                        <input
                            type="radio"
                            id="price-10m-20m"
                            name="price"
                            value="10m-20m"
                            checked={priceRange === "10m-20m"}
                            onChange={(e) => setPriceRange(e.target.value)}
                        />
                        <label htmlFor="price-10m-20m">Từ 10 - 20 triệu</label>
                    </div>

                    <div className="filter-option">
                        <input
                            type="radio"
                            id="price-over-20m"
                            name="price"
                            value="over-20m"
                            checked={priceRange === "over-20m"}
                            onChange={(e) => setPriceRange(e.target.value)}
                        />
                        <label htmlFor="price-over-20m">Trên 20 triệu</label>
                    </div>
                </div>
            </aside>

            {/* Vùng hiển thị kết quả chính */}
            <main className="product-list-main">
                <div className="list-header">
                    <h1 className="page-title">
                        {searchQuery 
                            ? <>Kết quả tìm kiếm cho: <span className="keyword-highlight">"{searchQuery}"</span></>
                            : "Tất cả sản phẩm"
                        }
                    </h1>

                    <div className="sort-container">
                        <label htmlFor="sort-by">Sắp xếp: </label>
                        <select
                            id="sort-by"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="default">Mặc định</option>
                            <option value="price-asc">Giá: Tăng dần</option>
                            <option value="price-desc">Giá: Giảm dần</option>
                        </select>
                    </div>
                </div>

                <div className="product-grid">
                    {isLoading ? (
                        <p>Đang tải dữ liệu...</p>
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <Link to={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }} onClick={(e) => handleProductClick(e, product.id)}>
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
                        ))
                    ) : (
                        <div className="no-products-found">
                            <p>Rất tiếc, không tìm thấy sản phẩm nào phù hợp với từ khóa <strong>"{searchQuery}"</strong>.</p>
                            <p>Vui lòng thử lại bằng từ khóa khác hoặc điều chỉnh bộ lọc giá.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Search;