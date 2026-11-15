// Small client for the Python backend (api_server.py).
//
// In development the Vite dev server forwards /api and /figures to Python
// (see `server.proxy` in vite.config.ts), so BASE stays empty and the browser
// never needs CORS. Set VITE_API_BASE_URL only if you want to call the API
// on another address directly, e.g. VITE_API_BASE_URL=http://127.0.0.1:8001
const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export type Prediction = {
  date: string;
  model: string;
  prediction: number;
  actual: number;
  absolute_error: number;
  actual_class: "normal" | "high";
  class_threshold: number;
};

export type DatesInfo = {
  dates: string[];
  min: string;
  max: string;
  default: string;
  split: string;
  model: string;
};

export type RegressionRow = {
  split: "validation" | "test";
  model: string;
  n: number;
  MAE: number;
  RMSE: number;
  R2: number;
};

export type ClassificationRow = {
  model: string;
  accuracy: number;
  balanced_accuracy: number;
  macro_f1: number;
  confusion_matrix: number[][];
};

export type MetricsInfo = {
  selected_by_validation_MAE: string;
  splits: Record<string, { n: number; start: string; end: string }>;
  regression: RegressionRow[];
  classification: {
    threshold_train_median: number;
    test_metrics: ClassificationRow[];
    positive_class: string;
  };
  test_design: string;
};

export type SeriesInfo = {
  test: { date: string; actual: number; prediction: number }[];
  train: { date: string; rentals: number; mean7: number }[];
  model: string;
};

async function getJSON<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, { headers: { Accept: "application/json" } });
  } catch {
    throw new Error(
      "Backend-i Python nuk përgjigjet. Nis serverin me: python api_server.py",
    );
  }
  const body = await response.json().catch(() => null);
  // No JSON (e.g. Vite proxy error page) = the Python server is not running.
  if (body === null) {
    throw new Error(
      "Backend-i Python nuk përgjigjet. Nis serverin me: python api_server.py",
    );
  }
  if (!response.ok) {
    throw new Error(body?.error ?? `Gabim nga serveri (HTTP ${response.status})`);
  }
  return body as T;
}

export const api = {
  dates: () => getJSON<DatesInfo>("/api/dates"),
  metrics: () => getJSON<MetricsInfo>("/api/metrics"),
  series: () => getJSON<SeriesInfo>("/api/series"),
  figures: () => getJSON<{ figures: string[] }>("/api/figures"),
  predict: (date: string) =>
    getJSON<Prediction>(`/api/predict?date=${encodeURIComponent(date)}`),
};

export const figureUrl = (name: string) => `${BASE}/figures/${encodeURIComponent(name)}`;

// Readable model names for the UI (the backend uses short names).
export const modelLabel: Record<string, string> = {
  Ridge: "Ridge Regression",
  RandomForest: "Random Forest",
  Yesterday: "Yesterday",
  DummyMean: "DummyMean",
  LogisticRegression: "Logistic Regression",
  DummyMostFrequent: "DummyMostFrequent",
};

const months = [
  "janar", "shkurt", "mars", "prill", "maj", "qershor",
  "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor",
];

/** "2012-09-01" -> "1 shtator 2012" */
export function formatDateSq(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${months[m - 1]} ${y}`;
}

/** "2012-09-01" -> "01.09.2012" */
export function formatDateDots(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
