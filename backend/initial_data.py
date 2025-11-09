"""
Dados iniciais limpos para o Planner Edu.
Estes dados são carregados sempre que o servidor inicia.
"""

INITIAL_USERS = {
    "users": [
        {
            "id": "prof001",
            "username": "professor1",
            "password": "senha123",
            "role": "professor",
            "name": "Prof. João Silva",
            "email": "joao.silva@universidade.edu.br",
            "phone": "(11) 99999-0001",
            "created_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": "prof002", 
            "username": "professor2",
            "password": "senha123",
            "role": "professor",
            "name": "Prof. Maria Santos",
            "email": "maria.santos@universidade.edu.br",
            "phone": "(11) 99999-0002",
            "created_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": "aluno001",
            "username": "aluno1",
            "password": "123456",
            "role": "aluno",
            "name": "Pedro Oliveira",
            "email": "pedro.oliveira@aluno.edu.br",
            "phone": "(11) 99999-1001",
            "created_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": "aluno002",
            "username": "aluno2", 
            "password": "123456",
            "role": "aluno",
            "name": "Ana Costa",
            "email": "ana.costa@aluno.edu.br",
            "phone": "(11) 99999-1002",
            "created_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": "aluno003",
            "username": "aluno3",
            "password": "123456", 
            "role": "aluno",
            "name": "Carlos Ferreira",
            "email": "carlos.ferreira@aluno.edu.br",
            "phone": "(11) 99999-1003",
            "created_at": "2024-01-01T00:00:00Z"
        }
    ]
}

INITIAL_CLASSES = {
    "classes": [
        {
            "id": "turma_a",
            "name": "Turma A - 3º Ano",
            "subject": "Matemática",
            "professor_id": "prof001",
            "students": ["aluno001", "aluno002"],
            "semester": "2024.1",
            "created_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": "turma_b",
            "name": "Turma B - 2º Ano", 
            "subject": "Português",
            "professor_id": "prof002",
            "students": ["aluno003"],
            "semester": "2024.1",
            "created_at": "2024-01-01T00:00:00Z"
        }
    ]
}

INITIAL_GRADES = {
    "grades": [
        {
            "id": "grade001",
            "student_id": "aluno001",
            "class_id": "turma_a",
            "semester": "2024.1",
            "np1": None,
            "np2": None,
            "ava": None,
            "pim": None,
            "final_grade": None,
            "status": "em_andamento",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": "grade002",
            "student_id": "aluno002",
            "class_id": "turma_a", 
            "semester": "2024.1",
            "np1": None,
            "np2": None,
            "ava": None,
            "pim": None,
            "final_grade": None,
            "status": "em_andamento",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": "grade003",
            "student_id": "aluno003",
            "class_id": "turma_b",
            "semester": "2024.1", 
            "np1": None,
            "np2": None,
            "ava": None,
            "pim": None,
            "final_grade": None,
            "status": "em_andamento",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    ]
}

INITIAL_CALENDAR = {
    "events": []
}

INITIAL_NOTIFICATIONS = {
    "notifications": [
        {
            "id": "notif001",
            "user_id": "aluno001",
            "title": "Bem-vindo ao Planner Edu",
            "message": "Seja bem-vindo! Aqui você pode acompanhar suas notas, eventos e muito mais.",
            "type": "info",
            "read": False,
            "created_at": "2024-01-01T00:00:00Z",
            "scheduled_for": None,
            "sent": True
        },
        {
            "id": "notif002", 
            "user_id": "aluno002",
            "title": "Bem-vindo ao Planner Edu",
            "message": "Seja bem-vindo! Aqui você pode acompanhar suas notas, eventos e muito mais.",
            "type": "info",
            "read": False,
            "created_at": "2024-01-01T00:00:00Z",
            "scheduled_for": None,
            "sent": True
        },
        {
            "id": "notif003",
            "user_id": "aluno003", 
            "title": "Bem-vindo ao Planner Edu",
            "message": "Seja bem-vindo! Aqui você pode acompanhar suas notas, eventos e muito mais.",
            "type": "info",
            "read": False,
            "created_at": "2024-01-01T00:00:00Z",
            "scheduled_for": None,
            "sent": True
        }
    ]
}
