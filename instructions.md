# Web App Requirements Document
## Social Media Calendar for App Store Apps

### 1. Web App Overview

This web app helps you plan and organise social media posts for your apps that are available on the App Store. You can create tasks for upcoming posts, give them due dates and priorities, track their status, and see everything on a calendar or timeline. The app is designed to make it easy to see what needs to be posted and when.

---

## 2. Main Goals

1. Keep all social media post plans in one place.
2. Make it easy to add and edit planned posts.
3. Track the progress of each post.
4. Show planned posts on a calendar.
5. Show upcoming work on a timeline.
6. Allow posts to be organised by app.
7. Make important or urgent posts easy to spot.
8. Make it easy to see what needs to be done next.

---

## 3. User Stories

- **US-001:** As a user, I want to add my App Store apps so that I can organise posts by app.
- **US-002:** As a user, I want to create a social media post task so that I can plan what I need to publish.
- **US-003:** As a user, I want to give a post a due date so that I know when it needs to be completed.
- **US-004:** As a user, I want to give a post a status so that I can track its progress.
- **US-005:** As a user, I want to set a priority so that I can see which posts are most important.
- **US-006:** As a user, I want to add the social media platform so that I know where each post will be published.
- **US-007:** As a user, I want to add notes to a post so that I can remember important details.
- **US-008:** As a user, I want to see my posts on a calendar so that I can plan my social media schedule.
- **US-009:** As a user, I want to see my upcoming work on a timeline so that I can understand what is coming up.
- **US-010:** As a user, I want to filter my posts by app, platform, status, or priority so that I can quickly find what I need.
- **US-011:** As a user, I want to edit or delete a post so that I can keep my plans up to date.
- **US-012:** As a user, I want to mark a post as completed so that I know it is finished.
- **US-013:** As a user, I want to see overdue tasks so that I don't forget them.
- **US-014:** As a user, I want to see a summary of my social media work so that I can quickly understand what needs attention.

---

# 4. Features

## F-001: Add App

**What It Does**  
Allows the user to add an App Store app to the calendar.

The user can enter:
- App name
- App Store link
- Optional notes

**When It Appears**  
On the Apps page and when creating a new post.

**If Something Goes Wrong**  
Show a simple message explaining what information is missing or cannot be saved.

---

## F-002: Create Social Media Post

**What It Does**  
Allows the user to create a planned social media post.

The user can add:
- Post title
- App
- Social media platform
- Due date
- Status
- Priority
- Notes
- Optional post content

**When It Appears**  
On the Calendar page, Timeline page, and Post details page.

**If Something Goes Wrong**  
Show a message if the post cannot be saved.

---

## F-003: Edit Social Media Post

**What It Does**  
Allows the user to change information about an existing post.

**When It Appears**  
When the user opens an existing post and chooses **Edit**.

**If Something Goes Wrong**  
Show a message if the changes cannot be saved.

---

## F-004: Delete Social Media Post

**What It Does**  
Allows the user to remove a post from the calendar.

Before deleting it, the app should ask the user to confirm.

**When It Appears**  
On the Post details page.

**If Something Goes Wrong**  
Show a message if the post cannot be deleted.

---

## F-005: Post Status

**What It Does**  
Allows each post to have a status.

The starting statuses should be:

- Planned
- In Progress
- Ready
- Posted
- Cancelled

**When It Appears**  
When creating or editing a post and when viewing posts.

**If Something Goes Wrong**  
If a status cannot be saved, show a message and keep the current status.

---

## F-006: Post Priority

**What It Does**  
Allows the user to give each post a priority.

The starting priorities should be:

- Low
- Normal
- High
- Urgent

**When It Appears**  
When creating or editing a post and when viewing posts.

**If Something Goes Wrong**  
If a priority cannot be saved, show a message and keep the current priority.

---

## F-007: Social Media Platform

**What It Does**  
Allows the user to choose where the post will be published.

The user should be able to choose platforms such as:

- Instagram
- Facebook
- TikTok
- YouTube
- X
- LinkedIn
- Other

**When It Appears**  
When creating or editing a post.

**If Something Goes Wrong**  
If a platform cannot be selected or saved, show a message.

