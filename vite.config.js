import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In-memory dev audit logs store for localhost:5173
const devAuditLogs = [];

/**
 * Vite Dev Server Middleware mô phỏng hoàn chỉnh 2 API /api/audit và /api/audit-list
 * khi đang phát triển trên máy local (npm run dev).
 * Khi deploy lên Vercel, Vercel tự động chạy 2 file serverless trong thư mục /api.
 */
function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;

        // POST /api/audit
        if (pathname === '/api/audit' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const deviceNameHeader = req.headers['x-device-name'];
              let deviceName = 'Trình duyệt cục bộ';
              if (deviceNameHeader) {
                try {
                  deviceName = decodeURIComponent(deviceNameHeader);
                } catch {
                  deviceName = deviceNameHeader;
                }
              }

              const newEntry = {
                id: 'dev_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
                ts: Date.now(),
                action: (data.action || 'ACTION').toUpperCase(),
                entity: (data.entity || 'item').toLowerCase(),
                entityId: data.entityId ? String(data.entityId) : null,
                entityLabel: data.entityLabel || 'Bản ghi mẫu',
                department: data.department || null,
                before: data.before || null,
                after: data.after || null,
                note: data.note || null,
                actor: {
                  uid: 'dev-user-01',
                  email: 'admin@kingdom.local',
                },
                device: {
                  id: req.headers['x-device-id'] || 'dev-browser',
                  name: deviceName,
                },
                ip: req.headers['x-real-ip'] || req.socket.remoteAddress || '127.0.0.1',
              };

              devAuditLogs.unshift(newEntry);
              if (devAuditLogs.length > 300) devAuditLogs.pop();

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ ok: true, id: newEntry.id, env: 'local-dev' }));
            } catch (err) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON body: ' + err.message }));
            }
          });
          return;
        }

        // GET /api/audit-list hoặc GET /api/audit
        if (pathname === '/api/audit-list' || (pathname === '/api/audit' && req.method === 'GET')) {
          const actionFilter = url.searchParams.get('action');
          const entityFilter = url.searchParams.get('entity');
          const deptFilter = url.searchParams.get('department');
          const limitFilter = parseInt(url.searchParams.get('limit') || '50', 10);

          let filtered = [...devAuditLogs];
          if (actionFilter) {
            filtered = filtered.filter((l) => l.action === actionFilter.toUpperCase());
          }
          if (entityFilter) {
            filtered = filtered.filter((l) => l.entity === entityFilter.toLowerCase());
          }
          if (deptFilter) {
            filtered = filtered.filter((l) => l.department === deptFilter);
          }
          filtered = filtered.slice(0, limitFilter);

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              logs: filtered,
              total: devAuditLogs.length,
              env: 'local-dev',
            })
          );
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiDevPlugin()],
});
