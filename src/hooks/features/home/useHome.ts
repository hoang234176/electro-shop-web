import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProductsSaleTop, getNewProducts } from "../../../services/product.service";
import { FiSmartphone, FiMonitor, FiHeadphones, FiWatch, FiTv } from 'react-icons/fi';
import { TbPlug } from 'react-icons/tb';
import { type ProductCardItem } from "../../../types/product.types";

export const useHome = () => {
    const navigate = useNavigate(); //Khai báo navigate để điều hướng 

    const [newProducts, setNewProducts] = useState<ProductCardItem[]>([]);
    const [productsSaleTop, setProductsSaleTop] = useState<ProductCardItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            setIsLoading(true);
            try {
                const [newProductsData, productsSaleTopData] = await Promise.all([
                    getNewProducts(),
                    getProductsSaleTop(),
                ]);
                setNewProducts(newProductsData);
                setProductsSaleTop(productsSaleTopData);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu trang chủ:", err);
                navigate('/error500'); // Chuyển hướng sang trang lỗi 500
            } finally {
                setIsLoading(false);
            }
        };
        fetchHomeData();
    }, [navigate]);

    const categories = [
        { id: 1, name: "Điện thoại", Icon: FiSmartphone },
        { id: 2, name: "Laptop", Icon: FiMonitor },
        { id: 3, name: "Tai nghe", Icon: FiHeadphones },
        { id: 4, name: "Đồng hồ", Icon: FiWatch },
        { id: 5, name: "Phụ kiện", Icon: TbPlug },
        { id: 6, name: "Màn hình", Icon: FiTv },
    ];

    return { navigate, newProducts, productsSaleTop, isLoading, categories };
};