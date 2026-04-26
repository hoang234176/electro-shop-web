import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllProducts } from "../../../services/product.service";

export interface ProductVariant {
    quantity?: number;
    image?: string;
}

export interface ApiProduct {
    _id: string;
    name: string;
    price: number;
    brand?: { name?: string } | string;
    category?: { name?: string } | string;
    variants?: ProductVariant[];
    rating?: number;
    reviewCount?: number;
}

export interface DisplayProduct {
    id: string;
    brand: string;
    category: string;
    name: string;
    price: number;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    isOutOfStock: boolean;
}

export const useCategory = () => {
    const categories = ["Điện thoại", "Laptop", "Tai nghe", "Đồng hồ", "Phụ kiện", "Màn hình"];
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const navigate = useNavigate();
    const [isNavigating, setIsNavigating] = useState(false);
    const categoryFromUrl = query.get("name");

    const [selectedCategories, setSelectedCategories] = useState<string[]>(() => categoryFromUrl ? [categoryFromUrl] : []);
    const [priceRange, setPriceRange] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("default");

    const [allProducts, setAllProducts] = useState<DisplayProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategories, priceRange, sortBy]);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const data = await getAllProducts();
                const formattedData: DisplayProduct[] = data.map((p: ApiProduct) => {
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
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        let products = [...allProducts];
        if (selectedCategories.length > 0) products = products.filter((p) => selectedCategories.includes(p.category));
        
        products = products.filter((p) => {
            switch (priceRange) {
                case "under-10m": return p.price < 10000000;
                case "10m-20m": return p.price >= 10000000 && p.price <= 20000000;
                case "over-20m": return p.price > 20000000;
                default: return true;
            }
        });

        return [...products].sort((a, b) => {
            switch (sortBy) {
                case "price-asc": return a.price - b.price;
                case "price-desc": return b.price - a.price;
                default: return a.id.localeCompare(b.id);
            }
        });
    }, [allProducts, selectedCategories, priceRange, sortBy]);

    const handleCategoryChange = (category: string) => setSelectedCategories((prev) => prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]);

    const handleProductClick = (e: React.MouseEvent, productId: string) => { e.preventDefault(); setIsNavigating(true); setTimeout(() => { setIsNavigating(false); navigate(`/product/${productId}`); }, 800); };

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentProductsToDisplay = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

    return { categories, isNavigating, selectedCategories, priceRange, setPriceRange, sortBy, setSortBy, isLoading, currentProductsToDisplay, handleCategoryChange, handleProductClick, currentPage, setCurrentPage, totalPages, getPaginationGroup };
};