// measurements.js (type="module")
// Handles the measurements form and saving to localStorage.
// No Supabase connection here by design.

function getSavedFormData() {
  try {
    return JSON.parse(localStorage.getItem('formData') || '{}') || {};
  } catch (err) {
    console.warn('Could not parse formData from localStorage:', err);
    return {};
  }
}

function saveFormData(obj) {
  try {
    localStorage.setItem('formData', JSON.stringify(obj));
  } catch (err) {
    console.error('Failed to save formData to localStorage:', err);
  }
}

function parseNumber(value, floatAllowed = true) {
  if (value === null || value === undefined || value === '') return null;
  return floatAllowed ? parseFloat(value) : parseInt(value, 10);
}

function attachHandlers() {
  const form = document.getElementById('measureForm');
  if (!form) {
    console.warn('measureForm not found on page');
    return;
  }

  const uploadLink = document.getElementById('uploadLink');
  const savedNotice = document.getElementById('savedNotice');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const saved = getSavedFormData();

    // Merge measurements into saved object
    Object.assign(saved, {
      chest: fd.get('chest') ? parseNumber(fd.get('chest'), true) : null,
      bust:  fd.get('bust')  ? parseNumber(fd.get('bust'), true)  : null,
      waist: fd.get('waist') ? parseNumber(fd.get('waist'), true) : null,
      hips:  fd.get('hips')  ? parseNumber(fd.get('hips'), true)  : null,
      height_feet:   fd.get('height_feet') ? parseNumber(fd.get('height_feet'), false) : null,
      height_inches: fd.get('height_inches') ? parseNumber(fd.get('height_inches'), false) : null,
      age:            fd.get('age') ? parseNumber(fd.get('age'), false) : null,
      saved_at: new Date().toISOString()
    });

    saveFormData(saved);

    // UI feedback: reveal upload link and saved notice if they exist
    if (uploadLink) uploadLink.style.display = 'inline-block';
    if (savedNotice) {
      savedNotice.style.display = 'block';
      // optionally hide notice after a short time
      setTimeout(() => { savedNotice.style.opacity = '0'; savedNotice.style.transition = 'opacity .4s'; }, 2200);
    }

    // smooth scroll to upload link if present
    if (uploadLink) uploadLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Auto-reveal if measurements are already present
  (function autoRevealIfSaved() {
    const saved = getSavedFormData();
    if (!saved) return;
    const hasMeasurements = [saved.chest, saved.bust, saved.waist, saved.hips]
      .some(v => v !== null && v !== undefined && v !== '');
    if (hasMeasurements && uploadLink) uploadLink.style.display = 'inline-block';
  })();
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachHandlers);
} else {
  attachHandlers();
}
