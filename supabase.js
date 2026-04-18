// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL  = 'https://gnudccfibmslzotaaerr.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudWRjY2ZpYm1zbHpvdGFhZXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NjE2ODAsImV4cCI6MjA5MTIzNzY4MH0.H0l8uLg4PmQWqosYdzjUwa4q0Xe-5ErtNR2XtUbW5OM';
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
let currentUser = null;

// ─── RSVP STATE ───────────────────────────────────────────────────────────────
// myRsvpMap[itemId] = { rsvp_status, note } — for events the user was invited to (not owner)
let myRsvpMap = {};

async function initAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) {
    await onSignedIn(session.user);
  } else {
    showAuth();
  }
  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') { showAuth(); return; }
    if (session?.user) await onSignedIn(session.user);
  });
}

async function onSignedIn(user) {
  currentUser = user;
  updateAvatar(user);
  await Promise.all([loadItems(), loadHousehold()]);
  await checkPendingInvites();
  document.getElementById('loadingScreen').classList.remove('open');
  document.getElementById('authScreen').classList.remove('open');
  document.getElementById('mainApp').style.display = '';
  render();
  setupRealtime();
}

function showAuth() {
  document.getElementById('loadingScreen').classList.remove('open');
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('authScreen').classList.add('open');
}

function updateAvatar(user) {
  const meta = user.user_metadata || {};
  const avatarEl = document.getElementById('avatarBtn');
  const menuAvatarEl = document.getElementById('menuAvatarLg');
  const initials = (meta.full_name || meta.name || user.email || '?')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('menuName').textContent = meta.full_name || meta.name || 'Tether user';
  document.getElementById('menuEmail').textContent = user.email || '';
  if (meta.avatar_url) {
    avatarEl.innerHTML = `<img src="${meta.avatar_url}" alt="avatar"/>`;
    menuAvatarEl.innerHTML = `<img src="${meta.avatar_url}" alt="avatar"/>`;
  } else {
    avatarEl.textContent = initials;
    menuAvatarEl.textContent = initials;
  }
}

async function signInWith(provider) {
  const { error } = await sb.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
  if (error) showToast('Sign-in failed: ' + error.message);
}

async function sendMagicLink() {
  const email = document.getElementById('magicEmail').value.trim();
  if (!email) return;
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname }
  });
  if (error) { showToast('Error: ' + error.message); return; }
  document.getElementById('magicSent').style.display = 'block';
  showToast('✉️ Check your email!');
}

async function signOut() {
  teardownRealtime();
  await sb.auth.signOut();
  items = []; currentUser = null;
  closeUserMenu(); showAuth();
}

// ─── USER MENU ────────────────────────────────────────────────────────────────
function openUserMenu() { document.getElementById('userMenuBg').classList.add('open'); }
function closeUserMenu() { document.getElementById('userMenuBg').classList.remove('open'); }
function bgClickMenu(e) { if (e.target === document.getElementById('userMenuBg')) closeUserMenu(); }

// ─── DATA (Supabase) ──────────────────────────────────────────────────────────
let items = [];

// ── Task mappers (tether_items) ───────────────────────────────────────────────
function dbRowToItem(row) {
  return {
    id: row.id,
    _dbId: row.id,
    name: row.name,
    type: row.type,
    status: row.status || 'active',
    days: row.days,
    lastDone: row.last_done,
    weekdays: row.weekdays,
    weekInterval: row.week_interval || 1,
    monthDay: row.month_day || null,
    monthWeek: row.month_week || null,
    monthWeekday: row.month_weekday !== null && row.month_weekday !== undefined ? row.month_weekday : null,
    date: row.date,
    dueDate: row.due_date || null,
    altDueDate: row.alt_due_date || null,
    checklist: row.checklist || [],
    householdId: row.household_id || null,
    assignedTo: row.assigned_to || null,
    createdBy: row.created_by || null,
    startTime: row.start_time || null,
    endTime: row.end_time || null,
    isUrgent: row.is_urgent || false,
    eventIcon: row.event_icon || null,
    yearInterval: row.year_interval || 1,
  };
}

function itemToDbRow(item) {
  return {
    user_id: currentUser.id,
    name: item.name,
    type: item.type,
    status: item.status || 'active',
    days: item.days || null,
    last_done: item.lastDone || null,
    weekdays: item.weekdays || null,
    week_interval: item.weekInterval || 1,
    month_day: item.monthDay || null,
    month_week: item.monthWeek || null,
    month_weekday: item.monthWeekday !== null && item.monthWeekday !== undefined ? item.monthWeekday : null,
    date: item.date || null,
    due_date: item.dueDate || null,
    alt_due_date: item.altDueDate || null,
    checklist: item.checklist || [],
    household_id: item.householdId || currentHousehold?.id || null,
    assigned_to: item.assignedTo || null,
    created_by: item.createdBy || currentUser.id,
    start_time: item.startTime || null,
    end_time: item.endTime || null,
    is_urgent: item.isUrgent || false,
    event_icon: item.eventIcon || null,
    year_interval: item.yearInterval || 1,
  };
}

