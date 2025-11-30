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

// Enhanced email validation - Whitelist approach with improved format checking
function validateEmail(email) {
  if (!email) return { valid: false, message: 'Email is required' };
  
  // Trim whitespace
  email = email.trim();
  
  // Check for common typos
  if (email.includes(' ')) {
    return { valid: false, message: 'Email cannot contain spaces' };
  }
  
  if (email.includes('..')) {
    return { valid: false, message: 'Email cannot contain consecutive dots' };
  }
  
  if (email.startsWith('.') || email.startsWith('@')) {
    return { valid: false, message: 'Email cannot start with . or @' };
  }
  
  if (email.endsWith('.') || email.endsWith('@')) {
    return { valid: false, message: 'Email cannot end with . or @' };
  }
  
  // Enhanced format validation - more strict
  const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email format (e.g., name@example.com)' };
  }
  
  // Check email length (RFC 5321 limit is 320 characters total, local part max 64, domain max 255)
  if (email.length > 320) {
    return { valid: false, message: 'Email is too long (maximum 320 characters)' };
  }
  
  const [localPart, domain] = email.split('@');
  if (localPart.length > 64) {
    return { valid: false, message: 'Email username part is too long' };
  }
  if (domain && domain.length > 255) {
    return { valid: false, message: 'Email domain is too long' };
  }
  
  // Check for valid TLD (at least 2 characters)
  const domainParts = domain?.split('.');
  if (!domainParts || domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
    return { valid: false, message: 'Email must have a valid domain (e.g., .com, .org)' };
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
  
  if (!domain) {
    return { valid: false, message: 'Email must contain @ symbol' };
  }
  
  // Debug logging
  console.log('Validating email:', email);
  console.log('Extracted domain:', domain);
  console.log('Domain in whitelist?', allowedDomains.includes(domain));
  
  // Check if domain is in whitelist
  if (!allowedDomains.includes(domain)) {
    console.log('Domain NOT in whitelist, blocking email');
    return { valid: false, message: `Email domain "${domain}" is not allowed. Please use a valid email provider.` };
  }
  
  console.log('Domain in whitelist, allowing email');
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

  // Add real-time email validation with visual feedback
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('emailError');
  const emailSuccess = document.getElementById('emailSuccess');
  
  if (emailInput) {
    // Validate on blur and input
    const validateEmailInput = () => {
      const email = emailInput.value.trim();
      
      // Hide previous messages
      if (emailError) emailError.style.display = 'none';
      if (emailSuccess) emailSuccess.style.display = 'none';
      
      if (!email) {
        emailInput.style.borderColor = '';
        emailInput.title = '';
        return;
      }
      
      const validation = validateEmail(email);
      if (!validation.valid) {
        emailInput.style.borderColor = '#dc3545';
        emailInput.title = validation.message;
        if (emailError) {
          emailError.textContent = validation.message;
          emailError.style.display = 'block';
        }
        if (emailSuccess) emailSuccess.style.display = 'none';
      } else {
        emailInput.style.borderColor = '#28a745';
        emailInput.title = 'Email looks good!';
        if (emailError) emailError.style.display = 'none';
        if (emailSuccess) emailSuccess.style.display = 'block';
      }
    };
    
    emailInput.addEventListener('blur', validateEmailInput);
    emailInput.addEventListener('input', function() {
      // Only show error on input if user has started typing and left the field
      if (this.value.length > 0 && document.activeElement !== this) {
        validateEmailInput();
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = getFormData(form);

    // Debug logging
    console.log('Form submitted with email:', data.email);
    
    // Validate email before proceeding
    const emailValidation = validateEmail(data.email);
    console.log('Email validation result:', emailValidation);
    
    if (!emailValidation.valid) {
      console.log('Email validation failed, showing alert');
      alert(`❌ Invalid email ID`);
      return;
    }
    
    console.log('Email validation passed, proceeding...');

    // Check if user is authenticated and email is verified
    if (supabaseClient) {
      try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (user) {
          // Check if email is verified
          if (!user.email_confirmed_at) {
            alert('⚠️ Please verify your email address before submitting. Check your inbox for the verification email.');
            return;
          }
          console.log('✅ User email is verified');
        } else if (userError) {
          console.log('User not authenticated, proceeding without verification check');
        }
      } catch (err) {
        console.error('Error checking email verification:', err);
        // Continue anyway if check fails
      }
    }

    // 1) Save in localStorage for the multi-step flow
    localStorage.setItem('formData', JSON.stringify(data));

    // 2) Preserve edit mode if we're editing
    const isEditMode = sessionStorage.getItem('editingSubmission') || sessionStorage.getItem('editingSubmissionId');
    if (isEditMode) {
      console.log('📝 Edit mode detected, preserving edit data through flow');
    }

    // 3) navigate to instructions / measurements page
    window.location.href = 'instructions.html';
  });
}

// Check for edit mode and pre-fill form
function loadEditMode() {
  try {
    const editingSubmissionData = sessionStorage.getItem('editingSubmission');
    if (editingSubmissionData) {
      const submission = JSON.parse(editingSubmissionData);
      console.log('📝 Loading edit mode with submission:', submission);
      
      // Pre-fill form fields
      const nameInput = document.getElementById('name');
      const instaInput = document.getElementById('insta');
      const whatsappInput = document.getElementById('whatsapp');
      const emailInput = document.getElementById('email');
      const cityInput = document.getElementById('city');
      const landmarkInput = document.getElementById('landmark');
      
      if (nameInput && submission.name) nameInput.value = submission.name;
      if (instaInput && submission.insta) instaInput.value = submission.insta;
      if (whatsappInput && submission.whatsapp) whatsappInput.value = submission.whatsapp;
      if (emailInput && submission.email) emailInput.value = submission.email;
      if (cityInput && submission.city) cityInput.value = submission.city;
      if (landmarkInput && submission.landmark) landmarkInput.value = submission.landmark;
      
      // Update page title
      const title = document.querySelector('h1.title');
      if (title) {
        title.textContent = 'Edit Your Submission';
      }
      
      // Store submission ID for later use
      if (submission.id) {
        sessionStorage.setItem('editingSubmissionId', submission.id);
      }
      
      // Keep the full submission data for the rest of the flow
      sessionStorage.setItem('editingSubmission', editingSubmissionData);
      
      console.log('✅ Form pre-filled with submission data');
    }
  } catch (err) {
    console.error('❌ Error loading edit mode:', err);
  }
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

  // Load edit mode if available
  loadEditMode();

  attachHandlers(supabaseClient);
})();
