
import { UserRole, User, LessonPlan, Subject, Group, Grade } from './types';

export const MOCK_SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Физика', icon: '⚛️', color: 'bg-indigo-500' },
  { id: 'sub2', name: 'Математика', icon: '📐', color: 'bg-blue-500' },
  { id: 'sub3', name: 'История', icon: '📜', color: 'bg-orange-500' },
  { id: 'sub4', name: 'Биология', icon: '🌿', color: 'bg-green-500' },
];

export const MOCK_USERS: User[] = [
  { 
    id: 'admin_root', 
    name: 'Администратор Системы', 
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
    grade: '8-А' 
  },
  { 
    id: 'p1', 
    name: 'Дмитрий Иванов', 
    role: UserRole.PARENT, 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=parent',
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
    name: '8-А Физика',
    subjectId: 'sub1',
    grade: '8-А',
    teacherId: 't1',
    studentIds: ['s1']
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
    description: 'Изучаем основные законы движения.',
    newHomework: 'Решить задачи на стр. 45',
    isDrawingEnabled: true,
    questions: [
      { id: 'q1', text: 'Первый закон Ньютона?', options: ['Инерция', 'Сила', 'Масса', 'Ускорение'], correctIndex: 0 }
    ],
    attendance: [],
    chat: []
  }
];
