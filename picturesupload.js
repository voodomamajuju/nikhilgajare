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
  
  email = email.trim();
  
  // Basic format validation
  const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email format' };
  }
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  // Filter out inappropriate content in email addresses
  const inappropriateWords = [
    // Profanity and offensive terms
    'fuck', 'fuckboy', 'fuckgirl', 'fucking', 'shit', 'asshole', 'bitch', 'bastard',
    'damn', 'hell', 'crap', 'piss', 'dick', 'cock', 'pussy', 'whore', 'slut',
    'nigger', 'nigga', 'retard', 'gay', 'lesbian', 'homo', 'fag', 'tranny',
    'kill', 'murder', 'death', 'suicide', 'bomb', 'terrorist', 'hack', 'scam',
    'spam', 'fake', 'test123', 'temp', 'temporary', 'throwaway', 'trash',
    'iamyourdad', 'iamyourmom', 'yourmom', 'yourdad', 'yourmum', 'yourfather',
    'lavdalasan', 'bullshit', 'stupid', 'idiot', 'moron', 'dumb', 'loser',
    'hate', 'stupid', 'ugly', 'fat', 'skinny', 'dumbass', 'ass', 'butt',
    'sex', 'porn', 'xxx', 'nude', 'naked', 'horny', 'sexy', 'hot', 'boobs',
    'drug', 'weed', 'cocaine', 'heroin', 'alcohol', 'drunk', 'high',
    'violence', 'gun', 'weapon', 'knife', 'blood', 'gore', 'torture'
  ];
  
  // Blacklist of known temporary/fake email services
  const fakeEmailDomains = [
    'tempmail.com', 'tempmail.net', 'tempmail.org', 'tempmail.co',
    '10minutemail.com', '10minutemail.net', '10minutemail.org',
    'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
    'mailinator.com', 'mailinator.net', 'mailinator.org',
    'throwaway.email', 'throwawaymail.com', 'throwawaymail.net',
    'fakemail.com', 'fakemail.net', 'fakemail.org',
    'temp-mail.org', 'temp-mail.com', 'temp-mail.net',
    'mohmal.com', 'mohmal.net', 'mohmal.org',
    'yopmail.com', 'yopmail.net', 'yopmail.org',
    'getnada.com', 'getnada.net', 'getnada.org',
    'maildrop.cc', 'maildrop.com', 'maildrop.net',
    'sharklasers.com', 'sharklasers.net', 'sharklasers.org',
    'trashmail.com', 'trashmail.net', 'trashmail.org',
    'dispostable.com', 'dispostable.net', 'dispostable.org',
    'meltmail.com', 'meltmail.net', 'meltmail.org',
    'mintemail.com', 'mintemail.net', 'mintemail.org',
    'mytrashmail.com', 'mytrashmail.net', 'mytrashmail.org',
    'tempail.com', 'tempail.net', 'tempail.org',
    'emailondeck.com', 'emailondeck.net', 'emailondeck.org',
    'mailcatch.com', 'mailcatch.net', 'mailcatch.org',
    'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org',
    'test.com', 'test.net', 'test.org', 'test123.com', 'test123.net',
    'example.com', 'example.net', 'example.org',
    'fake.com', 'fake.net', 'fake.org', 'fakemail.com',
    'dummy.com', 'dummy.net', 'dummy.org',
    'invalid.com', 'invalid.net', 'invalid.org'
  ];
  
  const emailLower = email.toLowerCase();
  const localPartLower = localPart.toLowerCase();
  const domainLower = domain.toLowerCase();
  
  // Check for fake/temporary email domains
  if (fakeEmailDomains.includes(domainLower)) {
    return { valid: false, message: 'Temporary or fake email addresses are not allowed. Please use a real email address.' };
  }
  
  // Check for inappropriate words in local part or domain
  for (const word of inappropriateWords) {
    if (localPartLower.includes(word) || domainLower.includes(word)) {
      return { valid: false, message: 'Email contains inappropriate content. Please use a professional email address.' };
    }
  }
  
  // Check for suspicious patterns (like random strings, numbers only, etc.)
  // Reject if local part is just numbers or very short random strings
  if (/^[0-9]+$/.test(localPart) && localPart.length < 5) {
    return { valid: false, message: 'Email appears to be invalid. Please use a real email address.' };
  }
  
  // Reject if local part is too short (likely fake)
  if (localPart.length < 3) {
    return { valid: false, message: 'Email address is too short. Please use a valid email address.' };
  }
  
  return { valid: true, message: 'Email looks good!' };
}

function setLoading(btn, on) {
  if (!btn) return;
  btn.disabled = on;
  btn.textContent = on ? 'Submitting…' : 'Save & Submit';
}

