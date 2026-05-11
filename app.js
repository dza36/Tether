// ─── AUTH PROVIDERS ───────────────────────────────────────────────────────────
const AUTH_PROVIDER_CONFIG = {
  google: {
    label: 'Continue with Google',
    svg: '<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.8 18.9 12 24 12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.7 35.5 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C36.9 36.2 44 31 44 24c0-1.3-.1-2.7-.4-3.9z"/></svg>',
  },
  azure: {
    label: 'Continue with Microsoft',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#00a4ef" d="M13 1h10v10H13z"/><path fill="#7fba00" d="M1 13h10v10H1z"/><path fill="#ffb900" d="M13 13h10v10H13z"/></svg>',
  },
  apple: {
    label: 'Continue with Apple',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#000"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/></svg>',
  },
  facebook: {
    label: 'Continue with Facebook',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  },
};

function renderAuthButtons() {
  const container = document.getElementById('authBtns');
  if (!container) return;
  const providers = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.authProviders)
    ? APP_CONFIG.authProviders.split(',').map(p => p.trim()).filter(Boolean)
    : ['google', 'azure'];
  container.innerHTML = providers.map(p => {
    const cfg = AUTH_PROVIDER_CONFIG[p];
    if (!cfg) return '';
    return `<button class="oauth-btn" onclick="signInWith('${p}')">${cfg.svg}${cfg.label}</button>`;
  }).join('');
}

// ─── CORE LOGIC ───────────────────────────────────────────────────────────────
let today = new Date(); today.setHours(0,0,0,0);
function isoToday() { return today.toISOString().slice(0,10); }
function dateDiff(a,b) { return Math.round((b-a)/86400000); }
function rollingWeekEnd() { const d=new Date(today); d.setDate(d.getDate()+7); return d; }
function rollingMonthEnd() { const d=new Date(today); d.setDate(d.getDate()+30); return d; }

function nextFromDays(wd, startI=0) {
  const d = new Date(today);
  for (let i = startI; i < startI+8; i++) {
    const t = new Date(d); t.setDate(t.getDate()+i);
    if (wd.includes(t.getDay())) return t;
  }
  return d;
}

function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }

function nextMonthlyDay(monthDays, afterDateStr) {
  const after = new Date(afterDateStr + 'T00:00:00');
  const sorted = [...monthDays].sort((a, b) => a - b);
  // Try same month first
  for (const md of sorted) {
    const dim = daysInMonth(after.getFullYear(), after.getMonth());
    const actualDay = md === 31 ? dim : Math.min(md, dim);
    const candidate = new Date(after.getFullYear(), after.getMonth(), actualDay);
    if (candidate > after) return candidate;
  }
  // Next month
  let yr = after.getFullYear(), mo = after.getMonth() + 1;
  if (mo > 11) { mo = 0; yr++; }
  const dim = daysInMonth(yr, mo);
  const md = sorted[0];
  return new Date(yr, mo, md === 31 ? dim : Math.min(md, dim));
}

function getDueDate(item) {
  if (item.type==='chore') {
    if (!item.weekdays?.length && !item.monthDays?.length && !item.days) return new Date((item.date||isoToday())+'T00:00:00');
    if (item.weekdays?.length) return nextFromDays(item.weekdays, item.lastDone===isoToday()?1:0);
    if (item.monthDays?.length) return nextMonthlyDay(item.monthDays, item.lastDone || isoToday());
    const l = new Date((item.lastDone||isoToday())+'T00:00:00');
    const d = new Date(l); d.setDate(d.getDate()+(item.days||7)); return d;
  }
  if (item.type==='occasion') return new Date((item.date||isoToday())+'T00:00:00');
  if (item.type==='event'||item.type==='oneTime'||item.type==='grocery') return new Date((item.date||isoToday())+'T00:00:00');
  if (item.type==='weekday') return nextFromDays(item.weekdays||[1], item.lastDone===isoToday()?1:0);
  if (item.type==='monthly'||item.type==='yearly') return new Date((item.lastDone||isoToday())+'T00:00:00');
  if (item.type==='annual') {
    const base = new Date((item.lastDone||isoToday())+'T00:00:00');
    const interval = item.yearInterval || 1;
    const result = new Date(base);
    result.setFullYear(result.getFullYear() + interval);
    while (result < today) result.setFullYear(result.getFullYear() + interval);
    return result;
  }
  const l = new Date(item.lastDone+'T00:00:00');
  const d = new Date(l); d.setDate(d.getDate()+(item.days||0)); return d;
}

function daysUntil(item) { return dateDiff(today, getDueDate(item)); }

// Is item snoozed?
function isSnoozed(item) {
  if (!item.altDueDate) return false;
  const snoozeDate = new Date(item.altDueDate + 'T00:00:00');
  if (snoozeDate <= today) return false;
  // Events use altDueDate directly; tasks also require status='snoozed'
  return item.type === 'event' || item.status === 'snoozed';
}

// Tab filtering
function itemVisibleInTab(item, tabName) {
  // Snoozed items never show
  if (isSnoozed(item)) return false;
  // Dismissed events never show
  if (item.status === 'dismissed') return false;
  // Completed one-time tasks never show again
  if (item.status === 'completed') return false;
  // Dismissed tasks never show (they will reappear when due again naturally)
  if (item.status === 'cancelled') return false;

  // Snoozed items: tab determined by altDueDate, never in Today
  if (isSnoozed(item)) {
    const snoozeDays = dateDiff(today, new Date(item.altDueDate + 'T00:00:00'));
    if (tabName === 'today') return false;
    if (tabName === 'week') return snoozeDays >= 1 && snoozeDays <= 7;
    if (tabName === 'beyond') return snoozeDays > 7;
    return false;
  }

  const d = daysUntil(item);

  if (tabName === 'today') return d <= 0;
  if (tabName === 'week') return d >= 1 && d <= 7;
  if (tabName === 'beyond') return d > 7;
  return false;
}

function fmtInterval(days) {
  if (!days) return '—';
  if (days%365===0) return `Every ${days/365}yr`;
  if (days%30===0) return `Every ${days/30}mo`;
  if (days%7===0) return `Every ${days/7}wk`;
  return `Every ${days}d`;
}

function badgeFor(item) {
  if (isSnoozed(item)) return `<span class="badge snoozed">Snoozed · ${item.altDueDate}</span>`;
  if (item.type === 'chore') {
    const d = daysUntil(item);
    const count = item._choreTotal;
    const done = item._choreDone || 0;
    if (d <= 0) return `<span class="badge soon">Due today</span>`;
    if (count > 0) return `<span class="badge progress">${done}/${count}</span>`;
    return `<span class="badge ok">in ${d}d</span>`;
  }
  const cl = item.checklist||[];
  if (cl.length>0 && expandedId===item.id) {
    const done=cl.filter(c=>c.done).length;
    return `<span class="badge progress">${done}/${cl.length}</span>`;
  }
  const d = daysUntil(item);
  if (item.type==='occasion') {
    if (d===0) return `<span class="badge soon">Today! 🎉</span>`;
    if (d<=7) return `<span class="badge soon">in ${d}d</span>`;
    return `<span class="badge ok">in ${d}d</span>`;
  }
  if (item.type==='event') {
    if (d<0) return `<span class="badge past">Past</span>`;
    if (d===0) return `<span class="badge soon">Today</span>`;
    if (d<=7) return `<span class="badge soon">in ${d}d</span>`;
    return `<span class="badge event">in ${d}d</span>`;
  }
  if (d<0) return `<span class="badge overdue">${Math.abs(d)}d late</span>`;
  if (d===0) return `<span class="badge soon">Due today</span>`;
  if (d<=3) return `<span class="badge soon">in ${d}d</span>`;
  return `<span class="badge ok">in ${d}d</span>`;
}

function fmtDate(d) { return d.toLocaleDateString("en-US",{month:"short",day:"numeric"}); }
function fmtTime(t) {
  if (!t) return '';
  const [h,m] = t.split(':');
  const hr = parseInt(h);
  return `${hr>12?hr-12:hr||12}:${m} ${hr>=12?'PM':'AM'}`;
}
function ordinal(n) {
  if (n === 31) return 'Last';
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

function subFor(item) {
  const wd=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const timeStr = item.startTime ? ` · ${fmtTime(item.startTime)}${item.endTime?' – '+fmtTime(item.endTime):''}` : '';
  if (item.type==="chore") {
    const due = getDueDate(item);
    if (!item.weekdays?.length && !item.monthDays?.length && !item.days) return item.date ? `Due ${fmtDate(due)}` : 'One-time list · tap to open';
    if (item.weekdays?.length) return `Every ${(item.weekdays||[]).map(d=>wd[d]).join(", ")} · Next due ${fmtDate(due)}`;
    if (item.monthDays?.length) return `Monthly (${item.monthDays.map(ordinal).join(', ')}) · Next due ${fmtDate(due)}`;
    if (item.days === 1) return `Daily · Next due ${fmtDate(due)}`;
    return `${fmtInterval(item.days)} · Next due ${fmtDate(due)}`;
  }
  if (item.type==="grocery") {
    const due = getDueDate(item);
    return `Shopping ${fmtDate(due)}${timeStr} · tap to open list`;
  }
  if (item.type==="interval") {
    const lastDone = new Date(item.lastDone+"T00:00:00");
    const nextDue = getDueDate(item);
    return `Completed ${fmtDate(lastDone)} · Next due ${fmtDate(nextDue)}${timeStr}`;
  }
  if (item.type==="weekday") return `Every ${(item.weekdays||[]).map(d=>wd[d]).join(", ")} · Next due ${fmtDate(getDueDate(item))}${timeStr}`;
  if (item.type==="yearly") return `Every year · ${fmtDate(getDueDate(item))}${timeStr}`;
  if (item.type==="annual") {
    const interval = item.yearInterval || 1;
    const intervalStr = interval === 1 ? "Every year" : `Every ${interval} years`;
    return `${intervalStr} · Next due ${fmtDate(getDueDate(item))}${timeStr}`;
  }
  if (item.type==="occasion") {
    const typeEmoji = {birthday:'🎂',anniversary:'💍',remembrance:'🕯️'}[item.occasionType] || '🗓';
    const d = daysUntil(item);
    const dueStr = d === 0 ? 'Today! 🎉' : d === 1 ? 'Tomorrow' : `${MONTH_SHORT[item.month-1]} ${item.day}`;
    return `${typeEmoji} ${item.occasionType.charAt(0).toUpperCase()+item.occasionType.slice(1)} · ${dueStr}`;
  }
  // event
  const due = getDueDate(item);
  return due.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})+timeStr;
}
function iconFor(item) {
  if (item.type === 'chore') return '🧹';
  if (item.type === 'grocery') return '🛒';
  if (item.type === 'event') return item.eventIcon || '📅';
  if (item.type === 'annual') return '<span class="type-icon">🗓</span>';
  if (item.type === 'occasion') return {birthday:'🎂',anniversary:'💍',remembrance:'🕯️'}[item.occasionType] || '🗓';
  if (item.isUrgent) return '<span class="type-dot dot-urgent"></span>';
  if (item.startTime) return '<span class="type-icon">🕐</span>';
  return '<span class="type-dot dot-task"></span>';
}
function dotClass(t) { return t==='interval'?'dot-interval':t==='weekday'?'dot-weekday':'dot-event'; } // kept for compat

// ─── TOAST ────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, isError, duration=2400) {
  const t = document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), duration);
}

// ─── ITEM ACTIONS ─────────────────────────────────────────────────────────────
let tab="today", expandedId=null, itemType="interval", selectedWeekdays=[1], selectedTaskCategory='custom';
// tab values: 'today' | 'week' | 'beyond'

async function completeItem(id) {
  const item = items.find(i=>i.id===id); if (!item) return;
  if (item.checklist) item.checklist.forEach(c=>c.done=false);
  item.altDueDate = null;

  // Capture due date before mutating lastDone
  const dueDate = getDueDate(item).toISOString().slice(0,10);

  if (item.type==='chore') {
    if (!item.weekdays?.length && !item.monthDays?.length && !item.days) {
      item.status = 'completed';
      await persistItem(item);
      showToast('✓ Done');
      recordCompletion(item, dueDate);
      if (expandedId===id) expandedId=null;
      setTimeout(render, 50);
      return;
    }
    if (item.weekdays?.length) {
      item.lastDone = dueDate;
      const nextDay = nextFromDays(item.weekdays, 1);
      const daysAway = Math.round((nextDay - today) / 86400000);
      const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][nextDay.getDay()];
      const seeYou = daysAway===1?'tomorrow':daysAway<=6?dayName:`in ${daysAway} days`;
      showToast(`✓ All done — see you ${seeYou}`);
    } else if (item.monthDays?.length) {
      item.lastDone = dueDate;
      const next = nextMonthlyDay(item.monthDays, dueDate);
      const daysAway = Math.round((next - today) / 86400000);
      showToast(`✓ All done — back in ${daysAway} day${daysAway===1?'':'s'}`);
    } else {
      item.lastDone = isoToday();
      showToast('✓ All done — ' + fmtInterval(item.days).toLowerCase().replace('every ','back in '));
    }
    await resetChoreItems(item._dbId || item.id);
    item._choreTotal = choreListItems.length;
    item._choreDone = 0;
    choreListItems = choreListItems.map(ci => ({...ci, done: false}));
    await persistItem(item);
    recordCompletion(item, dueDate);
    if (expandedId===id) expandedId=null;
    setTimeout(render, 50);
    return;
  }

  if (item.type==='interval') {
    item.lastDone = isoToday();
    showToast('✓ Done — see you in ' + fmtInterval(item.days).toLowerCase().replace('every ',''));
    await persistItem(item);
    recordCompletion(item, dueDate);
  } else if (item.type==='weekday') {
    // Set lastDone to the due date (not today) so early completions skip correctly
    item.lastDone = dueDate;
    const nextDay = nextFromDays(item.weekdays||[1], 1);
    const daysAway = Math.round((nextDay - today) / 86400000);
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][nextDay.getDay()];
    const seeYou = daysAway === 1 ? 'tomorrow' : daysAway <= 6 ? dayName : daysAway === 7 ? 'next week' : `in ${daysAway} days`;
    showToast(`✓ Done — see you ${seeYou}`);
    await persistItem(item);
    recordCompletion(item, dueDate);
  } else if (item.type==='monthly') {
    const l = new Date(item.lastDone+'T00:00:00');
    const months = item.days||1;
    let next;
    if (item.monthWeek!=null && item.monthWeekday!=null) {
      next = new Date(l.getFullYear(), l.getMonth()+months, 1);
      let count=0, tries=0;
      while (tries++<35) { if (next.getDay()===item.monthWeekday&&++count===item.monthWeek) break; next.setDate(next.getDate()+1); }
    } else {
      next = new Date(l.getFullYear(), l.getMonth()+months, item.monthDay||l.getDate());
    }
    item.lastDone = next.toISOString().slice(0,10);
    showToast('✓ Done — see you next month');
    await persistItem(item);
    recordCompletion(item, dueDate);
  } else if (item.type==='annual') {
    const l = new Date(item.lastDone+'T00:00:00');
    const interval = item.yearInterval || 1;
    l.setFullYear(l.getFullYear() + interval);
    item.lastDone = l.toISOString().slice(0,10);
    const yrsStr = interval === 1 ? 'next year' : `in ${interval} years`;
    showToast(`✓ Done — see you ${yrsStr}`);
    await persistItem(item);
    recordCompletion(item, dueDate);
  } else if (item.type==='yearly') {
    const l = new Date(item.lastDone+'T00:00:00');
    let next;
    if (item.monthWeek!=null && item.monthWeekday!=null) {
      next = new Date(l.getFullYear()+1, l.getMonth(), 1);
      let count=0, tries=0;
      while (tries++<35) { if (next.getDay()===item.monthWeekday&&++count===item.monthWeek) break; next.setDate(next.getDate()+1); }
    } else {
      next = new Date(l.getFullYear()+1, l.getMonth(), item.monthDay||l.getDate());
    }
    item.lastDone = next.toISOString().slice(0,10);
    showToast('✓ Done — see you next year');
    await persistItem(item);
    recordCompletion(item, dueDate);
  } else if (item.type==='event') {
    item.status = 'dismissed';
    await persistItem(item);
    showToast('👋 Dismissed');
  } else {
    // One-time item — archive it (keep for history)
    item.status = 'completed';
    await persistItem(item);
    showToast('✓ Done');
    recordCompletion(item, dueDate);
  }
  if (expandedId===id) expandedId=null;
  setTimeout(render, 50);
}

function recordCompletion(item, dueDate) {
  // Fire and forget — non-blocking, non-critical
  sb.from('tether_completions').insert({
    item_id: item.id,
    user_id: currentUser.id,
    household_id: item.householdId || currentHousehold?.id || null,
    action: 'completed',
    completed_at: new Date().toISOString(),
    due_date: dueDate,
  }).then(({error}) => { if (error) console.warn('recordCompletion failed', error); });
}

// ─── SNOOZE SHEET ─────────────────────────────────────────────────────────────
let snoozeTargetId = null;
let snoozeDays = 1;

function openSnoozeSheet(id) {
  const item = items.find(i=>i.id===id); if (!item) return;
  snoozeTargetId = id;
  // Minimum snooze days ensures item moves to the next tab
  snoozeDays = tab === 'week' || tab === 'beyond' ? 8 : 1;
  document.getElementById('snoozeItemName').textContent = item.name;
  updateSnoozeDaysDisplay();
  document.getElementById('snoozeBg').classList.add('open');
}

function closeSnoozeSheet() {
  document.getElementById('snoozeBg').classList.remove('open');
  snoozeTargetId = null;
}

function bgClickSnooze(e) {
  if (e.target === document.getElementById('snoozeBg')) closeSnoozeSheet();
}

function adjustSnoozeDays(delta) {
  const min = tab === 'week' || tab === 'beyond' ? 8 : 1;
  snoozeDays = Math.max(min, snoozeDays + delta);
  updateSnoozeDaysDisplay();
}

function updateSnoozeDaysDisplay() {
  const val = document.getElementById('snoozeDaysVal');
  const label = document.getElementById('snoozeDateLabel');
  val.textContent = snoozeDays === 1 ? '1 Day' : `${snoozeDays} Days`;
  const target = new Date(today);
  target.setDate(target.getDate() + snoozeDays);
  label.textContent = 'Returns ' + target.toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'});
}

async function confirmSnooze() {
  const item = items.find(i=>i.id===snoozeTargetId); if (!item) return;
  const target = new Date(today);
  target.setDate(target.getDate() + snoozeDays);
  item.status = 'snoozed';
  item.altDueDate = target.toISOString().slice(0,10);
  closeSnoozeSheet();
  await persistItem(item);
  showToast(`⏱ Snoozed ${snoozeDays === 1 ? '1 day' : snoozeDays + ' days'}`);
  render();
}

async function confirmDismiss() {
  const item = items.find(i=>i.id===snoozeTargetId); if (!item) return;
  item.status = 'cancelled';
  item.altDueDate = null;
  closeSnoozeSheet();
  await persistItem(item);
  showToast('👋 Dismissed');
  render();
}

// ─── CONFIRM COMPLETE ─────────────────────────────────────────────────────────
let pendingCompleteId = null;

function hasUncheckedItems(item) {
  const cl = item.checklist || [];
  return cl.length > 0 && cl.some(c => !c.done);
}

function needsCompleteConfirm(item) {
  if (item.type === 'chore') return false;
  if (hasUncheckedItems(item)) return true;
  const d = daysUntil(item);
  if (d > 0) return true;
  if (d === 0 && item.startTime) {
    const now = new Date();
    const [h, m] = item.startTime.split(':').map(Number);
    const start = new Date(today); start.setHours(h, m, 0, 0);
    return (start - now) / 60000 > 60;
  }
  return false;
}

function openConfirmComplete(id, reason) {
  // reason: 'lastCheck' | undefined (auto-detect)
  const item = items.find(i=>i.id===id); if (!item) return;
  pendingCompleteId = id;

  const unchecked = (item.checklist||[]).filter(c => !c.done).length;
  const d = daysUntil(item);
  const timingIssue = d > 0 || (d === 0 && item.startTime && (() => {
    const now = new Date();
    const [h,m] = item.startTime.split(':').map(Number);
    const start = new Date(today); start.setHours(h,m,0,0);
    return (start - now) / 60000 > 60;
  })());

  let title;
  if (reason === 'lastCheck') {
    title = 'Complete the task?';
  } else if (unchecked > 0 && timingIssue) {
    const due = getDueDate(item);
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][due.getDay()];
    const whenStr = d === 1 ? 'tomorrow' : `${dayName}`;
    title = `Not due until ${whenStr} · ${unchecked} item${unchecked===1?'':'s'} not checked off`;
  } else if (unchecked > 0) {
    title = `${unchecked} item${unchecked===1?'':'s'} not checked off`;
  } else if (d > 0) {
    const due = getDueDate(item);
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][due.getDay()];
    title = d === 1 ? "This isn't due until tomorrow" : `This isn't due until ${dayName}`;
  } else {
    const [h, m] = item.startTime.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    title = `This isn't until ${h12}:${String(m).padStart(2,'0')} ${ampm}`;
  }

  document.getElementById('confirmCompleteTitle').textContent = title;
  document.getElementById('confirmCompleteSub').textContent = item.name;
  document.getElementById('confirmCompleteBg').classList.add('open');
}

function closeConfirmComplete() {
  document.getElementById('confirmCompleteBg').classList.remove('open');
  pendingCompleteId = null;
  render();
}

function bgClickConfirmComplete(e) {
  if (e.target === document.getElementById('confirmCompleteBg')) closeConfirmComplete();
}

async function doCompleteItem() {
  const id = pendingCompleteId;
  closeConfirmComplete();
  if (id) await completeItem(id);
}

function toggleExpand(id) {
  const item = items.find(i=>i.id===id);
  if (item?.type === 'grocery') { openGroceryPanel(id); return; }
  expandedId = expandedId===id ? null : id;
  render();
  if (expandedId === id) {
    if (item?.type === 'event') loadEventPanel(id);
    else if (item?.type === 'chore') loadAndRenderChorePanel(id);
  }
}

async function toggleCheck(id,idx) {
  const item=items.find(i=>i.id===id); if (!item) return;
  item.checklist[idx].done=!item.checklist[idx].done;
  await persistItem(item); renderChecklist(id); renderBadge(id);
  // Auto-prompt complete when last item gets checked
  const cl = item.checklist||[];
  if (item.checklist[idx].done && cl.every(c=>c.done)) {
    openConfirmComplete(id, 'lastCheck');
  }
}
async function deleteCheckItem(id,idx) {
  const item=items.find(i=>i.id===id); if (!item) return;
  item.checklist.splice(idx,1);
  await persistItem(item); renderChecklist(id); renderBadge(id);
}
async function addCheckItem(id) {
  const inp=document.getElementById('clinput-'+id);
  const text=(inp?.value||'').trim(); if (!text) return;
  const item=items.find(i=>i.id===id); if (!item) return;
  item.checklist.push({text,done:false}); inp.value='';
  await persistItem(item); renderChecklist(id); renderBadge(id); inp.focus();
}
async function resetChecklist(id) {
  const item=items.find(i=>i.id===id); if (!item) return;
  item.checklist.forEach(c=>c.done=false);
  await persistItem(item); renderChecklist(id); renderBadge(id);
}

async function saveItemNote(id, value) {
  const note = value.trim() || null;
  const item = items.find(i => i.id === id);
  if (!item || item.note === note) return;
  item.note = note;
  await sb.from('tether_items').update({ note }).eq('id', id);
}

async function deleteItem(id) {
  const item=items.find(i=>i.id===id); if (!item) return;
  if (!confirm(`Delete "${item.name}"?`)) return;
  const ok = await deleteItemFromDb(id);
  if (!ok) return;
  items=items.filter(i=>i.id!==id);
  expandedId=null;
  showToast("🗑 Deleted");
  render();
}

