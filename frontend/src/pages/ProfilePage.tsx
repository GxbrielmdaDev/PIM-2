import React, { useState } from 'react';
import { 
  Calendar,
  Edit3,
  Save,
  X,
  Bell,
  GraduationCap,
  BookOpen,
  Shield
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
  department?: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      department: user?.department || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      
      // Simular atualização do perfil
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser(data);
      setIsEditing(false);
      reset(data);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const getRoleDisplayName = (role: string) => {
    return role === 'professor' ? 'Professor' : 'Aluno';
  };

  const getRoleIcon = (role: string) => {
    return role === 'professor' ? (
      <GraduationCap className="h-5 w-5 text-blue-600" />
    ) : (
      <BookOpen className="h-5 w-5 text-green-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie suas informações pessoais e configurações
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Informações Pessoais
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-outline btn-sm flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editar</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading || !isDirty}
                    className="btn btn-primary btn-sm flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Salvando...' : 'Salvar'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn btn-ghost btn-sm flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancelar</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                    <span className="text-2xl font-semibold text-primary-600">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {user?.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getRoleIcon(user?.role || '')}
                      <span className="text-sm text-gray-600">
                        {getRoleDisplayName(user?.role || '')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome Completo
                    </label>
                    <div className="mt-1">
                      <input
                        {...register('name', {
                          required: 'Nome é obrigatório',
                          minLength: {
                            value: 2,
                            message: 'Nome deve ter pelo menos 2 caracteres'
                          }
                        })}
                        type="text"
                        disabled={!isEditing}
                        className={`input ${errors.name ? 'input-error' : ''} ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        {...register('email', {
                          required: 'Email é obrigatório',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido'
                          }
                        })}
                        type="email"
                        disabled={!isEditing}
                        className={`input ${errors.email ? 'input-error' : ''} ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                        placeholder="seu.email@exemplo.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Telefone
                    </label>
                    <div className="mt-1">
                      <input
                        {...register('phone')}
                        type="tel"
                        disabled={!isEditing}
                        className={`input ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  {/* Department (only for professors) */}
                  {user?.role === 'professor' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Departamento
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('department')}
                          type="text"
                          disabled={!isEditing}
                          className={`input ${
                            !isEditing ? 'bg-gray-50' : ''
                          }`}
                          placeholder="Departamento"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Read-only fields */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">
                    Informações do Sistema
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Usuário
                      </label>
                      <div className="mt-1 text-sm text-gray-900">
                        {user?.username}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Função
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        {getRoleIcon(user?.role || '')}
                        <span className="text-sm text-gray-900">
                          {getRoleDisplayName(user?.role || '')}
                        </span>
                      </div>
                    </div>

                    {user?.registration && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Matrícula
                        </label>
                        <div className="mt-1 text-sm text-gray-900">
                          {user.registration}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Membro desde
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Security Card */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Shield className="h-5 w-5 text-gray-600" />
                <span>Segurança</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full btn btn-outline text-left justify-start">
                Alterar Senha
              </button>
              <button className="w-full btn btn-outline text-left justify-start">
                Histórico de Login
              </button>
              <button className="w-full btn btn-outline text-left justify-start">
                Sessões Ativas
              </button>
            </div>
          </div>

          {/* Notifications Settings */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-600" />
                <span>Notificações</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Email
                  </p>
                  <p className="text-sm text-gray-500">
                    Receber notificações por email
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Lembretes
                  </p>
                  <p className="text-sm text-gray-500">
                    Lembretes de eventos próximos
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Notas
                  </p>
                  <p className="text-sm text-gray-500">
                    Atualizações de notas
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Estatísticas
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Último login:</span>
                <span className="font-medium text-gray-900">Hoje</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total de logins:</span>
                <span className="font-medium text-gray-900">127</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Notificações lidas:</span>
                <span className="font-medium text-gray-900">89%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
