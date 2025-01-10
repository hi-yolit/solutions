// actions/upload-image.ts
'use server'

import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function uploadImage(file: File) {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = fileName 

    const { error: uploadError } = await supabase.storage
      .from('solutions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('solutions')
      .getPublicUrl(filePath)

    // Add a small delay to allow for CDN propagation
    await new Promise(resolve => setTimeout(resolve, 1500))

    return { url: publicUrl }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}