---

## F-008: Calendar View

**What It Does**  
Shows planned posts on a calendar.

The user should be able to see posts by day, week, or month.

**When It Appears**  
On the main Calendar page.

**If Something Goes Wrong**  
If the calendar cannot load the posts, show a message instead of leaving the page blank.

---

## F-009: Timeline View

**What It Does**  
Shows posts in date order on a timeline.

This makes it easy to see what is coming next.

**When It Appears**  
On the Timeline page.

**If Something Goes Wrong**  
Show a message if the timeline cannot load the posts.

---

## F-010: Filter Posts

**What It Does**  
Allows the user to filter posts by:

- App
- Platform
- Status
- Priority
- Date

**When It Appears**  
On the Calendar and Timeline pages.

**If Something Goes Wrong**  
If no posts match the filters, show a message saying that no matching posts were found.

---

## F-011: Search Posts

**What It Does**  
Allows the user to search for a post by its title or notes.

**When It Appears**  
On the Calendar and Timeline pages.

**If Something Goes Wrong**  
If there are no matches, show a simple "No posts found" message.

---

## F-012: Overdue Posts

**What It Does**  
Identifies posts whose due dates have passed but which have not been marked as Posted or Cancelled.

**When It Appears**  
On the Dashboard, Calendar, and Timeline.

**If Something Goes Wrong**  
If the app cannot check the dates, show a message explaining that overdue information is unavailable.

---

## F-013: Dashboard Summary

**What It Does**  
Shows a quick summary of the user's social media plans.

It should show things such as:

- Posts due soon
- Overdue posts
- Posts in progress
- Posts ready to publish
- Recently posted items

**When It Appears**  
On the Dashboard/Home page.

**If Something Goes Wrong**  
Show a message if the summary cannot be loaded.

---

## F-014: Post Details

**What It Does**  
Shows all the information about one social media post in one place.

**When It Appears**  
When the user selects a post from the Dashboard, Calendar, or Timeline.

**If Something Goes Wrong**  
If the post cannot be found, show a message and provide a way back to the Calendar.

---

## F-015: App List

**What It Does**  
Shows all of the user's App Store apps.

The user can select an app to see its planned social media posts.

**When It Appears**  
On the Apps page.

**If Something Goes Wrong**  
If the apps cannot be loaded, show a message explaining the problem.

---

## F-016: App-Specific Posts

**What It Does**  
Shows all social media posts belonging to one selected app.

**When It Appears**  
When the user selects an app from the Apps page.

**If Something Goes Wrong**  
If the posts cannot be loaded, show a message.

---

## F-017: Quick Add

**What It Does**  
Provides a quick way to create a new post without having to go through several pages.

**When It Appears**  
A **+ Add Post** button should be available from the Dashboard and Calendar.

**If Something Goes Wrong**  
Show a message if the new post cannot be saved.

---

## F-018: Upcoming Posts

**What It Does**  
Shows the next posts that are due.

**When It Appears**  
On the Dashboard and Timeline.

**If Something Goes Wrong**  
If upcoming posts cannot be loaded, show a message.

---

# 5. Pages / Screens

## S-001: Dashboard

**What's On This Page**

- Summary of planned posts
- Upcoming posts
- Overdue posts
- Posts in progress
- Ready-to-post items
- Quick **+ Add Post** button

**How Users Get Here**

The Dashboard is the main page after opening the app.

---

## S-002: Calendar

**What's On This Page**

- Calendar
- Planned social media posts
- Calendar controls for day, week, and month
- Filters
- Search
- **+ Add Post** button

**How Users Get Here**

Users select **Calendar** from the main navigation.

---

## S-003: Timeline

**What's On This Page**

- Posts arranged by date
- Upcoming posts
- Overdue posts
- Status
- Priority
- App
- Platform

**How Users Get Here**

Users select **Timeline** from the main navigation.

---

## S-004: Apps

**What's On This Page**

- List of App Store apps
- App names
- App Store links
- Number of planned posts
- **+ Add App** button

**How Users Get Here**

Users select **Apps** from the main navigation.

---

## S-005: App Details

**What's On This Page**

- App name
- App Store link
- App notes
- Posts for that app
- **+ Add Post** button
- Edit app option

