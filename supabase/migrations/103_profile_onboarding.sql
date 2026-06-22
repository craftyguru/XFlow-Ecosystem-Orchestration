-- Shared profile onboarding state for XFlow-owned ecosystem onboarding.

alter table core.profiles
  add column if not exists onboarding_completed boolean,
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists preferred_start_app text,
  add column if not exists onboarding_source_app text;

update core.profiles
set
  onboarding_completed = true,
  onboarding_completed_at = coalesce(onboarding_completed_at, updated_at, created_at, now())
where onboarding_completed is null;

alter table core.profiles
  alter column onboarding_completed set default false,
  alter column onboarding_completed set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_preferred_start_app_check'
      and conrelid = 'core.profiles'::regclass
  ) then
    alter table core.profiles
      add constraint profiles_preferred_start_app_check
      check (
        preferred_start_app is null
        or preferred_start_app in ('xflow', 'verixet', 'rataify', 'audaix', 'wordgeni', 'crevux')
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_onboarding_source_app_check'
      and conrelid = 'core.profiles'::regclass
  ) then
    alter table core.profiles
      add constraint profiles_onboarding_source_app_check
      check (
        onboarding_source_app is null
        or onboarding_source_app in ('xflow', 'verixet', 'rataify', 'audaix', 'wordgeni', 'crevux')
      );
  end if;
end $$;
