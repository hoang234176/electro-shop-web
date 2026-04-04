import Header from "./Header";
// import NavBar from "./Navbar";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

function UserLayout() {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <>
            <div className="view-layout">
                {/* <NavBar /> */}
                <Header />
                <Outlet />

                <Footer />
            </div>
        </>

    )
}

export default UserLayout;