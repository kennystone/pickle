"use client";

import { useEffect, useRef } from "react";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const DURATION = 16000;

// Ball with trailing lines SVG (noun-pickleball-6530093)
function pickleballSvg(color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" fill="${color}">
 <path d="m375.75 471c1.5-193.88 160.5-361.88 369.38-358.5 198.38 3.375 356.62 162 357 363 0 204-162.75 364.88-369.38 363-199.12-1.875-359.25-166.12-357-367.5zm226.5 50.25c25.5 0 45.75-19.875 46.125-45 0-25.125-20.25-45.75-45.375-46.125-25.125 0-45.75 20.25-46.125 45.375 0 25.125 20.25 45.75 45.375 45.75zm182.62-181.88c0-25.125-20.625-45.75-45.75-45.75-25.5 0-45.75 20.25-45.75 45.75 0 25.125 20.625 45.75 45.75 45.75 24.75 0 45.75-21 45.75-45.75zm91.125 181.88c25.125 0 45.75-20.625 45.375-45.75 0-24.75-21.375-45.75-46.125-45.375-25.125 0-45.375 21-45.375 46.125 0 25.5 20.625 45.375 45.75 45zm-91.125 91.125c0-25.125-20.625-45.75-45.75-45.375-25.125 0-45.375 20.625-45.375 45.75s20.625 45.75 45.75 45.375c25.125 0 45.75-20.625 45.375-45.75zm64.875-356.25c14.25 0 25.125-3.75 31.5-15s4.125-22.5-2.625-33c-10.875-17.25-27.375-26.625-47.625-27.75-12-0.75-23.25 3.375-30 14.25-6.375 10.875-4.5 21.75 1.5 32.25 10.875 18.375 27.75 27.375 47.25 28.875zm2.25 438.75c-22.125 0-43.875 14.25-52.125 34.125-7.875 19.5 1.875 37.125 22.5 40.5 20.625 3.75 44.25-7.5 55.875-26.625 6.375-10.5 9.375-21.75 3-33s-17.25-15-29.625-15zm106.5-111.38c-0.375 29.625 18.75 44.25 41.625 34.875 19.125-7.875 34.5-31.5 34.125-52.125-0.75-27.75-24.375-40.875-48-26.25-17.625 10.875-26.625 27-27.75 43.875zm0-217.88c1.125 19.5 11.25 37.5 32.625 48 19.875 9.75 38.625-0.375 42.375-22.125 3.75-21-9-45.75-28.875-56.625-23.625-12.75-45.75 0-46.125 30.75zm-328.5 329.25c-31.5 0-45 23.25-31.125 46.5 10.5 18 27.375 27.75 48 28.875 12.375 0.75 24-3.375 30.375-15 6-11.25 3.75-22.5-3-33-11.25-17.625-27.75-26.625-44.625-27.375zm-4.125-438.75c21.375 0 43.125-13.875 51.75-33 8.25-18.75 0-36.375-19.875-41.25-20.25-5.25-47.625 7.5-59.25 27.75-13.5 23.625 0 46.5 27.375 46.5zm-106.12 108.75c0-13.875-3.75-25.125-15.375-31.5-11.25-6.375-22.875-3.75-33 3-18.375 12-27.375 29.25-27 51 0.375 24.375 22.125 37.125 43.875 26.25 19.875-10.125 29.25-27.75 31.5-48.375zm0 224.62c0-22.875-15-45.375-35.25-52.875-18.75-6.75-35.625 2.625-39 22.125-4.125 22.125 9 47.625 29.25 58.5 23.25 12 45-1.125 45-27.375z"/>
 <path d="m320.62 531.75-215.25 215.25-7.875-7.875 221.25-221.25c0.375 4.5 1.125 9.375 1.5 13.875z"/>
 <path d="m339.38 611.62c1.125 3.75 2.625 7.5 4.125 11.25l-237 237-7.875-7.5z"/>
 <path d="m375 689.62c1.875 3.375 3.75 6.375 5.625 9.75l-258.38 258.38-7.5-7.5 260.25-260.25z"/>
 <path d="m430.12 763.88-221.25 221.25-7.875-7.875 221.62-221.62c2.25 2.625 4.875 5.25 7.5 8.25z"/>
 <path d="m481.5 810.75 9 6.75-241.88 241.88-7.875-7.875z"/>
 <path d="m551.62 854.25c3.375 1.875 7.125 3.375 10.5 4.875l-210.38 210.38-7.875-7.5z"/>
 <path d="m647.25 887.62-199.88 199.88-7.5-7.5 195-195c4.125 1.125 8.25 1.875 12.375 3z"/>
 <path d="m736.5 897h15.75l-184.88 184.88-7.5-7.5 177-177z"/>
</svg>`;
}

const PICKLEBALL_SVG = pickleballSvg("#10b981");
const PICKLEBALL_SVG_PINK = pickleballSvg("#ec4899");

// Ball center within the 1200x1200 SVG viewBox
const SVG_BALL_CX = 739 / 1200;
const SVG_BALL_CY = 476 / 1200;
// Ball diameter as fraction of viewBox
const SVG_BALL_DIAMETER = 726 / 1200;
// The SVG's implied "forward" direction (upper-right, trails go lower-left)
const SVG_FORWARD_ANGLE = -Math.PI / 4;

function loadBallImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.src = url;
  });
}

function initBalls(w: number, h: number): Ball[] {
  const size = Math.min(Math.min(w, h) * 0.08, 80);
  return Array.from({ length: 3 }, (_, i) => {
    const speed = 300 + Math.random() * 200;
    const angle = Math.random() * Math.PI * 2;
    return {
      x: w * (0.2 + i * 0.3) + (Math.random() - 0.5) * 60,
      y: h * 0.3 + (Math.random() - 0.5) * h * 0.3,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: size / 2,
    };
  });
}

function resolveCollisions(balls: Ball[]) {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i]!;
      const b = balls[j]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.radius + b.radius;

      if (dist < minDist && dist > 0) {
        const nx = dx / dist;
        const ny = dy / dist;

        const overlap = (minDist - dist) / 2;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        const dvx = a.vx - b.vx;
        const dvy = a.vy - b.vy;
        const dot = dvx * nx + dvy * ny;

        if (dot > 0) {
          a.vx -= dot * nx;
          a.vy -= dot * ny;
          b.vx += dot * nx;
          b.vy += dot * ny;
        }
      }
    }
  }
}

export default function PickleballAnimation({ onDone, variant = "confirm" }: { onDone: () => void; variant?: "confirm" | "decline" }) {
  const isDecline = variant === "decline";
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    const balls = initBalls(w, h);
    const ballSize = balls[0]!.radius * 2;
    // Scale image so the ball portion matches ballSize
    const drawSize = ballSize / SVG_BALL_DIAMETER;
    const offsetX = SVG_BALL_CX * drawSize;
    const offsetY = SVG_BALL_CY * drawSize;

    let rafId: number;
    let cancelled = false;

    loadBallImage(isDecline ? PICKLEBALL_SVG_PINK : PICKLEBALL_SVG).then((ballImg) => {
      if (cancelled) return;

      let lastTime = performance.now();
      const startTime = lastTime;

      const animate = (now: number) => {
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        ctx.clearRect(0, 0, w, h);

        for (const ball of balls) {
          ball.x += ball.vx * dt;
          ball.y += ball.vy * dt;

          if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx);
          } else if (ball.x + ball.radius > w) {
            ball.x = w - ball.radius;
            ball.vx = -Math.abs(ball.vx);
          }
          if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy = Math.abs(ball.vy);
          } else if (ball.y + ball.radius > h) {
            ball.y = h - ball.radius;
            ball.vy = -Math.abs(ball.vy);
          }
        }

        resolveCollisions(balls);

        // Draw balls rotated to match velocity direction
        for (const ball of balls) {
          const angle = Math.atan2(ball.vy, ball.vx);
          ctx.save();
          ctx.translate(ball.x, ball.y);
          ctx.rotate(angle - SVG_FORWARD_ANGLE);
          ctx.drawImage(ballImg, -offsetX, -offsetY, drawSize, drawSize);
          ctx.restore();
        }

        if (now - startTime < DURATION) {
          rafId = requestAnimationFrame(animate);
        } else {
          setTimeout(onDone, 300);
        }
      };

      rafId = requestAnimationFrame(animate);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ touchAction: "none" }}
      />
      <div className="relative text-center animate-bounce-in pointer-events-none">
        <div className={`text-2xl font-bold text-white px-6 py-3 rounded-full shadow-lg inline-flex items-center gap-2 border-[2.5px] ${isDecline ? "bg-pink-500 border-pink-300" : "bg-emerald-600 border-[#eab308]"}`}>
          {isDecline ? "See you next time!" : "You\u2019re in!"}
          <svg className="w-12 h-12 inline-block" viewBox="0 0 1200 1200" fill={isDecline ? "#fbcfe8" : "#eab308"}>
            <path d="m502.69 727.31c-7.8281 0-15.609-3.2344-21.188-9.6094-10.219-11.672-9.0469-29.484 2.625-39.703l134.81-117.94c11.672-10.219 29.438-9.0469 39.656 2.625s9.0469 29.484-2.6719 39.703l-134.81 117.94c-5.3438 4.6875-11.953 6.9375-18.516 6.9375z"/>
            <path d="m214.26 687.94c-4.9219 0-9.9375-1.3125-14.484-4.0312-13.312-8.0156-17.578-25.312-9.5625-38.625l216.94-359.81c6.0938-10.078 17.859-15.281 29.344-13.078 11.578 2.2031 20.531 11.391 22.453 23.016l8.5781 51.516 223.22-271.03c9.8906-12 27.609-13.734 39.609-3.8438s13.734 27.609 3.8438 39.609l-262.5 318.74c-6.9844 8.5312-18.375 12.141-28.969 9.2812-10.641-2.8594-18.656-11.672-20.484-22.547l-6.2344-37.406-177.61 294.61c-5.2969 8.7656-14.578 13.594-24.094 13.594z"/>
            <path d="m656.26 945.56c-9.6094 0-18.938-4.9219-24.188-13.781-7.9219-13.359-3.5156-30.609 9.8438-38.531l124.45-73.781-21.844-4.3594c-11.109-2.2031-19.781-10.875-22.031-21.938s2.3438-22.453 11.672-28.828l356.26-243.74c12.797-8.7656 30.281-5.4844 39.094 7.3125 8.7656 12.797 5.4844 30.328-7.3594 39.094l-301.18 206.06 28.312 5.6719c11.438 2.2969 20.25 11.391 22.219 22.875 1.9688 11.484-3.3281 22.969-13.406 28.922l-187.5 111.19c-4.5 2.6719-9.4219 3.9375-14.297 3.9375z"/>
            <path d="m487.5 590.63c-6.4688 0-12.984-2.2031-18.281-6.7969-11.812-10.125-13.172-27.844-3.0469-39.656l225-262.5c5.5312-6.4688 13.641-10.125 22.266-9.7969 8.5312 0.28125 16.453 4.4062 21.609 11.25l36.797 49.031 258.28-258.28c10.969-10.969 28.781-10.969 39.75 0s10.969 28.781 0 39.75l-281.26 281.26c-5.7656 5.7656-13.547 8.7656-21.891 8.1562-8.1094-0.5625-15.609-4.6406-20.531-11.156l-35.203-46.969-202.18 235.87c-5.5781 6.4688-13.453 9.8438-21.375 9.8438z"/>
            <path d="m637.5 759.37c-8.7188 0-17.25-4.0312-22.781-11.578-9.1406-12.562-6.375-30.141 6.1875-39.281l358.22-260.53-46.312-7.7344c-10.688-1.7812-19.406-9.5625-22.406-19.969s0.23438-21.609 8.3438-28.828l168.74-150c11.578-10.359 29.391-9.2812 39.703 2.3438s9.2812 29.391-2.3438 39.703l-124.78 110.91 54.469 9.0938c11.203 1.875 20.156 10.266 22.781 21.281 2.5781 11.016-1.6875 22.547-10.828 29.203l-412.5 300c-4.9688 3.6562-10.781 5.3906-16.5 5.3906z"/>
            <path d="m768.74 234.37c-7.2188 0-14.391-2.7656-19.875-8.25-10.969-10.969-10.969-28.781 0-39.75l112.5-112.5c10.969-10.969 28.781-10.969 39.75 0s10.969 28.781 0 39.75l-112.5 112.5c-5.4844 5.4844-12.703 8.25-19.875 8.25z"/>
            <path d="m332.72 1134.4c-147.28 0-267.1-119.81-267.1-267.1 0-147.28 119.81-267.1 267.1-267.1 147.28 0 267.1 119.81 267.1 267.1 0 147.28-119.81 267.1-267.1 267.1zm0-477.94c-116.25 0-210.84 94.594-210.84 210.84 0 116.25 94.594 210.84 210.84 210.84s210.84-94.594 210.84-210.84c0-116.25-94.594-210.84-210.84-210.84z"/>
            <path d="m370.22 867.28c0 50.016-75 50.016-75 0s75-50.016 75 0"/>
            <path d="m370.22 722.06c0 50.016-75 50.016-75 0 0-49.969 75-49.969 75 0"/>
            <path d="m232.13 822.42c0 50.016-75 50.016-75 0s75-50.016 75 0"/>
            <path d="m284.86 984.74c0 50.016-75 50.016-75 0 0-49.969 75-49.969 75 0"/>
            <path d="m455.58 984.74c0 50.016-75 50.016-75 0 0-49.969 75-49.969 75 0"/>
            <path d="m508.31 822.42c0 50.016-75 50.016-75 0s75-50.016 75 0"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