function editItem(id) {
  const item=items.find(i=>i.id===id); if (!item) return;

  if (item.type==='event') {
    openEventModal();
    document.getElementById("fEventName").value=item.name;
    document.getElementById("fEventStartDate").value=item.date||"";
    document.getElementById("fEventStartTime").value=item.startTime||"";
    document.getElementById("fEventEndDate").value=item.endDate||"";
    document.getElementById("fEventEndTime").value=item.endTime||"";
    document.getElementById("fEventLocation").value=item.location||"";
    document.getElementById("fGuestsCanInvite").checked=item.guestsCanInvite??true;
    document.getElementById("fAllowAdditions").checked=item.allowAdditionalItems??true;
    selectedEventIcon=item.eventIcon||null;
    document.getElementById("btnEventSave").disabled=false;
    document.getElementById("btnEventSave").textContent='Update Event';
    document.getElementById("btnEventSave").onclick=async function(){
      item.name=document.getElementById("fEventName").value.trim(); if(!item.name) return;
      item.date=document.getElementById("fEventStartDate").value;
      item.endDate=document.getElementById("fEventEndDate").value||null;
      item.startTime=document.getElementById("fEventStartTime").value||null;
      item.endTime=document.getElementById("fEventEndTime").value||null;
      item.location=document.getElementById("fEventLocation").value.trim()||null;
      item.guestsCanInvite=document.getElementById("fGuestsCanInvite").checked;
      item.allowAdditionalItems=document.getElementById("fAllowAdditions").checked;
      item.eventIcon=selectedEventIcon;
      closeEventModal();
      await persistItem(item);
      expandedId=null;
      showToast("✏️ Updated");
      render();
      document.getElementById("btnEventSave").onclick=saveEvent;
    };
    return;
  }

  // Task modal — open directly, bypass chooser
  closeChooser();
  document.getElementById("fName").value=item.name;
  document.getElementById("fTaskTime").value=item.startTime||"";
  document.getElementById("fUrgent").checked=item.isUrgent||false;

  const isRecurring = item.type==='interval'||item.type==='weekday'||item.type==='monthly'||item.type==='yearly'||item.type==='annual';
  document.getElementById("fRecurring").checked=isRecurring;
  document.getElementById("recurringSection").style.display=isRecurring?"":"none";

  if(item.type==='oneTime'){
    document.getElementById("fDueDate").value=item.date||isoToday();
    document.getElementById("fIncrement").value="day";
    document.getElementById("fEveryNum").value=1;
  } else if(item.type==='interval'){
    const due=getDueDate(item);
    document.getElementById("fDueDate").value=due.toISOString().slice(0,10);
    document.getElementById("fIncrement").value="day";
    document.getElementById("fEveryNum").value=item.days||1;
    document.getElementById("weekDayPicker").style.display="none";
    document.getElementById("monthPicker").style.display="none";
  } else if(item.type==='weekday'){
    const due=getDueDate(item);
    document.getElementById("fDueDate").value=due.toISOString().slice(0,10);
    document.getElementById("fIncrement").value="week";
    document.getElementById("fEveryNum").value=item.weekInterval||1;
    selectedWeekdays=[...(item.weekdays||[1])];
    document.querySelectorAll(".day-pill").forEach(p=>p.classList.toggle("active",(item.weekdays||[]).includes(parseInt(p.dataset.day))));
    document.getElementById("weekDayPicker").style.display="";
    document.getElementById("monthPicker").style.display="none";
  } else if(item.type==='monthly'){
    const due=getDueDate(item);
    document.getElementById("fDueDate").value=due.toISOString().slice(0,10);
    document.getElementById("fIncrement").value="month";
    document.getElementById("fEveryNum").value=item.days||1;
    document.getElementById("weekDayPicker").style.display="none";
    document.getElementById("monthPicker").style.display="";
    if(item.monthWeek!==null && item.monthWeek!==undefined){
      document.getElementById("fMonthWeekday").checked=true;
    } else {
      document.getElementById("fMonthDay").checked=true;
    }
    onDueDateChange();
  } else if(item.type==='yearly'){
    document.getElementById("fIncrement").value="year";
    document.getElementById("fEveryNum").value=1;
    document.getElementById("weekDayPicker").style.display="none";
    document.getElementById("monthPicker").style.display="none";
    document.getElementById("yearPicker").style.display="";
    document.getElementById("fDueDate").value="";
    document.getElementById("fYearMonth").value=String(item.days||1);
    if(item.monthWeek!==null && item.monthWeek!==undefined){
      document.getElementById("fYearWeekday").checked=true;
    } else {
      document.getElementById("fYearDay").checked=true;
    }
    onYearPickerChange();
  } else if(item.type==='annual'){
    const due=getDueDate(item);
    document.getElementById("fDueDate").value=due.toISOString().slice(0,10);
    document.getElementById("fDueDateField").style.display="";
    document.getElementById("fIncrement").value="year";
    document.getElementById("fEveryNum").value=item.yearInterval||1;
    document.getElementById("weekDayPicker").style.display="none";
    document.getElementById("monthPicker").style.display="none";
    document.getElementById("yearPicker").style.display="none";
  }

  onRecurrenceChange();
  validateForm();
  document.getElementById("taskModalBg").classList.add("open");
  setTimeout(()=>document.getElementById("fName").focus(),300);

  document.getElementById("btnSave").textContent="Save Changes";
  document.getElementById("btnSave").onclick=async function(){
    const name=document.getElementById("fName").value.trim(); if(!name) return;
    const dueDate=document.getElementById("fDueDate").value;
    const recurring=document.getElementById("fRecurring").checked;
    const inc=document.getElementById("fIncrement")?.value||"day";
    const num=parseInt(document.getElementById("fEveryNum")?.value)||1;

    item.name=name;
    item.startTime=document.getElementById("fTaskTime")?.value||null;
    item.isUrgent=document.getElementById("fUrgent")?.checked||false;

    if(!recurring){
      item.type="oneTime"; item.date=dueDate; item.days=null; item.lastDone=null;
      item.weekdays=null; item.weekInterval=1; item.monthDay=null; item.monthWeek=null; item.monthWeekday=null;
    } else if(inc==="day"){
      item.type="interval"; item.days=num;
      const d=new Date(dueDate+"T00:00:00"); d.setDate(d.getDate()-num);
      item.lastDone=d.toISOString().slice(0,10);
      item.weekdays=null; item.weekInterval=1; item.monthDay=null; item.monthWeek=null; item.monthWeekday=null; item.date=null;
    } else if(inc==="week"){
      item.type="weekday"; item.weekdays=[...selectedWeekdays]; item.weekInterval=num;
      const firstDue=new Date(dueDate+"T00:00:00"); firstDue.setDate(firstDue.getDate()-(num*7));
      item.lastDone=firstDue.toISOString().slice(0,10);
      item.days=null; item.monthDay=null; item.monthWeek=null; item.monthWeekday=null; item.date=null;
    } else if(inc==="month"){
      item.type="monthly"; item.days=num; item.lastDone=dueDate;
      const isWeekdayMode=document.getElementById("fMonthWeekday")?.checked;
      if(isWeekdayMode){
        const d=new Date(dueDate+"T00:00:00");
        item.monthWeekday=d.getDay(); item.monthWeek=Math.ceil(d.getDate()/7); item.monthDay=null;
      } else {
        item.monthDay=new Date(dueDate+"T00:00:00").getDate(); item.monthWeek=null; item.monthWeekday=null;
      }
      item.weekdays=null; item.weekInterval=1; item.date=null;
    } else if(inc==="year"){
      item.type="yearly";
      const month=parseInt(document.getElementById("fYearMonth").value)||1;
      item.days=month;
      const isWeekdayMode=document.getElementById("fYearWeekday")?.checked;
      const year=today.getFullYear();
      let occurrence;
      if(isWeekdayMode){
        const dayNum=parseInt(document.getElementById("fYearDayNum").value)||1;
        item.monthWeekday=new Date(year,month-1,dayNum).getDay(); item.monthWeek=Math.ceil(dayNum/7); item.monthDay=null;
        occurrence=new Date(year,month-1,1);
        let count=0,tries=0;
        while(tries++<35){ if(occurrence.getDay()===item.monthWeekday&&++count===item.monthWeek) break; occurrence.setDate(occurrence.getDate()+1); }
      } else {
        item.monthDay=parseInt(document.getElementById("fYearDayNum").value)||1; item.monthWeek=null; item.monthWeekday=null;
        occurrence=new Date(year,month-1,item.monthDay);
      }
      if(occurrence < today){ occurrence.setFullYear(year+1); }
      item.lastDone=occurrence.toISOString().slice(0,10);
      item.weekdays=null; item.weekInterval=1; item.date=null;
    }

    closeTaskModal();
    await persistItem(item);
    expandedId=null;
    showToast("✏️ Updated");
    render();
    document.getElementById("btnSave").textContent="Add Task";
    document.getElementById("btnSave").onclick=saveItem;
  };
}

function renderBadge(id) {
  const el=document.querySelector(`#item-${id} .badge`);
  const item=items.find(i=>i.id===id);
  if (el&&item) el.outerHTML=badgeFor(item);
}
function renderChecklist(id) {
  const panel=document.getElementById('clpanel-'+id);
  const item=items.find(i=>i.id===id);
  if (!panel||!item) return; panel.innerHTML=clHTML(item);
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function clHTML(item) {
  const cl=item.checklist||[]; const done=cl.filter(c=>c.done).length;
  const rows=cl.map((c,i)=>`<div class="cl-item">
    <div class="cl-check${c.done?' done':''}" onclick="toggleCheck('${item.id}',${i})">
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><polyline points="1.5,5.5 4.5,8.5 9.5,2.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <span class="cl-label${c.done?' done':''}">${c.text}</span>
    <div class="cl-delete" onclick="deleteCheckItem('${item.id}',${i})">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <line x1="2" y1="2" x2="10" y2="10" stroke="#A32D2D" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="10" y1="2" x2="2" y2="10" stroke="#A32D2D" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </div>
  </div>`).join('');
  const noteVal = (item.note || '').replace(/"/g, '&quot;');
  return `<div class="cl-header"><span class="cl-title">Checklist</span><span class="cl-progress">${done}/${cl.length} done</span></div>`
    +rows
    +`<div class="cl-add"><input id="clinput-${item.id}" type="text" placeholder="Add item..." onkeydown="if(event.key==='Enter')addCheckItem('${item.id}')"/><button onclick="addCheckItem('${item.id}')">Add</button></div>`
    +(done>0?`<div class="cl-reset" onclick="resetChecklist('${item.id}')">Reset all</div>`:'')
    +`<input class="item-note-input" value="${noteVal}" placeholder="Add a note…" onblur="saveItemNote('${item.id}',this.value)" onkeydown="if(event.key==='Enter')this.blur()">`
    +`<div class="cl-item-actions"><button class="cl-action-btn cl-action-edit" onclick="editItem('${item.id}')">✏️ Edit</button><button class="cl-action-btn cl-action-delete" onclick="deleteItem('${item.id}')">🗑 Delete</button></div>`;
}

function rowHTML(item, isOverdue) {
  const exp=expandedId===item.id;
  const isEvent = item.type === 'event';
  const isGrocery = item.type === 'grocery';
  const isChore = item.type === 'chore';
  const isOccasion = item.type === 'occasion';

  // Occasions get a simplified non-swipeable row
  if (isOccasion) {
    return `<div class="row-outer" id="outer-${item.id}">
      <div class="row-wrap" id="wrap-${item.id}">
        <div class="item" id="item-${item.id}" data-id="${item.id}" style="position:relative;cursor:pointer" onclick="openOccasionDetail('${item.id}')">
          <div class="type-icon-wrap">${iconFor(item)}</div>
          <div class="item-body">
            <div class="item-name">${item.name}</div>
            <div class="item-sub">${subFor(item)}</div>
          </div>
          ${badgeFor(item)}
        </div>
      </div>
    </div>`;
  }

  const avatarHTML = (currentHousehold && !isEvent) ? itemAvatarHTML(item.assignedTo || item.createdBy, item.id) : '';
  const itemStyle = exp ? `position:relative;${(isEvent||isChore)?'cursor:pointer;':'border-bottom-left-radius:0;border-bottom-right-radius:0;'}` : `position:absolute;inset:0;cursor:${(isEvent||isGrocery)?'pointer':'grab'};`;
  const itemClick = (isEvent || isGrocery || exp) ? `onclick="toggleExpand('${item.id}')"` : '';
  const itemClass = `item${isOverdue?' overdue':''}${exp?' held':''}${exp?'':' swipeable'}`;
  let expandedPanel = '';
  if (exp) {
    if (isEvent) expandedPanel = `<div class="event-panel" id="evpanel-${item.id}">Loading...</div>`;
    else if (isChore) expandedPanel = `<div class="chore-panel" id="chorepanel-${item.id}"><div style="color:var(--accent-soft);font-size:13px;padding:.5rem 0">Loading...</div></div>`;
    else expandedPanel = `<div class="checklist-panel" id="clpanel-${item.id}">${clHTML(item)}</div>`;
  }
  return `<div class="row-outer" id="outer-${item.id}">
    <div class="row-wrap${exp?' expanded':''}" id="wrap-${item.id}">
      ${!exp?`<div class="row-bg">
        <div class="bg-complete"><span class="bg-label" id="lc-${item.id}">${isEvent?'👋 Dismiss':'✓ All done'}</span></div>
        <div class="bg-snooze"><span class="bg-label" id="ls-${item.id}">⏱ Snooze</span></div>
      </div>`:''}
      <div class="${itemClass}" id="item-${item.id}" data-id="${item.id}" style="${itemStyle}" ${itemClick}>
        <div class="type-icon-wrap">${iconFor(item)}</div>
        <div class="item-body">
          <div class="item-name">${item.name}</div>
          <div class="item-sub">${subFor(item)}</div>
        </div>
        ${avatarHTML}
        ${badgeFor(item)}
      </div>
      ${expandedPanel}
    </div>
  </div>`;
}

function render() {
  today = new Date(); today.setHours(0,0,0,0);
  const el = document.getElementById('list');

  // Filter items for current tab — expire snoozed items if their altDueDate has passed
  items.forEach(item => {
    // Auto-expire snooze when altDueDate has passed
    if (item.status === 'snoozed' && item.altDueDate) {
      const snoozeDate = new Date(item.altDueDate + 'T00:00:00');
      if (snoozeDate <= today) {
        item.status = item.lastDone ? 'recurred' : 'active';
        item.altDueDate = null;
        persistItem(item);
      }
    }
  });

  const filtered = items.filter(i => itemVisibleInTab(i, tab));

  // Sort: urgent → by due date → within same day: timed by time, then untimed
  const sorted = [...filtered].sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    const aDays = daysUntil(a);
    const bDays = daysUntil(b);
    if (aDays !== bDays) return aDays - bDays;
    const aHasTime = !!(a.startTime);
    const bHasTime = !!(b.startTime);
    if (aHasTime && bHasTime) return a.startTime.localeCompare(b.startTime);
    if (aHasTime && !bHasTime) return -1;
    if (!aHasTime && bHasTime) return 1;
    return 0;
  });
  const overdue = sorted.filter(i => daysUntil(i) < 0 && i.type !== 'event');
  const rest = sorted.filter(i => !(daysUntil(i) < 0 && i.type !== 'event'));

  let html = '';

  if (sorted.length === 0) {
    if (tab === 'today') {
      if (!celebrationShown) { celebrationShown = true; setTimeout(showCelebration, 120); }
      html = `<div class="clean-slate">
        <div class="slate-icon">⚓</div>
        <div class="slate-title">You're tethered.</div>
        <div class="slate-sub">Nothing left for today.<br>Rest easy — you've got this.</div>
      </div>`;
    } else {
      html = `<div class="empty-state"><div class="empty-icon">⚓</div><p>Nothing ${tab === 'week' ? 'coming up this week' : 'on the horizon'}.<br>You're ahead of the game.</p></div>`;
    }
  } else {
    if (tab === 'today') celebrationShown = false;
    if (overdue.length) { html += `<div class="section-label">Overdue</div>`; overdue.forEach(i => html += rowHTML(i, true)); }
    if (rest.length) { if (overdue.length) html += `<div class="section-label">Upcoming</div>`; rest.forEach(i => html += rowHTML(i, false)); }
  }

  el.innerHTML = html;
  el.querySelectorAll('.item[data-id]').forEach(attachSwipe);

  // Update events banner
  const weekEnd = rollingWeekEnd();
  const weekEvents = items.filter(i =>
    i.type === 'event' &&
    i.status !== 'dismissed' &&
    getDueDate(i) >= today &&
    getDueDate(i) <= weekEnd
  );
  const bannerText = document.getElementById('eventsBannerText');
  if (bannerText) {
    bannerText.textContent = weekEvents.length > 0
      ? `${weekEvents.length} event${weekEvents.length === 1 ? '' : 's'} this week`
      : 'No events this week';
  }
}

