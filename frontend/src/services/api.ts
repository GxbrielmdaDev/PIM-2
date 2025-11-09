import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  LoginCredentials, 
  AuthResponse, 
  Class, 
  Grade, 
  CalendarEvent, 
  Notification,
  GradeCalculation,
  ClassStatistics,
  CreateEventForm,
  UpdateGradeForm,
  CreateNotificationForm
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor para adicionar token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor para tratar erros
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos de autenticação
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    
    // Salvar token e dados do usuário
    localStorage.setItem('auth_token', response.data.access_token);
    localStorage.setItem('user_data', JSON.stringify(response.data.user));
    
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/me');
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
  }

  // Métodos de usuários
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<{ users: User[] }> = await this.api.get('/users');
    return response.data.users;
  }

  // Métodos de turmas
  async getClasses(): Promise<Class[]> {
    const response: AxiosResponse<{ classes: Class[] }> = await this.api.get('/classes');
    return response.data.classes;
  }

  async getClassById(classId: string): Promise<Class | null> {
    try {
      const classes = await this.getClasses();
      return classes.find(cls => cls.id === classId) || null;
    } catch (error) {
      console.error('Erro ao buscar turma:', error);
      return null;
    }
  }

  // Métodos de notas
  async getGrades(): Promise<Grade[]> {
    const response: AxiosResponse<{ grades: Grade[] }> = await this.api.get('/grades');
    return response.data.grades;
  }

  async getGradesByStudent(studentId: string): Promise<Grade[]> {
    const grades = await this.getGrades();
    return grades.filter(grade => grade.student_id === studentId);
  }

  async getGradesByClass(classId: string): Promise<Grade[]> {
    const grades = await this.getGrades();
    return grades.filter(grade => grade.class_id === classId);
  }

  async updateGrade(gradeData: UpdateGradeForm): Promise<Grade> {
    const response: AxiosResponse<Grade> = await this.api.put('/grades/update', gradeData);
    return response.data;
  }

  async calculateGrades(gradesData: GradeCalculation[]): Promise<GradeCalculation[]> {
    const response: AxiosResponse<GradeCalculation[]> = await this.api.post('/grades/calculate', {
      students_grades: gradesData
    });
    return response.data;
  }

  async getClassStatistics(classId: string): Promise<ClassStatistics> {
    const response: AxiosResponse<ClassStatistics> = await this.api.get(`/classes/${classId}/statistics`);
    return response.data;
  }

  // Métodos de calendário
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    const response: AxiosResponse<{ events: CalendarEvent[] }> = await this.api.get('/calendar');
    return response.data.events;
  }

  async getEventsByClass(classId: string): Promise<CalendarEvent[]> {
    const events = await this.getCalendarEvents();
    return events.filter(event => event.class_id === classId);
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const events = await this.getCalendarEvents();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return eventDate >= start && eventDate <= end;
    });
  }

  async createEvent(eventData: CreateEventForm): Promise<CalendarEvent> {
    const response: AxiosResponse<CalendarEvent> = await this.api.post('/calendar/events', eventData);
    return response.data;
  }

  async updateEvent(eventId: string, eventData: Partial<CreateEventForm>): Promise<CalendarEvent> {
    const response: AxiosResponse<CalendarEvent> = await this.api.put(`/calendar/events/${eventId}`, eventData);
    return response.data;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.api.delete(`/calendar/events/${eventId}`);
  }

  // Métodos de notificações
  async getNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
    const params = unreadOnly ? { unread_only: true } : {};
    const response: AxiosResponse<{ notifications: Notification[] }> = await this.api.get('/notifications', { params });
    return response.data.notifications;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.api.put(`/notifications/${notificationId}/read`);
  }

  async createNotification(notificationData: CreateNotificationForm): Promise<Notification> {
    const response: AxiosResponse<Notification> = await this.api.post('/notifications', notificationData);
    return response.data;
  }

  async getUnreadNotificationsCount(): Promise<number> {
    try {
      const notifications = await this.getNotifications(true);
      return notifications.length;
    } catch (error) {
      console.error('Erro ao buscar contagem de notificações:', error);
      return 0;
    }
  }

  // Métodos de dashboard
  async getDashboardData(): Promise<any> {
    const user = this.getCurrentUserFromStorage();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    if (user.role === 'aluno') {
      return this.getStudentDashboardData(user.id);
    } else {
      return this.getProfessorDashboardData(user.id);
    }
  }

  private async getStudentDashboardData(studentId: string) {
    const [grades, events, notifications, classes] = await Promise.all([
      this.getGradesByStudent(studentId),
      this.getCalendarEvents(),
      this.getNotifications(),
      this.getClasses()
    ]);

    // Filtrar eventos futuros
    const upcomingEvents = events.filter(event => new Date(event.date) > new Date());

    // Encontrar turma do aluno
    const userClasses = classes.filter(cls => cls.students.includes(studentId));
    const classInfo = userClasses[0] || null;

    return {
      grades,
      upcoming_events: upcomingEvents,
      notifications,
      class_info: classInfo
    };
  }

  private async getProfessorDashboardData(professorId: string) {
    const [classes, events, notifications] = await Promise.all([
      this.getClasses(),
      this.getCalendarEvents(),
      this.getNotifications()
    ]);

    // Filtrar turmas do professor
    const professorClasses = classes.filter(cls => cls.professor_id === professorId);

    // Filtrar eventos recentes
    const recentEvents = events
      .filter(event => event.professor_id === professorId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    // Calcular estatísticas das turmas
    const gradeStatistics = await Promise.all(
      professorClasses.map(async (cls) => {
        try {
          return await this.getClassStatistics(cls.id);
        } catch (error) {
          console.error(`Erro ao calcular estatísticas da turma ${cls.id}:`, error);
          return {
            average: 0,
            highest: 0,
            lowest: 0,
            total_students: 0,
            approved_count: 0,
            approval_rate: 0
          };
        }
      })
    );

    return {
      classes: professorClasses,
      recent_events: recentEvents,
      grade_statistics: gradeStatistics,
      notifications
    };
  }

  // Métodos utilitários
  getCurrentUserFromStorage(): User | null {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao recuperar dados do usuário:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const user = this.getCurrentUserFromStorage();
    return !!(token && user);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

// Instância singleton da API
export const apiService = new ApiService();
export default apiService;
