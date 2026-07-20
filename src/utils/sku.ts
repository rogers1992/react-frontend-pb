const CATEGORY_PREFIXES: Record<string, string> = {
  casco: "CSCO",
  llanta: "LLNT",
  aceite: "ACET",
  freno: "FRNO",
  suspension: "SUSP",
  motor: "MOTO",
  electrical: "ELEC",
  elektrikoa: "ELEC",
  accesorio: "ACES",
  accesorios: "ACES",
  repuesto: "RPTS",
  repuestos: "RPTS",
  herramienta: "HRMT",
  herramientas: "HRMT",
  lubricante: "LUBR",
  filtros: "FLTR",
  filtro: "FLTR",
  cadena: "CDNA",
  escape: "ESCP",
  tanque: "TNQE",
  asiento: "ASNT",
  faro: "FARO",
  luces: "LUCE",
  balatas: "BLTS",
  pastillas: "PSTL",
  amortiguador: "AMTG",
  horquilla: "HRQL",
  rin: "RINX",
  neumatico: "NEUM",
};

const NAME_PREFIXES: Record<string, string> = {
  bell: "BELL",
  alpinestars: "ALPN",
  shoei: "SHEI",
  agv: "AGVX",
  arai: "ARAI",
  michelin: "MICH",
  pirelli: "PRLL",
  dunlop: "DNLP",
  motul: "MOTL",
  castrol: "CSTR",
  brembo: "BREM",
  ohlins: "OHLN",
  kayaba: "KYBA",
  showa: "SHWA",
  akrapovic: "AKRA",
  Yoshimura: "YSHM",
  kn: "KNAF",
  "k&n": "KNAF",
};

function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalize(text: string): string {
  return removeAccents(text.toUpperCase().trim());
}

function extractLetters(text: string): string {
  return normalize(text).replace(/[^A-Z]/g, "");
}

function getCategoryPrefix(categoryName: string): string {
  const key = normalize(categoryName);
  if (CATEGORY_PREFIXES[key]) return CATEGORY_PREFIXES[key];
  const letters = extractLetters(categoryName);
  return letters.slice(0, 4);
}

function getNamePrefix(productName: string): string {
  const normalized = normalize(productName);
  for (const [key, prefix] of Object.entries(NAME_PREFIXES)) {
    if (normalized.includes(key.toUpperCase())) {
      return prefix;
    }
  }
  const letters = extractLetters(productName);
  return letters.slice(0, 4);
}

function getRemainingName(productName: string, usedPrefix: string): string {
  const words = normalize(productName)
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const firstWord = words[0] ?? "";
  const firstWordLetters = extractLetters(firstWord);
  if (firstWordLetters === usedPrefix || firstWordLetters.startsWith(usedPrefix)) {
    return words.slice(1).join(" ");
  }
  return words.join(" ");
}

function abbreviate(text: string, maxLen: number): string {
  const letters = extractLetters(text);
  return letters.slice(0, maxLen);
}

export function generateSku(
  categoryName: string,
  productName: string,
  suffix?: string,
): string {
  const catPrefix = getCategoryPrefix(categoryName);
  const namePrefix = getNamePrefix(productName);

  const remaining = getRemainingName(productName, namePrefix);
  const midPart = remaining ? abbreviate(remaining, 4) : "";

  let sku = midPart ? `${catPrefix}-${namePrefix}-${midPart}` : `${catPrefix}-${namePrefix}`;

  if (suffix) {
    const cleanSuffix = suffix.trim().toUpperCase().replace(/\s+/g, "");
    if (cleanSuffix) {
      sku += `-${cleanSuffix}`;
    }
  }

  return sku;
}