// ─── SWIPE ────────────────────────────────────────────────────────────────────
function attachSwipe(el) {
  const id=el.dataset.id;
  const item=items.find(i=>i.id===id);
  if (item?.type==='occasion') return; // occasions are not swipeable
  let startX=0,startY=0,curX=0,dragging=false,didMove=false,holdTimer=null;
  const THRESHOLD=80,HOLD_MS=500;
  function start(x,y){startX=x;startY=y;curX=0;dragging=true;didMove=false;el.classList.add('swiping');holdTimer=setTimeout(()=>{if(!didMove){dragging=false;el.classList.remove('swiping');el.style.transform='';toggleExpand(id);}},HOLD_MS);}
  function move(x,y){
    if(!dragging)return;
    const dx=x-startX,dy=y-startY;
    if(!didMove&&Math.abs(dy)>Math.abs(dx)){dragging=false;el.classList.remove('swiping');clearTimeout(holdTimer);return;}
    if(Math.abs(dx)>8){didMove=true;clearTimeout(holdTimer);}
    if(!didMove)return;
    curX=dx;el.style.transform=`translateX(${dx}px)`;
    const lc=document.getElementById('lc-'+id),ls=document.getElementById('ls-'+id);
    if(lc)lc.classList.toggle('show',dx>30);if(ls)ls.classList.toggle('show',dx<-30);
  }
  function end(){
    clearTimeout(holdTimer);if(!dragging)return;dragging=false;el.classList.remove('swiping');
    const lc=document.getElementById('lc-'+id),ls=document.getElementById('ls-'+id);
    if(lc)lc.classList.remove('show');if(ls)ls.classList.remove('show');
    if(curX>THRESHOLD){
      const swipeItem=items.find(i=>i.id===id);
      if(swipeItem&&needsCompleteConfirm(swipeItem)){el.style.transform='translateX(0)';openConfirmComplete(id);}
      else{el.classList.add('completing');setTimeout(()=>completeItem(id),220);}
    }
    else if(curX<-THRESHOLD){
      // Animate off then show snooze sheet
      el.classList.add('snoozing');
      setTimeout(()=>{ render(); openSnoozeSheet(id); },220);
    }
    else el.style.transform='translateX(0)';
  }
  el.addEventListener('mousedown',e=>{start(e.clientX,e.clientY);e.preventDefault()});
  window.addEventListener('mousemove',e=>{if(dragging)move(e.clientX,e.clientY)});
  window.addEventListener('mouseup',end);
  el.addEventListener('touchstart',e=>{const t=e.touches[0];start(t.clientX,t.clientY)},{passive:true});
  el.addEventListener('touchmove',e=>{const t=e.touches[0];move(t.clientX,t.clientY)},{passive:true});
  el.addEventListener('touchend',end);
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function setTab(t,el){
  tab=t;
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  el.classList.add('active');
  render();
}

// ─── ADD ITEM MODAL ───────────────────────────────────────────────────────────

// ─── TASK MODAL JS ────────────────────────────────────────────────────────────

function openModal(){ openChooser(); }
function openChooser(){ document.getElementById("chooserBg").classList.add("open"); }
function closeChooser(){ document.getElementById("chooserBg").classList.remove("open"); }
function bgClickChooser(e){ if(e.target===document.getElementById("chooserBg")) closeChooser(); }

function selectTaskCategory(cat, el) {
  selectedTaskCategory = cat;
  document.querySelectorAll('.task-category-row .type-pill').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  showCategoryForm(cat);
}

function showCategoryForm(cat) {
  const nameInput = document.getElementById('fName');
  const nameLabel = document.getElementById('taskNameLabel');
  const dateLabel = document.getElementById('fDateLabel');
  const btn = document.getElementById('btnSave');
  btn.onclick = saveItem;
  nameInput.value = '';
  if (cat === 'grocery') {
    nameLabel.textContent = 'Grocery list name';
    dateLabel.textContent = 'Shopping date';
    nameInput.placeholder = 'e.g. Grocery Run';
    nameInput.value = 'Grocery Run';
    btn.textContent = 'Save & Add Items';
  } else if (cat === 'chores') {
    nameLabel.textContent = 'Chore list name';
    dateLabel.textContent = 'Due date';
    nameInput.placeholder = 'e.g. House Chores';
    nameInput.value = 'House Chores';
    btn.textContent = 'Save & Add Items';
  } else {
    nameLabel.textContent = 'Task name';
    dateLabel.textContent = 'Due date';
    nameInput.placeholder = 'e.g. Mow the lawn';
    btn.textContent = 'Add Task';
  }
  validateForm();
}


function renderAssigneeRow() {
  const field = document.getElementById('formAssigneeField');
  const row = document.getElementById('formAssigneeRow');
  if (!householdMembers?.length) { field.style.display = 'none'; return; }
  field.style.display = '';
  row.innerHTML = householdMembers.map(m => {
    const initials = getInitials(m.display_name || m.email);
    const avatar = m.avatar_url ? `<img src="${m.avatar_url}" alt="${initials}"/>` : `<div class="ca-initials">${initials}</div>`;
    const name = (m.display_name?.split(' ')[0] || m.email.split('@')[0]);
    const active = formAssigneeId === m.user_id ? ' active' : '';
    return `<button class="chore-assignee-pill${active}" onclick="selectFormAssignee('${m.user_id}',this)">${avatar}<span class="ca-name">${name}</span></button>`;
  }).join('');
}

function selectFormAssignee(userId, el) {
  formAssigneeId = formAssigneeId === userId ? null : userId;
  document.querySelectorAll('.chore-assignee-pill').forEach(p => p.classList.remove('active'));
  if (formAssigneeId) el.classList.add('active');
}


function openTaskModal(){
  closeChooser();
  document.getElementById("fName").value="";
  document.getElementById("fDueDate").value=isoToday();
  document.getElementById("fTaskTime").value="";
  document.getElementById("fRecurring").checked=false;
  document.getElementById("fUrgent").checked=false;
  document.getElementById("recurringSection").style.display="none";
  document.getElementById("fEveryNum").value="1";
  document.getElementById("fIncrement").value="day";
  document.getElementById("weekDayPicker").style.display="none";
  document.getElementById("monthPicker").style.display="none";
  selectedWeekdays=[];
  document.querySelectorAll(".day-pill").forEach(p=>p.classList.remove("active"));
  document.getElementById("btnSave").textContent="Add Task";
  document.getElementById("btnSave").onclick=saveItem;
  formAssigneeId = null;
  renderAssigneeRow();
  selectTaskCategory('custom', document.getElementById('catPillCustom'));
  onDueDateChange();
  validateForm();
  document.getElementById("taskModalBg").classList.add("open");
  setTimeout(()=>document.getElementById("fName").focus(),300);
}
function closeTaskModal(){ document.getElementById("taskModalBg").classList.remove("open"); }
function bgClickTask(e){ /* require X to close — background click ignored to prevent accidental data loss */ }
function closeModal(){ closeTaskModal(); }
function bgClick(e){ bgClickTask(e); }

function toggleRecurring(){
  const on = document.getElementById("fRecurring").checked;
  document.getElementById("recurringSection").style.display = on ? "" : "none";
  // Always restore due date field visibility when toggling — onIncrementChange may hide it for yearly
  const dueDateField = document.getElementById("fDueDateField");
  if(dueDateField) dueDateField.style.display = "";
  if(on) onIncrementChange();
  onRecurrenceChange();
  validateForm();
}

function onDueDateChange(){
  const dateVal = document.getElementById("fDueDate").value;
  if(!dateVal) return;
  const d = new Date(dateVal+"T00:00:00");
  const dayNum = d.getDate();
  const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
  const weekNum = Math.ceil(dayNum/7);
  const ordinals = ["","First","Second","Third","Fourth","Fifth"];
  const ordinal = ordinals[weekNum] || "Last";
  document.getElementById("monthDayLabel").textContent = "Day "+dayNum+" of the month";
  document.getElementById("monthWeekdayLabel").textContent = ordinal+" "+dayName;
  // Sync day pill to match selected date weekday
  const dayIndex = d.getDay();
  selectedWeekdays = [dayIndex];
  document.querySelectorAll(".day-pill").forEach(p=>{
    p.classList.toggle("active", parseInt(p.dataset.day)===dayIndex);
  });
  onRecurrenceChange();
}

function onIncrementChange(){
  const inc = document.getElementById("fIncrement").value;
  const weekInterval = parseInt(document.getElementById("fEveryNum")?.value)||1;
  document.getElementById("weekDayPicker").style.display = inc==="week" ? "" : "none";
  document.getElementById("monthPicker").style.display = inc==="month" ? "" : "none";
  document.getElementById("yearPicker").style.display = "none";
  const dueDateField = document.getElementById("fDueDateField");
  if(dueDateField) dueDateField.style.display = "";
  const everyRow = document.getElementById("fEveryNum")?.closest("div[style*='flex']");
  if(everyRow) everyRow.style.display = "";
  // If switching to week with interval > 1, enforce single day selection
  if(inc==="week" && weekInterval > 1 && selectedWeekdays.length > 1){
    selectedWeekdays = [selectedWeekdays[0]];
    document.querySelectorAll(".day-pill").forEach(p=>{
      p.classList.toggle("active", parseInt(p.dataset.day)===selectedWeekdays[0]);
    });
  }
  onRecurrenceChange();
}

function onRecurrenceChange(){
  const preview = document.getElementById("recurrencePreview");
  if(!preview) return;
  const recurring = document.getElementById("fRecurring")?.checked;
  if(!recurring){ preview.textContent=""; return; }
  const num = parseInt(document.getElementById("fEveryNum").value)||1;
  const inc = document.getElementById("fIncrement").value;
  const wd=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  let text="";
  if(inc==="day") text=`Every ${num} day${num>1?"s":""}`;
  else if(inc==="week"){
    const days=selectedWeekdays.map(d=>wd[d]).join(", ");
    text=`Every ${num===1?"":num+" "}week${num>1?"s":""}`+(days?` on ${days}`:"");
  } else if(inc==="month"){
    const isWeekday=document.getElementById("fMonthWeekday")?.checked;
    const label=isWeekday?document.getElementById("monthWeekdayLabel").textContent:document.getElementById("monthDayLabel").textContent;
    text=`Every ${num===1?"":num+" "}month${num>1?"s":""} · ${label}`;
  } else if(inc==="year"){
    const yrs = num===1 ? "Every year" : `Every ${num} years`;
    const dateVal = document.getElementById("fDueDate")?.value;
    if(dateVal){
      const d = new Date(dateVal+"T00:00:00");
      text = `${yrs} · ${d.toLocaleDateString("en-US",{month:"long",day:"numeric"})}`;
    } else {
      text = yrs;
    }
  }
  preview.textContent=text;
}

function onYearPickerChange(){
  const month = parseInt(document.getElementById("fYearMonth")?.value||1);
  const dayNum = parseInt(document.getElementById("fYearDayNum")?.value)||1;
  const ordinals = ["","First","Second","Third","Fourth","Fifth"];
  // Build a representative date: this year's month + dayNum (clamped to avoid month overflow)
  const year = today.getFullYear();
  const d = new Date(year, month-1, Math.min(dayNum, 28));
  const weekNum = Math.ceil(d.getDate()/7);
  const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
  const ydl = document.getElementById("yearDayLabel");
  const ywl = document.getElementById("yearWeekdayLabel");
  if(ydl) ydl.textContent = "Day " + dayNum + " of the month";
  if(ywl) ywl.textContent = (ordinals[weekNum]||"Last") + " " + dayName;
  onRecurrenceChange();
  validateForm();
}

function toggleDay(day,el){
  const weekInterval = parseInt(document.getElementById("fEveryNum")?.value)||1;
  if(weekInterval > 1){
    // Multi-week interval: enforce single day — clicking a day switches to it
    selectedWeekdays = [day];
    document.querySelectorAll(".day-pill").forEach(p=>p.classList.remove("active"));
    el.classList.add("active");
  } else {
    // Weekly: allow multiple days
    if(selectedWeekdays.includes(day)){
      if(selectedWeekdays.length===1) return; // must have at least one
      selectedWeekdays=selectedWeekdays.filter(d=>d!==day);
      el.classList.remove("active");
    } else {
      selectedWeekdays.push(day);
      el.classList.add("active");
    }
  }
  // Forward-calculate next occurrence of first selected day and update due date
  // WITHOUT calling onDueDateChange (which would reset the pills)
  const targetDay = selectedWeekdays[0];
  const todayD = new Date(); todayD.setHours(0,0,0,0);
  const offset = (targetDay - todayD.getDay() + 7) % 7;
  const next = new Date(todayD); next.setDate(todayD.getDate() + offset);
  document.getElementById("fDueDate").value = next.toISOString().slice(0,10);
  // Update monthly labels only, don't reset pills
  const d = next;
  const dayNum = d.getDate();
  const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
  const weekNum = Math.ceil(dayNum/7);
  const ordinals = ["","First","Second","Third","Fourth","Fifth"];
  const ordinal = ordinals[weekNum] || "Last";
  const ml = document.getElementById("monthDayLabel"); if(ml) ml.textContent = "Day "+dayNum+" of the month";
  const mwl = document.getElementById("monthWeekdayLabel"); if(mwl) mwl.textContent = ordinal+" "+dayName;
  onRecurrenceChange();
}

function validateForm(){
  const name=document.getElementById("fName")?.value.trim();
  const inc=document.getElementById("fIncrement")?.value||"day";
  const recurring=document.getElementById("fRecurring")?.checked;
  const date=document.getElementById("fDueDate")?.value;
  const dateOk = !!date;
  const valid=!!(name && dateOk);
  const btn=document.getElementById("btnSave");
  if(btn) btn.disabled=!valid;
}

function onEveryNumChange(){
  const inc = document.getElementById("fIncrement")?.value;
  const weekInterval = parseInt(document.getElementById("fEveryNum")?.value)||1;
  if(inc==="week" && weekInterval > 1 && selectedWeekdays.length > 1){
    // Enforce single day when switching to multi-week
    selectedWeekdays = [selectedWeekdays[0]];
    document.querySelectorAll(".day-pill").forEach(p=>{
      p.classList.toggle("active", parseInt(p.dataset.day)===selectedWeekdays[0]);
    });
  }
  onRecurrenceChange();
}

// Keep updatePreview as no-op for compatibility with editItem
function updatePreview(){ onRecurrenceChange(); }
function setType(t,el){ /* no-op - kept for edit compatibility */ }

async function saveItem(){
  const name=document.getElementById("fName").value.trim(); if(!name) return;
  const btnSave=document.getElementById("btnSave");
  btnSave.disabled=true; btnSave.textContent="Saving...";

  const dueDate=document.getElementById("fDueDate").value;
  const recurring=document.getElementById("fRecurring").checked;
  const inc=document.getElementById("fIncrement")?.value||"day";
  const num=parseInt(document.getElementById("fEveryNum")?.value)||1;

  let type, days=null, weekdays=null, weekInterval=1, monthDay=null, monthWeek=null, monthWeekday=null, lastDone=null, date=null;

  if(!recurring){
    type="oneTime";
    date=dueDate;
  } else if(inc==="day"){
    type="interval"; days=num;
    const d=new Date(dueDate+"T00:00:00");
    d.setDate(d.getDate()-days);
    lastDone=d.toISOString().slice(0,10);
  } else if(inc==="week"){
    type="weekday"; weekdays=[...selectedWeekdays]; weekInterval=num;
    // Set lastDone back N weeks so dueDate is the first occurrence
    const firstDue=new Date(dueDate+"T00:00:00");
    firstDue.setDate(firstDue.getDate()-(num*7));
    lastDone=firstDue.toISOString().slice(0,10);
  } else if(inc==="month"){
    type="monthly"; days=num;
    const isWeekdayMode=document.getElementById("fMonthWeekday")?.checked;
    if(isWeekdayMode){
      const d=new Date(dueDate+"T00:00:00");
      monthWeekday=d.getDay(); monthWeek=Math.ceil(d.getDate()/7);
    } else {
      monthDay=new Date(dueDate+"T00:00:00").getDate();
    }
    lastDone=dueDate;
  } else if(inc==="year"){
    type="annual";
    const anchor=new Date(dueDate+"T00:00:00");
    const anchorMinus=new Date(anchor);
    anchorMinus.setFullYear(anchorMinus.getFullYear()-num);
    lastDone=anchorMinus.toISOString().slice(0,10);
  }

  const item={
    name, type, checklist:[], status:'active',
    days, lastDone, weekdays, weekInterval, monthDay, monthWeek, monthWeekday,
    date,
    yearInterval: inc==="year" ? num : 1,
    startTime:document.getElementById("fTaskTime")?.value||null,
    isUrgent:document.getElementById("fUrgent")?.checked||false,
    assignedTo: formAssigneeId || null,
  };

  // Override type and adjust fields based on category
  if (selectedTaskCategory === 'grocery') {
    item.type = 'grocery';
  } else if (selectedTaskCategory === 'chores') {
    item.type = 'chore';
    // Translate monthly: chore expects monthDays array, not monthDay scalar
    if (recurring && inc === 'month' && item.monthDay) {
      item.monthDays = [item.monthDay];
      item.monthDay = null;
      item.monthWeek = null;
      item.monthWeekday = null;
    }
  }

  await persistItem(item);
  btnSave.disabled=false;
  if(item._dbId){
    closeTaskModal();
    items.push(item);
    render();
    formAssigneeId = null;
    if (selectedTaskCategory === 'grocery') {
      openGroceryPanel(item._dbId);
      setTimeout(() => openQuickAddSheet(), 350);
    } else if (selectedTaskCategory === 'chores') {
      setTimeout(() => openChoreEditSheet(item._dbId, 'add'), 350);
    } else {
      showToast(`⚓ "${name}" added`);
    }
  }
}

let selectedEventIcon = '📅';
let eventAttendeeDraft = [];   // [{userId, displayName, avatarUrl}]
let eventBringDraft    = [];   // [string]
let attendeeSearchCache = null; // {groups, contacts, memberMap}
let attendeeGroupViewId = null; // null=list, uuid=member view
let eventDetailCurrentId = null;

function openEventModal() {
  closeChooser();
  selectedEventIcon = '📅';
  eventAttendeeDraft = [];
  eventBringDraft = [];
  attendeeSearchCache = null;
  document.getElementById('eventModalTitle').textContent = 'New Event';
  document.getElementById('fEventName').value = '';
  document.getElementById('fEventLocation').value = '';
  document.getElementById('fEventStartDate').value = isoToday();
  document.getElementById('fEventStartTime').value = '';
  document.getElementById('fEventEndDate').value = '';
  document.getElementById('fEventEndTime').value = '';
  document.getElementById('fInviteHousehold').checked = true;
  document.getElementById('fGuestsCanInvite').checked = true;
  document.getElementById('fAllowAdditions').checked = true;
  document.querySelectorAll('.event-icon-pill').forEach(p => p.classList.toggle('active', p.dataset.icon === '📅'));
  updateAttendeesLabel(); updateBringLabel();
  validateEventForm();
  document.getElementById('eventModalBg').classList.add('open');
  setTimeout(() => document.getElementById('fEventName').focus(), 300);
}
function closeEventModal() { document.getElementById('eventModalBg').classList.remove('open'); }
function bgClickEventModal(e) { /* require X to close — background click ignored to prevent accidental data loss */ }
function selectEventIcon(icon, el) {
  selectedEventIcon = icon;
  document.querySelectorAll('.event-icon-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}
function validateEventForm() {
  const name = document.getElementById('fEventName').value.trim();
  const date = document.getElementById('fEventStartDate').value;
  document.getElementById('btnEventSave').disabled = !(name && date);
}
function updateAttendeesLabel() {
  const n = eventAttendeeDraft.length;
  document.getElementById('eventAttendeesLabel').textContent =
    n > 0 ? `Add attendees · ${n} person${n===1?'':'s'}` : 'Add attendees';
}
function updateBringLabel() {
  const n = eventBringDraft.length;
  document.getElementById('eventBringLabel').textContent =
    n > 0 ? `Add items to bring · ${n} item${n===1?'':'s'}` : 'Add items to bring';
}

async function saveEvent() {
  const name = document.getElementById('fEventName').value.trim(); if (!name) return;
  const btn = document.getElementById('btnEventSave');
  btn.disabled = true; btn.textContent = 'Saving...';
  const inviteHousehold = document.getElementById('fInviteHousehold')?.checked ?? true;
  const item = {
    name, type: 'event', checklist: [], status: 'active',
    date: document.getElementById('fEventStartDate').value,
    endDate: document.getElementById('fEventEndDate').value || null,
    startTime: document.getElementById('fEventStartTime').value || null,
    endTime: document.getElementById('fEventEndTime').value || null,
    eventIcon: selectedEventIcon,
    location: document.getElementById('fEventLocation').value.trim() || null,
    guestsCanInvite: document.getElementById('fGuestsCanInvite').checked,
    allowAdditionalItems: document.getElementById('fAllowAdditions').checked,
    isUrgent: false,
  };
  await persistItem(item);
  btn.disabled = false; btn.textContent = 'Add Event';
  if (!item._dbId) return;

  // Build guest list: creator (is_owner) + manually added + household members if checked
  const householdGuests = inviteHousehold
    ? (householdMembers || []).filter(m => m.user_id !== currentUser.id)
    : [];
  const manualIds = new Set(eventAttendeeDraft.map(a => a.userId));
  const householdToAdd = householdGuests.filter(m => !manualIds.has(m.user_id));

  await Promise.all([
    // Creator as owner guest (so they appear in attendee list and can claim bring items)
    sb.from('event_guests').insert({
      item_id: item._dbId, user_id: currentUser.id,
      invited_by: currentUser.id, is_owner: true,
    }),
    // Manually added attendees
    ...eventAttendeeDraft.map(a =>
      sb.from('event_guests').insert({
        item_id: item._dbId, user_id: a.userId,
        invited_by: currentUser.id, is_owner: false,
      })
    ),
    // Household members (if checkbox checked)
    ...householdToAdd.map(m =>
      sb.from('event_guests').insert({
        item_id: item._dbId, user_id: m.user_id,
        invited_by: currentUser.id, is_owner: false,
      })
    ),
    // Bring list items
    ...eventBringDraft.map(text =>
      sb.from('potluck_items').insert({
        item_id: item._dbId, name: text,
        added_by: currentUser.id, is_request: true,
      })
    ),
  ]);

  closeEventModal();
  items.push(item);
  showToast(`${selectedEventIcon} "${name}" added`);
  render();
}

// ─── ATTENDEE SEARCH ──────────────────────────────────────────────────────────
async function openAttendeeSearch() {
  attendeeGroupViewId = null;
  document.getElementById('attendeeSearchInput').value = '';
  document.getElementById('attendeeSearchBg').classList.add('open');
  document.getElementById('attendeeSearchBody').innerHTML = '<div class="social-loading">Loading…</div>';

  if (!attendeeSearchCache) {
    const [createdRes, membershipRes, contactsRes] = await Promise.all([
      sb.from('groups').select('id, name').eq('created_by', currentUser.id).order('name'),
      sb.from('group_members').select('group_id').eq('user_id', currentUser.id).eq('status', 'accepted'),
      sb.from('contacts').select('requester_id, recipient_id')
        .or(`requester_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
        .eq('status', 'accepted'),
    ]);
    const createdGroups  = createdRes.data || [];
    const createdIds     = new Set(createdGroups.map(g => g.id));
    const otherGroupIds  = (membershipRes.data || []).map(m => m.group_id).filter(id => !createdIds.has(id));
    let otherGroups = [];
    if (otherGroupIds.length) {
      const { data } = await sb.from('groups').select('id, name').in('id', otherGroupIds).order('name');
      otherGroups = data || [];
    }
    const groups = [...createdGroups, ...otherGroups].sort((a, b) => a.name.localeCompare(b.name));

    const contactIds = (contactsRes.data || []).map(r =>
      r.requester_id === currentUser.id ? r.recipient_id : r.requester_id
    );
    const [profilesRes, membersRes] = await Promise.all([
      contactIds.length ? sb.from('users').select('id, display_name, avatar_url, email').in('id', contactIds).order('display_name') : Promise.resolve({data:[]}),
      groups.length ? sb.from('group_members').select('group_id, user_id').in('group_id', groups.map(g=>g.id)).eq('status', 'accepted') : Promise.resolve({data:[]}),
    ]);
    const profiles    = profilesRes.data || [];
    const memberships = membersRes.data  || [];

    const memberMap = {};
    for (const g of groups) {
      const memberIds = memberships.filter(m => m.group_id === g.id).map(m => m.user_id).filter(Boolean);
      if (!memberIds.length) { memberMap[g.id] = []; continue; }
      const profilesInGroup = await sb.from('users').select('id, display_name, avatar_url, email').in('id', memberIds).order('display_name');
      memberMap[g.id] = (profilesInGroup.data || []).map(p => ({userId:p.id, displayName:p.display_name||p.email, avatarUrl:p.avatar_url}));
    }
    attendeeSearchCache = { groups, contacts: profiles.map(p => ({userId:p.id, displayName:p.display_name||p.email, avatarUrl:p.avatar_url})), memberMap };
  }
  renderAttendeeSearch();
}
function closeAttendeeSearch() {
  document.getElementById('attendeeSearchBg').classList.remove('open');
  updateAttendeesLabel();
}
function bgClickAttendeeSearch(e) { if (e.target === document.getElementById('attendeeSearchBg')) closeAttendeeSearch(); }

function attendeeSearchBack() {
  attendeeGroupViewId = null;
  document.getElementById('attendeeSearchInput').value = '';
  renderAttendeeSearch();
}

function renderAttendeeSearch() {
  if (!attendeeSearchCache) return;
  const body = document.getElementById('attendeeSearchBody');
  const q = document.getElementById('attendeeSearchInput').value.trim().toLowerCase();
  const back = document.getElementById('attendeeSearchBack');
  const title = document.getElementById('attendeeSearchTitle');

  if (attendeeGroupViewId) {
    // Member picker view
    back.style.display = '';
    const group = attendeeSearchCache.groups.find(g => g.id === attendeeGroupViewId);
    title.textContent = group?.name || 'Group';
    let members = attendeeSearchCache.memberMap[attendeeGroupViewId] || [];
    if (q) members = members.filter(m => m.displayName.toLowerCase().includes(q));
    body.innerHTML = members.map(m => attendeeCheckRowHTML(m)).join('') || '<div class="social-empty">No members</div>';
  } else {
    // List view
    back.style.display = 'none';
    title.textContent = 'Add Attendees';
    let html = '';

    // Groups
    const groups = q
      ? attendeeSearchCache.groups.filter(g => g.name.toLowerCase().includes(q))
      : attendeeSearchCache.groups;
    if (groups.length) {
      html += '<div class="social-section-label">Groups</div>';
      html += groups.map(g => {
        const members = attendeeSearchCache.memberMap[g.id] || [];
        const selectedCount = members.filter(m => eventAttendeeDraft.some(a => a.userId === m.userId)).length;
        const meta = selectedCount > 0 ? `${selectedCount} of ${members.length} selected` : `${members.length} member${members.length===1?'':'s'}`;
        return `<div class="social-row" onclick="attendeeGroupViewId='${g.id}';renderAttendeeSearch()">
          <div class="social-avatar" style="background:var(--surface);font-size:18px">👥</div>
          <div class="social-row-info">
            <div class="social-row-name">${g.name}</div>
            <div class="social-row-meta">${meta}</div>
          </div>
          <div class="social-row-arrow">›</div>
        </div>`;
      }).join('');
    }

    // Contacts (not already shown via a group for filtering purposes)
    let contacts = q
      ? attendeeSearchCache.contacts.filter(c => c.displayName.toLowerCase().includes(q))
      : attendeeSearchCache.contacts;
    if (contacts.length) {
      html += '<div class="social-section-label">Contacts</div>';
      html += contacts.map(c => attendeeCheckRowHTML(c)).join('');
    }
    body.innerHTML = html || '<div class="social-empty">No contacts or groups yet</div>';
  }
}

function attendeeCheckRowHTML(person) {
  const checked = eventAttendeeDraft.some(a => a.userId === person.userId);
  const initials = getInitials(person.displayName);
  const avatar = person.avatarUrl ? `<img src="${person.avatarUrl}" alt="${initials}"/>` : initials;
  return `<div class="attendee-check-row" onclick="toggleAttendee('${person.userId}','${person.displayName.replace(/'/g,"\\'")}','${person.avatarUrl||''}')">
    <div class="social-avatar">${avatar}</div>
    <div class="social-row-info"><div class="social-row-name">${person.displayName}</div></div>
    <div class="attendee-checkbox${checked?' checked':''}">${checked?'✓':''}</div>
  </div>`;
}

function toggleAttendee(userId, displayName, avatarUrl) {
  const idx = eventAttendeeDraft.findIndex(a => a.userId === userId);
  if (idx >= 0) eventAttendeeDraft.splice(idx, 1);
  else eventAttendeeDraft.push({userId, displayName, avatarUrl: avatarUrl || null});
  renderAttendeeSearch();
}

// ─── EVENT BRING DRAFT ────────────────────────────────────────────────────────
function openEventBringDraft() {
  renderEventBringDraft();
  document.getElementById('eventBringDraftBg').classList.add('open');
  setTimeout(() => document.getElementById('eventBringDraftInput').focus(), 300);
}
function closeEventBringDraft() {
  document.getElementById('eventBringDraftBg').classList.remove('open');
  updateBringLabel();
}
function bgClickEventBringDraft(e) { if (e.target === document.getElementById('eventBringDraftBg')) closeEventBringDraft(); }

function renderEventBringDraft() {
  const body = document.getElementById('eventBringDraftBody');
  if (!eventBringDraft.length) {
    body.innerHTML = '<div class="social-empty">No items yet — add below</div>';
    return;
  }
  body.innerHTML = eventBringDraft.map((text, i) =>
    `<div class="bring-draft-item">
      <span class="bring-draft-item-name">${text}</span>
      <span class="bring-draft-item-remove" onclick="removeEventBringDraftItem(${i})">✕</span>
    </div>`
  ).join('');
}
function addEventBringDraftItem() {
  const inp = document.getElementById('eventBringDraftInput');
  const text = inp.value.trim(); if (!text) return;
  eventBringDraft.push(text); inp.value = '';
  renderEventBringDraft();
}
function removeEventBringDraftItem(idx) {
  eventBringDraft.splice(idx, 1);
  renderEventBringDraft();
}

// ─── EVENT DETAIL SHEET ───────────────────────────────────────────────────────
function openEventDetail(id) {
  const item = items.find(i => i.id === id); if (!item) return;
  eventDetailCurrentId = id;
  document.getElementById('eventDetailIcon').textContent = item.eventIcon || '📅';
  document.getElementById('eventDetailName').textContent = item.name;
  // Meta: date + time
  const dateStr = item.date ? fmtDate(new Date(item.date + 'T00:00:00')) : '';
  const timeStr = item.startTime ? ` · ${fmtTime(item.startTime)}${item.endTime?' – '+fmtTime(item.endTime):''}` : '';
  const endDateStr = item.endDate && item.endDate !== item.date ? ` → ${fmtDate(new Date(item.endDate+'T00:00:00'))}` : '';
  const metaEl = document.getElementById('eventDetailMeta');
  metaEl.textContent = dateStr + endDateStr + timeStr;
  if (item.location) {
    const locDiv = document.createElement('div');
    locDiv.className = 'event-detail-location';
    const locSpan = document.createElement('span');
    locSpan.textContent = '📍 ' + item.location;
    const mapLink = document.createElement('a');
    mapLink.href = `https://maps.google.com/maps?q=${encodeURIComponent(item.location)}`;
    mapLink.target = '_blank'; mapLink.rel = 'noopener';
    mapLink.className = 'event-detail-map-btn';
    mapLink.textContent = '🗺 Navigate';
    locDiv.appendChild(locSpan);
    locDiv.appendChild(mapLink);
    metaEl.appendChild(locDiv);
  }
  const isOwner = item.createdBy === currentUser.id;
  document.getElementById('eventDetailEditBtn').style.display = isOwner ? '' : 'none';
  document.getElementById('evpanel-detail').innerHTML = 'Loading…';
  document.getElementById('eventDetailBg').classList.add('open');
  loadEventPanel(id);
}
function closeEventDetail() {
  document.getElementById('eventDetailBg').classList.remove('open');
  eventDetailCurrentId = null;
}
function bgClickEventDetail(e) { if (e.target === document.getElementById('eventDetailBg')) closeEventDetail(); }
function editCurrentEvent() {
  if (eventDetailCurrentId) { closeEventDetail(); editItem(eventDetailCurrentId); }
}

async function cloneEvent(itemId) {
  const item = items.find(i => i.id === itemId); if (!item) return;

  const [guestsRes, bringRes] = await Promise.all([
    sb.from('event_guests').select('user_id').eq('item_id', itemId).eq('is_owner', false),
    sb.from('potluck_items').select('name').eq('item_id', itemId).order('created_at'),
  ]);
  const guestUserIds = (guestsRes.data || []).map(g => g.user_id).filter(id => id !== currentUser.id);
  let guestProfiles = [];
  if (guestUserIds.length > 0) {
    const { data } = await sb.from('users').select('id, display_name, avatar_url, email').in('id', guestUserIds);
    guestProfiles = data || [];
  }

  closeEventDetail();
  openEventModal();
  document.getElementById('eventModalTitle').textContent = 'Clone Event';
  document.getElementById('fEventName').value = item.name;
  document.getElementById('fEventLocation').value = item.location || '';
  document.getElementById('fEventStartTime').value = item.startTime || '';
  document.getElementById('fEventEndTime').value = item.endTime || '';
  document.getElementById('fEventEndDate').value = item.endDate || '';
  document.getElementById('fGuestsCanInvite').checked = item.guestsCanInvite ?? true;
  document.getElementById('fAllowAdditions').checked = item.allowAdditionalItems ?? true;

  const iconPill = document.querySelector(`.event-icon-pill[data-icon="${item.eventIcon || '📅'}"]`);
  selectEventIcon(item.eventIcon || '📅', iconPill);

  eventBringDraft = (bringRes.data || []).map(b => b.name);
  eventAttendeeDraft = guestProfiles.map(p => ({
    userId: p.id,
    displayName: p.display_name || p.email?.split('@')[0] || 'Guest',
    avatarUrl: p.avatar_url || null,
  }));
  updateAttendeeLabel();
  updateBringLabel();
  validateEventForm();
}

// ─── EVENTS LIST ─────────────────────────────────────────────────────────────
let eventsView = 'future'; // 'future' | 'pending' | 'past'

function openEventsList() {
  setEventsView('future');
  document.getElementById('eventsListBg').classList.add('open');
}

function closeEventsList() {
  document.getElementById('eventsListBg').classList.remove('open');
}

function bgClickEventsList(e) {
  if (e.target === document.getElementById('eventsListBg')) closeEventsList();
}

let expandedEventListId = null;

function toggleEventListItem(id) {
  expandedEventListId = expandedEventListId === id ? null : id;
  renderEventsList();
}

async function rsvpEventFromList(itemId, status) {
  if (!myRsvpMap[itemId]) myRsvpMap[itemId] = {};
  myRsvpMap[itemId].rsvp_status = status;
  renderEventsList();
  await rsvpEvent(itemId, status);
}

function renderEventListPanel(item, now) {
  const isPast = item.status === 'dismissed' || getDueDate(item) < now;
  const rsvp = myRsvpMap[item.id];
  const isOwner = item.createdBy === currentUser.id;
  const isInvited = !!rsvp && !isOwner;
  let html = '<div class="evlist-panel">';

  if (item.location) {
    html += `<div class="evlist-panel-location">📍 <a href="https://maps.google.com/maps?q=${encodeURIComponent(item.location)}" target="_blank" rel="noopener" class="evlist-location-link">${item.location}</a></div>`;
  }

  if (!isPast && isInvited) {
    const going = rsvp.rsvp_status === 'going';
    const maybe = rsvp.rsvp_status === 'maybe';
    const notGoing = rsvp.rsvp_status === 'not_going';
    html += `<div class="evlist-panel-rsvp">
      <button class="rsvp-btn accept${going?' active-accept':''}" onclick="rsvpEventFromList('${item.id}','going')">✓ Going</button>
      <button class="rsvp-btn tentative${maybe?' active-tentative':''}" onclick="rsvpEventFromList('${item.id}','maybe')">~ Tentative</button>
      <button class="rsvp-btn decline${notGoing?' active-decline':''}" onclick="rsvpEventFromList('${item.id}','not_going')">✕ Can't go</button>
    </div>`;
  }

  html += '<div class="evlist-panel-actions">';
  if (!isPast && isOwner) html += `<button class="evlist-panel-btn evlist-btn-edit" onclick="closeEventsList();editItem('${item.id}')">✏️ Edit</button>`;
  html += `<button class="evlist-panel-btn evlist-btn-clone" onclick="closeEventsList();cloneEvent('${item.id}')">📋 Clone</button>`;
  if (!isPast) html += `<button class="evlist-panel-btn evlist-btn-detail" onclick="openEventDetail('${item.id}')">Details ›</button>`;
  html += '</div></div>';
  return html;
}

function setEventsView(view) {
  eventsView = view;
  expandedEventListId = null;
  ['future', 'pending', 'past'].forEach(v => {
    const btn = document.getElementById('eventsToggle' + v.charAt(0).toUpperCase() + v.slice(1));
    if (btn) btn.classList.toggle('active', v === view);
  });
  renderEventsList();
}

function renderEventsList() {
  const body = document.getElementById('eventsListBody');
  const now = new Date(); now.setHours(0,0,0,0);
  const eventItems = items.filter(i => i.type === 'event');

  // Future: events I created or RSVPed going/maybe, not dismissed, date >= today
  const futureList = eventItems.filter(i => {
    if (i.status === 'dismissed') return false;
    const due = getDueDate(i);
    if (!due || due < now) return false;
    const rsvp = myRsvpMap[i.id];
    return !rsvp || rsvp.rsvp_status === 'going' || rsvp.rsvp_status === 'maybe';
  }).sort((a, b) => getDueDate(a) - getDueDate(b));

  // Pending: future-dated invites I haven't responded to yet
  const pendingList = eventItems.filter(i => {
    const due = getDueDate(i);
    if (!due || due < now) return false;
    const rsvp = myRsvpMap[i.id];
    return rsvp && rsvp.rsvp_status === 'pending';
  }).sort((a, b) => getDueDate(a) - getDueDate(b));

  // Past: dismissed or past-date events I have any connection to
  const pastList = eventItems.filter(i => {
    const due = getDueDate(i);
    return i.status === 'dismissed' || (due && due < now);
  }).sort((a, b) => getDueDate(b) - getDueDate(a));

  // Update tab labels with counts
  const futureBtn = document.getElementById('eventsToggleFuture');
  const pendingBtn = document.getElementById('eventsTogglePending');
  const pastBtn = document.getElementById('eventsTogglePast');
  if (futureBtn) futureBtn.textContent = futureList.length ? `Future (${futureList.length})` : 'Future';
  if (pendingBtn) pendingBtn.textContent = pendingList.length ? `Pending (${pendingList.length})` : 'Pending';
  if (pastBtn) pastBtn.textContent = pastList.length ? `Past (${pastList.length})` : 'Past';

  const listMap = { future: futureList, pending: pendingList, past: pastList };
  const emptyMap = { future: 'No upcoming events', pending: 'No pending invites', past: 'No past events' };
  const list = listMap[eventsView] || futureList;

  if (list.length === 0) {
    body.innerHTML = `<div class="events-list-empty">${emptyMap[eventsView]}</div>`;
    return;
  }

  // Group by month
  let html = '';
  let lastMonth = null;
  list.forEach(item => {
    const due = getDueDate(item);
    const monthKey = due ? due.toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Unknown';
    if (monthKey !== lastMonth) {
      html += `<div class="events-month-label">${monthKey}</div>`;
      lastMonth = monthKey;
    }
    const icon = item.eventIcon || '📅';
    const dateStr = item.date ? fmtDate(new Date(item.date + 'T00:00:00')) : '';
    const timeStr = item.startTime ? ` · ${fmtTime(item.startTime)}` : '';
    const locationStr = item.location ? ` · 📍 ${item.location}` : '';
    const rsvp = myRsvpMap[item.id];
    const rsvpBadge = rsvp
      ? `<div class="events-list-rsvp ${rsvp.rsvp_status}">${{ pending: 'Invited', going: 'Going', maybe: 'Maybe', not_going: 'Declined' }[rsvp.rsvp_status] || ''}</div>`
      : '';
    const isExpanded = expandedEventListId === item.id;
    const isPast = item.status === 'dismissed' || getDueDate(item) < now;
    html += `<div class="events-list-item">
      <div class="events-list-row" onclick="toggleEventListItem('${item.id}')">
        <div class="events-list-icon">${icon}</div>
        <div class="events-list-info">
          <div class="events-list-name">${item.name}</div>
          <div class="events-list-meta">${dateStr}${timeStr}${locationStr}</div>
        </div>
        ${rsvpBadge}
        <div class="events-list-chevron${isExpanded ? ' open' : ''}">›</div>
      </div>
      ${isExpanded ? renderEventListPanel(item, now) : ''}
    </div>`;
  });

  body.innerHTML = html;
}

// ─── GROUPS SHEET ────────────────────────────────────────────────────────────
let groupsDetailId    = null;
let groupsInviteOpen  = false;
let groupsCreating    = false;
let groupsSelectedType = 'shared';

function openGroupsSheet() {
  groupsDetailId = null; groupsCreating = false; groupsInviteOpen = false;
  document.getElementById('groupsBg').classList.add('open');
  renderGroupsSheet(null);
}
function closeGroupsSheet() {
  document.getElementById('groupsBg').classList.remove('open');
}
function bgClickGroupsSheet(e) {
  if (e.target === document.getElementById('groupsBg')) closeGroupsSheet();
}

async function renderGroupsSheet(groupId) {
  const body    = document.getElementById('groupsBody');
  const title   = document.getElementById('groupsTitle');
  const backBtn = document.getElementById('groupsBack');

  if (groupId) {
    groupsDetailId = groupId; groupsCreating = false;
    await renderGroupDetail(groupId);
    return;
  }
  groupsDetailId = null;

  if (groupsCreating) {
    backBtn.style.display = '';
    backBtn.onclick = () => { groupsCreating = false; renderGroupsSheet(null); };
    title.textContent = 'New Group';
    renderGroupCreate();
    return;
  }

  backBtn.style.display = 'none';
  backBtn.onclick = () => renderGroupsSheet(null);
  title.textContent = 'Groups';
  body.innerHTML = `<div class="social-loading">Loading…</div>`;

  const [pendingRes, createdRes, membershipRes] = await Promise.all([
    sb.from('group_members').select('id, group_id, groups(name, type)')
      .or(`user_id.eq.${currentUser.id},invited_email.eq.${currentUser.email}`)
      .eq('status', 'pending'),
    sb.from('groups').select('id, name, type, created_by').eq('created_by', currentUser.id).order('name'),
    sb.from('group_members').select('group_id').eq('user_id', currentUser.id).eq('status', 'accepted'),
  ]);

  const pendingInvites = pendingRes.data  || [];
  const createdGroups  = createdRes.data  || [];
  const memberGroupIds = (membershipRes.data || []).map(m => m.group_id);
  const createdIds     = new Set(createdGroups.map(g => g.id));
  const otherIds       = memberGroupIds.filter(id => !createdIds.has(id));

  let memberGroups = [];
  if (otherIds.length) {
    const { data } = await sb.from('groups').select('id, name, type, created_by').in('id', otherIds).order('name');
    memberGroups = data || [];
  }
  const allGroups = [...createdGroups, ...memberGroups].sort((a, b) => a.name.localeCompare(b.name));

  let countMap = {};
  if (allGroups.length) {
    const { data: counts } = await sb.from('group_members').select('group_id').in('group_id', allGroups.map(g => g.id)).eq('status', 'accepted');
    (counts || []).forEach(r => { countMap[r.group_id] = (countMap[r.group_id] || 0) + 1; });
  }

  let html = '';

  if (pendingInvites.length) {
    html += `<div class="social-section-label">Invites</div>`;
    pendingInvites.forEach(inv => {
      const gname = inv.groups?.name || 'a group';
      const gtype = inv.groups?.type === 'personal' ? 'Personal' : 'Shared';
      html += `<div class="social-row" style="cursor:default">
        <div class="social-avatar" style="background:var(--surface);font-size:18px">👥</div>
        <div class="social-row-info">
          <div class="social-row-name">${gname}</div>
          <div class="social-row-meta">${gtype} group</div>
        </div>
        <div class="social-req-actions">
          <button class="social-req-btn social-req-accept" data-id="${inv.id}" data-gid="${inv.group_id}" onclick="acceptGroupMembership(this.dataset.id,this.dataset.gid,true)">Join</button>
          <button class="social-req-btn social-req-decline" data-id="${inv.id}" onclick="declineGroupMembership(this.dataset.id)">Decline</button>
        </div>
      </div>`;
    });
  }

  if (allGroups.length) {
    if (pendingInvites.length) html += `<div class="social-section-label">Your Groups</div>`;
    allGroups.forEach(g => {
      const n = countMap[g.id] || 0;
      html += `<div class="social-row" onclick="renderGroupsSheet('${g.id}')">
        <div class="social-avatar" style="background:var(--surface);font-size:18px">👥</div>
        <div class="social-row-info">
          <div class="social-row-name">${g.name} <span class="group-type-badge ${g.type}">${g.type === 'shared' ? 'Shared' : 'Personal'}</span></div>
          <div class="social-row-meta">${n} member${n === 1 ? '' : 's'}</div>
        </div>
        <div class="social-row-arrow">›</div>
      </div>`;
    });
  }

  if (!html) {
    html = `<div class="social-empty">No groups yet<br><span style="font-size:13px;margin-top:6px;display:block">Tap + Create to make your first group</span></div>`;
  }
  body.innerHTML = html;
}

function renderGroupCreate() {
  const body = document.getElementById('groupsBody');
  groupsSelectedType = 'shared';
  body.innerHTML = `
    <div style="padding:.25rem 0">
      <input class="social-add-input" id="groupNameInput" type="text" placeholder="Group name" maxlength="50" style="margin-bottom:1rem;width:100%">
      <div class="social-section-label" style="margin-top:0">Type</div>
      <div class="group-type-row">
        <button class="group-type-opt active" id="gtype-shared" onclick="selectGroupType('shared')">
          <div class="group-type-opt-label">Shared</div>
          <div class="group-type-opt-sub">All members see each other and connect</div>
        </button>
        <button class="group-type-opt" id="gtype-personal" onclick="selectGroupType('personal')">
          <div class="group-type-opt-label">Personal</div>
          <div class="group-type-opt-sub">Only visible to you</div>
        </button>
      </div>
      <div class="social-add-actions" style="margin-top:1rem">
        <button class="social-req-btn social-req-accept" style="flex:1;padding:12px;font-size:14px" onclick="createGroup()">Create Group</button>
      </div>
    </div>`;
  setTimeout(() => document.getElementById('groupNameInput')?.focus(), 50);
}

function selectGroupType(type) {
  groupsSelectedType = type;
  document.getElementById('gtype-shared')?.classList.toggle('active', type === 'shared');
  document.getElementById('gtype-personal')?.classList.toggle('active', type === 'personal');
}

async function createGroup() {
  const name = document.getElementById('groupNameInput')?.value.trim();
  if (!name) { showToast('Enter a group name'); return; }
  const { data: group, error } = await sb.from('groups')
    .insert({ name, type: groupsSelectedType, created_by: currentUser.id })
    .select().single();
  if (error) { showToast('Could not create group'); return; }
  await sb.from('group_members').insert({
    group_id: group.id, user_id: currentUser.id, invited_email: currentUser.email,
    status: 'accepted', added_by: currentUser.id,
  });
  attendeeSearchCache = null;
  groupsCreating = false;
  showToast(`"${name}" created`);
  renderGroupsSheet(group.id);
}

async function renderGroupDetail(groupId) {
  const body    = document.getElementById('groupsBody');
  const title   = document.getElementById('groupsTitle');
  const backBtn = document.getElementById('groupsBack');
  backBtn.style.display = '';
  backBtn.onclick = () => { groupsDetailId = null; groupsInviteOpen = false; renderGroupsSheet(null); };
  body.innerHTML = `<div class="social-loading">Loading…</div>`;

  const [groupRes, membersRes, pendingRes] = await Promise.all([
    sb.from('groups').select('name, type, created_by').eq('id', groupId).single(),
    sb.from('group_members').select('id, user_id').eq('group_id', groupId).eq('status', 'accepted'),
    sb.from('group_members').select('id, invited_email').eq('group_id', groupId).eq('status', 'pending'),
  ]);

  const group   = groupRes.data;
  const members = membersRes.data || [];
  const pending = pendingRes.data || [];
  if (!group) { body.innerHTML = `<div class="social-empty">Group not found</div>`; return; }

  title.textContent = group.name;
  const isCreator = group.created_by === currentUser.id;
  const isShared  = group.type === 'shared';

  const memberIds = members.map(m => m.user_id).filter(Boolean);
  const { data: profiles } = memberIds.length
    ? await sb.from('users').select('id, display_name, avatar_url, email').in('id', memberIds).order('display_name')
    : { data: [] };

  let html = `<span class="group-type-badge ${group.type}" style="margin-bottom:.75rem;display:inline-block">${isShared ? 'Shared' : 'Personal'}</span>`;

  if (isCreator) {
    if (groupsInviteOpen) {
      html += `<div class="social-add-form">
        <input class="social-add-input" id="groupInviteEmail" type="email" placeholder="Enter email address"
          onkeydown="if(event.key==='Enter')sendGroupInvite('${groupId}','${group.type}')">
        <div class="social-add-status" id="groupInviteStatus"></div>
        <div class="social-add-actions">
          <button class="social-req-btn social-req-accept" onclick="sendGroupInvite('${groupId}','${group.type}')">Send Invite</button>
          <button class="social-req-btn social-req-decline" onclick="groupsInviteOpen=false;renderGroupDetail('${groupId}')">Cancel</button>
        </div>
      </div>`;
    } else {
      html += `<button class="social-add-btn" style="margin-bottom:.75rem" onclick="groupsInviteOpen=true;renderGroupDetail('${groupId}')">+ Invite</button>`;
    }
  }

  if (isCreator && pending.length) {
    html += `<div class="social-section-label">Pending</div>`;
    pending.forEach(p => {
      html += `<div class="pending-invite-row">
        <div class="pending-invite-email">${p.invited_email || 'Unknown'}</div>
        <button class="hh-jr-btn hh-jr-decline" data-id="${p.id}" onclick="cancelGroupInvite(this)">Cancel</button>
      </div>`;
    });
  }

  if (profiles?.length) {
    html += `<div class="social-section-label">Members (${profiles.length})</div>`;
    (profiles || []).forEach(u => {
      const initials = getInitials(u.display_name || u.email);
      const avatar   = u.avatar_url ? `<img src="${u.avatar_url}" alt="${initials}"/>` : initials;
      const memberRow = members.find(m => m.user_id === u.id);
      const removeBtn = isCreator && u.id !== currentUser.id
        ? `<button class="hh-jr-btn hh-jr-decline" data-id="${memberRow?.id}" onclick="removeGroupMember(this)">Remove</button>`
        : '';
      html += `<div class="social-row" style="cursor:default">
        <div class="social-avatar">${avatar}</div>
        <div class="social-row-info">
          <div class="social-row-name">${u.display_name || u.email}${u.id === currentUser.id ? '<span class="member-you-tag">You</span>' : ''}</div>
        </div>
        ${removeBtn}
      </div>`;
    });
  } else {
    html += `<div class="social-empty">No members yet — tap + Invite to add people</div>`;
  }

  html += `<div style="margin-top:1.25rem;padding-top:1rem;border-top:0.5px solid #EEEDFE">`;
  if (isCreator) {
    html += `<button class="hh-leave-btn" onclick="deleteGroup('${groupId}')">Delete Group</button>`;
  } else {
    const myMember = members.find(m => m.user_id === currentUser.id);
    if (myMember) {
      html += `<button class="hh-leave-btn" data-id="${myMember.id}" onclick="leaveGroup(this,'${groupId}')">Leave Group</button>`;
    }
  }
  html += `</div>`;

  body.innerHTML = html;
  if (groupsInviteOpen) setTimeout(() => document.getElementById('groupInviteEmail')?.focus(), 50);
}

async function sendGroupInvite(groupId, groupType) {
  const input    = document.getElementById('groupInviteEmail');
  const statusEl = document.getElementById('groupInviteStatus');
  const email    = input?.value.trim().toLowerCase();
  if (!email) { showToast('Enter an email address'); return; }
  if (statusEl) statusEl.textContent = 'Looking up…';

  const { data: existing } = await sb.from('group_members')
    .select('status').eq('group_id', groupId).eq('invited_email', email).limit(1);
  if (existing?.length) {
    if (statusEl) statusEl.textContent = '';
    showToast(existing[0].status === 'accepted' ? 'Already a member' : 'Invite already sent');
    return;
  }

  const { data: found } = await sb.rpc('lookup_user_by_email', { target_email: email });
  const userId = found?.[0]?.id || null;

  const status = groupType === 'personal' ? 'accepted' : 'pending';
  const { error } = await sb.from('group_members').insert({
    group_id: groupId, user_id: userId, invited_email: email,
    status, added_by: currentUser.id,
  });
  if (error) { if (statusEl) statusEl.textContent = ''; showToast('Could not send invite'); return; }

  if (statusEl) statusEl.textContent = '';
  groupsInviteOpen = false;
  attendeeSearchCache = null;
  showToast(groupType === 'personal' ? 'Member added' : `Invite sent to ${email}`);
  renderGroupDetail(groupId);
}

async function acceptGroupMembership(memberId, groupId, rerender) {
  await sb.from('group_members').update({ status: 'accepted', user_id: currentUser.id }).eq('id', memberId);
  const { data: existingMembers } = await sb.from('group_members')
    .select('user_id').eq('group_id', groupId).eq('status', 'accepted').neq('user_id', currentUser.id);
  for (const m of existingMembers || []) {
    if (!m.user_id) continue;
    const { data: contact } = await sb.from('contacts').select('id')
      .or(`and(requester_id.eq.${currentUser.id},recipient_id.eq.${m.user_id}),and(requester_id.eq.${m.user_id},recipient_id.eq.${currentUser.id})`)
      .limit(1);
    if (!contact?.length) {
      await sb.from('contacts').insert({ requester_id: currentUser.id, recipient_id: m.user_id, status: 'accepted' });
    }
  }
  attendeeSearchCache = null;
  if (rerender) { showToast('Joined group!'); renderGroupsSheet(null); }
}

async function declineGroupMembership(memberId) {
  await sb.from('group_members').update({ status: 'declined' }).eq('id', memberId);
  showToast('Invite declined');
  renderGroupsSheet(null);
}

async function cancelGroupInvite(el) {
  const { error } = await sb.from('group_members').delete().eq('id', el.dataset.id);
  if (error) { showToast('Could not cancel'); return; }
  showToast('Invite cancelled');
  renderGroupDetail(groupsDetailId);
}

async function removeGroupMember(el) {
  const { error } = await sb.from('group_members').delete().eq('id', el.dataset.id);
  if (error) { showToast('Could not remove member'); return; }
  attendeeSearchCache = null;
  showToast('Member removed');
  renderGroupDetail(groupsDetailId);
}

async function leaveGroup(el, groupId) {
  const { error } = await sb.from('group_members').delete().eq('id', el.dataset.id);
  if (error) { showToast('Could not leave group'); return; }
  attendeeSearchCache = null;
  showToast('Left group');
  groupsDetailId = null;
  renderGroupsSheet(null);
}

async function deleteGroup(groupId) {
  const { error } = await sb.from('groups').delete().eq('id', groupId);
  if (error) { showToast('Could not delete group'); return; }
  attendeeSearchCache = null;
  showToast('Group deleted');
  groupsDetailId = null;
  renderGroupsSheet(null);
}

// ─── CONTACTS SHEET ───────────────────────────────────────────────────────────
let addContactFormOpen = false;
let pendingContactCount = 0;

function openContactsSheet() {
  document.getElementById('contactsBg').classList.add('open');
  renderContactsSheet();
}
function closeContactsSheet() {
  addContactFormOpen = false;
  document.getElementById('contactsBg').classList.remove('open');
}
function bgClickContactsSheet(e) {
  if (e.target === document.getElementById('contactsBg')) closeContactsSheet();
}
function toggleAddContactForm() {
  addContactFormOpen = !addContactFormOpen;
  renderContactsSheet();
  if (addContactFormOpen) setTimeout(() => document.getElementById('addContactEmail')?.focus(), 50);
}

async function renderContactsSheet() {
  const body = document.getElementById('contactsBody');
  body.innerHTML = `<div class="social-loading">Loading…</div>`;

  const [pendingRes, acceptedRes] = await Promise.all([
    sb.from('contacts').select('id, requester_id').eq('recipient_id', currentUser.id).eq('status', 'pending'),
    sb.from('contacts').select('requester_id, recipient_id')
      .or(`requester_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
      .eq('status', 'accepted'),
  ]);

  const pendingRows  = pendingRes.data  || [];
  const acceptedRows = acceptedRes.data || [];

  const requesterIds = pendingRows.map(r => r.requester_id);
  const contactIds   = acceptedRows.map(r =>
    r.requester_id === currentUser.id ? r.recipient_id : r.requester_id
  );
  const allIds = [...new Set([...requesterIds, ...contactIds])];

  const [profilesRes, groupsRes, membersRes] = await Promise.all([
    allIds.length
      ? sb.from('users').select('id, display_name, avatar_url, email').in('id', allIds).order('display_name')
      : Promise.resolve({ data: [] }),
    sb.from('groups').select('id, name').eq('created_by', currentUser.id).order('name'),
    contactIds.length
      ? sb.from('group_members').select('group_id, user_id').in('user_id', contactIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profiles    = profilesRes.data  || [];
  const groups      = groupsRes.data    || [];
  const memberships = membersRes.data   || [];
  const profileMap  = {};
  profiles.forEach(p => profileMap[p.id] = p);

  let html = '';

  if (addContactFormOpen) {
    html += `<div class="social-add-form">
      <input class="social-add-input" id="addContactEmail" type="email" placeholder="Enter email address" autocomplete="email"
        onkeydown="if(event.key==='Enter')sendContactRequest()">
      <div class="social-add-status" id="addContactStatus"></div>
      <div class="social-add-actions">
        <button class="social-req-btn social-req-accept" onclick="sendContactRequest()">Send Request</button>
        <button class="social-req-btn social-req-decline" onclick="toggleAddContactForm()">Cancel</button>
      </div>
    </div>`;
  }

  if (pendingRows.length) {
    html += `<div class="social-section-label">Requests</div>`;
    pendingRows.forEach(r => {
      const u = profileMap[r.requester_id];
      if (!u) return;
      const initials = getInitials(u.display_name || u.email);
      const avatar = u.avatar_url ? `<img src="${u.avatar_url}" alt="${initials}"/>` : initials;
      html += `<div class="social-row" style="cursor:default">
        <div class="social-avatar">${avatar}</div>
        <div class="social-row-info">
          <div class="social-row-name">${u.display_name || u.email}</div>
          <div class="social-row-meta">${u.email}</div>
        </div>
        <div class="social-req-actions">
          <button class="social-req-btn social-req-accept" data-id="${r.id}" onclick="acceptContactRequest(this)">Accept</button>
          <button class="social-req-btn social-req-decline" data-id="${r.id}" onclick="declineContactRequest(this)">Decline</button>
        </div>
      </div>`;
    });
  }

  if (contactIds.length) {
    const contactProfiles = contactIds.map(id => profileMap[id]).filter(Boolean);
    const rendered = new Set();

    groups.forEach(g => {
      const members = contactProfiles.filter(p =>
        memberships.some(m => m.group_id === g.id && m.user_id === p.id)
      );
      if (!members.length) return;
      html += `<div class="social-section-label">${g.name}</div>`;
      members.forEach(u => { html += contactRowHTML(u); rendered.add(u.id); });
    });

    const ungrouped = contactProfiles.filter(p => !rendered.has(p.id));
    if (ungrouped.length) {
      if (groups.length) html += `<div class="social-section-label">Not in a group</div>`;
      ungrouped.forEach(u => { html += contactRowHTML(u); });
    }
  }

  if (!html) {
    html = `<div class="social-empty">No contacts yet<br><span style="font-size:13px;margin-top:6px;display:block">Tap + Add to send a contact request</span></div>`;
  }

  body.innerHTML = html;
}

async function sendContactRequest() {
  const input    = document.getElementById('addContactEmail');
  const statusEl = document.getElementById('addContactStatus');
  const email    = input?.value.trim().toLowerCase();
  if (!email) { showToast('Enter an email address'); return; }
  if (statusEl) statusEl.textContent = 'Looking up…';

  const { data: found, error } = await sb.rpc('lookup_user_by_email', { target_email: email });
  if (error || !found?.length) {
    if (statusEl) statusEl.textContent = '';
    showToast('No Tether account found for that email');
    return;
  }
  const target = found[0];

  if (target.id === currentUser.id) {
    if (statusEl) statusEl.textContent = '';
    showToast('That\'s your own account');
    return;
  }

  const { data: existing } = await sb.from('contacts')
    .select('status')
    .or(`and(requester_id.eq.${currentUser.id},recipient_id.eq.${target.id}),and(requester_id.eq.${target.id},recipient_id.eq.${currentUser.id})`)
    .limit(1);

  if (existing?.length) {
    if (statusEl) statusEl.textContent = '';
    const s = existing[0].status;
    if (s === 'accepted') { showToast('Already a contact'); return; }
    if (s === 'pending')  { showToast('Request already sent'); return; }
  }

  const { error: insertErr } = await sb.from('contacts').insert({
    requester_id: currentUser.id,
    recipient_id: target.id,
    status: 'pending',
  });
  if (insertErr) { if (statusEl) statusEl.textContent = ''; showToast('Could not send request'); return; }

  addContactFormOpen = false;
  showToast(`Request sent to ${target.display_name || email}`);
  renderContactsSheet();
}

async function acceptContactRequest(el) {
  const id = el.dataset.id;
  const { error } = await sb.from('contacts').update({ status: 'accepted' }).eq('id', id);
  if (error) { showToast('Could not accept request'); return; }
  pendingContactCount = Math.max(0, pendingContactCount - 1);
  refreshNotifBadge();
  renderContactsSheet();
}

async function declineContactRequest(el) {
  const id = el.dataset.id;
  const { error } = await sb.from('contacts').update({ status: 'declined' }).eq('id', id);
  if (error) { showToast('Could not decline request'); return; }
  pendingContactCount = Math.max(0, pendingContactCount - 1);
  refreshNotifBadge();
  renderContactsSheet();
}

async function checkPendingContactRequests() {
  const { count } = await sb.from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', currentUser.id)
    .eq('status', 'pending');
  pendingContactCount = count ?? 0;
  refreshNotifBadge();
}

function refreshNotifBadge() {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  if (pendingInvite || pendingContactCount > 0) {
    badge.classList.add('show');
  } else {
    badge.classList.remove('show');
  }
}

function contactRowHTML(u) {
  const initials = getInitials(u.display_name || u.email);
  const avatar   = u.avatar_url
    ? `<img src="${u.avatar_url}" alt="${initials}"/>`
    : initials;
  return `<div class="social-row">
    <div class="social-avatar">${avatar}</div>
    <div class="social-row-info">
      <div class="social-row-name">${u.display_name || u.email}</div>
    </div>
  </div>`;
}

// ─── HOUSEHOLD ───────────────────────────────────────────────────────────────
let currentHousehold = null;
let householdMembers = [];
let pendingInvite = null; // invite waiting for this user

// Helper: get initials from a name or email
function getInitials(nameOrEmail) {
  if (!nameOrEmail) return '?';
  const parts = nameOrEmail.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
  return nameOrEmail.slice(0,2).toUpperCase();
}

// Build avatar HTML for a member object {display_name, avatar_url, email}
function memberAvatarHTML(member, size=36) {
  const initials = getInitials(member.display_name || member.email);
  if (member.avatar_url) {
    return `<div class="member-avatar" style="width:${size}px;height:${size}px"><img src="${member.avatar_url}" alt="${initials}"/></div>`;
  }
  return `<div class="member-avatar" style="width:${size}px;height:${size}px;font-size:${Math.floor(size*0.36)}px">${initials}</div>`;
}

// Build small item-row avatar HTML for a userId — tappable to assign
function itemAvatarHTML(userId, itemId) {
  if (!currentHousehold) return '';
  const member = householdMembers.find(m => m.user_id === userId);
  const initials = member ? getInitials(member.display_name || member.email) : '?';
  const img = member?.avatar_url ? `<img src="${member.avatar_url}" alt="${initials}"/>` : initials;
  const tap = itemId ? `onclick="openAssignPicker('${itemId}');event.stopPropagation();" style="cursor:pointer"` : '';
  return `<div class="item-avatar" ${tap} title="Tap to reassign">${img}</div>`;
}

async function loadHousehold() {
  // Find household this user belongs to
  const { data: memberships } = await sb.from('household_members')
    .select('household_id, role')
    .eq('user_id', currentUser.id)
    .limit(1);

  if (!memberships || memberships.length === 0) {
    currentHousehold = null;
    householdMembers = [];
    return;
  }

  const householdId = memberships[0].household_id;

  // Load household details
  const { data: hh } = await sb.from('households')
    .select('*')
    .eq('id', householdId)
    .single();
  currentHousehold = hh || null;

  // Load members with user profile info from auth.users via users table
  // We store display_name and avatar_url in the users table (populated by trigger)
  const { data: members } = await sb.from('household_members')
    .select('user_id, role')
    .eq('household_id', householdId);

  if (members && members.length > 0) {
    // Fetch user profiles
    const userIds = members.map(m => m.user_id);
    const { data: profiles } = await sb.from('users')
      .select('id, display_name, avatar_url, email')
      .in('id', userIds);

    householdMembers = members.map(m => {
      const profile = (profiles || []).find(p => p.id === m.user_id) || {};
      return {
        user_id: m.user_id,
        role: m.role,
        display_name: profile.display_name || profile.email || 'Member',
        avatar_url: profile.avatar_url || null,
        email: profile.email || '',
      };
    });
  }
}

async function checkPendingInvites() {
  const { data: invites } = await sb.from('household_invites')
    .select('*, households(name)')
    .eq('invited_user_id', currentUser.id)
    .eq('status', 'pending')
    .eq('request_type', 'invite')
    .limit(1);

  if (invites && invites.length > 0) {
    pendingInvite = invites[0];
    const householdName = invites[0].households?.name || 'a household';
    document.getElementById('inviteBannerSub').textContent = `Invited to join "${householdName}"`;
    document.getElementById('inviteBanner').classList.add('show');
  } else {
    pendingInvite = null;
    document.getElementById('inviteBanner').classList.remove('show');
  }
  refreshNotifBadge();
}

async function acceptPendingInvite() {
  if (!pendingInvite) return;
  // Update invite status
  await sb.from('household_invites')
    .update({ status: 'accepted' })
    .eq('id', pendingInvite.id);
  // Add to household members
  await sb.from('household_members')
    .insert({ household_id: pendingInvite.household_id, user_id: currentUser.id, role: 'adult' });
  pendingInvite = null;
  document.getElementById('inviteBanner').classList.remove('show');
  refreshNotifBadge();
  await loadHousehold();
  await loadItems();
  showToast('🏠 Welcome to the household!');
  render();
}

async function declinePendingInvite() {
  if (!pendingInvite) return;
  await sb.from('household_invites')
    .update({ status: 'declined' })
    .eq('id', pendingInvite.id);
  pendingInvite = null;
  document.getElementById('inviteBanner').classList.remove('show');
  refreshNotifBadge();
  showToast('Invite declined');
}

async function createHousehold(name) {
  const { data: hh, error } = await sb.from('households')
    .insert({ name, created_by: currentUser.id })
    .select()
    .single();
  if (error) { showToast('Error: ' + error.message); return; }

  // Add creator as admin member
  const { error: memberError } = await sb.from('household_members')
    .insert({ household_id: hh.id, user_id: currentUser.id, role: 'admin' });
  if (memberError) {
    showToast('Member error: ' + memberError.message);
    // Mark orphaned household as deleted
    await sb.from('households').update({ status: 'deleted' }).eq('id', hh.id);
    return;
  }

  // Assign all existing personal items to this household
  await sb.from('tether_items')
    .update({ household_id: hh.id, created_by: currentUser.id })
    .eq('user_id', currentUser.id);

  await loadHousehold();
  await loadItems();
  showToast('🏠 Household created!');
  openHouseholdSheet();
  render();
}

async function sendHouseholdInvite(email) {
  if (!currentHousehold) return;
  email = email.trim().toLowerCase();
  if (!email) return;

  // Check if this email belongs to an existing user
  const { data: existingUsers } = await sb.from('users')
    .select('id, email')
    .eq('email', email)
    .limit(1);

  const invitedUserId = existingUsers && existingUsers.length > 0 ? existingUsers[0].id : null;

  // Check not already a member
  if (invitedUserId) {
    const { data: existing } = await sb.from('household_members')
      .select('id')
      .eq('household_id', currentHousehold.id)
      .eq('user_id', invitedUserId)
      .limit(1);
    if (existing && existing.length > 0) {
      showToast('Already a member!'); return;
    }
  }

  // Check no pending invite already
  const { data: existingInvite } = await sb.from('household_invites')
    .select('id')
    .eq('household_id', currentHousehold.id)
    .eq('invited_email', email)
    .eq('status', 'pending')
    .limit(1);
  if (existingInvite && existingInvite.length > 0) {
    showToast('Invite already sent!'); return;
  }

  const { error } = await sb.from('household_invites').insert({
    household_id: currentHousehold.id,
    invited_by: currentUser.id,
    invited_email: email,
    invited_user_id: invitedUserId || null,
    status: 'pending',
  });

  if (error) { showToast('Error: ' + error.message); return; }
  showToast('✉️ Invite sent to ' + email);
  openHouseholdSheet(); // refresh
}

// ─── HOUSEHOLD SHEET UI ───────────────────────────────────────────────────────
function openHouseholdSheet() {
  renderHouseholdContent();
  document.getElementById('householdBg').classList.add('open');
}
function closeHouseholdSheet() {
  document.getElementById('householdBg').classList.remove('open');
}
function bgClickHousehold(e) {
  if (e.target === document.getElementById('householdBg')) closeHouseholdSheet();
}

async function renderHouseholdContent() {
  const el = document.getElementById('householdContent');

  if (!currentHousehold) {
    el.innerHTML = `
      <div class="household-title">Your Household</div>
      <div class="household-sub">Create a household to share tasks and events with your family. Everyone in your household sees everything.</div>
      <div class="create-form">
        <input type="text" id="hhNameInput" placeholder="e.g. The Monette Family" maxlength="50"/>
        <button class="btn-create-household" onclick="handleCreateHousehold()">Create Household</button>
      </div>`;
    setTimeout(() => document.getElementById('hhNameInput')?.focus(), 300);
    return;
  }

  // Load pending outbound invites and join requests in parallel
  const [{ data: pendingInvites }, { data: joinRequests }] = await Promise.all([
    sb.from('household_invites')
      .select('id, invited_email, invited_user_id, status')
      .eq('household_id', currentHousehold.id)
      .eq('status', 'pending')
      .eq('request_type', 'invite'),
    sb.from('household_invites')
      .select('id, invited_user_id')
      .eq('household_id', currentHousehold.id)
      .eq('status', 'pending')
      .eq('request_type', 'join_request')
  ]);

  // Look up join requester profiles separately (FK points to auth.users, not public.users)
  const joinRequesterIds = (joinRequests || []).map(r => r.invited_user_id).filter(Boolean);
  const { data: joinProfiles } = joinRequesterIds.length
    ? await sb.from('users').select('id, display_name, email').in('id', joinRequesterIds)
    : { data: [] };
  const joinProfileMap = {};
  (joinProfiles || []).forEach(p => joinProfileMap[p.id] = p);

  const membersHTML = householdMembers.map(m => {
    const isYou = m.user_id === currentUser.id;
    return `<div class="member-row">
      ${memberAvatarHTML(m, 36)}
      <div class="member-info">
        <div class="member-name">${m.display_name}${isYou ? '<span class="member-you-tag">You</span>' : ''}</div>
        <div class="member-role">${m.role === 'admin' ? 'Admin' : 'Member'}</div>
      </div>
    </div>`;
  }).join('');

  const pendingInviteHTML = pendingInvites?.length
    ? pendingInvites.map(i => `
        <div class="pending-invite-row">
          <div class="pending-invite-email">${i.invited_email}</div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button class="hh-jr-btn hh-jr-accept" data-id="${i.id}" data-email="${i.invited_email}" onclick="resendHouseholdInvite(this)">Resend</button>
            <button class="hh-jr-btn hh-jr-decline" data-id="${i.id}" onclick="cancelHouseholdInvite(this)">Cancel</button>
          </div>
        </div>`).join('')
    : '';

  const joinRequestHTML = joinRequests?.length
    ? joinRequests.map(r => {
        const profile = joinProfileMap[r.invited_user_id];
        const name = profile?.display_name || profile?.email || 'Someone';
        return `
        <div class="pending-invite-row">
          <div class="pending-invite-email">${name} wants to join</div>
          <div style="display:flex;gap:6px">
            <button class="hh-jr-btn hh-jr-accept" onclick="approveJoinRequest('${r.id}','${r.invited_user_id}')">Accept</button>
            <button class="hh-jr-btn hh-jr-decline" onclick="declineJoinRequest('${r.id}')">Decline</button>
          </div>
        </div>`;
      }).join('')
    : '';

  el.innerHTML = `
    <div class="household-title">${currentHousehold.name}</div>
    ${joinRequestHTML ? `<div class="household-section-title">Join Requests</div><div>${joinRequestHTML}</div>` : ''}
    <div class="household-section-title">Members (${householdMembers.length})</div>
    <div class="member-list">${membersHTML}</div>
    ${pendingInviteHTML ? `<div class="household-section-title">Pending Invites</div><div>${pendingInviteHTML}</div>` : ''}
    <hr style="border:none;border-top:0.5px solid #EEEDFE;margin:1rem 0"/>
    <div class="household-section-title">Invite Someone</div>
    <div class="invite-input-row">
      <input type="email" id="inviteEmailInput" placeholder="their@email.com" autocomplete="off"/>
      <button onclick="handleSendInvite()">Send</button>
    </div>
    <div style="margin-top:1.25rem;padding-top:1rem;border-top:0.5px solid #EEEDFE">
      <button class="hh-leave-btn" onclick="leaveHousehold()">Leave Household</button>
    </div>`;
}

async function approveJoinRequest(inviteId, userId) {
  await sb.from('household_invites').update({ status: 'accepted' }).eq('id', inviteId);
  await sb.from('household_members').insert({ household_id: currentHousehold.id, user_id: userId, role: 'adult' });
  showToast('Member added!');
  renderHouseholdContent();
}

async function declineJoinRequest(inviteId) {
  await sb.from('household_invites').update({ status: 'declined' }).eq('id', inviteId);
  showToast('Request declined');
  renderHouseholdContent();
}

async function cancelHouseholdInvite(el) {
  const id = el.dataset.id;
  const { error } = await sb.from('household_invites').delete().eq('id', id);
  if (error) { showToast('Could not cancel invite'); return; }
  showToast('Invite cancelled');
  renderHouseholdContent();
}

async function resendHouseholdInvite(el) {
  const id    = el.dataset.id;
  const email = el.dataset.email;
  const { error: cancelErr } = await sb.from('household_invites').delete().eq('id', id);
  if (cancelErr) { showToast('Could not resend invite'); return; }
  const { data: existingUsers } = await sb.from('users').select('id').eq('email', email).limit(1);
  const { error: insertErr } = await sb.from('household_invites').insert({
    household_id: currentHousehold.id,
    invited_by: currentUser.id,
    invited_email: email,
    invited_user_id: existingUsers?.[0]?.id || null,
    status: 'pending',
  });
  if (insertErr) { showToast('Could not resend invite'); return; }
  showToast('Invite resent to ' + email);
  renderHouseholdContent();
}

async function leaveHousehold() {
  const me = householdMembers.find(m => m.user_id === currentUser.id);
  if (me?.role === 'admin' && householdMembers.length > 1) {
    showToast('Transfer admin to another member before leaving');
    return;
  }
  const { error } = await sb.from('household_members')
    .delete()
    .eq('household_id', currentHousehold.id)
    .eq('user_id', currentUser.id);
  if (error) { showToast('Could not leave household'); return; }
  currentHousehold = null;
  householdMembers = [];
  closeHouseholdSheet();
  showToast('You have left the household');
  render();
}

function handleCreateHousehold() {
  const name = document.getElementById('hhNameInput')?.value.trim();
  if (!name) return;
  createHousehold(name);
}

function handleSendInvite() {
  const email = document.getElementById('inviteEmailInput')?.value.trim();
  if (!email) return;
  sendHouseholdInvite(email);
}

// ─── EVENT PANEL ─────────────────────────────────────────────────────────────
let eventBringCollapsed = {};

async function loadEventPanel(itemId) {
  // Render into inline row panel and/or the open detail sheet
  const targets = [document.getElementById('evpanel-' + itemId)];
  if (eventDetailCurrentId === itemId) targets.push(document.getElementById('evpanel-detail'));
  const validTargets = targets.filter(Boolean);
  if (!validTargets.length) return;
  const panel = validTargets[0]; // used for early returns below

  const item = items.find(i => i.id === itemId);
  if (!item) return;

  // Load guests, bring items and claims in parallel
  const [guestsRes, bringRes, claimsRes] = await Promise.all([
    sb.from('event_guests').select('*').eq('item_id', itemId),
    sb.from('potluck_items').select('*').eq('item_id', itemId).order('created_at'),
    sb.from('potluck_claims').select('*'),
  ]);

  const guests = guestsRes.data || [];
  const bringItems = bringRes.data || [];
  const claims = claimsRes.data || [];

  // Get user profiles for guests
  const guestUserIds = guests.map(g => g.user_id);
  let guestProfiles = [];
  if (guestUserIds.length > 0) {
    const { data } = await sb.from('users').select('id, display_name, avatar_url, email').in('id', guestUserIds);
    guestProfiles = data || [];
  }

  const myRsvp = guests.find(g => g.user_id === currentUser.id);
  const isOwner = item.createdBy === currentUser.id;

  // Build a map of user_id → claimed item names for inline display
  const claimsByUser = {};
  claims.forEach(c => {
    const bi = bringItems.find(b => b.id === c.potluck_item_id);
    if (!bi) return;
    if (!claimsByUser[c.user_id]) claimsByUser[c.user_id] = [];
    claimsByUser[c.user_id].push(bi.name);
  });

  // Default collapsed if all items are claimed, expanded if anything unclaimed
  const allClaimed = bringItems.length > 0 && bringItems.every(bi => claims.find(c => c.potluck_item_id === bi.id));
  const collapsed = eventBringCollapsed[itemId] !== undefined ? eventBringCollapsed[itemId] : allClaimed;

  // RSVP section — owners don't need to confirm their own attendance
  const isTentative = myRsvp?.rsvp_status === 'maybe';
  const rsvpHTML = isOwner ? `<div class="event-organizer-badge">You're the organizer</div>` : `
    <div class="event-rsvp-row">
      <button class="rsvp-btn accept${myRsvp?.rsvp_status==='going'?' active-accept':''}" onclick="rsvpEvent('${itemId}','going')">✓ Going</button>
      <button class="rsvp-btn tentative${isTentative?' active-tentative':''}" onclick="rsvpEvent('${itemId}','maybe')">~ Tentative</button>
      <button class="rsvp-btn decline${myRsvp?.rsvp_status==='not_going'?' active-decline':''}" onclick="rsvpEvent('${itemId}','not_going')">✕ Can't make it</button>
    </div>
    <div class="rsvp-note-wrap" id="rsvpNoteWrap-${itemId}" style="display:${isTentative?'block':'none'}">
      <textarea class="rsvp-note-input" id="rsvpNote-${itemId}" placeholder="Optional note (e.g. 'We'll try to make it')">${myRsvp?.note||''}</textarea>
      <button class="rsvp-note-save" onclick="saveRsvpNote('${itemId}')">Save note</button>
    </div>`;

  // Attendees section — with inline bring items per person
  const attendeesHTML = guests.length > 0 ? `
    <div class="event-section-title">Attendees (${guests.filter(g=>g.rsvp_status==='going').length} going)</div>
    <div class="attendee-list">
      ${guests.map(g => {
        const profile = guestProfiles.find(p => p.id === g.user_id) || {};
        const initials = getInitials(profile.display_name || profile.email || '?');
        const img = profile.avatar_url ? `<img src="${profile.avatar_url}" alt="${initials}"/>` : initials;
        const name = profile.display_name || profile.email?.split('@')[0] || 'Guest';
        const statusClass = g.rsvp_status === 'going' ? 'going' : g.rsvp_status === 'not_going' ? 'declined' : g.rsvp_status === 'maybe' ? 'tentative' : 'pending';
        const statusLabel = g.rsvp_status === 'going' ? 'Going' : g.rsvp_status === 'not_going' ? 'Declined' : g.rsvp_status === 'maybe' ? 'Tentative' : 'Invited';
        const bringing = claimsByUser[g.user_id];
        const bringingHTML = bringing?.length ? `<div class="attendee-bringing">${bringing.join(' · ')}</div>` : '';
        return `<div class="attendee-row">
          <div class="attendee-avatar">${img}</div>
          <div class="attendee-info">
            <div class="attendee-name">${name}</div>
            ${bringingHTML}
          </div>
          <div class="attendee-status ${statusClass}">${statusLabel}</div>
        </div>`;
      }).join('')}
    </div>` : '';

  // Bring list section
  let bringHTML = '';
  if (bringItems.length > 0 || isOwner) {
    const toggleLabel = collapsed ? '▼ Show' : '▲ Hide';
    bringHTML = `<div class="event-section-title">What to bring <span class="event-section-toggle" onclick="toggleBringList('${itemId}')">${bringItems.length > 0 ? toggleLabel : ''}</span></div>`;

    if (!collapsed || bringItems.length === 0) {
      const bringRowsHTML = bringItems.map(bi => {
        const claim = claims.find(c => c.potluck_item_id === bi.id);
        const isMine = claim?.user_id === currentUser.id;
        const claimerProfile = claim
          ? (guestProfiles.find(p => p.id === claim.user_id)
            || householdMembers.find(m => m.user_id === claim.user_id))
          : null;
        const claimerName = claimerProfile
          ? (claimerProfile.display_name || claimerProfile.email?.split('@')[0] || 'Someone')
          : 'Someone';
        return `<div class="bring-item">
          <div class="bring-item-name">${bi.name}</div>
          ${claim ? `<div class="bring-item-claimer">${isMine ? '✓ You' : claimerName}</div>` : ''}
          <button class="bring-claim-btn${isMine?' claimed':''}" onclick="claimBringItem('${itemId}','${bi.id}',${isMine})">
            ${isMine ? 'Unclaim' : claim ? 'Taken' : 'I\'ll bring it'}
          </button>
        </div>`;
      }).join('');

      bringHTML += `<div class="bring-list">${bringRowsHTML}</div>`;
      bringHTML += `<div class="bring-add-row">
        <input id="bringinput-${itemId}" type="text" placeholder="${isOwner ? 'Request an item...' : 'Add what you\'re bringing...'}"/>
        <button onclick="addBringItem('${itemId}')">Add</button>
      </div>`;
    }
  } else {
    // No bring items yet — anyone can add what they're bringing
    bringHTML = `<div class="event-section-title">What to bring</div>
      <div class="bring-add-row">
        <input id="bringinput-${itemId}" type="text" placeholder="Add what you're bringing..."/>
        <button onclick="addBringItem('${itemId}')">Add</button>
      </div>`;
  }

  // Actions
  const actionsHTML = `<div class="event-actions">
    ${isOwner ? `<button class="event-action-btn event-action-edit" onclick="editItem('${itemId}')">✏️ Edit</button>` : ''}
    <button class="event-action-btn event-action-clone" onclick="cloneEvent('${itemId}')">📋 Clone</button>
    ${isOwner ? `<button class="event-action-btn event-action-delete" onclick="deleteItem('${itemId}')">🗑 Delete</button>` : ''}
  </div>`;

  const finalHTML = rsvpHTML + (attendeesHTML || '') + bringHTML + actionsHTML;
  validTargets.forEach(t => t.innerHTML = finalHTML);
}

function toggleBringList(itemId) {
  eventBringCollapsed[itemId] = !eventBringCollapsed[itemId];
  loadEventPanel(itemId);
}

async function rsvpEvent(itemId, status) {
  const { data: existing } = await sb.from('event_guests')
    .select('id, rsvp_status')
    .eq('item_id', itemId)
    .eq('user_id', currentUser.id)
    .limit(1);

  if (existing && existing.length > 0) {
    await sb.from('event_guests')
      .update({ rsvp_status: status, responded_at: new Date().toISOString() })
      .eq('id', existing[0].id);
  } else {
    await sb.from('event_guests')
      .insert({ item_id: itemId, user_id: currentUser.id, rsvp_status: status, responded_at: new Date().toISOString() });
  }
  if (myRsvpMap[itemId]) myRsvpMap[itemId].rsvp_status = status;
  else myRsvpMap[itemId] = { rsvp_status: status };

  // Show/hide tentative note field without full reload
  const noteWrap = document.getElementById(`rsvpNoteWrap-${itemId}`);
  if (noteWrap) noteWrap.style.display = status === 'maybe' ? 'block' : 'none';

  showToast(status === 'going' ? '✓ You\'re going!' : status === 'maybe' ? 'Marked as tentative' : 'Noted — you can\'t make it');
  loadEventPanel(itemId);
}

async function saveRsvpNote(itemId) {
  const note = document.getElementById(`rsvpNote-${itemId}`)?.value.trim() || null;
  const { data: existing } = await sb.from('event_guests')
    .select('id').eq('item_id', itemId).eq('user_id', currentUser.id).limit(1);
  if (!existing?.length) return;
  await sb.from('event_guests').update({ note }).eq('id', existing[0].id);
  if (myRsvpMap[itemId]) myRsvpMap[itemId].note = note;
  showToast('Note saved');
}

async function addBringItem(itemId) {
  const inp = document.getElementById('bringinput-' + itemId);
  const name = inp?.value.trim();
  if (!name) return;
  const item = items.find(i => i.id === itemId);
  const isOwner = item?.createdBy === currentUser.id;

  const { data: bi, error } = await sb.from('potluck_items')
    .insert({ item_id: itemId, name, added_by: currentUser.id, is_request: isOwner })
    .select()
    .single();

  if (error) { showToast('Error: ' + error.message); return; }

  // If not a request (i.e. attendee adding their own item) — auto-claim it
  if (!isOwner) {
    await sb.from('potluck_claims')
      .insert({ potluck_item_id: bi.id, user_id: currentUser.id });
  }

  inp.value = '';
  showToast(`Added "${name}"`);
  loadEventPanel(itemId);
}

async function claimBringItem(itemId, bringItemId, isMine) {
  if (isMine) {
    // Unclaim
    await sb.from('potluck_claims')
      .delete()
      .eq('potluck_item_id', bringItemId)
      .eq('user_id', currentUser.id);
    showToast('Unclaimed');
  } else {
    // Claim
    const { error } = await sb.from('potluck_claims')
      .insert({ potluck_item_id: bringItemId, user_id: currentUser.id });
    if (error) { showToast('Already claimed!'); return; }
    showToast('✓ You\'ll bring it!');
  }
  loadEventPanel(itemId);
}

// ─── ASSIGN PICKER ───────────────────────────────────────────────────────────
let assignTargetId = null;

function openAssignPicker(itemId) {
  assignTargetId = itemId;
  const item = items.find(i => i.id === itemId);
  const el = document.getElementById('assignMembers');
  el.innerHTML = householdMembers.map(m => {
    const isSelected = (item?.assignedTo || item?.createdBy) === m.user_id;
    const initials = getInitials(m.display_name || m.email);
    const img = m.avatar_url ? `<img src="${m.avatar_url}" alt="${initials}"/>` : initials;
    const name = m.display_name?.split(' ')[0] || m.email.split('@')[0];
    return `<div class="assign-member${isSelected?' selected':''}" onclick="confirmAssign('${m.user_id}')">
      <div class="assign-member-avatar">${img}</div>
      <div class="assign-member-name">${name}</div>
    </div>`;
  }).join('');
  document.getElementById('assignBg').classList.add('open');
}

function closeAssignPicker() {
  document.getElementById('assignBg').classList.remove('open');
  assignTargetId = null;
}

function bgClickAssign(e) {
  if (e.target === document.getElementById('assignBg')) closeAssignPicker();
}

async function confirmAssign(userId) {
  const item = items.find(i => i.id === assignTargetId);
  if (!item) return;
  item.assignedTo = userId;
  closeAssignPicker();
  await persistItem(item);
  const member = householdMembers.find(m => m.user_id === userId);
  const name = member ? (member.display_name?.split(' ')[0] || 'them') : 'no one';
  showToast(userId ? `Assigned to ${name}` : 'Assignment removed');
  render();
}


// ─── BACKGROUND COLOR ─────────────────────────────────────────────────────────
function applyBgColor(hex) {
  document.documentElement.style.setProperty('--bg', hex);
  localStorage.setItem('tether-bg', hex);
  const swatch = document.getElementById('bgSwatch');
  const input = document.getElementById('bgColorInput');
  if (swatch) swatch.style.background = hex;
  if (input) input.value = hex;
}

function initBgColor() {
  const saved = localStorage.getItem('tether-bg') || '#0B353B';
  document.documentElement.style.setProperty('--bg', saved);
}

// ─── ANNUAL SHEET ─────────────────────────────────────────────────────────────
// ─── ABOUT ────────────────────────────────────────────────────────────────────
let _aboutData = null;

async function openAboutSheet() {
  if (!_aboutData) {
    try {
      const res = await fetch('/about.json?v=' + (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '0'));
      _aboutData = await res.json();
    } catch(e) {
      showToast('Could not load About content');
      return;
    }
  }
  renderAboutSheet();
  document.getElementById('aboutBg').classList.add('open');
}
function closeAboutSheet() { document.getElementById('aboutBg').classList.remove('open'); }
function bgClickAbout(e) { if (e.target === document.getElementById('aboutBg')) closeAboutSheet(); }

function renderAboutSheet() {
  const body = document.getElementById('aboutBody');
  if (!body || !_aboutData) return;

  const o = _aboutData.opening;
  const openingParas = (o?.paragraphs || []).map(p => {
    const labelHtml = p.label ? `<span class="about-para-label">${p.label}</span> ` : '';
    const parts = p.body.split('\n\n');
    return parts.map((b, i) => `<p>${i === 0 ? labelHtml : ''}${b}</p>`).join('');
  }).join('');
  const openingHtml = o ? `
    <div class="about-opening">
      <div class="about-tagline">${o.tagline}</div>
      <div class="about-opening-body">${openingParas}</div>
    </div>
    <div class="about-divider"></div>
  ` : '';

  const sectionsHtml = _aboutData.sections.map(section => `
    <div class="about-section" id="about-sec-${section.id}">
      <div class="about-section-header" style="border-left:4px solid ${section.color}" onclick="toggleAboutSection('${section.id}')">
        <span class="about-section-icon">${section.icon}</span>
        <div style="flex:1">
          <div class="about-section-title">${section.title}</div>
        </div>
        <span class="about-chevron" id="about-chev-${section.id}">▶</span>
      </div>
      <div class="about-section-body" id="about-body-${section.id}" style="display:none">
        ${section.intro ? `<div class="about-intro">${section.intro.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>')}</div>` : ''}
        ${(section.subsections || []).map(sub => `
          <div class="about-sub-row">
            <div class="about-sub-icon">${sub.icon}</div>
            <div class="about-sub-content">
              <div class="about-sub-title">${sub.title}</div>
              <div class="about-sub-body">${sub.body}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="about-divider"></div>
  `).join('');

  body.innerHTML = openingHtml + sectionsHtml;
}

function toggleAboutSection(id) {
  const bodyEl = document.getElementById(`about-body-${id}`);
  const chevEl = document.getElementById(`about-chev-${id}`);
  const isOpen = bodyEl.style.display !== 'none';
  bodyEl.style.display = isOpen ? 'none' : 'block';
  chevEl.style.transform = isOpen ? '' : 'rotate(90deg)';
  chevEl.style.transition = 'transform .2s';
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
let _faqData = null;

async function openFaqSheet() {
  if (!_faqData) {
    const res = await fetch('/faqs.json?v=' + (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '0'));
    _faqData = await res.json();
  }
  renderFaqSheet();
  document.getElementById('faqBg').classList.add('open');
}
function closeFaqSheet() { document.getElementById('faqBg').classList.remove('open'); }
function bgClickFaq(e) { if (e.target === document.getElementById('faqBg')) closeFaqSheet(); }

function renderFaqSheet() {
  const body = document.getElementById('faqBody');
  if (!body || !_faqData) return;
  body.innerHTML = (_faqData.sections || [])
    .filter(s => s.display)
    .map(s => `
      <div class="faq-section">
        ${s.title ? `<div class="about-section-title" style="padding:12px 0 8px;font-weight:600">${s.title}</div>` : ''}
        ${s.questions.map((item, i) => `
          <div class="faq-item" id="faq-item-${s.id}-${i}">
            <div class="about-section-header" onclick="toggleFaq('${s.id}',${i})" style="border-left:none;padding-left:0">
              <div style="flex:1;font-weight:500">${item.q}</div>
              <span class="about-chevron" id="faq-chev-${s.id}-${i}">▶</span>
            </div>
            <div class="about-section-body" id="faq-body-${s.id}-${i}" style="display:none;padding:0 0 12px">
              ${item.a}
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');
}

function toggleFaq(sectionId, i) {
  const bodyEl = document.getElementById(`faq-body-${sectionId}-${i}`);
  const chevEl = document.getElementById(`faq-chev-${sectionId}-${i}`);
  const isOpen = bodyEl.style.display !== 'none';
  bodyEl.style.display = isOpen ? 'none' : 'block';
  chevEl.style.transform = isOpen ? '' : 'rotate(90deg)';
  chevEl.style.transition = 'transform .2s';
}

// ─── FEEDBACK ─────────────────────────────────────────────────────────────────
let _feedbackCategory = null;

function openFeedbackSheet() {
  _feedbackCategory = null;
  renderFeedbackSheet();
  document.getElementById('feedbackBg').classList.add('open');
}
function closeFeedbackSheet() { document.getElementById('feedbackBg').classList.remove('open'); }
function bgClickFeedback(e) { if (e.target === document.getElementById('feedbackBg')) closeFeedbackSheet(); }

function renderFeedbackSheet(state = 'form') {
  const body = document.getElementById('feedbackBody');
  if (state === 'thanks') {
    body.innerHTML = `
      <div style="text-align:center;padding:32px 16px">
        <div style="font-size:2rem;margin-bottom:12px">🙏</div>
        <div style="font-size:1.1rem;font-weight:600;margin-bottom:8px">Thank you for your feedback!</div>
        <div class="ob-actions" style="margin-top:24px">
          <button class="ob-btn-primary" onclick="renderFeedbackSheet('form')">Submit another</button>
          <button class="ob-pill" style="margin-top:8px;width:100%;justify-content:center" onclick="closeFeedbackSheet()">Exit</button>
        </div>
      </div>`;
    return;
  }
  const cats = ['Bug', 'Suggestion', 'Flattery'];
  body.innerHTML = `
    <div style="padding:4px 0 16px">
      <div style="font-size:13px;font-weight:600;color:#7c77a0;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Category (optional)</div>
      <div style="display:flex;gap:8px;margin-bottom:20px">
        ${cats.map(c => {
          const active = _feedbackCategory === c.toLowerCase();
          return `<button class="ob-pill feedback-cat" data-cat="${c.toLowerCase()}" onclick="selectFeedbackCat('${c.toLowerCase()}',this)" style="flex:1;justify-content:center${active ? ';background:var(--accent);color:#fff;border-color:var(--accent)' : ''}">${c}</button>`;
        }).join('')}
      </div>
      <div style="font-size:13px;font-weight:600;color:#7c77a0;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Message (optional)</div>
      <textarea id="feedbackMsg" placeholder="What's on your mind?" style="width:100%;min-height:120px;padding:12px;border-radius:12px;border:0.5px solid #CECBF6;background:#F7F6FF;color:#26215C;font-size:15px;font-family:inherit;resize:vertical;outline:none"></textarea>
      <div class="ob-actions" style="margin-top:16px">
        <button class="ob-btn-primary" onclick="submitFeedback()">Submit</button>
      </div>
    </div>`;
}

function selectFeedbackCat(cat, el) {
  _feedbackCategory = _feedbackCategory === cat ? null : cat;
  document.querySelectorAll('.feedback-cat').forEach(b => {
    const active = b.dataset.cat === _feedbackCategory;
    b.style.background = active ? 'var(--accent)' : '';
    b.style.color = active ? '#fff' : '';
    b.style.borderColor = active ? 'var(--accent)' : '';
  });
}

async function submitFeedback() {
  const message = document.getElementById('feedbackMsg')?.value.trim() || null;
  const { error } = await sb.from('feedback').insert({
    user_id: currentUser.id,
    category: _feedbackCategory,
    message,
    app_version: typeof APP_VERSION !== 'undefined' ? APP_VERSION : null
  });
  if (error) { showToast('Could not submit — try again'); return; }
  renderFeedbackSheet('thanks');
}

// ─── OCCASIONS ────────────────────────────────────────────────────────────────
let occasionsList = [];
let editingOccasionId = null;

const OCCASION_TYPES = [
  { key: 'birthday',      label: 'Birthday',      emoji: '🎂' },
  { key: 'anniversary',   label: 'Anniversary',   emoji: '💍' },
  { key: 'remembrance',   label: 'Remembrance',   emoji: '🕯️' },
];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

async function openOccasionsSheet() {
  await loadOccasions();
  renderOccasionsSheet();
  document.getElementById('occasionsBg').classList.add('open');
}
function closeOccasionsSheet() { document.getElementById('occasionsBg').classList.remove('open'); }
function bgClickOccasions(e) { if (e.target === document.getElementById('occasionsBg')) closeOccasionsSheet(); }

async function loadOccasions() {
  const { data, error } = await sb.from('occasions')
    .select('*')
    .neq('status', 'deleted')
    .order('month').order('day');
  if (error) { showToast('Load error: ' + error.message); return; }
  occasionsList = data || [];
}

function daysUntilOccasion(month, day) {
  const now = new Date(); now.setHours(0,0,0,0);
  const thisYear = now.getFullYear();
  let next = new Date(thisYear, month - 1, day);
  if (next < now) next = new Date(thisYear + 1, month - 1, day);
  return Math.round((next - now) / 86400000);
}

function renderOccasionsSheet() {
  const body = document.getElementById('occasionsBody');
  if (!body) return;

  let html = '';

  // Group occasions by type
  for (const type of OCCASION_TYPES) {
    const group = occasionsList.filter(o => o.type === type.key);
    html += `<div class="annual-section">${type.emoji} ${type.label}s</div>`;
    if (group.length === 0) {
      html += `<div class="occasion-empty-row">No ${type.label.toLowerCase()}s yet — tap + to add one</div>`;
    } else {
      for (const o of group) {
        const d = daysUntilOccasion(o.month, o.day);
        const dateStr = `${MONTH_SHORT[o.month - 1]} ${o.day}${o.year ? ', ' + o.year : ''}`;
        const dueStr = d === 0 ? 'Today! 🎉' : d === 1 ? 'Tomorrow' : `in ${d} days`;
        const visIcon = o.visibility === 'private' ? '🔒' : o.visibility === 'household' ? '🏠' : '👥';
        html += `<div class="annual-row" onclick="openOccasionDetail('${o.id}')">
          <div class="annual-row-icon">${type.emoji}</div>
          <div class="annual-row-info">
            <div class="annual-row-name">${o.name} <span style="font-size:11px;color:var(--accent-soft)">${visIcon}</span></div>
            <div class="annual-row-sub">${dateStr} · ${dueStr}</div>
          </div>
        </div>`;
      }
    }
  }

  // Annual tasks (backward compat)
  const annuals = items.filter(i => i.type === 'annual');
  if (annuals.length > 0) {
    html += `<div class="annual-section" style="margin-top:1rem">📋 Annual Tasks</div>`;
    const byMonth = {};
    for (const item of annuals) {
      const due = getDueDate(item);
      const m = due.getMonth();
      if (!byMonth[m]) byMonth[m] = [];
      byMonth[m].push({ item, due });
    }
    for (const m of Object.keys(byMonth).map(Number).sort((a,b) => a-b)) {
      for (const { item, due } of byMonth[m].sort((a,b) => a.due.getDate() - b.due.getDate())) {
        html += `<div class="annual-row" onclick="closeOccasionsSheet();editItem('${item.id}')">
          <div class="annual-row-icon">${iconFor(item)}</div>
          <div class="annual-row-info">
            <div class="annual-row-name">${item.name}</div>
            <div class="annual-row-sub">${subFor(item)}</div>
          </div>
        </div>`;
      }
    }
  }

  // Toggles
  html += `<div class="annual-section" style="margin-top:1.5rem">More</div>`;
  html += `<div class="annual-toggle-row">
    <div class="annual-toggle-label"><span>🇺🇸</span> Holidays</div>
    <input type="checkbox" ${userPrefs.holidaysEnabled ? 'checked' : ''} onchange="toggleAnnualPref('holidaysEnabled',this.checked)" style="width:20px;height:20px;cursor:pointer;accent-color:var(--accent)"/>
  </div>`;
  if (userPrefs.holidaysEnabled) html += '<div class="annual-coming-soon">Coming soon</div>';
  html += `<div class="annual-toggle-row">
    <div class="annual-toggle-label"><span>🎉</span> Party Every Day</div>
    <input type="checkbox" ${userPrefs.partyDaysEnabled ? 'checked' : ''} onchange="toggleAnnualPref('partyDaysEnabled',this.checked)" style="width:20px;height:20px;cursor:pointer;accent-color:var(--accent)"/>
  </div>`;
  if (userPrefs.partyDaysEnabled) html += '<div class="annual-coming-soon">Coming soon</div>';

  body.innerHTML = html;
}

async function toggleAnnualPref(key, value) {
  await persistUserPref(key, value);
  renderOccasionsSheet();
}

// ── Occasion form ─────────────────────────────────────────────────────────────
function openOccasionForm(id) {
  editingOccasionId = id || null;
  const existing = id ? occasionsList.find(o => o.id === id) : null;
  _occasionType = existing?.type || 'birthday';
  _occasionVis = existing?.visibility || 'private';
  document.getElementById('occasionFormTitle').textContent = existing ? 'Edit Occasion' : 'New Occasion';
  renderOccasionForm(existing);
  document.getElementById('occasionFormBg').classList.add('open');
}
function closeOccasionForm() {
  document.getElementById('occasionFormBg').classList.remove('open');
  editingOccasionId = null;
}
function bgClickOccasionForm(e) { if (e.target === document.getElementById('occasionFormBg')) closeOccasionForm(); }

function renderOccasionForm(o) {
  const body = document.getElementById('occasionFormBody');
  const selectedType = o?.type || 'birthday';
  // Initialize date picker state from existing occasion
  _dpMonth = o?.month || null;
  _dpDay = o?.day || null;
  _dpYear = o?.year || null;

  body.innerHTML = `
    <div class="occasion-type-pills">
      ${OCCASION_TYPES.map(t => `<button class="occasion-type-pill${selectedType===t.key?' active':''}" data-type="${t.key}" onclick="selectOccasionType('${t.key}')">${t.emoji} ${t.label}</button>`).join('')}
    </div>
    <div class="ob-fields" style="margin-top:1rem">
      <input class="ob-input" id="ocName" type="text" placeholder="Name (e.g. Kirsten, Jean &amp; Danny)" maxlength="60" value="${o?.name||''}"/>
      <button class="ob-input occasion-date-btn" id="ocDateBtn" onclick="openOccasionDatePicker()" style="text-align:left;cursor:pointer">${ocDateLabel()}</button>
      <textarea class="ob-input" id="ocNotes" placeholder="Notes (optional)" style="resize:vertical;min-height:70px">${o?.notes||''}</textarea>
    </div>
    <div class="annual-section" style="margin-top:1rem">Visibility</div>
    <div class="occasion-vis-pills">
      <button class="occasion-type-pill${(o?.visibility||'private')==='private'?' active':''}" onclick="selectOccasionVis('private')">🔒 Private</button>
      <button class="occasion-type-pill${o?.visibility==='household'?' active':''}" onclick="selectOccasionVis('household')">🏠 Household</button>
      <button class="occasion-type-pill${o?.visibility==='contacts'?' active':''}" onclick="selectOccasionVis('contacts')">👥 All Contacts</button>
    </div>
    <div style="display:flex;gap:10px;margin-top:1.5rem">
      <button class="btn-save" style="flex:1" onclick="saveOccasion()">Save</button>
      ${o ? `<button class="btn-cancel" style="flex:0 0 auto;padding:0 16px" onclick="deleteOccasion('${o.id}')">🗑</button>` : ''}
    </div>
  `;
}

let _occasionType = 'birthday';
let _occasionVis = 'private';

function ocDateLabel() {
  if (!_dpMonth && !_dpDay) return 'Select date…';
  const m = _dpMonth ? MONTH_SHORT[_dpMonth - 1] : '?';
  const d = _dpDay || '?';
  const y = _dpYear ? ', ' + _dpYear : '';
  return `${m} ${d}${y}`;
}

function openOccasionDatePicker() {
  openDatePicker({
    month: _dpMonth, day: _dpDay, year: _dpYear,
    yearOptional: true,
    onSet: (month, day, year) => {
      _dpMonth = month; _dpDay = day; _dpYear = year;
      const btn = document.getElementById('ocDateBtn');
      if (btn) btn.textContent = ocDateLabel();
    }
  });
}

function selectOccasionType(type) {
  _occasionType = type;
  document.querySelectorAll('.occasion-type-pills .occasion-type-pill').forEach(b => b.classList.toggle('active', b.dataset.type === type));
}
function selectOccasionVis(vis) {
  _occasionVis = vis;
  document.querySelectorAll('.occasion-vis-pills .occasion-type-pill').forEach((b, i) => {
    const vals = ['private','household','contacts'];
    b.classList.toggle('active', vals[i] === vis);
  });
}

async function saveOccasion() {
  const name = document.getElementById('ocName')?.value.trim();
  const month = _dpMonth;
  const day = _dpDay;
  const year = _dpYear || null;
  const notes = document.getElementById('ocNotes')?.value.trim() || null;
  if (!name) { showToast('Name is required'); return; }
  if (!month || !day) { showToast('Please select a date'); return; }

  const existing = editingOccasionId ? occasionsList.find(o => o.id === editingOccasionId) : null;
  const type = _occasionType;
  const vis = _occasionVis;

  const row = { name, month, day, year, notes, visibility: vis, type };

  if (editingOccasionId) {
    const { error } = await sb.from('occasions').update(row).eq('id', editingOccasionId);
    if (error) { showToast('Save error: ' + error.message); return; }
  } else {
    const { error } = await sb.from('occasions').insert({ ...row, user_id: currentUser.id });
    if (error) { showToast('Save error: ' + error.message); return; }
  }
  showToast(editingOccasionId ? '✏️ Updated' : '✓ Occasion saved');
  closeOccasionForm();
  await loadOccasions();
  renderOccasionsSheet();
}

async function deleteOccasion(id) {
  if (!confirm('Remove this occasion?')) return;
  await sb.from('occasions').update({ status: 'deleted' }).eq('id', id);
  closeOccasionForm();
  await loadOccasions();
  renderOccasionsSheet();
}

async function openOccasionDetail(id) {
  if (occasionsList.length === 0) await loadOccasions();
  openOccasionForm(id);
}

// Kept for backward compat — annual tasks still use this path
function openTaskModalAnnual() {
  closeOccasionsSheet();
  openTaskModal();
  document.getElementById('fRecurring').checked = true;
  document.getElementById('recurringSection').style.display = '';
  document.getElementById('fIncrement').value = 'year';
  document.getElementById('fEveryNum').value = '1';
  document.getElementById('fDueDate').value = '';
  onIncrementChange();
  validateForm();
}

// ─── DATE PICKER ─────────────────────────────────────────────────────────────
const DP_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DP_ITEM_H = 44;
const DP_VISIBLE = 5;
const DP_PAD = Math.floor(DP_VISIBLE / 2);
const DP_YEAR_MIN = 1900;
const DP_YEAR_MAX = 2099;

let _dpMonth = null; // 1-12
let _dpDay = null;   // 1-31
let _dpYear = null;  // optional
let _dpYearOptional = false;
let _dpCallback = null;

function openDatePicker({ month, day, year, yearOptional = false, onSet }) {
  _dpMonth = month || new Date().getMonth() + 1;
  _dpDay = day || new Date().getDate();
  _dpYear = year || null;
  _dpYearOptional = yearOptional;
  _dpCallback = onSet;

  document.getElementById('dpYearWrap').style.display = yearOptional ? '' : '';
  document.querySelector('#dpYearWrap .dp-optional').style.display = yearOptional ? '' : 'none';

  dpBuildMonthCol();
  dpBuildYearCol();
  dpRenderCalendar();
  document.getElementById('datepickerBg').classList.add('open');
}

function bgClickDatepicker(e) {
  if (e.target === document.getElementById('datepickerBg')) dpCancel();
}

function dpCancel() {
  document.getElementById('datepickerBg').classList.remove('open');
}

function dpClear() {
  _dpMonth = new Date().getMonth() + 1;
  _dpDay = null;
  _dpYear = null;
  dpBuildMonthCol();
  dpBuildYearCol();
  dpRenderCalendar();
}

function dpSet() {
  if (_dpCallback) _dpCallback(_dpMonth, _dpDay, _dpYear);
  document.getElementById('datepickerBg').classList.remove('open');
}

function dpBuildCol(containerId, items, selectedIdx, onSelect) {
  const col = document.getElementById(containerId);
  const padItem = '<div class="dp-item dp-spacer"></div>';
  col.innerHTML =
    Array(DP_PAD).fill(padItem).join('') +
    items.map((item, i) => `<div class="dp-item${i === selectedIdx ? ' selected' : ''}" data-idx="${i}">${item}</div>`).join('') +
    Array(DP_PAD).fill(padItem).join('');

  // Scroll to selected
  col.scrollTop = selectedIdx * DP_ITEM_H;

  // Click to select
  col.querySelectorAll('.dp-item:not(.dp-spacer)').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.idx);
      onSelect(idx);
      col.querySelectorAll('.dp-item').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      col.scrollTo({ top: idx * DP_ITEM_H, behavior: 'smooth' });
    });
  });

  // Scroll snap selection
  let scrollTimer;
  col.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const idx = Math.round(col.scrollTop / DP_ITEM_H);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      onSelect(clamped);
      col.querySelectorAll('.dp-item:not(.dp-spacer)').forEach((el, i) => el.classList.toggle('selected', i === clamped));
      col.scrollTo({ top: clamped * DP_ITEM_H, behavior: 'smooth' });
    }, 150);
  });
}

function dpBuildMonthCol() {
  dpBuildCol('dpMonthCol', DP_MONTHS, (_dpMonth || 1) - 1, idx => {
    _dpMonth = idx + 1;
    if (_dpDay) {
      const max = new Date(_dpYear || 2000, _dpMonth, 0).getDate();
      if (_dpDay > max) _dpDay = max;
    }
    dpRenderCalendar();
  });
}

function dpBuildYearCol() {
  const years = [];
  for (let y = DP_YEAR_MIN; y <= DP_YEAR_MAX; y++) years.push(String(y));
  const selectedIdx = _dpYear ? _dpYear - DP_YEAR_MIN : new Date().getFullYear() - DP_YEAR_MIN;
  dpBuildCol('dpYearCol', years, selectedIdx, idx => {
    _dpYear = _dpYearOptional && idx === 0 ? null : DP_YEAR_MIN + idx;
    dpRenderCalendar();
  });
}

function dpRenderCalendar() {
  const month = _dpMonth || new Date().getMonth() + 1;
  const year = _dpYear || new Date().getFullYear();
  const header = document.getElementById('dpCalHeader');
  const grid = document.getElementById('dpCalGrid');

  header.textContent = `${DP_MONTHS[month - 1]} ${year}`;

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  let html = '';
  for (let i = 0; i < firstDay; i++) html += '<div class="dp-cal-cell dp-cal-empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const sel = d === _dpDay;
    html += `<div class="dp-cal-cell${sel ? ' selected' : ''}" onclick="dpSelectDay(${d})">${d}</div>`;
  }
  grid.innerHTML = html;
}

function dpSelectDay(d) {
  _dpDay = d;
  dpRenderCalendar();
}

// ─── CELEBRATION ──────────────────────────────────────────────────────────────
let celebrationShown = true; // true on init so cold-open to empty Today doesn't fire

function showCelebration() {
  if (document.getElementById('celebrationCanvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'celebrationCanvas';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:500;pointer-events:none';

  const label = document.createElement('div');
  label.style.cssText = [
    'position:fixed;inset:0;z-index:501;pointer-events:none',
    'display:flex;flex-direction:column;align-items:center;justify-content:center',
    'opacity:0;transition:opacity .4s ease',
  ].join(';');
  label.innerHTML = `
    <div style="font-size:56px;line-height:1;margin-bottom:12px;filter:drop-shadow(0 2px 8px rgba(0,0,0,.3))">⚓</div>
    <div style="font-size:26px;font-weight:700;color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.5);letter-spacing:-.02em">You're tethered!</div>
  `;

  document.body.appendChild(canvas);
  document.body.appendChild(label);
  requestAnimationFrame(() => { label.style.opacity = '1'; });

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const COLORS = ['var(--accent)','var(--accent-mid)','#B8A9FF','#E8E5FF','#ffffff','#FFD700','var(--accent-soft)','#C4B0FF','#fff9c4'];
  const particles = [];

  function burst(x, y) {
    for (let i = 0; i < 42; i++) {
      const angle = (Math.PI * 2 * i) / 42 + (Math.random() - 0.5) * 0.4;
      const speed = 2.5 + Math.random() * 5.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 1,
        radius: 1.5 + Math.random() * 3,
        decay: 0.012 + Math.random() * 0.009,
        gravity: 0.08 + Math.random() * 0.06,
      });
    }
  }

  [
    [W * 0.5,  H * 0.22],
    [W * 0.18, H * 0.38],
    [W * 0.82, H * 0.33],
    [W * 0.3,  H * 0.18],
    [W * 0.7,  H * 0.28],
    [W * 0.5,  H * 0.42],
  ].forEach(([x, y], i) => setTimeout(() => burst(x, y), i * 190));

  let raf;
  function cleanup() {
    cancelAnimationFrame(raf);
    label.style.opacity = '0';
    setTimeout(() => { canvas.remove(); label.remove(); }, 420);
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += p.gravity; p.vx *= 0.98;
      p.alpha -= p.decay;
      if (p.alpha <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (particles.length > 0) { raf = requestAnimationFrame(animate); } else { cleanup(); }
  }

  setTimeout(() => { raf = requestAnimationFrame(animate); }, 0);
  setTimeout(cleanup, 4200); // hard cap
}

// ─── THEME ────────────────────────────────────────────────────────────────────
const COLOR_THEMES = [
  {
    id: 'tether',
    name: 'Tether',
    bg: '#0B353B',
    accent: '#534AB7',
    'accent-dark': '#26215C',
    'accent-mid': '#7B72D4',
    'accent-soft': '#AFA9EC',
    'accent-pale': '#CECBF6',
    surface: '#F7F6FF',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    bg: '#0A2340',
    accent: '#0284C7',
    'accent-dark': '#0C4A6E',
    'accent-mid': '#38BDF8',
    'accent-soft': '#7DD3FC',
    'accent-pale': '#BAE6FD',
    surface: '#F0F9FF',
  },
  {
    id: 'dusk',
    name: 'Dusk',
    bg: '#2D1B4E',
    accent: '#9333EA',
    'accent-dark': '#3B0764',
    'accent-mid': '#A855F7',
    'accent-soft': '#C084FC',
    'accent-pale': '#E9D5FF',
    surface: '#FAF5FF',
  },
  {
    id: 'forest',
    name: 'Forest',
    bg: '#142614',
    accent: '#16A34A',
    'accent-dark': '#14532D',
    'accent-mid': '#4ADE80',
    'accent-soft': '#86EFAC',
    'accent-pale': '#BBF7D0',
    surface: '#F0FDF4',
  },
  {
    id: 'ember',
    name: 'Ember',
    bg: '#2C1A10',
    accent: '#EA580C',
    'accent-dark': '#7C2D12',
    'accent-mid': '#F97316',
    'accent-soft': '#FB923C',
    'accent-pale': '#FED7AA',
    surface: '#FFF7ED',
  },
];

function initTheme() {
  const savedMode = localStorage.getItem('tether-theme') || 'system';
  const savedColorTheme = localStorage.getItem('tether-color-theme') || 'tether';
  applyColorTheme(savedColorTheme);
  applyTheme(savedMode);
}

function applyColorTheme(themeId) {
  const theme = COLOR_THEMES.find(t => t.id === themeId) || COLOR_THEMES[0];
  const html = document.documentElement;
  html.style.setProperty('--bg', theme.bg);
  html.style.setProperty('--accent', theme.accent);
  html.style.setProperty('--accent-dark', theme['accent-dark']);
  html.style.setProperty('--accent-mid', theme['accent-mid']);
  html.style.setProperty('--accent-soft', theme['accent-soft']);
  html.style.setProperty('--accent-pale', theme['accent-pale']);
  html.style.setProperty('--surface', theme.surface);
  localStorage.setItem('tether-color-theme', themeId);
  localStorage.setItem('tether-bg', theme.bg);
}

function setColorTheme(themeId) {
  applyColorTheme(themeId);
  document.querySelectorAll('.color-theme-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.themeId === themeId);
  });
  if (currentUser) persistColorTheme(themeId);
}

async function persistColorTheme(themeId) {
  const prefs = userPrefs.preferences || {};
  prefs.colorTheme = themeId;
  userPrefs.preferences = prefs;
  await sb.from('users').update({ preferences: prefs }).eq('id', currentUser.id);
}

function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
  } else if (theme === 'light') {
    html.setAttribute('data-theme', 'light');
  } else {
    html.removeAttribute('data-theme');
  }
}

