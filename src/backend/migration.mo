import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  // Migrating types (old to new)
  type OldWorker = {
    id : Nat;
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
  };

  type OldWorkerId = Nat;

  type OldActor = {
    workers : Map.Map<OldWorkerId, OldWorker>;
  };

  type NewWorker = {
    id : Nat;
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

  type NewWorkerId = Nat;

  type NewActor = {
    workers : Map.Map<NewWorkerId, NewWorker>;
  };

  // Migration (script)
  public func run(old : OldActor) : NewActor {
    let newWorkers = old.workers.map<OldWorkerId, OldWorker, NewWorker>(
      func(_id, oldWorker) {
        {
          oldWorker with
          photoUrl = "";
        };
      }
    );

    { workers = newWorkers };
  };
};
