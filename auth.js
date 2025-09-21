// auth.js - Authentication helper for all pages
// --- Supabase Init ---
let supabaseClient = null;

try {
  const cfg = await import('./config.public.js');
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = cfg;

  if (typeof SUPABASE_URL === 'string' && typeof SUPABASE_ANON_KEY === 'string') {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabase = supabaseClient;
    console.log("✅ Supabase initialized for auth:", SUPABASE_URL);
  } else {
    console.error("❌ Invalid Supabase config values", { SUPABASE_URL, SUPABASE_ANON_KEY });
  }
} catch (e) {
  console.error("❌ Failed to initialize Supabase for auth. Make sure config.public.js exists and exports SUPABASE_URL and SUPABASE_ANON_KEY.", e);
}

// Authentication helper functions
export const auth = {
  // Check if user is authenticated
  async isAuthenticated() {
    if (!supabaseClient) return false;
    
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    return !error && !!session;
  },

  // Get current user
  async getCurrentUser() {
    if (!supabaseClient) return null;
    
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    return error ? null : user;
  },

  // Get user role (admin or user)
  getUserRole() {
    return sessionStorage.getItem('userRole') || 'user';
  },

  // Set user role
  setUserRole(role) {
    sessionStorage.setItem('userRole', role);
  },

  // Check if user is admin
  isAdmin() {
    return this.getUserRole() === 'admin';
  },

  // Sign out
  async signOut() {
    if (!supabaseClient) return;
    
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      return false;
    }
    
    // Clear session data
    sessionStorage.removeItem('userRole');
    return true;
  },

  // Require authentication - redirect to login if not authenticated
  async requireAuth(redirectTo = 'login.html') {
    const isAuth = await this.isAuthenticated();
    if (!isAuth) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },

  // Require admin access
  async requireAdmin(redirectTo = 'login.html') {
    const isAuth = await this.requireAuth();
    if (!isAuth) return false;
    
    const isAdmin = this.isAdmin();
    if (!isAdmin) {
      alert('Admin access required');
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },

  // Listen for auth state changes
  onAuthStateChange(callback) {
    if (!supabaseClient) return;
    
    return supabaseClient.auth.onAuthStateChange(callback);
  },

  // Get user profile from profiles table
  async getUserProfile() {
    if (!supabaseClient) return null;
    
    const user = await this.getCurrentUser();
    if (!user) return null;
    
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return error ? null : data;
  },

  // Update user profile
  async updateUserProfile(updates) {
    if (!supabaseClient) return false;
    
    const user = await this.getCurrentUser();
    if (!user) return false;
    
    const { error } = await supabaseClient
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        updated_at: new Date().toISOString(),
        ...updates
      });
    
    return !error;
  }
};

// Auto-redirect logic for protected pages
document.addEventListener('DOMContentLoaded', async () => {
  // Check if we're on a protected page
  const protectedPages = ['models.html', 'modeldetails.html', 'admin.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  if (protectedPages.includes(currentPage)) {
    const isAuth = await auth.isAuthenticated();
    if (!isAuth) {
      console.log('🔒 Not authenticated, redirecting to login');
      window.location.href = 'login.html';
      return;
    }
    
    // For admin pages, check admin access
    if (currentPage === 'admin.html') {
      const isAdmin = auth.isAdmin();
      if (!isAdmin) {
        console.log('🔒 Admin access required, redirecting to index');
        window.location.href = 'login.html';
        return;
      }
    }
    
    console.log('✅ Authentication verified for', currentPage);
  }
});

// Export supabaseClient for other modules
export { supabaseClient };
