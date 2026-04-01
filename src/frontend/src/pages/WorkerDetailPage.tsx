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
import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { useAllJobs, useApplyToJob, useWorker } from "../hooks/useQueries";

interface WorkerDetailPageProps {
  workerId: bigint;
  navigate: (p: Page, id?: bigint) => void;
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
];

export default function WorkerDetailPage({
  workerId,
  navigate,
}: WorkerDetailPageProps) {
  const { data: worker, isLoading } = useWorker(workerId);
  const { data: jobs } = useAllJobs();
  const applyMutation = useApplyToJob();
  const [contactOpen, setContactOpen] = useState(false);
  const [applyJobId, setApplyJobId] = useState<bigint | null>(null);
  const [applicantName, setApplicantName] = useState("");

  if (isLoading) {
    return (
      <div
        className="max-w-3xl mx-auto px-4 py-10 space-y-4"
        data-ocid="worker_detail.loading_state"
      >
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!worker) return null;

  const initials = worker.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarColor = AVATAR_COLORS[Number(worker.id) % AVATAR_COLORS.length];

  const handleApply = async () => {
    if (!applyJobId || !applicantName.trim()) return;
    try {
      await applyMutation.mutateAsync({
        id: BigInt(Date.now()),
        jobId: applyJobId,
        workerId: worker.id,
        workerName: applicantName,
        status: "pending",
        appliedAt: BigInt(Date.now()),
      });
      toast.success("आवेदन सफलतापूर्वक भेजा गया!");
      setApplyJobId(null);
      setApplicantName("");
    } catch {
      toast.error("आवेदन भेजने में त्रुटि हुई");
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      data-ocid="worker_detail.page"
    >
      <button
        type="button"
        onClick={() => navigate("workers")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        data-ocid="worker_detail.button"
      >
        <ArrowLeft className="w-4 h-4" /> वापस जाएं
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl p-6 shadow-card border border-border text-center">
            {worker.photoUrl ? (
              <img
                src={worker.photoUrl}
                alt={worker.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
              />
            ) : (
              <div
                className={`w-24 h-24 rounded-full ${avatarColor} flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4`}
              >
                {initials}
              </div>
            )}
            <h1 className="text-xl font-bold text-foreground">{worker.name}</h1>
            <div className="flex items-center justify-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {worker.location}
              </span>
            </div>

            <div className="flex justify-center gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-4 h-4 ${
                    n <= Math.round(worker.rating)
                      ? "fill-gold text-gold"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">
                ({Number(worker.reviewCount)})
              </span>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange">
                ₹{Number(worker.dailyRate)}
              </div>
              <div className="text-xs text-muted-foreground">प्रतिदिन</div>
            </div>

            {worker.available ? (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  अभी उपलब्ध
                </span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground mt-3">
                अभी उपलब्ध नहीं
              </div>
            )}

            <Button
              className="w-full mt-5 bg-orange hover:bg-orange/90 text-white"
              onClick={() => setContactOpen(true)}
              data-ocid="worker_detail.primary_button"
            >
              <Phone className="w-4 h-4 mr-2" />
              संपर्क करें
            </Button>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Bio */}
          <div className="bg-card rounded-xl p-5 shadow-xs border border-border">
            <h2 className="font-bold text-foreground mb-2">परिचय</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {worker.bio}
            </p>
          </div>

          {/* Skills */}
          <div className="bg-card rounded-xl p-5 shadow-xs border border-border">
            <h2 className="font-bold text-foreground mb-3">कौशल</h2>
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((skill) => (
                <Badge
                  key={skill}
                  className="bg-secondary/10 text-secondary border border-secondary/20"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-4 shadow-xs border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-orange" />
                <span className="text-xs text-muted-foreground">अनुभव</span>
              </div>
              <div className="font-bold text-foreground">
                {Number(worker.experience)} वर्ष
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-xs border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-orange" />
                <span className="text-xs text-muted-foreground">फोन</span>
              </div>
              <div className="font-bold text-foreground text-sm">
                {worker.phone}
              </div>
            </div>
          </div>

          {/* Apply to Jobs */}
          {jobs && jobs.filter((j) => j.active).length > 0 && (
            <div className="bg-card rounded-xl p-5 shadow-xs border border-border">
              <h2 className="font-bold text-foreground mb-3">
                इस मजदूर के लिए नौकरी चुनें
              </h2>
              <div className="space-y-2">
                {jobs
                  .filter((j) => j.active)
                  .slice(0, 4)
                  .map((job) => (
                    <div
                      key={job.id.toString()}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <div className="text-sm font-medium">{job.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {job.location}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setApplyJobId(job.id)}
                        className="bg-orange hover:bg-orange/90 text-white text-xs"
                        data-ocid="worker_detail.secondary_button"
                      >
                        आवेदन करें
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent data-ocid="contact.dialog">
          <DialogHeader>
            <DialogTitle>संपर्क जानकारी</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange" />
              <span className="font-medium">{worker.phone}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              ऊपर दिए गए नंबर पर सीधे संपर्क करें।
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setContactOpen(false)}
              data-ocid="contact.close_button"
            >
              बंद करें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Dialog */}
      <Dialog
        open={applyJobId !== null}
        onOpenChange={(o) => !o && setApplyJobId(null)}
      >
        <DialogContent data-ocid="apply.dialog">
          <DialogHeader>
            <DialogTitle>नौकरी के लिए आवेदन करें</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label htmlFor="applicant-name" className="text-sm font-medium">
              आपका नाम
            </label>
            <input
              id="applicant-name"
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
              onClick={() => setApplyJobId(null)}
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
