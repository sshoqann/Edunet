
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT'
}

export enum HomeworkStatus {
  NOT_DONE = 'NOT_DONE',
  PARTIAL = 'PARTIAL',
  COMPLETE = 'COMPLETE'
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  age?: number;
  grade?: string; // e.g., "8-A"
  childrenIds?: string[]; 
}

export interface Group {
  id: string;
  name: string;
  grade: string;
  ageRange: string;
  studentIds: string[];
  performanceLevel: 'Высокая' | 'Средняя' | 'Требует внимания';
  averageScore: number;
}

export interface LessonPlan {
  id: string;
  subjectId: string;
  groupId: string; // Linked to a specific group
  title: string;
  date: string;
  description: string;
  homeworkCheck: string;
  newHomework: string;
  videoUrl?: string;
  meetingLink?: string;
  attendance: string[]; 
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  lessonId: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface Grade {
  studentId: string;
  lessonId: string;
  score: number; 
  feedback?: string;
  date: string;
}
