import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../../../services/product.service";
import { updateProductAdmin } from "../../../services/admin.service";

export interface ApiProductVariant {
    color: string;
    quantity?: number;
    image?: string;
}

export interface ApiProductData {
    name?: string;
    brand?: { name?: string };
    category?: { name?: string };
    importPrice?: number | string;
    price?: number | string;
    description?: string;
    variants?: ApiProductVariant[];
    specifications?: Record<string, string | number>;
}

export const useEditProduct = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "", brand: "", category: "", importPrice: "", price: "",
        variants: [{ color: "", image: "" as string | File, quantity: "" }],
        description: "", specifications: [{ label: "", value: "" }]
    });

    const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const data = await getProductById(id) as ApiProductData;
                setFormData({
                    name: data.name || "", brand: data.brand?.name || "", category: data.category?.name || "",
                    importPrice: data.importPrice?.toString() || "", price: data.price?.toString() || "",
                    description: data.description || "",
                    variants: data.variants && data.variants.length > 0 ? data.variants.map((v: ApiProductVariant) => ({
                        color: v.color, quantity: v.quantity?.toString() || "0", image: v.image || ""
                    })) : [{ color: "", image: "", quantity: "" }],
                    specifications: data.specifications && Object.keys(data.specifications).length > 0 ? Object.entries(data.specifications).map(([label, value]) => ({
                        label, value: String(value)
                    })) : [{ label: "", value: "" }]
                });
            } catch {
                setAlertMessage({ text: "Không thể tải thông tin sản phẩm.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleVariantTextChange = (index: number, value: string) => { const newV = [...formData.variants]; newV[index].color = value; setFormData(prev => ({ ...prev, variants: newV })); };
    const handleVariantImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) { const newV = [...formData.variants]; newV[index].image = e.target.files[0]; setFormData(prev => ({ ...prev, variants: newV })); }
    };
    const removeVariant = (index: number) => setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
    const handleSpecificationChange = (index: number, field: 'label' | 'value', value: string) => {
        const newS = [...formData.specifications]; newS[index][field] = value; setFormData(prev => ({ ...prev, specifications: newS }));
    };
    const addSpecification = () => setFormData(prev => ({ ...prev, specifications: [...prev.specifications, { label: "", value: "" }] }));
    const removeSpecification = (index: number) => setFormData(prev => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== index) }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.importPrice || !formData.category || !formData.brand) return setAlertMessage({ text: "Vui lòng điền đầy đủ các thông tin bắt buộc (*)", type: "warning" });

        const data = new FormData();
        data.append('name', formData.name); data.append('brand', formData.brand);
        data.append('category', formData.category); data.append('importPrice', formData.importPrice);
        data.append('price', formData.price); data.append('description', formData.description);

        const specsObject = formData.specifications.reduce((acc, spec) => { if (spec.label.trim()) acc[spec.label.trim()] = spec.value.trim(); return acc; }, {} as Record<string, string>);
        data.append('specifications', JSON.stringify(specsObject));

        const variantsData = formData.variants.map(v => ({
            color: v.color, quantity: Number(v.quantity),
            image: typeof v.image === 'string' ? v.image : '', isNewImage: v.image instanceof File
        }));
        data.append('variants', JSON.stringify(variantsData));
        formData.variants.forEach(variant => { if (variant.image instanceof File) data.append('variant_images', variant.image); });

        try {
            if (id) {
                const response = await updateProductAdmin(id, data);
                setAlertMessage({ text: response.message || "Cập nhật sản phẩm thành công!", type: "success" });
            }
        } catch (error: unknown) {
            setAlertMessage({ text: (error as Error).message || "Có lỗi xảy ra.", type: "error" });
        }
    };

    const handleAlertClose = () => { setAlertMessage(null); if (alertMessage?.type === 'success') navigate("/admin/product"); };

    return {
        navigate, formData, alertMessage, isLoading, handleChange, handleVariantTextChange,
        handleVariantImageChange, removeVariant, handleSpecificationChange, addSpecification,
        removeSpecification, handleSubmit, handleAlertClose
    };
};