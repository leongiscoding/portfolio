"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ── Global mouse (smooth) ─────────────────────────────────── */
const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
if (typeof window !== "undefined") {
  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  });
}

/* ── Vertex shader — breathing sphere ──────────────────────── */
const sphereVert = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  attribute float aRandom;

  void main() {
    vec3 pos = position;

    // Layered sine noise — displaces along the surface normal
    float n =
      sin(pos.x * 1.6 + uTime * 0.9) *
      cos(pos.y * 1.3 + uTime * 0.65) *
      sin(pos.z * 1.9 + uTime * 0.45);
    pos += normalize(position) * n * 0.42;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * (aRandom * 0.7 + 0.3) * (380.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`;

const sphereFrag = /* glsl */ `
  uniform vec3  uColor;
  uniform float uOpacity;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColor, (1.0 - d * 2.0) * uOpacity);
  }
`;

/* ── Vertex shader — background dust ───────────────────────── */
const dustVert = /* glsl */ `
  attribute float aSize;
  uniform float uTime;

  void main() {
    vec3 pos = position;
    pos.y += sin(pos.x * 0.5 + uTime * 0.3) * 0.15;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (260.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`;

const dustFrag = /* glsl */ `
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(0.45, 0.45, 0.45, (1.0 - d * 2.0) * 0.22);
  }
`;

/* ── Particle Sphere ─────────────────────────────────────────── */
function ParticleSphere() {
  const groupRef = useRef<THREE.Group>(null!);
  const matRef   = useRef<THREE.ShaderMaterial>(null!);
  const count    = 2000;

  const { positions, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

    for (let i = 0; i < count; i++) {
      const y  = 1 - (i / (count - 1)) * 2;
      const r  = Math.sqrt(Math.max(0, 1 - y * y));
      const th = phi * i;
      const R  = 4.0;
      pos[i * 3]     = Math.cos(th) * r * R;
      pos[i * 3 + 1] = y * R;
      pos[i * 3 + 2] = Math.sin(th) * r * R;
      rnd[i] = Math.random();
    }
    return { positions: pos, randoms: rnd };
  }, []);

  const uniforms = useMemo(() => ({
    uTime:    { value: 0 },
    uSize:    { value: 4.0 },
    uColor:   { value: new THREE.Color("#FF2C2C") },
    uOpacity: { value: 0.9 },
  }), []);

  useFrame(({ clock }) => {
    // Smooth mouse lerp
    mouse.sx += (mouse.x - mouse.sx) * 0.06;
    mouse.sy += (mouse.y - mouse.sy) * 0.06;

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y +=
        (mouse.sx * 1.4 - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x +=
        (-mouse.sy * 0.7 - groupRef.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aRandom"   args={[randoms,    1]} />
        </bufferGeometry>
                <shaderMaterial
          ref={matRef}
          vertexShader={sphereVert}
          fragmentShader={sphereFrag}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/* ── Background dust ─────────────────────────────────────────── */
function DustField() {
  const meshRef  = useRef<THREE.Points>(null!);
  const matRef   = useRef<THREE.ShaderMaterial>(null!);
  const count    = 900;

  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 36;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18;
      siz[i] = Math.random() * 1.8 + 0.4;
    }
    return { positions: pos, sizes: siz };
  }, []);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.elapsedTime * 0.018;
    if (matRef.current)  matRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes,     1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={dustVert}
        fragmentShader={dustFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

/* ── Ring orbiting the sphere ────────────────────────────────── */
function Ring() {
  const ref  = useRef<THREE.Mesh>(null!);
  const count = 300;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const R = 5.4 + (Math.random() - 0.5) * 0.6;
      pos[i * 3]     = Math.cos(angle) * R;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 2] = Math.sin(angle) * R;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.12;
      ref.current.rotation.x = 0.3 + mouse.sy * 0.15;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#FF2C2C"
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Canvas export ───────────────────────────────────────────── */
export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 11], fov: 45 }}
      dpr={[1, 1]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 8]}  intensity={1.2} color="#FF2C2C" />
      <pointLight position={[-8, -6, -4]} intensity={0.3} color="#ffffff" />
      <DustField />
      <ParticleSphere />
      <Ring />
    </Canvas>
  );
}
