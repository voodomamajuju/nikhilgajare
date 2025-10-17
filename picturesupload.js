// picturesupload.js (type="module")
// Externalized from inline HTML; preserves original behavior exactly.

import { SUPABASE_URL, SUPABASE_ANON_KEY, STORAGE_BUCKET } from './config.public.js';

// Create or reuse supabase client
function getSupabaseClient() {
  if (!window.supabase) {
    console.warn('Supabase SDK missing on window.supabase');
    return null;
  }
  if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('YOUR_')) {
    try {
      return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      return null;
    }
  }
  // fallback to any global client if present
  return window.supabaseClient || null;
}

// util: sanitize filename for storage key
function makeSafeFilename(name) {
  return String(name)
    .replace(/\s+/g, '_')
    .replace(/[^\w\-.]/g, '');
}

// Enhanced email validation - Whitelist approach (same as contact.js)
function validateEmail(email) {
  if (!email) return { valid: false, message: 'Email is required' };
  
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email format' };
  }
  
  // Whitelist of popular, legitimate email domains
  const allowedDomains = [
    // Major email providers
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
    'aol.com', 'icloud.com', 'me.com', 'mac.com', 'protonmail.com',
    'yandex.com', 'mail.ru', 'zoho.com', 'fastmail.com',
    
    // Educational institutions (.edu domains)
    'harvard.edu', 'mit.edu', 'stanford.edu', 'berkeley.edu', 'ucla.edu',
    'nyu.edu', 'columbia.edu', 'cornell.edu', 'princeton.edu', 'yale.edu',
    'duke.edu', 'northwestern.edu', 'upenn.edu', 'brown.edu', 'dartmouth.edu',
    'vanderbilt.edu', 'rice.edu', 'wustl.edu', 'emory.edu', 'georgetown.edu',
    'carnegie.edu', 'cmu.edu', 'jhu.edu', 'usc.edu', 'ucsd.edu',
    'ucsb.edu', 'ucdavis.edu', 'uci.edu', 'ucsc.edu', 'ucr.edu',
    'caltech.edu', 'gatech.edu', 'umich.edu', 'illinois.edu', 'purdue.edu',
    'indiana.edu', 'wisconsin.edu', 'minnesota.edu', 'ohio.edu', 'psu.edu',
    'rutgers.edu', 'umd.edu', 'virginia.edu', 'vt.edu', 'ncsu.edu',
    'unc.edu', 'duke.edu', 'wfu.edu', 'clemson.edu', 'sc.edu',
    'uga.edu', 'fsu.edu', 'ufl.edu', 'miami.edu', 'fiu.edu',
    'ut.edu', 'tamu.edu', 'utdallas.edu', 'uh.edu', 'rice.edu',
    'baylor.edu', 'tcu.edu', 'smu.edu', 'ttu.edu', 'utep.edu',
    'asu.edu', 'uofa.edu', 'nau.edu', 'unlv.edu', 'unr.edu',
    'ucolorado.edu', 'csu.edu', 'du.edu', 'colorado.edu', 'utah.edu',
    'byu.edu', 'usu.edu', 'wsu.edu', 'uw.edu', 'oregon.edu',
    'osu.edu', 'pdx.edu', 'uoregon.edu', 'oregonstate.edu', 'alaska.edu',
    'hawaii.edu', 'manoa.edu', 'hilo.edu', 'westoahu.edu', 'kapi.edu',
    
    // International domains
    'gmail.co.uk', 'yahoo.co.uk', 'hotmail.co.uk', 'outlook.co.uk',
    'gmail.ca', 'yahoo.ca', 'hotmail.ca', 'outlook.ca',
    'gmail.com.au', 'yahoo.com.au', 'hotmail.com.au', 'outlook.com.au',
    'gmail.de', 'yahoo.de', 'hotmail.de', 'outlook.de',
    'gmail.fr', 'yahoo.fr', 'hotmail.fr', 'outlook.fr',
    'gmail.it', 'yahoo.it', 'hotmail.it', 'outlook.it',
    'gmail.es', 'yahoo.es', 'hotmail.es', 'outlook.es',
    'gmail.in', 'yahoo.in', 'hotmail.in', 'outlook.in',
    'gmail.co.in', 'yahoo.co.in', 'hotmail.co.in', 'outlook.co.in',
    'rediffmail.com', 'sify.com', 'indiatimes.com', 'vsnl.com',
    'gmail.co.jp', 'yahoo.co.jp', 'hotmail.co.jp', 'outlook.co.jp',
    'gmail.co.kr', 'yahoo.co.kr', 'hotmail.co.kr', 'outlook.co.kr',
    'gmail.com.br', 'yahoo.com.br', 'hotmail.com.br', 'outlook.com.br',
    'gmail.com.mx', 'yahoo.com.mx', 'hotmail.com.mx', 'outlook.com.mx',
    
    // Corporate domains (common ones)
    'microsoft.com', 'apple.com', 'google.com', 'amazon.com', 'facebook.com',
    'twitter.com', 'linkedin.com', 'salesforce.com', 'oracle.com', 'ibm.com',
    'intel.com', 'nvidia.com', 'adobe.com', 'cisco.com', 'vmware.com',
    'netflix.com', 'spotify.com', 'uber.com', 'airbnb.com', 'tesla.com',
    'spacex.com', 'paypal.com', 'stripe.com', 'square.com', 'shopify.com',
    'dropbox.com', 'box.com', 'slack.com', 'zoom.us', 'teams.microsoft.com',
    'github.com', 'gitlab.com', 'bitbucket.org', 'atlassian.com', 'jira.com',
    'trello.com', 'asana.com', 'notion.so', 'figma.com', 'canva.com',
    'mailchimp.com', 'hubspot.com', 'zendesk.com', 'intercom.com', 'freshworks.com',
    'twilio.com', 'sendgrid.com', 'mailgun.com', 'postmark.com', 'mandrill.com',
    
    // Government domains
    'gov.in', 'gov.uk', 'gov.ca', 'gov.au', 'gov.de', 'gov.fr', 'gov.it',
    'gov.es', 'gov.jp', 'gov.kr', 'gov.br', 'gov.mx', 'gov.us', 'gov.com',
    
    // Non-profit organizations
    'org', 'ngo', 'foundation', 'charity', 'un.org', 'who.int', 'unicef.org',
    'redcross.org', 'doctorswithoutborders.org', 'amnesty.org', 'greenpeace.org',
    'wwf.org', 'nature.org', 'sierraclub.org', 'audubon.org', 'nrdc.org'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  
  // Check if domain is in whitelist
  if (!allowedDomains.includes(domain)) {
    return { valid: false, message: 'Invalid email ID' };
  }
  
  return { valid: true, message: 'Email looks good!' };
}

