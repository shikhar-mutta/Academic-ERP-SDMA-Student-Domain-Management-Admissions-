export interface Domain {
  domainId: number
  program: string
  batch?: string
  capacity: number
  examName?: string
  cutoffMarks?: number
  studentCount?: number
}

export interface DomainRequest {
  program: string
  batch: string
  capacity: number
  examName: string
  cutoffMarks: number
}

export interface DomainUpdateImpact {
  domainId: number
  affectedStudentsCount: number
  message: string
}

export interface Student {
  studentId: number
  rollNumber: string
  firstName: string
  lastName: string
  email: string
  domainId: number
  domainProgram: string
  joinYear: number
  examMarks: number
}

export interface StudentAdmissionForm {
  firstName: string
  lastName: string
  email: string
  domainId: string
  joinYear: string
  examMarks: number
}

export interface StudentUpdateRequest {
  studentId: number
  firstName: string
  lastName: string
  email: string
  domainId: number
  joinYear: number
  examMarks: number
}

export interface StudentResponse {
  studentId: number
  rollNumber: string
  firstName: string
  lastName: string
  email: string
  domainId: number
  domainProgram: string
  joinYear: number
  examMarks: number
}

export interface UserProfile {
  email: string
  name: string
  picture?: string
  token: string
}

export interface ApiError {
  message?: string
  status?: number
}

