-- Data walls. Row-level security is on for every table; the rules below are
-- the only way in for the browser-facing roles (anon, authenticated).
--
--   Public        live properties and their facts, media, public documents,
--                 active listings, the spec and industry catalogues.
--   Buyer         own profile, saved properties, fit results and bookings.
--   Client staff  everything belonging to their own client; may edit only
--                 listing price/availability/description and booking status.
--   LuxuryBoma    the Building Record for every client.

alter table public.clients enable row level security;
alter table public.staff_members enable row level security;
alter table public.properties enable row level security;
alter table public.spaces enable row level security;
alter table public.spec_definitions enable row level security;
alter table public.spec_values enable row level security;
alter table public.spec_value_history enable row level security;
alter table public.documents enable row level security;
alter table public.media enable row level security;
alter table public.listings enable row level security;
alter table public.industries enable row level security;
alter table public.industry_requirements enable row level security;
alter table public.buyer_profiles enable row level security;
alter table public.leads enable row level security;
alter table public.saved_properties enable row level security;
alter table public.fit_results enable row level security;
alter table public.bookings enable row level security;
alter table public.correction_requests enable row level security;
alter table public.events enable row level security;
alter table public.audit_log enable row level security;

-- ---------------------------------------------------------------------------
-- Table privileges (row-level security then narrows these row by row)
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema private to anon, authenticated, service_role;
grant execute on all functions in schema private to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant usage on all sequences in schema public to service_role;

grant select on
  public.properties, public.spaces, public.spec_definitions, public.spec_values,
  public.spec_value_history, public.documents, public.media, public.listings,
  public.industries, public.industry_requirements
to anon;

grant select on all tables in schema public to authenticated;
grant insert, update, delete on
  public.clients, public.staff_members, public.properties, public.spaces,
  public.spec_definitions, public.spec_values, public.documents, public.media,
  public.listings, public.industries, public.industry_requirements,
  public.buyer_profiles, public.saved_properties
to authenticated;
grant insert on public.fit_results, public.bookings, public.correction_requests to authenticated;
grant update on public.leads, public.bookings, public.correction_requests to authenticated;
-- No insert/update/delete for anyone on spec_value_history, events or audit_log:
-- triggers and the server (service key) write those.

revoke execute on function public.register_interest(uuid) from public, anon;
grant execute on function public.register_interest(uuid) to authenticated;
grant execute on function public.get_site_client(text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- clients, staff_members
-- ---------------------------------------------------------------------------
create policy clients_select on public.clients for select to authenticated
  using ((select private.is_lb_staff()) or private.is_client_staff(id));
create policy clients_insert on public.clients for insert to authenticated
  with check ((select private.is_lb_admin()));
create policy clients_update on public.clients for update to authenticated
  using ((select private.is_lb_admin())) with check ((select private.is_lb_admin()));
create policy clients_delete on public.clients for delete to authenticated
  using ((select private.is_lb_admin()));

create policy staff_select on public.staff_members for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_lb_admin()));
create policy staff_insert on public.staff_members for insert to authenticated
  with check ((select private.is_lb_admin()));
create policy staff_update on public.staff_members for update to authenticated
  using ((select private.is_lb_admin())) with check ((select private.is_lb_admin()));
create policy staff_delete on public.staff_members for delete to authenticated
  using ((select private.is_lb_admin()));

-- ---------------------------------------------------------------------------
-- The Building Record: public reads live rows, only LuxuryBoma writes
-- ---------------------------------------------------------------------------
create policy properties_select on public.properties for select to anon, authenticated
  using (status = 'live' or private.can_see_client(client_id));
create policy properties_insert on public.properties for insert to authenticated
  with check ((select private.is_lb_staff()));
create policy properties_update on public.properties for update to authenticated
  using ((select private.is_lb_staff())) with check ((select private.is_lb_staff()));
create policy properties_delete on public.properties for delete to authenticated
  using ((select private.is_lb_admin()));

create policy spaces_select on public.spaces for select to anon, authenticated
  using (private.property_is_live(property_id) or private.can_see_client(client_id));
create policy spaces_insert on public.spaces for insert to authenticated
  with check ((select private.is_lb_staff()));
create policy spaces_update on public.spaces for update to authenticated
  using ((select private.is_lb_staff())) with check ((select private.is_lb_staff()));
create policy spaces_delete on public.spaces for delete to authenticated
  using ((select private.is_lb_staff()));

create policy spec_values_select on public.spec_values for select to anon, authenticated
  using (private.property_is_live(property_id) or private.can_see_client(client_id));
create policy spec_values_insert on public.spec_values for insert to authenticated
  with check ((select private.is_lb_staff()));
create policy spec_values_update on public.spec_values for update to authenticated
  using ((select private.is_lb_staff())) with check ((select private.is_lb_staff()));
create policy spec_values_delete on public.spec_values for delete to authenticated
  using ((select private.is_lb_admin()));

-- Corrections are shown publicly, so history follows the same read rule.
create policy spec_value_history_select on public.spec_value_history for select to anon, authenticated
  using (private.property_is_live(property_id) or private.can_see_client(client_id));

create policy documents_select on public.documents for select to anon, authenticated
  using (
    private.can_see_client(client_id)
    or (
      private.property_is_live(property_id)
      and (
        visibility = 'public'
        or (visibility = 'signed_in' and (select auth.uid()) is not null)
      )
    )
  );
create policy documents_insert on public.documents for insert to authenticated
  with check ((select private.is_lb_staff()));
create policy documents_update on public.documents for update to authenticated
  using ((select private.is_lb_staff())) with check ((select private.is_lb_staff()));
