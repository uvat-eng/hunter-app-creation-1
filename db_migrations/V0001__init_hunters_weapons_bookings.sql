CREATE TABLE hunters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT,
    ticket TEXT,
    ticket_date DATE,
    photo TEXT,
    experience TEXT,
    weapon TEXT,
    game TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE weapons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hunter_id UUID NOT NULL REFERENCES hunters(id),
    name TEXT NOT NULL,
    caliber TEXT,
    permit TEXT,
    permit_date DATE,
    optics_name TEXT,
    optics_params TEXT,
    thermal_name TEXT,
    thermal_params TEXT,
    collimator_name TEXT,
    collimator_params TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hunter_id UUID REFERENCES hunters(id),
    booking_date DATE NOT NULL,
    services TEXT,
    total INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_weapons_hunter ON weapons(hunter_id);
CREATE INDEX idx_bookings_hunter ON bookings(hunter_id);
