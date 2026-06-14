import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeResidencePrice,
  computePackPrice,
  estimateResidenceRefund,
  estimatePackRefund,
  stayDiscountRate,
} from "../src/lib/pricing";

const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;

test("computeResidencePrice : nuitees, frais de service 7% et total", () => {
  const r = computeResidencePrice({
    pricePerNight: 50000,
    cleaningFee: 10000,
    startDate: "2026-06-10",
    endDate: "2026-06-13",
  });
  assert.equal(r.nights, 3);
  assert.equal(r.subtotal, 150000);
  assert.equal(r.cleaningFee, 10000);
  assert.equal(r.serviceFee, 10500); // round(150000 * 0.07)
  // 3 nuits -> remise duree de sejour de 10% sur le total brut (170500).
  assert.equal(r.stayDiscountRate, 0.1);
  assert.equal(r.stayDiscount, 17050);
  assert.equal(r.total, 153450); // 170500 - 17050
});

test("computeResidencePrice : prend en compte les extras et un taux personnalise", () => {
  const r = computeResidencePrice({
    pricePerNight: 40000,
    startDate: "2026-06-10",
    endDate: "2026-06-12",
    extraServices: 15000,
    serviceFeeRate: 0.1,
  });
  assert.equal(r.nights, 2);
  assert.equal(r.subtotal, 80000);
  assert.equal(r.cleaningFee, 0);
  assert.equal(r.extras, 15000);
  assert.equal(r.serviceFee, 8000); // round(80000 * 0.10)
  // 2 nuits -> remise 10% sur le brut (80000+15000+8000 = 103000).
  assert.equal(r.stayDiscount, 10300);
  assert.equal(r.total, 92700); // 103000 - 10300
});

test("stayDiscountRate : paliers de duree (2-7 nuits = 10%, >7 = 15%)", () => {
  assert.equal(stayDiscountRate(1), 0);
  assert.equal(stayDiscountRate(2), 0.1);
  assert.equal(stayDiscountRate(7), 0.1);
  assert.equal(stayDiscountRate(8), 0.15);
  assert.equal(stayDiscountRate(30), 0.15);
});

test("computeResidencePrice : aucune remise pour 1 nuit", () => {
  const r = computeResidencePrice({ pricePerNight: 50000, startDate: "2026-06-10", endDate: "2026-06-11" });
  assert.equal(r.nights, 1);
  assert.equal(r.stayDiscount, 0);
  assert.equal(r.total, 53500); // 50000 + round(50000*0.07)=3500
});

test("computeResidencePrice : remise de 15% au-dela de 7 nuits", () => {
  const r = computeResidencePrice({ pricePerNight: 50000, startDate: "2026-06-10", endDate: "2026-06-20" });
  assert.equal(r.nights, 10);
  assert.equal(r.subtotal, 500000);
  assert.equal(r.serviceFee, 35000); // round(500000*0.07)
  assert.equal(r.stayDiscountRate, 0.15);
  assert.equal(r.stayDiscount, 80250); // round(535000*0.15)
  assert.equal(r.total, 454750); // 535000 - 80250
});

test("computePackPrice : personnes supplementaires facturees", () => {
  const r = computePackPrice({
    basePrice: 200000,
    basePersons: 2,
    extraPersonPrice: 30000,
    persons: 4,
  });
  assert.equal(r.subtotal, 200000);
  assert.equal(r.extras, 60000); // 2 personnes * 30000
  assert.equal(r.serviceFee, 18200); // round(260000 * 0.07)
  assert.equal(r.total, 278200);
});

test("computePackPrice : aucune personne supplementaire", () => {
  const r = computePackPrice({
    basePrice: 120000,
    basePersons: 2,
    extraPersonPrice: 30000,
    persons: 1,
  });
  assert.equal(r.extras, 0);
  assert.equal(r.serviceFee, 8400); // round(120000 * 0.07)
  assert.equal(r.total, 128400);
});

test("estimateResidenceRefund : integral a plus de 72h, hors frais de service", () => {
  const checkIn = new Date(Date.now() + 5 * DAY);
  const r = estimateResidenceRefund(170500, 10500, checkIn);
  assert.equal(r.refundRate, 1);
  assert.equal(r.refundableAmount, 160000);
  assert.equal(r.serviceFeeRefunded, false);
});

test("estimateResidenceRefund : 50% entre 24h et 72h", () => {
  const checkIn = new Date(Date.now() + 2 * DAY);
  const r = estimateResidenceRefund(170500, 10500, checkIn);
  assert.equal(r.refundRate, 0.5);
  assert.equal(r.refundableAmount, 80000); // round(160000 * 0.5)
});

test("estimateResidenceRefund : aucun remboursement a moins de 24h", () => {
  const checkIn = new Date(Date.now() + 2 * HOUR);
  const r = estimateResidenceRefund(170500, 10500, checkIn);
  assert.equal(r.refundRate, 0);
  assert.equal(r.refundableAmount, 0);
});

test("estimatePackRefund : integral a plus de 7 jours", () => {
  const departure = new Date(Date.now() + 10 * DAY);
  const r = estimatePackRefund(278200, 18200, departure);
  assert.equal(r.refundRate, 1);
  assert.equal(r.refundableAmount, 260000);
});

test("estimatePackRefund : 50% entre 3 et 7 jours, 0 en dessous", () => {
  const mid = estimatePackRefund(278200, 18200, new Date(Date.now() + 5 * DAY));
  assert.equal(mid.refundRate, 0.5);
  assert.equal(mid.refundableAmount, 130000);

  const late = estimatePackRefund(278200, 18200, new Date(Date.now() + 1 * DAY));
  assert.equal(late.refundRate, 0);
  assert.equal(late.refundableAmount, 0);
});
