"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ────────────────────────────────────────────────────────────────
   TouchTexture
   Maintains an offscreen 2D canvas as a grayscale intensity map.
   Mouse positions stamp soft radial gradients; each frame the
   canvas fades slightly so old stamps naturally disappear.
   Wrapped in a THREE.CanvasTexture for direct GPU use.
──────────────────────────────────────────────────────────────── */
class TouchTexture {
  size:  number;
  canvas: HTMLCanvasElement;
  ctx:   CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  private lx = -1;
  private ly = -1;

  constructor(size = 512) {
    this.size    = size;
    this.canvas  = document.createElement("canvas");
    this.canvas.width = this.canvas.height = size;
    this.ctx     = this.canvas.getContext("2d")!;
    this.texture = new THREE.CanvasTexture(this.canvas);
  }

  /** Stamp a single dot at canvas pixel coords. */
  private _stamp(cx: number, cy: number) {
    const r = this.size * 0.075;           // wider blob → thicker smoke trail
    const g = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0,    "rgba(255,255,255,0.92)");
    g.addColorStop(0.4,  "rgba(255,255,255,0.40)");
    g.addColorStop(1,    "rgba(255,255,255,0)");
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.fillStyle = g;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Add a point at normalised position (0–1).
   * Interpolates intermediate stamps so fast swipes produce a continuous trail.
   */
  addPoint(nx: number, ny: number) {
    const s  = this.size;
    const cx = nx * s;
    const cy = ny * s;   // CanvasTexture flipY:true handles the inversion already

    if (this.lx < 0) {
      // First ever point – no interpolation needed
      this._stamp(cx, cy);
    } else {
      const dx   = cx - this.lx;
      const dy   = cy - this.ly;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const step = s * 0.035;                    // stamp every 3.5% of canvas
      const n    = Math.max(1, Math.ceil(dist / step));
      for (let i = 0; i < n; i++) {
        this._stamp(this.lx + dx * (i / n), this.ly + dy * (i / n));
      }
    }

    this.lx = cx;
    this.ly = cy;
    this.texture.needsUpdate = true;
  }

  /** Fade existing intensity — exponential decay, framerate-independent. */
  fade(dt: number) {
    // 1% of trail remains after 1 second regardless of framerate
    const alpha = 1 - Math.pow(0.01, dt);
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.fillStyle = `rgba(0,0,0,${Math.min(alpha, 1)})`;
    this.ctx.fillRect(0, 0, this.size, this.size);
    this.ctx.globalCompositeOperation = "source-over";
    this.texture.needsUpdate = true;
  }

  /** Reset last-point tracking (e.g. on mouse re-enter). */
  reset() { this.lx = -1; this.ly = -1; }

  dispose() { this.texture.dispose(); }
}

/* ────────────────────────────────────────────────────────────────
   GLSL – Vertex (passthrough)
──────────────────────────────────────────────────────────────── */
const vert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

/* ────────────────────────────────────────────────────────────────
   GLSL – ColorBleed Fragment
   • Samples previous frame with FBM displacement → smoke spread
   • Decays each frame (0.975) → smoke lingers then fades
   • Fresh trail injected with rainbow colour (hue cycles with time)
──────────────────────────────────────────────────────────────── */
const frag = /* glsl */ `
varying vec2 vUv;
uniform sampler2D uTrail;      // grayscale intensity from TouchTexture
uniform sampler2D uPrevFrame;  // last frame output  (ping-pong)
uniform float     uTime;
uniform float     uDecay;      // per-frame decay, time-compensated

/* ── HSL helpers ─────────────────────────────────────────────── */
float hue2rgb(float p, float q, float t) {
  t = mod(t, 1.0);
  if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
  if (t < 0.5)      return q;
  if (t < 2.0/3.0)  return p + (q - p) * (2.0/3.0 - t) * 6.0;
  return p;
}
vec3 hsl2rgb(float h, float s, float l) {
  float q = l < 0.5 ? l*(1.0+s) : l+s-l*s;
  float p = 2.0*l - q;
  return vec3(hue2rgb(p,q,h+1.0/3.0), hue2rgb(p,q,h), hue2rgb(p,q,h-1.0/3.0));
}

/* ── Value noise + FBM ───────────────────────────────────────── */
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p) {
  vec2 i=floor(p), f=fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
}
float fbm(vec2 p) {
  float v=0.0, a=0.5;
  mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<4;i++){v+=a*vnoise(p);p=m*p;a*=0.5;}
  return v;
}

void main() {
  vec2 uv = vUv;

  /* FBM displacement → organic, wiggly smoke spread */
  float t  = uTime * 0.12;
  vec2  q  = vec2(fbm(uv*3.0 + t), fbm(uv*3.0 + vec2(1.3,3.7) + t));
  vec2  d  = (q - 0.5) * 0.018;

  /* Bleed previous frame through noise, then decay */
  vec4 prev = texture2D(uPrevFrame, uv + d) * uDecay;

  /* Fresh trail intensity */
  float trail = texture2D(uTrail, uv).a;

  /* Rainbow hue: time cycling + spatial offset per UV position
     → different parts of the trail glow different colours         */
  float hue   = mod(uTime * 0.22 + uv.x * 0.70 + uv.y * 0.50, 1.0);
  vec3  color = hsl2rgb(hue, 1.0, 0.62);

  /* Where the trail is fresh, MIX toward the target colour instead
     of adding — prevents RGB channels saturating to white          */
  float inject = clamp(trail * 3.5, 0.0, 1.0);
  prev.rgb = mix(prev.rgb, color, inject * 0.92);
  prev.a   = max(prev.a, trail * 0.96);

  gl_FragColor = clamp(prev, 0.0, 1.0);
}`;

