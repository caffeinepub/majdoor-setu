import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Page } from "../App";
import WorkerCard from "../components/WorkerCard";
import { useAllWorkers, useSearchWorkers } from "../hooks/useQueries";

interface WorkersPageProps {
  navigate: (p: Page, id?: bigint) => void;
}

export default function WorkersPage({ navigate }: WorkersPageProps) {
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchSkill, setSearchSkill] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const { data: allWorkers, isLoading: allLoading } = useAllWorkers();
  const { data: searchResults, isLoading: searchLoading } = useSearchWorkers(
    searchSkill,
    searchLocation,
  );

  const isSearching = searchSkill !== "" || searchLocation !== "";
  const workers = isSearching ? (searchResults ?? []) : (allWorkers ?? []);
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
      data-ocid="workers.page"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">मजदूर खोजें</h1>
        <p className="text-muted-foreground mt-1">
          अपनी जरूरत के हिसाब से कुशल मजदूर खोजें
        </p>
      </div>

      {/* Search */}
      <div
        className="bg-card rounded-xl p-4 shadow-xs border border-border mb-8"
        data-ocid="workers.panel"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="कौशल (जैसे: राजमिस्त्री, बिजली)"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
              data-ocid="workers.search_input"
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
              data-ocid="workers.search_input"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-orange hover:bg-orange/90 text-white"
            data-ocid="workers.button"
          >
            <Search className="w-4 h-4 mr-2" />
            खोजें
          </Button>
          {searching && (
            <Button
              variant="outline"
              onClick={clearSearch}
              data-ocid="workers.secondary_button"
            >
              साफ करें
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          data-ocid="workers.loading_state"
        >
          {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
            <Skeleton key={k} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : workers.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {workers.map((worker, i) => (
            <WorkerCard
              key={worker.id.toString()}
              worker={worker}
              navigate={navigate}
              index={i + 1}
            />
          ))}
        </motion.div>
      ) : (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="workers.empty_state"
        >
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-lg font-medium">कोई मजदूर नहीं मिला</p>
          <p className="text-sm mt-1">अलग कौशल या स्थान से खोजें</p>
        </div>
      )}
    </div>
  );
}
