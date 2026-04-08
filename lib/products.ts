export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  images?: string[]
}

// Funding amounts for adding money to accounts via Stripe
export const PRODUCTS: Product[] = [
  {
    id: 'fund-25',
    name: 'Add $25',
    description: 'Add $25 to your Chase account',
    priceInCents: 2500,
  },
  {
    id: 'fund-50',
    name: 'Add $50',
    description: 'Add $50 to your Chase account',
    priceInCents: 5000,
  },
  {
    id: 'fund-100',
    name: 'Add $100',
    description: 'Add $100 to your Chase account',
    priceInCents: 10000,
  },
  {
    id: 'fund-250',
    name: 'Add $250',
    description: 'Add $250 to your Chase account',
    priceInCents: 25000,
  },
  {
    id: 'fund-500',
    name: 'Add $500',
    description: 'Add $500 to your Chase account',
    priceInCents: 50000,
  },
  {
    id: 'fund-1000',
    name: 'Add $1,000',
    description: 'Add $1,000 to your Chase account',
    priceInCents: 100000,
  },
]

// Helper to get product by ID
export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

// Helper to format price
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100)
}
