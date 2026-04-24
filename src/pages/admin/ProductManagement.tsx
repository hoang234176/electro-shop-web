import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import Alert from "../../component/ui/Alert";
import "./ProductManagement.css";
import { getAllProducts } from "../../services/product.service";
import { deleteProduct } from "../../services/admin.service";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

// Định nghĩa cấu trúc dữ liệu sản phẩm để hiển thị
interface DisplayProduct {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    imageUrl: string;
}

function ProductManagement() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<DisplayProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State lưu ID sản phẩm đang muốn xóa (null nghĩa là không có thông báo nào)
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Lấy dữ liệu sản phẩm từ backend khi component được mount
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const data = await getAllProducts();
                const displayData: DisplayProduct[] = data.map((p: any) => ({
                    id: p._id,
                    name: p.name,
                    category: p.category?.name || 'N/A',
                    price: p.price,
                    stock: p.variants.reduce((sum: number, v: any) => sum + v.quantity, 0),
                    imageUrl: p.variants.length > 0 && p.variants[0].image ? p.variants[0].image : 'https://via.placeholder.com/150?text=No+Image'
                }));
                setProducts(displayData);
            } catch (error) {
                console.error("Lỗi khi tải danh sách sản phẩm:", error);
                setAlertMessage({ text: "Không thể tải danh sách sản phẩm từ máy chủ.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [location]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleDeleteClick = (id: string) => {
        setProductToDelete(id);
    };

    const confirmDelete = async () => {
        if (productToDelete !== null) {
            try {
                const response = await deleteProduct(productToDelete);
                setProducts(products.filter(p => p.id !== productToDelete));
                setAlertMessage({ text: response.message || "Xóa sản phẩm thành công!", type: "success" });
            } catch (error: any) {
                setAlertMessage({ text: error.message || "Xóa sản phẩm thất bại. Vui lòng thử lại.", type: "error" });
            } finally {
                setProductToDelete(null);
            }
        }
    };

    const cancelDelete = () => {
        setProductToDelete(null);
    };

    // Lọc sản phẩm theo tên
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Tính toán dữ liệu hiển thị cho trang hiện tại
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Khi tìm kiếm mới, luôn đưa về trang 1
    };

    // Thuật toán tạo dãy nút phân trang có dấu "..."
    const getPaginationGroup = () => {
        const pages = [];
        if (totalPages <= 5) {
            // Nếu ít hơn 5 trang thì hiển thị tất cả
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const getAlertTitle = (): "THÔNG BÁO" | "CẢNH BÁO" | "LỖI" => {
        if (alertMessage?.type === 'warning') return "CẢNH BÁO";
        if (alertMessage?.type === 'error') return "LỖI";
        return "THÔNG BÁO";
    };
    const productBeingDeleted = products.find(p => p.id === productToDelete);

    return (
        <div className="admin-page-container">
            {/* Thông báo xác nhận xóa */}
            <Alert 
                show={productToDelete !== null} 
                title="CẢNH BÁO" 
                type="warning" 
                message={`Bạn có chắc chắn muốn xóa sản phẩm "${productBeingDeleted?.name}"? Hành động này không thể hoàn tác.`} 
                action={
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <Button variant="secondary" width="100px" height="40px" onClick={cancelDelete}>Hủy</Button>
                        <Button variant="danger" width="100px" height="40px" onClick={confirmDelete}>Xóa</Button>
                    </div>
                } 
            />

            <Alert
                show={alertMessage !== null}
                title={getAlertTitle()}
                type={alertMessage?.type || "info"}
                message={alertMessage?.text || ""}
                action={<Button variant="primary" width="100px" height="40px" onClick={() => setAlertMessage(null)}>Đóng</Button>}
            />

            {/* Header Trang */}
            <div className="admin-page-header">
                <h1 className="admin-page-title">Quản lý Sản phẩm</h1>
                <Button variant="primary" width="180px" height="40px" onClick={() => navigate("/admin/product/add")} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FiPlus size={18} /> Thêm sản phẩm
                </Button>
            </div>

            {/* Thanh công cụ: Tìm kiếm, Lọc */}
            <div className="admin-toolbar">
                <div className="admin-search-bar">
                    <Input 
                        placeholder="Tìm kiếm tên sản phẩm..." 
                        value={searchTerm} 
                        onChange={handleSearchChange} 
                    />
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá bán</th>
                            <th>Tồn kho</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="empty-table-message">Đang tải dữ liệu...</td>
                            </tr>
                        ) : currentProducts.length > 0 ? (
                            currentProducts.map(product => (
                                <tr key={product.id}>
                                    <td>#{product.id.slice(-6).toUpperCase()}</td>
                                    <td><img src={product.imageUrl} alt={product.name} className="admin-table-img" style={{ width: '90px', height: '90px', objectFit: 'contain' }} /></td>
                                    <td className="product-name-col">{product.name}</td>
                                    <td>{product.category}</td>
                                    <td className="product-price-col">{formatCurrency(product.price)}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        <div className="admin-action-btns" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button className="btn-edit" title="Nhập hàng" style={{ backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }} onClick={() => navigate(`/admin/product/import/${product.id}`)}>
                                                <FiPlus size={16} />
                                            </button>
                                            <button className="btn-edit" title="Chỉnh sửa" style={{ backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }} onClick={() => navigate(`/admin/product/edit/${product.id}`)}>
                                                <FiEdit size={16} />
                                            </button>
                                            <button className="btn-delete" title="Xóa" style={{ backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }} onClick={() => handleDeleteClick(product.id)}>
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="empty-table-message">Không tìm thấy sản phẩm nào phù hợp.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Giao diện Phân trang */}
                {totalPages > 1 && (
                    <div className="pagination-container">
                        <button 
                            className="pagination-btn" 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Trước
                        </button>
                        
                        {getPaginationGroup().map((page, index) => (
                            <button 
                                key={index} 
                                className={`pagination-btn ${currentPage === page ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                disabled={page === '...'}
                            >
                                {page}
                            </button>
                        ))}

                        <button 
                            className="pagination-btn" 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductManagement;