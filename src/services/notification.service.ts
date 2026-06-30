import api from "./api";
import type { Notification, UnreadCountResponse } from "../types";

export const notificationService = {
  getAll: async (
    unreadOnly = false,
    skip = 0,
    limit = 50,
  ): Promise<Notification[]> => {
    const response = await api.get<Notification[]>("/notifications", {
      params: { unread_only: unreadOnly, skip, limit },
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<UnreadCountResponse>(
      "/notifications/unread-count",
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
