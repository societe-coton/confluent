import { readdirSync, readFileSync } from 'node:fs'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { join } from 'node:path'
import { render, type TemplateName } from '../src/modules/auth/email/template-renderer'
import type { Locale } from '../src/modules/auth/email/email-transport'

const PORT = 4000
const TEMPLATES_DIR = join(__dirname, '..', 'src', 'modules', 'auth', 'email', 'templates')

interface Samples {
  [key: string]: Record<string, string>
}

function loadSamples(): Samples {
  const raw = readFileSync(join(TEMPLATES_DIR, 'samples.json'), 'utf8')
  return JSON.parse(raw) as Samples
}

function listTemplateNames(): TemplateName[] {
  return readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith('.html'))
    .map((f) => f.replace(/\.html$/, '') as TemplateName)
}

function listLocales(): Locale[] {
  return readdirSync(join(TEMPLATES_DIR, 'i18n'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, '') as Locale)
}

const LIVE_RELOAD_SNIPPET = `<script>setTimeout(function(){location.reload();}, 2000);</script>`

function injectLiveReload(html: string): string {
  return html.includes('</body>') ? html.replace('</body>', `${LIVE_RELOAD_SNIPPET}</body>`) : html + LIVE_RELOAD_SNIPPET
}

function renderIndex(templates: TemplateName[], locales: Locale[], currentLocale: Locale): string {
  const links = templates
    .map(
      (name) =>
        `<li><a href="/${name}?locale=${currentLocale}">${name}</a> · <a href="/${name}.txt?locale=${currentLocale}">text</a></li>`,
    )
    .join('\n')
  const localeSelector = locales
    .map(
      (l) =>
        `<a href="/?locale=${l}" style="margin-right:8px;${l === currentLocale ? ' font-weight:bold;' : ''}">${l}</a>`,
    )
    .join('')
  return `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><title>Confluent · Email preview</title>
<style>body{font-family:-apple-system,'Segoe UI',sans-serif;max-width:560px;margin:48px auto;padding:0 16px;color:#1A1A1A;}h1{font-size:22px;}ul{padding-left:18px;}li{margin:8px 0;font-size:15px;}a{color:#37352F;}.l{color:#6B6B6B;font-size:13px;margin-bottom:16px;}</style>
</head>
<body>
  <h1>Email templates</h1>
  <p class="l">Locale : ${localeSelector}</p>
  <ul>${links}</ul>
  <p class="l">Modifiez les .html ou les .json puis rechargez. Auto-reload toutes les 2 s sur les pages de template.</p>
</body></html>`
}

function send(res: ServerResponse, status: number, contentType: string, body: string): void {
  res.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store' })
  res.end(body)
}

createServer((req: IncomingMessage, res: ServerResponse) => {
  try {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
    const locales = listLocales()
    const requestedLocale = url.searchParams.get('locale') ?? 'fr'
    const locale = (locales.includes(requestedLocale as Locale)
      ? requestedLocale
      : locales[0]) as Locale
    const templates = listTemplateNames()
    const samples = loadSamples()

    if (url.pathname === '/' || url.pathname === '/index.html') {
      return send(res, 200, 'text/html; charset=utf-8', renderIndex(templates, locales, locale))
    }

    const asText = url.pathname.endsWith('.txt')
    const namePart = url.pathname.replace(/^\//, '').replace(/\.(html|txt)$/, '')
    if (!templates.includes(namePart as TemplateName)) {
      return send(res, 404, 'text/plain; charset=utf-8', `Unknown template "${namePart}".`)
    }
    const name = namePart as TemplateName
    const dynamicVars = samples[name]
    if (!dynamicVars) {
      return send(
        res,
        500,
        'text/plain; charset=utf-8',
        `Missing samples for template "${name}" in samples.json.`,
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rendered = render(name as any, locale, dynamicVars as any)
    if (asText) {
      return send(res, 200, 'text/plain; charset=utf-8', rendered.text)
    }
    return send(res, 200, 'text/html; charset=utf-8', injectLiveReload(rendered.html))
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return send(res, 500, 'text/plain; charset=utf-8', `Render error: ${message}`)
  }
}).listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Email preview running at http://localhost:${PORT}`)
  console.log(`  - Edit templates/*.html and templates/i18n/*.json then reload the browser.`)
  console.log(`  - Live-reload every 2 s on template pages.`)
})
