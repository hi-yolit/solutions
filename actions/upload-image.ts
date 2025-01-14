// actions/upload-image.ts
'use server'

import { createServiceClient } from '@/utils/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function uploadImage(file: File) {
  try {
    const serviceClient =  createServiceClient()

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await serviceClient.storage
      .from('solutions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = serviceClient.storage
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