function setLoading(btn, on) {
  if (!btn) return;
  btn.disabled = on;
  btn.textContent = on ? 'Submitting…' : 'Save & Submit';
}

// Check if user already has a submission
async function checkExistingSubmission() {
  try {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      console.warn('Supabase client not available for checking existing submissions');
      return { exists: false };
    }

    // First check if user is authenticated
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (user) {
      // Check by user account
      const { data: userSubmission, error: userError } = await supabaseClient
        .from('submissions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (userSubmission && !userError) {
        console.log('Found existing submission by user account:', userSubmission);
        return { 
          exists: true, 
          submission: userSubmission, 
          method: 'user_account',
          user: user 
        };
      }
    }
    
    // If no user account submission, check by email from localStorage
    const savedData = JSON.parse(localStorage.getItem('formData') || '{}');
    const email = savedData.email || document.getElementById('email')?.value;
    if (email) {
      const { data: emailSubmission, error: emailError } = await supabaseClient
        .from('submissions')
        .select('*')
        .eq('email', email)
        .maybeSingle();
        
      if (emailSubmission && !emailError) {
        console.log('Found existing submission by email:', emailSubmission);
        return { 
          exists: true, 
          submission: emailSubmission, 
          method: 'email',
          email: email 
        };
      }
    }
    
    console.log('No existing submission found');
    return { exists: false };
  } catch (error) {
    console.error('Error checking existing submission:', error);
    return { exists: false, error };
  }
}