**How Users Get Here**

Users select an app from the Apps page.

---

## S-006: Post Details

**What's On This Page**

- Post title
- App
- Platform
- Due date
- Status
- Priority
- Notes
- Post content
- Edit button
- Delete button

**How Users Get Here**

Users select a post from the Dashboard, Calendar, Timeline, or App Details page.

---

## S-007: Add / Edit Post

**What's On This Page**

A form for entering or changing:

- Post title
- App
- Platform
- Due date
- Status
- Priority
- Notes
- Post content

**How Users Get Here**

Users select **+ Add Post** or **Edit** on an existing post.

---

## S-008: Add / Edit App

**What's On This Page**

A form for entering or changing:

- App name
- App Store link
- Notes

**How Users Get Here**

Users select **+ Add App** or **Edit App**.

---

# 6. Data

## D-001: App Information

**What Is Stored**

- App name
- App Store link
- Notes
- Date the app was added

**Why It Is Needed**

The app needs this information to organise social media posts by app.

---

## D-002: Social Media Post

**What Is Stored**

- Post title
- App
- Platform
- Due date
- Status
- Priority
- Notes
- Post content
- Date created
- Date last changed

**Why It Is Needed**

This is the main information the calendar uses to organise and track social media plans.

---

## D-003: User Settings

**What Is Stored**

- Calendar view preference
- Selected filters
- Other simple app preferences

**Why It Is Needed**

So the app can remember how the user likes to use it.

---

# 7. Extra Details

### Internet Connection

- **Does the app need the internet?** Yes.
- **Can it work offline?** The first version does not need to work offline.

### User Accounts

- **Does it need sign in?** Yes.
- **Can users use it without an account?** No. Each user's apps and social media plans should belong to their own account.

### Data Storage

- **Is information saved online?** Yes. Apps, posts, and settings should be saved online.
- **Is anything saved in the browser?** The browser may remember simple things such as the user's display preferences, but important information should be saved online.

### Permissions

The app does not need access to:

- **Camera:** No
- **Microphone:** No
- **Location:** No
- **Notifications:** Not required for the first version
- **File uploads:** Not required for the first version

### Mobile Friendly

Yes. The app should work well on:

- Desktop computers
- Laptops
- Tablets
- Phones

### Dark Mode

Yes. Dark mode should be supported.

### Accessibility

Yes.

- Text should be easy to read.
- Buttons should be large enough to tap.
- Important information should not be shown using colour alone.
- Forms should have clear labels.
- The app should work well with keyboard controls.

---

# 8. Build Steps

Build the app in small steps, starting with the easiest parts.

- **B-001:** Create the basic web app and navigation between S-001, S-002, S-003, and S-004.
- **B-002:** Build S-008 Add / Edit App and F-001 Add App.
- **B-003:** Add D-001 App Information storage.
- **B-004:** Build S-007 Add / Edit Post and F-002 Create Social Media Post.
- **B-005:** Add D-002 Social Media Post storage.
- **B-006:** Add F-005 Post Status and F-006 Post Priority.
- **B-007:** Add F-007 Social Media Platform.
- **B-008:** Build S-006 Post Details and connect F-003 Edit Social Media Post and F-004 Delete Social Media Post.
- **B-009:** Build S-002 Calendar and connect it to D-002.
- **B-010:** Add F-017 Quick Add to S-001 Dashboard and S-002 Calendar.
- **B-011:** Build S-003 Timeline and connect it to D-002.
- **B-012:** Add F-010 Filter Posts and F-011 Search Posts.
- **B-013:** Add F-012 Overdue Posts and F-018 Upcoming Posts.
- **B-014:** Build F-013 Dashboard Summary on S-001.
- **B-015:** Build S-005 App Details and F-016 App-Specific Posts.
- **B-016:** Add D-003 User Settings.
- **B-017:** Add user sign in and make sure each user's data is kept separate.
- **B-018:** Make the app work well on phones and tablets.
- **B-019:** Add dark mode and the accessibility improvements described above.
- **B-020:** Test the complete app by creating apps, adding posts, changing statuses, using the calendar, using filters, and checking overdue posts.
