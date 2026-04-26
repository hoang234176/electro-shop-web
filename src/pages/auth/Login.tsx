import { Link } from "react-router-dom";
import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import "./Auth.css";
import Loading from "../../component/ui/Loading";
import { useLogin } from "../../hooks/features/auth/useLogin";

function Login() {
    const {
        userName, setUserName, password, setPassword,
        stateTypePassword, btnTextPassword,
        isErrorUserName, isErrorPassword,
        validationError, authError, loginSuccess, isLoading,
        handClick, handSubmit, handleForgotPassword
    } = useLogin();

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