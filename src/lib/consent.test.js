import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  needsConsent,
  teacherConsentFields,
  marketingFields,
  TERMS_VERSION,
  MARKETING_CONSENT_VERSION,
} from './consent.js';

test('needsConsent: existing doc without termsAcceptedAt → true; accepted or not created → false', () => {
  assert.equal(needsConsent(true, { role: 'teacher' }), true);
  assert.equal(needsConsent(true, { termsAcceptedAt: { seconds: 1 } }), false);
  assert.equal(needsConsent(false, undefined), false);
});

test('teacherConsentFields: marketing defaults to the given choice, all five fields', () => {
  const off = teacherConsentFields(false);
  assert.deepEqual(Object.keys(off).sort(), [
    'marketingConsent',
    'marketingConsentAt',
    'marketingConsentVersion',
    'termsAcceptedAt',
    'termsVersion',
  ]);
  assert.equal(off.marketingConsent, false);
  assert.equal(off.termsVersion, TERMS_VERSION);
  assert.equal(teacherConsentFields(true).marketingConsent, true);
});

test('marketingFields: boolean, version, timestamp even when withdrawn', () => {
  const f = marketingFields(undefined);
  assert.equal(f.marketingConsent, false);
  assert.equal(f.marketingConsentVersion, MARKETING_CONSENT_VERSION);
  assert.ok(f.marketingConsentAt);
});
