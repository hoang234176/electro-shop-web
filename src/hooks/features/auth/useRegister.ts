import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerReq, type RegisterError } from "../../../services/auth.service";

export const useRegister = () => {
    const navigate = useNavigate();

    const [fullName, setFullname] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [debouncedPassword, setDebouncedPassword] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isShowRePassword, setIsShowRePassword] = useState(false);
    const [stateTypePassword, setTypePassword] = useState("password");
    const [stateTypeRePassword, setTypeRePassword] = useState("password");
    const [btnTextPassword, setBtnTextPassword] = useState("Hiện");
    const [btnTextRePassword, setBtnTextRePassword] = useState("Hiện");

    const [isErrorFullname, setIsErrorFullname] = useState(false);
    const [isErrorUserName, setIsErrorUserName] = useState(false);
    const [isErrorPassword, setIsErrorPassword] = useState(false);
    const [isErrorRePassword, setIsErrorRePassword] = useState(false);
    const [isErrorEmail, setIsErrorEmail] = useState(false);
    const [isErrorPhone, setIsErrorPhone] = useState(false);
    const [isErrorAddress, setIsErrorAddress] = useState(false);

    const [validationError, setValidationError] = useState(false);
    const [authError, setAuthError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [message, setMessage] = useState("");

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

    const handClickPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!isShowPassword) { setIsShowPassword(true); setTypePassword("text"); setBtnTextPassword("Ẩn"); } 
        else { setIsShowPassword(false); setTypePassword("password"); setBtnTextPassword("Hiện"); }
    };

    const handClickRePassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!isShowRePassword) { setIsShowRePassword(true); setTypeRePassword("text"); setBtnTextRePassword("Ẩn"); } 
        else { setIsShowRePassword(false); setTypeRePassword("password"); setBtnTextRePassword("Hiện"); }
    };

    const handSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedFullName = fullName.trim();
        const trimmedUserName = userName.trim();
        const trimmedEmail = email.trim();
        const trimmedPhone = phone.trim();
        const trimmedAddress = address.trim();

        const isFullnameEmpty = trimmedFullName === "";
        const isUserNameEmpty = trimmedUserName === "";
        const isPasswordEmpty = password.trim() === "";
        const isRePasswordEmpty = rePassword.trim() === "";
        const isEmailEmpty = trimmedEmail === "";
        const isPhoneEmpty = trimmedPhone === "";
        const isAddressEmpty = trimmedAddress === "";

        if (isFullnameEmpty || isUserNameEmpty || isPasswordEmpty || isRePasswordEmpty || isEmailEmpty || isPhoneEmpty || isAddressEmpty) {
            if (isFullnameEmpty) setIsErrorFullname(true);
            if (isUserNameEmpty) setIsErrorUserName(true);
            if (isPasswordEmpty) setIsErrorPassword(true);
            if (isRePasswordEmpty) setIsErrorRePassword(true);
            if (isEmailEmpty) setIsErrorEmail(true);
            if (isPhoneEmpty) setIsErrorPhone(true);
            if (isAddressEmpty) setIsErrorAddress(true);

            setTimeout(() => { setIsErrorFullname(false); setIsErrorUserName(false); setIsErrorPassword(false); setIsErrorRePassword(false); setIsErrorEmail(false); setIsErrorPhone(false); setIsErrorAddress(false); }, 200);
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmedEmail)) {
                setAuthError(true); setValidationError(false); setPasswordError(false); setMessage("Định dạng email không hợp lệ.");
                setIsErrorEmail(true); setTimeout(() => setIsErrorEmail(false), 2000); return;
            }

            const phoneRegex = /^(84|0)(3|5|7|8|9)[0-9]{8}$/;
            if (!phoneRegex.test(trimmedPhone)) {
                setAuthError(true); setValidationError(false); setPasswordError(false); setMessage("Số điện thoại không hợp lệ (Bắt đầu bằng 0 hoặc 84 và có 10-11 chữ số).");
                setIsErrorPhone(true); setTimeout(() => setIsErrorPhone(false), 2000); return;
            }

            if (!isPasswordValid) {
                setAuthError(true); setValidationError(false); setPasswordError(false); setMessage("Mật khẩu chưa đáp ứng đủ các điều kiện bảo mật.");
                setIsErrorPassword(true); setTimeout(() => setIsErrorPassword(false), 2000); return;
            }

            if (password === rePassword) {
                try {
                    setIsLoading(true);
                    await registerReq({ fullName: trimmedFullName, userName: trimmedUserName, password, email: trimmedEmail, phone: trimmedPhone, address: trimmedAddress });
                    setRegisterSuccess(true); setAuthError(false); setValidationError(false); setPasswordError(false); setMessage(message);
                    setTimeout(() => { navigate(`/login?userName=${userName}`); }, 2000);
                } catch (error) {
                    setIsLoading(false);
                    const errorInfo = error as RegisterError;
                    if (errorInfo.status === 500) { navigate("/error500"); } 
                    else {
                        setMessage(errorInfo.message);
                        setAuthError(true); setValidationError(false); setPasswordError(false);
                    }
                }
            } else {
                setIsErrorPassword(true); setIsErrorRePassword(true); setPasswordError(true); setValidationError(false);
                setTimeout(() => { setIsErrorPassword(false); setIsErrorRePassword(false); }, 200);
                setPassword(""); setRePassword("");
            }
        }
    };

    return {
        fullName, setFullname, userName, setUserName, password, setPassword, rePassword, setRePassword, email, setEmail, phone, setPhone, address, setAddress,
        stateTypePassword, stateTypeRePassword, btnTextPassword, btnTextRePassword,
        isErrorFullname, isErrorUserName, isErrorPassword, isErrorRePassword, isErrorEmail, isErrorPhone, isErrorAddress,
        validationError, authError, passwordError, registerSuccess, isLoading, message,
        hasValidLength, hasUppercase, hasNumber, hasSpecialChar, getRuleColor, getRuleIcon,
        handClickPassword, handClickRePassword, handSubmit
    };
};