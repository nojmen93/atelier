-- Seed Colour Library: 5 colours per family
-- Colour codes: auto FAM-NNN format
-- GS1 codes: 3-digit per GS1 US (formerly NRF) Standard Color Code ranges
--   Black 000-019, Grey 020-049, White 050-099
--   Brown 100-149, Beige 150-199
--   Green 300-399, Navy 400-424, Blue 425-499
--   Purple 500-599, Red 600-699, Pink 700-799
--   Yellow 800-849, Orange 850-899, Other 900-999

INSERT INTO colours (colour_name, colour_code, colour_family_code, hex_value, g1_code) VALUES
-- Black (GS1: 001-005)
('Obsidian',        'BLK-001', 'BLK', '#0B0B0B', '001'),
('Volcanic Ash',    'BLK-002', 'BLK', '#1C1C1C', '002'),
('Onyx Night',      'BLK-003', 'BLK', '#111111', '003'),
('Eclipse',         'BLK-004', 'BLK', '#252525', '004'),
('Carbon Dust',     'BLK-005', 'BLK', '#2E2E2E', '005'),

-- Grey (GS1: 021-025)
('Storm Cloud',     'GRY-001', 'GRY', '#6B6B6B', '021'),
('Lunar Mist',      'GRY-002', 'GRY', '#9A9A9A', '022'),
('Granite Peak',    'GRY-003', 'GRY', '#555555', '023'),
('Driftwood Ash',   'GRY-004', 'GRY', '#8A8580', '024'),
('Silver Sage',     'GRY-005', 'GRY', '#B0B5AD', '025'),

-- White (GS1: 051-055)
('Arctic Frost',    'WHT-001', 'WHT', '#FAFAFA', '051'),
('Cloud Drift',     'WHT-002', 'WHT', '#F5F0EB', '052'),
('Pearl Moon',      'WHT-003', 'WHT', '#F0EDE8', '053'),
('Snow Blossom',    'WHT-004', 'WHT', '#FFFDF7', '054'),
('Glacier White',   'WHT-005', 'WHT', '#F2F2F0', '055'),

-- Brown (GS1: 101-105)
('Walnut Earth',    'BRN-001', 'BRN', '#5C3D2E', '101'),
('Cedar Bark',      'BRN-002', 'BRN', '#6D4C3D', '102'),
('Autumn Oak',      'BRN-003', 'BRN', '#7A5C46', '103'),
('Cinnamon Dust',   'BRN-004', 'BRN', '#8B6B50', '104'),
('Cocoa Bean',      'BRN-005', 'BRN', '#3E2A1E', '105'),

-- Beige (GS1: 151-155)
('Sandstone',       'BGE-001', 'BGE', '#C8B99A', '151'),
('Desert Linen',    'BGE-002', 'BGE', '#D4C5A9', '152'),
('Oat Milk',        'BGE-003', 'BGE', '#E0D5BF', '153'),
('Dune Whisper',    'BGE-004', 'BGE', '#BFB095', '154'),
('Birch Wood',      'BGE-005', 'BGE', '#D1C2A8', '155'),

-- Green (GS1: 301-305)
('Forest Canopy',   'GRN-001', 'GRN', '#2D5A3D', '301'),
('Moss Garden',     'GRN-002', 'GRN', '#5B7553', '302'),
('Evergreen Mist',  'GRN-003', 'GRN', '#3E6B54', '303'),
('Juniper Dew',     'GRN-004', 'GRN', '#6B8F71', '304'),
('Olive Grove',     'GRN-005', 'GRN', '#5C6B4E', '305'),

-- Navy (GS1: 401-405)
('Midnight Cosmos', 'NVY-001', 'NVY', '#1B1F3B', '401'),
('Deep Atlantic',   'NVY-002', 'NVY', '#1C2541', '402'),
('Starless Sea',    'NVY-003', 'NVY', '#0F1A2E', '403'),
('Twilight Indigo', 'NVY-004', 'NVY', '#2B3A67', '404'),
('Nordic Night',    'NVY-005', 'NVY', '#232D4B', '405'),

-- Blue (GS1: 426-430)
('Pacific Horizon', 'BLU-001', 'BLU', '#4A90D9', '426'),
('Cerulean Sky',    'BLU-002', 'BLU', '#5BA4E6', '427'),
('Glacial Blue',    'BLU-003', 'BLU', '#A8C8E8', '428'),
('Cobalt Reef',     'BLU-004', 'BLU', '#2D5DA1', '429'),
('Winter Fjord',    'BLU-005', 'BLU', '#6E9ECF', '430'),

-- Purple (GS1: 501-505)
('Nebula Plum',     'PUR-001', 'PUR', '#5B3D6B', '501'),
('Wisteria Dream',  'PUR-002', 'PUR', '#7B5E8A', '502'),
('Amethyst Dusk',   'PUR-003', 'PUR', '#6A4C7D', '503'),
('Violet Aurora',   'PUR-004', 'PUR', '#8B6A9E', '504'),
('Plum Nebula',     'PUR-005', 'PUR', '#4E2F5E', '505'),

-- Red (GS1: 601-605)
('Ember Glow',      'RED-001', 'RED', '#C43B3B', '601'),
('Crimson Dusk',    'RED-002', 'RED', '#9B2335', '602'),
('Volcanic Red',    'RED-003', 'RED', '#A82020', '603'),
('Desert Rose',     'RED-004', 'RED', '#C4616C', '604'),
('Autumn Maple',    'RED-005', 'RED', '#B5413E', '605'),

-- Pink (GS1: 701-705)
('Peony Blush',     'PNK-001', 'PNK', '#D4889A', '701'),
('Cherry Blossom',  'PNK-002', 'PNK', '#E8A0B0', '702'),
('Rose Quartz',     'PNK-003', 'PNK', '#C7758D', '703'),
('Lotus Petal',     'PNK-004', 'PNK', '#E0B4C0', '704'),
('Orchid Haze',     'PNK-005', 'PNK', '#B8687B', '705'),

-- Yellow (GS1: 801-805)
('Golden Hour',     'YEL-001', 'YEL', '#D4A843', '801'),
('Sunlit Meadow',   'YEL-002', 'YEL', '#E8C655', '802'),
('Harvest Moon',    'YEL-003', 'YEL', '#C9A94E', '803'),
('Amber Resin',     'YEL-004', 'YEL', '#D4953A', '804'),
('Straw Field',     'YEL-005', 'YEL', '#DBC87A', '805'),

-- Orange (GS1: 851-855)
('Copper Canyon',   'ORG-001', 'ORG', '#C06D38', '851'),
('Terracotta Sun',  'ORG-002', 'ORG', '#C87941', '852'),
('Burnt Sienna',    'ORG-003', 'ORG', '#A85A32', '853'),
('Saffron Bloom',   'ORG-004', 'ORG', '#D88C4A', '854'),
('Tangerine Dusk',  'ORG-005', 'ORG', '#D4784B', '855');
