import { describe, expect, it } from "vitest";
import { checkIntegrity } from "@/lib/integrity";
import { collectionKeys, getCollection } from "@/lib/collections";

describe("datasets", () => {
  it("pass schema validation and cross-reference checks", () => {
    const { errors } = checkIntegrity();
    expect(errors).toEqual([]);
  });

  it.each(collectionKeys)("%s is non-empty and every entry has a source", (key) => {
    const c = getCollection(key);
    expect(c.items.length).toBeGreaterThan(0);
    for (const item of c.items) expect(item.source.length).toBeGreaterThan(2);
  });

  it("detects broken references", () => {
    const fs = require("node:fs") as typeof import("node:fs");
    const os = require("node:os") as typeof import("node:os");
    const path = require("node:path") as typeof import("node:path");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "leonida-"));
    for (const f of fs.readdirSync("data")) fs.copyFileSync(path.join("data", f), path.join(dir, f));
    const chars = JSON.parse(fs.readFileSync(path.join(dir, "characters.json"), "utf8"));
    chars[0].homeLocation = "liberty-city";
    chars.push({ ...chars[1] }); // duplicate id
    fs.writeFileSync(path.join(dir, "characters.json"), JSON.stringify(chars));
    const { errors } = checkIntegrity(dir);
    expect(errors.some((e) => e.includes('unknown location "liberty-city"'))).toBe(true);
    expect(errors.some((e) => e.includes("duplicate id"))).toBe(true);
  });
});
