import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "./AdminLayout.css";

function AdminLayout() {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="admin-layout-container">
            <AdminSidebar />
            <div className="admin-main-wrapper">
                <AdminHeader />
                <main className="admin-main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;