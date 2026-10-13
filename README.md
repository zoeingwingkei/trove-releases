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
