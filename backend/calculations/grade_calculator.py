import ctypes
import os
from typing import Optional, Dict, List, Tuple

class GradeCalculator:
    """Wrapper Python para o módulo de cálculo de notas em C"""
    
    def __init__(self):
        self._load_c_library()
    
    def _load_c_library(self):
        """Carrega a biblioteca C compilada"""
        try:
            # Caminho para a biblioteca compilada
            lib_path = os.path.join(os.path.dirname(__file__), "grade_calculator.so")
            
            # No Windows, usar .dll
            if os.name == 'nt':
                lib_path = os.path.join(os.path.dirname(__file__), "grade_calculator.dll")
            
            # Se não existir, usar implementação Python pura
            if not os.path.exists(lib_path):
                self.lib = None
                print("Biblioteca C não encontrada, usando implementação Python")
                return
            
            self.lib = ctypes.CDLL(lib_path)
            self._setup_function_signatures()
            
        except Exception as e:
            print(f"Erro ao carregar biblioteca C: {e}")
            self.lib = None
    
    def _setup_function_signatures(self):
        """Define as assinaturas das funções C"""
        if not self.lib:
            return
        
        # Estrutura Grade
        class Grade(ctypes.Structure):
            _fields_ = [("value", ctypes.c_double), ("is_valid", ctypes.c_int)]
        
        self.Grade = Grade
        
        # calculate_final_grade
        self.lib.calculate_final_grade.argtypes = [Grade, Grade, Grade, Grade]
        self.lib.calculate_final_grade.restype = ctypes.c_double
        
        # validate_grade
        self.lib.validate_grade.argtypes = [ctypes.c_double]
        self.lib.validate_grade.restype = ctypes.c_int
        
        # get_student_status
        self.lib.get_student_status.argtypes = [ctypes.c_double]
        self.lib.get_student_status.restype = ctypes.c_char_p
    
    def calculate_final_grade(self, np1: Optional[float], np2: Optional[float], 
                            ava: Optional[float], pim: Optional[float]) -> Optional[float]:
        """
        Calcula a nota final usando a fórmula: (NP1 + NP2 + AVA + PIM) / 2
        
        Args:
            np1: Nota da primeira prova (0-10 ou None)
            np2: Nota da segunda prova (0-10 ou None) 
            ava: Nota da atividade de valor agregado (0-10 ou None)
            pim: Nota do projeto integrado multidisciplinar (0-10 ou None)
            
        Returns:
            Nota final calculada ou None se não há notas suficientes
        """
        
        if self.lib:
            return self._calculate_with_c_library(np1, np2, ava, pim)
        else:
            return self._calculate_with_python(np1, np2, ava, pim)
    
    def _calculate_with_c_library(self, np1, np2, ava, pim) -> Optional[float]:
        """Calcula usando a biblioteca C"""
        try:
            # Converter para estruturas C
            grade_np1 = self.Grade(np1 if np1 is not None else 0.0, 1 if np1 is not None else 0)
            grade_np2 = self.Grade(np2 if np2 is not None else 0.0, 1 if np2 is not None else 0)
            grade_ava = self.Grade(ava if ava is not None else 0.0, 1 if ava is not None else 0)
            grade_pim = self.Grade(pim if pim is not None else 0.0, 1 if pim is not None else 0)
            
            result = self.lib.calculate_final_grade(grade_np1, grade_np2, grade_ava, grade_pim)
            
            return result if result >= 0 else None
            
        except Exception as e:
            print(f"Erro no cálculo C: {e}")
            return self._calculate_with_python(np1, np2, ava, pim)
    
    def _calculate_with_python(self, np1, np2, ava, pim) -> Optional[float]:
        """Implementação Python pura como fallback"""
        try:
            # Validar e coletar notas válidas
            valid_grades = []
            
            for grade in [np1, np2, ava, pim]:
                if grade is not None and self.validate_grade_python(grade):
                    valid_grades.append(grade)
            
            # Precisa de pelo menos 2 notas válidas
            if len(valid_grades) < 2:
                return None
            
            # Calcular usando a fórmula especificada: soma / 2
            total_sum = sum(valid_grades)
            final_grade = total_sum / 2.0
            
            # Garantir que não exceda 10.0
            return min(final_grade, 10.0)
            
        except Exception as e:
            print(f"Erro no cálculo Python: {e}")
            return None
    
    def validate_grade_python(self, grade: float) -> bool:
        """Validação Python para notas"""
        try:
            return (isinstance(grade, (int, float)) and 
                   0.0 <= grade <= 10.0 and 
                   not (grade != grade))  # Check for NaN
        except:
            return False
    
    def get_student_status(self, final_grade: Optional[float]) -> str:
        """
        Determina o status do aluno baseado na nota final
        
        Args:
            final_grade: Nota final calculada
            
        Returns:
            Status do aluno: 'aprovado', 'recuperacao', 'reprovado', 'em_andamento'
        """
        if final_grade is None or final_grade < 0:
            return "em_andamento"
        elif final_grade >= 7.0:
            return "aprovado"
        elif final_grade >= 5.0:
            return "recuperacao"
        else:
            return "reprovado"
    
    def calculate_class_statistics(self, grades: List[float]) -> Dict:
        """
        Calcula estatísticas da turma
        
        Args:
            grades: Lista de notas finais da turma
            
        Returns:
            Dicionário com estatísticas da turma
        """
        try:
            valid_grades = [g for g in grades if g is not None and self.validate_grade_python(g)]
            
            if not valid_grades:
                return {
                    "average": 0.0,
                    "highest": 0.0,
                    "lowest": 0.0,
                    "total_students": 0,
                    "approved_count": 0,
                    "approval_rate": 0.0
                }
            
            approved_count = sum(1 for g in valid_grades if g >= 7.0)
            
            return {
                "average": sum(valid_grades) / len(valid_grades),
                "highest": max(valid_grades),
                "lowest": min(valid_grades),
                "total_students": len(valid_grades),
                "approved_count": approved_count,
                "approval_rate": (approved_count / len(valid_grades)) * 100
            }
            
        except Exception as e:
            print(f"Erro no cálculo de estatísticas: {e}")
            return {}
    
    def batch_calculate_grades(self, students_grades: List[Dict]) -> List[Dict]:
        """
        Calcula notas finais para múltiplos alunos
        
        Args:
            students_grades: Lista de dicionários com notas dos alunos
            
        Returns:
            Lista com notas finais calculadas e status
        """
        results = []
        
        for student_data in students_grades:
            try:
                np1 = student_data.get("np1")
                np2 = student_data.get("np2") 
                ava = student_data.get("ava")
                pim = student_data.get("pim")
                
                final_grade = self.calculate_final_grade(np1, np2, ava, pim)
                status = self.get_student_status(final_grade)
                
                result = {
                    "student_id": student_data.get("student_id"),
                    "np1": np1,
                    "np2": np2,
                    "ava": ava,
                    "pim": pim,
                    "final_grade": final_grade,
                    "status": status
                }
                
                results.append(result)
                
            except Exception as e:
                print(f"Erro ao calcular nota do aluno {student_data.get('student_id')}: {e}")
                results.append({
                    "student_id": student_data.get("student_id"),
                    "error": str(e)
                })
        
        return results

# Instância global do calculador
grade_calculator = GradeCalculator()
