import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../../component/ui/ProductCard";
import "./Category.css";

// Dữ liệu mẫu (sau này sẽ lấy từ API)
const allProducts = [
    { id: 1, category: "Điện thoại", name: "iPhone 15 Pro Max 256GB", price: 29990000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/iphone15_1.jpg", rating: 5 },
    { id: 2, category: "Laptop", name: "MacBook Pro M3 14-inch", price: 39990000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/macbook_pro.jpg", rating: 5 },
    { id: 3, category: "Tai nghe", name: "Tai nghe Sony WH-1000XM5", price: 7490000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/sony_headphone.jpg", rating: 4 },
    { id: 4, category: "Đồng hồ", name: "Apple Watch Series 9", price: 10490000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/apple_watch.jpg", rating: 5 },
    { id: 5, category: "Điện thoại", name: "Samsung Galaxy S24 Ultra", price: 33990000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/s24_ultra.jpg", rating: 5 },
    { id: 6, category: "Laptop", name: "Dell XPS 15 (2023)", price: 45000000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/dell_xps.jpg", rating: 4 },
    { id: 7, category: "Phụ kiện", name: "Sạc nhanh Anker 65W", price: 850000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/anker_charger.jpg", rating: 5 },
    { id: 8, category: "Màn hình", name: "LG UltraGear 27 inch", price: 8990000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/lg_monitor.jpg", rating: 4 },
    { id: 9, category: "Điện thoại", name: "Google Pixel 8 Pro", price: 24990000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/pixel8.jpg", rating: 4 },
    { id: 10, category: "Tai nghe", name: "AirPods Pro 2", price: 5990000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/airpods_pro.jpg", rating: 5 },
];

const categories = ["Điện thoại", "Laptop", "Tai nghe", "Đồng hồ", "Phụ kiện", "Màn hình"];

// Hook helper lấy query param
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function Category() {
    const query = useQuery();
    const categoryFromUrl = query.get("name");

    const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
        categoryFromUrl ? [categoryFromUrl] : []
    );
    const [priceRange, setPriceRange] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("default");

    // Tính danh sách sản phẩm đã filter + sort
    const filteredProducts = useMemo(() => {
        let products = [...allProducts];

        // 1. Filter category
        if (selectedCategories.length > 0) {
            products = products.filter((p) => selectedCategories.includes(p.category));
        }

        // 2. Filter price
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

        // 3. Sort
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
    }, [selectedCategories, priceRange, sortBy]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    return (
        <div className="category-page-container">
            <aside className="filter-sidebar">
                <div className="filter-group">
                    <h3 className="filter-title">Danh Mục Sản Phẩm</h3>
                    {categories.map((cat) => (
                        <div key={cat} className="filter-option">
                            <input
                                type="checkbox"
                                id={`cat-${cat}`}
                                checked={selectedCategories.includes(cat)}
                                onChange={() => handleCategoryChange(cat)}
                            />
                            <label htmlFor={`cat-${cat}`}>{cat}</label>
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
                    <h1 className="page-title">Tất cả sản phẩm</h1>

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

export default Category;