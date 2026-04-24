import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import "./Dashboard.css";
import { getAllOrdersAdmin } from "../../services/admin.service";
import { getAllProducts } from "../../services/product.service";
import Loading from "../../component/ui/Loading";
import { FiDollarSign, FiPackage, FiTrendingUp, FiTag } from 'react-icons/fi'; 

// Màu sắc cho biểu đồ tròn tương ứng với trạng thái đơn hàng
const COLORS = ['#16a34a', '#2563eb', '#d97706', '#ef4444'];

function Dashboard() {
    const [timeFilter, setTimeFilter] = useState<'month' | 'quarter' | 'year'>('month');
    const [isLoading, setIsLoading] = useState(true);

    // Các State chứa dữ liệu thật
    const [stats, setStats] = useState({ totalRevenue: 0, totalSold: 0, totalProfit: 0, totalCost: 0 });
    const [revenueByMonth, setRevenueByMonth] = useState<any[]>([]);
    const [revenueByQuarter, setRevenueByQuarter] = useState<any[]>([]);
    const [revenueByYear, setRevenueByYear] = useState<any[]>([]);
    const [orderStatusData, setOrderStatusData] = useState<any[]>([]);

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
                products.forEach((p: any) => {
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

                orders.forEach((order: any) => {
                    // Đếm trạng thái đơn hàng
                    const status = order.orderStatus as keyof typeof statusCount;
                    if (statusCount[status] !== undefined) {
                        statusCount[status]++;
                    }

                    // Chỉ tính doanh thu & lợi nhuận cho các đơn hàng không bị hủy
                    if (order.orderStatus !== 'cancelled') {
                        const date = new Date(order.createdAt);
                        const orderYear = date.getFullYear();
                        const orderMonth = date.getMonth(); // 0 - 11
                        const orderQuarter = Math.floor(orderMonth / 3);

                        let orderCost = 0;
                        let orderSold = 0;

                        order.items?.forEach((item: any) => {
                            const productId = String(item.product?._id || item.product?.id || item.product);
                            // Lấy giá nhập trực tiếp từ sản phẩm (nếu có) hoặc từ bản đồ (Map)
                            const importPrice = Number(item.product?.importPrice) || importPriceMap[productId] || 0;
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getRevenueData = () => {
        switch (timeFilter) {
            case 'quarter': return revenueByQuarter;
            case 'year': return revenueByYear;
            case 'month':
            default: return revenueByMonth;
        }
    };

    return (
        <div className="admin-page-container dashboard-wrapper">
            {/* Loading che toàn màn hình khi đang lấy số liệu thống kê */}
            {isLoading && <Loading fullScreen={true} text="Đang phân tích số liệu thống kê..." />}

            <div className="admin-page-header" style={{ marginBottom: 0 }}>
                <h1 className="admin-page-title">Bảng điều khiển Tổng quan</h1>
            </div>

            {/* --- KHỐI THỐNG KÊ (KPI CARDS) --- */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-info">
                        <span className="kpi-title">Tổng Doanh Thu</span>
                        <h3 className="kpi-value">{isLoading ? "..." : formatCurrency(stats.totalRevenue)}</h3>
                        <span className="kpi-trend" style={{ color: '#6b7280' }}>Cập nhật tự động</span>
                    </div>
                    <div className="kpi-icon" style={{ backgroundColor: '#ecfeff', color: '#3b82f6' }}>
                        <FiDollarSign />
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-info">
                        <span className="kpi-title">Giá Vốn (Hàng đã bán)</span>
                        <h3 className="kpi-value">{isLoading ? "..." : formatCurrency(stats.totalCost)}</h3>
                        <span className="kpi-trend" style={{ color: '#6b7280' }}>Cập nhật tự động</span>
                    </div>
                    <div className="kpi-icon" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                        <FiPackage />
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-info">
                        <span className="kpi-title">Tổng Lợi Nhuận</span>
                        <h3 className="kpi-value">{isLoading ? "..." : formatCurrency(stats.totalProfit)}</h3>
                        <span className="kpi-trend" style={{ color: '#6b7280' }}>Cập nhật tự động</span>
                    </div>
                    <div className="kpi-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                        <FiTrendingUp />
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-info">
                        <span className="kpi-title">Sản Phẩm Đã Bán</span>
                        <h3 className="kpi-value">{isLoading ? "..." : stats.totalSold}</h3>
                        <span className="kpi-trend" style={{ color: '#6b7280' }}>Cập nhật tự động</span>
                    </div>
                    <div className="kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
                        <FiTag />
                    </div>
                </div>
            </div>

            {/* --- KHỐI BIỂU ĐỒ (CHARTS) --- */}
            <div className="charts-grid">
                {/* Biểu đồ cột: Doanh thu */}
                <div className="chart-card chart-col-span-2">
                    <div className="chart-header-row">
                        <h3 className="chart-title" style={{ marginBottom: 0 }}>Thống kê Doanh thu</h3>
                        <select 
                            className="chart-filter-select"
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value as 'month' | 'quarter' | 'year')}
                        >
                            <option value="month">Theo tháng (Năm nay)</option>
                            <option value="quarter">Theo quý (Năm nay)</option>
                            <option value="year">Theo năm</option>
                        </select>
                    </div>
                    <div className="chart-container scrollable-x">
                        <div className="chart-min-width">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getRevenueData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13 }} dy={10} />
                                    <YAxis 
                                        tickFormatter={(value: number) => `${value / 1000000}M`} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6b7280', fontSize: 13 }} 
                                        dx={-10}
                                    />
                                    <RechartsTooltip 
                                        formatter={(value) => formatCurrency(value as number)}
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                                    />
                                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                                    
                                    {/* Đường ranh giới gốc 0 để hiển thị rõ cột lợi nhuận nếu bị âm */}
                                    <ReferenceLine y={0} stroke="#6b7280" />
                                    
                                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} name="Doanh thu" />
                                    <Bar dataKey="cost" fill="#9ca3af" radius={[4, 4, 0, 0]} maxBarSize={40} name="Vốn nhập" />
                                    <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} name="Lợi nhuận" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bảng Log dữ liệu chi tiết hiển thị trực tiếp trên UI */}
                    <div style={{ marginTop: '32px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Bảng đối chiếu số liệu chi tiết</h4>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Thời khoảng</th>
                                        <th>Doanh thu</th>
                                        <th>Vốn nhập (Chỉ tính hàng đã bán)</th>
                                        <th>Lợi nhuận</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getRevenueData().map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="font-semibold">{row.name}</td>
                                            <td style={{ color: '#3b82f6', fontWeight: 600 }}>{formatCurrency(row.revenue)}</td>
                                            <td style={{ color: '#6b7280' }}>{formatCurrency(row.cost)}</td>
                                            <td style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(row.profit)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Biểu đồ tròn: Trạng thái đơn hàng */}
                <div className="chart-card">
                    <h3 className="chart-title">Tỷ lệ Trạng thái Đơn hàng</h3>
                    <div className="pie-chart-layout">
                        <div className="order-summary-list">
                            {orderStatusData.map((entry, index) => (
                                <div key={`summary-${index}`} className="summary-item">
                                    <div className="summary-item-info">
                                        <span className="summary-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                        <span className="summary-label">{entry.name}</span>
                                    </div>
                                    <span className="summary-value">{entry.value} đơn</span>
                                </div>
                            ))}
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                        {orderStatusData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                        itemStyle={{ color: '#111827', fontWeight: 500 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;