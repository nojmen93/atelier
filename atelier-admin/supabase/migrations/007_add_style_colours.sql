-- Junction table: which colours are assigned to which styles
CREATE TABLE IF NOT EXISTS style_colours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  colour_id UUID NOT NULL REFERENCES colours(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(style_id, colour_id)
);

CREATE INDEX idx_style_colours_style ON style_colours(style_id);
CREATE INDEX idx_style_colours_colour ON style_colours(colour_id);

ALTER TABLE style_colours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON style_colours FOR ALL USING (true);
