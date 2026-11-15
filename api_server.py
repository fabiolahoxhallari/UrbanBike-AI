"""UrbanBike AI - JSON API for the Figma (React) frontend.

This file is NEW. It does not replace app.py:
  * app.py         -> the original simple HTML app (port 8000), unchanged
  * api_server.py  -> the same saved model, served as JSON for the new
                      frontend (port 8001). It can also serve the built
                      frontend (frontend/dist) so everything runs on one port.

Nothing is retrained here. The server only LOADS models/regression.joblib
(created by 03_train.py / run_all.py) and the saved reports.

Run:  python api_server.py            (default http://127.0.0.1:8001)
"""
import argparse
import json
import mimetypes
import os
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

import joblib
import pandas as pd

from config.common import ROOT, REPORTS, FIGURES, FEATURES, read_splits

# ---------------------------------------------------------------------------
# 1. Load the trained model and the saved results (same as app.py)
# ---------------------------------------------------------------------------
model_path = ROOT / "models" / "regression.joblib"
if not model_path.exists():
    raise SystemExit("Modeli mungon. Fillimisht ekzekuto: python run_all.py")
bundle = joblib.load(model_path)
selected = bundle["selected"]
summary = json.loads((REPORTS / "results_summary.json").read_text())
classification = json.loads(
    (REPORTS / "classification_metrics.json").read_text()
)
train, valid, test = read_splits()
dates = test.date.dt.strftime("%Y-%m-%d").tolist()
threshold = float(classification["threshold_train_median"])

FRONTEND_DIST = ROOT / "frontend" / "dist"

# Only these browser origins may call the API directly (CORS).
# The Vite dev server normally uses a proxy, so CORS is only a fallback.
DEFAULT_ORIGINS = ",".join([
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:8443", "http://127.0.0.1:8443",
])
ALLOWED_ORIGINS = {
    origin.strip()
    for origin in os.environ.get("URBANBIKE_ALLOWED_ORIGINS",
                                 DEFAULT_ORIGINS).split(",")
    if origin.strip()
}


# ---------------------------------------------------------------------------
# 2. Prediction - identical logic to predict() in app.py
# ---------------------------------------------------------------------------
def predict(date):
    if date not in dates:
        raise ValueError(
            f"Zgjidh nje date nga seti i testit ({dates[0]} - {dates[-1]})."
        )
    row = test.loc[test.date == pd.Timestamp(date)]
    model = bundle["models"][selected]
    value = float(max(0, model.predict(row[FEATURES])[0]))
    actual = int(row.iloc[0].rentals)
    return {
        "date": date, "model": selected,
        "prediction": value, "actual": actual,
        "absolute_error": abs(value - actual),
        # Extra context (not a model output): the teaching rule from
        # 04_classify.py applied to the REAL rentals of that day.
        "actual_class": "high" if actual >= threshold else "normal",
        "class_threshold": threshold,
    }


# ---------------------------------------------------------------------------
# 3. Data for the charts and tables (read from saved files, not invented)
# ---------------------------------------------------------------------------
def dates_info():
    return {"dates": dates, "min": dates[0], "max": dates[-1],
            "default": dates[0], "split": "test", "model": selected}


def metrics_info():
    return {
        "selected_by_validation_MAE": summary["selected_by_validation_MAE"],
        "splits": summary["splits"],
        "regression": summary["metrics"],
        "classification": classification,
        "test_design": summary["test_design"],
    }


def series_info():
    saved = pd.read_csv(REPORTS / "test_predictions.csv")
    column = "prediction_" + selected
    return {
        # Chart 1: real test rentals vs. saved model predictions (03_train.py)
        "test": [
            {"date": d, "actual": int(a), "prediction": round(float(p), 2)}
            for d, a, p in zip(saved.date, saved.rentals, saved[column])
        ],
        # Chart 2: train period, same series as figure 01_demand.png
        "train": [
            {"date": d.strftime("%Y-%m-%d"), "rentals": int(r),
             "mean7": round(float(m), 2)}
            for d, r, m in zip(train.date, train.rentals, train.rentals_mean7)
        ],
        "model": selected,
    }


def figures_info():
    return [p.name for p in sorted(FIGURES.glob("*.png"))]


# ---------------------------------------------------------------------------
# 4. HTTP server
# ---------------------------------------------------------------------------
class Handler(BaseHTTPRequestHandler):
    def cors_headers(self):
        origin = self.headers.get("Origin")
        if origin and origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def send(self, body, kind, status=200):
        data = body if isinstance(body, bytes) else body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", kind)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.cors_headers()
        self.end_headers()
        self.wfile.write(data)

    def send_json(self, value, status=200):
        self.send(json.dumps(value, ensure_ascii=False),
                  "application/json; charset=utf-8", status)

    def do_OPTIONS(self):
        self.send_response(204)
        self.cors_headers()
        self.end_headers()

    def do_GET(self):
        url = urlparse(self.path)
        path = url.path
        query = parse_qs(url.query)

        if path == "/api/health":
            return self.send_json({"status": "ok", "model": selected})
        if path == "/api/dates":
            return self.send_json(dates_info())
        if path == "/api/predict":
            date = query.get("date", [dates[0]])[0]
            try:
                return self.send_json(predict(date))
            except ValueError as error:
                return self.send_json({"error": str(error)}, 400)
        if path == "/api/metrics":
            return self.send_json(metrics_info())
        if path == "/api/series":
            return self.send_json(series_info())
        if path == "/api/figures":
            return self.send_json({"figures": figures_info()})
        if path.startswith("/figures/"):
            # Path(...).name blocks "../" tricks: only files in FIGURES
            file = FIGURES / Path(path).name
            if file.suffix == ".png" and file.is_file():
                return self.send(file.read_bytes(), "image/png")
            return self.send_json({"error": "Nuk u gjet."}, 404)
        if path.startswith("/api/"):
            return self.send_json({"error": "Nuk u gjet."}, 404)
        return self.serve_frontend(path)

    def serve_frontend(self, path):
        """Serve frontend/dist (after `npm run build`) on the same port."""
        if not FRONTEND_DIST.is_dir():
            return self.send(
                "API po punon. Frontend-i nuk eshte ndertuar ende.\n"
                "Zhvillim: cd frontend && npm run dev\n"
                "Ose: cd frontend && npm run build, pastaj rifillo serverin.",
                "text/plain; charset=utf-8")
        root = FRONTEND_DIST.resolve()
        file = (root / path.lstrip("/")).resolve()
        if not file.is_relative_to(root) or not file.is_file():
            file = root / "index.html"  # single-page app fallback
        kind = mimetypes.guess_type(file.name)[0] or "application/octet-stream"
        if kind.startswith("text/") or kind == "application/javascript":
            kind += "; charset=utf-8"
        return self.send(file.read_bytes(), kind)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8001)
    args = parser.parse_args()
    # 127.0.0.1 = only this computer can reach the server (safe default)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"UrbanBike AI API: http://127.0.0.1:{args.port}/api/health",
          flush=True)
    if FRONTEND_DIST.is_dir():
        print(f"Aplikacioni i plote: http://127.0.0.1:{args.port}",
              flush=True)
    print("Ndalimi: Ctrl+C", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Serveri u ndal.")
    finally:
        server.server_close()
