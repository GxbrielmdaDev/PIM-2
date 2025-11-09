# Planner Edu - Arquitetura C4 e Casos de Uso

## Visão Geral do Sistema

O **Planner Edu** é uma plataforma educacional integrada que facilita o gerenciamento acadêmico entre professores e alunos através de funcionalidades de planejamento, avaliação e comunicação.

## Diagrama C4 - Nível 1: Contexto do Sistema

```mermaid
C4Context
    title Planner Edu - Contexto do Sistema
    
    Person(professor, "Professor", "Educador responsável por turmas, criação de eventos e lançamento de notas")
    Person(aluno, "Aluno", "Estudante que acompanha notas, eventos e recebe notificações")
    
    System(plannerEdu, "Planner Edu", "Plataforma educacional integrada para gerenciamento acadêmico")
    
    Rel(professor, plannerEdu, "Gerencia turmas, cria eventos, lança notas")
    Rel(aluno, plannerEdu, "Visualiza notas, eventos, recebe notificações")
    Rel(plannerEdu, professor, "Envia confirmações e relatórios")
    Rel(plannerEdu, aluno, "Envia notificações automáticas")
```

## Diagrama C4 - Nível 2: Container

```mermaid
C4Container
    title Planner Edu - Arquitetura de Containers
    
    Person(professor, "Professor")
    Person(aluno, "Aluno")
    
    Container_Boundary(plannerEdu, "Planner Edu") {
        Container(webApp, "Aplicação Web", "React + TypeScript", "Interface de usuário responsiva")
        Container(api, "API Backend", "FastAPI + Python", "Lógica de negócio e endpoints REST")
        Container(dataStore, "Armazenamento", "JSON Files", "Persistência de dados (users, grades, events, notifications)")
    }
    
    Rel(professor, webApp, "Acessa via navegador", "HTTPS")
    Rel(aluno, webApp, "Acessa via navegador", "HTTPS")
    Rel(webApp, api, "Consome APIs", "HTTP/REST")
    Rel(api, dataStore, "Lê/Escreve dados", "File I/O")
```

## Diagrama C4 - Nível 3: Componentes

```mermaid
C4Component
    title Planner Edu - Componentes do Sistema
    
    Container_Boundary(webApp, "Aplicação Web React") {
        Component(authComponent, "Autenticação", "React Component", "Login/Logout com JWT")
        Component(dashboardComponent, "Dashboard", "React Component", "Visão geral personalizada por perfil")
        Component(calendarComponent, "Calendário", "React Component", "Visualização e criação de eventos")
        Component(gradesComponent, "Notas", "React Component", "Lançamento e visualização de notas")
        Component(notificationsComponent, "Notificações", "React Component", "Sistema de notificações")
        Component(profileComponent, "Perfil", "React Component", "Gerenciamento de perfil do usuário")
    }
    
    Container_Boundary(api, "API Backend FastAPI") {
        Component(authController, "Auth Controller", "FastAPI Router", "Autenticação JWT")
        Component(userController, "User Controller", "FastAPI Router", "Gerenciamento de usuários")
        Component(gradesController, "Grades Controller", "FastAPI Router", "CRUD de notas")
        Component(calendarController, "Calendar Controller", "FastAPI Router", "CRUD de eventos")
        Component(notificationsController, "Notifications Controller", "FastAPI Router", "Sistema de notificações")
        Component(gradeCalculator, "Grade Calculator", "Python Module", "Cálculo automático de médias")
        Component(notificationService, "Notification Service", "Python Module", "Criação automática de notificações")
    }
    
    Container_Boundary(dataStore, "Armazenamento JSON") {
        Component(usersData, "users.json", "JSON File", "Dados de usuários e autenticação")
        Component(classesData, "classes.json", "JSON File", "Turmas e relacionamentos")
        Component(gradesData, "grades.json", "JSON File", "Notas e avaliações")
        Component(calendarData, "calendar.json", "JSON File", "Eventos e calendário")
        Component(notificationsData, "notifications.json", "JSON File", "Notificações do sistema")
    }
```

## Casos de Uso Detalhados

### 1. Casos de Uso do Professor

