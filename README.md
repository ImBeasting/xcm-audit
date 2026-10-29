# XCM Audit

Fixed-scope reviews of Polkadot XCM integrations. Every finding ships with the failing test or the
traced call path that proves it.

Live page: https://imbeasting.github.io/xcm-audit/

## Offers

- 48-hour review, $250: one integration path, up to 2 findings, delivered in 48 hours.
- Integration audit, $350: up to 5 findings, delivered in 5 business days.
- Audit and fixes, $750: 10 findings, or 5 plus patches with regression tests for the top 3.

## Proof of method

A free public teardown of a live wallet integration bug:
https://github.com/swush-labs/swush-app/issues/73

## Tools

- [XCM capability checker](https://github.com/ImBeasting/xcm-capability-checker): prints the four XCM
  transfer methods and two runtime APIs a Substrate chain exposes, with the 45-chain matrix from
  2026-10-29 as JSON and CSV. MIT licensed.

## Writing

- [Seven ways an XCM transfer fails without an error](https://imbeasting.github.io/xcm-audit/writing/seven-ways-xcm-transfers-fail.html)
- [Four ways wallets silently corrupt cross-chain amounts](https://imbeasting.github.io/xcm-audit/writing/four-ways-wallets-corrupt-amounts.html)

## Contact

woods.d.tyler@gmail.com
