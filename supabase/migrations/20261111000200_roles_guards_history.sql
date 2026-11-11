-- Role helpers, independence-rule guards, fact history and the audit log.
-- Helpers live in the "private" schema, which the API does not expose.

-- ---------------------------------------------------------------------------
-- Who is asking?
-- ---------------------------------------------------------------------------
-- Staff must be signed in with two-factor (aal2). A staff account signed in
-- with a password alone is treated as an ordinary visitor.
create function private.staff_session_ok() returns boolean
language sql stable
set search_path = ''
as $$
  select coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2';
$$;

create function private.lb_role() returns public.staff_role
language sql stable security definer
set search_path = ''
as $$
  select s.role
  from public.staff_members s
  where s.user_id = (select auth.uid())
    and s.client_id is null
    and s.active
    and private.staff_session_ok()
  limit 1;
$$;

create function private.is_lb_staff() returns boolean
language sql stable
set search_path = ''
as $$ select private.lb_role() is not null; $$;

create function private.is_lb_admin() returns boolean
language sql stable
set search_path = ''
as $$ select coalesce(private.lb_role() = 'lb_admin', false); $$;

create function private.can_publish() returns boolean
language sql stable
set search_path = ''
as $$ select coalesce(private.lb_role() in ('lb_admin', 'lb_reviewer'), false); $$;

create function private.is_client_staff(p_client_id uuid) returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_members s
    where s.user_id = (select auth.uid())
      and s.client_id = p_client_id
      and s.role = 'client_staff'
      and s.active
  ) and private.staff_session_ok();
$$;

-- LuxuryBoma staff see every client; client staff see their own client only.
create function private.can_see_client(p_client_id uuid) returns boolean
language sql stable
set search_path = ''
as $$ select private.is_lb_staff() or private.is_client_staff(p_client_id); $$;

create function private.property_is_live(p_property_id uuid) returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.properties p where p.id = p_property_id and p.status = 'live'
  );
$$;

-- True when the buyer is a lead of a client the caller works for.
create function private.buyer_is_my_lead(p_buyer_id uuid) returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.leads l
    join public.staff_members s on s.client_id = l.client_id
    where l.buyer_id = p_buyer_id
      and s.user_id = (select auth.uid())
      and s.role = 'client_staff'
      and s.active
  ) and private.staff_session_ok();
$$;

-- ---------------------------------------------------------------------------
-- Housekeeping triggers
-- ---------------------------------------------------------------------------
create function private.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger touch_updated_at before update on public.clients
  for each row execute function private.touch_updated_at();
create trigger touch_updated_at before update on public.properties
  for each row execute function private.touch_updated_at();
create trigger touch_updated_at before update on public.spec_values
  for each row execute function private.touch_updated_at();
create trigger touch_updated_at before update on public.listings
  for each row execute function private.touch_updated_at();
create trigger touch_updated_at before update on public.buyer_profiles
  for each row execute function private.touch_updated_at();
create trigger touch_updated_at before update on public.leads
  for each row execute function private.touch_updated_at();
create trigger touch_updated_at before update on public.bookings
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Independence rules
-- ---------------------------------------------------------------------------
-- 1. Facts keep their history. Any change or removal of a fact stores the
--    previous version first; nobody can edit or delete history rows.
create function private.record_spec_value_history() returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.spec_value_history
    (client_id, property_id, spec_value_id, spec_key, operation, old_row, changed_by)
  values
    (old.client_id, old.property_id, old.id, old.spec_key, tg_op, to_jsonb(old), (select auth.uid()));
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger keep_history_on_update before update on public.spec_values
  for each row when (old.* is distinct from new.*)
  execute function private.record_spec_value_history();
create trigger keep_history_on_delete before delete on public.spec_values
  for each row execute function private.record_spec_value_history();

-- 2. Only a reviewer or admin publishes. An editor cannot put a property live.
--    Calls with no signed-in user (migrations, the service key on the server)
--    are trusted back-office calls and pass.
create function private.guard_property_publish() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'live' and (tg_op = 'INSERT' or old.status is distinct from 'live') then
    if (select auth.uid()) is not null and not private.can_publish() then
      raise exception 'Only a LuxuryBoma reviewer or admin can publish a property'
        using errcode = '42501';
    end if;
    new.published_at := coalesce(new.published_at, now());
  end if;
  if tg_op = 'UPDATE' and new.client_id is distinct from old.client_id then
    raise exception 'A property cannot be moved to another client' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger guard_property_publish before insert or update on public.properties
  for each row execute function private.guard_property_publish();

