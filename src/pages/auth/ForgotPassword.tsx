import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Input from "../../component/ui/Input";
import Button from "../../component/ui/Button";
import Alert  from "../../component/ui/Alert";
import { type AlertProps } from "../../component/ui/Alert";
import "./Auth.css";
// Giả định các service này sẽ được tạo trong `authServices.ts`
import { forgotPasswordRequest, verifyResetCode, verifyAndResetPassword } from "../../services/auth.service";
import Loading from "../../component/ui/Loading";

function ForgotPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState(1); // 1: Nhập username, 2: Nhập code, 3: Đặt lại mật khẩu, 4: Thành công
    const [username, setUsername] = useState(location.state?.username || "");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [debouncedPassword, setDebouncedPassword] = useState("");
    const [maskedEmail, setMaskedEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState<AlertProps>({ show: false, type: 'info', message: '', title: '' });

    // State cho ẩn/hiện mật khẩu
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);

    // Cuộn lên đầu trang khi vào trang
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Debounce mật khẩu để kiểm tra điều kiện
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedPassword(password);
        }, 500);
        return () => clearTimeout(timer);
    }, [password]);

    const hasValidLength = debouncedPassword.length >= 8 && debouncedPassword.length <= 24;
    const hasUppercase = /[A-Z]/.test(debouncedPassword);
    const hasNumber = /[0-9]/.test(debouncedPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(debouncedPassword);

    const isPasswordValid = hasValidLength && hasUppercase && hasNumber && hasSpecialChar;

    const getRuleColor = (isValid: boolean) => {
        if (!debouncedPassword) return "#6b7280";
        return isValid ? "#10b981" : "#ef4444";
    };

    const getRuleIcon = (isValid: boolean) => {
        if (!debouncedPassword) return "○";
        return isValid ? "✔" : "✘";
    };

    // Xử lý gửi yêu cầu lấy lại mật khẩu
    const handleUsernameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!username.trim()) {
            setAlert({ show: true, type: 'warning', title: 'CẢNH BÁO', message: 'Vui lòng nhập tên đăng nhập.' });
            return;
        }
        setIsLoading(true);
        try {
            const res = await forgotPasswordRequest({ username });
            if (res.maskedEmail) {
                setMaskedEmail(res.maskedEmail);
                setAlert({ show: false, type: 'success', title: 'THÔNG BÁO', message: "" });
                setStep(2);
            } else {
                 // Trường hợp backend trả về thông báo chung (không tìm thấy user)
                 setAlert({ show: true, type: 'info', title: 'THÔNG BÁO', message: res.message });
            }
        } catch (error: any) {
            setAlert({ show: true, type: 'error', title: 'LỖI', message: error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý kiểm tra mã code
    const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!code.trim() || code.length !== 6) {
            setAlert({ show: true, type: 'warning', title: 'CẢNH BÁO', message: 'Vui lòng nhập mã xác thực gồm 6 chữ số.' });
            return;
        }
        setIsLoading(true);
        try {
            const res = await verifyResetCode({ username, code: code.trim() });
            setTimeout(() => {
                setAlert({ show: false, type: 'success', title: 'THÔNG BÁO', message: res.message });
                setStep(3); // Chuyển sang bước nhập mật khẩu mới
                setIsLoading(false);
            }, 800); // Hiển thị UI loading 800ms trước khi chuyển bước
        } catch (error: any) {
            setAlert({ show: true, type: 'error', title: 'LỖI', message: error.message || 'Mã không chính xác hoặc đã hết hạn.' });
            setIsLoading(false);
        }
    };

    // Xử lý đặt lại mật khẩu
    const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!isPasswordValid) {
            setAlert({ show: true, type: 'warning', title: 'CẢNH BÁO', message: 'Mật khẩu mới chưa đáp ứng đủ các điều kiện bảo mật.' });
            return;
        }

        if (password !== confirmPassword) {
            setAlert({ show: true, type: 'warning', title: 'CẢNH BÁO', message: 'Mật khẩu xác nhận không khớp.' });
            return;
        }
        setIsLoading(true);
        try {
            const res = await verifyAndResetPassword({ username, code: code.trim(), password });
            setTimeout(() => {
                setStep(4); // Chuyển sang bước thành công
                setIsLoading(false);
            }, 800); // Hiển thị UI loading 800ms trước khi chuyển bước
        } catch (error: any) {
            setIsLoading(false);
            if (error.status === 500) {
                navigate("/error500");
            } else {
                setAlert({ show: true, type: 'error', title: 'LỖI', message: error.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu.' });
            }
        }
    };
    
    // Xử lý gửi lại mã
    const handleResendCode = async () => {
        setIsLoading(true);
        try {
            await forgotPasswordRequest({ username });
            setAlert({ show: true, type: 'success', title: 'THÔNG BÁO', message: 'Một mã mới đã được gửi đi.' });
        } catch (error: any) {
            setAlert({ show: true, type: 'error', title: 'LỖI', message: error.message || 'Không thể gửi lại mã. Vui lòng thử lại sau.' });
        } finally {
            setIsLoading(false);
        }
    }

    const closeAlert = () => {
        setAlert({ ...alert, show: false });
    };

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