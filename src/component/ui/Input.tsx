import React, { useId } from "react"
import "./Input.css"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className? : string,
    label? : string;
}

const Input = ({label,className, ...props}: InputProps) => {
    const generatedId = useId();
    return (
        <div className="input-group">
            <input
                {...props}
                className={`ui-input ${className || ""}`}
                id={generatedId}
                placeholder=" "
            />
            <label htmlFor={generatedId} className="label-input">{label}</label>
        </div>
    )
}

export default Input;