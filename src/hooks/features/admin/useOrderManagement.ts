import { useState, useEffect } from "react";
import { getAllOrdersAdmin, updateOrderStatusAdmin } from "../../../services/admin.service";

export interface DisplayOrder {
    id: string;
    customer: string;
    phone: string;
    date: string;
    total: number;
    status: string;
    payment: string;
    paymentStatus: string;
    cancelRequest: boolean;
}

export interface RawOrder {
    _id: string;
    user?: { fullname?: string; phone?: string };
    createdAt: string;
    totalAmount: number;
    orderStatus: string;
    paymentMethod: string;
    paymentStatus: string;
    cancelRequest?: boolean;
    [key: string]: unknown; // Cho phép các thuộc tính khác khi xem chi tiết
}

export const useOrderManagement = () => {
    const [orders, setOrders] = useState<DisplayOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [rawOrders, setRawOrders] = useState<RawOrder[]>([]);
    const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<RawOrder | null>(null);

    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const data = await getAllOrdersAdmin();
                setRawOrders(data);
                const formattedData: DisplayOrder[] = data.map((order: RawOrder) => ({
                    id: order._id,
                    customer: order.user?.fullname || 'N/A',
                    phone: order.user?.phone || 'N/A',
                    date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
                    total: order.totalAmount,
                    status: order.orderStatus,
                    payment: order.paymentMethod.toUpperCase(),
                    paymentStatus: order.paymentStatus,
                    cancelRequest: order.cancelRequest || false,
                }));
                setOrders(formattedData);
            } catch (error: unknown) {
                setAlertMessage({ text: (error as Error).message || "Không thể tải danh sách đơn hàng.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const filteredOrders = orders.filter(order => {
        const matchSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            order.customer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === "all" || 
                            (statusFilter === "cancel_request" ? order.cancelRequest === true : order.status === statusFilter);
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const updateOrderStatus = (id: string, status: string) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    const updateCancelRequest = (id: string, cancelRequest: boolean) => setOrders(prev => prev.map(o => o.id === id ? { ...o, cancelRequest } : o));

    const handleStatusChange = async (id: string, newStatus: string) => {
        if (newStatus === "cancelled") setOrderToCancel(id);
        else {
            try {
                await updateOrderStatusAdmin(id, newStatus);
                updateOrderStatus(id, newStatus);
                setAlertMessage({ text: `Đã cập nhật trạng thái đơn hàng #${id.slice(-6)} thành công!`, type: "success" });
                window.dispatchEvent(new Event('adminOrderChanged'));
            } catch (error: unknown) {
                setAlertMessage({ text: (error as Error).message || "Cập nhật trạng thái thất bại.", type: "error" });
            }
        }
    };

    const handleRejectCancel = async (id: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn từ chối yêu cầu hủy đơn này?")) return;
        try {
            await updateOrderStatusAdmin(id, "shipping", true);
            updateCancelRequest(id, false);
            setAlertMessage({ text: `Đã từ chối yêu cầu hủy đơn hàng #${id.slice(-6)}.`, type: "success" });
            window.dispatchEvent(new Event('adminOrderChanged'));
        } catch (error: unknown) {
            setAlertMessage({ text: (error as Error).message || "Từ chối thất bại.", type: "error" });
        }
    };

    const confirmCancel = async () => {
        if (orderToCancel) {
            try {
                await updateOrderStatusAdmin(orderToCancel, "cancelled");
                updateOrderStatus(orderToCancel, "cancelled");
                updateCancelRequest(orderToCancel, false);
                setAlertMessage({ text: `Đã hủy đơn hàng #${orderToCancel.slice(-6)}.`, type: "success" });
                window.dispatchEvent(new Event('adminOrderChanged'));
            } catch (error: unknown) {
                setAlertMessage({ text: (error as Error).message || "Hủy đơn hàng thất bại.", type: "error" });
            } finally {
                setOrderToCancel(null);
            }
        }
    };

    const handleViewDetails = (id: string) => {
        const order = rawOrders.find(o => o._id === id);
        if (order) setSelectedOrderDetails(order);
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "pending": return "badge-warning";
            case "shipping": return "badge-info";
            case "delivered": return "badge-success";
            case "cancelled": return "badge-danger";
            default: return "badge-secondary";
        }
    };

    const getPaymentStatusText = (status: string) => {
        switch (status) {
            case 'paid': return 'Đã thanh toán';
            case 'unpaid': return 'Chưa thanh toán';
            case 'refunded': return 'Đã hoàn tiền';
            case 'refund_failed': return 'Lỗi hoàn tiền';
            case 'payment_failed': return 'Thất bại';
            case 'paid_on_delivery': return 'Thanh toán khi nhận';
            default: return '';
        }
    };

    const getPaginationGroup = () => {
        const pages = [];
        if (totalPages <= 5) for (let i = 1; i <= totalPages; i++) pages.push(i);
        else {
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

    return {
        searchTerm, handleSearchChange, statusFilter, handleFilterChange, isLoading, currentOrders,
        formatCurrency, getPaymentStatusText, orderToCancel, setOrderToCancel, confirmCancel, handleStatusChange,
        getStatusBadgeClass, handleViewDetails, handleRejectCancel, alertMessage, setAlertMessage, getAlertTitle,
        totalPages, currentPage, setCurrentPage, getPaginationGroup, selectedOrderDetails, setSelectedOrderDetails
    };
};