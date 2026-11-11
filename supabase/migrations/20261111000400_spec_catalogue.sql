-- The first spec catalogue for godowns: the facts shown in the prototype dossier.
-- "required_to_publish" starts from the architect's five (clear height, slab
-- load, yard turning, mezzanine capacity, incoming power); still an open decision.

insert into public.spec_definitions
  (key, name, spec_group, value_type, unit, required_to_publish, in_headline, headline_label, sort_order)
values
  ('plinth_area',         'Plinth area',              'structure', 'number',  'm²',     false, false, null,            10),
  ('floor_area',          'Warehouse floor area',     'structure', 'number',  'm²',     false, true,  'Floor area',    20),
  ('mezzanine_area',      'Mezzanine office',         'structure', 'number',  'm²',     false, false, null,            30),
  ('clear_height',        'Clear height under truss', 'structure', 'number',  'm',      true,  true,  'Clear height',  40),
  ('floor_load',          'Floor load',               'structure', 'number',  'kN/m²',  true,  true,  'Floor load',    50),
  ('mezzanine_load',      'Mezzanine load',           'structure', 'number',  'kN/m²',  true,  false, null,            60),
  ('loading_doors',       'Loading doors',            'access',    'number',  'doors',  false, true,  'Loading doors', 70),
  ('yard_area',           'Yard area',                'access',    'number',  'm²',     false, true,  'Yard area',     80),
  ('truck_turning',       'Truck turning',            'access',    'boolean', null,     true,  false, null,            90),
  ('gate_width',          'Gate width',               'access',    'number',  'm',      false, false, null,           100),
  ('power_supply',        'Power supply',             'power',     'number',  'kVA',    true,  true,  'Power supply', 110),
  ('water_storage',       'Water storage',            'power',     'number',  'litres', false, false, null,           120),
  ('temperature_control', 'Temperature control',      'power',     'boolean', null,     false, false, null,           130),
  ('nema_licence',        'NEMA licence',             'legal',     'text',    null,     false, false, null,           140);
