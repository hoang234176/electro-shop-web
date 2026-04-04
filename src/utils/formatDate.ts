export const formatDate = (dateString?: string | Date): string => {
    if (!dateString) return "Chưa cập nhật";
    
    const date = new Date(dateString);
    
    // Sử dụng bộ format chuẩn của Javascript (Hỗ trợ tiếng Việt luôn)
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};