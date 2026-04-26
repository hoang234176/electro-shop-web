import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { type AlertProps } from "../../../component/ui/Alert";
import { changePassword } from "../../../services/user.service";

export const useChangePassword = () => {
    const navigate = useNavigate();
    
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [debouncedNewPassword, setDebouncedNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState<AlertProps>({ show: false, type: 'info', message: '', title: '' });

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isLoggedIn = !!localStorage.getItem("token");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedNewPassword(newPassword);
        }, 500);
        return () => clearTimeout(timer);
    }, [newPassword]);

    const hasValidLength = debouncedNewPassword.length >= 8 && debouncedNewPassword.length <= 24;
    const hasUppercase = /[A-Z]/.test(debouncedNewPassword);
    const hasNumber = /[0-9]/.test(debouncedNewPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(debouncedNewPassword);

    const isNewPasswordValid = hasValidLength && hasUppercase && hasNumber && hasSpecialChar;

    const getRuleColor = (isValid: boolean) => !debouncedNewPassword ? "#6b7280" : isValid ? "#10b981" : "#ef4444";
    const getRuleIcon = (isValid: boolean) => !debouncedNewPassword ? "○" : isValid ? "✔" : "✘";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!oldPassword || !newPassword || !confirmPassword) {
            setAlert({ show: true, type: 'warning', title: 'CẢNH BÁO', message: 'Vui lòng không để trống các thông tin.' });
            return;
        }
        if (!isNewPasswordValid) {
            setAlert({ show: true, type: 'error', title: 'LỖI', message: 'Mật khẩu mới chưa đáp ứng đủ các điều kiện bảo mật.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setAlert({ show: true, type: 'error', title: 'LỖI', message: 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp.' });
            return;
        }

        setIsLoading(true);
        try {
            await changePassword({ oldPassword, newPassword });
            setAlert({ show: true, type: 'success', title: 'THÔNG BÁO', message: 'Thay đổi mật khẩu thành công.' });
            setOldPassword(""); setNewPassword(""); setConfirmPassword("");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setAlert({ show: true, type: 'error', title: 'LỖI', message: error.message || 'Mật khẩu cũ sai vui lòng thử lại.' });
        } finally { setIsLoading(false); }
    };

    const closeAlert = () => setAlert({ ...alert, show: false });

    return { navigate, oldPassword, setOldPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, isLoading, alert, showOldPassword, setShowOldPassword, showNewPassword, setShowNewPassword, showConfirmPassword, setShowConfirmPassword, isLoggedIn, hasValidLength, hasUppercase, hasNumber, hasSpecialChar, getRuleColor, getRuleIcon, handleSubmit, closeAlert };
};