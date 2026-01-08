import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { content, format, filename } = await request.json()

    if (format === 'txt') {
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${filename || 'meeting-notes'}.txt"`,
        },
      })
    }

    if (format === 'md') {
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${filename || 'meeting-notes'}.md"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
