import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserOrders, cancelOrder } from "../../../services/order.service";

export interface OrderData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkoutItems: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shippingInfo: any;
    paymentMethod: string;
    totalAmount: number;
    subtotal: number;
    shippingFee: number;
    orderId: string;
    isSuccess: boolean;
}

export const useInvoice = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const stateData = location.state;
    
    const queryParams = new URLSearchParams(location.search);
    const isVNPayReturn = queryParams.has('vnp_TxnRef');
    const vnpResponseCode = queryParams.get('vnp_ResponseCode');
    const vnpTxnRef = queryParams.get('vnp_TxnRef');
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
            const fetchOrderDetails = async () => {
                setIsLoading(true);
                try {
                    const orders = await getUserOrders();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const order = orders.find((o: any) => o._id === vnpTxnRef);
                    if (order) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const items = order.items.map((item: any) => ({
                            productId: item.product?._id || '',
                            name: item.product?.name || 'Sản phẩm',
                            color: item.color,
                            price: item.price,
                            quantity: item.quantity,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            imageUrl: item.product?.variants?.find((v: any) => v.color === item.color)?.image || 'https://via.placeholder.com/150',
                            compositeId: `${item.product?._id}_${item.color}`
                        }));

                        setOrderData({ checkoutItems: items, shippingInfo: order.shippingInfo || {}, paymentMethod: order.paymentMethod || "vnpay", totalAmount: order.totalAmount || (vnpAmount ? parseInt(vnpAmount) / 100 : 0), subtotal: order.subtotal || 0, shippingFee: order.shippingFee || 0, orderId: vnpTxnRef || "", isSuccess: vnpResponseCode === "00" });

                        if (vnpResponseCode !== "00") {
                            try { await cancelOrder(vnpTxnRef as string); } catch (err) { console.error("Lỗi xóa đơn:", err); }
                            navigate("/checkout", { state: { selectedItems: items }, replace: true });
                            return;
                        }
                    } else {
                        if (vnpResponseCode !== "00") { navigate("/cart", { replace: true }); return; }
                        setOrderData({ checkoutItems: [], shippingInfo: {}, paymentMethod: "vnpay", totalAmount: vnpAmount ? parseInt(vnpAmount) / 100 : 0, subtotal: 0, shippingFee: 0, orderId: vnpTxnRef || "", isSuccess: vnpResponseCode === "00" });
                    }
                } catch {
                    setOrderData({ checkoutItems: [], shippingInfo: {}, paymentMethod: "vnpay", totalAmount: vnpAmount ? parseInt(vnpAmount) / 100 : 0, subtotal: 0, shippingFee: 0, orderId: vnpTxnRef || "", isSuccess: vnpResponseCode === "00" });
                } finally { setIsLoading(false); }
            };
            fetchOrderDetails();
        }
    }, [stateData, isVNPayReturn, navigate, vnpTxnRef, vnpAmount, vnpResponseCode]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const displayPaymentMethod = orderData?.paymentMethod === 'vnpay' ? 'Thanh toán qua VNPay' : 'Thanh toán khi nhận hàng (COD)';
    const displayDate = new Date().toLocaleDateString("vi-VN");

    return { stateData, isVNPayReturn, orderData, isLoading, formatCurrency, displayPaymentMethod, displayDate };
};