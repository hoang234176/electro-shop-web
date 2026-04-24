import { useState, useEffect } from "react";
import Input from "../../component/ui/Input";
import Button from "../../component/ui/Button";
import { Link } from "react-router-dom";
// import logoGoogle from "../../assets/google-logo.png";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { registerReq, type RegisterError } from "../../services/auth.service";
// import { useGoogleLogin } from "@react-oauth/google";
import Loading from "../../component/ui/Loading";

function Register() {
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

    /*
    const registerWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Gọi API, backend sẽ tự động tạo tài khoản nếu chưa có
                const role = await loginGoogleReq(tokenResponse.access_token);
                
                setRegisterSuccess(true);
                setAuthError(false);

                // Sau khi đăng ký/đăng nhập bằng Google, điều hướng dựa trên role
                if (role === "ADMIN") {
                    setTimeout(() => { navigate("/admin/dashboard"); window.location.reload(); }, 2000);
                } else {
                    setTimeout(() => { navigate("/"); window.location.reload(); }, 2000);
                }
            } catch (error) {
                setAuthError(true);
                // Có thể thêm message lỗi cụ thể hơn
                setMessage("Đăng ký/Đăng nhập với Google thất bại.");
            }
        },
        onError: error => console.error("Google Register Failed:", error)
    });
    */

    const handClickPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!isShowPassword) {
            setIsShowPassword(true);
            setTypePassword("text");
            setBtnTextPassword("Ẩn");
        } else {
            setIsShowPassword(false);
            setTypePassword("password");
            setBtnTextPassword("Hiện");
        }
    }

    const handClickRePassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!isShowRePassword) {
            setIsShowRePassword(true);
            setTypeRePassword("text");
            setBtnTextRePassword("Ẩn");
        } else {
            setIsShowRePassword(false);
            setTypeRePassword("password");
            setBtnTextRePassword("Hiện");
        }
    }

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
            if (isFullnameEmpty) {
                setIsErrorFullname(true);
            }
            if (isUserNameEmpty) {
                setIsErrorUserName(true);
            }
            if (isPasswordEmpty) {
                setIsErrorPassword(true);
            }
            if (isRePasswordEmpty) {
                setIsErrorRePassword(true);
            }
            if (isEmailEmpty) {
                setIsErrorEmail(true);
            }
            if (isPhoneEmpty) {
                setIsErrorPhone(true);
            }
            if (isAddressEmpty) {
                setIsErrorAddress(true);
            }

            setTimeout(() => {
                setIsErrorFullname(false);
                setIsErrorUserName(false);
                setIsErrorPassword(false);
                setIsErrorRePassword(false);
                setIsErrorEmail(false);
                setIsErrorPhone(false);
                setIsErrorAddress(false);
            }, 200);
        } else {
            // Kiểm tra định dạng email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmedEmail)) {
                setAuthError(true);
                setValidationError(false);
                setPasswordError(false);
                setMessage("Định dạng email không hợp lệ.");
                setIsErrorEmail(true);
                setTimeout(() => setIsErrorEmail(false), 2000);
                return;
            }

            // Kiểm tra định dạng số điện thoại (Việt Nam)
            const phoneRegex = /^(84|0)(3|5|7|8|9)[0-9]{8}$/;
            if (!phoneRegex.test(trimmedPhone)) {
                setAuthError(true);
                setValidationError(false);
                setPasswordError(false);
                setMessage("Số điện thoại không hợp lệ (Bắt đầu bằng 0 hoặc 84 và có 10-11 chữ số).");
                setIsErrorPhone(true);
                setTimeout(() => setIsErrorPhone(false), 2000);
                return;
            }

            // Kiểm tra mật khẩu có đạt chuẩn không trước khi xét trùng khớp
            if (!isPasswordValid) {
                setAuthError(true);
                setValidationError(false);
                setPasswordError(false);
                setMessage("Mật khẩu chưa đáp ứng đủ các điều kiện bảo mật.");
                setIsErrorPassword(true);
                setTimeout(() => setIsErrorPassword(false), 2000);
                return;
            }

            if (password === rePassword) {
                try {
                    setIsLoading(true);
                    await registerReq({
                        fullName: trimmedFullName,
                        userName: trimmedUserName,
                        password: password,
                        email: trimmedEmail,
                        phone: trimmedPhone,
                        address: trimmedAddress
                    });

                    setRegisterSuccess(true);
                    setAuthError(false);
                    setValidationError(false);
                    setPasswordError(false);
                    setMessage(message);
                    setTimeout(() => {
                        navigate(`/login?userName=${userName}`);
                    }, 2000);
                } catch (error) {
                    setIsLoading(false);
                    const errorInfo = error as RegisterError;
                    if (errorInfo.status === 500) {
                        navigate("/error500");
                    } else {
                        setMessage(errorInfo.message);

                        setAuthError(true);
                        setValidationError(false);
                        setPasswordError(false);
                    }
                }
            } else {
                setIsErrorPassword(true);
                setIsErrorRePassword(true);

                setPasswordError(true);
                setValidationError(false);
                setTimeout(() => {
                    setIsErrorPassword(false);
                    setIsErrorRePassword(false);
                }, 200);
                setPassword("");
                setRePassword("");
            }
        }
    }

    return (
        <div className="auth-container">
            {isLoading && <Loading 
                fullScreen={true} 
                progress={registerSuccess ? 100 : undefined} 
            />}
            <div className="form-auth-group">
                <form className="form-auth" onSubmit={handSubmit}>
                    <h1>Đăng ký</h1>
                    {MessageError(validationError, authError, passwordError, registerSuccess, message)}
                    <Input
                        type="text"
                        label="Họ và tên"
                        value={fullName}
                        onChange={(event) => setFullname(event.target.value)}
                        className={isErrorFullname ? "input-error" : ""}
                    />
                    <Input
                        type="text"
                        label="Tên đăng nhập"
                        value={userName}
                        onChange={(event) => setUserName(event.target.value)}
                        className={isErrorUserName ? "input-error" : ""}
                    />
                    <div className="password-group">
                        <Input
                            type={stateTypePassword}
                            label="Mật khẩu"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className={isErrorPassword ? "input-error" : ""}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            width="72px"
                            height="48px"
                            className="btn-show-password"
                            onClick={handClickPassword}
                        >
                            {btnTextPassword}
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

                    <div className="password-group">
                        <Input
                            type={stateTypeRePassword}
                            label="Nhập lại mật khẩu"
                            value={rePassword}
                            onChange={(event) => setRePassword(event.target.value)}
                            className={isErrorRePassword ? "input-error" : ""}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            width="72px"
                            height="48px"
                            className="btn-show-password"
                            onClick={handClickRePassword}
                        >
                            {btnTextRePassword}
                        </Button>
                    </div>
                    <Input
                        type="email"
                        label="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className={isErrorEmail ? "input-error" : ""}
                    />
                    <Input
                        type="tel"
                        label="Số điện thoại"
                        value={phone}
                        onChange={(event) => {
                            // Chỉ lấy các ký tự là số (0-9), loại bỏ mọi ký tự khác
                            const numericValue = event.target.value.replace(/\D/g, "");
                            setPhone(numericValue);
                        }}
                        className={isErrorPhone ? "input-error" : ""}
                    />
                    <Input
                        type="text"
                        label="Địa chỉ"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        className={isErrorAddress ? "input-error" : ""}
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        width="90%"
                        height="48px"
                        className="btn-auth"
                        disabled={isLoading}
                    >
                        {isLoading ? "Đang xử lý..." : "Đăng ký"}
                    </Button>
                </form>
                <div className="or-group-register">
                    <hr />
                    <p>Hoặc</p>
                </div>
                <div className="login-other">
                    {/*
                    <Button
                        type="button"
                        variant="secondary"
                        width="100%"
                        height="48px"
                        className="btn-login-google"
                        onClick={() => registerWithGoogle()}
                    >
                        <img src={logoGoogle} alt="Logo Google" width={"24px"} />
                        <p>Đăng ký với Google</p>
                    </Button>
                    */}

                    <span>Nếu đã có tài khoản? <Link to="/login">Đăng nhập</Link></span>
                </div>
            </div>
        </div>
    )
}

export default Register;

function MessageError(validationError: boolean, authError: boolean, passwordError: boolean, registerSuccess: boolean, message?: string) {
    if (validationError === false && authError === false && passwordError === false && registerSuccess === false) {
        return null;
    } else if (validationError === true) {
        return (
            <div className="message-error">
                <h4>Vui lòng nhập đầy đủ thông tin</h4>
            </div>
        )
    } else if (authError === true) {
        return (
            <div className="message-error">
                <h4>{message}</h4>
            </div>
        )
    } else if (passwordError === true) {
        return (
            <div className="message-error">
                <h4>Mật khẩu không khớp</h4>
            </div>
        )
    } else if (registerSuccess === true) {
        return (
            <div className="message-success">
                <h4>Đăng ký thành công</h4>
            </div>
        )
    }
}