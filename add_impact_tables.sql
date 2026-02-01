-- Impact Tracking Tables
CREATE TABLE IF NOT EXISTS waste_activities (
  activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  hub_id INTEGER,
  activity_type TEXT NOT NULL,
  waste_category TEXT,
  quantity REAL,
  unit TEXT DEFAULT 'kg',
  diversion_type TEXT,
  eco_points_awarded INTEGER DEFAULT 0,
  carbon_savings_kg REAL DEFAULT 0,
  resource_saved_kg REAL DEFAULT 0,
  landfill_space_saved_m3 REAL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id),
  FOREIGN KEY(hub_id) REFERENCES hubs(hub_id)
);

CREATE TABLE IF NOT EXISTS food_tracking (
  food_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  hub_id INTEGER,
  food_name TEXT NOT NULL,
  quantity_kg REAL,
  category TEXT,
  expiry_date DATE,
  status TEXT,
  carbon_savings_kg REAL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id),
  FOREIGN KEY(hub_id) REFERENCES hubs(hub_id)
);

CREATE TABLE IF NOT EXISTS environmental_impact (
  impact_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  hub_id INTEGER,
  period_date DATE DEFAULT CURRENT_DATE,
  items_classified INTEGER DEFAULT 0,
  foods_tracked INTEGER DEFAULT 0,
  items_reused INTEGER DEFAULT 0,
  materials_matched INTEGER DEFAULT 0,
  composted_kg REAL DEFAULT 0,
  recycled_kg REAL DEFAULT 0,
  reused_kg REAL DEFAULT 0,
  landfill_kg REAL DEFAULT 0,
  total_carbon_avoided_kg REAL DEFAULT 0,
  total_resources_saved_kg REAL DEFAULT 0,
  total_landfill_saved_m3 REAL DEFAULT 0,
  methane_prevented_kg REAL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id),
  FOREIGN KEY(hub_id) REFERENCES hubs(hub_id)
);

CREATE INDEX IF NOT EXISTS idx_waste_user ON waste_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_type ON waste_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_waste_diversion ON waste_activities(diversion_type);
CREATE INDEX IF NOT EXISTS idx_waste_created ON waste_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_food_user ON food_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_food_status ON food_tracking(status);
CREATE INDEX IF NOT EXISTS idx_impact_user ON environmental_impact(user_id);
CREATE INDEX IF NOT EXISTS idx_impact_hub ON environmental_impact(hub_id);
CREATE INDEX IF NOT EXISTS idx_impact_date ON environmental_impact(period_date);
