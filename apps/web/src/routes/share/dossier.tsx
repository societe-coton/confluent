import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { ConfluentWordmark } from '@/components/confluent/ConfluentWordmark'
import { DossierField } from '@/components/confluent/DossierField'
import { QUESTIONNAIRE, QUESTIONNAIRE_FLAT } from '@/data/questionnaire'
import { MOCK_DOSSIER_DETAIL } from '@/data/mock-dossier'

export default function ShareDossierRoute() {
  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.scrollBehavior
    root.style.scrollBehavior = 'smooth'
    return () => {
      root.style.scrollBehavior = previous
    }
  }, [])

  return (
    <>
      <title>{MOCK_DOSSIER_DETAIL.name} · Confluent</title>
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 bg-background px-6 py-8">
        <ConfluentWordmark className="h-6 w-auto text-foreground" />
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
            {MOCK_DOSSIER_DETAIL.name}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{MOCK_DOSSIER_DETAIL.sector}</Badge>
            <Badge variant="secondary">{MOCK_DOSSIER_DETAIL.maturity}</Badge>
          </div>
        </header>
        <nav aria-label="Sections du dossier">
          <ul className="-mx-6 flex gap-2 overflow-x-auto whitespace-nowrap px-6">
            {QUESTIONNAIRE.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {section.title}
                </a>
              </li>
            ))}
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
                className="scroll-mt-8"
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
