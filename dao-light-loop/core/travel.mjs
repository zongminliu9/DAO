function tzOffsetMinutes(timeZone, date = new Date()) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  });
  const parts = Object.fromEntries(dtf.formatToParts(date).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return (asUTC - date.getTime()) / 60000;
}

export function timezoneDeltaHours(originTimeZone, destinationTimeZone, date = new Date()) {
  try {
    const delta = (tzOffsetMinutes(destinationTimeZone, date) - tzOffsetMinutes(originTimeZone, date)) / 60;
    return Math.round(delta * 2) / 2;
  } catch {
    throw new Error('Invalid IANA timezone. Example: America/Los_Angeles or Asia/Tokyo.');
  }
}

export function buildTravelPlan({ originTimeZone, destinationTimeZone, departureAt = new Date().toISOString(), days = 4 }) {
  const departure = new Date(departureAt);
  if (Number.isNaN(departure.getTime())) throw new Error('Invalid departureAt');
  const rawDelta = timezoneDeltaHours(originTimeZone, destinationTimeZone, departure);
  let delta = rawDelta;
  if (delta > 12) delta -= 24;
  if (delta < -12) delta += 24;
  const direction = delta === 0 ? 'none' : delta > 0 ? 'eastward' : 'westward';
  const magnitude = Math.abs(delta);
  const shiftPerDay = Math.min(2, Math.max(0.75, magnitude / Math.max(1, days)));
  const plan = [];
  for (let day = 1; day <= days; day++) {
    const progressiveShift = Math.min(magnitude, +(shiftPerDay * day).toFixed(1));
    if (direction === 'eastward') {
      plan.push({ day, seekLight: '06:30–10:00 destination local time', reduceLight: '20:00–23:00 destination local time', progressiveShiftHours: progressiveShift });
    } else if (direction === 'westward') {
      plan.push({ day, seekLight: '16:00–20:00 destination local time', reduceLight: '05:30–08:00 destination local time', progressiveShiftHours: progressiveShift });
    } else {
      plan.push({ day, seekLight: 'normal daytime light', reduceLight: 'normal pre-sleep dimming', progressiveShiftHours: 0 });
    }
  }
  return {
    originTimeZone,
    destinationTimeZone,
    timezoneDeltaHours: delta,
    direction,
    days,
    plan,
    disclaimer: 'Prototype heuristic for product demonstration only; not medical or individualized travel guidance.'
  };
}
