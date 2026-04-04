import { Link } from "react-router-dom";
import Button from "../../component/ui/Button";
import "./ErrorPage.css";

function Error500() {
    return (
        <div className="error-page-container">
            <h1 className="error-code">500</h1>
            <h2 className="error-title">Lỗi hệ thống máy chủ</h2>
            <p className="error-description">
                Rất tiếc, đã xảy ra lỗi từ phía hệ thống của chúng tôi. Kỹ thuật viên đang nỗ lực khắc phục sự cố này. Vui lòng thử lại sau nhé!
            </p>
            <div className="error-actions">
                <Link to="/">
                    <Button variant="primary" width="200px" height="48px">Trở về trang chủ</Button>
                </Link>
            </div>
        </div>
    );
}

export default Error500;