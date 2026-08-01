export type File = {
    fileId: string
    userId: string

    fileName: string
    contentType: string
    fileSize: number

    parentFolderId: string | null

    key: string
    thumbnailKey?: string

    status: string

    uploadedAt: number
    lastViewed?: number
    lastViewedBy?: string

    uploadId?: string

    updatedAt: number
    deleted: boolean
}