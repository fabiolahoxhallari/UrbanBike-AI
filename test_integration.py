"""Automatic check of the integration (uses only the Python standard library
plus pandas, which the project already needs).

Run:  python test_integration.py

It starts api_server.py on a test port, calls the API, and checks that:
  1. every test-date prediction equals the saved reports/test_predictions.csv
  2. actual rentals and absolute error are correct
  3. invalid dates are rejected (HTTP 400)
  4. metrics match reports/results_summary.json
  5. CORS allows only the configured frontend origins
  6. figure files are served, and "../" tricks are blocked
"""
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent
PORT = 8765
BASE = f"http://127.0.0.1:{PORT}"


def get(path, origin=None):
    request = urllib.request.Request(BASE + path)
    if origin:
        request.add_header("Origin", origin)
    try:
        with urllib.request.urlopen(request) as response:
            return response.status, response.headers, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.headers, error.read()


def check(condition, message):
    print(("  OK   " if condition else "  FAIL ") + message)
    if not condition:
        check.failed += 1


check.failed = 0

server = subprocess.Popen([sys.executable, "api_server.py", "--port",
                           str(PORT)], cwd=ROOT)
try:
    for _ in range(50):  # wait up to 10 s for the server
        try:
            if get("/api/health")[0] == 200:
                break
        except OSError:
            time.sleep(0.2)
    else:
        raise SystemExit("Serveri nuk u nis.")

    print("1-2. Parashikimet krahasuar me reports/test_predictions.csv")
    saved = pd.read_csv(ROOT / "reports" / "test_predictions.csv")
    worst = 0.0
    for date, actual, expected in zip(saved.date, saved.rentals,
                                      saved.prediction_Ridge):
        status, _, body = get(f"/api/predict?date={date}")
        result = json.loads(body)
        worst = max(worst, abs(result["prediction"] - expected))
        if result["actual"] != actual or abs(
                result["absolute_error"] - abs(expected - actual)) > 1e-6:
            check(False, f"vlera e gabuar per {date}")
    check(worst < 1e-6, f"{len(saved)} data, diferenca maksimale {worst:.2e}")
    first = json.loads(get("/api/predict?date=2012-09-01")[2])
    check(round(first["prediction"], 2) == 6834.73 and first["actual"] == 6140,
          "2012-09-01: 6834.73 parashikim, 6140 reale")

    print("3. Data jashte setit te testit")
    check(get("/api/predict?date=2011-05-01")[0] == 400, "2011-05-01 -> 400")
    check(get("/api/predict?date=abc")[0] == 400, "abc -> 400")

    print("4. Metrikat")
    summary = json.loads((ROOT / "reports" / "results_summary.json")
                         .read_text())
    metrics = json.loads(get("/api/metrics")[2])
    check(metrics["regression"] == summary["metrics"],
          "metrikat = results_summary.json")

    print("5. CORS")
    headers = get("/api/health", origin="http://localhost:5173")[1]
    check(headers.get("Access-Control-Allow-Origin") ==
          "http://localhost:5173", "localhost:5173 lejohet")
    headers = get("/api/health", origin="http://evil.example")[1]
    check(headers.get("Access-Control-Allow-Origin") is None,
          "origjine e panjohur nuk lejohet")

    print("6. Figurat")
    status, headers, _ = get("/figures/04_predictions.png")
    check(status == 200 and headers["Content-Type"] == "image/png",
          "04_predictions.png sherbehet")
    check(get("/figures/..%2Fapp.py")[0] == 404, "../app.py bllokohet")
finally:
    server.terminate()
    server.wait()

print()
print("TE GJITHA TESTET KALUAN." if check.failed == 0
      else f"{check.failed} TESTE DESHTUAN.")
sys.exit(1 if check.failed else 0)
