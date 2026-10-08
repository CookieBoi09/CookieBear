import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readMemeFolders, folderUrl } from '../src/lib/memes.js';

test('discovers nested and empty folders with direct images, safe URLs and natural order', async () => {
  const root = await mkdtemp(join(tmpdir(), 'cookiebear-memes-'));
  try {
    const name = "Cats & dog's #1 % 🐻";
    await mkdir(join(root, name, 'Reactions'), { recursive: true });
    await mkdir(join(root, 'Empty'));
    await mkdir(join(root, '.hidden'));
    for (const file of ['10.JPG', '2.png', 'notes.txt', '.secret.png']) await writeFile(join(root, name, file), '');
    await writeFile(join(root, name, 'Reactions', 'wow.gif'), '');
    await writeFile(join(root, 'root.webp'), '');
    await symlink(root, join(root, 'loop'));
    const folders = await readMemeFolders(root);
    assert.equal(folders.length, 4);
    const main = folders.find((folder) => folder.parts.length === 0);
    assert.deepEqual(main.children.map((child) => child.name), [name, 'Empty']);
    assert.deepEqual(main.images.map((image) => image.name), ['root']);
    const cats = folders.find((folder) => folder.name === name);
    assert.deepEqual(cats.images.map((image) => image.name), ['2', '10']);
    assert.equal(cats.children[0].imageCount, 1);
    assert.equal(decodeURIComponent(cats.images[0].src), `/Meme's folder/${name}/2.png`);
    assert.match(cats.url, /^\/memes\/cats-dog-s-1-[a-f0-9]{12}\/$/);
    assert.notEqual(folderUrl(['Cats']), folderUrl(['cats']));
    assert(!cats.url.includes('#'));
    assert.equal(folders.find((folder) => folder.name === 'Empty').images.length, 0);
    assert.equal(folderUrl([]), '/memes/');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
