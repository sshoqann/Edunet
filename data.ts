
import { UserRole, User, LessonPlan, Quiz, Subject, Group, Grade, SubjectTeacherLink, SystemLog } from './types';

export const MOCK_SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Физика', icon: '⚛️', color: 'bg-indigo-500' },
  { id: 'sub2', name: 'Математика', icon: '📐', color: 'bg-blue-500' },
  { id: 'sub3', name: 'История', icon: '📜', color: 'bg-orange-500' },
  { id: 'sub4', name: 'Биология', icon: '🌿', color: 'bg-green-500' },
];

export const MOCK_USERS: User[] = [
  { 
    id: 'admin1', 
    name: 'Администратор системы', 
    role: UserRole.ADMIN, 
    avatar: 'https://picsum.photos/seed/admin/100',
    contactInfo: 'admin',
    password: 'admin',
    isApproved: true,
    isAdmin: true
  },
  { 
    id: 't1', 
    name: 'Иван Петрович', 
    role: UserRole.TEACHER, 
    avatar: 'https://picsum.photos/seed/t1/100',
    contactInfo: 'teacher',
    password: 'admin',
    isApproved: true,
    isAdmin: false
  },
  { 
    id: 's1', 
    name: 'Алексей Иванов', 
    role: UserRole.STUDENT, 
    avatar: 'https://picsum.photos/seed/s1/100', 
    contactInfo: 'student',
    password: 'admin',
    isApproved: true,
    isAdmin: false,
    age: 14, 
    grade: '8-А' 
  },
  {
    id: 'p1',
    name: 'Мария Иванова',
    role: UserRole.PARENT,
    avatar: 'https://picsum.photos/seed/parent/100',
    contactInfo: 'parent',
    password: 'admin',
    isApproved: true,
    isAdmin: false,
    childrenIds: ['s1']
  }
];

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: '8-А Физико-математический',
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
    title: 'Законы Ньютона: Инерция',
    date: '2024-05-20',
    description: 'Введение в динамику.',
    homeworkCheck: 'Задача на расчет силы трения.',
    newHomework: 'Нарисовать силы.',
    attendance: ['s1']
  }
];

export const MOCK_LINKS: SubjectTeacherLink[] = [
  { id: 'link1', subjectId: 'sub1', teacherId: 't1', groupId: 'g1' }
];

export const MOCK_LOGS: SystemLog[] = [
  {
    id: 'log1',
    timestamp: new Date().toISOString(),
    userId: 'admin1',
    userName: 'Администратор системы',
    action: 'Вход в систему',
    details: 'Администратор вошел в панель управления'
  }
];

export const MOCK_GRADES: Grade[] = [
  { studentId: 's1', lessonId: 'l1', score: 95, date: '2024-05-20', feedback: 'Прекрасно' }
];

export const MOCK_QUIZ: Quiz = {
  id: 'q1',
  title: 'Тест по динамике',
  lessonId: 'l1',
  questions: []
};
