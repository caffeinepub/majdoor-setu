import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Page } from "../App";
import JobCard from "../components/JobCard";
import { useAllJobs, useSearchJobs } from "../hooks/useQueries";

interface JobsPageProps {
  navigate: (p: Page, id?: bigint) => void;
}

export default function JobsPage({ navigate }: JobsPageProps) {
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchSkill, setSearchSkill] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const { data: allJobs, isLoading: allLoading } = useAllJobs();
  const { data: searchResults, isLoading: searchLoading } = useSearchJobs(
    searchSkill,
    searchLocation,
  );

  const isSearching = searchSkill !== "" || searchLocation !== "";
  const jobs = isSearching ? (searchResults ?? []) : (allJobs ?? []);
  const isLoading = isSearching ? searchLoading : allLoading;

  const handleSearch = () => {
    setSearchSkill(skill);
    setSearchLocation(location);
    setSearching(true);
  };

  const clearSearch = () => {
    setSkill("");
    setLocation("");
    setSearchSkill("");
    setSearchLocation("");
    setSearching(false);
  };

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      data-ocid="jobs.page"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">नौकरी खोजें</h1>
        <p className="text-muted-foreground mt-1">
          आपके कौशल के अनुसार उपलब्ध नौकरियां
        </p>
      </div>

      {/* Search */}
      <div
        className="bg-card rounded-xl p-4 shadow-xs border border-border mb-8"
        data-ocid="jobs.panel"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="काम का प्रकार (जैसे: पेंटिंग)"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
              data-ocid="jobs.search_input"
            />
          </div>
          <div className="relative flex-1">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="स्थान (जैसे: दिल्ली, मुंबई)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
              data-ocid="jobs.search_input"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-orange hover:bg-orange/90 text-white"
            data-ocid="jobs.button"
          >
            <Search className="w-4 h-4 mr-2" />
            खोजें
          </Button>
          {searching && (
            <Button
              variant="outline"
              onClick={clearSearch}
              data-ocid="jobs.secondary_button"
            >
              साफ करें
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-4" data-ocid="jobs.loading_state">
          {["sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
            <Skeleton key={k} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {jobs.map((job, i) => (
            <JobCard
              key={job.id.toString()}
              job={job}
              navigate={navigate}
              index={i + 1}
            />
          ))}
        </motion.div>
      ) : (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="jobs.empty_state"
        >
          <div className="text-5xl mb-3">💼</div>
          <p className="text-lg font-medium">कोई नौकरी नहीं मिली</p>
          <p className="text-sm mt-1">अलग कौशल या स्थान से खोजें</p>
        </div>
      )}
    </div>
  );
}