function setTheme(theme) {
  localStorage.setItem('tether-theme', theme);
  applyTheme(theme);
  document.querySelectorAll('.theme-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.theme === theme);
  });
}

// ─── SETTINGS SHEET ───────────────────────────────────────────────────────────
function openSettingsSheet() {
  renderSettingsSheet();
  document.getElementById('settingsBg').classList.add('open');
}
function closeSettingsSheet() { document.getElementById('settingsBg').classList.remove('open'); }
function bgClickSettings(e) { if (e.target === document.getElementById('settingsBg')) closeSettingsSheet(); }

function renderSettingsSheet() {
  const body = document.getElementById('settingsBody');
  if (!body) return;
  const currentTheme = localStorage.getItem('tether-theme') || 'system';
  const currentBg = localStorage.getItem('tether-bg') || '#0B353B';
  const version = typeof APP_VERSION !== 'undefined' ? 'v' + APP_VERSION : '—';

  body.innerHTML = `
    <div class="settings-section">Appearance</div>
    <div class="settings-row">
      <div class="settings-row-info">
        <div class="settings-row-label">Theme</div>
      </div>
      <div class="theme-pills">
        <button class="theme-pill${currentTheme==='dark'?' active':''}" data-theme="dark" onclick="setTheme('dark')">Dark</button>
        <button class="theme-pill${currentTheme==='light'?' active':''}" data-theme="light" onclick="setTheme('light')">Light</button>
        <button class="theme-pill${currentTheme==='system'?' active':''}" data-theme="system" onclick="setTheme('system')">System</button>
      </div>
    </div>
    <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:10px">
      <div class="settings-row-label">Color theme</div>
      <div class="color-theme-swatches">${COLOR_THEMES.map(t => `
        <button class="color-theme-swatch${localStorage.getItem('tether-color-theme')===t.id?' active':''}" data-theme-id="${t.id}" onclick="setColorTheme('${t.id}')" title="${t.name}">
          <span class="color-theme-bg" style="background:${t.bg}"></span>
          <span class="color-theme-accent" style="background:${t.accent}"></span>
          <span class="color-theme-name">${t.name}</span>
        </button>`).join('')}
      </div>
    </div>

    <div class="settings-section">Schedule</div>
    <div class="settings-row">
      <div class="settings-row-info">
        <div class="settings-row-label">Daily reset time</div>
        <div class="settings-row-sub">When tasks reset to "due today"</div>
      </div>
      <input type="time" value="00:00" style="padding:6px 10px;border-radius:10px;border:0.5px solid var(--accent-pale);background:var(--surface);color:var(--accent-dark);font-family:inherit;font-size:14px"/>
    </div>

    <div class="settings-section">Integrations</div>
    <div class="settings-row">
      <div class="settings-row-info">
        <div class="settings-row-label">Calendar sync</div>
        <div class="settings-row-sub">Coming soon</div>
      </div>
      <span style="font-size:12px;color:var(--accent-soft);font-weight:600">Soon</span>
    </div>

    <div class="settings-section">About</div>
    <div class="settings-row settings-version-row" onclick="openChangelogSheet()">
      <div class="settings-row-info">
        <div class="settings-row-label">Version</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span class="settings-version">${version}</span>
        <span class="settings-version-chevron" style="color:var(--accent-soft);font-size:16px">›</span>
      </div>
    </div>
  `;

  // Wire bg color input after render
  const input = document.getElementById('bgColorInput');
  if (input) {
    input.addEventListener('change', () => {
      const val = input.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) applyBgColor(val);
      else input.value = localStorage.getItem('tether-bg') || '#0B353B';
    });
  }
}

