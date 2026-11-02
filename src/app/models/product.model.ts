export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  image: string;
  colors: string[];
  createdAt?: string;
}

export interface ProductFilters {
  search: string;
  categories: string[];
  brands: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number;
  inStockOnly: boolean;
  sort: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}
