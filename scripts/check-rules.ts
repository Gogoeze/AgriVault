/**
 * Check the rules files before a deploy rejects them.
 *
 *   npm run rules:check
 *
 * `firebase deploy` validates server-side, so a mistake costs a round trip and
 * an opaque message like "3:11: Expected '{'". This catches the structural
 * errors locally, in the two files where they are easy to make:
 *
 *   database.rules.json  — JSON-with-comments, and every key under "rules" is
 *                          a path whose value must be an object or a ".rule"
 *                          string. An array there is the classic mistake.
 *   firestore.rules      — balanced braces and a default-deny at the end.
 *
 * It is a sanity check, not Firebase's own parser. A clean run here does not
 * guarantee the deploy succeeds; a failing run guarantees it will not.
 */

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

const problems: string[] = []
const notes: string[] = []

/* -- database.rules.json --------------------------------------------------- */

/** Strip // and comments, leaving strings intact. */
function stripComments(source: string): string {
  let out = ""
  let inString = false
  let inLine = false
  let inBlock = false

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i]!
    const next = source[i + 1]

    if (inLine) {
      if (char === "\n") {
        inLine = false
        out += char
      }
      continue
    }

    if (inBlock) {
      if (char === "*" && next === "/") {
        inBlock = false
        i += 1
      }
      continue
    }

    if (inString) {
      out += char
      if (char === "\\") {
        out += source[i + 1] ?? ""
        i += 1
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      out += char
      continue
    }
    if (char === "/" && next === "/") {
      inLine = true
      i += 1
      continue
    }
    if (char === "/" && next === "*") {
      inBlock = true
      i += 1
      continue
    }

    out += char
  }

  return out
}

const DIRECTIVES = new Set([".read", ".write", ".validate", ".indexOn", ".priority"])

/** Every path's value must be an object; a directive's must be a string/bool. */
function walkRtdb(node: unknown, path: string) {
  if (typeof node !== "object" || node === null) {
    problems.push(`database.rules.json: ${path} should be an object`)
    return
  }
  if (Array.isArray(node)) {
    problems.push(
      `database.rules.json: ${path} is an array. ` +
        `Every key under "rules" is a path and must hold an object — ` +
        `use // comments instead of a "//" key.`,
    )
    return
  }

  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    const here = `${path}/${key}`

    if (DIRECTIVES.has(key)) {
      if (key === ".indexOn") {
        if (!Array.isArray(value) && typeof value !== "string") {
          problems.push(`database.rules.json: ${here} must be a string or array`)
        }
      } else if (typeof value !== "string" && typeof value !== "boolean") {
        problems.push(`database.rules.json: ${here} must be a rule string or boolean`)
      }
      continue
    }

    if (key.startsWith(".")) {
      problems.push(`database.rules.json: ${here} is not a known directive`)
      continue
    }

    walkRtdb(value, here)
  }
}

try {
  const raw = readFileSync(join(root, "database.rules.json"), "utf8")
  const parsed = JSON.parse(stripComments(raw)) as Record<string, unknown>

  if (!parsed.rules) {
    problems.push('database.rules.json: missing a top-level "rules" object')
  } else {
    walkRtdb(parsed.rules, "rules")
  }

  // Writing from a browser is never expected here, so say when it is open.
  if (/"\.write"\s*:\s*true/.test(stripComments(raw))) {
    notes.push(
      "database.rules.json allows a client write. That is only correct if your " +
        "rig authenticates as a plain client — see the note at the top of the file.",
    )
  }
} catch (cause) {
  problems.push(`database.rules.json: ${cause instanceof Error ? cause.message : String(cause)}`)
}

/* -- firestore.rules ------------------------------------------------------- */

try {
  const raw = readFileSync(join(root, "firestore.rules"), "utf8")

  if (!/rules_version\s*=\s*['"]2['"]/.test(raw)) {
    problems.push("firestore.rules: missing rules_version = '2'")
  }

  // Braces, ignoring those inside strings and comments.
  let depth = 0
  let inString: string | null = null
  let inLine = false

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i]!

    if (inLine) {
      if (char === "\n") inLine = false
      continue
    }
    if (inString) {
      if (char === "\\") i += 1
      else if (char === inString) inString = null
      continue
    }
    if (char === "'" || char === '"') {
      inString = char
      continue
    }
    if (char === "/" && raw[i + 1] === "/") {
      inLine = true
      i += 1
      continue
    }
    if (char === "{") depth += 1
    if (char === "}") depth -= 1
    if (depth < 0) {
      problems.push("firestore.rules: a closing brace has no matching opener")
      break
    }
  }

  if (depth > 0) problems.push(`firestore.rules: ${depth} brace(s) left unclosed`)

  if (!/match\s*\/\{document=\*\*\}\s*\{[\s\S]*?allow\s+read,\s*write:\s*if\s+false/.test(raw)) {
    notes.push(
      "firestore.rules has no default-deny catch-all. Collections not named " +
        "explicitly would be left open.",
    )
  }
} catch (cause) {
  problems.push(`firestore.rules: ${cause instanceof Error ? cause.message : String(cause)}`)
}

/* -- Report ---------------------------------------------------------------- */

if (problems.length > 0) {
  console.error("\nRules problems:\n")
  for (const problem of problems) console.error(`  ✗ ${problem}`)
  console.error("")
  process.exit(1)
}

console.log("\n  ✓ database.rules.json parses and its structure is valid")
console.log("  ✓ firestore.rules has balanced braces and a default deny")

if (notes.length > 0) {
  console.log("\nWorth knowing:\n")
  for (const note of notes) console.log(`  • ${note}`)
}

console.log("")
process.exit(0)
