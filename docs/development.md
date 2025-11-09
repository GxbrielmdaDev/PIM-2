# Guia de Desenvolvimento - Sistema Acadêmico PIM

## Configuração do Ambiente

### Pré-requisitos
- **Python 3.11+** - Linguagem principal do backend
- **Node.js 18+** - Para o frontend React
- **Git** - Controle de versão
- **GCC** (opcional) - Para compilar módulos C

### Instalação

#### 1. Clone o repositório
```bash
git clone <repository-url>
cd sistema-academico-pim
```

#### 2. Configure o Backend
```bash
cd backend
pip install -r requirements.txt
```

#### 3. Configure o Frontend
```bash
cd frontend
npm install
```

#### 4. Compile o módulo C (opcional)
```bash
cd backend/calculations
gcc -shared -fPIC -o grade_calculator.dll grade_calculator.c  # Windows
gcc -shared -fPIC -o grade_calculator.so grade_calculator.c   # Linux/Mac
```

## Executando o Sistema

### Desenvolvimento

#### Método 1: Script Automático (Windows)
```bash
./scripts/start.bat
```

#### Método 2: Manual
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### URLs de Acesso
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs

## Estrutura do Código

### Frontend (React + TypeScript)

#### Componentes
```
src/components/
├── Layout.tsx          # Layout principal
├── Sidebar.tsx         # Menu lateral
├── Header.tsx          # Cabeçalho
├── LoadingSpinner.tsx  # Indicador de carregamento
└── ProtectedRoute.tsx  # Proteção de rotas
```

#### Páginas
```
src/pages/
├── LoginPage.tsx       # Tela de login
├── DashboardPage.tsx   # Dashboard principal
├── CalendarPage.tsx    # Calendário de eventos
├── GradesPage.tsx      # Gestão de notas
├── NotificationsPage.tsx # Notificações
└── ProfilePage.tsx     # Perfil do usuário
```

#### Stores (Zustand)
```
src/stores/
├── authStore.ts        # Estado de autenticação
└── notificationStore.ts # Estado de notificações
```

#### Serviços
```
src/services/
└── api.ts              # Cliente da API REST
```

### Backend (Python + FastAPI)

#### Estrutura Principal
```
backend/
├── main.py                    # Ponto de entrada
├── api/                       # Endpoints REST
├── core/                      # Lógica de negócio
├── calculations/              # Módulos de cálculo
│   ├── grade_calculator.c     # Implementação C
│   └── grade_calculator.py    # Wrapper Python
└── notifications/             # Sistema de notificações
    └── notification_service.py
```

## Padrões de Desenvolvimento

### Frontend

#### Componentes React
```typescript
// Exemplo de componente funcional
import React from 'react';
import { ComponentProps } from '@/types';

interface Props {
  title: string;
  children: React.ReactNode;
}

const MyComponent: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="component-wrapper">
      <h1>{title}</h1>
      {children}
    </div>
  );
};

export default MyComponent;
```

#### Hooks Personalizados
```typescript
// Exemplo de hook personalizado
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export const useData = <T>(endpoint: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiService.get(endpoint);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};
```

#### Stores Zustand
```typescript
// Exemplo de store
import { create } from 'zustand';

interface State {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCountStore = create<State>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

### Backend

#### Endpoints FastAPI
```python
# Exemplo de endpoint
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from .models import User, UserResponse
from .auth import get_current_user

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: User = Depends(get_current_user)):
    if current_user.role != "professor":
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    # Lógica para buscar usuários
    users = load_users_from_json()
    return users
```

#### Modelos Pydantic
```python
# Exemplo de modelo
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    name: str
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
```

## Testes

### Frontend (Jest + Testing Library)
```typescript
// Exemplo de teste de componente
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<MyComponent onClick={handleClick} />);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Backend (pytest)
```python
# Exemplo de teste de API
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_login_success():
    response = client.post("/api/auth/login", json={
        "username": "professor1",
        "password": "senha123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_credentials():
    response = client.post("/api/auth/login", json={
        "username": "invalid",
        "password": "invalid"
    })
    assert response.status_code == 401
```

## Debugging

### Frontend
```typescript
// Debug com React DevTools
import { useEffect } from 'react';

const MyComponent = () => {
  useEffect(() => {
    console.log('Component mounted');
    return () => console.log('Component unmounted');
  }, []);

  // Usar breakpoints no navegador
  debugger;
  
  return <div>Component</div>;
};
```

### Backend
```python
# Debug com pdb
import pdb

def my_function():
    pdb.set_trace()  # Breakpoint
    # Código a ser debugado
    pass

# Debug com logging
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def my_function():
    logger.debug("Debug message")
    logger.info("Info message")
    logger.error("Error message")
```

## Performance

### Frontend
- **React.memo** - Memoização de componentes
- **useMemo/useCallback** - Memoização de valores e funções
- **Code Splitting** - Divisão do código em chunks
- **Lazy Loading** - Carregamento sob demanda

### Backend
- **Async/Await** - Operações assíncronas
- **Caching** - Cache em memória
- **Batch Operations** - Operações em lote
- **Profiling** - Análise de performance

## Convenções

### Nomenclatura
- **Componentes**: PascalCase (ex: `UserProfile`)
- **Funções**: camelCase (ex: `getUserData`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `API_BASE_URL`)
- **Arquivos**: kebab-case (ex: `user-profile.tsx`)

### Commits
```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: ajustes de formatação
refactor: refatoração de código
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

### Pull Requests
1. **Branch naming**: `feature/nome-da-feature` ou `fix/nome-do-bug`
2. **Descrição clara** do que foi implementado
3. **Testes** incluídos quando aplicável
4. **Screenshots** para mudanças visuais
5. **Review** obrigatório antes do merge

## Troubleshooting

### Problemas Comuns

#### Frontend não carrega
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Verificar porta
netstat -an | grep 3000
```

#### Backend não inicia
```bash
# Verificar dependências
pip install -r requirements.txt

# Verificar porta
netstat -an | grep 8000

# Verificar logs
python main.py --log-level debug
```

#### Módulo C não compila
```bash
# Instalar compilador
# Windows: Visual Studio Build Tools
# Linux: gcc
# Mac: Xcode Command Line Tools

# Compilar manualmente
gcc --version
gcc -shared -fPIC -o grade_calculator.so grade_calculator.c
```

### Logs e Monitoramento
- **Frontend**: Console do navegador (F12)
- **Backend**: Logs no terminal
- **Network**: Tab Network do DevTools
- **Performance**: Lighthouse audit

## Contribuição

### Setup para Contribuidores
1. Fork do repositório
2. Clone do fork
3. Configuração do ambiente
4. Criação de branch para feature
5. Desenvolvimento e testes
6. Commit e push
7. Criação de Pull Request

### Code Review
- **Funcionalidade** - Código funciona conforme esperado
- **Qualidade** - Código limpo e bem estruturado
- **Performance** - Não introduz regressões
- **Testes** - Cobertura adequada de testes
- **Documentação** - Documentação atualizada quando necessário
