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

// Enhanced email validation
function validateEmail(email) {
  if (!email) return { valid: false, message: 'Email is required' };
  
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email format' };
  }
  
  // Check for common fake email patterns
  const fakePatterns = [
    /test@/i,
    /fake@/i,
    /dummy@/i,
    /example@/i,
    /sample@/i,
    /temp@/i,
    /temporary@/i,
    /byebye\.com$/i,
    /fake\.com$/i,
    /test\.com$/i,
    /dummy\.com$/i,
    /example\.com$/i,
    /sample\.com$/i,
    /temp\.com$/i,
    /temporary\.com$/i,
    /idontcare@/i,
    /dontcare@/i,
    /whatever@/i,
    /random@/i,
    /noreply@/i,
    /no-reply@/i
  ];
  
  for (const pattern of fakePatterns) {
    if (pattern.test(email)) {
      return { valid: false, message: 'Please use a real email address' };
    }
  }
  
  // Check for suspicious domains (common disposable email domains)
  const suspiciousDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    'temp-mail.org',
    'sharklasers.com',
    'grr.la',
    'guerrillamailblock.com',
    'pokemail.net',
    'spam4.me',
    'bccto.me',
    'chacuo.net',
    'dispostable.com',
    'mailnesia.com',
    'maildrop.cc',
    'mailcatch.com',
    'inboxalias.com',
    'mailmetrash.com',
    'trashmail.net',
    'trashmail.com',
    'spamgourmet.com',
    'spam.la',
    'binkmail.com',
    'bobmail.info',
    'chammy.info',
    'devnullmail.com',
    'letthemeatspam.com',
    'mailin8r.com',
    'mailinator2.com',
    'notmailinator.com',
    'reallymymail.com',
    'reconmail.com',
    'safetymail.info',
    'sogetthis.com',
    'spamhereplease.com',
    'superrito.com',
    'thisisnotmyrealemail.com',
    'tradermail.info',
    'veryrealemail.com',
    'wegwerfmail.de',
    'wegwerfmail.net',
    'wegwerfmail.org'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (suspiciousDomains.includes(domain)) {
    return { valid: false, message: 'Please use a permanent email address, not a temporary one' };
  }
  
  return { valid: true, message: 'Email is valid' };
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

  // Add real-time email validation
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('blur', function() {
      const email = this.value.trim();
      if (email) {
        const validation = validateEmail(email);
        if (!validation.valid) {
          this.style.borderColor = '#dc3545';
          this.title = validation.message;
        } else {
          this.style.borderColor = '#28a745';
          this.title = 'Email looks good!';
        }
      } else {
        this.style.borderColor = '';
        this.title = '';
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = getFormData(form);

    // Validate email before proceeding
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.valid) {
      alert(`❌ ${emailValidation.message}`);
      return;
    }

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
