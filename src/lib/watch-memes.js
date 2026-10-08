import { resolve, relative, isAbsolute } from 'node:path';

/** Refresh static-path discovery when public gallery files change in development. */
export function watchMemes() {
  return {
    name: 'watch-meme-folders',
    apply: /** @type {const} */ ('serve'),
    configureServer(server) {
      const root = resolve(server.config.publicDir, 'Memes folder');
      let timer;
      const onChange = (event, file) => {
        if (!['add', 'unlink', 'addDir', 'unlinkDir', 'change'].includes(event)) return;
        const path = relative(root, resolve(file));
        if (path.startsWith('..') || isAbsolute(path)) return;
        clearTimeout(timer);
        // getStaticPaths is cached by Astro. A reload alone retains stale props.
        // Debounce batches of pasted files into one server restart.
        timer = setTimeout(() => {
          server.restart().catch((error) => server.config.logger.error(String(error)));
        }, 250);
      };
      server.watcher.add(root);
      server.watcher.on('all', onChange);
      server.httpServer?.once('close', () => {
        clearTimeout(timer);
        server.watcher.off('all', onChange);
      });
    },
  };
}
