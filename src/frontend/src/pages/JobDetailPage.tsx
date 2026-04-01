import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, Clock, IndianRupee, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { useApplyToJob, useJob } from "../hooks/useQueries";

interface JobDetailPageProps {
  jobId: bigint;
  navigate: (p: Page, id?: bigint) => void;
}

export default function JobDetailPage({ jobId, navigate }: JobDetailPageProps) {
  const { data: job, isLoading } = useJob(jobId);
  const applyMutation = useApplyToJob();
  const [applyOpen, setApplyOpen] = useState(false);
  const [applicantName, setApplicantName] = useState("");

  if (isLoading) {
    return (
      <div
        className="max-w-3xl mx-auto px-4 py-10 space-y-4"
        data-ocid="job_detail.loading_state"
      >
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!job) return null;

  const handleApply = async () => {
    if (!applicantName.trim()) return;
    try {
      await applyMutation.mutateAsync({
        id: BigInt(Date.now()),
        jobId: job.id,
        workerId: BigInt(0),
        workerName: applicantName,
        status: "pending",
        appliedAt: BigInt(Date.now()),
      });
      toast.success("आवेदन सफलतापूर्वक भेजा गया!");
      setApplyOpen(false);
      setApplicantName("");
    } catch {
      toast.error("आवेदन भेजने में त्रुटि हुई");
    }
  };

  return (
    <div
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      data-ocid="job_detail.page"
    >
      <button
        type="button"
        onClick={() => navigate("jobs")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        data-ocid="job_detail.button"
      >
        <ArrowLeft className="w-4 h-4" /> वापस जाएं
      </button>

      <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-navy px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{job.title}</h1>
              <div className="flex items-center gap-1 mt-2">
                <Building2 className="w-4 h-4 text-white/70" />
                <span className="text-white/70 text-sm">{job.postedBy}</span>
              </div>
            </div>
            <Badge
              className={`${
                job.active
                  ? "bg-green-500/20 text-green-200 border-green-500/30"
                  : "bg-white/10 text-white/60"
              }`}
            >
              {job.active ? "सक्रिय" : "बंद"}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-5 mt-5">
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <MapPin className="w-4 h-4" />
              {job.location}
            </div>
            <div className="flex items-center gap-1.5 text-orange text-sm font-semibold">
              <IndianRupee className="w-4 h-4" />
              {Number(job.payPerDay)} प्रतिदिन
            </div>
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <Clock className="w-4 h-4" />
              {job.duration}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="font-bold text-foreground mb-2">नौकरी का विवरण</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {job.description}
            </p>
          </div>

          <div>
            <h2 className="font-bold text-foreground mb-3">आवश्यक कौशल</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsNeeded.map((skill) => (
                <Badge
                  key={skill}
                  className="bg-secondary/10 text-secondary border border-secondary/20"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {job.active && (
            <Button
              className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-6 text-base"
              onClick={() => setApplyOpen(true)}
              data-ocid="job_detail.primary_button"
            >
              इस नौकरी के लिए आवेदन करें
            </Button>
          )}
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent data-ocid="apply.dialog">
          <DialogHeader>
            <DialogTitle>नौकरी के लिए आवेदन करें</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label htmlFor="job-applicant-name" className="text-sm font-medium">
              आपका नाम
            </label>
            <input
              id="job-applicant-name"
              type="text"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="अपना पूरा नाम लिखें"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              data-ocid="apply.input"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApplyOpen(false)}
              data-ocid="apply.cancel_button"
            >
              रद्द करें
            </Button>
            <Button
              onClick={handleApply}
              disabled={!applicantName.trim() || applyMutation.isPending}
              className="bg-orange hover:bg-orange/90 text-white"
              data-ocid="apply.submit_button"
            >
              {applyMutation.isPending ? "भेज रहे हैं..." : "आवेदन करें"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
