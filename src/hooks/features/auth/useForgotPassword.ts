import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { forgotPasswordRequest, verifyResetCode, verifyAndResetPassword } from "../../../services/auth.service";
import { type AlertProps } from "../../../component/ui/Alert";

export interface AuthError {
    status?: number;
    message?: string;
}

export const useForgotPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState(1);
    const [username, setUsername] = useState(location.state?.username || "");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [debouncedPassword, setDebouncedPassword] = useState("");
    const [maskedEmail, setMaskedEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState<AlertProps>({ show: false, type: 'info', message: '', title: '' });

    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedPassword(password), 500);
        return () => clearTimeout(timer);
    }, [password]);

    const hasValidLength = debouncedPassword.length >= 8 && debouncedPassword.length <= 24;
    const hasUppercase = /[A-Z]/.test(debouncedPassword);
    const hasNumber = /[0-9]/.test(debouncedPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(debouncedPassword);
    const isPasswordValid = hasValidLength && hasUppercase && hasNumber && hasSpecialChar;

    const getRuleColor = (isValid: boolean) => !debouncedPassword ? "#6b7280" : isValid ? "#10b981" : "#ef4444";
    const getRuleIcon = (isValid: boolean) => !debouncedPassword ? "○" : isValid ? "✔" : "✘";

    const handleUsernameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!username.trim()) { setAlert({ show: true, type: 'warning', title: 'CẢNH BÁO', message: 'Vui lòng nhập tên đăng nhập.' }); return; }
        setIsLoading(true);
        try {
            const res = await forgotPasswordRequest({ username });
            if (res.maskedEmail) {
                setMaskedEmail(res.maskedEmail); setAlert({ show: false, type: 'success', title: 'THÔNG BÁO', message: "" }); setStep(2);
            } else {
                 setAlert({ show: true, type: 'info', title: 'THÔNG BÁO', message: res.message });
            }
        } catch (error: unknown) {
            setAlert({ show: true, type: 'error', title: 'LỖI', message: (error as AuthError).message || 'Đã xảy ra lỗi. Vui lòng thử lại.' });
        } finally { setIsLoading(false); }
    };

    const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!code.trim() || code.length !== 6) { setAlert({ show: true, type: 'warning', title: 'CẢNH BÁO', message: 'Vui lòng nhập mã xác thực gồm 6 chữ số.' }); return; }
        setIsLoading(true);
        try {
            const res = await verifyResetCode({ username, code: code.trim() });
            setTimeout(() => {
                setAlert({ show: false, type: 'success', title: 'THÔNG BÁO', message: res.message }); setStep(3); setIsLoading(false);
            }, 800);
        } catch (error: unknown) {
            setAlert({ show: true, type: 'error', title: 'LỖI', message: (error as AuthError).message || 'Mã không chính xác hoặc đã hết hạn.' }); setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isPasswordValid) { setAlert({ show: true, type: 'warning', title: 'CẢNH BÁO', message: 'Mật khẩu mới chưa đáp ứng đủ các điều kiện bảo mật.' }); return; }
        if (password !== confirmPassword) { setAlert({ show: true, type: 'warning', title: 'CẢNH BÁO', message: 'Mật khẩu xác nhận không khớp.' }); return; }
        setIsLoading(true);
        try {
            await verifyAndResetPassword({ username, code: code.trim(), password });
            setTimeout(() => { setStep(4); setIsLoading(false); }, 800);
        } catch (error: unknown) {
            setIsLoading(false);
            const err = error as AuthError;
            if (err.status === 500) { navigate("/error500"); } 
            else { setAlert({ show: true, type: 'error', title: 'LỖI', message: err.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu.' }); }
        }
    };
    
    const handleResendCode = async () => {
        setIsLoading(true);
        try {
            await forgotPasswordRequest({ username });
            setAlert({ show: true, type: 'success', title: 'THÔNG BÁO', message: 'Một mã mới đã được gửi đi.' });
        } catch (error: unknown) {
            setAlert({ show: true, type: 'error', title: 'LỖI', message: (error as AuthError).message || 'Không thể gửi lại mã. Vui lòng thử lại sau.' });
        } finally { setIsLoading(false); }
    };

    const closeAlert = () => setAlert({ ...alert, show: false });

    return {
        step, navigate, username, setUsername, code, setCode, password, setPassword, confirmPassword, setConfirmPassword,
        maskedEmail, isLoading, alert, isShowPassword, setIsShowPassword, isShowConfirmPassword, setIsShowConfirmPassword,
        hasValidLength, hasUppercase, hasNumber, hasSpecialChar, getRuleColor, getRuleIcon,
        handleUsernameSubmit, handleCodeSubmit, handleResetSubmit, handleResendCode, closeAlert
    };
};