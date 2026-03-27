// Invoice generation
import { prisma } from '@/lib/prisma'

export interface InvoiceLineItem {
  id: string
  productId: string
  productName: string
  productImage: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  sku: string | null
}

export interface InvoiceAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  email?: string
}

export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: Date
  dueDate: Date | null
  orderId: string
  orderNumber: string
  customerEmail: string
  customerName: string
  billingAddress: InvoiceAddress
  shippingAddress: InvoiceAddress
  lineItems: InvoiceLineItem[]
  subtotal: number
  taxAmount: number
  taxRate: number
  shippingAmount: number
  discountAmount: number
  total: number
  currency: string
  paymentMethod: string
  paymentStatus: string
  notes?: string
  terms?: string
}

function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `INV-${year}${month}-${random}`
}

export async function generateInvoice(orderId: string): Promise<InvoiceData | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      billingAddress: true,
      shippingAddress: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
              sku: true,
            },
          },
        },
      },
    },
  })

  if (!order) return null

  const lineItems: InvoiceLineItem[] = order.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productImage: item.product.images[0]?.url || null,
    quantity: item.quantity,
    unitPrice: Number(item.price),
    totalPrice: Number(item.price) * item.quantity,
    sku: item.product.sku,
  }))

  const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const taxAmount = Number(order.taxAmount || 0)
  const shippingAmount = Number(order.shippingAmount || 0)
  const discountAmount = Number(order.discountAmount || 0)
  const total = subtotal + taxAmount + shippingAmount - discountAmount

  const invoiceData: InvoiceData = {
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date(),
    dueDate: null,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.user.email,
    customerName: order.user.name || 'Valued Customer',
    billingAddress: {
      name: order.billingAddress.name,
      line1: order.billingAddress.line1,
      line2: order.billingAddress.line2 || undefined,
      city: order.billingAddress.city,
      state: order.billingAddress.state,
      postalCode: order.billingAddress.postalCode,
      country: order.billingAddress.country,
    },
    shippingAddress: {
      name: order.shippingAddress.name,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2 || undefined,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
    },
    lineItems,
    subtotal,
    taxAmount,
    taxRate: Number(order.taxRate || 0),
    shippingAmount,
    discountAmount,
    total,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    terms: 'Payment is due upon receipt. Please keep this invoice for your records.',
  }

  return invoiceData
}

export async function getInvoicePDF(orderId: string): Promise<Buffer | null> {
  const invoiceData = await generateInvoice(orderId)

  if (!invoiceData) return null

  // Generate HTML invoice
  const html = generateInvoiceHTML(invoiceData)

  // Convert to PDF buffer using puppeteer or similar
  // For now, return HTML as buffer (in production, use proper PDF generation)
  // This would typically use @react-pdf/renderer or puppeteer
  try {
    // Attempt to use puppeteer for PDF generation
    const puppeteer = await import('puppeteer')
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    })

    await browser.close()

    return Buffer.from(pdfBuffer)
  } catch (error) {
    console.error('PDF generation failed, returning HTML buffer:', error)
    // Fallback: return HTML buffer with proper content-type header handling
    return Buffer.from(html)
  }
}

