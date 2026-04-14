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

function getDueDate(item) {
  if (item.type==='event'||item.type==='oneTime') return new Date((item.date||isoToday())+'T00:00:00');
  if (item.type==='weekday') return nextFromDays(item.weekdays||[1], item.lastDone===isoToday()?1:0);
  if (item.type==='monthly') return new Date((item.lastDone||isoToday())+'T00:00:00');
  const l = new Date(item.lastDone+'T00:00:00');
  const d = new Date(l); d.setDate(d.getDate()+(item.days||0)); return d;
}

function daysUntil(item) { return dateDiff(today, getDueDate(item)); }

// Is item snoozed?
function isSnoozed(item) {
  if (item.status !== 'snoozed') return false;
  if (!item.altDueDate) return false;
  const snoozeDate = new Date(item.altDueDate + 'T00:00:00');
  return snoozeDate > today;
}

// Tab filtering
function itemVisibleInTab(item, tabName) {
  // Snoozed items never show
  if (isSnoozed(item)) return false;
  // Dismissed items never show (they will reappear when due again naturally)
  if (item.status === 'cancelled') return false;

  const d = daysUntil(item);
  const due = getDueDate(item);

  if (tabName === 'today') {
    // Show overdue and due today (events included)
    return d <= 0;
  }
  if (tabName === 'week') {
    // Rolling 7 days from today — events always show if within window or overdue
    return due <= rollingWeekEnd();
  }
  if (tabName === 'month') {
    // Rolling 30 days from today — events always show if within window or overdue
    return due <= rollingMonthEnd();
  }
  return true;
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
  const cl = item.checklist||[];
  if (cl.length>0 && expandedId===item.id) {
    const done=cl.filter(c=>c.done).length;
    return `<span class="badge progress">${done}/${cl.length}</span>`;
  }
  const d = daysUntil(item);
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
function subFor(item) {
  const wd=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const timeStr = item.startTime ? ` · ${fmtTime(item.startTime)}${item.endTime?' – '+fmtTime(item.endTime):''}` : '';
  if (item.type==="interval") {
    const lastDone = new Date(item.lastDone+"T00:00:00");
    const nextDue = getDueDate(item);
    return `Completed ${fmtDate(lastDone)} · Next due ${fmtDate(nextDue)}${timeStr}`;
  }
  if (item.type==="weekday") return `Every ${(item.weekdays||[]).map(d=>wd[d]).join(", ")} · Next due ${fmtDate(getDueDate(item))}${timeStr}`;
  // event
  const due = getDueDate(item);
  return due.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})+timeStr;
}
function iconFor(item) {
  if (item.type === 'event') return item.eventIcon || '📅';
  if (item.isUrgent) return '<span class="type-dot dot-urgent"></span>';
  if (item.startTime) return '<span class="type-icon">🕐</span>';
  return '<span class="type-dot dot-task"></span>';
}
function dotClass(t) { return t==='interval'?'dot-interval':t==='weekday'?'dot-weekday':'dot-event'; } // kept for compat

// ─── TOAST ────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2400);
}

// ─── ITEM ACTIONS ─────────────────────────────────────────────────────────────
let tab="today", expandedId=null, itemType="interval", selectedWeekdays=[1];

async function completeItem(id) {
  const item = items.find(i=>i.id===id); if (!item) return;
  if (item.checklist) item.checklist.forEach(c=>c.done=false);
  item.altDueDate = null;

  if (item.type==='interval') {
    // Reset countdown but hide from today — it'll reappear when due
    item.lastDone = isoToday();
    showToast('✓ Done — see you in ' + fmtInterval(item.days).toLowerCase().replace('every ',''));
    await persistItem(item);
  } else if (item.type==='weekday') {
    item.lastDone = isoToday();
    const nextDay = nextFromDays(item.weekdays||[1], 1);
    const daysAway = Math.round((nextDay - today) / 86400000);
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][nextDay.getDay()];
    const seeYou = daysAway === 1 ? 'tomorrow' : daysAway <= 6 ? dayName : daysAway === 7 ? 'next week' : `in ${daysAway} days`;
    showToast(`✓ Done — see you ${seeYou}`);
    await persistItem(item);
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
  } else {
    // One-time item or event — delete it
    items = items.filter(i=>i.id!==id);
    await deleteItemFromDb(id);
    showToast('✓ Done');
  }
  if (expandedId===id) expandedId=null;
  setTimeout(render, 50);
}

