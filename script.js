/* LapLog — workout tracker
   All data is persisted to localStorage. No backend, no network calls. */

const STORAGE_KEY = 'laplog:sets';
const MAX_LAPS_VISIBLE = 12;
const SCHEMA_VERSION = 1;

const els = {
  streakValue: document.getElementById('streakValue'),
  sessionClock: document.getElementById('sessionClock'),
  lapTrackFill: document.getElementById('lapTrackFill'),
  lapCaption: document.getElementById('lapCaption'),
  logForm: document.getElementById('logForm'),
  exercise: document.getElementById('exercise'),
  weight: document.getElementById('weight'),
  reps: document.getElementById('reps'),
  weekRange: document.getElementById('weekRange'),
  volumeChart: document.getElementById('volumeChart'),
  historyList: document.getElementById('historyList'),
  clearBtn: document.getElementById('clearBtn'),
};

function loadSets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Could not read saved sets', err);
    return [];
  }
}

function sanitizeSet({ exercise, weight, reps }) {
  return {
    id: Date.now(),
    exercise: String(exercise).trim().slice(0, 60),
    weight: Math.max(0, Math.round(parseFloat(weight) * 10) / 10),
    reps: Math.max(1, Math.round(parseInt(reps, 10))),
    timestamp: Date.now(),
    schemaVersion: SCHEMA_VERSION,
  };
}

function saveSets(sets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatClock(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function render() {
  const sets = loadSets();
  renderSessionClock(sets);
  renderLapTrack(sets);
  renderStreak(sets);
  renderVolumeChart(sets);
  renderHistory(sets);
}

function getTodaysSets(sets) {
  const now = new Date();
  return sets.filter(s => isSameDay(new Date(s.timestamp), now));
}

function renderSessionClock(sets) {
    const now = new Date();
  const todaysSets = getTodaysSets(sets);
  if (todaysSets.length === 0) {
    els.sessionClock.textContent = '00:00';
    return;
  }
  const firstTimestamp = Math.min(...todaysSets.map(s => s.timestamp));
  els.sessionClock.textContent = formatClock(now.getTime() - firstTimestamp);
}

function renderLapTrack(sets) {
  const todaysSets = getTodaysSets(sets);
  const count = Math.min(todaysSets.length, MAX_LAPS_VISIBLE);
  const pct = todaysSets.length === 0 ? 0 : Math.round((count / MAX_LAPS_VISIBLE) * 100);
  els.lapTrackFill.style.width = `${pct}%`;

  if (todaysSets.length === 0) {
    els.lapCaption.textContent = 'No sets logged yet — add your first one below';
  } else {
    els.lapCaption.textContent = `${todaysSets.length} set${todaysSets.length === 1 ? '' : 's'} logged today`;
  }
}

function renderStreak(sets) {
  if (sets.length === 0) {
    els.streakValue.textContent = '0';
    return;
  }
  const daysWithSets = new Set(
    sets.map(s => startOfDay(new Date(s.timestamp)).getTime())
  );
  let streak = 0;
  let cursor = startOfDay(new Date());
  while (daysWithSets.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  els.streakValue.textContent = String(streak);
}

function renderVolumeChart(sets) {
  const days = [];
  const today = startOfDay(new Date());
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const volumeByDay = days.map(day => {
    const daySets = sets.filter(s => isSameDay(new Date(s.timestamp), day));
    return daySets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  });

  const maxVolume = Math.max(...volumeByDay, 1);

  els.volumeChart.innerHTML = '';
  days.forEach((day, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'vc-bar-wrap';

    const bar = document.createElement('div');
    const heightPct = Math.round((volumeByDay[i] / maxVolume) * 100);
    bar.className = `vc-bar${volumeByDay[i] > 0 ? ' has-volume' : ''}`;
    bar.style.height = `${Math.max(heightPct, 3)}%`;

    const label = document.createElement('div');
    label.className = 'vc-day';
    label.textContent = day.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2);

    wrap.appendChild(bar);
    wrap.appendChild(label);
    els.volumeChart.appendChild(wrap);
  });

  const first = days[0];
  const last = days[days.length - 1];
  els.weekRange.textContent = `${first.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${last.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

function renderHistory(sets) {
  els.historyList.innerHTML = '';

  if (sets.length === 0) {
    const li = document.createElement('li');
    li.className = 'history-empty';
    li.textContent = 'Nothing logged yet. Your sets will line up here.';
    els.historyList.appendChild(li);
    return;
  }

  const sorted = [...sets].sort((a, b) => b.timestamp - a.timestamp);

  sorted.forEach(set => {
    const li = document.createElement('li');
    li.className = 'history-item';

    const main = document.createElement('div');
    main.className = 'hi-main';

    const exerciseEl = document.createElement('span');
    exerciseEl.className = 'hi-exercise';
    exerciseEl.textContent = set.exercise;

    const metaEl = document.createElement('span');
    metaEl.className = 'hi-meta';
    metaEl.textContent = new Date(set.timestamp).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    main.appendChild(exerciseEl);
    main.appendChild(metaEl);

    const figures = document.createElement('span');
    figures.className = 'hi-figures';
    figures.textContent = `${set.weight}kg × ${set.reps}`;

    li.appendChild(main);
    li.appendChild(figures);
    els.historyList.appendChild(li);
  });
}

els.logForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const exercise = els.exercise.value.trim();
  const weight = parseFloat(els.weight.value);
  const reps = parseInt(els.reps.value, 10);

  if (!exercise || Number.isNaN(weight) || Number.isNaN(reps)) {
    return;
  }

  const sets = loadSets();
  sets.push(sanitizeSet({ exercise, weight, reps }));
  saveSets(sets);

  els.logForm.reset();
  els.exercise.focus();
  render();
});

els.clearBtn.addEventListener('click', () => {
  if (!confirm('Clear all logged sets? This cannot be undone.')) return;
  localStorage.removeItem(STORAGE_KEY);
  render();
});



// Keep the session clock ticking while the tab is open.
setInterval(() => renderSessionClock(loadSets()), 30000);

render();