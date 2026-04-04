import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import UserSidebar from "../../component/layout/UserSidebar";
import Alert from "../../component/ui/Alert";
import "./EditUser.css";
import { updateInfoUser, type InfoErrorRes } from "../../services/userServices";
import { updateUserCache } from "../../hooks/useUserData";

function EditUser() {
    const navigate = useNavigate();
    const location = useLocation();

    const userInfo = location.state?.userData || {};

    const [fullname, setfullname] = useState(userInfo.fullname || "");
    const [email, setEmail] = useState(userInfo.email || "");
    const [phone, setPhone] = useState(userInfo.phone || "");
    const [address, setAddress] = useState(userInfo.address || "");

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(userInfo.avatar || "");

    const [isShowAlert, setIsShowAlert] = useState(false);

    const isLoggedIn = !!localStorage.getItem("token");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Kiểm tra định dạng tệp tải lên
            const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validImageTypes.includes(file.type)) {
                alert("Định dạng tệp không hợp lệ! Vui lòng chỉ chọn ảnh có định dạng .JPEG hoặc .PNG.");
                e.target.value = ''; // Xóa tệp không hợp lệ khỏi input
                return;
            }

            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl !== userInfo.avatar) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, userInfo.avatar]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const res = await updateInfoUser({
                fullName: fullname,
                email,
                phone,
                address,
                fileAvatar: selectedFile
            } );
            
            // lưu ảnh mới vào bộ nhớ
            if (res.avatarURL) {
                localStorage.setItem("avatar", res.avatarURL);
                window.dispatchEvent(new Event("avatarChanged"));
            }
            
            // Cập nhật lại cache để Sidebar và InfoUser có dữ liệu mới ngay lập tức
            updateUserCache({ fullname, email, phone, address, avatar: res.avatarURL || userInfo.avatar });
            
            setIsShowAlert(true);
        } catch (error) {
            const errorInfo = error as InfoErrorRes;
            console.log(errorInfo);
            if (errorInfo.status === 500) {
                navigate("/error500");
            } else {
                alert(errorInfo.message);
            }
        }
    }

    const closeAlertAndNavigate = () => {
        setIsShowAlert(false);
        navigate("/user/info");
    }

    if (!isLoggedIn) {
        return (
            <div className="edit-user-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
                <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Vui lòng đăng nhập</h2>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>Bạn cần đăng nhập để cập nhật thông tin cá nhân.</p>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <Button variant="primary" width="200px" height="48px">Đăng nhập ngay</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-user-container">
            <Alert
                show={isShowAlert}
                title={"THÔNG BÁO"}
                type={"success"}
                message={"Cập nhật thông tin thành công"}
                action={<Button variant="primary" width="100px" height="40px" onClick={closeAlertAndNavigate}>Đóng</Button>}
            />

            <UserSidebar />

            <div className="edit-user-content">
                <div className="content-header">
                    <h2 className="content-title">Chỉnh Sửa Hồ Sơ</h2>
                    <p className="content-subtitle">Cập nhật thông tin cá nhân của bạn để bảo mật tài khoản</p>
                </div>

                <form className="edit-form" onSubmit={handleSubmit}>

                    {/* KHUNG LAYOUT 2 CỘT */}
                    <div className="form-layout">

                        {/* CỘT TRÁI */}
                        <div className="form-left-col">
                            <div className="form-group">
                                <Input label="Họ và tên" value={fullname} onChange={(e) => setfullname(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <Input label="Số điện thoại" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <Input label="Địa chỉ" value={address} onChange={(e) => setAddress(e.target.value)} required />
                            </div>

                            {/* Khu vực chọn ảnh */}
                            <div className="avatar-upload-group">
                                <label className="avatar-label">Ảnh đại diện</label>
                                <div className="avatar-upload-row">
                                    <label className="btn-upload">
                                        Chọn ảnh...
                                        <input
                                            type="file"
                                            accept="image/jpeg, image/png, image/jpg"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    <span className="file-name">
                                        {selectedFile ? selectedFile.name : "Chưa có file nào được chọn"}
                                    </span>
                                </div>
                                <p className="helper-text">
                                    Hỗ trợ .JPEG, .PNG.
                                </p>
                            </div>
                        </div>

                        {/* CỘT PHẢI: PREVIEW */}
                        <div className="form-right-col">
                            <label className="preview-title">Xem trước ảnh</label>
                            <img
                                src={previewUrl}
                                alt="Avatar Preview"
                                className="avatar-preview-img"
                            />
                        </div>

                    </div>

                    {/* NÚT SUBMIT / HỦY */}
                    <div className="form-actions">
                        <Button type="button" variant="secondary" width="120px" height="40px" onClick={() => navigate("/user/info")}>Hủy</Button>
                        <Button type="submit" variant="primary" width="160px" height="40px">Lưu thay đổi</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditUser;
