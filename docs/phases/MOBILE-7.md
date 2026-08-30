# MOBILE-7 — Gallery export and workspace synchronization

- Status: PLANNED
- Owning repository: Crevux
- Dependency: MOBILE-6 PASS

## Objective and product contract

Provide checksum-verified MediaStore export, explicit public/private boundary disclosure, workspace synchronization, conflict-safe drafts, and shareable project-link handling.

## In scope / out of scope

In scope: signed-link renewal, download integrity, filenames/MIME/EXIF policy, MediaStore pending writes, offline reconciliation, deletion/conflict states, and authorized project links. Out of scope: embroidery and public-by-default workspace assets.

## Acceptance and automated verification

Expired URL, corrupt download, collision, insufficient space, interrupted export, deleted project, cross-user link, offline conflict, and MediaStore instrumentation tests pass.

## Manual proof

Export appears in Samsung Gallery, reopens correctly, and can be shared without exposing private originals or signed workspace URLs.

## Risks, rollback, dependencies

Accidental disclosure is the primary risk. Disable export/link actions while retaining private synchronized projects. Store-quality v1 requires owner release approval after this phase.
