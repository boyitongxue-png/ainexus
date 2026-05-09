import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL ||
  "mysql://N369fkagoifvmbQ.root:ZwkBClAASErzOHSDlCad7kv3yih3bWIQ@ep-t4ni387b5e83b7519dc8.epsrv-t4n281l4mrmemi4zls9a.ap-southeast-1.privatelink.aliyuncs.com:4000/19e08472-cb42-80f5-8000-0942f695b640";

async function migrate() {
  // Parse connection URL
  const url = new URL(DATABASE_URL);
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });

  console.log("Connected to database. Running migration...");

  try {
    // 1. Add new billing columns to models table
    await connection.execute(`
      ALTER TABLE models
        ADD COLUMN IF NOT EXISTS billing_mode ENUM('per_token','per_image','per_second','per_request') NOT NULL DEFAULT 'per_token',
        ADD COLUMN IF NOT EXISTS billing_unit VARCHAR(50) NOT NULL DEFAULT '1M',
        ADD COLUMN IF NOT EXISTS supplier_input_cost DECIMAL(12,6) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS supplier_output_cost DECIMAL(12,6) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 7.2000,
        ADD COLUMN IF NOT EXISTS my_input_cost DECIMAL(12,6) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS my_output_cost DECIMAL(12,6) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS channel_input_price DECIMAL(12,6) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS channel_output_price DECIMAL(12,6) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS retail_input_price DECIMAL(12,6) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS retail_output_price DECIMAL(12,6) NOT NULL DEFAULT 0
    `);
    console.log("✅ Added billing columns to models table");

    // 2. Create channel_partners table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS channel_partners (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        company_name VARCHAR(255),
        contact_name VARCHAR(255),
        contact_phone VARCHAR(50),
        markup_type ENUM('fixed_amount','percentage','custom') NOT NULL DEFAULT 'percentage',
        markup_value DECIMAL(10,4) NOT NULL DEFAULT 20.0000,
        credit_limit DECIMAL(12,2) NOT NULL DEFAULT 0,
        status ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✅ Created channel_partners table");

    // 3. Create custom_pricing_rules table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS custom_pricing_rules (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        channel_partner_id BIGINT UNSIGNED NOT NULL,
        model_id BIGINT UNSIGNED NOT NULL,
        custom_input_price DECIMAL(12,6),
        custom_output_price DECIMAL(12,6),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✅ Created custom_pricing_rules table");

    // 4. Create usage_records table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS usage_records (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        request_id VARCHAR(255) NOT NULL,
        model_id BIGINT UNSIGNED NOT NULL,
        model_name VARCHAR(255),
        user_id BIGINT UNSIGNED,
        platform_key_id BIGINT UNSIGNED,
        input_tokens INT DEFAULT 0,
        output_tokens INT DEFAULT 0,
        image_count INT DEFAULT 0,
        video_seconds DECIMAL(10,2) DEFAULT 0,
        request_count INT DEFAULT 1,
        input_cost DECIMAL(12,6) DEFAULT 0,
        output_cost DECIMAL(12,6) DEFAULT 0,
        total_cost DECIMAL(12,6) DEFAULT 0,
        channel_markup DECIMAL(12,6) DEFAULT 0,
        final_price DECIMAL(12,6) DEFAULT 0,
        status ENUM('success','error','refunded') NOT NULL DEFAULT 'success',
        duration INT DEFAULT 0,
        error_code VARCHAR(50),
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✅ Created usage_records table");

    console.log("\n🎉 Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
