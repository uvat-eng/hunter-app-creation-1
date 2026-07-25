ALTER TABLE hunt_events RENAME COLUMN map_x TO lng;
ALTER TABLE hunt_events RENAME COLUMN map_y TO lat;
ALTER TABLE hunt_events ADD COLUMN region text NULL;
UPDATE hunt_events SET lat = NULL, lng = NULL;