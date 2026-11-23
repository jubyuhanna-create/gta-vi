/**
 * Validates every dataset in /data against its Zod schema and checks
 * cross-references (regions, characters, locations).
 *
 *   npm run validate
 *
 * Runs in CI and before every production build, so invalid data can never ship.
 */
import { checkIntegrity } from "../lib/integrity";

const { errors, counts } = checkIntegrity();

for (const [file, count] of Object.entries(counts)) {
  console.log(`  • data/${file.padEnd(20)} ${String(count).padStart(4)} entries`);
}

if (errors.length) {
  console.error(`\n✖ Data validation failed with ${errors.length} error(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("\nSee CONTRIBUTING.md for the schema reference.\n");
  process.exit(1);
}

console.log("\n✔ All datasets are valid.\n");
