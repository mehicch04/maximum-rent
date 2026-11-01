const PRE = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem("mx-intro")||matchMedia("(prefers-reduced-motion: reduce)").matches)return;var f=function(){d.style.setProperty("--is",String(Math.min(innerWidth/(innerWidth<640?880:1060),innerHeight/760,1)))};f();window.__ixr=f;addEventListener("resize",f);d.setAttribute("data-intro","wait")}catch(e){}})()`;

const RUN = `(function(){var d=document.documentElement;if(d.getAttribute("data-intro")!=="wait")return;var s=0;function done(){d.removeAttribute("data-intro");d.style.removeProperty("--is");if(window.__ixr){removeEventListener("resize",window.__ixr);window.__ixr=null}}function go(){if(s)return;s=1;d.setAttribute("data-intro","go");try{sessionStorage.setItem("mx-intro","1")}catch(e){}setTimeout(function(){d.setAttribute("data-intro","out");setTimeout(done,480)},2900)}if(document.visibilityState==="visible")go();else document.addEventListener("visibilitychange",function v(){if(document.visibilityState==="visible"){document.removeEventListener("visibilitychange",v);go()}})})()`;

const SEGMENTS = [
  [540, 315.5],
  [522, 316.5],
  [504, 317.5],
  [486, 318.5],
  [468, 319.5],
  [450, 320.5],
  [432, 321.5],
  [414, 322.5],
] as const;

const DUST = [
  [300, 560, 3, 1, 0],
  [380, 480, 2, 2, -2],
  [460, 620, 3, 3, -4],
  [520, 520, 2, 1, -3],
  [560, 640, 2, 3, -1],
  [760, 520, 3, 2, -3.5],
  [840, 600, 2, 3, -6],
  [900, 470, 2, 1, -0.5],
  [980, 640, 3, 2, -4.5],
  [720, 660, 2, 1, -3.8],
] as const;

const BEAM_GRADIENT =
  "linear-gradient(180deg, rgba(235,242,255,0.42) 0%, rgba(235,242,255,0.1) 55%, rgba(235,242,255,0) 100%)";
const BLOOM =
  "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.42) 0%, rgba(200,220,255,0.14) 35%, rgba(255,255,255,0) 70%)";
const REFLECTION =
  "radial-gradient(ellipse 50% 100% at 50% 0%, rgba(235,242,255,0.26) 0%, rgba(235,242,255,0.07) 45%, rgba(235,242,255,0) 75%)";

export function IntroLoader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PRE }} />
      <div className="ix" aria-hidden="true" role="presentation">
        <div className="ix-stage">
          <div className="ix-fog">
            <div className="ix-blob ix-b1" style={{ left: 80, top: 300, width: 760, height: 420, background: "radial-gradient(ellipse at 50% 50%, rgba(190,210,255,0.08) 0%, rgba(190,210,255,0) 70%)" }} />
            <div className="ix-blob ix-b2" style={{ left: 520, top: 340, width: 700, height: 380, background: "radial-gradient(ellipse at 50% 50%, rgba(190,210,255,0.07) 0%, rgba(190,210,255,0) 70%)" }} />
            <div className="ix-blob ix-b3" style={{ left: 260, top: 180, width: 760, height: 300, background: "radial-gradient(ellipse at 50% 50%, rgba(255,80,90,0.05) 0%, rgba(255,80,90,0) 70%)" }} />
          </div>

          <div className="ix-cam">
            <div className="ix-under" />
            <div className="ix-beam ix-cone" style={{ clipPath: "polygon(330px 330px, 570px 330px, 780px 760px, -40px 760px)", background: BEAM_GRADIENT }} />
            <div className="ix-beam ix-cone" style={{ clipPath: "polygon(710px 330px, 950px 330px, 1320px 760px, 500px 760px)", background: BEAM_GRADIENT }} />
            <div className="ix-beam ix-abs" style={{ left: 290, top: 220, width: 300, height: 220, background: BLOOM }} />
            <div className="ix-beam ix-abs" style={{ left: 690, top: 220, width: 300, height: 220, background: BLOOM }} />

            <div className="ix-wet">
              <div className="ix-ripple ix-abs" style={{ left: 380, top: 556, width: 140, height: 220, background: REFLECTION }} />
              <div className="ix-ripple ix-abs" style={{ left: 760, top: 556, width: 140, height: 220, background: REFLECTION, animationDelay: "-1.2s" }} />
              <div className="ix-ripple ix-abs" style={{ left: 600, top: 566, width: 80, height: 170, background: "radial-gradient(ellipse at 50% 0%, rgba(255,40,52,0.32) 0%, rgba(255,40,52,0) 70%)", animationDelay: "-0.6s" }} />
            </div>

            <div className="ix-dust">
              {DUST.map(([x, y, size, kind, delay], i) => (
                <span
                  key={i}
                  className={`ix-abs ix-p${kind}`}
                  style={{ left: x, top: y, width: size, height: size, borderRadius: "50%", background: "#ffffff", animationDelay: `${delay}s` }}
                />
              ))}
            </div>

            <svg className="ix-abs" width="1280" height="720" viewBox="0 0 1280 720" style={{ left: 0, top: 0 }}>
              <g className="ix-body" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1.5">
                <path d="M 150 470 C 190 360 300 300 430 288 L 850 288 C 980 300 1090 360 1130 470 L 1140 540 C 900 576 380 576 140 540 Z" />
                <path d="M 470 288 C 520 236 760 236 810 288" />
                <path d="M 572 376 L 708 376 L 690 446 L 590 446 Z" />
                <path d="M 584 398 L 696 398 M 588 420 L 692 420" />
                <path d="M 250 500 C 420 520 860 520 1030 500" />
              </g>
              <g fill="none" stroke="#ffffff" strokeLinecap="round" className="ix-glow-w">
                <path className="ix-spec" pathLength={100} strokeWidth="2.5" d="M 150 470 C 190 360 300 300 430 288 L 850 288 C 980 300 1090 360 1130 470" />
                <path className="ix-spec2" pathLength={100} strokeWidth="2" d="M 470 288 C 520 236 760 236 810 288" />
              </g>
              <polygon points="336,346 352,322 420,312 556,306 566,316 548,352 360,360" fill="#0c0c0f" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />
              <polygon points="944,346 928,322 860,312 724,306 714,316 732,352 920,360" fill="#0c0c0f" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />
              <g fill="#16161b" stroke="rgba(255,255,255,0.1)" strokeWidth="1">
                <circle cx="470" cy="334" r="8" />
                <circle cx="500" cy="333" r="8" />
                <circle cx="810" cy="334" r="8" />
                <circle cx="780" cy="333" r="8" />
              </g>
              <g className="ix-lens ix-glow-lens" fill="#ffffff">
                <circle cx="470" cy="334" r="7" />
                <circle cx="500" cy="333" r="7" />
                <circle cx="810" cy="334" r="7" />
                <circle cx="780" cy="333" r="7" />
              </g>
              <g fill="#f2f6ff" className="ix-glow-drl">
                {SEGMENTS.map(([cx, cy], i) => (
                  <rect key={`l${i}`} className={`ix-s${i}`} x={cx - 7} y={cy - 2} width="14" height="4" rx="2" transform={`rotate(-3.3 ${cx} ${cy})`} />
                ))}
                {SEGMENTS.map(([cx, cy], i) => (
                  <rect key={`r${i}`} className={`ix-s${i}`} x={1280 - cx - 7} y={cy - 2} width="14" height="4" rx="2" transform={`rotate(3.3 ${1280 - cx} ${cy})`} />
                ))}
              </g>
              <g className="ix-flick ix-glow-drl" fill="none" stroke="#f2f6ff" strokeLinecap="round">
                <path className="ix-drl" pathLength={100} strokeWidth="4" d="M 548 314 L 410 322 Q 352 326 340 344" />
                <path className="ix-drl" pathLength={100} strokeWidth="4" d="M 732 314 L 870 322 Q 928 326 940 344" />
                <path className="ix-drl" pathLength={100} strokeWidth="2" d="M 526 342 L 446 347" />
                <path className="ix-drl" pathLength={100} strokeWidth="2" d="M 754 342 L 834 347" />
              </g>
              <g fill="#ffffff" className="ix-glow-dot">
                <circle className="ix-d1" cx="530" cy="352" r="3" />
                <circle className="ix-d2" cx="508" cy="353" r="3" />
                <circle className="ix-d3" cx="486" cy="354" r="3" />
                <circle className="ix-d4" cx="464" cy="355" r="3" />
                <circle className="ix-d1" cx="750" cy="352" r="3" />
                <circle className="ix-d2" cx="772" cy="353" r="3" />
                <circle className="ix-d3" cx="794" cy="354" r="3" />
                <circle className="ix-d4" cx="816" cy="355" r="3" />
              </g>
            </svg>

            <div className="ix-flare" />
            <div className="ix-bglow" />
            <img className="ix-badge" src="/intro-shield.png" alt="" width={56} height={59} decoding="async" />
          </div>

          <div className="ix-flash" />
          <span className="ix-load" />
        </div>

        <div className="ix-brand">
          <div className="ix-logo">
            <img src="/logo-dark.png" alt="" width={800} height={239} decoding="async" />
            <span className="ix-sheen" />
          </div>
          <p className="ix-tag">Rent a Car · Hercegovina</p>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: RUN }} />
    </>
  );
}
