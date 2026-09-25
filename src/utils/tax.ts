export const TAX_RATE = parseFloat(import.meta.env.VITE_TAX_RATE || "0.16");

export function formatTaxLabel(): string {
  return `IVA (${(TAX_RATE * 100).toFixed(0)}%)`;
}