```mermaid
graph TD
    Professor[👨‍🏫 Professor]
    
    %% Autenticação
    Professor --> UC1[UC1: Fazer Login]
    UC1 --> UC1_1[Inserir credenciais]
    UC1_1 --> UC1_2[Validar autenticação]
    UC1_2 --> UC1_3[Acessar dashboard]
    
    %% Gerenciamento de Eventos
    Professor --> UC2[UC2: Criar Evento]
    UC2 --> UC2_1[Selecionar tipo de evento]
    UC2_1 --> UC2_2[Definir título e descrição]
    UC2_2 --> UC2_3[Escolher turma]
    UC2_3 --> UC2_4[Definir data e horário]
    UC2_4 --> UC2_5[Especificar local]
    UC2_5 --> UC2_6[Salvar evento]
    UC2_6 --> UC2_7[Notificar alunos automaticamente]
    
    %% Lançamento de Notas
    Professor --> UC3[UC3: Lançar Notas]
    UC3 --> UC3_1[Selecionar aluno]
    UC3_1 --> UC3_2[Escolher tipo de avaliação]
    UC3_2 --> UC3_3[Inserir nota]
    UC3_3 --> UC3_4[Calcular média automaticamente]
    UC3_4 --> UC3_5[Determinar status do aluno]
    UC3_5 --> UC3_6[Salvar nota]
    UC3_6 --> UC3_7[Notificar aluno automaticamente]
    
    %% Visualização
    Professor --> UC4[UC4: Visualizar Turmas]
    Professor --> UC5[UC5: Acompanhar Calendário]
    Professor --> UC6[UC6: Gerenciar Perfil]
```

### 2. Casos de Uso do Aluno

```mermaid
graph TD
    Aluno[👨‍🎓 Aluno]
    
    %% Autenticação
    Aluno --> UC7[UC7: Fazer Login]
    UC7 --> UC7_1[Inserir credenciais]
    UC7_1 --> UC7_2[Validar autenticação]
    UC7_2 --> UC7_3[Acessar dashboard]
    
    %% Visualização de Notas
    Aluno --> UC8[UC8: Consultar Notas]
    UC8 --> UC8_1[Visualizar notas por disciplina]
    UC8_1 --> UC8_2[Ver média final calculada]
    UC8_2 --> UC8_3[Verificar status acadêmico]
    
    %% Calendário
    Aluno --> UC9[UC9: Consultar Eventos]
    UC9 --> UC9_1[Visualizar calendário]
    UC9_1 --> UC9_2[Ver eventos da turma]
    UC9_2 --> UC9_3[Verificar próximos eventos]
    
    %% Notificações
    Aluno --> UC10[UC10: Gerenciar Notificações]
    UC10 --> UC10_1[Visualizar notificações]
    UC10_1 --> UC10_2[Marcar como lida]
    UC10_2 --> UC10_3[Receber notificações automáticas]
    
    %% Perfil
    Aluno --> UC11[UC11: Gerenciar Perfil]
    UC11 --> UC11_1[Visualizar informações pessoais]
    UC11_1 --> UC11_2[Editar dados de contato]
```

### 3. Casos de Uso do Sistema

```mermaid
graph TD
    Sistema[🖥️ Sistema]
    
    %% Notificações Automáticas
    Sistema --> UC12[UC12: Gerar Notificações Automáticas]
    UC12 --> UC12_1[Detectar lançamento de nota]
    UC12_1 --> UC12_2[Criar notificação para aluno]
    UC12_2 --> UC12_3[Detectar criação de evento]
    UC12_3 --> UC12_4[Notificar alunos da turma]
    
    %% Cálculos Automáticos
    Sistema --> UC13[UC13: Calcular Médias]
    UC13 --> UC13_1[Aplicar fórmula: (NP1+NP2+AVA+PIM)/4]
    UC13_1 --> UC13_2[Determinar status: Aprovado/Recuperação/Reprovado]
    
    %% Gerenciamento de Dados
    Sistema --> UC14[UC14: Reset de Dados]
    UC14 --> UC14_1[Detectar reinicialização]
    UC14_1 --> UC14_2[Restaurar dados iniciais limpos]
    UC14_2 --> UC14_3[Garantir ambiente de teste consistente]
```

## Fluxos de Integração

### Fluxo: Professor Cria Evento → Aluno Recebe Notificação

