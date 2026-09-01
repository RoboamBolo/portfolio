# Portfolio — Roboam Bolossilia

Site statique (HTML / CSS / JS, sans framework ni build) présentant Roboam Bolossilia,
Full-Stack Developer & Digital Solutions Architect.

## Arborescence

```
portfolio/
├── index.html          # toute la structure et le contenu du site
├── css/
│   └── style.css       # design tokens, layout, thèmes clair/sombre, responsive
├── js/
│   └── script.js       # thème, navigation, animations au scroll, diagramme d'architecture, réseau de nœuds du hero, formulaire de contact
├── assets/
│   ├── images/         # à compléter (photo, captures de projets…)
│   ├── icons/
│   │   └── favicon.svg
│   └── fonts/          # non utilisé : les polices sont chargées via Google Fonts
└── README.md
```

## 1. Installation locale

Aucune dépendance, aucun build. Il suffit de servir le dossier avec n'importe quel
serveur statique, par exemple :

```bash
cd portfolio
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

ou avec `npx serve`, l'extension "Live Server" de VS Code, etc.

## 2. Ce qui reste à renseigner

Conformément à la règle « ne rien inventer », plusieurs zones du site utilisent le
texte `[À RENSEIGNER]` ou l'étiquette **« Statut à confirmer »**. À remplacer avant mise en ligne :

- **Section Contact** (`index.html`, section `#contact`) : email, téléphone, GitHub,
  LinkedIn, Facebook — mettre à jour à la fois le texte affiché et les attributs
  `href` (`mailto:`, `tel:`, liens de profils).
- **Section Parcours** (`#parcours`) : dates, formation, stage, expériences,
  certifications.
- **Statuts des projets** (`#projects`) : chaque étude de cas affiche un badge
  « Statut à confirmer ». Remplacez le texte du `<span class="status-pill">` par
  *Réalisé*, *En développement*, *Prototype*, *Concept* ou *Projet personnel* selon
  la réalité de chaque projet, et ajustez `data-status` si vous souhaitez leur donner
  des couleurs différentes en CSS.
- **Technologies SNICGTM et IST Bangui** : la liste `.tag-row` contient
  `[À RENSEIGNER]` en attendant la stack exacte de ces deux projets.
- **CV** : le bouton « Télécharger mon CV » (`#cvLink`) pointe vers `#` — remplacez
  `href` par le chemin d'un PDF (ex. `assets/cv-roboam-bolossilia.pdf`).
- **Formulaire de contact** : il fonctionne uniquement côté client pour l'instant
  (aucun email n'est réellement envoyé). Voir section 4 ci-dessous pour le connecter.

## 3. Personnalisation

### Couleur d'accent et thème
Toutes les couleurs sont définies comme variables CSS en haut de `css/style.css`,
dans `:root` (thème sombre, par défaut) et `[data-theme="light"]` (thème clair).
Modifier `--accent` change la couleur d'accent dans tout le site (boutons, liens actifs,
diagramme d'architecture, réseau de nœuds du hero, etc.).

### Typographies
Trois polices sont utilisées, chargées via Google Fonts dans `<head>` :
- `Familjen Grotesk` — titres et éléments d'affichage ;
- `Inter` — texte courant ;
- `IBM Plex Mono` — labels techniques, eyebrows, éléments d'architecture.

Pour les remplacer, changez le lien Google Fonts dans `index.html` ainsi que les
variables `--font-display`, `--font-body`, `--font-mono` dans `style.css`.

### Contenu des projets
Chaque étude de cas dans `#projects` suit la même structure (`.case-study`) :
contexte, problème, solution, fonctionnalités, technologies. Vous pouvez dupliquer
un bloc `<article class="case-study">…</article>` pour ajouter un nouveau projet.

### Photo / visuels
Le hero utilise actuellement un fond animé en Canvas (réseau de nœuds) plutôt qu'une
photo. Si vous souhaitez ajouter un portrait, placez le fichier dans
`assets/images/` et intégrez-le dans la section `.hero__content` de `index.html`.

## 4. Connecter le formulaire de contact

Le formulaire (`#contactForm` dans `index.html`, géré en JS dans `script.js`)
n'envoie actuellement aucune donnée : il affiche un message informant le visiteur
que le formulaire n'est pas encore relié à une adresse d'envoi. Pour le rendre
fonctionnel sans backend, deux options simples :

- **Formspree / Getform / Web3Forms** : remplacez la balise `<form id="contactForm">`
  par une action pointant vers le service choisi, ou adaptez le `fetch()` dans
  `script.js` pour poster vers leur API.
- **Backend PHP/Laravel existant** : si un endpoint API est déjà prévu pour un des
  projets présentés, vous pouvez faire un `fetch('/api/contact', { method: 'POST', … })`
  dans le gestionnaire d'événement `submit` du formulaire.

## 5. Déploiement

Le site est 100 % statique : n'importe quel hébergement de fichiers statiques
convient.

**Netlify / Vercel**
1. Poussez le dossier `portfolio/` sur un dépôt GitHub.
2. Connectez le dépôt sur Netlify ou Vercel.
3. Build command : *aucune* — Publish/Output directory : `/` (racine du dépôt, ou le
   dossier `portfolio/` si le dépôt contient d'autres fichiers).

**GitHub Pages**
1. Poussez le contenu de `portfolio/` à la racine d'un dépôt (ou dans `/docs`).
2. Activez GitHub Pages dans les paramètres du dépôt, sur la branche et le dossier
   concernés.

**Hébergement classique (OVH, o2switch, etc.)**
Envoyez le contenu du dossier `portfolio/` par FTP/SFTP dans le répertoire public
(`public_html`, `www`, …).

Pensez, après déploiement, à :
- mettre à jour les URLs Open Graph / Twitter Card si vous ajoutez une image de
  partage (`assets/images/`) ;
- ajouter un `sitemap.xml` si le site grandit au-delà d'une seule page ;
- vérifier le score Lighthouse (Performance / Accessibilité / SEO / Bonnes pratiques)
  dans les outils de développement Chrome une fois en ligne.

## 6. Revue qualité effectuée avant livraison

- **Responsive** : testé aux points de rupture 980px et 720px (grilles → colonne
  unique, navigation → menu mobile plein écran).
- **Accessibilité** : HTML sémantique (`header`, `main`, `section`, `footer`,
  `article`), lien d'évitement (« Aller au contenu »), focus visible personnalisé,
  contrastes texte/fond vérifiés sur les deux thèmes, `prefers-reduced-motion`
  respecté (désactive les animations JS et CSS non essentielles).
- **JavaScript** : vérifié sans erreur de syntaxe ; tous les `id` référencés dans
  `script.js` existent dans `index.html` ; toutes les classes utilisées dans le HTML
  sont stylées dans `style.css` (à l'exception de deux classes purement structurelles
  sans style dédié).
- **Cohérence des données** : aucune information personnelle, statut de projet,
  diplôme ou chiffre n'a été inventé — tout ce qui n'a pas été fourni est marqué
  `[À RENSEIGNER]` ou « Statut à confirmer ».
- **Performance** : pas de librairie externe hormis les polices Google Fonts ;
  animations en CSS/Canvas natif, sans dépendance JS lourde ; images non incluses
  pour l'instant (dossier `assets/images/` prêt à recevoir des visuels optimisés).
