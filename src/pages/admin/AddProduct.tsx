import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import Alert from "../../component/ui/Alert";
import "./AdminFormUI.css";
import "./AddProduct.css";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { MdChat } from "react-icons/md"
import { useAddProduct } from "../../hooks/features/admin/useAddProduct";

function AddProduct() {
    const {
        navigate, formData, alertMessage, showGeminiChat, setShowGeminiChat, geminiInput, setGeminiInput,
        geminiMessages, isGeminiLoading, messagesEndRef, handleApplySuggestion, handleGeminiSend,
        handleChange, handleVariantTextChange, handleVariantImageChange, addVariant, removeVariant,
        handleSpecificationChange, addSpecification, removeSpecification, handleSubmit, handleAlertClose, getAlertTitle
    } = useAddProduct();

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
                                    <button type="button" className="btn-remove-row" style={{ backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }} onClick={() => removeVariant(index)} title="Xóa phiên bản này">
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <div style={{ marginTop: '8px' }}>
                                <Button type="button" variant="secondary" width="180px" height="40px" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={addVariant}>
                                    <FiPlus size={16} /> Thêm phiên bản
                                </Button>
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
                <MdChat size={24} />
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
                        <h3 style={{ margin: 0, fontSize: '16px' }}>AI Hỗ trợ</h3>
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
                                            onClick={() => handleApplySuggestion(msg.data!)}
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