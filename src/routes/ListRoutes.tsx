import { Routes, Route } from "react-router";
import Home from "../pages/home/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/admin/Dashboard";
import Cart from "../pages/cart/Cart";
import Error403 from "../pages/error/Error403";
import Error404 from "../pages/error/Error404";
import Error500 from "../pages/error/Error500";
import ProductDetail from "../pages/product/ProductDetail";
import InfoUser from "../pages/user/InfoUser";
import EditUser from "../pages/user/EditUser";
// import TestUI from "../test/TestUI";
import UserLayout from "../component/layout/UserLayout";
import AdminLayout from "../component/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import Search from "../pages/home/Search";



function ListRouter() {
    return (
        <Routes>
            <Route element={<UserLayout />}>
                {/* home */}
                <Route path='/' element={<Home />} />

                {/* Search */}
                <Route path='/search' element={<Search />} />

                {/* category */}
                <Route path='/category' element={<Home />} />

                {/* brand */}
                <Route path='/brand' element={<Home />} />

                {/* cart */}
                <Route path='/cart' element={<Cart />} />

                {/* product */}
                <Route path='/product' element={<ProductDetail />} />

                {/* user */}
                <Route path='/user/info' element={<InfoUser />} />
                <Route path='/user/edit' element={<EditUser />} />

                {/* auth */}
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
            </Route>

            {/* error */}
            <Route path='/error403' element={<Error403 />} />
            <Route path='/error404' element={<Error404 />} />
            <Route path='/error500' element={<Error500 />} />

            {/* admin */}
            <Route element={
                <>
                    <AdminLayout />
                    <ProtectedRoute allowRole="ADMIN" />
                </>
            }>
                <Route path='/admin/dashboard' element={<Dashboard />} />
                <Route path='/admin/product' element={<Dashboard />} />
            </Route>

            {/* Sai đường dẫn */}
            <Route path='*' element={<Error404 />} />
        </Routes>
    )
}

export default ListRouter;