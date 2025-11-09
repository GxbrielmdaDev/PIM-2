# API Reference - Sistema Acadêmico PIM

## Base URL
```
http://localhost:8000/api
```

## Autenticação

Todas as rotas protegidas requerem um token JWT no header:
```
Authorization: Bearer <token>
```

### POST /auth/login
Realiza login no sistema.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "string",
    "username": "string",
    "role": "professor|aluno",
    "name": "string",
    "email": "string",
    "department": "string",
    "class_id": "string",
    "registration": "string",
    "created_at": "string"
  }
}
```

**Response (401):**
```json
{
  "detail": "Incorrect username or password"
}
```

### GET /auth/me
Retorna dados do usuário autenticado.

**Response (200):**
```json
{
  "id": "string",
  "username": "string",
  "role": "professor|aluno",
  "name": "string",
  "email": "string",
  "department": "string",
  "class_id": "string",
  "registration": "string",
  "created_at": "string"
}
```

## Usuários

### GET /users
Lista usuários (apenas professores).

**Permissions:** Professor

**Response (200):**
```json
{
  "users": [
    {
      "id": "string",
      "username": "string",
      "role": "professor|aluno",
      "name": "string",
      "email": "string",
      "department": "string",
      "class_id": "string",
      "registration": "string",
      "created_at": "string"
    }
  ]
}
```

## Turmas

### GET /classes
Lista todas as turmas.

**Response (200):**
```json
{
  "classes": [
    {
      "id": "string",
      "name": "string",
      "professor_id": "string",
      "subject": "string",
      "schedule": {
        "monday": ["08:00-09:30", "10:00-11:30"],
        "wednesday": ["08:00-09:30"],
        "friday": ["14:00-15:30"]
      },
      "students": ["string"],
      "created_at": "string"
    }
  ]
}
```

## Notas

### GET /grades
Lista notas (filtradas por usuário se for aluno).

**Response (200):**
```json
{
  "grades": [
    {
      "id": "string",
      "student_id": "string",
      "class_id": "string",
      "semester": "string",
      "np1": "number|null",
      "np2": "number|null",
      "ava": "number|null",
      "pim": "number|null",
      "final_grade": "number|null",
      "status": "em_andamento|aprovado|recuperacao|reprovado",
      "created_at": "string",
      "updated_at": "string"
    }
  ]
}
```

### PUT /grades/{student_id}
Atualiza nota de um aluno (apenas professores).

**Permissions:** Professor

**Request Body:**
```json
{
  "grade_type": "np1|np2|ava|pim",
  "value": "number"
}
```

**Response (200):**
```json
{
  "id": "string",
  "student_id": "string",
  "class_id": "string",
  "semester": "string",
  "np1": "number|null",
  "np2": "number|null",
  "ava": "number|null",
  "pim": "number|null",
  "final_grade": "number|null",
  "status": "em_andamento|aprovado|recuperacao|reprovado",
  "created_at": "string",
  "updated_at": "string"
}
```

### POST /grades/calculate
Calcula notas finais para múltiplos alunos.

**Request Body:**
```json
{
  "students_grades": [
    {
      "student_id": "string",
      "np1": "number|null",
      "np2": "number|null",
      "ava": "number|null",
      "pim": "number|null"
    }
  ]
}
```

**Response (200):**
```json
[
  {
    "student_id": "string",
    "np1": "number|null",
    "np2": "number|null",
    "ava": "number|null",
    "pim": "number|null",
    "final_grade": "number|null",
    "status": "string"
  }
]
```

### GET /classes/{class_id}/statistics
Retorna estatísticas de uma turma.

**Response (200):**
```json
{
  "average": "number",
  "highest": "number",
  "lowest": "number",
  "total_students": "number",
  "approved_count": "number",
  "approval_rate": "number"
}
```

## Calendário

### GET /calendar
Lista eventos do calendário (filtrados por usuário).

**Response (200):**
```json
{
  "events": [
    {
      "id": "string",
      "type": "aula|prova|trabalho|projeto",
      "title": "string",
      "description": "string",
      "class_id": "string",
      "professor_id": "string",
      "date": "string",
      "duration": "number|null",
      "location": "string",
      "grade_type": "np1|np2|ava|pim",
      "due_date": "string",
      "created_at": "string"
    }
  ]
}
```

### POST /calendar/events
Cria novo evento (apenas professores).

**Permissions:** Professor

**Request Body:**
```json
{
  "type": "aula|prova|trabalho|projeto",
  "title": "string",
  "description": "string",
  "class_id": "string",
  "date": "string",
  "time": "string",
  "duration": "number",
  "location": "string",
  "grade_type": "np1|np2|ava|pim",
  "due_date": "string"
}
```

**Response (201):**
```json
{
  "id": "string",
  "type": "aula|prova|trabalho|projeto",
  "title": "string",
  "description": "string",
  "class_id": "string",
  "professor_id": "string",
  "date": "string",
  "duration": "number|null",
  "location": "string",
  "grade_type": "np1|np2|ava|pim",
  "due_date": "string",
  "created_at": "string"
}
```

### PUT /calendar/events/{event_id}
Atualiza evento existente (apenas professores).

**Permissions:** Professor

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "date": "string",
  "time": "string",
  "duration": "number",
  "location": "string"
}
```

