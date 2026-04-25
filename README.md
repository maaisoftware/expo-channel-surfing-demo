# expo-channel-surfing-demo

Minimal Expo app that demonstrates **runtime channel switching** with `expo-updates` v29+ — the no-backend variant from the MAAI blog post [Channel surfing in Expo Updates](https://maaisoftwareinc.ca/en/blog/mobile-engineering/channel-surfing-expo-updates).

The whole demo is one screen: a big coloured background, a label that names the current branch, and a "channel surfer" panel where a tester types a PR number and the app reloads onto that PR's bundle.

```
+-----------------------+
|                       |
|       branch          |
|   ┌─────────────┐     |
|   │   main      │     |
|   └─────────────┘     |
|   embedded: production|
|                       |
+=======================+    ← coloured hero (slate / blue / red per branch)
|  channel surfer       |
|  ┌──────────┐ ┌─────┐ |    ← always-present picker
|  │ PR #     │ │switch│|
|  └──────────┘ └─────┘ |
|  reset to production  |
+-----------------------+
```

## What's wired

| File | What it does |
|---|---|
| `App.tsx` | The single screen + `ChannelPickerSimple` (PR-number input). Calls `Updates.setUpdateRequestHeadersOverride({ 'expo-channel-name': 'pr-N' })` then `Updates.reloadAsync()`. |
| `app.json` | EAS Update config. **You must replace `REPLACE_WITH_YOUR_EAS_PROJECT_ID` with your real EAS project ID.** |
| `eas.json` | Two build profiles: `internal` (sets `EXPO_PUBLIC_INTERNAL_BUILD=1` and channel `internal-default`) and `production`. |
| `.github/workflows/preview-channel.yml` | On every PR push: `eas update --branch pr-N` and ensures channel `pr-N` exists. Posts a PR comment with usage instructions. Requires `EXPO_TOKEN` repo secret. |

## The two open PRs

The two open PRs in this repo are the demo. They differ from `main` by two constants in `App.tsx` only:

- **PR #1 — `feat/blue-screen`**: changes `BG_COLOR` to `#2563eb` and `BRANCH_LABEL` to `feat: blue screen`.
- **PR #2 — `feat/red-screen`**: changes `BG_COLOR` to `#dc2626` and `BRANCH_LABEL` to `feat: red screen`.

When CI publishes channels for these PRs, you can install the `internal-default` build, type `1` or `2` into the channel surfer, tap **Switch**, and watch the same install reload onto the blue or red bundle. No new TestFlight build, no uninstall.

## Running it for real

This repo is a working skeleton, not a hosted demo — to actually exercise channel surfing you need to wire it to your own EAS account.

1. **Clone + install**
   ```bash
   git clone https://github.com/maaisoftware/expo-channel-surfing-demo
   cd expo-channel-surfing-demo
   npm install
   ```

2. **Create the EAS project**
   ```bash
   npx eas init
   ```
   This creates the project on your EAS dashboard and writes the project ID into `app.json`.

3. **Replace the placeholder URL.** Open `app.json` and replace `REPLACE_WITH_YOUR_EAS_PROJECT_ID` with the project ID `eas init` printed (it's the slug of your `u.expo.dev/<id>` URL).

4. **First internal build**
   ```bash
   npx eas build --profile internal --platform ios
   # or --platform android
   ```
   Install the resulting build on a test device (TestFlight, internal distribution, or simulator).

5. **Wire CI**
   - In your GitHub repo settings, add a secret called `EXPO_TOKEN` with a [robot access token](https://expo.dev/accounts/[your-account]/settings/access-tokens) scoped to your project.
   - Push the two demo branches (`feat/blue-screen`, `feat/red-screen`) and open them as PRs. CI publishes a channel per PR.

6. **Try it**
   - Open the internal build on your test device.
   - Type `1` (or whichever PR number) in the channel surfer, tap **Switch**.
   - The app reloads onto the PR's bundle. The background changes colour. The same install, same login state.
   - Tap **Reset to production** to go back.

## What this demo intentionally doesn't do

- No backend / token-proxy endpoint. That's [Option A](https://maaisoftwareinc.ca/en/blog/mobile-engineering/channel-surfing-expo-updates#wiring-it-into-cicd) in the blog post — better UX (testers see PR titles, not numbers), but adds a server. We picked Option B here so the repo runs with zero infrastructure beyond EAS itself.
- No source-map upload to Sentry / Bugsnag. In production you would chain `npx sentry-expo-upload-sourcemaps dist` after the `eas update` step in CI; that's out of scope for the skeleton.
- No native module changes between branches. Channel surfing only works between channels that share the same runtime version (fingerprint policy). The two demo PRs only change JS, so they all map to the same fingerprint.

## Things worth validating with this demo

The blog post makes a few claims that are documented for some and inferred for others. Wiring this demo to a real EAS account is the cheapest way to verify them on your target SDK:

- **Cold-start persistence of the override.** Switch to `pr-1`, force-quit, cold launch. Did the app come back on `pr-1` or on the embedded channel?
- **The override only affects the *next* update fetch.** First launch after a fresh install still runs the embedded JS; the switch only takes effect after the first reload.
- **Runtime version mismatches fail loudly.** Try changing a native dep on a branch (e.g. add `expo-camera`) and watch the channel switch fail to apply on a binary built without it.

## License

MIT. See [LICENSE](./LICENSE).
