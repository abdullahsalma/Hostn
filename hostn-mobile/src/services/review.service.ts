import api from './api';
import type { Review, PaginatedResponse, ApiResponse } from '../types';

export const reviewService = {
  async getPropertyReviews(propertyId: string, page: number = 1, limit: number = 10) {
    const { data } = await api.get<PaginatedResponse<Review>>(`/reviews/property/${propertyId}`, {
      params: { page, limit },
    });
    return data;
  },

  async createReview(payload: {
    property: string;
    booking: string;
    ratings: {
      overall: number;
      cleanliness: number;
      accuracy: number;
      communication: number;
      location: number;
      value: number;
    };
    comment?: string;
  }) {
    const { data } = await api.post<ApiResponse<Review>>('/reviews', payload);
    return data.data!;
  },
};
