/**
 * Trigger a browser download for a Blob (CSV/etc) by creating a temporary
 * anchor element. No external dependencies.
 *
 * Usage:
 *   const blob = await reportsService.exportCsv('sales', { from, to });
 *   downloadBlob(blob, 'reporte_ventas.csv');
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Revoke on next tick so the click has had time to dispatch.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Convenience: try to honor a Content-Disposition filename from the
 * response headers, falling back to the provided default.
 */
export function filenameFromContentDisposition(
  disposition: string | undefined,
  fallback: string,
): string {
  if (!disposition) return fallback;
  // RFC 6266: attachment; filename="reporte_ventas.csv"
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return match ? match[1] : fallback;
}