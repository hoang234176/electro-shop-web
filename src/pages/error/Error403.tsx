import { Link } from "react-router-dom";

function Error403(){
    return (
        <div>
            <h1>Error 403</h1>
            <span>Bạn không có quyền truy cập trang này, vui lòng quay lại <Link to="/">Trang chủ</Link></span>
        </div>
    )
}

export default Error403;