#!/usr/bin/env node
import { Builder } from '@paraspell/sdk'

const METHODS = [
  'transfer_assets_using_type_and_then',
  'limited_reserve_transfer_assets',
  'reserve_transfer_assets',
  'limited_teleport_assets',
]
const RUNTIME_APIS = [
  ['DryRunApi', 'dry_run_call'],
  ['XcmPaymentApi', 'query_xcm_weight'],
]

const fmt = (v) => (v === true ? 'yes' : v === false ? 'no' : '?')

const classify = (error) => {
  const msg = error instanceof Error ? error.message : String(error)
  if (/not found/i.test(msg)) return false
  if (/Incompatible runtime entry/i.test(msg)) return true
  return null
}

const probe = async (fn) => {
  try {
    await fn()
    return true
  } catch (e) {
    const first = classify(e)
    if (first !== null) return first
    await new Promise((r) => setTimeout(r, 1500))
    try {
      await fn()
      return true
    } catch (e2) {
      return classify(e2)
    }
  }
}

const chains = process.argv.slice(2)
if (chains.length === 0) {
  console.error('Usage: node check-chain-capabilities.mjs <chain> [chain ...]')
  process.exit(1)
}

for (const chain of chains) {
  const api = Builder().from(chain).api
  try {
    await api.init(chain)
    const pallet = api.hasPallet(chain, 'XcmPallet') ? 'XcmPallet' : 'PolkadotXcm'
    const props = await api.getSystemProperties()
    console.log(`\n${chain} (${pallet}, ${props?.tokenSymbol ?? '?'} ${props?.tokenDecimals ?? '?'} decimals)`)

    for (const method of METHODS) {
      const result = api.untypedApi
        ? await probe(() => api.untypedApi.tx[pallet][method]().getEncodedData())
        : await api.hasMethod(pallet, method)
      console.log(`  ${method.padEnd(34)} ${fmt(result)}`)
    }

    for (const [name, method] of RUNTIME_APIS) {
      const live = api.untypedApi
        ? await probe(() => api.untypedApi.apis[name][method]())
        : await api.hasRuntimeApi(name)
      const registry =
        name === 'DryRunApi'
          ? api.hasDryRunSupport(chain)
          : api.hasXcmPaymentApiSupport(chain)
      console.log(`  ${name.padEnd(34)} live ${fmt(live).padEnd(4)} registry ${registry ? 'yes' : 'no'}`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`\n${chain} (error: ${message.slice(0, 100)})`)
  } finally {
    try {
      await api.disconnect(true)
    } catch {}
  }
}
process.exit(0)
