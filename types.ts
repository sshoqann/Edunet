
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  ADMIN = 'ADMIN'
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
  role: UserRole | null;
  avatar: string;
  contactInfo: string; // Used as login
  password?: string;
  isApproved: boolean;
  isAdmin: boolean;
  age?: number;
  grade?: string; 
  childrenIds?: string[]; 
}

export interface Group {
  id: string;
  name: string;
  subjectId: string; // Relationship to Subject
  teacherId?: string; // Assigned Teacher
  studentIds: string[]; // List of Students
  grade: string;
  // Added optional fields to resolve data.ts and TeacherDashboard.tsx errors
  ageRange?: string;
  performanceLevel?: string;
  averageScore?: number;
}

export interface LessonPlan {
  id: string;
  subjectId: string;
  groupId: string;
  teacherId: string;
  title: string;
  date: string;
  description: string;
  homeworkCheck: string;
  newHomework: string;
  videoUrl?: string;
  meetingLink?: string;
  attendance: string[]; 
}

export interface Grade {
  studentId: string;
  lessonId: string;
  score: number; 
  feedback?: string;
  date: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface Quiz {
  id: string;
  title: string;
  lessonId: string;
  questions: QuizQuestion[];
}
