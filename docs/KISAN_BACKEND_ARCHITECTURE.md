# KISAN Module: Production Backend & Data Architecture

## 1. DATABASE ARCHITECTURE (HIGH PERFORMANCE)

*   **Primary DB**: **PostgreSQL 16** with **PostGIS** extension.
    *   *Why*: Relational integrity for bookings/payments, superior geo-spatial querying for "nearby" equipment/land, and mature partitioning.
*   **Cache/Message Broker**: **Redis 7**.
    *   *Why*: Sub-millisecond latency for live prices and coordination for background jobs.
*   **Partitioning Strategy**: 
    *   `bookings` and `transactions` tables partitioned by `created_at` (Monthly ranges).
    *   `mandi_prices` partitioned by `commodity_id` and `region_id`.
*   **Read/Write Split**: Master node for writes; 3+ Read Replicas (Geo-distributed) for the Marketplace and Scheme browsing.

---

## 2. CORE TABLES & INDEXING

### A. Equipment Rental
```sql
CREATE TABLE equipment_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id),
    category_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price_per_hour DECIMAL(10, 2) NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL, -- PostGIS Point
    status VARCHAR(20) DEFAULT 'available', -- available, rented, maintenance
    metadata JSONB, -- specific specs like HP, fuel type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_equip_geo ON equipment_listings USING GIST (location); -- Geo-spatial search
CREATE INDEX idx_equip_owner ON equipment_listings (owner_id);
CREATE INDEX idx_equip_comp_price ON equipment_listings (category_id, price_per_hour);
```

### B. Marketplace (Produce)
```sql
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY,
    farmer_id UUID NOT NULL REFERENCES users(id),
    commodity_id INT NOT NULL,
    variety VARCHAR(50),
    quantity DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(10) NOT NULL, -- quintal, kg
    asking_price DECIMAL(10, 2),
    location_id INT NOT NULL REFERENCES mandis(id),
    harvest_date DATE,
    shelf_life_days INT,
    is_organic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_market_commodity ON marketplace_listings (commodity_id, asking_price);
CREATE INDEX idx_market_location ON marketplace_listings (location_id);
```

### C. Land Listing
```sql
CREATE TABLE land_listings (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL,
    area_acres DECIMAL(8, 2) NOT NULL,
    price_per_year DECIMAL(12, 2),
    soil_type_id INT,
    water_availability VARCHAR(50),
    geo_polygon GEOGRAPHY(POLYGON), -- Exact boundary
    listing_type VARCHAR(10) CHECK (listing_type IN ('lease', 'sale')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### D. Scheme Aggregator
```sql
CREATE TABLE govt_schemes (
    id SERIAL PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_hi TEXT,
    description_en TEXT,
    description_hi TEXT,
    eligibility_criteria JSONB, -- Rule engine compatible
    subsidy_amount_perc INT,
    portal_url TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- GIN Index for searching keywords in JSONB eligibility
CREATE INDEX idx_schemes_eligibility ON govt_schemes USING GIN (eligibility_criteria);
```

---

## 3. CACHING LAYER DESIGN

| Data Type | Redis Structure | TTL | Invalidation Strategy |
| :--- | :--- | :--- | :--- |
| **Mandi Price Feed** | `Hash` (mandi:commodity) | 1 hour | Batch update from Govt API |
| **Nearby Equipment** | `GeoSet` (equip_geo) | 10 mins | On Listing Update/Delete |
| **User Notifications** | `Stream` | 24 hours | On Read |
| **Scheme Eligibility** | `String` (scheme:id) | 6 hours | Manual/Admin Update |

---

## 4. API PERFORMANCE & LOW-BANDWIDTH OPTIMIZATION

*   **Selective Field Fetching**: Implement "Sparse Fieldsets" (e.g., `GET /listings?fields=id,title,price`). Reduces payload by up to 80%.
*   **Compression**: Enforce **Brotli** over Gzip for 20% better compression on JSON.
*   **Image Strategy**:
    *   Store in S3; Serve via **WebP/AVIF** with auto-resizing based on User-Agent.
    *   Inject `blurhash` strings in initial JSON to show placeholders immediately.
*   **Pagination**: **Cursor-based** (`?after=id`) to prevent offset-skipping performance hits on millions of records.

---

## 5. SEARCH & GEO-OPTIMIZATION

### Nearby Search Query (PostGIS)
```sql
SELECT id, title, price_per_hour, 
       ST_Distance(location, ST_MakePoint(longitude, latitude)::geography) / 1000 AS distance_km
FROM equipment_listings
WHERE ST_DWithin(location, ST_MakePoint(longitude, latitude)::geography, 50000) -- 50km radius
ORDER BY distance_km ASC
LIMIT 20;
```

---

## 6. BACKGROUND JOBS & SCALABILITY

*   **Engine**: **BullMQ** (Redis-backed).
*   **Critical Queues**:
    1.  `notifications`: WhatsApp price alerts & booking SMS.
    2.  `payment_sync`: Reconciling escrow payments.
    3.  `image_processing`: Generating thumbnails for produce.
    4.  `scheme_match`: Matching users to schemes based on profile changes.
*   **Decision**: **Modular Monolith** for Phase 1. 
    *   Deploy as a single container but with strictly separated domain modules (Rental, Trade). 
    *   Transition to Microservices only when `transactions` module load exceeds DB CPU threshold.

---

## 7. DATA SECURITY & FRAUD PREVENTION

*   **Row Level Security (RLS)**: Enforce `WHERE user_id = current_user_id()` at the Postgres level.
*   **Duplicate Detection**: Bloom filters in Redis to check for same equipment Listed twice by same user ID in different districts.
*   **Rate Limiting**: `Sliding Window` (Redis) per UserID per Module.
    *   Marketplace: 30 requests/min.
    *   Post Need: 5 requests/min.

---

## 8. MONITORING (P95 Latency Target: <200ms)

*   **Traces**: OpenTelemetry with Jaeger.
*   **Metrics**: Prometheus + Grafana.
    *   *Key Metric*: `cache_hit_ratio` (Target > 85%).
    *   *System Health*: Connection Pool Saturation (`pg_stat_activity`).
