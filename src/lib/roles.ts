// Role-based access control system
export type UserRole = 'member' | 'voting_member' | 'admin' | 'super_admin';

export interface RolePermissions {
  canDiscuss: boolean;
  canUploadFiles: boolean;
  canUploadVideos: boolean;
  canViewDirectory: boolean;
  canEditOwnProfile: boolean;
  canVote: boolean;
  canEditOrgProfile: boolean;
  canModerateDiscussions: boolean;
  canManageFiles: boolean;
  canManageVideos: boolean;
  canEditOtherProfiles: boolean;
  canDeleteMembers: boolean;
  canDeleteOrganizations: boolean;
  canPromoteMembers: boolean;
  canDowngradeMembers: boolean;
  canPromoteToAdmin: boolean;
  canAccessAdmin: boolean;
}

// Define permissions for each role
const rolePermissions: Record<UserRole, RolePermissions> = {
  member: {
    canDiscuss: true,
    canUploadFiles: true,
    canUploadVideos: true,
    canViewDirectory: true,
    canEditOwnProfile: true,
    canVote: false,
    canEditOrgProfile: true, // Members can edit their own organization (authorization checked in updateMember)
    canModerateDiscussions: false,
    canManageFiles: false,
    canManageVideos: false,
    canEditOtherProfiles: false,
    canDeleteMembers: false,
    canDeleteOrganizations: false,
    canPromoteMembers: false,
    canDowngradeMembers: false,
    canPromoteToAdmin: false,
    canAccessAdmin: false,
  },
  voting_member: {
    canDiscuss: true,
    canUploadFiles: true,
    canUploadVideos: true,
    canViewDirectory: true,
    canEditOwnProfile: true,
    canVote: true,
    canEditOrgProfile: true,
    canModerateDiscussions: false,
    canManageFiles: false,
    canManageVideos: false,
    canEditOtherProfiles: false,
    canDeleteMembers: false,
    canDeleteOrganizations: false,
    canPromoteMembers: false,
    canDowngradeMembers: false,
    canPromoteToAdmin: false,
    canAccessAdmin: false,
  },
  admin: {
    canDiscuss: true,
    canUploadFiles: true,
    canUploadVideos: true,
    canViewDirectory: true,
    canEditOwnProfile: true,
    canVote: true,
    canEditOrgProfile: true,
    canModerateDiscussions: true,
    canManageFiles: true,
    canManageVideos: true,
    canEditOtherProfiles: true,
    canDeleteMembers: false,
    canDeleteOrganizations: false,
    canPromoteMembers: false,
    canDowngradeMembers: false,
    canPromoteToAdmin: false,
    canAccessAdmin: true,
  },
  super_admin: {
    canDiscuss: true,
    canUploadFiles: true,
    canUploadVideos: true,
    canViewDirectory: true,
    canEditOwnProfile: true,
    canVote: true,
    canEditOrgProfile: true,
    canModerateDiscussions: true,
    canManageFiles: true,
    canManageVideos: true,
    canEditOtherProfiles: true,
    canDeleteMembers: true,
    canDeleteOrganizations: true,
    canPromoteMembers: true,
    canDowngradeMembers: true,
    canPromoteToAdmin: true,
    canAccessAdmin: true,
  },
};

/**
 * Get permissions for a role
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  return rolePermissions[role] || rolePermissions.member;
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  const permissions = getRolePermissions(role);
  return permissions[permission] || false;
}

/**
 * Check if role can access admin panel
 */
export function canAccessAdmin(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

/**
 * Check if role can promote/demote members
 */
export function canManageRoles(role: UserRole): boolean {
  return role === 'super_admin';
}

/**
 * Check if role can delete members/organizations
 */
export function canDeleteMembers(role: UserRole): boolean {
  return role === 'super_admin';
}

/**
 * Check if role can moderate content
 */
export function canModerate(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

const ROLE_RANK: Record<UserRole, number> = {
  member: 0,
  voting_member: 1,
  admin: 2,
  super_admin: 3,
};

/**
 * When merging auth metadata (e.g. after login + profile link), keep the higher-privilege role
 * so linking never downgrades admin/super_admin/voting_member to member.
 */
export function maxPrivilegeRole(a: string | undefined, b: string | undefined): UserRole {
  const valid = (r: string | undefined): UserRole =>
    r === 'voting_member' || r === 'admin' || r === 'super_admin' ? r : 'member';
  const va = valid(a);
  const vb = valid(b);
  return ROLE_RANK[va] >= ROLE_RANK[vb] ? va : vb;
}

