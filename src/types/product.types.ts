export interface ProductVariant {
    color?: string;
    quantity?: number;
    image?: string;
}

export interface ApiProduct {
    _id: string;
    name: string;
    price: number;
    brand?: { name?: string } | string;
    category?: { name?: string } | string;
    description?: string;
    variants?: ProductVariant[];
    specifications?: Record<string, string | number>;
    rating?: number;
    reviewCount?: number;
    ratingBreakdown?: { star1: number; star2: number; star3: number; star4: number; star5: number };
}

export interface DisplayProduct {
    id: string;
    brand: string;
    category: string;
    name: string;
    price: number;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    isOutOfStock: boolean;
}

export interface ProductCardItem {
    _id: string;
    name: string;
    price: number;
    variants: ProductVariant[];
    rating?: number;
    reviewCount?: number;
}

export interface RelatedProduct {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    isOutOfStock: boolean;
}