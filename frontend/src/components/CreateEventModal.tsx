import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Clock, MapPin, BookOpen } from 'lucide-react';
import { apiService } from '@/services/api';
import { CreateEventForm, Class } from '@/types';
import toast from 'react-hot-toast';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
  classes: Class[];
  selectedDate?: Date;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  classes,
  selectedDate
}) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateEventForm>({
    defaultValues: {
      type: 'aula',
      title: '',
      description: '',
      class_id: '',
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      time: '08:00',
      duration: 90,
      location: '',
      grade_type: undefined,
      due_date: '',
    },
  });

  const eventType = watch('type');

  const onSubmit = async (data: CreateEventForm) => {
    try {
      setLoading(true);
      
      // Combinar data e hora
      const eventDateTime = `${data.date}T${data.time}:00Z`;
      
      const eventData = {
        ...data,
        date: eventDateTime,
        due_date: data.due_date ? `${data.due_date}T23:59:00Z` : undefined,
      };

      await apiService.createEvent(eventData);
      
      toast.success('Evento criado com sucesso!');
      reset();
      onEventCreated();
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar evento:', error);
      toast.error('Erro ao criar evento');
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [
    { value: 'aula', label: 'Aula', icon: BookOpen },
    { value: 'prova', label: 'Prova', icon: BookOpen },
    { value: 'trabalho', label: 'Trabalho', icon: BookOpen },
    { value: 'projeto', label: 'Projeto', icon: BookOpen },
  ];

  const gradeTypes = [
    { value: 'np1', label: 'NP1' },
    { value: 'np2', label: 'NP2' },
    { value: 'ava', label: 'AVA' },
    { value: 'pim', label: 'PIM' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Criar Novo Evento
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Evento
              </label>
              <div className="grid grid-cols-2 gap-2">
                {eventTypes.map((type) => (
                  <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      {...register('type', { required: 'Tipo é obrigatório' })}
                      type="radio"
                      value={type.value}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{type.label}</span>
                  </label>
                ))}
              </div>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Título
              </label>
              <input
                {...register('title', { required: 'Título é obrigatório' })}
                type="text"
                className="input mt-1"
                placeholder="Ex: Aula de Matemática"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="input mt-1"
                placeholder="Descrição do evento..."
              />
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Turma
              </label>
              <select
                {...register('class_id', { required: 'Turma é obrigatória' })}
                className="input mt-1"
              >
                <option value="">Selecione uma turma</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              {errors.class_id && (
                <p className="mt-1 text-sm text-red-600">{errors.class_id.message}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Data
                </label>
                <input
                  {...register('date', { required: 'Data é obrigatória' })}
                  type="date"
                  className="input mt-1"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Hora
                </label>
                <input
                  {...register('time', { required: 'Hora é obrigatória' })}
                  type="time"
                  className="input mt-1"
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>
            </div>

            {/* Duration and Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duração (min)
                </label>
                <input
                  {...register('duration', { valueAsNumber: true })}
                  type="number"
                  min="15"
                  max="480"
                  className="input mt-1"
                  placeholder="90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Local
                </label>
                <input
                  {...register('location', { required: 'Local é obrigatório' })}
                  type="text"
                  className="input mt-1"
                  placeholder="Sala 101"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>
            </div>

            {/* Grade Type (for provas and trabalhos) */}
            {(eventType === 'prova' || eventType === 'trabalho' || eventType === 'projeto') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Avaliação
                </label>
                <select
                  {...register('grade_type')}
                  className="input mt-1"
                >
                  <option value="">Selecione o tipo</option>
                  {gradeTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Due Date (for trabalhos and projetos) */}
            {(eventType === 'trabalho' || eventType === 'projeto') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data de Entrega
                </label>
                <input
                  {...register('due_date')}
                  type="date"
                  className="input mt-1"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar Evento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
