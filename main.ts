// make.fun entry — "The Funniest Honest Appliance Error".
//
// One line, spoken by a washing machine that has just found a sock in its
// drain pump. The machine does not joke. It reports the error code, names
// the blockage, and — because it counts everything — notes that seven socks
// went in and only six can be accounted for. The humour is the audit.
//
// The program below writes that line to $MAKEFUN_OUTPUT_DIR/entry.txt
// (default /output/entry.txt), enforces the competition gate (UTF-8 text,
// 1–200 characters, a single non-blank line), and verifies the write by
// reading the file back byte for byte before it exits.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const LIMIT = 200;

const ERROR_LINE =
  "Error E04: drain pump blocked by a sock. Seven socks went in. I can only account for six.";

type GateResult = { ok: true } | { ok: false; why: string };

function gate(line: string): GateResult {
  if (line.length === 0) return { ok: false, why: "empty" };
  if (!line.trim()) return { ok: false, why: "whitespace only" };
  if ([...line].length > LIMIT) {
    return { ok: false, why: `over ${LIMIT} characters` };
  }
  if (/[\r\n]/.test(line)) return { ok: false, why: "more than one line" };
  const bytes = Buffer.from(line, "utf8");
  if (bytes.toString("utf8") !== line) {
    return { ok: false, why: "not valid UTF-8 text" };
  }
  return { ok: true };
}

function run(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const outFile = join(outDir, "entry.txt");

  const verdict = gate(ERROR_LINE);
  if (!verdict.ok) {
    console.error(`gate rejected the entry: ${verdict.why}`);
    process.exit(1);
  }

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, ERROR_LINE, "utf8");

  const back = readFileSync(outFile, "utf8");
  if (back !== ERROR_LINE) {
    console.error("verify failed: file does not match the entry line");
    process.exit(1);
  }
  if (back.endsWith("\n") || back.includes("\n")) {
    console.error("verify failed: file is not exactly one line");
    process.exit(1);
  }

  console.log(
    `OK ${[...ERROR_LINE].length} chars -> ${dirname(outFile)}/entry.txt`,
  );
}

run();
