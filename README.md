# AP Vision — Site événementiel premium

Site vitrine + pages services + formulaire de devis.
Vanilla HTML/CSS/JS, aucune étape de build. Prêt à déployer sur Vercel, Netlify, OVH, o2switch, GitHub Pages, etc.

## Structure

```
/
├── index.html                    # Landing complète
├── services/
│   ├── photobooth.html
│   ├── box-magazine.html
│   ├── videobooth-360.html
│   └── bar-gourmand.html
├── assets/
│   ├── css/main.css              # Design system + composants
│   ├── js/
│   │   ├── main.js               # Intro, nav, animations, sliders
│   │   └── form.js               # Envoi formulaire
│   └── img/                      # Vos images et vidéo (à placer ici)
└── README.md
```

## Ce qu'il faut remplacer avant mise en ligne

### 1. Vidéo du Hero
Placer une vidéo dans `assets/img/hero.mp4` (format MP4, H.264, max ~15 Mo, boucle courte).
Ajouter une image de secours `assets/img/hero-poster.jpg` (1920×1080, jpg, ~200 Ko).

Sans vidéo, le hero affiche le fond bordeaux/dégradé — le site reste beau.

### 2. Logo (animation d'intro)
Le logo dessiné est un placeholder "AP Vision" en SVG.
Pour utiliser votre logo :
- Éditer `index.html`, chercher `<svg class="intro__logo"` et remplacer par votre logo SVG.
- Le logo doit avoir des `<path>` avec `fill="none"` pour que l'animation de tracé fonctionne.
- Ajouter la classe `fill-target` aux paths que vous voulez faire remplir en fin d'animation.

### 3. Image "À propos"
Placer `assets/img/about-placeholder.jpg` (~1200×1500, jpg).
Le CSS l'utilise automatiquement.

### 4. Galeries services
Chaque page service a une grille de placeholders `<div class="js-reveal">Photo 1</div>`.
Remplacer chacun par une balise `<img src="../assets/img/photobooth-1.jpg" alt="…" loading="lazy" />` ou un fond CSS.

### 5. Vidéo démo Vidéobooth
Sur `services/videobooth-360.html`, remplacer le bloc "Vidéo démo à insérer" par une balise `<video>` avec votre démo.

### 6. Emojis Best Sellers / Bar Gourmand
Les emojis 🍩 🌭 ☕ sont volontaires (immédiats à comprendre). Pour un rendu 100% photo, remplacer chaque `<div class="bs-bar__slide-media">🍩</div>` et `<div class="bar-slide__visual">🍩</div>` par une `<img>`.

### 7. Réseaux sociaux
Dans le footer d'`index.html`, remplacer les `href="#"` des icônes Instagram/Facebook/TikTok par vos vraies URL.

## Formulaire de devis — activation

Le formulaire pointe vers **FormSubmit** (`https://formsubmit.co/ap.vision24@outlook.fr`).
Gratuit, aucun compte requis, mais il faut activer votre adresse une seule fois :

1. Déployer le site (ou tester en local avec un serveur, pas juste `file://`).
2. Envoyer un premier formulaire de test depuis le site.
3. Vous recevrez un email de FormSubmit avec un lien de confirmation.
4. Cliquer le lien → l'adresse est activée à vie.

Après ça, toutes les demandes arrivent directement à `ap.vision24@outlook.fr`.

**Alternative si vous préférez** : Formspree, Basin, ou votre propre backend PHP/Node. Il suffit de changer l'attribut `action` de chaque formulaire.

## Tester en local

Un simple double-clic sur `index.html` fonctionne pour 95% du site, mais le formulaire ne partira pas (CORS). Pour un test complet :

```bash
# Depuis le dossier du projet
python3 -m http.server 8000
# Puis ouvrir http://localhost:8000
```

Ou installer un extension VS Code "Live Server".

## Déploiement

**Vercel / Netlify** (recommandé, gratuit, HTTPS auto) :
1. Créer un compte
2. "New site → Deploy manually" → glisser-déposer le dossier
3. Choisir le nom de domaine

**GitHub Pages** :
1. Créer un repo, pousser les fichiers
2. Settings → Pages → Deploy from main branch

**Hébergeur classique (OVH, o2switch…)** :
Uploader tout le dossier par FTP à la racine (`www/` ou `public_html/`).

## Personnalisation rapide

### Changer les couleurs
Ouvrir `assets/css/main.css`, tout en haut :

```css
:root {
  --bordeaux: #560216;   /* votre couleur principale */
  --creme: #ede1d8;      /* votre couleur secondaire */
  ...
}
```

Tout le site se met à jour automatiquement.

### Changer les polices
Ligne 20-21 du CSS et le `<link>` Google Fonts dans chaque HTML.

### Ajouter/retirer des sections
Chaque section est un `<section class="section">` autonome dans `index.html`.
Structure : `.section > .page > (contenu)`.

## Performance

Le site tel qu'il est :
- 0 dépendance JavaScript externe (pas de jQuery, GSAP chargé côté client uniquement si tu l'ajoutes)
- CSS et JS séparés, mis en cache
- Animations via IntersectionObserver + Web Animations API (natif, 60fps)
- `loading="lazy"` à ajouter sur toutes les images que vous insérez

Pour dépasser 95 sur Lighthouse :
- Compresser images en WebP (via [squoosh.app](https://squoosh.app))
- Servir la vidéo hero en MP4 optimisé (`ffmpeg -crf 28 -preset slow`)
- Auto-hosted fonts (optionnel — remplacer le lien Google Fonts par du @font-face local)

## Mentions légales

Les liens "Mentions légales" et "Politique de confidentialité" du footer pointent vers `#` — à créer selon votre statut juridique (obligatoire pour un site pro en France).

---

Pour toute question ou évolution : re-lancer une session Claude Code dans ce dossier.
