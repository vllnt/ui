import {
  appendErrors,
  type FieldError,
  type FieldErrors,
  type FieldValues,
  get,
  type Resolver,
  type ResolverOptions,
  set,
} from "react-hook-form";

type SchemaIssue = {
  code?: string;
  errors?: SchemaIssue[][];
  message: string;
  path?: readonly (PropertyKey | { key: PropertyKey })[];
};

type SchemaResult =
  | { issues: readonly SchemaIssue[]; value?: undefined }
  | { issues?: undefined; value: unknown };

type StandardSchema = {
  "~standard": {
    validate: (value: unknown) => Promise<SchemaResult> | SchemaResult;
  };
};

type FieldRecord = Record<string, FieldError>;

/** The error `type` for issues without a code, as react-hook-form names its own. */
const FALLBACK_TYPE = "validate";

function pathKey(issue: SchemaIssue): string {
  return (issue.path ?? [])
    .map((segment) =>
      String(typeof segment === "object" ? segment.key : segment),
    )
    .join(".");
}

/** Zod reports a failed union as one issue that holds the issues of each branch. */
function branchIssues(issue: SchemaIssue): SchemaIssue[] {
  if (issue.code !== "invalid_union" || !Array.isArray(issue.errors)) return [];
  return issue.errors.flatMap((branch) =>
    branch.map((nested) => ({
      ...nested,
      path: [...(issue.path ?? []), ...(nested.path ?? [])],
    })),
  );
}

/** Lists each issue before the branch issues it holds, one nesting level at a time. */
function withBranchIssues(level: SchemaIssue[]): SchemaIssue[] {
  const next = level.flatMap(branchIssues);
  return next.length === 0 ? level : [...level, ...withBranchIssues(next)];
}

/** A failed union reports the branch with the fewest issues, the closest match. */
function firstError(issue: SchemaIssue): FieldError {
  const code = issue.code ?? FALLBACK_TYPE;
  const branches = issue.errors;
  if (
    code === "invalid_union" &&
    branches !== undefined &&
    branches.length > 0
  ) {
    const closest = branches.reduce((best, branch) =>
      branch.length < best.length ? branch : best,
    );
    const inner = closest[0];
    return {
      message: inner?.message ?? issue.message,
      type: inner?.code ?? code,
    };
  }
  return { message: issue.message, type: code };
}

function addIssue(errors: FieldRecord, issue: SchemaIssue, all: boolean): void {
  const key = pathKey(issue);
  errors[key] ??= firstError(issue);
  if (!all) return;
  const type = issue.code ?? FALLBACK_TYPE;
  const known = errors[key]?.types?.[type];
  errors[key] = appendErrors(
    key,
    true,
    errors,
    type,
    known ? ([known, issue.message].flat() as string[]) : issue.message,
  ) as FieldError;
}

function groupIssues(
  issues: readonly SchemaIssue[],
  all: boolean,
): FieldRecord {
  // A null prototype keeps a field named `constructor` or `toString` apart
  // from the members every plain object inherits.
  const errors: FieldRecord = Object.create(null) as FieldRecord;
  withBranchIssues([...issues]).forEach((issue) => {
    addIssue(errors, issue, all);
  });
  return errors;
}

function plainPath(name: string): string {
  return name.replaceAll(/\[(\d+)]/g, ".$1").replaceAll(/[[\]]/g, "");
}

/** True when `name` holds an array, so its own error belongs under `root`. */
function isFieldArray(names: string[], name: string): boolean {
  const escaped = plainPath(name).replaceAll(
    /[$()*+.?[\\\]^{|}]/g,
    String.raw`\$&`,
  );
  const pattern = new RegExp(`^${escaped}\\.\\d+`);
  return names.some((candidate) => pattern.test(plainPath(candidate)));
}

type FieldEntry = { ref?: unknown; refs?: unknown[] };

/** Turns `user.email` style keys into the nested shape react-hook-form reads. */
function nestErrors<TFieldValues extends FieldValues>(
  errors: FieldRecord,
  options: ResolverOptions<TFieldValues>,
): FieldErrors<TFieldValues> {
  const keys = Object.keys(errors);
  const names = options.names ?? keys;
  const nested: FieldValues = {};
  keys.forEach((key) => {
    const field = get<unknown, FieldEntry | undefined>(options.fields, key);
    const error = Object.assign(errors[key] ?? {}, {
      ref: field?.refs ? field.refs[0] : field?.ref,
    });
    if (isFieldArray(names, key)) {
      const holder = Object.assign(
        {},
        get<unknown, object | undefined>(nested, key),
      );
      set(holder, "root", error);
      set(nested, key, holder);
    } else {
      set(nested, key, error);
    }
  });
  return nested;
}

/**
 * Validates form values with any Standard Schema (Zod 4 included) and maps the
 * issues to react-hook-form errors: nested paths, field array roots and, with
 * `criteriaMode: "all"`, every failed rule under `types`. The error `type` is
 * the issue code when the schema reports one (Zod does), else a fixed fallback.
 * Browser-native validation messages are not supported.
 */
export function createSchemaResolver<
  TFieldValues extends FieldValues = FieldValues,
>(schema: object): Resolver<TFieldValues> {
  const standard = (schema as Partial<StandardSchema>)["~standard"];
  if (typeof standard?.validate !== "function") {
    throw new TypeError("Invalid input: not a Standard Schema");
  }
  return async (values, _context, options) => {
    const result = await standard.validate(values);
    if (result.issues === undefined) {
      return { errors: {}, values: result.value as TFieldValues };
    }
    const all = options.criteriaMode === "all";
    return {
      errors: nestErrors(groupIssues(result.issues, all), options),
      values: {},
    };
  };
}
