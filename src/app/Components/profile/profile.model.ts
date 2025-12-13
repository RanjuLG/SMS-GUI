// Profile models based on API documentation

/**
 * User profile response from GET /api/account/me
 * Contains user details including ID, username, email, and roles
 */
export interface UserProfileDTO {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

/**
 * DTO for updating profile via PUT /api/account/me
 * Matches backend UpdateMyProfileDTO
 * Note: Users can only update their own profile, not their roles (for security)
 */
export interface UpdateMyProfileDTO {
  username: string;
  email: string;
}

/**
 * Response from DELETE /api/account/me
 */
export interface DeleteAccountResponse {
  message: string;
}

/**
 * Legacy UserProfile interface for backwards compatibility
 */
export interface UserProfile {
  id?: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Legacy UpdateProfileRequest for backwards compatibility
 */
export interface UpdateProfileRequest {
  email: string;
  phone: string;
  address: string;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
