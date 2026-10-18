// api/audit-list.js — Vercel Serverless Function
// GET /api/audit-list?department=xxx&action=xxx&limit=50&startAfter=docId
// Trả về danh sách audit_logs (chỉ cho phép Admin đọc)

import { getAdminServices } from './admin-init.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Verify token
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing Authorization header' });
  }
  const idToken = authHeader.slice(7);

  let decodedToken;
  const { auth, db } = getAdminServices();
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // 2. Kiểm tra role admin trong users collection
  const uid = decodedToken.uid;
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    const isAdmin = userData?.role === 'admin' && userData?.active !== false;

    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Yêu cầu quyền Quản trị viên (Admin)' });
    }
  } catch (err) {
    console.error('[audit-list] Check admin error:', err.message);
    return res.status(500).json({ error: 'Lỗi kiểm tra quyền admin' });
  }

  // 3. Query audit_logs
  const pageLimit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 100);
  const department = req.query.department || null;
  const actionFilter = req.query.action || null;
  const entityFilter = req.query.entity || null;
  const startAfterId = req.query.startAfter || null;

  try {
    let q = db.collection('audit_logs').orderBy('ts', 'desc').limit(pageLimit);

    if (department) {
      q = q.where('department', '==', department);
    }
    if (actionFilter) {
      q = q.where('action', '==', actionFilter.toUpperCase());
    }
    if (entityFilter) {
      q = q.where('entity', '==', entityFilter.toLowerCase());
    }
    if (startAfterId) {
      const startDoc = await db.collection('audit_logs').doc(startAfterId).get();
      if (startDoc.exists) {
        q = q.startAfter(startDoc);
      }
    }

    const snap = await q.get();
    const logs = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        ts: data.ts?.toMillis ? data.ts.toMillis() : null,
      };
    });

    return res.status(200).json({ logs, count: logs.length });
  } catch (err) {
    console.error('[audit-list] Query failed:', err);
    return res.status(500).json({ error: 'Lỗi truy vấn nhật ký: ' + err.message });
  }
}
