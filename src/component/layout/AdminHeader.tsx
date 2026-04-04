import { Link } from "react-router-dom";
import "./AdminHeader.css";

function AdminHeader() {
    const avatar = localStorage.getItem("avatar") || "";

    return (
        <header className="admin-header">
            <div className="admin-header-left">
                <h2 className="admin-page-title">Trang Quản Trị Hệ Thống</h2>
            </div>
            <div className="admin-header-right">
                <div className="admin-profile">
                    <img src={avatar} alt="Admin Avatar" className="admin-avatar" />
                    <span className="admin-name">Quản trị viên</span>
                    <Link to="/" className="admin-store-link" title="Xem cửa hàng khách">🌐 Cửa hàng</Link>
                </div>
            </div>
        </header>
    );
}

export default AdminHeader;