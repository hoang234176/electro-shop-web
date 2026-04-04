import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getInfoProfile } from '../services/userServices';

let cachedUserData: any = null;
let fetchPromise: Promise<any> | null = null;

export const clearUserCache = () => {
    cachedUserData = null;
};

export const updateUserCache = (newData: any) => {
    if (cachedUserData) {
        cachedUserData = { ...cachedUserData, ...newData };
    } else {
        cachedUserData = newData;
    }
};

/**
 * Custom hook để quản lý và lấy thông tin người dùng.
 * Tối ưu chống gọi API nhiều lần bằng deduplication & memory cache.
 */
export function useUserData() {
    const location = useLocation();
    const [fetchedUser, setFetchedUser] = useState<any>(cachedUserData);
    const [isLoading, setIsLoading] = useState(!location.state?.userData && !cachedUserData);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchUserInfo = async () => {
            if (location.state?.userData) return;
            
            if (cachedUserData) {
                if (isMounted) {
                    setFetchedUser(cachedUserData);
                    setIsLoading(false);
                }
                return;
            }

            setIsLoading(true);
            try {
                if (!fetchPromise) {
                    fetchPromise = getInfoProfile();
                }
                const data = await fetchPromise;
                cachedUserData = data;
                if (isMounted) {
                    setFetchedUser(data);
                    setError(null);
                }
            } catch (err) {
                console.error("Lỗi lấy thông tin người dùng:", err);
                if (isMounted) setError(err);
            } finally {
                if (isMounted) setIsLoading(false);
                fetchPromise = null;
            }
        };
        fetchUserInfo();

        return () => { isMounted = false; };
    }, [location.state?.userData]);

    const userInfo = location.state?.userData || cachedUserData || fetchedUser || {};

    return { userInfo, isLoading, error };
}