```mermaid
sequenceDiagram
    participant P as Professor
    participant UI as Interface Web
    participant API as Backend API
    participant NS as Notification Service
    participant DB as Data Store
    participant A as Aluno
    
    P->>UI: Acessa Calendário
    P->>UI: Clica "Novo Evento"
    P->>UI: Preenche dados do evento
    UI->>API: POST /api/calendar/events
    API->>DB: Salva evento em calendar.json
    API->>NS: Chama create_event_notifications()
    NS->>DB: Busca alunos da turma
    NS->>DB: Cria notificações em notifications.json
    API->>UI: Retorna sucesso
    UI->>P: Confirma criação
    A->>UI: Acessa Notificações
    UI->>API: GET /api/notifications
    API->>DB: Busca notificações do aluno
    API->>UI: Retorna notificações
    UI->>A: Exibe "Novo evento: [Tipo]"
```

### Fluxo: Professor Lança Nota → Cálculo Automático → Notificação

```mermaid
sequenceDiagram
    participant P as Professor
    participant UI as Interface Web
    participant API as Backend API
    participant GC as Grade Calculator
    participant NS as Notification Service
    participant DB as Data Store
    participant A as Aluno
    
    P->>UI: Acessa Notas
    P->>UI: Edita nota do aluno
    P->>UI: Clica "Salvar"
    UI->>API: PUT /api/grades/update
    API->>GC: Calcula média final
    GC->>API: Retorna (NP1+NP2+AVA+PIM)/4
    API->>GC: Determina status acadêmico
    API->>DB: Salva nota em grades.json
    API->>NS: Chama create_grade_notification()
    NS->>DB: Cria notificação em notifications.json
    API->>UI: Retorna dados atualizados
    UI->>P: Confirma salvamento
    A->>UI: Acessa Dashboard/Notas
    UI->>API: GET /api/grades
    API->>UI: Retorna notas com média calculada
    UI->>A: Exibe nota e média atualizada
```

## Arquitetura de Segurança

```mermaid
graph TD
    subgraph "Camada de Segurança"
        JWT[JWT Authentication]
        CORS[CORS Policy]
        Validation[Input Validation]
    end
    
    subgraph "Controle de Acesso"
        ProfRole[Professor Role]
        AlunoRole[Aluno Role]
        RoleCheck[Role-based Access]
    end
    
    JWT --> RoleCheck
    CORS --> Validation
    ProfRole --> CreateEvent[Criar Eventos]
    ProfRole --> LaunchGrades[Lançar Notas]
    AlunoRole --> ViewGrades[Ver Notas]
    AlunoRole --> ViewEvents[Ver Eventos]
```

## Tecnologias e Padrões Utilizados

### Frontend
- **React 18** - Framework de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Hook Form** - Gerenciamento de formulários
- **Lucide React** - Ícones
- **React Hot Toast** - Notificações de UI

### Backend
- **FastAPI** - Framework web Python
- **JWT** - Autenticação
- **Pydantic** - Validação de dados
- **Uvicorn** - Servidor ASGI

### Padrões Arquiteturais
- **REST API** - Comunicação cliente-servidor
- **Component-based Architecture** - Frontend modular
- **MVC Pattern** - Separação de responsabilidades
- **Observer Pattern** - Sistema de notificações
- **Strategy Pattern** - Cálculo de notas por tipo

## Métricas do Sistema

### Funcionalidades Implementadas
- ✅ **5 Páginas principais** (Dashboard, Calendário, Notas, Notificações, Perfil)
- ✅ **2 Perfis de usuário** (Professor, Aluno)
- ✅ **8 Endpoints REST** principais
- ✅ **4 Tipos de avaliação** (NP1, NP2, AVA, PIM)
- ✅ **4 Tipos de evento** (Aula, Prova, Trabalho, Projeto)
- ✅ **Sistema de notificações** automáticas
- ✅ **Cálculo automático** de médias
- ✅ **Reset automático** de dados

### Qualidade do Código
- ✅ **TypeScript** para tipagem segura
- ✅ **Componentes reutilizáveis**
- ✅ **Validação de entrada** em formulários
- ✅ **Tratamento de erros** consistente
- ✅ **Interface responsiva**
- ✅ **Código limpo** e bem documentado
