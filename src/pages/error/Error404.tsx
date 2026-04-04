import { Link } from "react-router-dom";
import Button from "../../component/ui/Button";
import "./ErrorPage.css";

function Error404() {
    return (
        <div className="error-page-container">
            <h1 className="error-code">404</h1>
            <h2 className="error-title">Không tìm thấy trang</h2>
            <p className="error-description">
                Xin lỗi, trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc bạn đã nhập sai đường dẫn.
            </p>
            <div className="error-actions">
                <Link to="/">
                    <Button variant="primary" width="200px" height="48px">Trở về trang chủ</Button>
                </Link>
            </div>
        </div>
    );
}

export default Error404;