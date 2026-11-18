import test from 'node:test';
import assert from 'node:assert';
import { FactResolver } from '../../src/services/factResolver.js';

test('FactResolver: detects superseded food prices (1,200 supersedes 1,000)', () => {
  const resolver = new FactResolver('test_session');
  const facts = [
    {
      _id: 'fact_001',
      category: 'food',
      field: 'pricePerPerson',
      value: 1000,
      evidenceText: 'Standard lunch box Rs 1,000 per head.',
      messageId: 'msg_003',
    },
    {
      _id: 'fact_002',
      category: 'food',
      field: 'pricePerPerson',
      value: 1200,
      evidenceText: 'Standard lunch box ab Rs 1,200 per head hoga',
      messageId: 'msg_004',
    },
  ];
  const messages = [
    { _id: 'msg_003', sender: 'Caterer, WhatsApp', rawText: 'Standard lunch box Rs 1,000 per head.' },
    { _id: 'msg_004', sender: 'Caterer, WhatsApp', rawText: 'Salam bhai! Standard lunch box ab Rs 1,200 per head hoga, basic wala Rs 800. Delivery free hai.' },
  ];

  const { acceptedFacts } = resolver.resolveFacts(facts, messages);
  const acceptedFoodPrice = acceptedFacts.find((f) => f.field === 'pricePerPerson');

  assert.strictEqual(acceptedFoodPrice.value, 1200);
  assert.strictEqual(acceptedFoodPrice.supersedesFactId, 'fact_001');
  assert.strictEqual(facts[0].decision, 'superseded');
});

test('FactResolver: rejects unauthorized proposals (e.g. Student society DJ proposal)', () => {
  const resolver = new FactResolver('test_session');
  const facts = [
    {
      _id: 'fact_dj',
      category: 'general',
      field: 'unauthorized_proposal',
      value: 50000,
      evidenceText: 'Can we get a DJ for the closing? The quote is Rs 50,000.',
      messageId: 'msg_007',
    },
  ];
  const messages = [
    { _id: 'msg_007', sender: 'Student society, WhatsApp', rawText: 'Can we get a DJ for the closing? The quote is Rs 50,000.' },
  ];

  const { acceptedFacts, rejectedRecords } = resolver.resolveFacts(facts, messages);
  assert.strictEqual(acceptedFacts.length, 0);
  assert.strictEqual(rejectedRecords.length, 1);
  assert.strictEqual(rejectedRecords[0].reasonCode, 'UNAUTHORIZED_PROPOSAL');
});
