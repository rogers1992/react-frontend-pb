import api from "./api";
import type { Role, RoleCreate, RoleUpdate } from "../types";

export const roleService = {
  getAll: async (signal?: AbortSignal): Promise<Role[]> => {
    const response = await api.get<Role[]>("/roles", { signal });
    return response.data;
  },

  getById: async (id: number): Promise<Role> => {
    const response = await api.get<Role>(`/roles/${id}`);
    return response.data;
  },

  create: async (data: RoleCreate): Promise<Role> => {
    const response = await api.post<Role>("/roles", data);
    return response.data;
  },

  update: async (id: number, data: RoleUpdate): Promise<Role> => {
    const response = await api.put<Role>(`/roles/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },
};
