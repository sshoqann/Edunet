
import { UserRole, User, LessonPlan, Quiz, Subject, Group, Grade } from './types';

export const MOCK_SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Физика', icon: '⚛️', color: 'bg-indigo-500' },
  { id: 'sub2', name: 'Математика', icon: '📐', color: 'bg-blue-500' },
  { id: 'sub3', name: 'История', icon: '📜', color: 'bg-orange-500' },
  { id: 'sub4', name: 'Биология', icon: '🌿', color: 'bg-green-500' },
];

export const MOCK_USERS: User[] = [
  { 
    id: 'admin_root', 
    name: 'Главный Администратор', 
    role: UserRole.ADMIN, 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    contactInfo: 'admin',
    password: 'admin',
    isApproved: true,
    isAdmin: true
  },
  { 
    id: 't1', 
    name: 'Иван Петрович', 
    role: UserRole.TEACHER, 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
    contactInfo: 'teacher1',
    password: '123',
    isApproved: true,
    isAdmin: false
  },
  { 
    id: 's1', 
    name: 'Алексей Иванов', 
    role: UserRole.STUDENT, 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    contactInfo: 'student1',
    password: '123',
    isApproved: true,
    isAdmin: false,
    age: 14, 
    grade: '8-А' 
  },
  { 
    id: 'p1', 
    name: 'Дмитрий Иванов', 
    role: UserRole.PARENT, 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=p1',
    contactInfo: 'parent1',
    password: '123',
    isApproved: true,
    isAdmin: false,
    childrenIds: ['s1'] 
  },
];

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: '8-А Основная',
    subjectId: 'sub1', // Added missing mandatory subjectId
    grade: '8-А',
    ageRange: '13-14 лет',
    studentIds: ['s1'],
    performanceLevel: 'Высокая',
    averageScore: 92
  }
];

export const MOCK_LESSONS: LessonPlan[] = [
  {
    id: 'l1',
    subjectId: 'sub1',
    groupId: 'g1',
    teacherId: 't1',
    title: 'Законы Ньютона',
    date: '2024-05-20',
    description: 'Введение в динамику.',
    homeworkCheck: 'Задача на расчет силы трения.',
    newHomework: 'Нарисовать силы.',
    attendance: ['s1']
  }
];

export const MOCK_GRADES: Grade[] = [
  { studentId: 's1', lessonId: 'l1', score: 95, date: '2024-05-20', feedback: 'Отлично!' }
];

export const MOCK_QUIZ: Quiz = {
  id: 'q1',
  title: 'Тест по динамике',
  lessonId: 'l1',
  questions: [
    {
      id: 'ques1',
      text: 'Второй закон Ньютона?',
      options: ['F = ma', 'E = mc2', 'F = Gmm/r2', 'P = UI'],
      correctIndex: 0
    }
  ]
};