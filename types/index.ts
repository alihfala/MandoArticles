// Types for User
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  avatar?: string;
  bio?: string;
  username?: string;
}

// Types for Article
export interface Article {
  id: string;
  title: string;
  content: string | Record<string, any>;
  featuredImage?: string;
  excerpt?: string;
  slug: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: User;
  likes?: Like[];
}

// Types for Comment
export interface Comment {
  id: string;
  content: string;
  articleId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
}

// Types for Like
export interface Like {
  id: string;
  userId: string;
  articleId: string;
  createdAt: Date;
  user?: User;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
