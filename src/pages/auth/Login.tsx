import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import "./Auth.css";
import Loading from "../../component/ui/Loading";
import logoGoogle from "../../assets/google-logo.png";
// import axios from "axios";
// import getRole from "../../utils/tokenUtils";
import { loginReq, type LoginError } from "../../services/authServices";
// import { useGoogleLogin } from "@react-oauth/google";
// import { loginGoogleReq } from "../../services/authServices";



function Login() {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const [isShowPassword, setIsShowPassword] = useState(false);
    const [stateTypePassword, setTypePassword] = useState("password");
    const [btnTextPassword, setBtnTextPassword] = useState("Hiện");

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");

    const [isErrorUserName, setIsErrorUserName] = useState(false);
    const [isErrorPassword, setIsErrorPassword] = useState(false);

    const [validationError, setValidationError] = useState(false);
    const [authError, setAuthError] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Cuộn lên đầu trang khi vào trang
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const userNameRegister = searchParams.get("userName");
        if (userNameRegister) {
            setUserName(userNameRegister);
        }
    }, [searchParams])

    /*
    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Gửi access_token lấy được từ Google xuống Backend
                const roleLogin = await loginGoogleReq(tokenResponse.access_token);
                
                setLoginSuccess(true);
                setAuthError(false);
                setValidationError(false);

                if (roleLogin === "ADMIN") {
                    setTimeout(() => {
                        navigate("/admin/dashboard");
                        window.location.reload();
                    }, 2000);
                } else {
                    setTimeout(() => {
                        navigate("/");
                        window.location.reload();
                    }, 2000);
                }
            } catch (error) {
                setAuthError(true);
            }
        },
        onError: error => console.error("Google Login Failed:", error)
    });
    */

    const handClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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

    const handSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedUserName = userName.trim();

        const isUserEmpty = trimmedUserName === "";
        const isPassEmpty = password.trim() === "";

        if (isUserEmpty || isPassEmpty) {
            if (isUserEmpty) {
                setIsErrorUserName(true);
                setValidationError(true);
                setAuthError(false);
            }
            if (isPassEmpty) {
                setIsErrorPassword(true);
                setValidationError(true);
                setAuthError(false);
            }

            setTimeout(() => {
                setIsErrorUserName(false);
                setIsErrorPassword(false);
            }, 200);
        } else {
            try {
                setIsLoading(true);
                const roleLogin = await loginReq({ userName: trimmedUserName, password });
                
                setLoginSuccess(true);
                setAuthError(false);
                setValidationError(false);

                if (roleLogin === "ADMIN") {
                    setTimeout(() => {
                        navigate("/admin/dashboard");
                        window.dispatchEvent(new Event("authChanged")); // Phát sự kiện để Header tự cập nhật
                    }, 2000);
                } else {
                    setTimeout(() => {
                        navigate("/");
                        window.dispatchEvent(new Event("authChanged")); // Phát sự kiện để Header tự cập nhật
                    }, 2000);
                }
            } catch (error) {
                setIsLoading(false);
                const errorInfo = error as LoginError;
                if (errorInfo.status === 500){
                    navigate("/error500");
                }
                setAuthError(true);
                setValidationError(false);
                setIsErrorUserName(true);
                setIsErrorPassword(true);

                setPassword("");
                setTimeout(() => {
                    setIsErrorUserName(false);
                    setIsErrorPassword(false);
                }, 200);
            }
        }

    }

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            navigate("/forgot-password", { state: { username: userName } });
        }, 800); // Hiển thị UI loading 800ms trước khi chuyển trang
    };

    return (
        <div className="auth-container">
            {isLoading && <Loading 
                fullScreen={true} 
                progress={loginSuccess ? 100 : undefined} 
            />}
            <div className="form-auth-group">
                <form className="form-auth" onSubmit={handSubmit}>
                    <h1>ĐĂNG NHẬP</h1>
                    {MessageError(validationError, authError, loginSuccess)}
                    <Input
                        type="text"
                        label="Tên đăng nhập"
                        onChange={event => setUserName(event.target.value)}
                        value={userName}
                        className={isErrorUserName ? "input-error" : ""}
                    />
                    <div className="password-group">
                        <Input
                            type={stateTypePassword}
                            label="Mật khẩu"
                            onChange={event => setPassword(event.target.value)}
                            value={password}
                            className={isErrorPassword ? "input-error" : ""}
                        />

                        <Button
                            type="button"
                            variant="secondary"
                            width="72px"
                            height="48px"
                            className="btn-show-password"
                            onClick={handClick}
                        >
                            {btnTextPassword}
                        </Button>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        width="90%"
                        height="48px"
                        className="btn-auth"
                        disabled={isLoading}
                    >
                        {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                    </Button>
                    <div className="forgot-password-group" style={{ marginBottom: "24px" }}>
                        <Link to="/forgot-password" onClick={handleForgotPassword}>Quên mật khẩu?</Link>
                    </div>
                </form>

                <div className="or-group">
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
                        onClick={() => loginWithGoogle()}
                    >
                        <img src={logoGoogle} alt="Logo Google" width={"24px"} />
                        <p>Đăng nhập bằng Google</p>
                    </Button>
                    */}

                    <span>Nếu chưa có tài khoản? <Link to="/register">Đăng ký</Link></span>
                </div>
            </div>
        </div>
    )
}

export default Login;

function MessageError(validationError: boolean, authError: boolean, loginSuccess: boolean) {
    if (validationError === false && authError === false && loginSuccess === false) {
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
                <h4>Tên đăng nhập hoặc mật khẩu không đúng</h4>
            </div>
        )
    } else if (loginSuccess === true) {
        return (
            <div className="message-success">
                <h4>Đăng nhập thành công</h4>
            </div>
        )
    }
}