/* ────────────────────────────────────────────────────────────────
   Component
──────────────────────────────────────────────────────────────── */
export default function CustomCursor() {
  const mountRef = useRef<HTMLDivElement>(null);
  const dotRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    /* ── Renderer ─────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(1);                      // keep 1× — smoke is low-res by nature
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    Object.assign(renderer.domElement.style, {
      position: "absolute", inset: "0", width: "100%", height: "100%",
    });
    mount.appendChild(renderer.domElement);

    /* ── Orthographic camera for fullscreen quad ──────────── */
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    /* ── Ping-pong render targets (half res — smoke is soft, saves GPU) ── */
    const rtOpts = {
      type:        THREE.HalfFloatType  as THREE.TextureDataType,
      minFilter:   THREE.LinearFilter   as THREE.MinificationTextureFilter,
      magFilter:   THREE.LinearFilter   as THREE.MagnificationTextureFilter,
      depthBuffer: false,
    };
    const rtW = Math.floor(window.innerWidth  / 2);
    const rtH = Math.floor(window.innerHeight / 2);
    let rtRead  = new THREE.WebGLRenderTarget(rtW, rtH, rtOpts);
    let rtWrite = new THREE.WebGLRenderTarget(rtW, rtH, rtOpts);

    /* ── TouchTexture ─────────────────────────────────────── */
    const touch = new TouchTexture(512);

    /* ── Smoke shader ─────────────────────────────────────── */
    const smokeMat = new THREE.ShaderMaterial({
      vertexShader:   vert,
      fragmentShader: frag,
      uniforms: {
        uTrail:     { value: touch.texture    },
        uPrevFrame: { value: rtRead.texture   },
        uTime:      { value: 0                },
        uDecay:     { value: 1                },
      },
      transparent: true,
      depthTest:   false,
      depthWrite:  false,
    });

    /* ── Display (blit) material ──────────────────────────── */
    const displayMat = new THREE.MeshBasicMaterial({
      map:         rtWrite.texture,
      transparent: true,
      depthTest:   false,
      depthWrite:  false,
    });

    /* ── Scenes ───────────────────────────────────────────── */
    const geo = new THREE.PlaneGeometry(2, 2);
    const smokeScene   = new THREE.Scene();
    const displayScene = new THREE.Scene();
    smokeScene.add(new THREE.Mesh(geo, smokeMat));
    displayScene.add(new THREE.Mesh(geo, displayMat));

    /* ── Mouse tracking ───────────────────────────────────── */
    let nx = 0, ny = 0;
    let lastMove = -Infinity;
    let needsStamp = false;

    const onMove = (e: MouseEvent) => {
      nx = e.clientX / window.innerWidth;
      ny = e.clientY / window.innerHeight;
      lastMove    = performance.now();
      needsStamp  = true;

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`;
        dotRef.current.style.opacity = "1";
      }
    };
    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = "0";
      touch.reset();
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    /* ── Resize ───────────────────────────────────────────── */
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      rtRead.setSize(window.innerWidth, window.innerHeight);
      rtWrite.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    /* ── Render loop ──────────────────────────────────────── */
    let raf: number;
    let lastTick = performance.now();
    let elapsed  = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);

      // Delta-time — must be computed first
      const now = performance.now();
      const dt  = Math.min((now - lastTick) / 1000, 0.1);
      lastTick  = now;
      elapsed  += dt;

      // Fade the trail canvas proportional to elapsed time
      touch.fade(dt);

      // Stamp once per mousemove event (not every frame)
      if (needsStamp) {
        touch.addPoint(nx, ny);
        needsStamp = false;
      }

      smokeMat.uniforms.uDecay.value     = Math.pow(0.015, dt); // full trail gone in ~1s
      smokeMat.uniforms.uTime.value      = elapsed;
      smokeMat.uniforms.uPrevFrame.value = rtRead.texture;

      // 1. Compute smoke → write to rtWrite
      renderer.setRenderTarget(rtWrite);
      renderer.render(smokeScene, camera);

      // 2. Display rtWrite to screen
      displayMat.map         = rtWrite.texture;
      displayMat.needsUpdate = true;
      renderer.setRenderTarget(null);
      renderer.render(displayScene, camera);

      // 3. Swap ping-pong buffers
      const tmp = rtRead;
      rtRead  = rtWrite;
      rtWrite = tmp;
    };

    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize",    onResize);
      document.removeEventListener("mouseleave", onLeave);
      touch.dispose();
      rtRead.dispose();
      rtWrite.dispose();
      smokeMat.dispose();
      displayMat.dispose();
      geo.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      {/* WebGL canvas mount — screen blend makes smoke invisible on light backgrounds */}
      <div
        ref={mountRef}
        className="fixed inset-0 pointer-events-none z-[9998] mix-blend-screen"
      />
      {/* Crisp cursor dot at exact mouse position — zero lag */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[10px] h-[10px] rounded-full bg-white border border-white/20 pointer-events-none z-[9999]"
        style={{ opacity: 0, willChange: "transform" }}
      />
    </>
  );
}