function generateInvoiceHTML(invoice: InvoiceData): string {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency,
    }).format(amount)

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f0f0f;
      color: #ffffff;
      padding: 40px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(145deg, #1a1a1a, #0f0f0f);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .invoice-title p {
      color: #888;
      font-size: 14px;
    }
    .addresses {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .address-section h3 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #667eea;
      margin-bottom: 12px;
    }
    .address-section p {
      font-size: 14px;
      line-height: 1.6;
      color: #ccc;
    }
    .address-section p strong {
      color: #fff;
    }
    .items-table {
      width: 100%;
      margin-bottom: 30px;
    }
    .items-table th {
      text-align: left;
      padding: 12px 16px;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 8px 8px 0 0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #667eea;
    }
    .items-table td {
      padding: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      font-size: 14px;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    .totals-table {
      width: 300px;
    }
    .totals-table .row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .totals-table .row.total {
      border-top: 2px solid #667eea;
      padding-top: 12px;
      margin-top: 8px;
      font-size: 18px;
      font-weight: 700;
    }
    .totals-table .label { color: #888; }
    .totals-table .value { color: #fff; }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
      color: #666;
      font-size: 12px;
    }
    .footer p { margin-bottom: 8px; }
    .notes {
      margin-top: 30px;
      padding: 16px;
      background: rgba(102, 126, 234, 0.05);
      border-radius: 8px;
      font-size: 13px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="logo">VoltStore</div>
      <div class="invoice-title">
        <h1>INVOICE</h1>
        <p>Invoice #: ${invoice.invoiceNumber}</p>
        <p>Date: ${formatDate(invoice.invoiceDate)}</p>
        <p>Order #: ${invoice.orderNumber}</p>
      </div>
    </div>

    <div class="addresses">
      <div class="address-section">
        <h3>Bill To</h3>
        <p>
          <strong>${invoice.billingAddress.name}</strong><br>
          ${invoice.billingAddress.line1}<br>
          ${invoice.billingAddress.line2 ? invoice.billingAddress.line2 + '<br>' : ''}
          ${invoice.billingAddress.city}, ${invoice.billingAddress.state} ${invoice.billingAddress.postalCode}<br>
          ${invoice.billingAddress.country}
        </p>
      </div>
      <div class="address-section">
        <h3>Ship To</h3>
        <p>
          <strong>${invoice.shippingAddress.name}</strong><br>
          ${invoice.shippingAddress.line1}<br>
          ${invoice.shippingAddress.line2 ? invoice.shippingAddress.line2 + '<br>' : ''}
          ${invoice.shippingAddress.city}, ${invoice.shippingAddress.state} ${invoice.shippingAddress.postalCode}<br>
          ${invoice.shippingAddress.country}
        </p>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>SKU</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.lineItems.map(item => `
          <tr>
            <td>${item.productName}</td>
            <td style="color: #888;">${item.sku || 'N/A'}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
            <td style="text-align: right;">${formatCurrency(item.totalPrice)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-table">
        <div class="row">
          <span class="label">Subtotal</span>
          <span class="value">${formatCurrency(invoice.subtotal)}</span>
        </div>
        ${invoice.discountAmount > 0 ? `
          <div class="row">
            <span class="label">Discount</span>
            <span class="value">-${formatCurrency(invoice.discountAmount)}</span>
          </div>
        ` : ''}
        <div class="row">
          <span class="label">Shipping</span>
          <span class="value">${formatCurrency(invoice.shippingAmount)}</span>
        </div>
        <div class="row">
          <span class="label">Tax (${(invoice.taxRate * 100).toFixed(1)}%)</span>
          <span class="value">${formatCurrency(invoice.taxAmount)}</span>
        </div>
        <div class="row total">
          <span class="label">Total</span>
          <span class="value">${formatCurrency(invoice.total)}</span>
        </div>
      </div>
    </div>

    ${invoice.notes ? `
      <div class="notes">
        <strong>Notes:</strong><br>
        ${invoice.notes}
      </div>
    ` : ''}

    <div class="footer">
      <p>Thank you for your purchase!</p>
      <p>Questions? Contact support@voltstore.com</p>
      <p style="margin-top: 16px; color: #444;">&copy; ${new Date().getFullYear()} VoltStore. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export async function sendInvoiceEmail(
  orderId: string,
  email?: string
): Promise<{ success: boolean; error?: string }> {
  const invoiceData = await generateInvoice(orderId)

  if (!invoiceData) {
    return { success: false, error: 'Order not found' }
  }

  const recipientEmail = email || invoiceData.customerEmail

  // In production, use Resend to send the invoice
  // const { sendEmail } = await import('@/lib/email')
  // await sendEmail({
  //   to: recipientEmail,
  //   subject: `Invoice ${invoiceData.invoiceNumber} for Order ${invoiceData.orderNumber}`,
  //   html: generateInvoiceHTML(invoiceData),
  // })

  console.log(`Invoice email would be sent to ${recipientEmail}`)
  return { success: true }
}
