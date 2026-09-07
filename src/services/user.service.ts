import api from "./api";
import type {
  UserWithRole,
  UserCreate,
  UserUpdate,
  UserPasswordReset,
  UserToggleActive,
} from "../types";

export const userService = {
  getAll: async (
    skip = 0,
    limit = 100,
    search?: string,
    role_id?: number,
    is_active?: boolean,
    signal?: AbortSignal,
  ): Promise<UserWithRole[]> => {
    const response = await api.get<UserWithRole[]>("/users", {
      params: { skip, limit, search, role_id, is_active },
      signal,
    });
    return response.data;
  },

  getById: async (id: number): Promise<UserWithRole> => {
    const response = await api.get<UserWithRole>(`/users/${id}`);
    return response.data;
  },

  create: async (data: UserCreate): Promise<UserWithRole> => {
    const response = await api.post<UserWithRole>("/users", data);
    return response.data;
  },

  update: async (id: number, data: UserUpdate): Promise<UserWithRole> => {
    const response = await api.put<UserWithRole>(`/users/${id}`, data);
    return response.data;
  },

  toggleActive: async (
    id: number,
    is_active: boolean,
  ): Promise<UserWithRole> => {
    const response = await api.patch<UserWithRole>(
      `/users/${id}/toggle-active`,
      { is_active } satisfies UserToggleActive,
    );
    return response.data;
  },

  resetPassword: async (
    id: number,
    new_password: string,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      `/users/${id}/reset-password`,
      { new_password } satisfies UserPasswordReset,
    );
    return response.data;
  },
};
