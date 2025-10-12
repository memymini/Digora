export interface ApiResponse<T> {
  success: boolean;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
