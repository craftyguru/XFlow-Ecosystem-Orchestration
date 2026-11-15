-- Harden durable Crevux video segment state without granting execution or customer access.

alter table crevux.studio_video_segments force row level security;

create or replace function crevux.enforce_studio_video_segment_scope()
returns trigger language plpgsql security invoker
set search_path=pg_catalog,crevux as $$
declare job crevux.generation_jobs%rowtype;
begin
  select * into job from crevux.generation_jobs where id=new.generation_job_id;
  if not found or job.workspace_id<>new.workspace_id or job.created_by<>new.actor_user_id or
     job.request->>'kind'<>'image_video' then
    raise exception 'STUDIO_VIDEO_SEGMENT_SCOPE_MISMATCH';
  end if;

  if new.input_asset_id is not null and not exists (
    select 1 from crevux.assets asset
    where asset.id=new.input_asset_id
      and asset.workspace_id=new.workspace_id
      and asset.created_by=new.actor_user_id
      and asset.deleted_at is null
      and exists (
        select 1
        from jsonb_array_elements(coalesce(job.request->'sources', '[]'::jsonb)) source
        where source->>'assetId'=new.input_asset_id::text
      )
  ) then
    raise exception 'STUDIO_VIDEO_SEGMENT_SOURCE_MISMATCH';
  end if;
  return new;
end $$;

drop trigger if exists studio_video_segments_scope_guard on crevux.studio_video_segments;
create trigger studio_video_segments_scope_guard
before insert or update of generation_job_id,workspace_id,actor_user_id,input_asset_id
on crevux.studio_video_segments for each row
execute function crevux.enforce_studio_video_segment_scope();

revoke all on crevux.studio_video_segments from anon, authenticated;
