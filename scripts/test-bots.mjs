import test from "node:test";
import assert from "node:assert/strict";
import { isBlockedCrawler } from "../lib/seo/botPolicy.ts";

const CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const CUBOT =
  "Mozilla/5.0 (Linux; Android 9; CUBOT X19) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";

test("search, social and ChatGPT fetchers pass", () => {
  for (const ua of [
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)",
    "ChatGPT-User/1.0",
    "facebookexternalhit/1.1",
    "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
    "WhatsApp/2.23.20.0",
  ]) {
    assert.equal(isBlockedCrawler(ua), false, ua);
  }
});

test("real browsers are never blocked", () => {
  assert.equal(isBlockedCrawler(CHROME), false);
  assert.equal(isBlockedCrawler(CUBOT), false, "phone model names contain 'BOT'");
});

test("listed and brand-new crawlers are blocked", () => {
  for (const ua of [
    "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
    "Mozilla/5.0 (compatible; SomeNewBot/1.0; +https://example.com/bot)",
    "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)",
    "Screaming Frog SEO Spider/20.2",
  ]) {
    assert.equal(isBlockedCrawler(ua), true, ua);
  }
});

test("monitors and plain CLI clients pass", () => {
  for (const ua of ["UptimeRobot/2.0", "curl/8.4.0", "python-requests/2.31.0", ""]) {
    assert.equal(isBlockedCrawler(ua), false, ua || "(empty)");
  }
});

test("a UA claiming both Googlebot and a blocked crawler is rejected", () => {
  assert.equal(
    isBlockedCrawler("Googlebot/2.1 (compatible; AhrefsBot/7.0)"),
    true
  );
});
