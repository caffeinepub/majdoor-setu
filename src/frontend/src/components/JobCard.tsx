import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, IndianRupee, MapPin } from "lucide-react";
import type { Page } from "../App";
import type { Job } from "../backend.d";

interface JobCardProps {
  job: Job;
  navigate: (p: Page, id?: bigint) => void;
  index: number;
  compact?: boolean;
}

export default function JobCard({
  job,
  navigate,
  index,
  compact = false,
}: JobCardProps) {
  if (compact) {
    return (
      <div
        className="bg-card rounded-lg px-5 py-4 shadow-xs border border-border flex items-center justify-between gap-4 hover:shadow-card transition-all"
        data-ocid={`jobs.item.${index}`}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-sm">{job.title}</h3>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {job.location}
            </div>
            <div className="flex items-center gap-1 text-xs text-orange font-semibold">
              <IndianRupee className="w-3 h-3" />
              {Number(job.payPerDay)}/दिन
            </div>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("job-detail", job.id)}
          className="bg-orange hover:bg-orange/90 text-white text-xs px-4 shrink-0"
          data-ocid={`jobs.item.${index}.button`}
        >
          आवेदन करें
        </Button>
      </div>
    );
  }

  return (
    <div
      className="bg-card rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 border border-border"
      data-ocid={`jobs.item.${index}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-foreground text-base">{job.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{job.postedBy}</p>
        </div>
        <Badge
          className={`shrink-0 ${
            job.active
              ? "bg-green-100 text-green-700"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {job.active ? "सक्रिय" : "बंद"}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.skillsNeeded.slice(0, 3).map((skill) => (
          <Badge key={skill} variant="secondary" className="text-xs">
            {skill}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {job.location}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-orange">
            <IndianRupee className="w-3 h-3" />
            {Number(job.payPerDay)}/दिन
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {job.duration}
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("job-detail", job.id)}
          className="bg-orange hover:bg-orange/90 text-white text-xs px-4 shrink-0"
          data-ocid={`jobs.item.${index}.button`}
        >
          आवेदन करें
        </Button>
      </div>
    </div>
  );
}
