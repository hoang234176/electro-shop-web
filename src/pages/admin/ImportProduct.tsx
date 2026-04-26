import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import Alert from "../../component/ui/Alert";
import "./AdminFormUI.css";
import "./ImportProduct.css";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useImportProduct } from "../../hooks/features/admin/useImportProduct";

function ImportProduct() {
    const {
        navigate, baseInfo, existingVariants, newVariants, alertMessage, isLoading, isSubmitting,
        handleExistingChange, handleNewVariantTextChange, handleNewVariantImageChange, addNewVariantRow,
        removeNewVariantRow, handleSubmit, handleAlertClose
    } = useImportProduct();

    if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu sản phẩm...</div>;

    return (
        <div className="admin-page-container">
            <Alert show={alertMessage !== null} title="THÔNG BÁO" type={alertMessage?.type || "info"} message={alertMessage?.text || ""} action={<Button variant="primary" width="100px" height="40px" onClick={handleAlertClose}>Đóng</Button>} />
            <div className="admin-page-header">
                <h1 className="admin-page-title">Nhập Hàng - Tồn Kho</h1>
                <Button variant="secondary" width="120px" height="40px" onClick={() => navigate("/admin/product")}>Quay lại</Button>
            </div>
            <div className="admin-form-container">
                <div className="import-header-section">
                    <h3 className="import-product-name">Sản phẩm: {baseInfo?.name}</h3>
                    <p className="import-product-desc">Nhập thêm số lượng cho các phiên bản màu hiện tại hoặc thêm màu mới.</p>
                </div>

                <form onSubmit={handleSubmit} className="add-product-form">
                    <div className="form-group-admin full-width">
                        <label className="admin-label import-section-title">1. Nhập thêm cho các phiên bản cũ</label>
                        {existingVariants.map((variant, index) => (
                            <div key={index} className="variant-row import-variant-row-old">
                                <div className="variant-input-wrapper import-image-wrapper">
                                    <img src={typeof variant.image === 'string' && variant.image ? variant.image : 'https://via.placeholder.com/60?text=No+Image'} alt={variant.color} className="import-image-preview" />
                                </div>
                                <div className="variant-input-wrapper"><Input label="Màu sắc" value={variant.color} onChange={() => {}} disabled /></div>
                                <div className="variant-input-wrapper"><Input label="Tồn kho hiện tại" value={variant.currentQuantity.toString()} onChange={() => {}} disabled /></div>
                                <div className="variant-input-wrapper"><Input label="Nhập thêm (+)" type="number" placeholder="Vd: 10" value={variant.addQuantity} onChange={(e) => handleExistingChange(index, e.target.value)} min="0" /></div>
                            </div>
                        ))}
                    </div>

                    <div className="form-group-admin full-width import-section-new">
                        <label className="admin-label import-section-title">2. Thêm phiên bản màu mới</label>
                        {newVariants.map((variant, index) => (
                            <div key={index} className="variant-row import-variant-row-new">
                                <div className="variant-input-wrapper"><Input label="Tên màu mới" placeholder="VD: Đỏ Ruby" value={variant.color} onChange={(e) => handleNewVariantTextChange(index, 'color', e.target.value)} required /></div>
                                <div className="variant-input-wrapper"><Input label="Số lượng" type="number" placeholder="VD: 10" value={variant.quantity} onChange={(e) => handleNewVariantTextChange(index, 'quantity', e.target.value)} required min="1" /></div>
                                <div className="variant-input-wrapper import-new-image-wrapper">
                                    <label htmlFor={`new-image-${index}`} className="admin-label-file-upload import-label-file-upload">
                                        {variant.image instanceof File ? variant.image.name : 'Chọn ảnh (Bắt buộc) *'}
                                    </label>
                                    <input id={`new-image-${index}`} type="file" onChange={(e) => handleNewVariantImageChange(index, e)} style={{ display: 'none' }} accept="image/*" />
                                </div>
                                <button type="button" className="btn-remove-row btn-remove-new-variant" onClick={() => removeNewVariantRow(index)} title="Xóa màu này">
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <div className="import-add-btn-wrapper">
                            <Button type="button" variant="secondary" width="180px" height="40px" className="btn-add-new-variant" onClick={addNewVariantRow}>
                                <FiPlus size={16} /> Thêm màu mới
                            </Button>
                        </div>
                    </div>
                    <div className="form-actions-admin import-form-actions">
                        <Button type="submit" variant="primary" width="200px" height="48px" disabled={isSubmitting}>
                            {isSubmitting ? "Đang xử lý..." : "Lưu Nhập Hàng"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default ImportProduct;