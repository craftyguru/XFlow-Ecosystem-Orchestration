# Crevux Android mobile phases

The MOBILE namespace delivers the approved shared Android foundation and separately shipped Crevux application. Each implementation phase uses one owner and an isolated worktree in the repository that owns the change.

| Phase | Title | Status | Dependency |
| --- | --- | --- | --- |
| [MOBILE-0](MOBILE-0.md) | Architecture and contracts | PASS/CLOSED | None |
| [MOBILE-1](MOBILE-1.md) | XFlow Android authentication proof | PLANNED | MOBILE-0 PASS |
| [MOBILE-2](MOBILE-2.md) | Android shell and secure intake | PLANNED | MOBILE-1 PASS |
| [MOBILE-3](MOBILE-3.md) | Project, upload, and job API hardening | PLANNED | MOBILE-1 PASS; MOBILE-2 import contract stable |
| [MOBILE-4](MOBILE-4.md) | Generation, variants, progress, and notifications | PLANNED | MOBILE-3 PASS |
| [MOBILE-5](MOBILE-5.md) | Masks, iterative editing, and history | PLANNED | MOBILE-4 PASS |
| [MOBILE-6](MOBILE-6.md) | Foldable professional UX and accessibility | PLANNED | MOBILE-5 PASS |
| [MOBILE-7](MOBILE-7.md) | Gallery export and workspace synchronization | PLANNED | MOBILE-6 PASS |
| [MOBILE-8](MOBILE-8.md) | Embroidery preparation | PLANNED | MOBILE-7 PASS and format decision |
| [MOBILE-9](MOBILE-9.md) | Security, privacy, performance, and release closeout | PLANNED | Approved release scope integrated |

Private beta is targeted after MOBILE-4. Store-quality v1 is targeted after MOBILE-7. MOBILE-8 is not part of the first store release unless the owner changes the release boundary explicitly.

No later phase may start from another phase's unintegrated worktree. It must start from an approved integration baseline containing all required dependencies.
