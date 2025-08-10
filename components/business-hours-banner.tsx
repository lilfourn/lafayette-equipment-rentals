"use client";

import { useEffect, useMemo, useState } from "react";

// Lafayette, LA (Central Time, handles DST)
const TIME_ZONE = "America/Chicago";

type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

interface Hours {
  // minutes from midnight local time
  open: number;
  close: number;
}

const WEEK_HOURS: Record<DayKey, Hours | null> = {
  sun: null,
  mon: { open: 7 * 60, close: 17 * 60 },
  tue: { open: 7 * 60, close: 17 * 60 },
  wed: { open: 7 * 60, close: 17 * 60 },
  thu: { open: 7 * 60, close: 17 * 60 },
  fri: { open: 7 * 60, close: 17 * 60 },
  sat: { open: 8 * 60, close: 12 * 60 },
};

function getLocalNow(): Date {
  // Build a Date for the target zone by formatting and parsing using Intl API
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
  const iso = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
  return new Date(iso);
}

function minutesSinceMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

function useOpenStatus(): { isOpen: boolean; nextChangeInMs: number } {
  const compute = () => {
    const local = getLocalNow();
    const dayIdx = local.getDay(); // 0=Sun
    const key: DayKey = ("sun,mon,tue,wed,thu,fri,sat".split(",")[dayIdx] ||
      "sun") as DayKey;
    const today = WEEK_HOURS[key];
    const minutes = minutesSinceMidnight(local);
    if (!today) return { isOpen: false, nextChangeInMs: 15 * 60 * 1000 };
    const isOpen = minutes >= today.open && minutes < today.close;

    // compute milliseconds to next status change (open/close or tomorrow open)
    let nextChangeInMs = 15 * 60 * 1000; // fallback 15m
    const msPerMin = 60 * 1000;
    if (isOpen) {
      nextChangeInMs = (today.close - minutes) * msPerMin;
    } else if (minutes < today.open) {
      nextChangeInMs = (today.open - minutes) * msPerMin;
    } else {
      // after close -> find next open day
      for (let i = 1; i <= 7; i++) {
        const nextIdx = (dayIdx + i) % 7;
        const nextKey: DayKey = ("sun,mon,tue,wed,thu,fri,sat".split(",")[
          nextIdx
        ] || "sun") as DayKey;
        const h = WEEK_HOURS[nextKey];
        if (h) {
          const minsUntilMidnight = 24 * 60 - minutes;
          const mins = minsUntilMidnight + (i - 1) * 24 * 60 + h.open;
          nextChangeInMs = mins * msPerMin;
          break;
        }
      }
    }
    // clamp to at least 1 minute to avoid tight loops
    nextChangeInMs = Math.max(nextChangeInMs, 60 * 1000);
    return { isOpen, nextChangeInMs };
  };

  const [state, setState] = useState(compute);
  useEffect(() => {
    const id = setTimeout(() => setState(compute()), state.nextChangeInMs);
    return () => clearTimeout(id);
  }, [state.nextChangeInMs]);
  return state;
}

export default function BusinessHoursBanner() {
  const { isOpen } = useOpenStatus();
  const dotClass = isOpen ? "bg-green-500" : "bg-red-500";
  const statusLabel = isOpen ? "Open Now" : "Closed";

  return (
    <div className="mt-12 text-center">
      <div className="inline-flex items-center justify-center bg-white rounded-lg px-6 py-3 shadow-md">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <div
              className={`w-2 h-2 ${dotClass} rounded-full mr-2 animate-pulse`}
            ></div>
            <span className="text-gray-600 font-medium">{statusLabel}</span>
          </div>
          <div className="text-gray-400">|</div>
          <div className="text-gray-700 font-semibold">
            Mon-Fri: 7AM-5PM • Sat: 8AM-12PM
          </div>
        </div>
      </div>
    </div>
  );
}
