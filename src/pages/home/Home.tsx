import Banner from "../../component/ui/Banner";
import ProductCard from "../../component/ui/ProductCard";
import { Link } from "react-router-dom";
import "./Home.css"; 

function Home() {
    // 1. DỮ LIỆU MẪU: Danh mục nổi bật
    const categories = [
        { id: 1, name: "Điện thoại", icon: "📱" },
        { id: 2, name: "Laptop", icon: "💻" },
        { id: 3, name: "Tai nghe", icon: "🎧" },
        { id: 4, name: "Đồng hồ", icon: "⌚" },
        { id: 5, name: "Phụ kiện", icon: "🔌" },
        { id: 6, name: "Màn hình", icon: "🖥️" }
    ];

    // 2. DỮ LIỆU MẪU: Sản phẩm
    const products = [
        { id: 1, name: "iPhone 15 Pro Max 256GB", price: 29990000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/iphone15_1.jpg", rating: 5 },
        { id: 2, name: "MacBook Pro M3 14-inch", price: 39990000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/macbook_pro.jpg", rating: 5 },
        { id: 3, name: "Tai nghe Sony WH-1000XM5", price: 7490000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/sony_headphone.jpg", rating: 4 },
        { id: 4, name: "Apple Watch Series 9", price: 10490000, imageUrl: "https://res.cloudinary.com/dygh4jakc/image/upload/v123456/ElectroShop/Products/apple_watch.jpg", rating: 5 }
    ];

    return (
        <div className="home-container">
            {/* --- 1. BANNER TRƯỢT NGANG --- */}
            <Banner />

            {/* --- 2. DANH MỤC NỔI BẬT --- */}
            <section className="home-section">
                <h2 className="section-title">📂 Khám Phá Danh Mục</h2>
                <div className="category-list">
                    {categories.map((cat) => (
                        <Link to={`/category?name=${encodeURIComponent(cat.name)}`} key={cat.id} className="category-item" style={{ textDecoration: 'none' }}>
                            <div className="category-icon">{cat.icon}</div>
                            <span className="category-name">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* --- 3. BÁN CHẠY NHẤT --- */}
            <section className="home-section">
                <h2 className="section-title">🔥 Bán Chạy Nhất</h2>
                <div className="product-grid">
                    {products.map((product) => (
                        <ProductCard 
                            key={`hot-${product.id}`}
                            name={product.name}
                            price={product.price}
                            imageUrl={product.imageUrl}
                            rating={product.rating}
                        />
                    ))}
                </div>
            </section>

            {/* --- 3. BÁN CHẠY NHẤT --- */}
            <section className="home-section">
                <h2 className="section-title">🆕 Sản phẩm mới ra mắt</h2>
                <div className="product-grid">
                    {products.map((product) => (
                        <ProductCard 
                            key={`hot-${product.id}`}
                            name={product.name}
                            price={product.price}
                            imageUrl={product.imageUrl}
                            rating={product.rating}
                        />
                    ))}
                </div>
            </section>

            {/* --- 4. GỢI Ý ĐI KÈM CỦA AI (Dành cho tính năng nâng cao sau này) --- */}
            <section className="home-section">
                <h2 className="section-title">🤖 Gợi Ý Dành Riêng Cho Bạn</h2>
                <div className="product-grid">
                    {/* Tạm thời map lại mảng products để xem giao diện */}
                    {products.map((product) => (
                        <ProductCard 
                            key={`suggest-${product.id}`}
                            name={product.name}
                            price={product.price}
                            imageUrl={product.imageUrl}
                            rating={product.rating}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home;