# Arquitetura do Sistema Acadêmico PIM

## Visão Geral

O Sistema Acadêmico PIM é uma aplicação estática que gerencia turmas, alunos, aulas e atividades acadêmicas. O sistema foi projetado para funcionar sem banco de dados, utilizando apenas arquivos JSON para persistência de dados durante a execução.

## Stack Tecnológico

### Frontend
- **React.js 18+** - Biblioteca para construção da interface
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Zustand** - Gerenciamento de estado
- **React Router** - Roteamento
- **React Hook Form** - Gerenciamento de formulários
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

### Backend
- **Python 3.11+** - Linguagem principal
- **FastAPI** - Framework web assíncrono
- **Uvicorn** - Servidor ASGI
- **Pydantic** - Validação de dados
- **python-jose** - JWT para autenticação
- **Módulos C** - Cálculos de notas otimizados

### Dados
- **JSON** - Armazenamento de dados
- **Memória** - Cache durante execução
- **Arquivos estáticos** - Sem banco de dados

## Arquitetura de Alto Nível

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│                 │ ◄──────────────► │                 │
│   Frontend      │                 │    Backend      │
│   (React)       │                 │   (FastAPI)     │
│                 │                 │                 │
└─────────────────┘                 └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │   Módulo C      │
                                    │  (Cálculos)     │
                                    └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │  Arquivos JSON  │
                                    │   (Dados)       │
                                    └─────────────────┘
