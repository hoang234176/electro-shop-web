import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import Alert from "../../component/ui/Alert";
import "./AdminFormUI.css";
import "./EditProduct.css"; 
import { getProductById } from "../../services/product.service";
import { updateProductAdmin } from "../../services/admin.service"; 
import { FiPlus, FiTrash2 } from "react-icons/fi";

function EditProduct() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        category: "",
        importPrice: "",
        price: "",
        variants: [{ color: "", image: "" as string | File, quantity: "" }],
        description: "",
        specifications: [{ label: "", value: "" }]
    });

    const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const data = await getProductById(id);
                setFormData({
                    name: data.name || "",
                    brand: data.brand?.name || "",
                    category: data.category?.name || "",
                    importPrice: data.importPrice?.toString() || "",
                    price: data.price?.toString() || "",
                    description: data.description || "",
                    variants: data.variants?.length > 0 ? data.variants.map((v: any) => ({
                        color: v.color,
                        quantity: v.quantity?.toString() || "0",
                        image: v.image || ""
                    })) : [{ color: "", image: "", quantity: "" }],
                    specifications: data.specifications ? Object.entries(data.specifications).map(([label, value]) => ({
                        label,
                        value: String(value)
                    })) : [{ label: "", value: "" }]
                });
            } catch (error) {
                setAlertMessage({ text: "Không thể tải thông tin sản phẩm.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVariantTextChange = (index: number, value: string) => {
        const newVariants = [...formData.variants];
        newVariants[index].color = value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const handleVariantImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const newVariants = [...formData.variants];
            newVariants[index].image = e.target.files[0];
            setFormData(prev => ({ ...prev, variants: newVariants }));
        }
    };

    const removeVariant = (index: number) => {
        const newVariants = formData.variants.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const handleSpecificationChange = (index: number, field: 'label' | 'value', value: string) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index][field] = value;
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };

    const addSpecification = () => setFormData(prev => ({ ...prev, specifications: [...prev.specifications, { label: "", value: "" }] }));
    const removeSpecification = (index: number) => setFormData(prev => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== index) }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.importPrice || !formData.category || !formData.brand) {
            setAlertMessage({ text: "Vui lòng điền đầy đủ các thông tin bắt buộc (*)", type: "warning" });
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('brand', formData.brand);
        data.append('category', formData.category);
        data.append('importPrice', formData.importPrice);
        data.append('price', formData.price);
        data.append('description', formData.description);

        const specsObject = formData.specifications.reduce((acc, spec) => {
            if (spec.label.trim()) acc[spec.label.trim()] = spec.value.trim();
            return acc;
        }, {} as Record<string, string>);
        data.append('specifications', JSON.stringify(specsObject));

        // Giữ nguyên các phiên bản cũ gửi lên backend để không bị mất dữ liệu
        const variantsData = formData.variants.map(v => ({
            color: v.color,
            quantity: Number(v.quantity),
            image: typeof v.image === 'string' ? v.image : '', // Gửi lại URL cũ nếu không đổi ảnh
            isNewImage: v.image instanceof File
        }));
        data.append('variants', JSON.stringify(variantsData));

        formData.variants.forEach(variant => {
            if (variant.image instanceof File) {
                data.append('variant_images', variant.image);
            }
        });

        try {
            if(id) {
                const response = await updateProductAdmin(id, data);
                setAlertMessage({ text: response.message || "Cập nhật sản phẩm thành công!", type: "success" });
            }
        } catch (error: any) {
            setAlertMessage({ text: error.message || "Có lỗi xảy ra, không thể cập nhật sản phẩm.", type: "error" });
        }
    };

    const handleAlertClose = () => {
        setAlertMessage(null);
        if (alertMessage?.type === 'success') navigate("/admin/product");
    };

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