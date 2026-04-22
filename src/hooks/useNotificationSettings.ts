import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_alerts: boolean;
  newsletter: boolean;
  order_updates: boolean;
  promotions: boolean;
  created_at: string;
  updated_at: string;
}

const defaultSettings = {
  email_notifications: true,
  sms_alerts: false,
  newsletter: true,
  order_updates: true,
  promotions: true,
};

export const useNotificationSettings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notification-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no settings exist, create default ones
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('notification_settings')
          .insert({ user_id: user.id, ...defaultSettings })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newData as NotificationSettings;
      }
      
      return data as NotificationSettings;
    },
    enabled: !!user
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (settings: Partial<Omit<NotificationSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notification_settings')
        .update(settings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast({
        title: "Settings saved!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};
