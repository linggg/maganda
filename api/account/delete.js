import { createClient } from '@supabase/supabase-js'

// Requires the service role key (not the anon key) to call auth.admin methods.
// In this project the key is stored as SUPABASE_SERVICE_KEY — equivalent to
// what Supabase calls SUPABASE_SERVICE_ROLE_KEY in their own dashboard docs.
const adminClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Verify the caller's identity before acting on their account
  const { data: { user }, error: authError } = await adminClient.auth.getUser(token)
  if (authError || !user) {
    console.error('Delete account — auth verification failed:', authError)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Deleting the auth user cascades to profiles → assessments automatically
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
  if (deleteError) {
    console.error('Delete account — adminClient.auth.admin.deleteUser failed:', deleteError)
    return res.status(500).json({ error: 'Failed to delete account' })
  }

  return res.status(200).json({ success: true })
}
