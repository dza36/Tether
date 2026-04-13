// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL  = 'https://gnudccfibmslzotaaerr.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudWRjY2ZpYm1zbHpvdGFhZXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NjE2ODAsImV4cCI6MjA5MTIzNzY4MH0.H0l8uLg4PmQWqosYdzjUwa4q0Xe-5ErtNR2XtUbW5OM';
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
let currentUser = null;

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

function dbRowToItem(row) {
  return {
    id: row.id,
    _dbId: row.id,
    name: row.name,
    type: row.type,
    days: row.days,
    lastDone: row.last_done,
    weekdays: row.weekdays,
    date: row.date,
    checklist: row.checklist || [],
    snoozedUntil: row.snoozed_until || null,
    dismissed: row.dismissed || false,
    householdId: row.household_id || null,
    assignedTo: row.assigned_to || null,
    createdBy: row.created_by || null,
    startTime: row.start_time || null,
    endTime: row.end_time || null,
    isUrgent: row.is_urgent || false,
    eventIcon: row.event_icon || null,
  };
}

function itemToDbRow(item) {
  return {
    user_id: currentUser.id,
    name: item.name,
    type: item.type,
    days: item.days || null,
    last_done: item.lastDone || null,
    weekdays: item.weekdays || null,
    date: item.date || null,
    checklist: item.checklist || [],
    snoozed_until: item.snoozedUntil || null,
    dismissed: item.dismissed || false,
    household_id: item.householdId || currentHousehold?.id || null,
    assigned_to: item.assignedTo || null,
    created_by: item.createdBy || currentUser.id,
    start_time: item.startTime || null,
    end_time: item.endTime || null,
    is_urgent: item.isUrgent || false,
    event_icon: item.eventIcon || null,
  };
}

async function loadItems() {
  const { data, error } = await sb.from('tether_items')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { showToast('Load error: ' + error.message); return; }
  items = (data || []).map(dbRowToItem);
}

async function persistItem(item) {
  if (item._dbId) {
    const { error } = await sb.from('tether_items')
      .update(itemToDbRow(item))
      .eq('id', item._dbId);
    if (error) showToast('Save error: ' + error.message);
  } else {
    const { data, error } = await sb.from('tether_items')
      .insert(itemToDbRow(item))
      .select()
      .single();
    if (error) { showToast('Save error: ' + error.message); return; }
    item.id = data.id;
    item._dbId = data.id;
  }
}

async function deleteItemFromDb(id) {
  const { error } = await sb.from('tether_items').delete().eq('id', id);
  if (error) showToast('Delete error: ' + error.message);
}

