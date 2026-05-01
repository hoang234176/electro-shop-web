import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAccount, type InfoErrorRes } from "../../../services/user.service";
import { useUserData } from "../../queries/useUserData";

export const useInfoUser = () => {
    const navigate = useNavigate();
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const { userInfo, isLoading, error } = useUserData();

    const handleDeleteClick = () => {
        setShowDeleteAlert(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteAccount();
            localStorage.removeItem("token");
            setShowDeleteAlert(false);
            navigate("/");
            window.location.reload();
        } catch (error) {
            console.error("Error deleting account:", error);
        } 
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