import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginReq, type LoginError } from "../../../services/auth.service";

export const useLogin = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [isShowPassword, setIsShowPassword] = useState(false);
    const [stateTypePassword, setTypePassword] = useState("password");
    const [btnTextPassword, setBtnTextPassword] = useState("Hiện");

    const [userName, setUserName] = useState<string>(searchParams.get("userName") || "");
    const [password, setPassword] = useState("");

    const [isErrorUserName, setIsErrorUserName] = useState(false);
    const [isErrorPassword, setIsErrorPassword] = useState(false);

    const [validationError, setValidationError] = useState(false);
    const [authError, setAuthError] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!isShowPassword) {
            setIsShowPassword(true);
            setTypePassword("text");
            setBtnTextPassword("Ẩn");
        } else {
            setIsShowPassword(false);
            setTypePassword("password");
            setBtnTextPassword("Hiện");
        }
    };

    const handSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedUserName = userName.trim();

        const isUserEmpty = trimmedUserName === "";
        const isPassEmpty = password.trim() === "";

        if (isUserEmpty || isPassEmpty) {
            if (isUserEmpty) {
                setIsErrorUserName(true);
                setValidationError(true);
                setAuthError(false);
            }
            if (isPassEmpty) {
                setIsErrorPassword(true);
                setValidationError(true);
                setAuthError(false);
            }

            setTimeout(() => {
                setIsErrorUserName(false);
                setIsErrorPassword(false);
            }, 200);
        } else {
            try {
                setIsLoading(true);
                const roleLogin = await loginReq({ userName: trimmedUserName, password });
                
                setLoginSuccess(true);
                setAuthError(false);
                setValidationError(false);

                setTimeout(() => {
                    navigate(roleLogin === "ADMIN" ? "/admin/dashboard" : "/");
                    window.dispatchEvent(new Event("authChanged"));
                }, 2000);
            } catch (error) {
                setIsLoading(false);
                const errorInfo = error as LoginError;
                if (errorInfo.status === 500) navigate("/error500");
                
                setAuthError(true);
                setValidationError(false);
                setIsErrorUserName(true);
                setIsErrorPassword(true);
                setPassword("");
                setTimeout(() => { setIsErrorUserName(false); setIsErrorPassword(false); }, 200);
            }
        }
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => { navigate("/forgot-password", { state: { username: userName } }); }, 800);
    };

    return { userName, setUserName, password, setPassword, stateTypePassword, btnTextPassword, isErrorUserName, isErrorPassword, validationError, authError, loginSuccess, isLoading, handClick, handSubmit, handleForgotPassword };
};