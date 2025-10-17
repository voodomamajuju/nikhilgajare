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
  
  // Check for suspicious email patterns
  const suspiciousPatterns = [
    // Obvious fake usernames
    /^test\d*@/i, /^fake\d*@/i, /^dummy\d*@/i, /^sample\d*@/i,
    /^user\d*@/i, /^admin\d*@/i, /^root\d*@/i, /^guest\d*@/i,
    /^nobody@/i, /^someone@/i, /^anyone@/i, /^everyone@/i,
    /^random@/i, /^whatever@/i, /^something@/i, /^anything@/i,
    /^idontcare@/i, /^dontcare@/i, /^dontgiveashit@/i,
    /^lavdalasan@/i, /^fuckboy@/i, /^fuckgirl@/i,
    
    // Keyboard patterns and nonsense
    /^asdf@/i, /^qwerty@/i, /^zxcv@/i, /^hjkl@/i,
    /^123456@/i, /^abcdef@/i, /^aaaa@/i, /^1111@/i,
    /^asdfgh@/i, /^qwertyui@/i, /^zxcvbn@/i,
    
    // Single character or very short usernames
    /^[a-z]@/i, /^[0-9]@/i, /^.{1,2}@/i,
    
    // Repeated patterns
    /^(.{1,3})\1+@/i, // repeated short patterns like "aaa@", "abab@"
    
    // Suspicious domains
    /\.(test|fake|dummy|example|sample|temp|temporary|localhost|domain|website|site)\.(com|org|net)$/i,
    /\.(byebye|fuckboy|fuckgirl|sex|porn|xxx|adult|nsfw|inappropriate|vulgar|offensive)\.(com|org|net)$/i,
    
    // Common fake domains
    /@(test|fake|dummy|example|sample|temp|temporary|localhost|domain|website|site)\.(com|org|net)$/i,
    /@(byebye|fuckboy|fuckgirl|sex|porn|xxx|adult|nsfw|inappropriate|vulgar|offensive)\.(com|org|net)$/i,
    
    // No-reply patterns
    /^noreply@/i, /^no-reply@/i, /^donotreply@/i, /^do-not-reply@/i
  ];
  
  // Check for suspicious patterns and block them
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(email)) {
      return { valid: false, message: 'Invalid email ID' };
    }
  }
  
  // Additional check for inappropriate content anywhere in the email
  const inappropriateWords = [
    'fuck', 'shit', 'damn', 'hell', 'bitch', 'ass', 'piss', 'crap',
    'stupid', 'idiot', 'moron', 'loser', 'hate', 'kill', 'die',
    'sex', 'porn', 'xxx', 'adult', 'nsfw', 'inappropriate', 'vulgar', 'offensive'
  ];
  
  const emailLower = email.toLowerCase();
  for (const word of inappropriateWords) {
    if (emailLower.includes(word)) {
      return { valid: false, message: 'Invalid email ID' };
    }
  }
  
  // Check for suspicious domains (disposable + fake domains)
  const suspiciousDomains = [
    // Disposable email services
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
    'throwaway.email', 'temp-mail.org', 'sharklasers.com', 'grr.la',
    'guerrillamailblock.com', 'pokemail.net', 'spam4.me', 'bccto.me',
    'chacuo.net', 'dispostable.com', 'mailnesia.com', 'maildrop.cc',
    'mailcatch.com', 'inboxalias.com', 'mailmetrash.com', 'trashmail.net',
    'trashmail.com', 'spamgourmet.com', 'spam.la', 'binkmail.com',
    'bobmail.info', 'chammy.info', 'devnullmail.com', 'letthemeatspam.com',
    'mailin8r.com', 'mailinator2.com', 'notmailinator.com', 'reallymymail.com',
    'reconmail.com', 'safetymail.info', 'sogetthis.com', 'spamhereplease.com',
    'superrito.com', 'thisisnotmyrealemail.com', 'tradermail.info',
    'veryrealemail.com', 'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org',
    
    // Common fake domains
    'test.com', 'fake.com', 'dummy.com', 'example.com', 'sample.com',
    'temp.com', 'temporary.com', 'localhost.com', 'domain.com', 'website.com',
    'site.com', 'byebye.com', 'fuckboy.com', 'fuckgirl.com', 'sex.com',
    'porn.com', 'xxx.com', 'adult.com', 'nsfw.com', 'inappropriate.com',
    'vulgar.com', 'offensive.com', 'test.org', 'fake.org', 'dummy.org',
    'example.org', 'sample.org', 'temp.org', 'temporary.org', 'localhost.org',
    'domain.org', 'website.org', 'site.org', 'test.net', 'fake.net',
    'dummy.net', 'example.net', 'sample.net', 'temp.net', 'temporary.net',
    'localhost.net', 'domain.net', 'website.net', 'site.net'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (suspiciousDomains.includes(domain)) {
    return { valid: false, message: 'Invalid email ID' };
  }
  
  return { valid: true, message: 'Email looks good!' };
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
      alert(`❌ Invalid email ID`);
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
