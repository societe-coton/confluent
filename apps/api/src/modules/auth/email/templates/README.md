# Templates email Confluent

Tous les emails transactionnels Confluent (magic-link, partage de dossier) sont définis ici :

- **HTML statique** ouvrable directement dans un navigateur (`open magic-link.html` ou via `pnpm email:preview`).
- **DA alignée** avec le frontend web (cf. tableau "Tokens DA" plus bas).
- **i18n** : un seul fichier HTML par template, traduit via les `i18n/<locale>.json`. Pour ajouter une langue, copier `i18n/fr.json` vers `i18n/<code>.json` et traduire les valeurs — pas besoin de toucher le HTML.

## Comment ajouter un nouvel email

1. Créer `nom.html` et `nom.txt` (placeholders `{{key}}`) au même niveau que `magic-link.html`.
2. Ajouter un bloc `"nom": { … }` dans tous les `i18n/*.json` (au minimum `fr.json`).
3. Ajouter un sample dans `samples.json` (valeurs dynamiques pour la preview).
4. Déclarer le nom + les variables dynamiques dans `TemplateName` et `TemplateDynamicVars` de [`../template-renderer.ts`](../template-renderer.ts).
5. Ajouter une méthode typée dans `EmailTransport` (`../email-transport.ts`) et son impl dans `../nodemailer.transport.ts`.

## Comment ajouter une langue

1. `cp i18n/fr.json i18n/en.json`, traduire les valeurs.
2. Élargir le type `Locale` dans [`../email-transport.ts`](../email-transport.ts) : `type Locale = 'fr' | 'en'`.
3. Tout le reste (HTML, services consommateurs) ne change pas.

## Tokens DA (alignement avec le front)

Repris de [`apps/web/src/index.css`](../../../../../../../apps/web/src/index.css) :

| Token (web) | Valeur | Usage email |
|---|---|---|
| `--background` | `#FAFAF9` | Fond de page |
| `--card` | `#FFFFFF` | Fond du bloc principal |
| `--foreground` | `#1A1A1A` | Texte courant |
| `--primary` | `#37352F` | Bouton CTA, lien actif |
| `--primary-foreground` | `#FFFFFF` | Texte du bouton CTA |
| `--muted-foreground` | `#6B6B6B` | Texte secondaire (footer, fallback) |
| `--border` | `#E8E8E7` | Liseré du bloc principal |
| `--radius` | `6px` | Bordure des boutons/cartes (Outlook Windows : ignoré → coin carré, acceptable) |
| Font | Inter + fallback système | `font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |

**Pas de variables CSS** : Outlook ne les supporte pas. Les valeurs sont **hardcodées dans le HTML**. Si un token change côté front, mettre à jour les templates en miroir.

## Règles email-HTML (impératives)

Le HTML email n'est PAS du HTML web. Les clients (Outlook, Gmail, Apple Mail) ont des moteurs très différents et imposent des contraintes que la version web ne connaît pas. Toute édition doit respecter ces règles :

### Cibles obligatoires

- **Outlook 2016+** (Windows + Mac), **Outlook.com**.
- **Apple Mail** iOS 13+ et macOS 10.14+.
- **Gmail** web, application iOS, application Android.
- **Yahoo Mail** web (best-effort).

Toute édition significative doit être testée au minimum sur **Gmail web + Apple Mail iOS + Outlook web** avant merge.

### Structure HTML

- **Doctype XHTML 1.0 Transitional** — meilleure compat Outlook que HTML5 strict.
- **`<html xmlns="…" lang="{{lang}}">`** — l'attribut `lang` vient du JSON i18n.
- **`<meta charset="utf-8">`**, **`<meta name="viewport">`**, **`<meta http-equiv="X-UA-Compatible" content="IE=edge">`**.
- **Dark-mode forcé en light** : `<meta name="color-scheme" content="light only">` + `<meta name="supported-color-schemes" content="light only">`. Sans ça, iOS Mail et Outlook macOS inversent les couleurs.
- **`<meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">`** : empêche l'auto-link Apple Mail sur les emails/dates/numéros.
- **Pas de `<form>`, `<iframe>`, `<script>`** — filtrés par tous les clients.

### Layout

