# Planner Edu

Plataforma educacional integrada para gerenciamento de turmas, alunos, aulas e atividades.

## 🏗️ Arquitetura

```
sistema-academico-pim/
├── frontend/                 # React.js + TypeScript
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/           # Páginas principais
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Serviços de API
│   │   ├── types/           # Definições TypeScript
│   │   ├── utils/           # Utilitários
│   │   └── styles/          # Estilos globais
│   ├── public/
│   └── package.json
├── backend/                 # Python + C
│   ├── api/                 # Endpoints REST
│   ├── core/                # Lógica de negócio
│   ├── calculations/        # Módulos C para cálculos
│   ├── data/                # Manipulação JSON
│   ├── notifications/       # Sistema de notificações
│   └── requirements.txt
├── data/                    # Arquivos JSON
│   ├── users.json          # Credenciais
│   ├── classes.json        # Turmas
│   ├── grades.json         # Notas
│   └── calendar.json       # Eventos
├── docs/                   # Documentação
└── scripts/                # Scripts de build/deploy
```

## 🚀 Stack Tecnológico

- **Frontend**: React.js 18+ + TypeScript + Vite
- **Backend**: Python 3.11+ + FastAPI
- **Cálculos**: Módulos C integrados via Python
- **Dados**: JSON + Armazenamento em memória
- **UI/UX**: Tailwind CSS + shadcn/ui
- **Ícones**: Lucide React

## 📋 Funcionalidades

### 👨‍🏫 Professor
- ✅ Gerenciar aulas, provas e trabalhos
- ✅ Visualizar notas dos alunos
- ✅ Enviar notificações
- ✅ Calendário personalizado

### 👨‍🎓 Aluno
- ✅ Visualizar calendário de eventos
- ✅ Acompanhar notas bimestrais
- ✅ Receber notificações
- ✅ Dashboard pessoal

## 🔐 Autenticação

Sistema baseado em arquivo JSON com controle de acesso por função:
- **Professores**: Acesso completo ao sistema
- **Alunos**: Acesso limitado às próprias informações

## 📊 Cálculo de Notas

Fórmula: `(NP1 + NP2 + AVA + PIM) / 2`

Tratamento de casos extremos:
- Notas ausentes (null/undefined)
- Entradas inválidas
- Precisão decimal

## 🔔 Sistema de Notificações

- **Email**: Integração com serviços SMTP
- **In-app**: Notificações em tempo real via polling
- **Tratamento de falhas**: Graceful degradation

## 🏃‍♂️ Como Executar

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

## 📚 Documentação

- [Arquitetura do Sistema](docs/architecture.md)
- [Fluxo de Dados](docs/data-flow.md)
- [API Reference](docs/api.md)
- [Guia de Desenvolvimento](docs/development.md)
