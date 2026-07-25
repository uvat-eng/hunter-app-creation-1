CREATE TABLE hunt_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hunter_id UUID NOT NULL REFERENCES hunters(id),
    title TEXT NOT NULL,
    hunt_type TEXT,
    event_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'planned',
    location_name TEXT,
    map_x NUMERIC,
    map_y NUMERIC,
    notes TEXT,
    reminder BOOLEAN NOT NULL DEFAULT false,
    trophies JSONB,
    photos JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hunt_events_hunter ON hunt_events(hunter_id);
