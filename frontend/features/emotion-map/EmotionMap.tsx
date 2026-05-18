"use client";

import * as d3 from "d3";
import { useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { useI18n } from "@/i18n/i18n";

export const emotions = [
  "awe",
  "calmness",
  "nostalgia",
  "sadness",
  "joy",
  "anxiety",
  "triumph",
  "fear",
  "romance",
  "dreaminess",
  "tension",
  "hope",
  "loneliness"
];

export const emotionRu: Record<string, string> = {
  awe: "восхищение",
  calmness: "спокойствие",
  nostalgia: "ностальгия",
  sadness: "грусть",
  joy: "радость",
  anxiety: "тревога",
  triumph: "триумф",
  fear: "страх",
  romance: "романтика",
  dreaminess: "мечтательность",
  tension: "напряжение",
  hope: "надежда",
  loneliness: "одиночество"
};

const sectorColors = [
  "hsla(190, 88%, 50%, 0.26)",
  "hsla(265, 86%, 62%, 0.26)",
  "hsla(42, 92%, 55%, 0.26)",
  "hsla(330, 82%, 60%, 0.26)",
  "hsla(145, 78%, 47%, 0.26)",
  "hsla(225, 88%, 61%, 0.26)",
  "hsla(24, 90%, 56%, 0.26)",
  "hsla(172, 82%, 45%, 0.26)",
  "hsla(292, 82%, 58%, 0.26)",
  "hsla(84, 82%, 48%, 0.26)",
  "hsla(205, 90%, 56%, 0.26)",
  "hsla(356, 86%, 61%, 0.26)",
  "hsla(118, 74%, 50%, 0.26)"
];

export type EmotionPoint = { id: string; emotion: string; intensity: number; timeline_position: number };

export function EmotionMap({ points, onChange }: { points: EmotionPoint[]; onChange: (points: EmotionPoint[]) => void }) {
  const { locale } = useI18n();
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);
  const size = 520;
  const center = size / 2;
  const radius = 220;
  const innerRadius = 36;
  const intensityLevels = 10;
  const maxPoints = 7;
  const angle = d3.scaleLinear().domain([0, emotions.length]).range([0, Math.PI * 2]);
  const sectorAngle = (Math.PI * 2) / emotions.length;

  function addPoint(index: number, level: number) {
    if (points.length >= maxPoints) return;
    const spotIsTaken = points.some((point) => point.emotion === emotions[index] && point.intensity === level);
    if (spotIsTaken) return;
    onChange([...points, { id: crypto.randomUUID(), emotion: emotions[index], intensity: level, timeline_position: Math.min(1, points.length / (maxPoints - 1)) }]);
  }

  function getPointFromClient(svg: SVGSVGElement, clientX: number, clientY: number) {
    const rect = svg.getBoundingClientRect();
    const scale = size / Math.min(rect.width, rect.height);
    const x = (clientX - rect.left) * scale;
    const y = (clientY - rect.top) * scale;
    const dx = x - center;
    const dy = y - center;
    const distance = Math.min(radius, Math.sqrt(dx * dx + dy * dy));
    const normalizedAngle = (Math.atan2(dy, dx) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    const index = Math.min(emotions.length - 1, Math.floor(normalizedAngle / sectorAngle));
    const level = Math.min(intensityLevels, Math.max(1, Math.ceil((distance / radius) * intensityLevels)));

    return { index, level };
  }

  function movePoint(id: string, svg: SVGSVGElement, clientX: number, clientY: number) {
    const { index, level } = getPointFromClient(svg, clientX, clientY);
    const spotIsTaken = points.some((point) => point.id !== id && point.emotion === emotions[index] && point.intensity === level);
    if (spotIsTaken) return;
    onChange(points.map((point) => point.id === id ? { ...point, emotion: emotions[index], intensity: level } : point));
  }

  function handleCircleClick(event: MouseEvent<SVGSVGElement>) {
    if (draggedPointId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const scale = size / Math.min(rect.width, rect.height);
    const x = (event.clientX - rect.left) * scale;
    const y = (event.clientY - rect.top) * scale;
    const dx = x - center;
    const dy = y - center;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > radius) return;

    const { index, level } = getPointFromClient(event.currentTarget, event.clientX, event.clientY);

    addPoint(index, level);
  }

  function handlePointPointerDown(event: PointerEvent<SVGCircleElement>, id: string) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggedPointId(id);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!draggedPointId) return;
    movePoint(draggedPointId, event.currentTarget, event.clientX, event.clientY);
  }

  function stopDragging() {
    setDraggedPointId(null);
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 p-3">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full cursor-crosshair touch-none" onClick={handleCircleClick} onPointerMove={handlePointerMove} onPointerUp={stopDragging} onPointerLeave={stopDragging}>
        <defs>
          <radialGradient id="emotionGlow"><stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.08" /></radialGradient>
        </defs>
        <circle cx={center} cy={center} r={radius} fill="transparent" />
        {Array.from({ length: intensityLevels }, (_, index) => index + 1).map((level) => <circle key={level} cx={center} cy={center} r={(radius / intensityLevels) * level} fill="none" stroke="rgba(255,255,255,0.1)" />)}
        {emotions.map((emotion, index) => {
          const a = angle(index) - Math.PI / 2;
          const next = angle(index + 1) - Math.PI / 2;
          const mid = (a + next) / 2;
          const labelRadius = innerRadius + (radius - innerRadius) * 0.58;
          const labelX = Math.cos(mid) * labelRadius;
          const labelY = Math.sin(mid) * labelRadius;
          const labelAngle = (mid * 180) / Math.PI;
          const readableAngle = labelAngle > 90 || labelAngle < -90 ? labelAngle + 180 : labelAngle;
          const arc = d3.arc()({ innerRadius, outerRadius: radius, startAngle: angle(index), endAngle: angle(index + 1), padAngle: 0.015 });
          return (
            <g key={emotion} transform={`translate(${center},${center})`} className="pointer-events-none">
              <path d={arc ?? ""} fill={sectorColors[index]} stroke="rgba(255,255,255,0.09)" />
              <text x={labelX} y={labelY} transform={`rotate(${readableAngle} ${labelX} ${labelY})`} textAnchor="middle" dominantBaseline="middle" fill="#f8fafc" fontSize="11" fontWeight="700">{locale === "ru" ? (emotionRu[emotion] ?? emotion) : emotion}</text>
            </g>
          );
        })}
        {points.map((point) => {
          const index = emotions.indexOf(point.emotion);
          const a = angle(index + 0.5) - Math.PI / 2;
          const r = (radius / intensityLevels) * point.intensity;
          return <circle key={point.id} cx={center + Math.cos(a) * r} cy={center + Math.sin(a) * r} r="9" fill="url(#emotionGlow)" stroke="white" strokeWidth="1.5" className="cursor-grab active:cursor-grabbing" onClick={(event) => event.stopPropagation()} onPointerDown={(event) => handlePointPointerDown(event, point.id)} />;
        })}
      </svg>
    </div>
  );
}
