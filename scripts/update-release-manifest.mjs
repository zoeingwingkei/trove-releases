import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const [, , version, zipArgument] = process.argv;

if (!version || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error(
    'Usage: node scripts/update-release-manifest.mjs <version> <zip-path>',
  );
}

if (!zipArgument) {
  throw new Error('A signed and notarized ZIP path is required.');
}

const repository = 'zoeingwingkei/trove-releases';
const manifestPath = new URL(
  '../updates/darwin/arm64/RELEASES.json',
  import.meta.url,
);
const zipPath = path.resolve(zipArgument);
const zipName = path.basename(zipPath);
const bytes = await readFile(zipPath);
const details = await stat(zipPath);
const sha256 = createHash('sha256').update(bytes).digest('hex');

let manifest = { currentRelease: version, releases: [] };
try {
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
    throw error;
  }
}
const release = {
  version,
  updateTo: {
    version,
    pub_date: new Date().toISOString(),
    name: `Trove ${version}`,
    notes: `Trove ${version} for Apple silicon.`,
    url: `https://github.com/${repository}/releases/download/v${version}/${zipName}`,
    sha256,
    size: details.size,
  },
};

manifest.currentRelease = version;
manifest.releases = [
  ...manifest.releases.filter((entry) => entry.version !== version),
  release,
];

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Updated ${manifestPath.pathname}`);
console.log(`SHA-256 ${sha256}`);
console.log(`Size ${details.size} bytes`);
