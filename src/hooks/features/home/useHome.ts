import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts, getNewProducts } from "../../../services/product.service";
import { FiSmartphone, FiMonitor, FiHeadphones, FiWatch, FiTv } from 'react-icons/fi';
import { TbPlug } from 'react-icons/tb';

export interface Product {
    _id: string;
    name: string;
    price: number;
    variants: { image?: string; quantity?: number }[];
    rating?: number;
    reviewCount?: number;
}

export const useHome = () => {
    const navigate = useNavigate();
    const [isNavigating, setIsNavigating] = useState(false);

    const [newProducts, setNewProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHomeData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [newProductsData, allProductsData] = await Promise.all([
                    getNewProducts(),
                    getAllProducts(),
                ]);
                setNewProducts(newProductsData);
                setAllProducts(allProductsData);
            } catch (err: unknown) {
                console.error("Lỗi khi tải dữ liệu trang chủ:", err);
                setError("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    const handleProductClick = (e: React.MouseEvent, productId: string) => {
        e.preventDefault(); setIsNavigating(true); setTimeout(() => { setIsNavigating(false); navigate(`/product/${productId}`); }, 800);
    };

    const categories = [
        { id: 1, name: "Điện thoại", Icon: FiSmartphone },
        { id: 2, name: "Laptop", Icon: FiMonitor },
        { id: 3, name: "Tai nghe", Icon: FiHeadphones },
        { id: 4, name: "Đồng hồ", Icon: FiWatch },
        { id: 5, name: "Phụ kiện", Icon: TbPlug },
        { id: 6, name: "Màn hình", Icon: FiTv },
    ];

    return { navigate, isNavigating, newProducts, allProducts, isLoading, error, categories, handleProductClick };
};