from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import json
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import uuid
from initial_data import (
    INITIAL_USERS, INITIAL_CLASSES, INITIAL_GRADES, 
    INITIAL_CALENDAR, INITIAL_NOTIFICATIONS
)

# Configurações
SECRET_KEY = "sistema-academico-pim-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 horas

app = FastAPI(title="Planner Edu API", version="1.0.0")

# Evento de inicialização - resetar dados para estado limpo
@app.on_event("startup")
async def startup_event():
    reset_to_initial_data()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Segurança
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Modelos Pydantic
class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class User(BaseModel):
    id: str
    username: str
    role: str
    name: str
    email: str

class CreateEventRequest(BaseModel):
    type: str  # aula, prova, trabalho, projeto
    title: str
    description: str
    class_id: str
    date: str  # ISO format
    duration: Optional[int] = None
    location: str
    grade_type: Optional[str] = None  # np1, np2, ava, pim
    due_date: Optional[str] = None

class UpdateGradeRequest(BaseModel):
    student_id: str
    grade_type: str  # np1, np2, ava, pim
    value: Optional[float] = None  # Pode ser None para remover nota

# Utilitários para carregar dados JSON
def load_json_data(filename: str):
    """Carrega dados do arquivo JSON"""
    try:
        data_path = os.path.join(os.path.dirname(__file__), "..", "data", filename)
        with open(data_path, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}

