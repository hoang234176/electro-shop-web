import { Link } from "react-router-dom";
import "./Footer.css";
import logoShop from "../../assets/logo-shop.png";

function Footer() {
    return (
        <footer className="footer-group">
            <div className="footer-top">
                <div className="footer-info">
                    <Link to="/">
                        <img src={logoShop} alt="Logo" width={"160px"} />
                    </Link>
                    <p className="footer-desc">
                        Electro Shop - Hệ thống bán lẻ thiết bị công nghệ uy tín. Cam kết 100% hàng chính hãng, bảo hành trọn đời.
                    </p>
                </div>
                <div className="footer-column">
                    <h3>Về chúng tôi</h3>
                    <Link to="/about">Giới thiệu Electro Shop</Link>
                    <Link to="/careers">Tuyển dụng</Link>
                    <Link to="/contact">Liên hệ & Góp ý</Link>
                    <Link to="/store-finder">Hệ thống cửa hàng</Link>
                </div>
                <div className="footer-column">
                    <h3>Chính sách</h3>
                    <Link to="/warranty">Chính sách bảo hành</Link>
                    <Link to="/payment">Thanh toán</Link>
                    <Link to="/delivery">Giao hàng</Link>
                    <Link to="/privacy">Bảo mật thông tin</Link>
                </div>
                <div className="footer-column">
                    <h3>Tổng đài hỗ trợ</h3>
                    <div className="footer-contact">
                        <p><strong>Email:</strong> hoangtran234176@gmail.com</p>
                        <p><strong>Hotline:</strong> +84 364 234 176</p>
                        <p><strong>Địa chỉ:</strong> 8 Hà Văn Tính, Hòa Khánh Nam, Liên Chiểu, Đà Nẵng</p>
                    </div>
                    <div className="footer-social" style={{ marginTop: "15px" }}>
                        <p>Kết nối với chúng tôi:</p>
                        <div className="social-links">
                            <a href="#" target="_blank" rel="noreferrer">Facebook</a>
                            <a href="#" target="_blank" rel="noreferrer">Zalo</a>
                            <a href="#" target="_blank" rel="noreferrer">Youtube</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Electro Shop. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer;