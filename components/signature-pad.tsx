"use client";

import { useEffect, useRef, useState } from "react";

// Draw-on-screen signature capture. Writes a PNG data URL into a hidden input
// (default name "signatureImage") so it submits with the surrounding form.
// The typed legal name is the operative signature under Texas UETA; this
// drawing is optional supporting evidence.
export default function SignaturePad({
  name = "signatureImage",
  onChange,
}: {
  name?: string;
  onChange?: (hasInk: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  // Size the canvas backing store to its CSS box × devicePixelRatio for crisp lines.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#1c1917"; // stone-900
    }
  }, []);

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pointFromEvent(e);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = pointFromEvent(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!hasInk) {
      setHasInk(true);
      onChange?.(true);
    }
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    const canvas = canvasRef.current;
    if (canvas && hiddenRef.current) {
      hiddenRef.current.value = hasInk ? canvas.toDataURL("image/png") : "";
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (hiddenRef.current) hiddenRef.current.value = "";
    setHasInk(false);
    onChange?.(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="h-40 w-full touch-none rounded-2xl border border-stone-300 bg-white"
        />
        {!hasInk ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-stone-400">
            Sign here with your finger or mouse
          </span>
        ) : null}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clear}
          className="rounded-full border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
        >
          Clear signature
        </button>
      </div>
      <input ref={hiddenRef} type="hidden" name={name} defaultValue="" />
    </div>
  );
}
