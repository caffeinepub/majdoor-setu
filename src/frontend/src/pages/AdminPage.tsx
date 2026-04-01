import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { HttpAgent } from "@icp-sdk/core/agent";
import {
  Loader2,
  Lock,
  Pencil,
  Plus,
  Shield,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import type { Job, Worker } from "../backend.d";
import { loadConfig } from "../config";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllJobs,
  useAllWorkers,
  useApplicationsByJob,
  useCreateJob,
  useCreateWorker,
  useDeleteJob,
  useDeleteWorker,
  useIsAdmin,
  useUpdateApplicationStatus,
  useUpdateJob,
  useUpdateWorker,
} from "../hooks/useQueries";
import { StorageClient } from "../utils/StorageClient";

interface AdminPageProps {
  navigate: (p: Page) => void;
}

const EMPTY_WORKER = {
  name: "",
  skills: [] as string[],
  location: "",
  dailyRate: BigInt(0),
  experience: BigInt(0),
  bio: "",
  phone: "",
  available: true,
  rating: 0,
  photoUrl: "",
};

const EMPTY_JOB = {
  title: "",
  description: "",
  skillsNeeded: [] as string[],
  location: "",
  payPerDay: BigInt(0),
  duration: "",
  postedBy: "",
  active: true,
};

