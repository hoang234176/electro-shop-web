import { Link } from "react-router-dom";
import Button from "../../component/ui/Button";
import "./ErrorPage.css";

function Error403() {
    return (
        <div className="error-page-container">
            <h1 className="error-code">403</h1>
            <h2 className="error-title">Truy cập bị từ chối</h2>
            <p className="error-description">
                Bạn không có quyền truy cập vào trang này. Vui lòng kiểm tra lại tài khoản đăng nhập hoặc liên hệ quản trị viên để biết thêm chi tiết.
            </p>
            <div className="error-actions">
                <Link to="/">
                    <Button variant="primary" width="200px" height="48px">Trở về trang chủ</Button>
                </Link>
            </div>
        </div>
    );
}

export default Error403;