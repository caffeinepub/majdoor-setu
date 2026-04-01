import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Migration "migration";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

(with migration = Migration.run)
actor {
  // Add persistent mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Type definitions
  type WorkerId = Nat;
  type JobId = Nat;
  type ApplicationId = Nat;

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    userType : Text; // "worker", "employer", or "admin"
  };

  public type Worker = {
    id : WorkerId;
    name : Text;
    skills : [Text];
    location : Text;
    dailyRate : Nat;
    experience : Nat;
    bio : Text;
    phone : Text;
    available : Bool;
    rating : Float;
    reviewCount : Nat;
    createdAt : Int;
    photoUrl : Text;
  };

  public type Job = {
    id : JobId;
    title : Text;
    description : Text;
    skillsNeeded : [Text];
    location : Text;
    payPerDay : Nat;
    duration : Text;
    postedBy : Text;
    active : Bool;
    createdAt : Int;
  };

  public type Application = {
    id : ApplicationId;
    workerId : WorkerId;
    jobId : JobId;
    workerName : Text;
    status : Text;
    appliedAt : Int;
  };

  // Worker module for compare function
  module Worker {
    public func compare(worker1 : Worker, worker2 : Worker) : Order.Order {
      Nat.compare(worker1.id, worker2.id);
    };
  };

  // Job module for compare function
  module Job {
    public func compare(job1 : Job, job2 : Job) : Order.Order {
      Nat.compare(job1.id, job2.id);
    };
  };

  // State variables
  var nextWorkerId : WorkerId = 1;
  let workers = Map.empty<WorkerId, Worker>();

  var nextJobId : JobId = 1;
  let jobs = Map.empty<JobId, Job>();

  var nextApplicationId : ApplicationId = 1;
  let applications = Map.empty<ApplicationId, Application>();

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Seed Data
  var isSeeded = false;

  public shared ({ caller }) func seedData() : async () {
    if (isSeeded) { Runtime.trap("Data already seeded") };
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let seedWorkers : [Worker] = [
      // Plumber example
      {
        id = 1;
        name = "Ramesh Kumar";
        skills = ["Plumbing", "Pipe Fitting"];
        location = "Delhi";
        dailyRate = 500;
        experience = 5;
        bio = "Experienced plumber with 5 years in the industry.";
        phone = "9876543210";
        available = true;
        rating = 4.5;
        reviewCount = 20;
        createdAt = 0;
        photoUrl = "https://example.com/photos/ramesh.jpg";
      },
      // Electrician example
      {
        id = 2;
        name = "Suresh Verma";
        skills = ["Electrical Wiring", "Repair"];
        location = "Mumbai";
        dailyRate = 600;
        experience = 7;
        bio = "Skilled electrician specializing in home and office wiring.";
        phone = "9123456789";
        available = true;
        rating = 4.7;
        reviewCount = 25;
        createdAt = 0;
        photoUrl = "https://example.com/photos/suresh.jpg";
      },
      // Mason example
      {
        id = 3;
        name = "Amit Singh";
        skills = ["Masonry", "Construction"];
        location = "Chennai";
        dailyRate = 700;
        experience = 10;
        bio = "Expert mason with over 10 years of experience.";
        phone = "9345678901";
        available = false;
        rating = 4.9;
        reviewCount = 30;
        createdAt = 0;
        photoUrl = "https://example.com/photos/amit.jpg";
      },
      // Carpenter example
      {
        id = 4;
        name = "Rajesh Sharma";
        skills = ["Carpentry", "Furniture Making"];
        location = "Bangalore";
        dailyRate = 800;
        experience = 8;
        bio = "Professional carpenter specializing in custom furniture.";
        phone = "9456789012";
        available = true;
        rating = 4.6;
        reviewCount = 22;
        createdAt = 0;
        photoUrl = "https://example.com/photos/rajesh.jpg";
      },
      // Painter example
      {
        id = 5;
        name = "Mukesh Yadav";
        skills = ["Painting", "Wall Finishes"];
        location = "Hyderabad";
        dailyRate = 400;
        experience = 6;
        bio = "Experienced painter for residential and commercial projects.";
        phone = "9567890123";
        available = true;
        rating = 4.4;
        reviewCount = 18;
        createdAt = 0;
        photoUrl = "https://example.com/photos/mukesh.jpg";
      },
      // General labor example
      {
        id = 6;
        name = "Anil Gupta";
        skills = ["General Labor", "Loading", "Unloading"];
        location = "Kolkata";
        dailyRate = 300;
        experience = 3;
        bio = "Reliable laborer for various tasks.";
        phone = "9678901234";
        available = true;
        rating = 4.2;
        reviewCount = 15;
        createdAt = 0;
        photoUrl = "https://example.com/photos/anil.jpg";
      },
    ];

    let seedJobs : [Job] = [
      {
        id = 1;
        title = "Fix Leaky Faucet";
        description = "Need a plumber to fix a leaky faucet in my kitchen.";
        skillsNeeded = ["Plumbing"];
        location = "Delhi";
        payPerDay = 500;
        duration = "1 day";
        postedBy = "Sunil Sharma";
        active = true;
        createdAt = 0;
      },
      {
        id = 2;
        title = "Install Ceiling Lights";
        description = "Looking for an electrician to install new ceiling lights.";
        skillsNeeded = ["Electrical Wiring"];
        location = "Mumbai";
        payPerDay = 700;
        duration = "2 days";
        postedBy = "Rohit Mehta";
        active = true;
        createdAt = 0;
      },
      {
        id = 3;
        title = "Build Brick Wall";
        description = "Need a mason to build a new brick wall in my backyard.";
        skillsNeeded = ["Masonry"];
        location = "Chennai";
        payPerDay = 1000;
        duration = "3 days";
        postedBy = "Priya Singh";
        active = true;
        createdAt = 0;
      },
      {
        id = 4;
        title = "Paint Living Room";
        description = "Seeking a painter to paint my living room walls.";
        skillsNeeded = ["Painting"];
        location = "Hyderabad";
        payPerDay = 400;
        duration = "1 day";
        postedBy = "Anil Kumar";
        active = true;
        createdAt = 0;
      },
    ];

    for (worker in seedWorkers.values()) {
      workers.add(worker.id, worker);
    };
    for (job in seedJobs.values()) {
      jobs.add(job.id, job);
    };

    nextWorkerId := 7;
    nextJobId := 5;
    isSeeded := true;
  };

  // Worker Management
  public shared ({ caller }) func createWorker(worker : Worker) : async WorkerId {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create workers");
    };
    let newWorker : Worker = {
      worker with
      id = nextWorkerId;
      rating = 0.0;
      reviewCount = 0;
    };
    workers.add(nextWorkerId, newWorker);
    nextWorkerId += 1;
    newWorker.id;
  };

  public shared ({ caller }) func updateWorker(id : WorkerId, worker : Worker) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update workers");
    };
    if (not workers.containsKey(id)) {
      Runtime.trap("Worker not found");
    };
    let updatedWorker : Worker = {
      worker with
      id;
    };
    workers.add(id, updatedWorker);
  };

  public shared ({ caller }) func deleteWorker(id : WorkerId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete workers");
    };
    if (not workers.containsKey(id)) {
      Runtime.trap("Worker not found");
    };
    workers.remove(id);
  };

  public query ({ caller }) func getWorker(id : WorkerId) : async Worker {
    switch (workers.get(id)) {
      case (null) { Runtime.trap("Worker not found") };
      case (?worker) { worker };
    };
  };

  public query ({ caller }) func getAllWorkers() : async [Worker] {
    workers.values().toArray().sort();
  };

  // Job Management
  public shared ({ caller }) func createJob(job : Job) : async JobId {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create jobs");
    };
    let newJob : Job = {
      job with
      id = nextJobId;
      active = true;
    };
    jobs.add(nextJobId, newJob);
    nextJobId += 1;
    newJob.id;
  };

  public shared ({ caller }) func updateJob(id : JobId, job : Job) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update jobs");
    };
    if (not jobs.containsKey(id)) {
      Runtime.trap("Job not found");
    };
    let updatedJob : Job = {
      job with
      id;
    };
    jobs.add(id, updatedJob);
  };

  public shared ({ caller }) func deleteJob(id : JobId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete jobs");
    };
    if (not jobs.containsKey(id)) {
      Runtime.trap("Job not found");
    };
    jobs.remove(id);
  };

  public query ({ caller }) func getJob(id : JobId) : async Job {
    switch (jobs.get(id)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) { job };
    };
  };

  public query ({ caller }) func getAllJobs() : async [Job] {
    jobs.values().toArray().sort();
  };

  // Application Management
  public shared ({ caller }) func applyToJob(application : Application) : async ApplicationId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can apply to jobs");
    };
    if (application.workerId == 0 or application.jobId == 0) {
      Runtime.trap("Invalid application data");
    };
    let newApplication : Application = {
      application with
      id = nextApplicationId;
      status = "pending";
    };
    applications.add(nextApplicationId, newApplication);
    nextApplicationId += 1;
    newApplication.id;
  };

  public shared ({ caller }) func updateApplicationStatus(id : ApplicationId, status : Text) : async () {
    switch (applications.get(id)) {
      case (null) { Runtime.trap("Application not found") };
      case (?application) {
        let updatedApplication : Application = {
          application with
          status;
        };
        applications.add(id, updatedApplication);
      };
    };
  };

  public query ({ caller }) func getApplicationsByJob(jobId : JobId) : async [Application] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view applications");
    };
    applications.values().toArray().filter(
      func(app) { app.jobId == jobId }
    );
  };

  // Search Functions
  public query ({ caller }) func searchWorkersBySkillAndLocation(skill : Text, location : Text) : async [Worker] {
    workers.values().toArray().filter(
      func(worker) {
        worker.skills.find(func(s) { s == skill }) != null and worker.location == location
      }
    );
  };

  public query ({ caller }) func searchJobsBySkillAndLocation(skill : Text, location : Text) : async [Job] {
    jobs.values().toArray().filter(
      func(job) {
        job.skillsNeeded.find(func(s) { s == skill }) != null and job.location == location
      }
    );
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
