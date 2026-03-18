"use client";

import { useEffect, useRef } from "react";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const DURATION = 5000;

// Ball with trailing lines SVG (noun-pickleball-6530093)
const PICKLEBALL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200">
 <path fill="#10b981" d="m375.75 471c1.5-193.88 160.5-361.88 369.38-358.5 198.38 3.375 356.62 162 357 363 0 204-162.75 364.88-369.38 363-199.12-1.875-359.25-166.12-357-367.5zm226.5 50.25c25.5 0 45.75-19.875 46.125-45 0-25.125-20.25-45.75-45.375-46.125-25.125 0-45.75 20.25-46.125 45.375 0 25.125 20.25 45.75 45.375 45.75zm182.62-181.88c0-25.125-20.625-45.75-45.75-45.75-25.5 0-45.75 20.25-45.75 45.75 0 25.125 20.625 45.75 45.75 45.75 24.75 0 45.75-21 45.75-45.75zm91.125 181.88c25.125 0 45.75-20.625 45.375-45.75 0-24.75-21.375-45.75-46.125-45.375-25.125 0-45.375 21-45.375 46.125 0 25.5 20.625 45.375 45.75 45zm-91.125 91.125c0-25.125-20.625-45.75-45.75-45.375-25.125 0-45.375 20.625-45.375 45.75s20.625 45.75 45.75 45.375c25.125 0 45.75-20.625 45.375-45.75zm64.875-356.25c14.25 0 25.125-3.75 31.5-15s4.125-22.5-2.625-33c-10.875-17.25-27.375-26.625-47.625-27.75-12-0.75-23.25 3.375-30 14.25-6.375 10.875-4.5 21.75 1.5 32.25 10.875 18.375 27.75 27.375 47.25 28.875zm2.25 438.75c-22.125 0-43.875 14.25-52.125 34.125-7.875 19.5 1.875 37.125 22.5 40.5 20.625 3.75 44.25-7.5 55.875-26.625 6.375-10.5 9.375-21.75 3-33s-17.25-15-29.625-15zm106.5-111.38c-0.375 29.625 18.75 44.25 41.625 34.875 19.125-7.875 34.5-31.5 34.125-52.125-0.75-27.75-24.375-40.875-48-26.25-17.625 10.875-26.625 27-27.75 43.875zm0-217.88c1.125 19.5 11.25 37.5 32.625 48 19.875 9.75 38.625-0.375 42.375-22.125 3.75-21-9-45.75-28.875-56.625-23.625-12.75-45.75 0-46.125 30.75zm-328.5 329.25c-31.5 0-45 23.25-31.125 46.5 10.5 18 27.375 27.75 48 28.875 12.375 0.75 24-3.375 30.375-15 6-11.25 3.75-22.5-3-33-11.25-17.625-27.75-26.625-44.625-27.375zm-4.125-438.75c21.375 0 43.125-13.875 51.75-33 8.25-18.75 0-36.375-19.875-41.25-20.25-5.25-47.625 7.5-59.25 27.75-13.5 23.625 0 46.5 27.375 46.5zm-106.12 108.75c0-13.875-3.75-25.125-15.375-31.5-11.25-6.375-22.875-3.75-33 3-18.375 12-27.375 29.25-27 51 0.375 24.375 22.125 37.125 43.875 26.25 19.875-10.125 29.25-27.75 31.5-48.375zm0 224.62c0-22.875-15-45.375-35.25-52.875-18.75-6.75-35.625 2.625-39 22.125-4.125 22.125 9 47.625 29.25 58.5 23.25 12 45-1.125 45-27.375z"/>
 <path fill="#10b981" d="m320.62 531.75-215.25 215.25-7.875-7.875 221.25-221.25c0.375 4.5 1.125 9.375 1.5 13.875z"/>
 <path fill="#10b981" d="m339.38 611.62c1.125 3.75 2.625 7.5 4.125 11.25l-237 237-7.875-7.5z"/>
 <path fill="#10b981" d="m375 689.62c1.875 3.375 3.75 6.375 5.625 9.75l-258.38 258.38-7.5-7.5 260.25-260.25z"/>
 <path fill="#10b981" d="m430.12 763.88-221.25 221.25-7.875-7.875 221.62-221.62c2.25 2.625 4.875 5.25 7.5 8.25z"/>
 <path fill="#10b981" d="m481.5 810.75 9 6.75-241.88 241.88-7.875-7.875z"/>
 <path fill="#10b981" d="m551.62 854.25c3.375 1.875 7.125 3.375 10.5 4.875l-210.38 210.38-7.875-7.5z"/>
 <path fill="#10b981" d="m647.25 887.62-199.88 199.88-7.5-7.5 195-195c4.125 1.125 8.25 1.875 12.375 3z"/>
 <path fill="#10b981" d="m736.5 897h15.75l-184.88 184.88-7.5-7.5 177-177z"/>
</svg>`;

// Ball center within the 1200x1200 SVG viewBox
const SVG_BALL_CX = 739 / 1200;
const SVG_BALL_CY = 476 / 1200;
// Ball diameter as fraction of viewBox
const SVG_BALL_DIAMETER = 726 / 1200;
// The SVG's implied "forward" direction (upper-right, trails go lower-left)
const SVG_FORWARD_ANGLE = -Math.PI / 4;

function loadBallImage(): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    const blob = new Blob([PICKLEBALL_SVG], { type: "image/svg+xml" });
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

export default function PickleballAnimation({ onDone }: { onDone: () => void }) {
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

    loadBallImage().then((ballImg) => {
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
        <div className="text-2xl font-bold text-white bg-emerald-600/90 px-6 py-3 rounded-full shadow-lg">
          You&apos;re in! 🏓
        </div>
      </div>
    </div>
  );
}
