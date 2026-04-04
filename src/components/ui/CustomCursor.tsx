"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ────────────────────────────────────────────────────────────────
   TouchTexture
   Offscreen canvas used as a grayscale intensity map.
   Stamps paint-brush blobs + random splatter drops along the path.
──────────────────────────────────────────────────────────────── */
class TouchTexture {
  size:    number;
  canvas:  HTMLCanvasElement;
  ctx:     CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  private lx = -1;
  private ly = -1;
  private angle = 0;

  constructor(size = 512) {
    this.size   = size;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvas.height = size;
    this.ctx    = this.canvas.getContext("2d")!;
    this.texture = new THREE.CanvasTexture(this.canvas);
  }

  private _stamp(cx: number, cy: number) {
    const s      = this.size;
    const rShort = s * 0.028;
    const rLong  = s * 0.040;
    const rot    = this.angle + Math.PI / 2;

    this.ctx.globalCompositeOperation = "source-over";

    // Core blob rotated along travel direction
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(rot);
    const g = this.ctx.createRadialGradient(0, 0, 0, 0, 0, rLong);
    g.addColorStop(0,    "rgba(255,255,255,1.0)");
    g.addColorStop(0.45, "rgba(255,255,255,0.80)");
    g.addColorStop(0.75, "rgba(255,255,255,0.30)");
    g.addColorStop(1,    "rgba(255,255,255,0)");
    this.ctx.fillStyle = g;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, rShort, rLong, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  addPoint(nx: number, ny: number) {
    const s  = this.size;
    const cx = nx * s;
    const cy = ny * s;

    if (this.lx < 0) {
      this._stamp(cx, cy);
    } else {
      const dx   = cx - this.lx;
      const dy   = cy - this.ly;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0.5) this.angle = Math.atan2(dy, dx);
      const step = s * 0.010;
      const n    = Math.max(1, Math.ceil(dist / step));
      for (let i = 0; i < n; i++) {
        this._stamp(this.lx + dx * (i / n), this.ly + dy * (i / n));
      }
    }

    this.lx = cx;
    this.ly = cy;
    this.texture.needsUpdate = true;
  }

  fade(dt: number) {
    const alpha = 1 - Math.pow(0.06, dt);
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.fillStyle = `rgba(0,0,0,${Math.min(alpha, 1)})`;
    this.ctx.fillRect(0, 0, this.size, this.size);
    this.ctx.globalCompositeOperation = "source-over";
    this.texture.needsUpdate = true;
  }

  reset() { this.lx = -1; this.ly = -1; }
  dispose() { this.texture.dispose(); }
}

/* ── Vertex ─────────────────────────────────────────────────── */
const vert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

/* ── Paint Fragment ──────────────────────────────────────────── */
const frag = /* glsl */ `
varying vec2 vUv;
uniform sampler2D uTrail;
uniform sampler2D uPrevFrame;
uniform float     uTime;
uniform float     uDecay;

float hue2rgb(float p, float q, float t) {
  t = mod(t, 1.0);
  if (t < 1.0/6.0) return p + (q-p)*6.0*t;
  if (t < 0.5)      return q;
  if (t < 2.0/3.0)  return p + (q-p)*(2.0/3.0-t)*6.0;
  return p;
}
vec3 hsl2rgb(float h, float s, float l) {
  float q = l < 0.5 ? l*(1.0+s) : l+s-l*s;
  float p = 2.0*l - q;
  return vec3(hue2rgb(p,q,h+1.0/3.0), hue2rgb(p,q,h), hue2rgb(p,q,h-1.0/3.0));
}

float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p) {
  vec2 i=floor(p), f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) {
  float v=0.0,a=0.5;
  mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<3;i++){v+=a*vnoise(p);p=m*p;a*=0.5;}
  return v;
}

void main() {
  vec2 uv = vUv;

  float t = uTime * 0.10;
  vec2  q = vec2(fbm(uv*4.0+t), fbm(uv*4.0+vec2(1.7,4.2)+t));
  vec2  d = (q - 0.5) * 0.014;

  vec4 prev = texture2D(uPrevFrame, uv + d) * uDecay;

  float trail = texture2D(uTrail, uv).a;

  float hue   = mod(uTime * 0.40 + uv.x * 1.5 + uv.y * 1.0, 1.0);
  vec3  color = hsl2rgb(hue, 1.0, 0.58);

  float inject = clamp(trail * 2.5, 0.0, 1.0);
  prev.rgb = mix(prev.rgb, color, inject * 0.97);
  prev.a   = max(prev.a, trail * 1.0);

  if (prev.a < 0.020) prev = vec4(0.0);

  gl_FragColor = clamp(prev, 0.0, 1.0);
}`;

/* ── Component ───────────────────────────────────────────────── */
export default function CustomCursor() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    Object.assign(renderer.domElement.style, {
      position: "absolute", inset: "0", width: "100%", height: "100%",
    });
    mount.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

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

    // Clear both buffers so no garbage pixels show on first frame
    renderer.setRenderTarget(rtRead);  renderer.clear();
    renderer.setRenderTarget(rtWrite); renderer.clear();
    renderer.setRenderTarget(null);

    const touch = new TouchTexture(512);

    const paintMat = new THREE.ShaderMaterial({
      vertexShader:   vert,
      fragmentShader: frag,
      uniforms: {
        uTrail:     { value: touch.texture  },
        uPrevFrame: { value: rtRead.texture },
        uTime:      { value: 0             },
        uDecay:     { value: 1             },
      },
      transparent: true,
      depthTest:   false,
      depthWrite:  false,
    });

    const displayMat = new THREE.MeshBasicMaterial({
      map:         rtWrite.texture,
      transparent: true,
      depthTest:   false,
      depthWrite:  false,
    });

    const geo = new THREE.PlaneGeometry(2, 2);
    const paintScene   = new THREE.Scene();
    const displayScene = new THREE.Scene();
    paintScene.add(new THREE.Mesh(geo, paintMat));
    displayScene.add(new THREE.Mesh(geo, displayMat));

    let nx = 0, ny = 0;
    let needsStamp = false;

    const onMove = (e: MouseEvent) => {
      // Pause paint effect when hovering interactive or text elements
      const target = e.target as Element;
      if (target.closest("a, button, input, textarea, select, [role='button'], p, h1, h2, h3, h4, h5, h6, li, label, code")) {
        needsStamp = false;
        return;
      }
      nx = e.clientX / window.innerWidth;
      ny = e.clientY / window.innerHeight;
      needsStamp = true;
    };
    const onLeave = () => touch.reset();

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      rtRead.setSize(window.innerWidth, window.innerHeight);
      rtWrite.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    let raf: number;
    let lastTick = performance.now();
    let elapsed  = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);

      const now = performance.now();
      const dt  = Math.min((now - lastTick) / 1000, 0.1);
      lastTick  = now;
      elapsed  += dt;

      touch.fade(dt);

      if (needsStamp) {
        touch.addPoint(nx, ny);
        needsStamp = false;
      }

      paintMat.uniforms.uDecay.value     = Math.pow(0.15, dt);
      paintMat.uniforms.uTime.value      = elapsed;
      paintMat.uniforms.uPrevFrame.value = rtRead.texture;

      renderer.setRenderTarget(rtWrite);
      renderer.render(paintScene, camera);

      displayMat.map         = rtWrite.texture;
      displayMat.needsUpdate = true;
      renderer.setRenderTarget(null);
      renderer.render(displayScene, camera);

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
      paintMat.dispose();
      displayMat.dispose();
      geo.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-[9998] mix-blend-screen"
    />
  );
}
