import test from "node:test";
import assert from "node:assert/strict";
import {
  ALLOWED_BOTS,
  BLOCKED_BOTS,
  DISALLOWED_QUERY_PATTERNS,
  PRIVATE_PATHS,
  buildRobotsRules,
} from "../lib/seo/robotsPolicy.ts";

test("Google, Bing, and preview fetchers are not blocked", () => {
  const blocked = new Set(BLOCKED_BOTS.map((bot) => bot.toLowerCase()));
  for (const bot of ALLOWED_BOTS) {
    assert.equal(blocked.has(bot.toLowerCase()), false, `${bot} must stay allowed`);
  }
});

test("ChatGPT search and user fetchers are allowed, training is not", () => {
  for (const bot of ["OAI-SearchBot", "ChatGPT-User"]) {
    assert.ok(ALLOWED_BOTS.includes(bot), `${bot} must be allowed`);
    assert.equal(BLOCKED_BOTS.includes(bot), false, `${bot} must not be blocked`);
  }
  assert.ok(BLOCKED_BOTS.includes("GPTBot"));
});

test("AI and SEO scrapers are blocked", () => {
  for (const bot of [
    "GPTBot",
    "ClaudeBot",
    "CCBot",
    "AhrefsBot",
    "SemrushBot",
    "MJ12bot",
    "AI2Bot",
    "ImagesiftBot",
    "Screaming Frog SEO Spider",
  ]) {
    assert.ok(BLOCKED_BOTS.includes(bot), `${bot} must be blocked`);
  }
});

test("search results stay out of the crawl space", () => {
  assert.ok(PRIVATE_PATHS.includes("/search"));
  const rules = buildRobotsRules();
  const wildcard = rules.find((rule) => rule.userAgent === "*");
  assert.ok(wildcard.disallow.includes("/search"));
});

test("private paths stay disallowed", () => {
  for (const path of ["/admin/", "/api/", "/login", "/profile", "/my-ticket/"]) {
    assert.ok(PRIVATE_PATHS.includes(path), `${path} must stay private`);
  }
});

test("wildcard rules allow public pages and do not allow the image optimizer", () => {
  const rules = buildRobotsRules();
  const wildcard = rules.find((rule) => rule.userAgent === "*");
  assert.ok(wildcard);
  assert.equal(wildcard.allow, "/");
  assert.equal(JSON.stringify(wildcard).includes("/_next/image"), false);
});

test("tracking-parameter duplicates are disallowed for everyone", () => {
  const wildcard = buildRobotsRules().find((rule) => rule.userAgent === "*");
  for (const pattern of DISALLOWED_QUERY_PATTERNS) {
    assert.ok(wildcard.disallow.includes(pattern), `${pattern} must be disallowed`);
  }
});

test("blocked bots disallow the whole site", () => {
  const rules = buildRobotsRules();
  for (const bot of BLOCKED_BOTS) {
    const rule = rules.find((item) => item.userAgent === bot);
    assert.ok(rule, `${bot} rule missing`);
    assert.equal(rule.disallow, "/");
  }
});
