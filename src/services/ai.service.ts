import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not defined in .env file");
}

const aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const runGemini = async (userInput: string): Promise<any> => {
    // Khuôn mẫu JSON được thiết kế riêng cho form React của bạn
    const systemPrompt = `
Bạn là AI chuyên bóc tách dữ liệu sản phẩm công nghệ. 
Câu của người dùng: "${userInput}"

Hãy trích xuất thông tin và trả về CHỈ MỘT OBJECT JSON theo đúng định dạng sau:
{
    "name": "",
    "brand": "",
    "category": "",
    "importPrice": "",
    "price": "",
    "description": "",
    "variants": [
        { "color": "", "quantity": "", "image": ""}
    ],
    "specifications": [
        { "label": "", "value": "" }
    ]
}

Quy tắc bắt buộc:
1. importPrice, price, quantity chỉ lấy phần số (ví dụ: "25000000").
2. specifications: tách các thông số (RAM, ROM, Màn hình, CPU...) thành các object chứa label và value.
3. Nếu không có thông tin, hãy để chuỗi rỗng "" hoặc mảng rỗng [].
4. Tuyệt đối không bọc kết quả trong markdown (\`\`\`json).
5. Lựa chọn danh mục là category. Ví dụ: "điện thoại", "máy tính", ...
6. importPrice, price tìm hiểu trên thị trường giá nhập sỉ và bán lẻ.
7. Mô tả sản phẩm phải viết sao cho lôi cuốn người mua.
8. Thống số kỹ thuật chi tiết càng tốt.
`;

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: systemPrompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        
        throw new Error("Không nhận được dữ liệu từ AI");
    } catch (error) {
        console.error("Lỗi Gemini API:", error);
        throw error;
    }
};

// Tạo bộ nhớ đệm (Cache) để lưu trữ kết quả và Promise, ngăn Strict Mode gọi AI 2 lần cùng lúc
const relatedProductsCache = new Map<string, Promise<string[]> | string[]>();

export const getRelatedProductsFromAI = async (currentProduct: any, availableProducts: any[]): Promise<string[]> => {
    if (availableProducts.length === 0) return [];

    const productId = currentProduct._id || currentProduct.id;

    // 1. Kiểm tra Cache: Nếu đã có dữ liệu hoặc đang chờ API trả về, lấy luôn không gọi lại
    if (relatedProductsCache.has(productId)) {
        return relatedProductsCache.get(productId)!;
    }

    const prompt = `
Tôi đang xem sản phẩm: "${currentProduct.name}".
Danh sách các sản phẩm khác trong cửa hàng:
${availableProducts.map((p: any) => `- ID: ${p._id || p.id}, Tên: ${p.name}`).join('\n')}

Dựa vào danh sách trên, hãy chọn ra tối đa 4 sản phẩm là phụ kiện hoặc sản phẩm liên quan phù hợp và tương thích với sản phẩm tôi đang xem.
Dựa vào các sản phẩm bán chạy mà bạn đã tìm ra hãy sắp xếp chúng từ bán chạy nhất đến không bán chạy nhất.
Lưu ý: 
KHÔNG đề xuất sản phẩm không liên quan hoặc phụ kiện của hãng đối thủ (ví dụ: không đề xuất sạc Samsung cho iPhone).
Chỉ trả về 1 object JSON có định dạng:
{
  "recommendedIds": ["id1", "id2"]
}
`;

    const fetchAI = async () => {
        try {
            const response = await aiClient.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                }
            });

            if (response.text) {
                const jsonData = JSON.parse(response.text);
                const recommendedIds = jsonData.recommendedIds || [];
                // Ghi đè promise bằng kết quả mảng thật sau khi thành công
                relatedProductsCache.set(productId, recommendedIds);
                return recommendedIds;
            }
            return [];
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm liên quan từ AI:", error);
            relatedProductsCache.delete(productId); // Xóa cache lỗi để lần sau có thể thử lại
            return [];
        }
    };

    // 2. Lưu trữ Promise vào Map ngay khi vừa bắt đầu gọi
    const aiPromise = fetchAI();
    relatedProductsCache.set(productId, aiPromise);
    return aiPromise;
};
