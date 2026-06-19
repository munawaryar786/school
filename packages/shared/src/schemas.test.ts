import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { administratorSchema, campusSchema, createSchoolSchema, superAdminListQuerySchema, updateSchoolSchema } from "./schemas.ts";

describe("Phase 29 Super Admin schemas", () => {
  it("accepts a valid school create payload", () => {
    const result = createSchoolSchema.parse({
      name: "North Ridge School",
      slug: "north-ridge",
      status: "ACTIVE",
      email: "office@northridge.edu",
      website: "https://northridge.edu"
    });

    assert.equal(result.slug, "north-ridge");
    assert.equal(result.status, "ACTIVE");
  });

  it("rejects invalid school slugs and urls", () => {
    const result = createSchoolSchema.safeParse({
      name: "A",
      slug: "Bad Slug",
      website: "not-a-url"
    });

    assert.equal(result.success, false);
  });

  it("allows partial school updates", () => {
    assert.equal(updateSchoolSchema.parse({ status: "SUSPENDED" }).status, "SUSPENDED");
  });

  it("validates campus and administrator payloads", () => {
    assert.equal(campusSchema.parse({ schoolId: "school_1", name: "Main Campus", code: "MAIN" }).code, "MAIN");
    assert.equal(administratorSchema.parse({ schoolId: "school_1", name: "Admin User", email: "admin@school.edu" }).status, "ACTIVE");
  });

  it("parses list sorting defaults", () => {
    const query = superAdminListQuerySchema.parse({});
    assert.equal(query.page, 1);
    assert.equal(query.sortBy, "createdAt");
    assert.equal(query.sortDirection, "desc");
  });
});
