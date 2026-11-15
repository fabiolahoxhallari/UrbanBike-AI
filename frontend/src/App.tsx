import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  api,
  figureUrl,
  formatDateDots,
  formatDateSq,
  modelLabel,
  type DatesInfo,
  type MetricsInfo,
  type Prediction as PredictionResult,
  type SeriesInfo,
} from "./api";

type IconName =
  | "home"
  | "spark"
  | "chart"
  | "gauge"
  | "info"
  | "calendar"
  | "arrow"
  | "trend"
  | "database"
  | "target"
  | "menu"
  | "close"
  | "check"
  | "clock";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const paths: Record<IconName, React.ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        <path d="M9 21v-7h6v7" />
      </>
    ),
    spark: (
      <>
        <path d="M12 3 10.8 8.1a4 4 0 0 1-2.9 2.9L3 12l4.9 1a4 4 0 0 1 2.9 2.9L12 21l1.2-5.1a4 4 0 0 1 2.9-2.9l4.9-1-4.9-1a4 4 0 0 1-2.9-2.9Z" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M22 19H2" />
      </>
    ),
    gauge: (
      <>
        <path d="M4.9 19a9 9 0 1 1 14.2 0" />
        <path d="m12 13 4-4" />
        <path d="M12 19h.01" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    trend: (
      <>
        <path d="m3 17 6-6 4 4 8-9" />
        <path d="M15 6h6v6" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function BikeMark({ large = false }: { large?: boolean }) {
  return (
    <svg
      className={large ? "hero-bike" : "bike-mark"}
      viewBox="0 0 120 72"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="25" cy="48" r="16" />
      <circle cx="94" cy="48" r="16" />
      <path d="m25 48 20-27 18 27H25Zm38 0 18-30m-7 0h13M45 21h-9m9 0 30 0 19 27M63 48h31" />
      <circle cx="63" cy="48" r="3.5" />
    </svg>
  );
}

const navItems: { label: string; icon: IconName; href: string }[] = [
  { label: "Përmbledhje", icon: "home", href: "permbledhje" },
  { label: "Parashikimi", icon: "spark", href: "parashikimi" },
  { label: "Analiza e të dhënave", icon: "chart", href: "analiza" },
  { label: "Performanca e modelit", icon: "gauge", href: "performanca" },
  { label: "Rreth projektit", icon: "info", href: "rreth" },
];

function Sidebar({ open, close }: { open: boolean; close: () => void }) {
  const [active, setActive] = useState("permbledhje");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.05, 0.25] },
    );
    navItems.forEach(({ href }) => {
      const node = document.getElementById(href);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  const goTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    close();
  };

  return (
    <>
      <button
        className={`sidebar-scrim ${open ? "visible" : ""}`}
        aria-label="Mbyll menunë"
        onClick={close}
      />
      <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Navigimi kryesor">
        <div className="brand">
          <span className="brand-symbol">
            <BikeMark />
          </span>
          <div>
            <strong>UrbanBike</strong>
            <span>AI</span>
          </div>
        </div>
        <nav className="nav-list">
          <p className="nav-label">Platforma</p>
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => goTo(item.href)}
              className={active === item.href ? "active" : ""}
              aria-current={active === item.href ? "page" : undefined}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-card">
          <span className="sidebar-card-icon">
            <Icon name="spark" size={18} />
          </span>
          <strong>Projekt akademik</strong>
          <p>Inteligjencë artificiale për një lëvizje urbane më të zgjuar.</p>
          <span className="data-range">
            <span /> Të dhëna 2011–2012
          </span>
        </div>
        <div className="sidebar-footer">
          Washington, D.C. <span>•</span> ML Study
        </div>
      </aside>
    </>
  );
}

function Topbar({ openMenu }: { openMenu: () => void }) {
  return (
    <header className="topbar">
      <button className="menu-button" onClick={openMenu} aria-label="Hap menunë">
        <Icon name="menu" />
      </button>
      <div className="top-title">
        <strong>UrbanBike AI</strong>
        <span>Parashikimi inteligjent i kërkesës për biçikleta</span>
      </div>
      <div className="ml-badge">
        <span>
          <Icon name="spark" size={13} />
        </span>{" "}
        Powered by Machine Learning
      </div>
    </header>
  );
}

