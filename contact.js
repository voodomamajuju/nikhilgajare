// contact.js (type="module")
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.public.js';

// Create supabase client if SDK present and config provided
function createSupabaseClient() {
  if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('YOUR_')) {
    try {
      return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (err) {
      console.warn('Supabase createClient failed:', err);
    }
  }
  return null;
}

function getFormData(form) {
  const fd = new FormData(form);
  return {
    name: fd.get('name')?.trim() || '',
    insta: fd.get('insta')?.trim() || '',
    whatsapp: fd.get('whatsapp')?.trim() || '',
    city: fd.get('city')?.trim() || '',
    landmark: fd.get('landmark')?.trim() || '',
    email: fd.get('email')?.trim() || '' // Add email field for duplicate detection
  };
}

// Optional helper: optionally save preliminary row to Supabase. Commented out by default.
// async function saveToSupabase(submission, supabaseClient) {
//   if (!supabaseClient) return null;
//   try {
//     const { data, error } = await supabaseClient.from('submissions').insert([submission]);
//     if (error) { console.error('Supabase insert error', error); return null; }
//     return data;
//   } catch (err) {
//     console.error('Supabase exception', err);
//     return null;
//   }
// }

function attachHandlers(supabaseClient) {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = getFormData(form);

    // 1) Save in localStorage for the multi-step flow
    localStorage.setItem('formData', JSON.stringify(data));

    // 2) Optionally insert now (commented)
    /*
    await saveToSupabase({
      name: data.name,
      insta: data.insta,
      whatsapp: data.whatsapp,
      chest: 0, bust: 0, waist: 0, hips: 0,
      height_feet: 0, height_inches: 0, age: 0,
      glam_makeup: false,
      city: data.city,
      landmark: data.landmark,
      photo_paths: []
    }, supabaseClient);
    */

    // 3) navigate to instructions / measurements page
    window.location.href = 'instructions.html';
  });
}

// Initialize once DOM is ready and SDK is loaded (deferred)
(async function init() {
  if (document.readyState === 'loading') {
    await new Promise(res => document.addEventListener('DOMContentLoaded', res));
  }

  const supabaseClient = createSupabaseClient();
  if (!supabaseClient) {
    console.info('Supabase client not available; operating in localStorage-only mode.');
  }

  attachHandlers(supabaseClient);
})();
