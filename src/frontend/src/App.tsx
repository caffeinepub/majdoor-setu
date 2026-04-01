import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { useActor } from "./hooks/useActor";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import JobDetailPage from "./pages/JobDetailPage";
import JobsPage from "./pages/JobsPage";
import WorkerDetailPage from "./pages/WorkerDetailPage";
import WorkersPage from "./pages/WorkersPage";

export type Page =
  | "home"
  | "workers"
  | "jobs"
  | "worker-detail"
  | "job-detail"
  | "admin";

export default function App() {
  const { actor, isFetching } = useActor();
  const [seeded, setSeeded] = useState(false);
  const [page, setPage] = useState<Page>("home");
  const [selectedWorkerId, setSelectedWorkerId] = useState<bigint | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<bigint | null>(null);

  useEffect(() => {
    if (actor && !isFetching && !seeded) {
      actor
        .seedData()
        .then(() => setSeeded(true))
        .catch(() => setSeeded(true));
    }
  }, [actor, isFetching, seeded]);

  const navigate = (p: Page, id?: bigint) => {
    if (p === "worker-detail" && id !== undefined) setSelectedWorkerId(id);
    if (p === "job-detail" && id !== undefined) setSelectedJobId(id);
    setPage(p);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar page={page} navigate={navigate} />
      <main className="flex-1">
        {page === "home" && <HomePage navigate={navigate} />}
        {page === "workers" && <WorkersPage navigate={navigate} />}
        {page === "jobs" && <JobsPage navigate={navigate} />}
        {page === "worker-detail" && selectedWorkerId !== null && (
          <WorkerDetailPage workerId={selectedWorkerId} navigate={navigate} />
        )}
        {page === "job-detail" && selectedJobId !== null && (
          <JobDetailPage jobId={selectedJobId} navigate={navigate} />
        )}
        {page === "admin" && <AdminPage navigate={navigate} />}
      </main>
      <Footer navigate={navigate} />
      <Toaster />
    </div>
  );
}
