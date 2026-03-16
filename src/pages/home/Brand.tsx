import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../../component/ui/ProductCard";
import "./Brand.css";

// Dữ liệu mẫu (Đã bổ sung thuộc tính brand)
const allProducts = [
    { id: 1, brand: "Apple", category: "Điện thoại", name: "iPhone 15 Pro Max 256GB", price: 29990000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/iphone15_1.jpg", rating: 5 },
    { id: 2, brand: "Apple", category: "Laptop", name: "MacBook Pro M3 14-inch", price: 39990000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/macbook_pro.jpg", rating: 5 },
    { id: 3, brand: "Sony", category: "Tai nghe", name: "Tai nghe Sony WH-1000XM5", price: 7490000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/sony_headphone.jpg", rating: 4 },
    { id: 4, brand: "Apple", category: "Đồng hồ", name: "Apple Watch Series 9", price: 10490000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/apple_watch.jpg", rating: 5 },
    { id: 5, brand: "Samsung", category: "Điện thoại", name: "Samsung Galaxy S24 Ultra", price: 33990000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/s24_ultra.jpg", rating: 5 },
    { id: 6, brand: "Dell", category: "Laptop", name: "Dell XPS 15 (2023)", price: 45000000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/dell_xps.jpg", rating: 4 },
    { id: 7, brand: "Anker", category: "Phụ kiện", name: "Sạc nhanh Anker 65W", price: 850000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/anker_charger.jpg", rating: 5 },
    { id: 8, brand: "LG", category: "Màn hình", name: "LG UltraGear 27 inch", price: 8990000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/lg_monitor.jpg", rating: 4 },
    { id: 9, brand: "Google", category: "Điện thoại", name: "Google Pixel 8 Pro", price: 24990000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/pixel8.jpg", rating: 4 },
    { id: 10, brand: "Apple", category: "Tai nghe", name: "AirPods Pro 2", price: 5990000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/airpods_pro.jpg", rating: 5 },
];

const brands = ["Apple", "Samsung", "Sony", "Dell", "Anker", "LG", "Google"];

// Hook helper lấy query param (trường hợp click từ trang chủ vào /brand?name=Apple)
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function Brand() {
    const query = useQuery();
    const brandFromUrl = query.get("name");

    const [selectedBrands, setSelectedBrands] = useState<string[]>(() =>
        brandFromUrl ? [brandFromUrl] : []
    );
    const [priceRange, setPriceRange] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("default");

    // Tính danh sách sản phẩm đã filter + sort bằng useMemo để tối ưu render
    const filteredProducts = useMemo(() => {
        let products = [...allProducts];

        // 1. Filter theo thương hiệu (brand)
        if (selectedBrands.length > 0) {
            products = products.filter((p) => selectedBrands.includes(p.brand));
        }

        // 2. Filter theo khoảng giá
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

        // 3. Sort (Sắp xếp)
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
    }, [selectedBrands, priceRange, sortBy]);

    const handleBrandChange = (brand: string) => {
        setSelectedBrands((prev) =>
            prev.includes(brand)
                ? prev.filter((b) => b !== brand)
                : [...prev, brand]
        );
    };

    return (
        <div className="brand-page-container">
            <aside className="filter-sidebar">
                <div className="filter-group">
                    <h3 className="filter-title">Thương Hiệu Nổi Bật</h3>
                    {brands.map((brandName) => (
                        <div key={brandName} className="filter-option">
                            <input
                                type="checkbox"
                                id={`brand-${brandName}`}
                                checked={selectedBrands.includes(brandName)}
                                onChange={() => handleBrandChange(brandName)}
                            />
                            <label htmlFor={`brand-${brandName}`}>{brandName}</label>
                        </div>
                    ))}
                </div>

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
                        <label htmlFor="price-all">Tất cả</label>
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

            <main className="product-list-main">
                <div className="list-header">
                    <h1 className="page-title">Sản phẩm theo Thương hiệu</h1>

                    <div className="sort-container">
                        <label htmlFor="sort-by">Sắp xếp theo: </label>
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
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                name={product.name}
                                price={product.price}
                                imageUrl={product.imageUrl}
                                rating={product.rating}
                            />
                        ))
                    ) : (
                        <p className="no-products-found">
                            Không tìm thấy sản phẩm phù hợp.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Brand;