import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../../../services/product.service";
import { importProductAdmin } from "../../../services/admin.service";

export interface ExistingVariant {
    color: string;
    currentQuantity: number;
    addQuantity: string;
    image: string | File;
    isOldImage: boolean;
}

export interface NewVariant {
    color: string;
    quantity: string;
    image: File | null;
}

export interface ApiProductVariant {
    color: string;
    quantity: number;
    image?: string;
}

export interface ProductBaseInfo {
    name: string;
    brand: string;
    category: string;
    importPrice: number;
    price: number;
    description: string;
    specifications: Record<string, string | number>;
}

export const useImportProduct = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [baseInfo, setBaseInfo] = useState<ProductBaseInfo | null>(null);
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
                const brandName = typeof data.brand === 'object' ? data.brand?.name : data.brand;
                const categoryName = typeof data.category === 'object' ? data.category?.name : data.category;
                setBaseInfo({
                    name: data.name || "", brand: brandName || "", category: categoryName || "",
                    importPrice: Number(data.importPrice) || 0, price: Number(data.price) || 0, description: data.description || "",
                    specifications: data.specifications || {}
                });
                if (data.variants && data.variants.length > 0) {
                    setExistingVariants(data.variants.map((v: ApiProductVariant) => ({
                        color: v.color, currentQuantity: v.quantity, addQuantity: "", image: v.image || "", isOldImage: true
                    })));
                }
            } catch {
                setAlertMessage({ text: "Không thể tải thông tin sản phẩm.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleExistingChange = (index: number, value: string) => { const updated = [...existingVariants]; updated[index].addQuantity = value; setExistingVariants(updated); };
    const handleNewVariantTextChange = (index: number, field: 'color' | 'quantity', value: string) => { const updated = [...newVariants]; updated[index][field] = value; setNewVariants(updated); };
    const handleNewVariantImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) { const updated = [...newVariants]; updated[index].image = e.target.files[0]; setNewVariants(updated); }
    };
    const addNewVariantRow = () => setNewVariants(prev => [...prev, { color: "", quantity: "", image: null }]);
    const removeNewVariantRow = (index: number) => setNewVariants(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newVariants.some(v => !v.color.trim() || !v.quantity || !v.image) || !baseInfo) return setAlertMessage({ text: "Tất cả màu mới phải đủ Tên, Số lượng và Hình ảnh!", type: "warning" });
        
        setIsSubmitting(true);
        const data = new FormData();
        data.append('name', baseInfo.name); data.append('brand', baseInfo.brand);
        data.append('category', baseInfo.category); data.append('importPrice', baseInfo.importPrice.toString());
        data.append('price', baseInfo.price.toString()); data.append('description', baseInfo.description);
        data.append('specifications', JSON.stringify(baseInfo.specifications));

        const combined = [
            ...existingVariants.map(v => ({ color: v.color, quantity: v.currentQuantity + (Number(v.addQuantity) || 0), image: typeof v.image === 'string' ? v.image : '', isNewImage: !v.isOldImage })),
            ...newVariants.map(v => ({ color: v.color, quantity: Number(v.quantity), image: '', isNewImage: true }))
        ];
        data.append('variants', JSON.stringify(combined));
        newVariants.forEach(v => { if (v.image instanceof File) data.append('variant_images', v.image); });

        try {
            if (id) { const response = await importProductAdmin(id, data); setAlertMessage({ text: response.message || "Nhập hàng thành công!", type: "success" }); }
        } catch (error: unknown) {
            setAlertMessage({ text: (error as Error).message || "Có lỗi xảy ra khi nhập hàng.", type: "error" });
        } finally { setIsSubmitting(false); }
    };

    const handleAlertClose = () => { setAlertMessage(null); if (alertMessage?.type === 'success') navigate("/admin/product"); };

    return {
        navigate, baseInfo, existingVariants, newVariants, alertMessage, setAlertMessage, isLoading, isSubmitting,
        handleExistingChange, handleNewVariantTextChange, handleNewVariantImageChange, addNewVariantRow,
        removeNewVariantRow, handleSubmit, handleAlertClose
    };
};