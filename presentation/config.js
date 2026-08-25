/* =============================================================
   VISION 24 — CONFIGURATION DES PRIX
   -------------------------------------------------------------
   Modifiez uniquement les valeurs ci-dessous pour mettre à jour
   les prix affichés partout dans le site de présentation.
   Format : chaîne de caractères libre (ex : "890 €", "Sur devis").
   ============================================================= */

window.VISION24_CONFIG = {

  /* ---------- PACKS (page Nos Formules) ---------- */
  packs: {
    pack1: '<span class="save">Économie 280 €</span><span class="was">1 270 €</span><span class="now">990 €</span>',   // Box Magazine + Photobooth + Porte-clés
    pack2: '<span class="save">Économie 500 €</span><span class="was">2 990 €</span><span class="now">2 490 €</span>', // Captation mariage + Teaser + Drone + Photobooth
    pack3: '<span class="save">Économie 1 000 €</span><span class="was">4 990 €</span><span class="now">3 990 €</span>', // Captation + Teaser + Drone + Photobooth + DJ
    pack4: '<span class="save">Économie 380 €</span><span class="was">1 770 €</span><span class="now">1 390 €</span>', // Vidéobooth 360 + Photobooth + Box Magazine
  },

  /* ---------- PHOTOBOOTH ---------- */
  photobooth: {
    h3:      "490 €",
    h4:      "590 €",
    journee: "790 €",
    weekend: "1 290 €",
    porteCles: "à partir de 90 €",
  },

  /* ---------- VIDÉOBOOTH 360 ---------- */
  videobooth: {
    h3:      "590 €",
    h4:      "690 €",
    journee: "890 €",
    weekend: "1 490 €",
  },

  /* ---------- BOX MAGAZINE ---------- */
  boxMagazine: {
    h3:      "690 €",
    h4:      "790 €",
    journee: "990 €",
    weekend: "1 490 €",
  },

  /* ---------- BOX VOGUE ---------- */
  boxVogue: {
    h3:      "790 €",
    h4:      "890 €",
    journee: "1 090 €",
    weekend: "1 590 €",
  },

  /* ---------- CAPTATION VIDÉO ---------- */
  video: {
    emeraude:  "1 600 €",
    diamant:   "2 200 €",
    signature: "3 540 €",
  },

  /* ---------- PACKS — Données pour le PANIER (numériques) ---------- */
  packMeta: {
    pack1: {
      name: "Pack Essentiel",
      subtitle: "Box & Photobooth & Porte-clés",
      price: 990,
      questions: [
        { key: "theme",    label: "Thème / ambiance de votre événement",      type: "text",   required: true },
        { key: "invites",  label: "Nombre approximatif d'invités",            type: "number", required: true },
        { key: "portecles",label: "Nombre de porte-clés souhaités",           type: "number", required: false },
      ]
    },
    pack4: {
      name: "Pack Immersion 360°",
      subtitle: "Vidéobooth + Photobooth + Box Magazine",
      price: 1350,
      questions: [
        { key: "typeEvt",  label: "Type d'événement (mariage, entreprise, anniversaire…)", type: "text", required: true },
        { key: "invites",  label: "Nombre approximatif d'invités",            type: "number", required: true },
        { key: "espace",   label: "Espace disponible pour la borne (min 3×3m) ?", type: "text", required: false },
      ]
    },
    pack2: {
      name: "Pack Signature Mariage",
      subtitle: "Captation vidéo 4K + Teaser + Drone + Photobooth",
      price: 2490,
      questions: [
        { key: "ceremonie", label: "Type de cérémonie (mairie, laïque, religieuse)", type: "text", required: true },
        { key: "invites",   label: "Nombre approximatif d'invités",           type: "number", required: true },
        { key: "prepa",     label: "Souhaitez-vous les préparatifs filmés ?", type: "text", required: false },
        { key: "vinHonneur",label: "Vin d'honneur inclus dans la captation ?", type: "text", required: false },
      ]
    },
    pack3: {
      name: "Pack Prestige Complet",
      subtitle: "Captation vidéo + Teaser + Drone + Photobooth + DJ",
      price: 3990,
      questions: [
        { key: "duree",    label: "Durée souhaitée de la soirée (en heures)", type: "number", required: true },
        { key: "invites",  label: "Nombre approximatif d'invités",            type: "number", required: true },
        { key: "styleDj",  label: "Style musical DJ souhaité (variété, house, latino, année 80/90…)", type: "text", required: true },
        { key: "ceremonie", label: "Type d'événement",                         type: "text", required: false },
      ]
    },
  },

  /* ---------- PAIEMENT ---------- */
  paiement: {
    acomptePourcent: 30, // Pourcentage d'acompte
    // ▼ COLLEZ ICI VOS LIENS STRIPE PAYMENT LINK (un par pack ou lien commun) ▼
    stripeLinks: {
      pack1: "",  // ex : "https://buy.stripe.com/xxxxxxxx"
      pack2: "",
      pack3: "",
      pack4: "",
      // Ou un lien commun d'acompte pour tous :
      commun: "",
    },
  },

  /* ---------- BARS GOURMANDS ---------- */
  bars: {
    chocolat:   "à partir de 12 € / pers.",
    pancakes:   "à partir de 13 € / pers.",
    gaufres:    "à partir de 13 € / pers.",
    crepes:     "à partir de 13 € / pers.",
    popcorn:    "à partir de 9 € / pers.",
    hotdogs:    "à partir de 13 € / pers.",
    cafe:       "à partir de 12 € / pers.",
    complet:    "à partir de 12 € / pers.",
    brunch:     "22 € / pers.",
  },

};
