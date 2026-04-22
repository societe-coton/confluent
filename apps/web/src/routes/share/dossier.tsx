import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { ConfluentWordmark } from '@/components/confluent/ConfluentWordmark'
import { DossierField } from '@/components/confluent/DossierField'
import { QUESTIONNAIRE, QUESTIONNAIRE_FLAT } from '@/data/questionnaire'
import { MOCK_DOSSIER_DETAIL } from '@/data/mock-dossier'
import { isValidShareToken } from '@/data/mock-tokens'
import { AccessDeniedPage } from '@/routes/share/AccessDeniedPage'
import { cn } from '@/lib/utils'

export default function ShareDossierRoute() {
  const { token } = useParams<{ token: string }>()
  if (!isValidShareToken(token)) return <AccessDeniedPage />
  return <ShareDossierView />
}

function ShareDossierView() {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    QUESTIONNAIRE[0].id,
  )

  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.scrollBehavior
    root.style.scrollBehavior = 'smooth'
    return () => {
      root.style.scrollBehavior = previous
    }
  }, [])

  useEffect(() => {
    const sections = QUESTIONNAIRE.map((s) =>
      document.getElementById(s.id),
    ).filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        const topMost = visible.reduce((best, e) =>
          e.boundingClientRect.top < best.boundingClientRect.top ? e : best,
        )
        setActiveSectionId(topMost.target.id)
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: 0 },
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <title>{MOCK_DOSSIER_DETAIL.name} · Confluent</title>
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 bg-background px-6 py-8 lg:grid lg:max-w-6xl lg:grid-cols-[240px_1fr] lg:gap-x-12 lg:gap-y-8 lg:px-10">
        <ConfluentWordmark className="h-6 w-auto text-foreground lg:col-span-2" />
        <header className="flex flex-col gap-2 lg:col-span-2">
          <h1 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
            {MOCK_DOSSIER_DETAIL.name}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{MOCK_DOSSIER_DETAIL.sector}</Badge>
            <Badge variant="secondary">{MOCK_DOSSIER_DETAIL.maturity}</Badge>
          </div>
        </header>
        <nav
          aria-label="Sections du dossier"
          className="lg:sticky lg:top-8 lg:self-start"
        >
          <ul className="-mx-6 flex gap-2 overflow-x-auto whitespace-nowrap px-6 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:whitespace-normal lg:px-0">
            {QUESTIONNAIRE.map((section) => {
              const isActive = activeSectionId === section.id
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={isActive ? 'location' : undefined}
                    onFocus={(event) => {
                      event.currentTarget.scrollIntoView({
                        inline: 'nearest',
                        block: 'nearest',
                      })
                    }}
                    className={cn(
                      'inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 lg:w-full',
                      isActive && 'lg:text-foreground',
                    )}
                  >
                    {section.title}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="flex flex-col gap-10">
          {QUESTIONNAIRE.map((section) => {
            const sectionQuestions = QUESTIONNAIRE_FLAT.filter(
              (q) => q.sectionId === section.id,
            )
            return (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-heading`}
                className="scroll-mt-8 lg:scroll-mt-10"
              >
                <h2
                  id={`${section.id}-heading`}
                  className="font-heading text-xl font-semibold text-foreground md:text-2xl"
                >
                  {section.title}
                </h2>
                <dl className="mt-4 flex flex-col gap-5">
                  {sectionQuestions.map((q) => (
                    <DossierField
                      key={q.id}
                      label={q.label}
                      value={MOCK_DOSSIER_DETAIL.answers[q.id] ?? ''}
                    />
                  ))}
                </dl>
              </section>
            )
          })}
        </div>
      </main>
    </>
  )
}
