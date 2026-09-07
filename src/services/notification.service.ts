import api from "./api";
import type { Notification, UnreadCountResponse } from "../types";

export const notificationService = {
  getAll: async (
    unreadOnly = false,
    skip = 0,
    limit = 50,
    signal?: AbortSignal,
  ): Promise<Notification[]> => {
    const response = await api.get<Notification[]>("/notifications", {
      params: { unread_only: unreadOnly, skip, limit },
      signal,
    });
    return response.data;
  },

  getUnreadCount: async (signal?: AbortSignal): Promise<number> => {
    const response = await api.get<UnreadCountResponse>(
      "/notifications/unread-count",
      { signal },
    );
    return response.data.unread_count;
  },

  markRead: async (id: number): Promise<Notification> => {
    const response = await api.patch<Notification>(
      `/notifications/${id}/read`,
    );
    return response.data;
  },

  markAllRead: async (): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
      "/notifications/mark-all-read",
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};
