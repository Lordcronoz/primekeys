// Checkout pages get their own minimal layout — no nav, no footer
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
