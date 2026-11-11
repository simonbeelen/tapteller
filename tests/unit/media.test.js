import { test } from "node:test";
import assert from "node:assert/strict";
import { cssUrl, isAfbeelding, isGif } from "../../assets/js/lib/media.js";

test("alleen data-afbeeldingen zijn geldige foto's", () => {
  assert.equal(isAfbeelding("data:image/png;base64,AAAA"), true);
  assert.equal(isAfbeelding("https://x.be/a.png"), false);
  assert.equal(isAfbeelding("javascript:alert(1)"), false);
  assert.equal(isAfbeelding(null), false);
});

test("gifs: data-gif of https-link", () => {
  assert.equal(isGif("data:image/gif;base64,AAAA"), true);
  assert.equal(isGif("https://media.giphy.com/x.gif"), true);
  assert.equal(isGif("http://onveilig.be/x.gif"), false);
  assert.equal(isGif("data:image/png;base64,AAAA"), false);
});

test("cssUrl haalt tekens weg waarmee je uit de url() kan breken", () => {
  assert.equal(cssUrl('data:image/png;base64,AA"A)\n'), 'url("data:image/png;base64,AAA)")');
  assert.ok(!cssUrl('a"b\\c').slice(5, -2).includes('"'));
});
