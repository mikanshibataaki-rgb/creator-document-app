import type { PromoData } from '../utils/promoTypes'
import creatorProjectManager from './creator-project-manager'

const creatorContract: PromoData = {
  ...creatorProjectManager,
  slug: 'creator-contract',
  title: 'クリエイター契約アプリ',
  subtitle: '仕事の約束を、残す。',
  url: 'creator-contract.example',
  theme: 'contract',
}

export default creatorContract
