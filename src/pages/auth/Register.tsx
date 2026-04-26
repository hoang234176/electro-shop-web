import Input from "../../component/ui/Input";
import Button from "../../component/ui/Button";
import { Link } from "react-router-dom";
import "./Auth.css";
import Loading from "../../component/ui/Loading";
import { useRegister } from "../../hooks/features/auth/useRegister";

function Register() {
    const {
        fullName, setFullname, userName, setUserName, password, setPassword, rePassword, setRePassword,
        email, setEmail, phone, setPhone, address, setAddress,
        stateTypePassword, stateTypeRePassword, btnTextPassword, btnTextRePassword,
        isErrorFullname, isErrorUserName, isErrorPassword, isErrorRePassword, isErrorEmail, isErrorPhone, isErrorAddress,
        validationError, authError, passwordError, registerSuccess, isLoading, message,
        hasValidLength, hasUppercase, hasNumber, hasSpecialChar, getRuleColor, getRuleIcon,
        handClickPassword, handClickRePassword, handSubmit
    } = useRegister();

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