import { Link } from "react-router-dom";
import Input from "../../component/ui/Input";
import Button from "../../component/ui/Button";
import Alert  from "../../component/ui/Alert";
import "./Auth.css";
import Loading from "../../component/ui/Loading";
import { useForgotPassword } from "../../hooks/features/auth/useForgotPassword";

function ForgotPassword() {
    const {
        step, navigate, username, setUsername, code, setCode, password, setPassword, confirmPassword, setConfirmPassword,
        maskedEmail, isLoading, alert, isShowPassword, setIsShowPassword, isShowConfirmPassword, setIsShowConfirmPassword,
        hasValidLength, hasUppercase, hasNumber, hasSpecialChar, getRuleColor, getRuleIcon,
        handleUsernameSubmit, handleCodeSubmit, handleResetSubmit, handleResendCode, closeAlert
    } = useForgotPassword();

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <form className="form-auth" onSubmit={handleUsernameSubmit}>
                        <h1>Quên Mật Khẩu</h1>
                        <p className="auth-subtext">Nhập tên đăng nhập của bạn để nhận mã khôi phục qua email.</p>
                        <Input
                            type="text"
                            label="Tên đăng nhập"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <Button type="submit" variant="primary" width="90%" height="48px" className="btn-auth" disabled={isLoading}>
                            {isLoading ? "Đang xử lý..." : "Tiếp tục"}
                        </Button>
                        <div className="forgot-password-group" style={{ marginBottom: "24px" }}>
                            <Link to="/login">Quay lại Đăng nhập</Link>
                        </div>
                    </form>
                );
            case 2:
                return (
                    <form className="form-auth" onSubmit={handleCodeSubmit}>
                        <h1>Xác Nhận Mã</h1>
                        <p className="auth-subtext">
                            Chúng tôi đã gửi một mã gồm 6 chữ số đến email: <br /><strong>{maskedEmail}</strong>
                        </p>
                        <Input
                            type="text"
                            label="Mã xác thực"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            maxLength={6}
                        />
                        <Button type="submit" variant="primary" width="90%" height="48px" className="btn-auth" disabled={isLoading}>
                            {isLoading ? "Đang xử lý..." : "Tiếp tục"}
                        </Button>
                        <div className="forgot-password-group" style={{ marginBottom: "24px" }}>
                            <span>Không nhận được mã? </span>
                            <button type="button" onClick={handleResendCode} className="btn-link" disabled={isLoading}>
                                Gửi lại
                            </button>
                        </div>
                    </form>
                );
            case 3:
                return (
                    <form className="form-auth" onSubmit={handleResetSubmit}>
                        <h1>Đặt Lại Mật Khẩu</h1>
                        <p className="auth-subtext">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
                        
                        <div className="password-group">
                            <Input
                                type={isShowPassword ? "text" : "password"}
                                label="Mật khẩu mới"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                width="72px"
                                height="48px"
                                className="btn-show-password"
                                onClick={() => setIsShowPassword(!isShowPassword)}
                            >
                                {isShowPassword ? "Ẩn" : "Hiện"}
                            </Button>
                        </div>

                        <div className="password-rules-list" style={{ width: '90%', marginBottom: '16px', textAlign: 'left', marginTop: '16px', boxSizing: 'border-box' }}>
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

                        <div className="password-group">
                            <Input
                                type={isShowConfirmPassword ? "text" : "password"}
                                label="Xác nhận mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                width="72px"
                                height="48px"
                                className="btn-show-password"
                                onClick={() => setIsShowConfirmPassword(!isShowConfirmPassword)}
                            >
                                {isShowConfirmPassword ? "Ẩn" : "Hiện"}
                            </Button>
                        </div>

                        <Button type="submit" variant="primary" width="90%" height="48px" className="btn-auth" disabled={isLoading} style={{ marginBottom: "24px" }}>
                            {isLoading ? "Đang xử lý..." : "Lưu mật khẩu"}
                        </Button>
                    </form>
                );
            case 4:
                 return (
                    <div className="form-auth">
                        <h1>Thành Công!</h1>
                        <p className="auth-subtext" style={{textAlign: 'center'}}>
                            Mật khẩu của bạn đã được thay đổi thành công. Vui lòng đăng nhập lại với mật khẩu mới.
                        </p>
                        <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                            <Button variant="primary" width="90%" height="48px" className="btn-auth" onClick={() => navigate('/login')}>
                                Về trang Đăng nhập
                            </Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="auth-container">
            <Alert
                show={alert.show}
                title={alert.title}
                type={alert.type}
                message={alert.message}
                action={<Button variant="primary" width="100px" height="40px" onClick={closeAlert}>Đóng</Button>}
            />
            {isLoading && <Loading fullScreen={true} />}
            <div className="form-auth-group">
                {renderStep()}
            </div>
        </div>
    );
}

export default ForgotPassword;