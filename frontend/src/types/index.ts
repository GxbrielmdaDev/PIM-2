// Tipos de usuário e autenticação
export interface User {
  id: string;
  username: string;
  role: 'professor' | 'aluno';
  name: string;
  email: string;
  department?: string;
  class_id?: string;
  registration?: string;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Tipos de turmas
export interface Class {
  id: string;
  name: string;
  professor_id: string;
  subject: string;
  schedule: {
    [day: string]: string[];
  };
  students: string[];
  created_at: string;
}

// Tipos de notas
export interface Grade {
  id: string;
  student_id: string;
  class_id: string;
  semester: string;
  np1: number | null;
  np2: number | null;
  ava: number | null;
  pim: number | null;
  final_grade: number | null;
  status: 'em_andamento' | 'aprovado' | 'recuperacao' | 'reprovado';
  created_at: string;
  updated_at: string;
}

export interface GradeCalculation {
  student_id: string;
  np1?: number;
  np2?: number;
  ava?: number;
  pim?: number;
  final_grade?: number;
  status?: string;
}

export interface ClassStatistics {
  average: number;
  highest: number;
  lowest: number;
  total_students: number;
  approved_count: number;
  approval_rate: number;
}

// Tipos de calendário e eventos
export interface CalendarEvent {
  id: string;
  type: 'aula' | 'prova' | 'trabalho' | 'projeto';
  title: string;
  description: string;
  class_id: string;
  professor_id: string;
  date: string;
  duration: number | null;
  location: string;
  grade_type?: 'np1' | 'np2' | 'ava' | 'pim';
  due_date?: string;
  created_at: string;
}

export interface CalendarData {
  events: CalendarEvent[];
}

// Tipos de notificações
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  created_at: string;
  scheduled_for?: string;
  sent: boolean;
}

export interface NotificationSettings {
  email_enabled: boolean;
  reminder_hours: number[];
  daily_digest_time: string;
}

// Tipos de API Response
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// Tipos de formulários
export interface CreateEventForm {
  type: CalendarEvent['type'];
  title: string;
  description: string;
  class_id: string;
  date: string;
  time: string;
  duration?: number;
  location: string;
  grade_type?: CalendarEvent['grade_type'];
  due_date?: string;
}

export interface UpdateGradeForm {
  student_id: string;
  grade_type: 'np1' | 'np2' | 'ava' | 'pim';
  value: number;
}

export interface CreateNotificationForm {
  user_id: string;
  title: string;
  message: string;
  type: Notification['type'];
  send_email: boolean;
  schedule_for?: string;
}

// Tipos de estado da aplicação
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppState {
  auth: AuthState;
  notifications: Notification[];
  unreadCount: number;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
}

// Tipos de filtros e busca
export interface GradeFilters {
  class_id?: string;
  semester?: string;
  status?: Grade['status'];
  student_id?: string;
}

export interface EventFilters {
  type?: CalendarEvent['type'];
  class_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface UserFilters {
  role?: User['role'];
  class_id?: string;
  search?: string;
}

// Tipos de dashboard
export interface DashboardStats {
  total_students: number;
  total_classes: number;
  upcoming_events: number;
  pending_grades: number;
  approval_rate: number;
}

export interface StudentDashboardData {
  user: User;
  grades: Grade[];
  upcoming_events: CalendarEvent[];
  notifications: Notification[];
  class_info: Class | null;
}

export interface ProfessorDashboardData {
  user: User;
  classes: Class[];
  recent_events: CalendarEvent[];
  grade_statistics: ClassStatistics[];
  notifications: Notification[];
}

// Tipos de componentes
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Tipos de validação
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Tipos de configuração
export interface AppConfig {
  api_url: string;
  app_name: string;
  version: string;
  features: {
    email_notifications: boolean;
    grade_calculations: boolean;
    calendar_sync: boolean;
  };
}

// Tipos de hooks
export interface UseApiOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  retry?: number;
  staleTime?: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export interface UsePaginationReturn {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canNextPage: boolean;
  canPrevPage: boolean;
}
