"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, X, Loader2 } from "lucide-react"
import { uploadImage } from "@/actions/upload-image"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  disabled
}: ImageUploadProps) {
  const [preview, setPreview] = useState(value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    setPreview(value)
  }, [value])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      setError(null)
      setImageLoaded(false)

      const { url } = await uploadImage(file)
      onChange(url)
      setPreview(url)
    } catch (error) {
      console.error("Error uploading file:", error)
      setError(`${error ? `Encountered error: ${error}` : "Failed to upload image. Please try again. "}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setError("Failed to load image. Please try again.")
    setPreview("")
    onChange("")
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    onChange("")
    setPreview("")
    setError(null)
    setImageLoaded(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative w-40 h-52">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            <img
              src={preview}
              alt="Cover"
              className={`w-full h-full object-cover rounded-md ${!imageLoaded ? 'invisible' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {imageLoaded && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2"
                onClick={handleRemove}
                disabled={disabled || loading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <label className="relative flex flex-col items-center justify-center w-40 h-52 border-2 border-dashed rounded-md cursor-pointer hover:border-primary">
            {loading ? (
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Upload Cover</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled || loading}
            />
          </label>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}