import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllProducts } from "../../../services/product.service";
import { deleteProduct } from "../../../services/admin.service";

export interface DisplayProduct {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    imageUrl: string;
}

export interface ApiProductVariant {
    quantity: number;
    image?: string;
}

export interface ApiProduct {
    _id: string;
    name: string;
    category?: { name: string };
    price: number;
    variants: ApiProductVariant[];
}

export const useProductManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<DisplayProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const data = await getAllProducts();
                const displayData: DisplayProduct[] = data.map((p: ApiProduct) => ({
                    id: p._id,
                    name: p.name,
                    category: p.category?.name || 'N/A',
                    price: p.price,
                    stock: p.variants.reduce((sum: number, v: ApiProductVariant) => sum + v.quantity, 0),
                    imageUrl: p.variants.length > 0 && p.variants[0].image ? p.variants[0].image : 'https://via.placeholder.com/150?text=No+Image'
                }));
                setProducts(displayData);
            } catch (error) {
                console.error("Lỗi khi tải danh sách sản phẩm:", error);
                setAlertMessage({ text: "Không thể tải danh sách sản phẩm từ máy chủ.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [location]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleDeleteClick = (id: string) => setProductToDelete(id);

    const confirmDelete = async () => {
        if (productToDelete !== null) {
            try {
                const response = await deleteProduct(productToDelete);
                setProducts(products.filter(p => p.id !== productToDelete));
                setAlertMessage({ text: response.message || "Xóa sản phẩm thành công!", type: "success" });
            } catch (error: unknown) {
                setAlertMessage({ text: (error as Error).message || "Xóa sản phẩm thất bại. Vui lòng thử lại.", type: "error" });
            } finally {
                setProductToDelete(null);
            }
        }
    };

    const cancelDelete = () => setProductToDelete(null);

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const getPaginationGroup = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
            else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
        return pages;
    };

    const getAlertTitle = (): "THÔNG BÁO" | "CẢNH BÁO" | "LỖI" => {
        if (alertMessage?.type === 'warning') return "CẢNH BÁO";
        if (alertMessage?.type === 'error') return "LỖI";
        return "THÔNG BÁO";
    };

    const productBeingDeleted = products.find(p => p.id === productToDelete);

    return {
        navigate, searchTerm, handleSearchChange, isLoading, currentProducts,
        formatCurrency, handleDeleteClick, productToDelete, productBeingDeleted,
        cancelDelete, confirmDelete, alertMessage, setAlertMessage, getAlertTitle,
        totalPages, currentPage, setCurrentPage, getPaginationGroup
    };
};