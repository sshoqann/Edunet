
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  ADMIN = 'ADMIN'
}

export enum HomeworkStatus {
  COMPLETE = 'COMPLETE',
  PARTIAL = 'PARTIAL',
  NONE = 'NONE'
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
  contactInfo: string; 
  password?: string;
  isApproved: boolean;
  isAdmin: boolean;
  grade?: string; 
  childrenIds?: string[]; 
}

export interface Group {
  id: string;
  name: string;
  subjectId: string;
  teacherId?: string;
  studentIds: string[];
  grade: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
}

export interface LessonPlan {
  id: string;
  subjectId: string;
  groupId: string;
  teacherId: string;
  title: string;
  date: string;
  description: string;
  newHomework: string;
  videoUrl?: string;
  meetingLink?: string;
  zoomLink?: string;
  isDrawingEnabled: boolean;
  drawingBaseImage?: string;
  quizFile?: string; // URL for PDF/DOC
  questions: QuizQuestion[];
  attendance: string[]; 
  isStarted?: boolean;
  chat?: ChatMessage[];
}

export interface Submission {
  id: string;
  studentId: string;
  lessonId: string;
  homeworkImageUrl?: string;
  testScore?: number;
  testFinished: boolean;
  drawingData?: string;
}

export interface Grade {
  studentId: string;
  lessonId: string;
  score: number; 
  date: string;
  type: 'formative' | 'test' | 'final';
}