def save_json_data(filename: str, data: dict):
    """Salva dados no arquivo JSON"""
    try:
        data_path = os.path.join(os.path.dirname(__file__), "..", "data", filename)
        with open(data_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Erro ao salvar {filename}: {e}")
        return False

def reset_to_initial_data():
    """Reseta todos os dados para o estado inicial limpo"""
    print("🔄 Resetando dados para estado inicial limpo...")
    
    # Resetar cada arquivo de dados
    data_files = {
        "users.json": INITIAL_USERS,
        "classes.json": INITIAL_CLASSES, 
        "grades.json": INITIAL_GRADES,
        "calendar.json": INITIAL_CALENDAR,
        "notifications.json": INITIAL_NOTIFICATIONS
    }
    
    for filename, initial_data in data_files.items():
        if save_json_data(filename, initial_data):
            print(f"✅ {filename} resetado com sucesso")
        else:
            print(f"❌ Erro ao resetar {filename}")
    
    print("🎯 Sistema iniciado com dados limpos!")

async def create_grade_notification(student_id: str, grade_type: str, grade_value: float):
    """Cria notificação automática quando uma nota é lançada"""
    try:
        notifications_data = load_json_data("notifications.json")
        
        # Mapear tipos de nota para nomes amigáveis
        grade_names = {
            "np1": "NP1 (Primeira Prova)",
            "np2": "NP2 (Segunda Prova)", 
            "ava": "AVA (Atividades Virtuais)",
            "pim": "PIM (Projeto Integrado)"
        }
        
        grade_name = grade_names.get(grade_type, grade_type.upper())
        
        # Criar notificação
        new_notification = {
            "id": f"notif_{uuid.uuid4().hex[:8]}",
            "user_id": student_id,
            "title": f"Nova nota lançada: {grade_name}",
            "message": f"Sua nota em {grade_name} foi lançada: {grade_value:.1f}. Acesse a página de notas para ver mais detalhes.",
            "type": "grade",
            "read": False,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "scheduled_for": None,
            "sent": True
        }
        
        # Adicionar à lista
        if "notifications" not in notifications_data:
            notifications_data["notifications"] = []
        
        notifications_data["notifications"].append(new_notification)
        
        # Salvar dados
        save_json_data("notifications.json", notifications_data)
        print(f"📧 Notificação criada para aluno {student_id}: {grade_name} = {grade_value}")
        
    except Exception as e:
        print(f"❌ Erro ao criar notificação: {e}")

async def create_event_notifications(class_id: str, event: dict):
    """Cria notificações automáticas para alunos quando um evento é criado"""
    try:
        # Carregar dados das turmas e notificações
        classes_data = load_json_data("classes.json")
        notifications_data = load_json_data("notifications.json")
        
        # Encontrar a turma
        target_class = None
        for cls in classes_data.get("classes", []):
            if cls["id"] == class_id:
                target_class = cls
                break
        
        if not target_class:
            print(f"❌ Turma {class_id} não encontrada")
            return
        
        # Mapear tipos de evento para nomes amigáveis
        event_types = {
            "aula": "Aula",
            "prova": "Prova",
            "trabalho": "Trabalho",
            "projeto": "Projeto"
        }
        
        event_type_name = event_types.get(event["type"], event["type"].title())
        
        # Formatar data do evento
        event_date = datetime.fromisoformat(event["date"].replace("Z", "+00:00"))
        formatted_date = event_date.strftime("%d/%m/%Y às %H:%M")
        
        # Criar notificação para cada aluno da turma
        for student_id in target_class.get("students", []):
            new_notification = {
                "id": f"notif_{uuid.uuid4().hex[:8]}",
                "user_id": student_id,
                "title": f"Novo evento: {event_type_name}",
                "message": f"Foi criado um novo evento '{event['title']}' para {formatted_date} em {event['location']}. Verifique seu calendário para mais detalhes.",
                "type": "event",
                "read": False,
                "created_at": datetime.utcnow().isoformat() + "Z",
                "scheduled_for": None,
                "sent": True
            }
            
            # Adicionar à lista
            if "notifications" not in notifications_data:
                notifications_data["notifications"] = []
            
            notifications_data["notifications"].append(new_notification)
            print(f"📅 Notificação de evento criada para aluno {student_id}: {event['title']}")
        
        # Salvar dados
        save_json_data("notifications.json", notifications_data)
        
    except Exception as e:
        print(f"❌ Erro ao criar notificações de evento: {e}")

# Funções de autenticação
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica senha (por simplicidade, comparação direta)"""
    return plain_password == hashed_password

def get_user(username: str):
    """Busca usuário no arquivo JSON"""
    users_data = load_json_data("users.json")
    for user in users_data.get("users", []):
        if user["username"] == username:
            return user
    return None

def authenticate_user(username: str, password: str):
    """Autentica usuário"""
    user = get_user(username)
    if not user or not verify_password(password, user["password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Cria token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Obtém usuário atual do token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user(username=username)
    if user is None:
        raise credentials_exception
    return user

# Rotas de autenticação
@app.post("/api/auth/login", response_model=Token)
async def login(login_data: LoginRequest):
    """Endpoint de login"""
    user = authenticate_user(login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    # Remove senha do retorno
    user_data = {k: v for k, v in user.items() if k != "password"}
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

@app.get("/api/auth/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Obtém dados do usuário atual"""
    user_data = {k: v for k, v in current_user.items() if k != "password"}
    return user_data

# Rotas de dados
@app.get("/api/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    """Lista usuários (apenas professores)"""
    if current_user["role"] != "professor":
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    users_data = load_json_data("users.json")
    users = [{k: v for k, v in user.items() if k != "password"} 
             for user in users_data.get("users", [])]
    return {"users": users}

@app.get("/api/classes")
async def get_classes(current_user: dict = Depends(get_current_user)):
    """Lista turmas"""
    classes_data = load_json_data("classes.json")
    return classes_data

@app.get("/api/grades")
async def get_grades(current_user: dict = Depends(get_current_user)):
    """Lista notas"""
    grades_data = load_json_data("grades.json")
    
    # Filtrar por usuário se for aluno
    if current_user["role"] == "aluno":
        filtered_grades = [
            grade for grade in grades_data.get("grades", [])
            if grade["student_id"] == current_user["id"]
        ]
        return {"grades": filtered_grades}
    
    return grades_data

@app.put("/api/grades/update")
async def update_grade(grade_data: UpdateGradeRequest, current_user: dict = Depends(get_current_user)):
    """Atualiza nota de um aluno (apenas professores)"""
    if current_user["role"] != "professor":
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    try:
        grades_data = load_json_data("grades.json")
        
        # Validar valor da nota
        if grade_data.value is not None and (grade_data.value < 0 or grade_data.value > 10):
            raise HTTPException(status_code=400, detail="Grade must be between 0 and 10")
        
        # Encontrar ou criar registro de nota para o aluno
        grade_record = None
        for grade in grades_data.get("grades", []):
            if grade["student_id"] == grade_data.student_id:
                grade_record = grade
                break
        
        # Se não existe, criar novo registro
        if not grade_record:
            # Verificar se o aluno existe e está em uma turma do professor
            users_data = load_json_data("users.json")
            classes_data = load_json_data("classes.json")
            
            student = None
            for user in users_data.get("users", []):
                if user["id"] == grade_data.student_id and user["role"] == "aluno":
                    student = user
                    break
            
            if not student:
                raise HTTPException(status_code=404, detail="Student not found")
            
            # Encontrar turma do aluno que seja do professor
            student_class = None
            for cls in classes_data.get("classes", []):
                if (cls["professor_id"] == current_user["id"] and 
                    grade_data.student_id in cls.get("students", [])):
                    student_class = cls
                    break
            
            if not student_class:
                raise HTTPException(status_code=403, detail="Student not in your classes")
            
            # Criar novo registro de nota
            grade_record = {
                "id": f"grade_{uuid.uuid4().hex[:8]}",
                "student_id": grade_data.student_id,
                "class_id": student_class["id"],
                "semester": "2024.1",  # Pode ser parametrizado
                "np1": None,
                "np2": None,
                "ava": None,
                "pim": None,
                "final_grade": None,
                "status": "em_andamento",
                "created_at": datetime.utcnow().isoformat() + "Z",
                "updated_at": datetime.utcnow().isoformat() + "Z"
            }
            grades_data.setdefault("grades", []).append(grade_record)
        
        # Atualizar a nota específica
        if grade_data.grade_type in ["np1", "np2", "ava", "pim"]:
            grade_record[grade_data.grade_type] = grade_data.value
            grade_record["updated_at"] = datetime.utcnow().isoformat() + "Z"
            
            # Recalcular nota final usando a fórmula (NP1 + NP2 + AVA + PIM) / 4
            grades = [grade_record.get("np1"), grade_record.get("np2"), 
                     grade_record.get("ava"), grade_record.get("pim")]
            valid_grades = [g for g in grades if g is not None]
            
            if len(valid_grades) >= 2:  # Precisa de pelo menos 2 notas
                total = sum(valid_grades)
                grade_record["final_grade"] = round(total / 4, 2)
                
                # Determinar status baseado na nota final
                if grade_record["final_grade"] >= 7.0:
                    grade_record["status"] = "aprovado"
                elif grade_record["final_grade"] >= 5.0:
                    grade_record["status"] = "recuperacao"
                else:
                    grade_record["status"] = "reprovado"
            else:
                grade_record["final_grade"] = None
                grade_record["status"] = "em_andamento"
        else:
            raise HTTPException(status_code=400, detail="Invalid grade type")
        
        # Salvar dados
        if save_json_data("grades.json", grades_data):
            # Criar notificação automática para o aluno
            await create_grade_notification(grade_data.student_id, grade_data.grade_type, grade_data.value)
            return grade_record
        else:
            raise HTTPException(status_code=500, detail="Failed to save grade")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating grade: {str(e)}")

@app.get("/api/calendar")
async def get_calendar(current_user: dict = Depends(get_current_user)):
    """Lista eventos do calendário"""
    calendar_data = load_json_data("calendar.json")
    
    # Filtrar eventos por usuário
    if current_user["role"] == "aluno":
        # Buscar turmas do aluno
        classes_data = load_json_data("classes.json")
        user_classes = [
            cls["id"] for cls in classes_data.get("classes", [])
            if current_user["id"] in cls.get("students", [])
        ]
        
        filtered_events = [
            event for event in calendar_data.get("events", [])
            if event.get("class_id") in user_classes
        ]
        return {"events": filtered_events}
    
    return calendar_data

@app.post("/api/calendar/events")
async def create_event(event_data: CreateEventRequest, current_user: dict = Depends(get_current_user)):
    """Cria novo evento (apenas professores)"""
    if current_user["role"] != "professor":
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    try:
        # Carregar dados do calendário
        calendar_data = load_json_data("calendar.json")
        
        # Criar novo evento
        new_event = {
            "id": f"event_{uuid.uuid4().hex[:8]}",
            "type": event_data.type,
            "title": event_data.title,
            "description": event_data.description,
            "class_id": event_data.class_id,
            "professor_id": current_user["id"],
            "date": event_data.date,
            "duration": event_data.duration,
            "location": event_data.location,
            "grade_type": event_data.grade_type,
            "due_date": event_data.due_date,
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        # Adicionar evento à lista
        if "events" not in calendar_data:
            calendar_data["events"] = []
        
        calendar_data["events"].append(new_event)
        
        # Salvar dados
        if save_json_data("calendar.json", calendar_data):
            # Criar notificações automáticas para alunos da turma
            await create_event_notifications(event_data.class_id, new_event)
            return new_event
        else:
            raise HTTPException(status_code=500, detail="Failed to save event")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating event: {str(e)}")

# Rotas de notificações
@app.get("/api/notifications")
async def get_notifications(unread_only: bool = False, current_user: dict = Depends(get_current_user)):
    """Lista notificações do usuário"""
    try:
        notifications_data = load_json_data("notifications.json")
        
        # Filtrar notificações do usuário
        user_notifications = [
            notif for notif in notifications_data.get("notifications", [])
            if notif.get("user_id") == current_user["id"]
        ]
        
        # Filtrar apenas não lidas se solicitado
        if unread_only:
            user_notifications = [
                notif for notif in user_notifications
                if not notif.get("read", False)
            ]
        
        # Ordenar por data de criação (mais recentes primeiro)
        user_notifications.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return {"notifications": user_notifications}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notifications: {str(e)}")

@app.put("/api/notifications/{notification_id}/read")
async def mark_notification_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Marca notificação como lida"""
    try:
        notifications_data = load_json_data("notifications.json")
        
        # Encontrar e atualizar a notificação
        updated = False
        for notif in notifications_data.get("notifications", []):
            if notif.get("id") == notification_id and notif.get("user_id") == current_user["id"]:
                notif["read"] = True
                updated = True
                break
        
        if not updated:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        # Salvar dados
        if save_json_data("notifications.json", notifications_data):
            return {"message": "Notification marked as read"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update notification")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating notification: {str(e)}")

@app.post("/api/notifications")
async def create_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: str = "info",
    current_user: dict = Depends(get_current_user)
):
    """Cria nova notificação (apenas professores)"""
    if current_user["role"] != "professor":
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    try:
        notifications_data = load_json_data("notifications.json")
        
        # Criar nova notificação
        new_notification = {
            "id": f"notif_{uuid.uuid4().hex[:8]}",
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": notification_type,
            "read": False,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "scheduled_for": None,
            "sent": True
        }
        
        # Adicionar à lista
        if "notifications" not in notifications_data:
            notifications_data["notifications"] = []
        
        notifications_data["notifications"].append(new_notification)
        
        # Salvar dados
        if save_json_data("notifications.json", notifications_data):
            return new_notification
        else:
            raise HTTPException(status_code=500, detail="Failed to save notification")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating notification: {str(e)}")

# Health check
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
