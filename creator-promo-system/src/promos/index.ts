import assetNavi from './asset-navi'
import creatorContract from './creator-contract'
import creatorOs from './creator-os'
import creatorProjectManager from './creator-project-manager'
import dareoshi from './dareoshi'
import naniSuru from './nani-suru'
import productionDiary from './production-diary'

export const promos = {
  'creator-project-manager': creatorProjectManager,
  'creator-contract': creatorContract,
  'nani-suru': naniSuru,
  'production-diary': productionDiary,
  'asset-navi': assetNavi,
  dareoshi,
  'creator-os': creatorOs,
}

export type PromoSlug = keyof typeof promos
