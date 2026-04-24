import { useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Banner.css'; 

// Định nghĩa kiểu dữ liệu cho sản phẩm
export interface Product {
    _id: string;
    name: string;
    price: number;
    variants?: { image?: string }[];
}

interface BannerProps {
    newProducts: Product[];
}

// Định nghĩa kiểu dữ liệu cho một banner
interface BannerItem {
    id: string;
    title: string;
    price: number;
    desc: string;
    imageUrl: string;
    bgColor: string;
    slantColor: string;
    textColor: string;
    btnTextColor: string;
}

// Các bộ màu có sẵn để gán luân phiên cho sản phẩm - Đưa ra ngoài component để tránh re-render
const colorThemes = [
    { bgColor: "#FFD700", slantColor: "#00A3FF", textColor: "#111827", btnTextColor: "#00A3FF" },
    { bgColor: "#1F2937", slantColor: "#10B981", textColor: "#FFFFFF", btnTextColor: "#10B981" },
    { bgColor: "#4C1D95", slantColor: "#F97316", textColor: "#FFFFFF", btnTextColor: "#F97316" },
    { bgColor: "#F3F4F6", slantColor: "#DC2626", textColor: "#111827", btnTextColor: "#DC2626" },
    { bgColor: "#0284C7", slantColor: "#FBBF24", textColor: "#FFFFFF", btnTextColor: "#0284C7" }
];

function BannerList({ newProducts }: BannerProps) {
    // Sợi dây kết nối tới thẻ div cuộn
    const carouselRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const banners: BannerItem[] = useMemo(() => {
        if (newProducts && newProducts.length > 0) {
            return newProducts.slice(0, 5).map((product: Product, index: number) => {
                const theme = colorThemes[index % colorThemes.length];
                return {
                    id: product._id,
                    title: product.name,
                    price: product.price,
                    desc: `Sản phẩm mới ra mắt. Giá chỉ từ ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}`,
                    imageUrl: product.variants?.[0]?.image || '',
                    ...theme
                };
            });
        }
        return [];
    }, [newProducts]);

    // Hàm điều khiển cuộn (Dùng chung cho cả click chuột và auto-play)
    const scroll = (direction: 'left' | 'right') => {
        if (!carouselRef.current) return;
        
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        
        if (direction === 'right') {
            // Nếu đã cuộn đến kịch kim bên phải -> Quay về banner đầu tiên
            // Trừ hao 1px để tránh sai số hiển thị của trình duyệt
            if (scrollLeft + clientWidth >= scrollWidth - 1) {
                carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                // Nếu chưa đến cuối -> Trượt sang phải 1 khung hình
                carouselRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
            }
        } else {
            // Nếu đang ở đầu tiên mà bấm sang trái -> Bay thẳng về banner cuối cùng
            if (scrollLeft <= 0) {
                carouselRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
            } else {
                // Nếu chưa đến đầu -> Trượt sang trái 1 khung hình
                carouselRef.current.scrollBy({ left: -clientWidth, behavior: 'smooth' });
            }
        }
    };

    // Xử lý sự kiện bấm nút Mua ngay trên Banner
    const handleBuyNow = (banner: BannerItem) => {
        const isLoggedIn = !!localStorage.getItem("token");
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }
        
        const buyNowItem = {
            compositeId: `${banner.id}_Mặc định`,
            productId: banner.id,
            color: "Mặc định",
            name: banner.title,
            price: banner.price,
            imageUrl: banner.imageUrl,
            quantity: 1
        };
        navigate("/checkout", { state: { selectedItems: [buyNowItem] } });
    };

    // Auto-play: Cứ 5 giây (5000ms) sẽ tự động gọi hàm scroll sang phải 1 lần
    useEffect(() => {
        const intervalId = setInterval(() => {
            scroll('right');
        }, 5000);

        // Dọn dẹp bộ đếm khi tắt component để tránh rò rỉ bộ nhớ
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{ padding: '40px 20px'}}>
            <div className="banner-wrapper">
                
                {/* Nút Trái */}
                <button className="scroll-btn left" onClick={() => scroll('left')}>
                    ❮
                </button>

                {/* Khung cuộn ngang */}
                <div className="banner-carousel" ref={carouselRef}>
                    {banners.map((banner) => (
                        <div key={banner.id} className="promo-banner" style={{ backgroundColor: banner.bgColor, color: banner.textColor, position: 'relative' }}>
                            
                            <div className="banner-content" style={{ position: 'relative', zIndex: 3, maxWidth: '60%' }}>
                                <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{banner.title}</h2>
                                <p style={{ fontSize: '1.1rem' }}>{banner.desc}</p>
                                <button 
                                    className="banner-btn" 
                                    style={{ color: banner.btnTextColor, cursor: 'pointer' }}
                                onClick={() => handleBuyNow(banner)}
                                >
                                    Mua ngay
                                </button>
                            </div>

                            {/* Thêm hình ảnh sản phẩm vào banner */}
                            {banner.imageUrl && (
                                <img 
                                    src={banner.imageUrl} 
                                    alt={banner.title} 
                                    style={{ 
                                        position: 'absolute', 
                                        right: '2%', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)', 
                                        maxHeight: '90%', 
                                        maxWidth: '45%', 
                                        objectFit: 'contain',
                                        backgroundColor: '#ffffff',
                                        padding: '15px',
                                        borderRadius: '12px',
                                        zIndex: 2,
                                        filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' 
                                    }} 
                                />
                            )}

                            <div className="slanted-overlay" style={{ backgroundColor: banner.slantColor, zIndex: 1 }}></div>
                            
                        </div>
                    ))}
                </div>

                {/* Nút Phải */}
                <button className="scroll-btn right" onClick={() => scroll('right')}>
                    ❯
                </button>

            </div>
        </div>
    );
}

export default BannerList;