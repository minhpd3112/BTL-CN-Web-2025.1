import { supabaseAdmin } from '@config/supabase';
import { Notification } from '../types';

export const NotificationModel = {
  async findByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async markAsRead(notificationId: string, userId: string) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
    return { success: true };
  },
  async createNotification({
    user_id,
    type,
    title,
    message,
    link = null,
    related_course_id = null,
    related_enrollment_id = null,
    metadata = null
  }: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    link?: string | null;
    related_course_id?: string | null;
    related_enrollment_id?: string | null;
    metadata?: any;
  }) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id,
          type,
          title,
          message,
          link,
          related_course_id,
          related_enrollment_id,
          metadata,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
