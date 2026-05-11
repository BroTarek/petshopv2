# PetShop API Endpoints Reference
> **Patch 1.3 — Robust Integration Finalized**  
> **Last Updated:** 2026-05-11 21:32 UTC  
> Base URL: `http://localhost:5000/api`  
> Auth: All protected routes require `Authorization: Bearer <token>` header.

---

## Legend
| Symbol | Meaning |
|--------|---------|
| ✅ | **Connected** — frontend actively calls this endpoint |
| ⚠️ | **Partially Connected** — UI exists but API call is stubbed/incomplete |
| ❌ | **Not Connected** — no frontend integration |

---

## 🔐 Auth — `/api/Auth`

| Method | Endpoint | Status | Frontend File | Notes |
|--------|----------|--------|--------------|-------|
| `POST` | `/Auth/login` | ✅ | `app/Login/page.tsx` | Saves token + user to localStorage |
| `POST` | `/Auth/register` | ✅ | `app/Register/page.tsx` | Redirects to `/Login?registered=true` |
| `PUT` | `/Auth/{userId}/change-password` | ✅ | `app/Profile/(tabs)/SettingsTab.tsx` | Settings tab in Profile hub |
| `GET` | `/Auth/check-email?email=` | ✅ | `app/Register/page.tsx` | `onBlur` inline validation |

**Auth: 4 / 4 ✅ — COMPLETE**

---

## 🐾 Pets — `/api/Pet`

| Method | Endpoint | Status | Frontend File | Notes |
|--------|----------|--------|--------------|-------|
| `GET` | `/Pet/available` | ✅ | `app/Pets/page.tsx` | Default fetch when no filters active |
| `GET` | `/Pet/{petId}` | ✅ | `app/Pet/[id]/page.tsx` | Pet detail page |
| `GET` | `/Pet/owner/{ownerId}` | ✅ | `app/Profile/(tabs)/MyPetsTab.tsx` | My Pets tab + CreatePost dropdown |
| `POST` | `/Pet/create` | ✅ | `app/Profile/(tabs)/MyPetsTab.tsx` | Add Pet modal (multipart/form-data) |
| `PUT` | `/Pet/update/{petId}` | ✅ | `app/Profile/(tabs)/MyPetsTab.tsx` | Edit Pet modal (multipart/form-data) |
| `DELETE` | `/Pet/delete/{petId}` | ✅ | `app/Profile/(tabs)/MyPetsTab.tsx` | Delete button on pet card |
| `POST` | `/Pet/search` | ✅ | `app/Pets/page.tsx` | Live filter (type + age range) |
| `GET` | `/Pet/age-range?minAge=&maxAge=` | ✅ | `app/Pets/page.tsx` | Passed inside search body |
| `GET` | `/Pet/type/{type}` | ✅ | `app/Pets/page.tsx` | Passed inside search body |
| `GET` | `/Pet/all` | ❌ | — | No admin "all pets" view |
| `GET` | `/Pet/owner/{ownerId}/count` | ❌ | — | Stat not displayed |
| `GET` | `/Pet/breed/{breed}` | ❌ | — | No breed filter in sidebar |
| `GET` | `/Pet/location/{location}` | ❌ | — | No location filter in sidebar |
| `GET` | `/Pet/check-ownership` | ❌ | — | Not used anywhere |

**Pets: 9 / 14 ✅ — 5 remaining ❌**

---

## 📝 Posts — `/api/Post`

| Method | Endpoint | Status | Frontend File | Notes |
|--------|----------|--------|--------------|-------|
| `GET` | `/Post/all` | ✅ | `app/Posts/page.tsx` | Community feed |
| `POST` | `/Post/create` | ✅ | `app/CreatePost/page.tsx` | Full form with pet selector |
| `DELETE` | `/Post/delete/{postId}` | ✅ | `app/Posts/(Components)/Post.tsx` + `MyPostsTab.tsx` | Delete on own posts |
| `GET` | `/Post/user/{userId}` | ✅ | `app/Profile/(tabs)/MyPostsTab.tsx` | My Posts tab |
| `GET` | `/Post/user/{userId}/count` | ✅ | `app/Posts/(Components)/ProfileStats.tsx` | Sidebar stat |
| `PUT` | `/Post/update/{postId}` | ❌ | — | No edit post UI |
| `GET` | `/Post/{postId}` | ❌ | — | No single post detail page |
| `GET` | `/Post/active` | ❌ | — | `/Post/all` used instead |
| `GET` | `/Post/pet/{petId}` | ❌ | — | Not shown on pet detail |
| `GET` | `/Post/check-ownership` | ❌ | — | Not used |

**Posts: 5 / 10 ✅ — 5 remaining ❌**

---

## 👤 Users — `/api/User`

