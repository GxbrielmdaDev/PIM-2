import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  GraduationCap, 
  Users, 
  BookOpen, 
  TrendingUp,
  Clock,
  Bell,
  Award
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/api';
import { CalendarEvent, Grade, Class, Notification } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardStats {
  totalClasses: number;
  upcomingEvents: number;
  pendingGrades: number;
  approvalRate: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    upcomingEvents: 0,
    pendingGrades: 0,
    approvalRate: 0,
  });
  const [recentEvents, setRecentEvents] = useState<CalendarEvent[]>([]);
  const [recentGrades, setRecentGrades] = useState<Grade[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'professor') {
        await loadProfessorDashboard();
      } else {
        await loadStudentDashboard();
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfessorDashboard = async () => {
    const [classes, events, grades, notifs] = await Promise.all([
      apiService.getClasses(),
      apiService.getCalendarEvents(),
      apiService.getGrades(),
      apiService.getNotifications(),
    ]);

    // Filtrar dados do professor
    const professorClasses = classes.filter(cls => cls.professor_id === user?.id);
    const professorEvents = events.filter(event => event.professor_id === user?.id);
    
    // Eventos futuros (próximos 7 dias, incluindo hoje)
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const nextWeek = addDays(today, 7);
    const upcomingEvents = professorEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfToday && eventDate <= nextWeek;
    });

    // Notas pendentes (sem nota final)
    const pendingGrades = grades.filter(grade => 
      grade.final_grade === null && 
      professorClasses.some(cls => cls.id === grade.class_id)
    );

    // Taxa de aprovação
    const completedGrades = grades.filter(grade => grade.final_grade !== null);
    const approvedCount = completedGrades.filter(grade => grade.status === 'aprovado').length;
    const approvalRate = completedGrades.length > 0 ? (approvedCount / completedGrades.length) * 100 : 0;

    setStats({
      totalClasses: professorClasses.length,
      upcomingEvents: upcomingEvents.length,
      pendingGrades: pendingGrades.length,
      approvalRate: Math.round(approvalRate),
    });

    setRecentEvents(upcomingEvents.slice(0, 5));
    setRecentGrades(pendingGrades.slice(0, 5));
    setNotifications(notifs.slice(0, 5));
  };

  const loadStudentDashboard = async () => {
    const [events, grades, notifs, classes] = await Promise.all([
      apiService.getCalendarEvents(),
      apiService.getGrades(),
      apiService.getNotifications(),
      apiService.getClasses(),
    ]);

    // Encontrar turma do aluno
    const studentClasses = classes.filter(cls => cls.students.includes(user?.id || ''));
    
    // Eventos da turma do aluno
    const studentEvents = events.filter(event => 
      studentClasses.some(cls => cls.id === event.class_id)
    );

    // Eventos futuros (próximos 7 dias, incluindo hoje)
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const nextWeek = addDays(today, 7);
    const upcomingEvents = studentEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfToday && eventDate <= nextWeek;
    });

    // Notas do aluno
    const studentGrades = grades.filter(grade => grade.student_id === user?.id);
    const pendingGrades = studentGrades.filter(grade => grade.final_grade === null);
    
    // Taxa de aprovação do aluno
    const completedGrades = studentGrades.filter(grade => grade.final_grade !== null);
    const approvedCount = completedGrades.filter(grade => grade.status === 'aprovado').length;
    const approvalRate = completedGrades.length > 0 ? (approvedCount / completedGrades.length) * 100 : 0;

    setStats({
      totalClasses: studentClasses.length,
      upcomingEvents: upcomingEvents.length,
      pendingGrades: pendingGrades.length,
      approvalRate: Math.round(approvalRate),
    });

    setRecentEvents(upcomingEvents.slice(0, 5));
    setRecentGrades(studentGrades.slice(0, 5));
    setNotifications(notifs.slice(0, 5));
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'aula':
        return <BookOpen className="h-4 w-4" />;
      case 'prova':
        return <GraduationCap className="h-4 w-4" />;
      case 'trabalho':
        return <Award className="h-4 w-4" />;
      case 'projeto':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'aula':
        return 'bg-blue-100 text-blue-800';
      case 'prova':
        return 'bg-red-100 text-red-800';
      case 'trabalho':
        return 'bg-yellow-100 text-yellow-800';
      case 'projeto':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Hoje, ${format(date, 'HH:mm', { locale: ptBR })}`;
    } else if (isTomorrow(date)) {
      return `Amanhã, ${format(date, 'HH:mm', { locale: ptBR })}`;
    } else {
      return format(date, "dd/MM 'às' HH:mm", { locale: ptBR });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo, {user?.name}!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {user?.role === 'professor' ? 'Painel do Professor' : 'Painel do Aluno'}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {user?.role === 'professor' ? 'Turmas' : 'Turmas Matriculado'}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalClasses}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Eventos Próximos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.upcomingEvents}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GraduationCap className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {user?.role === 'professor' ? 'Notas Pendentes' : 'Avaliações Pendentes'}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pendingGrades}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Taxa de Aprovação
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.approvalRate}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Próximos Eventos */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Próximos Eventos</h3>
          </div>
          <div className="p-6">
            {recentEvents.length > 0 ? (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 p-2 rounded-md ${getEventTypeColor(event.type)}`}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatEventDate(event.date)}
                      </p>
                      {event.location && (
                        <p className="text-xs text-gray-400">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum evento próximo
              </p>
            )}
          </div>
        </div>

        {/* Notificações Recentes */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Notificações Recentes</h3>
          </div>
          <div className="p-6">
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Bell className={`h-5 w-5 ${notification.read ? 'text-gray-400' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(notification.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma notificação recente
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => window.location.href = '/calendar'}
            className="btn btn-outline flex items-center justify-center space-x-2 p-4"
          >
            <Calendar className="h-5 w-5" />
            <span>Ver Calendário</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/grades'}
            className="btn btn-outline flex items-center justify-center space-x-2 p-4"
          >
            <GraduationCap className="h-5 w-5" />
            <span>Ver Notas</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/notifications'}
            className="btn btn-outline flex items-center justify-center space-x-2 p-4"
          >
            <Bell className="h-5 w-5" />
            <span>Notificações</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/profile'}
            className="btn btn-outline flex items-center justify-center space-x-2 p-4"
          >
            <Users className="h-5 w-5" />
            <span>Meu Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
