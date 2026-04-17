import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import Alert from "../../component/ui/Alert";
import "./AddProduct.css";
import { runGemini } from "../../services/aiServices";
import { addProduct } from "../../services/adminServices";

function AddProduct() {
    const navigate = useNavigate();
    const location = useLocation();

    // State lưu trữ dữ liệu form
    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        category: "",
        importPrice: "",
        price: "",
        // stock và imageUrl đã được chuyển vào trong variants
        variants: [{ color: "", image: "" as string | File, quantity: "" }], // Quản lý hình ảnh và số lượng theo từng phiên bản
        description: "",
        specifications: [{ label: "", value: "" }] // Thông số kỹ thuật động
    });

    const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    // Gemini Chatbot states
    const [showGeminiChat, setShowGeminiChat] = useState(false);
    const [geminiInput, setGeminiInput] = useState("");
    // Mở rộng type của message để chứa dữ liệu có thể hành động (JSON từ AI)
    const [geminiMessages, setGeminiMessages] = useState<{
        type: 'user' | 'gemini',
        text: string,
        data?: any, // Dữ liệu JSON trả về từ AI
    }[]>([]);
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of chat messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [geminiMessages]);

    // Hàm mới để áp dụng dữ liệu từ AI vào form
    const handleApplySuggestion = (data: any) => {
        setFormData(prev => {
            const updatedFormData = { ...prev };

            // Chỉ ghi đè nếu AI thực sự trả về dữ liệu cho trường đó
            if (data.name) updatedFormData.name = data.name;
            if (data.brand) updatedFormData.brand = data.brand;
            if (data.category) updatedFormData.category = data.category;
            if (data.importPrice) updatedFormData.importPrice = data.importPrice;
            if (data.price) updatedFormData.price = data.price;
            if (data.description) updatedFormData.description = data.description;

            // Lọc ra các phiên bản thực sự có thông tin (tránh bị mảng rỗng làm mất dữ liệu)
            if (Array.isArray(data.variants)) {
                const validVariants = data.variants.filter((v: any) => v.color?.trim() || v.quantity?.trim());
                if (validVariants.length > 0) {
                    // Cố gắng giữ lại ảnh cũ ở cùng vị trí index (nếu có)
                    updatedFormData.variants = validVariants.map((v: any, idx: number) => ({
                        color: v.color || prev.variants[idx]?.color || "",
                        quantity: v.quantity || prev.variants[idx]?.quantity || "",
                        image: prev.variants[idx]?.image || ""
                    }));
                }
            }

            // Tương tự với thông số kỹ thuật
            if (Array.isArray(data.specifications)) {
                const validSpecs = data.specifications.filter((s: any) => s.label?.trim() || s.value?.trim());
                if (validSpecs.length > 0) {
                    updatedFormData.specifications = validSpecs;
                }
            }

            return updatedFormData;
        });

        setAlertMessage({ text: "Đã cập nhật thông tin từ AI!", type: 'info' });
        setShowGeminiChat(false); // Đóng cửa sổ chat sau khi áp dụng
    };

    const handleGeminiSend = async () => {
        if (geminiInput.trim() === "" || isGeminiLoading) return;

        const userMessage = geminiInput.trim();
        const newUserMessage = { type: 'user' as const, text: userMessage };

        setGeminiMessages(prev => [...prev, newUserMessage]);
        setGeminiInput("");
        setIsGeminiLoading(true);

        try {
            // Gọi hàm runGemini từ aiServices, nó sẽ trả về một object JSON
            const jsonData = await runGemini(userMessage);

            // Tạo tin nhắn phản hồi từ Gemini có chứa nút để hành động
            const geminiResponse = {
                type: 'gemini' as const,
                text: "Tôi đã tìm thấy một số thông tin. Bạn có muốn áp dụng vào biểu mẫu không?",
                data: jsonData, // Gắn dữ liệu JSON vào tin nhắn
            };
            setGeminiMessages(prev => [...prev, geminiResponse]);
        } catch (error) {
            const errorResponse = {
                type: 'gemini' as const,
                text: "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng kiểm tra lại kết nối hoặc API key.",
            };
            setGeminiMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsGeminiLoading(false);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
    const addVariant = () => {
        setFormData(prev => ({ ...prev, variants: [...prev.variants, { color: "", image: "", quantity: "" }] }));
    };

    const removeVariant = (index: number) => {
        const newVariants = formData.variants.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const handleSpecificationChange = (index: number, field: 'label' | 'value', value: string) => {
        const newSpecifications = [...formData.specifications];
        newSpecifications[index][field] = value;
        setFormData(prev => ({ ...prev, specifications: newSpecifications }));
    };

    const addSpecification = () => {
        setFormData(prev => ({ ...prev, specifications: [...prev.specifications, { label: "", value: "" }] }));
    };

    const removeSpecification = (index: number) => {
        const newSpecifications = formData.specifications.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, specifications: newSpecifications }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate cơ bản
        if (!formData.name || !formData.price || !formData.importPrice || !formData.category || !formData.brand) {
            setAlertMessage({ text: "Vui lòng điền đầy đủ các thông tin bắt buộc (*)", type: "warning" });
            return;
        }

        // Validate variants: mỗi phiên bản phải có màu và số lượng
        if (formData.variants.some(v => !v.color.trim() || !v.quantity.trim() || !(v.image instanceof File))) {
            setAlertMessage({ text: "Mỗi phiên bản sản phẩm phải có Màu sắc, Số lượng và Hình ảnh đầy đủ.", type: "warning" });
            return;
        }

        // Validate logic kinh doanh: Giá bán không được nhỏ hơn giá nhập
        if (Number(formData.price) < Number(formData.importPrice)) {
            setAlertMessage({ text: "Giá bán không thể nhỏ hơn giá nhập. Vui lòng kiểm tra lại!", type: "error" });
            return;
        }

        // Tạo đối tượng FormData để gửi file và dữ liệu
        const data = new FormData();
        data.append('name', formData.name);
        data.append('brand', formData.brand);
        data.append('category', formData.category);
        data.append('importPrice', formData.importPrice);
        data.append('price', formData.price);
        data.append('description', formData.description);

        // Chuyển đổi specifications và variants thành chuỗi JSON
        const specificationsObject = formData.specifications.reduce((acc, spec) => {
            if (spec.label.trim()) acc[spec.label.trim()] = spec.value.trim();
            return acc;
        }, {} as Record<string, string>);
        data.append('specifications', JSON.stringify(specificationsObject));

        const variantsData = formData.variants.map(v => ({ color: v.color, quantity: Number(v.quantity) }));
        data.append('variants', JSON.stringify(variantsData));

        // Thêm các file ảnh vào FormData
        formData.variants.forEach(variant => {
            if (variant.image instanceof File) {
                data.append('variant_images', variant.image);
            }
        });

        try {
            const response = await addProduct(data);
            setAlertMessage({ text: response.message || "Thêm sản phẩm mới thành công!", type: "success" });
            // navigate("/admin/product");
        } catch (error: any) {
            setAlertMessage({ text: error.message || "Có lỗi xảy ra, không thể thêm sản phẩm.", type: "error" });
        }
    };

    const handleAlertClose = () => {
        if (alertMessage?.type === 'success') {
            setAlertMessage(null);
            navigate("/admin/product"); // Quay về trang danh sách sau khi thêm thành công
        } else {
            setAlertMessage(null);
        }
    };

    const getAlertTitle = (): "THÔNG BÁO" | "CẢNH BÁO" | "LỖI" => {
        if (alertMessage?.type === 'warning') return "CẢNH BÁO";
        if (alertMessage?.type === 'error') return "LỖI";
        return "THÔNG BÁO";
    };

    return (
        <div className="admin-page-container">
            <Alert
                show={alertMessage !== null}
                title={getAlertTitle()}
                type={alertMessage?.type || "info"}
                message={alertMessage?.text || ""}
                action={<Button variant="primary" width="100px" height="40px" onClick={handleAlertClose}>Đóng</Button>}
            />

            <div className="admin-page-header">
                <h1 className="admin-page-title">Thêm Sản Phẩm Mới</h1>
                <Button variant="secondary" width="120px" height="40px" onClick={() => navigate("/admin/product")}>Quay lại</Button>
            </div>

            <div className="admin-form-container">
                <form onSubmit={handleSubmit} className="add-product-form">
                    <div className="form-grid-2-cols">
                        <div className="form-group-admin add-name-product-wrapper">
                            <Input label="Tên sản phẩm *" name="name" value={formData.name} onChange={handleChange} placeholder="" required />
                        </div>
                        <div className="form-group-admin">
                            <label className="admin-label">Danh mục *</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="admin-select" required>
                                <option value="">-- Chọn danh mục --</option>
                                <option value="Điện thoại">Điện thoại</option>
                                <option value="Laptop">Laptop</option>
                                <option value="Tai nghe">Tai nghe</option>
                                <option value="Đồng hồ">Đồng hồ</option>
                                <option value="Phụ kiện">Phụ kiện</option>
                                <option value="Màn hình">Màn hình</option>
                            </select>
                        </div>
                        <div className="form-group-admin">
                            <label className="admin-label">Thương hiệu *</label>
                            <select name="brand" value={formData.brand} onChange={handleChange} className="admin-select" required>
                                <option value="">-- Chọn thương hiệu --</option>
                                <option value="Apple">Apple</option>
                                <option value="Samsung">Samsung</option>
                                <option value="Sony">Sony</option>
                                <option value="Dell">Dell</option>
                                <option value="LG">LG</option>
                                <option value="Google">Google</option>
                            </select>
                        </div>
                        <div className="form-group-admin import-price">
                            <Input label="Giá nhập (VNĐ) *" type="number" name="importPrice" value={formData.importPrice} onChange={handleChange} placeholder="" required min="0" />
                        </div>
                        <div className="form-group-admin">
                            <Input label="Giá bán (VNĐ) *" type="number" name="price" value={formData.price} onChange={handleChange} placeholder="" required min="0" />
                        </div>

                        <div className="form-group-admin full-width">
                            <label className="admin-label">Các phiên bản sản phẩm (màu sắc, số lượng)</label>
                            {formData.variants.map((variant, index) => (
                                <div key={index} className="variant-row">
                                    <div className="variant-input-wrapper"><Input label="" placeholder="Tên màu (VD: Xanh)" value={variant.color} onChange={(e) => handleVariantTextChange(index, 'color', e.target.value)} required /></div>
                                    <div className="variant-input-wrapper"><Input label="" type="number" placeholder="Số lượng" value={variant.quantity} onChange={(e) => handleVariantTextChange(index, 'quantity', e.target.value)} required min="0" /></div>
                                    <div className="variant-input-wrapper" style={{ flex: 1 }}>
                                        <label htmlFor={`variant-image-${index}`} className="admin-label-file-upload">
                                            {variant.image instanceof File
                                                ? variant.image.name
                                                : (typeof variant.image === 'string' && variant.image ? 'Ảnh từ URL' : 'Chọn ảnh...')}
                                        </label>
                                        <input
                                            id={`variant-image-${index}`}
                                            type="file"
                                            onChange={(e) => handleVariantImageChange(index, e)}
                                            style={{ display: 'none' }}
                                            accept="image/*" />
                                    </div>
                                    <button type="button" className="btn-remove-row" onClick={() => removeVariant(index)} title="Xóa phiên bản này">🗑️</button>
                                </div>
                            ))}
                            <div style={{ marginTop: '8px' }}>
                                <Button type="button" variant="secondary" width="160px" height="40px" onClick={addVariant}>+ Thêm phiên bản</Button>
                            </div>
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
                                    <button type="button" className="btn-remove-row" onClick={() => removeSpecification(index)} title="Xóa thông số">🗑️</button>
                                </div>
                            ))}
                            <div style={{ marginTop: '8px' }}>
                                <Button type="button" variant="secondary" width="160px" height="40px" onClick={addSpecification}>+ Thêm thông số</Button>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions-admin">
                        <Button type="submit" variant="primary" width="200px" height="48px">Lưu Sản Phẩm</Button>
                    </div>
                </form>
            </div>

            {/* Gemini Chatbot Toggle Button */}
            <button
                className="gemini-chat-toggle-btn"
                onClick={() => setShowGeminiChat(!showGeminiChat)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#4285F4', // Google Blue
                    color: 'white',
                    fontSize: '24px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title="Mở Chatbot Gemini"
            >
                🤖
            </button>

            {/* Gemini Chatbot Window */}
            {showGeminiChat && (
                <div
                    className="gemini-chat-window"
                    style={{
                        position: 'fixed',
                        bottom: '90px',
                        right: '20px',
                        width: '350px',
                        height: '450px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    <div
                        className="gemini-chat-header"
                        style={{
                            backgroundColor: '#4285F4',
                            color: 'white',
                            padding: '10px 15px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px'
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Gemini Chatbot</h3>
                        <button
                            onClick={() => setShowGeminiChat(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '20px',
                                cursor: 'pointer'
                            }}
                        >
                            &times;
                        </button>
                    </div>
                    <div
                        className="gemini-chat-messages"
                        style={{
                            flexGrow: 1,
                            padding: '10px',
                            overflowY: 'auto',
                            backgroundColor: '#f9f9f9'
                        }}
                    >
                        {geminiMessages.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>
                                Xin chào! Tôi có thể giúp gì cho bạn trong việc nhập liệu sản phẩm?
                            </p>
                        )}
                        {geminiMessages.map((msg, index) => (
                            <div key={index} className={`gemini-message-container ${msg.type}`}>
                                <div className="gemini-message-bubble">
                                    {msg.text}
                                    {/* Nếu tin nhắn từ Gemini và có data, hiển thị nút "Áp dụng" */}
                                    {msg.type === 'gemini' && msg.data && (
                                        <button
                                            className="gemini-apply-btn"
                                            onClick={() => handleApplySuggestion(msg.data)}
                                        >
                                            Áp dụng vào Form
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isGeminiLoading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <span style={{ backgroundColor: '#E0E0E0', padding: '8px 12px', borderRadius: '15px', fontSize: '14px' }}>Đang suy nghĩ...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div
                        className="gemini-chat-input-area"
                        style={{
                            display: 'flex',
                            padding: '10px',
                            borderTop: '1px solid #eee'
                        }}
                    >
                        <input
                            type="text"
                            value={geminiInput}
                            onChange={(e) => setGeminiInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !isGeminiLoading) handleGeminiSend();
                            }}
                            placeholder="Nhập câu hỏi của bạn..."
                            style={{
                                flexGrow: 1,
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '20px',
                                marginRight: '8px',
                                fontSize: '14px'
                            }}
                        />
                        <button
                            onClick={handleGeminiSend}
                            disabled={isGeminiLoading}
                            style={{
                                backgroundColor: '#4285F4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '8px 15px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                opacity: isGeminiLoading ? 0.6 : 1
                            }}
                        >
                            {isGeminiLoading ? '...' : 'Gửi'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddProduct;