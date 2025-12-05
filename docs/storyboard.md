# Storyboard & Collaboration Playbook

## Hero & Storyline
- Home hero CTA links to **مسیر مشارکت اجتماعی** for user onboarding.
- Storyline strip: users view latest stories; link opens `/stories`.
- Dedicated story viewer supports swipe navigation, likes, and private replies.

## Community Participation Flow
1. **Idea & Media** – share prompt in `/community-path`.
2. **Form Submit** – simple form captures participant info.
3. **Explore Sync** – stories/posts stored in JSON via cPanel API.
4. **Dashboard** – admin manages accounts, promotes/demotes roles.

## Story Author Experience (Profile)
- Authenticated users upload stories (24h TTL).
- Tools: preview, edit, delete, tracking remaining time.
- Posts & follows remain side-by-side for a social feel.

## Remote Storage
- cPanel API (`remote-api/`) handles users, posts, stories, uploads.
- Env var `NEXT_PUBLIC_REVAYAT_API_BASE_URL` configures access.

## Next Steps
- Expand story replies into notifications.
- Automate cleanup & analytics for expiring stories.
- Connect Community Path form to cPanel API for submissions.
