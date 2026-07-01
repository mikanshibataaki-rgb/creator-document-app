import type { PromoData } from '../utils/promoTypes'
import creatorProjectManager from './creator-project-manager'

const dareoshi: PromoData = {
  ...creatorProjectManager,
  slug: 'dareoshi',
  title: 'ダレオシ',
  subtitle: '誰に届けるかを、見失わない。',
  url: 'dareoshi.example',
  theme: 'standard',
}

export default dareoshi
