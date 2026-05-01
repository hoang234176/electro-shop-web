export interface ReviewUser {
    _id: string;
    fullname?: string;
}

export interface Review {
    _id?: string;
    user?: ReviewUser;
    rating: number;
    comment?: string;
    createdAt: string | Date;
}