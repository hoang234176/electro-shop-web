import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyVNPayReturn } from "../../../services/order.service";
import { type OrderData } from "../../../types/order.types";

interface PopulatedVariant {
    color: string;
    image?: string;
}

interface PopulatedOrderItem {
    product?: {
        _id: string;
        name: string;
        variants?: PopulatedVariant[];
    };
    color: string;
    price: number;
    quantity: number;
}

export const useInvoice = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const stateData = location.state;
    
    const queryParams = new URLSearchParams(location.search);
    const isVNPayReturn = queryParams.has('vnp_TxnRef');
    const vnpAmount = queryParams.get('vnp_Amount');

    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stateData && !isVNPayReturn) {
            navigate("/");
            return;
        }

        if (stateData) {
            setOrderData({
                checkoutItems: stateData.checkoutItems || [],
                shippingInfo: stateData.shippingInfo || {},
                paymentMethod: stateData.paymentMethod || "cod",
                totalAmount: stateData.totalAmount || 0,
                subtotal: stateData.subtotal || 0,
                shippingFee: stateData.shippingFee || 0,
                orderId: stateData.orderId || "",
                isSuccess: true
            });
        } else if (isVNPayReturn) {
            const verifyVNPayTransaction = async () => {
                setIsLoading(true);
                try {
                    const queryString = window.location.search; 
                    const response = await verifyVNPayReturn(queryString);

                    if (response.isSuccess && response.order) {
                        const order = response.order;
                        const items = order.items.map((item: PopulatedOrderItem) => ({
                            productId: item.product?._id || '',
                            name: item.product?.name || 'Sản phẩm',
                            color: item.color,
                            price: item.price,
                            quantity: item.quantity,
                            imageUrl: item.product?.variants?.find((v: PopulatedVariant) => v.color === item.color)?.image || 'https://via.placeholder.com/150',
                            compositeId: `${item.product?._id}_${item.color}`
                        }));

                        setOrderData({ 
                            checkoutItems: items, 
                            shippingInfo: order.shippingInfo || {}, 
                            paymentMethod: order.paymentMethod || "vnpay", 
                            totalAmount: order.totalAmount || (vnpAmount ? parseInt(vnpAmount) / 100 : 0), 
                            subtotal: order.subtotal || 0, 
                            shippingFee: order.shippingFee || 0, 
                            orderId: order._id || "", 
                            isSuccess: true 
                        });
                    } else {
                        // Thanh toán thất bại hoặc chữ ký không hợp lệ
                        const items = response.order ? response.order.items.map((item: PopulatedOrderItem) => ({
                            productId: item.product?._id || '',
                            name: item.product?.name || 'Sản phẩm',
                            color: item.color,
                            price: item.price,
                            quantity: item.quantity,
                            imageUrl: item.product?.variants?.find((v: PopulatedVariant) => v.color === item.color)?.image || 'https://via.placeholder.com/150',
                            compositeId: `${item.product?._id}_${item.color}`
                        })) : [];
                        
                        navigate("/checkout", { state: { selectedItems: items }, replace: true });
                    }
                } catch (error) {
                    console.error("Lỗi khi xác minh giao dịch:", error);
                    navigate("/cart", { replace: true });
                } finally { setIsLoading(false); }
            };
            verifyVNPayTransaction();
        }
    }, [stateData, isVNPayReturn, navigate, vnpAmount]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const displayPaymentMethod = orderData?.paymentMethod === 'vnpay' ? 'Thanh toán qua VNPay' : 'Thanh toán khi nhận hàng (COD)';
    const displayDate = new Date().toLocaleDateString("vi-VN");

    return { stateData, isVNPayReturn, orderData, isLoading, formatCurrency, displayPaymentMethod, displayDate };
};