// api/audit.js — Vercel Serverless Function
// POST /api/audit
// Nhận audit event từ client, verify Firebase ID token, ghi vào audit_logs

import { getAdminServices } from './admin-init.js';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-Id, X-Device-Name');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Verify Firebase ID token (không tin client)
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const idToken = authHeader.slice(7);

  let decodedToken;
  try {
    const { auth } = getAdminServices();
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (err) {
    console.error('[audit] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired Firebase ID token' });
  }

  const actorUid = decodedToken.uid;
  const actorEmail = decodedToken.email || decodedToken.phone_number || 'authenticated_user';

  // 2. Lấy IP từ header x-real-ip / x-forwarded-for
  const clientIp =
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  const deviceId = req.headers['x-device-id'] || '';
  const deviceName = req.headers['x-device-name'] || '';

  // 3. Parse payload (bỏ qua mọi trường ts/ip/actor do client gửi)
  const body = req.body || {};
  const {
    action,
    entity,
    entityId,
    entityLabel,
    department,
    before,
    after,
    note,
  } = body;

  if (!action || !entity) {
    return res.status(400).json({ error: 'Trường action và entity là bắt buộc' });
  }

  // 4. Ghi vào Firestore collection audit_logs với serverTimestamp
  try {
    const { db } = getAdminServices();
    const docRef = db.collection('audit_logs').doc();

    const auditEntry = {
      ts: FieldValue.serverTimestamp(),
      action: String(action).toUpperCase(),
      entity: String(entity).toLowerCase(),
      entityId: entityId ? String(entityId) : null,
      entityLabel: entityLabel ? String(entityLabel) : null,
      department: department ? String(department) : null,
      before: before !== undefined ? before : null,
      after: after !== undefined ? after : null,
      note: note ? String(note) : null,
      actor: {
        uid: actorUid,
        email: actorEmail,
      },
      device: {
        id: deviceId,
        name: deviceName,
      },
      ip: clientIp,
    };

    await docRef.set(auditEntry);

    return res.status(200).json({ ok: true, id: docRef.id });
  } catch (err) {
    console.error('[audit] Firestore write failed:', err);
    return res.status(500).json({ error: 'Lỗi ghi audit log: ' + err.message });
  }
}
