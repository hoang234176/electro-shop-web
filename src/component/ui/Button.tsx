import React from "react";
import "./Button.css";

// Kế thừa toàn bộ thuộc tính chuẩn của button HTML (onClick, disabled, type...)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger'; 
    width: string;
    height: string;
}

const Button = ({ 
    width,
    height,
    className, 
    variant,
    type = "button", // Mặc định là nút thường để tránh submit nhầm
    children,        // Dùng children thay cho value
    ...props         // Nhận tất cả các props còn lại (onClick, id, style...)
}: ButtonProps) => {
    return (
        <button 
            style={{ width, height }}
            type={type}
            className={`ui-button btn-${variant} ${className || ""}`}
            {...props} // Rải hết props vào thẻ button thật
        >
            {children} 
        </button>
    );
};

export default Button;