import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { runGemini } from "../../../services/ai.service";
import { addProduct } from "../../../services/admin.service";

export interface GeminiVariant {
    color?: string;
    quantity?: string;
    image?: string;
}

export interface GeminiSpec {
    label?: string;
    value?: string;
}

export interface GeminiProductData {
    name?: string;
    brand?: string;
    category?: string;
    importPrice?: string;
    price?: string;
    description?: string;
    variants?: GeminiVariant[];
    specifications?: GeminiSpec[];
}

export const useAddProduct = () => {
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

    const [showGeminiChat, setShowGeminiChat] = useState(false);
    const [geminiInput, setGeminiInput] = useState("");
    const [geminiMessages, setGeminiMessages] = useState<{ type: 'user' | 'gemini', text: string, data?: GeminiProductData }[]>([]);
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [geminiMessages]);

    const handleApplySuggestion = (data: GeminiProductData) => {
        setFormData(prev => {
            const updatedFormData = { ...prev };

            if (data.name) updatedFormData.name = data.name;
            if (data.brand) updatedFormData.brand = data.brand;
            if (data.category) updatedFormData.category = data.category;
            if (data.importPrice) updatedFormData.importPrice = data.importPrice;
            if (data.price) updatedFormData.price = data.price;
            if (data.description) updatedFormData.description = data.description;

            if (Array.isArray(data.variants)) {
                const validVariants = data.variants.filter((v: GeminiVariant) => v.color?.trim() || v.quantity?.trim());
                if (validVariants.length > 0) {
                    updatedFormData.variants = validVariants.map((v: GeminiVariant, idx: number) => ({
                        color: v.color || prev.variants[idx]?.color || "",
                        quantity: v.quantity || prev.variants[idx]?.quantity || "",
                        image: prev.variants[idx]?.image || ""
                    }));
                }
            }

            if (Array.isArray(data.specifications)) {
                const validSpecs = data.specifications.filter((s: GeminiSpec) => s.label?.trim() || s.value?.trim());
                if (validSpecs.length > 0) {
                    updatedFormData.specifications = validSpecs.map((s: GeminiSpec) => ({
                        label: s.label || "",
                        value: s.value || ""
                    }));
                }
            }

            return updatedFormData;
        });

        setAlertMessage({ text: "Đã cập nhật thông tin từ AI!", type: 'info' });
        setShowGeminiChat(false);
    };

    const handleGeminiSend = async () => {
        if (geminiInput.trim() === "" || isGeminiLoading) return;
        const userMessage = geminiInput.trim();
        setGeminiMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        setGeminiInput("");
        setIsGeminiLoading(true);

        try {
            const jsonData = await runGemini(userMessage);
            setGeminiMessages(prev => [...prev, { type: 'gemini', text: "Tôi đã tìm thấy một số thông tin. Bạn có muốn áp dụng vào biểu mẫu không?", data: jsonData }]);
        } catch {
            setGeminiMessages(prev => [...prev, { type: 'gemini', text: "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này." }]);
        } finally {
            setIsGeminiLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVariantTextChange = (index: number, field: 'color' | 'quantity', value: string) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const handleVariantImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const newVariants = [...formData.variants];
            newVariants[index].image = e.target.files[0];
            setFormData(prev => ({ ...prev, variants: newVariants }));
        }
    };

    const addVariant = () => setFormData(prev => ({ ...prev, variants: [...prev.variants, { color: "", image: "", quantity: "" }] }));
    const removeVariant = (index: number) => setFormData(prev => ({ ...prev, variants: formData.variants.filter((_, i) => i !== index) }));

    const handleSpecificationChange = (index: number, field: 'label' | 'value', value: string) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index][field] = value;
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };

    const addSpecification = () => setFormData(prev => ({ ...prev, specifications: [...prev.specifications, { label: "", value: "" }] }));
    const removeSpecification = (index: number) => setFormData(prev => ({ ...prev, specifications: formData.specifications.filter((_, i) => i !== index) }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.importPrice || !formData.category || !formData.brand) return setAlertMessage({ text: "Vui lòng điền đầy đủ thông tin (*)", type: "warning" });
        if (formData.variants.some(v => !v.color.trim() || !v.quantity.trim() || !(v.image instanceof File))) return setAlertMessage({ text: "Mỗi phiên bản phải có Màu, Số lượng và Ảnh", type: "warning" });
        if (Number(formData.price) < Number(formData.importPrice)) return setAlertMessage({ text: "Giá bán không thể nhỏ hơn giá nhập", type: "error" });

        const data = new FormData();
        data.append('name', formData.name); data.append('brand', formData.brand);
        data.append('category', formData.category); data.append('importPrice', formData.importPrice);
        data.append('price', formData.price); data.append('description', formData.description);

        const specsObj = formData.specifications.reduce((acc, spec) => { if (spec.label.trim()) acc[spec.label.trim()] = spec.value.trim(); return acc; }, {} as Record<string, string>);
        data.append('specifications', JSON.stringify(specsObj));
        data.append('variants', JSON.stringify(formData.variants.map(v => ({ color: v.color, quantity: Number(v.quantity) }))));
        formData.variants.forEach(v => { if (v.image instanceof File) data.append('variant_images', v.image); });

        try {
            const response = await addProduct(data);
            setAlertMessage({ text: response.message || "Thêm sản phẩm mới thành công!", type: "success" });
        } catch (error: unknown) {
            setAlertMessage({ text: (error as Error).message || "Có lỗi xảy ra.", type: "error" });
        }
    };

    const handleAlertClose = () => {
        setAlertMessage(null);
        if (alertMessage?.type === 'success') navigate("/admin/product");
    };

    const getAlertTitle = (): "THÔNG BÁO" | "CẢNH BÁO" | "LỖI" => alertMessage?.type === 'warning' ? "CẢNH BÁO" : alertMessage?.type === 'error' ? "LỖI" : "THÔNG BÁO";

    return {
        navigate, formData, alertMessage, showGeminiChat, setShowGeminiChat, geminiInput, setGeminiInput,
        geminiMessages, isGeminiLoading, messagesEndRef, handleApplySuggestion, handleGeminiSend,
        handleChange, handleVariantTextChange, handleVariantImageChange, addVariant, removeVariant,
        handleSpecificationChange, addSpecification, removeSpecification, handleSubmit, handleAlertClose, getAlertTitle
    };
};