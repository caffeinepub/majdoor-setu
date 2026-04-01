import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Job {
    id: JobId;
    payPerDay: bigint;
    title: string;
    duration: string;
    active: boolean;
    postedBy: string;
    createdAt: bigint;
    description: string;
    skillsNeeded: Array<string>;
    location: string;
}
export interface Application {
    id: ApplicationId;
    status: string;
    appliedAt: bigint;
    workerId: WorkerId;
    jobId: JobId;
    workerName: string;
}
export type JobId = bigint;
export type WorkerId = bigint;
export type ApplicationId = bigint;
export interface Worker {
    id: WorkerId;
    bio: string;
    dailyRate: bigint;
    name: string;
    createdAt: bigint;
    photoUrl: string;
    available: boolean;
    experience: bigint;
    rating: number;
    phone: string;
    reviewCount: bigint;
    skills: Array<string>;
    location: string;
}
export interface UserProfile {
    userType: string;
    name: string;
    email: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    applyToJob(application: Application): Promise<ApplicationId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createJob(job: Job): Promise<JobId>;
    createWorker(worker: Worker): Promise<WorkerId>;
    deleteJob(id: JobId): Promise<void>;
    deleteWorker(id: WorkerId): Promise<void>;
    getAllJobs(): Promise<Array<Job>>;
    getAllWorkers(): Promise<Array<Worker>>;
    getApplicationsByJob(jobId: JobId): Promise<Array<Application>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getJob(id: JobId): Promise<Job>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorker(id: WorkerId): Promise<Worker>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchJobsBySkillAndLocation(skill: string, location: string): Promise<Array<Job>>;
    searchWorkersBySkillAndLocation(skill: string, location: string): Promise<Array<Worker>>;
    seedData(): Promise<void>;
    updateApplicationStatus(id: ApplicationId, status: string): Promise<void>;
    updateJob(id: JobId, job: Job): Promise<void>;
    updateWorker(id: WorkerId, worker: Worker): Promise<void>;
}
