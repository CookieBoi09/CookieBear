import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const defaultRoot = resolve("public/Meme's folder");
const imageExtension = /\.(avif|gif|jpe?g|png|webp|svg)$/i;
const encode = (part) => encodeURIComponent(part).replace(/'/g, '%27');
// Stable safe route segments avoid reserved URL characters and duplicate slugs.
const routeSegment = (name) => `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'folder'}-${createHash('sha256').update(name).digest('hex').slice(0, 12)}`;
export const folderUrl = (parts) => `/memes/${parts.map(routeSegment).join('/')}${parts.length ? '/' : ''}`;

/** Read afresh for each build; preserve directory names and skip hidden files/symlinks. */
export async function readMemeFolders(root = defaultRoot) {
  const folders = [];
  async function visit(parts) {
    const entries = (await readdir(join(root, ...parts), { withFileTypes: true }))
      .filter((entry) => !entry.name.startsWith('.'))
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
    const folder = {
      parts,
      name: parts.at(-1) ?? 'Memes',
      url: folderUrl(parts),
      children: [],
      images: entries.filter((entry) => entry.isFile() && imageExtension.test(entry.name)).map((entry) => ({
        name: entry.name.replace(imageExtension, '').replace(/[-_]/g, ' '),
        src: `/${["Meme's folder", ...parts, entry.name].map(encode).join('/')}`,
      })),
    };
    folders.push(folder);
    for (const entry of entries.filter((entry) => entry.isDirectory())) {
      const child = await visit([...parts, entry.name]);
      folder.children.push({ name: child.name, url: child.url, imageCount: child.images.length, folderCount: child.children.length });
    }
    return folder;
  }
  await visit([]);
  return folders;
}