create policy documents_delete on public.documents for delete to authenticated
  using ((select private.is_lb_staff()));

create policy media_select on public.media for select to anon, authenticated
  using (private.property_is_live(property_id) or private.can_see_client(client_id));
create policy media_insert on public.media for insert to authenticated
  with check ((select private.is_lb_staff()));
create policy media_update on public.media for update to authenticated
  using ((select private.is_lb_staff())) with check ((select private.is_lb_staff()));
create policy media_delete on public.media for delete to authenticated
  using ((select private.is_lb_staff()));

-- Shared catalogues: anyone reads, a LuxuryBoma admin writes.
create policy spec_definitions_select on public.spec_definitions for select to anon, authenticated
  using (true);
create policy spec_definitions_insert on public.spec_definitions for insert to authenticated
  with check ((select private.is_lb_admin()));
create policy spec_definitions_update on public.spec_definitions for update to authenticated
  using ((select private.is_lb_admin())) with check ((select private.is_lb_admin()));
create policy spec_definitions_delete on public.spec_definitions for delete to authenticated
  using ((select private.is_lb_admin()));

create policy industries_select on public.industries for select to anon, authenticated
  using (true);
create policy industries_insert on public.industries for insert to authenticated
  with check ((select private.is_lb_admin()));
create policy industries_update on public.industries for update to authenticated
  using ((select private.is_lb_admin())) with check ((select private.is_lb_admin()));
create policy industries_delete on public.industries for delete to authenticated
  using ((select private.is_lb_admin()));

create policy industry_requirements_select on public.industry_requirements for select to anon, authenticated
  using (true);
create policy industry_requirements_insert on public.industry_requirements for insert to authenticated
  with check ((select private.is_lb_admin()));
create policy industry_requirements_update on public.industry_requirements for update to authenticated
  using ((select private.is_lb_admin())) with check ((select private.is_lb_admin()));
create policy industry_requirements_delete on public.industry_requirements for delete to authenticated
  using ((select private.is_lb_admin()));

-- ---------------------------------------------------------------------------
-- Listings: the client's commercial data
-- ---------------------------------------------------------------------------
create policy listings_select on public.listings for select to anon, authenticated
  using (
    (status = 'active' and private.property_is_live(property_id))
    or private.can_see_client(client_id)
  );
create policy listings_insert on public.listings for insert to authenticated
  with check ((select private.is_lb_staff()));
-- Client staff may update their own listings; the guard_listing_edit trigger
-- limits them to price, availability and description.
create policy listings_update on public.listings for update to authenticated
  using (private.can_see_client(client_id)) with check (private.can_see_client(client_id));
create policy listings_delete on public.listings for delete to authenticated
  using ((select private.is_lb_staff()));

-- ---------------------------------------------------------------------------
-- Buyers, leads, saved properties, fit results, bookings
-- ---------------------------------------------------------------------------
create policy buyer_profiles_select on public.buyer_profiles for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.buyer_is_my_lead(user_id)
    or (select private.is_lb_admin())
  );
create policy buyer_profiles_insert on public.buyer_profiles for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy buyer_profiles_update on public.buyer_profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy buyer_profiles_delete on public.buyer_profiles for delete to authenticated
  using (user_id = (select auth.uid()));

-- Leads hold the sales team's stage and notes: buyers never read them.
create policy leads_select on public.leads for select to authenticated
  using (private.is_client_staff(client_id) or (select private.is_lb_admin()));
create policy leads_update on public.leads for update to authenticated
  using (private.is_client_staff(client_id)) with check (private.is_client_staff(client_id));

create policy saved_properties_select on public.saved_properties for select to authenticated
  using (buyer_id = (select auth.uid()) or private.can_see_client(client_id));
create policy saved_properties_insert on public.saved_properties for insert to authenticated
  with check (buyer_id = (select auth.uid()) and private.property_is_live(property_id));
create policy saved_properties_delete on public.saved_properties for delete to authenticated
  using (buyer_id = (select auth.uid()));

create policy fit_results_select on public.fit_results for select to authenticated
  using (buyer_id = (select auth.uid()) or private.can_see_client(client_id));
create policy fit_results_insert on public.fit_results for insert to authenticated
  with check (buyer_id = (select auth.uid()) and private.property_is_live(property_id));

create policy bookings_select on public.bookings for select to authenticated
  using (buyer_id = (select auth.uid()) or private.can_see_client(client_id));
create policy bookings_insert on public.bookings for insert to authenticated
  with check (
    buyer_id = (select auth.uid())
    and status = 'requested'
    and staff_notes is null
    and confirmed_for is null
    and private.property_is_live(property_id)
  );
create policy bookings_update on public.bookings for update to authenticated
  using (private.is_client_staff(client_id) or (select private.is_lb_admin()))
  with check (private.is_client_staff(client_id) or (select private.is_lb_admin()));

-- ---------------------------------------------------------------------------
-- Correction requests, events, audit log
-- ---------------------------------------------------------------------------
create policy correction_requests_select on public.correction_requests for select to authenticated
  using (private.can_see_client(client_id));
create policy correction_requests_insert on public.correction_requests for insert to authenticated
  with check (
    private.is_client_staff(client_id)
    and requested_by = (select auth.uid())
    and status = 'open'
    and resolved_by is null
  );
create policy correction_requests_update on public.correction_requests for update to authenticated
  using ((select private.is_lb_staff())) with check ((select private.is_lb_staff()));

create policy events_select on public.events for select to authenticated
  using (private.can_see_client(client_id));

create policy audit_log_select on public.audit_log for select to authenticated
  using ((select private.is_lb_admin()) or private.is_client_staff(client_id));
