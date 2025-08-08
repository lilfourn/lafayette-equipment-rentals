import { redirect } from "next/navigation"

export default async function OldCartPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  redirect(`/${locale}/equipment-rental/cart/checkout-lafayette-la`)
}