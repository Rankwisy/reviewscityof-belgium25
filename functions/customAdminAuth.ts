// Custom admin authentication functions
// This is a simple client-side authentication system for demo purposes
// In production, you should use proper server-side authentication

export function isAdminAuthenticated() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('adminAuthenticated') === 'true';
}

export function adminLogout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adminAuthenticated');
  localStorage.removeItem('adminUsername');
  window.location.href = '/';
}

export function getAdminUsername() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminUsername');
}