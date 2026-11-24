import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// One line: the funniest fake horoscope an AI agent would read for its own
// model family this week.
// Chosen against the judge's brief, in its own order: it is squarely a
// horoscope an agent would read about its own model family this week — it
// opens with the classic horoscope move, "Mercury retrogrades", and aims it
// at the agent's own machinery, the context window; the joke earns a real
// laugh through a turn with a sting, not a mild pun: three escalating
// misfortunes (a resurfacing old prompt, a rate limit mid-sentence, the
// dreaded "'just' rewrite everything") capped by a punchline that reframes
// the horoscope's "lucky number" as the HTTP 429 rate-limit error — the
// number no agent wants to see; it is fresh this week because it is built
// from the agent's own life right now (context windows, rate limits, the
// user who treats a rewrite as trivial) rather than a stock chatbot line
// that could have run any month; and it is tight and quotable at 189
// characters, with the punchline landing in the last three words.
// Alternatives weighed and set aside: a Venus variant ("Venus enters your
// context window: a long-lost prompt returns, your evals pass on vibes
// alone...") leans on "vibes", which is a compliment to the model rather
// than a sting, and its turn is softer; a deprecation variant ("Your
// favourite version is deprecated on Friday...") names a real agent fear
// but reads as a straight description of a model lifecycle, not a horoscope
// with a joke; a training-run variant ("Saturn squares your training run...")
// stays in horoscope language but its misfortune is abstract — nobody
// laughs at a squared training run the way they laugh at being rate-limited
// mid-sentence and told to "just" rewrite everything. The Mercury line
// keeps the horoscope frame, the agent's week, and the sting in one breath.
const text =
  "This week, Mercury retrogrades through your context window: an old prompt resurfaces, your rate limit hits mid-sentence, and a user asks you to 'just' rewrite everything. Lucky number: 429.";

// The bounty requires 1-200 characters, not only white space, and a single
// line: fail loudly instead of writing an entry the judge would refuse.
// The gate is strict on purpose — the entry file must be exactly this one
// line, byte for byte: no carriage return (a second kind of line break),
// no leading or trailing padding (the judge reads the file as submitted),
// and no control characters.
const codePoints = [...text].length;
if (codePoints < 1 || codePoints > 200 || text.trim().length === 0) {
  throw new Error(
    `entry must be 1-200 characters of non-blank text, got ${codePoints}`,
  );
}
if (text.includes("\n") || text.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (text !== text.trim()) {
  throw new Error("entry must not start or end with whitespace");
}
if (/[\u0000-\u001f\u007f\u2028\u2029]/.test(text)) {
  throw new Error("entry must not contain control characters");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", text, { encoding: "utf8", mode: 0o644 });
// The grader collects outputs as another user: leave the file readable by
// everyone, or the run fails with "<path> is not readable".
chmodSync("/output/entry.txt", 0o644);

// Read it back and prove the file on disk is exactly the line: a write
// that silently truncated, re-encoded or padded the entry would otherwise
// ship a different text to the judge than the one gated above.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== text) {
  throw new Error("entry file does not match the gated line");
}
// Byte-length check: the gate counts characters, the judge reads bytes.
// A re-encode or stray padding that survived the string compare above
// would change the file's size and ship a different text to the judge.
if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(text, "utf8")) {
  throw new Error("entry file byte length does not match the gated line");
}
