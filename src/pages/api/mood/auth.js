import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });
  const canEdit = session?.user?.email === process.env.AUTHORIZED_EMAIL;

  return res.json({ canEdit });
}