// ─── CHANGELOG SHEET ──────────────────────────────────────────────────────────
const CHANGELOG = [
  {
    version: 'v0.2',
    date: 'April 2025',
    notes: [
      'Annual reminders — birthdays, anniversaries, and yearly tasks',
      'Settings sheet with Dark / Light / System theme switching',
      'Events accessible directly from the profile menu',
      'Keyboard-aware modals — inputs scroll into view on mobile',
      'App version bumped to 0.2 series',
    ]
  },
  {
    version: 'v0.1',
    date: 'Early 2025',
    notes: [
      'Initial release — tasks, events, household, groups, contacts',
      'Recurring tasks: daily, weekly, monthly',
      'Swipe right to complete, left to snooze or dismiss',
      'Sign in with Google, Apple, Microsoft, Facebook, or magic link',
      'Household sharing and invite system',
    ]
  },
];

function openChangelogSheet() {
  renderChangelogSheet();
  document.getElementById('changelogBg').classList.add('open');
}
function closeChangelogSheet() { document.getElementById('changelogBg').classList.remove('open'); }
function bgClickChangelog(e) { if (e.target === document.getElementById('changelogBg')) closeChangelogSheet(); }

function renderChangelogSheet() {
  const body = document.getElementById('changelogBody');
  if (!body) return;
  body.innerHTML = CHANGELOG.map(r => `
    <div style="margin-bottom:1.5rem">
      <div class="changelog-version">${r.version}</div>
      <div class="changelog-date">${r.date}</div>
      ${r.notes.map(n => `<div class="changelog-note">${n}</div>`).join('')}
    </div>
  `).join('');
}