```

## Estrutura de Diretórios

```
sistema-academico-pim/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── stores/          # Gerenciamento de estado (Zustand)
│   │   ├── services/        # Serviços de API
│   │   ├── types/           # Definições TypeScript
│   │   └── styles/          # Estilos globais
│   └── package.json
├── backend/                 # API Python
│   ├── api/                 # Endpoints REST
│   ├── core/                # Lógica de negócio
│   ├── calculations/        # Módulos C para cálculos
│   ├── notifications/       # Sistema de notificações
│   └── main.py             # Ponto de entrada
├── data/                   # Arquivos JSON
│   ├── users.json          # Usuários e credenciais
│   ├── classes.json        # Turmas
│   ├── grades.json         # Notas
│   └── calendar.json       # Eventos do calendário
├── docs/                   # Documentação
└── scripts/                # Scripts de build/deploy
```

## Componentes Principais

### 1. Sistema de Autenticação
- **Baseado em JWT** - Tokens com expiração de 8 horas
- **Arquivo JSON** - Credenciais armazenadas em `data/users.json`
- **Controle de Acesso** - Separação entre professores e alunos
- **Sessão Temporária** - Dados persistem apenas durante execução

### 2. Módulo de Cálculo de Notas
- **Implementação C** - Performance otimizada para cálculos
- **Fallback Python** - Caso o módulo C não esteja disponível
- **Fórmula Específica** - `(NP1 + NP2 + AVA + PIM) / 2`
- **Tratamento de Casos Extremos** - Notas nulas, valores inválidos

### 3. Sistema de Calendário
- **Eventos Tipificados** - Aulas, provas, trabalhos, projetos
- **Visualização Mensal** - Interface de calendário interativo
- **Filtros por Usuário** - Alunos veem apenas suas turmas
- **Sincronização** - Consideração de fuso horário

### 4. Sistema de Notificações
- **In-App** - Notificações na interface
- **Email** - Envio via SMTP (configurável)
- **Agendamento** - Lembretes automáticos
- **Polling** - Simulação de tempo real

## Fluxo de Dados

### Autenticação
```
1. Login → Validação JSON → JWT Token → Armazenamento Local
2. Requests → Interceptor → Header Authorization → Validação Backend
3. Expiração → Redirect Login
```

### Cálculo de Notas
```
1. Input Notas → Validação Frontend → API Backend
2. Backend → Módulo C → Cálculo Otimizado
3. Resultado → Atualização JSON → Response Frontend
4. Frontend → Atualização Estado → UI Refresh
```

### Notificações
```
1. Evento Trigger → Criação Notificação → Queue Email
2. Scheduler → Processamento Queue → SMTP Send
3. Polling Frontend → Check Unread → Badge Update
```

## Segurança

### Autenticação e Autorização
- **JWT Tokens** - Assinados com chave secreta
- **Expiração** - Tokens com TTL de 8 horas
- **Role-based Access** - Controle por função (professor/aluno)
- **Route Guards** - Proteção de rotas no frontend

### Validação de Dados
- **Frontend** - React Hook Form + validação client-side
- **Backend** - Pydantic models para validação
- **Sanitização** - Limpeza de inputs maliciosos
- **Type Safety** - TypeScript para prevenção de erros

### Tratamento de Erros
- **Graceful Degradation** - Sistema continua funcionando com falhas parciais
- **Error Boundaries** - Captura de erros no React
- **Logging** - Registro de erros para debugging
- **User Feedback** - Mensagens claras para o usuário

## Performance

### Frontend
- **Code Splitting** - Carregamento sob demanda
- **Lazy Loading** - Componentes carregados quando necessário
- **Memoização** - React.memo para componentes pesados
- **Otimização de Bundle** - Vite para build otimizado

### Backend
- **Módulo C** - Cálculos otimizados em linguagem compilada
- **Async/Await** - FastAPI assíncrono
- **Caching** - Dados em memória durante execução
- **Minimal Dependencies** - Apenas bibliotecas essenciais

### Dados
- **JSON Simples** - Estrutura leve e rápida
- **Índices em Memória** - Busca otimizada
- **Batch Operations** - Operações em lote quando possível

## Escalabilidade

### Limitações Atuais
- **Arquivo JSON** - Não adequado para grandes volumes
- **Memória** - Dados carregados inteiramente
- **Concorrência** - Sem controle de concorrência
- **Backup** - Sem sistema de backup automático

### Melhorias Futuras
- **Banco de Dados** - Migração para PostgreSQL/MongoDB
- **Cache Distribuído** - Redis para cache
- **Microserviços** - Separação de responsabilidades
- **Load Balancer** - Distribuição de carga

## Monitoramento

### Logs
- **Estruturados** - JSON format para parsing
- **Níveis** - DEBUG, INFO, WARNING, ERROR
- **Contexto** - User ID, Request ID, Timestamp
- **Rotação** - Arquivos de log com rotação automática

### Métricas
- **Performance** - Tempo de resposta das APIs
- **Uso** - Número de usuários ativos
- **Erros** - Taxa de erro por endpoint
- **Sistema** - CPU, memória, disco

### Health Checks
- **API Health** - Endpoint `/api/health`
- **Dependências** - Verificação de serviços externos
- **Recursos** - Monitoramento de recursos do sistema

## Deployment

### Desenvolvimento
```bash
# Backend
cd backend
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

### Produção
```bash
# Build
./scripts/build.bat

# Deploy
# Frontend: Servir arquivos estáticos
# Backend: Uvicorn com múltiplos workers
```

### Configuração
- **Variáveis de Ambiente** - Configurações sensíveis
- **CORS** - Configuração para domínios permitidos
- **HTTPS** - Certificados SSL em produção
- **Reverse Proxy** - Nginx para servir arquivos estáticos

## Manutenção

### Backup
- **Arquivos JSON** - Backup regular dos dados
- **Configurações** - Versionamento de configurações
- **Logs** - Arquivamento de logs históricos

### Atualizações
- **Versionamento** - Semantic versioning
- **Migrations** - Scripts para atualização de dados
- **Rollback** - Capacidade de reverter atualizações
- **Testing** - Testes automatizados antes do deploy

### Troubleshooting
- **Logs Centralizados** - Agregação de logs
- **Debugging** - Ferramentas de debug
- **Profiling** - Análise de performance
- **Documentation** - Guias de resolução de problemas
