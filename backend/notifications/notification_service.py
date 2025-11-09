import smtplib
import json
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import schedule
import time
import threading

class NotificationService:
    """Serviço de notificações por email e in-app"""
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.email_user = os.getenv("EMAIL_USER", "sistema@escola.edu.br")
        self.email_password = os.getenv("EMAIL_PASSWORD", "")
        self.notifications_file = os.path.join(
            os.path.dirname(__file__), "..", "..", "data", "notifications.json"
        )
        self._ensure_notifications_file()
        self._start_scheduler()
    
    def _ensure_notifications_file(self):
        """Garante que o arquivo de notificações existe"""
        if not os.path.exists(self.notifications_file):
            initial_data = {
                "notifications": [],
                "email_queue": [],
                "settings": {
                    "email_enabled": True,
                    "reminder_hours": [24, 2],  # Lembrar 24h e 2h antes
                    "daily_digest_time": "08:00"
                }
            }
            with open(self.notifications_file, 'w', encoding='utf-8') as f:
                json.dump(initial_data, f, indent=2, ensure_ascii=False)
    
    def _load_notifications(self) -> Dict:
        """Carrega notificações do arquivo"""
        try:
            with open(self.notifications_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Erro ao carregar notificações: {e}")
            return {"notifications": [], "email_queue": [], "settings": {}}
    
    def _save_notifications(self, data: Dict):
        """Salva notificações no arquivo"""
        try:
            with open(self.notifications_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Erro ao salvar notificações: {e}")
    
    def create_notification(self, user_id: str, title: str, message: str, 
                          notification_type: str = "info", 
                          send_email: bool = False,
                          schedule_for: Optional[datetime] = None) -> str:
        """
        Cria uma nova notificação
        
        Args:
            user_id: ID do usuário destinatário
            title: Título da notificação
            message: Mensagem da notificação
            notification_type: Tipo (info, warning, success, error)
            send_email: Se deve enviar por email também
            schedule_for: Agendar para data/hora específica
            
        Returns:
            ID da notificação criada
        """
        try:
            data = self._load_notifications()
            
            notification_id = f"notif_{int(datetime.now().timestamp())}"
            notification = {
                "id": notification_id,
                "user_id": user_id,
                "title": title,
                "message": message,
                "type": notification_type,
                "read": False,
                "created_at": datetime.now().isoformat(),
                "scheduled_for": schedule_for.isoformat() if schedule_for else None,
                "sent": False
            }
            
            data["notifications"].append(notification)
            
            # Adicionar à fila de email se solicitado
            if send_email:
                self._queue_email(user_id, title, message, schedule_for)
            
            self._save_notifications(data)
            return notification_id
            
        except Exception as e:
            print(f"Erro ao criar notificação: {e}")
            return ""
    
    def _queue_email(self, user_id: str, title: str, message: str, 
                    schedule_for: Optional[datetime] = None):
        """Adiciona email à fila de envio"""
        try:
            data = self._load_notifications()
            
            email_item = {
                "id": f"email_{int(datetime.now().timestamp())}",
                "user_id": user_id,
                "title": title,
                "message": message,
                "scheduled_for": schedule_for.isoformat() if schedule_for else None,
                "attempts": 0,
                "sent": False,
                "created_at": datetime.now().isoformat()
            }
            
            data["email_queue"].append(email_item)
            self._save_notifications(data)
            
        except Exception as e:
            print(f"Erro ao adicionar email à fila: {e}")
    
    def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """
        Envia email usando SMTP
        
        Args:
            to_email: Email destinatário
            subject: Assunto do email
            body: Corpo do email
            
        Returns:
            True se enviado com sucesso
        """
        try:
            # Verificar se credenciais estão configuradas
            if not self.email_password:
                print("Credenciais de email não configuradas")
                return False
            
            # Criar mensagem
            msg = MIMEMultipart()
            msg['From'] = self.email_user
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Corpo do email em HTML
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Sistema Acadêmico PIM</h2>
                        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
                            {body.replace('\n', '<br>')}
                        </div>
                        <p style="color: #666; font-size: 12px; margin-top: 20px;">
                            Esta é uma mensagem automática do Sistema Acadêmico PIM.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            msg.attach(MIMEText(html_body, 'html'))
            
            # Conectar e enviar
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_user, self.email_password)
            server.send_message(msg)
            server.quit()
            
            print(f"Email enviado para {to_email}")
            return True
            
        except Exception as e:
            print(f"Erro ao enviar email para {to_email}: {e}")
            return False
    
    def process_email_queue(self):
        """Processa fila de emails pendentes"""
        try:
            data = self._load_notifications()
            users_data = self._load_users_data()
            
            for email_item in data["email_queue"]:
                if email_item["sent"] or email_item["attempts"] >= 3:
                    continue
                
                # Verificar se é hora de enviar
                if email_item["scheduled_for"]:
                    scheduled_time = datetime.fromisoformat(email_item["scheduled_for"])
                    if datetime.now() < scheduled_time:
                        continue
                
                # Buscar email do usuário
                user_email = self._get_user_email(email_item["user_id"], users_data)
                if not user_email:
                    email_item["attempts"] += 1
                    continue
                
                # Tentar enviar
                success = self.send_email(
                    user_email,
                    email_item["title"],
                    email_item["message"]
                )
                
                email_item["attempts"] += 1
                if success:
                    email_item["sent"] = True
            
            self._save_notifications(data)
            
        except Exception as e:
            print(f"Erro ao processar fila de emails: {e}")
    
    def _load_users_data(self) -> Dict:
        """Carrega dados dos usuários"""
        try:
            users_path = os.path.join(
                os.path.dirname(__file__), "..", "..", "data", "users.json"
            )
            with open(users_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Erro ao carregar usuários: {e}")
            return {"users": []}
    
    def _get_user_email(self, user_id: str, users_data: Dict) -> Optional[str]:
        """Obtém email do usuário pelo ID"""
        for user in users_data.get("users", []):
            if user["id"] == user_id:
                return user.get("email")
        return None
    
    def get_user_notifications(self, user_id: str, unread_only: bool = False) -> List[Dict]:
        """
        Obtém notificações do usuário
        
        Args:
            user_id: ID do usuário
            unread_only: Se deve retornar apenas não lidas
            
        Returns:
            Lista de notificações
        """
        try:
            data = self._load_notifications()
            notifications = []
            
            for notif in data["notifications"]:
                if notif["user_id"] == user_id:
                    if unread_only and notif["read"]:
                        continue
                    
                    # Verificar se é hora de mostrar notificação agendada
                    if notif["scheduled_for"]:
                        scheduled_time = datetime.fromisoformat(notif["scheduled_for"])
                        if datetime.now() < scheduled_time:
                            continue
                    
                    notifications.append(notif)
            
            # Ordenar por data de criação (mais recentes primeiro)
            notifications.sort(key=lambda x: x["created_at"], reverse=True)
            return notifications
            
        except Exception as e:
            print(f"Erro ao buscar notificações: {e}")
            return []
    
    def mark_as_read(self, notification_id: str) -> bool:
        """Marca notificação como lida"""
        try:
            data = self._load_notifications()
            
            for notif in data["notifications"]:
                if notif["id"] == notification_id:
                    notif["read"] = True
                    break
            
            self._save_notifications(data)
            return True
            
        except Exception as e:
            print(f"Erro ao marcar notificação como lida: {e}")
            return False
    
    def create_event_reminders(self):
        """Cria lembretes automáticos para eventos próximos"""
        try:
            # Carregar eventos do calendário
            calendar_path = os.path.join(
                os.path.dirname(__file__), "..", "..", "data", "calendar.json"
            )
            
            with open(calendar_path, 'r', encoding='utf-8') as f:
                calendar_data = json.load(f)
            
            # Carregar turmas para obter alunos
            classes_path = os.path.join(
                os.path.dirname(__file__), "..", "..", "data", "classes.json"
            )
            
            with open(classes_path, 'r', encoding='utf-8') as f:
                classes_data = json.load(f)
            
            data = self._load_notifications()
            reminder_hours = data.get("settings", {}).get("reminder_hours", [24, 2])
            
            for event in calendar_data.get("events", []):
                event_time = datetime.fromisoformat(event["date"].replace('Z', '+00:00'))
                
                # Encontrar alunos da turma
                students = []
                for cls in classes_data.get("classes", []):
                    if cls["id"] == event.get("class_id"):
                        students = cls.get("students", [])
                        break
                
                # Criar lembretes para cada intervalo configurado
                for hours_before in reminder_hours:
                    reminder_time = event_time - timedelta(hours=hours_before)
                    
                    # Verificar se já passou da hora do lembrete
                    if reminder_time <= datetime.now():
                        continue
                    
                    # Criar notificação para cada aluno
                    for student_id in students:
                        title = f"Lembrete: {event['title']}"
                        message = f"""
                        Você tem um evento agendado em {hours_before} horas:
                        
                        📅 {event['title']}
                        📍 {event.get('location', 'Local não informado')}
                        🕐 {event_time.strftime('%d/%m/%Y às %H:%M')}
                        
                        {event.get('description', '')}
                        """
                        
                        self.create_notification(
                            student_id,
                            title,
                            message,
                            "info",
                            send_email=True,
                            schedule_for=reminder_time
                        )
            
        except Exception as e:
            print(f"Erro ao criar lembretes de eventos: {e}")
    
    def _start_scheduler(self):
        """Inicia o agendador de tarefas"""
        def run_scheduler():
            # Processar fila de emails a cada 5 minutos
            schedule.every(5).minutes.do(self.process_email_queue)
            
            # Criar lembretes de eventos diariamente às 6h
            schedule.every().day.at("06:00").do(self.create_event_reminders)
            
            while True:
                schedule.run_pending()
                time.sleep(60)  # Verificar a cada minuto
        
        # Executar em thread separada
        scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        scheduler_thread.start()

# Instância global do serviço
notification_service = NotificationService()
