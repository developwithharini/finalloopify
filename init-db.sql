-- Add contact_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS contact_messages (
  message_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  response_notes TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_is_read ON contact_messages(is_read);

-- Seed 10 mock thrift items if table is empty
INSERT OR IGNORE INTO thrift_items (item_name, category, description, eco_points_cost, image_url, condition, size, color, hub_id, uploaded_date, availability_status, quantity_available)
SELECT 'Vintage Denim Jacket', 'clothing', 'Classic 90s denim jacket', 45, 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400', 'excellent', 'M', 'Blue', 1, date('now'), 'available', 1
WHERE NOT EXISTS (SELECT 1 FROM thrift_items WHERE item_name = 'Vintage Denim Jacket' AND hub_id = 1)
UNION ALL
SELECT 'Floral Summer Dress', 'clothing', 'Beautiful hand-printed floral', 35, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', 'like_new', 'S', 'Multi', 1, date('now'), 'available', 1
WHERE NOT EXISTS (SELECT 1 FROM thrift_items WHERE item_name = 'Floral Summer Dress' AND hub_id = 1)
UNION ALL
SELECT 'Wooden Mirror', 'decor', 'Handcrafted wooden mirror', 50, 'https://images.unsplash.com/photo-1576909411632-ba41efb8ac4d?w=400', 'excellent', '24x36', 'Natural', 1, date('now'), 'available', 1
WHERE NOT EXISTS (SELECT 1 FROM thrift_items WHERE item_name = 'Wooden Mirror' AND hub_id = 1)
UNION ALL
SELECT 'Ceramic Vase Set', 'decor', 'Set of 3 handmade ceramic vases', 40, 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400', 'like_new', 'Various', 'Cream', 1, date('now'), 'available', 1
WHERE NOT EXISTS (SELECT 1 FROM thrift_items WHERE item_name = 'Ceramic Vase Set' AND hub_id = 1)
UNION ALL
SELECT 'Vintage Film Camera', 'utility', 'Fully functional vintage SLR', 55, 'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=400', 'good', 'N/A', 'Black', 1, date('now'), 'available', 1
WHERE NOT EXISTS (SELECT 1 FROM thrift_items WHERE item_name = 'Vintage Film Camera' AND hub_id = 1)
UNION ALL
SELECT 'Desk Organizer', 'utility', 'Modern desk organization set', 30, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400', 'excellent', 'N/A', 'White', 1, date('now'), 'available', 1
WHERE NOT EXISTS (SELECT 1 FROM thrift_items WHERE item_name = 'Desk Organizer' AND hub_id = 1)
UNION ALL
SELECT 'Wool Sweater', 'clothing', 'Cozy wool sweater', 50, 'https://images.unsplash.com/photo-1576802356913-f15fa50d4c4d?w=400', 'excellent', 'L', 'Charcoal', 1, date('now'), 'available', 1
WHERE NOT EXISTS (SELECT 1 FROM thrift_items WHERE item_name = 'Wool Sweater' AND hub_id = 1)
UNION ALL
SELECT 'Linen Tablecloth', 'decor', 'Premium linen table cover', 35, 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400', 'like_new', '150x200cm', 'Beige', 1, date('now'), 'available', 1
WHERE NOT EXISTS (SELECT 1 FROM thrift_items WHERE item_name = 'Linen Tablecloth' AND hub_id = 1)
UNION ALL
SELECT 'Bluetooth Speaker', 'utility', 'Portable wireless speaker', 45, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 'good', 'N/A', 'Black', 1, date('now'), 'available', 1
WHERE NOT EXISTS (SELECT 1 FROM thrift_items WHERE item_name = 'Bluetooth Speaker' AND hub_id = 1)
UNION ALL
SELECT 'Canvas Art Prints', 'decor', 'Modern abstract art set', 55, 'https://images.unsplash.com/photo-1578314675288-c89dee369f6d?w=400', 'like_new', '16x20', 'Multi-color', 1, date('now'), 'available', 1
WHERE NOT EXISTS (SELECT 1 FROM thrift_items WHERE item_name = 'Canvas Art Prints' AND hub_id = 1);