// Image compression function
async function compressImage(file, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        // Create new file with compressed data
        const compressedFile = new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        resolve(compressedFile);
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
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
  
  if (!submission || !submission.id) {
    throw new Error('No submission found to update');
  }
  
  console.log('🔄 Updating submission:', submission.id);
  
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
  const photoInput = document.getElementById('edit_photos');
  if (!photoInput) {
    console.error('❌ Photo input element not found!');
    throw new Error('Photo input element not found');
  }
  
  const photoFiles = Array.from(photoInput.files);
  let photoPaths = [...(submission.photo_paths || [])];
  
  console.log('📸 Photo files selected:', photoFiles.length);
  console.log('📸 Current photo paths:', photoPaths.length);
  
  if (photoFiles.length > 0) {
    // Extract the folder path from existing photos to keep the same path structure
    let profileFolder = null;
    if (submission.photo_paths && submission.photo_paths.length > 0) {
      // Get the folder path from the first existing photo
      const firstPhotoPath = submission.photo_paths[0];
      const pathParts = firstPhotoPath.split('/');
      if (pathParts.length > 1) {
        // Extract folder path (everything except the filename)
        profileFolder = pathParts.slice(0, -1).join('/');
        console.log('📁 Using existing folder path:', profileFolder);
      }
    }
    
    // If no existing photos, create new folder (shouldn't happen in edit mode, but fallback)
    if (!profileFolder) {
      const safeFolderName = submission.name 
        ? submission.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()
        : `profile_${submission.id}`;
      profileFolder = `submissions/${safeFolderName}_${Date.now().toString().slice(-6)}`;
      console.log('📁 Creating new folder path:', profileFolder);
    }
    
    // Upload new photos to the same folder
    for (const file of photoFiles) {
      const safeName = makeSafeFilename(file.name);
      const key = `${profileFolder}/${Date.now()}_${Math.random().toString(36).slice(2,8)}_${safeName}`;
      
      console.log('⬆️ Uploading new photo to existing folder:', key);
      
      // Compress image before upload
      const compressedFile = await compressImage(file);
      
      const { data, error } = await supabaseClient.storage.from(BUCKET_NAME).upload(key, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });
      
      if (error) throw new Error('Photo upload failed: ' + error.message);
      
      photoPaths.push(data.path);
      console.log('✅ Photo uploaded successfully:', data.path);
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

// Remove photo function - make it global and actually delete from storage
window.removePhoto = async function(index) {
  const submission = window.currentSubmission;
  if (!submission || !submission.photo_paths || !submission.photo_paths[index]) return;
  
  if (!confirm('Are you sure you want to remove this photo?')) return;
  
  const supabaseClient = getSupabaseClient();
  const photoPath = submission.photo_paths[index];
  
  // Delete from storage if Supabase client is available
  if (supabaseClient && photoPath) {
    try {
      // Use the photo path as-is (it should already be the correct storage path)
      const filePath = photoPath;
      console.log('🗑️ Attempting to delete photo from storage:', filePath);
      
      const { error } = await supabaseClient.storage.from(BUCKET_NAME).remove([filePath]);
      
      if (error) {
        console.error('❌ Error deleting photo from storage:', error);
        // Continue anyway - remove from array even if storage delete fails
        // (the file might already be deleted or path might be incorrect)
      } else {
        console.log('✅ Photo deleted from storage:', filePath);
      }
    } catch (err) {
      console.error('❌ Exception deleting photo from storage:', err);
      // Continue anyway - remove from array even if storage delete fails
    }
  }
  
  // Remove from array
  submission.photo_paths.splice(index, 1);
  
  // Update the current submission object
  window.currentSubmission = submission;
  
  // Refresh the form to show updated photos
  showEditForm();
  
  console.log('✅ Photo removed from submission');
};

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
  const MAX_FILES = 3;
  const MAX_SIZE_MB = 3;
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
  if (uploadNote) uploadNote.textContent = 'Up to 3 images • JPG/PNG • Max 3MB each';

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
        // Check if user is authenticated and email is verified before submission
        if (supabaseClient) {
          try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            
            if (session && session.user) {
              const user = session.user;
              // Check if email is verified (Supabase uses email_confirmed_at)
              const isEmailVerified = user.email_confirmed_at !== null;
              
              if (!isEmailVerified) {
                setLoading(submitBtn, false);
                alert('⚠️ Please verify your email address before submitting.\n\nCheck your inbox for the verification email sent during signup, or sign in again after verifying.');
                console.log('❌ Email not verified:', { 
                  email: user.email,
                  email_confirmed_at: user.email_confirmed_at
                });
                return;
              }
              console.log('✅ User email is verified:', user.email);
            } else {
              console.log('ℹ️ User not authenticated, proceeding without verification check');
            }
          } catch (err) {
            console.error('Error checking email verification:', err);
            // Continue if check fails
          }
        }
        
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

          // Create profile-specific folder using person's name
          const safeFolderName = saved.name 
            ? saved.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()
            : (saved.email ? saved.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '') : 'anonymous');
          const profileFolder = `submissions/${safeFolderName}_${Date.now().toString().slice(-6)}`;
          
          for (const f of files) {
            const safeName = makeSafeFilename(f.name);
            const key = `${profileFolder}/${Date.now()}_${Math.random().toString(36).slice(2,8)}_${safeName}`;
            console.log('⬆️ Uploading', f.name, '->', key);

            // Compress image before upload
            const compressedFile = await compressImage(f);
            
            console.log('📤 Uploading file:', {
              name: f.name,
              type: f.type,
              originalSize: f.size,
              compressedSize: compressedFile.size,
              compressionRatio: Math.round((1 - compressedFile.size / f.size) * 100) + '%'
            });

            const { data, error } = await supabaseClient.storage.from(BUCKET_NAME).upload(key, compressedFile, {
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