### DELETE /calendar/events/{event_id}
Remove evento (apenas professores).

**Permissions:** Professor

**Response (204):** No Content

## Notificações

### GET /notifications
Lista notificações do usuário.

**Query Parameters:**
- `unread_only` (boolean): Apenas não lidas

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "string",
      "user_id": "string",
      "title": "string",
      "message": "string",
      "type": "info|warning|success|error",
      "read": "boolean",
      "created_at": "string",
      "scheduled_for": "string|null",
      "sent": "boolean"
    }
  ]
}
```

### PUT /notifications/{notification_id}/read
Marca notificação como lida.

**Response (200):**
```json
{
  "message": "Notification marked as read"
}
```

### POST /notifications
Cria nova notificação (apenas professores).

**Permissions:** Professor

**Request Body:**
```json
{
  "user_id": "string",
  "title": "string",
  "message": "string",
  "type": "info|warning|success|error",
  "send_email": "boolean",
  "schedule_for": "string"
}
```

**Response (201):**
```json
{
  "id": "string",
  "user_id": "string",
  "title": "string",
  "message": "string",
  "type": "info|warning|success|error",
  "read": "boolean",
  "created_at": "string",
  "scheduled_for": "string|null",
  "sent": "boolean"
}
```

## Health Check

### GET /health
Verifica status da API.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "string"
}
```

## Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 204 | No Content - Requisição bem-sucedida sem conteúdo |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou ausente |
| 403 | Forbidden - Sem permissão para acessar recurso |
| 404 | Not Found - Recurso não encontrado |
| 422 | Unprocessable Entity - Erro de validação |
| 500 | Internal Server Error - Erro interno do servidor |

## Tratamento de Erros

### Formato de Erro Padrão
```json
{
  "detail": "string",
  "type": "string",
  "code": "string"
}
```

### Erros de Validação (422)
```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

## Rate Limiting

Atualmente não implementado, mas recomendado para produção:
- **Login**: 5 tentativas por minuto por IP
- **API Geral**: 100 requests por minuto por usuário
- **Upload**: 10 uploads por minuto por usuário

## Exemplos de Uso

### Fluxo de Autenticação
```javascript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'professor1',
    password: 'senha123'
  })
});

const { access_token } = await loginResponse.json();

// 2. Usar token nas próximas requisições
const gradesResponse = await fetch('/api/grades', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});
```

### Buscar Notas de um Aluno
```javascript
const response = await fetch('/api/grades', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { grades } = await response.json();
const studentGrades = grades.filter(g => g.student_id === 'aluno001');
```

### Criar Evento no Calendário
```javascript
const response = await fetch('/api/calendar/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type: 'prova',
    title: 'NP1 - Matemática',
    description: 'Primeira avaliação bimestral',
    class_id: 'turma_a',
    date: '2024-11-15T08:00:00Z',
    duration: 120,
    location: 'Sala 101',
    grade_type: 'np1'
  })
});
```

## Websockets (Futuro)

Planejado para implementação futura:
- **Notificações em tempo real**
- **Atualizações de notas**
- **Status de presença**
- **Chat entre professores e alunos**

## Versionamento

A API segue versionamento semântico:
- **v1.0.0** - Versão atual
- **Compatibilidade** - Mudanças breaking incrementam major version
- **Deprecação** - Recursos obsoletos mantidos por 2 versões
