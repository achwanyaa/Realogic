-- SAMPLE DATA FOR LOCAL DEVELOPMENT ONLY. Never run this against production.
-- `supabase db reset` loads it into the local database after the migrations.
-- Godown A1's figures and the industry thresholds are the prototype's sample
-- values, not verified facts.

insert into public.clients
  (id, slug, name, legal_name, domain, phone, whatsapp, email, postal_address, licence_status)
values (
  '00000000-0000-4000-8000-000000000001', 'realogic', 'Realogic Properties',
  'Realogic Properties Limited', 'realogic.localhost', '+254 725 073 496', '254725073496',
  'realogicacc@gmail.com', 'P.O. Box 249-00100, Nairobi, Kenya', 'active'
);

insert into public.industries (key, name, description, sort_order) values
  ('logistics',     'Logistics and warehousing', 'Storage and onward delivery, lots of truck movements', 10),
  ('fmcg',          'FMCG distribution',         'Fast-moving goods, high racking, many daily dispatches', 20),
  ('manufacturing', 'Light manufacturing',       'Machinery, workshops and assembly lines', 30),
  ('pharma',        'Pharmaceuticals',           'Medicines storage with controlled temperature', 40);

insert into public.industry_requirements
  (industry_key, spec_key, need_text, rule, threshold, fixable, fix_note, sort_order)
values
  ('logistics', 'floor_area',    'Floor area of 1,000 m² or more', 'minimum', 1000, false, null, 10),
  ('logistics', 'clear_height',  'Clear height of 8 m or more',    'minimum', 8,    false, null, 20),
  ('logistics', 'power_supply',  'Power of 100 kVA or more',       'minimum', 100,  true,  'Realogic can arrange a power upgrade. Ask for a quote.', 30),
  ('logistics', 'loading_doors', 'At least 2 loading doors',       'minimum', 2,    true,  'Realogic can add a loading door. Ask for a quote.', 40),
  ('logistics', 'truck_turning', 'Room for a 40 ft truck to turn', 'must_have', null, false, null, 50),
  ('fmcg', 'floor_area',    'Floor area of 1,500 m² or more', 'minimum', 1500, false, null, 10),
  ('fmcg', 'clear_height',  'Clear height of 8 m or more',    'minimum', 8,    false, null, 20),
  ('fmcg', 'floor_load',    'Floor load of 25 kN/m² or more', 'minimum', 25,   false, null, 30),
  ('fmcg', 'power_supply',  'Power of 150 kVA or more',       'minimum', 150,  true,  'Realogic can arrange a power upgrade. Ask for a quote.', 40),
  ('fmcg', 'loading_doors', 'At least 3 loading doors',       'minimum', 3,    true,  'Realogic can add a loading door. Ask for a quote.', 50),
  ('manufacturing', 'floor_area',    'Floor area of 800 m² or more',   'minimum', 800, false, null, 10),
  ('manufacturing', 'clear_height',  'Clear height of 6 m or more',    'minimum', 6,   false, null, 20),
  ('manufacturing', 'floor_load',    'Floor load of 30 kN/m² or more', 'minimum', 30,  false, null, 30),
  ('manufacturing', 'power_supply',  'Power of 150 kVA or more',       'minimum', 150, true,  'Realogic can arrange a power upgrade. Ask for a quote.', 40),
  ('manufacturing', 'loading_doors', 'At least 1 loading door',        'minimum', 1,   true,  'Realogic can add a loading door. Ask for a quote.', 50),
  ('pharma', 'floor_area',          'Floor area of 800 m² or more',   'minimum', 800, false, null, 10),
  ('pharma', 'temperature_control', 'Temperature-controlled storage', 'must_have', null, false, 'There is no cooling plant. Converting this godown would be a major fit-out.', 20),
  ('pharma', 'power_supply',        'Power of 200 kVA or more',       'minimum', 200, true,  'Realogic can arrange a power upgrade. Ask for a quote.', 30),
  ('pharma', 'clear_height',        'Clear height of 6 m or more',    'minimum', 6,   false, null, 40);

insert into public.properties
  (id, client_id, reference, slug, name, address, area_label, near, designed_by, developed_by,
   status, site_visited_on)
values (
  '00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-000000000001',
  'SAMPLE-A1', 'godown-a1', 'Godown A1', 'Mombasa Road, Nairobi', 'Mombasa Road, Nairobi',
  'near Syokimau', 'Sketch3D Ltd', 'Realogic Properties Limited', 'live', date '2026-10-21'
);

insert into public.listings
  (client_id, property_id, deal, price_on_request, available_from, availability_note, description, status)
values (
  '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'lease', true,
  date '2027-01-01', 'Available Jan 2027',
  'A warehouse with a mezzanine office, two loading doors and a yard. Suits storage, distribution and light manufacturing. Needs fit-out for temperature-controlled storage.',
  'active'
);

insert into public.spec_values
  (client_id, property_id, spec_key, value_number, value_boolean, value_text, display_value, unit, label, method, source, checked_on)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'plinth_area', 2140, null, null, '2,140 m²', 'm²', 'from_drawings', null, 'Drawing A-101 rev C, Sketch3D Ltd (developer''s architect)', date '2026-10-22'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'floor_area', 1850, null, null, '1,850 m²', 'm²', 'measured', 'Laser measure, 14 points', 'LuxuryBoma', date '2026-10-21'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'mezzanine_area', 220, null, null, '220 m²', 'm²', 'from_drawings', null, 'Drawing A-101 rev C, Sketch3D Ltd (developer''s architect)', date '2026-10-22'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'clear_height', 9.5, null, null, '9.5 m', 'm', 'measured', 'Laser measure, lowest of 6 bays', 'LuxuryBoma', date '2026-10-21'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'floor_load', 30, null, null, '30 kN/m²', 'kN/m²', 'from_drawings', null, 'Slab design note S-201 rev A, structural engineer for Sketch3D Ltd', date '2026-10-22'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'mezzanine_load', null, null, null, 'Not yet checked', 'kN/m²', 'not_yet_checked', null, 'Waiting for the structural engineer''s note.', null),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'loading_doors', 2, null, null, '2 doors', 'doors', 'measured', 'Tape measure. Each 4.5 × 5 m.', 'LuxuryBoma', date '2026-10-21'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'yard_area', 900, null, null, '900 m²', 'm²', 'from_drawings', null, 'Drawing A-101 rev C, Sketch3D Ltd (developer''s architect)', date '2026-10-22'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'truck_turning', null, true, null, 'Fits a 40 ft truck', null, 'indicative', 'Estimated from the yard layout on A-101. Not yet tested with a truck.', null, null),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'gate_width', 7, null, null, '7.0 m', 'm', 'measured', 'Tape measure', 'LuxuryBoma', date '2026-10-21'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'power_supply', 200, null, null, '200 kVA', 'kVA', 'declared', null, 'Stated by Realogic by email. Not yet checked.', date '2026-10-18'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'water_storage', 50000, null, null, '50,000 litres', 'litres', 'declared', null, 'Stated by Realogic by email. Not yet checked.', date '2026-10-18'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'temperature_control', null, false, null, 'None', null, 'measured', 'No cooling plant on site', 'LuxuryBoma', date '2026-10-21'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000a1', 'nema_licence', null, null, null, 'No record found', null, 'not_found', 'NEMA public register searched', 'A missing record does not mean all is clear.', date '2026-10-24');
