import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  GraduationCap, 
  Bell, 
  User, 
  X,
  BookOpen
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['professor', 'aluno'],
    },
    {
      name: 'Calendário',
      href: '/calendar',
      icon: Calendar,
      roles: ['professor', 'aluno'],
    },
    {
      name: 'Notas',
      href: '/grades',
      icon: GraduationCap,
      roles: ['professor', 'aluno'],
    },
    {
      name: 'Notificações',
      href: '/notifications',
      icon: Bell,
      roles: ['professor', 'aluno'],
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      name: 'Perfil',
      href: '/profile',
      icon: User,
      roles: ['professor', 'aluno'],
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-sm border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Planner Edu
                </h1>
                <p className="text-xs text-gray-500">
                  {user?.role === 'professor' ? 'Professor' : 'Aluno'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {filteredNavigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={clsx(
                            'sidebar-item group',
                            isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
                          )}
                        >
                          <item.icon
                            className={clsx(
                              'mr-3 h-5 w-5 shrink-0',
                              isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                            )}
                          />
                          <span className="flex-1">{item.name}</span>
                          {item.badge && (
                            <span className="ml-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <span className="text-sm font-medium text-primary-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={clsx(
        'relative z-50 lg:hidden',
        isOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={onClose}
              >
                <span className="sr-only">Fechar sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
              {/* Logo */}
              <div className="flex h-16 shrink-0 items-center">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                      Planner Edu
                    </h1>
                    <p className="text-xs text-gray-500">
                      {user?.role === 'professor' ? 'Professor' : 'Aluno'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {filteredNavigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <li key={item.name}>
                            <NavLink
                              to={item.href}
                              onClick={onClose}
                              className={clsx(
                                'sidebar-item group',
                                isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
                              )}
                            >
                              <item.icon
                                className={clsx(
                                  'mr-3 h-5 w-5 shrink-0',
                                  isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                                )}
                              />
                              <span className="flex-1">{item.name}</span>
                              {item.badge && (
                                <span className="ml-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
                                  {item.badge > 99 ? '99+' : item.badge}
                                </span>
                              )}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                </ul>
              </nav>

              {/* User info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                    <span className="text-sm font-medium text-primary-600">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
