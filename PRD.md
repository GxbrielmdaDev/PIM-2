# Goal
Projetar e implementar um sistema acadêmico estático integrado que gerencie turmas, alunos, aulas e atividades com funcionalidades de colaboração. O sistema deve incluir notificações automáticas para alunos, cálculo de notas bimestrais e acesso baseado em funções (aluno/professor) com dados de login persistentes durante a execução.

# Return format
Entregar uma arquitetura completa do sistema com:
- Frontend estático construído com TypeScript e React.js com UI/UX de alta qualidade
- Lógica de backend implementada em Python e C para cálculos de notas e operações do sistema
- Arquivo JSON gerenciando credenciais de login de professores e alunos durante a execução
- Painéis autenticados separados para alunos e professores, cada um com:
  - Calendário pessoal exibindo aulas, provas e trabalhos
  - Módulo de cálculo de notas mostrando notas bimestrais usando a fórmula: (NP1 + NP2 + AVA + PIM) / 2
  - Sistema de notificações automáticas (email/in-app) para atualizações de agenda
- Documentação clara da arquitetura do sistema, fluxo de dados e detalhes de implementação

# Warnings
- O sistema é estático sem banco de dados; toda persistência de dados durante a execução deve depender apenas de manipulação de arquivo JSON e armazenamento em memória
- A lógica de cálculo de notas deve tratar casos extremos: notas ausentes (valores null/undefined), entradas numéricas inválidas e precisão decimal
- A autenticação deve ser validada contra o arquivo JSON de login; implemente gerenciamento de sessão que persista apenas durante a execução atual
- O sistema de notificações deve lidar graciosamente com falhas (endereços de email inválidos, serviços indisponíveis) sem quebrar a funcionalidade principal
- Garanta controle de acesso baseado em função impedindo que alunos acessem funções de professor e vice-versa
- A sincronização de calendário entre frontend e backend deve considerar diferenças de fuso horário e conflitos de eventos
- A natureza estática do projeto significa sem atualizações em tempo real; considere padrões de polling ou baseados em eventos para simular notificações em tempo real

# Context
O sistema deve suportar:
- **Capacidades do professor**: Adicionar aulas, provas (NP1, NP2), trabalhos (AVA) e projetos (PIM) ao calendário; visualizar notas dos alunos; enviar notificações
- **Capacidades do aluno**: Visualizar calendário com todos os eventos agendados; receber lembretes 