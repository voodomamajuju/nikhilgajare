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

// Enhanced email validation - Whitelist approach
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
