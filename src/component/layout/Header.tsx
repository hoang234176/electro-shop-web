import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import "./Header.css";
import logoShop from "../../assets/logo-shop.png";
import searchIcon from "../../assets/search-icon.png";
import { logout } from "../../services/authServices";
import { getCart } from "../../services/cartServices";
import Loading from "../ui/Loading";

function Header() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(
        localStorage.getItem("token") ? true : false
    );

    const [avatar, setAvatar] = useState(
        localStorage.getItem("avatar") ? localStorage.getItem("avatar") : null
    );

    // Số lượng đầu mục sản phẩm trong giỏ hàng
    const [cartCount, setCartCount] = useState(0);

    // Giả lập số lượng thông báo (ví dụ: sản phẩm trong giỏ hàng giảm giá)
    // const [notificationCount] = useState(6);

    const [searchValue, setSearchValue] = useState("");
    const [debouncedValue, setDebouncedValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate(`/search?q=${searchValue}`);
        }, 800); // Hiển thị UI loading 800ms trước khi chuyển trang tìm kiếm
    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    }

    // Lắng nghe sự kiện đăng nhập/đăng xuất để tự động cập nhật Header
    useEffect(() => {
        const handleAuthChange = () => {
            setIsLoggedIn(localStorage.getItem("token") ? true : false);
            setAvatar(localStorage.getItem("avatar") ? localStorage.getItem("avatar") : null);
        };

        window.addEventListener("authChanged", handleAuthChange);
        return () => window.removeEventListener("authChanged", handleAuthChange);
    }, []);

    // Gọi API lấy giỏ hàng 1 lần khi render
    useEffect(() => {
        const fetchCartCount = async () => {
            if (isLoggedIn) {
                try {
                    const cart = await getCart();
                    if (cart && cart.items) {
                        // Đếm số lượng đầu mục sản phẩm theo đúng yêu cầu (3 chiếc 1 sản phẩm vẫn là 1)
                        setCartCount(cart.items.length);
                    }
                } catch (error) {
                    console.error("Lỗi lấy giỏ hàng trên Header", error);
                }
            } else {
                // Đặt lại số lượng giỏ hàng về 0 khi người dùng đăng xuất
                setCartCount(0);
            }
        };

        fetchCartCount();

        // Lắng nghe sự kiện để cập nhật lại số lượng khi thêm/xóa giỏ hàng thành công
        window.addEventListener('cartUpdated', fetchCartCount);
        return () => {
            window.removeEventListener('cartUpdated', fetchCartCount);
        };
    }, [isLoggedIn]);

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

    useEffect(() => {
        const handleUpdateAvatar = () => {
            const newAvatar = localStorage.getItem("avatar");
            if (newAvatar && newAvatar !== avatar) {
                setAvatar(newAvatar);
            }
        }

        // Lắng nghe cái "loa" tự chế của mình
        window.addEventListener("avatarChanged", handleUpdateAvatar);

        return () => {
            window.removeEventListener("avatarChanged", handleUpdateAvatar);
        }
    }, [avatar]); 

    const handleNavigation = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate(path);
        }, 800); // Hiển thị UI loading 800ms
    };

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            logout();
            window.dispatchEvent(new Event("authChanged")); // Báo cho Header biết đã đăng xuất
            setIsLoading(false);
            navigate("/login");
        }, 800);
    };

    const renderAuthSection = () => {
        if (!isLoggedIn) {
            return (
                <>
                    <Link to="/register" onClick={(e) => handleNavigation(e, "/register")}>
                        <Button
                            width="100px"
                            height="48px"
                            variant="secondary"
                            className="btn-auth-register-header"
                        >
                            Đăng ký
                        </Button>
                    </Link>
                    <Link to='/login' onClick={(e) => handleNavigation(e, "/login")}>
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
                <div className="user-menu-container">
                    <Link to="/user/info" className="header-avatar-link" onClick={(e) => handleNavigation(e, "/user/info")}>
                        <img src={avatar || ""} alt="avatar" className="avatar-icon-header" />
                    </Link>
                    <div className="user-dropdown-menu">
                        <Link to="/user/info" className="dropdown-item" onClick={(e) => handleNavigation(e, "/user/info")}>👤 Thông tin cá nhân</Link>
                        <Link to="/user/orders" className="dropdown-item" onClick={(e) => handleNavigation(e, "/user/orders")}>📦 Quản lý đơn hàng</Link>
                        {/* <Link to="/user/notifications" className="dropdown-item">
                            🔔 Thông báo
                            {notificationCount > 0 && (
                                <span className="dropdown-badge">{notificationCount}</span>
                            )}
                        </Link> */}
                        <Link to="/user/change-password" className="dropdown-item" onClick={(e) => handleNavigation(e, "/user/change-password")}>🔑 Đổi mật khẩu</Link>
                        <div className="dropdown-divider"></div>
                        <button
                            className="dropdown-item logout-btn"
                            onClick={handleLogout}
                        >
                            🚪 Đăng xuất
                        </button>
                    </div>
                </div>
            );
        }
    };

    return (
        <header className="header-group">
            {isLoading && <Loading fullScreen={true} />}
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

                <Link to="/cart" className="header-cart-link" title="Giỏ hàng" onClick={(e) => handleNavigation(e, "/cart")}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28" height="28"
                        viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                    >
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    {/* Badge hiển thị số lượng giỏ hàng */}
                    {cartCount > 0 && (
                        <span className="cart-badge">{cartCount}</span>
                    )}
                </Link>

                <div className="btn-auth-header-group">
                    {renderAuthSection()}
                </div>
            </div>
        </header>
    )
}

export default Header;
