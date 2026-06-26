import api from "./api";

export async function testConnection() {
  try {
    const response = await api.get("/health");
    console.log("API Connection Successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Connection Failed:", error);
    throw error;
  }
}
