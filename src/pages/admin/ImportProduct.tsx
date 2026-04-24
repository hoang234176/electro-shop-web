import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import Alert from "../../component/ui/Alert";
import "./AdminFormUI.css";
import "./ImportProduct.css";
import { getProductById } from "../../services/product.service";
import { importProductAdmin } from "../../services/admin.service";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface ExistingVariant {
    color: string;
    currentQuantity: number;
    addQuantity: string;
    image: string | File;
    isOldImage: boolean;
}

interface NewVariant {
    color: string;
    quantity: string;
    image: File | null;
}

function ImportProduct() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [baseInfo, setBaseInfo] = useState<any>(null);
    const [existingVariants, setExistingVariants] = useState<ExistingVariant[]>([]);
    const [newVariants, setNewVariants] = useState<NewVariant[]>([]);

    const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const data = await getProductById(id);
                setBaseInfo({
                    name: data.name || "",
                    brand: data.brand?.name || "",
                    category: data.category?.name || "",
                    importPrice: data.importPrice || 0,
                    price: data.price || 0,
                    description: data.description || "",
                    specifications: data.specifications || {}
                });

                if (data.variants && data.variants.length > 0) {
                    setExistingVariants(data.variants.map((v: any) => ({
                        color: v.color,
                        currentQuantity: v.quantity,
                        addQuantity: "", // Mặc định chưa nhập thêm gì
                        image: v.image || "",
                        isOldImage: true
                    })));
                }
            } catch (error) {
                setAlertMessage({ text: "Không thể tải thông tin sản phẩm.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // Xử lý thay đổi số lượng nhập thêm cho màu cũ
    const handleExistingChange = (index: number, value: string) => {
        const updated = [...existingVariants];
        updated[index].addQuantity = value;
        setExistingVariants(updated);
    };

    // Quản lý màu mới
    const handleNewVariantTextChange = (index: number, field: 'color' | 'quantity', value: string) => {
        const updated = [...newVariants];
        updated[index][field] = value;
        setNewVariants(updated);
    };

    const handleNewVariantImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const updated = [...newVariants];
            updated[index].image = e.target.files[0];
            setNewVariants(updated);
        }
    };

    const addNewVariantRow = () => setNewVariants(prev => [...prev, { color: "", quantity: "", image: null }]);
    const removeNewVariantRow = (index: number) => setNewVariants(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate Màu mới: phải có đủ Tên màu, Số lượng và Ảnh (Bắt buộc)
        const invalidNew = newVariants.some(v => !v.color.trim() || !v.quantity || !v.image);
        if (invalidNew) {
            setAlertMessage({ text: "Tất cả các màu mới đều bắt buộc phải có đủ Tên màu, Số lượng và Hình ảnh!", type: "warning" });
            return;
        }

        setIsSubmitting(true);
        const data = new FormData();

        // Gửi lại các thông tin cơ bản để backend không bị mất dữ liệu
        data.append('name', baseInfo.name);
        data.append('brand', baseInfo.brand);
        data.append('category', baseInfo.category);
        data.append('importPrice', baseInfo.importPrice.toString());
        data.append('price', baseInfo.price.toString());
        data.append('description', baseInfo.description);
        data.append('specifications', JSON.stringify(baseInfo.specifications));

        // Gom nhóm mảng Variants (Màu cũ + Màu mới)
        const combinedVariantsData = [
            ...existingVariants.map(v => {
                const added = Number(v.addQuantity) || 0;
                return {
                    color: v.color,
                    quantity: v.currentQuantity + added, // Cộng dồn số lượng
                    image: typeof v.image === 'string' ? v.image : '',
                    isNewImage: !v.isOldImage
                };
            }),
            ...newVariants.map(v => ({
                color: v.color,
                quantity: Number(v.quantity),
                image: '',
                isNewImage: true
            }))
        ];
        data.append('variants', JSON.stringify(combinedVariantsData));

        // Thêm file ảnh vào form data (Chỉ áp dụng cho màu mới)
        newVariants.forEach(v => {
            if (v.image instanceof File) {
                data.append('variant_images', v.image);
            }
        });

        try {
            if (id) {
                const response = await importProductAdmin(id, data);
                setAlertMessage({ text: response.message || "Nhập hàng thành công!", type: "success" });
            }
        } catch (error: any) {
            setAlertMessage({ text: error.message || "Có lỗi xảy ra khi nhập hàng.", type: "error" });
        } finally {
            setIsSubmitting(false);
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