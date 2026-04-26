import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getUserOrders, cancelOrder } from "../../../services/order.service";
import { type AlertProps } from "../../../component/ui/Alert";
import { FiClock, FiTruck, FiCheckCircle, FiXCircle } from "react-icons/fi";
import React from "react";

export interface OrderVariant {
    color: string;
    image?: string;
}

export interface OrderProduct {
    _id?: string;
    name?: string;
    variants?: OrderVariant[];
}

export interface OrderItem {
    _id?: string;
    product?: OrderProduct;
    color?: string;
    price: number;
    quantity: number;
}

export interface ApiOrder {
    _id: string;
    createdAt: string | Date;
    totalAmount: number;
    orderStatus: string;
    paymentMethod: string;
    paymentStatus: string;
    cancelRequest?: boolean;
    items: OrderItem[];
}

export interface DisplayOrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

export interface DisplayOrder {
    id: string;
    displayId: string;
    status: string;
    date: string;
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    cancelRequest: boolean;
    items: DisplayOrderItem[];
}

export const useOrders = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const statusFilter = queryParams.get("status");

    const [orders, setOrders] = useState<DisplayOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState<AlertProps>({ show: false, type: 'info', message: '', title: '' });

    const [orderToCancelId, setOrderToCancelId] = useState<string | null>(null);
    const [isRequestingCancel, setIsRequestingCancel] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 3;

    const isLoggedIn = !!localStorage.getItem("token");

    useEffect(() => { setCurrentPage(1); }, [statusFilter]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!isLoggedIn) return;
            setIsLoading(true);
            try {
                const data = await getUserOrders();
                const validOrders = data.filter((order: ApiOrder) => !(order.paymentMethod === 'vnpay' && order.paymentStatus === 'unpaid'));
                const formattedOrders: DisplayOrder[] = validOrders.map((order: ApiOrder) => ({
                    id: order._id, displayId: order._id.slice(-6).toUpperCase(), status: order.orderStatus,
                    date: new Date(order.createdAt).toLocaleDateString('vi-VN'), total: order.totalAmount,
                    paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus, cancelRequest: order.cancelRequest || false,
                    items: order.items.map((item: OrderItem) => {
                        const product = item.product || {};
                        const variant = product.variants?.find((v: OrderVariant) => v.color === item.color);
                        const imageUrl = variant?.image || product.variants?.[0]?.image || 'https://via.placeholder.com/150?text=No+Image';
                        return { id: product._id || item._id || '', name: `${product.name || 'Sản phẩm đã bị xóa'} - Bản màu ${item.color}`, price: item.price, quantity: item.quantity, imageUrl: imageUrl };
                    })
                }));
                setOrders(formattedOrders);
            } catch (error) { console.error("Lỗi lấy danh sách đơn hàng:", error); } finally { setIsLoading(false); }
        };
        fetchOrders();
    }, [isLoggedIn]);

    const filteredOrders = statusFilter ? orders.filter(order => order.status === statusFilter) : orders;
    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentOrdersToDisplay = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const getPaginationGroup = () => {
        const pages = [];
        if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); } 
        else {
            if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
            else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
        return pages;
    };

    const getStatusInfo = (status: string) => {
        switch(status) {
            case 'pending': return { text: 'Chờ lấy hàng', icon: React.createElement(FiClock, {size: 16}), color: '#d97706', bg: '#fef3c7' };
            case 'shipping': return { text: 'Đang giao hàng', icon: React.createElement(FiTruck, {size: 16}), color: '#2563eb', bg: '#eff6ff' };
            case 'delivered': return { text: 'Đã giao thành công', icon: React.createElement(FiCheckCircle, {size: 16}), color: '#16a34a', bg: '#dcfce3' };
            case 'cancelled': return { text: 'Đã hủy', icon: React.createElement(FiXCircle, {size: 16}), color: '#dc2626', bg: '#fee2e2' };
            default: return { text: 'Không xác định', icon: null, color: '#4b5563', bg: '#f3f4f6' };
        }
    };

    const getPaymentMethodInfo = (method: string, status: string) => {
        let statusText = '';
        if (status === 'paid') statusText = ' (Đã thanh toán)'; else if (status === 'unpaid') statusText = ' (Chưa thanh toán)'; else if (status === 'refunded') statusText = ' (Đã hoàn tiền)'; else if (status === 'refund_failed') statusText = ' (Lỗi hoàn tiền)'; else if (status === 'payment_failed') statusText = ' (Thanh toán thất bại)';
        switch(method) { case 'cod': return 'Thanh toán khi nhận hàng'; case 'vnpay': return `Thanh toán qua VNPay${statusText}`; default: return 'Chưa xác định'; }
    };

    const handleCancelClick = (orderId: string, isRequesting: boolean = false) => { setOrderToCancelId(orderId); setIsRequestingCancel(isRequesting); };

    const handleConfirmCancel = async () => {
        if (!orderToCancelId) return;
        try {
            await cancelOrder(orderToCancelId);
            setAlert({ show: true, type: 'success', title: 'THÔNG BÁO', message: isRequestingCancel ? 'Đã gửi yêu cầu hủy đơn đến quản trị viên' : 'Đã hủy đơn hàng thành công' });
            setOrders(prevOrders => prevOrders.map(order => order.id === orderToCancelId ? (isRequestingCancel ? { ...order, cancelRequest: true } : { ...order, status: 'cancelled' }) : order));
            window.dispatchEvent(new Event('orderStatusChanged'));
        } catch (error: unknown) { setAlert({ show: true, type: 'error', title: 'LỖI', message: (error as Error).message || 'Lỗi khi hủy đơn hàng' }); } finally { setOrderToCancelId(null); }
    };

    const pageTitle = statusFilter ? getStatusInfo(statusFilter).text : "Tất cả đơn hàng";
    return { alert, setAlert, orderToCancelId, setOrderToCancelId, isRequestingCancel, handleConfirmCancel, pageTitle, isLoading, filteredOrders, currentOrdersToDisplay, getStatusInfo, getPaymentMethodInfo, formatCurrency, handleCancelClick, totalPages, currentPage, setCurrentPage, getPaginationGroup, isLoggedIn };
};