#!/usr/bin/env node
/**
 * Check what a Substrate chain exposes for XCM integration.
 *
 * The XCM SDK needs specific pallets, methods and runtime APIs. A chain can look
 * connected and still reject a transfer because one of them is missing. This
 * prints the four that decide whether a route can be built and dry run.
 *
 * Usage:
 *   npm install @paraspell/sdk
 *   node check-chain-capabilities.mjs Centrifuge Pendulum Peaq Heima
 */

import { Builder } from '@paraspell/sdk';

const TYPE_AND_THEN = 'transfer_assets_using_type_and_then';
const pad = (value, width) => String(value).padEnd(width);

const chains = process.argv.slice(2);

if (chains.length === 0) {
  console.error('Usage: node check-chain-capabilities.mjs <chain> [chain ...]');
  process.exit(1);
}

const header = [
  pad('chain', 18),
  pad('pallet', 14),
  pad('typeThen', 10),
  pad('transferAssets', 16),
  pad('DryRunApi', 11),
  pad('XcmPaymentApi', 15),
  'native',
].join('');

console.log(header);

for (const chain of chains) {
  const api = Builder().from(chain).api;
  let row;

  try {
    await api.init(chain);

    const pallet = api.hasPallet(chain, 'XcmPallet') ? 'XcmPallet' : 'PolkadotXcm';
    const typeThen = await api.hasMethod(pallet, TYPE_AND_THEN);
    const transferAssets = await api.hasMethod(pallet, 'transfer_assets');
    const dryRun = api.hasDryRunSupport(chain);
    const paymentApi = await api.hasRuntimeApi('XcmPaymentApi').catch(() => false);
    const props = await api.getSystemProperties();

    row = [
      pad(chain, 18),
      pad(pallet, 14),
      pad(typeThen ? 'yes' : 'no', 10),
      pad(transferAssets ? 'yes' : 'no', 16),
      pad(dryRun ? 'yes' : 'no', 11),
      pad(paymentApi ? 'yes' : 'no', 15),
      `${props?.tokenSymbol ?? '?'} (${props?.tokenDecimals ?? '?'} decimals)`,
    ].join('');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    row = [
      pad(chain, 18),
      pad('-', 14),
      pad('-', 10),
      pad('-', 16),
      pad('-', 11),
      pad('-', 15),
      `error: ${message.slice(0, 80)}`,
    ].join('');
  } finally {
    try {
      await api.disconnect(true);
    } catch {
      /* ignore */
    }
  }

  console.log(row);
}

process.exit(0);
