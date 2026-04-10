export interface Address {
  _id: string;
  title: string;
  fullAddress: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: string;
  phone?: string;
  identityNumber?: string;
  profileImage?: string;
  lastLogin?: string;
  addresses: Address[];
  wishlist: string[];
  cart: Array<{
    product: string;
    quantity: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  identityNumber?: string;
  profileImage?: string;
}

export interface AddressPayload {
  title: string;
  fullAddress: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
  isDefault?: boolean;
}
