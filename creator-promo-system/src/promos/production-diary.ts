import type { PromoData } from '../utils/promoTypes'
import creatorProjectManager from './creator-project-manager'

const productionDiary: PromoData = {
  ...creatorProjectManager,
  slug: 'production-diary',
  title: '制作日誌アプリ',
  subtitle: '現場の記録を、次の力に。',
  url: 'production-diary.example',
  theme: 'journal',
}

export default productionDiary
