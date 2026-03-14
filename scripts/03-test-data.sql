-- Data for testing - run this after schema is created

-- Insert test organization
INSERT INTO organizations (name, slug, created_at, updated_at)
VALUES ('Test Organization', 'test-org', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Get the organization ID (replace with actual UUID if needed)
-- INSERT INTO users (organization_id, email, password_hash, full_name, role, is_active, created_at, updated_at)
-- SELECT 
--   id,
--   'test@example.com',
--   'hashed_password_here', -- Use bcrypt hash in production
--   'Test User',
--   'owner',
--   true,
--   NOW(),
--   NOW()
-- FROM organizations
-- WHERE slug = 'test-org'
-- ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (organization_id, name, description, sku, unit_price, cost_price, stock_quantity, is_active, created_at, updated_at)
SELECT 
  id,
  'Product 1',
  'Description of Product 1',
  'PROD-001',
  99.99,
  50.00,
  100,
  true,
  NOW(),
  NOW()
FROM organizations
WHERE slug = 'test-org'
ON CONFLICT DO NOTHING;

INSERT INTO products (organization_id, name, description, sku, unit_price, cost_price, stock_quantity, is_active, created_at, updated_at)
SELECT 
  id,
  'Product 2',
  'Description of Product 2',
  'PROD-002',
  149.99,
  75.00,
  50,
  true,
  NOW(),
  NOW()
FROM organizations
WHERE slug = 'test-org'
ON CONFLICT DO NOTHING;
