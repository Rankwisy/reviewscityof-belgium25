const ADMIN_ROLES = ['admin', 'super_admin', 'city_admin', 'content_admin'];
const ADMIN_PERMISSIONS = [
  'admin:access',
  'admin:manage',
 'cities:manage',
  'listings:manage',
  'content:manage'
];

const normalizeValue = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  return [];
};

const getRoleNames = (user) => {
  if (!user) return [];
  const directRoles = normalizeValue(user.roles);
  const profileRoles = normalizeValue(user?.profile?.roles);
  const metadataRoles = normalizeValue(user?.metadata?.roles);
  const allRoles = [...directRoles, ...profileRoles, ...metadataRoles].map((role) =>
    typeof role === 'string' ? role.toLowerCase() : role
  );
  return Array.from(new Set(allRoles.filter(Boolean)));
};

const formatPermission = (permission) => {
  if (!permission) return null;
  if (typeof permission === 'string') return permission;
  if (typeof permission === 'object') {
    return permission.name || permission.key || null;
  }
  return null;
};

const getPermissionNames = (user) => {
  if (!user) return [];
  const possibleSources = [
    user.permissions,
    user?.profile?.permissions,
    user?.metadata?.permissions,
    user?.claims,
  ];

  const permissions = possibleSources.flatMap((source) =>
    normalizeValue(source).map(formatPermission)
  );

  const sanitized = permissions
    .filter(Boolean)
    .map((perm) => perm.toLowerCase());

  return Array.from(new Set(sanitized));
};

export const hasPermission = (user, permission) => {
  if (!permission) return true;
  const normalized = permission.toLowerCase();
  const permissions = getPermissionNames(user);
  const roles = getRoleNames(user);
  const hasWildcard = permissions.includes('*') || roles.includes('*');
  return hasWildcard || permissions.includes(normalized) || roles.includes(normalized);
};

export const hasAnyPermission = (user, permissions) => {
  if (!permissions || permissions.length === 0) {
    return true;
  }
  return permissions.some((permission) => hasPermission(user, permission));
};

export const canAccessAdmin = (user) => {
  if (!user) return false;
  if (hasPermission(user, 'admin:access')) return true;

  const roles = getRoleNames(user);
  const permissions = getPermissionNames(user);

  const hasAdminRole = roles.some((role) => ADMIN_ROLES.includes(role));
  const hasAdminPermission = permissions.some((permission) =>
    ADMIN_PERMISSIONS.includes(permission)
  );

  return hasAdminRole || hasAdminPermission;
};