// ─── KEYBOARD-AWARE SHEETS ────────────────────────────────────────────────────
(function initKeyboardAwareSheets() {
  if (!window.visualViewport) return;

  function onViewportResize() {
    const offset = window.innerHeight - window.visualViewport.height;
    document.documentElement.style.setProperty('--keyboard-offset', Math.max(0, offset) + 'px');
  }
  window.visualViewport.addEventListener('resize', onViewportResize);

  const sheetSelector = '.modal,.snooze-sheet,.user-menu,.events-list-sheet,.social-sheet,.household-sheet,.assign-sheet,.event-detail-sheet,.annual-sheet,.settings-sheet,.changelog-sheet,.grocery-sheet';
  document.addEventListener('focusin', (e) => {
    if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)) return;
    if (!e.target.closest(sheetSelector)) return;
    setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
  });
})();

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
let obStep = 0;
let obHasInvite = false;
let obAnniversaries = [];
let obHouseholdId = null;
let obDisplayName = '';
let obPendingGroupInvites = [];

function obGetParas() { return (_aboutData?.opening?.paragraphs) || []; }

function obGetSteps() {
  const steps = [];
  obGetParas().forEach((_, i) => steps.push({ type: 'about', i }));
  steps.push({ type: 'household' });
  if (obPendingGroupInvites.length) steps.push({ type: 'groupinvites' });
  steps.push({ type: 'name' });
  steps.push({ type: 'birthday' });
  steps.push({ type: 'anniversary' });
  steps.push({ type: 'finish' });
  return steps;
}
function obGetTotal() { return obGetSteps().length; }

