import { Request, Response } from 'express';
import { supabase } from '@config/supabase';
import { httpStatus } from '@utils/httpStatus';
import { logger } from '@config/logger';
import type { User } from '../types';

// Helper function to format user response
const formatUserResponse = (user: any, profile?: any): User => {
  return {
    id: user.id, // UUID string
    username: user.email?.split('@')[0] || 'user',
    password: '',
    role: user.user_metadata?.role || 'user',
    name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    avatar: profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U',
    email: user.email || '',
    fullName: profile?.full_name || user.user_metadata?.full_name,
    phone: profile?.phone,
    bio: profile?.bio,
    joinedDate: profile?.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    coursesCreated: 0,
    coursesEnrolled: 0,
    totalStudents: 0,
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: profile?.created_at,
    updatedAt: profile?.updated_at,
  };
};

export const authController = {
  async signup(req: Request, res: Response) {
    try {
      const { email, password, full_name } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      // Sign up user
      const { data: { user }, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name || '',
            role: 'user',
          },
        },
      });

      if (signupError) {
        logger.error('Signup error:', signupError);
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: signupError.message,
        });
      }

      if (!user) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Failed to create user',
        });
      }

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          full_name: full_name || '',
        })
        .select()
        .single();

      if (profileError) {
        logger.error('Profile creation error:', profileError);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Database error saving new user: ' + profileError.message,
        });
      }

      const formattedUser = formatUserResponse(user, profile);

      res.status(httpStatus.CREATED).json({
        success: true,
        message: 'Signup successful. Please check your email to confirm your account.',
        data: {
          user: formattedUser,
        },
      });
    } catch (error: any) {
      logger.error('Signup error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Signup failed',
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      // Sign in user
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !session) {
        logger.error('Login error:', error);
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: error?.message || 'Invalid email or password',
        });
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      const formattedUser = formatUserResponse(user, profile);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: formattedUser,
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_in: session.expires_in,
            token_type: session.token_type,
          },
        },
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('Logout error:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: error.message,
        });
      }

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error: any) {
      logger.error('Logout error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Logout failed',
      });
    }
  },

  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { data: supabaseUser } = await supabase.auth.admin.getUserById(req.user.id);

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', req.user.id)
        .single();

      if (error) {
        logger.error('Get profile error:', error);
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: 'Profile not found',
        });
      }

      const formattedUser = formatUserResponse(supabaseUser?.user, profile);

      res.json({
        success: true,
        data: formattedUser,
      });
    } catch (error: any) {
      logger.error('Get profile error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch profile',
      });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { full_name, avatar_url, phone, address, bio } = req.body;

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update({
          full_name: full_name || undefined,
          avatar_url: avatar_url || undefined,
          phone: phone || undefined,
          address: address || undefined,
          bio: bio || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) {
        logger.error('Update profile error:', error);
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: error.message,
        });
      }

      const { data: supabaseUser } = await supabase.auth.admin.getUserById(req.user.id);
      const formattedUser = formatUserResponse(supabaseUser?.user, profile);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: formattedUser,
      });
    } catch (error: any) {
      logger.error('Update profile error:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to update profile',
      });
    }
  },
};