// ─── SNOOZE SHEET ─────────────────────────────────────────────────────────────
let snoozeTargetId = null;
let snoozeDays = 1;

function openSnoozeSheet(id) {
  const item = items.find(i=>i.id===id); if (!item) return;
  snoozeTargetId = id;
  snoozeDays = 1;
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
  snoozeDays = Math.max(1, snoozeDays + delta);
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

function toggleExpand(id) {
  expandedId = expandedId===id ? null : id;
  render();
  if (expandedId === id) {
    const item = items.find(i=>i.id===id);
    if (item?.type === 'event') loadEventPanel(id);
  }
}

async function toggleCheck(id,idx) {
  const item=items.find(i=>i.id===id); if (!item) return;
  item.checklist[idx].done=!item.checklist[idx].done;
  await persistItem(item); renderChecklist(id); renderBadge(id);
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

async function deleteItem(id) {
  const item=items.find(i=>i.id===id); if (!item) return;
  if (!confirm(`Delete "${item.name}"?`)) return;
  items=items.filter(i=>i.id!==id);
  await deleteItemFromDb(id);
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
    document.getElementById("fEventEndDate").value="";
    document.getElementById("fEventEndTime").value=item.endTime||"";
    document.getElementById("btnEventSave").disabled=false;
    document.getElementById("btnEventSave").onclick=async function(){
      item.name=document.getElementById("fEventName").value.trim(); if(!item.name) return;
      item.date=document.getElementById("fEventStartDate").value;
      item.startTime=document.getElementById("fEventStartTime").value||null;
      item.endTime=document.getElementById("fEventEndTime").value||null;
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

  const isRecurring = item.type==='interval'||item.type==='weekday'||item.type==='monthly';
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
  return `<div class="cl-header"><span class="cl-title">Checklist</span><span class="cl-progress">${done}/${cl.length} done</span></div>`
    +rows
    +`<div class="cl-add"><input id="clinput-${item.id}" type="text" placeholder="Add item..." onkeydown="if(event.key==='Enter')addCheckItem('${item.id}')"/><button onclick="addCheckItem('${item.id}')">Add</button></div>`
    +(done>0?`<div class="cl-reset" onclick="resetChecklist('${item.id}')">Reset all</div>`:'')+`<div class="cl-item-actions"><button class="cl-action-btn cl-action-edit" onclick="editItem('${item.id}')">✏️ Edit</button><button class="cl-action-btn cl-action-delete" onclick="deleteItem('${item.id}')">🗑 Delete</button></div>`;
}

function rowHTML(item, isOverdue) {
  const exp=expandedId===item.id;
  const isEvent = item.type === 'event';
  // Events don't show avatar or swipe — they expand on tap
  const avatarHTML = (currentHousehold && !isEvent) ? itemAvatarHTML(item.assignedTo || item.createdBy, item.id) : '';
  const itemStyle = isEvent ? 'position:relative;cursor:pointer;' : exp ? 'position:relative;border-bottom-left-radius:0;border-bottom-right-radius:0;' : 'position:absolute;inset:0;cursor:grab;';
  const itemClick = (isEvent || exp) ? `onclick="toggleExpand('${item.id}')"` : '';
  const itemClass = `item${isOverdue?' overdue':''}${exp?' held':''}${(exp||isEvent)?'':' swipeable'}`;
  return `<div class="row-outer" id="outer-${item.id}">
    <div class="row-wrap${exp?' expanded':''}" id="wrap-${item.id}">
      ${(!exp && !isEvent)?`<div class="row-bg">
        <div class="bg-complete"><span class="bg-label" id="lc-${item.id}">✓ Complete</span></div>
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
      ${exp?(isEvent?`<div class="event-panel" id="evpanel-${item.id}">Loading...</div>`:`<div class="checklist-panel" id="clpanel-${item.id}">${clHTML(item)}</div>`):''}
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

  // Sort: urgent first, then timed (by time), then untimed (by due date)
  const sorted = [...filtered].sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    const aHasTime = !!(a.startTime);
    const bHasTime = !!(b.startTime);
    if (aHasTime && bHasTime) return a.startTime.localeCompare(b.startTime);
    if (aHasTime && !bHasTime) return -1;
    if (!aHasTime && bHasTime) return 1;
    return daysUntil(a) - daysUntil(b);
  });
  const overdue = sorted.filter(i => daysUntil(i) < 0 && i.type !== 'event');
  const rest = sorted.filter(i => !(daysUntil(i) < 0 && i.type !== 'event'));

  let html = '';

  if (sorted.length === 0) {
    if (tab === 'today') {
      // Clean slate moment!
      html = `<div class="clean-slate">
        <div class="slate-icon">⚓</div>
        <div class="slate-title">You're tethered.</div>
        <div class="slate-sub">Nothing left for today.<br>Rest easy — you've got this.</div>
      </div>`;
    } else {
      html = `<div class="empty-state"><div class="empty-icon">⚓</div><p>Nothing due ${tab === 'week' ? 'this week' : 'this month'}.<br>You're ahead of the game.</p></div>`;
    }
  } else {
    if (overdue.length) { html += `<div class="section-label">Overdue</div>`; overdue.forEach(i => html += rowHTML(i, true)); }
    if (rest.length) { if (overdue.length) html += `<div class="section-label">Upcoming</div>`; rest.forEach(i => html += rowHTML(i, false)); }
  }

  el.innerHTML = html;
  el.querySelectorAll('.item[data-id]').forEach(attachSwipe);
}

// ─── SWIPE ────────────────────────────────────────────────────────────────────
function attachSwipe(el) {
  const id=el.dataset.id;
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
    if(curX>THRESHOLD){el.classList.add('completing');setTimeout(()=>completeItem(id),220);}
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
  onDueDateChange();
  validateForm();
  document.getElementById("taskModalBg").classList.add("open");
  setTimeout(()=>document.getElementById("fName").focus(),300);
}
function closeTaskModal(){ document.getElementById("taskModalBg").classList.remove("open"); }
function bgClickTask(e){ if(e.target===document.getElementById("taskModalBg")) closeTaskModal(); }
function closeModal(){ closeTaskModal(); }
function bgClick(e){ bgClickTask(e); }

function toggleRecurring(){
  const on = document.getElementById("fRecurring").checked;
  document.getElementById("recurringSection").style.display = on ? "" : "none";
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
  }
  preview.textContent=text;
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
  const date=document.getElementById("fDueDate")?.value;
  const valid=!!(name && date);
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
  }

  const item={
    name, type, checklist:[], status:'active',
    days, lastDone, weekdays, weekInterval, monthDay, monthWeek, monthWeekday,
    date,
    startTime:document.getElementById("fTaskTime")?.value||null,
    isUrgent:document.getElementById("fUrgent")?.checked||false,
  };

  closeTaskModal();
  await persistItem(item);
  if(item._dbId){items.push(item);showToast(`⚓ "${name}" added`);}
  btnSave.disabled=false; btnSave.textContent="Add Task";
  render();
}

