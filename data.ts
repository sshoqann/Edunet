
import { UserRole, User, LessonPlan, Quiz, Subject, Group, Grade } from './types';

export const MOCK_SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Физика', icon: '⚛️', color: 'bg-indigo-500' },
  { id: 'sub2', name: 'Математика', icon: '📐', color: 'bg-blue-500' },
  { id: 'sub3', name: 'История', icon: '📜', color: 'bg-orange-500' },
  { id: 'sub4', name: 'Биология', icon: '🌿', color: 'bg-green-500' },
];

export const MOCK_USERS: User[] = [
  { id: 't1', name: 'Иван Петрович', role: UserRole.TEACHER, avatar: 'https://picsum.photos/seed/t1/100' },
  { id: 's1', name: 'Алексей Иванов', role: UserRole.STUDENT, avatar: 'https://picsum.photos/seed/s1/100', age: 14, grade: '8-А' },
  { id: 's2', name: 'Мария Смирнова', role: UserRole.STUDENT, avatar: 'https://picsum.photos/seed/s2/100', age: 14, grade: '8-А' },
  { id: 's3', name: 'Кирилл Петров', role: UserRole.STUDENT, avatar: 'https://picsum.photos/seed/s3/100', age: 15, grade: '9-Б' },
  { id: 'p1', name: 'Дмитрий Иванов', role: UserRole.PARENT, avatar: 'https://picsum.photos/seed/p1/100', childrenIds: ['s1'] },
];

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Физики-экспериментаторы',
    grade: '8-А',
    ageRange: '13-14 лет',
    studentIds: ['s1', 's2'],
    performanceLevel: 'Высокая',
    averageScore: 92
  },
  {
    id: 'g2',
    name: 'Подготовка к ОГЭ',
    grade: '9-Б',
    ageRange: '15 лет',
    studentIds: ['s3'],
    performanceLevel: 'Средняя',
    averageScore: 74
  }
];

export const MOCK_LESSONS: LessonPlan[] = [
  {
    id: 'l1',
    subjectId: 'sub1',
    groupId: 'g1',
    title: 'Законы Ньютона: Инерция',
    date: '2024-05-20',
    description: 'Введение в динамику.',
    homeworkCheck: 'Задача на расчет силы трения.',
    newHomework: 'Нарисовать силы, действующие на брусок на наклонной плоскости.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    meetingLink: 'https://zoom.us/test',
    attendance: ['s1', 's2']
  },
  {
    id: 'l2',
    subjectId: 'sub1',
    groupId: 'g1',
    title: 'Закон всемирного тяготения',
    date: '2024-05-22',
    description: 'Изучение гравитационного взаимодействия.',
    homeworkCheck: 'Проверка рисунков сил.',
    newHomework: 'Решить 3 задачи из учебника.',
    attendance: ['s1']
  }
];

export const MOCK_GRADES: Grade[] = [
  { studentId: 's1', lessonId: 'l1', score: 95, date: '2024-05-20', feedback: 'Отлично!' },
  { studentId: 's1', lessonId: 'l2', score: 88, date: '2024-05-22', feedback: 'Хорошо, но есть ошибки в расчетах.' },
  { studentId: 's2', lessonId: 'l1', score: 90, date: '2024-05-20' },
];

// Added MOCK_QUIZ fix for StudentDashboard reference
export const MOCK_QUIZ: Quiz = {
  id: 'q1',
  title: 'Тест по динамике: Законы Ньютона',
  lessonId: 'l1',
  questions: [
    {
      id: 'ques1',
      text: 'Второй закон Ньютона формулируется как:',
      options: ['F = m * a', 'E = m * c^2', 'F = G * (m1*m2)/r^2', 'P = U * I'],
      correctIndex: 0
    },
    {
      id: 'ques2',
      text: 'Что происходит с телом, если сумма всех сил, действующих на него, равна нулю?',
      options: [
        'Оно обязательно покоится',
        'Оно движется равноускоренно',
        'Оно сохраняет состояние покоя или равномерного прямолинейного движения',
        'Оно падает вниз'
      ],
      correctIndex: 2
    }
  ]
};
