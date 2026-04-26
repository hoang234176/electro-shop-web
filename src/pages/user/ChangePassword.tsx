import { Link } from "react-router-dom";
import UserSidebar from "../../component/layout/UserSidebar";
import Input from "../../component/ui/Input";
import Button from "../../component/ui/Button";
import Alert from "../../component/ui/Alert";
import "./ChangePassword.css"; 
import { useChangePassword } from "../../hooks/features/user/useChangePassword";

function ChangePassword() {
    const { navigate, oldPassword, setOldPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, isLoading, alert, showOldPassword, setShowOldPassword, showNewPassword, setShowNewPassword, showConfirmPassword, setShowConfirmPassword, isLoggedIn, hasValidLength, hasUppercase, hasNumber, hasSpecialChar, getRuleColor, getRuleIcon, handleSubmit, closeAlert } = useChangePassword();

    if (!isLoggedIn) {
        return (
            <div className="edit-user-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
                <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Vui lòng đăng nhập</h2>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>Bạn cần đăng nhập để đổi mật khẩu bảo mật.</p>
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
                show={alert.show}
                title={alert.title}
                type={alert.type}
                message={alert.message}
                action={<Button variant="primary" width="100px" height="40px" onClick={closeAlert}>Đóng</Button>}
            />

            <UserSidebar />

            <div className="edit-user-content">
                <div className="content-header">
                    <h2 className="content-title">Đổi Mật Khẩu</h2>
                    <p className="content-subtitle">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
                </div>

                <form className="edit-form change-password-form" onSubmit={handleSubmit}>
                    <div className="form-group-admin">
                        <div className="password-group">
                            <div className="password-input-wrapper">
                                <Input type={showOldPassword ? "text" : "password"} label="Mật khẩu cũ" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                            </div>
                            <Button type="button" variant="secondary" width="76px" height="42px" onClick={() => setShowOldPassword(!showOldPassword)} className="password-toggle-btn">
                                {showOldPassword ? "Ẩn" : "Hiện"}
                            </Button>
                        </div>
                    </div>
                    <div className="form-group-admin">
                        <div className="password-group">
                            <div className="password-input-wrapper">
                                <Input type={showNewPassword ? "text" : "password"} label="Mật khẩu mới" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                            </div>
                            <Button type="button" variant="secondary" width="76px" height="42px" onClick={() => setShowNewPassword(!showNewPassword)} className="password-toggle-btn">
                                {showNewPassword ? "Ẩn" : "Hiện"}
                            </Button>
                        </div>
                        
                        <div className="password-rules-list">
                            <span className="password-rule-item" style={{ color: getRuleColor(hasValidLength) }}>
                                {getRuleIcon(hasValidLength)} Mật khẩu từ 8 đến 24 ký tự
                            </span>
                            <span className="password-rule-item" style={{ color: getRuleColor(hasUppercase) }}>
                                {getRuleIcon(hasUppercase)} Có ít nhất 1 chữ hoa
                            </span>
                            <span className="password-rule-item" style={{ color: getRuleColor(hasNumber) }}>
                                {getRuleIcon(hasNumber)} Có ít nhất 1 số
                            </span>
                            <span className="password-rule-item" style={{ color: getRuleColor(hasSpecialChar) }}>
                                {getRuleIcon(hasSpecialChar)} Có ít nhất 1 ký tự đặc biệt
                            </span>
                        </div>
                    </div>
                    <div className="form-group-admin">
                        <div className="password-group">
                            <div className="password-input-wrapper">
                                <Input type={showConfirmPassword ? "text" : "password"} label="Xác nhận mật khẩu mới" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                            </div>
                            <Button type="button" variant="secondary" width="76px" height="42px" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle-btn">
                                {showConfirmPassword ? "Ẩn" : "Hiện"}
                            </Button>
                        </div>
                    </div>

                    <div className="form-actions">
                        <Button type="button" variant="secondary" width="120px" height="40px" onClick={() => navigate("/user/info")}>Hủy</Button>
                        <Button type="submit" variant="primary" width="160px" height="40px" disabled={isLoading}>
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;