function ApplicationsPanel({ jobId }: { jobId: bigint }) {
  const { data: applications, isLoading } = useApplicationsByJob(jobId);
  const updateStatus = useUpdateApplicationStatus();

  if (isLoading) return <Skeleton className="h-20" />;
  if (!applications?.length)
    return <p className="text-sm text-muted-foreground">कोई आवेदन नहीं</p>;

  return (
    <div className="space-y-2 mt-2">
      {applications.map((app, i) => (
        <div
          key={app.id.toString()}
          className="flex items-center justify-between p-2 bg-muted rounded-lg"
          data-ocid={`admin.applications.item.${i + 1}`}
        >
          <div>
            <div className="text-sm font-medium">{app.workerName}</div>
            <Badge className="text-xs mt-0.5">{app.status}</Badge>
          </div>
          <div className="flex gap-1">
            {["pending", "accepted", "rejected"].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={app.status === s ? "default" : "outline"}
                className="text-xs px-2 py-1 h-auto"
                onClick={() =>
                  updateStatus.mutate(
                    { id: app.id, status: s },
                    {
                      onSuccess: () => toast.success("स्थिति अपडेट हुई"),
                      onError: () => toast.error("त्रुटि हुई"),
                    },
                  )
                }
                data-ocid={`admin.applications.item.${i + 1}.button`}
              >
                {s === "pending"
                  ? "लंबित"
                  : s === "accepted"
                    ? "स्वीकृत"
                    : "अस्वीकृत"}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPage({ navigate: _navigate }: AdminPageProps) {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { login } = useInternetIdentity();
  const { data: workers, isLoading: workersLoading } = useAllWorkers();
  const { data: jobs, isLoading: jobsLoading } = useAllJobs();

  const createWorker = useCreateWorker();
  const updateWorker = useUpdateWorker();
  const deleteWorker = useDeleteWorker();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const [workerDialog, setWorkerDialog] = useState(false);
  const [jobDialog, setJobDialog] = useState(false);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [workerForm, setWorkerForm] = useState({ ...EMPTY_WORKER });
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jobForm, setJobForm] = useState({ ...EMPTY_JOB });
  const [appJobId, setAppJobId] = useState<bigint | null>(null);

  const openAddWorker = () => {
    setEditWorker(null);
    setWorkerForm({ ...EMPTY_WORKER });
    setWorkerDialog(true);
  };

  const openEditWorker = (w: Worker) => {
    setEditWorker(w);
    setWorkerForm({
      name: w.name,
      skills: w.skills,
      location: w.location,
      dailyRate: w.dailyRate,
      experience: w.experience,
      bio: w.bio,
      phone: w.phone,
      available: w.available,
      rating: w.rating,
      photoUrl: w.photoUrl || "",
    });
    setWorkerDialog(true);
  };

  const openAddJob = () => {
    setEditJob(null);
    setJobForm({ ...EMPTY_JOB });
    setJobDialog(true);
  };

  const openEditJob = (j: Job) => {
    setEditJob(j);
    setJobForm({
      title: j.title,
      description: j.description,
      skillsNeeded: j.skillsNeeded,
      location: j.location,
      payPerDay: j.payPerDay,
      duration: j.duration,
      postedBy: j.postedBy,
      active: j.active,
    });
    setJobDialog(true);
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      setUploadProgress(0);
      const config = await loadConfig();
      const agent = new HttpAgent({ host: config.backend_host });
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) =>
        setUploadProgress(pct),
      );
      const url = await storageClient.getDirectURL(hash);
      setWorkerForm((p) => ({ ...p, photoUrl: url }));
      setUploadProgress(null);
    } catch {
      setUploadProgress(null);
      toast.error("फोटो अपलोड में त्रुटि हुई");
    }
  };

  const saveWorker = async () => {
    try {
      if (editWorker) {
        await updateWorker.mutateAsync({
          id: editWorker.id,
          worker: { ...editWorker, ...workerForm },
        });
        toast.success("मजदूर अपडेट हुआ");
      } else {
        await createWorker.mutateAsync({
          ...workerForm,
          id: BigInt(0),
          createdAt: BigInt(Date.now()),
          reviewCount: BigInt(0),
        });
        toast.success("मजदूर जोड़ा गया");
      }
      setWorkerDialog(false);
    } catch {
      toast.error("त्रुटि हुई");
    }
  };

  const saveJob = async () => {
    try {
      if (editJob) {
        await updateJob.mutateAsync({
          id: editJob.id,
          job: { ...editJob, ...jobForm },
        });
        toast.success("नौकरी अपडेट हुई");
      } else {
        await createJob.mutateAsync({
          ...jobForm,
          id: BigInt(0),
          createdAt: BigInt(Date.now()),
        });
        toast.success("नौकरी जोड़ी गई");
      }
      setJobDialog(false);
    } catch {
      toast.error("त्रुटि हुई");
    }
  };

  if (adminLoading) {
    return (
      <div
        className="max-w-7xl mx-auto px-4 py-20 flex justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="max-w-md mx-auto px-4 py-20 text-center"
        data-ocid="admin.panel"
      >
        <div className="bg-card rounded-2xl p-10 shadow-card border border-border">
          <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-orange" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">एडमिन एक्सेस</h2>
          <p className="text-muted-foreground text-sm mb-6">
            यह पेज केवल एडमिन के लिए है। कृपया लॉगिन करें।
          </p>
          <Button
            onClick={login}
            className="bg-orange hover:bg-orange/90 text-white w-full"
            data-ocid="admin.primary_button"
          >
            <Shield className="w-4 h-4 mr-2" />
            लॉगिन करें
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      data-ocid="admin.page"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-orange/10 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-orange" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">एडमिन डैशबोर्ड</h1>
          <p className="text-muted-foreground text-sm">
            मजदूर, नौकरियां और आवेदन प्रबंधित करें
          </p>
        </div>
      </div>

      <Tabs defaultValue="workers" data-ocid="admin.tab">
        <TabsList className="mb-6">
          <TabsTrigger value="workers" data-ocid="admin.tab">
            मजदूर
          </TabsTrigger>
          <TabsTrigger value="jobs" data-ocid="admin.tab">
            नौकरियां
          </TabsTrigger>
          <TabsTrigger value="applications" data-ocid="admin.tab">
            आवेदन
          </TabsTrigger>
        </TabsList>

        {/* Workers Tab */}
        <TabsContent value="workers">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">सभी मजदूर</h2>
            <Button
              onClick={openAddWorker}
              className="bg-orange hover:bg-orange/90 text-white"
              data-ocid="admin.primary_button"
            >
              <Plus className="w-4 h-4 mr-2" /> नया मजदूर जोड़ें
            </Button>
          </div>
          {workersLoading ? (
            <Skeleton className="h-40" data-ocid="admin.loading_state" />
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>नाम</TableHead>
                    <TableHead>स्थान</TableHead>
                    <TableHead>कौशल</TableHead>
                    <TableHead>दर</TableHead>
                    <TableHead>उपलब्ध</TableHead>
                    <TableHead>क्रिया</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers?.map((w, i) => (
                    <TableRow
                      key={w.id.toString()}
                      data-ocid={`admin.workers.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">{w.name}</TableCell>
                      <TableCell>{w.location}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {w.skills.slice(0, 2).map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="text-xs"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>₹{Number(w.dailyRate)}/दिन</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            w.available
                              ? "bg-green-100 text-green-700"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {w.available ? "हाँ" : "नहीं"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditWorker(w)}
                            data-ocid={`admin.workers.item.${i + 1}.edit_button`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive hover:text-white"
                            onClick={() =>
                              deleteWorker.mutate(w.id, {
                                onSuccess: () =>
                                  toast.success("मजदूर हटाया गया"),
                                onError: () => toast.error("त्रुटि हुई"),
                              })
                            }
                            data-ocid={`admin.workers.item.${i + 1}.delete_button`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">सभी नौकरियां</h2>
            <Button
              onClick={openAddJob}
              className="bg-orange hover:bg-orange/90 text-white"
              data-ocid="admin.primary_button"
            >
              <Plus className="w-4 h-4 mr-2" /> नई नौकरी जोड़ें
            </Button>
          </div>
          {jobsLoading ? (
            <Skeleton className="h-40" data-ocid="admin.loading_state" />
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>शीर्षक</TableHead>
                    <TableHead>स्थान</TableHead>
                    <TableHead>वेतन/दिन</TableHead>
                    <TableHead>अवधि</TableHead>
                    <TableHead>स्थिति</TableHead>
                    <TableHead>क्रिया</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs?.map((j, i) => (
                    <TableRow
                      key={j.id.toString()}
                      data-ocid={`admin.jobs.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">{j.title}</TableCell>
                      <TableCell>{j.location}</TableCell>
                      <TableCell>₹{Number(j.payPerDay)}</TableCell>
                      <TableCell>{j.duration}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            j.active
                              ? "bg-green-100 text-green-700"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {j.active ? "सक्रिय" : "बंद"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditJob(j)}
                            data-ocid={`admin.jobs.item.${i + 1}.edit_button`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive hover:text-white"
                            onClick={() =>
                              deleteJob.mutate(j.id, {
                                onSuccess: () => toast.success("नौकरी हटाई गई"),
                                onError: () => toast.error("त्रुटि हुई"),
                              })
                            }
                            data-ocid={`admin.jobs.item.${i + 1}.delete_button`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAppJobId(j.id)}
                            data-ocid={`admin.jobs.item.${i + 1}.button`}
                          >
                            आवेदन
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <h2 className="text-lg font-semibold mb-4">नौकरी के अनुसार आवेदन</h2>
          {jobsLoading ? (
            <Skeleton className="h-40" data-ocid="admin.loading_state" />
          ) : (
            <div className="space-y-4">
              {jobs?.map((j, i) => (
                <div
                  key={j.id.toString()}
                  className="bg-card rounded-xl p-5 shadow-xs border border-border"
                  data-ocid={`admin.applications.item.${i + 1}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{j.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {j.location}
                      </p>
                    </div>
                    <Badge
                      className={
                        j.active
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {j.active ? "सक्रिय" : "बंद"}
                    </Badge>
                  </div>
                  <ApplicationsPanel jobId={j.id} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Worker Dialog */}
      <Dialog open={workerDialog} onOpenChange={setWorkerDialog}>
        <DialogContent className="max-w-lg" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>
              {editWorker ? "मजदूर संपादित करें" : "नया मजदूर जोड़ें"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="w-name">नाम</Label>
              <Input
                id="w-name"
                value={workerForm.name}
                onChange={(e) =>
                  setWorkerForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="पूरा नाम"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label>फोटो</Label>
              <div className="mt-1 space-y-2">
                <button
                  type="button"
                  className="flex items-center gap-3 p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-orange/50 transition-colors w-full text-left"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {workerForm.photoUrl ? (
                    <img
                      src={workerForm.photoUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-foreground font-medium">
                      {workerForm.photoUrl ? "फोटो बदलें" : "फोटो चुनें"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG (max 5MB)
                    </p>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  data-ocid="admin.upload_button"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                  }}
                />
                {uploadProgress !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>अपलोड हो रहा है...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress
                      value={uploadProgress}
                      className="h-1.5"
                      data-ocid="admin.loading_state"
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="w-location">स्थान</Label>
              <Input
                id="w-location"
                value={workerForm.location}
                onChange={(e) =>
                  setWorkerForm((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="शहर"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label htmlFor="w-phone">फोन</Label>
              <Input
                id="w-phone"
                value={workerForm.phone}
                onChange={(e) =>
                  setWorkerForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+91 XXXXX XXXXX"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label htmlFor="w-rate">प्रतिदिन दर (₹)</Label>
              <Input
                id="w-rate"
                type="number"
                value={Number(workerForm.dailyRate)}
                onChange={(e) =>
                  setWorkerForm((p) => ({
                    ...p,
                    dailyRate: BigInt(e.target.value || 0),
                  }))
                }
                placeholder="500"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label htmlFor="w-exp">अनुभव (वर्ष)</Label>
              <Input
                id="w-exp"
                type="number"
                value={Number(workerForm.experience)}
                onChange={(e) =>
                  setWorkerForm((p) => ({
                    ...p,
                    experience: BigInt(e.target.value || 0),
                  }))
                }
                placeholder="3"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label htmlFor="w-rating">रेटिंग (0-5)</Label>
              <Input
                id="w-rating"
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={workerForm.rating}
                onChange={(e) =>
                  setWorkerForm((p) => ({
                    ...p,
                    rating: Number.parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="4.5"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label htmlFor="w-skills">कौशल (कॉमा से अलग करें)</Label>
              <Input
                id="w-skills"
                value={workerForm.skills.join(", ")}
                onChange={(e) =>
                  setWorkerForm((p) => ({
                    ...p,
                    skills: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="राजमिस्त्री, बिजली, प्लंबिंग"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label htmlFor="w-bio">परिचय</Label>
              <Textarea
                id="w-bio"
                value={workerForm.bio}
                onChange={(e) =>
                  setWorkerForm((p) => ({ ...p, bio: e.target.value }))
                }
                placeholder="मजदूर का परिचय"
                data-ocid="admin.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWorkerDialog(false)}
              data-ocid="admin.cancel_button"
            >
              रद्द करें
            </Button>
            <Button
              onClick={saveWorker}
              disabled={createWorker.isPending || updateWorker.isPending}
              className="bg-orange hover:bg-orange/90 text-white"
              data-ocid="admin.save_button"
            >
              {createWorker.isPending || updateWorker.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> सहेज रहे हैं...
                </>
              ) : (
                "सहेजें"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Dialog */}
      <Dialog open={jobDialog} onOpenChange={setJobDialog}>
        <DialogContent className="max-w-lg" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>
              {editJob ? "नौकरी संपादित करें" : "नई नौकरी जोड़ें"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="j-title">शीर्षक</Label>
              <Input
                id="j-title"
                value={jobForm.title}
                onChange={(e) =>
                  setJobForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="नौकरी का शीर्षक"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label htmlFor="j-location">स्थान</Label>
              <Input
                id="j-location"
                value={jobForm.location}
                onChange={(e) =>
                  setJobForm((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="शहर"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label htmlFor="j-poster">नियोक्ता का नाम</Label>
              <Input
                id="j-poster"
                value={jobForm.postedBy}
                onChange={(e) =>
                  setJobForm((p) => ({ ...p, postedBy: e.target.value }))
                }
                placeholder="कंपनी / व्यक्ति का नाम"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label htmlFor="j-pay">वेतन/दिन (₹)</Label>
              <Input
                id="j-pay"
                type="number"
                value={Number(jobForm.payPerDay)}
                onChange={(e) =>
                  setJobForm((p) => ({
                    ...p,
                    payPerDay: BigInt(e.target.value || 0),
                  }))
                }
                placeholder="600"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label htmlFor="j-duration">अवधि</Label>
              <Input
                id="j-duration"
                value={jobForm.duration}
                onChange={(e) =>
                  setJobForm((p) => ({ ...p, duration: e.target.value }))
                }
                placeholder="7 दिन"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label htmlFor="j-skills">आवश्यक कौशल (कॉमा से अलग करें)</Label>
              <Input
                id="j-skills"
                value={jobForm.skillsNeeded.join(", ")}
                onChange={(e) =>
                  setJobForm((p) => ({
                    ...p,
                    skillsNeeded: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="राजमिस्त्री, बिजली"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label htmlFor="j-desc">विवरण</Label>
              <Textarea
                id="j-desc"
                value={jobForm.description}
                onChange={(e) =>
                  setJobForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="नौकरी का विवरण"
                data-ocid="admin.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setJobDialog(false)}
              data-ocid="admin.cancel_button"
            >
              रद्द करें
            </Button>
            <Button
              onClick={saveJob}
              disabled={createJob.isPending || updateJob.isPending}
              className="bg-orange hover:bg-orange/90 text-white"
              data-ocid="admin.save_button"
            >
              {createJob.isPending || updateJob.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> सहेज रहे हैं...
                </>
              ) : (
                "सहेजें"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Applications by Job Dialog */}
      <Dialog
        open={appJobId !== null}
        onOpenChange={(o) => !o && setAppJobId(null)}
      >
        <DialogContent data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>आवेदन देखें</DialogTitle>
          </DialogHeader>
          {appJobId && <ApplicationsPanel jobId={appJobId} />}
          <DialogFooter>
            <Button
              onClick={() => setAppJobId(null)}
              data-ocid="admin.close_button"
            >
              बंद करें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
