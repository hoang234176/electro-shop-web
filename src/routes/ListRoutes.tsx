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
import TestUI from "../test/TestUI";


function ListRouter(){
    return (
        <Routes>
            {/* home */}
            <Route path='/' element={<Home />} />

            {/* auth */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* admin */}
            <Route path='/admin/dashboard' element={<Dashboard />} />

            {/* cart */}
            <Route path='/cart' element={<Cart />} />

            {/* error */}
            <Route path='/error403' element={<Error403 />} />
            <Route path='/error404' element={<Error404 />} />
            <Route path='/error500' element={<Error500 />} />

            {/* product */}
            <Route path='/product' element={<ProductDetail />} />

            {/* user */}
            <Route path='/user/info' element={<InfoUser />} />
            <Route path='/user/edit' element={<EditUser />} />

            {/* test */}
            <Route path='test' element={<TestUI />} />
        </Routes>
    )
}

export default ListRouter;