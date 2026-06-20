-- Broaden the marketplace from PC-only to all tech gear
-- (phones, tablets, cameras, audio, consoles, wearables, TVs, drones, smart home).
-- Safe to re-run: conflicts on the unique slug/name are ignored.

INSERT INTO categories (name, slug, icon, description) VALUES
  ('Phones',          'phones',       'Smartphone', 'Smartphones and mobile devices'),
  ('Tablets',         'tablets',      'Tablet',     'Tablets and e-readers'),
  ('Cameras',         'cameras',      'Camera',     'Cameras, lenses and gear'),
  ('Audio',           'audio',        'Headphones', 'Headphones, earbuds and speakers'),
  ('Gaming Consoles', 'consoles',     'Gamepad2',   'Consoles, controllers and games'),
  ('Wearables',       'wearables',    'Watch',      'Smartwatches and fitness bands'),
  ('TVs',             'tvs',          'Tv',         'Televisions and streaming devices'),
  ('Drones',          'drones',       'Plane',      'Drones and accessories'),
  ('Smart Home',      'smart-home',   'House',      'Smart home and IoT devices')
ON CONFLICT (slug) DO NOTHING;

-- Make the "Other" bucket clearer as a general tech catch-all.
UPDATE categories
SET description = 'Any other tech gear and gadgets'
WHERE slug = 'other';
