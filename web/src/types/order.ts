export interface OrderItem {
    name: string;
    qty: number;
    image: string;
    price: number;
    product: string; // The product ID
}

export interface ShippingAddress {
    fullName?: string;
    address: string;
    city: string;
    district?: string;
    postalCode: string;
    country: string;
    phone?: string;
}

export interface PaymentResult {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
}

export interface PopulatedUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt?: string;
}

export interface Order {
    _id: string;
    id: string; // Redux normalization
    user: string | PopulatedUser;
    orderItems: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    currency?: string;
    paymentResult?: PaymentResult;
    itemsPrice: number;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: string;
    isDelivered: boolean;
    deliveredAt?: string;
    createdAt: string;
    updatedAt: string;
    coupon?: {
        code: string;
        discountAmount: number;
    };
    trackingNumber?: string;
    status?: 'pending' | 'received' | 'preparing' | 'shipped' | 'delivered';
    paymentStatus?: 'pending' | 'failed' | 'paid';
    paymentFailureReason?: string;
}

export interface CreateOrderPayload {
    orderItems: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    idempotencyKey: string;
    itemsPrice: number;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
    coupon?: {
        code: string;
        discountAmount: number;
    };
}
