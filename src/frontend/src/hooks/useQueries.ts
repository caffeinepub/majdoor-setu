import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Application, Job, Worker } from "../backend.d";
import { saveNotification } from "../utils/notifications";
import { useActor } from "./useActor";

export function useAllWorkers() {
  const { actor, isFetching } = useActor();
  return useQuery<Worker[]>({
    queryKey: ["workers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWorkers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllJobs() {
  const { actor, isFetching } = useActor();
  return useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllJobs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWorker(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Worker>({
    queryKey: ["worker", id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getWorker(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useJob(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Job>({
    queryKey: ["job", id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getJob(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApplicationsByJob(jobId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Application[]>({
    queryKey: ["applications", jobId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getApplicationsByJob(jobId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchWorkers(skill: string, location: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Worker[]>({
    queryKey: ["searchWorkers", skill, location],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchWorkersBySkillAndLocation(skill, location);
    },
    enabled: !!actor && !isFetching && (skill !== "" || location !== ""),
  });
}

export function useSearchJobs(skill: string, location: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Job[]>({
    queryKey: ["searchJobs", skill, location],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchJobsBySkillAndLocation(skill, location);
    },
    enabled: !!actor && !isFetching && (skill !== "" || location !== ""),
  });
}

export function useCreateWorker() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (worker: Worker) => actor!.createWorker(worker),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workers"] });
      saveNotification("नया मजदूर जोड़ा गया");
    },
  });
}

export function useUpdateWorker() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, worker }: { id: bigint; worker: Worker }) =>
      actor!.updateWorker(id, worker),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workers"] }),
  });
}

export function useDeleteWorker() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteWorker(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workers"] }),
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (job: Job) => actor!.createJob(job),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      saveNotification("नई नौकरी जोड़ी गई");
    },
  });
}

export function useUpdateJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, job }: { id: bigint; job: Job }) =>
      actor!.updateJob(id, job),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useDeleteJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useApplyToJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (application: Application) => actor!.applyToJob(application),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["applications", vars.jobId.toString()],
      }),
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: bigint; status: string }) =>
      actor!.updateApplicationStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      saveNotification("आवेदन की स्थिति अपडेट हुई");
    },
  });
}
