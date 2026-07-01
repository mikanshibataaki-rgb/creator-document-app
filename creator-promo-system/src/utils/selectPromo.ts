import { promos, type PromoSlug } from '../promos'

export function selectPromoFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const slug = params.get('promo') as PromoSlug | null
  return slug && slug in promos ? promos[slug] : promos['creator-project-manager']
}