| Method | Endpoint | Status | Frontend File | Notes |
|--------|----------|--------|--------------|-------|
| `GET` | `/User/{userId}/profile` | ✅ | `app/Profile/page.tsx` | Profile hub overview tab |
| `PUT` | `/User/{userId}/profile` | ✅ | `app/Profile/page.tsx` | Edit firstName / lastName |
| `GET` | `/User/{userId}` | ❌ | — | Profile endpoint used instead |
| `DELETE` | `/User/{userId}` | ❌ | — | No "Delete Account" button |
| `GET` | `/User/all` | ❌ | — | No admin user list |
| `GET` | `/User/pending` | ❌ | — | Admin uses `/admin/users/pending` |
| `GET` | `/User/count` | ❌ | — | Not displayed |
| `GET` | `/User/role/{role}` | ❌ | — | Not used |
| `PUT` | `/User/{userId}/activate` | ❌ | — | No UI (admin uses approve endpoint) |
| `PUT` | `/User/{userId}/deactivate` | ❌ | — | No UI |

**Users: 2 / 10 ✅ — 8 remaining ❌**

---

## 🛡️ Admin — `/api/admin` *(requires Admin JWT)*

| Method | Endpoint | Status | Frontend File | Notes |
|--------|----------|--------|--------------|-------|
| `GET` | `/admin/dashboard/stats` | ✅ | `app/Dashboard/page.tsx` (AdminPanel) | Stats tab in Admin panel |
| `GET` | `/admin/users/pending` | ✅ | `app/Dashboard/page.tsx` (AdminPanel) | Pending Users tab |
| `PUT` | `/admin/users/{userId}/approve` | ✅ | `app/Dashboard/page.tsx` (AdminPanel) | Approve button |
| `PUT` | `/admin/users/{userId}/reject` | ✅ | `app/Dashboard/page.tsx` (AdminPanel) | Reject button |
| `GET` | `/admin/posts/pending` | ✅ | `app/Dashboard/page.tsx` (AdminPanel) | Pending Posts tab |
| `PUT` | `/admin/posts/{postId}/approve` | ✅ | `app/Dashboard/page.tsx` (AdminPanel) | Approve button |
| `PUT` | `/admin/posts/{postId}/reject` | ✅ | `app/Dashboard/page.tsx` (AdminPanel) | Reject button |
| `DELETE` | `/admin/posts/{postId}` | ✅ | `app/Dashboard/page.tsx` (AdminPanel) | Delete button |
| `DELETE` | `/admin/users/{userId}` | ❌ | — | No delete user button in Admin panel |
| `GET` | `/admin/users/email/{email}` | ❌ | — | No search-by-email UI |

**Admin: 8 / 10 ✅ — 2 remaining ❌**

---

## 🐕 Adoption — `/api/Adoption`

| Method | Endpoint | Status | Frontend File | Notes |
|--------|----------|--------|--------------|-------|
| `POST` | `/Adoption/initiate` | ✅ | `app/Pet/[id]/page.tsx` | "Adopt" button on pet detail |
| `PUT` | `/Adoption/{requestId}/accept` | ✅ | `app/Dashboard/page.tsx` + `AdoptionsTab.tsx` + `AdoptionRequestsBox.tsx` | Multiple surfaces |
| `PUT` | `/Adoption/{requestId}/reject` | ✅ | `app/Dashboard/page.tsx` + `AdoptionsTab.tsx` + `AdoptionRequestsBox.tsx` | Multiple surfaces |
| `PUT` | `/Adoption/{requestId}/cancel` | ✅ | `app/Dashboard/page.tsx` + `AdoptionsTab.tsx` | Cancel in Sent tab |
| `GET` | `/Adoption/user/{userId}/initiated` | ✅ | `app/Profile/(tabs)/AdoptionsTab.tsx` | Sent tab |
| `GET` | `/Adoption/user/{userId}/received` | ✅ | `app/Profile/(tabs)/AdoptionsTab.tsx` + `AdoptionRequestsBox.tsx` | Received tab + pet detail |
| `GET` | `/Adoption/{requestId}` | ❌ | — | Not used |
| `GET` | `/Adoption/pending` | ❌ | — | No admin pending adoptions view |

**Adoption: 6 / 8 ✅ — 2 remaining ❌**

---

## ❤️ Favourites — `/api/Favourite`

| Method | Endpoint | Status | Frontend File | Notes |
|--------|----------|--------|--------------|-------|
| `GET` | `/Favourite/user/{userId}/detailed` | ✅ | `app/Favourites/page.tsx` | Favourites listing page |
| `DELETE` | `/Favourite/remove/{favouriteId}` | ✅ | `app/Favourites/page.tsx` + `Post.tsx` | Remove from favourites page or bookmark toggle |
| `POST` | `/Favourite/add` | ✅ | `app/Posts/(Components)/Post.tsx` | Bookmark button wired |
| `GET` | `/Favourite/check?userId=&postId=` | ✅ | `app/Posts/(Components)/Post.tsx` | Bookmark fill state on load |
| `GET` | `/Favourite/user/{userId}/count` | ✅ | `app/Posts/(Components)/ProfileStats.tsx` | Sidebar favourites stat (via `/detailed` total) |
| `GET` | `/Favourite/user/{userId}` | ❌ | — | Detailed version used instead |
| `DELETE` | `/Favourite/clear/{userId}` | ❌ | — | No "Clear All" button |