// Show "Already Submitted" message
function showAlreadySubmittedMessage(checkResult) {
  const formContainer = document.querySelector('.page');
  if (!formContainer) return;
  
  const submission = checkResult.submission;
  const method = checkResult.method;
  
  formContainer.innerHTML = `
    <section class="card" style="max-width: 600px; margin: 0 auto;">
      <div class="already-submitted-container">
        <div class="already-submitted-card">
          <div class="success-icon">✅</div>
          <h2>Submission Complete!</h2>
          <p class="submission-info">
            You've already submitted your model application.
            <br><small>${method === 'user_account' ? 'Account: ' + checkResult.user.email : 'Email: ' + checkResult.email}</small>
          </p>
          
          <div class="submission-details">
            <h3>Your Submission Details:</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">${submission.name || 'Not provided'}</span>
            </div>
            <div class="detail-row">
              <span class="label">City:</span>
              <span class="value">${submission.city || 'Not provided'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Submitted:</span>
              <span class="value">${new Date(submission.saved_at).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Photos:</span>
              <span class="value">
                ${submission.photo_paths && submission.photo_paths.length > 0 
                  ? `${submission.photo_paths.length} uploaded` 
                  : 'No photos uploaded'}
              </span>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="showEditForm()">
              ✏️ Edit Submission
            </button>
            <button class="btn btn-secondary" onclick="window.location.href='login.html'">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}

// Show Edit Mode
function showEditForm() {
  const formContainer = document.querySelector('.page');
  if (!formContainer) return;
  
  const submission = window.currentSubmission;
  if (!submission) {
    console.error('No current submission found for editing');
    return;
  }
  
  formContainer.innerHTML = `
    <section class="card" aria-labelledby="title">
      <header class="header">
        <div class="brand">
          <span class="brand-script">Nikhil Gajare</span>
        </div>
        <h1 id="title" class="title">Edit Submission</h1>
        <p class="subtitle">Update your model application</p>
      </header>

      <form id="editForm" class="form" novalidate>
        <div class="field">
          <label for="edit_name" class="label">Name</label>
          <input id="edit_name" name="name" type="text" required placeholder="Your full name" class="input"
            autocomplete="name" value="${submission.name || ''}" />
        </div>

        <div class="field">
          <label for="edit_insta" class="label">Instagram handle</label>
          <input id="edit_insta" name="insta" type="text" class="input" placeholder="@yourusername"
            pattern="^@?[A-Za-z0-9._]{1,30}$"
            title="Instagram ID can start with @ and may only contain letters, numbers, periods, and underscores (max 30 characters)"
            required autocomplete="on" value="${submission.insta || ''}" />
        </div>

        <div class="field">
          <label for="edit_whatsapp" class="label">WhatsApp Number</label>
          <input id="edit_whatsapp" name="whatsapp" type="tel" placeholder="+91 98765 43210" pattern="[0-9+\-\s]{7,15}"
            class="input" required value="${submission.whatsapp || ''}" />
        </div>

        <div class="field">
          <label for="edit_city" class="label">City</label>
          <input id="edit_city" name="city" type="text" required placeholder="Your city" class="input"
            autocomplete="address-level2" value="${submission.city || ''}" />
        </div>

        <div class="field">
          <label for="edit_landmark" class="label">Landmark</label>
          <input id="edit_landmark" name="landmark" type="text" required placeholder="Nearest landmark" class="input"
            autocomplete="address-line1" value="${submission.landmark || ''}" />
        </div>

        <div class="field">
          <label for="edit_age" class="label">Age</label>
          <input id="edit_age" name="age" type="number" required placeholder="Your age" class="input"
            min="18" max="35" value="${submission.age || ''}" />
        </div>

        <div class="field">
          <label for="edit_height_feet" class="label">Height (Feet)</label>
          <input id="edit_height_feet" name="height_feet" type="number" required placeholder="5" class="input"
            min="4" max="7" value="${submission.height_feet || ''}" />
        </div>

        <div class="field">
          <label for="edit_height_inches" class="label">Height (Inches)</label>
          <input id="edit_height_inches" name="height_inches" type="number" required placeholder="6" class="input"
            min="0" max="11" value="${submission.height_inches || ''}" />
        </div>

        <div class="field">
          <label for="edit_chest" class="label">Chest (inches)</label>
          <input id="edit_chest" name="chest" type="number" required placeholder="36" class="input"
            step="0.1" min="28" max="48" value="${submission.chest || ''}" />
        </div>

        <div class="field">
          <label for="edit_bust" class="label">Bust (inches)</label>
          <input id="edit_bust" name="bust" type="number" required placeholder="36" class="input"
            step="0.1" min="28" max="48" value="${submission.bust || ''}" />
        </div>

        <div class="field">
          <label for="edit_waist" class="label">Waist (inches)</label>
          <input id="edit_waist" name="waist" type="number" required placeholder="28" class="input"
            step="0.1" min="22" max="40" value="${submission.waist || ''}" />
        </div>

        <div class="field">
          <label for="edit_hips" class="label">Hips (inches)</label>
          <input id="edit_hips" name="hips" type="number" required placeholder="36" class="input"
            step="0.1" min="28" max="48" value="${submission.hips || ''}" />
        </div>

        <div class="field">
          <label class="label">Current Photos:</label>
          ${submission.photo_paths && submission.photo_paths.length > 0 ? `
          <div id="existing-photos" class="existing-photos-grid">
            ${submission.photo_paths.map((path, index) => `
              <div class="existing-photo-item">
                <img src="${supabaseClient?.supabaseUrl || SUPABASE_URL}/storage/v1/object/public/uploads/${path}" 
                     alt="Photo ${index + 1}" 
                     onerror="this.src='my-background.jpg'">
                <button class="remove-photo-btn" onclick="removePhoto(${index})">❌</button>
              </div>
            `).join('')}
          </div>
          ` : `
          <div style="text-align:center;padding:20px;background:#f8f9fa;border-radius:8px;">
            <img src="default-avatar.svg" 
                 alt="Default Avatar" 
                 style="width:80px;height:80px;border-radius:50%;margin:0 auto 10px;display:block;opacity:0.7;" />
            <p style="color:#6c757d;margin:0;font-size:0.9rem;">No photos uploaded yet</p>
          </div>
          `}
        </div>

        <div class="field">
          <label for="edit_photos" class="label">Add More Photos (optional)</label>
          <input id="edit_photos" name="makeup_pics" type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp" class="input" />
          <small class="help-text">You can upload up to ${MAX_FILES} additional images (${MAX_SIZE_MB}MB max each)</small>
        </div>

        <div class="field">
          <label class="label">Glam Makeup</label>
          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" name="glam_makeup" value="yes" ${submission.glam_makeup ? 'checked' : ''} />
              <span>Yes</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="glam_makeup" value="no" ${!submission.glam_makeup ? 'checked' : ''} />
              <span>No</span>
            </label>
          </div>
        </div>

        <div class="edit-actions">
          <button type="submit" class="btn btn-primary" id="updateBtn">
            💾 Update Submission
          </button>
          <button type="button" class="btn btn-secondary" onclick="cancelEdit()">
            ❌ Cancel Edit
          </button>
        </div>
      </form>
    </section>
  `;
  
  // Attach edit form handler
  attachEditFormHandler();
}

// Attach edit form submission handler
function attachEditFormHandler() {
  const editForm = document.getElementById('editForm');
  const updateBtn = document.getElementById('updateBtn');
  
  if (!editForm || !updateBtn) return;
  
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading(updateBtn, true);
    
    try {
      await updateSubmission();
    } catch (error) {
      console.error('Update error:', error);
      alert('Error updating submission: ' + error.message);
    } finally {
      setLoading(updateBtn, false);
    }
  });
}

// Update submission function
async function updateSubmission() {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    throw new Error('Supabase client not available');
  }
  
  const formData = new FormData(document.getElementById('editForm'));
  const submission = window.currentSubmission;
  
  // Prepare update data
  const updateData = {
    name: formData.get('name'),
    insta: formData.get('insta'),
    whatsapp: formData.get('whatsapp'),
    city: formData.get('city'),
    landmark: formData.get('landmark'),
    age: parseInt(formData.get('age')),
    height_feet: parseInt(formData.get('height_feet')),
    height_inches: parseInt(formData.get('height_inches')),
    chest: parseFloat(formData.get('chest')),
    bust: parseFloat(formData.get('bust')),
    waist: parseFloat(formData.get('waist')),
    hips: parseFloat(formData.get('hips')),
    glam_makeup: formData.get('glam_makeup') === 'yes',
    updated_at: new Date().toISOString()
  };
  
  // Handle photo updates
  const photoFiles = Array.from(document.getElementById('edit_photos').files);
  let photoPaths = [...(submission.photo_paths || [])];
  
  if (photoFiles.length > 0) {
    // Upload new photos
    for (const file of photoFiles) {
      const safeName = makeSafeFilename(file.name);
      const key = `submissions/${Date.now()}_${Math.random().toString(36).slice(2,8)}_${safeName}`;
      
      const { data, error } = await supabaseClient.storage.from(BUCKET_NAME).upload(key, file, {
        cacheControl: '3600',
        upsert: false
      });
      
      if (error) throw new Error('Photo upload failed: ' + error.message);
      
      photoPaths.push(data.path);
    }
  }
  
  updateData.photo_paths = photoPaths;
  
  // Update submission in database
  const { data, error } = await supabaseClient
    .from('submissions')
    .update(updateData)
    .eq('id', submission.id)
    .select()
    .single();
    
  if (error) throw new Error('Database update failed: ' + error.message);
  
  // Update current submission
  window.currentSubmission = data;
  
  // Show success message
  alert('✅ Submission updated successfully!');
  
  // Optionally redirect to thank you page
  setTimeout(() => {
    window.location.href = 'thankyou.html';
  }, 2000);
}

// Cancel edit and go back to already submitted view
function cancelEdit() {
  if (window.currentCheckResult) {
    showAlreadySubmittedMessage(window.currentCheckResult);
  } else {
    window.location.href = 'login.html';
  }
}

// Remove photo function
function removePhoto(index) {
  const submission = window.currentSubmission;
  if (!submission || !submission.photo_paths) return;
  
  if (confirm('Are you sure you want to remove this photo?')) {
    submission.photo_paths.splice(index, 1);
    showEditForm(); // Refresh the form
  }
}

// main logic: attach UI handlers + submit handler
async function init() {
  // wait DOM ready
  if (document.readyState === 'loading') {
    await new Promise(res => document.addEventListener('DOMContentLoaded', res));
  }

  // DOM elements
  const glamYes = document.getElementById('glamYes');
  const glamNo = document.getElementById('glamNo');
  const uploadBlock = document.getElementById('glam-upload');
  const fileInput = document.getElementById('makeup-pics');
  const uploadNote = document.getElementById('upload-note');
  const submitBtn = document.getElementById('submitBtn');
  const glamForm = document.getElementById('glamForm');

  // constants (same as original)
  const MAX_FILES = 5;
  const MAX_SIZE_MB = 5;
  const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;
  const ALLOWED_EXT = /\.(jpe?g|png)$/i;
  const BUCKET_NAME = STORAGE_BUCKET || 'uploads'; // prefer STORAGE_BUCKET from config.js

  // UI toggle function (keeps exact behavior)
  function updateGlam() {
    if (glamYes && glamYes.checked) {
      uploadBlock.classList.remove('hidden');
      uploadBlock.setAttribute('aria-hidden', 'false');
      fileInput.disabled = false;
      fileInput.required = true;
    } else {
      uploadBlock.classList.add('hidden');
      uploadBlock.setAttribute('aria-hidden', 'true');
      fileInput.disabled = true;
      fileInput.required = false;
      // clear selected files (reset input)
      try { fileInput.value = ''; } catch (e) {}
    }
  }

  // wire toggles (safe guards if elements missing)
  if (glamYes) glamYes.addEventListener('change', updateGlam);
  if (glamNo) glamNo.addEventListener('change', updateGlam);

  // set upload note text if element exists
  if (uploadNote) uploadNote.textContent = 'Up to 5 images • JPG/PNG • Max 5MB each';

  // initial UI state
  updateGlam();

  // Supabase client
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    console.info('Supabase client not available — uploads/inserts will fail if attempted.');
  } else {
    // store client on window for possible reuse (keeps parity with original)
    if (!window.supabaseClient) window.supabaseClient = supabaseClient;
  }

  // Check if we're coming from thank you page with edit request
  const editingSubmissionData = sessionStorage.getItem('editingSubmission');
  if (editingSubmissionData) {
    try {
      const submission = JSON.parse(editingSubmissionData);
      window.currentSubmission = submission;
      window.currentCheckResult = { 
        exists: true, 
        submission: submission, 
        method: 'session_storage' 
      };
      
      // Clear the session data
      sessionStorage.removeItem('editingSubmission');
      
      // Show edit form directly
      showEditForm();
      return;
    } catch (error) {
      console.error('Error parsing editing submission data:', error);
      sessionStorage.removeItem('editingSubmission');
    }
  }

  // Check if we're editing by submission ID (from user-access.html)
  const editingSubmissionId = sessionStorage.getItem('editingSubmissionId');
  if (editingSubmissionId) {
    try {
      console.log('🔍 Loading submission for editing by ID:', editingSubmissionId);
      
      // Fetch the submission from database
      const { data: submission, error } = await supabaseClient
        .from('submissions')
        .select('*')
        .eq('id', editingSubmissionId)
        .single();
      
      if (error) {
        console.error('Error fetching submission for edit:', error);
        showStatus('Error loading submission for editing: ' + error.message, true);
        sessionStorage.removeItem('editingSubmissionId');
        return;
      }
      
      if (submission) {
        window.currentSubmission = submission;
        window.currentCheckResult = { 
          exists: true, 
          submission: submission, 
          method: 'submission_id' 
        };
        
        // Clear the session data
        sessionStorage.removeItem('editingSubmissionId');
        
        // Show edit form directly
        showEditForm();
        return;
      }
    } catch (error) {
      console.error('Error loading submission by ID:', error);
      sessionStorage.removeItem('editingSubmissionId');
    }
  }

  // Check for existing submission first
  const checkResult = await checkExistingSubmission();
  
  if (checkResult.exists) {
    // Store current submission and check result for editing
    window.currentSubmission = checkResult.submission;
    window.currentCheckResult = checkResult;
    
    // Show already submitted message
    showAlreadySubmittedMessage(checkResult);
    return;
  }

  // submit handler (keeps exact workflow)
  if (glamForm) {
    glamForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      setLoading(submitBtn, true);
      console.clear();
      console.log('▶️ Submit clicked');

      try {
        // load saved contact+measure data from localStorage
        const saved = JSON.parse(localStorage.getItem('formData') || '{}');

        // read form data
        const fd = new FormData(glamForm);
        const glamChoice = fd.get('glam_makeup') === 'yes';

        // files
        const files = fd.getAll('makeup_pics').filter(f => f && f.size);
        console.log('Files selected:', files.length);

        // validate files if glam yes
        if (glamChoice) {
          if (files.length === 0) {
            // Ask user to either upload or confirm they want to proceed without photos
            if (!confirm('You selected "Yes" for Glam Makeup but did not choose any images. Continue without photos?')) {
              setLoading(submitBtn, false);
              return;
            }
          }

          if (files.length > MAX_FILES) throw new Error(`You can upload up to ${MAX_FILES} images.`);

          for (const f of files) {
            if (!ALLOWED_EXT.test(f.name)) throw new Error(`File type not allowed: ${f.name}`);
            if (f.size > MAX_BYTES) throw new Error(`File ${f.name} exceeds ${MAX_SIZE_MB}MB.`);
            
            // Additional MIME type validation for better compatibility
            const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (f.type && !allowedMimeTypes.includes(f.type.toLowerCase())) {
              console.warn(`File ${f.name} has MIME type ${f.type}, but we'll allow it anyway`);
            }
          }
        }

        // upload files (if any)
        const paths = [];
        if (files.length > 0) {
          if (!supabaseClient) throw new Error('Supabase client not available for uploads.');

          for (const f of files) {
            const safeName = makeSafeFilename(f.name);
            const key = `submissions/${Date.now()}_${Math.random().toString(36).slice(2,8)}_${safeName}`;
            console.log('⬆️ Uploading', f.name, '->', key);

            console.log('📤 Uploading file:', {
              name: f.name,
              type: f.type,
              size: f.size,
              key: key
            });

            const { data, error } = await supabaseClient.storage.from(BUCKET_NAME).upload(key, f, {
              cacheControl: '3600',
              upsert: false
            });

            if (error) {
              console.error('Upload error', error);
              throw new Error(error.message || 'Upload failed');
            }

            paths.push(data.path);
          }
          console.log('Uploaded paths:', paths);
        }

        // merge saved + glam + paths
        Object.assign(saved, {
          glam_makeup: glamChoice,
          photo_paths: paths
        });

        // Add user_id if authenticated
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          saved.user_id = user.id;
        }

        // Validate email before database insert
        const emailValidation = validateEmail(saved.email);
        if (!emailValidation.valid) {
          throw new Error(`Email validation failed: ${emailValidation.message}`);
        }

        // Insert into DB (submissions table)
        if (!supabaseClient) throw new Error('Supabase client not available for DB insert.');

        const { data: insertData, error: insertErr } = await supabaseClient.from('submissions').insert(saved).select();
        if (insertErr) {
          console.error('Insert error', insertErr);
          throw new Error(insertErr.message || 'Save failed');
        }

        // success: clear localStorage and redirect
        localStorage.removeItem('formData');
        alert('✅ Saved! Redirecting to thank you page.');
        window.location.href = 'thankyou.html';
      } catch (err) {
        console.error('Submit error', err);
        alert('Error: ' + (err.message || JSON.stringify(err)));
      } finally {
        setLoading(submitBtn, false);
      }
    });
  } else {
    console.warn('glamForm not found on the page — submit handler not attached.');
  }
}

// run init
init().catch(err => console.error('picturesupload.init error', err));