-- 3. Client staff edit only price, availability and description on a listing.
create function private.guard_listing_edit() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or private.is_lb_staff() then
    return new;
  end if;
  if new.id is distinct from old.id
     or new.client_id is distinct from old.client_id
     or new.property_id is distinct from old.property_id
     or new.deal is distinct from old.deal
     or new.status is distinct from old.status
     or new.created_at is distinct from old.created_at then
    raise exception 'Client staff can change only price, availability and description'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger guard_listing_edit before update on public.listings
  for each row execute function private.guard_listing_edit();

-- 4. On a booking, client staff change only status, notes and the confirmed time.
create function private.guard_booking_edit() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return new;
  end if;
  if new.id is distinct from old.id
     or new.client_id is distinct from old.client_id
     or new.property_id is distinct from old.property_id
     or new.buyer_id is distinct from old.buyer_id
     or new.preferred_day is distinct from old.preferred_day
     or new.preferred_time is distinct from old.preferred_time
     or new.attendees is distinct from old.attendees
     or new.purpose is distinct from old.purpose
     or new.questions is distinct from old.questions
     or new.created_at is distinct from old.created_at then
    raise exception 'Only status, notes and the confirmed time of a booking can change'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger guard_booking_edit before update on public.bookings
  for each row execute function private.guard_booking_edit();

-- ---------------------------------------------------------------------------
-- Audit log: who changed which row, and when
-- ---------------------------------------------------------------------------
create function private.audit() returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  v_old jsonb;
  v_new jsonb;
  v_row jsonb;
  v_client uuid;
begin
  if tg_op <> 'INSERT' then v_old := to_jsonb(old); end if;
  if tg_op <> 'DELETE' then v_new := to_jsonb(new); end if;
  v_row := coalesce(v_new, v_old);
  if tg_table_name = 'clients' then
    v_client := (v_row ->> 'id')::uuid;
  else
    v_client := nullif(v_row ->> 'client_id', '')::uuid;
  end if;
  insert into public.audit_log (client_id, actor, table_name, row_id, action, old_row, new_row)
  values (
    v_client, (select auth.uid()), tg_table_name,
    coalesce(v_row ->> 'id', v_row ->> 'key'), tg_op, v_old, v_new
  );
  return null;
end;
$$;

create trigger audit after insert or update or delete on public.clients
  for each row execute function private.audit();
create trigger audit after insert or update or delete on public.staff_members
  for each row execute function private.audit();
create trigger audit after insert or update or delete on public.properties
  for each row execute function private.audit();
create trigger audit after insert or update or delete on public.spaces
  for each row execute function private.audit();
create trigger audit after insert or update or delete on public.spec_definitions
  for each row execute function private.audit();
create trigger audit after insert or update or delete on public.spec_values
  for each row execute function private.audit();
create trigger audit after insert or update or delete on public.documents
  for each row execute function private.audit();
create trigger audit after insert or update or delete on public.media
  for each row execute function private.audit();
create trigger audit after insert or update or delete on public.listings
  for each row execute function private.audit();
create trigger audit after insert or update or delete on public.industries
  for each row execute function private.audit();
create trigger audit after insert or update or delete on public.industry_requirements
  for each row execute function private.audit();
create trigger audit after insert or update or delete on public.leads
  for each row execute function private.audit();
create trigger audit after insert or update or delete on public.bookings
  for each row execute function private.audit();
create trigger audit after insert or update or delete on public.correction_requests
  for each row execute function private.audit();

-- ---------------------------------------------------------------------------
-- Public functions the portals call
-- ---------------------------------------------------------------------------
-- Branding and contact details for a portal, by domain or slug. Leaves out
-- briefing recipients and licence details, which only staff may see.
create function public.get_site_client(p_domain text default null, p_slug text default null)
returns table (
  id uuid, slug text, name text, legal_name text, domain text, logo_path text,
  phone text, whatsapp text, email text, postal_address text
)
language sql stable security definer
set search_path = ''
as $$
  select c.id, c.slug, c.name, c.legal_name, c.domain, c.logo_path,
         c.phone, c.whatsapp, c.email, c.postal_address
  from public.clients c
  where c.licence_status = 'active'
    and ((p_domain is not null and c.domain = lower(p_domain))
      or (p_slug is not null and c.slug = p_slug))
  limit 1;
$$;

-- Called once a buyer has signed up (and consented) on a client's portal.
create function public.register_interest(p_client_id uuid) returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in first' using errcode = '42501';
  end if;
  insert into public.leads (client_id, buyer_id)
  values (p_client_id, (select auth.uid()))
  on conflict (client_id, buyer_id) do nothing;
end;
$$;