// ── Event mappers (items) ─────────────────────────────────────────────────────
function dbRowToEvent(row) {
  return {
    id: row.id,
    _dbId: row.id,
    name: row.name,
    type: 'event',
    status: row.status || 'active',
    date: row.event_date || null,
    endDate: row.end_date || null,
    startTime: row.start_time || null,
    endTime: row.end_time || null,
    eventIcon: row.event_icon || null,
    householdId: row.household_id || null,
    createdBy: row.created_by || null,
    guestsCanInvite: row.guests_can_invite ?? true,
    allowAdditionalItems: row.allow_additional_items ?? true,
    altDueDate: row.snoozed_until || null,
    visibility: row.visibility || 'household',
    checklist: [],
    isUrgent: false,
  };
}

function eventToDbRow(item) {
  return {
    household_id: item.householdId || currentHousehold?.id || null,
    created_by: item.createdBy || currentUser.id,
    item_type: 'event',
    name: item.name,
    event_date: item.date || null,
    end_date: item.endDate || null,
    start_time: item.startTime || null,
    end_time: item.endTime || null,
    event_icon: item.eventIcon || null,
    status: item.status || 'active',
    guests_can_invite: item.guestsCanInvite ?? true,
    allow_additional_items: item.allowAdditionalItems ?? true,
    snoozed_until: item.altDueDate || null,
    visibility: item.visibility || 'household',
  };
}

// ─── REALTIME SYNC ────────────────────────────────────────────────────────────
let realtimeChannel = null;
let realtimeDebounce = null;

function setupRealtime() {
  if (realtimeChannel) { sb.removeChannel(realtimeChannel); realtimeChannel = null; }
  realtimeChannel = sb.channel('tether-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tether_items' }, onRealtimeChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, onRealtimeChange)
    .subscribe((status, err) => {
      console.log('[Realtime]', status, err || '');
    });
}

function teardownRealtime() {
  if (realtimeChannel) { sb.removeChannel(realtimeChannel); realtimeChannel = null; }
  clearTimeout(realtimeDebounce);
}

function onRealtimeChange(payload) {
  console.log('[Realtime] change received', payload);
  clearTimeout(realtimeDebounce);
  realtimeDebounce = setTimeout(async () => { await loadItems(); render(); }, 300);
}

// ── Load ──────────────────────────────────────────────────────────────────────
async function loadItems() {
  const [tasksRes, eventsRes, guestRes] = await Promise.all([
    sb.from('tether_items').select('*').order('created_at', { ascending: true }),
    sb.from('items').select('*').eq('item_type', 'event').order('created_at', { ascending: true }),
    sb.from('event_guests').select('item_id, rsvp_status, note').eq('user_id', currentUser.id).eq('is_owner', false),
  ]);
  if (tasksRes.error) { showToast('Load error: ' + tasksRes.error.message); return; }
  if (eventsRes.error) { showToast('Load error: ' + eventsRes.error.message); return; }

  // Build RSVP lookup for invited (non-owner) events
  myRsvpMap = {};
  (guestRes.data || []).forEach(r => { myRsvpMap[r.item_id] = r; });

  // Fetch invited events not already returned by the events query (cross-household invites)
  const ownedIds = new Set((eventsRes.data || []).map(r => r.id));
  const invitedIds = Object.keys(myRsvpMap).filter(id => !ownedIds.has(id));
  let invitedRows = [];
  if (invitedIds.length > 0) {
    const { data } = await sb.from('items').select('*').in('id', invitedIds);
    invitedRows = data || [];
  }

  items = [
    ...(tasksRes.data || []).map(dbRowToItem),
    ...(eventsRes.data || []).map(dbRowToEvent),
    ...invitedRows.map(dbRowToEvent),
  ];
}

// ── Persist ───────────────────────────────────────────────────────────────────
async function persistEvent(item) {
  try {
    if (item._dbId) {
      const { error } = await sb.from('items')
        .update(eventToDbRow(item))
        .eq('id', item._dbId);
      if (error) { console.error('persistEvent update error', error); showToast('Save error: ' + (error.message || JSON.stringify(error))); }
    } else {
      const { data, error } = await sb.from('items')
        .insert(eventToDbRow(item))
        .select()
        .single();
      if (error) { console.error('persistEvent insert error', error); showToast('Save error: ' + (error.message || JSON.stringify(error))); return; }
      item.id = data.id;
      item._dbId = data.id;
    }
  } catch(e) {
    console.error('persistEvent exception', e);
    showToast('Save error: ' + e.message);
  }
}

async function persistItem(item) {
  if (item.type === 'event') return persistEvent(item);
  try {
    if (item._dbId) {
      const { error } = await sb.from('tether_items')
        .update(itemToDbRow(item))
        .eq('id', item._dbId);
      if (error) { console.error('persistItem update error', error); showToast('Save error: ' + (error.message || JSON.stringify(error))); }
    } else {
      const { data, error } = await sb.from('tether_items')
        .insert(itemToDbRow(item))
        .select()
        .single();
      if (error) { console.error('persistItem insert error', error); showToast('Save error: ' + (error.message || JSON.stringify(error))); return; }
      item.id = data.id;
      item._dbId = data.id;
    }
  } catch(e) {
    console.error('persistItem exception', e);
    showToast('Save error: ' + e.message);
  }
}

async function deleteItemFromDb(id) {
  const item = items.find(i => i.id === id);
  const table = item?.type === 'event' ? 'items' : 'tether_items';
  const { error } = await sb.from(table).delete().eq('id', id);
  if (error) showToast('Delete error: ' + error.message);
}

