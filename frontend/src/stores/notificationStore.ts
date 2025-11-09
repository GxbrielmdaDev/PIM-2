import { create } from 'zustand';
import { Notification } from '@/types';
import { apiService } from '@/services/api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

interface NotificationActions {
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  removeNotification: (notificationId: string) => void;
  clearError: () => void;
  updateUnreadCount: () => Promise<void>;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Estado inicial
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Ações
  fetchNotifications: async (unreadOnly = false) => {
    set({ isLoading: true, error: null });
    
    try {
      const notifications = await apiService.getNotifications(unreadOnly);
      const unreadCount = notifications.filter(n => !n.read).length;
      
      set({
        notifications,
        unreadCount,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Erro ao carregar notificações';
      
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      
      const { notifications } = get();
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );
      
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      
      set({
        notifications: updatedNotifications,
        unreadCount,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Erro ao marcar notificação como lida';
      
      set({ error: errorMessage });
    }
  },

  markAllAsRead: async () => {
    const { notifications } = get();
    const unreadNotifications = notifications.filter(n => !n.read);
    
    try {
      // Marcar todas as não lidas como lidas
      await Promise.all(
        unreadNotifications.map(notification =>
          apiService.markNotificationAsRead(notification.id)
        )
      );
      
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true,
      }));
      
      set({
        notifications: updatedNotifications,
        unreadCount: 0,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Erro ao marcar todas as notificações como lidas';
      
      set({ error: errorMessage });
    }
  },

  addNotification: (notification: Notification) => {
    const { notifications } = get();
    const updatedNotifications = [notification, ...notifications];
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    
    set({
      notifications: updatedNotifications,
      unreadCount,
    });
  },

  removeNotification: (notificationId: string) => {
    const { notifications } = get();
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    
    set({
      notifications: updatedNotifications,
      unreadCount,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  updateUnreadCount: async () => {
    try {
      const unreadCount = await apiService.getUnreadNotificationsCount();
      set({ unreadCount });
    } catch (error) {
      console.error('Erro ao atualizar contagem de notificações:', error);
    }
  },
}));
