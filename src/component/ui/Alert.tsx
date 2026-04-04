import React from "react";
import "./Alert.css"


export interface AlertProps {
    show: boolean,
    title?: "" | "THÔNG BÁO" | "CẢNH BÁO" | "LỖI" ,
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    action?: React.ReactNode,
}


const Alert = ({
    show,
    title,
    type,
    message,
    action
} : AlertProps) => {
    if(!show){
        return null;
    } else {
        return (
            <>
                <div className="alert-overlay"></div>
                <div className="alert-group">
                    <div className={`title-alert alert-${type}`}>
                        {title}
                    </div>
                    <div className="message-alert">
                        {message}
                    </div>
                    <div className="footer-alert">
                        {action}
                    </div>
                </div>
            </>  
        )
    }
}

export default Alert;