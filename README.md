# Trove releases

Public, signed release artifacts for [Trove](https://trove.place), a local-first
Mac app for collecting images, text and links into boards.

Trove's source repository is private. This repository contains only public
release notes, signed and notarized application ZIPs, and the static update
metadata read by installed copies of Trove.

## Update channel

The first beta supports Apple silicon Macs. Its update feed is:

```text
updates/darwin/arm64/RELEASES.json
```

Every ZIP referenced by that feed is signed with Trove's Developer ID identity
and notarized by Apple before it is uploaded as a GitHub Release asset.

## Preparing a release manifest

After the private app repository produces a signed and notarized ZIP, run:

```bash
node scripts/update-release-manifest.mjs <version> /absolute/path/to/Trove.zip
```

The script records the ZIP's public GitHub Release URL, byte size, and SHA-256
digest. Commit and push the manifest only as part of publishing that matching
release; never point the feed at an absent or unverified asset.

## Publishing a release

The private `trove-app` repository owns the source and build configuration. This
public repository is the distribution boundary. Publish in this order so an
installed app never sees metadata for a missing download:

1. Set the intended version in `trove-app/package.json` and build the Apple
   silicon ZIP from the private repository. Verify signing, notarization and
   Gatekeeper acceptance.
2. Create a public GitHub Release and upload that exact ZIP:

   ```bash
   gh release create v<VERSION> /absolute/path/to/Trove-darwin-arm64-<VERSION>.zip \
     --repo zoeingwingkei/trove-releases \
     --title "Trove <VERSION>" \
     --notes-file /absolute/path/to/release-notes.md
   ```

3. From this repository, generate and inspect the update metadata:

   ```bash
   node scripts/update-release-manifest.mjs <VERSION> \
     /absolute/path/to/Trove-darwin-arm64-<VERSION>.zip
   ```

4. Commit and push `updates/darwin/arm64/RELEASES.json`. Installed Apple silicon
   builds will discover the release on their next launch.

Do not publish a manifest entry before its matching GitHub Release asset, and do
not replace an asset after its checksum has been published. If a build changes,
release it under a new version.
