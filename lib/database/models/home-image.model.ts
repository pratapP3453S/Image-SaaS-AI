// home-image.model.ts

export interface ImageKitFile {
  fileId: string;
  filePath: string;
  thumbnailUrl: string;
  url: string;
  height: number;
  width: number;
  name?: string;
  size?: number;
  fileType?: string;
  tags?: string[];
  AITags?: any[];
  isPrivateFile?: boolean;
  customCoordinates?: string;
  customMetadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface HomeImage extends Omit<ImageKitFile, 'createdAt' | 'updatedAt'> {
  source: 'kit1' | 'kit2';
  liked?: boolean;
  likedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserLike {
  userId: string;          // Clerk user ID
  fileId: string;          // ImageKit file ID
  filePath: string;        // Image path in ImageKit
  url: string;             // Full image URL
  source: 'kit1' | 'kit2'; // Which ImageKit source
  likedAt: Date;           // When the like was created
}

export interface LikeActionPayload {
  fileId: string;
  filePath: string;
  url: string;
  source: 'kit1' | 'kit2';
  action: 'like' | 'unlike';
}

export interface HomeImageResponse {
  images: HomeImage[];
  total?: number;
  skip?: number;
  limit?: number;
  hasMore?: boolean;
}

// For MongoDB document structure
export interface HomeImageDocument extends HomeImage {
  _id?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLikeDocument extends UserLike {
  _id?: string;
}

// For API request/response types
export interface FetchImagesParams {
  skip?: number;
  limit?: number;
  source?: 'kit1' | 'kit2' | 'all';
}

export interface LikeStatusResponse {
  success: boolean;
  liked?: boolean;
  likesCount?: number;
}