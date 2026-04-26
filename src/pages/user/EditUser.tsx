import { Link } from "react-router-dom";
import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import UserSidebar from "../../component/layout/UserSidebar";
import Alert from "../../component/ui/Alert";
import "./EditUser.css";
import { useEditUser } from "../../hooks/features/user/useEditUser";

function EditUser() {
    const { navigate, fullname, setfullname, email, setEmail, phone, setPhone, address, setAddress, selectedFile, previewUrl, isShowAlert, isLoggedIn, handleImageChange, handleSubmit, closeAlertAndNavigate } = useEditUser();

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
