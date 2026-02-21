import { useState } from "react";
import Input from "../../component/ui/Input";
import Button from "../../component/ui/Button";
import { Link } from "react-router-dom";
import logoGoogle from "../../assets/google-logo.png";
import "./Auth.css";

function Register() {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [isShowPassword, setIsShowPassword] = useState(false);
    const [stateTypePassword, setTypePassword] = useState("password");
    const [btnTextPassword, setBtnTextPassword] = useState("Hiện");
    const [btnTextRePassword, setBtnTextRePassword] = useState("Hiện");


    const handSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log(phone);
    }

    return (
        <div className="auth-container">
            <div className="form-auth-group">
                <form className="form-auth" onSubmit={handSubmit}>
                    <h1>Đăng ký</h1>
                    <Input
                        type="text"
                        label="Tên đăng nhập"
                        value={userName}
                        onChange={(event) => setUserName(event.target.value)}
                    />
                    <div className="password-group">
                        <Input
                            type="password"
                            label="Mật khẩu"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            width="72px"
                            height="48px"
                            className="btn-show-password"
                        >
                            {btnTextPassword}
                        </Button>
                    </div>
                    <div className="password-group">
                        <Input
                            type="password"
                            label="Nhập lại mật khẩu"
                            value={rePassword}
                            onChange={(event) => setRePassword(event.target.value)}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            width="72px"
                            height="48px"
                            className="btn-show-password"
                        >
                            {btnTextRePassword}
                        </Button>
                    </div>
                    <Input
                        type="email"
                        label="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <Input
                        type="number"
                        label="Số điện thoại"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                    />
                    <Input
                        type="text"
                        label="Địa chỉ"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
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