async function initOnboarding({ hasInvite, displayName, pendingGroupInvites }) {
  obStep = 0;
  obHasInvite = hasInvite;
  obAnniversaries = [];
  obHouseholdId = null;
  obPendingGroupInvites = pendingGroupInvites || [];
  obDisplayName = displayName || currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || '';
  document.getElementById('obOverlay').style.display = '';
  if (!_aboutData) {
    const res = await fetch('/about.json?v=' + (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '0'));
    _aboutData = await res.json();
  }
  renderObScreen();
}

function renderObSteps() {
  const el = document.getElementById('obSteps');
  const total = obGetTotal();
  el.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'ob-step' + (i < obStep ? ' done' : i === obStep ? ' active' : '');
    el.appendChild(dot);
  }
}

function renderObScreen() {
  renderObSteps();
  const step = obGetSteps()[obStep];
  if (!step) return;
  if      (step.type === 'about')        renderObAbout(step.i);
  else if (step.type === 'household')    renderObHousehold();
  else if (step.type === 'groupinvites') renderObGroupInvites();
  else if (step.type === 'name')         renderObName();
  else if (step.type === 'birthday')     renderObBirthday();
  else if (step.type === 'anniversary')  renderObAnniversary();
  else                                   renderObFinish();
}

function obAdvance() { if (obStep < obGetTotal() - 1) { obStep++; renderObScreen(); } }
function obBack()    { if (obStep > 0) { obStep--; renderObScreen(); } }

function obNavPills(skipLabel, skipFn) {
  return `<div class="ob-pills">
    <button class="ob-pill" onclick="obBack()">← Back</button>
    <button class="ob-pill" onclick="${skipFn}()">${skipLabel}</button>
  </div>`;
}

function renderObAbout(step) {
  const o = _aboutData.opening;
  const paras = o.paragraphs;
  const p = paras[step];
  let content = '';
  if (step === 0) {
    const parts = p.body.split('\n\n');
    content = `
      <div class="about-tagline">${o.tagline}</div>
      <div class="about-opening-body">${parts.map(b => `<p>${b}</p>`).join('')}</div>
      <div class="ob-actions"><button class="ob-btn-primary" onclick="obAdvance()">Next</button></div>`;
  } else {
    const labelHtml = p.label ? `<span class="about-para-label">${p.label}</span> ` : '';
    const parts = p.body.split('\n\n');
    const bodyHtml = parts.map((b, i) => `<p>${i === 0 ? labelHtml : ''}${b}</p>`).join('');
    content = `
      <div class="about-opening-body">${bodyHtml}</div>
      <div class="ob-actions">
        <button class="ob-btn-primary" onclick="obAdvance()">Next</button>
        <div class="ob-pills"><button class="ob-pill" onclick="obBack()">← Back</button></div>
      </div>`;
  }
  document.getElementById('obCard').innerHTML = content;
}

function renderObGroupInvites() {
  const listHtml = obPendingGroupInvites.map(inv => `
    <div class="ob-group-invite-row" id="obgi-${inv.id}">
      <div class="ob-group-invite-name">${inv.groups?.name || 'a group'}</div>
      <div class="ob-group-invite-meta">${inv.groups?.type === 'personal' ? 'Personal group' : 'Shared group'}</div>
      <div class="social-req-actions" style="margin-top:8px">
        <button class="social-req-btn social-req-accept" data-id="${inv.id}" data-gid="${inv.group_id}" onclick="obAcceptGroupInvite(this)">Join</button>
        <button class="social-req-btn social-req-decline" data-id="${inv.id}" onclick="obDeclineGroupInvite(this)">Decline</button>
      </div>
    </div>`).join('');
  document.getElementById('obCard').innerHTML = `
    <div class="ob-title">Group invites</div>
    <div class="ob-body">You've been invited to join ${obPendingGroupInvites.length > 1 ? 'these groups' : 'this group'}.</div>
    <div class="ob-group-invite-list">${listHtml}</div>
    <div class="ob-actions">
      <button class="ob-btn-primary" onclick="obAdvance()">Continue</button>
      <div class="ob-pills"><button class="ob-pill" onclick="obBack()">← Back</button></div>
    </div>
  `;
}

async function obAcceptGroupInvite(el) {
  const id = el.dataset.id;
  const gid = el.dataset.gid;
  el.disabled = true;
  el.nextElementSibling.disabled = true;
  await acceptGroupMembership(id, gid, false);
  const row = document.getElementById('obgi-' + id);
  if (row) { row.style.opacity = '.5'; row.querySelector('.social-req-accept').textContent = 'Joined!'; }
}

async function obDeclineGroupInvite(el) {
  const id = el.dataset.id;
  el.disabled = true;
  el.previousElementSibling.disabled = true;
  await sb.from('group_members').update({ status: 'declined' }).eq('id', id);
  const row = document.getElementById('obgi-' + id);
  if (row) { row.style.opacity = '.5'; row.querySelector('.social-req-decline').textContent = 'Declined'; }
}

function renderObName() {
  document.getElementById('obCard').innerHTML = `
    <div class="ob-title">What should we call you?</div>
    <div class="ob-body">This is how you'll appear to your household and contacts.</div>
    <div class="ob-fields">
      <input class="ob-input" id="obNameInput" type="text" placeholder="Your name" maxlength="60"
        value="${obDisplayName.replace(/"/g, '&quot;')}"
        onkeydown="if(event.key==='Enter')obSaveName()">
    </div>
    <div class="ob-actions">
      <button class="ob-btn-primary" onclick="obSaveName()">Continue</button>
      <div class="ob-pills"><button class="ob-pill" onclick="obBack()">← Back</button></div>
    </div>
  `;
  setTimeout(() => {
    const input = document.getElementById('obNameInput');
    if (input) { input.focus(); input.select(); }
  }, 50);
}

async function obSaveName() {
  const name = document.getElementById('obNameInput')?.value.trim();
  if (!name) { showToast('Please enter your name'); return; }
  const { error } = await sb.from('users').update({ display_name: name }).eq('id', currentUser.id);
  if (error) { showToast('Could not save name'); return; }
  obDisplayName = name;
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const avatarEl = document.getElementById('avatarBtn');
  const menuAvatarEl = document.getElementById('menuAvatarLg');
  if (avatarEl && !avatarEl.querySelector('img')) avatarEl.textContent = initials;
  if (menuAvatarEl && !menuAvatarEl.querySelector('img')) menuAvatarEl.textContent = initials;
  const menuNameEl = document.getElementById('menuName');
  if (menuNameEl) menuNameEl.textContent = name;
  obAdvance();
}

function renderObBirthday() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('obCard').innerHTML = `
    <div class="ob-title">Your birthday</div>
    <div class="ob-body">Tether can surface your birthday and remind the people around you.</div>
    <div class="ob-fields">
      <div class="ob-field-row">
        <select class="ob-select" id="obBdMonth">
          <option value="">Month</option>
          ${months.map((m,i)=>`<option value="${String(i+1).padStart(2,'0')}">${m}</option>`).join('')}
        </select>
        <input class="ob-input ob-input-sm" id="obBdDay" type="text" inputmode="numeric" placeholder="Day" maxlength="2">
        <input class="ob-input ob-input-sm" id="obBdYear" type="text" inputmode="numeric" placeholder="Year (optional)" maxlength="4">
      </div>
    </div>
    <div class="ob-actions">
      <button class="ob-btn-primary" onclick="obSaveBirthday()">Save & continue</button>
      ${obNavPills('Skip', 'obAdvance')}
    </div>
  `;
}

async function obSaveBirthday() {
  const month = document.getElementById('obBdMonth').value;
  const day   = document.getElementById('obBdDay').value.trim();
  const year  = document.getElementById('obBdYear').value.trim();
  if (month && day) {
    const row = {
      type: 'birthday', name: 'My Birthday',
      month: parseInt(month), day: parseInt(day),
      year: year ? parseInt(year) : null,
      visibility: 'household', user_id: currentUser.id
    };
    const { error } = await sb.from('occasions').insert(row);
    if (error) { showToast('Could not save birthday'); return; }
  }
  obAdvance();
}

function renderObAnniversary() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const listHtml = obAnniversaries.map((a, i) => `
    <div class="ob-aniv-row">
      <span>${a.name} — ${a.date}</span>
      <button class="ob-aniv-remove" onclick="obRemoveAnniversary(${i})">✕</button>
    </div>`).join('');
  document.getElementById('obCard').innerHTML = `
    <div class="ob-title">Anniversaries</div>
    <div class="ob-body">Add anniversaries and milestones — wedding, friendiversary, whatever matters to you.</div>
    ${listHtml ? `<div class="ob-aniv-list">${listHtml}</div>` : ''}
    <div class="ob-fields">
      <input class="ob-input" id="obAnivName" type="text" placeholder="Label (e.g. Wedding anniversary)">
      <div class="ob-field-row">
        <select class="ob-select" id="obAnivMonth">
          <option value="">Month</option>
          ${months.map((m,i)=>`<option value="${String(i+1).padStart(2,'0')}">${m}</option>`).join('')}
        </select>
        <input class="ob-input ob-input-sm" id="obAnivDay" type="text" inputmode="numeric" placeholder="Day" maxlength="2">
        <input class="ob-input ob-input-sm" id="obAnivYear" type="text" inputmode="numeric" placeholder="Year" maxlength="4">
      </div>
    </div>
    <div class="ob-actions">
      <button class="ob-btn-primary" onclick="obAddAnniversary()">Add${obAnniversaries.length ? ' another' : ''}</button>
      ${obNavPills(obAnniversaries.length ? 'Done' : 'Skip', 'obSaveAnniversaries')}
    </div>
  `;
}

function obAddAnniversary() {
  const name  = document.getElementById('obAnivName').value.trim();
  const month = document.getElementById('obAnivMonth').value;
  const day   = document.getElementById('obAnivDay').value.trim();
  const year  = document.getElementById('obAnivYear').value.trim();
  if (!month || !day) { showToast('Month and day are required'); return; }
  const dateStr = year
    ? `${year}-${month}-${String(parseInt(day)).padStart(2,'0')}`
    : `${month}-${String(parseInt(day)).padStart(2,'0')}`;
  obAnniversaries.push({ name: name || 'Anniversary', date: dateStr });
  renderObAnniversary();
}

function obRemoveAnniversary(i) {
  obAnniversaries.splice(i, 1);
  renderObAnniversary();
}

async function obSaveAnniversaries() {
  if (obAnniversaries.length) {
    const rows = obAnniversaries.map(a => {
      const parts = a.date.split('-');
      const hasYear = parts.length === 3;
      return {
        type: 'anniversary', name: a.name,
        month: parseInt(hasYear ? parts[1] : parts[0]),
        day:   parseInt(hasYear ? parts[2] : parts[1]),
        year:  hasYear ? parseInt(parts[0]) : null,
        visibility: 'household', user_id: currentUser.id
      };
    });
    const { error } = await sb.from('occasions').insert(rows);
    if (error) { showToast('Could not save: ' + error.message); return; }
  }
  obAdvance();
}

function renderObHousehold() {
  if (obHasInvite) {
    document.getElementById('obCard').innerHTML = `
      <div class="ob-title">You have an invite!</div>
      <div class="ob-body">Someone has already invited you to join their household. You'll be able to accept it as soon as you're in.</div>
      <div class="ob-actions">
        <button class="ob-btn-primary" onclick="obAdvance()">Got it</button>
        ${obNavPills('Skip', 'obAdvance')}
      </div>
    `;
    return;
  }
  document.getElementById('obCard').innerHTML = `
    <div class="ob-title">Households</div>
    <div class="ob-body">A Tether household keeps tasks and events in sync with the people you live with — a partner, family, or roommates.</div>
    <div class="ob-orient-list">
      <button class="ob-orient-row" onclick="obShowCreateHousehold()">
        <span class="ob-orient-icon">🏠</span>
        <div>
          <div class="ob-orient-label">Create a household</div>
          <div class="ob-orient-sub">Set it up and invite your people</div>
        </div>
      </button>
      <button class="ob-orient-row" onclick="obShowJoinHousehold()">
        <span class="ob-orient-icon">🤝</span>
        <div>
          <div class="ob-orient-label">Join a household</div>
          <div class="ob-orient-sub">Someone already has one set up</div>
        </div>
      </button>
    </div>
    ${obNavPills('Skip for now', 'obAdvance')}
  `;
}

function obShowCreateHousehold() {
  document.getElementById('obCard').innerHTML = `
    <div class="ob-title">Create a household</div>
    <div class="ob-body">Give it a name. You can invite people now or after setup.</div>
    <div class="ob-fields">
      <input class="ob-input" id="obHhName" type="text" placeholder="e.g. The Monette House" maxlength="40">
      <input class="ob-input" id="obHhInvite" type="email" placeholder="Invite by email (optional)">
    </div>
    <div class="ob-actions">
      <button class="ob-btn-primary" onclick="obCreateHouseholdFlow()">Create household</button>
      <div class="ob-pills">
        <button class="ob-pill" onclick="renderObHousehold()">← Back</button>
      </div>
    </div>
  `;
}

function obShowJoinHousehold() {
  document.getElementById('obCard').innerHTML = `
    <div class="ob-title">Join a household</div>
    <div class="ob-body">Enter the email of someone already in the household. The owner will approve your request.</div>
    <div class="ob-fields">
      <input class="ob-input" id="obJoinEmail" type="email" placeholder="Their email address">
    </div>
    <div id="obJoinStatus"></div>
    <div class="ob-actions">
      <button class="ob-btn-primary" onclick="obSendJoinRequest()">Send request</button>
      <div class="ob-pills">
        <button class="ob-pill" onclick="renderObHousehold()">← Back</button>
      </div>
    </div>
  `;
}

async function obSendJoinRequest() {
  const email = document.getElementById('obJoinEmail')?.value.trim();
  if (!email) { showToast('Enter an email address'); return; }
  const statusEl = document.getElementById('obJoinStatus');
  if (statusEl) statusEl.textContent = 'Looking up…';
  // find the user
  const { data: targetUser } = await sb.from('users').select('id, display_name').eq('email', email).single();
  if (!targetUser) {
    if (statusEl) statusEl.textContent = '';
    showToast('No Tether account found for that email');
    return;
  }
  // find their household
  const { data: membership } = await sb.from('household_members')
    .select('household_id, households(name, created_by)').eq('user_id', targetUser.id).limit(1).single();
  if (!membership) {
    if (statusEl) statusEl.textContent = '';
    showToast('That person isn\'t in a household yet');
    return;
  }
  const hhId = membership.household_id;
  const hhName = membership.households?.name || 'their household';
  const creatorId = membership.households?.created_by;
  const approverId = creatorId || targetUser.id;
  // create join request as a pending invite initiated by the household owner on our behalf
  const { error } = await sb.from('household_invites').insert({
    household_id: hhId,
    invited_user_id: currentUser.id,
    invited_by: approverId,
    status: 'pending',
    request_type: 'join_request'
  });
  if (error) { showToast('Could not send request'); if (statusEl) statusEl.textContent = ''; return; }
  const approverName = creatorId ? (membership.households?.created_by ? 'the owner' : targetUser.display_name || 'them') : (targetUser.display_name || 'them');
  document.getElementById('obCard').innerHTML = `
    <div class="ob-icon">📬</div>
    <div class="ob-title">Request sent!</div>
    <div class="ob-body">Your request to join <strong>${hhName}</strong> has been sent. The owner will need to approve it before you're added.</div>
    <div class="ob-actions">
      <button class="ob-btn-primary" onclick="obAdvance()">Continue</button>
    </div>
  `;
}

async function obCreateHouseholdFlow() {
  const nameEl   = document.getElementById('obHhName');
  const inviteEl = document.getElementById('obHhInvite');
  const name = nameEl?.value.trim() || 'My Household';
  const { data: hh, error: hhErr } = await sb.from('households')
    .insert({ name, created_by: currentUser.id }).select().single();
  if (hhErr) { showToast('Could not create household'); return; }
  obHouseholdId = hh.id;
  await sb.from('household_members').insert({ household_id: hh.id, user_id: currentUser.id, role: 'admin' });
  const email = inviteEl?.value.trim();
  if (email) {
    const { data: invitee } = await sb.from('users').select('id').eq('email', email).single();
    if (invitee) {
      await sb.from('household_invites').insert({
        household_id: hh.id, invited_user_id: invitee.id,
        invited_by: currentUser.id, status: 'pending'
      });
    } else {
      showToast('User not found — you can invite them later from your household');
    }
  }
  obAdvance();
}

function renderObFinish() {
  document.getElementById('obCard').innerHTML = `
    <div class="ob-icon">⚓</div>
    <div class="ob-title">You're tethered.</div>
    <div class="ob-body">For additional details about Tether, visit <strong>About Tether</strong> in your profile at any time.</div>
    <div class="ob-actions">
      <button class="ob-btn-primary" onclick="obComplete()">Open Tether</button>
      <div class="ob-pills"><button class="ob-pill" onclick="obBack()">← Back</button></div>
    </div>
  `;
}

async function obComplete() {
  await sb.from('users').update({ onboarded: true }).eq('id', currentUser.id);
  document.getElementById('obOverlay').style.display = 'none';
  if (window.location.pathname === '/onboarding') history.replaceState(null, '', '/');
  if (obHouseholdId) await loadHousehold();
  await Promise.all([checkPendingInvites(), checkPendingContactRequests()]);
  render();
  setupRealtime();
  setTimeout(showCelebration, 150);
}

// ─── CHORE CATALOG ────────────────────────────────────────────────────────────
const CHORE_ROOMS = [
  {name:'Kitchen',emoji:'🍳'},{name:'Living Room',emoji:'🛋️'},{name:'Bathroom',emoji:'🚿'},
  {name:'Bedroom',emoji:'🛏️'},{name:'Dining Room',emoji:'🍽️'},{name:'Garage / Den',emoji:'🏠'},
];
const CHORE_INDOOR = [
  {name:'Dishes',emoji:'🍽️'},{name:'Unload Dishwasher',emoji:'🫧'},{name:'Wipe Counters',emoji:'🧽'},
  {name:'Take Out Trash',emoji:'🗑️'},{name:'Vacuum',emoji:'🧹'},{name:'Dust',emoji:'🪣'},
  {name:'Sweep / Mop',emoji:'🫧'},{name:'Make Bed',emoji:'🛏️'},{name:'Change Sheets',emoji:'🛌'},
  {name:'Fold Laundry',emoji:'👕'},{name:'Put Away Laundry',emoji:'👔'},{name:'Tidy Up',emoji:'📦'},
];
const CHORE_OUTDOOR = [
  {name:'Mow Lawn',emoji:'🌿'},{name:'Rake Leaves',emoji:'🍂'},{name:'Shovel Snow',emoji:'❄️'},
  {name:'Water Plants',emoji:'🌱'},{name:'Take Out Bins',emoji:'🗑️'},
];

// ─── CHORE STATE ──────────────────────────────────────────────────────────────
let choreTaskId = null;
let choreListItems = [];
let choreEditSelected = new Set();
let choreEditMode = 'add';
let formAssigneeId = null;

// ─── GROCERY PANEL ────────────────────────────────────────────────────────────
let groceryTaskId = null;
let groceryListItems = [];
let groceryRealtimeChannel = null;
let groceryDebounce = null;
let groceryQaSelected = new Map(); // name.toLowerCase() → catalog item data
let groceryPendingDiff = null;
let groceryEditingId = null;
let grocerySubmitting = false;

function openGroceryPanel(taskId) {
  groceryTaskId = taskId;
  const task = items.find(i => i.id === taskId);
  document.getElementById('groceryTitle').textContent = task?.name || 'Grocery Run';
  document.getElementById('groceryBg').classList.add('open');
  loadGroceryItems();
  subscribeGrocery(taskId);
}

function closeGroceryPanel() {
  closeConfirmPanel();
  closeQuickAddSheet();
  document.getElementById('groceryBg').classList.remove('open');
  unsubscribeGrocery();
  groceryTaskId = null;
  groceryListItems = [];
  groceryQaSelected = new Map();
}

function bgClickGrocery(e) {
  if (e.target === document.getElementById('groceryBg')) closeGroceryPanel();
}

async function loadGroceryItems() {
  if (!groceryTaskId) return;
  const { data, error } = await sb.from('grocery_items')
    .select('*')
    .eq('task_id', groceryTaskId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: true });
  if (error) { showToast('Load error: ' + error.message); return; }
  groceryListItems = data || [];
  renderGroceryListView();
}

function subscribeGrocery(taskId) {
  unsubscribeGrocery();
  groceryRealtimeChannel = sb.channel('grocery-' + taskId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'grocery_items', filter: `task_id=eq.${taskId}` }, () => {
      clearTimeout(groceryDebounce);
      groceryDebounce = setTimeout(loadGroceryItems, 200);
    })
    .subscribe();
}

function unsubscribeGrocery() {
  if (groceryRealtimeChannel) { sb.removeChannel(groceryRealtimeChannel); groceryRealtimeChannel = null; }
}

// ── List view ─────────────────────────────────────────────────────────────────
function renderGroceryListView() {
  const body = document.getElementById('groceryBody');
  if (!body) return;
  const doneBtn = document.getElementById('groceryDoneBtn');
  const fab = document.getElementById('groceryFab');
  if (doneBtn) doneBtn.style.display = groceryListItems.length ? '' : 'none';
  if (fab) fab.textContent = groceryListItems.length ? '✎ Edit List' : '＋ Add Items';
  if (!groceryListItems.length) {
    body.innerHTML = '<div class="grocery-empty">Your list is empty.<br>Tap ＋ Add Items to get started.</div>';
    return;
  }
  const catalogItems = groceryListItems.filter(gi => !gi.is_custom || gi.dept !== 'misc');
  const customItems = groceryListItems.filter(gi => gi.is_custom && gi.dept === 'misc');
  const grouped = groupByDept(catalogItems);
  let html = '';
  for (const group of grouped) {
    html += `<div class="grocery-dept-header">${group.emoji} ${group.label}</div>`;
    html += group.items.map(gi => groceryListItemHTML(gi)).join('');
  }
  if (customItems.length) {
    html += '<div class="grocery-dept-header">🛒 Custom</div>';
    html += customItems.map(gi => groceryListItemHTML(gi)).join('');
  }
  const qaDeptOptions = GROCERY_DEPARTMENTS.map(d => `<option value="${d.key}">${d.emoji} ${d.label}</option>`).join('') + '<option value="misc">🛒 Misc</option>';
  html += `<div class="grocery-quick-add-row">
    <input type="text" class="grocery-quick-input" id="groceryQuickInput" placeholder="Add an item..." onkeydown="if(event.key==='Enter')quickAddCustomItem()"/>
    <select class="grocery-quick-dept" id="groceryQuickDept">${qaDeptOptions}</select>
    <button class="grocery-quick-btn" onclick="quickAddCustomItem()">Add</button>
  </div>`;
  body.innerHTML = html;
}

