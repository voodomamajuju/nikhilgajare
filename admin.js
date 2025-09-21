// Admin dashboard filtering with Supabase fallback to demo data
// UPDATE: Using OR between bust and chest — a row matches if either chest OR bust is within the chest-range, AND other ranges (waist, hips) match.

(async () => {
// --- Supabase Init ---
let supabaseClient = null;

try {
  const cfg = await import('./config.public.js');
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = cfg;

  if (typeof SUPABASE_URL === 'string' && typeof SUPABASE_ANON_KEY === 'string') {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabase = supabaseClient;
    console.log("✅ Supabase initialized:", SUPABASE_URL);
    
    // Admin access guard - check authentication and admin role
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      console.log('🔒 No session found, redirecting to login');
      window.location.href = 'login.html';
      return;
    }

    // Check if user is admin
    const userEmail = session.user.email;
    if (userEmail !== 'admin@example.com' && userEmail !== 'nikhil.dg2003@gmail.com') {
      console.log('🔒 Non-admin user attempted to access admin panel');
      alert('Admin access required');
      window.location.href = 'login.html';
      return;
    }

    console.log('✅ Admin access verified');
  } else {
    console.error("❌ Invalid Supabase config values", { SUPABASE_URL, SUPABASE_ANON_KEY });
  }
} catch (e) {
  console.error("❌ Failed to initialize Supabase. Make sure config.public.js exists and exports SUPABASE_URL and SUPABASE_ANON_KEY.", e);
}

// Demo fallback data (keep small)
const demoRows = [
  { id: '1', name: 'Anaya', city: 'Mumbai', landmark: 'Andheri', bust: 32, chest: 32, waist: 26, hips: 36, saved_at: '2025-09-01T10:00:00Z' },
  { id: '2', name: 'Meera', city: 'Pune', landmark: 'Koregaon Park', bust: 34, chest: 34, waist: 28, hips: 38, saved_at: '2025-09-02T12:00:00Z' },
  { id: '3', name: 'Riya', city: 'Delhi', landmark: 'Saket', bust: 36, chest: 36, waist: 30, hips: 40, saved_at: '2025-08-25T09:30:00Z' },
];

const messageArea = document.getElementById('messageArea') || document.querySelector('#messageArea');
if (messageArea && !messageArea.getAttribute('aria-live')) {
  messageArea.setAttribute('aria-live', 'polite');
}

const els = {
  chest: document.getElementById('chest'),
  bust: document.getElementById('bust'),
  waist: document.getElementById('waist'),
  hips: document.getElementById('hips'),
  apply: document.getElementById('applyBtn'),
  clear: document.getElementById('clearBtn'),
  message: messageArea,
  tableContainer: document.getElementById('resultsContainer'),
  tbody: document.getElementById('models-table-body'),
  total: document.getElementById('totalCount'),
};

// Initialize total models count (overall sign-ups)
async function setOverallTotal() {
  try {
    if (els.total) {
      if (supabaseClient) {
        const { count, error } = await supabaseClient
          .from('submissions')
          .select('id', { count: 'exact', head: true });
        if (!error && typeof count === 'number') {
          els.total.textContent = String(count);
          return;
        }
      }
      // fallback to demo data size
      els.total.textContent = String(demoRows.length);
    }
  } catch (_) {
    if (els.total) els.total.textContent = '—';
  }
}
setOverallTotal();

function parseNumberOrNull(input) {
  const val = input?.value?.trim();
  if (val === '' || val === undefined) return null;
  const num = Number(val);
  return Number.isFinite(num) ? num : NaN;
}

function showInlineError(input, message) {
  input.setCustomValidity(message);
  input.reportValidity();
}

function clearInlineError(input) {
  input.setCustomValidity('');
}

function buildFilter() {
  const chestTarget = parseNumberOrNull(els.chest);
  const bustTarget = parseNumberOrNull(els.bust);
  const waistTarget = parseNumberOrNull(els.waist);
  const hipsTarget = parseNumberOrNull(els.hips);

  for (const [inp, target] of [ [els.chest, chestTarget], [els.bust, bustTarget], [els.waist, waistTarget], [els.hips, hipsTarget] ]) {
    if (Number.isNaN(target)) {
      showInlineError(inp, 'Enter a numeric value');
      return { error: 'validation' };
    } else {
      clearInlineError(inp);
    }
  }

  const filter = {};
  const chestRangeSource = chestTarget != null ? chestTarget : (bustTarget != null ? bustTarget : null);
  if (chestRangeSource != null) { filter.chestMin = chestRangeSource; filter.chestMax = chestRangeSource + 2; }
  if (waistTarget != null) { filter.waistMin = waistTarget; filter.waistMax = waistTarget + 3; }
  if (hipsTarget != null) { filter.hipsMin = hipsTarget - 2; filter.hipsMax = hipsTarget + 2; }
  // name search removed per request

  console.log('Applying filter:', filter);
  return { filter };
}

function setLoading(isLoading) {
  els.apply.disabled = isLoading;
  els.apply.textContent = isLoading ? 'Loading…' : 'Apply filter';
  els.message.textContent = isLoading ? 'Loading…' : '';
}

function renderRows(rows) {
  els.tbody.innerHTML = '';
  if (!rows || rows.length === 0) {
    els.tableContainer.style.display = 'none';
    els.message.textContent = 'No models match your filter.';
    return;
  }

  els.message.textContent = `${rows.length} models found`;
  els.tableContainer.style.display = '';

  for (const r of rows) {
    const tr = document.createElement('tr');
    tr.dataset.id = r.id;
    tr.innerHTML = `
      <td data-label="Name">${r.name ?? ''}</td>
      <td data-label="City">${r.city ?? ''}</td>
      <td data-label="Landmark">${r.landmark ?? ''}</td>
      <td data-label="Bust">${r.bust ?? ''}</td>
      <td data-label="Chest">${r.chest ?? ''}</td>
      <td data-label="Waist">${r.waist ?? ''}</td>
      <td data-label="Hips">${r.hips ?? ''}</td>
      <td data-label="Saved At">${r.saved_at ? new Date(r.saved_at).toLocaleString() : ''}</td>
    `;
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => {
      const id = tr.dataset.id;
      window.location.href = `modeldetails.html?id=${encodeURIComponent(id)}`;
    });
    els.tbody.appendChild(tr);
  }
}

