import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getInfoProfile } from "../../../services/user.service";
import { createOrder } from "../../../services/order.service";

export interface CheckoutItem {
    productId: string;
    color: string;
    quantity: number;
    price: number;
    name: string;
    imageUrl: string;
    compositeId: string;
}

export interface ShippingInfo {
    fullName: string;
    phone: string;
    address: string;
    note: string;
}

export const useCheckout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const checkoutItems: CheckoutItem[] = useMemo(() => location.state?.selectedItems || [], [location.state?.selectedItems]);

    useEffect(() => {
        if (checkoutItems.length === 0) {
            navigate("/cart");
        }
    }, [checkoutItems, navigate]);
    
    const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
        fullName: "",
        phone: "",
        address: "",
        note: ""
    });

    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [alertMessage, setAlertMessage] = useState<{text: string, type: "success" | "warning" | "error"} | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdOrderRef = useRef<any>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const user = await getInfoProfile();
                if (user) {
                    setShippingInfo(prev => ({
                        ...prev,
                        fullName: user.fullname || prev.fullName,
                        phone: user.phone || prev.phone,
                        address: user.address || prev.address
                    }));
                }
            } catch (error) {
                console.error("Lỗi khi tự động điền thông tin người dùng:", error);
            }
        };
        
        fetchUserProfile();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const subtotal = checkoutItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const shippingFee = 30000;
    const totalAmount = subtotal + shippingFee;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async () => {
        if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
            setAlertMessage({ text: "Vui lòng điền đầy đủ thông tin giao hàng!", type: "warning" });
            return;
        }
        
        setIsProcessing(true);
        try {
            const orderData = {
                items: checkoutItems.map(item => ({ product: item.productId, color: item.color, quantity: item.quantity, price: item.price })),
                shippingInfo, paymentMethod, subtotal, shippingFee, totalAmount
            };
            const response = await createOrder(orderData);
            window.dispatchEvent(new Event('cartUpdated'));
            if (paymentMethod === 'vnpay' && response.payUrl) {
                if (response.payUrl.startsWith('http')) {
                    setAlertMessage({ text: "Đang chuyển hướng đến cổng thanh toán VNPay...", type: "success" });
                    window.location.href = response.payUrl;
                } else {
                    setAlertMessage({ text: "Hệ thống chưa cấu hình URL thanh toán VNPay.", type: "error" });
                }
            } else {
                createdOrderRef.current = response.order;
                setAlertMessage({ text: "Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại ElectroShop.", type: "success" });
            }
        } catch (error: unknown) {
            setAlertMessage({ text: (error as Error).message || "Đã xảy ra lỗi khi đặt hàng.", type: "error" });
        } finally { setIsProcessing(false); }
    };

    const handleAlertClose = () => {
        if (alertMessage?.type === "success" && paymentMethod !== 'vnpay') { setAlertMessage(null); navigate("/invoice", { state: { checkoutItems, shippingInfo, paymentMethod, totalAmount, subtotal, shippingFee, orderId: createdOrderRef.current?._id } }); } else { setAlertMessage(null); }
    };
    const getAlertTitle = (): "THÔNG BÁO" | "CẢNH BÁO" | "LỖI" => alertMessage?.type === 'warning' ? "CẢNH BÁO" : alertMessage?.type === 'error' ? "LỖI" : "THÔNG BÁO";
    return { checkoutItems, shippingInfo, paymentMethod, setPaymentMethod, alertMessage, isProcessing, formatCurrency, subtotal, shippingFee, totalAmount, handleInputChange, handlePlaceOrder, handleAlertClose, getAlertTitle };
};