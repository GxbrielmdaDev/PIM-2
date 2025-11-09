import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Edit3,
  Save,
  X,
  Calculator,
  Award,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/api';
import { Grade, Class, User } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

const GradesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: number | null}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [gradesData, classesData] = await Promise.all([
        apiService.getGrades(),
        apiService.getClasses(),
      ]);

      setGrades(gradesData);
      setClasses(classesData);

      // Se for professor, carregar lista de alunos
      if (user?.role === 'professor') {
        try {
          const usersData = await apiService.getUsers();
          setStudents(usersData.filter(u => u.role === 'aluno'));
        } catch (error) {
          console.error('Erro ao carregar alunos:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar notas');
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || 'Aluno não encontrado';
  };

  const getClassName = (classId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    return classInfo?.name || 'Turma não encontrada';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aprovado: { color: 'status-aprovado', text: 'Aprovado' },
      reprovado: { color: 'status-reprovado', text: 'Reprovado' },
      recuperacao: { color: 'status-recuperacao', text: 'Recuperação' },
      em_andamento: { color: 'status-em_andamento', text: 'Em Andamento' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.em_andamento;

    return (
      <span className={`status-badge ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getGradeIcon = (grade: number | null) => {
    if (grade === null) return <Minus className="h-4 w-4 text-gray-400" />;
    if (grade >= 8) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (grade >= 6) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const formatGrade = (grade: number | null) => {
    if (grade === null) return '-';
    return grade.toFixed(1);
  };

  const startEditing = (gradeId: string, grade: Grade) => {
    setEditingGrade(gradeId);
    setEditValues({
      np1: grade.np1,
      np2: grade.np2,
      ava: grade.ava,
      pim: grade.pim,
    });
  };

  const cancelEditing = () => {
    setEditingGrade(null);
    setEditValues({});
  };

  const saveGrade = async (gradeId: string) => {
    try {
      const currentGrade = grades.find(g => g.id === gradeId);
      if (!currentGrade) {
        toast.error('Nota não encontrada');
        return;
      }

      // Salvar cada nota alterada individualmente
      const updates = [];
      
      // Verificar quais notas foram alteradas
      if (editValues.np1 !== undefined && editValues.np1 !== currentGrade.np1) {
        updates.push({ grade_type: 'np1', value: editValues.np1 });
      }
      if (editValues.np2 !== undefined && editValues.np2 !== currentGrade.np2) {
        updates.push({ grade_type: 'np2', value: editValues.np2 });
      }
      if (editValues.ava !== undefined && editValues.ava !== currentGrade.ava) {
        updates.push({ grade_type: 'ava', value: editValues.ava });
      }
      if (editValues.pim !== undefined && editValues.pim !== currentGrade.pim) {
        updates.push({ grade_type: 'pim', value: editValues.pim });
      }

      // Executar atualizações
      for (const update of updates) {
        await apiService.updateGrade({
          student_id: currentGrade.student_id,
          grade_type: update.grade_type as 'np1' | 'np2' | 'ava' | 'pim',
          value: update.value || 0
        });
      }

      // Recarregar dados após salvar
      await loadData();
      
      setEditingGrade(null);
      setEditValues({});
      toast.success('Nota atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar nota:', error);
      toast.error(error.response?.data?.detail || 'Erro ao salvar nota');
    }
  };

  const handleGradeChange = (field: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    if (numValue !== null && (numValue < 0 || numValue > 10)) {
      toast.error('Nota deve estar entre 0 e 10');
      return;
    }
    
    setEditValues(prev => ({
      ...prev,
      [field]: numValue,
    }));
  };

  // Filtrar notas baseado no papel do usuário
  const filteredGrades = user?.role === 'aluno' 
    ? grades.filter(grade => grade.student_id === user.id)
    : grades;

  // Calcular estatísticas
  const completedGrades = filteredGrades.filter(grade => grade.final_grade !== null);
  const approvedCount = completedGrades.filter(grade => grade.status === 'aprovado').length;
  const averageGrade = completedGrades.length > 0 
    ? completedGrades.reduce((sum, grade) => sum + (grade.final_grade || 0), 0) / completedGrades.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notas</h1>
          <p className="mt-1 text-sm text-gray-600">
            {user?.role === 'professor' 
              ? 'Gerencie as notas dos seus alunos' 
              : 'Acompanhe seu desempenho acadêmico'
            }
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Avaliações
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {filteredGrades.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Aprovações
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {approvedCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calculator className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Média Geral
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {averageGrade.toFixed(1)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Taxa de Aprovação
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {completedGrades.length > 0 ? Math.round((approvedCount / completedGrades.length) * 100) : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {user?.role === 'professor' ? 'Notas dos Alunos' : 'Minhas Notas'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                {user?.role === 'professor' && (
                  <th className="table-head">Aluno</th>
                )}
                <th className="table-head">Turma</th>
                <th className="table-head">Semestre</th>
                <th className="table-head text-center">NP1</th>
                <th className="table-head text-center">NP2</th>
                <th className="table-head text-center">AVA</th>
                <th className="table-head text-center">PIM</th>
                <th className="table-head text-center">Média Final</th>
                <th className="table-head text-center">Status</th>
                {user?.role === 'professor' && (
                  <th className="table-head text-center">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredGrades.map((grade) => (
                <tr key={grade.id} className="table-row">
                  {user?.role === 'professor' && (
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">
                        {getStudentName(grade.student_id)}
                      </div>
                    </td>
                  )}
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      {getClassName(grade.class_id)}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      {grade.semester}
                    </div>
                  </td>
                  
                  {/* Grade Columns */}
                  {['np1', 'np2', 'ava', 'pim'].map((gradeType) => (
                    <td key={gradeType} className="table-cell text-center">
                      {editingGrade === grade.id && user?.role === 'professor' ? (
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={editValues[gradeType] ?? ''}
                          onChange={(e) => handleGradeChange(gradeType, e.target.value)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="-"
                        />
                      ) : (
                        <div className="flex items-center justify-center space-x-1">
                          {getGradeIcon(grade[gradeType as keyof Grade] as number | null)}
                          <span className="text-sm font-medium">
                            {formatGrade(grade[gradeType as keyof Grade] as number | null)}
                          </span>
                        </div>
                      )}
                    </td>
                  ))}
                  
                  <td className="table-cell text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {getGradeIcon(grade.final_grade)}
                      <span className="text-sm font-semibold">
                        {formatGrade(grade.final_grade)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="table-cell text-center">
                    {getStatusBadge(grade.status)}
                  </td>
                  
                  {user?.role === 'professor' && (
                    <td className="table-cell text-center">
                      {editingGrade === grade.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => saveGrade(grade.id)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Salvar"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 text-gray-600 hover:text-gray-800"
                            title="Cancelar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(grade.id, grade)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Editar notas"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredGrades.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma nota encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                {user?.role === 'professor' 
                  ? 'Comece adicionando notas para seus alunos.' 
                  : 'Suas notas aparecerão aqui quando forem lançadas.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Grade Calculation Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Como é calculada a média final
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              A média final é calculada pela fórmula: <strong>(NP1 + NP2 + AVA + PIM) ÷ 4</strong>
            </p>
            <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
              <li><strong>NP1 e NP2:</strong> Notas das provas bimestrais</li>
              <li><strong>AVA:</strong> Atividades Virtuais de Aprendizagem</li>
              <li><strong>PIM:</strong> Projeto Integrado Multidisciplinar</li>
              <li><strong>Aprovação:</strong> Média final ≥ 7,0</li>
              <li><strong>Recuperação:</strong> Média final entre 5,0 e 6,9</li>
              <li><strong>Reprovação:</strong> Média final &lt; 5,0</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradesPage;
