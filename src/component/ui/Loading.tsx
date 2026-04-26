import React, { useState, useEffect } from 'react';
import './Loading.css';

interface LoadingProps {
    fullScreen?: boolean;
    text?: string;
    progress?: number; // Cho phép truyền số % thực tế nếu có
}

const Loading: React.FC<LoadingProps> = ({ fullScreen = false, text = "Đang xử lý...", progress }) => {
    const [simulatedProgress, setSimulatedProgress] = useState(0);

    // Mô phỏng thanh tiến trình chạy dần từ 0 đến 90%
    useEffect(() => {
        if (!fullScreen || progress !== undefined) return;

        const interval = setInterval(() => {
            setSimulatedProgress(old => {
                const step = Math.random() * 25 + 10; // Tăng nhanh ngẫu nhiên từ 10% đến 35%
                return old + step > 90 ? 90 : old + step; // Dừng lại ở 90% đợi quá trình hoàn tất
            });
        }, 200); // Mỗi 0.2s cập nhật 1 lần để tạo cảm giác nhanh hơn

        return () => clearInterval(interval);
    }, [fullScreen, progress]);

    const currentProgress = progress !== undefined ? progress : simulatedProgress;

    if (fullScreen) {
        return (
            <div className="loading-overlay">
                <div className="loading-top-bar">
                    <div className="loading-progress-bar" style={{ width: `${currentProgress}%` }}></div>
                </div>
                {text && <div className="loading-text">{text}</div>}
            </div>
        );
    }

    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            {text && <div className="loading-text">{text}</div>}
        </div>
    );
};

export default Loading;