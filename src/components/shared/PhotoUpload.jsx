import { useState, useRef } from 'react'
import { uploadPhoto } from '../../lib/upload'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function PhotoUpload({ ticketId, onUploadComplete, existingPhotos = [] }) {
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState(existingPhotos)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  async function handleFiles(files) {
    if (!files?.length) return
    setUploading(true)

    const uploads = []
    for (const file of Array.from(files)) {
      const { url, path, error } = await uploadPhoto(file, ticketId, 'proof')
      if (error) {
        toast.error(`Failed to upload ${file.name}: ${error}`)
        continue
      }

      // Save to ticket_photos table
      const { error: dbError } = await supabase.from('ticket_photos').insert({
        ticket_id: ticketId,
        url,
        caption: 'Proof of service',
        photo_type: 'after',
        uploaded_by: (await supabase.auth.getSession()).data.session?.user?.id
      })

      if (dbError) {
        toast.error('Photo uploaded but failed to save record')
      } else {
        uploads.push({ url, path })
        // Mark ticket as having photos
        await supabase.from('tickets')
          .update({ has_photos: true })
          .eq('id', ticketId)
      }
    }

    if (uploads.length > 0) {
      setPhotos(prev => [...prev, ...uploads])
      toast.success(`${uploads.length} photo(s) uploaded successfully!`)
      if (onUploadComplete) onUploadComplete(uploads)
    }

    setUploading(false)
  }

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#1D9E75' : '#e5e7eb'}`,
          borderRadius: '14px',
          padding: '28px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? '#f0fdf4' : '#fafafa',
          transition: 'all 0.2s',
          marginBottom: '16px'
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={e => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
            <p style={{ color: '#1D9E75', fontWeight: '600', fontSize: '14px' }}>Uploading photos...</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📷</div>
            <p style={{ fontWeight: '700', fontSize: '14px', color: '#1f2937', marginBottom: '4px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Tap to take photo or upload
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>
              JPG, PNG, WebP • Max 10MB each • Multiple allowed
            </p>
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {photos.map((photo, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '1' }}>
              <img
                src={photo.url}
                alt={`Proof ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                padding: '6px', color: 'white', fontSize: '10px', fontWeight: '600'
              }}>
                Photo {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
