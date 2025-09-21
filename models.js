// Models grid with Supabase + demo fallback
(async () => {
// --- Supabase Init ---
let supabaseClient = null;

try {
  console.log('🔍 Importing config.js...');
  const cfg = await import('./config.public.js');
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = cfg;
  console.log('🔍 Config imported:', { SUPABASE_URL: !!SUPABASE_URL, SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY });

  if (typeof SUPABASE_URL === 'string' && typeof SUPABASE_ANON_KEY === 'string') {
    console.log('🔍 Creating Supabase client...');
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabase = supabaseClient;
    console.log("✅ Supabase initialized:", SUPABASE_URL);
    console.log("🔍 Supabase client created:", !!supabaseClient);
  } else {
    console.error("❌ Invalid Supabase config values", { SUPABASE_URL, SUPABASE_ANON_KEY });
  }
} catch (e) {
  console.error("❌ Failed to initialize Supabase. Make sure config.public.js exists and exports SUPABASE_URL and SUPABASE_ANON_KEY.", e);
}

const els = {
  search: document.getElementById('search'),
  loader: document.getElementById('loader'),
  empty: document.getElementById('no-results'),
  grid: document.getElementById('cardsContainer'),
};

function cardHtml(m) {
  // Handle photo paths - convert Supabase storage paths to full URLs
  let photo = 'my-background.jpg'; // default fallback
  if (Array.isArray(m.photo_paths) && m.photo_paths[0]) {
    const photoPath = m.photo_paths[0];
    console.log('🔍 Processing photo path:', photoPath, 'for model:', m.name);
    
    // If it's a Supabase storage path, build the full URL
    if (supabaseClient && typeof photoPath === 'string' && !photoPath.startsWith('http')) {
      photo = `${supabaseClient.supabaseUrl}/storage/v1/object/public/uploads/${photoPath}`;
      console.log('🔍 Built Supabase photo URL:', photo);
    } else {
      photo = photoPath;
      console.log('🔍 Using direct photo path:', photo);
    }
  } else {
    console.log('🔍 No photo paths found for model:', m.name, 'using fallback');
  }
  
  const cityLand = [m.city, m.landmark].filter(Boolean).join(' · ');
  const savedDate = m.saved_at ? new Date(m.saved_at).toLocaleDateString() : '';
  
  // Build measurements summary
  const measurements = [];
  if (m.bust) measurements.push(`B:${m.bust}`);
  if (m.waist) measurements.push(`W:${m.waist}`);
  if (m.hips) measurements.push(`H:${m.hips}`);
  if (m.height) measurements.push(`${m.height}cm`);
  const measurementsText = measurements.length > 0 ? measurements.join(' · ') : '';
  
  // Photo count indicator
  const photoCount = Array.isArray(m.photo_paths) ? m.photo_paths.length : 0;
  const photoIndicator = photoCount > 0 ? `<div class="photo-count">📸 ${photoCount}</div>` : '';
  
  return `
  <div class="card" data-id="${m.id}" tabindex="0" role="button" aria-label="View details for ${m.name || 'Model'}">
    <div class="card-image-container">
      <img src="${photo}" alt="${m.name || 'Model'}" loading="lazy" onerror="this.src='my-background.jpg'; console.log('🖼️ Image failed to load:', this.src);" />
      ${photoIndicator}
    </div>
    <div class="card-body">
      <div class="name-row">
        <div class="name">${m.name || 'Unknown Model'}</div>
        ${m.age ? `<div class="age">${m.age}y</div>` : ''}
      </div>
      <div class="location">${cityLand || 'Location not specified'}</div>
      ${measurementsText ? `<div class="measurements">${measurementsText}</div>` : ''}
      ${savedDate ? `<div class="date">Added: ${savedDate}</div>` : ''}
    </div>
  </div>`;
}

function renderCards(list) {
  if (!list || list.length === 0) {
    els.grid.style.display = 'none';
    els.empty.style.display = '';
    return;
  }
  els.empty.style.display = 'none';
  els.grid.style.display = '';
  els.grid.innerHTML = list.map(cardHtml).join('');
  els.grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      window.location.href = `modeldetails.html?id=${encodeURIComponent(id)}`;
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

async function fetchAll() {
  console.log('🔍 fetchAll called, supabaseClient:', !!supabaseClient);
  
  if (!supabaseClient) {
    console.log('📱 Using demo data - Supabase not connected');
    return [...demoData];
  }
  
  try {
    console.log('🔄 Fetching models from Supabase...');
    
    // Start with a simple query to test connection
    console.log('🔍 Testing basic query first...');
    const { data: testData, error: testError } = await supabaseClient
      .from('submissions')
      .select('id, name')
      .limit(5);
    
    if (testError) {
      console.error('❌ Basic query failed:', testError);
      console.error('❌ Basic query error details:', JSON.stringify(testError, null, 2));
      throw new Error(`Basic query failed: ${testError.message}`);
    }
    
    console.log('✅ Basic query successful, got:', testData?.length || 0, 'records');
    
    // Now try the full query
    const { data, error, count } = await supabaseClient
      .from('submissions')
      .select('*', { count: 'exact' })
      .order('saved_at', { ascending: false })
      .limit(1000);
    
    console.log('🔍 Raw Supabase response:', { data, error, count });
    
    if (error) {
      console.error('❌ Supabase fetch models error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      console.log('📱 Falling back to demo data');
      return [...demoData];
    }
    
    if (!data || data.length === 0) {
      console.warn('⚠️ No models found in Supabase database');
      console.log('📱 Falling back to demo data');
      return [...demoData];
    }
    
    // Validate and sanitize the data
    const sanitizedData = data.map(model => ({
      ...model,
      name: model.name || 'Unknown Model',
      city: model.city || '',
      landmark: model.landmark || '',
      photo_paths: Array.isArray(model.photo_paths) ? model.photo_paths : [],
      bust: typeof model.bust === 'number' ? model.bust : null,
      chest: typeof model.chest === 'number' ? model.chest : null,
      waist: typeof model.waist === 'number' ? model.waist : null,
      hips: typeof model.hips === 'number' ? model.hips : null,
      height: typeof model.height === 'number' ? model.height : null,
      age: typeof model.age === 'number' ? model.age : null,
    }));
    
    console.log(`✅ Successfully fetched ${sanitizedData.length} models from Supabase (Total: ${count || 'unknown'})`);
    console.log('🔍 First model sample:', sanitizedData[0]);
    return sanitizedData;
  } catch (err) {
    console.error('❌ Network error fetching models:', err);
    console.log('📱 Falling back to demo data');
    return [...demoData];
  }
}

let all = [];
async function init() {
  try {
    console.log('🚀 Initializing models page...');
    els.loader.style.display = '';
    els.grid.style.display = 'none';
    els.empty.style.display = 'none';
    
    all = await fetchAll();
    console.log('🔍 fetchAll returned:', all.length, 'models');
    console.log('🔍 First model in all array:', all[0]);
    
    els.loader.style.display = 'none';
    renderCards(all);
    
    // Update page title with count
    if (all.length > 0) {
      document.title = `All Models (${all.length})`;
    }
  } catch (err) {
    console.error('❌ Error initializing models page:', err);
    els.loader.style.display = 'none';
    els.empty.style.display = '';
    els.empty.innerHTML = 'Error loading models. Please refresh the page.';
  }
}

els.search?.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();
  
  if (!searchTerm) {
    renderCards(all);
    document.title = `All Models (${all.length})`;
    return;
  }
  
  const filtered = all.filter(m => {
    const name = (m.name || '').toLowerCase();
    const city = (m.city || '').toLowerCase();
    const landmark = (m.landmark || '').toLowerCase();
    const location = [city, landmark].filter(Boolean).join(' ');
    
    // Search in measurements
    const measurements = [];
    if (m.bust) measurements.push(m.bust.toString());
    if (m.waist) measurements.push(m.waist.toString());
    if (m.hips) measurements.push(m.hips.toString());
    if (m.height) measurements.push(m.height.toString());
    if (m.age) measurements.push(m.age.toString());
    const measurementsText = measurements.join(' ');
    
    return name.includes(searchTerm) || 
           location.includes(searchTerm) ||
           measurementsText.includes(searchTerm);
  });
  
  renderCards(filtered);
  
  // Update title with search results
  if (filtered.length !== all.length) {
    document.title = `Search Results (${filtered.length}/${all.length}) - All Models`;
  } else {
    document.title = `All Models (${all.length})`;
  }
});

init();

// --- DEMO DATA (remove later when Supabase is stable) ---
const demoData = [
  {
    id: "demo1",
    name: "Alice Demo",
    city: "Mumbai",
    landmark: "Gateway of India",
    bust: 32, chest: null, waist: 28, hips: 36, height: 165, age: 22,
    insta: "@alice_demo",
    whatsapp: "9999999999",
    photo_paths: ["demo-alice.jpg"],
    saved_at: "2025-09-01T10:00:00Z"
  },
  {
    id: "demo2",
    name: "Bella Demo",
    city: "Delhi",
    landmark: "India Gate",
    bust: 34, chest: null, waist: 30, hips: 38, height: 168, age: 23,
    insta: "@bella_demo",
    whatsapp: "8888888888",
    photo_paths: ["demo-bella.jpg"],
    saved_at: "2025-09-02T12:00:00Z"
  },
  {
    id: "demo3",
    name: "Clara Demo",
    city: "Pune",
    landmark: "Shaniwar Wada",
    bust: 33, chest: null, waist: 29, hips: 37, height: 162, age: 21,
    insta: "@clara_demo",
    whatsapp: "7777777777",
    photo_paths: [],
    saved_at: "2025-09-03T15:30:00Z"
  }
];

init();

// Logout functionality - run after DOM is loaded
setTimeout(() => {
  const logoutBtn = document.getElementById('logoutBtn');
  console.log('🔍 Logout button found:', !!logoutBtn);

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('🔑 Logout button clicked');
      
      try {
        if (supabaseClient) {
          console.log('🔑 Attempting Supabase logout...');
          const { error } = await supabaseClient.auth.signOut();
          if (error) {
            console.error('❌ Logout error:', error);
            alert('Logout failed: ' + error.message);
          } else {
            console.log('✅ Signed out successfully');
            // Clear session data
            sessionStorage.removeItem('userRole');
            // Redirect to login
            window.location.href = 'login.html';
          }
        } else {
          console.log('🔑 Supabase not available, using fallback logout');
          // Fallback if Supabase not available
          sessionStorage.removeItem('userRole');
          window.location.href = 'login.html';
        }
      } catch (err) {
        console.error('❌ Logout failed:', err);
        alert('Logout failed: ' + err.message);
        // Force redirect anyway
        window.location.href = 'login.html';
      }
    });
    console.log('✅ Logout button event listener added');
  } else {
    console.error('❌ Logout button not found!');
  }
}, 100);

})();
