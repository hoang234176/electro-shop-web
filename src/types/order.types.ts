export interface ShippingInfo {
    fullName: string;
    phone: string;
    address: string;
    note: string;
}

export interface OrderData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkoutItems: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shippingInfo: any;
    paymentMethod: string;
    totalAmount: number;
    subtotal: number;
    shippingFee: number;
    orderId: string;
    isSuccess: boolean;
}

export interface OrderVariant {
    color: string;
    image?: string;
}

export interface OrderProduct {
    _id?: string;
    name?: string;
    variants?: OrderVariant[];
}

export interface OrderItem {
    _id?: string;
    product?: OrderProduct;
    color?: string;
    price: number;
    quantity: number;
}

export interface ApiOrder {
    _id: string;
    createdAt: string | Date;
    totalAmount: number;
    orderStatus: string;
    paymentMethod: string;
    paymentStatus: string;
    cancelRequest?: boolean;
    items: OrderItem[];
}

export interface DisplayOrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

export interface UserDisplayOrder {
    id: string;
    displayId: string;
    status: string;
    date: string;
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    cancelRequest: boolean;
    items: DisplayOrderItem[];
}