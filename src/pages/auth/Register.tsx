import { useState } from "react";
import Input from "../../component/ui/Input";
import Button from "../../component/ui/Button";
import { Link } from "react-router-dom";
import logoGoogle from "../../assets/google-logo.png";
import "./Auth.css";
import axios from "axios";
import { useNavigate } from "react-router";

function Register() {
    const navigate = useNavigate();

    const [fullName, setFullname] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
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

    const [message, setMessage] = useState("");

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
        const isFullnameEmpty = fullName.trim() === "";
        const isUserNameEmpty = userName.trim() === "";
        const isPasswordEmpty = password.trim() === "";
        const isRePasswordEmpty = rePassword.trim() === "";
        const isEmailEmpty = email.trim() === "";
        const isPhoneEmpty = phone.trim() === "";
        const isAddressEmpty = address.trim() === "";

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
            if (password === rePassword) {
                try {
                    const infoUserRegister = {
                        fullName: fullName,
                        userName: userName,
                        password: password,
                        email: email,
                        phone: phone,
                        address: address
                    }

                    const res = await axios.post('http://localhost:5000/api/auth/register', infoUserRegister);
                    const message = res.data.message;
                    setRegisterSuccess(true);
                    setAuthError(false);
                    setValidationError(false);
                    setPasswordError(false);
                    setMessage(message);
                    setTimeout(() => {
                        navigate(`/login?userName=${userName}`);
                    }, 2000);
                } catch (error) {
                    if (axios.isAxiosError(error) && error.response) {
                        setMessage(error.response.data.message);
                    }

                    setAuthError(true);
                    setValidationError(false);
                    setPasswordError(false);
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
            }
        }
    }

    return (
        <div className="auth-container">
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
                        type="number"
                        label="Số điện thoại"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
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
                    >
                        Đăng ký
                    </Button>
                </form>
                <div className="or-group-register">
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
                        <p>Đăng ký với Google</p>
                    </Button>

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