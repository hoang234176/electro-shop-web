import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import "./Auth.css";
import logoGoogle from "../../assets/google-logo.png";
import axios from "axios";



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


    useEffect(() => {
        const userNameRegister = searchParams.get("userName");
        if (userNameRegister) {
            setUserName(userNameRegister);
        }
    }, [searchParams])

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

        const isUserEmpty = userName.trim() === "";
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
                const infoUserLogin = {
                    userName: userName,
                    password: password
                }

                const res = await axios.post('http://localhost:5000/api/auth/login', infoUserLogin);
                const token = res.data.token;
                const role = res.data.role;

                localStorage.setItem("token", token);
                localStorage.setItem("role", role);
                setLoginSuccess(true);
                setAuthError(false);
                setValidationError(false);

                if (role === "ADMIN") {
                    setTimeout(() => {
                        navigate("/admin/dashboard");
                    }, 2000);
                } else {
                    setTimeout(() => {
                        navigate("/");
                    }, 2000);
                }
            } catch {
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


    return (
        <div className="auth-container">
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
                    >
                        Đăng nhập
                    </Button>
                    <div className="forgot-password-group">
                        <p>Quên mật khẩu?</p>
                    </div>
                </form>

                <div className="or-group">
                    <hr />
                    <p>Hoặc</p>
                </div>

                <div className="login-other">
                    <Button
                        type="button"
                        variant="secondary"
                        width="100%"
                        height="48px"
                        className="btn-login-google"
                    >
                        <img src={logoGoogle} alt="Logo Google" width={"24px"} />
                        <p>Đăng nhập bằng Google</p>
                    </Button>

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