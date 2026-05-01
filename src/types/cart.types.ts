export interface DisplayCartItem {
    compositeId: string;
    productId: string;
    color: string;
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
    maxQuantity: number;
}

export interface CartItemVariant {
    color: string;
    image?: string;
    quantity: number;
}

export interface CartItemProduct {
    _id: string;
    name: string;
    price: number;
    variants?: CartItemVariant[];
}

export interface ApiCartItem {
    product: CartItemProduct;
    color: string;
    quantity: number;
}

export interface CheckoutItem {
    productId: string;
    color: string;
    quantity: number;
    price: number;
    name: string;
    imageUrl: string;
    compositeId: string;
}