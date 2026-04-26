import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { updateInfoUser, type InfoErrorRes } from "../../../services/user.service";
import { updateUserCache } from "../../queries/useUserData";

export const useEditUser = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const userInfo = location.state?.userData || {};

    const [fullname, setfullname] = useState(userInfo.fullname || "");
    const [email, setEmail] = useState(userInfo.email || "");
    const [phone, setPhone] = useState(userInfo.phone || "");
    const [address, setAddress] = useState(userInfo.address || "");

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(localStorage.getItem("avatar") || "");

    const [isShowAlert, setIsShowAlert] = useState(false);
    const isLoggedIn = !!localStorage.getItem("token");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validImageTypes.includes(file.type)) {
                alert("Định dạng tệp không hợp lệ! Vui lòng chỉ chọn ảnh có định dạng .JPEG hoặc .PNG.");
                e.target.value = '';
                return;
            }

            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl !== localStorage.getItem("avatar")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, userInfo.avatar]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const res = await updateInfoUser({ fullName: fullname, email, phone, address, fileAvatar: selectedFile });
            
            if (res.avatarURL) {
                localStorage.setItem("avatar", res.avatarURL);
                window.dispatchEvent(new Event("avatarChanged"));
            }
            
            updateUserCache({ fullname, email, phone, address, avatar: res.avatarURL || userInfo.avatar });
            setIsShowAlert(true);
        } catch (error) {
            const errorInfo = error as InfoErrorRes;
            if (errorInfo.status === 500) { navigate("/error500"); } 
            else { alert(errorInfo.message); }
        }
    };

    const closeAlertAndNavigate = () => {
        setIsShowAlert(false); navigate("/user/info");
    };

    return { navigate, fullname, setfullname, email, setEmail, phone, setPhone, address, setAddress, selectedFile, previewUrl, isShowAlert, isLoggedIn, handleImageChange, handleSubmit, closeAlertAndNavigate };
};