import { test, expect } from '@playwright/test';
import { DbClient } from '../src/db/DbClient';

let db: DbClient;

test.beforeAll(() => {
  db = DbClient.fromEnv();
});

test.afterAll(async () => {
  await db.close();
});

test('seed customer exists', async () => {
const customer = await db.findCustomerByEmail('seed.user@example.com');

  expect(customer).not.toBeNull();
  expect(customer!.full_name).toBe('Seed User');
  expect(customer!.created_at).toBeInstanceOf(Date);
});