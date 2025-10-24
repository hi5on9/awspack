# awspack Monorepo

This repo maintains two npm bundles that keep AWS SDK v3 clients up to date:

- [`awspack`](https://www.npmjs.com/package/awspack): full AWS client catalog.
- [`awspack-lite`](https://www.npmjs.com/package/awspack-lite): compact AWS SDK v3 bundle.

Both ship ESM re-exports so downstream bundlers can tree-shake unused services.

A scheduled workflow runs weekly to update clients, rebuild artifacts, publish both packages, and push changes automatically.
Future domain-specific bundles (e.g., analytics-only, ML-only) may be added as needs arise.
