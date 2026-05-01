import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../../../services/product.service";
import { type ApiProduct, type DisplayProduct, type ProductVariant } from "../../../types/product.types";

export const useAllProducts = () => {
    const categories = ["Điện thoại", "Laptop", "Tai nghe", "Đồng hồ", "Phụ kiện", "Màn hình"];
    const brands = ["Apple", "Samsung", "Sony", "Dell", "LG", "Google"];

    const navigate = useNavigate();

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("default");

    const [allProducts, setAllProducts] = useState<DisplayProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 9;

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategories, selectedBrands, priceRange, sortBy]);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                // Khởi tạo object chứa các điều kiện lọc hiện tại để gửi lên API
                const filters: Record<string, string | number> = {};
                if (selectedCategories.length > 0) filters.category = selectedCategories.join(',');
                if (selectedBrands.length > 0) filters.brand = selectedBrands.join(',');
                if (priceRange !== "all") filters.priceRange = priceRange;
                if (sortBy !== "default") filters.sortBy = sortBy;
                filters.page = currentPage;
                filters.limit = ITEMS_PER_PAGE;

                const data = await getAllProducts(filters);
                
                // Lấy mảng products từ kết quả API mới (kèm fallback nếu API cũ)
                const productsList = data.products || data;
                
                const formattedData: DisplayProduct[] = productsList.map((p: ApiProduct) => {
                    const brandName = typeof p.brand === 'object' ? p.brand?.name : p.brand;
                    const categoryName = typeof p.category === 'object' ? p.category?.name : p.category;
                    return {
                        id: p._id, brand: brandName || 'Unknown', category: categoryName || 'Unknown',
                        name: p.name, price: p.price, imageUrl: p.variants?.[0]?.image || 'https://via.placeholder.com/300?text=No+Image',
                        rating: p.rating || 0, reviewCount: p.reviewCount || 0,
                        isOutOfStock: (p.variants?.reduce((sum: number, v: ProductVariant) => sum + (v.quantity || 0), 0) || 0) <= 0
                    };
                });
                setAllProducts(formattedData);
                
                // Lưu tổng số trang từ Backend trả về
                if (data.totalPages) {
                    setTotalPages(data.totalPages);
                }
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
                navigate('/error500');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    // Khai báo các dependencies: mỗi khi các biến này thay đổi, useEffect sẽ chạy lại và fetch API mới
    }, [selectedCategories, selectedBrands, priceRange, sortBy, currentPage, navigate]);

    const handleCategoryChange = (category: string) => setSelectedCategories((prev) => prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]);
    const handleBrandChange = (brand: string) => setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);

    const currentProductsToDisplay = allProducts;

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

    return { 
        categories, 
        brands, 
        selectedCategories, 
        selectedBrands, 
        priceRange, 
        setPriceRange, 
        sortBy, 
        setSortBy, 
        isLoading, 
        currentProductsToDisplay, 
        handleCategoryChange, 
        handleBrandChange, 
        currentPage, 
        setCurrentPage, 
        totalPages, 
        getPaginationGroup 
    };
};