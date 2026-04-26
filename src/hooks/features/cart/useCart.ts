import { useState, useEffect } from "react";
import { getCart, updateCartQuantity, removeFromCart } from "../../../services/cart.service";

export interface DisplayCartItem {
    compositeId: string;
    productId: string;
    color: string;
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
    maxQuantity: number;
}

export interface CartItemVariant {
    color: string;
    image?: string;
    quantity: number;
}

export interface CartItemProduct {
    _id: string;
    name: string;
    price: number;
    variants?: CartItemVariant[];
}

export interface ApiCartItem {
    product: CartItemProduct;
    color: string;
    quantity: number;
}

export const useCart = () => {
    const [cartItems, setCartItems] = useState<DisplayCartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [alertMessage, setAlertMessage] = useState<{text: string, type: 'success' | 'error' | 'warning' | 'info'} | null>(null);

    const isLoggedIn = !!localStorage.getItem("token");

    useEffect(() => {
        const fetchCartData = async () => {
            if (!isLoggedIn) return;
            setIsLoading(true);
            try {
                const cart = await getCart();
                if (cart && cart.items) {
                    const formattedItems: DisplayCartItem[] = cart.items.map((item: ApiCartItem) => {
                        const variant = item.product.variants?.find((v: CartItemVariant) => v.color === item.color);
                        return {
                            compositeId: `${item.product._id}_${item.color}`, productId: item.product._id, color: item.color,
                            name: `${item.product.name} - ${item.color}`, price: item.product.price,
                            imageUrl: variant?.image || 'https://via.placeholder.com/150?text=No+Image',
                            quantity: item.quantity, maxQuantity: variant?.quantity || 0
                        };
                    });
                    setCartItems(formattedItems); setSelectedIds(formattedItems.map(i => i.compositeId));
                }
            } catch (error) { console.error("Lỗi lấy giỏ hàng:", error); } finally { setIsLoading(false); }
        };
        fetchCartData();
    }, [isLoggedIn]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const updateQuantity = async (productId: string, color: string, currentQuantity: number, delta: number, maxQuantity: number) => {
        const newQuantity = currentQuantity + delta;
        if (newQuantity < 1) return;
        if (newQuantity > maxQuantity) return setAlertMessage({ text: `Số lượng sản phẩm trong kho đã hết (chỉ còn tối đa ${maxQuantity} chiếc).`, type: 'warning' });
        try {
            await updateCartQuantity({ productId, color, quantity: newQuantity });
            setCartItems(prev => prev.map(item => (item.productId === productId && item.color === color) ? { ...item, quantity: newQuantity } : item));
        } catch (error: unknown) { setAlertMessage({ text: (error as Error).message || "Lỗi cập nhật số lượng", type: 'error' }); }
    };

    const removeItem = async (productId: string, color: string, compositeId: string) => {
        try {
            await removeFromCart({ productId, color });
            setCartItems(prev => prev.filter(item => item.compositeId !== compositeId)); setSelectedIds(prev => prev.filter(id => id !== compositeId));
            setAlertMessage({ text: "Đã xóa sản phẩm khỏi giỏ hàng", type: 'success' }); window.dispatchEvent(new Event('cartUpdated'));
        } catch (error: unknown) { setAlertMessage({ text: (error as Error).message || "Lỗi xóa sản phẩm", type: 'error' }); }
    };

    const handleToggleSelect = (compositeId: string) => setSelectedIds(prev => prev.includes(compositeId) ? prev.filter(id => id !== compositeId) : [...prev, compositeId]);
    const handleToggleSelectAll = () => setSelectedIds((selectedIds.length === cartItems.length && cartItems.length > 0) ? [] : cartItems.map(item => item.compositeId));

    const handleRemoveSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn khỏi giỏ hàng?`)) return;
        const itemsToRemove = cartItems.filter(item => selectedIds.includes(item.compositeId));
        try {
            await Promise.all(itemsToRemove.map(item => removeFromCart({ productId: item.productId, color: item.color })));
            setCartItems(prev => prev.filter(item => !selectedIds.includes(item.compositeId))); setSelectedIds([]);
            setAlertMessage({ text: `Đã xóa ${itemsToRemove.length} sản phẩm khỏi giỏ hàng`, type: 'success' }); window.dispatchEvent(new Event('cartUpdated'));
        } catch { setAlertMessage({ text: "Có lỗi xảy ra khi xóa một số sản phẩm.", type: 'error' }); }
    };

    const selectedItems = cartItems.filter(item => selectedIds.includes(item.compositeId));
    const totalAmount = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const getAlertTitle = (): "THÔNG BÁO" | "CẢNH BÁO" | "LỖI" => {
        if (alertMessage?.type === 'warning') return "CẢNH BÁO"; if (alertMessage?.type === 'error') return "LỖI"; return "THÔNG BÁO";
    };

    return {
        alertMessage, setAlertMessage, getAlertTitle, selectedIds, cartItems, handleRemoveSelected, isLoading, handleToggleSelectAll,
        formatCurrency, handleToggleSelect, updateQuantity, removeItem, totalAmount, selectedItems, isLoggedIn
    };
};