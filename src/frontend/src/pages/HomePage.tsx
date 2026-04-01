import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Hammer,
  HardHat,
  Paintbrush,
  Search,
  Settings,
  Wrench,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Page } from "../App";
import JobCard from "../components/JobCard";
import WorkerCard from "../components/WorkerCard";
import { useAllJobs, useAllWorkers } from "../hooks/useQueries";

interface HomePageProps {
  navigate: (p: Page, id?: bigint) => void;
}

const CATEGORIES = [
  { icon: HardHat, label: "निर्माण", sub: "Construction" },
  { icon: Wrench, label: "प्लंबिंग", sub: "Plumbing" },
  { icon: Zap, label: "इलेक्ट्रिकल", sub: "Electrical" },
  { icon: Hammer, label: "कारपेंट्री", sub: "Carpentry" },
  { icon: Paintbrush, label: "पेंटिंग", sub: "Painting" },
  { icon: Settings, label: "वेल्डिंग", sub: "Welding" },
];

export default function HomePage({ navigate }: HomePageProps) {
  const { data: workers, isLoading: workersLoading } = useAllWorkers();
  const { data: jobs, isLoading: jobsLoading } = useAllJobs();
  const [searchSkill, setSearchSkill] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const featuredWorkers = workers?.filter((w) => w.available).slice(0, 6) ?? [];
  const latestJobs = jobs?.filter((j) => j.active).slice(0, 5) ?? [];

  const handleSearch = () => {
    navigate("workers");
  };

  return (
    <div>
      {/* Hero */}
      <section
        className="relative bg-navy min-h-[520px] flex items-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(18,59,102,0.92) 50%, rgba(18,59,102,0.6) 100%), url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        data-ocid="hero.section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h1
              className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-3"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
            >
              कुशल मजदूर खोजें,
              <br />
              <span className="text-orange">सही नौकरी पाएं</span>
            </h1>
            <p className="text-white/80 text-lg mb-8">
              भारत का सबसे विश्वसनीय दैनिक मजदूर मंच
            </p>

            {/* Search bar */}
            <div
              className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-xl"
              data-ocid="hero.panel"
            >
              <input
                type="text"
                placeholder="काम का प्रकार (जैसे: राजमिस्त्री, बिजली)"
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm text-foreground outline-none rounded-xl bg-muted placeholder:text-muted-foreground"
                data-ocid="hero.search_input"
              />
              <input
                type="text"
                placeholder="स्थान (जैसे: दिल्ली, मुंबई)"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm text-foreground outline-none rounded-xl bg-muted placeholder:text-muted-foreground"
                data-ocid="hero.search_input"
              />
              <Button
                onClick={handleSearch}
                className="bg-orange hover:bg-orange/90 text-white font-semibold px-6 rounded-xl"
                data-ocid="hero.button"
              >
                <Search className="w-4 h-4 mr-2" />
                खोजें
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Workers */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"
        data-ocid="workers.section"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">प्रमुख मजदूर</h2>
            <p className="text-muted-foreground text-sm mt-1">
              अभी उपलब्ध कुशल मजदूर
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("workers")}
            className="border-navy text-secondary hover:bg-navy hover:text-white transition-colors"
            data-ocid="workers.button"
          >
            सभी देखें
          </Button>
        </div>

        {workersLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
              <Skeleton
                key={k}
                className="h-48 rounded-xl"
                data-ocid="workers.loading_state"
              />
            ))}
          </div>
        ) : featuredWorkers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredWorkers.map((worker, i) => (
              <WorkerCard
                key={worker.id.toString()}
                worker={worker}
                navigate={navigate}
                index={i + 1}
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="workers.empty_state"
          >
            कोई मजदूर उपलब्ध नहीं है
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-muted py-12" data-ocid="categories.section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            लोकप्रिय श्रेणियां
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                onClick={() => navigate("workers")}
                className="bg-card rounded-xl p-4 flex flex-col items-center gap-2 shadow-xs hover:shadow-card hover:-translate-y-0.5 transition-all group"
                data-ocid={`categories.item.${i + 1}`}
              >
                <div className="w-12 h-12 rounded-full bg-navy/10 group-hover:bg-orange/10 flex items-center justify-center transition-colors">
                  <cat.icon className="w-6 h-6 text-secondary group-hover:text-orange transition-colors" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground">
                    {cat.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{cat.sub}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"
        data-ocid="jobs.section"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              नवीनतम नौकरियां
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              ताज़ी नौकरी के अवसर
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("jobs")}
            className="border-navy text-secondary hover:bg-navy hover:text-white transition-colors"
            data-ocid="jobs.button"
          >
            सभी देखें
          </Button>
        </div>

        {jobsLoading ? (
          <div className="space-y-3">
            {["sk1", "sk2", "sk3", "sk4"].map((k) => (
              <Skeleton
                key={k}
                className="h-16 rounded-lg"
                data-ocid="jobs.loading_state"
              />
            ))}
          </div>
        ) : latestJobs.length > 0 ? (
          <div className="space-y-3">
            {latestJobs.map((job, i) => (
              <JobCard
                key={job.id.toString()}
                job={job}
                navigate={navigate}
                index={i + 1}
                compact
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="jobs.empty_state"
          >
            कोई नौकरी उपलब्ध नहीं है
          </div>
        )}
      </section>

      {/* Stats Banner */}
      <section className="bg-navy py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { num: "5000+", label: "पंजीकृत मजदूर" },
              { num: "1200+", label: "सक्रिय नौकरियां" },
              { num: "800+", label: "खुश नियोक्ता" },
              { num: "15+", label: "शहर" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-orange">{stat.num}</div>
                <div className="text-white/70 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