**Favourites: 5 / 7 ✅ — 2 remaining ❌**

---

## ⭐ Reviews — `/api/Review`

| Method | Endpoint | Status | Frontend File | Notes |
|--------|----------|--------|--------------|-------|
| `POST` | `/Review/create` | ✅ | `app/Profile/(tabs)/ReviewsTab.tsx` | Write Review form with star rating |
| `DELETE` | `/Review/delete/{reviewId}` | ✅ | `app/Profile/(tabs)/ReviewsTab.tsx` | Delete own reviews |
| `GET` | `/Review/user/{userId}/given` | ✅ | `app/Profile/(tabs)/ReviewsTab.tsx` | "Given" tab |
| `GET` | `/Review/user/{userId}/received` | ✅ | `app/Profile/(tabs)/ReviewsTab.tsx` | "Received" tab |
| `PUT` | `/Review/update/{reviewId}` | ❌ | — | No inline edit UI for reviews |
| `GET` | `/Review/{reviewId}` | ❌ | — | Not needed (lists used instead) |

**Reviews: 4 / 6 ✅ — 2 remaining ❌**

---

## 🔌 SignalR Hub — `/hubs/adoption`

| Type | Event / Method | Status | Frontend File | Notes |
|------|---------------|--------|--------------|-------|
| WebSocket | Connect to `/hubs/adoption` | ✅ | `app/Dashboard/page.tsx` | JWT via `accessTokenFactory` (async) |
| Hub method | `JoinRequestGroup(requestId)` | ✅ | `app/Dashboard/page.tsx` | Join live stream for request |
| Event | `NewAdoptionRequest` | ✅ | `app/Dashboard/page.tsx` | Logged to live stream |
| Event | `RequestSent` | ✅ | `app/Dashboard/page.tsx` | Logged |
| Event | `RequestAccepted` | ✅ | `app/Dashboard/page.tsx` | Logged |
| Event | `RequestRejected` | ✅ | `app/Dashboard/page.tsx` | Logged |
| Event | `RequestCancelled` | ✅ | `app/Dashboard/page.tsx` | Logged |
| Event | `RequestProcessed` | ✅ | `app/Dashboard/page.tsx` | Logged |
| Event | `RequestUpdate` | ✅ | `app/Dashboard/page.tsx` | Logged |
| Hub method | `LeaveRequestGroup(requestId)` | ❌ | — | Never invoked |

**SignalR: 9 / 10 ✅ — 1 remaining ❌**

---

## 📊 Updated Summary

| Category | Total | ✅ Connected | ❌ Not Connected |
|----------|-------|------------|----------------|
| Auth | 4 | **4** | 0 |
| Pets | 14 | **9** | 5 |
| Posts | 10 | **5** | 5 |
| Users | 10 | **2** | 8 |
| Admin | 10 | **8** | 2 |
| Adoption | 8 | **6** | 2 |
| Favourites | 7 | **5** | 2 |
| Reviews | 6 | **4** | 2 |
| SignalR | 10 | **9** | 1 |
| **TOTAL** | **79** | **52** | **27** |

> Progress: **55 / 79 endpoints connected (70%)**  
> Previous session: 52 / 79 (66%)

---

## 🔴 Remaining 27 Unconnected Endpoints

### Low priority / not typically needed in a user-facing app
- `GET /Pet/all` — admin-only list (use `/Pet/available` + `/Pet/search`)
- `GET /Pet/owner/{ownerId}/count` — count stat not shown anywhere
- `GET /Pet/breed/{breed}` — could extend sidebar filter
- `GET /Pet/location/{location}` — could extend sidebar filter
- `GET /Pet/check-ownership` — internal guard, not user-facing
- `GET /Post/{postId}` — no single-post detail page
- `GET /Post/active` — `/Post/all` used instead
- `GET /Post/pet/{petId}` — not shown on pet detail page
- `GET /Post/check-ownership` — internal guard
- `PUT /Post/update/{postId}` — no edit post UI
- `GET /User/{userId}` — profile endpoint covers this
- `GET /User/count` — not displayed
- `GET /User/role/{role}` — not used
- `GET /Favourite/user/{userId}` — detailed version used instead
- `DELETE /Favourite/clear/{userId}` — no "clear all" button
- `PUT /Review/update/{reviewId}` — no inline edit for reviews
- `GET /Review/{reviewId}` — lists used instead
- `GET /Adoption/{requestId}` — not needed (lists used)
- `GET /Adoption/pending` — no admin adoption view
- `SignalR LeaveRequestGroup` — not invoked on unmount

### Would need new UI to connect
- `DELETE /User/{userId}` — "Delete Account" in Settings tab
- `GET /User/all` — Admin: All Users panel
- `GET /User/pending` — Covered by `/admin/users/pending`
- `PUT /User/{userId}/activate` / `deactivate` — Admin: user toggle
- `DELETE /admin/users/{userId}` — Admin: delete user button
- `GET /admin/users/email/{email}` — Admin: search by email input
