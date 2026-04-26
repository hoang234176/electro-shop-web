import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import Alert from "../../component/ui/Alert";
import "./AdminFormUI.css";
import "./EditProduct.css"; 
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useEditProduct } from "../../hooks/features/admin/useEditProduct";

function EditProduct() {
    const {
        navigate, formData, alertMessage, isLoading, handleChange, handleVariantTextChange,
        handleVariantImageChange, removeVariant, handleSpecificationChange, addSpecification,
        removeSpecification, handleSubmit, handleAlertClose
    } = useEditProduct();

    if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu sản phẩm...</div>;

    return (
        <div className="admin-page-container">
            <Alert show={alertMessage !== null} title="THÔNG BÁO" type={alertMessage?.type || "info"} message={alertMessage?.text || ""} action={<Button variant="primary" width="100px" height="40px" onClick={handleAlertClose}>Đóng</Button>} />
            <div className="admin-page-header">
                <h1 className="admin-page-title">Chỉnh Sửa Thông Tin Sản Phẩm</h1>
                <Button variant="secondary" width="120px" height="40px" onClick={() => navigate("/admin/product")}>Quay lại</Button>
            </div>
            <div className="admin-form-container">
                <form onSubmit={handleSubmit} className="add-product-form">
                    <div className="form-grid-2-cols">
                        <div className="form-group-admin add-name-product-wrapper"><Input label="Tên sản phẩm *" name="name" value={formData.name} onChange={handleChange} required /></div>
                        <div className="form-group-admin">
                            <label className="admin-label">Danh mục *</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="admin-select" required>
                                <option value="Điện thoại">Điện thoại</option>
                                <option value="Laptop">Laptop</option>
                                <option value="Tai nghe">Tai nghe</option>
                                <option value="Đồng hồ">Đồng hồ</option>
                                <option value="Phụ kiện">Phụ kiện</option>
                            </select>
                        </div>
                        <div className="form-group-admin">
                            <label className="admin-label">Thương hiệu *</label>
                            <select name="brand" value={formData.brand} onChange={handleChange} className="admin-select" required>
                                <option value="Apple">Apple</option>
                                <option value="Samsung">Samsung</option>
                                <option value="Sony">Sony</option>
                                <option value="Dell">Dell</option>
                                <option value="Anker">Anker</option>
                                <option value="LG">LG</option>
                            </select>
                        </div>
                        <div className="form-group-admin import-price"><Input label="Giá nhập (VNĐ) *" type="number" name="importPrice" value={formData.importPrice} onChange={handleChange} required min="0" /></div>
                        <div className="form-group-admin"><Input label="Giá bán (VNĐ) *" type="number" name="price" value={formData.price} onChange={handleChange} required min="0" /></div>
                        
                        <div className="form-group-admin full-width">
                            <label className="admin-label">Các phiên bản sản phẩm (Màu sắc, Hình ảnh)</label>
                            {formData.variants.map((variant, index) => (
                                <div key={index} className="variant-row">
                                    <div className="variant-input-wrapper"><Input label="" placeholder="Tên màu" value={variant.color} onChange={(e) => handleVariantTextChange(index, e.target.value)} required /></div>
                                    <div className="variant-input-wrapper" style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <label htmlFor={`variant-image-${index}`} className="admin-label-file-upload" style={{ margin: 0 }}>
                                                {variant.image instanceof File ? variant.image.name : (typeof variant.image === 'string' && variant.image ? 'Ảnh hiện tại (Nhấn đổi)' : 'Chọn ảnh mới...')}
                                            </label>
                                            <input id={`variant-image-${index}`} type="file" onChange={(e) => handleVariantImageChange(index, e)} style={{ display: 'none' }} accept="image/*" />
                                        </div>
                                        <button type="button" className="btn-remove-row" onClick={() => removeVariant(index)} title="Xóa phiên bản này" style={{ backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', gap: '8px', fontSize: '14px' }}>
                                            <FiTrash2 size={16} /> Xóa màu
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="form-group-admin full-width">
                            <label className="admin-label">Mô tả chi tiết</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="admin-textarea" rows={5} placeholder="Nhập mô tả chi tiết về sản phẩm..."></textarea>
                        </div>

                        <div className="form-group-admin full-width">
                            <label className="admin-label">Thông số kỹ thuật</label>
                            {formData.specifications.map((spec, index) => (
                                <div key={index} className="spec-row">
                                    <div className="spec-input-wrapper"><Input label="" placeholder="Tên thông số (VD: Màn hình)" value={spec.label} onChange={(e) => handleSpecificationChange(index, 'label', e.target.value)} /></div>
                                    <div className="spec-input-wrapper"><Input label="" placeholder="Giá trị (VD: 6.7 inch, 120Hz)" value={spec.value} onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)} /></div>
                                    <button type="button" className="btn-remove-row" style={{ backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }} onClick={() => removeSpecification(index)} title="Xóa thông số">
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <div style={{ marginTop: '8px' }}>
                                <Button type="button" variant="secondary" width="180px" height="40px" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={addSpecification}>
                                    <FiPlus size={16} /> Thêm thông số
                                </Button>
                            </div>
                        </div>

                        <div className="form-group-admin full-width" style={{ marginTop: '16px' }}>
                            <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                                * Ghi chú: Để thêm màu sắc mới hoặc nhập hàng (thêm số lượng tồn kho), vui lòng sử dụng tính năng <strong>"Nhập hàng (+)"</strong> ở màn hình Quản lý Sản phẩm.
                            </p>
                        </div>
                    </div>
                    <div className="form-actions-admin"><Button type="submit" variant="primary" width="200px" height="48px">Cập nhật Sản Phẩm</Button></div>
                </form>
            </div>
        </div>
    );
}
export default EditProduct;