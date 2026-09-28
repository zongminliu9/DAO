const DEFAULT_SCHEDULE = [
  { start: 0, end: 6, target: 5, min: 0, max: 15, label: 'night', rationale: 'keep the pre-dawn environment dim' },
  { start: 6, end: 9, target: 250, min: 180, max: 350, label: 'morning', rationale: 'high daytime-supportive exposure window' },
  { start: 9, end: 17, target: 200, min: 140, max: 320, label: 'daytime', rationale: 'maintain useful daytime light exposure' },
  { start: 17, end: 20, target: 100, min: 60, max: 180, label: 'late-day', rationale: 'transition from daytime to evening' },
  { start: 20, end: 23, target: 20, min: 5, max: 50, label: 'evening', rationale: 'reduce unnecessary late light' },
  { start: 23, end: 24, target: 5, min: 0, max: 15, label: 'night', rationale: 'keep the pre-sleep environment dim' }
];

export const MODES = Object.freeze({
  circadian: { label: 'Circadian', description: 'Time-dependent closed-loop lighting target.' },
  visual: { label: 'Visual comfort', description: 'Moderate task-lighting target without medical blue-light claims.' },
  focus: { label: 'Focus', description: 'Configurable bright daytime work-light scene.' }
});

export function targetForHour(hour, mode = 'circadian') {
  if (mode === 'focus') return { target: 300, min: 220, max: 380, label: 'focus scene', rationale: 'bright daytime work-light scene' };
  if (mode === 'visual') return { target: 140, min: 90, max: 220, label: 'visual comfort', rationale: 'moderate ambient/task lighting' };
  const h = ((Number(hour) % 24) + 24) % 24;
  return DEFAULT_SCHEDULE.find(x => h >= x.start && h < x.end) ?? DEFAULT_SCHEDULE[0];
}

export function buildTarget({ date = new Date(), mode = 'circadian' } = {}) {
  const t = targetForHour(date.getHours(), mode);
  return {
    mode,
    targetMedi: t.target,
    acceptableBand: { min: t.min, max: t.max },
    label: t.label,
    rationale: t.rationale,
    generatedAt: date.toISOString(),
    claimBoundary: 'prototype lighting target; not medical guidance'
  };
}

export function summarizeExposure(history = []) {
  let morning = 0, daytime = 0, evening = 0, night = 0;
  for (const p of history) {
    const d = new Date(p.timestamp);
    const h = d.getHours();
    const dose = (p.melanopicEdi ?? 0) * ((p.durationMinutes ?? 1) / 60);
    if (h >= 6 && h < 9) morning += dose;
    else if (h >= 9 && h < 17) daytime += dose;
    else if (h >= 17 && h < 22) evening += dose;
    else night += dose;
  }
  return Object.fromEntries(Object.entries({ morning, daytime, evening, night }).map(([k,v]) => [k,+v.toFixed(1)]));
}
