# Forum Entitlements and Monetization

Rank is earned. Paid tiers never grant XP, rank numbers, fake badges, fake helpful votes, or authority.

## Tier Matrix

| Tier | Threads/day | Replies/day | Bookmarks | Saved searches | AI helpers/day | Key perks |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Free | 2 | 10 | 10 | 0 | 2 | Public read, basic posting, basic search, basic profile |
| Starter | 5 | 30 | 50 | 5 | 10 | Saved searches, more usage, showcase eligibility |
| Pro | 15 | 100 | 200 | 25 | 50 | Advanced filters, premium themes, animated effects |
| Business | 50 | 300 | 500 | 100 | 150 | Premium categories and team support areas |
| Enterprise | Configurable/unlimited | Configurable/unlimited | Unlimited | Unlimited | Unlimited | High-limit community support |

The implementation reads the existing XFlow ecosystem entitlement/billing state when available and falls back to Free.

## Enforcement Points

Server-side checks exist for:

- thread creation
- reply creation
- bookmark creation
- saved search creation
- AI title/tag suggestions
- AI question formatter
- AI thread summaries
- advanced search filters
- premium category access
- premium profile customization
- showcase post creation

Client-side UI only improves clarity. It is not the authority.

## Rank vs Paid Tier

Rank remains based on forum contribution XP only. Paid tiers can unlock usage, profile presentation, saved content, premium categories, and AI/search tools. They cannot directly modify `forum_user_stats.xp`, `rank`, badges, helpful votes, or accepted solutions.

## Upgrade Prompts

Upgrade prompts appear when a user reaches a limit or tries a locked paid feature. Copy should explain the concrete benefit, such as higher posting limits or advanced filters, without implying bought authority.

## QA Checklist

- Free user hits thread/reply limit and receives a clear 403.
- Paid user receives higher limits.
- AI helper limit blocks server-side.
- Premium profile theme is denied for Free and allowed for paid/earned unlocks.
- Bookmark and saved-search limits block server-side.
- Premium category cards show locked state and no private thread content leaks.
- `/community`, `/community/new`, `/community/search`, `/community/profile/[userId]`, and `/admin/forum` render.
- Workspace admins still do not become global forum moderators.
