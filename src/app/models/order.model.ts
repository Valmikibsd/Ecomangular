export interface OrderItem {
  id?: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice?: number;
}

export interface CreateOrderDto {
  userId: number;
  shippingAddress: string;
  paymentMethod: string;
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  cvv?: string;
  items: {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
  }[];
}

export interface Order {
  id: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  transactionId?: string;
  items: OrderItem[];
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}
