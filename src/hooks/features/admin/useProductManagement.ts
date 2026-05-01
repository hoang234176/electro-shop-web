import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllProductsAdmin, deleteProduct } from "../../../services/admin.service";
import { type ApiProduct, type ProductVariant } from "../../../types/product.types";
import { type AdminDisplayProduct } from "../../../types/admin.types";

export type DisplayProduct = AdminDisplayProduct;

export const useProductManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<DisplayProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const filters: Record<string, string | number> = {};
                if (searchTerm.trim() !== "") filters.search = searchTerm;
                filters.page = currentPage;
                filters.limit = ITEMS_PER_PAGE;

                const data = await getAllProductsAdmin(filters);
                const productsList = data.products || data;

                const displayData: DisplayProduct[] = productsList.map((p: ApiProduct) => ({
                    id: p._id,
                    name: p.name,
                    category: typeof p.category === 'object' ? p.category?.name || 'N/A' : p.category || 'N/A',
                    price: p.price,
                    stock: p.variants?.reduce((sum: number, v: ProductVariant) => sum + (v.quantity || 0), 0) || 0,
                    imageUrl: p.variants && p.variants.length > 0 && p.variants[0].image ? p.variants[0].image : 'https://via.placeholder.com/150?text=No+Image'
                }));
                setProducts(displayData);
                
                if (data.totalPages) {
                    setTotalPages(data.totalPages);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách sản phẩm:", error);
                setAlertMessage({ text: "Không thể tải danh sách sản phẩm từ máy chủ.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [location, currentPage, searchTerm]);

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

    const currentProducts = products;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
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