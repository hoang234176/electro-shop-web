import { useRef, useEffect } from 'react';
import './Banner.css'; 

function BannerList() {
    // Sợi dây kết nối tới thẻ div cuộn
    const carouselRef = useRef<HTMLDivElement>(null);

    // Mảng dữ liệu 5 banner của chúng ta
    const banners = [
        { id: 1, title: "Siêu Sale Mùa Hè", desc: "Giảm giá lên đến 50% cho tất cả thiết bị làm mát.", bgColor: "#FFD700", slantColor: "#00A3FF", textColor: "#111827", btnTextColor: "#00A3FF" },
        { id: 2, title: "Laptop Gaming Mới", desc: "Sức mạnh vượt trội, chiến mọi tựa game AAA. Tặng kèm chuột xịn.", bgColor: "#1F2937", slantColor: "#10B981", textColor: "#FFFFFF", btnTextColor: "#10B981" },
        { id: 3, title: "Đại Tiệc Âm Thanh", desc: "Tai nghe Bluetooth, loa Sony giảm sâu chưa từng có.", bgColor: "#4C1D95", slantColor: "#F97316", textColor: "#FFFFFF", btnTextColor: "#F97316" },
        { id: 4, title: "Hệ Sinh Thái Apple", desc: "Mua iPhone tặng kèm sạc nhanh 20W chính hãng.", bgColor: "#F3F4F6", slantColor: "#DC2626", textColor: "#111827", btnTextColor: "#DC2626" },
        { id: 5, title: "Đồng Hồ Thông Minh", desc: "Theo dõi sức khỏe 24/7. Trả góp 0% qua thẻ tín dụng.", bgColor: "#0284C7", slantColor: "#FBBF24", textColor: "#FFFFFF", btnTextColor: "#0284C7" }
    ];

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

    // Auto-play: Cứ 5 giây (5000ms) sẽ tự động gọi hàm scroll sang phải 1 lần
    useEffect(() => {
        const intervalId = setInterval(() => {
            scroll('right');
        }, 5000);

        // Dọn dẹp bộ đếm khi tắt component để tránh rò rỉ bộ nhớ
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{ padding: '40px 20px', backgroundColor: '#f9f9f9' }}>
            <div className="banner-wrapper">
                
                {/* Nút Trái */}
                <button className="scroll-btn left" onClick={() => scroll('left')}>
                    ❮
                </button>

                {/* Khung cuộn ngang */}
                <div className="banner-carousel" ref={carouselRef}>
                    {banners.map((banner) => (
                        <div key={banner.id} className="promo-banner" style={{ backgroundColor: banner.bgColor, color: banner.textColor }}>
                            
                            <div className="banner-content">
                                <h2>{banner.title}</h2>
                                <p>{banner.desc}</p>
                                <button className="banner-btn" style={{ color: banner.btnTextColor }}>
                                    Mua ngay
                                </button>
                            </div>

                            <div className="slanted-overlay" style={{ backgroundColor: banner.slantColor }}></div>
                            
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