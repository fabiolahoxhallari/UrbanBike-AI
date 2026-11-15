# UrbanBike AI — Integrated application (Figma frontend + Python model)

This folder now has **two ways** to use the same trained model:

| What | File | Address | Status |
|---|---|---|---|
| Original simple app | `app.py` | http://127.0.0.1:8000 | **unchanged** |
| New JSON API for the Figma design | `api_server.py` | http://127.0.0.1:8001 | new |
| Figma Make design (React + Vite) | `frontend/` | http://127.0.0.1:5173 | connected to the API |

Nothing in the machine learning pipeline was changed. `01_clean.py`,
`02_visualize.py`, `03_train.py`, `04_classify.py`, `run_all.py`, `config/`,
`data/` and `reports/` are exactly as before. The model is **not retrained**
by the website: `api_server.py` only *loads* `models/regression.joblib`.

## How it works (simple explanation)

```
Browser (Figma design)  --->  Vite dev server :5173  --->  api_server.py :8001  --->  Ridge model
   button "Gjenero"            forwards /api/*              predict(date)             (joblib file)
```

1. The user picks a date and clicks **Gjenero parashikimin**.
2. The page sends `GET /api/predict?date=2012-09-01`.
3. `api_server.py` finds that day in the **test set**, gives its features to the
   saved Ridge model, and returns the prediction, the real rentals and the
   absolute error. This is the same `predict()` logic as in `app.py`.
4. The page shows the three numbers in the pink/dark/green cards.

Only **test dates (01.09.2012 – 31.12.2012)** can be predicted, because the
model must not be judged on days it learned from. Other dates show a clear
error message instead of an invented number.

## API endpoints

| Endpoint | Returns | Source |
|---|---|---|
| `/api/health` | `{"status": "ok"}` | — |
| `/api/dates` | list of test dates | test split |
| `/api/predict?date=YYYY-MM-DD` | prediction, actual, absolute_error | **live model** |
| `/api/metrics` | MAE / RMSE / R², Macro-F1 | `reports/*.json` |
| `/api/series` | data for the two line charts | `test_predictions.csv`, `model_data.csv` |
| `/api/figures` + `/figures/<name>.png` | original matplotlib figures | `reports/figures/` |

## What changed in the Figma design

The look (white background, pink accents, sidebar, cards, charts) is the same.
Only the **data** changed from hard-coded/illustrative to real:

- Prediction cards → real model output for any test date.
- Chart 1 → real test rentals vs. Ridge predictions (122 days).
- Chart 2 → real train-period rentals and 7-day past average (same as `01_demand.png`).
- New panel with the 5 original project figures.
- Model table → loaded from `results_summary.json`.
- Macro-F1 ring → loaded from `classification_metrics.json`.
- Classification note → the **real** class of the chosen day by the training-median
  rule (3,907 rentals). It is clearly labelled as *not* a classifier prediction.

Files touched in `frontend/`: `src/App.tsx`, `src/index.css` (only new classes
added at the end), `vite.config.ts` (proxy + local host/port), new `src/api.ts`.

## Safety (CORS and configuration)

- Both servers listen on `127.0.0.1` → only your own computer can open them.
- In development the Vite **proxy** forwards `/api` to Python, so the browser
  sees one address and CORS is not needed at all.
- As a fallback, `api_server.py` allows CORS only for `localhost:5173` and
  `localhost:8443` (change with the `URBANBIKE_ALLOWED_ORIGINS` environment variable).
  Any other website is refused.
- The API is read-only (only `GET`), and figure paths cannot escape `reports/figures/`.

---

## How to launch (Windows, VS Code)

### One-time setup

1. Install **Node.js 22 LTS** from https://nodejs.org (needed for the Figma frontend).
   Check in a new terminal: `node --version`.
2. Open this folder in VS Code (**File → Open Folder → `urbanbike-ai-student`**).
3. Python environment (skip if `.venv` already exists):
   ```powershell
   py -3.12 -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   ```
   Then **Python: Select Interpreter → .venv**.
4. Make sure the model exists. `models/` is not stored in Git, so if
   `models\regression.joblib` is missing run once:
   ```powershell
   .\.venv\Scripts\python.exe run_all.py
   ```
   (The pipeline is deterministic: it recreates exactly the same model and the
   same numbers, e.g. Ridge test MAE 893.251.)
5. Install the frontend packages:
   ```powershell
   cd frontend
   npm install
   cd ..
   ```

### Every time: start the app (2 terminals)

**Terminal 1 — Python API**
```powershell
.\.venv\Scripts\python.exe api_server.py
```
You should see `UrbanBike AI API: http://127.0.0.1:8001/api/health`.

**Terminal 2 — Figma frontend**
```powershell
cd frontend
npm run dev
```
Open **http://127.0.0.1:5173**. Stop either server with **Ctrl+C**.

Shortcut: **Terminal → Run Task… → "UrbanBike: Start full app (dev)"** starts both.

### Option: one server only (for the presentation)

```powershell
cd frontend
npm run build
cd ..
.\.venv\Scripts\python.exe api_server.py
```
Now the full app is on **http://127.0.0.1:8001** (Python serves the built design).

### The original app still works

```powershell
.\.venv\Scripts\python.exe app.py
```
→ http://127.0.0.1:8000 (can run at the same time as the new app).

### Test the integration

```powershell
.\.venv\Scripts\python.exe test_integration.py
```
It checks all 122 test dates against `reports/test_predictions.csv`, the error
handling, metrics, CORS and figures. Expected last line: `TE GJITHA TESTET KALUAN.`

On macOS/Linux use `.venv/bin/python` instead of `.\.venv\Scripts\python.exe`.

## Troubleshooting

| Problem | Fix |
|---|---|
| Page says **"Backend-i Python nuk përgjigjet"** | Terminal 1 is not running. Start `api_server.py`. |
| `Modeli mungon. Fillimisht ekzekuto: python run_all.py` | Run `run_all.py` once (step 4). |
| `npm` is not recognized | Install Node.js 22 and open a **new** terminal. |
| Port already in use | `python api_server.py --port 8002` and `$env:URBANBIKE_API_URL="http://127.0.0.1:8002"; npm run dev` |
| Date gives an error | Only 01.09.2012 – 31.12.2012 (test set) can be predicted — by design. |

## Something to show your professor

Pick **29.10.2012**: the model predicts about 5,737 rentals but only **22**
happened (Hurricane Sandy closed Washington, D.C.). It is a good example of why
the model cannot know about events that are not in its features.
