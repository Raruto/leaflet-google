const http = require('node:http');
const esbuild = require('esbuild');
const cdnBundle = 'https://cdn.jsdelivr.net/gh/Raruto/leaflet-google@master/leaflet-google.js';

async function startServer(port = 8080) {
  const build = await esbuild.context({
    entryPoints: ['leaflet-google.js'],
    outfile: 'leaflet-google.min.js',
    minify: true,
  });
  try {
    await build.watch();
    const assets = await build.serve({ servedir: '.', host: '127.0.0.1', port: 0 });
    const server = http.createServer((request, response) => {
      const proxy = http.request({
        host: '127.0.0.1',
        port: assets.port,
        path: request.url,
        method: request.method,
        headers: { ...request.headers, host: `127.0.0.1:${assets.port}`, 'accept-encoding': 'identity' },
      }, assetResponse => {
        if (request.method !== 'GET' || !request.url.split('?')[0].endsWith('.html')) {
          response.writeHead(assetResponse.statusCode, assetResponse.headers);
          assetResponse.pipe(response);
          return;
        }
        const chunks = [];
        assetResponse.on('data', chunk => chunks.push(chunk));
        assetResponse.on('end', () => {
          const html = Buffer.concat(chunks).toString().replace(cdnBundle, '/leaflet-google.min.js');
          const headers = { ...assetResponse.headers, 'content-length': Buffer.byteLength(html) };
          delete headers['transfer-encoding'];
          delete headers['content-encoding'];
          response.writeHead(assetResponse.statusCode, headers);
          response.end(html);
        });
        assetResponse.on('error', error => response.destroy(error));
      });
      proxy.on('error', error => response.destroy(error));
      request.pipe(proxy);
    });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', resolve);
    });
    return {
      port: server.address().port,
      close: async () => {
        await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
        await build.dispose();
      },
    };
  } catch (error) {
    await build.dispose();
    throw error;
  }
}

async function main() {
  const server = await startServer();
  console.log(`Serving on http://127.0.0.1:${server.port}`);
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, async () => { await server.close(); });
  }
}

module.exports = { startServer };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
