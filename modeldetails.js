// Model details page with Supabase + demo fallback
(async () => {
// --- Supabase Init ---
let supabaseClient = null;
let STORAGE_BUCKET = null;

try {
  const cfg = await import('./config.js');
  const { SUPABASE_URL, SUPABASE_ANON_KEY, STORAGE_BUCKET: bucket } = cfg;
  STORAGE_BUCKET = bucket || null;

  if (typeof SUPABASE_URL === 'string' && typeof SUPABASE_ANON_KEY === 'string') {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabase = supabaseClient;
    console.log("✅ Supabase initialized:", SUPABASE_URL);
  } else {
    console.error("❌ Invalid Supabase config values", { SUPABASE_URL, SUPABASE_ANON_KEY });
  }
} catch (e) {
  console.error("❌ Failed to initialize Supabase. Make sure config.js exists and exports SUPABASE_URL and SUPABASE_ANON_KEY.", e);
}

  const qs = new URLSearchParams(window.location.search);
  const id = qs.get('id');
  const container = document.getElementById('details-content');
  
  // Debug: Log the ID format
  console.log('🔍 Model ID from URL:', id);
  console.log('🔍 ID type:', typeof id);
  console.log('🔍 ID length:', id?.length);

  function html(strings, ...values) {
    return strings.map((s, i) => s + (values[i] ?? '')).join('');
  }

  function detailView(m, working, notes) {
    const name = m?.name || '';
    const loc = [m?.city, m?.landmark].filter(Boolean).join(' · ');
    const savedDate = m?.saved_at ? new Date(m.saved_at).toLocaleDateString() : '';
    const createdDate = m?.created_at ? new Date(m.created_at).toLocaleDateString() : '';

    // build photo URLs with enhanced error handling
    const photos = Array.isArray(m?.photo_paths) ? m.photo_paths : [];
    const photoEls = photos.length
      ? photos.map((p, index) => {
          // if Supabase storage bucket is used, build URL
          const url = (STORAGE_BUCKET && supabaseClient)
            ? `${supabaseClient.supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${p}`
            : p;
          return `
            <div style="position:relative;">
              <img src="${url}" 
                   alt="${name} - Photo ${index + 1}" 
                   style="width:100%;height:160px;object-fit:cover;border-radius:8px;" 
                   loading="lazy" 
                   onerror="this.parentElement.innerHTML='<div style=\\'height:160px;display:flex;align-items:center;justify-content:center;background:#f8f9fa;border-radius:8px;color:#6c757d;\\'>Image unavailable</div>'"/>
            </div>
          `;
        }).join('')
      : '<div style="color:#777;text-align:center;padding:20px;">No photos available</div>';

    return html`
      <div style="max-width:900px;margin:0 auto;padding:20px;">
        <!-- Header Section -->
        <section style="margin-bottom:32px;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:32px;border-radius:16px;">
          <h1 style="margin-bottom:12px;font-size:2.5rem;font-weight:700;">${name || 'Unknown Model'}</h1>
          <div style="font-size:1.2rem;margin-bottom:8px;opacity:0.9;">${loc || 'Location not specified'}</div>
          <div style="font-size:0.9rem;opacity:0.7;">
            ${savedDate ? `Added: ${savedDate}` : ''}
            ${createdDate && createdDate !== savedDate ? ` • Created: ${createdDate}` : ''}
          </div>
        </section>
        
        <!-- Contact & Measurements Grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px;margin-bottom:32px;">
          <!-- Contact Section -->
          <section style="background:#fff;padding:24px;border-radius:16px;border:1px solid #e9ecef;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="margin-bottom:20px;color:#495057;border-bottom:3px solid #007bff;padding-bottom:12px;font-size:1.3rem;">
              📞 Contact Information
            </h2>
            <div style="display:grid;gap:16px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <span style="font-weight:600;min-width:80px;">Instagram:</span>
                <span style="color:#666;">${m?.insta || 'Not provided'}</span>
              </div>
              <div style="display:flex;align-items:center;gap:12px;">
                <span style="font-weight:600;min-width:80px;">WhatsApp:</span>
                <span style="color:#666;">${m?.whatsapp || 'Not provided'}</span>
              </div>
              <div style="display:flex;align-items:center;gap:12px;">
                <span style="font-weight:600;min-width:80px;">City:</span>
                <span style="color:#666;">${m?.city || 'Not specified'}</span>
              </div>
              <div style="display:flex;align-items:center;gap:12px;">
                <span style="font-weight:600;min-width:80px;">Landmark:</span>
                <span style="color:#666;">${m?.landmark || 'Not specified'}</span>
              </div>
            </div>
          </section>
          
          <!-- Measurements Section -->
          <section style="background:#fff;padding:24px;border-radius:16px;border:1px solid #e9ecef;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="margin-bottom:20px;color:#495057;border-bottom:3px solid #28a745;padding-bottom:12px;font-size:1.3rem;">
              📏 Physical Measurements
            </h2>
            <div style="display:grid;gap:16px;">
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f8f9fa;">
                <span style="font-weight:600;">Bust:</span>
                <span style="color:#666;font-size:1.1rem;">${m?.bust ? `${m.bust}"` : 'Not provided'}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f8f9fa;">
                <span style="font-weight:600;">Chest:</span>
                <span style="color:#666;font-size:1.1rem;">${m?.chest ? `${m.chest}"` : 'Not provided'}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f8f9fa;">
                <span style="font-weight:600;">Waist:</span>
                <span style="color:#666;font-size:1.1rem;">${m?.waist ? `${m.waist}"` : 'Not provided'}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f8f9fa;">
                <span style="font-weight:600;">Hips:</span>
                <span style="color:#666;font-size:1.1rem;">${m?.hips ? `${m.hips}"` : 'Not provided'}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f8f9fa;">
                <span style="font-weight:600;">Height:</span>
                <span style="color:#666;font-size:1.1rem;">${m?.height ? `${m.height} cm` : 'Not provided'}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;">
                <span style="font-weight:600;">Age:</span>
                <span style="color:#666;font-size:1.1rem;">${m?.age ? `${m.age} years` : 'Not provided'}</span>
              </div>
            </div>
          </section>
        </div>
        
        <!-- Photos Section -->
        <section style="margin-bottom:32px;background:#fff;padding:24px;border-radius:16px;border:1px solid #e9ecef;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="margin-bottom:20px;color:#495057;border-bottom:3px solid #ffc107;padding-bottom:12px;font-size:1.3rem;">
            📸 Photo Gallery (${photos.length} ${photos.length === 1 ? 'photo' : 'photos'})
          </h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;">
            ${photoEls}
          </div>
        </section>
        
        <!-- Status & Notes Grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
          <!-- Status Section -->
          <section style="background:#fff;padding:24px;border-radius:16px;border:1px solid #e9ecef;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="margin-bottom:20px;color:#495057;border-bottom:3px solid #dc3545;padding-bottom:12px;font-size:1.3rem;">
              🔄 Working Status
            </h2>
            <div style="text-align:center;">
              <!-- Toggle Switch -->
              <div style="display:flex;justify-content:center;margin-bottom:16px;">
                <label style="position:relative;display:inline-block;width:80px;height:40px;">
                  <input type="checkbox" id="workingToggle" ${working ? 'checked' : ''} 
                         style="opacity:0;width:0;height:0;">
                  <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:${working ? '#28a745' : '#dc3545'};transition:0.4s;border-radius:40px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
                    <span style="position:absolute;content:'';height:32px;width:32px;left:4px;bottom:4px;background-color:white;transition:0.4s;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.2);">
                      <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:16px;color:${working ? '#28a745' : '#dc3545'};">
                        ${working ? '✓' : '✗'}
                      </span>
                    </span>
                  </span>
                </label>
              </div>
              
              <!-- Status Text Below Toggle -->
              <div id="statusText" style="text-align:center;margin-bottom:16px;">
                <span style="font-weight:600;color:${working ? '#28a745' : '#dc3545'};font-size:1.1rem;">
                  ${working ? '✅ Currently Working' : '❌ Not Working'}
                </span>
              </div>
              
              <div style="margin-top:16px;font-size:0.9rem;color:#666;">
                Toggle switch to change availability
              </div>
            </div>
          </section>
          
          <!-- Notes Section -->
          <section style="background:#fff;padding:24px;border-radius:16px;border:1px solid #e9ecef;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="margin-bottom:20px;color:#495057;border-bottom:3px solid #17a2b8;padding-bottom:12px;font-size:1.3rem;">
              📝 Admin Notes
            </h2>
            <textarea id="notesInput" 
                      rows="6" 
                      style="width:100%;padding:16px;border:2px solid #e9ecef;border-radius:12px;font-family:inherit;font-size:1rem;resize:vertical;margin-bottom:16px;transition:border-color 0.2s ease;"
                      placeholder="Add notes about this model..."
                      onfocus="this.style.borderColor='#007bff';"
                      onblur="this.style.borderColor='#e9ecef';">
              ${notes || ''}
            </textarea>
            <button id="saveNotes" 
                    style="background:#007bff;color:white;border:none;padding:12px 24px;border-radius:8px;font-size:1rem;cursor:pointer;transition:all 0.2s ease;font-weight:600;">
              💾 Save Notes
            </button>
          </section>
        </div>
      </div>
    `;
  }

  async function fetchModel() {
    if (!supabaseClient) {
      console.log('📱 Using demo data - Supabase not connected');
      return demoData.find(x => x.id === id) || null;
    }
    
    try {
      console.log(`🔄 Fetching model details for ID: ${id}`);
      
      // Enhanced query with better error handling and data validation
      const { data: submission, error: submissionError } = await supabaseClient
        .from('submissions')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (submissionError) {
        console.error('❌ Supabase model fetch error:', submissionError);
        console.log('📱 Falling back to demo data');
        return demoData.find(x => x.id === id) || null;
      }
      
      if (!submission) {
        console.warn(`⚠️ Model with ID ${id} not found in database`);
        return demoData.find(x => x.id === id) || null;
      }
      
      // Validate and sanitize the data
      const sanitizedData = {
        ...submission,
        name: submission.name || 'Unknown Model',
        city: submission.city || '',
        landmark: submission.landmark || '',
        insta: submission.insta || '',
        whatsapp: submission.whatsapp || '',
        photo_paths: Array.isArray(submission.photo_paths) ? submission.photo_paths : [],
        bust: typeof submission.bust === 'number' ? submission.bust : null,
        chest: typeof submission.chest === 'number' ? submission.chest : null,
        waist: typeof submission.waist === 'number' ? submission.waist : null,
        hips: typeof submission.hips === 'number' ? submission.hips : null,
        height: typeof submission.height === 'number' ? submission.height : null,
        age: typeof submission.age === 'number' ? submission.age : null,
      };
      
      console.log('✅ Successfully fetched model from Supabase:', sanitizedData.name);
      return sanitizedData;
    } catch (err) {
      console.error('❌ Network error fetching model:', err);
      console.log('📱 Falling back to demo data');
      return demoData.find(x => x.id === id) || null;
    }
  }

  async function fetchWorking() {
    if (!supabaseClient) {
      console.log('📱 Using localStorage for working status - Supabase not connected');
      return localStorage.getItem(`working_${id}`) === 'true';
    }
    
    try {
      console.log(`🔄 Fetching working status for ID: ${id}`);
      
      // Enhanced query with better error handling
      const { data: statusRow, error: statusError } = await supabaseClient
        .from('model_status')
        .select('working, saved_at')
        .eq('submission_id', id)
        .order('saved_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (statusError) {
        console.error('❌ Supabase working status fetch error:', statusError);
        console.log('📱 Falling back to localStorage');
        return localStorage.getItem(`working_${id}`) === 'true';
      }
      
      // Handle case where no status record exists
      if (!statusRow) {
        console.log('ℹ️ No working status found, defaulting to false');
        return false;
      }
      
      const isWorking = Boolean(statusRow.working);
      console.log(`✅ Working status: ${isWorking ? 'Yes' : 'No'} (last updated: ${statusRow.saved_at})`);
      return isWorking;
    } catch (err) {
      console.error('❌ Network error fetching working status:', err);
      console.log('📱 Falling back to localStorage');
      return localStorage.getItem(`working_${id}`) === 'true';
    }
  }

  async function setWorking(next) {
    if (!supabaseClient) {
      console.log(`📱 Saving working status to localStorage: ${next}`);
      localStorage.setItem(`working_${id}`, String(next));
      return { ok: true };
    }
    
    try {
      console.log(`🔄 Updating working status to: ${next}`);
      
      // Use UPSERT to update existing row or insert new one
      // This ensures only one row per submission_id
      const { error } = await supabaseClient
        .from('model_status')
        .upsert({ 
          submission_id: id, 
          working: !!next, 
          saved_at: new Date().toISOString() 
        }, {
          onConflict: 'submission_id'  // Update if submission_id already exists
        });
      
      if (error) {
        console.error('❌ Supabase working status update error:', error);
        return { ok: false, error };
      }
      
      console.log('✅ Working status updated successfully');
      return { ok: true };
    } catch (err) {
      console.error('❌ Network error updating working status:', err);
      return { ok: false, error: err };
    }
  }

  async function fetchNotes() {
    if (!supabaseClient) {
      console.log('📱 Using localStorage for notes - Supabase not connected');
      return localStorage.getItem(`notes_${id}`) || '';
    }
    
    try {
      console.log(`🔄 Fetching notes for ID: ${id}`);
      
      // Enhanced query with better error handling
      const { data: noteRow, error: noteError } = await supabaseClient
        .from('model_notes')
        .select('content, saved_at')
        .eq('submission_id', id)
        .order('saved_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (noteError) {
        console.error('❌ Supabase notes fetch error:', noteError);
        console.log('📱 Falling back to localStorage');
        return localStorage.getItem(`notes_${id}`) || '';
      }
      
      // Handle case where no notes exist
      if (!noteRow) {
        console.log('ℹ️ No notes found for this model');
        return '';
      }
      
      const notes = String(noteRow.content || '');
      console.log(`✅ Notes fetched: ${notes.length} characters (last updated: ${noteRow.saved_at})`);
      return notes;
    } catch (err) {
      console.error('❌ Network error fetching notes:', err);
      console.log('📱 Falling back to localStorage');
      return localStorage.getItem(`notes_${id}`) || '';
    }
  }

  async function saveNotes(content) {
    if (!supabaseClient) {
      console.log(`📱 Saving notes to localStorage: ${content.length} characters`);
      localStorage.setItem(`notes_${id}`, content || '');
      return { ok: true };
    }
    
    try {
      console.log(`🔄 Saving notes: ${content.length} characters`);
      console.log(`🔄 Submission ID: ${id}`);
      
      // Use UPSERT to update existing row or insert new one
      // This ensures only one row per submission_id
      const { error } = await supabaseClient
        .from('model_notes')
        .upsert({ 
          submission_id: id, 
          content: content || '', 
          saved_at: new Date().toISOString() 
        }, {
          onConflict: 'submission_id'  // Update if submission_id already exists
        });
      
      if (error) {
        console.error('❌ Supabase notes save error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        return { ok: false, error };
      }
      
      console.log('✅ Notes saved successfully');
      return { ok: true };
    } catch (err) {
      console.error('❌ Network error saving notes:', err);
      return { ok: false, error: err };
    }
  }

  async function init() {
    try {
      container.style.opacity = '0';
      
      if (!id) {
        container.innerHTML = '<div style="padding:16px;color:#c00;text-align:center;"><h2>Missing Model ID</h2><p>Please open this page from the models list.</p><a href="models.html" style="color:#007bff;">← Back to Models</a></div>';
        container.style.opacity = '1';
        return;
      }
      
      console.log(`🚀 Initializing model details for ID: ${id}`);
      
      // Show loading state
      container.innerHTML = '<div style="padding:16px;text-align:center;color:#666;">Loading model details...</div>';
      container.style.opacity = '1';
      
      const [model, working, notes] = await Promise.all([
        fetchModel(),
        fetchWorking(),
        fetchNotes()
      ]);
      
      if (!model) {
        container.innerHTML = '<div style="padding:16px;color:#c00;text-align:center;"><h2>Model Not Found</h2><p>The requested model could not be found.</p><a href="models.html" style="color:#007bff;">← Back to Models</a></div>';
        return;
      }
      
      container.innerHTML = detailView(model, working, notes);
      
      // Update page title
      if (model?.name) {
        try { 
          document.title = `${model.name} – Model Details`;
        } catch (_) {}
      }

      // Setup event listeners
      const workingToggle = document.getElementById('workingToggle');
      const notesInput = document.getElementById('notesInput');
      const saveNotesBtn = document.getElementById('saveNotes');

      workingToggle?.addEventListener('change', async () => {
        const next = workingToggle.checked;
        
        // Show loading state
        workingToggle.disabled = true;
        
        const res = await setWorking(next);
        
        if (res.ok) {
          // Update the toggle appearance
          const toggleSpan = workingToggle.nextElementSibling;
          const toggleKnob = toggleSpan.querySelector('span');
          const toggleIcon = toggleKnob.querySelector('span');
          
          // Update colors and icon
          toggleSpan.style.backgroundColor = next ? '#28a745' : '#dc3545';
          toggleIcon.style.color = next ? '#28a745' : '#dc3545';
          toggleIcon.textContent = next ? '✓' : '✗';
          
          // Update status text below toggle
          const statusText = document.getElementById('statusText');
          if (statusText) {
            const statusSpan = statusText.querySelector('span');
            statusSpan.style.color = next ? '#28a745' : '#dc3545';
            statusSpan.textContent = next ? '✅ Currently Working' : '❌ Not Working';
          }
        } else {
          // Revert toggle state on error
          workingToggle.checked = !next;
          alert('Failed to update working status. Please try again.');
        }
        
        workingToggle.disabled = false;
      });

      saveNotesBtn?.addEventListener('click', async () => {
        const content = notesInput?.value || '';
        
        // Show loading state
        const originalText = saveNotesBtn.textContent;
        saveNotesBtn.textContent = 'Saving...';
        saveNotesBtn.disabled = true;
        
        const res = await saveNotes(content);
        
        if (res.ok) {
          saveNotesBtn.textContent = 'Saved ✓';
          setTimeout(() => {
            saveNotesBtn.textContent = 'Save';
            saveNotesBtn.disabled = false;
          }, 2000);
        } else {
          saveNotesBtn.textContent = originalText;
          saveNotesBtn.disabled = false;
          alert('Failed to save notes. Please try again.');
        }
      });
      
      console.log('✅ Model details page initialized successfully');
      
    } catch (err) {
      console.error('❌ Error initializing model details:', err);
      container.innerHTML = '<div style="padding:16px;color:#c00;text-align:center;"><h2>Error Loading Model</h2><p>Something went wrong. Please refresh the page.</p><a href="models.html" style="color:#007bff;">← Back to Models</a></div>';
      container.style.opacity = '1';
    }
  }

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
})();
