'use client'

import { FadeIn, SectionHeader } from '@/components/gix/enterprise/primitives'
import RetailStoreScene from './RetailStoreScene'
import CrmPipelineScene from './CrmPipelineScene'
import TrinetraNocScene from './TrinetraNocScene'

const SCENES = {
  retail: RetailStoreScene,
  crm: CrmPipelineScene,
  noc: TrinetraNocScene,
}

/**
 * Immersive product storytelling block (Phase 2).
 * @param {'retail'|'crm'|'noc'} scene
 */
export default function ProductExperienceSection({
  scene = 'crm',
  eyebrow = 'Experience',
  title,
  description,
}) {
  const Scene = SCENES[scene] || CrmPipelineScene

  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <FadeIn>
          <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        </FadeIn>
        <FadeIn delay={0.08}>
          <Scene className="mt-10 h-[320px] sm:h-[380px] lg:h-[420px] w-full" />
        </FadeIn>
      </div>
    </section>
  )
}