function groceryListItemHTML(gi) {
  if (gi.id === groceryEditingId) return groceryListItemEditHTML(gi);
  const isWeight = gi.unit === 'weight';
  const isVolume = gi.unit === 'volume';
  const step = isWeight ? 0.5 : 1;
  const qty = gi.qty || 1;
  const catalogItem = GROCERY_ITEMS.find(ci => ci.name.toLowerCase() === gi.name.toLowerCase());
  const emoji = catalogItem?.emoji || null;
  const checkSVG = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const sizePills = isVolume ? ['S','M','L','XL'].map(s =>
    `<button class="grocery-size-pill${gi.size===s?' active':''}" onclick="setGrocerySize('${gi.id}','${s}')">${s}</button>`
  ).join('') : '';
  return `<div class="grocery-list-item${gi.checked?' checked':''}" id="gli-${gi.id}">
    <div class="grocery-item-check${gi.checked?' done':''}" onclick="toggleGroceryItem('${gi.id}')">${gi.checked?checkSVG:''}</div>
    <div class="grocery-item-body">
      <div class="grocery-item-top">
        ${emoji ? `<span class="grocery-item-emoji">${emoji}</span>` : ''}
        <span class="grocery-item-name${gi.checked?' checked':''}">${escAttr(gi.name)}</span>
        <button class="grocery-item-edit-btn" onclick="startEditGroceryItem('${gi.id}')">✎</button>
        <button class="grocery-item-remove" onclick="removeGroceryItem('${gi.id}')">✕</button>
      </div>
      <div class="grocery-item-bottom">
        <span class="grocery-item-note">${gi.note ? escAttr(gi.note) : ''}</span>
        <div class="grocery-item-controls">
          <button class="grocery-unit-toggle" onclick="cycleGroceryUnit('${gi.id}','${gi.unit}')">${isWeight?'lbs':'qty'}</button>
          <div class="grocery-item-qty">
            <button class="grocery-qty-btn" onclick="adjustGroceryQty('${gi.id}',${isWeight?-0.5:-1})">−</button>
            <input type="number" class="grocery-qty-input" id="gli-qty-${gi.id}" value="${qty}" step="${step}" min="${step}" onchange="editGroceryQtyDirect('${gi.id}',this.value)"/>
            <button class="grocery-qty-btn" onclick="adjustGroceryQty('${gi.id}',${isWeight?0.5:1})">+</button>
          </div>
          ${sizePills ? `<div class="grocery-size-pills">${sizePills}</div>` : ''}
        </div>
      </div>
    </div>
  </div>`;
}

function groceryListItemEditHTML(gi) {
  const deptOpts = GROCERY_DEPARTMENTS.map(d =>
    `<option value="${d.key}"${gi.dept===d.key?' selected':''}>${d.emoji} ${d.label}</option>`
  ).join('') + `<option value="misc"${gi.dept==='misc'?' selected':''}>🛒 Misc</option>`;
  return `<div class="grocery-list-item grocery-list-item-editing" id="gli-${gi.id}">
    <div class="grocery-item-edit-form">
      <div class="grocery-edit-row">
        <input type="text" class="grocery-edit-name" id="gli-edit-name-${gi.id}" value="${escAttr(gi.name)}" placeholder="Item name..."/>
        <select class="grocery-edit-dept" id="gli-edit-dept-${gi.id}">${deptOpts}</select>
      </div>
      <input type="text" class="grocery-edit-note" id="gli-edit-note-${gi.id}" value="${escAttr(gi.note||'')}" placeholder="Add a note… (e.g. baby tylenol)"/>
      <div class="grocery-edit-actions">
        <button class="grocery-edit-save" onclick="saveGroceryItemEdit('${gi.id}')">Save</button>
        <button class="grocery-edit-cancel" onclick="cancelGroceryItemEdit()">Cancel</button>
      </div>
    </div>
  </div>`;
}

function startEditGroceryItem(id) {
  groceryEditingId = id;
  renderGroceryListView();
  setTimeout(() => document.getElementById(`gli-edit-name-${id}`)?.focus(), 50);
}

function cancelGroceryItemEdit() {
  groceryEditingId = null;
  renderGroceryListView();
}

async function saveGroceryItemEdit(id) {
  const name = document.getElementById(`gli-edit-name-${id}`)?.value.trim();
  const dept = document.getElementById(`gli-edit-dept-${id}`)?.value || 'misc';
  const note = document.getElementById(`gli-edit-note-${id}`)?.value.trim() || null;
  if (!name) return;
  const { error } = await sb.from('grocery_items').update({ name, dept, note }).eq('id', id);
  if (error) { showToast('Error: ' + error.message); return; }
  groceryEditingId = null;
  await loadGroceryItems();
}

// ── Quick-add sub-sheet ───────────────────────────────────────────────────────
function openQuickAddSheet() {
  groceryQaSelected = new Map();
  for (const gi of groceryListItems) {
    const catalogItem = GROCERY_ITEMS.find(ci => ci.name.toLowerCase() === gi.name.toLowerCase());
    if (catalogItem) groceryQaSelected.set(gi.name.toLowerCase(), { ...catalogItem });
  }
  document.getElementById('groceryQaSearch').value = '';
  document.getElementById('groceryQaSheet').classList.add('open');
  renderQuickAddGrid();
  renderQaActionButton();
}

function closeQuickAddSheet() {
  closeConfirmPanel();
  document.getElementById('groceryQaSheet')?.classList.remove('open');
  groceryQaSelected = new Map();
}

function onQaSearch() {
  clearTimeout(groceryDebounce);
  groceryDebounce = setTimeout(renderQuickAddGrid, 150);
}

function renderQuickAddGrid() {
  const body = document.getElementById('groceryQaBody');
  if (!body) return;
  const q = (document.getElementById('groceryQaSearch')?.value || '').trim();
  const chips = q ? searchGroceryItems(q, 12) : getGridItems();
  const deptSelectOptions = GROCERY_DEPARTMENTS.map(d => `<option value="${d.key}">${d.emoji} ${d.label}</option>`).join('');
  let html = '';
  if (chips.length) {
    html += `<div class="grocery-qa-section-label">${q ? 'Results' : 'Quick Add'}</div>`;
    html += '<div class="grocery-chip-grid">' + chips.map(item => groceryChipHTML(item)).join('') + '</div>';
  }
  if (q && !chips.length) {
    html += `<div class="grocery-qa-section-label">Add Custom</div>
      <div class="grocery-custom-section">
        <div class="grocery-custom-add-row">
          <input type="text" class="grocery-custom-input" id="groceryCustomName" value="${q.replace(/"/g,'&quot;')}" placeholder="Item name..."/>
          <select class="grocery-custom-dept" id="groceryCustomDept">${deptSelectOptions}</select>
          <button class="grocery-custom-add-btn" onclick="addCustomGroceryItem()">Add</button>
        </div>
      </div>`;
  }
  if (!q) {
    html += `<div class="grocery-qa-section-label">Add Custom</div>
      <div class="grocery-custom-section">
        <div class="grocery-custom-add-row">
          <input type="text" class="grocery-custom-input" id="groceryCustomName" placeholder="Item name..."/>
          <select class="grocery-custom-dept" id="groceryCustomDept">${deptSelectOptions}</select>
          <button class="grocery-custom-add-btn" onclick="addCustomGroceryItem()">Add</button>
        </div>
      </div>`;
  }
  body.innerHTML = html;
}

function escAttr(s) {
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function groceryChipHTML(item) {
  const key = item.name.toLowerCase();
  const isSelected = groceryQaSelected.has(key);
  return `<div class="grocery-chip${isSelected?' selected':''}" onclick="toggleQaChip(this)" data-name="${escAttr(item.name)}" data-dept="${escAttr(item.dept)}" data-emoji="${escAttr(item.emoji)}" data-qty="${item.defaultQty}" data-unit="${escAttr(item.defaultUnit)}">
    ${isSelected ? '<span class="grocery-chip-check">✓</span>' : ''}
    <span class="grocery-chip-emoji">${item.emoji}</span>
    <span class="grocery-chip-name">${item.name}</span>
  </div>`;
}

function toggleQaChip(el) {
  const { name, dept, emoji, unit } = el.dataset;
  const defaultQty = parseFloat(el.dataset.qty);
  const key = name.toLowerCase();
  if (groceryQaSelected.has(key)) {
    groceryQaSelected.delete(key);
  } else {
    groceryQaSelected.set(key, { name, dept, emoji, defaultQty, defaultUnit: unit });
  }
  renderQuickAddGrid();
  renderQaActionButton();
}

function computeDiff() {
  const adding = [];
  for (const [key, item] of groceryQaSelected) {
    if (!groceryListItems.some(gi => gi.name.toLowerCase() === key)) adding.push(item);
  }
  const removing = groceryListItems.filter(gi => !gi.is_custom && !groceryQaSelected.has(gi.name.toLowerCase()));
  return { adding, removing };
}

function renderQaActionButton() {
  const btn = document.getElementById('groceryQaActionBtn');
  if (!btn) return;
  const diff = computeDiff();
  const addCount = diff.adding.length;
  const removeCount = diff.removing.length;
  const total = addCount + removeCount;
  if (total === 0) {
    btn.disabled = true;
    btn.textContent = 'Add Items';
  } else {
    btn.disabled = false;
    const parts = [];
    if (addCount) parts.push(`Add ${addCount}`);
    if (removeCount) parts.push(`Remove ${removeCount}`);
    btn.textContent = parts.join(', ') + (total === 1 ? ' Item' : ' Items');
  }
}

async function submitQuickAdd() {
  if (grocerySubmitting) return;
  const diff = computeDiff();
  if (diff.removing.length > 0) {
    openConfirmPanel(diff);
  } else {
    const btn = document.getElementById('groceryQaActionBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Adding...'; }
    await applyDiff(diff);
    closeQuickAddSheet();
  }
}

function openConfirmPanel(diff) {
  groceryPendingDiff = diff;
  let html = '';
  if (diff.adding.length) {
    html += '<div class="grocery-confirm-section-label adding">Adding</div><div class="grocery-confirm-pills">';
    html += diff.adding.map(item => `<span class="grocery-confirm-pill adding">${item.emoji} ${item.name}</span>`).join('');
    html += '</div>';
  }
  if (diff.removing.length) {
    html += '<div class="grocery-confirm-section-label removing">Removing</div><div class="grocery-confirm-pills">';
    html += diff.removing.map(gi => `<span class="grocery-confirm-pill removing">${gi.emoji || getDept(gi.dept)?.emoji || '🛒'} ${gi.name}</span>`).join('');
    html += '</div>';
  }
  document.getElementById('groceryConfirmBody').innerHTML = html;
  document.getElementById('groceryConfirmSheet').classList.add('open');
}

function closeConfirmPanel() {
  document.getElementById('groceryConfirmSheet')?.classList.remove('open');
  groceryPendingDiff = null;
}

async function applyDiff(diff) {
  if (grocerySubmitting) return;
  grocerySubmitting = true;
  const confirmBtn = document.querySelector('#groceryConfirmSheet .grocery-confirm-btn');
  if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.textContent = 'Applying...'; }
  const d = diff || groceryPendingDiff;
  if (!d) { grocerySubmitting = false; return; }
  const task = items.find(i => i.id === groceryTaskId);
  const hhId = task?.householdId || currentHousehold?.id || null;
  if (d.adding.length) {
    const rows = d.adding.map(item => ({
      task_id: groceryTaskId,
      household_id: hhId,
      name: item.name,
      dept: item.dept,
      qty: item.defaultQty || 1,
      unit: item.defaultUnit || 'count',
      checked: false,
      added_by: currentUser.id,
      is_custom: false,
    }));
    const { error } = await sb.from('grocery_items').insert(rows);
    if (error) { grocerySubmitting = false; showToast('Error: ' + error.message); return; }
  }
  if (d.removing.length) {
    const ids = d.removing.map(gi => gi.id);
    const { error } = await sb.from('grocery_items').update({ status: 'deleted' }).in('id', ids);
    if (error) { grocerySubmitting = false; showToast('Error: ' + error.message); return; }
  }
  await loadGroceryItems();
  grocerySubmitting = false;
  closeQuickAddSheet();
}

// ── List item controls ────────────────────────────────────────────────────────
async function toggleGroceryItem(id) {
  const gi = groceryListItems.find(g => g.id == id);
  if (!gi) return;
  const newVal = !gi.checked;
  const { error } = await sb.from('grocery_items').update({ checked: newVal }).eq('id', id);
  if (error) { showToast('Error: ' + error.message); return; }
  gi.checked = newVal;
  renderGroceryListView();
}

async function cycleGroceryUnit(id, currentUnit) {
  const gi = groceryListItems.find(g => g.id == id);
  if (!gi) return;
  const newUnit = currentUnit === 'weight' ? 'count' : 'weight';
  const { error } = await sb.from('grocery_items').update({ unit: newUnit }).eq('id', id);
  if (error) { showToast('Error: ' + error.message); return; }
  gi.unit = newUnit;
  renderGroceryListView();
}

async function adjustGroceryQty(id, delta) {
  const gi = groceryListItems.find(g => g.id == id);
  if (!gi) return;
  const isWeight = gi.unit === 'weight';
  const min = isWeight ? 0.5 : 1;
  const newQty = Math.max(min, +(((gi.qty || 1) + delta).toFixed(2)));
  const { error } = await sb.from('grocery_items').update({ qty: newQty }).eq('id', id);
  if (error) { showToast('Error: ' + error.message); return; }
  gi.qty = newQty;
  const input = document.getElementById('gli-qty-' + id);
  if (input) input.value = newQty;
}

async function editGroceryQtyDirect(id, val) {
  const gi = groceryListItems.find(g => g.id == id);
  if (!gi) return;
  const parsed = parseFloat(val);
  if (isNaN(parsed) || parsed <= 0) return;
  const newQty = +(parsed.toFixed(2));
  const { error } = await sb.from('grocery_items').update({ qty: newQty }).eq('id', id);
  if (error) { showToast('Error: ' + error.message); return; }
  gi.qty = newQty;
}

async function setGrocerySize(id, size) {
  const gi = groceryListItems.find(g => g.id == id);
  if (!gi) return;
  const newSize = gi.size === size ? null : size;
  const { error } = await sb.from('grocery_items').update({ size: newSize }).eq('id', id);
  if (error) { showToast('Error: ' + error.message); return; }
  gi.size = newSize;
  const row = document.getElementById('gli-' + id);
  if (row) row.querySelectorAll('.grocery-size-pill').forEach(pill => {
    pill.classList.toggle('active', pill.textContent === newSize);
  });
}

async function quickAddCustomItem() {
  const input = document.getElementById('groceryQuickInput');
  const deptEl = document.getElementById('groceryQuickDept');
  const name = input?.value.trim();
  if (!name) return;
  const already = groceryListItems.some(g => g.name.toLowerCase() === name.toLowerCase());
  if (already) { showToast(`${name} is already on the list`); return; }
  const dept = deptEl?.value || 'misc';
  const task = items.find(i => i.id === groceryTaskId);
  const { error } = await sb.from('grocery_items').insert({
    task_id: groceryTaskId,
    household_id: task?.householdId || currentHousehold?.id || null,
    name, dept, qty: 1, unit: 'count', checked: false,
    added_by: currentUser.id,
    is_custom: true,
  });
  if (error) { showToast('Error: ' + error.message); return; }
  if (input) input.value = '';
  await loadGroceryItems();
}

async function removeGroceryItem(id) {
  const { error } = await sb.from('grocery_items').update({ status: 'deleted' }).eq('id', id);
  if (error) { showToast('Error: ' + error.message); return; }
  groceryListItems = groceryListItems.filter(g => g.id !== id);
  renderGroceryListView();
}

async function addCustomGroceryItem() {
  const nameEl = document.getElementById('groceryCustomName');
  const deptEl = document.getElementById('groceryCustomDept');
  const name = nameEl?.value.trim();
  if (!name) return;
  const dept = deptEl?.value || 'misc';
  const already = groceryListItems.some(g => g.name.toLowerCase() === name.toLowerCase());
  if (already) { showToast(`${name} is already on the list`); return; }
  const task = items.find(i => i.id === groceryTaskId);
  const { error } = await sb.from('grocery_items').insert({
    task_id: groceryTaskId,
    household_id: task?.householdId || currentHousehold?.id || null,
    name, dept, qty: 1, unit: 'count', checked: false,
    added_by: currentUser.id,
    is_custom: true,
  });
  if (error) { showToast('Error: ' + error.message); return; }
  if (nameEl) nameEl.value = '';
  await loadGroceryItems();
  renderQaActionButton();
}

async function completeGroceryTask() {
  if (!groceryTaskId) return;
  const id = groceryTaskId;
  closeGroceryPanel();
  await completeItem(id);
}

// ─── CHORE PANEL (inline) ─────────────────────────────────────────────────────
async function loadAndRenderChorePanel(taskId) {
  const el = document.getElementById(`chorepanel-${taskId}`);
  if (!el) return;
  choreListItems = await loadChoreItems(taskId);
  const item = items.find(i => i.id == taskId);
  if (item) { item._choreTotal = choreListItems.length; item._choreDone = choreListItems.filter(c=>c.done).length; }
  el.innerHTML = renderChorePanelHTML(taskId);
}

function renderChorePanelHTML(taskId) {
  const done = choreListItems.filter(c=>c.done).length;
  const total = choreListItems.length;
  if (!total) return `<div style="color:var(--accent-soft);font-size:13px;padding:.25rem 0">No items yet.</div>
    <div class="chore-panel-actions">
      <button class="chore-edit-list-btn" onclick="openChoreEditSheet('${taskId}','add')">＋ Add Items</button>
      <button class="chore-panel-del" onclick="deleteChoreTask('${taskId}')">🗑</button>
    </div>`;
  const rows = choreListItems.map(ci => `
    <div class="chore-cl-item">
      <div class="chore-cl-check${ci.done?' done':''}" data-ci="${ci.id}" onclick="toggleChoreItem('${ci.id}',${!ci.done},'${taskId}')">
        ${ci.done?`<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><polyline points="1.5,5.5 4.5,8.5 9.5,2.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`:''}
      </div>
      <span class="chore-cl-name${ci.done?' done':''}">${ci.name}</span>
    </div>`).join('');
  const task = items.find(i => i.id == taskId);
  const noteVal = (task?.note || '').replace(/"/g, '&quot;');
  return `<div class="chore-panel-header"><span class="chore-panel-title">Chore List</span><span class="chore-panel-progress">${done}/${total} done</span></div>
    ${rows}
    <input class="item-note-input" value="${noteVal}" placeholder="Add a note…" onblur="saveItemNote('${taskId}',this.value)" onkeydown="if(event.key==='Enter')this.blur()">
    <div class="chore-panel-actions">
      <button class="chore-all-done-btn" onclick="completeChoreTask('${taskId}')">✓ All Done</button>
      <button class="chore-edit-list-btn" onclick="openChoreEditSheet('${taskId}','edit')">✎ Edit</button>
      <button class="chore-panel-del" onclick="deleteChoreTask('${taskId}')">🗑</button>
    </div>`;
}

async function toggleChoreItem(choreItemId, done, taskId) {
  const ci = choreListItems.find(c => c.id == choreItemId);
  if (!ci) return;
  ci.done = done;
  await toggleChoreItemDone(choreItemId, done);
  const item = items.find(i => i.id == taskId);
  if (item) { item._choreDone = choreListItems.filter(c=>c.done).length; renderBadge(taskId); }
  const el = document.getElementById(`chorepanel-${taskId}`);
  if (el) el.innerHTML = renderChorePanelHTML(taskId);
  if (choreListItems.length && choreListItems.every(c=>c.done)) {
    setTimeout(() => { if (confirm('All items done! Mark this chore list complete?')) completeChoreTask(taskId); }, 200);
  }
}

async function completeChoreTask(taskId) {
  if (expandedId == taskId) expandedId = null;
  await completeItem(taskId);
}

async function deleteChoreTask(taskId) {
  const item = items.find(i => i.id == taskId); if (!item) return;
  if (!confirm(`Delete "${item.name}"?`)) return;
  items = items.filter(i => i.id != taskId);
  await deleteItemFromDb(taskId);
  expandedId = null;
  showToast('🗑 Deleted');
  render();
}

// ─── CHORE EDIT SHEET ─────────────────────────────────────────────────────────
async function openChoreEditSheet(taskId, mode = 'add') {
  choreTaskId = taskId;
  choreEditMode = mode;
  choreEditSelected = new Set();
  if (mode === 'edit') {
    choreListItems = await loadChoreItems(taskId);
    choreListItems.forEach(ci => choreEditSelected.add(ci.name));
  }
  const task = items.find(i => i.id == taskId);
  document.getElementById('choreEditTitle').textContent = mode === 'edit' ? 'Edit List' : 'Add Items';
  renderChoreEditBody();
  updateChoreEditCTA();
  document.getElementById('choreEditBg').classList.add('open');
}

function closeChoreEditSheet() {
  document.getElementById('choreEditBg').classList.remove('open');
  document.getElementById('choreConfirmSheet').classList.remove('open');
  choreTaskId = null; choreListItems = []; choreEditSelected = new Set();
}

function bgClickChoreEdit(e) {
  if (e.target === document.getElementById('choreEditBg')) closeChoreEditSheet();
}

function closeChoreConfirmSheet() {
  document.getElementById('choreConfirmSheet').classList.remove('open');
}

function renderChoreEditBody() {
  const el = document.getElementById('choreEditBody');
  const sel = choreEditSelected;
  function pill(item, isRoom) {
    const active = sel.has(item.name) ? ' selected' : '';
    const cls = isRoom ? 'chore-pill chore-room-pill' : 'chore-pill';
    return `<button class="${cls}${active}" onclick="toggleChoreEditItem(this,'${item.name.replace(/'/g,"\\'")}')">
      <span class="chore-pill-emoji">${item.emoji}</span>
      <span class="${isRoom?'chore-room-label':'chore-pill-name'}">${item.name}</span>
    </button>`;
  }
  el.innerHTML = `
    <div class="chore-section-label">Rooms</div>
    <div class="chore-room-grid">${CHORE_ROOMS.map(r=>pill(r,true)).join('')}</div>
    <div class="chore-section-label">Indoor Chores</div>
    <div class="chore-item-grid">${CHORE_INDOOR.map(r=>pill(r,false)).join('')}</div>
    <div class="chore-section-label">Outdoor Chores</div>
    <div class="chore-item-grid">${CHORE_OUTDOOR.map(r=>pill(r,false)).join('')}</div>
    <div class="chore-section-label">Custom</div>
    <div class="chore-custom-row">
      <input class="chore-custom-input" id="choreCustomInput" type="text" placeholder="Add a chore…" onkeydown="if(event.key==='Enter')addCustomChore()"/>
      <button class="chore-custom-btn" onclick="addCustomChore()">Add</button>
    </div>`;
}

function toggleChoreEditItem(el, name) {
  if (choreEditSelected.has(name)) { choreEditSelected.delete(name); el.classList.remove('selected'); }
  else { choreEditSelected.add(name); el.classList.add('selected'); }
  updateChoreEditCTA();
}

function addCustomChore() {
  const inp = document.getElementById('choreCustomInput');
  const name = inp?.value.trim(); if (!name) return;
  choreEditSelected.add(name);
  inp.value = '';
  renderChoreEditBody();
  updateChoreEditCTA();
}

function updateChoreEditCTA() {
  const btn = document.getElementById('choreEditActionBtn');
  if (choreEditMode === 'add') {
    const count = choreEditSelected.size;
    btn.disabled = count === 0;
    btn.textContent = count === 0 ? 'Add Items' : `Add ${count} Item${count!==1?'s':''}`;
  } else {
    const existing = new Set(choreListItems.map(ci => ci.name));
    const adding = [...choreEditSelected].filter(n => !existing.has(n));
    const removing = choreListItems.filter(ci => !choreEditSelected.has(ci.name));
    const count = adding.length + removing.length;
    btn.disabled = count === 0;
    if (count === 0) btn.textContent = 'No Changes';
    else if (adding.length && removing.length) btn.textContent = `Add ${adding.length}, Remove ${removing.length} Items`;
    else if (adding.length) btn.textContent = `Add ${adding.length} Item${adding.length!==1?'s':''}`;
    else btn.textContent = `Remove ${removing.length} Item${removing.length!==1?'s':''}`;
  }
}

async function applyChoreItems() {
  if (!choreTaskId) return;
  if (choreEditMode === 'edit') {
    const existing = new Set(choreListItems.map(ci => ci.name));
    const adding = [...choreEditSelected].filter(n => !existing.has(n));
    const removing = choreListItems.filter(ci => !choreEditSelected.has(ci.name));
    if (removing.length) {
      const confirmBody = document.getElementById('choreConfirmBody');
      confirmBody.innerHTML = (adding.length ? `<div class="grocery-confirm-section-label adding">Adding</div><div class="grocery-confirm-pills">${adding.map(n=>`<span class="grocery-confirm-pill adding">${n}</span>`).join('')}</div>` : '')
        + (removing.length ? `<div class="grocery-confirm-section-label removing">Removing</div><div class="grocery-confirm-pills">${removing.map(ci=>`<span class="grocery-confirm-pill removing">${ci.name}</span>`).join('')}</div>` : '');
      document.getElementById('choreConfirmSheet').classList.add('open');
      return;
    }
    await confirmChoreApply();
  } else {
    await confirmChoreApply();
  }
}

async function confirmChoreApply() {
  closeChoreConfirmSheet();
  const hhId = currentHousehold?.id || null;
  if (choreEditMode === 'edit') {
    const existing = new Set(choreListItems.map(ci => ci.name));
    const adding = [...choreEditSelected].filter(n => !existing.has(n));
    const removingIds = choreListItems.filter(ci => !choreEditSelected.has(ci.name)).map(ci => ci.id);
    if (removingIds.length) await deleteChoreItems(removingIds);
    if (adding.length) await insertChoreItems(choreTaskId, adding, hhId);
  } else {
    const names = [...choreEditSelected];
    if (names.length) await insertChoreItems(choreTaskId, names, hhId);
  }
  choreListItems = await loadChoreItems(choreTaskId);
  const item = items.find(i => i.id == choreTaskId);
  if (item) { item._choreTotal = choreListItems.length; item._choreDone = choreListItems.filter(c=>c.done).length; }
  closeChoreEditSheet();
  render();
  if (expandedId == choreTaskId) loadAndRenderChorePanel(choreTaskId);
}

// ─── VISIBILITY ───────────────────────────────────────────────────────────────
let _resuming = false;
let _hiddenAt = 0;
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) { _hiddenAt = Date.now(); return; }
  if (_resuming) return;
  if (!currentUser) { window.location.reload(); return; }

  const hiddenMs = _hiddenAt ? Date.now() - _hiddenAt : 0;

  // Full reload for long absences — Supabase client state likely broken
  if (hiddenMs > 3 * 60 * 1000) { window.location.reload(); return; }

  // Short tab switches — let Supabase reconnect naturally, don't interfere
  if (hiddenMs < 45 * 1000) return;

  // Medium absence: soft refresh — but don't call setupRealtime(), it causes
  // an unnecessary CLOSED/SUBSCRIBED cycle that breaks in-flight operations
  _resuming = true;
  showToast('Refreshing…', false, 1500);
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.user) { showAuth(); return; }
    currentUser = session.user;
    await loadItems();
    render();
    if (groceryTaskId) { loadGroceryItems(); subscribeGrocery(groceryTaskId); }
  } finally {
    _resuming = false;
  }
});

// ─── BOOT ─────────────────────────────────────────────────────────────────────
initTheme();
initBgColor();
updatePreview();
initAuth();
document.getElementById('appVersion').textContent = typeof APP_VERSION !== 'undefined' ? 'v' + APP_VERSION : '';
