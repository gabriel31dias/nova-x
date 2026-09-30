// Run: node --experimental-strip-types src/lib/fees.check.ts
import assert from 'node:assert/strict';
import { simulateSale, simulateWithdrawal, releaseDate } from './fees.ts';

// R$100 PIX at 1.99% + R$1.00 -> fee 2.99, net 97.01
assert.deepEqual(simulateSale(100, 1.99, 1), { fee: 2.99, net: 97.01, reserve: 0, availableNow: 97.01 });
// rounding: 3.99% of 97.00 = 3.8703 -> 3.87
assert.equal(simulateSale(97, 3.99, 0).fee, 3.87);
// 10% reserve on net
assert.deepEqual(simulateSale(200, 5, 0, 10), { fee: 10, net: 190, reserve: 19, availableNow: 171 });
// fee larger than the sale never goes negative
assert.equal(simulateSale(1, 1.99, 2).net, 0);
assert.equal(simulateWithdrawal(150, 3.99), 146.01);
// half-cent: 4.99% of 250 + 0.50 = 12.975 -> 12.98
assert.equal(simulateSale(250, 4.99, 0.5).fee, 12.98);
assert.equal(simulateSale(100.5, 1, 0).fee, 1.01); // 1.005 in float is 1.00499...
assert.equal(simulateWithdrawal(2, 3.99), 0);
// D+30 crosses month boundary
assert.equal(releaseDate(30, new Date(2026, 0, 15)).toDateString(), new Date(2026, 1, 14).toDateString());

console.log('fees ok');
