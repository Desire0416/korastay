import { test } from "node:test";
import assert from "node:assert/strict";
import {
  nightsBetween,
  dateRangesOverlap,
  slugify,
  initials,
  truncate,
  pluralize,
  parseJsonArray,
  stringifyArray,
  formatPrice,
  formatPriceShort,
  generateReference,
  addDays,
} from "../src/lib/utils";

test("nightsBetween : nombre de nuits entre deux dates", () => {
  assert.equal(nightsBetween("2026-06-10", "2026-06-13"), 3);
  assert.equal(nightsBetween("2026-06-10", "2026-06-10"), 0);
  // Date de fin anterieure : borne a 0 (jamais negatif)
  assert.equal(nightsBetween("2026-06-13", "2026-06-10"), 0);
});

test("dateRangesOverlap : detecte les chevauchements", () => {
  const d = (s: string) => new Date(s);
  // Chevauchement
  assert.equal(dateRangesOverlap(d("2026-06-10"), d("2026-06-15"), d("2026-06-14"), d("2026-06-20")), true);
  // Adjacents (fin = debut) : pas de chevauchement
  assert.equal(dateRangesOverlap(d("2026-06-10"), d("2026-06-15"), d("2026-06-15"), d("2026-06-20")), false);
  // Disjoints
  assert.equal(dateRangesOverlap(d("2026-06-10"), d("2026-06-12"), d("2026-06-20"), d("2026-06-25")), false);
});

test("addDays : decale une date sans muter l'original", () => {
  const base = new Date("2026-06-10T00:00:00");
  const next = addDays(base, 5);
  assert.equal(next.getDate(), 15);
  assert.equal(base.getDate(), 10); // immutabilite
});

test("slugify : minuscule, sans accents ni caracteres speciaux", () => {
  assert.equal(slugify("Grand-Bassam"), "grand-bassam");
  assert.equal(slugify("Hotel de la Plage !"), "hotel-de-la-plage");
  assert.equal(slugify("  Cote d'Ivoire  "), "cote-d-ivoire");
});

test("initials : initiales en majuscules avec repli", () => {
  assert.equal(initials("Marc", "Yao"), "MY");
  assert.equal(initials("awa", null), "A");
  assert.equal(initials(null, null), "?");
});

test("truncate : tronque au-dela de la limite", () => {
  assert.equal(truncate("Bonjour", 20), "Bonjour");
  assert.equal(truncate("Bonjour tout le monde", 7), "Bonjour...");
});

test("pluralize : gestion du singulier/pluriel", () => {
  assert.equal(pluralize(1, "nuit"), "nuit");
  assert.equal(pluralize(0, "nuit"), "nuit");
  assert.equal(pluralize(3, "nuit"), "nuits");
  assert.equal(pluralize(2, "cheval", "chevaux"), "chevaux");
});

test("parseJsonArray / stringifyArray : aller-retour JSON", () => {
  assert.deepEqual(parseJsonArray('["wifi","piscine"]'), ["wifi", "piscine"]);
  assert.deepEqual(parseJsonArray(null), []);
  assert.deepEqual(parseJsonArray("wifi, piscine, clim"), ["wifi", "piscine", "clim"]); // repli CSV
  assert.equal(stringifyArray(["a", "b"]), '["a","b"]');
  assert.deepEqual(parseJsonArray(stringifyArray(["x", "y"])), ["x", "y"]);
});

test("formatPrice : format F CFA sans decimales", () => {
  assert.equal(formatPrice(1000).replace(/\s/g, ""), "1000FCFA");
  assert.equal(formatPrice(1500000).replace(/\s/g, ""), "1500000FCFA");
  assert.equal(formatPrice(1000, "EUR").replace(/\s/g, ""), "1000EUR");
});

test("formatPriceShort : abreviations k / M", () => {
  assert.equal(formatPriceShort(500), "500");
  assert.equal(formatPriceShort(5000), "5k");
  assert.equal(formatPriceShort(2000000), "2M");
  assert.equal(formatPriceShort(2500000), "2.5M");
});

test("generateReference : prefixe et unicite raisonnable", () => {
  const a = generateReference();
  const b = generateReference();
  assert.ok(a.startsWith("KS-"));
  assert.notEqual(a, b);
  assert.ok(generateReference("PAY").startsWith("PAY-"));
});
