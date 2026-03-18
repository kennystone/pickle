"use client";

import { useEffect, useRef } from "react";
import type confettiLib from "canvas-confetti";

export default function PickleballAnimation({ onDone }: { onDone: () => void }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const run = async () => {
      const confetti = (await import("canvas-confetti")).default as typeof confettiLib;

      const duration = 2500;
      const end = Date.now() + duration;

      const colors = ["#5D8A34", "#F5E642", "#8CB84A", "#ffffff", "#3D5E20"];

      const frame = () => {
        confetti({
          particleCount: 6,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        } else {
          setTimeout(onDone, 300);
        }
      };

      frame();
    };

    run();
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="text-center animate-bounce-in">
        <div className="text-8xl">🥒</div>
        <div className="mt-3 text-2xl font-bold text-pickle-green bg-white/90 px-6 py-2 rounded-full shadow-lg">
          You&apos;re in! 🏓
        </div>
      </div>
    </div>
  );
}
