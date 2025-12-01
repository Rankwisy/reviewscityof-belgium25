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

export function requireAdminAuth(navigate, redirectTo = '/') {
  const authenticated = isAdminAuthenticated();
  if (!authenticated && typeof navigate === 'function') {
    navigate(redirectTo);
  }
  return authenticated;
}

