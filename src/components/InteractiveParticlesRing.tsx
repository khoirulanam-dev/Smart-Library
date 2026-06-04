"use client";

import { useEffect, useRef } from "react";

type ThreeModule = typeof import("three");

type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions,
    ) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

let threeModulePromise: Promise<ThreeModule> | undefined;

const loadThree = () => {
  threeModulePromise ??= import("three");
  return threeModulePromise;
};

export default function InteractiveParticlesRing() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const win = window as IdleWindow;
    const prefersReducedMotion = win.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    let disposed = false;
    let cleanupScene: (() => void) | undefined;

    const startScene = async () => {
      const mount = mountRef.current;
      if (!mount || disposed) return;

      const THREE = await loadThree();
      if (!mountRef.current || disposed) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
      camera.position.z = 7;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const particleCount = 520;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const colorA = new THREE.Color("#00e5ff");
      const colorB = new THREE.Color("#10b981");
      const colorC = new THREE.Color("#f59e0b");

      for (let i = 0; i < particleCount; i += 1) {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius =
          1.55 + Math.sin(i * 0.19) * 0.18 + Math.random() * 0.12;
        const tube = (Math.random() - 0.5) * 0.5;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
        positions[i * 3 + 2] = tube;

        const color = i % 17 === 0 ? colorC : i % 3 === 0 ? colorB : colorA;
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.035,
        transparent: true,
        opacity: 0.78,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(geometry, material);
      group.add(points);

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(1.55, 0.006, 10, 150),
        new THREE.MeshBasicMaterial({
          color: "#00e5ff",
          transparent: true,
          opacity: 0.22,
        }),
      );
      group.add(halo);

      const pointer = new THREE.Vector2();
      const targetRotation = new THREE.Vector2();

      const resize = () => {
        const { width, height } = mount.getBoundingClientRect();
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const handlePointerMove = (event: PointerEvent) => {
        const bounds = mount.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        pointer.x = x * 2 - 1;
        pointer.y = -(y * 2 - 1);
        targetRotation.x = pointer.y * 0.45;
        targetRotation.y = pointer.x * 0.55;
      };

      resize();
      window.addEventListener("resize", resize);
      mount.addEventListener("pointermove", handlePointerMove);

      let frame = 0;
      let animationId = 0;
      const animate = () => {
        frame += 0.01;
        group.rotation.x += (targetRotation.x - group.rotation.x) * 0.04;
        group.rotation.y += (targetRotation.y - group.rotation.y) * 0.04;
        points.rotation.z += 0.004;
        halo.rotation.z -= 0.002;
        group.scale.setScalar(1 + Math.sin(frame) * 0.025);
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      };
      animate();

      cleanupScene = () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener("resize", resize);
        mount.removeEventListener("pointermove", handlePointerMove);
        geometry.dispose();
        material.dispose();
        halo.geometry.dispose();
        if (Array.isArray(halo.material)) {
          halo.material.forEach((item) => item.dispose());
        } else {
          halo.material.dispose();
        }
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    let started = false;
    let idleHandle: number | undefined;

    const scheduleStart = () => {
      if (started || disposed) return;
      started = true;
      window.clearTimeout(fallbackHandle);

      idleHandle = win.requestIdleCallback
        ? win.requestIdleCallback(startScene, { timeout: 1600 })
        : window.setTimeout(startScene, 250);
    };

    const mount = mountRef.current;
    const fallbackHandle = window.setTimeout(scheduleStart, 6000);

    mount?.addEventListener("pointerenter", scheduleStart, { once: true });
    mount?.addEventListener("pointermove", scheduleStart, { once: true });
    mount?.addEventListener("touchstart", scheduleStart, { once: true });

    return () => {
      disposed = true;
      window.clearTimeout(fallbackHandle);
      mount?.removeEventListener("pointerenter", scheduleStart);
      mount?.removeEventListener("pointermove", scheduleStart);
      mount?.removeEventListener("touchstart", scheduleStart);

      if (idleHandle !== undefined && win.cancelIdleCallback) {
        win.cancelIdleCallback(idleHandle);
      } else if (idleHandle !== undefined) {
        window.clearTimeout(idleHandle);
      }
      cleanupScene?.();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="absolute -right-6 -top-10 h-52 w-52 md:-right-20 md:-top-16 md:h-72 md:w-72 opacity-80"
    />
  );
}
