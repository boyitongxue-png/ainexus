import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL ||
  "mysql://N369fkagoifvmbQ.root:ZwkBClAASErzOHSDlCad7kv3yih3bWIQ@ep-t4ni387b5e83b7519dc8.epsrv-t4n281l4mrmemi4zls9a.ap-southeast-1.privatelink.aliyuncs.com:4000/19e08472-cb42-80f5-8000-0942f695b640";

async function seed() {
  const url = new URL(DATABASE_URL);
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });

  console.log("Seeding pricing data...");

  // Check existing models
  const [rows]: any = await connection.execute("SELECT id, name, provider, model_type FROM models");
  console.log(`Found ${rows.length} models`);

  for (const model of rows) {
    const name = model.name.toLowerCase();
    let updates: Record<string, any> = {};

    // GPT-4o
    if (name.includes("gpt-4o") && !name.includes("mini")) {
      updates = {
        billing_mode: "per_token",
        billing_unit: "1M",
        supplier_input_cost: 2.50,
        supplier_output_cost: 10.00,
        exchange_rate: 7.20,
        my_input_cost: 18.00,
        my_output_cost: 72.00,
        channel_input_price: 21.60,
        channel_output_price: 86.40,
        retail_inputPrice: 25.00,
        retail_output_price: 100.00,
      };
    }
    // GPT-4o-mini
    else if (name.includes("gpt-4o-mini") || name.includes("gpt-4o mini")) {
      updates = {
        billing_mode: "per_token",
        billing_unit: "1M",
        supplier_input_cost: 0.15,
        supplier_output_cost: 0.60,
        exchange_rate: 7.20,
        my_input_cost: 1.08,
        my_output_cost: 4.32,
        channel_input_price: 1.30,
        channel_output_price: 5.18,
        retail_input_price: 1.50,
        retail_output_price: 6.00,
      };
    }
    // GPT-4 Turbo
    else if (name.includes("gpt-4-turbo") || name.includes("gpt-4 turbo")) {
      updates = {
        billing_mode: "per_token",
        billing_unit: "1M",
        supplier_input_cost: 10.00,
        supplier_output_cost: 30.00,
        exchange_rate: 7.20,
        my_input_cost: 72.00,
        my_output_cost: 216.00,
        channel_input_price: 86.40,
        channel_output_price: 259.20,
        retail_input_price: 100.00,
        retail_output_price: 300.00,
      };
    }
    // GPT-3.5 Turbo
    else if (name.includes("gpt-3.5") || name.includes("gpt-3.5-turbo")) {
      updates = {
        billing_mode: "per_token",
        billing_unit: "1M",
        supplier_input_cost: 0.50,
        supplier_output_cost: 1.50,
        exchange_rate: 7.20,
        my_input_cost: 3.60,
        my_output_cost: 10.80,
        channel_input_price: 4.32,
        channel_output_price: 12.96,
        retail_input_price: 5.00,
        retail_output_price: 15.00,
      };
    }
    // DALL-E 3
    else if (name.includes("dall-e") || name.includes("dall")) {
      updates = {
        billing_mode: "per_image",
        billing_unit: "1张",
        supplier_input_cost: 0.04,
        supplier_output_cost: 0,
        exchange_rate: 7.20,
        my_input_cost: 0.29,
        my_output_cost: 0,
        channel_input_price: 0.35,
        channel_output_price: 0,
        retail_input_price: 0.50,
        retail_output_price: 0,
      };
    }
    // Whisper
    else if (name.includes("whisper")) {
      updates = {
        billing_mode: "per_second",
        billing_unit: "1分钟",
        supplier_input_cost: 0.006,
        supplier_output_cost: 0,
        exchange_rate: 7.20,
        my_input_cost: 0.043,
        my_output_cost: 0,
        channel_input_price: 0.052,
        channel_output_price: 0,
        retail_input_price: 0.06,
        retail_output_price: 0,
      };
    }
    // TTS
    else if (name.includes("tts") || name.includes("tts-1")) {
      updates = {
        billing_mode: "per_token",
        billing_unit: "1M",
        supplier_input_cost: 15.00,
        supplier_output_cost: 0,
        exchange_rate: 7.20,
        my_input_cost: 108.00,
        my_output_cost: 0,
        channel_input_price: 129.60,
        channel_output_price: 0,
        retail_input_price: 150.00,
        retail_output_price: 0,
      };
    }
    // Embedding models
    else if (name.includes("embedding") || name.includes("embed")) {
      updates = {
        billing_mode: "per_token",
        billing_unit: "1M",
        supplier_input_cost: 0.10,
        supplier_output_cost: 0,
        exchange_rate: 7.20,
        my_input_cost: 0.72,
        my_output_cost: 0,
        channel_input_price: 0.86,
        channel_output_price: 0,
        retail_input_price: 1.00,
        retail_output_price: 0,
      };
    }
    // Default for text models
    else if (model.model_type === "text") {
      updates = {
        billing_mode: "per_token",
        billing_unit: "1M",
        supplier_input_cost: 1.00,
        supplier_output_cost: 3.00,
        exchange_rate: 7.20,
        my_input_cost: 7.20,
        my_output_cost: 21.60,
        channel_input_price: 8.64,
        channel_output_price: 25.92,
        retail_input_price: 10.00,
        retail_output_price: 30.00,
      };
    }
    // Default for image models
    else if (model.model_type === "image") {
      updates = {
        billing_mode: "per_image",
        billing_unit: "1张",
        supplier_input_cost: 0.02,
        supplier_output_cost: 0,
        exchange_rate: 7.20,
        my_input_cost: 0.14,
        my_output_cost: 0,
        channel_input_price: 0.17,
        channel_output_price: 0,
        retail_input_price: 0.20,
        retail_output_price: 0,
      };
    }
    // Default for video models
    else if (model.model_type === "video") {
      updates = {
        billing_mode: "per_second",
        billing_unit: "1秒",
        supplier_input_cost: 0.05,
        supplier_output_cost: 0,
        exchange_rate: 7.20,
        my_input_cost: 0.36,
        my_output_cost: 0,
        channel_input_price: 0.43,
        channel_output_price: 0,
        retail_input_price: 0.50,
        retail_output_price: 0,
      };
    }
    // Default for audio models
    else if (model.model_type === "audio") {
      updates = {
        billing_mode: "per_second",
        billing_unit: "1秒",
        supplier_input_cost: 0.01,
        supplier_output_cost: 0,
        exchange_rate: 7.20,
        my_input_cost: 0.07,
        my_output_cost: 0,
        channel_input_price: 0.08,
        channel_output_price: 0,
        retail_input_price: 0.10,
        retail_output_price: 0,
      };
    }

    if (Object.keys(updates).length > 0) {
      const setClause = Object.keys(updates)
        .map((key) => `${key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)} = ?`)
        .join(", ");
      const values = Object.values(updates);

      await connection.execute(
        `UPDATE models SET ${setClause} WHERE id = ?`,
        [...values, model.id]
      );
      console.log(`  Updated ${model.name} (${model.model_type}) with pricing data`);
    } else {
      console.log(`  Skipped ${model.name} - no matching pattern`);
    }
  }

  console.log("\n✅ Pricing data seeded successfully!");
  await connection.end();
}

seed().catch(console.error);
