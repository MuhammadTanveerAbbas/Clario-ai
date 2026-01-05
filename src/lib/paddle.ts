'use client'

export function initPaddle() {
  if (typeof window !== 'undefined' && (window as any).Paddle) {
    return (window as any).Paddle
  }

  // Paddle will be loaded via script tag
  return null
}

export async function openPaddleCheckout(
  productId: string,
  userId: string,
  userEmail: string
) {
  const Paddle = initPaddle()

  if (!Paddle) {
    throw new Error('Paddle SDK not loaded')
  }

  const vendorId = process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID
  if (!vendorId) {
    throw new Error('Paddle vendor ID not configured')
  }

  // Initialize Paddle
  Paddle.Setup({ vendor: parseInt(vendorId) })

  // Open checkout
  Paddle.Checkout.open({
    product: productId,
    email: userEmail,
    passthrough: JSON.stringify({ userId }),
    successCallback: (data: any) => {
      console.log('Checkout successful:', data)
      // Redirect will be handled by webhook
    },
    closeCallback: () => {
      console.log('Checkout closed')
    },
  })
}

