import type { FieldValues, ResolverOptions } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createSchemaResolver } from "./schema-resolver";

// Each expectation below matches what `zodResolver` from
// `@hookform/resolvers/zod` returned for the same schema and input, so
// replacing it changes no form error.

function optionsFor(
  overrides: Partial<ResolverOptions<FieldValues>> = {},
): ResolverOptions<FieldValues> {
  return {
    criteriaMode: "firstError",
    fields: {},
    shouldUseNativeValidation: false,
    ...overrides,
  };
}

function validate(
  schema: object,
  values: unknown,
  overrides: Partial<ResolverOptions<FieldValues>> = {},
) {
  return createSchemaResolver(schema)(
    values as FieldValues,
    undefined,
    optionsFor(overrides),
  );
}

describe("createSchemaResolver with Zod schemas", () => {
  it("returns the parsed values and no errors for valid input", async () => {
    const schema = z.object({
      count: z.coerce.number(),
      label: z.string().default("untitled"),
      name: z.string().transform((value) => value.trim()),
    });
    expect(await validate(schema, { count: "12", name: " Ada " })).toEqual({
      errors: {},
      values: { count: 12, label: "untitled", name: "Ada" },
    });
  });

  it("reports a failed rule with its message and Zod code", async () => {
    const schema = z.object({ email: z.email("Enter a valid email.") });
    expect(await validate(schema, { email: "nope" })).toEqual({
      errors: {
        email: { message: "Enter a valid email.", type: "invalid_format" },
      },
      values: {},
    });
  });

  it("nests the error under each segment of a deep path", async () => {
    const schema = z.object({
      user: z.object({
        address: z.object({ city: z.string().min(1, "City is required.") }),
      }),
    });
    const result = await validate(schema, { user: { address: { city: "" } } });
    expect(result.errors).toEqual({
      user: {
        address: { city: { message: "City is required.", type: "too_small" } },
      },
    });
  });

  it("puts a field array's own error under root next to its items", async () => {
    const schema = z.object({
      items: z
        .array(z.object({ name: z.string().min(2, "Too short.") }))
        .min(2, "Add two items."),
    });
    const result = await validate(
      schema,
      { items: [{ name: "a" }] },
      { names: ["items.0.name"] },
    );
    expect(result.errors).toEqual({
      items: {
        0: { name: { message: "Too short.", type: "too_small" } },
        root: { message: "Add two items.", type: "too_small" },
      },
    });
  });

  it("reports the closest branch of a failed union", async () => {
    const schema = z.object({
      contact: z.union([z.email("Enter a valid email."), z.literal("")]),
    });
    const result = await validate(schema, { contact: "x" });
    expect(result.errors).toEqual({
      contact: { message: "Enter a valid email.", type: "invalid_format" },
    });
  });

  it("keeps the first failed rule unless every criterion is requested", async () => {
    const schema = z.object({
      password: z
        .string()
        .min(8, "At least 8.")
        .regex(/\d/, "Needs a digit.")
        .regex(/[A-Z]/, "Needs a capital."),
    });
    const first = await validate(schema, { password: "" });
    expect(first.errors).toEqual({
      password: { message: "At least 8.", type: "too_small" },
    });
    const all = await validate(
      schema,
      { password: "" },
      { criteriaMode: "all" },
    );
    const types = all.errors.password?.types;
    expect(all.errors.password).toMatchObject({
      message: "At least 8.",
      type: "too_small",
    });
    expect(types?.invalid_format).toEqual([
      "Needs a digit.",
      "Needs a capital.",
    ]);
    expect(types?.too_small).toBe("At least 8.");
  });

  it("links the error to the registered field element", async () => {
    const element = document.createElement("input");
    const radios = [
      document.createElement("input"),
      document.createElement("input"),
    ];
    const schema = z.object({
      color: z.enum(["red", "blue"]),
      name: z.string().min(1),
    });
    const result = await validate(
      schema,
      { color: "green", name: "" },
      { fields: { color: { refs: radios }, name: { ref: element } } as never },
    );
    expect(result.errors.name?.ref).toBe(element);
    expect(result.errors.color?.ref).toBe(radios[0]);
  });

  it("keeps an error for a field named like an inherited member", async () => {
    const schema = z.object({ toString: z.string().min(1, "Required.") });
    const result = await validate(schema, { toString: "" });
    expect(result.errors).toEqual({
      toString: { message: "Required.", type: "too_small" },
    });
  });

  it("waits for an async rule", async () => {
    const schema = z.object({
      username: z
        .string()
        .refine((value) => Promise.resolve(value !== "taken"), "Taken."),
    });
    const taken = await validate(schema, { username: "taken" });
    expect(taken.errors).toEqual({
      username: { message: "Taken.", type: "custom" },
    });
    const free = await validate(schema, { username: "free" });
    expect(free.errors).toEqual({});
  });
});

function schemaReturning(result: unknown) {
  return {
    "~standard": { validate: () => result, vendor: "test", version: 1 },
  };
}

describe("createSchemaResolver with other Standard Schema libraries", () => {
  it("reads path segments given as keys and falls back to the validate type", async () => {
    const schema = schemaReturning({
      issues: [{ message: "Required", path: ["profile", { key: "name" }, 0] }],
    });
    const result = await validate(schema, {});
    expect(result.errors).toEqual({
      profile: { name: [{ message: "Required", type: "validate" }] },
    });
  });

  it("accepts a result that arrives as a promise", async () => {
    const schema = schemaReturning(Promise.resolve({ value: { ok: true } }));
    expect(await validate(schema, {})).toEqual({
      errors: {},
      values: { ok: true },
    });
  });

  it("lets an error thrown by the schema reach the caller", async () => {
    const schema = {
      "~standard": {
        validate: () => {
          throw new Error("schema crashed");
        },
        vendor: "test",
        version: 1,
      },
    };
    await expect(validate(schema, {})).rejects.toThrow("schema crashed");
  });

  it("rejects an object that is not a Standard Schema", () => {
    expect(() => createSchemaResolver({})).toThrow(
      "Invalid input: not a Standard Schema",
    );
  });
});
