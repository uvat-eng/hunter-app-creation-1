ALTER TABLE weapons ADD COLUMN photo text NULL;
ALTER TABLE weapons ADD COLUMN permit_photo text NULL;

CREATE TABLE medical_certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hunter_id uuid NOT NULL REFERENCES hunters(id),
    number text NOT NULL DEFAULT '',
    issue_date date NULL,
    photo text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_medical_certificates_hunter ON medical_certificates(hunter_id);