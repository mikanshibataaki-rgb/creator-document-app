import type { PromoData } from '../utils/promoTypes'
import creatorProjectManager from './creator-project-manager'

const creatorOs: PromoData = {
  ...creatorProjectManager,
  slug: 'creator-os',
  title: 'クリエーターOS',
  subtitle: '制作の流れを、ひとつに。',
  url: 'creator-os.example',
  theme: 'standard',
}

export default creatorOs
