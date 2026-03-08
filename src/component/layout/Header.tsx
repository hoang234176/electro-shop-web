import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import "./Header.css";
import avatar from "../../assets/avatar/avatar.png";
import logoShop from "../../assets/logo-shop.png";
import searchIcon from "../../assets/search-icon.png";

function Header() {
    const navigate = useNavigate();
    const [isLoggedIn] = useState(
        localStorage.getItem("token") ? true : false
    );

    const [searchValue, setSearchValue] = useState("");
    const [debouncedValue, setDebouncedValue] = useState("");

    const handSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        navigate(`/search?q=${searchValue}`);
    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(searchValue);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue]);

    useEffect(() => {
        if (debouncedValue) {
            //fetchAPI
        }
    }, [debouncedValue]);


    const renderAuthSection = () => {
        if (!isLoggedIn) {
            return (
                <>
                    <Link to="/register">
                        <Button
                            width="100px"
                            height="48px"
                            variant="secondary"
                            className="btn-auth-register-header"
                        >
                            Đăng ký
                        </Button>
                    </Link>
                    <Link to='/login'>
                        <Button
                            width="100px"
                            height="48px"
                            variant="primary"
                            className="btn-auth-login-header"
                        >
                            Đăng nhập
                        </Button>
                    </Link>
                </>
            );
        } else {
            return (
                <>
                    <Link to="/user/info">
                        <img src={avatar} alt="avatar" width={"48px"} style={{ cursor: "pointer" }} className="avatar-icon-header" />
                    </Link>
                    <Button
                        width="100px"
                        height="48px"
                        variant="danger"
                        className="btn-auth-login-header"
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.reload();
                        }}
                    >
                        Đăng xuất
                    </Button>
                </>
            );
        }
    };

    return (
        <header className="header-group">
            <div className="header-left">
                <Link to='/'>
                    <img src={logoShop} alt="Trang chủ" width={"76px"} />
                </Link>
                <div className="nav-group-header">
                    <Link to="/">Trang chủ</Link>
                    <Link to="/category">Danh mục</Link>
                    <Link to="/brand">Thương hiệu</Link>
                </div>
            </div>
            <div className="header-right">
                <div className="search-group">
                    <form onSubmit={handSubmitSearch}>
                        <Input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm ..."
                            className="input-search"
                            value={searchValue}
                            onChange={handleSearchChange}
                        />
                        <img src={searchIcon} alt="" className="search-icon" />
                    </form>
                </div>
                <div className="btn-auth-header-group">
                    {renderAuthSection()}
                </div>
            </div>
        </header>
    )
}

export default Header;
