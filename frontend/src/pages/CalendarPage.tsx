import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  BookOpen,
  GraduationCap,
  Award,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/api';
import { CalendarEvent, Class } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import CreateEventModal from '@/components/CreateEventModal';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CalendarPage: React.FC = () => {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const [eventsData, classesData] = await Promise.all([
        apiService.getCalendarEvents(),
        apiService.getClasses()
      ]);
      setEvents(eventsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = () => {
    loadEvents(); // Recarregar eventos após criar um novo
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
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'aula':
        return 'bg-blue-500';
      case 'prova':
        return 'bg-red-500';
      case 'trabalho':
        return 'bg-yellow-500';
      case 'projeto':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.date), date)
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvents(getEventsForDate(date));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  // Gerar dias do calendário
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
          <p className="mt-1 text-sm text-gray-600">
            Visualize seus eventos e compromissos acadêmicos
          </p>
        </div>
        
        {user?.role === 'professor' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Evento</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <h2 className="text-lg font-semibold text-gray-900">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Calendar Body */}
            <div className="p-6">
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const dayEvents = getEventsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isDayToday = isToday(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDateClick(day)}
                      className={`
                        relative p-2 h-20 text-left border border-gray-100 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                        ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : 'text-gray-900'}
                        ${isDayToday ? 'bg-primary-50 border-primary-200' : ''}
                        ${isSelected ? 'bg-primary-100 border-primary-300' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${isDayToday ? 'text-primary-600' : ''}`}>
                          {format(day, 'd')}
                        </span>
                        {isDayToday && (
                          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                        )}
                      </div>
                      
                      {/* Event indicators */}
                      {dayEvents.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event, index) => (
                            <div
                              key={event.id}
                              className={`w-full h-1 rounded-full ${getEventTypeColor(event.type)}`}
                            />
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayEvents.length - 2} mais
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Event Details Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedDate ? (
                  format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
                ) : (
                  'Selecione uma data'
                )}
              </h3>
            </div>
            
            <div className="p-6">
              {selectedEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedEvents.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 p-2 rounded-md text-white ${getEventTypeColor(event.type)}`}>
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">
                            {event.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {event.description}
                          </p>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(new Date(event.date), 'HH:mm', { locale: ptBR })}
                              {event.duration && ` (${event.duration}min)`}
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                {event.location}
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              event.type === 'aula' ? 'bg-blue-100 text-blue-800' :
                              event.type === 'prova' ? 'bg-red-100 text-red-800' :
                              event.type === 'trabalho' ? 'bg-yellow-100 text-yellow-800' :
                              event.type === 'projeto' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedDate ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Nenhum evento nesta data
                </p>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Clique em uma data para ver os eventos
                </p>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Legenda</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-700">Aulas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-700">Provas (NP1/NP2)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-700">Trabalhos (AVA)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm text-gray-700">Projetos (PIM)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Este Mês</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total de eventos:</span>
                  <span className="font-medium text-gray-900">
                    {events.filter(event => 
                      isSameMonth(new Date(event.date), currentDate)
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aulas:</span>
                  <span className="font-medium text-gray-900">
                    {events.filter(event => 
                      event.type === 'aula' && 
                      isSameMonth(new Date(event.date), currentDate)
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Provas:</span>
                  <span className="font-medium text-gray-900">
                    {events.filter(event => 
                      event.type === 'prova' && 
                      isSameMonth(new Date(event.date), currentDate)
                    ).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleEventCreated}
        classes={classes}
        selectedDate={selectedDate || undefined}
      />
    </div>
  );
};

export default CalendarPage;
