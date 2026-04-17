// Upload file to Cloudflare R2 via presigned URL approach
// Since we cannot expose R2 secret key in frontend,
// we upload directly to Supabase Storage instead
// Supabase Storage free tier: 1GB — sufficient for MVP

import { supabase } from './supabase'

export async function uploadPhoto(file, ticketId, type = 'proof') {
  try {
    // Validate file
    if (!file) throw new Error('No file selected')
    if (file.size > 10 * 1024 * 1024) throw new Error('File too large. Max 10MB allowed.')
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Only JPG, PNG and WebP images allowed')
    }

    // Create unique filename
    const ext = file.name.split('.').pop()
    const filename = `${ticketId}/${type}_${Date.now()}.${ext}`

    // Upload to Supabase Storage (free 1GB)
    const { data, error } = await supabase.storage
      .from('casacare-media')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('casacare-media')
      .getPublicUrl(filename)

    return { url: publicUrl, path: data.path, error: null }
  } catch (error) {
    return { url: null, path: null, error: error.message }
  }
}

export async function deletePhoto(path) {
  const { error } = await supabase.storage
    .from('casacare-media')
    .remove([path])
  return { error }
}
