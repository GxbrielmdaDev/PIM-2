#include <stdio.h>
#include <stdlib.h>
#include <math.h>

// Estrutura para representar uma nota
typedef struct {
    double value;
    int is_valid;
} Grade;

// Função para calcular a média final
// Fórmula: (NP1 + NP2 + AVA + PIM) / 2
double calculate_final_grade(Grade np1, Grade np2, Grade ava, Grade pim) {
    double sum = 0.0;
    int valid_count = 0;
    
    // Verificar e somar notas válidas
    if (np1.is_valid && np1.value >= 0.0 && np1.value <= 10.0) {
        sum += np1.value;
        valid_count++;
    }
    
    if (np2.is_valid && np2.value >= 0.0 && np2.value <= 10.0) {
        sum += np2.value;
        valid_count++;
    }
    
    if (ava.is_valid && ava.value >= 0.0 && ava.value <= 10.0) {
        sum += ava.value;
        valid_count++;
    }
    
    if (pim.is_valid && pim.value >= 0.0 && pim.value <= 10.0) {
        sum += pim.value;
        valid_count++;
    }
    
    // Retornar -1 se não há notas válidas suficientes
    if (valid_count < 2) {
        return -1.0;
    }
    
    // Calcular média usando a fórmula especificada
    // Nota: A fórmula divide por 2, não pelo número de notas
    return sum / 2.0;
}

// Função para validar uma nota individual
int validate_grade(double grade) {
    return (grade >= 0.0 && grade <= 10.0 && !isnan(grade) && !isinf(grade));
}

// Função para determinar status do aluno
const char* get_student_status(double final_grade) {
    if (final_grade < 0) {
        return "em_andamento";
    } else if (final_grade >= 7.0) {
        return "aprovado";
    } else if (final_grade >= 5.0) {
        return "recuperacao";
    } else {
        return "reprovado";
    }
}

// Função para calcular estatísticas da turma
typedef struct {
    double average;
    double highest;
    double lowest;
    int total_students;
    int approved_count;
} ClassStats;

ClassStats calculate_class_statistics(double grades[], int count) {
    ClassStats stats = {0.0, -1.0, 11.0, 0, 0};
    
    if (count <= 0) {
        return stats;
    }
    
    double sum = 0.0;
    int valid_grades = 0;
    
    for (int i = 0; i < count; i++) {
        if (grades[i] >= 0.0 && grades[i] <= 10.0) {
            sum += grades[i];
            valid_grades++;
            
            if (grades[i] > stats.highest || stats.highest < 0) {
                stats.highest = grades[i];
            }
            
            if (grades[i] < stats.lowest || stats.lowest > 10) {
                stats.lowest = grades[i];
            }
            
            if (grades[i] >= 7.0) {
                stats.approved_count++;
            }
        }
    }
    
    stats.total_students = valid_grades;
    if (valid_grades > 0) {
        stats.average = sum / valid_grades;
    }
    
    return stats;
}

// Função principal para teste (opcional)
#ifdef STANDALONE_TEST
int main() {
    // Teste básico das funções
    Grade np1 = {8.5, 1};
    Grade np2 = {7.0, 1};
    Grade ava = {9.0, 1};
    Grade pim = {8.0, 1};
    
    double final_grade = calculate_final_grade(np1, np2, ava, pim);
    printf("Nota final: %.2f\n", final_grade);
    printf("Status: %s\n", get_student_status(final_grade));
    
    // Teste com notas inválidas
    Grade invalid_np1 = {-1.0, 0};
    Grade invalid_np2 = {11.0, 1};
    
    double invalid_final = calculate_final_grade(invalid_np1, invalid_np2, ava, pim);
    printf("Nota final com inválidas: %.2f\n", invalid_final);
    
    return 0;
}
#endif
