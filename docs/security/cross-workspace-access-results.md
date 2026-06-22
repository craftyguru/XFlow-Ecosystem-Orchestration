# Cross Workspace Access Results

Date: 2026-05-10

## Summary

Executed safe unauthenticated and forged-header probes with mismatched workspace IDs against workspace, entitlement, support, assistant, billing, and admin-style routes.

## Live Probe Results

| Class | Result |
| --- | --- |
| Forged `x-workspace-id` against admin/support/assistant routes | Denied, not found, validation denied, or redirected. |
| Forged body `workspaceId` and `targetWorkspaceId` values | No successful mutation observed. |
| Workspace app access mutation probe | Denied or not found. |
| Entitlement evaluation with mismatched workspace claims and no valid bearer | Denied or not found. |

## Existing Proof Results

- Root production entitlement proof includes a wrong-workspace denial scenario.
- XFlow `verify:ci` includes workspace RBAC bounding tests for members, invitations, auth policy, commerce workspace bounding, and app operator step-up actions.
- AudAiX and CreVux typechecks passed after fallback hardening.

## Remaining Risk

No authenticated cross-workspace browser/API persona was available for this pass. Add staging fixtures for workspace A user, workspace B user, workspace admin, and cross-workspace object IDs, then rerun this as authenticated negative testing.
