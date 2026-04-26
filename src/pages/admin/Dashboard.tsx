import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import "./Dashboard.css";
import Loading from "../../component/ui/Loading";
import { FiDollarSign, FiPackage, FiTrendingUp, FiTag } from 'react-icons/fi'; 
import { useDashboardState } from '../../hooks/features/admin/useDashboardState';

// Màu sắc cho biểu đồ tròn tương ứng với trạng thái đơn hàng
const COLORS = ['#16a34a', '#2563eb', '#d97706', '#ef4444'];

function Dashboard() {
    const {
        timeFilter,
        setTimeFilter,
        isLoading,
        stats,
        orderStatusData,
        getRevenueData
    } = useDashboardState();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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