- **Uniquement des `<table role="presentation">` imbriquées**. Pas de flexbox, grid, position absolute — Outlook ne les rend pas.
- **Largeur max 600px** (industry standard pour la lisibilité mobile). Tables centrées via `align="center"` sur le `<td>` parent.
- **Largeur du bloc principal** : `width="560"` en attribut HTML **ET** `style="width:560px; max-width:560px"` (Outlook utilise l'attribut, les autres le CSS).
- **Pas de `margin`** sur les `<p>` à l'intérieur de cellules `<td>` (Outlook ignore parfois). Préférer le contrôle via `style="margin:…"` explicite ou des `<tr>` espaceurs.
- **Pas de padding ni margin sur `<a>`** — Outlook ne les rend pas. Toujours wrapper le lien dans `<td style="padding:…">`.

### CSS

- **100% inline** sur chaque élément stylé. Pas de `<style>` global (Gmail mobile strip parfois).
- **Une seule exception** : un bloc `<style>` dans `<!--[if mso]> … <![endif]-->` pour forcer la police sur Outlook (qui ignore Inter et tombe sur Times New Roman par défaut).
- **Pas de `@font-face`** — silencieusement ignoré par Outlook + Gmail. On compte sur la stack système.
- **Pas de variables CSS** (Outlook).
- **Pas de `box-shadow`, `text-shadow`, `transform`, `transition`** (Outlook).

### Bouton CTA — pattern "bulletproof"

Le bouton doit fonctionner même sur Outlook Windows qui ignore `border-radius`, `padding` sur `<a>`, et `display:inline-block` partiellement. Pattern utilisé :

```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" bgcolor="#37352F" style="border-radius:6px;">
      <a href="{{url}}" target="_blank"
         style="display:inline-block; padding:12px 24px; font-family:…; font-size:15px; line-height:1; font-weight:500; color:#FFFFFF; text-decoration:none; border-radius:6px;">
        <!--[if mso]>&nbsp;&nbsp;&nbsp;<![endif]-->{{cta}}<!--[if mso]>&nbsp;&nbsp;&nbsp;<![endif]-->
      </a>
    </td>
  </tr>
</table>
```

Notes :
- Le `bgcolor` sur le `<td>` est requis pour Outlook (ne rend pas le `background` CSS sur `<a>`).
- Le `border-radius` est ignoré sur Outlook Windows → **bouton à coin carré accepté** comme dégradation gracieuse. Pas de VML en V1 (à ajouter plus tard si besoin de rounded sur Outlook).
- Les `&nbsp;` conditionnels MSO compensent le fait qu'Outlook ne rend pas le `padding` horizontal du `<a>`.
- **Largeur du bouton** : auto, **jamais `100%`** (Outlook étire mal).

### Préheader

Première ligne du `<body>`, cachée visuellement mais lue par les clients pour l'aperçu inbox :

```html
<div style="display:none; max-height:0; overflow:hidden; mso-hide:all; line-height:0; font-size:0; color:#FAFAF9;">{{preheader}}</div>
```

Le `color:#FAFAF9` (couleur du fond) protège contre certains clients qui rendent quand même le texte.

### Liens

- **Toujours absolus**. Le placeholder `{{magicLinkUrl}}` / `{{shareUrl}}` doit déjà contenir `FRONTEND_URL` (résolu côté backend).
- **`target="_blank"`** sur les liens d'action — sinon iOS Mail peut ouvrir dans une webview interne sans cookies.
- **`word-break:break-all`** sur le lien fallback (sinon les URL longues débordent du bloc sur mobile).

### Images

- **Pas d'images externes en V1**. Le logo est en texte stylé. Pas de SVG inline non plus (Outlook le strip).
- Si on ajoute des images plus tard :
  - `width=` en attribut HTML obligatoire (Outlook utilise l'attribut, pas le CSS).
  - `alt=` obligatoire (clients qui bloquent les images par défaut).
  - `style="display:block; border:0;"` pour éviter les espaces sous les images (Gmail) et les bordures bleues (Outlook).
  - Hébergement : prévoir un CDN HTTPS stable.

### Substitution de variables

- Syntaxe `{{camelCase}}`. Le renderer ([../template-renderer.ts](../template-renderer.ts)) substitue à l'envoi.
- Les valeurs i18n viennent du JSON, les valeurs dynamiques (URL, nom du dossier) viennent du code TypeScript.
- **Toutes les variables substituées sont HTML-échappées** dans le HTML (XSS-safe), pas dans le `.txt`.
- Toute variable manquante lève une erreur explicite à l'envoi — détecté immédiatement en CI/tests.

## Procédure de QA

### Preview locale rapide (mise en page, typographie)

```sh
pnpm --filter @confluent/api email:preview
# → ouvrir http://localhost:4000
```

Le serveur liste tous les templates, les rend avec les valeurs de `samples.json`, et auto-reload toutes les 2 secondes (modifier le HTML et voir le résultat).

### Envoi réel via Mailhog (rendu client + headers + texte brut)

```sh
pnpm --filter @confluent/api email:test
# → ouvrir http://localhost:8025 (Mailhog UI)
```

Vérifier :
- Subject correct (vient du JSON i18n).
- Preheader visible dans le résumé de la liste de mails.
- Rendu HTML conforme.
- Rendu `text/plain` (onglet "Plain Text" dans Mailhog) — doit être lisible sans aucun fichier de style.
- Headers : `From`, `To`, `Subject`, `MIME-Version`, `Content-Type: multipart/alternative`.

### Test cross-client réel (avant push staging)

Envoyer un email réel à une adresse personnelle. Tester au minimum :

- **Gmail web** (Chrome) : rendu général, dark/light mode désactivé, bouton cliquable.
- **Apple Mail iOS** (sur iPhone) : largeur respectée, police lisible, bouton tactile assez gros (>= 44pt).
- **Outlook web** (outlook.com) : layout en table tient, bouton cliquable même à coin carré.

Si on touche aux conventions structurelles (table layout, bouton pattern, doctype), faire une passe sur Litmus ou Email on Acid.

## Pièges connus et workarounds

| Client | Piège | Workaround |
|---|---|---|
| Outlook Windows | Ignore `border-radius`, `flex/grid`, `padding`/`margin` sur `<a>`, `background-image`, `box-shadow`, `text-shadow` | Tables + `<td bgcolor>` + `padding` sur `<td>`. Bouton à coin carré accepté. |
| Outlook macOS | Inverse les couleurs en dark mode auto | `<meta name="color-scheme" content="light only">` + `<meta name="supported-color-schemes" content="light only">` |
| Gmail Android (app) | Strip parfois `<style>` | Tout en CSS inline. Une `<style>` MSO conditionnelle est tolérée (Outlook seulement). |
| Apple Mail | Auto-link emails/dates/numéros → texte cliquable involontaire | `<meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">` ; au besoin wrap dans `<a href="#" style="color:inherit;text-decoration:none;">` |
| iOS Mail | Dark mode inverse les fonds | `<meta color-scheme="light only">` (cf. ci-dessus) |
| Gmail web | Affichage clip-only (1ʳᵉ partie tronquée si >102 KB) | Garder les emails < 100 KB. Pas d'inline base64 d'images. |
| Tous clients mobile | Texte trop petit | Taille de base 15-16px, jamais < 13px. |
