import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify the webhook secret for security
    const webhookSecret = process.env.SANITY_WEBHOOK_SECRET
    const signature = request.headers.get('sanity-webhook-signature')
    
    if (webhookSecret && signature) {
      // In a production environment, you should verify the signature
      // For now, we'll just check if the secret exists
      if (!signature.includes(webhookSecret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // Get the document type from the webhook payload
    const documentType = body._type
    const documentId = body._id
    
    console.log(`Revalidating content for ${documentType} with ID: ${documentId}`)

    // Revalidate based on document type
    switch (documentType) {
      case 'equipment':
        // Revalidate equipment-related pages
        revalidateTag('equipment')
        revalidatePath('/equipment-rental')
        revalidatePath('/equipment-rental/[categoryName]', 'page')
        revalidatePath('/equipment-rental/[categoryName]/[equipmentSlug]', 'page')
        break
        
      case 'equipmentCategory':
        // Revalidate category-related pages
        revalidateTag('equipmentCategory')
        revalidatePath('/equipment-rental')
        revalidatePath('/equipment-rental/[categoryName]', 'page')
        break
        
      case 'industry':
        // Revalidate industry pages
        revalidateTag('industry')
        revalidatePath('/industries')
        revalidatePath('/industries/[slug]', 'page')
        break
        
      case 'article':
        // Revalidate blog pages
        revalidateTag('article')
        revalidatePath('/blog')
        break
        
      default:
        // Revalidate all pages for unknown document types
        revalidateTag('sanity')
        revalidatePath('/', 'layout')
    }

    return NextResponse.json({ 
      message: 'Revalidation triggered successfully',
      documentType,
      documentId,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error in revalidation webhook:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
} 