function rowMatchesFilter(row, filter) {
  // Apply AND logic; ignore undefined fields
  // no name filter

  // Chest/Bust OR matching against a single chest-range
  if (filter.chestMin !== undefined || filter.chestMax !== undefined) {
    const chestVal = row.chest;
    const bustVal = row.bust;
    const inChest = (typeof chestVal === 'number') && chestVal >= filter.chestMin && chestVal <= filter.chestMax;
    const inBust = (typeof bustVal === 'number') && bustVal >= filter.chestMin && bustVal <= filter.chestMax;
    if (!(inChest || inBust)) return false;
  }
  if (filter.waistMin !== undefined || filter.waistMax !== undefined) {
    const waistVal = row.waist;
    if (!(typeof waistVal === 'number' && waistVal >= filter.waistMin && waistVal <= filter.waistMax)) return false;
  }
  if (filter.hipsMin !== undefined || filter.hipsMax !== undefined) {
    const hipsVal = row.hips;
    if (!(typeof hipsVal === 'number' && hipsVal >= filter.hipsMin && hipsVal <= filter.hipsMax)) return false;
  }
  return true;
}

async function fetchRows(filter) {
  if (!supabaseClient) {
    // Demo fallback: filter client-side
    const filtered = demoRows
      .filter(r => rowMatchesFilter(r, filter))
      .sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at));
    return { data: filtered };
  }

  try {
    // Build Supabase query
    let q = supabaseClient
      .from('submissions')
      .select('id, name, chest, bust, waist, hips, city, landmark, saved_at')
      .order('saved_at', { ascending: false });

    // OR between chest and bust for the chest-range
    if (filter.chestMin !== undefined && filter.chestMax !== undefined) {
      const chestLower = filter.chestMin;
      const chestUpper = filter.chestMax;
      const orExpr = `and(chest.gte.${chestLower},chest.lte.${chestUpper}),and(bust.gte.${chestLower},bust.lte.${chestUpper})`;
      q = q.or(orExpr);
    }
    if (filter.waistMin !== undefined) q = q.gte('waist', filter.waistMin);
    if (filter.waistMax !== undefined) q = q.lte('waist', filter.waistMax);
    if (filter.hipsMin !== undefined) q = q.gte('hips', filter.hipsMin);
    if (filter.hipsMax !== undefined) q = q.lte('hips', filter.hipsMax);

    const { data, error } = await q;
    if (error) {
      console.error('Supabase query error:', error);
      return { error };
    }
    return { data };
  } catch (err) {
    console.error('Supabase fetch failed:', err);
    return { error: err };
  }
}

async function applyFilters() {
  const { filter, error } = buildFilter();
  if (error === 'validation') return;

  setLoading(true);
  const res = await fetchRows(filter);
  setLoading(false);

  if (res.error) {
    els.message.textContent = 'Database permissions prevent this query — try logging in as admin or test with demo data.';
    els.tableContainer.style.display = 'none';
    return;
  }

  renderRows(res.data || []);
}

function clearFilters() {
  for (const key of ['chest','bust','waist','hips']) {
    const el = els[key]; if (el) el.value = '';
  }
  els.message.textContent = 'Apply a filter — enter chest, bust, waist or hips to see matching models.';
  els.tableContainer.style.display = 'none';
  // keep overall total as-is
}

// Wire up events
if (els.apply) {
  els.apply.addEventListener('click', (e) => {
    e.preventDefault();
    applyFilters();
  });
}
if (els.clear) {
  els.clear.hidden = false;
  els.clear.addEventListener('click', (e) => {
    e.preventDefault();
    clearFilters();
  });
}

// Support Enter key on inputs
for (const key of ['chest','bust','waist','hips']) {
  const el = els[key];
  if (!el) continue;
  el.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      applyFilters();
    }
  });
}

// Logout functionality
document.querySelector('a[href="#"]').addEventListener('click', async (e) => {
  const linkText = e.target.textContent.toLowerCase();
  if (linkText.includes('logout')) {
    e.preventDefault();
    try {
      if (supabaseClient) {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
          console.error('Logout error:', error);
        } else {
          console.log('✅ Signed out successfully');
          // Clear session data
          sessionStorage.removeItem('userRole');
          // Redirect to login
          window.location.href = 'login.html';
        }
      } else {
        // Fallback if Supabase not available
        sessionStorage.removeItem('userRole');
        window.location.href = 'login.html';
      }
    } catch (err) {
      console.error('Logout failed:', err);
      // Force redirect anyway
      window.location.href = 'login.html';
    }
  }
});

})();


