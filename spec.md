# Majdoor Setu

## Current State
- Workers list, jobs list, search/filter, admin dashboard all working
- Workers have color-coded initials as avatar (no photo)
- No notification system
- Backend Worker type has no photoUrl field

## Requested Changes (Diff)

### Add
- Worker photo upload in admin (add/edit worker form) using blob-storage
- Worker photo display in WorkerCard and WorkerDetailPage
- In-app browser notifications (Web Notifications API) - notify user when a new job is added
- Toast notifications already exist via sonner; add notification bell icon in Navbar showing recent activity (new jobs/workers added)

### Modify
- Worker type to include optional `photoUrl` field (stored as Text, empty string if none)
- WorkerCard: show photo if available, else fallback to colored initials
- AdminPage: add photo upload field in worker add/edit dialog
- Navbar: add notification bell with unread count badge

### Remove
- Nothing

## Implementation Plan
1. Select blob-storage component
2. Regenerate backend with photoUrl field in Worker
3. Update WorkerCard to show photo
4. Update AdminPage worker form to include photo upload via StorageClient
5. Add notification bell in Navbar with in-app activity feed (new jobs/workers tracked in localStorage)
6. Add browser notification permission request and trigger notification on new job creation
