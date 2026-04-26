import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type InfoErrorRes } from "../../../services/user.service";
import { useUserData } from "../../queries/useUserData";

export const useInfoUser = () => {
    const navigate = useNavigate();
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const { userInfo, isLoading, error } = useUserData();

    const handleDeleteClick = () => {
        setShowDeleteAlert(true);
    };

    const confirmDelete = () => {
        // Giả lập hành động xóa tài khoản (hoặc gọi API xóa thực tế tại đây)
        localStorage.removeItem("token");
        setShowDeleteAlert(false);
        navigate("/");
        window.location.reload(); 
    };

    const cancelDelete = () => {
        setShowDeleteAlert(false);
    };

    const isLoggedIn = !!localStorage.getItem("token");

    useEffect(() => {
        if (error && (error as InfoErrorRes).status === 500) {
            navigate("/error500");
        }
    }, [error, navigate]);

    return { showDeleteAlert, userInfo, isLoading, error, handleDeleteClick, confirmDelete, cancelDelete, isLoggedIn };
};