let selectedEventIcon="📅";
function openEventModal(){
  closeChooser();
  selectedEventIcon="📅";
  document.getElementById("fEventName").value="";
  document.getElementById("fEventStartDate").value=isoToday();
  document.getElementById("fEventStartTime").value="";
  document.getElementById("fEventEndDate").value="";
  document.getElementById("fEventEndTime").value="";
  document.querySelectorAll(".event-icon-pill").forEach(p=>p.classList.toggle("active",p.dataset.icon==="📅"));
  validateEventForm();
  document.getElementById("eventModalBg").classList.add("open");
  setTimeout(()=>document.getElementById("fEventName").focus(),300);
}
function closeEventModal(){ document.getElementById("eventModalBg").classList.remove("open"); }
function bgClickEventModal(e){ if(e.target===document.getElementById("eventModalBg")) closeEventModal(); }
function selectEventIcon(icon,el){
  selectedEventIcon=icon;
  document.querySelectorAll(".event-icon-pill").forEach(p=>p.classList.remove("active"));
  el.classList.add("active");
}
function validateEventForm(){
  const name=document.getElementById("fEventName").value.trim();
  const date=document.getElementById("fEventStartDate").value;
  const time=document.getElementById("fEventStartTime").value;
  document.getElementById("btnEventSave").disabled=!(name&&date&&time);
}
async function saveEvent(){
  const name=document.getElementById("fEventName").value.trim(); if(!name) return;
  const btn=document.getElementById("btnEventSave");
  btn.disabled=true; btn.textContent="Saving...";
  const item={
    name,type:"event",checklist:[],status:'active',
    date:document.getElementById("fEventStartDate").value,
    startTime:document.getElementById("fEventStartTime").value||null,
    endTime:document.getElementById("fEventEndTime").value||null,
    eventIcon:selectedEventIcon,
    isUrgent:false,
  };
  closeEventModal();
  await persistItem(item);
  if(item._dbId){items.push(item);showToast(`${selectedEventIcon} "${name}" added`);}
  btn.disabled=false; btn.textContent="Add Event";
  render();
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
    .limit(1);

  if (invites && invites.length > 0) {
    pendingInvite = invites[0];
    const householdName = invites[0].households?.name || 'a household';
    document.getElementById('inviteBannerSub').textContent = `Invited to join "${householdName}"`;
    document.getElementById('inviteBanner').classList.add('show');
    document.getElementById('notifBadge').classList.add('show');
  } else {
    pendingInvite = null;
    document.getElementById('inviteBanner').classList.remove('show');
    document.getElementById('notifBadge').classList.remove('show');
  }
}

