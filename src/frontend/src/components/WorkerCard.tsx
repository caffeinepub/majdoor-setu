import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Star } from "lucide-react";
import type { Page } from "../App";
import type { Worker } from "../backend.d";

interface WorkerCardProps {
  worker: Worker;
  navigate: (p: Page, id?: bigint) => void;
  index: number;
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

export default function WorkerCard({
  worker,
  navigate,
  index,
}: WorkerCardProps) {
  const initials = worker.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarColor = AVATAR_COLORS[Number(worker.id) % AVATAR_COLORS.length];

  return (
    <div
      className="bg-card rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 border border-border group"
      data-ocid={`workers.item.${index}`}
    >
      <div className="flex items-start gap-4 mb-4">
        {worker.photoUrl ? (
          <img
            src={worker.photoUrl}
            alt={worker.name}
            className="w-14 h-14 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className={`w-14 h-14 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}
          >
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-base leading-tight">
            {worker.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {worker.location}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`w-3.5 h-3.5 ${
                  n <= Math.round(worker.rating)
                    ? "fill-gold text-gold"
                    : "text-muted-foreground"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              ({Number(worker.reviewCount)})
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-muted-foreground">प्रतिदिन</div>
          <div className="font-bold text-orange text-sm">
            ₹{Number(worker.dailyRate)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {worker.skills.slice(0, 3).map((skill) => (
          <Badge
            key={skill}
            variant="secondary"
            className="text-xs bg-muted text-foreground"
          >
            {skill}
          </Badge>
        ))}
        {worker.skills.length > 3 && (
          <Badge
            variant="secondary"
            className="text-xs bg-muted text-muted-foreground"
          >
            +{worker.skills.length - 3}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {Number(worker.experience)} वर्ष अनुभव
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("worker-detail", worker.id)}
          className="bg-secondary hover:bg-secondary/90 text-white text-xs px-3"
          data-ocid={`workers.item.${index}.button`}
        >
          प्रोफाइल देखें
        </Button>
      </div>

      {worker.available && (
        <div className="mt-3 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-green-600 font-medium">उपलब्ध है</span>
        </div>
      )}
    </div>
  );
}