function Hero({ model }: { model?: string }) {
  return (
    <section className="hero" id="permbledhje">
      <div className="hero-copy">
        <div className="eyebrow">
          <span /> Inteligjencë për mobilitetin urban
        </div>
        <h1>
          Parashiko kërkesën.
          <br />
          <em>Planifiko më zgjuar.</em>
        </h1>
        <p>
          Analizojmë të dhënat historike dhe kushtet meteorologjike për të parashikuar kërkesën
          ditore për biçikleta.
        </p>
        <button
          className="text-link"
          onClick={() =>
            document.getElementById("parashikimi")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Eksploro parashikimin <Icon name="arrow" size={17} />
        </button>
      </div>
      <div className="hero-visual">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="visual-grid" />
        <div className="bike-stage">
          <BikeMark large />
        </div>
        <div className="float-pill pill-top">
          <Icon name="trend" size={15} />
          <div>
            <small>Modeli më i mirë</small>
            <strong>{model ? (modelLabel[model] ?? model) : "Ridge Regression"}</strong>
          </div>
        </div>
        <div className="float-pill pill-bottom">
          <span className="pulse" />
          <div>
            <small>Periudha e analizës</small>
            <strong>2011 — 2012</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame = 0;
    const total = 34;
    const tick = () => {
      frame += 1;
      const ease = 1 - Math.pow(1 - frame / total, 3);
      setDisplay(value * ease);
      if (frame < total) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <>
      {display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </>
  );
}

type KpiTone = "pink" | "dark" | "green";

function buildKpis(result: PredictionResult) {
  const model = modelLabel[result.model] ?? result.model;
  return [
    {
      title: "Qiratë e parashikuara",
      value: result.prediction,
      decimals: 2,
      subtitle: `Parashikimi i modelit ${model}`,
      icon: "trend" as IconName,
      tone: "pink" as KpiTone,
    },
    {
      title: "Qiratë reale",
      value: result.actual,
      decimals: 0,
      subtitle: "Të dhënat historike",
      icon: "database" as IconName,
      tone: "dark" as KpiTone,
    },
    {
      title: "Gabimi absolut",
      value: result.absolute_error,
      decimals: 2,
      subtitle: "Diferenca parashikim–realitet",
      icon: "target" as IconName,
      tone: "green" as KpiTone,
    },
  ];
}

function Prediction({
  datesInfo,
  backendError,
  onResult,
}: {
  datesInfo: DatesInfo | null;
  backendError: string | null;
  onResult: (result: PredictionResult | null) => void;
}) {
  const [date, setDate] = useState("");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  // Real call to the Python model: GET /api/predict?date=YYYY-MM-DD
  const runPrediction = async (value: string) => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const response = await api.predict(value);
      if (id !== requestId.current) return; // a newer request already started
      setResult(response);
      onResult(response);
    } catch (err) {
      if (id !== requestId.current) return;
      setResult(null);
      onResult(null);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  // When the list of test dates arrives, show the first test day right away.
  useEffect(() => {
    if (datesInfo && !date) {
      setDate(datesInfo.default);
      runPrediction(datesInfo.default);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datesInfo]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (date) runPrediction(date);
  };

  const connected = Boolean(datesInfo) && !backendError;
  const shownError = backendError ?? error;

  return (
    <section id="parashikimi" className="section-block">
      <div className="prediction-card">
        <div className="prediction-head">
          <div className="section-icon">
            <Icon name="spark" />
          </div>
          <div>
            <span className="section-kicker">Modeli parashikues</span>
            <h2>Parashikimi i kërkesës</h2>
            <p>Zgjidh një datë historike nga seti i testit për të analizuar kërkesën e parashikuar.</p>
          </div>
          <div className={`verified-chip ${connected ? "" : "offline"}`}>
            <Icon name={connected ? "check" : "info"} size={14} />{" "}
            {connected ? "Lidhur me modelin Python" : "Backend-i jo aktiv"}
          </div>
        </div>
        <form className="prediction-form" onSubmit={submit}>
          <label>
            <span>Data e analizës</span>
            <div className="date-wrap">
              <Icon name="calendar" size={19} />
              <input
                type="date"
                min={datesInfo?.min}
                max={datesInfo?.max}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!datesInfo}
                required
              />
            </div>
          </label>
          <button className="primary-button" type="submit" disabled={loading || !datesInfo}>
            {loading ? (
              <>
                <span className="loader" /> Duke analizuar...
              </>
            ) : (
              <>
                Gjenero parashikimin <Icon name="arrow" size={18} />
              </>
            )}
          </button>
          <div className="range-note">
            <Icon name="clock" size={15} />{" "}
            {datesInfo
              ? `Datat e testit: ${formatDateDots(datesInfo.min)} — ${formatDateDots(datesInfo.max)} (modeli nuk i ka parë gjatë trajnimit)`
              : "Duke ngarkuar datat nga backend-i..."}
          </div>
        </form>
      </div>

      <div className={`result-area ${loading ? "loading" : ""}`} aria-live="polite">
        {result && !shownError ? (
          <>
            <div className="result-heading">
              <div>
                <span className="section-kicker">Rezultati për {formatDateSq(result.date)}</span>
                <h3>Përmbledhja e parashikimit</h3>
              </div>
              <span className="source-tag">
                <Icon name="check" size={13} /> Nga modeli real {modelLabel[result.model] ?? result.model}
              </span>
            </div>
            <div className="kpi-grid">
              {buildKpis(result).map((kpi, index) => (
                <article
                  className={`kpi-card ${kpi.tone}`}
                  key={kpi.title}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="kpi-top">
                    <span className="kpi-icon">
                      <Icon name={kpi.icon} size={19} />
                    </span>
                    <span className="kpi-index">0{index + 1}</span>
                  </div>
                  <p>{kpi.title}</p>
                  <strong>
                    <AnimatedNumber value={kpi.value} decimals={kpi.decimals} />
                  </strong>
                  <div className="kpi-foot">
                    <span />
                    {kpi.subtitle}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="demo-empty">
            <span className="empty-icon">
              <Icon name="database" size={26} />
            </span>
            <div>
              <span className="section-kicker">
                {shownError ? "Nuk u mor rezultat" : "Duke pritur rezultatin"}
              </span>
              <h3>
                {shownError ? "Parashikimi nuk u krye" : "Duke kontaktuar modelin Python..."}
              </h3>
              <p>{shownError ?? "Rezultati shfaqet sapo backend-i të përgjigjet."}</p>
            </div>
            {datesInfo && !backendError && (
              <button
                onClick={() => {
                  setDate(datesInfo.default);
                  runPrediction(datesInfo.default);
                }}
              >
                Përdor datën e parë të testit <Icon name="arrow" size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Real line charts (data from the Python backend)
// ---------------------------------------------------------------------------
type ChartPoint = { date: string; a: number; b: number };

const CH = { left: 54, right: 588, top: 30, bottom: 196 };

function LineChart({
  points,
  labelA,
  labelB,
  area,
  ariaLabel,
}: {
  points: ChartPoint[];
  labelA: string;
  labelB: string;
  area?: boolean;
  ariaLabel: string;
}) {
  const id = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const { min, max, ticks } = useMemo(() => {
    const values = points.flatMap((p) => [p.a, p.b]);
    const step = 2000;
    const lo = Math.floor(Math.min(...values, 0) / step) * step;
    const hi = Math.ceil(Math.max(...values, 1) / step) * step;
    const list: number[] = [];
    for (let v = lo; v <= hi; v += step) list.push(v);
    return { min: lo, max: hi, ticks: list };
  }, [points]);

  if (points.length < 2) return <div className="chart-wrap chart-empty">Duke ngarkuar të dhënat...</div>;

  const xAt = (i: number) => CH.left + (i * (CH.right - CH.left)) / (points.length - 1);
  const yAt = (v: number) => CH.bottom - ((v - min) / (max - min || 1)) * (CH.bottom - CH.top);
  const path = (key: "a" | "b") =>
    points.map((p, i) => `${i ? "L" : "M"} ${xAt(i).toFixed(1)} ${yAt(p[key]).toFixed(1)}`).join(" ");

  const pickIndex = (clientX: number) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const svgX = ((clientX - box.left) / box.width) * 600;
    const ratio = (svgX - CH.left) / (CH.right - CH.left);
    setHover(Math.max(0, Math.min(points.length - 1, Math.round(ratio * (points.length - 1)))));
  };

  const onKey = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") setHover((h) => Math.min(points.length - 1, (h ?? -1) + 1));
    if (event.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? 1) - 1));
  };

  const index = hover ?? -1;
  const x = index >= 0 ? xAt(index) : 0;
  const mid = points[Math.floor(points.length / 2)];
  const fmt = (v: number) => Math.round(v).toLocaleString("en-US");

  return (
    <div className="chart-wrap">
      <svg
        ref={svgRef}
        viewBox="0 0 600 230"
        role="img"
        aria-label={ariaLabel}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e879a4" stopOpacity=".18" />
            <stop offset="1" stopColor="#e879a4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid-line" x1={CH.left} x2={CH.right} y1={yAt(t)} y2={yAt(t)} />
            <text className="y-tick" x={CH.left - 8} y={yAt(t) + 3} textAnchor="end">
              {t.toLocaleString("en-US")}
            </text>
          </g>
        ))}
        {area && (
          <path
            d={`${path("a")} L ${CH.right} ${CH.bottom} L ${CH.left} ${CH.bottom} Z`}
            fill={`url(#area-${id})`}
          />
        )}
        <path className="chart-line actual" d={path("a")} />
        <path className="chart-line prediction" d={path("b")} />
        <rect
          x={CH.left}
          y={CH.top - 6}
          width={CH.right - CH.left}
          height={CH.bottom - CH.top + 12}
          fill="transparent"
          tabIndex={0}
          aria-label="Lëviz me shigjetat majtas/djathtas për të parë vlerat"
          onMouseMove={(e) => pickIndex(e.clientX)}
          onFocus={() => setHover((h) => h ?? 0)}
          onBlur={() => setHover(null)}
          onKeyDown={onKey}
        />
        {index >= 0 && (
          <>
            <line className="hover-line" x1={x} x2={x} y1={CH.top} y2={CH.bottom} />
            <circle className="dot actual-dot" cx={x} cy={yAt(points[index].a)} r="4" />
            <circle className="dot prediction-dot" cx={x} cy={yAt(points[index].b)} r="4" />
          </>
        )}
      </svg>
      {index >= 0 && (
        <div
          className="chart-tooltip"
          style={{ left: `${Math.min(78, Math.max(8, (x / 600) * 100))}%` }}
        >
          <strong>{formatDateDots(points[index].date)}</strong>
          <span>
            <i className="navy-dot" /> {labelA}: {fmt(points[index].a)}
          </span>
          <span>
            <i className="pink-dot" /> {labelB}: {fmt(points[index].b)}
          </span>
        </div>
      )}
      <div className="chart-axis real-axis">
        <span>{formatDateDots(points[0].date)}</span>
        <span>{formatDateDots(mid.date)}</span>
        <span>{formatDateDots(points[points.length - 1].date)}</span>
      </div>
    </div>
  );
}

const figureCaptions: Record<string, string> = {
  "01_demand.png": "Kërkesa ditore në periudhën train",
  "02_workingday.png": "Mesatarja: ditë pune kundrejt fundjavës/festës",
  "03_weather.png": "Temperatura (t−7) dhe kërkesa",
  "04_predictions.png": "Testi final: reale kundrejt parashikimeve",
  "05_confusion.png": "Matrica e konfuzionit (klasifikimi)",
};

function Analytics({ series, figures }: { series: SeriesInfo | null; figures: string[] }) {
  const model = series ? (modelLabel[series.model] ?? series.model) : "Ridge";
  const testPoints = useMemo(
    () => series?.test.map((p) => ({ date: p.date, a: p.actual, b: p.prediction })) ?? [],
    [series],
  );
  const trainPoints = useMemo(
    () => series?.train.map((p) => ({ date: p.date, a: p.rentals, b: p.mean7 })) ?? [],
    [series],
  );
  return (
    <section id="analiza" className="section-block">
      <div className="section-title">
        <div>
          <span className="section-kicker">Vizualizim i të dhënave</span>
          <h2>Analiza e kërkesës për biçikleta</h2>
          <p>Një pamje e qartë e sjelljes së modelit dhe ecurisë së kërkesës.</p>
        </div>
        <span className="illustrative-label real">
          {series ? "Të dhëna reale të projektit" : "Duke ngarkuar..."}
        </span>
      </div>
      <div className="charts-grid">
        <article className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Qiratë reale kundrejt parashikimeve</h3>
              <p>Seti i testit, {testPoints.length} ditë (shtator–dhjetor 2012)</p>
            </div>
            <Icon name="trend" size={19} />
          </div>
          <div className="legend">
            <span>
              <i className="navy-line" /> Qiratë reale
            </span>
            <span>
              <i className="pink-line" /> Parashikimet {model}
            </span>
          </div>
          <LineChart
            points={testPoints}
            labelA="Reale"
            labelB={model}
            ariaLabel="Qiratë reale dhe parashikimet e modelit në setin e testit"
          />
          <p className="chart-disclaimer">
            <Icon name="info" size={14} /> Burimi: reports/test_predictions.csv (krijuar nga
            03_train.py).
          </p>
        </article>
        <article className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Ecuria historike e kërkesës</h3>
              <p>Periudha train, {trainPoints.length} ditë: qiratë ditore dhe mesatarja 7-ditore</p>
            </div>
            <Icon name="chart" size={19} />
          </div>
          <div className="legend">
            <span>
              <i className="navy-line" /> Qiratë ditore
            </span>
            <span>
              <i className="pink-line" /> Mesatarja e 7 ditëve të kaluara
            </span>
          </div>
          <LineChart
            points={trainPoints}
            labelA="Qiratë"
            labelB="Mesatarja 7d"
            area
            ariaLabel="Qiratë ditore dhe mesatarja 7-ditore në periudhën train"
          />
          <p className="chart-disclaimer">
            <Icon name="info" size={14} /> Burimi: data/processed/model_data.csv — e njëjta seri si
            figura 01_demand.png.
          </p>
        </article>
      </div>
      {figures.length > 0 && (
        <div className="figure-section">
          <div className="chart-header">
            <div>
              <h3>Figurat origjinale të projektit</h3>
              <p>Grafikët e krijuar nga skriptet Python (reports/figures/)</p>
            </div>
            <Icon name="chart" size={19} />
          </div>
          <div className="figure-grid">
            {figures.map((name) => (
              <figure className="figure-card" key={name}>
                <a href={figureUrl(name)} target="_blank" rel="noreferrer">
                  <img src={figureUrl(name)} alt={figureCaptions[name] ?? name} loading="lazy" />
                </a>
                <figcaption>
                  <strong>{name}</strong>
                  {figureCaptions[name] ?? ""}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

const modelOrder = ["Yesterday", "DummyMean", "Ridge", "RandomForest"];

function Performance({ metrics }: { metrics: MetricsInfo | null }) {
  const selected = metrics?.selected_by_validation_MAE ?? "Ridge";
  const rows = (metrics?.regression ?? [])
    .filter((row) => row.split === "test")
    .sort((a, b) => modelOrder.indexOf(a.model) - modelOrder.indexOf(b.model));
  const bestMae = Math.min(...rows.map((row) => row.MAE));
  const testInfo = metrics?.splits.test;
  return (
    <section id="performanca" className="section-block">
      <div className="section-title">
        <div>
          <span className="section-kicker">Vlerësimi i modeleve</span>
          <h2>Performanca e modeleve</h2>
          <p>
            Krahasim mbi setin e testimit
            {testInfo ? ` (${testInfo.n} ditë, ${formatDateDots(testInfo.start)} — ${formatDateDots(testInfo.end)})` : ""}{" "}
            me metrika të verifikuara.
          </p>
        </div>
        <span className="metric-badge">
          <Icon name="target" size={15} /> {modelLabel[selected] ?? selected} kryeson
        </span>
      </div>
      <div className="performance-layout">
        <div className="table-card">
          <div className="table-overflow">
            <table>
              <thead>
                <tr>
                  <th>Modeli</th>
                  <th>
                    MAE <span>↓</span>
                  </th>
                  <th>
                    RMSE <span>↓</span>
                  </th>
                  <th>
                    R² <span>↑</span>
                  </th>
                  <th>Vlerësimi</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5}>Duke ngarkuar metrikat nga backend-i...</td>
                  </tr>
                )}
                {rows.map((row) => (
                  <tr className={row.model === selected ? "best" : ""} key={row.model}>
                    <td>
                      <span className="model-dot" />{" "}
                      <strong>{modelLabel[row.model] ?? row.model}</strong>
                      {row.model === selected && <em>Më i miri</em>}
                    </td>
                    <td>{row.MAE.toFixed(3)}</td>
                    <td>{row.RMSE.toFixed(3)}</td>
                    <td>{row.R2.toFixed(3)}</td>
                    <td>
                      <div
                        className="score-track"
                        title={`MAE më i mirë / MAE i këtij modeli = ${((bestMae / row.MAE) * 100).toFixed(0)}%`}
                      >
                        <span style={{ width: `${((bestMae / row.MAE) * 100).toFixed(0)}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-note">
            <Icon name="info" size={14} /> Shigjetat tregojnë drejtimin e vlerave më të mira. Modeli
            u zgjodh sipas MAE në validation; shiriti = MAE më i mirë ÷ MAE i modelit.
          </div>
        </div>
        <aside className="metrics-explainer">
          <span className="section-kicker">Si lexohen metrikat?</span>
          <div>
            <strong>MAE</strong>
            <p>Gabimi mesatar absolut. Sa më i ulët, aq më afër realitetit është modeli.</p>
          </div>
          <div>
            <strong>RMSE</strong>
            <p>Penalizon më shumë gabimet e mëdha. Edhe këtu, vlera më e ulët është më e mirë.</p>
          </div>
          <div>
            <strong>R²</strong>
            <p>Tregon sa mirë modeli shpjegon ndryshimin e kërkesës. Sa më afër 1, aq më mirë.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Classification({
  metrics,
  result,
}: {
  metrics: MetricsInfo | null;
  result: PredictionResult | null;
}) {
  const logistic = metrics?.classification.test_metrics.find(
    (row) => row.model === "LogisticRegression",
  );
  const f1 = logistic?.macro_f1 ?? 0;
  const threshold = metrics?.classification.threshold_train_median;
  return (
    <section className="classification section-block">
      <div className="classification-copy">
        <span className="section-kicker">Klasifikimi binar</span>
        <h2>Klasifikimi i kërkesës</h2>
        <p>
          Projekti kategorizon kërkesën ditore në dy nivele, duke ndihmuar në identifikimin e ditëve
          që kërkojnë më shumë kapacitet operacional.
          {threshold !== undefined &&
            ` Pragu është mediana e periudhës train: ${threshold.toLocaleString("en-US")} qira/ditë.`}
        </p>
        <div className="statuses">
          <span className={result?.actual_class === "normal" ? "current" : ""}>
            <i className="normal" /> Kërkesë normale
          </span>
          <span className={result?.actual_class === "high" ? "current" : ""}>
            <i className="high" /> Kërkesë e lartë
          </span>
        </div>
        <div className="classification-note">
          <Icon name="info" size={15} />
          <span>
            {result ? (
              <>
                <strong>{formatDateSq(result.date)}:</strong> qiratë reale{" "}
                {result.actual.toLocaleString("en-US")}{" "}
                {result.actual >= result.class_threshold ? "≥" : "<"} pragu{" "}
                {result.class_threshold.toLocaleString("en-US")} →{" "}
                {result.actual_class === "high" ? "kërkesë e lartë" : "kërkesë normale"}. Kjo është
                klasa reale sipas rregullit, jo parashikim i modelit të klasifikimit.
              </>
            ) : (
              <>
                <strong>Zgjidh një datë</strong> te parashikimi për të parë klasën reale të asaj
                dite.
              </>
            )}
          </span>
        </div>
      </div>
      <div className="f1-card">
        <div className="ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" />
            <circle
              className="progress"
              cx="60"
              cy="60"
              r="50"
              style={{ strokeDashoffset: 314 * (1 - f1) }}
            />
          </svg>
          <div>
            <strong>{logistic ? f1.toFixed(3) : "—"}</strong>
            <span>Macro-F1</span>
          </div>
        </div>
        <p>
          {logistic
            ? `Logistic Regression në test · accuracy ${logistic.accuracy.toFixed(3)} · balanced ${logistic.balanced_accuracy.toFixed(3)}`
            : "Performancë e raportuar e klasifikimit"}
        </p>
        <span className="verified-mini">
          <Icon name="check" size={12} /> Nga classification_metrics.json
        </span>
      </div>
    </section>
  );
}

const process = ["Të dhënat", "Pastrimi", "Analiza", "Trajnimi", "Parashikimi"];
const tech = [
  "Python",
  "Pandas",
  "Scikit-learn",
  "Ridge Regression",
  "Machine Learning",
  "Data Visualization",
];

function About() {
  return (
    <section id="rreth" className="about section-block">
      <div className="about-lead">
        <span className="section-kicker">Nga të dhënat te vendimmarrja</span>
        <h2>Rreth UrbanBike AI</h2>
        <p>
          UrbanBike AI është një projekt akademik i machine learning që përdor të dhëna historike të
          qirave të biçikletave dhe motit nga Washington, D.C., gjatë viteve 2011–2012.
        </p>
      </div>
      <div className="process-card">
        <div className="process">
          {process.map((item, index) => (
            <div className="process-item" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
              {index < process.length - 1 && (
                <i>
                  <Icon name="arrow" size={16} />
                </i>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="tech-row">
        {tech.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <footer>
        <div className="brand footer-brand">
          <span className="brand-symbol">
            <BikeMark />
          </span>
          <div>
            <strong>UrbanBike</strong>
            <span>AI</span>
          </div>
        </div>
        <p>Projekt universitar · Inteligjencë Artificiale · 2025</p>
      </footer>
    </section>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Data loaded once from the Python backend (api_server.py)
  const [datesInfo, setDatesInfo] = useState<DatesInfo | null>(null);
  const [metrics, setMetrics] = useState<MetricsInfo | null>(null);
  const [series, setSeries] = useState<SeriesInfo | null>(null);
  const [figures, setFigures] = useState<string[]>([]);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.dates(), api.metrics(), api.series(), api.figures()])
      .then(([d, m, s, f]) => {
        if (cancelled) return;
        setDatesInfo(d);
        setMetrics(m);
        setSeries(s);
        setFigures(f.figures);
      })
      .catch((err) => {
        if (!cancelled) setBackendError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} close={() => setMenuOpen(false)} />
      <main className="main">
        <Topbar openMenu={() => setMenuOpen(true)} />
        <div className="content">
          <Hero model={metrics?.selected_by_validation_MAE} />
          <Prediction datesInfo={datesInfo} backendError={backendError} onResult={setResult} />
          <Analytics series={series} figures={figures} />
          <Performance metrics={metrics} />
          <Classification metrics={metrics} result={result} />
          <About />
        </div>
        <span className="sr-only">© {currentYear} UrbanBike AI</span>
      </main>
    </div>
  );
}
