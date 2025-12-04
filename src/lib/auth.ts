// Authentication with Supabase - 100% cloud-based, no localStorage
import { supabase } from './supabase';
import { autoLinkUserToMember } from './memberMatching';

import { UserRole } from './roles';

export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  role: UserRole;
  isVotingRep: boolean;
  profilePicture?: string;
}

// Current user state (in-memory only, no localStorage)
let currentUser: User | null = null;

// Initialize from Supabase session on load
if (typeof window !== 'undefined') {
  // Check Supabase session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      // Set user immediately (don't block on auto-linking)
      currentUser = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        organizationId: session.user.user_metadata?.organization_id || '',
        role: (session.user.user_metadata?.role || 'member') as UserRole,
        isVotingRep: session.user.user_metadata?.is_voting_rep || false,
        profilePicture: session.user.user_metadata?.profile_picture,
      };
      
      // Auto-link user to member profile in background (non-blocking)
      if (!session.user.user_metadata?.organization_id && session.user.email) {
        const existingRole = session.user.user_metadata?.role;
        autoLinkUserToMember(session.user.email, session.user.id, existingRole).catch(error => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error auto-linking user (non-blocking):', error);
          }
        });
      }
    }
  }).catch(error => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting session:', error);
    }
  });

  // Listen for auth changes (debounced to reduce excessive re-renders)
  let authChangeTimeout: NodeJS.Timeout | null = null;
  supabase.auth.onAuthStateChange((_event, session) => {
    // Debounce auth state changes to reduce re-renders
    if (authChangeTimeout) {
      clearTimeout(authChangeTimeout);
    }
    
    authChangeTimeout = setTimeout(() => {
      if (session?.user) {
        const role = session.user.user_metadata?.role || 'member';
        
        // Set user immediately (don't block on auto-linking)
        currentUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          organizationId: session.user.user_metadata?.organization_id || '',
          role: role,
          isVotingRep: session.user.user_metadata?.is_voting_rep || false,
        };
        
        // Auto-link user to member profile in background (non-blocking)
        if (!session.user.user_metadata?.organization_id && session.user.email) {
          const existingRole = session.user.user_metadata?.role;
          autoLinkUserToMember(session.user.email, session.user.id, existingRole).catch(error => {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error auto-linking user (non-blocking):', error);
            }
          });
        }
      } else {
        currentUser = null;
      }
    }, 100); // 100ms debounce
  });
}

// Get current user
export function getCurrentUser(): User | null {
  return currentUser;
}

// Set current user (updates in-memory state only, Supabase session is source of truth)
export function setCurrentUser(user: User | null): void {
  currentUser = user;
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  if (currentUser) {
    return true;
  }
  
  // Check Supabase session
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const role = session.user.user_metadata?.role || 'member';
      
      // Update current user from session
      currentUser = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        organizationId: session.user.user_metadata?.organization_id || '',
        role: role,
        isVotingRep: session.user.user_metadata?.is_voting_rep || false,
      };
      return true;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error checking authentication:', error);
    }
  }
  
  return false;
}

// Login function (uses Supabase)
export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  if (data.user) {
    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
      organizationId: data.user.user_metadata?.organization_id || '',
      role: data.user.user_metadata?.role || 'member',
      isVotingRep: data.user.user_metadata?.is_voting_rep || false,
      profilePicture: data.user.user_metadata?.profile_picture,
    };
    setCurrentUser(user);
    return user;
  }

  throw new Error('Login failed');
}

// Logout function
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  setCurrentUser(null);
}

// Check if user is admin (admin or super_admin)
export function isAdmin(): boolean {
  const role = currentUser?.role;
  return role === 'admin' || role === 'super_admin';
}

// Check if user is super admin
export function isSuperAdmin(): boolean {
  return currentUser?.role === 'super_admin';
}

// Get user role
export function getUserRole(): UserRole {
  // First check in-memory user
  if (currentUser?.role) {
    return currentUser.role;
  }
  
  // If not available, try to get from session synchronously
  // Note: This is a fallback, but session updates require logout/login
  return 'member';
}

// Refresh user session to get latest role from Supabase
// Uses getUser() instead of getSession() to fetch fresh data from server
export async function refreshUserSession(): Promise<void> {
  try {
    // Force refresh the session token to get latest metadata
    const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
    if (sessionError) {
      // If refresh fails, try getUser as fallback
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = (user.user_metadata?.role || 'member') as UserRole;
        currentUser = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          organizationId: user.user_metadata?.organization_id || '',
          role: role,
          isVotingRep: user.user_metadata?.is_voting_rep || false,
          profilePicture: user.user_metadata?.profile_picture,
        };
      }
      return;
    }

    if (session?.user) {
      const role = (session.user.user_metadata?.role || 'member') as UserRole;
      currentUser = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        organizationId: session.user.user_metadata?.organization_id || '',
        role: role,
        isVotingRep: session.user.user_metadata?.is_voting_rep || false,
        profilePicture: session.user.user_metadata?.profile_picture,
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error refreshing user session:', error);
    }
  }
}

// Get user's organization ID
export function getUserOrganizationId(): string | null {
  return currentUser?.organizationId || null;
}
