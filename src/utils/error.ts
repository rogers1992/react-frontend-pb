import { AxiosError } from "axios";
import { RESOURCE_LABELS, ACTION_LABELS } from "../types";

interface ValidationDetail {
  type: string;
  loc: string[];
  msg: string;
}

const PERMISSION_DENIED_RE = /^Permission denied:\s*(\w+)\.(\w+)$/i;

function translateBackendError(msg: string): string {
  const permMatch = msg.match(PERMISSION_DENIED_RE);
  if (permMatch) {
    const [, resource, action] = permMatch;
    const rLabel = RESOURCE_LABELS[resource] ?? resource;
    const aLabel = ACTION_LABELS[action] ?? action;
    return `Permiso denegado: ${aLabel.toLowerCase()} de ${rLabel.toLowerCase()}`;
  }
  if (/not authenticated/i.test(msg)) return "No autenticado";
  if (/invalid credentials/i.test(msg)) return "Credenciales inválidas";
  if (/already exists/i.test(msg)) return "Ya existe";
  if (/not found/i.test(msg)) return "No encontrado";
  if (/invalid token/i.test(msg)) return "Token inválido";
  if (/token (has )?expired/i.test(msg)) return "Token expirado";
  if (/insufficient permission/i.test(msg)) return "Permisos insuficientes";
  if (/internal server error/i.test(msg)) return "Error interno del servidor";
  return msg;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError && error.response?.data?.detail) {
    const detail = error.response.data.detail;

    // Pydantic validation errors: array of {type, loc, msg}
    if (Array.isArray(detail)) {
      const messages = (detail as ValidationDetail[])
        .map((d) => d.msg)
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join(". ");
      }
    }

    // Standard string error message
    if (typeof detail === "string") {
      return translateBackendError(detail);
    }
  }
  return fallback;
}
