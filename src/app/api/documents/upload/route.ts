import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB for documents

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
])

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt',
])

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const vesselId = formData.get('vesselId') as string | null
  const equipmentId = formData.get('equipmentId') as string | null
  const revision = formData.get('revision') as string | null
  const expiryDate = formData.get('expiryDate') as string | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File exceeds 50 MB limit' }, { status: 413 })
  }

  const ext = path.extname(file.name).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 415 })
  }

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents')
  await mkdir(uploadDir, { recursive: true })

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const filePath = path.join(uploadDir, safeName)
  await writeFile(filePath, buffer)

  await prisma.document.create({
    data: {
      title: title.trim(),
      category: (category || 'MANUAL') as never,
      fileName: file.name,
      fileUrl: `/uploads/documents/${safeName}`,
      fileType: file.type,
      fileSize: file.size,
      revision: revision || null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      vesselId: vesselId || null,
      equipmentId: equipmentId || null,
    },
  })

  return NextResponse.json({ ok: true })
}
