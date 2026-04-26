import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import Alert from "../../component/ui/Alert";
import "./ProductManagement.css";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { useProductManagement } from "../../hooks/features/admin/useProductManagement";

function ProductManagement() {
    const {
        navigate,
        searchTerm,
        handleSearchChange,
        isLoading,
        currentProducts,
        formatCurrency,
        handleDeleteClick,
        productToDelete,
        productBeingDeleted,
        cancelDelete,
        confirmDelete,
        alertMessage,
        setAlertMessage,
        getAlertTitle,
        totalPages,
        currentPage,
        setCurrentPage,
        getPaginationGroup
    } = useProductManagement();

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