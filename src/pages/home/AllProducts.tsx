import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "../../component/ui/ProductCard";
import { getAllProducts } from "../../services/product.service";
import Loading from "../../component/ui/Loading";
import "./Category.css"; // Tận dụng CSS của trang Category để dùng chung layout

const categories = ["Điện thoại", "Laptop", "Tai nghe", "Đồng hồ", "Phụ kiện", "Màn hình"];
const brands = ["Apple", "Samsung", "Sony", "Dell", "LG", "Google"];

function AllProducts() {
    const navigate = useNavigate();
    const [isNavigating, setIsNavigating] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
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

    const filteredProducts = useMemo(() => {
        let products = [...allProducts];

        if (selectedCategories.length > 0) {
            products = products.filter((p) => selectedCategories.includes(p.category));
        }

        if (selectedBrands.length > 0) {
            products = products.filter((p) => selectedBrands.includes(p.brand));
        }

        products = products.filter((p) => {
            switch (priceRange) {
                case "under-10m": return p.price < 10000000;
                case "10m-20m": return p.price >= 10000000 && p.price <= 20000000;
                case "over-20m": return p.price > 20000000;
                default: return true;
            }
        });

        return [...products].sort((a, b) => {
            switch (sortBy) {
                case "price-asc": return a.price - b.price;
                case "price-desc": return b.price - a.price;
                default: return a.id - b.id;
            }
        });
    }, [allProducts, selectedCategories, selectedBrands, priceRange, sortBy]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategories((prev) => prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]);
    };

    const handleBrandChange = (brand: string) => {
        setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
    };

    const handleProductClick = (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        setIsNavigating(true);
        setTimeout(() => {
            setIsNavigating(false);
            navigate(`/product/${productId}`);
        }, 800);
    };

    return (
        <div className="category-page-container">
            {isNavigating && <Loading fullScreen={true} />}
            <aside className="filter-sidebar">
                <div className="filter-group">
                    <h3 className="filter-title">Danh Mục</h3>
                    {categories.map((cat) => (
                        <div key={cat} className="filter-option">
                            <input type="checkbox" id={`cat-${cat}`} checked={selectedCategories.includes(cat)} onChange={() => handleCategoryChange(cat)} />
                            <label htmlFor={`cat-${cat}`}>{cat}</label>
                        </div>
                    ))}
                </div>

                <div className="filter-group">
                    <h3 className="filter-title">Thương Hiệu</h3>
                    {brands.map((brandName) => (
                        <div key={brandName} className="filter-option">
                            <input type="checkbox" id={`brand-${brandName}`} checked={selectedBrands.includes(brandName)} onChange={() => handleBrandChange(brandName)} />
                            <label htmlFor={`brand-${brandName}`}>{brandName}</label>
                        </div>
                    ))}
                </div>

                <div className="filter-group">
                    <h3 className="filter-title">Khoảng Giá</h3>
                    <div className="filter-option">
                        <input type="radio" id="price-all" name="price" value="all" checked={priceRange === "all"} onChange={(e) => setPriceRange(e.target.value)} />
                        <label htmlFor="price-all">Tất cả</label>
                    </div>
                    <div className="filter-option">
                        <input type="radio" id="price-under-10m" name="price" value="under-10m" checked={priceRange === "under-10m"} onChange={(e) => setPriceRange(e.target.value)} />
                        <label htmlFor="price-under-10m">Dưới 10 triệu</label>
                    </div>
                    <div className="filter-option">
                        <input type="radio" id="price-10m-20m" name="price" value="10m-20m" checked={priceRange === "10m-20m"} onChange={(e) => setPriceRange(e.target.value)} />
                        <label htmlFor="price-10m-20m">Từ 10 - 20 triệu</label>
                    </div>
                    <div className="filter-option">
                        <input type="radio" id="price-over-20m" name="price" value="over-20m" checked={priceRange === "over-20m"} onChange={(e) => setPriceRange(e.target.value)} />
                        <label htmlFor="price-over-20m">Trên 20 triệu</label>
                    </div>
                </div>
            </aside>

            <main className="product-list-main">
                <div className="list-header">
                    <h1 className="page-title">Tất cả sản phẩm</h1>
                    <div className="sort-container">
                        <label htmlFor="sort-by">Sắp xếp theo: </label>
                        <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
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
                        <Link to={`/product/${product.id}`} key={`product-${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={(e) => handleProductClick(e, product.id)}>
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
                        <p className="no-products-found">Không tìm thấy sản phẩm phù hợp.</p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AllProducts;