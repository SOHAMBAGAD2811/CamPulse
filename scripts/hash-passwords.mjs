/**
 * One-time migration script to hash all existing plain-text passwords
 * in students, staff, and hods tables.
 * 
 * Run with: node scripts/hash-passwords.mjs
 * 
 * This is safe to run multiple times — it skips already-hashed passwords.
 */

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SALT_ROUNDS = 10;

async function hashTablePasswords(table, pkColumn) {
  console.log(`\n🔐 Processing ${table}...`);

  const { data: rows, error } = await supabase
    .from(table)
    .select(`${pkColumn}, password`);

  if (error) {
    console.error(`  ❌ Error fetching ${table}:`, error.message);
    return;
  }

  let hashed = 0;
  let skipped = 0;
  let empty = 0;

  for (const row of rows) {
    // Skip if no password set
    if (!row.password) {
      empty++;
      continue;
    }

    // Skip if already a bcrypt hash (starts with $2a$ or $2b$)
    if (row.password.startsWith("$2")) {
      skipped++;
      continue;
    }

    // Hash the plain-text password
    const hash = await bcrypt.hash(row.password, SALT_ROUNDS);
    const { error: updateErr } = await supabase
      .from(table)
      .update({ password: hash })
      .eq(pkColumn, row[pkColumn]);

    if (updateErr) {
      console.error(`  ❌ Failed to hash ${row[pkColumn]}:`, updateErr.message);
    } else {
      hashed++;
    }
  }

  console.log(`  ✅ ${hashed} passwords hashed`);
  console.log(`  ⏭️  ${skipped} already hashed (skipped)`);
  console.log(`  ⚠️  ${empty} have no password set`);
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  CamPulse Password Hashing Migration");
  console.log("═══════════════════════════════════════");

  await hashTablePasswords("students", "uid");
  await hashTablePasswords("staff", "suid");
  await hashTablePasswords("hods", "huid");

  console.log("\n✅ Migration complete! All passwords are now securely hashed.");
  console.log("   Users can log in with their same passwords — no changes needed on their end.");
}

main().catch(console.error);
