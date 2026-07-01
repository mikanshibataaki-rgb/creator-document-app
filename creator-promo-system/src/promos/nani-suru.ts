import type { PromoData } from '../utils/promoTypes'
import creatorProjectManager from './creator-project-manager'

const naniSuru: PromoData = {
  ...creatorProjectManager,
  slug: 'nani-suru',
  title: 'ナニスル',
  subtitle: '今日やることを、迷わない。',
  url: 'nani-suru.example',
  theme: 'standard',
}

export default naniSuru
