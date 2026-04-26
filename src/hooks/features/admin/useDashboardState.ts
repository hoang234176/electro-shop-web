import { useState, useEffect } from 'react';
import { getAllOrdersAdmin } from "../../../services/admin.service";
import { getAllProducts } from "../../../services/product.service";

export interface RevenueData {
    name: string;
    revenue: number;
    cost: number;
    profit: number;
}

export interface OrderStatusData {
    name: string;
    value: number;
}

export interface DashboardProduct {
    _id?: string;
    id?: string;
    importPrice?: string | number;
}

export interface DashboardOrderItem {
    product?: DashboardProduct | string;
    quantity?: number | string;
}

export interface DashboardOrder {
    orderStatus?: string;
    createdAt?: string | Date;
    totalAmount?: number | string;
    items?: DashboardOrderItem[];
}

export const useDashboardState = () => {
    const [timeFilter, setTimeFilter] = useState<'month' | 'quarter' | 'year'>('month');
    const [isLoading, setIsLoading] = useState(true);

    // Các State chứa dữ liệu thật
    const [stats, setStats] = useState({ totalRevenue: 0, totalSold: 0, totalProfit: 0, totalCost: 0 });
    const [revenueByMonth, setRevenueByMonth] = useState<RevenueData[]>([]);
    const [revenueByQuarter, setRevenueByQuarter] = useState<RevenueData[]>([]);
    const [revenueByYear, setRevenueByYear] = useState<RevenueData[]>([]);
    const [orderStatusData, setOrderStatusData] = useState<OrderStatusData[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [orders, products] = await Promise.all([
                    getAllOrdersAdmin(),
                    getAllProducts()
                ]);

                // Tạo bản đồ giá nhập của sản phẩm để tính lợi nhuận
                const importPriceMap: Record<string, number> = {};
                products.forEach((p: DashboardProduct) => {
                    const id = String(p._id || p.id);
                    importPriceMap[id] = Number(p.importPrice) || 0;
                });

                let totalRev = 0;
                let totalSoldItems = 0;
                let totalProf = 0;
                let totalCOGS = 0; // Giá vốn hàng bán (Dùng cho biểu đồ)
                let actualTotalImportCost = 0; // Tổng vốn nhập thực tế

                const statusCount = { 'delivered': 0, 'shipping': 0, 'pending': 0, 'cancelled': 0 };
                
                const currentYear = new Date().getFullYear();
                const monthData = Array.from({length: 12}, (_, i) => ({ name: `T${i+1}`, revenue: 0, cost: 0, profit: 0 }));
                const quarterData = Array.from({length: 4}, (_, i) => ({ name: `Quý ${i+1}`, revenue: 0, cost: 0, profit: 0 }));
                const yearDataMap: Record<string, {name: string, revenue: number, cost: number, profit: number}> = {};

                orders.forEach((order: DashboardOrder) => {
                    // Đếm trạng thái đơn hàng
                    const status = order.orderStatus as keyof typeof statusCount;
                    if (statusCount[status] !== undefined) {
                        statusCount[status]++;
                    }

                    // Chỉ tính doanh thu & lợi nhuận cho các đơn hàng không bị hủy
                    if (order.orderStatus !== 'cancelled') {
                        const date = new Date(order.createdAt || new Date());
                        const orderYear = date.getFullYear();
                        const orderMonth = date.getMonth(); // 0 - 11
                        const orderQuarter = Math.floor(orderMonth / 3);

                        let orderCost = 0;
                        let orderSold = 0;

                        order.items?.forEach((item: DashboardOrderItem) => {
                            const productObj = typeof item.product === 'object' ? item.product : undefined;
                            const productId = String(productObj?._id || productObj?.id || item.product);
                            // Lấy giá nhập trực tiếp từ sản phẩm (nếu có) hoặc từ bản đồ (Map)
                            const importPrice = Number(productObj?.importPrice) || importPriceMap[productId] || 0;
                            const qty = Number(item.quantity) || 0;

                            orderSold += qty;
                            orderCost += importPrice * qty;
                        });

                        const orderRevenue = Number(order.totalAmount) || 0;
                        const orderProfit = orderRevenue - orderCost;

                        totalRev += orderRevenue;
                        totalSoldItems += orderSold;
                        totalProf += orderProfit;
                        totalCOGS += orderCost;

                        // Gom nhóm theo năm
                        if (!yearDataMap[orderYear]) {
                            yearDataMap[orderYear] = { name: orderYear.toString(), revenue: 0, cost: 0, profit: 0 };
                        }
                        yearDataMap[orderYear].revenue += orderRevenue;
                        yearDataMap[orderYear].cost += orderCost;
                        yearDataMap[orderYear].profit += orderProfit;

                        // Gom nhóm theo tháng và quý (chỉ lấy dữ liệu của năm hiện tại)
                        if (orderYear === currentYear) {
                            monthData[orderMonth].revenue += orderRevenue;
                            monthData[orderMonth].cost += orderCost;
                            monthData[orderMonth].profit += orderProfit;

                            quarterData[orderQuarter].revenue += orderRevenue;
                            quarterData[orderQuarter].cost += orderCost;
                            quarterData[orderQuarter].profit += orderProfit;
                        }
                    }
                });

                // Gán Tổng Vốn Nhập bằng Giá vốn hàng bán (chỉ tính các sản phẩm đã bán trong đơn hàng thành công)
                actualTotalImportCost = totalCOGS;

                setStats({ totalRevenue: totalRev, totalSold: totalSoldItems, totalProfit: totalProf, totalCost: actualTotalImportCost });
                setRevenueByMonth(monthData);
                setRevenueByQuarter(quarterData);
                setRevenueByYear(Object.values(yearDataMap).sort((a,b) => parseInt(a.name) - parseInt(b.name)));
                
                setOrderStatusData([
                    { name: 'Đã giao', value: statusCount['delivered'] },
                    { name: 'Đang giao', value: statusCount['shipping'] },
                    { name: 'Chờ lấy hàng', value: statusCount['pending'] },
                    { name: 'Đã hủy', value: statusCount['cancelled'] },
                ]);

            } catch (error) {
                console.error("Lỗi tải dữ liệu Dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getRevenueData = () => {
        switch (timeFilter) {
            case 'quarter': return revenueByQuarter;
            case 'year': return revenueByYear;
            case 'month':
            default: return revenueByMonth;
        }
    };

    return {
        timeFilter,
        setTimeFilter,
        isLoading,
        stats,
        orderStatusData,
        getRevenueData
    };
};