async function acceptPendingInvite() {
  if (!pendingInvite) return;
  // Update invite status
  await sb.from('household_invites')
    .update({ status: 'accepted' })
    .eq('id', pendingInvite.id);
  // Add to household members
  await sb.from('household_members')
    .insert({ household_id: pendingInvite.household_id, user_id: currentUser.id, role: 'member' });
  pendingInvite = null;
  document.getElementById('inviteBanner').classList.remove('show');
  document.getElementById('notifBadge').classList.remove('show');
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
  document.getElementById('notifBadge').classList.remove('show');
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
    // Clean up the orphaned household
    await sb.from('households').delete().eq('id', hh.id);
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
    // No household yet — show create form
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

  // Load pending outbound invites
  const { data: pendingInvites } = await sb.from('household_invites')
    .select('invited_email, status')
    .eq('household_id', currentHousehold.id)
    .eq('status', 'pending');

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

  const pendingHTML = pendingInvites && pendingInvites.length > 0
    ? pendingInvites.map(i => `
        <div class="pending-invite-row">
          <div class="pending-invite-email">${i.invited_email}</div>
          <div class="pending-invite-tag">Pending</div>
        </div>`).join('')
    : '';

  el.innerHTML = `
    <div class="household-title">${currentHousehold.name}</div>
    <div class="household-section-title">Members (${householdMembers.length})</div>
    <div class="member-list">${membersHTML}</div>
    ${pendingHTML ? `<div class="household-section-title">Pending Invites</div><div>${pendingHTML}</div>` : ''}
    <hr style="border:none;border-top:0.5px solid #EEEDFE;margin:1rem 0"/>
    <div class="household-section-title">Invite Someone</div>
    <div class="invite-input-row">
      <input type="email" id="inviteEmailInput" placeholder="their@email.com" autocomplete="off"/>
      <button onclick="handleSendInvite()">Send</button>
    </div>`;
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
  const panel = document.getElementById('evpanel-' + itemId);
  if (!panel) return;

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
  const collapsed = eventBringCollapsed[itemId] !== false; // default collapsed if items exist

  // RSVP section
  const rsvpHTML = `
    <div class="event-rsvp-row">
      <button class="rsvp-btn accept${myRsvp?.rsvp_status==='accepted'?' active-accept':''}" onclick="rsvpEvent('${itemId}','accepted')">✓ Going</button>
      <button class="rsvp-btn decline${myRsvp?.rsvp_status==='declined'?' active-decline':''}" onclick="rsvpEvent('${itemId}','declined')">✕ Can't make it</button>
    </div>`;

  // Attendees section
  const attendeesHTML = guests.length > 0 ? `
    <div class="event-section-title">Attendees (${guests.filter(g=>g.rsvp_status==='accepted').length} going)</div>
    <div class="attendee-list">
      ${guests.map(g => {
        const profile = guestProfiles.find(p => p.id === g.user_id) || {};
        const initials = getInitials(profile.display_name || profile.email || '?');
        const img = profile.avatar_url ? `<img src="${profile.avatar_url}" alt="${initials}"/>` : initials;
        const name = profile.display_name || profile.email?.split('@')[0] || 'Guest';
        const statusClass = g.rsvp_status === 'accepted' ? 'going' : g.rsvp_status === 'declined' ? 'declined' : 'pending';
        const statusLabel = g.rsvp_status === 'accepted' ? 'Going' : g.rsvp_status === 'declined' ? 'Declined' : 'Invited';
        return `<div class="attendee-row">
          <div class="attendee-avatar">${img}</div>
          <div class="attendee-name">${name}</div>
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
        const claimer = claim ? (householdMembers.find(m => m.user_id === claim.user_id)?.display_name?.split(' ')[0] || 'Someone') : null;
        return `<div class="bring-item">
          <div class="bring-item-name">${bi.name}</div>
          ${claimer ? `<div class="bring-item-claimer">${isMine ? '✓ You' : claimer}</div>` : ''}
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
    ${isOwner ? `<button class="event-action-btn event-action-delete" onclick="deleteItem('${itemId}')">🗑 Delete</button>` : ''}
  </div>`;

  panel.innerHTML = rsvpHTML + (attendeesHTML || '') + bringHTML + actionsHTML;
}

function toggleBringList(itemId) {
  eventBringCollapsed[itemId] = !eventBringCollapsed[itemId];
  loadEventPanel(itemId);
}

async function rsvpEvent(itemId, status) {
  // Check if already RSVPd
  const { data: existing } = await sb.from('event_guests')
    .select('id, rsvp_status')
    .eq('item_id', itemId)
    .eq('user_id', currentUser.id)
    .limit(1);

  if (existing && existing.length > 0) {
    // Update existing
    await sb.from('event_guests')
      .update({ rsvp_status: status, responded_at: new Date().toISOString() })
      .eq('id', existing[0].id);
  } else {
    // Insert new
    await sb.from('event_guests')
      .insert({ item_id: itemId, user_id: currentUser.id, rsvp_status: status, responded_at: new Date().toISOString() });
  }
  showToast(status === 'accepted' ? '✓ You\'re going!' : 'Noted — you can\'t make it');
  loadEventPanel(itemId);
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

// ─── BOOT ─────────────────────────────────────────────────────────────────────
updatePreview();
initAuth();
document.getElementById('appVersion').textContent = typeof APP_VERSION !== 'undefined' ? 'v' + APP_VERSION : '';
