import Header from "./Header";
// import NavBar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router";

function UserLayout() {
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