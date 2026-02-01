/**
 * HUB LOCATIONS - Real Coordinates for Nearest Hub Detection
 * 
 * These are realistic Indian city coordinates for Loopify hubs
 * Format: latitude, longitude (decimal degrees)
 * 
 * Usage: Run this SQL to update hubs with coordinates
 */

-- Assuming hubs table already exists, update with coordinates
-- If hubs don't have lat/long columns, run migrations_otp_location.sql first

UPDATE hubs SET latitude = 28.6139, longitude = 77.2090 WHERE hub_name = 'Delhi Hub' OR location LIKE '%Delhi%';
UPDATE hubs SET latitude = 19.0760, longitude = 72.8777 WHERE hub_name = 'Mumbai Hub' OR location LIKE '%Mumbai%';
UPDATE hubs SET latitude = 13.0827, longitude = 80.2707 WHERE hub_name = 'Chennai Hub' OR location LIKE '%Chennai%';
UPDATE hubs SET latitude = 12.9716, longitude = 77.5946 WHERE hub_name = 'Bangalore Hub' OR location LIKE '%Bangalore%';
UPDATE hubs SET latitude = 23.1815, longitude = 79.9864 WHERE hub_name = 'Bhopal Hub' OR location LIKE '%Bhopal%';

-- Verify updates
SELECT hub_id, hub_name, location, latitude, longitude FROM hubs WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
