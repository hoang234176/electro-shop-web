import { Routes, Route } from "react-router";
import Home from "../pages/home/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/admin/Dashboard";
import ProductManagement from "../pages/admin/ProductManagement";
import AddProduct from "../pages/admin/AddProduct";
import OrderManagement from "../pages/admin/OrderManagement";
import UserManagement from "../pages/admin/UserManagement";
import Cart from "../pages/cart/Cart";
import Error403 from "../pages/error/Error403";
import Error404 from "../pages/error/Error404";
import Error500 from "../pages/error/Error500";
import ProductDetail from "../pages/product/ProductDetail";
import InfoUser from "../pages/user/InfoUser";
import EditUser from "../pages/user/EditUser";
import UserLayout from "../component/layout/UserLayout";
import AdminLayout from "../component/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import Search from "../pages/home/Search";
import Category from "../pages/home/Category";
import Brand from "../pages/home/Brand";
import Orders from "../pages/user/Orders";
import Checkout from "../pages/cart/Checkout";
import Invoice from "../pages/cart/Invoice";
import AllProducts from "../pages/home/AllProducts";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ChangePassword from "../pages/user/ChangePassword";
import EditProduct from "../pages/admin/EditProduct";
import ImportProduct from "../pages/admin/ImportProduct";

function ListRouter() {
    return (
        <Routes>
            <Route element={<UserLayout />}>
                {/* home */}
                <Route path='/' element={<Home />} />

                {/* all product */}
                <Route path='/products' element={<AllProducts />} />

                {/* Search */}
                <Route path='/search' element={<Search />} />

                {/* category */}
                <Route path='/category' element={<Category />} />

                {/* brand */}
                <Route path='/brand' element={<Brand />} />

                {/* cart */}
                <Route path='/cart' element={<Cart />} />
                <Route path='/checkout' element={<Checkout />} />
                <Route path='/invoice' element={<Invoice />} />
                

                {/* product */}
                <Route path='/product/:id' element={<ProductDetail />} />

                {/* user */}
                <Route path='/user/info' element={<InfoUser />} />
                <Route path='/user/edit' element={<EditUser />} />
                <Route path='/user/orders' element={<Orders />} />
                <Route path='/user/change-password' element={<ChangePassword />} />


                {/* auth */}
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
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
                <Route path='/admin/product' element={<ProductManagement />} />
                <Route path='/admin/product/add' element={<AddProduct />} />
                <Route path='/admin/orders' element={<OrderManagement />} />
                <Route path='/admin/users' element={<UserManagement />} />
                <Route path='/admin/product/edit/:id' element={<EditProduct />} />
                <Route path='/admin/product/import/:id' element={<ImportProduct />} />
            </Route>

            {/* Sai đường dẫn */}
            <Route path='*' element={<Error404 />} />

        </Routes>
    )
}

export default ListRouter;