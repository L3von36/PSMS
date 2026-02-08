"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Upload, X, Check, Camera } from 'lucide-react'
import { uploadStudentPhoto } from '@/actions/student'
import { toast } from 'sonner'
import Image from 'next/image'

export function StudentPhotoUpload({ 
    onUploadSuccess, 
    currentPhotoUrl 
}: { 
    onUploadSuccess: (url: string) => void,
    currentPhotoUrl?: string | null
}) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null)
    const [crop, setCrop] = useState<Crop>()
    const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            setFile(file)
            const reader = new FileReader()
            reader.onload = () => {
                setPreview(reader.result as string)
                setIsEditing(true)
            }
            reader.readAsDataURL(file)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
        maxFiles: 1
    })

    const handleUpload = async () => {
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('photo', file)

        try {
            const result = await uploadStudentPhoto(formData)
            if (result.success && result.photoUrl) {
                onUploadSuccess(result.photoUrl)
                setPreview(result.photoUrl)
                setIsEditing(false)
                toast.success('Photo uploaded successfully')
            } else {
                toast.error(result.message || 'Upload failed')
            }
        } catch (error) {
            toast.error('An error occurred during upload')
        } finally {
            setIsUploading(false)
        }
    }

    const cancelEdit = () => {
        setFile(null)
        setPreview(currentPhotoUrl || null)
        setIsEditing(false)
    }

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-muted-foreground">Student Photo</label>
            
            <div className="flex flex-col items-center gap-4">
                {preview && !isEditing ? (
                    <div className="relative group">
                        <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-primary/20 bg-muted relative">
                            <Image 
                                src={preview} 
                                alt="Student photo" 
                                fill 
                                className="object-cover"
                            />
                        </div>
                        <button 
                            type="button"
                            {...getRootProps()}
                            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Camera className="h-6 w-6 text-white" />
                        </button>
                    </div>
                ) : isEditing && preview ? (
                    <div className="space-y-4 w-full flex flex-col items-center">
                        <div className="max-h-[300px] overflow-auto border rounded-lg p-2 bg-muted/30">
                            <img 
                                src={preview} 
                                alt="Preview" 
                                className="max-w-full h-auto rounded"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                            >
                                {isUploading ? 'Uploading...' : <><Check className="h-4 w-4" /> Save Photo</>}
                            </button>
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted"
                            >
                                <X className="h-4 w-4" /> Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div 
                        {...getRootProps()} 
                        className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'
                        }`}
                    >
                        <input {...getInputProps()} />
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center px-4">
                            {isDragActive ? 'Drop image here' : 'Drag & drop photo or click to upload'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
                    </div>
                )}
            </div>
        </div>
    )
}
