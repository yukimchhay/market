export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  bio?: string;
  role?: 'user' | 'admin';
  isBanned?: boolean;
  listingCount?: number;
  createdAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  bannedUsers: number;
  newUsersThisWeek: number;
  newListingsThisWeek: number;
}
export interface Message {
  _id: string;
  conversation: string;
  sender: User | string;
  text: string;
  readBy: string[];
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  listing?: Pick<Listing, "_id" | "title" | "images" | "price" | "currency">;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount?: number;
}

export interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: 'USD' | 'KHR';
  category: string;
  condition: 'New' | 'Used';
  images: string[];
  location: string;
  seller: User | string;
  status: 'active' | 'sold' | 'inactive';
  views: number;
  createdAt: string;
}

export const CATEGORIES = [
  'Vehicles',
  'Electronics',
  'Property',
  'Jobs',
  'Home & Furniture',
  'Fashion',
  'Services',
  'Other',
];
