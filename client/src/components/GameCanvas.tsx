import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";

const KEY_ART = "/manus-storage/open-world-arabia-keyart_444303e0.png";
const EMBLEM = "/manus-storage/open-world-arabia-emblem_6deb2ec1.png";

type HudState = {
  started: boolean;
  shards: number;
  totalShards: number;
  speed: number;
  fuel: number;
  health: number;
  time: string;
  district: string;
  message: string;
  missionComplete: boolean;
  playerX: number;
  playerZ: number;
  dayProgress: number;
};

const initialState: HudState = {
  started: false, shards: 0, totalShards: 3, speed: 0, fuel: 100, health: 100, time: "18:26", district: "قلب المدينة", message: "توجّه إلى منارات الضوء واجمع ثلاثة شظايا", missionComplete: false, playerX: 0, playerZ: -10, dayProgress: 0.18,
};

function MapPanel({ state }: { state: HudState }) {
  const clamp = (value: number) => Math.max(7, Math.min(93, 50 + value * 0.47));
  return (
    <div className="map-panel" aria-label="الخريطة المصغرة">
      <div className="map-grid" />
      <div className="map-road map-road-a" />
      <div className="map-road map-road-b" />
      <div className="map-oasis" style={{ left: "78%", top: "70%" }} />
      <div className="map-marker marker-a" style={{ left: "31%", top: "31%" }} />
      <div className="map-marker marker-b" style={{ left: "68%", top: "39%" }} />
      <div className="map-marker marker-c" style={{ left: "76%", top: "72%" }} />
      <div className="player-marker" style={{ left: `${clamp(state.playerX)}%`, top: `${clamp(state.playerZ)}%` }}><span /></div>
      <div className="map-label map-label-top">مَرسى النور</div>
      <div className="map-label map-label-bottom">واحة السُرى</div>
    </div>
  );
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const [state, setState] = useState(initialState);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const onUpdate = (event: Event) => setState((event as CustomEvent<HudState>).detail);
    window.addEventListener("ow:update", onUpdate);
    return () => window.removeEventListener("ow:update", onUpdate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    let handle: GameHandle | null = null;
    createGameScene(engine, canvas).then((nextHandle) => {
      handle = nextHandle;
      engine.runRenderLoop(() => nextHandle.scene.render());
    });
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  const start = () => {
    window.dispatchEvent(new Event("ow:start"));
    canvasRef.current?.focus();
  };
  const progress = Math.min(100, (state.shards / state.totalShards) * 100);
  const compassRotation = Math.round((state.playerX + state.playerZ) * 0.7);

  return (
    <main className="game-shell" dir="rtl">
      <canvas ref={canvasRef} className="game-canvas" tabIndex={0} aria-label="عالم أفق السرى ثلاثي الأبعاد" style={{ touchAction: "none" }} />
      <div className="hud-layer">
        <header className="hud-topbar">
          <div className="brand-lockup">
            <img src={EMBLEM} alt="شعار أفق السرى" className="brand-emblem" />
            <div><div className="eyebrow">رحلات السُرى</div><div className="brand-title">أُفُق السُرى</div></div>
          </div>
          <div className="topbar-center"><span className="live-dot" /> <span>{state.district}</span><span className="topbar-divider" /> <span>{state.time}</span></div>
          <button className="map-toggle" onClick={() => setShowMap((value) => !value)}>{showMap ? "إخفاء الخريطة" : "فتح الخريطة"}<span className="keycap">M</span></button>
        </header>

        <aside className="mission-card glass-card">
          <div className="card-kicker"><span className="kicker-line" /> المهمة الحالية</div>
          <div className="mission-heading"><div><h1>أصداء الواحة</h1><p>أعد النبض إلى منارات مدينة السُرى.</p></div><img src={EMBLEM} alt="" /></div>
          <div className="mission-progress"><div className="progress-label"><span>شظايا ضوء</span><strong dir="ltr">{state.shards} / {state.totalShards}</strong></div><div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div></div>
          <div className={`mission-status ${state.missionComplete ? "complete" : ""}`}>{state.missionComplete ? "اكتملت المهمة — عد إلى مركز الملاحة" : "العلامات الذهبية تظهر على الخريطة"}</div>
        </aside>

        <section className="left-hud">
          <div className="vitals glass-card"><div className="vital-row"><span>الهيكل</span><div className="vital-bar"><i className="health-fill" style={{ width: `${state.health}%` }} /></div><b>{state.health}%</b></div><div className="vital-row"><span>الوقود</span><div className="vital-bar"><i className="fuel-fill" style={{ width: `${state.fuel}%` }} /></div><b>{state.fuel}%</b></div></div>
          <div className="compass"><span className="compass-ring" style={{ transform: `rotate(${compassRotation}deg)` }}><i>N</i><i>E</i><i>S</i><i>W</i></span><div className="compass-center" /></div>
        </section>

        <div className="toast-message"><span className="toast-icon">✦</span><span>{state.message}</span></div>
        <div className="bottom-bar"><div className="control-hints"><span><kbd>W A S D</kbd> قيادة المركبة</span><span><kbd>E</kbd> تفاعل</span><span><kbd>M</kbd> الخريطة</span></div><div className="speed-readout"><strong>{String(state.speed).padStart(2, "0")}</strong><span>كم/س</span><div className="speed-tick" /></div></div>
        {showMap && <div className="map-modal glass-card"><div className="map-modal-head"><div><div className="card-kicker"><span className="kicker-line" /> خريطة المنطقة</div><h2>نطاق السُرى المفتوح</h2></div><button onClick={() => setShowMap(false)} aria-label="إغلاق الخريطة">×</button></div><MapPanel state={state} /><div className="map-legend"><span><i className="legend-player" /> موقعك</span><span><i className="legend-marker" /> منارة ضوء</span><span><i className="legend-oasis" /> واحة</span></div></div>}
      </div>

      {!state.started && <div className="start-screen" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,10,30,.78), rgba(5,10,30,.28)), url(${KEY_ART})` }}><div className="start-content"><img src={EMBLEM} alt="" className="start-emblem" /><div className="start-kicker">مغامرة عالم مفتوح · نسخة المتصفح</div><h1>مدينةٌ تتنفس<br /><em>حين تصل إليها.</em></h1><p>خذ المقود، اتبع ضوء المنارات، واكتشف أحياء السُرى بين الواحة والمرتفعات.</p><button className="start-button" onClick={start}>ابدأ الرحلة <span>←</span></button><div className="start-note">أفضل تجربة مع لوحة مفاتيح · اضغط W A S D للقيادة</div></div><div className="start-credit">صُنعت للمستكشفين <span>◆</span> أفق السُرى 01</div></div>}
    </main>
  );
}
