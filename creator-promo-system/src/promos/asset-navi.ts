import type { PromoData } from '../utils/promoTypes'
import creatorProjectManager from './creator-project-manager'

const assetNavi: PromoData = {
  ...creatorProjectManager,
  slug: 'asset-navi',
  title: '撮影素材ナビ',
  subtitle: '素材の迷子を、減らす。',
  url: 'asset-navi.example',
  theme: 'studio',
}

export default assetNavi
