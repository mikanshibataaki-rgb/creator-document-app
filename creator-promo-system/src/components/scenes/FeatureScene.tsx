import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardList,
  MousePointer2,
  Save,
  TextCursorInput,
} from 'lucide-react'
import { calmSpring, cardPop, fadeUp, listReveal, sharedTransition, stagger } from '../../animations/animations'
import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { SceneContainer } from '../ui/SceneContainer'
import { Subtitle } from '../ui/Subtitle'
import { Title } from '../ui/Title'
import type { FeatureField, PromoData } from '../../utils/promoTypes'

type FeatureSceneProps = {
  active: boolean
  data: PromoData['feature']
  progress: number
}

export function FeatureScene({ active, data, progress }: FeatureSceneProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(data.roles[0].id)
  const autoRoleId = useMemo(() => {
    const index = Math.min(data.roles.length - 1, Math.floor(progress * data.roles.length))
    return data.roles[index].id
  }, [data.roles, progress])

  useEffect(() => {
    if (active) {
      setSelectedRoleId(autoRoleId)
    }
  }, [active, autoRoleId])

  const selectedRole = data.roles.find((role) => role.id === selectedRoleId) ?? data.roles[0]
  const roleIndex = data.roles.findIndex((role) => role.id === selectedRole.id)
  const segmentProgress = data.roles.length * progress - Math.max(0, roleIndex)
  const focusedFieldIndex = Math.min(selectedRole.fields.length - 1, Math.max(0, Math.floor(segmentProgress * selectedRole.fields.length)))
  const completedCount = Math.min(selectedRole.fields.length, focusedFieldIndex + 1)

  return (
    <SceneContainer active={active} className="feature-scene">
      <motion.div className="feature-shell" variants={stagger} initial="hidden" animate={active ? 'visible' : 'hidden'}>
        <div className="feature-copy">
          <Title size="medium">{data.title}</Title>
          <Subtitle>{data.subtitle}</Subtitle>
        </div>
        <LayoutGroup>
          <motion.div className="feature-console" layout transition={sharedTransition.layout} variants={cardPop}>
            <motion.div className="feature-app-frame" layout transition={sharedTransition.layout}>
              <div className="feature-app-header">
                <div className="feature-brand">
                  <span className="feature-brand-mark" />
                  <div>
                    <strong>{data.workspaceTitle}</strong>
                    <small>{selectedRole.note}</small>
                  </div>
                </div>
                <div className="feature-save-state">
                  <Save aria-hidden="true" size={15} strokeWidth={1.8} />
                  <span>{data.workspaceStatus}</span>
                </div>
              </div>

              <div className="feature-tabs" aria-label="workflow">
                {data.tabs.map((tab, index) => (
                  <span className={index === 1 ? 'feature-tab-active' : ''} key={tab}>
                    {index + 1} {tab}
                  </span>
                ))}
              </div>

              <div className="feature-workspace">
                <aside className="role-list" aria-label="roles">
                  {data.roles.map((role) => (
                    <Button
                      active={role.id === selectedRole.id}
                      icon={role.id === selectedRole.id ? MousePointer2 : undefined}
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                    >
                      {role.label}
                    </Button>
                  ))}
                  <div className="role-summary-card">
                    <span>SELECTED ROLE</span>
                    <strong>{selectedRole.label}</strong>
                    <small>{completedCount}/{selectedRole.fields.length} 項目確認</small>
                  </div>
                </aside>

                <motion.div className="question-panel" layout transition={sharedTransition.layout}>
                  <div className="question-header">
                    <Chip icon={ClipboardList} active>
                      聞き取り
                    </Chip>
                    <span>{data.savedLabel}</span>
                  </div>
                  <motion.div className="question-grid" layout>
                    <AnimatePresence mode="popLayout">
                      {selectedRole.fields.map((field, index) => (
                        <FormFieldCard
                          active={index === focusedFieldIndex}
                          complete={index < completedCount}
                          field={field}
                          key={`${selectedRole.id}-${field.id}`}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>

                <motion.aside className="document-glimpse" layout transition={sharedTransition.layout}>
                  <span>{data.documentEyebrow}</span>
                  <strong>{data.documentTitle}</strong>
                  <div className="document-lines">
                    {selectedRole.fields.slice(0, 5).map((field, index) => (
                      <motion.div
                        animate={{ opacity: index < completedCount ? 1 : 0.34 }}
                        className="document-line"
                        key={`${selectedRole.id}-preview-${field.id}`}
                        layout
                      >
                        <span>{field.label}</span>
                        <em>{field.value}</em>
                      </motion.div>
                    ))}
                  </div>
                </motion.aside>
              </div>
            </motion.div>
          </motion.div>
        </LayoutGroup>
        <motion.div className="feature-footnote" variants={fadeUp}>
          <span />
          <p>{selectedRole.label}</p>
        </motion.div>
      </motion.div>
    </SceneContainer>
  )
}

type FormFieldCardProps = {
  active: boolean
  complete: boolean
  field: FeatureField
}

function FormFieldCard({ active, complete, field }: FormFieldCardProps) {
  return (
    <motion.div
      className={`question-card field-${field.kind} ${field.width === 'full' ? 'question-card-wide' : ''} ${
        active ? 'question-card-focus' : ''
      }`}
      exit="exit"
      initial="hidden"
      animate="visible"
      layout
      transition={sharedTransition}
      variants={listReveal}
    >
      <div className="field-topline">
        <span>{field.label}</span>
        <motion.span
          className={`field-state ${complete ? 'field-state-done' : ''}`}
          animate={{ scale: complete ? 1 : 0.9, opacity: complete ? 1 : 0.42 }}
          transition={calmSpring}
        >
          {complete ? <CheckCircle2 aria-hidden="true" size={16} /> : <Circle aria-hidden="true" size={16} />}
        </motion.span>
      </div>
      <FieldControl active={active} field={field} />
    </motion.div>
  )
}

function FieldControl({ active, field }: { active: boolean; field: FeatureField }) {
  if (field.kind === 'checkbox') {
    return (
      <div className="feature-checkbox-row">
        <motion.span
          animate={{
            backgroundColor: field.checked ? 'var(--promo-accent)' : 'transparent',
            borderColor: field.checked ? 'var(--promo-accent)' : 'var(--promo-surface-border)',
          }}
          className="feature-checkbox"
          transition={calmSpring}
        >
          {field.checked ? (
            <motion.span initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.32 }}>
              <Check aria-hidden="true" size={13} strokeWidth={3} />
            </motion.span>
          ) : null}
        </motion.span>
        <strong>{field.value}</strong>
      </div>
    )
  }

  if (field.kind === 'select') {
    return (
      <div className="feature-select">
        <strong>{field.value}</strong>
        <ChevronDown aria-hidden="true" size={17} strokeWidth={1.8} />
      </div>
    )
  }

  return (
    <div className="feature-input">
      <strong>{field.value}</strong>
      {active ? (
        <motion.span
          animate={{ opacity: [0, 1, 1, 0] }}
          className="input-caret"
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <TextCursorInput aria-hidden="true" size={15} strokeWidth={1.6} />
      )}
    </div>
  )
}
