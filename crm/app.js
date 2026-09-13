/* =========================================================
   VISION 24 CRM — Application
   Single-file SPA · localStorage persistence
   v2 : Module Devis central + catalogue Vision 24 complet
========================================================= */

/* ---------- Utils ---------- */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 10);
const fmtMoney = n => (n||0).toLocaleString('fr-FR', { style:'currency', currency:'EUR', maximumFractionDigits: 0 });
const fmtMoneyPrec = n => (n||0).toLocaleString('fr-FR', { style:'currency', currency:'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const fmtDateTime = d => d ? new Date(d).toLocaleString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—';
const initials = (p, n) => ((p||'?').charAt(0) + (n||'').charAt(0)).toUpperCase();
const esc = s => (s??'').toString().replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const nl2br = s => esc(s||'').replace(/\n/g, '<br>');
const daysBetween = (a,b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const startOfMonth = d => { const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x; };
const addMonths = (d,n) => { const x = new Date(d); x.setMonth(x.getMonth()+n); return x; };
const isSameDay = (a,b) => a && b && new Date(a).toDateString() === new Date(b).toDateString();

const toast = (msg) => {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, 2400);
};

/* =========================================================
   CATALOGUE VISION 24 — récupéré depuis vision24.fr / vision24.fun
   Structure : prestations avec variantes de durée + options
========================================================= */
const CATALOG = [
  // ============================================================
  // FORMULES SIGNATURE (packs multi-prestations)
  // ============================================================
  {
    id:'pack01', nom:'Pack 01 — Essentiel', categorie:'Formules signature',
    description:'La formule signature qui allie souvenir et immersion.\n• Box Magazine personnalisée (3 h d\'animation)\n• Photobooth premium (3 h · tirages illimités)\n• 30 porte-clés cuir personnalisés inclus\nInstallation, animateur et démontage compris.',
    variants:[ { label:'Formule complète', prix:1690 } ],
    options:[
      { label:'Heure supplémentaire (par prestation)',   prix:150 },
      { label:'Porte-clés supplémentaires (lot de 20)',   prix:120 },
      { label:'Personnalisation graphique avancée',       prix:90 }
    ],
    actif:true, tva:0
  },
  {
    id:'pack02', nom:'Pack 02 — Immersion 360°', categorie:'Formules signature',
    description:'La formule immersive qui marque tous les esprits.\n• Vidéobooth 360° avec structure gonflable (3 h · plateforme rotative · ralentis)\n• Photobooth premium (3 h · tirages illimités)\n• Box Magazine personnalisée (3 h)\nInstallation, animateurs et démontage compris.',
    variants:[ { label:'Formule complète', prix:2290 } ],
    options:[
      { label:'Heure supplémentaire (par prestation)',   prix:150 },
      { label:'Habillage vidéo personnalisé',             prix:180 }
    ],
    actif:true, tva:0
  },
  {
    id:'pack03', nom:'Pack 03 — Signature Mariage', categorie:'Formules signature',
    description:'Le pack pensé pour les mariages qui restent gravés.\n• Captation vidéo mariage 4K + son pro + montage cinéma (préparatifs → soirée)\n• Film final monté 15-20 min · musiques adaptées · livraison sécurisée\n• Teaser vertical réseaux sociaux\n• Prises de vue drone (pilote certifié DGAC · sous réserve météo)\n• Photobooth premium (3 h)',
    variants:[ { label:'Formule complète', prix:2890 } ],
    options:[
      { label:'Heure supplémentaire captation vidéo',   prix:250 },
      { label:'Deuxième caméra',                        prix:390 },
      { label:'Film long-format (30 min)',              prix:450 },
      { label:'Micros cravate mariés + officiant',      prix:90 }
    ],
    actif:true, tva:0
  },
  {
    id:'pack04', nom:'Pack 04 — Prestige Complet', categorie:'Formules signature',
    description:'La formule tout-en-un premium.\n• Captation vidéo 4K + son pro + montage cinéma\n• Teaser vertical réseaux sociaux\n• Prises de vue drone\n• Photobooth premium (3 h)\n• DJ professionnel avec son & lumière pro',
    variants:[ { label:'Formule complète', prix:4290 } ],
    options:[
      { label:'Heure supplémentaire DJ',               prix:120 },
      { label:'Piste de danse LED',                    prix:490 },
      { label:'Machine à fumée / effets scéniques',    prix:180 }
    ],
    actif:true, tva:0
  },

  // ============================================================
  // PHOTOBOOTH — Animation photo événementiel (Fiche produit N°1)
  // ============================================================
  {
    id:'photobooth', nom:'Photobooth premium', categorie:'Photobooth',
    description:'Le Photobooth est une animation incontournable pour tous types d\'événements. Il permet à vos invités de capturer des souvenirs uniques grâce à des photos de haute qualité, imprimées instantanément sur place.\n\n• Appareil photo reflex haute définition\n• Éclairage LED professionnel intégré\n• Écran tactile intuitif\n• Impression instantanée en haute qualité (illimitée)\n• Envoi par e-mail ou QR code\n• Personnalisation du visuel sur écran et des cadres photos\n• Galerie en ligne sécurisée\n• Utilisation intérieure ou extérieure sous abri\n• Installation & désinstallation comprises\n• Durée d\'installation : 45 à 60 min',
    variants:[
      { label:'3 heures',  prix:490 },
      { label:'4 heures',  prix:590 },
      { label:'6 heures',  prix:690 },
      { label:'Journée',   prix:890 },
      { label:'Weekend',   prix:1290 }
    ],
    options:[
      { label:'Heure supplémentaire',                       prix:120 },
      { label:'Personnalisation avancée du visuel écran',   prix:90 },
      { label:'Backdrop premium (mur végétal / néon)',      prix:180 },
      { label:'Impression 400 tirages garantis',             prix:0, incluseParDefaut:true },
      { label:'Livraison au-delà de 20 km (par km sup.)',   prix:1.5 }
    ],
    actif:true, tva:0
  },
  {
    id:'porte_cles', nom:'Porte-clés personnalisés simili cuir', categorie:'Photobooth',
    description:'Machine dédiée sur place pour personnaliser les porte-clés en simili cuir. Chaque invité repart avec un souvenir unique de votre événement.\n\n• Personnalisation instantanée devant les invités\n• Plusieurs coloris disponibles pour s\'adapter à votre thème\n• Expérience interactive et originale\n• Souvenir durable de qualité',
    variants:[
      { label:'Lot 30 personnes',    prix:200 },
      { label:'Lot 60 personnes',    prix:250 },
      { label:'Lot 100 personnes',   prix:350 },
      { label:'Lot 150 personnes',   prix:490 }
    ],
    options:[],
    actif:true, tva:0
  },

  // ============================================================
  // BOX / CABINE — Animation photo événementiel
  // ============================================================
  {
    id:'boxmagazine', nom:'Box Magazine — Vos invités en couverture', categorie:'Box & Cabine',
    description:'La Box Magazine permet à vos invités de poser comme en couverture d\'un véritable magazine personnalisé. Animation originale qui crée des souvenirs uniques et apporte une touche glamour à vos événements tout en renforçant votre image de marque.\n\n• Structure légère au format 2M × 2M\n• Personnalisation graphique complète (façade, logos partenaires)\n• Impression haute définition\n• Éclairage professionnel pour un rendu optimal\n• Espace sécurisé, adapté à tous les publics\n• Utilisation intérieure ou extérieure\n• Installation rapide (1h à 2h)\n• Compatible avec un photographe\n• Animateur dédié · installation & démontage inclus',
    variants:[
      { label:'3 heures',  prix:590 },
      { label:'4 heures',  prix:690 },
      { label:'Journée',   prix:990 },
      { label:'Weekend',   prix:1290 }
    ],
    options:[
      { label:'Heure supplémentaire',                    prix:130 },
      { label:'Design magazine 100 % sur mesure',         prix:150 },
      { label:'Impression 400 tirages sur place',         prix:0, incluseParDefaut:true },
      { label:'Cadre bois premium (souvenir)',            prix:60 }
    ],
    actif:true, tva:0
  },
  {
    id:'boxvogue', nom:'Cabine Vogue — Expérience éditoriale', categorie:'Box & Cabine',
    description:'Prestation de location d\'une Cabine Vogue pour animation événementielle. Cette animation offre une expérience premium, moderne et impactante, idéale pour créer du contenu stylé et valoriser l\'image de votre événement.\n\n• Livraison sur site de la cabine\n• Personnalisation de la box sur mesure (nom de la soirée, logos sponsors)\n• Installation complète par nos soins\n• Espace immersif type "Vogue Booth" : éclairages LED dynamiques, ambiance premium, look magazine\n• Désinstallation en fin de prestation',
    variants:[
      { label:'3 heures sur place',  prix:490 },
      { label:'4 heures sur place',  prix:530 },
      { label:'Journée',              prix:790 }
    ],
    options:[
      { label:'Direction artistique sur mesure',   prix:180 },
      { label:'Photographe additionnel',           prix:290 }
    ],
    actif:true, tva:0
  },

  // ============================================================
  // VIDÉO 360° — Animation vidéo immersive (Fiche produit N°2)
  // ============================================================
  {
    id:'videobooth360', nom:'360 Vidéobooth avec structure gonflable', categorie:'Vidéo 360°',
    description:'Le 360 Vidéobooth avec structure gonflable offre une expérience immersive et spectaculaire. Les participants montent sur une plateforme pendant qu\'une caméra motorisée réalise une vidéo à 360° avec effets dynamiques, ralentis et musiques personnalisées.\n\n• Plateforme 360°\n• Bras motorisé automatique\n• Caméra haute définition\n• Éclairage LED professionnel\n• Structure gonflable lumineuse (attire immédiatement l\'attention)\n• Personnalisation vidéo (habillage)\n• Effets Slow Motion\n• Musiques intégrées\n• Partage instantané par QR code\n• Utilisation intérieure ou extérieure\n• Animateur dédié · Durée d\'installation : 45 à 60 min',
    variants:[
      { label:'3 heures',  prix:690 },
      { label:'4 heures',  prix:790 },
      { label:'Journée',   prix:1190 },
      { label:'Weekend',   prix:1590 }
    ],
    options:[
      { label:'Heure supplémentaire',                 prix:150 },
      { label:'Habillage vidéo personnalisé',         prix:180 },
      { label:'Podium sur mesure',                    prix:290 },
      { label:'Deuxième animateur',                    prix:180 }
    ],
    actif:true, tva:0
  },

  // ============================================================
  // CAPTATION VIDÉO — Mariage, événements, corporate
  // ============================================================
  {
    id:'captation_mariage', nom:'Captation vidéo mariage 4K', categorie:'Captation vidéo',
    description:'La captation complète de votre journée de mariage.\n\n• Préparatifs, cérémonie civile, cérémonie laïque, réception et soirée jusqu\'à 00h30\n• Matériel professionnel : caméras 4K, stabilisateurs, micros pour discours et vœux, drone (sous réserve d\'autorisations et conditions météo)\n• Couverture des moments clés : séance couple, discours, animations, ouverture de bal, découpe du gâteau, ambiance générale, moments spontanés\n• Plans artistiques et de détails : robe, costume, alliances, décorations, éléments significatifs\n• Post-production : tri des séquences, étalonnage colorimétrique\n• Film final monté 15-20 min, mix de musiques adaptées\n• Livraison via lien sécurisé et/ou clé USB personnalisée',
    variants:[
      { label:'Journée complète (préparatifs → 00h30)',  prix:1380 },
      { label:'Journée + soirée prolongée (→ 03h)',       prix:1780 }
    ],
    options:[
      { label:'Prises de vue drone (pilote DGAC)',   prix:100 },
      { label:'Deuxième caméra',                     prix:390 },
      { label:'Film long-format 30 min',              prix:450 },
      { label:'Micros cravate discours/vœux',         prix:90 },
      { label:'Clé USB personnalisée gravée',         prix:60 }
    ],
    actif:true, tva:0
  },
  {
    id:'captation_pro', nom:'Captation vidéo événement pro', categorie:'Captation vidéo',
    description:'Captation vidéo professionnelle de votre événement d\'entreprise, boxe, sportif, salon, inauguration.\n\n• Vidéaste professionnel · caméras 4K · prise de son optimisée\n• Couverture des moments forts, dynamisme et immersion\n• Sélection et montage des meilleures séquences\n• Post-production : montage dynamique avec habillage graphique aux couleurs de l\'entreprise\n• Mixage audio complet (musique libre de droits)\n• Étalonnage colorimétrique lumineux et professionnel\n• Livraison optimisée pour plateformes sociales',
    variants:[
      { label:'1 teaser vertical 30 s + vidéo 1-2 min horizontal', prix:690 },
      { label:'Demi-journée (4 h)',                                  prix:990 },
      { label:'Journée complète',                                     prix:1490 },
      { label:'Journée + soirée',                                     prix:1890 }
    ],
    options:[
      { label:'Heure supplémentaire',              prix:150 },
      { label:'Prises de vue drone (pilote DGAC)', prix:200 },
      { label:'Teaser vertical réseaux sociaux',   prix:380 },
      { label:'Deuxième vidéaste',                  prix:390 }
    ],
    actif:true, tva:0
  },
  {
    id:'drone', nom:'Prises de vue drone', categorie:'Captation vidéo',
    description:'Prises de vue aériennes par pilote certifié DGAC.\n\n• Photos et vidéos haute résolution 4K\n• Panoramique de l\'ensemble de l\'événement\n• Plans larges, vues détaillées, plans dynamiques en mouvement\n• Sélection des meilleures prises et livraison en qualité optimale\n• Autorisations administratives comprises',
    variants:[
      { label:'1 heure de vol',   prix:200 },
      { label:'Demi-journée',     prix:490 },
      { label:'Journée',          prix:790 }
    ],
    options:[
      { label:'Livraison rushes complets bruts',   prix:80 }
    ],
    actif:true, tva:0
  },

  // ============================================================
  // BARS GOURMANDS (Fiches produit N°4 à N°7)
  // ============================================================
  {
    id:'bar_hotdogs', nom:'Bar à Hot-Dogs', categorie:'Bar gourmand',
    description:'Le Bar à Hot-Dogs est une animation gourmande et conviviale qui ravit petits et grands. Nos équipes préparent les hot-dogs sur place, devant vos invités, avec des ingrédients de qualité, assemblés à la demande selon les préférences de chacun.\n\n• Plaque chauffe-saucisses professionnelle · chauffe-pain\n• Mini pains à hot-dog · mini saucisses · oignons frits\n• Sauces : ketchup, mayonnaise, moutarde\n• Garnitures variées, préparation en direct\n• Chef dédié · présentation soignée\n• Respect des normes HACCP\n• Durée d\'installation : 1 h à 1 h 30',
    variants:[
      { label:'2 heures · ~60 personnes',    prix:490 },
      { label:'3 heures · ~120 personnes',   prix:590 },
      { label:'Journée · >150 personnes',    prix:990 }
    ],
    options:[
      { label:'Chef supplémentaire',                         prix:180 },
      { label:'Version premium (bœuf artisanal)',            prix:180 },
      { label:'Consommables (3 € × nb invités)',             prix:0 }
    ],
    actif:true, tva:0
  },
  {
    id:'bar_chocolat', nom:'Bar à Chocolat Chaud avec impression sur mousse', categorie:'Bar gourmand',
    description:'Le Bar à Chocolat Chaud avec impression sur mousse est une animation originale et élégante. Nos équipes préparent sur place de délicieux chocolats chauds onctueux, personnalisés grâce à une impression alimentaire directement sur la mousse. Logo, prénom, message ou visuel personnalisé.\n\n• Machine professionnelle à chocolat chaud\n• Imprimante alimentaire haute précision\n• Chocolat chaud premium · mousse de lait onctueuse\n• Plusieurs recettes disponibles\n• Gobelets premium · service sur place\n• Idéal mariages, événements d\'entreprise, salons, inaugurations, marchés de Noël\n• Durée d\'installation : 1 h à 1 h 30',
    variants:[
      { label:'2 heures',   prix:390 },
      { label:'3 heures',   prix:490 },
      { label:'Journée',    prix:790 }
    ],
    options:[
      { label:'Impression logo/prénom sur mousse',        prix:0, incluseParDefaut:true },
      { label:'Chocolats artisanaux en accompagnement',   prix:120 },
      { label:'Marshmallows premium',                      prix:40 }
    ],
    actif:true, tva:0
  },
  {
    id:'bar_pancake_gaufres', nom:'Bar à Pancakes & Gaufres', categorie:'Bar gourmand',
    description:'Le Bar à Pancakes & Gaufres est une animation sucrée très appréciée qui permet à vos invités de déguster des gourmandises préparées sur place.\n\n• Gaufrier professionnel · machine à pancakes\n• Coulis : Nutella, caramel beurre salé, miel, spéculoos\n• Ingrédients : banane, spéculoos, chantilly, noix de coco râpée\n• Suppléments : fruits de saison, M&M\'s, Kinder Bueno, pistache\n• Chef dédié · préparation en direct\n• Durée d\'installation : 1 h à 1 h 30',
    variants:[
      { label:'2 heures · ~60 personnes',    prix:390 },
      { label:'3 heures · ~120 personnes',   prix:490 },
      { label:'Journée · >150 personnes',    prix:890 }
    ],
    options:[
      { label:'Chef supplémentaire',                          prix:180 },
      { label:'Extension +1h',                                prix:150 },
      { label:'Toppings premium (fruits rouges, artisans)',   prix:80 },
      { label:'Consommables (3 € × nb invités)',              prix:0 }
    ],
    actif:true, tva:0
  },
  {
    id:'bar_crepes', nom:'Bar à Crêpes', categorie:'Bar gourmand',
    description:'Le Bar à Crêpes apporte une ambiance chaleureuse et conviviale à vos événements. Les crêpes sont préparées à la demande devant les invités et personnalisées avec de nombreuses garnitures gourmandes.\n\n• Crêpière professionnelle\n• Pâte artisanale\n• Garnitures : caramel beurre salé, confitures, sucre, chantilly, fruits frais, Nutella\n• Chef dédié · animation culinaire en direct\n• Durée d\'installation : 1 h à 1 h 30',
    variants:[
      { label:'2 heures · ~60 personnes',   prix:390 },
      { label:'3 heures · ~120 personnes',  prix:490 },
      { label:'Journée',                     prix:890 }
    ],
    options:[
      { label:'Chef supplémentaire',              prix:180 },
      { label:'Version salée en supplément',      prix:80 },
      { label:'Consommables (3 € × nb invités)',  prix:0 }
    ],
    actif:true, tva:0
  },
  {
    id:'bar_boissons_latte', nom:'Bar Boissons personnalisées (Latte Art)', categorie:'Bar gourmand',
    description:'Café d\'excellence avec impression latte art personnalisée : logo, prénom, ou visuel de votre événement imprimé directement sur la mousse.\n\n• Machine à café professionnelle\n• Imprimante alimentaire haute précision\n• Café, thés, chocolat chaud premium\n• Gobelets premium · service sur place',
    variants:[
      { label:'2 heures',   prix:390 },
      { label:'3 heures',   prix:490 },
      { label:'Journée',    prix:790 }
    ],
    options:[
      { label:'Impression logo sur mousse',   prix:0, incluseParDefaut:true },
      { label:'Chocolat chaud inclus',        prix:120 },
      { label:'Thés premium inclus',          prix:80 }
    ],
    actif:true, tva:0
  },
  {
    id:'bar_popcorn', nom:'Bar à Popcorn', categorie:'Bar gourmand',
    description:'Machine à popcorn en libre-service avec pochettes signature personnalisées aux couleurs de votre événement.\n\n• Machine professionnelle\n• Popcorn frais préparé sur place\n• Pochettes signature personnalisées disponibles',
    variants:[
      { label:'2 heures',   prix:290 },
      { label:'3 heures',   prix:390 },
      { label:'Journée',    prix:590 }
    ],
    options:[
      { label:'Pochettes personnalisées (logo/prénoms)', prix:80 },
      { label:'Version sucré + salé',                    prix:60 }
    ],
    actif:true, tva:0
  },

  // ============================================================
  // ANIMATIONS COMPLÉMENTAIRES
  // ============================================================
  {
    id:'dj_pro', nom:'DJ professionnel', categorie:'Animation',
    description:'DJ expérimenté avec matériel son professionnel et système lumière pro. Playlist adaptée à votre événement, animation micro possible.\n\n• Sound system pro\n• Éclairage lumière & LED\n• Playlist personnalisée\n• Animation micro possible',
    variants:[
      { label:'Soirée (4 heures)',        prix:790 },
      { label:'Soirée longue (6 heures)', prix:990 },
      { label:'Journée + soirée',         prix:1290 }
    ],
    options:[
      { label:'Heure supplémentaire',             prix:120 },
      { label:'Piste de danse LED',               prix:490 },
      { label:'Machine à fumée / effets scéniques', prix:180 },
      { label:'Micro sans fil animation',         prix:60 }
    ],
    actif:true, tva:0
  },

  // ============================================================
  // CONSOMMABLES (ligne séparée dans les devis)
  // ============================================================
  {
    id:'consommables', nom:'Consommables bar gourmand', categorie:'Options',
    description:'Ensemble des produits nécessaires au bon déroulement du bar gourmand :\n• Pâtes (pancakes, gaufres, crêpes) : œuf, farine, sucre, levure, lait\n• L\'intégralité des coulis (Nutella, caramel, miel, spéculoos)\n• Carton alimentaire\n• Vaisselle jetable · petites serviettes\n\nFacturé au nombre d\'invités prévu.',
    variants:[
      { label:'3 € × nombre d\'invités', prix:0 }
    ],
    options:[],
    actif:true, tva:0
  }
];

/* =========================================================
   STORE
========================================================= */
const KEY = 'vision24_crm_v5';

/* Statuts d'une demande entrante */
const DEMANDE_STATUTS = ['nouvelle','à_traiter','contacté','devis_à_préparer','devis_envoyé','relance_1','relance_2','relance_3','gagné','perdu','annulé'];
const DEMANDE_STATUT_LABELS = {
  nouvelle:'Nouvelle', à_traiter:'À traiter', contacté:'Contacté',
  devis_à_préparer:'Devis à préparer', devis_envoyé:'Devis envoyé',
  relance_1:'Relance 1', relance_2:'Relance 2', relance_3:'Relance 3',
  gagné:'Gagné', perdu:'Perdu', annulé:'Annulé'
};

const SEED = {
  meta: { version: 5, currency: 'EUR', tvaDefault: 0, acompteDefault: 30, marginRate: 45, tvaMention:'TVA non applicable, art.293B du CGI', entreprise: {
    nom:'Vision 24', slogan:'Votre projet, notre vision',
    adresse:'Collégien, 77090',
    tel:'07 82 61 32 16',
    email:'ap.vision24@outlook.fr', site:'vision24.fr',
    siret:'988 720 447 00016', tva:''
  } },
  users: [ { id:'u_anthony', name:'Anthony', role:'admin' } ],
  demandes: [
    {
      id:'dm_demo1', source:'vision24.fr', receivedAt: Date.now()-2*3600*1000, statut:'nouvelle',
      prenom:'Jean', nom:'Dupont', societe:'', email:'jean.dupont@example.fr', tel:'06 55 44 33 22',
      typeClient:'particulier', typeEvenement:'Mariage', dateEvenement:'2027-06-26', horaires:'18h — 03h',
      lieuEvenement:'Domaine des Roses · Fontainebleau', nbPersonnes:120, budget:2500,
      services:['Photobooth premium', 'Box Magazine'], options:[],
      message:'Bonjour, nous nous marions le 26 juin 2027 et cherchons un photobooth + Box Magazine pour environ 120 invités.',
      raw:{}, prospectId:null, quoteId:null, lastModified: Date.now()-2*3600*1000
    },
    {
      id:'dm_demo2', source:'vision24.fun', receivedAt: Date.now()-1*86400*1000, statut:'à_traiter',
      prenom:'Sophie', nom:'Martin', societe:'Studio Lumière', email:'sophie@studio-lumiere.fr', tel:'07 11 22 33 44',
      typeClient:'professionnel', typeEvenement:'Inauguration', dateEvenement:'2026-10-15',
      lieuEvenement:'Paris 2ème', nbPersonnes:60, budget:1500,
      services:['Bar à pancakes','Photobooth'], options:['Personnalisation'],
      message:'Inauguration boutique · 60 invités · souhait bar sucré + photobooth avec impression.',
      raw:{}, prospectId:null, quoteId:null, lastModified: Date.now()-1*86400*1000
    }
  ],
  prestations: CATALOG,
  stages: [
    { id:'s_received',  nom:'Demande reçue',        ordre:1 },
    { id:'s_quote_p',   nom:'Devis en préparation', ordre:2 },
    { id:'s_quote_s',   nom:'Devis envoyé',         ordre:3 },
    { id:'s_followup',  nom:'Relance',              ordre:4 },
    { id:'s_billing',   nom:'Facturation',          ordre:5 },
    { id:'s_won',       nom:'Fermé · gagné',        ordre:6 },
    { id:'s_lost',      nom:'Fermé · perdu',        ordre:7 },
  ],
  contacts: [
    { id:'c1', type:'prospect', temperature:'hot',  prenom:'Julie', nom:'Martin', email:'julie.martin@example.fr', tel:'06 12 34 56 78', entreprise:'', adresse:'12 rue des Lilas · 75011 Paris', source:'Instagram', owner:'u_anthony', notes:'Mariage 180 pers · veut Pack 02 Immersion 360°', createdAt: Date.now() - 4*86400000 },
    { id:'c2', type:'prospect', temperature:'warm', prenom:'Karim', nom:'Benali', email:'k.benali@corp.com', tel:'06 55 44 33 22', entreprise:'Lumière SA', adresse:'8 avenue Foch · 75116 Paris', source:'Recommandation', owner:'u_anthony', notes:'Séminaire d\'entreprise · 80 pers', createdAt: Date.now() - 10*86400000 },
    { id:'c3', type:'client',   temperature:'hot',  prenom:'Sophie', nom:'Legrand', email:'sophie@legrand.fr', tel:'07 88 99 00 11', entreprise:'', adresse:'Neuilly-sur-Seine', source:'Site internet', owner:'u_anthony', notes:'Cliente fidèle · anniversaire 40 ans', createdAt: Date.now() - 60*86400000 },
    { id:'c4', type:'prospect', temperature:'cold', prenom:'Marc',  nom:'Dupont', email:'marc.dupont@mail.com', tel:'06 11 22 33 44', entreprise:'', adresse:'Versailles', source:'Salon du mariage', owner:'u_anthony', notes:'Devis reçu · pas de retour', createdAt: Date.now() - 25*86400000 },
  ],
  deals: [
    { id:'d1', title:'Mariage Julie & Thomas', contactId:'c1', stage:'s_quote_s', probabilite:70, closeDate: Date.now()+30*86400000, eventDate:'2026-06-14', eventType:'Mariage', horaires:'18h — 03h', lieu:'Château de Vaux', invites:180, notes:'', createdAt: Date.now() - 4*86400000 },
    { id:'d2', title:'Séminaire Lumière SA',   contactId:'c2', stage:'s_received', probabilite:40, closeDate: Date.now()+45*86400000, eventDate:'2026-10-08', eventType:'Séminaire', horaires:'9h — 18h', lieu:'Paris 8e', invites:80,  notes:'', createdAt: Date.now() - 10*86400000 },
    { id:'d3', title:'Anniversaire 40 ans Sophie', contactId:'c3', stage:'s_won', probabilite:100, closeDate: Date.now()-5*86400000, eventDate:'2026-09-20', eventType:'Anniversaire', horaires:'19h — 02h', lieu:'Neuilly', invites:60, notes:'', createdAt: Date.now() - 60*86400000 },
    { id:'d4', title:'Baptême M. Dupont',       contactId:'c4', stage:'s_followup', probabilite:20, closeDate: Date.now()+15*86400000, eventDate:'2026-05-30', eventType:'Baptême', horaires:'14h — 20h', lieu:'Versailles', invites:40, notes:'', createdAt: Date.now() - 25*86400000 },
  ],
  quotes: [],
  invoices: [],
  payments: [],
  activities: [
    { id:'a1', contactId:'c1', dealId:'d1', type:'call',  contenu:'Premier appel · besoins précisés', createdAt: Date.now() - 4*86400000 },
    { id:'a3', contactId:'c2', dealId:'d2', type:'email', contenu:'Réponse initiale envoyée',        createdAt: Date.now() - 9*86400000 },
    { id:'a4', contactId:'c3', dealId:'d3', type:'signed', contenu:'Contrat signé · acompte reçu',    createdAt: Date.now() - 20*86400000 },
  ],
  tasks: [
    { id:'t1', contactId:'c1', dealId:'d1', titre:'Relancer Julie pour retour devis', due: Date.now()+2*86400000, done:false },
    { id:'t2', contactId:'c2', dealId:'d2', titre:'Envoyer devis séminaire Lumière SA', due: Date.now()+1*86400000, done:false },
    { id:'t3', contactId:'c4', dealId:'d4', titre:'Deuxième relance M. Dupont', due: Date.now()-1*86400000, done:false },
  ],
  emailTemplates: [
    { id:'et_devis', nom:'Envoi de devis', sujet:'Vision 24 · Votre devis {{numero}}',
      corps:`Bonjour {{prenom}},\n\nSuite à notre échange, veuillez trouver ci-joint votre devis n°{{numero}} d'un montant de {{montant}} TTC concernant votre événement.\n\nCe devis est valable 30 jours. Un acompte de 30% sera demandé à la signature pour verrouiller votre date.\n\nJe reste à votre entière disposition pour toute question ou pour ajuster la proposition à vos besoins.\n\nBien à vous,\nAnthony · Vision 24\nVotre projet, notre vision\ncontact@vision24.fr` },
    { id:'et_relance', nom:'Relance devis', sujet:'Vision 24 · À propos de votre devis {{numero}}',
      corps:`Bonjour {{prenom}},\n\nJ'espère que vous allez bien. Je reviens vers vous concernant le devis n°{{numero}} envoyé récemment.\n\nAvez-vous eu l'occasion d'en prendre connaissance ? Je serais ravi d'échanger si vous avez la moindre question.\n\nÀ très vite,\nAnthony · Vision 24` }
  ]
};

const Store = {
  data: null,
  load(){
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      this.data = (parsed && parsed.meta?.version === SEED.meta.version) ? parsed : structuredClone(SEED);
    } catch { this.data = structuredClone(SEED); }
    // MIGRATIONS
    this.data.stages = (this.data.stages||[]).filter(s => s.id !== 's_meeting');
    (this.data.deals||[]).forEach(d => { if (d.stage === 's_meeting') d.stage = 's_received'; });
    // Corrige les doublons de numéros de devis (bug historique : reset de compteur à la suppression)
    const seenNumeros = new Map(); // numero -> premier quote id
    (this.data.quotes||[]).forEach(q => {
      if (!q.numero) return;
      if (seenNumeros.has(q.numero) && seenNumeros.get(q.numero) !== q.id) {
        // Renumérote ce doublon avec un numéro frais
        const year = new Date(q.createdAt || Date.now()).getFullYear();
        const pattern = new RegExp(`V24-${year}-(\\d+)$`);
        let maxN = 0;
        (this.data.quotes||[]).forEach(qq => {
          const m = (qq.numero||'').match(pattern);
          if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
        });
        q.numero = `V24-${year}-${(maxN + 1).toString().padStart(3,'0')}`;
      }
      seenNumeros.set(q.numero, q.id);
    });
    // persist seed on first load so external scripts/tools can see the data
    if (!localStorage.getItem(KEY)) localStorage.setItem(KEY, JSON.stringify(this.data));
    return this.data;
  },
  save(){
    try {
      const serialized = JSON.stringify(this.data);
      localStorage.setItem(KEY, serialized);
      // Snapshot de secours toutes les 30s
      const now = Date.now();
      if (!this._lastBackup || now - this._lastBackup > 30000) {
        try { localStorage.setItem(KEY + '_backup', serialized); this._lastBackup = now; } catch(e){}
      }
    } catch (err) {
      console.error('[Store.save] échec:', err);
      // Quota dépassé : notifie l'utilisateur, données restent en mémoire
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        toast('⚠️ Espace de stockage saturé — exporte tes données');
      } else {
        toast('⚠️ Sauvegarde échouée — vérifie la console');
      }
    }
  },
  restoreBackup(){
    try {
      const raw = localStorage.getItem(KEY + '_backup');
      if (!raw) return false;
      this.data = JSON.parse(raw);
      this.save();
      return true;
    } catch { return false; }
  },
  reset(){ this.data = structuredClone(SEED); this.save(); },

  contact(id){ return this.data.contacts.find(c => c.id === id); },
  demande(id){ return (this.data.demandes||[]).find(d => d.id === id); },
  demandesCount(){ return (this.data.demandes||[]).filter(d => d.statut === 'nouvelle').length; },

  /* Cherche un contact par email → téléphone → prénom+nom+société. */
  findExistingContact({ email, tel, prenom, nom, societe }){
    const norm = s => (s||'').toString().trim().toLowerCase().replace(/\s+/g,'');
    const normEmail = norm(email);
    const normTel = (tel||'').replace(/[^\d+]/g,'');
    if (normEmail) {
      const byEmail = this.data.contacts.find(c => norm(c.email) === normEmail);
      if (byEmail) return byEmail;
    }
    if (normTel && normTel.length >= 8) {
      const byTel = this.data.contacts.find(c => (c.tel||'').replace(/[^\d+]/g,'') === normTel);
      if (byTel) return byTel;
    }
    if (prenom && nom) {
      const key = norm(prenom) + '|' + norm(nom) + '|' + norm(societe||'');
      const byName = this.data.contacts.find(c => (norm(c.prenom)+'|'+norm(c.nom)+'|'+norm(c.entreprise||'')) === key);
      if (byName) return byName;
    }
    return null;
  },

  /* Point d'entrée public : n'importe quel webhook / formulaire appelle ceci. */
  receiveDemande(payload){
    // Idempotence : si un ID externe est fourni et déjà présent, ne pas dupliquer
    if (payload.externalId) {
      const existing = (this.data.demandes||[]).find(d => d.externalId === payload.externalId);
      if (existing) return { demande: existing, prospect: this.contact(existing.prospectId), duplicate: true };
    }

    // Auto dédup prospect
    const existingContact = this.findExistingContact(payload);
    let prospect = existingContact;
    if (!prospect) {
      prospect = {
        id: uid(), type:'prospect', temperature:'neutral',
        prenom: payload.prenom||'', nom: payload.nom||'',
        entreprise: payload.societe||'',
        email: payload.email||'', tel: payload.tel||'',
        adresse: [payload.adresse, payload.codePostal, payload.ville].filter(Boolean).join(' '),
        source: payload.source || 'Formulaire site',
        owner:'u_anthony', notes:'',
        createdAt: Date.now()
      };
      this.data.contacts.unshift(prospect);
    }

    const dm = {
      id: uid(),
      externalId: payload.externalId || null,
      source: payload.source || 'inconnue',
      receivedAt: Date.now(),
      statut: 'nouvelle',
      prenom: payload.prenom||'', nom: payload.nom||'', societe: payload.societe||'',
      email: payload.email||'', tel: payload.tel||'',
      typeClient: payload.typeClient||'',
      typeEvenement: payload.typeEvenement||'',
      dateEvenement: payload.dateEvenement||'',
      horaires: payload.horaires||'',
      lieuEvenement: payload.lieuEvenement||'',
      nbPersonnes: payload.nbPersonnes||null,
      budget: payload.budget||null,
      services: payload.services||[],
      options: payload.options||[],
      message: payload.message||'',
      raw: payload.raw || payload,          // conservation intégrale du payload
      prospectId: prospect.id,
      quoteId: null,
      lastModified: Date.now()
    };
    if (!this.data.demandes) this.data.demandes = [];
    this.data.demandes.unshift(dm);

    // 🎯 Crée automatiquement une transaction dans le pipeline (étape "Demande reçue")
    const dealTitle = payload.typeEvenement
      ? `${payload.typeEvenement} · ${prospect.prenom} ${prospect.nom}`.trim()
      : `Demande ${prospect.prenom} ${prospect.nom}`.trim();
    const deal = {
      id: uid(),
      title: dealTitle,
      contactId: prospect.id,
      stage: 's_received',
      probabilite: 30,
      eventType: payload.typeEvenement || '',
      eventDate: payload.dateEvenement || '',
      horaires: payload.horaires || '',
      lieu: payload.lieuEvenement || '',
      invites: payload.nbPersonnes || null,
      estimatedAmount: payload.budget || null,
      notes: payload.message || '',
      demandeId: dm.id,
      source: dm.source,
      createdAt: Date.now()
    };
    this.data.deals.unshift(deal);
    dm.dealId = deal.id;

    this.addActivity({
      contactId: prospect.id,
      dealId: deal.id,
      type: 'note',
      contenu: `Nouvelle demande reçue depuis ${dm.source}`
    });

    this.save();
    return { demande: dm, prospect, deal, duplicate: false };
  },
  deal(id){ return this.data.deals.find(d => d.id === id); },
  presta(id){ return this.data.prestations.find(p => p.id === id); },
  stage(id){ return this.data.stages.find(s => s.id === id); },
  quote(id){ return this.data.quotes.find(q => q.id === id); },
  invoice(id){ return this.data.invoices.find(i => i.id === id); },

  paymentsOfInvoice(invoiceId){
    return (this.data.payments||[]).filter(p => p.invoiceId === invoiceId).sort((a,b) => b.date - a.date);
  },
  paymentsOfDeal(dealId){
    return (this.data.payments||[]).filter(p => p.dealId === dealId).sort((a,b) => b.date - a.date);
  },
  invoiceEncaisse(invoiceId){
    const fromPayments = this.paymentsOfInvoice(invoiceId).reduce((s,p) => s + (p.montant||0), 0);
    const inv = this.invoice(invoiceId);
    // Fallback : si la facture est marquée "payée" sans aucun paiement enregistré,
    // on considère le montant total comme encaissé (édition manuelle du statut)
    if (fromPayments === 0 && inv && inv.statut === 'payée') return inv.montant || 0;
    return fromPayments;
  },
  invoiceRemaining(invoice){
    return Math.max(0, (invoice.montant||0) - this.invoiceEncaisse(invoice.id));
  },

  addPayment({ invoiceId, dealId, contactId, montant, date, methode, note }){
    if (!this.data.payments) this.data.payments = [];
    const p = {
      id: uid(),
      invoiceId, dealId, contactId,
      montant: +montant || 0,
      date: date ? new Date(date).getTime() : Date.now(),
      methode: methode || 'virement',
      note: note || '',
      createdAt: Date.now()
    };
    this.data.payments.unshift(p);

    // Met à jour le statut de la facture selon l'encaissé
    const inv = this.invoice(invoiceId);
    if (inv) {
      const encaisse = this.invoiceEncaisse(invoiceId);
      if (encaisse >= inv.montant) {
        inv.statut = 'payée';
        inv.paidAt = p.date;
      } else if (encaisse > 0) {
        inv.statut = 'partiellement payée';
      }
    }

    // Activité
    this.addActivity({
      dealId, contactId,
      type: 'signed',
      contenu: `Paiement reçu : ${fmtMoney(p.montant)} ${methode?`(${methode})`:''}${inv?` sur facture ${inv.numero}`:''}`
    });

    this.save();

    // 🎯 Facture finale (récapitulative) : si toutes les factures du devis lié sont payées
    if (inv && inv.quoteId) {
      const quote = this.quote(inv.quoteId);
      if (quote) {
        const relatedInvoices = this.data.invoices.filter(x => x.quoteId === quote.id && x.type !== 'finale');
        const allPaid = relatedInvoices.length > 0 && relatedInvoices.every(x => x.statut === 'payée');
        if (allPaid) ensureFinaleInvoiceForQuote(quote);
      }
    }
    return p;
  },
  removePayment(paymentId){
    const p = (this.data.payments||[]).find(x => x.id === paymentId);
    if (!p) return;
    this.data.payments = this.data.payments.filter(x => x.id !== paymentId);
    // Recalcule le statut de la facture
    const inv = this.invoice(p.invoiceId);
    if (inv) {
      const encaisse = this.invoiceEncaisse(inv.id);
      if (encaisse === 0) inv.statut = 'en attente';
      else if (encaisse < inv.montant) inv.statut = 'partiellement payée';
      else inv.statut = 'payée';
    }
    this.save();
  },
  dealsOf(contactId){ return this.data.deals.filter(d => d.contactId === contactId); },
  quotesOf({contactId, dealId}){
    return this.data.quotes.filter(q => (dealId ? q.dealId === dealId : true) && (contactId ? q.contactId === contactId : true));
  },
  activitiesOf({contactId, dealId}){
    return this.data.activities.filter(a =>
      (contactId ? a.contactId === contactId : true) &&
      (dealId ? a.dealId === dealId : true)
    ).sort((a,b) => b.createdAt - a.createdAt);
  },
  tasksOf({contactId, dealId}){
    return this.data.tasks.filter(t =>
      (contactId ? t.contactId === contactId : true) &&
      (dealId ? t.dealId === dealId : true)
    );
  },
  addActivity(a){ this.data.activities.unshift({ id: uid(), createdAt: Date.now(), ...a }); this.save(); },

  // Devis totals
  quoteSubtotal(q){
    return (q.items||[]).reduce((s,it) => s + lineTotal(it), 0);
  },
  quoteTotals(q){
    const subtotal = this.quoteSubtotal(q);
    const remisePct = q.remisePercent!=null ? q.remisePercent : (q.remise ? 0 : 0);
    const remise = Math.round(subtotal * (remisePct || 0) / 100);
    const ht = Math.max(0, subtotal - remise);
    const tvaRate = (q.tvaRate!=null?q.tvaRate:this.data.meta.tvaDefault) / 100;
    const tva = Math.round(ht * tvaRate);
    const ttc = ht + tva;
    const acompteRate = (q.acompteRate!=null?q.acompteRate:this.data.meta.acompteDefault) / 100;
    const acompte = Math.round(ttc * acompteRate);
    const solde = ttc - acompte;
    return { subtotal, remise, remisePercent: remisePct||0, ht, tva, ttc, acompte, solde, tvaRate:tvaRate*100, acompteRate:acompteRate*100 };
  },
};

function lineTotal(it){
  const base = (it.prix||0) * (it.qte||1);
  const opts = (it.options||[]).filter(o => o.checked).reduce((s,o) => s + (o.prix||0), 0);
  return base + opts;
}

Store.load();

/* =========================================================
   ROUTER
========================================================= */
const Router = {
  current: 'dashboard',
  params: {},
  go(view, params={}){
    this.current = view;
    this.params = params;
    $$('.nav__item').forEach(n => {
      const active = n.dataset.view === view || (view === 'quote-editor' && n.dataset.view === 'quotes');
      n.classList.toggle('is-active', active);
    });
    render();
    window.scrollTo(0,0);
  }
};

/* =========================================================
   RENDERERS COMMON
========================================================= */
const tempLabel = { hot:'Chaud', warm:'Tiède', cold:'Froid', neutral:'À qualifier' };
const tempBadge = t => `<span class="badge badge--${t||'neutral'}">${tempLabel[t||'neutral']}</span>`;
const typeBadge = t => {
  const map = { prospect:'Prospect', client:'Client', pro:'Pro', partner:'Partenaire' };
  return `<span class="badge badge--${t}">${map[t]||t}</span>`;
};
const quoteStatusBadge = s => {
  const map = { brouillon:'neutral', 'envoyé':'prospect', 'consulté':'partner', 'accepté':'client', 'refusé':'hot', 'expiré':'warm' };
  return `<span class="badge badge--${map[s]||'neutral'}">${s}</span>`;
};

/* =========================================================
   MAIN RENDER
========================================================= */
function render(){
  const view = $('#view');
  const map = {
    dashboard: renderDashboard,
    prospects: renderProspects,
    clients: renderClients,
    demandes: renderDemandes,
    contacts: renderContacts,
    pipeline: renderPipeline,
    events: renderEvents,
    revenue: renderRevenue,
    quotes: renderQuotes,
    'quote-editor': renderQuoteEditor,
    tasks: renderTasks,
    prestations: renderPrestations,
  };
  view.innerHTML = (map[Router.current] || renderDashboard)();
  view.className = 'view view--' + Router.current;
  attachViewHandlers();
}

/* =========================================================
   PROSPECTS — vue commerciale centrale
========================================================= */
const PROSPECT_STATUTS = [
  { id:'nouveau',     lbl:'Nouveau',       color:'hot' },
  { id:'a_contacter', lbl:'À contacter',   color:'hot' },
  { id:'devis_p',     lbl:'Devis à faire', color:'warm' },
  { id:'devis_e',     lbl:'Devis envoyé',  color:'cold' },
  { id:'attente',     lbl:'En attente',    color:'cold' },
  { id:'relance',     lbl:'À relancer',    color:'warm' },
  { id:'gagne',       lbl:'Gagné',         color:'client' },
  { id:'perdu',       lbl:'Perdu',         color:'warm' },
];
const PROSPECT_STATUT_LABEL = Object.fromEntries(PROSPECT_STATUTS.map(s => [s.id, s.lbl]));

/** Statut synthétique d'un prospect basé sur ses demandes/devis */
function prospectStatut(c){
  const demandes = (Store.data.demandes||[]).filter(d => d.prospectId === c.id);
  const quotes = Store.quotesOf({ contactId: c.id });
  const hasNewDemande = demandes.some(d => d.statut === 'nouvelle');
  const hasSentQuote = quotes.some(q => q.statut === 'envoyé' || q.statut === 'consulté');
  const hasAcceptedQuote = quotes.some(q => q.statut === 'accepté');
  const hasRefusedQuote = quotes.some(q => q.statut === 'refusé');
  const hasDraftQuote = quotes.some(q => q.statut === 'brouillon');
  const daysSinceQuote = hasSentQuote ? Math.floor((Date.now() - Math.max(...quotes.filter(q => q.sentAt).map(q => q.sentAt))) / 86400000) : null;

  if (hasAcceptedQuote) return 'gagne';
  if (hasSentQuote && daysSinceQuote != null && daysSinceQuote >= 5) return 'relance';
  if (hasSentQuote) return 'devis_e';
  if (hasDraftQuote) return 'devis_p';
  if (hasNewDemande) return 'nouveau';
  if (demandes.length) return 'a_contacter';
  if (hasRefusedQuote && !hasSentQuote) return 'perdu';
  return 'a_contacter';
}

/** Meilleure demande représentative d'un prospect (la plus récente) */
function prospectDemande(c){
  const list = (Store.data.demandes||[]).filter(d => d.prospectId === c.id).sort((a,b) => b.receivedAt - a.receivedAt);
  return list[0];
}

/** Montant potentiel (devis envoyé le + récent, sinon budget demande) */
function prospectMontant(c){
  const quotes = Store.quotesOf({ contactId: c.id }).sort((a,b) => b.createdAt - a.createdAt);
  if (quotes.length) return Store.quoteTotals(quotes[0]).ttc;
  const dm = prospectDemande(c);
  return dm?.budget || 0;
}

const prospectsFilter = { q:'', statut:'all' };

function renderProspects(){
  const d = Store.data;
  let list = d.contacts.filter(c => c.type === 'prospect' || c.type === 'pro' || c.type === 'partner');
  if (prospectsFilter.q) {
    const q = prospectsFilter.q.toLowerCase();
    list = list.filter(c => `${c.prenom} ${c.nom} ${c.email} ${c.entreprise}`.toLowerCase().includes(q));
  }
  list = list.map(c => ({ c, statut: prospectStatut(c), dm: prospectDemande(c), montant: prospectMontant(c) }));
  if (prospectsFilter.statut !== 'all') list = list.filter(x => x.statut === prospectsFilter.statut);
  list.sort((a,b) => (b.dm?.receivedAt || b.c.createdAt) - (a.dm?.receivedAt || a.c.createdAt));

  const counts = {};
  PROSPECT_STATUTS.forEach(s => counts[s.id] = 0);
  d.contacts.filter(c => c.type === 'prospect').forEach(c => { counts[prospectStatut(c)]++; });
  const totalPotentiel = list.reduce((s,x) => s + (x.montant||0), 0);

  const intakeConfigured = !!localStorage.getItem('v24_intake_url');
  return `
    <div class="view-header">
      <div>
        <h1 class="view-title" data-ico="👤">Prospects</h1>
        <div class="view-subtitle">Centre commercial · ${list.length} contact${list.length>1?'s':''} · potentiel ${fmtMoney(totalPotentiel)}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn--secondary" id="btn-poll-now" title="Vérifier les nouvelles demandes du site">🔄 Récupérer</button>
        <button class="btn btn--primary" id="btn-new-demande">+ Nouvelle demande</button>
      </div>
    </div>

    ${!intakeConfigured ? `
      <div class="intake-banner">
        <div style="flex:1">
          <div style="font-weight:600;color:var(--bordeaux);font-size:14px">⚠️ Synchronisation vision24.fr / vision24.fun désactivée</div>
          <div class="mini" style="margin-top:4px">Les demandes depuis tes sites n'arrivent pas automatiquement. Configure l'API pour connecter tes sites au CRM.</div>
        </div>
        <button class="btn btn--primary btn--sm" data-configure-intake>Configurer maintenant</button>
      </div>
    ` : `
      <div class="intake-banner intake-banner--ok">
        <div style="flex:1">
          <div style="font-weight:600;color:#1e5a3d;font-size:13px">✅ Sync active — <span class="mini" style="color:#5a7a63">${esc(localStorage.getItem('v24_intake_url'))}</span></div>
          <div class="mini" style="margin-top:2px" id="intake-last-check">Poll auto toutes les 30 s · dernière vérification à l'ouverture</div>
        </div>
        <button class="btn btn--secondary btn--sm" data-configure-intake>Modifier</button>
      </div>
    `}

    <!-- Filtres par statut -->
    <div class="pros-filters">
      <button class="pros-chip ${prospectsFilter.statut==='all'?'is-active':''}" data-filter-statut="all">Tous <span class="pros-chip__n">${list.length}</span></button>
      ${PROSPECT_STATUTS.map(s => `<button class="pros-chip pros-chip--${s.color} ${prospectsFilter.statut===s.id?'is-active':''}" data-filter-statut="${s.id}">${s.lbl} <span class="pros-chip__n">${counts[s.id]||0}</span></button>`).join('')}
    </div>

    <div class="pros-list">
      ${list.length ? list.map(({ c, statut, dm, montant }) => {
        const s = PROSPECT_STATUTS.find(x => x.id === statut) || PROSPECT_STATUTS[0];
        const eventDate = dm?.dateEvenement;
        const daysToEvent = eventDate ? daysBetween(Date.now(), new Date(eventDate)) : null;
        return `
        <div class="pros-card pros-card--${s.color}" data-contact="${c.id}">
          <div class="pros-card__left">
            <div class="avatar">${initials(c.prenom, c.nom)}</div>
            <span class="pros-card__statut pros-card__statut--${s.color}">${s.lbl}</span>
          </div>
          <div class="pros-card__body">
            <div class="pros-card__head">
              <div class="pros-card__name">${esc(c.prenom)} ${esc(c.nom)}${c.entreprise?` <span class="mini">· ${esc(c.entreprise)}</span>`:''}</div>
              ${montant ? `<div class="pros-card__amount">${fmtMoney(montant)}</div>` : ''}
            </div>
            <div class="pros-card__event">
              ${dm?.typeEvenement ? `<span class="pros-info"><span>🎉</span>${esc(dm.typeEvenement)}</span>` : ''}
              ${eventDate ? `<span class="pros-info"><span>📅</span>${fmtDate(eventDate)}${daysToEvent!=null && daysToEvent>=0?` <em>(J-${daysToEvent})</em>`:''}</span>` : ''}
              ${dm?.lieuEvenement ? `<span class="pros-info"><span>📍</span>${esc(dm.lieuEvenement)}</span>` : ''}
              ${dm?.nbPersonnes ? `<span class="pros-info"><span>👥</span>${dm.nbPersonnes} pers.</span>` : ''}
            </div>
            <div class="pros-card__coords">
              ${c.tel ? `<a href="tel:${esc(c.tel)}" onclick="event.stopPropagation()">📞 ${esc(c.tel)}</a>` : ''}
              ${c.email ? `<a href="mailto:${esc(c.email)}" onclick="event.stopPropagation()">✉️ ${esc(c.email)}</a>` : ''}
              ${dm?.source ? `<span class="mini">Source : ${esc(dm.source)}</span>` : c.source ? `<span class="mini">Source : ${esc(c.source)}</span>` : ''}
            </div>
          </div>
          <div class="pros-card__right">
            <button class="btn btn--sm btn--primary" data-quick-quote="${c.id}">+ Devis</button>
            <button class="btn btn--sm btn--secondary" data-open-contact-btn="${c.id}">Ouvrir →</button>
          </div>
        </div>`;
      }).join('') : `<div class="dm-empty">
        <div class="dm-empty__icon">👤</div>
        <div class="dm-empty__title">Aucun prospect</div>
        <div class="dm-empty__sub">Clique sur "+ Nouvelle demande" pour créer ton premier prospect.</div>
      </div>`}
    </div>
  `;
}

/* =========================================================
   CLIENTS — dossiers complets
========================================================= */
const clientsFilter = { q:'' };

function renderClients(){
  const d = Store.data;
  let list = d.contacts.filter(c => c.type === 'client');
  if (clientsFilter.q) {
    const q = clientsFilter.q.toLowerCase();
    list = list.filter(c => `${c.prenom} ${c.nom} ${c.email} ${c.entreprise}`.toLowerCase().includes(q));
  }

  const enriched = list.map(c => {
    const deals = Store.dealsOf(c.id);
    const invoices = d.invoices.filter(i => i.contactId === c.id || deals.some(dd => dd.id === i.dealId));
    const acceptedQuotes = Store.quotesOf({ contactId: c.id }).filter(q => q.statut === 'accepté');
    const sumInvoices = invoices.reduce((s,i) => s + (i.montant||0), 0);
    const sumAccepted = acceptedQuotes.reduce((s,q) => s + Store.quoteTotals(q).ttc, 0);
    const facture = Math.max(sumInvoices, sumAccepted);
    const encaisse = invoices.reduce((s,i) => s + Store.invoiceEncaisse(i.id), 0);
    const reste = Math.max(0, facture - encaisse);
    const nextEvent = deals.filter(dd => dd.eventDate && new Date(dd.eventDate).getTime() >= Date.now()).sort((a,b) => new Date(a.eventDate)-new Date(b.eventDate))[0];
    const lastEvent = deals.filter(dd => dd.eventDate).sort((a,b) => new Date(b.eventDate)-new Date(a.eventDate))[0];
    return { c, facture, encaisse, reste, nextEvent, lastEvent, invCount: invoices.length };
  });
  enriched.sort((a,b) => (b.c.convertedAt || b.c.createdAt) - (a.c.convertedAt || a.c.createdAt));

  const totalFacture = enriched.reduce((s,x) => s + x.facture, 0);
  const totalReste = enriched.reduce((s,x) => s + x.reste, 0);

  return `
    <div class="view-header">
      <div>
        <h1 class="view-title" data-ico="🤝">Clients</h1>
        <div class="view-subtitle">${enriched.length} dossier${enriched.length>1?'s':''} · ${fmtMoney(totalFacture)} facturé · ${fmtMoney(totalReste)} reste dû</div>
      </div>
      <button class="btn btn--primary" data-action="new-contact">+ Nouveau client</button>
    </div>

    <div class="cli-list">
      ${enriched.length ? enriched.map(({ c, facture, encaisse, reste, nextEvent, invCount }) => `
        <div class="cli-card" data-contact="${c.id}">
          <div class="cli-card__left">
            <div class="avatar avatar--client">${initials(c.prenom, c.nom)}</div>
          </div>
          <div class="cli-card__body">
            <div class="cli-card__head">
              <div class="cli-card__name">${esc(c.prenom)} ${esc(c.nom)}${c.entreprise?` <span class="mini">· ${esc(c.entreprise)}</span>`:''}</div>
              <span class="badge badge--client">Client</span>
            </div>
            ${nextEvent ? `
              <div class="cli-card__event">
                🎉 ${esc(nextEvent.title)} · <strong>${fmtDate(nextEvent.eventDate)}</strong>${nextEvent.lieu?` · ${esc(nextEvent.lieu)}`:''}
              </div>
            ` : `<div class="cli-card__event mini">Aucun événement à venir</div>`}
            <div class="cli-card__coords">
              ${c.tel ? `<a href="tel:${esc(c.tel)}" onclick="event.stopPropagation()">📞 ${esc(c.tel)}</a>` : ''}
              ${c.email ? `<a href="mailto:${esc(c.email)}" onclick="event.stopPropagation()">✉️ ${esc(c.email)}</a>` : ''}
            </div>
          </div>
          <div class="cli-card__money">
            <div class="cli-money-cell">
              <div class="cli-money-lbl">Facturé</div>
              <div class="cli-money-val">${fmtMoney(facture)}</div>
              <div class="mini">${invCount} facture${invCount>1?'s':''}</div>
            </div>
            <div class="cli-money-cell ${reste>0?'cli-money-cell--due':'cli-money-cell--ok'}">
              <div class="cli-money-lbl">Reste dû</div>
              <div class="cli-money-val">${fmtMoney(reste)}</div>
              ${reste>0?`<button class="btn btn--sm btn--primary" data-open-contact-btn="${c.id}">Encaisser</button>`:'<div class="mini">✓ Soldé</div>'}
            </div>
          </div>
        </div>
      `).join('') : `<div class="dm-empty">
        <div class="dm-empty__icon">🤝</div>
        <div class="dm-empty__title">Aucun client</div>
        <div class="dm-empty__sub">Les clients apparaissent automatiquement quand un prospect signe un devis.</div>
      </div>`}
    </div>
  `;
}

/* ---------- DASHBOARD ---------- */
function renderDashboard(){
  const d = Store.data;
  const now = Date.now();

  const newProspects = d.contacts.filter(c => c.type==='prospect' && c.createdAt > now - 30*86400000).length;
  const hot = d.contacts.filter(c => c.temperature === 'hot').length;
  const cold = d.contacts.filter(c => c.temperature === 'cold').length;

  const quotesSent = d.quotes.filter(q => q.statut === 'envoyé' || q.statut === 'consulté').length;
  const quotesAccepted = d.quotes.filter(q => q.statut === 'accepté').length;

  const caSigne = d.deals.filter(x => x.stage==='s_won' || x.stage==='s_billing').reduce((s,x) => s + dealValue(x), 0);
  const caAttente = d.deals.filter(x => ['s_quote_s','s_followup'].includes(x.stage)).reduce((s,x) => s + dealValue(x) * (x.probabilite||50)/100, 0);
  const caVenir = d.deals.filter(x => x.eventDate && new Date(x.eventDate).getTime() > now && x.stage !== 's_lost').reduce((s,x) => s + dealValue(x), 0);

  // ---- CA par période (basé sur eventDate des deals gagnés/facturés)
  const nowD = new Date();
  const curYear = nowD.getFullYear();
  const curMonth = nowD.getMonth();
  const wonDeals = d.deals.filter(x => (x.stage==='s_won' || x.stage==='s_billing') && x.eventDate);
  const caFor = (year, month) => wonDeals
    .filter(x => { const dt = new Date(x.eventDate); return dt.getFullYear()===year && (month==null || dt.getMonth()===month); })
    .reduce((s,x) => s + dealValue(x), 0);
  const caMonth = caFor(curYear, curMonth);
  const caLastMonth = caFor(curMonth===0?curYear-1:curYear, curMonth===0?11:curMonth-1);
  const caYTD = caFor(curYear, null);
  const caY1 = caFor(curYear-1, null);
  const caY2 = caFor(curYear-2, null);
  const evolMonth = caLastMonth ? Math.round(((caMonth-caLastMonth)/caLastMonth)*100) : null;
  const evolYear  = caY1 ? Math.round(((caYTD-caY1)/caY1)*100) : null;
  const monthName = nowD.toLocaleDateString('fr-FR',{month:'long'});

  const tasksToday = d.tasks.filter(t => !t.done && (t.due <= now + 86400000)).sort((a,b) => a.due - b.due);
  const upcomingEvents = d.deals.filter(x => x.eventDate && new Date(x.eventDate).getTime() >= now).sort((a,b) => new Date(a.eventDate) - new Date(b.eventDate)).slice(0,5);
  const recentContacts = [...d.contacts].sort((a,b) => b.createdAt - a.createdAt).slice(0,5);

  return `
    <div class="view-header">
      <div>
        <h1 class="view-title" data-ico="📊">Tableau <em>de bord</em></h1>
        <div class="view-subtitle">${new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</div>
      </div>
    </div>

    <!-- 🎨 KPI colorés avec icônes -->
    <div class="dash-kpis">
      <div class="dash-kpi dash-kpi--pros">
        <div class="dash-kpi__ico">👥</div>
        <div class="dash-kpi__body">
          <div class="dash-kpi__lbl">Nouveaux prospects · 30j</div>
          <div class="dash-kpi__num">${newProspects}</div>
          <div class="dash-kpi__hint"><span class="dash-tag dash-tag--hot">🔥 ${hot}</span> <span class="dash-tag dash-tag--cold">❄️ ${cold}</span></div>
        </div>
      </div>

      <div class="dash-kpi dash-kpi--devis">
        <div class="dash-kpi__ico">📄</div>
        <div class="dash-kpi__body">
          <div class="dash-kpi__lbl">Devis en attente</div>
          <div class="dash-kpi__num">${quotesSent}</div>
          <div class="dash-kpi__hint">${quotesAccepted} acceptés au total</div>
        </div>
      </div>

      <div class="dash-kpi dash-kpi--ca">
        <div class="dash-kpi__ico">💰</div>
        <div class="dash-kpi__body">
          <div class="dash-kpi__lbl">Chiffre d'affaires signé</div>
          <div class="dash-kpi__num">${fmtMoney(caSigne)}</div>
          <div class="dash-kpi__hint">✓ ${d.deals.filter(x => x.stage==='s_won').length} transactions gagnées</div>
        </div>
      </div>

      <div class="dash-kpi dash-kpi--prev">
        <div class="dash-kpi__ico">📊</div>
        <div class="dash-kpi__body">
          <div class="dash-kpi__lbl">CA prévisionnel</div>
          <div class="dash-kpi__num">${fmtMoney(caAttente)}</div>
          <div class="dash-kpi__hint">pondéré par probabilité</div>
        </div>
      </div>
    </div>

    <div class="grid grid-2" style="margin-top:20px">
      <div class="card dash-card dash-card--warn">
        <h3 class="section-title"><span class="section-ico">🔔</span> Relances &amp; <em>tâches</em></h3>
        ${tasksToday.length ? `<div style="display:flex;flex-direction:column;gap:6px">${tasksToday.slice(0,8).map(t => {
          const c = Store.contact(t.contactId);
          const late = t.due < now;
          return `<div class="stat-line">
            <div>
              <div style="font-weight:500">${esc(t.titre)}</div>
              <div class="mini">${c ? esc(c.prenom+' '+c.nom) : ''} · <span style="color:${late?'var(--danger)':'var(--muted)'}">${late?'en retard · ':''}${fmtDate(t.due)}</span></div>
            </div>
            <button class="btn btn--sm btn--secondary" data-task-toggle="${t.id}">Fait</button>
          </div>`;
        }).join('')}</div>` : `<div class="mini">Aucune tâche urgente. Bonne journée ✦</div>`}
      </div>

      <div class="card dash-card dash-card--ok">
        <h3 class="section-title"><span class="section-ico">📅</span> Prochains <em>événements</em></h3>
        ${upcomingEvents.length ? upcomingEvents.map(d2 => {
          const c = Store.contact(d2.contactId);
          const days = daysBetween(now, new Date(d2.eventDate));
          return `<div class="stat-line" data-deal="${d2.id}" style="cursor:pointer">
            <div>
              <div style="font-weight:500">${esc(d2.title)}</div>
              <div class="mini">${c ? esc(c.prenom+' '+c.nom) : ''} · ${esc(d2.lieu||'')} · ${d2.invites||'?'} invités</div>
            </div>
            <div style="text-align:right">
              <div class="money">${fmtDate(d2.eventDate)}</div>
              <div class="mini">dans ${days} j</div>
            </div>
          </div>`;
        }).join('') : `<div class="mini">Aucun événement à venir.</div>`}
      </div>
    </div>

    <div class="grid grid-2" style="margin-top:20px">
      <div class="card dash-card dash-card--bord">
        <h3 class="section-title"><span class="section-ico">📊</span> Pipeline <em>commercial</em></h3>
        ${d.stages.filter(s => !['s_won','s_lost'].includes(s.id)).map(s => {
          const list = d.deals.filter(x => x.stage === s.id);
          const total = list.reduce((sum,x) => sum + dealValue(x), 0);
          return `<div class="stat-line"><span>${esc(s.nom)} <span class="mini">(${list.length})</span></span><strong>${fmtMoney(total)}</strong></div>`;
        }).join('')}
        <div class="divider"></div>
        <div class="stat-line"><span>CA événements à venir</span><strong>${fmtMoney(caVenir)}</strong></div>
      </div>

      <div class="card dash-card dash-card--cold">
        <h3 class="section-title"><span class="section-ico">👤</span> Derniers <em>contacts</em></h3>
        ${recentContacts.map(c => `
          <div class="stat-line" data-contact="${c.id}" style="cursor:pointer">
            <div class="contact-cell">
              <div class="avatar">${initials(c.prenom, c.nom)}</div>
              <div>
                <div class="contact-cell__name">${esc(c.prenom)} ${esc(c.nom)}</div>
                <div class="contact-cell__meta">${esc(c.source||'—')} · ${fmtDate(c.createdAt)}</div>
              </div>
            </div>
            ${tempBadge(c.temperature)}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function dealValue(deal){
  // deal value = sum of accepted quote for this deal, or estimated from last quote, or 0
  const qs = Store.data.quotes.filter(q => q.dealId === deal.id);
  const accepted = qs.find(q => q.statut === 'accepté');
  if (accepted) return Store.quoteTotals(accepted).ttc;
  const last = qs.sort((a,b) => b.createdAt - a.createdAt)[0];
  if (last) return Store.quoteTotals(last).ttc;
  return deal.estimatedAmount || 0;
}

/* ---------- DEMANDES (boîte de réception commerciale) ---------- */
let demandesFilter = { source:'all', statut:'all', q:'' };

function renderDemandes(){
  const d = Store.data;
  let list = (d.demandes||[]);
  if (demandesFilter.source !== 'all') list = list.filter(x => x.source === demandesFilter.source);
  if (demandesFilter.statut !== 'all') list = list.filter(x => x.statut === demandesFilter.statut);
  if (demandesFilter.q) {
    const q = demandesFilter.q.toLowerCase();
    list = list.filter(x => `${x.prenom} ${x.nom} ${x.email} ${x.typeEvenement} ${x.lieuEvenement}`.toLowerCase().includes(q));
  }
  list = [...list].sort((a,b) => b.receivedAt - a.receivedAt);
  const nbNew = (d.demandes||[]).filter(x => x.statut === 'nouvelle').length;
  const bySource = { 'vision24.fr':0, 'vision24.fun':0 };
  (d.demandes||[]).forEach(x => { if (x.source in bySource) bySource[x.source]++; });

  return `
    <div class="view-header">
      <div>
        <h1 class="view-title" data-ico="📬">Demandes <em>entrantes</em></h1>
        <div class="view-subtitle">Boîte de réception commerciale</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn--secondary" data-action="import-json">Importer JSON</button>
        <button class="btn btn--primary" data-action="new-demande">Ajouter</button>
      </div>
    </div>

    <!-- Stats inline discrètes -->
    <div class="dm-stats-inline">
      <div class="dm-stat-pill"><span class="dm-stat-pill__num">${(d.demandes||[]).length}</span> <span>Total</span></div>
      <div class="dm-stat-pill dm-stat-pill--accent"><span class="dm-stat-pill__num">${nbNew}</span> <span>Nouvelles</span></div>
    </div>

    <!-- Barre de filtres épurée -->
    <div class="dm-filters">
      <div class="dm-segment">
        ${['all','vision24.fr','vision24.fun'].map(s => `<button class="dm-segment__btn ${demandesFilter.source===s?'is-active':''}" data-dm-src="${s}">${s==='all'?'Toutes':s.replace('vision24.','')}</button>`).join('')}
      </div>
      <select class="dm-select" data-dm-statut-select>
        <option value="all" ${demandesFilter.statut==='all'?'selected':''}>Tous statuts</option>
        ${DEMANDE_STATUTS.map(s => `<option value="${s}" ${demandesFilter.statut===s?'selected':''}>${DEMANDE_STATUT_LABELS[s]}</option>`).join('')}
      </select>
    </div>

    <!-- Liste en cards épurées + finances + actions -->
    <div class="dm-list">
      ${list.length ? list.map(x => {
        const statutBadge = x.statut==='nouvelle' ? 'hot' : x.statut==='gagné' ? 'client' : x.statut==='perdu' ? 'warm' : 'prospect';

        return `
        <div class="dm-card ${x.statut==='nouvelle'?'is-new':''}" data-demande="${x.id}">
          <div class="dm-card__left">
            <div class="avatar">${initials(x.prenom, x.nom)}</div>
          </div>
          <div class="dm-card__body">
            <div class="dm-card__head">
              <div class="dm-card__name">${esc(x.prenom)} ${esc(x.nom)}</div>
              <div class="dm-card__meta">
                <span class="dm-source">${esc(x.source)}</span>
                <span class="badge badge--${statutBadge}">${DEMANDE_STATUT_LABELS[x.statut]||x.statut}</span>
              </div>
            </div>
            <div class="dm-card__event">
              ${x.typeEvenement ? `<strong>${esc(x.typeEvenement)}</strong>` : '<span class="mini">Sans événement précis</span>'}
              ${x.dateEvenement ? ` · ${fmtDate(x.dateEvenement)}` : ''}
              ${x.lieuEvenement ? ` · ${esc(x.lieuEvenement)}` : ''}
              ${x.nbPersonnes ? ` · ${x.nbPersonnes} pers.` : ''}
            </div>

            <div class="dm-card__actions">
              <select class="dm-card__statut-select" data-dm-quick-statut="${x.id}" title="Changer le statut">
                ${DEMANDE_STATUTS.map(s => `<option value="${s}" ${x.statut===s?'selected':''}>${DEMANDE_STATUT_LABELS[s]}</option>`).join('')}
              </select>
              <button class="btn btn--sm btn--secondary" data-dm-relancer="${x.id}" title="Envoyer une relance">📨 Relancer</button>
              ${x.tel ? `<a class="btn btn--sm btn--secondary" href="tel:${esc(x.tel)}">📞</a>` : ''}
              <button class="btn btn--sm btn--primary" data-demande-open="${x.id}" style="margin-left:auto">Ouvrir →</button>
            </div>

            <div class="dm-card__foot">
              <span class="mini">${esc(x.email||x.tel||'—')} · reçue ${fmtDateTime(x.receivedAt)}</span>
            </div>
          </div>
        </div>`;
      }).join('') : `<div class="dm-empty">
        <div class="dm-empty__icon">📮</div>
        <div class="dm-empty__title">Aucune demande pour l'instant</div>
        <div class="dm-empty__sub">Les demandes de vision24.fr et vision24.fun s'afficheront ici automatiquement.</div>
      </div>`}
    </div>

    <div class="card" style="margin-top:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
        <div>
          <h3 class="section-title" style="margin:0">Connexion sites → CRM</h3>
          <div class="mini" style="margin-top:2px">${localStorage.getItem('v24_intake_url') ? `✅ <span style="color:var(--success)">Sync active</span> · poll toutes les 30 s vers <code>${esc(localStorage.getItem('v24_intake_url'))}</code>` : '⚠️ <span style="color:var(--warning)">Sync auto non configurée</span> · les demandes n\'arrivent pas automatiquement'}</div>
        </div>
        <button class="btn btn--primary btn--sm" data-configure-intake>${localStorage.getItem('v24_intake_url')?'Modifier la connexion':'Configurer la sync automatique'}</button>
      </div>
      <div class="divider"></div>
      <div class="mini" style="line-height:1.7">
        Le CRM est prêt à recevoir automatiquement les demandes de <strong>vision24.fr</strong> et <strong>vision24.fun</strong> via ton API Hostinger (PHP natif, gratuit).
        Voir <code>crm/hostinger-api/README.md</code> pour le guide complet (10 min).<br>
        En attendant, tu peux utiliser <strong>Importer JSON</strong> (copier-coller depuis un email Formspree) ou <strong>+ Ajouter manuellement</strong> (saisie directe).
      </div>
    </div>
  `;
}

/* =========================================================
   FACTURES — encaissement + détail
========================================================= */
function openEncaisserModal(invoiceId){
  const inv = Store.invoice(invoiceId);
  if (!inv) return;
  const restant = Store.invoiceRemaining(inv);
  const c = Store.contact(inv.contactId);
  const today = new Date().toISOString().slice(0,10);

  openModal(`
    <h2 class="form-title">Encaisser un paiement</h2>
    <p class="form-sub">${esc(inv.numero)} · ${c?esc(c.prenom+' '+c.nom):''} · reste ${fmtMoney(restant)}</p>
    <form id="encaisser-form">
      <div class="field-row">
        <div class="field"><label>Montant reçu (€)</label><input name="montant" type="number" step="0.01" min="0" value="${restant}" required></div>
        <div class="field"><label>Date</label><input name="date" type="date" value="${today}" required></div>
      </div>
      <div class="field"><label>Méthode</label>
        <select name="methode">
          <option value="virement">💳 Virement</option>
          <option value="chèque">📝 Chèque</option>
          <option value="espèces">💵 Espèces</option>
          <option value="carte">💳 Carte bancaire</option>
          <option value="autre">Autre</option>
        </select>
      </div>
      <div class="field"><label>Note (facultatif)</label><input name="note" placeholder="Ex : chèque n°..., date virement..."></div>
      <div class="form-actions">
        <button type="button" class="btn btn--ghost" data-close>Annuler</button>
        <button type="submit" class="btn btn--primary">Enregistrer le paiement</button>
      </div>
    </form>
  `);
  $('#encaisser-form').onsubmit = e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const p = Store.addPayment({
      invoiceId: inv.id,
      dealId: inv.dealId,
      contactId: inv.contactId,
      montant: +f.montant,
      date: f.date,
      methode: f.methode,
      note: f.note
    });
    closeModal();
    toast(`Paiement de ${fmtMoney(p.montant)} enregistré`);
    render();
  };
}

function openInvoiceModal(invoiceId){
  const inv = Store.invoice(invoiceId);
  if (!inv) return;
  const c = Store.contact(inv.contactId);
  const encaisse = Store.invoiceEncaisse(inv.id);
  const restant = Store.invoiceRemaining(inv);
  const paiements = Store.paymentsOfInvoice(inv.id);
  const statutColor = inv.statut === 'payée' ? 'client' : inv.statut === 'partiellement payée' ? 'warm' : 'prospect';
  const statutOpts = ['en attente','partiellement payée','payée','annulée'];
  const linkedQuote = inv.quoteId ? Store.quote(inv.quoteId) : null;

  openModal(`
    <h2 class="form-title">Facture ${esc(inv.numero)}</h2>
    <p class="form-sub">${c?esc(c.prenom+' '+c.nom):''} · ${esc(inv.type)}${linkedQuote?` · liée au devis ${esc(linkedQuote.numero)}`:' · <em>non liée à un devis</em>'}</p>

    <!-- ==== ÉDITION DE LA FACTURE ==== -->
    <form id="invoice-edit-form" style="background:var(--beige-2);padding:14px;border-radius:12px;margin:12px 0 18px">
      <div class="field-row">
        <div class="field">
          <label>Montant (€)</label>
          <input type="number" step="0.01" min="0" id="inv-montant" value="${inv.montant||0}" ${encaisse>0?'':''} />
          ${encaisse>0?`<div class="mini" style="color:var(--warm)">⚠️ ${fmtMoney(encaisse)} déjà encaissé — le montant ne peut pas être inférieur.</div>`:''}
        </div>
        <div class="field">
          <label>Type</label>
          <select id="inv-type">
            ${['acompte','solde','totale','avoir'].map(t => `<option value="${t}" ${inv.type===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Statut</label>
          <select id="inv-statut">
            ${statutOpts.map(s => `<option value="${s}" ${inv.statut===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Date d'échéance</label>
          <input type="date" id="inv-due" value="${inv.dueDate?new Date(inv.dueDate).toISOString().slice(0,10):''}" />
        </div>
      </div>
      <div class="form-actions" style="margin-top:8px">
        <button type="submit" class="btn btn--primary btn--sm">Enregistrer</button>
      </div>
    </form>

    <div class="dm-stats-inline" style="margin:12px 0 18px">
      <div class="dm-stat-pill"><span class="dm-stat-pill__num">${fmtMoney(inv.montant)}</span> <span>Montant</span></div>
      <div class="dm-stat-pill"><span class="dm-stat-pill__num" style="color:var(--success)">${fmtMoney(encaisse)}</span> <span>Encaissé</span></div>
      ${restant > 0 ? `<div class="dm-stat-pill" style="border-color:var(--warm)"><span class="dm-stat-pill__num" style="color:var(--warm)">${fmtMoney(restant)}</span> <span>Reste dû</span></div>` : ''}
    </div>

    ${paiements.length ? `
      <h4 class="section-title" style="font-size:14px">Paiements reçus</h4>
      <div style="margin-bottom:16px">
        ${paiements.map(p => `
          <div class="stat-line">
            <div>
              <div style="font-weight:500">${fmtMoney(p.montant)} · ${esc(p.methode||'')}</div>
              <div class="mini">${fmtDate(p.date)}${p.note?` · ${esc(p.note)}`:''}</div>
            </div>
            <button class="btn btn--sm btn--danger" data-remove-payment="${p.id}">Supprimer</button>
          </div>
        `).join('')}
      </div>
    ` : '<div class="mini" style="margin-bottom:16px">Aucun paiement enregistré pour cette facture.</div>'}

    <div class="form-actions" style="justify-content:space-between">
      <button class="btn btn--danger" data-delete-invoice="${inv.id}">🗑 Supprimer la facture</button>
      <div style="display:flex;gap:8px">
        <button class="btn btn--ghost" data-close>Fermer</button>
        ${restant > 0 ? `<button class="btn btn--primary" data-encaisser-here="${inv.id}">+ Encaisser</button>` : ''}
      </div>
    </div>
  `);

  $('#invoice-edit-form').onsubmit = e => {
    e.preventDefault();
    const newMontant = +$('#inv-montant').value;
    if (newMontant < encaisse) {
      return toast(`⚠️ Montant impossible : ${fmtMoney(encaisse)} déjà encaissé`);
    }
    inv.montant = newMontant;
    inv.type = $('#inv-type').value;
    inv.statut = $('#inv-statut').value;
    const due = $('#inv-due').value;
    inv.dueDate = due ? new Date(due).getTime() : null;
    // Recalcule le statut automatiquement selon l'encaissé si l'utilisateur n'a pas forcé
    const enc = Store.invoiceEncaisse(inv.id);
    if (enc >= inv.montant && inv.statut !== 'annulée') { inv.statut = 'payée'; inv.paidAt = Date.now(); }
    else if (enc > 0 && inv.statut !== 'annulée') inv.statut = 'partiellement payée';
    Store.save();
    toast('✓ Facture mise à jour');
    closeModal();
    if (!$('#drawer').hidden && inv.contactId) openContact(inv.contactId); else render();
  };

  $$('[data-remove-payment]').forEach(b => b.onclick = () => {
    if (!confirm('Supprimer ce paiement ?')) return;
    Store.removePayment(b.dataset.removePayment);
    toast('Paiement supprimé');
    closeModal();
    openInvoiceModal(invoiceId);
  });
  $('[data-encaisser-here]')?.addEventListener('click', () => {
    closeModal();
    openEncaisserModal(inv.id);
  });
  $('[data-delete-invoice]')?.addEventListener('click', () => {
    if (encaisse > 0) return toast('⚠️ Facture déjà encaissée — impossible à supprimer');
    if (!confirm(`Supprimer définitivement la facture ${inv.numero} ?`)) return;
    Store.data.invoices = Store.data.invoices.filter(x => x.id !== inv.id);
    Store.addActivity({ contactId: inv.contactId, dealId: inv.dealId, type: 'note', contenu: `Facture ${inv.numero} supprimée` });
    Store.save();
    toast(`✓ Facture ${inv.numero} supprimée`);
    closeModal();
    if (!$('#drawer').hidden && inv.contactId) openContact(inv.contactId); else render();
  });
}

function openConfigureIntakeModal(){
  openModal(`
    <h2 class="form-title">Connecter les sites Vision 24</h2>
    <p class="form-sub">Renseigne l'URL de ton API Hostinger et le token partagé.</p>
    <div style="background:linear-gradient(135deg,#e8f5ee 0%,#d5ecdf 100%);padding:10px 14px;border-radius:10px;margin-bottom:12px">
      <strong style="color:#1e5a3d;font-size:13px">🎁 Bouton magique</strong>
      <div class="mini" style="margin:4px 0 8px">Je pré-remplis avec tes vraies valeurs (URL + SHARED_SECRET du CREDENTIALS.txt).</div>
      <button type="button" class="btn btn--sm btn--primary" id="auto-fill-intake">Auto-remplir avec mes credentials</button>
    </div>
    <form id="config-intake-form">
      <div class="field">
        <label>URL de l'API</label>
        <input name="url" placeholder="https://vision24.fr/api" value="${esc(localStorage.getItem('v24_intake_url')||'https://vision24.fr/api')}" required>
      </div>
      <div class="field">
        <label>Token partagé (SHARED_SECRET du fichier CREDENTIALS.txt)</label>
        <input name="token" type="password" placeholder="Colle ici la valeur SHARED_SECRET" value="${esc(localStorage.getItem('v24_intake_token')||'')}" required>
      </div>
      <div class="mini" style="background:var(--beige-3);padding:12px;border-radius:8px;line-height:1.7">
        📖 <strong>Étapes pour synchroniser tes sites :</strong><br>
        <strong>1.</strong> Upload <code>crm/hostinger-api/vision24-api.zip</code> dans <code>public_html/api/</code> sur Hostinger<br>
        <strong>2.</strong> Vérifie <code>https://vision24.fr/api/health.php</code> → doit retourner <code>ok</code><br>
        <strong>3.</strong> Colle le <code>SHARED_SECRET</code> (fichier <code>CREDENTIALS.txt</code>) ci-dessus<br>
        <strong>4.</strong> Sur vision24.fr : <code>&lt;form action="/api/submit.php"&gt;</code><br>
        <strong>5.</strong> Sur vision24.fun : <code>&lt;form action="https://vision24.fr/api/submit.php"&gt;</code><br>
        <br>
        Une fois enregistré, le CRM récupère les demandes toutes les 30 secondes. ✨
      </div>
      <div class="form-actions">
        ${localStorage.getItem('v24_intake_url')?`<button type="button" class="btn btn--danger" id="disconnect-intake">Déconnecter</button>`:''}
        <button type="button" class="btn btn--ghost" data-close>Annuler</button>
        <button type="submit" class="btn btn--primary">Enregistrer &amp; tester</button>
      </div>
    </form>
  `);
  $('#auto-fill-intake')?.addEventListener('click', () => {
    const form = $('#config-intake-form');
    form.querySelector('[name="url"]').value = 'https://vision24.fr/api';
    form.querySelector('[name="token"]').value = '44e88bb1e37c6f2af734631facb5ea95440ab9468dacf22a176117471a677de0';
    toast('✓ Champs pré-remplis — clique Enregistrer & tester');
  });
  $('#config-intake-form').onsubmit = async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    // Ping /health pour vérifier
    try {
      const r = await fetch(f.url.replace(/\/$/,'') + '/health');
      if (!r.ok) throw new Error('HTTP ' + r.status);
    } catch (err) {
      if (!confirm('Impossible de joindre l\'URL. Enregistrer quand même ?')) return;
    }
    CRM.configureIntake(f.url.trim(), f.token.trim());
    closeModal();
    render();
  };
  $('#disconnect-intake')?.addEventListener('click', () => {
    CRM.disconnectIntake();
    closeModal();
    render();
  });
}

/* ---------- CONTACTS ---------- */
let contactsFilter = { type:'all', temp:'all', q:'' };

function renderContacts(){
  const d = Store.data;
  let list = d.contacts;
  if (contactsFilter.type !== 'all') list = list.filter(c => c.type === contactsFilter.type);
  if (contactsFilter.temp !== 'all') list = list.filter(c => c.temperature === contactsFilter.temp);
  if (contactsFilter.q) {
    const q = contactsFilter.q.toLowerCase();
    list = list.filter(c => `${c.prenom} ${c.nom} ${c.email} ${c.entreprise}`.toLowerCase().includes(q));
  }
  list.sort((a,b) => b.createdAt - a.createdAt);

  const nbProspects = d.contacts.filter(c => c.type === 'prospect').length;
  const nbClients   = d.contacts.filter(c => c.type === 'client').length;
  const nbHot       = d.contacts.filter(c => c.temperature === 'hot').length;

  return `
    <div class="view-header">
      <div>
        <h1 class="view-title" data-ico="👥">Contacts <em>&amp; clients</em></h1>
        <div class="view-subtitle">Base commerciale complète</div>
      </div>
      <button class="btn btn--primary" data-action="new-contact">Nouveau contact</button>
    </div>

    <!-- Stats inline -->
    <div class="dm-stats-inline">
      <div class="dm-stat-pill"><span class="dm-stat-pill__num">${d.contacts.length}</span> <span>Total</span></div>
      <div class="dm-stat-pill"><span class="dm-stat-pill__num">${nbProspects}</span> <span>Prospects</span></div>
      <div class="dm-stat-pill"><span class="dm-stat-pill__num">${nbClients}</span> <span>Clients</span></div>
      <div class="dm-stat-pill dm-stat-pill--accent"><span class="dm-stat-pill__num">${nbHot}</span> <span>Chauds</span></div>
    </div>

    <!-- Filtres épurés -->
    <div class="dm-filters">
      <div class="dm-segment">
        ${[['all','Tous'],['prospect','Prospects'],['client','Clients'],['pro','Pros'],['partner','Partenaires']].map(([v,lbl]) => `<button class="dm-segment__btn ${contactsFilter.type===v?'is-active':''}" data-filter-type="${v}">${lbl}</button>`).join('')}
      </div>
      <select class="dm-select" data-filter-temp-select>
        <option value="all" ${contactsFilter.temp==='all'?'selected':''}>Toutes températures</option>
        ${['hot','warm','cold','neutral'].map(t => `<option value="${t}" ${contactsFilter.temp===t?'selected':''}>${tempLabel[t]}</option>`).join('')}
      </select>
    </div>

    <!-- Cards contacts -->
    <div class="dm-list">
      ${list.length ? list.map(c => {
        const temp = c.temperature || 'neutral';
        return `
        <div class="dm-card contact-card contact-card--${c.type} contact-card--temp-${temp}" data-contact="${c.id}" data-type-label="${c.type==='pro'?'Pro':c.type==='partner'?'Partenaire':c.type==='client'?'Client':'Prospect'}">
          <div class="dm-card__left">
            <div class="avatar">${initials(c.prenom, c.nom)}</div>
          </div>
          <div class="dm-card__body">
            <div class="dm-card__head">
              <div class="dm-card__name">${esc(c.prenom)} ${esc(c.nom)}${c.entreprise?` <span class="mini" style="font-weight:400">· ${esc(c.entreprise)}</span>`:''}</div>
              <div class="dm-card__meta">
                ${typeBadge(c.type)}
                ${tempBadge(c.temperature)}
              </div>
            </div>
            <div class="dm-card__event">
              ${c.email ? `<span class="contact-info"><span class="contact-info__ico">✉️</span>${esc(c.email)}</span>` : ''}
              ${c.tel ? `<span class="contact-info"><span class="contact-info__ico">📞</span>${esc(c.tel)}</span>` : ''}
            </div>
            <div class="dm-card__foot">
              <span class="mini">${c.source?`Source : ${esc(c.source)} · `:''}Créé ${fmtDate(c.createdAt)}</span>
              <button class="btn btn--sm btn--secondary" data-open-contact-btn="${c.id}">Ouvrir →</button>
            </div>
          </div>
        </div>`;
      }).join('') : `<div class="dm-empty">
        <div class="dm-empty__icon">👥</div>
        <div class="dm-empty__title">Aucun contact pour l'instant</div>
        <div class="dm-empty__sub">Clique sur "Nouveau contact" pour commencer à construire ta base.</div>
      </div>`}
    </div>
  `;
}

/* ---------- PIPELINE ---------- */
const pipelineExpanded = {};   // { stageId: true } — colonnes développées
const PIPELINE_MAX_VISIBLE = 3;

function renderPipeline(){
  const d = Store.data;
  return `
    <div class="view-header">
      <div>
        <h1 class="view-title" data-ico="🎯">Pipeline <em>commercial</em></h1>
        <div class="view-subtitle">Glissez-déposez les cartes entre les colonnes</div>
      </div>
      <button class="btn btn--primary" data-action="new-deal">+ Nouvelle transaction</button>
    </div>

    <div class="pipeline">
      ${d.stages.map(s => {
        const list = d.deals.filter(x => x.stage === s.id).sort((a,b) => b.createdAt - a.createdAt);
        const total = list.reduce((sum,x) => sum + dealValue(x), 0);
        const expanded = pipelineExpanded[s.id];
        const visibleList = expanded ? list : list.slice(0, PIPELINE_MAX_VISIBLE);
        const hidden = list.length - visibleList.length;
        return `
          <div class="column column--${s.id}" data-stage="${s.id}">
            <div class="column__head">
              <div>
                <div class="column__title">${esc(s.nom)}</div>
                <div class="mini">${fmtMoney(total)}</div>
              </div>
              <div class="column__count">${list.length}</div>
            </div>
            <div class="column__body">
              ${visibleList.map(x => {
                const c = Store.contact(x.contactId);
                return `
                  <div class="deal-card" draggable="true" data-deal="${x.id}">
                    <div class="deal-card__title">${esc(x.title)}</div>
                    <div class="deal-card__meta">${c ? esc(c.prenom+' '+c.nom) : '—'}</div>
                    <div class="deal-card__amount">${fmtMoney(dealValue(x))}</div>
                    <div class="deal-card__foot">
                      <span class="mini">${x.eventDate ? fmtDate(x.eventDate) : 'sans date'}</span>
                      ${c ? tempBadge(c.temperature) : ''}
                    </div>
                  </div>`;
              }).join('')}
              ${hidden > 0 ? `
                <button class="pipeline-more" data-pipeline-more="${s.id}">Voir ${hidden} de plus ↓</button>
              ` : (expanded && list.length > PIPELINE_MAX_VISIBLE ? `
                <button class="pipeline-more pipeline-more--less" data-pipeline-more="${s.id}">Réduire ↑</button>
              ` : '')}
            </div>
          </div>`;
      }).join('')}
    </div>
  `;
}

/* ---------- EVENTS / AGENDA ---------- */
let calCursor = new Date();

function renderEvents(){
  const d = Store.data;
  const first = startOfMonth(calCursor);
  const dow = (first.getDay()+6)%7;
  const days = [];
  for (let i=0; i<dow; i++) days.push({ date: new Date(first.getTime() - (dow-i)*86400000), out: true });
  const nextMonth = addMonths(first, 1);
  for (let d2 = new Date(first); d2 < nextMonth; d2.setDate(d2.getDate()+1)) days.push({ date: new Date(d2), out: false });
  while (days.length % 7 !== 0) { const last = days[days.length-1].date; days.push({ date: new Date(last.getTime()+86400000), out: true }); }

  const events = d.deals.filter(x => x.eventDate).map(x => ({ id:x.id, title:x.title, date:x.eventDate, deal:x }));
  const evByDay = new Map();
  events.forEach(e => { const k = new Date(e.date).toDateString(); if (!evByDay.has(k)) evByDay.set(k, []); evByDay.get(k).push(e); });

  const monthLabel = first.toLocaleDateString('fr-FR', { month:'long', year:'numeric' });
  const dowLabels = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  return `
    <div class="view-header">
      <div>
        <h1 class="view-title" data-ico="📅">Agenda <em>&amp; événements</em></h1>
        <div class="view-subtitle">Vue mensuelle · connectable à Google Agenda / Apple Calendar</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn--secondary" data-ical-export>📥 Exporter (.ics)</button>
        <button class="btn btn--secondary" data-ical-copy>🔗 Copier l'URL d'abonnement</button>
      </div>
    </div>

    <div class="card" style="background:linear-gradient(180deg,var(--beige-3) 0%,var(--white) 100%);border-color:var(--beige);margin-bottom:16px">
      <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
        <div style="flex:1;min-width:280px">
          <div style="font-family:var(--font-serif);font-size:18px;color:var(--bordeaux);margin-bottom:4px">Synchroniser avec Google Agenda</div>
          <div class="mini">Deux options : ajouter un événement en un clic (bouton sur chaque événement) · ou exporter le fichier <strong>.ics</strong> et l'importer dans Google Calendar (Paramètres → Importer et exporter → Importer).</div>
        </div>
      </div>
    </div>

    <div class="calendar-head">
      <div class="calendar-month">${monthLabel}</div>
      <div class="calendar-nav">
        <button data-cal-nav="-1">‹</button>
        <button data-cal-nav="0">Aujourd'hui</button>
        <button data-cal-nav="1">›</button>
      </div>
    </div>

    <div class="calendar">
      <div class="calendar__grid">
        ${dowLabels.map(l => `<div class="calendar__dow">${l}</div>`).join('')}
        ${days.map(({date,out}) => {
          const dayEvents = evByDay.get(date.toDateString()) || [];
          const today = isSameDay(date, new Date());
          return `<div class="calendar__cell ${out?'is-out':''} ${today?'is-today':''}">
            <span class="calendar__day">${date.getDate()}</span>
            ${dayEvents.map(e => `<div class="calendar__event" data-deal="${e.deal.id}" title="${esc(e.title)}">${esc(e.title)}</div>`).join('')}
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

/* ---------- REVENUE (Chiffre d'affaires) ---------- */
let revenueYear = new Date().getFullYear();

function renderRevenue(){
  const d = Store.data;
  const wonDeals = d.deals.filter(x => (x.stage==='s_won' || x.stage==='s_billing') && x.eventDate);
  const marginRate = d.meta.marginRate || 45;

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  // Available years (from data + current)
  const yearsWithData = [...new Set(wonDeals.map(x => new Date(x.eventDate).getFullYear()))];
  const availableYears = [...new Set([curYear, curYear-1, curYear-2, ...yearsWithData])].sort((a,b) => b-a);

  const monthsFR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const monthsShort = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];

  const dealsByMonth = m => wonDeals.filter(x => {
    const dt = new Date(x.eventDate);
    return dt.getFullYear() === revenueYear && dt.getMonth() === m;
  });
  const caByMonth = m => dealsByMonth(m).reduce((s,x) => s + dealValue(x), 0);
  const caByYear = year => wonDeals.filter(x => new Date(x.eventDate).getFullYear() === year).reduce((s,x) => s + dealValue(x), 0);

  const caYear = caByYear(revenueYear);
  const caY1 = caByYear(revenueYear - 1);
  const caY2 = caByYear(revenueYear - 2);
  const margeYear = Math.round(caYear * marginRate / 100);

  const nbEventsYear = wonDeals.filter(x => new Date(x.eventDate).getFullYear() === revenueYear).length;
  const panierMoyen = nbEventsYear ? Math.round(caYear / nbEventsYear) : 0;

  // Compare current month vs same month previous year
  const caMonthCur = caByMonth(curMonth);
  const caMonthPrev = wonDeals.filter(x => {
    const dt = new Date(x.eventDate);
    return dt.getFullYear() === revenueYear - 1 && dt.getMonth() === curMonth;
  }).reduce((s,x) => s + dealValue(x), 0);
  const evolMonth = caMonthPrev ? Math.round(((caMonthCur - caMonthPrev)/caMonthPrev)*100) : null;
  const evolYear  = caY1 ? Math.round(((caYear - caY1)/caY1)*100) : null;

  // Monthly data for chart
  const monthlyCA = Array.from({length:12}, (_,m) => caByMonth(m));
  const monthlyPrev = Array.from({length:12}, (_,m) => wonDeals.filter(x => {
    const dt = new Date(x.eventDate);
    return dt.getFullYear() === revenueYear - 1 && dt.getMonth() === m;
  }).reduce((s,x) => s + dealValue(x), 0));
  const maxMonthly = Math.max(1, ...monthlyCA, ...monthlyPrev);

  // Cumulative for year comparison
  const cumulative = (year) => {
    const arr = Array.from({length:12}, (_,m) => wonDeals.filter(x => {
      const dt = new Date(x.eventDate);
      return dt.getFullYear() === year && dt.getMonth() <= m;
    }).reduce((s,x) => s + dealValue(x), 0));
    return arr;
  };
  const cumY0 = cumulative(revenueYear);
  const cumY1 = cumulative(revenueYear - 1);
  const cumY2 = cumulative(revenueYear - 2);
  const cumMax = Math.max(1, ...cumY0, ...cumY1, ...cumY2);

  return `
    <div class="view-header">
      <div>
        <h1 class="view-title" data-ico="💰">Chiffre d'<em>affaires</em></h1>
        <div class="view-subtitle">CA basé sur la date des événements gagnés · Marge estimée à ${marginRate}% (modifiable)</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <label class="mini" style="margin-right:6px">Année</label>
        <select id="revenue-year" style="padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--white);font-size:13.5px;font-weight:500">
          ${availableYears.map(y => `<option value="${y}" ${y===revenueYear?'selected':''}>${y}</option>`).join('')}
        </select>
        <button class="btn btn--secondary btn--sm" id="revenue-margin-edit">Marge : ${marginRate}%</button>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="grid grid-4">
      <div class="kpi" style="background:linear-gradient(135deg,var(--bordeaux),#7a1230);color:var(--beige);border:none">
        <span class="kpi__label" style="color:rgba(237,225,216,.7)">CA ${revenueYear}</span>
        <span class="kpi__value" style="color:var(--beige)">${fmtMoney(caYear)}</span>
        <span class="kpi__hint" style="color:rgba(237,225,216,.85)">${evolYear!=null ? `${evolYear>=0?'▲':'▼'} ${Math.abs(evolYear)}% vs ${revenueYear-1}` : `vs ${fmtMoney(caY1)} en ${revenueYear-1}`}</span>
      </div>
      <div class="kpi">
        <span class="kpi__label">Marge estimée</span>
        <span class="kpi__value">${fmtMoney(margeYear)}</span>
        <span class="kpi__hint">${marginRate}% du CA</span>
      </div>
      <div class="kpi">
        <span class="kpi__label">Événements ${revenueYear}</span>
        <span class="kpi__value">${nbEventsYear}</span>
        <span class="kpi__hint">panier moyen ${fmtMoney(panierMoyen)}</span>
      </div>
      <div class="kpi">
        <span class="kpi__label">CA ${monthsShort[curMonth]} ${curYear}</span>
        <span class="kpi__value">${fmtMoney(caMonthCur)}</span>
        <span class="kpi__hint">${evolMonth!=null ? `${evolMonth>=0?'▲':'▼'} ${Math.abs(evolMonth)}% vs ${curYear-1}` : 'pas de comparaison'}</span>
      </div>
    </div>

    <!-- Monthly bar chart : this year vs previous year -->
    <div class="card" style="margin-top:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 class="section-title" style="margin:0">Répartition <em>mensuelle</em></h3>
        <div style="display:flex;gap:12px;font-size:12px">
          <span style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:14px;background:var(--bordeaux);border-radius:3px"></span>${revenueYear}</span>
          <span style="display:flex;align-items:center;gap:6px;color:var(--muted)"><span style="width:14px;height:14px;background:var(--beige);border:1px solid var(--muted);border-radius:3px"></span>${revenueYear-1}</span>
        </div>
      </div>
      <div class="rev-chart">
        ${monthsShort.map((m, i) => {
          const h = (monthlyCA[i] / maxMonthly) * 100;
          const hPrev = (monthlyPrev[i] / maxMonthly) * 100;
          return `
            <div class="rev-bar-group" title="${m} · ${fmtMoney(monthlyCA[i])} (${revenueYear-1} : ${fmtMoney(monthlyPrev[i])})">
              <div class="rev-bars">
                <div class="rev-bar rev-bar--prev" style="height:${hPrev}%"></div>
                <div class="rev-bar rev-bar--cur" style="height:${h}%">
                  ${monthlyCA[i] ? `<span class="rev-bar__val">${fmtMoney(monthlyCA[i]).replace(/\s/g,' ')}</span>` : ''}
                </div>
              </div>
              <div class="rev-bar__lbl">${m}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Cumulative line comparison -->
    <div class="card" style="margin-top:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 class="section-title" style="margin:0">CA cumulé <em>année après année</em></h3>
        <div style="display:flex;gap:12px;font-size:12px">
          <span style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:2px;background:var(--bordeaux)"></span>${revenueYear}</span>
          <span style="display:flex;align-items:center;gap:6px;color:var(--muted)"><span style="width:14px;height:2px;background:#c5a892"></span>${revenueYear-1}</span>
          <span style="display:flex;align-items:center;gap:6px;color:var(--muted)"><span style="width:14px;height:2px;background:#a89485"></span>${revenueYear-2}</span>
        </div>
      </div>
      ${renderLineChart([
        { label:`${revenueYear}`,   data:cumY0, color:'#560216', strong:true },
        { label:`${revenueYear-1}`, data:cumY1, color:'#c5a892' },
        { label:`${revenueYear-2}`, data:cumY2, color:'#a89485' },
      ], cumMax, monthsShort)}
    </div>

    <!-- Monthly calendar-style breakdown -->
    <div class="card" style="margin-top:20px">
      <h3 class="section-title">Agenda <em>du CA</em> · ${revenueYear}</h3>
      <div class="rev-calendar">
        ${monthsFR.map((mName, m) => {
          const events = dealsByMonth(m);
          const ca = caByMonth(m);
          const marge = Math.round(ca * marginRate / 100);
          const isCurrent = revenueYear === curYear && m === curMonth;
          return `
            <div class="rev-month ${isCurrent?'is-current':''}">
              <div class="rev-month__head">
                <div>
                  <div class="rev-month__name">${mName}</div>
                  <div class="mini">${events.length} événement${events.length>1?'s':''}</div>
                </div>
                <div style="text-align:right">
                  <div class="rev-month__ca">${fmtMoney(ca)}</div>
                  <div class="mini">marge ${fmtMoney(marge)}</div>
                </div>
              </div>
              ${events.length ? `<div class="rev-month__events">${events.slice(0,4).map(e => {
                const c = Store.contact(e.contactId);
                return `<div class="rev-event" data-deal="${e.id}" style="cursor:pointer">
                  <span class="rev-event__day">${new Date(e.eventDate).getDate().toString().padStart(2,'0')}</span>
                  <span class="rev-event__title">${esc(e.title)}</span>
                  <span class="rev-event__amt">${fmtMoney(dealValue(e))}</span>
                </div>`;
              }).join('')}${events.length>4?`<div class="mini" style="text-align:center;padding:4px">+ ${events.length-4} autres</div>`:''}</div>` : '<div class="mini" style="text-align:center;padding:12px 0;color:var(--muted)">Aucun événement</div>'}
            </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Top prestations -->
    ${renderTopPrestations(wonDeals.filter(x => new Date(x.eventDate).getFullYear() === revenueYear))}
  `;
}

function renderTopPrestations(deals){
  const totals = {};
  deals.forEach(d => {
    const qs = Store.data.quotes.filter(q => q.dealId === d.id && q.statut === 'accepté');
    const q = qs[0] || Store.data.quotes.filter(qq => qq.dealId === d.id).sort((a,b) => b.createdAt - a.createdAt)[0];
    if (!q) return;
    q.items.forEach(it => {
      const key = it.nom || 'Divers';
      totals[key] = (totals[key] || 0) + lineTotal(it);
    });
  });
  const arr = Object.entries(totals).sort((a,b) => b[1]-a[1]).slice(0,8);
  if (!arr.length) return '';
  const max = arr[0][1];
  return `
    <div class="card" style="margin-top:20px">
      <h3 class="section-title">Top <em>prestations</em></h3>
      ${arr.map(([nom, val]) => `
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-weight:500;font-size:13px">${esc(nom)}</span>
            <span class="money" style="font-size:14px">${fmtMoney(val)}</span>
          </div>
          <div style="height:6px;background:var(--beige-3);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${(val/max)*100}%;background:linear-gradient(90deg,var(--bordeaux),#a8324a);border-radius:3px"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderLineChart(series, maxY, labels){
  const W = 800, H = 220, PAD = 40;
  const stepX = (W - 2*PAD) / (labels.length - 1);
  const yFor = v => H - PAD - (v/maxY) * (H - 2*PAD);

  // Gridlines
  const grid = [0, 0.25, 0.5, 0.75, 1].map(t => {
    const y = H - PAD - t * (H - 2*PAD);
    const val = Math.round(maxY * t);
    return `<line x1="${PAD}" y1="${y}" x2="${W-PAD}" y2="${y}" stroke="var(--line-2)" stroke-width="1"/>
      <text x="${PAD-8}" y="${y+4}" font-size="10" fill="var(--muted)" text-anchor="end">${fmtMoney(val).replace(/\s€/,'')}</text>`;
  }).join('');

  const xLabels = labels.map((l, i) => `<text x="${PAD + i*stepX}" y="${H-PAD+18}" font-size="10" fill="var(--muted)" text-anchor="middle">${l}</text>`).join('');

  const lines = series.map(s => {
    const path = s.data.map((v,i) => `${i===0?'M':'L'} ${PAD + i*stepX} ${yFor(v)}`).join(' ');
    const dots = s.data.map((v,i) => `<circle cx="${PAD + i*stepX}" cy="${yFor(v)}" r="${s.strong?4:3}" fill="${s.color}"/>`).join('');
    return `<path d="${path}" fill="none" stroke="${s.color}" stroke-width="${s.strong?2.5:1.5}" stroke-linecap="round" stroke-linejoin="round" opacity="${s.strong?1:0.6}"/>${dots}`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">${grid}${lines}${xLabels}</svg>`;
}

/* ---------- QUOTES LIST ---------- */
function renderQuotes(){
  const d = Store.data;

  // Groupe devis + factures par contact
  const groups = new Map();
  const getGroup = c => {
    if (!groups.has(c.id)) groups.set(c.id, { contact: c, quotes: [], invoices: [] });
    return groups.get(c.id);
  };
  d.quotes.forEach(q => {
    const c = Store.contact(q.contactId);
    if (c) getGroup(c).quotes.push(q);
  });
  d.invoices.forEach(inv => {
    const c = Store.contact(inv.contactId);
    if (c) getGroup(c).invoices.push(inv);
  });

  // Trie : clients d'abord, puis prospects, puis par activité récente
  const groupList = [...groups.values()].sort((a,b) => {
    if (a.contact.type !== b.contact.type) {
      if (a.contact.type === 'client') return -1;
      if (b.contact.type === 'client') return 1;
    }
    const aLast = Math.max(...a.quotes.map(q=>q.createdAt), ...a.invoices.map(i=>i.createdAt), 0);
    const bLast = Math.max(...b.quotes.map(q=>q.createdAt), ...b.invoices.map(i=>i.createdAt), 0);
    return bLast - aLast;
  });

  const totalFacture = d.invoices.reduce((s,inv) => s + inv.montant, 0);
  const totalEncaisse = d.invoices.reduce((s,inv) => s + Store.invoiceEncaisse(inv.id), 0);
  const totalDu = totalFacture - totalEncaisse;

  return `
    <div class="view-header">
      <div>
        <h1 class="view-title" data-ico="📄">Devis <em>&amp; factures</em></h1>
        <div class="view-subtitle">Regroupés par prospect &amp; client · triés par activité récente</div>
      </div>
      <button class="btn btn--primary" data-action="new-quote">Nouveau devis</button>
    </div>

    <!-- Pilules stats -->
    <div class="dm-stats-inline">
      <div class="dm-stat-pill"><span class="dm-stat-pill__num">${d.quotes.length}</span> <span>Devis</span></div>
      <div class="dm-stat-pill"><span class="dm-stat-pill__num">${d.invoices.length}</span> <span>Factures</span></div>
      <div class="dm-stat-pill"><span class="dm-stat-pill__num">${fmtMoney(totalFacture)}</span> <span>Facturé</span></div>
      ${totalDu > 0 ? `<div class="dm-stat-pill dm-stat-pill--accent"><span class="dm-stat-pill__num">${fmtMoney(totalDu)}</span> <span>Reste dû</span></div>` : `<div class="dm-stat-pill" style="border-color:var(--success)"><span class="dm-stat-pill__num" style="color:var(--success)">${fmtMoney(totalEncaisse)}</span> <span>Encaissé</span></div>`}
    </div>

    ${groupList.length ? `
      ${(() => {
        // Segmente par type de contact
        const buckets = { client: [], prospect: [], pro: [], partner: [] };
        groupList.forEach(g => { (buckets[g.contact.type] || buckets.prospect).push(g); });
        const sections = [
          { key:'client',   label:'Clients',       icon:'💚', color:'client',   bg:'rgba(46,125,91,.06)',  border:'#2e7d5b' },
          { key:'prospect', label:'Prospects',     icon:'🍷', color:'prospect', bg:'rgba(86,2,22,.05)',    border:'#560216' },
          { key:'pro',      label:'Professionnels',icon:'🪙', color:'pro',      bg:'rgba(184,134,11,.07)', border:'#b8860b' },
          { key:'partner',  label:'Partenaires',   icon:'🌊', color:'partner',  bg:'rgba(91,141,184,.07)', border:'#5b8db8' },
        ].filter(s => buckets[s.key].length);
        return sections.map(sec => {
          const secGroups = buckets[sec.key];
          const secQuotes = secGroups.reduce((s,g)=>s+g.quotes.length, 0);
          const secInvoices = secGroups.reduce((s,g)=>s+g.invoices.length, 0);
          const secFacture = secGroups.reduce((s,g)=>s+g.invoices.reduce((a,i)=>a+i.montant,0), 0);
          return `
            <details class="qz-section qz-section--${sec.color}">
              <summary class="qz-section__head" style="--sec-bg:${sec.bg};--sec-c:${sec.border}">
                <span class="qz-section__ico">${sec.icon}</span>
                <div class="qz-section__title">
                  <div class="qz-section__label">${sec.label}</div>
                  <div class="qz-section__meta">${secGroups.length} ${secGroups.length>1?'personnes':'personne'} · ${secQuotes} devis · ${secInvoices} facture${secInvoices>1?'s':''}${secFacture?` · ${fmtMoney(secFacture)} facturé`:''}</div>
                </div>
                <span class="qz-section__count">${secGroups.length}</span>
                <span class="qz-section__toggle">▾</span>
              </summary>
              <div class="qz-section__body">
                ${secGroups.map(g => {
          const c = g.contact;
          const totalQuotes = g.quotes.reduce((s,q) => s + Store.quoteTotals(q).ttc, 0);
          const totalFactured = g.invoices.reduce((s,inv) => s + inv.montant, 0);
          const totalEnc = g.invoices.reduce((s,inv) => s + Store.invoiceEncaisse(inv.id), 0);
          const reste = totalFactured - totalEnc;
          return `
            <details class="qz-group" ${g.quotes.some(q => q.statut !== 'accepté' && q.statut !== 'refusé') || reste > 0 ? 'open' : ''}>
              <summary class="qz-group__head">
                <div class="qz-group__client">
                  <div class="avatar">${initials(c.prenom, c.nom)}</div>
                  <div>
                    <div class="qz-group__name">${esc(c.prenom)} ${esc(c.nom)}${c.entreprise?` <span class="mini" style="font-weight:400">· ${esc(c.entreprise)}</span>`:''}</div>
                    <div class="qz-group__type">${typeBadge(c.type)} <span class="mini">${g.quotes.length} devis · ${g.invoices.length} facture${g.invoices.length>1?'s':''}</span></div>
                  </div>
                </div>
                <div class="qz-group__totals">
                  ${totalFactured ? `<div class="qz-group__stat"><span>Facturé</span><strong>${fmtMoney(totalFactured)}</strong></div>` : ''}
                  ${reste > 0 ? `<div class="qz-group__stat qz-group__stat--warn"><span>Reste dû</span><strong>${fmtMoney(reste)}</strong></div>` : totalFactured ? `<div class="qz-group__stat qz-group__stat--ok"><span>Soldé</span><strong>✓</strong></div>` : ''}
                </div>
                <button class="btn btn--sm btn--primary qz-group__open-btn" data-open-contact-btn="${c.id}" title="Voir la fiche complète">Voir fiche →</button>
                <span class="qz-group__toggle">▾</span>
              </summary>

              <div class="qz-group__content">
                ${g.quotes.length ? `
                  <div class="qz-subhead">Devis</div>
                  ${[...g.quotes].sort((a,b)=>b.createdAt-a.createdAt).map(q => {
                    const totals = Store.quoteTotals(q);
                    return `
                      <div class="qz-line" data-quote-edit="${q.id}">
                        <div class="qz-line__num">${esc(q.numero)}</div>
                        <div class="qz-line__title">${esc(q.eventTitle||q.eventType||'—')}</div>
                        <div class="qz-line__money">${fmtMoney(totals.ttc)}</div>
                        <div class="qz-line__badge">${quoteStatusBadge(q.statut)}</div>
                        <div class="qz-line__actions">
                          <button class="btn btn--sm btn--secondary" data-quote-edit="${q.id}">Éditer</button>
                          <button class="btn btn--sm btn--secondary" data-quote-preview="${q.id}">Aperçu</button>
                        </div>
                      </div>
                    `;
                  }).join('')}
                ` : ''}

                ${g.invoices.length ? `
                  <div class="qz-subhead" style="margin-top:${g.quotes.length?'12px':'0'}">Factures</div>
                  ${g.invoices.map(inv => {
                    const encaisse = Store.invoiceEncaisse(inv.id);
                    const restant = Store.invoiceRemaining(inv);
                    const pct = inv.montant > 0 ? Math.round((encaisse / inv.montant) * 100) : 0;
                    const statutColor = inv.statut === 'payée' ? 'client' : inv.statut === 'partiellement payée' ? 'warm' : 'prospect';
                    return `
                      <div class="qz-invoice">
                        <div class="qz-invoice__head">
                          <div>
                            <div class="qz-invoice__num">${esc(inv.numero)} <span class="tag">${esc(inv.type)}</span></div>
                            <div class="mini">Montant total : <strong>${fmtMoney(inv.montant)}</strong></div>
                          </div>
                          <span class="badge badge--${statutColor}">${esc(inv.statut)}</span>
                        </div>

                        <!-- Cellules finance visuelles -->
                        <div class="qz-invoice__cells">
                          <div class="qz-invoice__cell qz-invoice__cell--ok">
                            <span class="qz-invoice__lbl">Acompte versé</span>
                            <span class="qz-invoice__val">${fmtMoney(encaisse)}</span>
                          </div>
                          <div class="qz-invoice__cell ${restant>0?'qz-invoice__cell--warn':'qz-invoice__cell--ok'}">
                            <span class="qz-invoice__lbl">${restant>0?'Restant à régler':'Solde'}</span>
                            <span class="qz-invoice__val">${restant>0?fmtMoney(restant):'✓ Payé'}</span>
                          </div>
                        </div>

                        <!-- Barre de progression -->
                        <div class="qz-invoice__progress" title="${pct}% encaissé">
                          <div class="qz-invoice__progress-bar" style="width:${pct}%"></div>
                        </div>

                        <!-- Actions -->
                        <div class="qz-invoice__actions">
                          ${restant > 0 ? `<button class="btn btn--sm btn--primary" data-encaisser="${inv.id}">+ Encaisser un paiement</button>` : ''}
                          <button class="btn btn--sm btn--secondary" data-open-invoice="${inv.id}">Voir le détail</button>
                        </div>
                      </div>
                    `;
                  }).join('')}
                ` : ''}
              </div>
            </details>
          `;
        }).join('')}
              </div>
            </details>
          `;
        }).join('');
      })()}
    ` : `<div class="dm-empty">
      <div class="dm-empty__icon">📄</div>
      <div class="dm-empty__title">Aucun devis ni facture</div>
      <div class="dm-empty__sub">Crée un devis depuis une fiche contact ou depuis une demande.</div>
    </div>`}
  `;
}

/* ---------- TASKS ---------- */
function renderTasks(){
  const d = Store.data;
  const now = Date.now();
  const open = d.tasks.filter(t => !t.done).sort((a,b) => a.due - b.due);
  const done = d.tasks.filter(t => t.done).sort((a,b) => b.due - a.due).slice(0,10);

  const renderList = (list, empty) => list.length ? list.map(t => {
    const c = Store.contact(t.contactId);
    const late = !t.done && t.due < now;
    return `<div class="stat-line">
      <div>
        <div style="font-weight:500;${t.done?'text-decoration:line-through;opacity:.5':''}">${esc(t.titre)}</div>
        <div class="mini">${c?esc(c.prenom+' '+c.nom):''} · <span style="color:${late?'var(--danger)':'var(--muted)'}">${late?'en retard · ':''}${fmtDate(t.due)}</span></div>
      </div>
      <button class="btn btn--sm btn--secondary" data-task-toggle="${t.id}">${t.done?'Rouvrir':'Fait'}</button>
    </div>`;
  }).join('') : `<div class="mini">${empty}</div>`;

  return `
    <div class="view-header">
      <div>
        <h1 class="view-title" data-ico="✅">Tâches <em>&amp; relances</em></h1>
        <div class="view-subtitle">${open.length} à faire</div>
      </div>
      <button class="btn btn--primary" data-action="new-task">+ Nouvelle tâche</button>
    </div>

    <div class="grid grid-2">
      <div class="card"><h3 class="section-title">À <em>faire</em></h3>${renderList(open, 'Rien à faire pour le moment.')}</div>
      <div class="card"><h3 class="section-title">Récemment <em>terminées</em></h3>${renderList(done, 'Aucune tâche terminée.')}</div>
    </div>
  `;
}

/* ---------- PRESTATIONS ADMIN ---------- */
let prestaFilterCat = 'all';

function renderPrestations(){
  const cats = ['all', ...new Set(Store.data.prestations.map(p => p.categorie))];
  const list = prestaFilterCat === 'all' ? Store.data.prestations : Store.data.prestations.filter(p => p.categorie === prestaFilterCat);

  return `
    <div class="view-header">
      <div>
        <h1 class="view-title" data-ico="🎁">Catalogue <em>Vision 24</em></h1>
        <div class="view-subtitle">${Store.data.prestations.length} prestations · éditables librement · utilisées automatiquement dans les devis</div>
      </div>
      <button class="btn btn--primary" data-action="new-presta">+ Nouvelle prestation</button>
    </div>

    <div class="toolbar">
      ${cats.map(cat => `<button class="chip ${prestaFilterCat===cat?'is-active':''}" data-presta-cat="${esc(cat)}">${cat==='all'?'Toutes':esc(cat)}</button>`).join('')}
    </div>

    <div class="presta-grid">
      ${list.map(p => `
        <div class="presta" data-presta="${p.id}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <span class="presta__cat">${esc(p.categorie)}</span>
            ${p.actif===false?'<span class="badge badge--neutral">inactif</span>':''}
          </div>
          <h4 class="presta__name">${esc(p.nom)}</h4>
          <p class="presta__desc">${esc((p.description||'').slice(0,120))}${(p.description||'').length>120?'…':''}</p>
          <div style="margin-top:auto">
            ${(p.variants||[]).length ? `<div class="mini" style="margin-bottom:4px">${p.variants.length} variante${p.variants.length>1?'s':''} · dès ${fmtMoney(Math.min(...p.variants.map(v=>v.prix)))}</div>` : ''}
            ${(p.options||[]).length ? `<div class="mini">${p.options.length} option${p.options.length>1?'s':''}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/* =========================================================
   QUOTE EDITOR — Cœur du module devis
========================================================= */
let QE = null; // active quote in editor

function openQuoteEditorForDeal(dealId){
  const deal = Store.deal(dealId);
  if (!deal) return;
  const contact = Store.contact(deal.contactId);
  const q = createQuoteDraft({ deal, contact });
  Store.data.quotes.push(q);
  Store.save();
  Router.go('quote-editor', { quoteId: q.id });
}

function openQuoteEditorForContact(contactId){
  const contact = Store.contact(contactId);
  if (!contact) return;
  // find or create a default deal
  let deal = Store.dealsOf(contactId).sort((a,b) => b.createdAt - a.createdAt)[0];
  if (!deal) {
    deal = { id: uid(), title:`Devis pour ${contact.prenom} ${contact.nom}`, contactId, stage:'s_quote_p', probabilite:50, createdAt: Date.now() };
    Store.data.deals.unshift(deal);
  }
  const q = createQuoteDraft({ deal, contact });
  Store.data.quotes.push(q);
  Store.save();
  Router.go('quote-editor', { quoteId: q.id });
}

function createQuoteDraft({ deal, contact }){
  const num = nextQuoteNumber();
  const validUntil = new Date(); validUntil.setDate(validUntil.getDate() + 30);
  return {
    id: uid(),
    numero: num,
    dealId: deal.id,
    contactId: contact.id,
    statut: 'brouillon',
    clientSnapshot: {
      prenom: contact.prenom, nom: contact.nom, email: contact.email, tel: contact.tel,
      entreprise: contact.entreprise, adresse: contact.adresse
    },
    eventTitle: deal.title || '',
    eventType: deal.eventType || '',
    eventDate: deal.eventDate || '',
    eventHoraires: deal.horaires || '',
    eventLieu: deal.lieu || '',
    eventInvites: deal.invites || null,
    eventNotes: deal.notes || '',
    items: [],
    remise: 0,
    tvaRate: Store.data.meta.tvaDefault,
    acompteRate: Store.data.meta.acompteDefault,
    conditions: 'Devis valable 30 jours. Acompte de 30% à la signature. Solde à régler le jour de l\'événement. Déplacement inclus dans un rayon de 20 km autour de Collégien.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function nextQuoteNumber(){
  const year = new Date().getFullYear();
  // Prend le max existant + 1 (jamais réutiliser un numéro même après suppression)
  const pattern = new RegExp(`V24-${year}-(\\d+)$`);
  let maxN = 0;
  Store.data.quotes.forEach(q => {
    const m = (q.numero||'').match(pattern);
    if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
  });
  return `V24-${year}-${(maxN + 1).toString().padStart(3,'0')}`;
}

function renderQuoteEditor(){
  const q = Store.quote(Router.params.quoteId);
  if (!q) { setTimeout(() => Router.go('quotes'), 0); return '<div>Chargement…</div>'; }
  QE = q;
  const totals = Store.quoteTotals(q);

  const clientInitials = initials(q.clientSnapshot.prenom, q.clientSnapshot.nom);

  return `
    <div class="qe qeV2">
      <!-- Topbar sticky moderne -->
      <div class="qeV2__topbar">
        <button class="qeV2__back" data-qe-back>← Retour</button>
        <div class="qeV2__title-block">
          <div class="qeV2__num">Devis ${esc(q.numero)}</div>
          <div class="qeV2__status">${quoteStatusBadge(q.statut)}</div>
        </div>
        <div class="qeV2__actions">
          <button class="btn btn--secondary btn--sm" data-qe-preview>👁 Aperçu</button>
          <button class="btn btn--secondary btn--sm" data-qe-send>✉️ Envoyer</button>
          ${q.statut !== 'accepté' ? `<button class="btn btn--primary btn--sm" data-qe-accept>✅ Accepté</button>` : ''}
        </div>
      </div>

      <div class="qeV2__grid">
        <!-- LEFT · Client + Événement -->
        <div class="qeV2__left">

          <!-- Card client visuelle -->
          <div class="qeV2__card">
            <div class="qeV2__client">
              <div class="qeV2__client-avatar">${clientInitials}</div>
              <div style="flex:1;min-width:0">
                <div class="qeV2__client-name">${esc(q.clientSnapshot.prenom||'')} ${esc(q.clientSnapshot.nom||'')}</div>
                ${q.clientSnapshot.entreprise?`<div class="qeV2__client-company">${esc(q.clientSnapshot.entreprise)}</div>`:''}
              </div>
            </div>
            <div class="qeV2__client-coords">
              ${q.clientSnapshot.email ? `<div class="qeV2__client-line"><span>✉️</span> ${esc(q.clientSnapshot.email)}</div>` : ''}
              ${q.clientSnapshot.tel ? `<div class="qeV2__client-line"><span>📞</span> ${esc(q.clientSnapshot.tel)}</div>` : ''}
              ${q.clientSnapshot.adresse ? `<div class="qeV2__client-line"><span>📍</span> ${esc(q.clientSnapshot.adresse)}</div>` : ''}
            </div>
          </div>

          <!-- Card événement avec icônes -->
          <div class="qeV2__card">
            <div class="qeV2__card-title">🎉 Événement</div>
            <div class="field"><label>Titre</label><input data-qe="eventTitle" value="${esc(q.eventTitle||'')}" placeholder="Ex : Mariage Julie & Thomas"></div>
            <div class="field-row">
              <div class="field"><label>Type</label>
                <select data-qe="eventType">
                  <option value="">Choisir…</option>
                  ${['Mariage','Anniversaire','Baptême','Séminaire','Événement d\'entreprise','Inauguration','Soirée privée','Salon professionnel','Autre'].map(x => `<option ${q.eventType===x?'selected':''}>${x}</option>`).join('')}
                </select>
              </div>
              <div class="field"><label>Date</label><input type="date" data-qe="eventDate" value="${esc(q.eventDate||'')}"></div>
            </div>
            <div class="field-row">
              <div class="field"><label>Horaires</label><input data-qe="eventHoraires" placeholder="18h — 03h" value="${esc(q.eventHoraires||'')}"></div>
              <div class="field"><label>Invités</label><input type="number" data-qe="eventInvites" value="${q.eventInvites||''}" placeholder="120"></div>
            </div>
            <div class="field"><label>Lieu</label><input data-qe="eventLieu" value="${esc(q.eventLieu||'')}" placeholder="Château, salle, etc."></div>
            <div class="field"><label>Notes internes (jamais imprimées sur le devis)</label><textarea data-qe="eventNotes" placeholder="Rappels perso, contraintes, briefing équipe…">${esc(q.eventNotes||'')}</textarea></div>
          </div>
        </div>

        <!-- CENTER · Lignes prestations -->
        <div class="qeV2__center">
          <div class="qeV2__card">
            <div class="qeV2__items-head">
              <div>
                <div class="qeV2__card-title" style="margin:0">🎯 Prestations</div>
                <div class="mini">${q.items.length} ligne${q.items.length>1?'s':''}</div>
              </div>
              <div class="qeV2__items-actions">
                <button class="btn btn--secondary btn--sm" id="qe-add-custom">+ Ligne libre</button>
                <button class="btn btn--primary btn--sm" id="qe-add-catalog">+ Catalogue</button>
              </div>
            </div>

            <div id="qe-items">${renderQuoteItems(q)}</div>

            ${q.items.length === 0 ? `
              <div class="qeV2__empty">
                <div class="qeV2__empty-icon">🎁</div>
                <div class="qeV2__empty-title">Ajoutez vos premières prestations</div>
                <div class="qeV2__empty-sub">Le catalogue Vision 24 est déjà pré-rempli · descriptions et tarifs inclus</div>
                <button class="btn btn--primary" id="qe-add-catalog-empty">Ouvrir le catalogue</button>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- RIGHT · Récap hero bordeaux -->
        <div class="qeV2__right">

          <!-- 🍷 Bloc bordeaux TTC hero -->
          <div class="qeV2__hero">
            <div class="qeV2__hero-lbl">Total TTC</div>
            <div class="qeV2__hero-num">${fmtMoney(totals.ttc)}</div>
            <div class="qeV2__hero-sub">Acompte 30% : <strong>${fmtMoney(totals.acompte)}</strong></div>
          </div>

          <!-- Détail montants -->
          <div class="qeV2__card">
            <div class="qeV2__card-title">💰 Détail</div>
            <div class="stat-line"><span>Sous-total</span><strong>${fmtMoneyPrec(totals.subtotal)}</strong></div>
            <div class="stat-line">
              <label style="color:var(--muted);font-weight:500">Remise (%)</label>
              <input type="number" min="0" max="100" step="0.5" data-qe="remisePercent" value="${q.remisePercent||0}" class="qeV2__mini-input">
            </div>
            ${totals.remise ? `<div class="stat-line"><span class="mini">− Remise (${totals.remisePercent}%)</span><strong style="color:var(--warning)">− ${fmtMoneyPrec(totals.remise)}</strong></div>` : ''}
            <div class="stat-line"><span>Total HT</span><strong>${fmtMoneyPrec(totals.ht)}</strong></div>
            <div class="stat-line">
              <label style="color:var(--muted);font-weight:500">TVA %</label>
              <input type="number" data-qe="tvaRate" value="${q.tvaRate}" class="qeV2__mini-input">
            </div>
            <div class="stat-line"><span>TVA</span><strong>${fmtMoneyPrec(totals.tva)}</strong></div>
            <div class="divider"></div>
            <div class="stat-line">
              <label style="color:var(--muted);font-weight:500">Acompte %</label>
              <input type="number" data-qe="acompteRate" value="${q.acompteRate}" class="qeV2__mini-input">
            </div>
            <div class="stat-line"><span>Acompte signature</span><strong>${fmtMoney(totals.acompte)}</strong></div>
            <div class="stat-line"><span>Solde jour J</span><strong>${fmtMoney(totals.solde)}</strong></div>
          </div>

          <!-- Statut -->
          <div class="qeV2__card">
            <div class="qeV2__card-title">📋 Statut</div>
            <div class="field" style="margin-bottom:8px"><label>État du devis</label>
              <select data-qe="statut">
                ${['brouillon','envoyé','consulté','accepté','refusé','expiré'].map(s => `<option ${q.statut===s?'selected':''}>${s}</option>`).join('')}
              </select>
            </div>
            <div class="mini">📅 Créé le ${fmtDate(q.createdAt)}</div>
          </div>

          <!-- Conditions -->
          <details class="qeV2__card qeV2__conditions" open>
            <summary class="qeV2__card-title" style="cursor:pointer;list-style:none">📝 Conditions de paiement</summary>
            <textarea data-qe="conditions">${esc(q.conditions||'')}</textarea>
          </details>

        </div>
      </div>
    </div>
  `;
}

function renderQuoteItems(q){
  if (!q.items.length) return '';
  return q.items.map((it, i) => `
    <div class="qe-item" data-item="${i}">
      <div class="qe-item__head">
        <div style="flex:1">
          <input class="qe-item__title" data-item-field="nom" value="${esc(it.nom||'')}" placeholder="Nom de la prestation">
          <div class="mini" style="margin-top:2px">${it.prestationId?esc(Store.presta(it.prestationId)?.categorie||''):'Ligne libre'}${it.variantLabel?' · '+esc(it.variantLabel):''}</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <input type="number" class="qe-item__qte" data-item-field="qte" value="${it.qte||1}" min="1" title="Quantité">
          <input type="number" class="qe-item__prix" data-item-field="prix" value="${it.prix||0}" title="Prix unitaire €">
          <div class="qe-item__total money">${fmtMoney(lineTotal(it))}</div>
          <button class="qe-item__del" data-item-remove="${i}" title="Supprimer">×</button>
        </div>
      </div>
      <textarea class="qe-item__desc" data-item-field="description" placeholder="Description">${esc(it.description||'')}</textarea>
      ${(it.options||[]).length ? `
        <div class="qe-item__opts">
          <div class="mini" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Options</div>
          ${it.options.map((o, oi) => `
            <label class="qe-opt">
              <input type="checkbox" data-item-opt="${oi}" ${o.checked?'checked':''}>
              <span>${esc(o.label)}</span>
              <span class="money" style="margin-left:auto">${o.prix?'+ '+fmtMoney(o.prix):'inclus'}</span>
            </label>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
}

/* =========================================================
   VIEW HANDLERS
========================================================= */
function attachViewHandlers(){
  $$('.nav__item').forEach(n => n.onclick = () => Router.go(n.dataset.view));

  $$('[data-filter-type]').forEach(b => b.onclick = () => { contactsFilter.type = b.dataset.filterType; render(); });
  $$('[data-filter-temp]').forEach(b => b.onclick = () => { contactsFilter.temp = b.dataset.filterTemp; render(); });
  $('[data-filter-temp-select]')?.addEventListener('change', e => { contactsFilter.temp = e.target.value; render(); });
  $$('[data-open-contact-btn]').forEach(b => b.onclick = e => { e.stopPropagation(); openContact(b.dataset.openContactBtn); });
  $$('[data-presta-cat]').forEach(b => b.onclick = () => { prestaFilterCat = b.dataset.prestaCat; render(); });

  $$('[data-contact]').forEach(el => el.onclick = e => { if (e.target.closest('button')) return; openContact(el.dataset.contact); });
  $$('[data-deal]').forEach(el => el.onclick = e => { if (e.target.closest('button')) return; openDeal(el.dataset.deal); });
  $$('[data-quote]').forEach(el => el.onclick = e => { if (e.target.closest('button')) return; Router.go('quote-editor', { quoteId: el.dataset.quote }); });
  $$('[data-quote-edit]').forEach(el => el.onclick = e => { e.stopPropagation(); Router.go('quote-editor', { quoteId: el.dataset.quoteEdit }); });
  $$('[data-quote-preview]').forEach(el => el.onclick = e => { e.stopPropagation(); openQuotePreview(el.dataset.quotePreview); });
  $$('[data-encaisser]').forEach(el => el.onclick = e => { e.stopPropagation(); openEncaisserModal(el.dataset.encaisser); });
  $$('[data-open-invoice]').forEach(el => el.onclick = e => { e.stopPropagation(); openInvoiceModal(el.dataset.openInvoice); });
  $$('[data-presta]').forEach(el => el.onclick = () => openPrestaForm(el.dataset.presta));

  $$('[data-task-toggle]').forEach(b => b.onclick = e => { e.stopPropagation(); toggleTask(b.dataset.taskToggle); });

  $$('[data-cal-nav]').forEach(b => b.onclick = () => {
    const v = parseInt(b.dataset.calNav, 10);
    if (v === 0) calCursor = new Date(); else calCursor = addMonths(calCursor, v);
    render();
  });

  // Demandes handlers
  $$('[data-dm-src]').forEach(b => b.onclick = () => { demandesFilter.source = b.dataset.dmSrc; render(); });
  $$('[data-dm-statut]').forEach(b => b.onclick = () => { demandesFilter.statut = b.dataset.dmStatut; render(); });
  $('[data-dm-statut-select]')?.addEventListener('change', e => { demandesFilter.statut = e.target.value; render(); });
  // Changement de statut inline sur les cards demandes
  $$('[data-dm-quick-statut]').forEach(sel => sel.onchange = e => {
    e.stopPropagation();
    const dm = Store.demande(sel.dataset.dmQuickStatut);
    if (!dm) return;
    dm.statut = e.target.value;
    dm.lastModified = Date.now();
    Store.save();
    toast(`Statut → ${DEMANDE_STATUT_LABELS[dm.statut]}`);
    updateDemandesBadge();
    render();
  });
  $$('[data-dm-quick-statut]').forEach(sel => sel.onclick = e => e.stopPropagation());
  // Bouton relancer rapide
  $$('[data-dm-relancer]').forEach(b => b.onclick = e => {
    e.stopPropagation();
    openRelancerModal(b.dataset.dmRelancer);
  });
  $$('[data-demande-open]').forEach(b => b.onclick = e => { e.stopPropagation(); openDemande(b.dataset.demandeOpen); });
  $$('[data-demande]').forEach(el => el.onclick = e => { if (e.target.closest('button')) return; openDemande(el.dataset.demande); });
  $$('[data-action="import-json"]').forEach(b => b.onclick = () => openImportJSON());
  $$('[data-action="new-demande"]').forEach(b => b.onclick = () => openManualDemandeForm());
  $$('[data-configure-intake]').forEach(b => b.onclick = () => openConfigureIntakeModal());
  updateDemandesBadge();

  $$('[data-action="new-contact"]').forEach(b => b.onclick = () => {
    const defaultType = b.dataset.defaultType || (Router.current === 'clients' ? 'client' : 'prospect');
    openContactForm(null, null, defaultType);
  });
  $$('[data-action="new-deal"]').forEach(b => b.onclick = () => openDealForm());
  $$('[data-action="new-quote"]').forEach(b => b.onclick = () => openNewQuoteFlow());
  $$('[data-action="new-task"]').forEach(b => b.onclick = () => openTaskForm());
  $$('[data-action="new-presta"]').forEach(b => b.onclick = () => openPrestaForm());

  // Prospects view handlers
  $('#btn-new-demande')?.addEventListener('click', () => openManualDemandeForm());
  $('#btn-poll-now')?.addEventListener('click', async () => {
    const btn = $('#btn-poll-now');
    if (!localStorage.getItem('v24_intake_url')) {
      return openConfigureIntakeModal();
    }
    btn.disabled = true; const oldTxt = btn.textContent; btn.textContent = 'Vérification…';
    try {
      const before = (Store.data.demandes||[]).length;
      await pollIntakeOnce();
      const after = (Store.data.demandes||[]).length;
      const nb = after - before;
      if (nb > 0) toast(`✓ ${nb} nouvelle${nb>1?'s':''} demande${nb>1?'s':''} récupérée${nb>1?'s':''}`);
      else toast('Aucune nouvelle demande côté serveur');
      const lastCheck = $('#intake-last-check');
      if (lastCheck) lastCheck.textContent = `Dernière vérification : ${new Date().toLocaleTimeString('fr-FR')}`;
    } catch (err) {
      console.error(err);
      toast('⚠️ Impossible de joindre l\'API — vérifie config');
    } finally {
      btn.disabled = false; btn.textContent = oldTxt;
    }
  });
  $$('[data-filter-statut]').forEach(b => b.onclick = () => { prospectsFilter.statut = b.dataset.filterStatut; render(); });
  $$('[data-quick-quote]').forEach(b => b.onclick = e => { e.stopPropagation(); openQuoteEditorForContact(b.dataset.quickQuote); });

  if (Router.current === 'pipeline') attachPipelineDnD();
  if (Router.current === 'quote-editor') attachQuoteEditorHandlers();
  if (Router.current === 'revenue') {
    $('#revenue-year')?.addEventListener('change', e => { revenueYear = +e.target.value; render(); });
    $('#revenue-margin-edit')?.addEventListener('click', () => {
      const v = prompt('Taux de marge estimé (%) — appliqué au CA pour calculer la marge :', Store.data.meta.marginRate || 45);
      if (v!=null && !isNaN(+v)) { Store.data.meta.marginRate = +v; Store.save(); render(); }
    });
  }

  // Google Calendar / iCal export
  $('[data-ical-export]')?.addEventListener('click', downloadIcs);
  $('[data-ical-copy]')?.addEventListener('click', copyIcsUrl);
}

/* =========================================================
   GOOGLE AGENDA / iCal INTEGRATION
========================================================= */
function icsDate(d, hour=10){
  const dt = new Date(d);
  dt.setHours(hour, 0, 0, 0);
  return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
function icsEscape(s){ return (s||'').toString().replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }

function buildIcsForDeal(deal){
  const c = Store.contact(deal.contactId);
  const title = deal.title || 'Événement Vision 24';
  const start = icsDate(deal.eventDate, 18);
  const endDt = new Date(deal.eventDate); endDt.setHours(23, 59, 0, 0);
  const end = endDt.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const desc = [
    c ? `Client : ${c.prenom} ${c.nom}` : '',
    c?.tel ? `Tél : ${c.tel}` : '',
    c?.email ? `Email : ${c.email}` : '',
    deal.horaires ? `Horaires : ${deal.horaires}` : '',
    deal.invites ? `${deal.invites} invités` : '',
    deal.eventType ? `Type : ${deal.eventType}` : '',
  ].filter(Boolean).join('\n');
  return { title, start, end, location: deal.lieu||'', description: desc };
}

function buildIcs(deals){
  const events = deals.filter(d => d.eventDate).map(d => buildIcsForDeal(d));
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vision 24//CRM//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Vision 24 · Événements',
    'X-WR-TIMEZONE:Europe/Paris',
  ];
  events.forEach((e, i) => {
    lines.push('BEGIN:VEVENT',
      `UID:v24-${i}-${Date.now()}@vision24.fr`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${e.start}`,
      `DTEND:${e.end}`,
      `SUMMARY:${icsEscape(e.title)}`,
      `LOCATION:${icsEscape(e.location)}`,
      `DESCRIPTION:${icsEscape(e.description)}`,
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function downloadIcs(){
  const ics = buildIcs(Store.data.deals);
  const blob = new Blob([ics], { type:'text/calendar' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `vision24-agenda-${new Date().toISOString().slice(0,10)}.ics`;
  a.click();
  toast('Fichier .ics téléchargé · importe-le dans Google Agenda');
}

function copyIcsUrl(){
  const ics = buildIcs(Store.data.deals);
  const dataUrl = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
  navigator.clipboard.writeText(dataUrl).then(() => {
    toast('URL copiée · colle-la dans Google Agenda → Autres agendas → À partir d\'une URL');
  }).catch(() => toast('Impossible de copier — utilise le bouton Exporter à la place'));
}

function googleCalendarUrl(deal){
  const e = buildIcsForDeal(deal);
  const gStart = e.start.replace(/([+-]\d{4})?$/, '').replace(/Z?$/, 'Z');
  const gEnd   = e.end.replace(/([+-]\d{4})?$/, '').replace(/Z?$/, 'Z');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${gStart}/${gEnd}`,
    details: e.description,
    location: e.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function toggleTask(id){
  const t = Store.data.tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  Store.save();
  toast(t.done ? '✓ Tâche terminée' : 'Tâche rouverte');
  render();
  // Si la fiche est ouverte, rafraîchit-la pour montrer le nouvel état
  if (!$('#drawer').hidden && t.contactId) openContact(t.contactId);
}

/* =========================================================
   PIPELINE DRAG & DROP
========================================================= */
function attachPipelineDnD(){
  let dragId = null;
  $$('.deal-card').forEach(card => {
    card.ondragstart = e => { dragId = card.dataset.deal; card.classList.add('is-dragging'); e.dataTransfer.effectAllowed = 'move'; };
    card.ondragend = () => { card.classList.remove('is-dragging'); dragId = null; $$('.column').forEach(c => c.classList.remove('is-drop-target')); };
  });
  $$('.column').forEach(col => {
    col.ondragover = e => { e.preventDefault(); col.classList.add('is-drop-target'); };
    col.ondragleave = () => col.classList.remove('is-drop-target');
    col.ondrop = () => {
      const stageId = col.dataset.stage;
      const deal = Store.deal(dragId);
      if (deal && deal.stage !== stageId) {
        const oldStage = Store.stage(deal.stage);
        const newStage = Store.stage(stageId);
        deal.stage = stageId;
        if (stageId === 's_won') {
          deal.probabilite = 100;
          createAcompteInvoice(deal);
          Store.addActivity({ dealId: deal.id, contactId: deal.contactId, type:'won', contenu:`Transaction gagnée · ${fmtMoney(dealValue(deal))}` });
        } else {
          Store.addActivity({ dealId: deal.id, contactId: deal.contactId, type:'stage', contenu:`Étape : ${oldStage?.nom} → ${newStage?.nom}` });
        }
        Store.save();
        const scrollLeft = document.querySelector('.pipeline')?.scrollLeft || 0;
        render();
        requestAnimationFrame(() => {
          const p = document.querySelector('.pipeline');
          if (p) p.scrollLeft = scrollLeft;
        });
      }
    };
  });
}

function nextInvoiceNumber(){
  const year = new Date().getFullYear();
  const pattern = new RegExp(`F24-${year}-(\\d+)$`);
  let maxN = 0;
  Store.data.invoices.forEach(i => {
    const m = (i.numero||'').match(pattern);
    if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
  });
  return `F24-${year}-${(maxN + 1).toString().padStart(3,'0')}`;
}

function createAcompteInvoice(deal){
  const existing = Store.data.invoices.find(i => i.dealId === deal.id && i.type === 'acompte');
  if (existing) return existing;
  const value = dealValue(deal);
  const rate = Store.data.meta.acompteDefault / 100;
  const acompte = Math.round(value * rate);
  const inv = {
    id: uid(), dealId: deal.id, contactId: deal.contactId,
    type:'acompte', numero: nextInvoiceNumber(),
    montant: acompte, statut:'en attente', createdAt: Date.now()
  };
  Store.data.invoices.push(inv);
  toast(`Facture d'acompte ${fmtMoney(acompte)} créée automatiquement`);
  return inv;
}

/* Créée à la signature du devis (envoyé) : facture d'acompte reliée au devis */
function ensureAcompteInvoiceForQuote(quote){
  // 1) Facture déjà liée à ce devis → on la met à jour
  let existing = Store.data.invoices.find(i => i.quoteId === quote.id && i.type === 'acompte');
  const totals = Store.quoteTotals(quote);
  if (existing) {
    // Actualise le montant si non encaissé (respect des paiements existants)
    if (Store.invoiceEncaisse(existing.id) === 0 && existing.montant !== totals.acompte) {
      existing.montant = totals.acompte;
    }
    return existing;
  }
  // 2) Adopte une facture orpheline du même deal (créée par un ancien flux "won" du pipeline)
  const orphan = Store.data.invoices.find(i => i.dealId === quote.dealId && !i.quoteId && i.type === 'acompte');
  if (orphan) {
    orphan.quoteId = quote.id;
    if (Store.invoiceEncaisse(orphan.id) === 0) orphan.montant = totals.acompte;
    Store.addActivity({ dealId: quote.dealId, contactId: quote.contactId, type:'quote',
      contenu:`Facture d'acompte ${orphan.numero} rattachée au devis (${fmtMoney(orphan.montant)})` });
    return orphan;
  }
  // 3) Sinon, on crée
  const inv = {
    id: uid(),
    dealId: quote.dealId, contactId: quote.contactId, quoteId: quote.id,
    type:'acompte', numero: nextInvoiceNumber(),
    montant: totals.acompte, statut:'en attente',
    createdAt: Date.now(),
    dueDate: Date.now() + 30*86400000,
  };
  Store.data.invoices.push(inv);
  Store.addActivity({ dealId: quote.dealId, contactId: quote.contactId, type:'quote',
    contenu:`Facture d'acompte ${inv.numero} créée automatiquement (${fmtMoney(inv.montant)})` });
  return inv;
}

/* Créée à l'acceptation du devis : facture de solde */
function ensureSoldeInvoiceForQuote(quote){
  let existing = Store.data.invoices.find(i => i.quoteId === quote.id && i.type === 'solde');
  const totals = Store.quoteTotals(quote);
  if (existing) {
    if (Store.invoiceEncaisse(existing.id) === 0 && existing.montant !== totals.solde) {
      existing.montant = totals.solde;
    }
    return existing;
  }
  const deal = Store.deal(quote.dealId);
  const inv = {
    id: uid(),
    dealId: quote.dealId, contactId: quote.contactId, quoteId: quote.id,
    type:'solde', numero: nextInvoiceNumber(),
    montant: totals.solde, statut:'en attente',
    createdAt: Date.now(),
    dueDate: deal?.eventDate ? new Date(deal.eventDate).getTime() : Date.now() + 60*86400000,
  };
  Store.data.invoices.push(inv);
  Store.addActivity({ dealId: quote.dealId, contactId: quote.contactId, type:'quote',
    contenu:`Facture de solde ${inv.numero} créée automatiquement (${fmtMoney(inv.montant)})` });
  return inv;
}

/* Facture finale récapitulative : générée quand acompte + solde sont tous encaissés */
function ensureFinaleInvoiceForQuote(quote){
  const existing = Store.data.invoices.find(i => i.quoteId === quote.id && i.type === 'finale');
  if (existing) return existing;
  const totals = Store.quoteTotals(quote);
  const inv = {
    id: uid(),
    dealId: quote.dealId, contactId: quote.contactId, quoteId: quote.id,
    type:'finale', numero: nextInvoiceNumber(),
    montant: totals.ttc,
    statut:'payée',
    paidAt: Date.now(),
    createdAt: Date.now(),
    isFinal: true,
  };
  Store.data.invoices.push(inv);
  Store.addActivity({ dealId: quote.dealId, contactId: quote.contactId, type:'won',
    contenu:`✓ Facture finale ${inv.numero} générée · ${fmtMoney(totals.ttc)} intégralement encaissés — prête à envoyer au client` });
  Store.save();
  toast(`✓ Facture finale ${inv.numero} générée — prête à envoyer !`);
  // Rafraîchit la fiche si ouverte
  if (!$('#drawer').hidden && quote.contactId) openContact(quote.contactId);
  else render();
  return inv;
}

/* Formulaire création facture manuelle */
function openNewInvoiceForm(contactId){
  const c = Store.contact(contactId);
  if (!c) return toast('Contact introuvable');
  const quotes = Store.quotesOf({ contactId: c.id }).sort((a,b) => b.createdAt - a.createdAt);
  const deals = Store.dealsOf(c.id);
  const today = new Date().toISOString().slice(0,10);
  const dueDefault = new Date(Date.now() + 30*86400000).toISOString().slice(0,10);

  openModal(`
    <h2 class="form-title">Nouvelle facture</h2>
    <p class="form-sub">Client : <strong>${esc(c.prenom)} ${esc(c.nom)}</strong>${c.entreprise?` · ${esc(c.entreprise)}`:''}</p>
    <form id="new-invoice-form">
      <div class="field-row">
        <div class="field">
          <label>Type</label>
          <select name="type" required>
            <option value="acompte">Acompte (30%)</option>
            <option value="solde">Solde (70%)</option>
            <option value="totale" selected>Facture totale</option>
            <option value="finale">Facture finale récapitulative</option>
            <option value="avoir">Avoir</option>
          </select>
        </div>
        <div class="field">
          <label>Montant (€)</label>
          <input type="number" step="0.01" min="0" name="montant" required placeholder="0.00">
        </div>
      </div>
      ${quotes.length ? `
        <div class="field">
          <label>Devis lié (optionnel)</label>
          <select name="quoteId">
            <option value="">— Aucun devis lié —</option>
            ${quotes.map(q => `<option value="${q.id}">${esc(q.numero)} — ${fmtMoney(Store.quoteTotals(q).ttc)} · ${esc(q.eventTitle||'')} (${esc(q.statut)})</option>`).join('')}
          </select>
          <div class="mini">Si tu choisis un devis, la facture reprend automatiquement son deal et ses prestations.</div>
        </div>
      ` : ''}
      <div class="field-row">
        <div class="field">
          <label>Statut</label>
          <select name="statut">
            <option value="en attente" selected>En attente</option>
            <option value="partiellement payée">Partiellement payée</option>
            <option value="payée">Payée</option>
          </select>
        </div>
        <div class="field">
          <label>Date d'échéance</label>
          <input type="date" name="dueDate" value="${dueDefault}">
        </div>
      </div>
      <div class="field">
        <label>Libellé (optionnel)</label>
        <input type="text" name="libelle" placeholder="Ex. Prestation événementielle mariage">
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn--ghost" data-close>Annuler</button>
        <button type="submit" class="btn btn--primary">Créer la facture</button>
      </div>
    </form>
  `);
  $('#new-invoice-form').onsubmit = e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const montant = +f.montant || 0;
    if (montant <= 0) return toast('Montant obligatoire');
    const quote = f.quoteId ? Store.quote(f.quoteId) : null;
    const inv = {
      id: uid(),
      numero: nextInvoiceNumber(),
      type: f.type,
      montant,
      statut: f.statut,
      libelle: f.libelle || '',
      contactId: c.id,
      dealId: quote?.dealId || deals[0]?.id || null,
      quoteId: quote?.id || null,
      dueDate: f.dueDate ? new Date(f.dueDate).getTime() : null,
      createdAt: Date.now(),
      paidAt: f.statut === 'payée' ? Date.now() : null,
    };
    Store.data.invoices.push(inv);
    Store.addActivity({ contactId: c.id, dealId: inv.dealId, type:'quote',
      contenu:`Facture ${inv.numero} (${inv.type}) créée manuellement · ${fmtMoney(montant)}` });
    Store.save();
    closeModal();
    toast(`✓ Facture ${inv.numero} créée`);
    openContact(c.id);
  };
}

/* Aperçu d'une facture — même style que le devis */
function openInvoicePreview(invoiceId){
  const inv = Store.invoice(invoiceId);
  if (!inv) return toast('Facture introuvable');
  const c = Store.contact(inv.contactId);
  const quote = inv.quoteId ? Store.quote(inv.quoteId) : null;
  const ent = Store.data.meta.entreprise;
  const encaisse = Store.invoiceEncaisse(inv.id);
  const restant = Store.invoiceRemaining(inv);
  const dateFR = new Date(inv.createdAt).toLocaleDateString('fr-FR');
  const dueFR = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('fr-FR') : '—';
  const paidFR = inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('fr-FR') : null;
  const num = (inv.numero||'').replace(/^F24-\d{4}-/,'');
  const isFinal = inv.type === 'finale' || inv.isFinal;
  const clientName = c ? `${c.prenom||''} ${c.nom||''}`.trim() : (quote?.clientSnapshot ? `${quote.clientSnapshot.prenom||''} ${quote.clientSnapshot.nom||''}`.trim() : '');
  const clientEmail = c?.email || quote?.clientSnapshot?.email || '';
  const clientTel = c?.tel || quote?.clientSnapshot?.tel || '';
  const clientAdresse = c?.adresse || quote?.clientSnapshot?.adresse || '';
  const clientSociete = c?.entreprise || quote?.clientSnapshot?.entreprise || '';

  const typeLabel = ({acompte:'Acompte', solde:'Solde', totale:'Facture totale', avoir:'Avoir', finale:'Facture finale récapitulative'})[inv.type] || inv.type || 'Facture';

  openModal(`
    <div class="v24-doc" id="invoice-print">
      <header class="v24-doc__head">
        <div class="v24-doc__brand">
          <img src="assets/logo-creme.png" alt="Vision 24" class="v24-doc__logo-img" crossorigin="anonymous" />
          <div class="v24-doc__coords">
            <div>${esc(ent.adresse||'')}</div>
            <div>${esc(ent.tel||'')}</div>
            <div>${esc(ent.email||'')}</div>
          </div>
        </div>
        <div class="v24-doc__title">
          <h1>${isFinal?'🏆 ':''}Facture N°${esc(num)}</h1>
          <div class="v24-doc__title-hr"></div>
          <div class="v24-doc__dates">
            <div><strong>Date :</strong> ${dateFR}</div>
            <div><strong>Type :</strong> ${esc(typeLabel)}</div>
            ${dueFR!=='—'?`<div><strong>Échéance :</strong> ${dueFR}</div>`:''}
            <div><strong>Statut :</strong> ${esc(inv.statut||'')}</div>
          </div>
        </div>
      </header>

      <div class="v24-doc__info">
        <div class="v24-doc__col">
          <h2>CLIENT</h2>
          <div class="v24-doc__col-body">
            <div><strong>${esc(clientName)}</strong></div>
            ${clientSociete?`<div>${esc(clientSociete)}</div>`:''}
            ${clientAdresse?`<div>${esc(clientAdresse)}</div>`:''}
            ${clientTel?`<div>Tél. ${esc(clientTel)}</div>`:''}
            ${clientEmail?`<div>${esc(clientEmail)}</div>`:''}
          </div>
        </div>
        <div class="v24-doc__col-sep"></div>
        <div class="v24-doc__col">
          <h2>PRESTATION</h2>
          <div class="v24-doc__col-body">
            ${quote ? `<div><strong>Devis lié :</strong> ${esc(quote.numero)}</div>` : ''}
            ${quote?.eventTitle ? `<div>${esc(quote.eventTitle)}</div>` : ''}
            ${quote?.eventDate ? `<div><strong>Date événement :</strong> ${new Date(quote.eventDate).toLocaleDateString('fr-FR')}</div>` : ''}
            ${quote?.eventLieu ? `<div>${esc(quote.eventLieu)}</div>` : ''}
          </div>
        </div>
      </div>

      <div class="v24-doc__divider"></div>

      <section class="v24-doc__body">
        <div class="v24-doc__section">DÉTAIL DE LA FACTURE</div>
        ${quote && (quote.items||[]).length ? `
          <table class="v24-inv-table">
            <thead>
              <tr>
                <th>Désignation</th>
                <th style="text-align:right">Montant HT</th>
              </tr>
            </thead>
            <tbody>
              ${(quote.items||[]).map((it, i) => {
                const total = lineTotal(it);
                const checkedOpts = (it.options||[]).filter(o => o.checked && o.prix > 0);
                return `
                  <tr>
                    <td>
                      <strong>${esc(it.nom||'')}${it.variantLabel?` — ${esc(it.variantLabel)}`:''}</strong>
                      ${checkedOpts.length ? `<div class="v24-inv-opts">${checkedOpts.map(o => `+ ${esc(o.label)}`).join(' · ')}</div>` : ''}
                    </td>
                    <td style="text-align:right;white-space:nowrap">${fmtMoney(total)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : `
          <table class="v24-inv-table">
            <tbody>
              <tr>
                <td><strong>${esc(inv.libelle || typeLabel)}</strong></td>
                <td style="text-align:right;white-space:nowrap">${fmtMoney(inv.montant||0)}</td>
              </tr>
            </tbody>
          </table>
        `}

        ${quote && inv.type === 'acompte' ? `
          <div class="v24-doc__notice">📌 Facture d'acompte (${Math.round(inv.montant / Store.quoteTotals(quote).ttc * 100)}% du devis ${esc(quote.numero)}). Solde de ${fmtMoney(Store.quoteTotals(quote).ttc - inv.montant)} à régler après l'événement.</div>
        ` : ''}
        ${quote && inv.type === 'solde' ? `
          <div class="v24-doc__notice">📌 Facture de solde (${fmtMoney(inv.montant)}). Complète l'acompte déjà versé sur le devis ${esc(quote.numero)}.</div>
        ` : ''}
        ${quote && (inv.type === 'finale' || inv.isFinal) ? `
          <div class="v24-doc__notice v24-doc__notice--final">🏆 Facture récapitulative — Devis ${esc(quote.numero)} intégralement réglé.${quote.eventDate ? ` Événement du ${new Date(quote.eventDate).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}${quote.eventLieu ? ' à ' + esc(quote.eventLieu) : ''}.` : ''} Merci ${esc(clientName)} pour votre confiance.</div>
        ` : ''}
      </section>

      <footer class="v24-doc__footer">
        <div class="v24-doc__footer-hr"></div>
        <div class="v24-doc__totals">
          <div class="v24-doc__pay">
            <h4>SUIVI DE PAIEMENT :</h4>
            <ul>
              <li>Montant facturé : <strong>${fmtMoney(inv.montant||0)}</strong></li>
              <li>Encaissé : <strong style="color:#2e7d5b">${fmtMoney(encaisse)}</strong></li>
              ${restant>0 ? `<li>Reste dû : <strong style="color:#d54848">${fmtMoney(restant)}</strong></li>` : `<li>✓ Intégralement soldée${paidFR?` le ${paidFR}`:''}</li>`}
              <li style="margin-top:8px;font-size:11px;color:#8a7a7f">RIB : IBAN à fournir · Virement bancaire ou chèque à l'ordre de Vision 24</li>
            </ul>
          </div>
          <div class="v24-doc__totals-col">
            <div class="v24-doc__tva-mention">${esc(Store.data.meta.tvaMention || 'TVA non applicable, art.293B du CGI')} :</div>
            <div class="v24-doc__total-line"><span>${fmtMoney(inv.montant||0)} TTC</span></div>
            <div class="v24-doc__total-line v24-doc__total-line--big"><span>${fmtMoney(inv.montant||0)} TTC</span></div>
            ${restant===0?`<div class="v24-doc__acompte-line" style="color:#2e7d5b;font-weight:600">✓ PAYÉE</div>`:`<div class="v24-doc__acompte-line">Reste à régler : <strong>${fmtMoney(restant)}</strong></div>`}
          </div>
        </div>
      </footer>
    </div>

    <div class="form-actions" style="align-items:center">
      <button class="btn btn--ghost" data-close>Fermer</button>
      <div style="flex:1"></div>
      <button class="btn btn--secondary" data-invoice-edit-here="${inv.id}">✎ Modifier</button>
      ${restant===0 ? `
        <button class="btn btn--secondary" data-inv-dl="pdf">📥 PDF</button>
        <button class="btn btn--secondary" data-inv-dl="png">🖼 PNG</button>
        <button class="btn btn--secondary" data-inv-dl="jpg">📷 JPG</button>
      ` : ''}
      ${restant>0?`<button class="btn btn--primary" data-invoice-encaisser-here="${inv.id}">+ Encaisser</button>`:''}
    </div>
  `);
  $('[data-invoice-edit-here]')?.addEventListener('click', () => { closeModal(); openInvoiceModal(inv.id); });
  $('[data-invoice-encaisser-here]')?.addEventListener('click', () => { closeModal(); openEncaisserModal(inv.id); });
  $$('[data-inv-dl]').forEach(b => b.onclick = () => downloadInvoice(inv, b.dataset.invDl, b));
}

async function downloadInvoice(invoice, format, btn){
  const node = document.getElementById('invoice-print');
  if (!node) return;
  if (typeof html2pdf === 'undefined') {
    toast('Chargement de l\'exporteur… réessaie dans 2 s');
    return;
  }
  const originalLabel = btn?.textContent;
  if (btn) { btn.disabled = true; btn.textContent = 'Génération…'; }
  const filename = `Facture-Vision24-${(invoice.numero||'').replace(/[^A-Za-z0-9-]/g,'')}`;
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;top:-99999px;left:-99999px;width:210mm;background:#faf4ee;overflow:hidden;';
  const clone = node.cloneNode(true);
  clone.classList.add('is-exporting');
  clone.style.cssText += ';min-width:unset;width:210mm;border-radius:0 !important;box-shadow:none !important;overflow:hidden;margin:0;';
  wrap.appendChild(clone);
  document.body.appendChild(wrap);
  await new Promise(r => setTimeout(r, 120));
  try {
    if (format === 'pdf') {
      // Capture haute résolution (4x DPI), puis insertion nette dans PDF A4
      const canvas = await html2canvas(clone, {
        scale: 4, useCORS: true, backgroundColor: '#faf4ee', logging: false,
        windowWidth: clone.offsetWidth, windowHeight: clone.offsetHeight,
      });
      const jsPDFCtor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF || (typeof jsPDF !== 'undefined' ? jsPDF : null);
      if (jsPDFCtor) {
        const pdf = new jsPDFCtor({ unit:'mm', format:'a4', orientation:'portrait', compress:false });
        const A4_W = 210, A4_H = 297;
        const canvasRatio = canvas.width / canvas.height;
        const pageRatio = A4_W / A4_H;
        let imgW, imgH, offsetX, offsetY;
        if (canvasRatio > pageRatio) {
          imgW = A4_W; imgH = A4_W / canvasRatio;
          offsetX = 0; offsetY = (A4_H - imgH) / 2;
        } else {
          imgH = A4_H; imgW = A4_H * canvasRatio;
          offsetX = (A4_W - imgW) / 2; offsetY = 0;
        }
        // PNG lossless pour rester net (pas de compression JPEG)
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgW, imgH, undefined, 'NONE');
        pdf.save(filename + '.pdf');
      } else {
        // Fallback html2pdf haut niveau
        await html2pdf().set({
          margin: 0,
          filename: filename + '.pdf',
          image: { type: 'png', quality: 1 },
          html2canvas: { scale: 4, useCORS: true, backgroundColor: '#faf4ee', logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: false },
        }).from(clone).save();
      }
    } else {
      const canvas = await html2canvas(clone, { scale: 4, useCORS: true, backgroundColor: '#faf4ee', logging: false });
      const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mime, format === 'jpg' ? 0.95 : 1);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename + '.' + format;
      a.click();
    }
    toast('✓ Facture téléchargée');
  } catch (err) {
    console.error(err);
    toast('Erreur pendant la génération');
  } finally {
    wrap.remove();
    if (btn) { btn.disabled = false; btn.textContent = originalLabel; }
  }
}

function deleteInvoice(invoiceId){
  const inv = Store.invoice(invoiceId);
  if (!inv) return toast('Facture introuvable');
  const encaisse = Store.invoiceEncaisse(inv.id);
  if (encaisse > 0 && inv.statut === 'payée' && !inv.isFinal) {
    return toast('⚠️ Facture déjà encaissée — impossible à supprimer');
  }
  if (!confirm(`Supprimer définitivement la facture ${inv.numero} ?`)) return;
  Store.data.invoices = Store.data.invoices.filter(x => x.id !== inv.id);
  Store.addActivity({ contactId: inv.contactId, dealId: inv.dealId, type: 'note', contenu: `Facture ${inv.numero} supprimée` });
  Store.save();
  toast(`✓ Facture ${inv.numero} supprimée`);
  if (!$('#drawer').hidden && inv.contactId) openContact(inv.contactId); else render();
}

/* Modale d'envoi de la facture finale au client */
function openSendFinalInvoiceModal(invoiceId){
  const inv = Store.invoice(invoiceId);
  if (!inv) return toast('Facture introuvable');
  const c = Store.contact(inv.contactId);
  const quote = inv.quoteId ? Store.quote(inv.quoteId) : null;
  const clientEmail = c?.email || quote?.clientSnapshot?.email || '';
  const clientName = c ? `${c.prenom} ${c.nom}` : (quote?.clientSnapshot ? `${quote.clientSnapshot.prenom||''} ${quote.clientSnapshot.nom||''}`.trim() : '');
  const sujet = `Facture finale ${inv.numero} — Vision 24`;
  const corps = `Bonjour ${clientName || ''},

Vous trouverez ci-joint votre facture finale n°${inv.numero} pour un montant de ${fmtMoney(inv.montant)}, intégralement soldée.

Nous vous remercions pour votre confiance et espérons vous retrouver bientôt pour de nouveaux événements.

Anthony
Vision 24
ap.vision24@outlook.fr`;

  openModal(`
    <h2 class="form-title">🏆 Envoyer la facture finale</h2>
    <p class="form-sub">Facture ${esc(inv.numero)} · ${fmtMoney(inv.montant)} · intégralement soldée</p>
    <form id="send-final-form">
      <div class="field"><label>Destinataire</label><input name="to" type="email" value="${esc(clientEmail)}" required></div>
      <div class="field"><label>Sujet</label><input name="sujet" value="${esc(sujet)}" required></div>
      <div class="field"><label>Message</label><textarea name="corps" rows="10" style="font-family:inherit">${esc(corps)}</textarea></div>
      <div class="mini" style="margin-top:8px;color:var(--muted)">
        La facture s'ouvre dans le client email par défaut. Configure l'API Hostinger pour un envoi direct via ap.vision24@outlook.fr.
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn--ghost" data-close>Annuler</button>
        <button type="submit" class="btn btn--primary">Envoyer</button>
      </div>
    </form>
  `);
  $('#send-final-form').onsubmit = e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    // Fallback mailto:
    const body = encodeURIComponent(f.corps);
    const subject = encodeURIComponent(f.sujet);
    window.location.href = `mailto:${f.to}?subject=${subject}&body=${body}`;
    Store.addActivity({ contactId: inv.contactId, dealId: inv.dealId, type:'email',
      contenu:`Facture finale ${inv.numero} envoyée à ${f.to}` });
    inv.sentAt = Date.now();
    Store.save();
    closeModal();
    toast('✉️ Facture finale envoyée');
  };
}

/* Nettoyage : supprime les factures orphelines (0 €, sans quoteId, jamais encaissées) */
function cleanupOrphanInvoices(){
  const before = Store.data.invoices.length;
  Store.data.invoices = Store.data.invoices.filter(i => {
    const isOrphan = !i.quoteId && (!i.montant || i.montant === 0) && Store.invoiceEncaisse(i.id) === 0;
    return !isOrphan;
  });
  const removed = before - Store.data.invoices.length;
  if (removed > 0) {
    Store.save();
    toast(`✓ ${removed} facture${removed>1?'s':''} orpheline${removed>1?'s':''} supprimée${removed>1?'s':''}`);
  } else {
    toast('Aucune facture orpheline à supprimer');
  }
  render();
}
window.cleanupOrphanInvoices = cleanupOrphanInvoices;

/* Point central : appelée à chaque changement de statut de devis */
/* =========================================================
   CHECKLIST PRÉPARATION — auto-générée à la signature du devis
   ---------------------------------------------------------
   Chaque prestation a sa propre checklist de préparation :
   ingrédients à commander, maquettes à créer, tests matériel,
   avec des échéances calculées depuis la date de l'événement.
========================================================= */
const PREP_TEMPLATES = {
  photobooth: [
    { titre: 'Créer maquette visuelle (écran + cadres photos)',            daysBefore: 21 },
    { titre: 'Faire valider maquette par le client',                        daysBefore: 14 },
    { titre: 'Charger consommables : papier + encre (400 tirages)',        daysBefore: 3 },
    { titre: 'Test matériel : reflex, écran tactile, éclairage LED',       daysBefore: 2 },
  ],
  boxmagazine: [
    { titre: 'Créer maquette Box Magazine personnalisée',                   daysBefore: 21 },
    { titre: 'Valider design magazine avec le client',                      daysBefore: 14 },
    { titre: 'Impression du visuel structure 2M × 2M',                     daysBefore: 7 },
    { titre: 'Charger consommables : papier + encre (400 tirages)',        daysBefore: 3 },
    { titre: 'Test matériel : éclairage pro + impression',                  daysBefore: 2 },
  ],
  boxvogue: [
    { titre: 'Direction artistique Cabine Vogue (nom soirée, sponsors)',    daysBefore: 21 },
    { titre: 'Valider ambiance LED + branding avec le client',              daysBefore: 14 },
    { titre: 'Personnalisation façade box',                                 daysBefore: 7 },
    { titre: 'Test matériel : LED, éclairage, écran',                       daysBefore: 2 },
  ],
  videobooth360: [
    { titre: 'Personnaliser habillage vidéo 360°',                          daysBefore: 14 },
    { titre: 'Configurer musiques + effets Slow Motion',                    daysBefore: 7 },
    { titre: 'Test plateforme + bras motorisé + structure gonflable',       daysBefore: 3 },
  ],
  porte_cles: [
    { titre: 'Commander lot de porte-clés simili cuir (quantité selon nb invités)', daysBefore: 14 },
    { titre: 'Charger machine à personnalisation + coloris client',         daysBefore: 3 },
  ],
  // Bars gourmands
  bar_hotdogs: [
    { titre: 'Commander mini pains à hot-dog + saucisses (quantité selon invités)', daysBefore: 5 },
    { titre: 'Vérifier stock : oignons frits, ketchup, mayo, moutarde',    daysBefore: 3 },
    { titre: 'Contrôle plaque chauffe-saucisses + chauffe-pain',            daysBefore: 2 },
    { titre: 'Brief chef sur les allergies éventuelles',                    daysBefore: 1 },
  ],
  bar_chocolat: [
    { titre: 'Préparer visuel personnalisé pour impression sur mousse (logo/prénoms)', daysBefore: 10 },
    { titre: 'Faire valider visuel avec le client',                         daysBefore: 7 },
    { titre: 'Commander chocolat premium + poudre de lait',                 daysBefore: 5 },
    { titre: 'Charger imprimante alimentaire (papier comestible)',          daysBefore: 3 },
    { titre: 'Test machine à chocolat chaud + imprimante',                  daysBefore: 2 },
  ],
  bar_pancake_gaufres: [
    { titre: 'Commander farine + œufs + lait + sucre + levure (quantité invités)', daysBefore: 5 },
    { titre: 'Vérifier coulis : Nutella, caramel, miel, spéculoos',        daysBefore: 3 },
    { titre: 'Préparer toppings : fruits frais, chantilly, M&M\'s, Kinder', daysBefore: 2 },
    { titre: 'Test gaufrier + machine à pancakes',                          daysBefore: 1 },
  ],
  bar_crepes: [
    { titre: 'Commander farine + œufs + lait + beurre (quantité invités)',  daysBefore: 3 },
    { titre: 'Préparer pâte à crêpes artisanale',                           daysBefore: 1 },
    { titre: 'Vérifier garnitures : caramel, confitures, Nutella, chantilly, fruits', daysBefore: 2 },
    { titre: 'Contrôle crêpière professionnelle',                            daysBefore: 1 },
  ],
  bar_boissons_latte: [
    { titre: 'Préparer visuel latte art (logo/message client)',             daysBefore: 10 },
    { titre: 'Faire valider visuel',                                         daysBefore: 7 },
    { titre: 'Commander café pro + thés premium + chocolat',                daysBefore: 3 },
    { titre: 'Charger imprimante alimentaire',                              daysBefore: 2 },
  ],
  bar_popcorn: [
    { titre: 'Commander pochettes signature personnalisées (logo/prénoms)', daysBefore: 10 },
    { titre: 'Commander maïs à popcorn + sucre + sel',                      daysBefore: 5 },
    { titre: 'Test machine à popcorn',                                       daysBefore: 2 },
  ],
  // DJ
  dj_pro: [
    { titre: 'Rencontre / call avec client pour playlist personnalisée',    daysBefore: 21 },
    { titre: 'Valider playlist finale',                                      daysBefore: 7 },
    { titre: 'Test sound system + éclairage LED + machine à fumée',         daysBefore: 2 },
    { titre: 'Test micro + platines',                                        daysBefore: 1 },
  ],
  // Captation vidéo
  captation_mariage: [
    { titre: 'RDV préparation avec les mariés (déroulé, plans clés, moments souhaités)', daysBefore: 21 },
    { titre: 'Vérifier autorisations drone + météo prévue',                 daysBefore: 7 },
    { titre: 'Test caméras 4K, stabilisateurs, micros cravate',             daysBefore: 3 },
    { titre: 'Charger batteries + cartes SD (min. 3× redondance)',           daysBefore: 1 },
  ],
  captation_pro: [
    { titre: 'Brief événement avec le client (branding, moments clés)',     daysBefore: 7 },
    { titre: 'Test caméras 4K + son + éclairage',                            daysBefore: 3 },
    { titre: 'Charger batteries + cartes SD',                                daysBefore: 1 },
  ],
  drone: [
    { titre: 'Vérifier autorisations DGAC + météo prévue',                  daysBefore: 7 },
    { titre: 'Test drone + gimbal',                                          daysBefore: 3 },
    { titre: 'Charger batteries drone (min. 4)',                             daysBefore: 1 },
  ],
  // Packs signature
  pack01: [
    { titre: 'PACK 01 · Maquette Box Magazine + Photobooth',                daysBefore: 21 },
    { titre: 'PACK 01 · Valider maquettes avec le client',                  daysBefore: 14 },
    { titre: 'PACK 01 · Commander porte-clés simili cuir (30 personnes)',   daysBefore: 14 },
    { titre: 'PACK 01 · Charger consommables Photobooth + Box',              daysBefore: 3 },
    { titre: 'PACK 01 · Test complet matériel',                              daysBefore: 2 },
  ],
  pack02: [
    { titre: 'PACK 02 · Maquettes Vidéobooth 360° + Photobooth + Box',      daysBefore: 21 },
    { titre: 'PACK 02 · Valider maquettes + habillage vidéo',                daysBefore: 14 },
    { titre: 'PACK 02 · Charger consommables 3 prestations',                 daysBefore: 3 },
    { titre: 'PACK 02 · Test complet matériel',                              daysBefore: 2 },
  ],
  pack03: [
    { titre: 'PACK 03 · RDV mariés (déroulé cérémonie + soirée)',            daysBefore: 21 },
    { titre: 'PACK 03 · Maquette Photobooth mariage',                        daysBefore: 14 },
    { titre: 'PACK 03 · Autorisations drone + météo',                        daysBefore: 7 },
    { titre: 'PACK 03 · Test caméras 4K + drone + Photobooth',               daysBefore: 3 },
    { titre: 'PACK 03 · Charger batteries + cartes SD + consommables',       daysBefore: 1 },
  ],
  pack04: [
    { titre: 'PACK 04 · RDV client (déroulé + playlist DJ)',                 daysBefore: 21 },
    { titre: 'PACK 04 · Maquette Photobooth + habillage vidéo',              daysBefore: 14 },
    { titre: 'PACK 04 · Autorisations drone',                                daysBefore: 10 },
    { titre: 'PACK 04 · Test caméras + DJ + Photobooth + drone',             daysBefore: 3 },
    { titre: 'PACK 04 · Charger tout le matériel',                           daysBefore: 1 },
  ],
  // Consommables : rien à préparer (déjà servi)
  consommables: [],
};

/* Génère toutes les tâches de préparation pour un devis accepté */
function generatePrepTasksForQuote(quote){
  const deal = Store.deal(quote.dealId);
  const eventDate = deal?.eventDate ? new Date(deal.eventDate).getTime() : (Date.now() + 30*86400000);
  const contactId = quote.contactId;
  const dealId = quote.dealId;
  const created = [];

  (quote.items||[]).forEach(item => {
    const pid = item.prestationId;
    const template = PREP_TEMPLATES[pid];
    if (!template || !template.length) return;

    template.forEach(spec => {
      // Évite les doublons : si une tâche prep identique existe déjà pour cette prestation + ce deal, on skip
      const already = Store.data.tasks.some(t =>
        t.dealId === dealId && t.prestationId === pid && t.titre === spec.titre && !t.done
      );
      if (already) return;
      const due = eventDate - spec.daysBefore * 86400000;
      const task = {
        id: uid(),
        titre: spec.titre,
        contactId,
        dealId,
        quoteId: quote.id,
        prestationId: pid,
        category: 'prep',
        due: Math.max(due, Date.now()), // jamais dans le passé
        done: false,
        createdAt: Date.now(),
      };
      Store.data.tasks.push(task);
      created.push(task);
    });
  });
  return created;
}

function onQuoteStatusChanged(quote, oldStatus, newStatus){
  if (oldStatus === newStatus) return;
  const deal = Store.deal(quote.dealId);

  if (newStatus === 'envoyé') {
    ensureAcompteInvoiceForQuote(quote);
    if (deal && ['s_received','s_quote_p'].includes(deal.stage)) deal.stage = 's_quote_s';
    quote.sentAt = quote.sentAt || Date.now();
    toast(`Devis envoyé · facture d'acompte ${fmtMoney(Store.quoteTotals(quote).acompte)} générée`);
  }

  if (newStatus === 'accepté') {
    ensureAcompteInvoiceForQuote(quote);
    ensureSoldeInvoiceForQuote(quote);
    if (deal) { deal.stage = 's_billing'; deal.probabilite = 100; }
    quote.acceptedAt = quote.acceptedAt || Date.now();
    // 🎯 AUTO-CONVERSION Prospect → Client
    const contact = Store.contact(quote.contactId);
    let converted = false;
    if (contact && contact.type === 'prospect') {
      contact.type = 'client';
      contact.convertedAt = Date.now();
      converted = true;
      Store.addActivity({ contactId: contact.id, dealId: quote.dealId, type:'won',
        contenu:`Prospect converti en client (devis ${quote.numero} signé)` });
    }
    // 🎯 Génère la checklist de préparation par prestation
    const prepTasks = generatePrepTasksForQuote(quote);
    Store.addActivity({ dealId: quote.dealId, contactId: quote.contactId, type:'won',
      contenu:`Devis ${quote.numero} accepté · factures + ${prepTasks.length} tâches de préparation générées` });
    toast(converted
      ? `✓ Client créé · factures + ${prepTasks.length} tâches de prépa générées`
      : `Devis accepté · factures + ${prepTasks.length} tâches de prépa générées`);
  }

  Store.save();
}

/* =========================================================
   QUOTE EDITOR — handlers, catalog picker, save
========================================================= */
function attachQuoteEditorHandlers(){
  const persist = () => { QE.updatedAt = Date.now(); Store.save(); };
  const rerenderItems = () => {
    $('#qe-items').innerHTML = renderQuoteItems(QE);
    bindItemHandlers();
    updateRecap();
  };
  const updateRecap = () => {
    const totals = Store.quoteTotals(QE);
    const recap = $('.qe__recap');
    if (!recap) return;
    // simple approach: full re-render
    render();
  };

  $('[data-qe-back]')?.addEventListener('click', () => Router.go('quotes'));
  $('[data-qe-preview]')?.addEventListener('click', () => openQuotePreview(QE.id));
  $('[data-qe-send]')?.addEventListener('click', () => openSendEmailModal(QE.id));
  $('[data-qe-accept]')?.addEventListener('click', () => acceptQuote(QE.id));

  // Field bindings (all inputs with data-qe)
  $$('[data-qe]').forEach(el => {
    el.oninput = () => {
      const k = el.dataset.qe;
      let v = el.value;
      if (['remise','remisePercent','tvaRate','acompteRate','eventInvites'].includes(k)) v = +v || 0;
      const old = QE[k];
      QE[k] = v;
      persist();
      if (k === 'statut' && old !== v) { onQuoteStatusChanged(QE, old, v); render(); return; }
      if (['remise','remisePercent','tvaRate','acompteRate'].includes(k)) updateRecap();
    };
    if (el.tagName === 'SELECT') el.onchange = el.oninput;
  });

  // Items
  bindItemHandlers();

  // Add buttons
  $('#qe-add-catalog')?.addEventListener('click', () => openCatalogPicker());
  $('#qe-add-catalog-empty')?.addEventListener('click', () => openCatalogPicker());
  $('#qe-add-custom')?.addEventListener('click', () => addCustomLine());

  function bindItemHandlers(){
    $$('[data-item]').forEach(row => {
      const i = +row.dataset.item;
      row.querySelectorAll('[data-item-field]').forEach(el => {
        el.oninput = () => {
          const k = el.dataset.itemField;
          let v = el.value;
          if (['qte','prix'].includes(k)) v = +v || 0;
          QE.items[i][k] = v;
          persist();
          if (['qte','prix'].includes(k)) rerenderItems();
        };
      });
      row.querySelectorAll('[data-item-opt]').forEach(cb => {
        cb.onchange = () => {
          const oi = +cb.dataset.itemOpt;
          QE.items[i].options[oi].checked = cb.checked;
          persist();
          rerenderItems();
        };
      });
      row.querySelector('[data-item-remove]')?.addEventListener('click', () => {
        QE.items.splice(i, 1);
        persist();
        rerenderItems();
      });
    });
  }
}

function openCatalogPicker(){
  let query = '';
  let cat = 'all';
  const cats = ['all', ...new Set(Store.data.prestations.filter(p => p.actif !== false).map(p => p.categorie))];

  const drawer = () => {
    let list = Store.data.prestations.filter(p => p.actif !== false);
    if (cat !== 'all') list = list.filter(p => p.categorie === cat);
    if (query) {
      const qq = query.toLowerCase();
      list = list.filter(p => (p.nom + ' ' + p.description + ' ' + p.categorie).toLowerCase().includes(qq));
    }
    return `
      <div style="padding:0">
        <div style="position:sticky;top:0;background:var(--white);padding:24px 32px 12px;border-bottom:1px solid var(--line);z-index:2">
          <h2 style="font-family:var(--font-serif);font-size:26px;color:var(--bordeaux);margin:0">Catalogue Vision <em>24</em></h2>
          <div class="mini" style="margin-top:4px">${Store.data.prestations.length} prestations disponibles · descriptions et prix inclus</div>
          <input id="cat-search" placeholder="🔎 Rechercher une prestation (photobooth, pancakes, box magazine…)"
            value="${esc(query)}"
            style="width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:10px;margin-top:12px;font-size:14px" autofocus>
          <div class="toolbar" style="margin-top:10px;margin-bottom:0;flex-wrap:wrap">
            ${cats.map(c => `<button class="chip ${cat===c?'is-active':''}" data-cat-pick="${esc(c)}">${c==='all'?'Toutes':esc(c)}</button>`).join('')}
          </div>
        </div>

        <div style="padding:16px 32px 32px">
          ${list.length ? list.map(p => `
            <div class="cat-card" data-cat-add="${p.id}">
              <div style="flex:1">
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                  <span class="tag">${esc(p.categorie)}</span>
                  <strong style="font-family:var(--font-serif);font-size:18px;color:var(--bordeaux)">${esc(p.nom)}</strong>
                </div>
                <p style="font-size:12.5px;color:var(--ink-2);margin:6px 0 8px;line-height:1.45">${esc(p.description||'')}</p>
                ${(p.variants||[]).length ? `
                  <div style="display:flex;gap:6px;flex-wrap:wrap">
                    ${p.variants.map((v,vi) => `<button class="chip" data-add-variant="${p.id}|${vi}"><strong>${esc(v.label)}</strong> · ${fmtMoney(v.prix)}</button>`).join('')}
                  </div>
                ` : ''}
                ${(p.options||[]).length ? `<div class="mini" style="margin-top:8px">${p.options.length} option${p.options.length>1?'s':''} disponible${p.options.length>1?'s':''}</div>` : ''}
              </div>
            </div>
          `).join('') : '<div class="list__empty">Aucune prestation trouvée.</div>'}
        </div>
      </div>
    `;
  };

  openDrawer(drawer());
  const bind = () => {
    $('#cat-search').oninput = e => { query = e.target.value; refresh(); };
    $$('[data-cat-pick]').forEach(b => b.onclick = () => { cat = b.dataset.catPick; refresh(); });
    $$('[data-cat-add]').forEach(el => el.onclick = e => {
      if (e.target.closest('[data-add-variant]')) return;
      const p = Store.presta(el.dataset.catAdd);
      addPrestationToQuote(p, 0);
      closeDrawer();
    });
    $$('[data-add-variant]').forEach(b => b.onclick = e => {
      e.stopPropagation();
      const [pid, vi] = b.dataset.addVariant.split('|');
      const p = Store.presta(pid);
      addPrestationToQuote(p, +vi);
      closeDrawer();
    });
  };
  const refresh = () => {
    const cur = $('#cat-search')?.value;
    $('#drawer-body').innerHTML = drawer();
    if (cur !== undefined) { const inp = $('#cat-search'); if (inp) { inp.value = cur; inp.focus(); inp.setSelectionRange(cur.length, cur.length); } }
    bind();
  };
  bind();
}

function addPrestationToQuote(p, variantIndex){
  if (!p || !QE) return;
  const v = (p.variants||[])[variantIndex] || (p.variants||[])[0] || { label:'', prix:0 };
  QE.items.push({
    prestationId: p.id,
    nom: p.nom,
    variantLabel: v.label,
    description: p.description,
    qte: 1,
    prix: v.prix,
    options: (p.options||[]).map(o => ({ label:o.label, prix:o.prix||0, checked: !!o.incluseParDefaut }))
  });
  QE.updatedAt = Date.now();
  Store.save();
  toast(`${p.nom} ajoutée`);
  render();
}

function addCustomLine(){
  QE.items.push({ prestationId:null, nom:'Prestation personnalisée', variantLabel:'', description:'', qte:1, prix:0, options:[] });
  QE.updatedAt = Date.now();
  Store.save();
  render();
}

/* ---------- Accept quote / auto-invoice ---------- */
function acceptQuote(qid){
  const q = Store.quote(qid);
  if (!q) return;
  const old = q.statut;
  q.statut = 'accepté';
  onQuoteStatusChanged(q, old, 'accepté');
  render();
}

/* =========================================================
   QUOTE PREVIEW (impression / PDF)
========================================================= */
function openQuotePreview(qid){
  const q = Store.quote(qid);
  if (!q) return;
  const totals = Store.quoteTotals(q);
  const ent = Store.data.meta.entreprise;
  const meta = Store.data.meta;
  const dateFR = new Date(q.createdAt).toLocaleDateString('fr-FR');
  const validUntil = new Date(q.createdAt); validUntil.setDate(validUntil.getDate()+30);

  const clientName = [q.clientSnapshot.prenom, q.clientSnapshot.nom].filter(Boolean).join(' ');
  const eventDateFR = q.eventDate ? new Date(q.eventDate).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).replace(/^./, c => c.toUpperCase()) : '';

  openModal(`
    <div class="v24-doc" id="quote-print">

      <!-- ============ HEADER BORDEAUX ============ -->
      <header class="v24-doc__head">
        <div class="v24-doc__brand">
          <img src="assets/logo-creme.png" alt="Vision 24" class="v24-doc__logo-img" crossorigin="anonymous" />
          <div class="v24-doc__coords">
            <div>${esc(ent.adresse||'')}</div>
            <div>${esc(ent.tel||'')}</div>
            <div>${esc(ent.email||'')}</div>
          </div>
        </div>
        <div class="v24-doc__title">
          <h1>Devis N°${esc((q.numero||'').replace(/^V24-\d{4}-/,''))}</h1>
          <div class="v24-doc__title-hr"></div>
          <div class="v24-doc__dates">
            <div><strong>Date :</strong> ${dateFR}</div>
            <div><strong>Valable jusqu'au :</strong> ${validUntil.toLocaleDateString('fr-FR')}</div>
          </div>
        </div>
      </header>

      <!-- ============ CLIENT + INFO BLOCK ============ -->
      <section class="v24-doc__info">
        <div class="v24-doc__col">
          <h2>CLIENT :</h2>
          <div class="v24-doc__col-body">
            <div><strong>${esc(clientName)}</strong></div>
            ${q.clientSnapshot.entreprise ? `<div>${esc(q.clientSnapshot.entreprise)}</div>` : ''}
            ${q.clientSnapshot.tel ? `<div>${esc(q.clientSnapshot.tel)}</div>` : ''}
            ${q.clientSnapshot.email ? `<div>${esc(q.clientSnapshot.email)}</div>` : ''}
          </div>
        </div>
        <div class="v24-doc__col-sep"></div>
        <div class="v24-doc__col">
          <h2>INFORMATION :</h2>
          <div class="v24-doc__col-body">
            ${eventDateFR ? `<div><strong>Date :</strong> ${eventDateFR}</div>` : ''}
            ${q.eventLieu ? `<div><strong>Lieu :</strong> ${esc(q.eventLieu)}</div>` : ''}
            ${q.clientSnapshot.adresse ? `<div><strong>Adresse :</strong> ${esc(q.clientSnapshot.adresse)}</div>` : ''}
            ${q.eventInvites ? `<div><strong>Invités :</strong> environ ${q.eventInvites} personnes</div>` : ''}
          </div>
        </div>
      </section>

      <div class="v24-doc__divider"></div>

      <!-- ============ PRESTATIONS ============ -->
      <section class="v24-doc__body">
        <h2 class="v24-doc__section">DESCRIPTION DU PROJET :</h2>

        ${q.items.map((it, i) => {
          const total = lineTotal(it);
          const originalPrice = it.prixOriginal && it.prixOriginal > it.prix ? it.prixOriginal : null;
          const remiseInfo = originalPrice ? `<span class="v24-strike">${fmtMoney(originalPrice)}</span> ${originalPrice ? `<span class="v24-arrow">→</span> ` : ''}<strong>${fmtMoney(total)}</strong>` : `<strong>${fmtMoney(total)}</strong>`;
          const deroulement = deroulementFor(it);
          return `
            <article class="v24-item">
              <h3>${i+1}) ${esc(it.nom||'')}${it.variantLabel?` — ${esc(it.variantLabel)}`:''} : <span class="v24-item__price">(${remiseInfo})</span></h3>

              ${(q.eventDate || q.eventHoraires) ? `
                <div class="v24-item__meta">
                  ${q.eventDate?`Date de la location : ${new Date(q.eventDate).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}`:''}
                  ${q.eventHoraires?` — Horaire : ${esc(q.eventHoraires)}`:''}
                </div>
              ` : ''}

              ${it.description ? `
                <div class="v24-item__section-lbl">Prestation</div>
                <div class="v24-item__desc">${nl2br(it.description)}</div>
              ` : ''}

              ${deroulement ? `
                <div class="v24-item__section-lbl">Déroulement</div>
                <ul class="v24-list v24-list--deroulement">
                  ${deroulement.map(line => `<li>${esc(line)}</li>`).join('')}
                </ul>
              ` : ''}
            </article>`;
        }).join('')}
      </section>

      <!-- ============ FOOTER PAIEMENT ============ -->
      <footer class="v24-doc__footer">
        <div class="v24-doc__footer-hr"></div>

        <div class="v24-doc__totals">
          <div class="v24-doc__pay">
            <h4>INFORMATION DE PAIEMENT :</h4>
            <ul>
              <li>Condition de paiement à la réception de la facture.</li>
              <li>${totals.acompteRate}% d'acompte à la signature du devis et validation de la prestation.</li>
            </ul>
          </div>
          <div class="v24-doc__totals-col">
            <div class="v24-doc__tva-mention">${esc(meta.tvaMention || 'TVA non applicable, art.293B du CGI')} :</div>
            <div class="v24-doc__total-line"><span>${fmtMoney(totals.ttc)} TTC</span></div>
            <div class="v24-doc__total-line v24-doc__total-line--big"><span>${fmtMoney(totals.ttc)} TTC</span></div>
            <div class="v24-doc__acompte-line">Acompte ${totals.acompteRate}% à la signature : <strong>${fmtMoney(totals.acompte)}</strong></div>
          </div>
        </div>

        <div class="v24-doc__signature">
          <div>
            <div class="v24-doc__signature-line"></div>
            <div class="v24-doc__signature-label">Signature</div>
          </div>
          <div>
            <div class="v24-doc__signature-line"></div>
            <div class="v24-doc__signature-label">Date de signature</div>
          </div>
        </div>
      </footer>
    </div>

    <div class="form-actions" style="align-items:center">
      <button class="btn btn--ghost" data-close>Fermer</button>
      <div style="flex:1"></div>
      <button class="btn btn--secondary" data-dl="pdf">📥 Télécharger PDF</button>
      <button class="btn btn--secondary" data-dl="png">🖼 PNG</button>
      <button class="btn btn--secondary" data-dl="jpg">📷 JPG</button>
      <button class="btn btn--primary" data-preview-send="${q.id}">Envoyer par email</button>
    </div>
  `);
  $('[data-preview-send]')?.addEventListener('click', () => { closeModal(); openSendEmailModal(q.id); });
  $$('[data-dl]').forEach(b => b.onclick = () => downloadQuote(q, b.dataset.dl, b));
}

/* ---------- Download / Export (html2pdf.js) ---------- */
async function downloadQuote(quote, format, btn){
  const node = document.getElementById('quote-print');
  if (!node) return;
  if (typeof html2pdf === 'undefined' || typeof html2canvas === 'undefined') {
    toast('Chargement de l\'exporteur… réessaie dans 2 s');
    return;
  }
  const originalLabel = btn?.textContent;
  if (btn) { btn.disabled = true; btn.textContent = 'Génération…'; }

  const filename = `Devis-Vision24-${(quote.numero||'').replace(/[^A-Za-z0-9-]/g,'')}`;

  // Clone hors écran, largeur A4
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;top:-99999px;left:-99999px;width:210mm;background:#faf4ee;overflow:hidden;';
  const clone = node.cloneNode(true);
  clone.classList.add('is-exporting');
  clone.style.cssText += ';min-width:unset;width:210mm;border-radius:0 !important;box-shadow:none !important;overflow:hidden;margin:0;';
  wrap.appendChild(clone);
  document.body.appendChild(wrap);
  await new Promise(r => setTimeout(r, 120)); // layout stable

  try {
    if (format === 'pdf') {
      // Capture haute résolution (4x DPI), puis insertion nette dans PDF A4
      const canvas = await html2canvas(clone, {
        scale: 4, useCORS: true, backgroundColor: '#faf4ee', logging: false,
        windowWidth: clone.offsetWidth, windowHeight: clone.offsetHeight,
      });
      const jsPDFCtor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF || (typeof jsPDF !== 'undefined' ? jsPDF : null);
      if (jsPDFCtor) {
        const pdf = new jsPDFCtor({ unit:'mm', format:'a4', orientation:'portrait', compress:false });
        const A4_W = 210, A4_H = 297;
        const canvasRatio = canvas.width / canvas.height;
        const pageRatio = A4_W / A4_H;
        let imgW, imgH, offsetX, offsetY;
        if (canvasRatio > pageRatio) {
          imgW = A4_W; imgH = A4_W / canvasRatio;
          offsetX = 0; offsetY = (A4_H - imgH) / 2;
        } else {
          imgH = A4_H; imgW = A4_H * canvasRatio;
          offsetX = (A4_W - imgW) / 2; offsetY = 0;
        }
        // PNG lossless pour rester net (pas de compression JPEG)
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgW, imgH, undefined, 'NONE');
        pdf.save(filename + '.pdf');
      } else {
        // Fallback html2pdf haut niveau
        await html2pdf().set({
          margin: 0,
          filename: filename + '.pdf',
          image: { type: 'png', quality: 1 },
          html2canvas: { scale: 4, useCORS: true, backgroundColor: '#faf4ee', logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: false },
        }).from(clone).save();
      }
    } else {
      const canvas = await html2canvas(clone, { scale: 4, useCORS: true, backgroundColor: '#faf4ee', logging: false });
      const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mime, format === 'jpg' ? 0.95 : 1);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename + '.' + format;
      a.click();
    }
    toast('✓ Devis téléchargé');
  } catch (err) {
    console.error(err);
    toast('Erreur pendant la génération');
  } finally {
    wrap.remove();
    if (btn) { btn.disabled = false; btn.textContent = originalLabel; }
  }
}

/* =========================================================
   EMAIL SEND
========================================================= */
function openSendEmailModal(qid){
  const q = Store.quote(qid);
  if (!q) return;
  const totals = Store.quoteTotals(q);
  const template = Store.data.emailTemplates.find(t => t.id === 'et_devis');
  const fill = str => str
    .replace(/{{prenom}}/g, q.clientSnapshot.prenom||'')
    .replace(/{{nom}}/g, q.clientSnapshot.nom||'')
    .replace(/{{numero}}/g, q.numero)
    .replace(/{{montant}}/g, fmtMoney(totals.ttc));
  const sujet = fill(template.sujet);
  const corps = fill(template.corps);

  const apiUrl = localStorage.getItem('v24_intake_url');
  const canSendServer = !!apiUrl;

  openModal(`
    <h2 class="form-title">Envoyer le devis</h2>
    <p class="form-sub">${esc(q.numero)} · ${fmtMoney(totals.ttc)} TTC · depuis <strong>ap.vision24@outlook.fr</strong></p>
    <form id="send-form">
      <div class="field"><label>Destinataire</label><input name="to" type="email" value="${esc(q.clientSnapshot.email||'')}" required></div>
      <div class="field"><label>Sujet</label><input name="sujet" value="${esc(sujet)}" required></div>
      <div class="field"><label>Message</label><textarea name="corps" rows="12" style="font-family:inherit">${esc(corps)}</textarea></div>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted);cursor:pointer">
        <input type="checkbox" id="send-attach-pdf" checked>
        📎 Joindre le PDF du devis
      </label>
      <div class="mini" style="margin-top:8px">
        ${canSendServer
          ? '✅ Envoi direct depuis ton Outlook (ap.vision24@outlook.fr) via l\'API Hostinger'
          : '⚠️ API non configurée · l\'email s\'ouvrira dans ton client mail (Outlook) pour envoi manuel'}
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn--ghost" data-close>Annuler</button>
        <button type="submit" class="btn btn--primary" id="send-submit-btn">${canSendServer?'Envoyer depuis Outlook':'Ouvrir dans Outlook'}</button>
      </div>
    </form>
  `);
  $('#send-form').onsubmit = async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const attachPdf = $('#send-attach-pdf').checked;
    const btn = $('#send-submit-btn');
    btn.disabled = true;

    // Génère le PDF (data URL) si demandé et si html2pdf dispo
    let attachments = [];
    if (attachPdf) {
      btn.textContent = 'Génération PDF…';
      try {
        const dataUrl = await generateQuotePdfDataUrl(q);
        if (dataUrl) attachments.push({ name: `Devis-Vision24-${q.numero}.pdf`, dataUrl });
      } catch (err) { console.warn('PDF gen failed', err); }
    }

    if (canSendServer) {
      btn.textContent = 'Envoi en cours…';
      try {
        const r = await fetch(apiUrl.replace(/\/$/,'') + '/send-email.php', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-vision-token': localStorage.getItem('v24_intake_token') || ''
          },
          body: JSON.stringify({
            to: f.to, subject: f.sujet, body: f.corps, attachments
          })
        });
        const data = await r.json();
        if (!data.ok) throw new Error(data.message || data.error || 'Erreur SMTP');
        toast(`Devis envoyé à ${f.to} depuis ton Outlook ✅`);
      } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Envoyer depuis Outlook';
        alert(`Envoi impossible : ${err.message}\n\nVérifie que send-email.php est déployé sur Hostinger avec ton mot de passe d'application Outlook dans config.php.`);
        return;
      }
    } else {
      // Fallback : ouvre le client mail
      const mailto = `mailto:${encodeURIComponent(f.to)}?subject=${encodeURIComponent(f.sujet)}&body=${encodeURIComponent(f.corps)}`;
      window.location.href = mailto;
    }

    const old = q.statut;
    q.statut = 'envoyé';
    Store.addActivity({ dealId: q.dealId, contactId: q.contactId, type:'quote', contenu:`Devis ${q.numero} envoyé à ${f.to}` });
    onQuoteStatusChanged(q, old, 'envoyé');
    closeModal();
    render();
  };
}

/* Génère le PDF du devis en data URL (pour attachement email) */
async function generateQuotePdfDataUrl(quote){
  const jsPDFCtor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF || (window.html2pdf && window.html2pdf.jsPDF);
  if (typeof html2canvas === 'undefined' || !jsPDFCtor) return null;
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:-99999px;left:-99999px;width:210mm;background:#faf4ee';
  container.innerHTML = renderQuoteDocHtml(quote);
  document.body.appendChild(container);
  const target = container.firstElementChild || container;
  target.classList?.add('is-exporting');
  target.style.width = '210mm';
  await new Promise(r => setTimeout(r, 100));
  try {
    const canvas = await html2canvas(target, {
      scale: 2, useCORS: true, backgroundColor: '#faf4ee', logging: false,
      windowWidth: target.offsetWidth, windowHeight: target.offsetHeight,
    });
    const pdf = new jsPDFCtor({ unit:'mm', format:'a4', orientation:'portrait', compress:true });
    const A4_W = 210, A4_H = 297;
    const canvasRatio = canvas.width / canvas.height;
    const pageRatio = A4_W / A4_H;
    let imgW, imgH, offsetX, offsetY;
    if (canvasRatio > pageRatio) {
      imgW = A4_W; imgH = A4_W / canvasRatio;
      offsetX = 0; offsetY = (A4_H - imgH) / 2;
    } else {
      imgH = A4_H; imgW = A4_H * canvasRatio;
      offsetX = (A4_W - imgW) / 2; offsetY = 0;
    }
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, imgW, imgH, undefined, 'FAST');
    const blob = pdf.output('blob');
    return await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } finally {
    container.remove();
  }
}

/* Retourne le HTML du devis prêt pour PDF (extrait de openQuotePreview) */
/* Retourne le bloc "Déroulement" personnalisé selon la prestation */
/* Prestations qui offrent des tirages illimités par défaut (afficher ligne fixe) */
const TIRAGES_ILLIMITES_PRESTATION_IDS = new Set([
  'photobooth', 'boxmagazine', 'boxvogue', 'videobooth360',
  'pack01', 'pack02', 'pack03', 'pack04'
]);

function deroulementFor(item){
  const byId = {
    // Photobooth & accessoires
    photobooth:         ['Livraison sur site du Photobooth', 'Installation complète par nos soins', 'Tirages illimités inclus', 'Désinstallation du matériel fin de prestation'],
    porte_cles:         ['Livraison de la machine à personnalisation', 'Installation complète par nos soins', 'Désinstallation du matériel fin de prestation'],
    // Box & Cabine
    boxmagazine:        ['Livraison sur site de la Box Magazine', 'Installation complète par nos soins (structure 2M × 2M, éclairage, impression)', 'Tirages illimités inclus', 'Désinstallation du matériel fin de prestation'],
    boxvogue:           ['Livraison sur site de la Cabine Vogue', 'Installation complète par nos soins (LED, ambiance premium)', 'Tirages illimités inclus', 'Désinstallation du matériel fin de prestation'],
    // Vidéo 360°
    videobooth360:      ['Livraison sur site du 360 Vidéobooth', 'Installation complète par nos soins (plateforme, structure gonflable, bras motorisé)', 'Vidéos illimitées incluses', 'Désinstallation du matériel fin de prestation'],
    // Captation vidéo — flux différent
    captation_mariage:  ['Arrivée du vidéaste sur site aux préparatifs', 'Captation complète de la journée par nos soins (4K, sons, drone si autorisé)', 'Post-production et livraison du film final monté'],
    captation_pro:      ['Arrivée du vidéaste sur site', 'Captation complète de l\'événement par nos soins', 'Post-production et livraison du montage final'],
    drone:              ['Arrivée du pilote drone certifié DGAC sur site', 'Prises de vue aériennes 4K par nos soins', 'Livraison des rushs / plans montés'],
    // Bars gourmands
    bar_hotdogs:        ['Livraison sur site du bar à hot-dogs', 'Installation complète par nos soins (plaque, chauffe-pain, chef dédié)', 'Désinstallation du matériel fin de prestation'],
    bar_chocolat:       ['Livraison sur site du bar à chocolat chaud', 'Installation complète par nos soins (machine, imprimante alimentaire)', 'Désinstallation du matériel fin de prestation'],
    bar_pancake_gaufres:['Livraison sur site du bar à pancakes & gaufres', 'Installation complète par nos soins (gaufrier, machine à pancakes, chef dédié)', 'Désinstallation du matériel fin de prestation'],
    bar_crepes:         ['Livraison sur site du bar à crêpes', 'Installation complète par nos soins (crêpière pro, chef dédié)', 'Désinstallation du matériel fin de prestation'],
    bar_boissons_latte: ['Livraison sur site du bar à boissons Latte Art', 'Installation complète par nos soins (machine café pro, imprimante alimentaire)', 'Désinstallation du matériel fin de prestation'],
    bar_popcorn:        ['Livraison sur site du bar à popcorn', 'Installation complète par nos soins (machine, pochettes signature)', 'Désinstallation du matériel fin de prestation'],
    // DJ
    dj_pro:             ['Livraison sur site du matériel DJ', 'Installation complète par nos soins (sound system, éclairage, LED)', 'Désinstallation du matériel fin de prestation'],
    // Packs signature (matériel multiple)
    pack01:             ['Livraison sur site de l\'ensemble des matériels de la formule', 'Installation complète par nos soins (Box Magazine + Photobooth + accessoires)', 'Tirages illimités inclus', 'Désinstallation du matériel fin de prestation'],
    pack02:             ['Livraison sur site de l\'ensemble des matériels de la formule', 'Installation complète par nos soins (Vidéobooth 360° + Photobooth + Box Magazine)', 'Tirages illimités inclus', 'Désinstallation du matériel fin de prestation'],
    pack03:             ['Arrivée du vidéaste + livraison du Photobooth sur site', 'Captation vidéo mariage + installation Photobooth par nos soins', 'Tirages illimités inclus', 'Désinstallation, post-production et livraison du film final'],
    pack04:             ['Arrivée du vidéaste + livraison du Photobooth et du matériel DJ sur site', 'Captation vidéo + installations Photobooth et DJ par nos soins', 'Tirages illimités inclus', 'Désinstallation, post-production et livraison du film final'],
    // Consommables : pas de déroulement dédié
    consommables:       null,
  };
  const pid = item.prestationId;
  if (pid && byId[pid] !== undefined) return byId[pid];
  // Fallback par catégorie
  const p = Store.data.prestations.find(x => x.id === pid);
  if (!p) return null;
  const cat = p.categorie || '';
  if (cat === 'Bar gourmand')     return ['Livraison sur site du bar', 'Installation complète par nos soins', 'Désinstallation du matériel fin de prestation'];
  if (cat === 'Captation vidéo')  return ['Arrivée du vidéaste sur site', 'Captation complète de l\'événement par nos soins', 'Post-production et livraison du film final'];
  if (cat === 'Photobooth')       return ['Livraison sur site du matériel', 'Installation complète par nos soins', 'Désinstallation du matériel fin de prestation'];
  if (cat === 'Box & Cabine')     return ['Livraison sur site de l\'animation', 'Installation complète par nos soins', 'Désinstallation du matériel fin de prestation'];
  if (cat === 'Vidéo 360°')       return ['Livraison sur site du matériel 360°', 'Installation complète par nos soins', 'Désinstallation du matériel fin de prestation'];
  if (cat === 'Animation')        return ['Livraison sur site du matériel', 'Installation complète par nos soins', 'Désinstallation du matériel fin de prestation'];
  return null;
}

function renderQuoteDocHtml(q){
  const totals = Store.quoteTotals(q);
  const ent = Store.data.meta.entreprise;
  const dateFR = new Date(q.createdAt).toLocaleDateString('fr-FR');
  const validUntil = new Date(q.createdAt); validUntil.setDate(validUntil.getDate()+30);
  const clientName = [q.clientSnapshot.prenom, q.clientSnapshot.nom].filter(Boolean).join(' ');
  const eventDateFR = q.eventDate ? new Date(q.eventDate).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : '';
  const num = (q.numero||'').replace(/^V24-\d{4}-/,'');
  return `
    <div class="v24-doc is-exporting" style="width:210mm">
      <header class="v24-doc__head">
        <div class="v24-doc__brand">
          <img src="${location.origin}/assets/logo-creme.png" style="width:180px" alt="Vision 24" />
          <div class="v24-doc__coords">
            <div>${esc(ent.adresse||'')}</div>
            <div>${esc(ent.tel||'')}</div>
            <div>${esc(ent.email||'')}</div>
          </div>
        </div>
        <div class="v24-doc__title">
          <h1>Devis N°${esc(num)}</h1>
          <div class="v24-doc__dates">
            <div><strong>Date :</strong> ${dateFR}</div>
            <div><strong>Valable jusqu'au :</strong> ${validUntil.toLocaleDateString('fr-FR')}</div>
          </div>
        </div>
      </header>
      <section class="v24-doc__info">
        <div class="v24-doc__col">
          <h2>CLIENT :</h2>
          <div class="v24-doc__col-body">
            <div><strong>${esc(clientName)}</strong></div>
            ${q.clientSnapshot.tel?`<div>${esc(q.clientSnapshot.tel)}</div>`:''}
            ${q.clientSnapshot.email?`<div>${esc(q.clientSnapshot.email)}</div>`:''}
          </div>
        </div>
        <div class="v24-doc__col-sep"></div>
        <div class="v24-doc__col">
          <h2>INFORMATION :</h2>
          <div class="v24-doc__col-body">
            ${eventDateFR?`<div><strong>Date :</strong> ${eventDateFR}</div>`:''}
            ${q.eventLieu?`<div><strong>Lieu :</strong> ${esc(q.eventLieu)}</div>`:''}
            ${q.eventInvites?`<div><strong>Invités :</strong> ${q.eventInvites} personnes</div>`:''}
          </div>
        </div>
      </section>
      <div class="v24-doc__divider"></div>
      <section class="v24-doc__body">
        <h2 class="v24-doc__section">DESCRIPTION DU PROJET :</h2>
        ${q.items.map((it, i) => `
          <article class="v24-item">
            <h3>${i+1}) ${esc(it.nom||'')}${it.variantLabel?` — ${esc(it.variantLabel)}`:''} : <span class="v24-item__price">(${fmtMoney(lineTotal(it))})</span></h3>
            ${it.description ? `<div class="v24-item__desc">${nl2br(it.description)}</div>` : ''}
          </article>
        `).join('')}
      </section>
      <footer class="v24-doc__footer">
        <div class="v24-doc__footer-hr"></div>
        <div class="v24-doc__totals">
          <div class="v24-doc__pay">
            <h4>INFORMATION DE PAIEMENT :</h4>
            <ul><li>${totals.acompteRate}% d'acompte à la signature</li></ul>
          </div>
          <div class="v24-doc__totals-col">
            <div class="v24-doc__tva-mention">${esc(Store.data.meta.tvaMention||'TVA non applicable, art.293B du CGI')} :</div>
            <div class="v24-doc__total-line--big"><span>${fmtMoney(totals.ttc)} TTC</span></div>
            <div class="v24-doc__acompte-line">Acompte : <strong>${fmtMoney(totals.acompte)}</strong></div>
          </div>
        </div>
      </footer>
    </div>
  `;
}

/* =========================================================
   NEW QUOTE FLOW (from list button)
========================================================= */
function openNewQuoteFlow(){
  openModal(`
    <h2 class="form-title">Nouveau devis</h2>
    <p class="form-sub">À partir d'un contact existant</p>
    <div class="field">
      <label>Contact</label>
      <select id="new-quote-contact">
        <option value="">— Choisir un contact —</option>
        ${Store.data.contacts.map(c => `<option value="${c.id}">${esc(c.prenom)} ${esc(c.nom)}${c.entreprise?' · '+esc(c.entreprise):''}</option>`).join('')}
      </select>
    </div>
    <div class="mini">Le devis récupérera automatiquement les infos du contact.</div>
    <div class="form-actions">
      <button class="btn btn--ghost" data-close>Annuler</button>
      <button class="btn btn--secondary" id="nq-new-contact">+ Créer un nouveau contact</button>
      <button class="btn btn--primary" id="nq-go">Continuer</button>
    </div>
  `);
  $('#nq-go').onclick = () => {
    const cid = $('#new-quote-contact').value;
    if (!cid) { toast('Sélectionne un contact'); return; }
    closeModal();
    openQuoteEditorForContact(cid);
  };
  $('#nq-new-contact').onclick = () => { closeModal(); openContactForm(null, id => openQuoteEditorForContact(id)); };
}

/* =========================================================
   DRAWER / MODAL
========================================================= */
function openDrawer(html){
  const d = $('#drawer');
  $('#drawer-body').innerHTML = html;
  d.hidden = false;
  d.querySelectorAll('[data-close]').forEach(el => el.onclick = closeDrawer);
  document.addEventListener('keydown', escClose);
}
function closeDrawer(){ $('#drawer').hidden = true; document.removeEventListener('keydown', escClose); }
function openModal(html){
  const m = $('#modal');
  $('#modal-body').innerHTML = html;
  m.hidden = false;
  m.querySelectorAll('[data-close]').forEach(el => el.onclick = closeModal);
  document.addEventListener('keydown', escClose);
}
function closeModal(){ $('#modal').hidden = true; document.removeEventListener('keydown', escClose); }
function escClose(e){ if (e.key === 'Escape') { closeDrawer(); closeModal(); closePalette(); } }

/* =========================================================
   ACTIONS GLOBALES — délégation d'évènements
   ---------------------------------------------------------
   Une seule source de vérité pour TOUS les boutons du CRM,
   qu'ils soient dans le drawer, la modale, la vue principale,
   la palette ou une popup future.
========================================================= */
const CRM_ACTIONS = {
  'encaisser':        (id) => openEncaisserModal(id),
  'open-invoice':     (id) => openInvoiceModal(id),
  'quote-edit':       (id) => { closeDrawer(); Router.go('quote-editor', { quoteId: id }); },
  'quote-preview':    (id) => openQuotePreview(id),
  'quote-send':       (id) => openSendEmailModal(id),
  'quote-accept':     (id) => acceptQuote(id),
  'quote-duplicate':  (id) => duplicateQuote(id),
  'quote-delete':     (id) => deleteQuote(id),
  'quote-statut':     (id, val) => changeQuoteStatut(id, val),
  'send-final-invoice': (id) => openSendFinalInvoiceModal(id),
  'invoice-preview':  (id) => openInvoicePreview(id),
  'invoice-delete':   (id) => deleteInvoice(id),
  'open-contact':     (id) => { closeDrawer(); openContact(id); },
  'open-contact-btn': (id) => { closeDrawer(); openContact(id); },
  'open-deal':        (id) => { closeDrawer(); openDeal(id); },
  'deal-open':        (id) => { closeDrawer(); openDeal(id); },
  'open-demande':     (id) => { closeDrawer(); openDemande(id); },
  'demande-open':     (id) => openDemande(id),
  'demande-quote':    (id) => createQuoteFromDemande(id),
  'demande-relancer': (id) => openRelancerModal(id),
  'generate-quote':   (id) => { closeDrawer(); openQuoteEditorForDeal(id); },
  'quick-quote':      (id) => { closeDrawer(); openQuoteEditorForContact(id); },
  'new-quote-here':   (id) => { closeDrawer(); openQuoteEditorForContact(id); },
  'new-invoice-here': (id) => openNewInvoiceForm(id),
  'task-toggle':      (id) => { toggleTask(id); },
  'add-task-here':    (id) => openTaskForm(id),
  'edit-contact':     (id) => openContactForm(id),
  'convert-client':   (id) => convertProspectToClient(id),
  'log':              (type, ctx) => quickLog(type, ctx),
  'set-type':         (v, ctx) => setContactField(ctx, 'type', v),
  'set-temp':         (v, ctx) => setContactField(ctx, 'temperature', v),
  'presta-open':      (id) => openPrestaForm(id),
  'presta':           (id) => openPrestaForm(id),
  'quote':            (id) => Router.go('quote-editor', { quoteId: id }),
  'demande':          (id) => openDemande(id),
  'contact':          (id) => openContact(id),
  'deal':             (id) => openDeal(id),
  'filter-statut':    (v) => { prospectsFilter.statut = v; render(); },
  'filter-type':      (v) => { contactsFilter.type = v; render(); },
  'filter-temp':      (v) => { contactsFilter.temp = v; render(); },
  'dm-src':           (v) => { demandesFilter.source = v; render(); },
  'dm-statut':        (v) => { demandesFilter.statut = v; render(); },
  'presta-cat':       (v) => { prestaFilterCat = v; render(); },
  'cal-nav':          (v) => { const n = parseInt(v,10); if (n===0) calCursor = new Date(); else calCursor = addMonths(calCursor,n); render(); },
  'pipeline-more':    (stageId) => {
    const pipeline = document.querySelector('.pipeline');
    const scrollLeft = pipeline?.scrollLeft || 0;
    pipelineExpanded[stageId] = !pipelineExpanded[stageId];
    render();
    // Restaure la position horizontale du pipeline après le re-render
    requestAnimationFrame(() => {
      const newPipeline = document.querySelector('.pipeline');
      if (newPipeline) newPipeline.scrollLeft = scrollLeft;
    });
  },
};

function convertProspectToClient(contactId){
  const c = Store.contact(contactId);
  if (!c) return toast('Contact introuvable');
  if (c.type === 'client') return toast('Déjà client');
  if (!confirm(`Convertir ${c.prenom} ${c.nom} en client ?`)) return;
  c.type = 'client';
  c.convertedAt = Date.now();
  Store.addActivity({ contactId: c.id, type: 'won', contenu: 'Prospect converti en client (manuel)' });
  Store.save();
  toast('✓ Prospect converti en client');
  const drawerOpen = !$('#drawer').hidden;
  if (drawerOpen) openContact(c.id); else render();
}

function quickLog(type, contactId){
  const c = Store.contact(contactId);
  if (!c) return;
  const content = prompt(`${activityLabel(type)} — décris rapidement :`);
  if (!content) return;
  Store.addActivity({ contactId: c.id, type, contenu: content });
  toast('✓ Ajouté à l\'historique');
  const drawerOpen = !$('#drawer').hidden;
  if (drawerOpen) openContact(c.id);
}

function setContactField(contactId, field, value){
  const c = Store.contact(contactId);
  if (!c) return;
  c[field] = value; Store.save();
  const drawerOpen = !$('#drawer').hidden;
  if (drawerOpen) openContact(c.id); else render();
}

function deleteQuote(id){
  const q = Store.quote(id);
  if (!q) return toast('Devis introuvable');
  const linkedInvoices = Store.data.invoices.filter(i => i.quoteId === id);
  const hasPaidInvoice = linkedInvoices.some(i => Store.invoiceEncaisse(i.id) > 0);
  if (hasPaidInvoice) {
    return toast('⚠️ Devis lié à une facture déjà encaissée — suppression impossible');
  }
  const msg = linkedInvoices.length
    ? `Supprimer le devis ${q.numero} ?\n\n⚠️ ${linkedInvoices.length} facture${linkedInvoices.length>1?'s seront supprimées':' sera supprimée'} aussi.`
    : `Supprimer définitivement le devis ${q.numero} ?`;
  if (!confirm(msg)) return;
  Store.data.quotes = Store.data.quotes.filter(x => x.id !== id);
  Store.data.invoices = Store.data.invoices.filter(i => i.quoteId !== id);
  // Reset dm.quoteId si liée
  (Store.data.demandes||[]).forEach(dm => { if (dm.quoteId === id) dm.quoteId = null; });
  Store.addActivity({ contactId: q.contactId, dealId: q.dealId, type: 'note', contenu: `Devis ${q.numero} supprimé` });
  Store.save();
  toast(`✓ Devis ${q.numero} supprimé`);
  if (!$('#drawer').hidden && q.contactId) openContact(q.contactId);
  else render();
}

function changeQuoteStatut(id, newStatut){
  const q = Store.quote(id);
  if (!q) return toast('Devis introuvable');
  if (!['brouillon','envoyé','consulté','accepté','refusé','expiré'].includes(newStatut)) return;
  const oldStatut = q.statut;
  const contactBefore = Store.contact(q.contactId);
  const wasProspect = contactBefore?.type === 'prospect';
  q.statut = newStatut;
  q.updatedAt = Date.now();
  onQuoteStatusChanged(q, oldStatut, newStatut);
  Store.save();
  updateDemandesBadge();
  // Toujours re-render la vue principale pour que le prospect quitte la liste Prospects
  render();
  // Rouvre la fiche si elle était ouverte (nouveau type = client → couleurs vertes)
  if (!$('#drawer').hidden && q.contactId) openContact(q.contactId);
  // Feedback visuel fort quand la conversion vient d'avoir lieu
  const contactAfter = Store.contact(q.contactId);
  if (wasProspect && contactAfter?.type === 'client') {
    setTimeout(() => toast(`🎉 ${contactAfter.prenom} ${contactAfter.nom} est maintenant CLIENT — retrouvé dans l'onglet Clients`), 800);
  }
}

function duplicateQuote(id){
  const src = Store.quote(id);
  if (!src) return toast('Devis introuvable');
  const copy = JSON.parse(JSON.stringify(src));
  copy.id = uid();
  copy.numero = nextQuoteNumber();
  copy.statut = 'brouillon';
  copy.createdAt = Date.now();
  copy.updatedAt = Date.now();
  copy.sentAt = null; copy.acceptedAt = null;
  Store.data.quotes.unshift(copy);
  Store.save();
  toast('Devis dupliqué');
  Router.go('quote-editor', { quoteId: copy.id });
}

/* Camel-case data-* → attribute (dataset "openContactBtn" → "open-contact-btn") */
function findActionOnElement(el){
  if (!el || !el.dataset) return null;
  for (const key of Object.keys(el.dataset)) {
    const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    if (CRM_ACTIONS[kebab]) return { name: kebab, value: el.dataset[key], contactCtx: el.dataset.contactCtx || el.closest('[data-contact-ctx]')?.dataset?.contactCtx };
  }
  return null;
}

/** Délégation globale — SAFETY NET.
 *  Ne se déclenche que si le bouton n'a PAS déjà un handler direct.
 *  Objectif : garantir que TOUT bouton data-* fonctionne, même oublié. */
document.addEventListener('click', e => {
  const trigger = e.target.closest('button,a,[role="button"],[data-contact],[data-deal],[data-demande],[data-quote],[data-open-demande]');
  if (!trigger) return;
  // Un handler direct existe déjà (préférence à la source) → ne rien faire
  if (typeof trigger.onclick === 'function') return;
  // Champs de saisie : ignore
  if (['INPUT','SELECT','TEXTAREA'].includes(trigger.tagName)) return;

  const action = findActionOnElement(trigger);
  if (!action) return;

  // Ignore les liens externes réels (mailto:, tel:, http…)
  if (trigger.tagName === 'A') {
    const href = trigger.getAttribute('href') || '';
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) return;
  }

  try {
    e.preventDefault();
    e.stopPropagation();
    const fn = CRM_ACTIONS[action.name];
    if (typeof fn !== 'function') return console.warn('Action inconnue:', action.name);
    fn(action.value, action.contactCtx);
  } catch (err) {
    console.error(`Erreur action ${action.name}:`, err);
    toast('⚠️ Une erreur est survenue — action annulée');
  }
}, true);  // capture phase pour intervenir tôt

/** Délégation "change" pour les <select> avec data-* action */
document.addEventListener('change', e => {
  const el = e.target;
  if (!el || (el.tagName !== 'SELECT' && el.type !== 'checkbox')) return;
  if (typeof el.onchange === 'function' && el.dataset.selectDelegated !== '1') return;
  const action = findActionOnElement(el);
  if (!action) return;
  try {
    const fn = CRM_ACTIONS[action.name];
    if (typeof fn === 'function') fn(action.value, el.value);
  } catch (err) {
    console.error(`Erreur action ${action.name}:`, err);
    toast('⚠️ Une erreur est survenue — action annulée');
  }
});

/** Filet de sécurité global : rattrape toute exception non gérée */
window.addEventListener('error', e => {
  console.error('[CRM] Erreur globale:', e.error || e.message);
  toast('⚠️ Erreur détectée — les données sont sauvegardées');
});
window.addEventListener('unhandledrejection', e => {
  console.error('[CRM] Promise rejetée:', e.reason);
});

/* =========================================================
   PALETTE DE RECHERCHE UNIVERSELLE (⌘K)
========================================================= */
function openPalette(initialQuery=''){
  let host = document.getElementById('palette');
  if (!host) {
    host = document.createElement('div');
    host.id = 'palette';
    host.className = 'palette';
    host.innerHTML = `
      <div class="palette__backdrop" data-close></div>
      <div class="palette__panel">
        <div class="palette__searchbar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-4-4M17 10a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" id="palette-input" placeholder="Rechercher un contact, devis, facture, événement, lieu, tél, email…" autocomplete="off" />
          <span class="palette__hint">esc</span>
        </div>
        <div class="palette__results" id="palette-results"></div>
      </div>`;
    document.body.appendChild(host);
    host.querySelectorAll('[data-close]').forEach(el => el.onclick = closePalette);
  }
  host.hidden = false;
  const input = host.querySelector('#palette-input');
  input.value = initialQuery;
  runPaletteSearch(initialQuery);
  input.oninput = e => runPaletteSearch(e.target.value);
  input.onkeydown = e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = host.querySelectorAll('.palette__item');
      if (!items.length) return;
      let idx = [...items].findIndex(x => x.classList.contains('is-selected'));
      items.forEach(x => x.classList.remove('is-selected'));
      idx = e.key==='ArrowDown' ? (idx+1)%items.length : (idx<=0?items.length-1:idx-1);
      items[idx].classList.add('is-selected');
      items[idx].scrollIntoView({ block:'nearest' });
    } else if (e.key === 'Enter') {
      const sel = host.querySelector('.palette__item.is-selected') || host.querySelector('.palette__item');
      if (sel) sel.click();
    }
  };
  setTimeout(() => input.focus(), 20);
  document.addEventListener('keydown', escClose);
}
function closePalette(){
  const host = document.getElementById('palette');
  if (host) host.hidden = true;
}
function runPaletteSearch(q){
  const host = document.getElementById('palette');
  if (!host) return;
  const results = host.querySelector('#palette-results');
  const query = (q||'').trim().toLowerCase();
  const norm = s => (s||'').toString().toLowerCase();
  const normTel = s => (s||'').toString().replace(/[^\d+]/g,'');

  if (!query) {
    // Suggestions par défaut : dernières demandes + tâches du jour + événements à venir
    const now = Date.now();
    const recentDemandes = (Store.data.demandes||[]).filter(d => d.statut === 'nouvelle').slice(0,4);
    const todayTasks = Store.data.tasks.filter(t => !t.done && t.due <= now + 86400000).slice(0,4);
    const upcoming = Store.data.deals.filter(d => d.eventDate && new Date(d.eventDate).getTime() >= now).sort((a,b) => new Date(a.eventDate)-new Date(b.eventDate)).slice(0,4);
    results.innerHTML = `
      ${recentDemandes.length?`<div class="palette__group">Demandes nouvelles</div>`:''}
      ${recentDemandes.map(dm => `<div class="palette__item" data-nav="demande" data-id="${dm.id}"><span class="palette__ico">📥</span><div><div class="palette__t">${esc(dm.prenom)} ${esc(dm.nom)} — ${esc(dm.typeEvenement||'demande')}</div><div class="palette__m">${esc(dm.source||'')} · ${fmtDateTime(dm.receivedAt)}</div></div></div>`).join('')}
      ${todayTasks.length?`<div class="palette__group">Tâches du jour</div>`:''}
      ${todayTasks.map(t => { const c = Store.contact(t.contactId); return `<div class="palette__item" data-nav="task" data-id="${t.id}"><span class="palette__ico">✅</span><div><div class="palette__t">${esc(t.titre)}</div><div class="palette__m">${c?esc(c.prenom+' '+c.nom)+' · ':''}${fmtDate(t.due)}</div></div></div>`; }).join('')}
      ${upcoming.length?`<div class="palette__group">Événements à venir</div>`:''}
      ${upcoming.map(d2 => { const c = Store.contact(d2.contactId); return `<div class="palette__item" data-nav="deal" data-id="${d2.id}"><span class="palette__ico">📅</span><div><div class="palette__t">${esc(d2.title)}</div><div class="palette__m">${c?esc(c.prenom+' '+c.nom)+' · ':''}${fmtDate(d2.eventDate)}</div></div></div>`; }).join('')}
      ${!recentDemandes.length && !todayTasks.length && !upcoming.length ? '<div class="palette__empty">Tape pour rechercher un contact, un devis, une facture, un événement…</div>' : ''}
    `;
    bindPaletteResults();
    return;
  }

  const qTel = normTel(query);
  const contacts = Store.data.contacts.filter(c =>
    norm(c.prenom).includes(query) || norm(c.nom).includes(query) ||
    norm(c.email).includes(query) || norm(c.entreprise).includes(query) ||
    (qTel && qTel.length>=4 && normTel(c.tel).includes(qTel))
  ).slice(0,8);

  const demandes = (Store.data.demandes||[]).filter(dm =>
    norm(dm.prenom).includes(query) || norm(dm.nom).includes(query) ||
    norm(dm.typeEvenement).includes(query) || norm(dm.lieuEvenement).includes(query) ||
    norm(dm.email).includes(query)
  ).slice(0,5);

  const quotes = Store.data.quotes.filter(q =>
    norm(q.numero).includes(query) || norm(q.eventTitle).includes(query) ||
    norm(q.clientNom).includes(query) || norm(q.clientPrenom).includes(query) || norm(q.clientSociete).includes(query)
  ).slice(0,5);

  const invoices = Store.data.invoices.filter(i =>
    norm(i.numero).includes(query)
  ).slice(0,5);

  const deals = Store.data.deals.filter(d =>
    norm(d.title).includes(query) || norm(d.lieu).includes(query) || norm(d.eventType).includes(query)
  ).slice(0,5);

  const nothing = !contacts.length && !demandes.length && !quotes.length && !invoices.length && !deals.length;

  results.innerHTML = `
    ${contacts.length?`<div class="palette__group">Contacts (${contacts.length})</div>`:''}
    ${contacts.map(c => `<div class="palette__item" data-nav="contact" data-id="${c.id}"><span class="palette__ico">👤</span><div><div class="palette__t">${esc(c.prenom)} ${esc(c.nom)} ${c.entreprise?`<span class="mini">· ${esc(c.entreprise)}</span>`:''}</div><div class="palette__m">${esc(c.type||'')} · ${esc(c.email||c.tel||'')}</div></div></div>`).join('')}

    ${demandes.length?`<div class="palette__group">Demandes (${demandes.length})</div>`:''}
    ${demandes.map(dm => `<div class="palette__item" data-nav="demande" data-id="${dm.id}"><span class="palette__ico">📥</span><div><div class="palette__t">${esc(dm.prenom)} ${esc(dm.nom)} — ${esc(dm.typeEvenement||'demande')}</div><div class="palette__m">${esc(dm.lieuEvenement||'')} · ${fmtDateTime(dm.receivedAt)}</div></div></div>`).join('')}

    ${quotes.length?`<div class="palette__group">Devis (${quotes.length})</div>`:''}
    ${quotes.map(q => `<div class="palette__item" data-nav="quote" data-id="${q.id}"><span class="palette__ico">📄</span><div><div class="palette__t">${esc(q.numero)} — ${fmtMoney(Store.quoteTotals(q).ttc)}</div><div class="palette__m">${esc(q.eventTitle||'')} · ${esc(q.statut||'')}</div></div></div>`).join('')}

    ${invoices.length?`<div class="palette__group">Factures (${invoices.length})</div>`:''}
    ${invoices.map(i => `<div class="palette__item" data-nav="invoice" data-id="${i.id}"><span class="palette__ico">💰</span><div><div class="palette__t">${esc(i.numero)} — ${fmtMoney(i.montant)}</div><div class="palette__m">${esc(i.type||'')} · ${esc(i.statut||'')}</div></div></div>`).join('')}

    ${deals.length?`<div class="palette__group">Événements (${deals.length})</div>`:''}
    ${deals.map(d => `<div class="palette__item" data-nav="deal" data-id="${d.id}"><span class="palette__ico">📅</span><div><div class="palette__t">${esc(d.title)}</div><div class="palette__m">${esc(d.lieu||'')} · ${d.eventDate?fmtDate(d.eventDate):'—'}</div></div></div>`).join('')}

    ${nothing?`<div class="palette__empty">Aucun résultat pour "${esc(query)}"</div>`:''}
  `;

  const first = results.querySelector('.palette__item');
  if (first) first.classList.add('is-selected');
  bindPaletteResults();
}
function bindPaletteResults(){
  document.querySelectorAll('#palette .palette__item').forEach(item => {
    item.onclick = () => {
      const type = item.dataset.nav; const id = item.dataset.id;
      closePalette();
      if (type === 'contact')  openContact(id);
      if (type === 'demande')  openDemande(id);
      if (type === 'deal')     openDeal(id);
      if (type === 'quote')    Router.go('quote-editor', { quoteId: id });
      if (type === 'invoice')  openInvoiceModal(id);
      if (type === 'task')     { const t = Store.data.tasks.find(x=>x.id===id); if (t?.contactId) openContact(t.contactId); }
    };
    item.onmouseenter = () => {
      document.querySelectorAll('#palette .palette__item').forEach(x => x.classList.remove('is-selected'));
      item.classList.add('is-selected');
    };
  });
}
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openPalette();
  }
});

/* =========================================================
   FICHE CONTACT
========================================================= */
function openContact(id){
  const c = Store.contact(id);
  if (!c) return;
  const deals = Store.dealsOf(c.id).sort((a,b) => (b.eventDate?new Date(b.eventDate).getTime():0) - (a.eventDate?new Date(a.eventDate).getTime():0));
  const activities = Store.activitiesOf({ contactId: c.id });
  const tasks = Store.tasksOf({ contactId: c.id });
  const quotes = Store.quotesOf({ contactId: c.id }).sort((a,b) => b.createdAt - a.createdAt);
  const invoices = Store.data.invoices.filter(i => i.contactId === c.id || deals.some(d => d.id === i.dealId));
  const demandes = (Store.data.demandes||[]).filter(dm => dm.prospectId === c.id).sort((a,b) => b.receivedAt - a.receivedAt);
  const activeDeal = deals.find(d => d.stage !== 's_won' && d.stage !== 's_lost') || deals[0];

  // Total à payer = MAX(sum factures, sum devis acceptés)
  // Évite de sous-compter quand seule la facture d'acompte est présente pour un devis signé.
  const sumInvoices = invoices.reduce((s,i) => s + (i.montant||0), 0);
  const sumAcceptedQuotes = quotes.filter(q => q.statut === 'accepté').reduce((s,q) => s + Store.quoteTotals(q).ttc, 0);
  const totalFacture = Math.max(sumInvoices, sumAcceptedQuotes);
  const totalEncaisse = invoices.reduce((s,i) => s + Store.invoiceEncaisse(i.id), 0);
  const resteDu = Math.max(0, totalFacture - totalEncaisse);

  openDrawer(`
    <!-- Header 360 : identité + KPI compacts -->
    <div class="fiche360__head fiche360__head--${c.type||'prospect'}">
      <div class="fiche360__id">
        <div class="fiche360__avatar">${initials(c.prenom, c.nom)}</div>
        <div style="flex:1;min-width:0">
          <h2 class="fiche360__title">${esc(c.prenom)} ${esc(c.nom)}</h2>
          <div class="fiche360__badges">
            ${typeBadge(c.type)} ${tempBadge(c.temperature)}
            ${c.entreprise ? `<span class="ficheV2__company">${esc(c.entreprise)}</span>` : ''}
            ${c.source ? `<span class="dmV2__source">${esc(c.source)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="fiche360__kpis">
        <div class="fiche360__kpi"><div class="fiche360__kpi-lbl">Devis</div><div class="fiche360__kpi-num">${quotes.length}</div></div>
        <div class="fiche360__kpi"><div class="fiche360__kpi-lbl">Facturé</div><div class="fiche360__kpi-num">${fmtMoney(totalFacture)}</div></div>
        <div class="fiche360__kpi fiche360__kpi--${resteDu>0?'due':'ok'}"><div class="fiche360__kpi-lbl">Reste dû</div><div class="fiche360__kpi-num">${fmtMoney(resteDu)}</div></div>
      </div>
    </div>

    <!-- Barre d'actions rapides -->
    <div class="fiche360__quick">
      ${c.tel   ? `<a class="fiche360__q-btn" href="tel:${esc(c.tel)}"><span>📞</span> Appeler</a>` : ''}
      ${c.email ? `<a class="fiche360__q-btn" href="mailto:${esc(c.email)}"><span>✉️</span> Écrire</a>` : ''}
      <button class="fiche360__q-btn" data-log="meeting"><span>📅</span> RDV</button>
      <button class="fiche360__q-btn" data-log="note"><span>📝</span> Note</button>
      <button class="fiche360__q-btn" data-add-task-here><span>✅</span> Tâche</button>
      <button class="fiche360__q-btn fiche360__q-btn--primary" data-new-quote-here="${c.id}"><span>📄</span> + Devis</button>
      ${c.type==='prospect' ? `<button class="fiche360__q-btn fiche360__q-btn--convert" data-convert-client="${c.id}"><span>✓</span> → Client</button>` : ''}
      <button class="fiche360__q-btn" data-edit-contact="${c.id}"><span>✎</span> Modifier</button>
    </div>

    <!-- ============ SECTION : ÉVÉNEMENT PRINCIPAL ============ -->
    ${activeDeal ? `
      <section class="fiche360__sec fiche360__sec--event">
        <h3 class="fiche360__sec-title"><span>🎉</span> Événement ${deals.length>1?`<span class="mini">(sur ${deals.length})</span>`:''}</h3>
        <div class="fiche360__event">
          <div class="fiche360__event-main">${esc(activeDeal.title)}</div>
          <div class="fiche360__event-grid">
            <div><span class="fiche360__lbl">Type</span><span class="fiche360__val">${esc(activeDeal.eventType||'—')}</span></div>
            <div><span class="fiche360__lbl">Date</span><span class="fiche360__val">${activeDeal.eventDate?fmtDate(activeDeal.eventDate):'—'}</span></div>
            <div><span class="fiche360__lbl">Lieu</span><span class="fiche360__val">${esc(activeDeal.lieu||'—')}</span></div>
            <div><span class="fiche360__lbl">Invités</span><span class="fiche360__val">${activeDeal.invites||'—'}</span></div>
            <div><span class="fiche360__lbl">Horaires</span><span class="fiche360__val">${esc(activeDeal.horaires||'—')}</span></div>
            <div><span class="fiche360__lbl">Étape</span><span class="fiche360__val">${esc(Store.stage(activeDeal.stage)?.nom || '—')}</span></div>
          </div>
          ${activeDeal.notes?`<div class="fiche360__notes-mini">${nl2br(activeDeal.notes)}</div>`:''}
          <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
            <button class="btn btn--sm btn--secondary" data-deal-open="${activeDeal.id}">Ouvrir la transaction</button>
            ${deals.length>1?`<button class="btn btn--sm btn--secondary" data-show-all-deals="${c.id}">Voir les ${deals.length} événements</button>`:''}
          </div>
        </div>
      </section>
    ` : ''}

    <!-- ============ SECTION : DEVIS & FACTURES ============ -->
    <section class="fiche360__sec fiche360__sec--quotes">
      <h3 class="fiche360__sec-title"><span>📄</span> Devis <em>&amp; factures</em></h3>
      ${quotes.length ? `
        <div class="fiche360__quotes">
          ${quotes.slice(0,5).map(q => {
            const totals = Store.quoteTotals(q);
            const qInvs = Store.data.invoices.filter(i => i.quoteId === q.id);
            const qEncaisse = qInvs.reduce((s,i) => s + Store.invoiceEncaisse(i.id), 0);
            const statutOpts = ['brouillon','envoyé','consulté','accepté','refusé','expiré'];
            return `
              <div class="fiche360__quote fiche360__quote--${q.statut||'brouillon'}">
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600;color:var(--bordeaux)">${esc(q.numero)} — ${fmtMoney(totals.ttc)}</div>
                  <div class="mini">${esc(q.eventTitle||'')} · ${fmtDate(q.createdAt)}</div>
                  ${qInvs.length?`<div class="mini">💰 ${fmtMoney(qEncaisse)} / ${fmtMoney(totals.ttc)} encaissé · ${qInvs.length} facture${qInvs.length>1?'s':''}</div>`:''}
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
                  <select class="fiche360__quote-statut fiche360__quote-statut--${q.statut||'brouillon'}" data-quote-statut="${q.id}" title="Changer le statut du devis">
                    ${statutOpts.map(s => `<option value="${s}" ${q.statut===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
                  </select>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn--sm btn--secondary" data-quote-preview="${q.id}" title="Aperçu">👁</button>
                    <button class="btn btn--sm btn--secondary" data-quote-edit="${q.id}" title="Éditer">✎</button>
                    <button class="btn btn--sm btn--danger" data-quote-delete="${q.id}" title="Supprimer le devis">×</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : '<div class="mini">Aucun devis pour ce contact.</div>'}
      <button class="btn btn--primary btn--sm" data-new-quote-here="${c.id}" style="margin-top:8px">+ Nouveau devis</button>
    </section>

    <section class="fiche360__sec fiche360__sec--invoices">
      <h3 class="fiche360__sec-title"><span>💰</span> Factures <em>&amp; paiements</em></h3>
      ${invoices.length ? `
        <div class="fiche360__invs">
          ${invoices.sort((a,b)=>b.createdAt-a.createdAt).slice(0,6).map(inv => {
            const enc = Store.invoiceEncaisse(inv.id);
            const rest = Store.invoiceRemaining(inv);
            const isFinal = inv.type === 'finale' || inv.isFinal;
            const linkedQuote = inv.quoteId ? Store.quote(inv.quoteId) : null;
            return `
              <div class="fiche360__inv fiche360__inv--${isFinal?'final':inv.statut==='payée'?'paid':rest>0?'due':'wait'}">
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600">${isFinal?'🏆 ':''}${esc(inv.numero)} · ${esc(inv.type||'')}${isFinal?' <span class="fiche360__final-badge">FINALE</span>':''}</div>
                  <div class="mini">${fmtMoney(inv.montant)} · ${esc(inv.statut||'')}${inv.montant===0?' <span style="color:#d54848">⚠️ orpheline</span>':''}</div>
                  ${linkedQuote ? `<div class="mini" style="color:var(--bordeaux);margin-top:2px">↳ Devis ${esc(linkedQuote.numero)}</div>` : '<div class="mini" style="color:#d54848;margin-top:2px">⚠️ Non liée à un devis</div>'}
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
                  ${isFinal ? `<button class="btn btn--sm btn--primary" data-send-final-invoice="${inv.id}" title="Envoyer au client">✉️ Envoyer</button>` : rest>0?`<button class="btn btn--sm btn--primary" data-encaisser="${inv.id}" title="Encaisser">Encaisser</button>`:'<span class="mini">✓ Soldée</span>'}
                  <div style="display:flex;gap:4px">
                    <button class="btn btn--sm btn--secondary" data-invoice-preview="${inv.id}" title="Aperçu">👁</button>
                    <button class="btn btn--sm btn--secondary" data-open-invoice="${inv.id}" title="Modifier la facture">✎</button>
                    <button class="btn btn--sm btn--danger" data-invoice-delete="${inv.id}" title="Supprimer">×</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : '<div class="mini">Aucune facture pour ce contact.</div>'}
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        <button class="btn btn--primary btn--sm" data-new-invoice-here="${c.id}">+ Nouvelle facture</button>
        ${invoices.some(i => !i.montant || i.montant===0) ? `
          <button class="btn btn--sm btn--secondary" onclick="window.cleanupOrphanInvoices()">🧹 Nettoyer les orphelines (0 €)</button>
        `: ''}
      </div>
    </section>

    <!-- ============ SECTION : COORDONNÉES ============ -->
    <section class="fiche360__sec">
      <h3 class="fiche360__sec-title"><span>📇</span> Coordonnées</h3>
      <div class="ficheV2__coords">
        ${c.email ? `<a class="ficheV2__coord" href="mailto:${esc(c.email)}"><span class="ficheV2__coord-ico">✉️</span><div><div class="ficheV2__coord-lbl">Email</div><div class="ficheV2__coord-val">${esc(c.email)}</div></div></a>` : ''}
        ${c.tel   ? `<a class="ficheV2__coord" href="tel:${esc(c.tel)}"><span class="ficheV2__coord-ico">📞</span><div><div class="ficheV2__coord-lbl">Téléphone</div><div class="ficheV2__coord-val">${esc(c.tel)}</div></div></a>` : ''}
        ${c.adresse ? `<div class="ficheV2__coord"><span class="ficheV2__coord-ico">📍</span><div><div class="ficheV2__coord-lbl">Adresse</div><div class="ficheV2__coord-val">${esc(c.adresse)}</div></div></div>` : ''}
        ${c.entreprise ? `<div class="ficheV2__coord"><span class="ficheV2__coord-ico">🏢</span><div><div class="ficheV2__coord-lbl">Société</div><div class="ficheV2__coord-val">${esc(c.entreprise)}</div></div></div>` : ''}
      </div>
      <div class="fiche360__pillrow">
        <div class="ficheV2__segment-block">
          <label class="ficheV2__lbl">Type</label>
          <div class="ficheV2__pillbar">
            ${[['prospect','Prospect'],['client','Client'],['pro','Pro'],['partner','Partenaire']].map(([v,lbl]) => `<button class="ficheV2__pill ${c.type===v?'is-active':''}" data-set-type="${v}">${lbl}</button>`).join('')}
          </div>
        </div>
        <div class="ficheV2__segment-block">
          <label class="ficheV2__lbl">Température</label>
          <div class="ficheV2__pillbar">
            ${[['hot','🔥 Chaud'],['warm','🟠 Tiède'],['cold','❄️ Froid'],['neutral','⚪ À qualifier']].map(([v,lbl]) => `<button class="ficheV2__pill ficheV2__pill--${v} ${c.temperature===v?'is-active':''}" data-set-temp="${v}">${lbl}</button>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- ============ SECTION : NOTES ============ -->
    <section class="fiche360__sec">
      <div class="ficheV2__notes">
        <div class="ficheV2__notes-head">
          <span>📝 Notes internes</span>
          <span class="mini" id="notes-status"></span>
        </div>
        <textarea id="contact-notes" placeholder="Ajoute une note sur ce contact… (autosauvegarde)">${esc(c.notes||'')}</textarea>
      </div>
    </section>

    <!-- ============ SECTION : PRÉPARATION ÉVÉNEMENT ============ -->
    ${(() => {
      const prepTasks = tasks.filter(t => t.category === 'prep');
      const prepOpen = prepTasks.filter(t => !t.done);
      const prepDone = prepTasks.filter(t => t.done);
      if (!prepTasks.length) return '';
      // Groupe par prestation
      const byPresta = {};
      prepTasks.forEach(t => {
        const p = t.prestationId || 'autre';
        if (!byPresta[p]) byPresta[p] = [];
        byPresta[p].push(t);
      });
      const now = Date.now();
      const total = prepTasks.length;
      const doneCount = prepDone.length;
      const progressPct = Math.round(doneCount / total * 100);
      return `
        <section class="fiche360__sec fiche360__sec--prep">
          <h3 class="fiche360__sec-title"><span>🛠</span> Préparation <em>événement</em> <span class="mini prep-progress-lbl">${doneCount}/${total} · ${progressPct}%</span></h3>
          <div class="prep-progress"><div class="prep-progress-bar" style="width:${progressPct}%"></div></div>
          ${Object.entries(byPresta).map(([pid, list]) => {
            const p = Store.data.prestations.find(x => x.id === pid);
            const label = p ? p.nom : 'Divers';
            const openList = list.filter(t => !t.done);
            const doneList = list.filter(t => t.done);
            return `
              <div class="prep-group">
                <div class="prep-group__head">
                  <span class="prep-group__title">${esc(label)}</span>
                  <span class="mini">${doneList.length}/${list.length}</span>
                </div>
                ${list.sort((a,b) => a.due - b.due).map(t => {
                  const late = !t.done && t.due < now;
                  return `
                    <div class="prep-task ${t.done?'prep-task--done':''} ${late?'prep-task--late':''}">
                      <label>
                        <input type="checkbox" ${t.done?'checked':''} data-task-toggle="${t.id}">
                        <span class="prep-task__titre">${esc(t.titre)}</span>
                      </label>
                      <span class="prep-task__due ${late?'prep-task__due--late':''}">${fmtDate(t.due)}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}
        </section>
      `;
    })()}

    <!-- ============ SECTION : TÂCHES ============ -->
    ${tasks.filter(t => !t.done && t.category !== 'prep').length ? `
      <section class="fiche360__sec">
        <h3 class="fiche360__sec-title"><span>✅</span> Autres <em>tâches</em></h3>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${tasks.filter(t => !t.done && t.category !== 'prep').map(t => `
            <div class="stat-line">
              <div>
                <div style="font-weight:500">${esc(t.titre)}</div>
                <div class="mini">${fmtDate(t.due)}</div>
              </div>
              <button class="btn btn--sm btn--secondary" data-task-toggle="${t.id}">Fait</button>
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- ============ SECTION : TIMELINE ============ -->
    ${activities.length ? `
      <section class="fiche360__sec fiche360__sec--timeline">
        <h3 class="fiche360__sec-title"><span>🕐</span> Historique <em>chronologique</em></h3>
        <div class="timeline">
          ${activities.slice(0,10).map(a => `
            <div class="timeline__item">
              <div class="timeline__dot">${activityIcon(a.type)}</div>
              <div class="timeline__content">
                <div class="timeline__title">${activityLabel(a.type)}</div>
                <div class="timeline__body">${esc(a.contenu)}</div>
                <div class="timeline__date">${fmtDateTime(a.createdAt)}</div>
              </div>
            </div>
          `).join('')}
          ${activities.length>10?`<div class="mini" style="margin-top:8px">…et ${activities.length-10} événements plus anciens</div>`:''}
        </div>
      </section>
    ` : ''}

    ${demandes.length ? `
      <section class="fiche360__sec">
        <h3 class="fiche360__sec-title"><span>📥</span> Demandes <em>reçues</em></h3>
        ${demandes.slice(0,3).map(dm => `
          <div class="stat-line" data-open-demande="${dm.id}" style="cursor:pointer">
            <div>
              <div style="font-weight:500">${esc(dm.typeEvenement||'Demande')} · ${dm.dateEvenement?fmtDate(dm.dateEvenement):'sans date'}</div>
              <div class="mini">${esc(dm.source||'')} · ${fmtDateTime(dm.receivedAt)}</div>
            </div>
            <span class="badge badge--${dm.statut==='nouvelle'?'hot':'prospect'}">${DEMANDE_STATUT_LABELS[dm.statut]||dm.statut}</span>
          </div>
        `).join('')}
      </section>
    ` : ''}

    <div class="fiche360__foot">
      <span>Créé le ${fmtDate(c.createdAt)}</span>
    </div>
  `);

  bindContactTabHandlers(c);
}

function renderContactTab(c, tab){
  const deals = Store.dealsOf(c.id);
  const activities = Store.activitiesOf({ contactId: c.id });
  const tasks = Store.tasksOf({ contactId: c.id });
  const quotes = Store.quotesOf({ contactId: c.id });

  if (tab === 'overview') {
    const lastActivity = activities[0];
    return `
      <!-- Coordonnées avec icônes -->
      <div class="ficheV2__coords">
        ${c.email ? `<a class="ficheV2__coord" href="mailto:${esc(c.email)}"><span class="ficheV2__coord-ico">✉️</span><div><div class="ficheV2__coord-lbl">Email</div><div class="ficheV2__coord-val">${esc(c.email)}</div></div></a>` : ''}
        ${c.tel   ? `<a class="ficheV2__coord" href="tel:${esc(c.tel)}"><span class="ficheV2__coord-ico">📞</span><div><div class="ficheV2__coord-lbl">Téléphone</div><div class="ficheV2__coord-val">${esc(c.tel)}</div></div></a>` : ''}
        ${c.adresse ? `<div class="ficheV2__coord"><span class="ficheV2__coord-ico">📍</span><div><div class="ficheV2__coord-lbl">Adresse</div><div class="ficheV2__coord-val">${esc(c.adresse)}</div></div></div>` : ''}
        ${c.source ? `<div class="ficheV2__coord"><span class="ficheV2__coord-ico">🎯</span><div><div class="ficheV2__coord-lbl">Source</div><div class="ficheV2__coord-val">${esc(c.source)}</div></div></div>` : ''}
      </div>

      <!-- Notes en pleine largeur -->
      <div class="ficheV2__notes">
        <div class="ficheV2__notes-head">
          <span>📝 Notes internes</span>
          <span class="mini" id="notes-status"></span>
        </div>
        <textarea id="contact-notes" placeholder="Ajoute une note sur ce contact… (autosauvegarde)">${esc(c.notes||'')}</textarea>
      </div>

      <!-- Segment : type + température -->
      <div class="ficheV2__row">
        <div class="ficheV2__segment-block">
          <label class="ficheV2__lbl">Type</label>
          <div class="ficheV2__pillbar">
            ${[['prospect','Prospect'],['client','Client'],['pro','Pro'],['partner','Partenaire']].map(([v,lbl]) => `<button class="ficheV2__pill ${c.type===v?'is-active':''}" data-set-type="${v}">${lbl}</button>`).join('')}
          </div>
        </div>
        <div class="ficheV2__segment-block">
          <label class="ficheV2__lbl">Température</label>
          <div class="ficheV2__pillbar">
            ${[['hot','🔥 Chaud'],['warm','🟠 Tiède'],['cold','❄️ Froid'],['neutral','⚪ À qualifier']].map(([v,lbl]) => `<button class="ficheV2__pill ficheV2__pill--${v} ${c.temperature===v?'is-active':''}" data-set-temp="${v}">${lbl}</button>`).join('')}
          </div>
        </div>
      </div>

      <!-- Dernière activité -->
      ${lastActivity ? `
        <div class="ficheV2__last">
          <div class="ficheV2__last-head">Dernière activité</div>
          <div class="ficheV2__last-body">
            <div class="timeline__dot">${activityIcon(lastActivity.type)}</div>
            <div style="flex:1">
              <div style="font-weight:500;font-size:13.5px">${activityLabel(lastActivity.type)}</div>
              <div class="mini">${esc(lastActivity.contenu)}</div>
              <div class="mini" style="margin-top:2px">${fmtDateTime(lastActivity.createdAt)}</div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Meta discret en bas -->
      <div class="ficheV2__foot">
        <span>Créé le ${fmtDate(c.createdAt)}</span>
      </div>
    `;
  }

  if (tab === 'quotes') {
    return `
      <div style="display:flex;flex-direction:column;gap:8px">
        ${quotes.length ? quotes.sort((a,b)=>b.createdAt-a.createdAt).map(q => {
          const totals = Store.quoteTotals(q);
          return `
            <div class="fiche-quote">
              <div class="fiche-quote__info">
                <div style="font-weight:600;color:var(--bordeaux);font-size:14px">${esc(q.numero)}</div>
                <div class="mini">${esc(q.eventTitle||'')} · ${fmtDate(q.createdAt)}</div>
              </div>
              <div class="fiche-quote__money">
                <span class="money">${fmtMoney(totals.ttc)}</span>
                ${quoteStatusBadge(q.statut)}
              </div>
              <div class="fiche-quote__actions">
                <button class="btn btn--sm btn--secondary" data-quote-preview="${q.id}" title="Aperçu du devis">👁 Aperçu</button>
                <button class="btn btn--sm btn--secondary" data-quote-edit="${q.id}" title="Éditer le devis">✏️ Éditer</button>
              </div>
            </div>
          `;
        }).join('') : '<div class="mini">Aucun devis pour ce contact.</div>'}
        <button class="btn btn--primary btn--sm" data-new-quote-here="${c.id}" style="margin-top:8px;align-self:flex-start">+ Nouveau devis</button>
      </div>
    `;
  }

  if (tab === 'deals') {
    return `<div style="display:flex;flex-direction:column;gap:8px">
      ${deals.length ? deals.map(d2 => `
        <div class="deal-card" data-deal-open="${d2.id}" style="cursor:pointer">
          <div class="deal-card__title">${esc(d2.title)}</div>
          <div class="deal-card__meta">${Store.stage(d2.stage)?.nom || ''} · ${d2.eventDate?fmtDate(d2.eventDate):'sans date'}</div>
          <div class="deal-card__amount">${fmtMoney(dealValue(d2))}</div>
        </div>`).join('') : '<div class="mini">Aucune transaction pour ce contact.</div>'}
    </div>`;
  }

  if (tab === 'activity') {
    return `<div class="timeline">${activities.length ? activities.map(a => `
      <div class="timeline__item">
        <div class="timeline__dot">${activityIcon(a.type)}</div>
        <div class="timeline__content">
          <div class="timeline__title">${activityLabel(a.type)}</div>
          <div class="timeline__body">${esc(a.contenu)}</div>
          <div class="timeline__date">${fmtDateTime(a.createdAt)}</div>
        </div>
      </div>`).join('') : '<div class="mini">Aucune activité enregistrée.</div>'}</div>`;
  }

  if (tab === 'tasks') {
    return `<div style="display:flex;flex-direction:column;gap:6px">
      ${tasks.length ? tasks.map(t => `
        <div class="stat-line">
          <div>
            <div style="font-weight:500;${t.done?'text-decoration:line-through;opacity:.5':''}">${esc(t.titre)}</div>
            <div class="mini">${fmtDate(t.due)}</div>
          </div>
          <button class="btn btn--sm btn--secondary" data-task-toggle="${t.id}">${t.done?'Rouvrir':'Fait'}</button>
        </div>`).join('') : '<div class="mini">Aucune tâche.</div>'}
    </div>
    <button class="btn btn--primary btn--sm" data-add-task-here style="margin-top:12px">+ Nouvelle tâche</button>`;
  }
  return '';
}

function bindContactTabHandlers(c){
  const el = $('#drawer-body');
  if (!el) return;

  el.querySelectorAll('[data-deal-open]').forEach(x => x.onclick = () => { closeDrawer(); openDeal(x.dataset.dealOpen); });
  el.querySelectorAll('[data-quote-edit]').forEach(x => x.onclick = () => { closeDrawer(); Router.go('quote-editor', { quoteId: x.dataset.quoteEdit }); });
  el.querySelectorAll('[data-quote-preview]').forEach(x => x.onclick = e => { e.stopPropagation(); openQuotePreview(x.dataset.quotePreview); });
  el.querySelectorAll('[data-task-toggle]').forEach(b => b.onclick = () => { toggleTask(b.dataset.taskToggle); openContact(c.id); });
  el.querySelectorAll('[data-encaisser]').forEach(b => b.onclick = () => openEncaisserModal(b.dataset.encaisser));
  el.querySelectorAll('[data-open-demande]').forEach(b => b.onclick = () => { closeDrawer(); openDemande(b.dataset.openDemande); });
  el.querySelector('[data-convert-client]')?.addEventListener('click', () => {
    if (!confirm(`Convertir ${c.prenom} ${c.nom} en client ?`)) return;
    c.type = 'client'; Store.save();
    Store.addActivity({ contactId: c.id, type: 'won', contenu: 'Prospect converti en client' });
    toast('✓ Prospect converti en client');
    openContact(c.id);
  });
  el.querySelector('[data-show-all-deals]')?.addEventListener('click', () => { closeDrawer(); Router.go('pipeline'); });

  // Autosauvegarde des notes (300 ms après dernière frappe)
  const notesEl = el.querySelector('#contact-notes');
  const statusEl = el.querySelector('#notes-status');
  if (notesEl) {
    let notesTimer;
    notesEl.addEventListener('input', () => {
      if (statusEl) statusEl.textContent = 'Enregistrement…';
      clearTimeout(notesTimer);
      notesTimer = setTimeout(() => {
        c.notes = notesEl.value; Store.save();
        if (statusEl) statusEl.textContent = '✓ Enregistré';
        setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 1500);
      }, 300);
    });
  }

  el.querySelectorAll('[data-set-type]').forEach(b => b.onclick = () => {
    c.type = b.dataset.setType; Store.save(); openContact(c.id);
  });
  el.querySelectorAll('[data-set-temp]').forEach(b => b.onclick = () => {
    c.temperature = b.dataset.setTemp; Store.save(); openContact(c.id);
  });

  el.querySelectorAll('[data-log]').forEach(b => b.onclick = () => {
    const type = b.dataset.log;
    const content = prompt(`${activityLabel(type)} — décris rapidement :`);
    if (content) { Store.addActivity({ contactId: c.id, type, contenu: content }); toast('Ajouté'); openContact(c.id); }
  });
  el.querySelectorAll('[data-add-task-here]').forEach(b => b.onclick = () => openTaskForm(c.id));
  el.querySelectorAll('[data-new-quote-here]').forEach(b => b.onclick = () => { closeDrawer(); openQuoteEditorForContact(c.id); });
  el.querySelectorAll('[data-edit-contact]').forEach(b => b.onclick = () => openContactForm(c.id));
}

function activityIcon(type){
  const map = {
    call: '<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 01-2.2 2 20 20 0 01-18.7-18.7A2 2 0 013 1h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.7a2 2 0 01-.5 2.1L7 8.6a16 16 0 006 6l1.1-1.1a2 2 0 012.1-.5c.9.3 1.8.5 2.7.6a2 2 0 011.7 2z"/></svg>',
    email: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4zM22 6l-10 7L2 6"/></svg>',
    meeting: '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z"/></svg>',
    note: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6"/></svg>',
    quote: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h4"/></svg>',
    stage: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
    won: '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/></svg>',
    signed: '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/></svg>',
  };
  return map[type] || map.note;
}
function activityLabel(type){
  return { call:'Appel', email:'Email', meeting:'Rendez-vous', note:'Note', quote:'Devis', stage:'Étape mise à jour', won:'Transaction gagnée', signed:'Contrat signé' }[type] || 'Activité';
}

/* =========================================================
   FICHE DEAL
========================================================= */
function openDeal(id){
  const d2 = Store.deal(id);
  if (!d2) return;
  const c = Store.contact(d2.contactId);
  const activities = Store.activitiesOf({ dealId: d2.id });
  const quotes = Store.data.quotes.filter(q => q.dealId === d2.id);
  const invoices = Store.data.invoices.filter(i => i.dealId === d2.id);
  const value = dealValue(d2);

  const stageName = Store.stage(d2.stage)?.nom || '—';
  const isWon = d2.stage === 's_won';
  const isBilling = d2.stage === 's_billing';

  openDrawer(`
    <!-- Header -->
    <div class="dmV2__head">
      <div class="dmV2__id">
        <div class="dmV2__avatar">${(d2.eventType||'V').charAt(0).toUpperCase()}</div>
        <div>
          <h2 class="dmV2__title">${esc(d2.title)}</h2>
          <div class="dmV2__badges">
            ${c ? `<a class="dmV2__source" data-open-contact="${c.id}" style="cursor:pointer">${esc(c.prenom)} ${esc(c.nom)}</a>` : ''}
            <span class="badge badge--${isWon||isBilling?'client':'prospect'}">${esc(stageName)}</span>
            <span class="dmV2__received">${d2.probabilite||0}% probabilité</span>
          </div>
        </div>
      </div>
      <div class="dmV2__actions">
        ${d2.eventDate?`<a class="btn btn--secondary btn--sm" href="${googleCalendarUrl(d2)}" target="_blank" rel="noopener">📅 Google</a>`:''}
        <button class="btn btn--primary btn--sm" data-generate-quote="${d2.id}">+ Créer un devis</button>
      </div>
    </div>

    <!-- 🍷 BLOC BORDEAUX : L'essentiel de la transaction -->
    <div class="dmV2__hero">
      <div class="dmV2__hero-title">Valeur transaction</div>
      <div class="dmV2__hero-main" style="font-size:34px">${fmtMoney(value)}</div>
      <div class="dmV2__hero-grid">
        <div class="dmV2__hero-cell">
          <span class="dmV2__hero-lbl">Événement</span>
          <span class="dmV2__hero-val">${esc(d2.eventType||'—')}</span>
        </div>
        <div class="dmV2__hero-cell">
          <span class="dmV2__hero-lbl">Date</span>
          <span class="dmV2__hero-val">${d2.eventDate?fmtDate(d2.eventDate):'—'}</span>
        </div>
        <div class="dmV2__hero-cell">
          <span class="dmV2__hero-lbl">Lieu</span>
          <span class="dmV2__hero-val">${esc(d2.lieu||'—')}</span>
        </div>
        <div class="dmV2__hero-cell">
          <span class="dmV2__hero-lbl">Invités</span>
          <span class="dmV2__hero-val">${d2.invites||'—'}</span>
        </div>
        ${d2.horaires?`
          <div class="dmV2__hero-cell">
            <span class="dmV2__hero-lbl">Horaires</span>
            <span class="dmV2__hero-val">${esc(d2.horaires)}</span>
          </div>
        `:''}
        <div class="dmV2__hero-cell">
          <span class="dmV2__hero-lbl">Étape pipeline</span>
          <span class="dmV2__hero-val">${esc(stageName)}</span>
        </div>
      </div>
    </div>

    <!-- Devis liés -->
    ${quotes.length ? `
      <div style="margin-bottom:18px">
        <div class="dmV2__section-lbl">Devis (${quotes.length})</div>
        ${quotes.map(q => `
          <div class="dmV2__linked dmV2__linked--quote" data-quote-edit="${q.id}">
            <div class="dmV2__linked-ico">📄</div>
            <div style="flex:1">
              <div class="dmV2__linked-lbl">${quoteStatusBadge(q.statut)}</div>
              <div class="dmV2__linked-name">${esc(q.numero)} · <span class="money">${fmtMoney(Store.quoteTotals(q).ttc)}</span></div>
            </div>
            <span class="dmV2__linked-arrow">→</span>
          </div>
        `).join('')}
      </div>
    ` : `
      <div class="dmV2__linked dmV2__linked--empty" data-generate-quote="${d2.id}">
        <div class="dmV2__linked-ico">📄</div>
        <div style="flex:1">
          <div class="dmV2__linked-lbl">Aucun devis pour cette transaction</div>
          <div class="dmV2__linked-name">Cliquer pour en créer un</div>
        </div>
        <span class="dmV2__linked-arrow">+</span>
      </div>
    `}

    <!-- Factures -->
    ${invoices.length ? `
      <div style="margin-bottom:18px">
        <div class="dmV2__section-lbl">Factures (${invoices.length})</div>
        ${invoices.map(inv => `
          <div class="dmV2__linked dmV2__linked--invoice">
            <div class="dmV2__linked-ico">💳</div>
            <div style="flex:1">
              <div class="dmV2__linked-lbl">${esc(inv.type)} · <span class="badge badge--${inv.statut==='payée'?'client':inv.statut==='partiellement payée'?'warm':'prospect'}">${esc(inv.statut)}</span></div>
              <div class="dmV2__linked-name">${esc(inv.numero)} · <span class="money">${fmtMoney(inv.montant)}</span></div>
            </div>
            ${Store.invoiceRemaining(inv)>0 ? `<button class="btn btn--primary btn--sm" data-encaisser="${inv.id}">+ Encaisser</button>`:''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Activité -->
    <div class="dmV2__section-lbl">Historique</div>
    <div class="timeline">
      ${activities.length ? activities.map(a => `
        <div class="timeline__item">
          <div class="timeline__dot">${activityIcon(a.type)}</div>
          <div class="timeline__content">
            <div class="timeline__title">${activityLabel(a.type)}</div>
            <div class="timeline__body">${esc(a.contenu)}</div>
            <div class="timeline__date">${fmtDateTime(a.createdAt)}</div>
          </div>
        </div>`).join('') : '<div class="mini" style="padding:12px 0">Aucune activité pour l\'instant.</div>'}
    </div>
  `);

  $('#drawer-body')?.querySelectorAll('[data-quote-edit]').forEach(el => el.onclick = () => { closeDrawer(); Router.go('quote-editor', { quoteId: el.dataset.quoteEdit }); });
  $('#drawer-body')?.querySelectorAll('[data-generate-quote]').forEach(b => b.onclick = () => { closeDrawer(); openQuoteEditorForDeal(d2.id); });
  $('#drawer-body')?.querySelector('[data-open-contact]')?.addEventListener('click', () => { closeDrawer(); openContact(c.id); });
}

/* =========================================================
   FORMS
========================================================= */
function openContactForm(id, onCreated, defaultType){
  const c = id ? Store.contact(id) : { id: uid(), type: defaultType || 'prospect', temperature:'neutral', createdAt: Date.now() };
  openModal(`
    <h2 class="form-title">${id?'Modifier le contact':'Nouveau contact'}</h2>
    <p class="form-sub">Prospect, client, professionnel ou partenaire</p>
    <form id="contact-form">
      <div class="field-row">
        <div class="field"><label>Prénom</label><input name="prenom" value="${esc(c.prenom||'')}" required></div>
        <div class="field"><label>Nom</label><input name="nom" value="${esc(c.nom||'')}" required></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Email</label><input name="email" type="email" value="${esc(c.email||'')}"></div>
        <div class="field"><label>Téléphone</label><input name="tel" value="${esc(c.tel||'')}"></div>
      </div>
      <div class="field"><label>Entreprise</label><input name="entreprise" value="${esc(c.entreprise||'')}"></div>
      <div class="field"><label>Adresse</label><input name="adresse" value="${esc(c.adresse||'')}"></div>
      <div class="field-row-3">
        <div class="field"><label>Type</label>
          <select name="type">${['prospect','client','pro','partner'].map(t => `<option value="${t}" ${c.type===t?'selected':''}>${t==='pro'?'Professionnel':t==='partner'?'Partenaire':t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Température</label>
          <select name="temperature">${['hot','warm','cold','neutral'].map(t => `<option value="${t}" ${c.temperature===t?'selected':''}>${tempLabel[t]}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Source</label>
          <select name="source">${['Site internet','Instagram','Facebook','Salon du mariage','Recommandation','Appel téléphonique','WhatsApp','Google','Partenaire','Autre'].map(s => `<option ${c.source===s?'selected':''}>${s}</option>`).join('')}</select>
        </div>
      </div>
      <div class="field"><label>Notes</label><textarea name="notes">${esc(c.notes||'')}</textarea></div>
      <div class="form-actions">
        <button type="button" class="btn btn--ghost" data-close>Annuler</button>
        <button type="submit" class="btn btn--primary">${id?'Enregistrer':'Créer le contact'}</button>
      </div>
    </form>
  `);
  $('#contact-form').onsubmit = e => {
    e.preventDefault();
    Object.assign(c, Object.fromEntries(new FormData(e.target)));
    if (!id) Store.data.contacts.unshift(c);
    Store.save(); closeModal();
    if (id) {
      toast('Contact modifié');
      render();
      openContact(id);
      return;
    }
    // Nouveau contact : reset les filtres + redirige vers la bonne vue pour être sûr de le voir
    if (c.type === 'prospect' || c.type === 'pro' || c.type === 'partner') {
      prospectsFilter.statut = 'all';
      prospectsFilter.q = '';
      Router.go('prospects');
    } else if (c.type === 'client') {
      clientsFilter.q = '';
      Router.go('clients');
    } else {
      render();
    }
    toast(`✓ ${c.prenom} ${c.nom} créé${c.type==='client'?'e':''} · ${c.type}`);
    if (onCreated) onCreated(c.id);
    // Ouvre directement la fiche du nouveau contact pour saisir la suite
    setTimeout(() => openContact(c.id), 100);
  };
}

function openDealForm(id, prefContactId){
  const d2 = id ? Store.deal(id) : { id: uid(), stage:'s_received', probabilite:50, createdAt: Date.now(), contactId: prefContactId||'' };
  const cOptions = Store.data.contacts.map(c => `<option value="${c.id}" ${d2.contactId===c.id?'selected':''}>${esc(c.prenom)} ${esc(c.nom)}${c.entreprise?' · '+esc(c.entreprise):''}</option>`).join('');

  openModal(`
    <h2 class="form-title">${id?'Modifier la transaction':'Nouvelle transaction'}</h2>
    <form id="deal-form">
      <div class="field"><label>Titre</label><input name="title" value="${esc(d2.title||'')}" placeholder="Ex : Mariage Julie & Thomas" required></div>
      <div class="field-row">
        <div class="field"><label>Contact</label><select name="contactId"><option value="">— Choisir —</option>${cOptions}</select></div>
        <div class="field"><label>Étape</label><select name="stage">${Store.data.stages.map(s => `<option value="${s.id}" ${d2.stage===s.id?'selected':''}>${esc(s.nom)}</option>`).join('')}</select></div>
      </div>
      <div class="field-row-3">
        <div class="field"><label>Type</label><input name="eventType" value="${esc(d2.eventType||'')}"></div>
        <div class="field"><label>Date événement</label><input name="eventDate" type="date" value="${d2.eventDate||''}"></div>
        <div class="field"><label>Nb invités</label><input name="invites" type="number" value="${d2.invites||''}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Lieu</label><input name="lieu" value="${esc(d2.lieu||'')}"></div>
        <div class="field"><label>Horaires</label><input name="horaires" value="${esc(d2.horaires||'')}" placeholder="18h — 03h"></div>
      </div>
      <div class="field"><label>Probabilité (%)</label><input name="probabilite" type="number" min="0" max="100" value="${d2.probabilite||50}"></div>
      <div class="form-actions">
        <button type="button" class="btn btn--ghost" data-close>Annuler</button>
        <button type="submit" class="btn btn--primary">${id?'Enregistrer':'Créer'}</button>
      </div>
    </form>
  `);
  $('#deal-form').onsubmit = e => {
    e.preventDefault();
    Object.assign(d2, Object.fromEntries(new FormData(e.target)));
    d2.probabilite = +d2.probabilite; d2.invites = +d2.invites || 0;
    if (!id) Store.data.deals.unshift(d2);
    Store.save(); closeModal();
    toast(id?'Transaction modifiée':'Transaction créée');
    render();
    openDeal(d2.id);
  };
}

function openTaskForm(prefContactId){
  const contactsOpts = Store.data.contacts.map(c => `<option value="${c.id}" ${prefContactId===c.id?'selected':''}>${esc(c.prenom)} ${esc(c.nom)}</option>`).join('');
  const today = new Date(); today.setDate(today.getDate()+1);
  openModal(`
    <h2 class="form-title">Nouvelle tâche</h2>
    <form id="task-form">
      <div class="field"><label>Titre</label><input name="titre" required></div>
      <div class="field-row">
        <div class="field"><label>Contact lié</label><select name="contactId"><option value="">—</option>${contactsOpts}</select></div>
        <div class="field"><label>Échéance</label><input name="due" type="date" value="${today.toISOString().slice(0,10)}" required></div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn--ghost" data-close>Annuler</button>
        <button type="submit" class="btn btn--primary">Créer la tâche</button>
      </div>
    </form>
  `);
  $('#task-form').onsubmit = e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    Store.data.tasks.push({ id: uid(), titre: f.titre, contactId: f.contactId||null, due: new Date(f.due).getTime(), done:false });
    Store.save(); closeModal(); toast('Tâche créée'); render();
  };
}

function openPrestaForm(id){
  const p = id ? Store.presta(id) : { id: uid(), categorie:'', variants:[{label:'Prestation', prix:0}], options:[], actif:true, tva:20 };

  const render = () => {
    openModal(`
      <h2 class="form-title">${id?'Modifier la prestation':'Nouvelle prestation'}</h2>
      <form id="presta-form">
        <div class="field-row">
          <div class="field" style="flex:2"><label>Nom</label><input name="nom" value="${esc(p.nom||'')}" required></div>
          <div class="field"><label>Catégorie</label><input name="categorie" value="${esc(p.categorie||'')}" required list="cat-list"></div>
        </div>
        <datalist id="cat-list">${[...new Set(Store.data.prestations.map(x => x.categorie))].map(x => `<option value="${esc(x)}">`).join('')}</datalist>
        <div class="field"><label>Description</label><textarea name="description" style="min-height:100px">${esc(p.description||'')}</textarea></div>

        <div class="field">
          <label>Variantes de durée &amp; prix</label>
          <div id="variants-editor"></div>
          <button type="button" class="btn btn--secondary btn--sm" id="add-variant" style="margin-top:6px">+ Ajouter une variante</button>
        </div>

        <div class="field">
          <label>Options disponibles</label>
          <div id="options-editor"></div>
          <button type="button" class="btn btn--secondary btn--sm" id="add-option" style="margin-top:6px">+ Ajouter une option</button>
        </div>

        <div class="field-row">
          <div class="field"><label>TVA (%)</label><input name="tva" type="number" value="${p.tva||20}"></div>
          <div class="field"><label>Statut</label>
            <select name="actif"><option value="true" ${p.actif!==false?'selected':''}>Actif</option><option value="false" ${p.actif===false?'selected':''}>Inactif</option></select>
          </div>
        </div>

        <div class="form-actions">
          ${id?`<button type="button" class="btn btn--danger" id="delete-presta">Supprimer</button>`:''}
          <button type="button" class="btn btn--ghost" data-close>Annuler</button>
          <button type="submit" class="btn btn--primary">${id?'Enregistrer':'Créer'}</button>
        </div>
      </form>
    `);

    const variantsEd = $('#variants-editor');
    const renderVariants = () => {
      variantsEd.innerHTML = p.variants.map((v,i) => `
        <div style="display:grid;grid-template-columns:2fr 1fr 32px;gap:6px;margin-bottom:6px">
          <input value="${esc(v.label||'')}" data-v-i="${i}" data-v-k="label" placeholder="Ex : 3 heures">
          <input type="number" value="${v.prix||0}" data-v-i="${i}" data-v-k="prix" placeholder="Prix €">
          <button type="button" style="color:var(--danger);font-size:18px" data-v-remove="${i}">×</button>
        </div>
      `).join('');
      variantsEd.querySelectorAll('input').forEach(el => el.oninput = () => {
        const i = +el.dataset.vI, k = el.dataset.vK;
        p.variants[i][k] = k==='prix' ? (+el.value||0) : el.value;
      });
      variantsEd.querySelectorAll('[data-v-remove]').forEach(b => b.onclick = () => { p.variants.splice(+b.dataset.vRemove,1); renderVariants(); });
    };
    renderVariants();
    $('#add-variant').onclick = () => { p.variants.push({label:'',prix:0}); renderVariants(); };

    const optionsEd = $('#options-editor');
    const renderOptions = () => {
      optionsEd.innerHTML = (p.options||[]).map((o,i) => `
        <div style="display:grid;grid-template-columns:2fr 1fr 32px;gap:6px;margin-bottom:6px">
          <input value="${esc(o.label||'')}" data-o-i="${i}" data-o-k="label" placeholder="Ex : Heure supplémentaire">
          <input type="number" value="${o.prix||0}" data-o-i="${i}" data-o-k="prix" placeholder="Prix €">
          <button type="button" style="color:var(--danger);font-size:18px" data-o-remove="${i}">×</button>
        </div>
      `).join('');
      optionsEd.querySelectorAll('input').forEach(el => el.oninput = () => {
        const i = +el.dataset.oI, k = el.dataset.oK;
        p.options[i][k] = k==='prix' ? (+el.value||0) : el.value;
      });
      optionsEd.querySelectorAll('[data-o-remove]').forEach(b => b.onclick = () => { p.options.splice(+b.dataset.oRemove,1); renderOptions(); });
    };
    renderOptions();
    $('#add-option').onclick = () => { if (!p.options) p.options=[]; p.options.push({label:'',prix:0}); renderOptions(); };

    $('#presta-form').onsubmit = e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      p.nom = f.nom; p.categorie = f.categorie; p.description = f.description;
      p.tva = +f.tva || 20; p.actif = f.actif === 'true';
      if (!id) Store.data.prestations.push(p);
      Store.save(); closeModal(); toast(id?'Prestation modifiée':'Prestation créée');
      window.render ? window.render() : null;
      // Full re-render
      const view = document.querySelector('#view');
      view.innerHTML = renderPrestations(); attachViewHandlers();
    };

    $('#delete-presta')?.addEventListener('click', () => {
      if (!confirm('Supprimer cette prestation du catalogue ?')) return;
      Store.data.prestations = Store.data.prestations.filter(x => x.id !== id);
      Store.save(); closeModal(); toast('Prestation supprimée');
      const view = document.querySelector('#view');
      view.innerHTML = renderPrestations(); attachViewHandlers();
    });
  };
  render();
}

/* =========================================================
   QUICK ADD / GLOBAL SEARCH / IMPORT-EXPORT
========================================================= */
$('#btn-quick-add').onclick = () => {
  openModal(`
    <h2 class="form-title">Créer</h2>
    <div class="grid grid-2">
      <button class="card" style="text-align:left;cursor:pointer" data-qa="contact"><div style="font-family:var(--font-serif);font-size:20px;color:var(--bordeaux)">Contact</div><div class="mini">Prospect, client, pro</div></button>
      <button class="card" style="text-align:left;cursor:pointer" data-qa="deal"><div style="font-family:var(--font-serif);font-size:20px;color:var(--bordeaux)">Transaction</div><div class="mini">Nouvelle opportunité</div></button>
      <button class="card" style="text-align:left;cursor:pointer" data-qa="quote"><div style="font-family:var(--font-serif);font-size:20px;color:var(--bordeaux)">Devis</div><div class="mini">Depuis un contact</div></button>
      <button class="card" style="text-align:left;cursor:pointer" data-qa="task"><div style="font-family:var(--font-serif);font-size:20px;color:var(--bordeaux)">Tâche</div><div class="mini">Relance, appel, RDV</div></button>
    </div>
  `);
  $$('[data-qa]').forEach(b => b.onclick = () => {
    const t = b.dataset.qa; closeModal();
    if (t === 'contact') openContactForm(null, null, Router.current === 'clients' ? 'client' : 'prospect');
    if (t === 'deal') openDealForm();
    if (t === 'task') openTaskForm();
    if (t === 'quote') openNewQuoteFlow();
  });
};

$('#global-search').addEventListener('focus', () => {
  const v = $('#global-search').value;
  openPalette(v);
  $('#global-search').blur();
});
$('#global-search').addEventListener('input', e => {
  openPalette(e.target.value);
  $('#global-search').blur();
});
$('#global-search').setAttribute('placeholder', 'Rechercher partout… (⌘K)');

$('#btn-export').onclick = () => {
  const blob = new Blob([JSON.stringify(Store.data, null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `vision24-crm-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  toast('Export téléchargé');
};

$('#btn-import').onclick = () => $('#file-import').click();
$('#file-import').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try { Store.data = JSON.parse(await f.text()); Store.save(); toast('Données importées'); render(); }
  catch { toast('Fichier invalide'); }
};

/* Reset seed if user needs (via btn-import held-shift) - simple gesture not exposed */
window.__resetCRM = () => { Store.reset(); render(); toast('CRM réinitialisé'); };

/* =========================================================
   DEMANDES — fiche, imports, forms manuels
========================================================= */
function updateDemandesBadge(){
  const nb = Store.demandesCount();
  const el = document.getElementById('nav-badge-demandes');
  if (el) { el.textContent = nb; el.hidden = nb === 0; }
}

function openDemande(id){
  const dm = Store.demande(id);
  if (!dm) return;
  const prospect = dm.prospectId ? Store.contact(dm.prospectId) : null;

  const statutColor = dm.statut==='nouvelle'?'hot':dm.statut==='gagné'?'client':dm.statut==='perdu'?'warm':'prospect';

  openDrawer(`
    <!-- Header : identité + actions -->
    <div class="dmV2__head">
      <div class="dmV2__id">
        <div class="dmV2__avatar">${initials(dm.prenom, dm.nom)}</div>
        <div>
          <h2 class="dmV2__title">${esc(dm.prenom)} ${esc(dm.nom)}</h2>
          <div class="dmV2__badges">
            <span class="dmV2__source">${esc(dm.source)}</span>
            <span class="badge badge--${statutColor}">${DEMANDE_STATUT_LABELS[dm.statut]||dm.statut}</span>
            <span class="dmV2__received">reçue ${fmtDateTime(dm.receivedAt)}</span>
          </div>
        </div>
      </div>
      <div class="dmV2__actions">
        ${dm.tel?`<a class="btn btn--secondary btn--sm" href="tel:${esc(dm.tel)}">📞 Appeler</a>`:''}
        ${dm.email?`<a class="btn btn--secondary btn--sm" href="mailto:${esc(dm.email)}">✉️ Écrire</a>`:''}
        <button class="btn btn--primary btn--sm" data-demande-quote="${dm.id}">+ Créer le devis</button>
      </div>
    </div>

    <!-- 🍷 BLOC BORDEAUX : L'ESSENTIEL POUR PRÉPARER LE DEVIS -->
    <div class="dmV2__hero">
      <div class="dmV2__hero-title">Événement</div>
      <div class="dmV2__hero-main">${esc(dm.typeEvenement || 'Type non précisé')}</div>
      <div class="dmV2__hero-grid">
        <div class="dmV2__hero-cell">
          <span class="dmV2__hero-lbl">Date</span>
          <span class="dmV2__hero-val">${dm.dateEvenement ? fmtDate(dm.dateEvenement) : '—'}</span>
        </div>
        <div class="dmV2__hero-cell">
          <span class="dmV2__hero-lbl">Lieu</span>
          <span class="dmV2__hero-val">${esc(dm.lieuEvenement || '—')}</span>
        </div>
        <div class="dmV2__hero-cell">
          <span class="dmV2__hero-lbl">Invités</span>
          <span class="dmV2__hero-val">${dm.nbPersonnes || '—'}</span>
        </div>
        <div class="dmV2__hero-cell">
          <span class="dmV2__hero-lbl">Budget</span>
          <span class="dmV2__hero-val">${dm.budget ? fmtMoney(dm.budget) : '—'}</span>
        </div>
        ${dm.horaires ? `
          <div class="dmV2__hero-cell">
            <span class="dmV2__hero-lbl">Horaires</span>
            <span class="dmV2__hero-val">${esc(dm.horaires)}</span>
          </div>
        ` : ''}
      </div>
      ${dm.services && dm.services.length ? `
        <div class="dmV2__hero-services">
          <span class="dmV2__hero-lbl">Prestations souhaitées</span>
          <div class="dmV2__hero-tags">${dm.services.map(s => `<span class="dmV2__tag">${esc(s)}</span>`).join('')}</div>
        </div>
      ` : ''}
    </div>

    <!-- Coordonnées client -->
    <div class="dmV2__coords">
      ${dm.email ? `<a class="dmV2__coord dmV2__coord--email" href="mailto:${esc(dm.email)}"><span class="dmV2__coord-ico">✉️</span><div><div class="dmV2__coord-lbl">Email</div><div class="dmV2__coord-val">${esc(dm.email)}</div></div></a>` : ''}
      ${dm.tel ? `<a class="dmV2__coord dmV2__coord--phone" href="tel:${esc(dm.tel)}"><span class="dmV2__coord-ico">📞</span><div><div class="dmV2__coord-lbl">Téléphone</div><div class="dmV2__coord-val">${esc(dm.tel)}</div></div></a>` : ''}
      ${dm.societe ? `<div class="dmV2__coord dmV2__coord--company"><span class="dmV2__coord-ico">🏢</span><div><div class="dmV2__coord-lbl">Société</div><div class="dmV2__coord-val">${esc(dm.societe)}</div></div></div>` : ''}
      ${dm.typeClient ? `<div class="dmV2__coord dmV2__coord--type"><span class="dmV2__coord-ico">${dm.typeClient==='professionnel'?'💼':'👤'}</span><div><div class="dmV2__coord-lbl">Type</div><div class="dmV2__coord-val">${esc(dm.typeClient)}</div></div></div>` : ''}
    </div>

    <!-- Message -->
    ${dm.message ? `
      <div class="dmV2__msg">
        <div class="dmV2__msg-head">💬 Message du prospect</div>
        <div class="dmV2__msg-body">${esc(dm.message)}</div>
      </div>
    ` : ''}

    <!-- Statut de la demande -->
    <div class="dmV2__statut">
      <div class="dmV2__statut-lbl">Statut de traitement</div>
      <select id="demande-statut" class="dm-select" style="width:100%">
        ${DEMANDE_STATUTS.map(s => `<option value="${s}" ${dm.statut===s?'selected':''}>${DEMANDE_STATUT_LABELS[s]}</option>`).join('')}
      </select>
    </div>

    <!-- Prospect associé -->
    ${prospect ? `
      <div class="dmV2__linked" data-open-contact="${prospect.id}">
        <div class="dmV2__linked-ico">👤</div>
        <div style="flex:1">
          <div class="dmV2__linked-lbl">Prospect associé</div>
          <div class="dmV2__linked-name">${esc(prospect.prenom)} ${esc(prospect.nom)}</div>
        </div>
        <span class="dmV2__linked-arrow">→</span>
      </div>
    ` : ''}

    <!-- Devis lié -->
    ${dm.quoteId ? `
      <div class="dmV2__linked dmV2__linked--quote" data-open-quote="${dm.quoteId}">
        <div class="dmV2__linked-ico">📄</div>
        <div style="flex:1">
          <div class="dmV2__linked-lbl">Devis créé</div>
          <div class="dmV2__linked-name">${esc(Store.quote(dm.quoteId)?.numero||'')}</div>
        </div>
        <span class="dmV2__linked-arrow">→</span>
      </div>
    ` : ''}

    ${dm.raw && Object.keys(dm.raw).length ? `
      <details style="margin-top:16px">
        <summary style="cursor:pointer;color:var(--muted);font-size:12px;padding:8px 12px;background:var(--beige-3);border-radius:8px">Voir toutes les données du formulaire (JSON)</summary>
        <pre style="background:var(--beige-3);padding:12px;border-radius:8px;overflow:auto;font-size:11px;max-height:220px;margin-top:8px">${esc(JSON.stringify(dm.raw, null, 2))}</pre>
      </details>
    ` : ''}
  `);

  $('#demande-statut').onchange = e => {
    dm.statut = e.target.value;
    dm.lastModified = Date.now();
    Store.save();
    toast('Statut mis à jour');
    updateDemandesBadge();
  };
  $('[data-demande-quote]')?.addEventListener('click', () => createQuoteFromDemande(dm.id));
  $('[data-open-contact]')?.addEventListener('click', () => { closeDrawer(); openContact(dm.prospectId); });
  $('[data-open-quote]')?.addEventListener('click', () => { closeDrawer(); Router.go('quote-editor', { quoteId: dm.quoteId }); });
}

function createQuoteFromDemande(dmId){
  const dm = Store.demande(dmId);
  if (!dm || !dm.prospectId) return;

  // Trouve ou crée un deal (le deal existe déjà normalement, créé à la réception de la demande)
  let deal = Store.dealsOf(dm.prospectId).find(d => d.demandeId === dm.id);
  if (!deal) {
    deal = {
      id: uid(),
      title: `${dm.typeEvenement||'Événement'} ${dm.prenom} ${dm.nom}`.trim(),
      contactId: dm.prospectId,
      stage: 's_quote_p',
      probabilite: 50,
      eventType: dm.typeEvenement||'',
      eventDate: dm.dateEvenement||'',
      horaires: dm.horaires||'',
      lieu: dm.lieuEvenement||'',
      invites: dm.nbPersonnes||null,
      notes: dm.message||'',
      demandeId: dm.id,
      createdAt: Date.now()
    };
    Store.data.deals.unshift(deal);
  } else {
    // Fait avancer le deal existant : Demande reçue → Devis en préparation
    deal.stage = 's_quote_p';
    deal.probabilite = Math.max(50, deal.probabilite || 30);
  }

  const contact = Store.contact(dm.prospectId);
  const q = createQuoteDraft({ deal, contact });

  // Pré-remplit les services demandés en tentant un mapping avec le catalogue
  if (dm.services && dm.services.length) {
    dm.services.forEach(svcName => {
      const p = Store.data.prestations.find(x =>
        x.nom.toLowerCase().includes(svcName.toLowerCase()) ||
        svcName.toLowerCase().includes(x.nom.toLowerCase().split(' ')[0])
      );
      if (p) {
        const v = (p.variants||[])[0] || { label:'', prix:0 };
        q.items.push({
          prestationId: p.id, nom: p.nom, variantLabel: v.label,
          description: p.description, qte: 1, prix: v.prix,
          options: (p.options||[]).map(o => ({ label:o.label, prix:o.prix||0, checked: !!o.incluseParDefaut }))
        });
      }
    });
  }
  Store.data.quotes.push(q);
  dm.quoteId = q.id;
  dm.statut = 'devis_à_préparer';
  dm.lastModified = Date.now();
  Store.save();
  toast('Devis créé et pré-rempli depuis la demande');
  closeDrawer();
  Router.go('quote-editor', { quoteId: q.id });
}

function openRelancerModal(demandeId){
  const dm = Store.demande(demandeId);
  if (!dm) return;
  const c = dm.prospectId ? Store.contact(dm.prospectId) : null;
  const quote = dm.quoteId ? Store.quote(dm.quoteId) : null;

  // Template automatique selon le statut actuel
  const nextStatut = dm.statut === 'devis_envoyé' ? 'relance_1'
                   : dm.statut === 'relance_1' ? 'relance_2'
                   : dm.statut === 'relance_2' ? 'relance_3'
                   : dm.statut === 'nouvelle' ? 'à_traiter'
                   : dm.statut;

  const prenom = dm.prenom || '';
  const evtType = dm.typeEvenement ? dm.typeEvenement.toLowerCase() : 'événement';
  const devisRef = quote ? ` (devis ${quote.numero})` : '';

  const sujet = `Vision 24 · Suivi de votre ${evtType}${devisRef}`;
  const corps = `Bonjour ${prenom},\n\nJ'espère que vous allez bien. Je reviens vers vous concernant votre projet de ${evtType}${dm.dateEvenement?` prévu le ${new Date(dm.dateEvenement).toLocaleDateString('fr-FR')}`:''}.\n\n${quote ? `Avez-vous eu l'occasion de consulter le devis n°${quote.numero} que je vous ai envoyé ? Je serais ravi d'échanger si vous avez la moindre question ou besoin d'ajustement.` : `Je souhaiterais savoir si vous avez toujours besoin de nos prestations. Nous serions ravis de vous accompagner sur ce beau projet.`}\n\nN'hésitez pas à me contacter au 07 82 61 32 16 pour en discuter.\n\nBien à vous,\nAnthony · Vision 24\nVotre projet, notre vision`;

  openModal(`
    <h2 class="form-title">Relancer ${esc(dm.prenom)} ${esc(dm.nom)}</h2>
    <p class="form-sub">Statut actuel : <span class="badge badge--prospect">${DEMANDE_STATUT_LABELS[dm.statut]}</span> · sera changé en <span class="badge badge--warm">${DEMANDE_STATUT_LABELS[nextStatut]}</span></p>
    <form id="relancer-form">
      <div class="field"><label>Destinataire</label><input name="to" type="email" value="${esc(dm.email||'')}" required></div>
      <div class="field"><label>Sujet</label><input name="sujet" value="${esc(sujet)}" required></div>
      <div class="field"><label>Message</label><textarea name="corps" rows="10" style="font-family:inherit">${esc(corps)}</textarea></div>
      <div class="mini" style="background:var(--beige-3);padding:10px;border-radius:8px">
        📌 En envoyant, le statut passe automatiquement à <strong>${DEMANDE_STATUT_LABELS[nextStatut]}</strong> et une activité est ajoutée à l'historique.
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn--ghost" data-close>Annuler</button>
        <button type="submit" class="btn btn--primary">Envoyer la relance</button>
      </div>
    </form>
  `);
  $('#relancer-form').onsubmit = async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const apiUrl = localStorage.getItem('v24_intake_url');
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Envoi…';

    let sent = false;
    if (apiUrl) {
      try {
        const r = await fetch(apiUrl.replace(/\/$/,'') + '/send-email.php', {
          method: 'POST',
          headers: { 'content-type':'application/json', 'x-vision-token': localStorage.getItem('v24_intake_token')||'' },
          body: JSON.stringify({ to: f.to, subject: f.sujet, body: f.corps })
        });
        const data = await r.json();
        if (data.ok) sent = true;
      } catch (err) { /* fallback */ }
    }
    if (!sent) {
      const mailto = `mailto:${encodeURIComponent(f.to)}?subject=${encodeURIComponent(f.sujet)}&body=${encodeURIComponent(f.corps)}`;
      window.location.href = mailto;
    }

    dm.statut = nextStatut;
    dm.lastModified = Date.now();
    Store.addActivity({
      contactId: dm.prospectId,
      dealId: dm.dealId,
      type: 'email',
      contenu: `Relance envoyée à ${f.to} · ${f.sujet}`
    });
    Store.save();
    toast(sent ? 'Relance envoyée ✅' : 'Email ouvert dans Outlook');
    closeModal();
    render();
  };
}

function openImportJSON(){
  openModal(`
    <h2 class="form-title">Importer une demande</h2>
    <p class="form-sub">Colle ici le JSON reçu par email (Formspree, Web3Forms…) ou depuis ton webhook.</p>
    <form id="import-json-form">
      <div class="field">
        <label>Payload JSON</label>
        <textarea name="json" rows="12" style="font-family:monospace;font-size:12px" placeholder='{
  "source": "vision24.fr",
  "prenom": "Jean",
  "nom": "Dupont",
  "email": "jean@example.fr",
  "tel": "06...",
  "typeEvenement": "Mariage",
  "dateEvenement": "2027-06-26",
  "lieuEvenement": "Domaine X",
  "nbPersonnes": 120,
  "services": ["Photobooth"],
  "message": "…"
}' required></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn--ghost" data-close>Annuler</button>
        <button type="submit" class="btn btn--primary">Importer</button>
      </div>
    </form>
  `);
  $('#import-json-form').onsubmit = e => {
    e.preventDefault();
    try {
      const payload = JSON.parse(new FormData(e.target).get('json'));
      const { demande, prospect, duplicate } = Store.receiveDemande(payload);
      closeModal();
      toast(duplicate ? 'Demande déjà présente' : `Demande importée · ${prospect.prenom} ${prospect.nom}`);
      Router.go('demandes');
      setTimeout(() => openDemande(demande.id), 200);
    } catch (err) {
      toast('JSON invalide : ' + err.message);
    }
  };
}

function openManualDemandeForm(){
  openModal(`
    <h2 class="form-title">Ajouter une demande</h2>
    <p class="form-sub">Saisie manuelle (téléphone, salon…)</p>
    <form id="new-dm-form">
      <div class="field-row">
        <div class="field"><label>Prénom</label><input name="prenom" required></div>
        <div class="field"><label>Nom</label><input name="nom" required></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Email</label><input name="email" type="email"></div>
        <div class="field"><label>Téléphone</label><input name="tel"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Type d'événement</label><input name="typeEvenement" placeholder="Mariage, Séminaire…"></div>
        <div class="field"><label>Date événement</label><input name="dateEvenement" type="date"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Lieu</label><input name="lieuEvenement"></div>
        <div class="field"><label>Nb invités</label><input name="nbPersonnes" type="number"></div>
      </div>
      <div class="field"><label>Source</label>
        <select name="source">
          <option value="vision24.fr">vision24.fr</option>
          <option value="vision24.fun">vision24.fun</option>
          <option value="téléphone">Téléphone</option>
          <option value="salon">Salon</option>
          <option value="recommandation">Recommandation</option>
          <option value="autre">Autre</option>
        </select>
      </div>
      <div class="field"><label>Message</label><textarea name="message"></textarea></div>
      <div class="form-actions">
        <button type="button" class="btn btn--ghost" data-close>Annuler</button>
        <button type="submit" class="btn btn--primary">Créer la demande</button>
      </div>
    </form>
  `);
  $('#new-dm-form').onsubmit = e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    if (f.nbPersonnes) f.nbPersonnes = +f.nbPersonnes;
    const { demande, prospect } = Store.receiveDemande(f);
    closeModal();
    // Reset filtres pour que le nouveau prospect soit toujours visible
    prospectsFilter.statut = 'all';
    prospectsFilter.q = '';
    Router.go('prospects');
    toast(`✓ ${prospect.prenom} ${prospect.nom} ajouté à tes prospects`);
    updateDemandesBadge();
    // Ouvre la fiche du prospect (pas la demande) pour tout voir d'un coup
    setTimeout(() => openContact(prospect.id), 150);
  };
}

/* Interface publique pour les webhooks / consoles */
window.CRM = {
  receiveDemande: p => {
    const r = Store.receiveDemande(p);
    render();
    updateDemandesBadge();
    return r;
  },
  configureIntake(url, token){
    localStorage.setItem('v24_intake_url', url);
    localStorage.setItem('v24_intake_token', token);
    toast('Intake configuré · sync auto activée');
    startIntakePolling();
  },
  disconnectIntake(){
    localStorage.removeItem('v24_intake_url');
    localStorage.removeItem('v24_intake_token');
    stopIntakePolling();
    toast('Sync désactivée');
  }
};

/* =========================================================
   POLLING INTAKE — récupère les demandes depuis le Cloudflare Worker
========================================================= */
let intakePollTimer = null;
const INTAKE_POLL_INTERVAL_MS = 30_000;

async function pollIntakeOnce(){
  const url   = localStorage.getItem('v24_intake_url');
  const token = localStorage.getItem('v24_intake_token');
  if (!url || !token) return;

  try {
    const res = await fetch(url.replace(/\/$/,'') + '/pull', {
      headers: { 'x-vision-token': token }
    });
    if (!res.ok) return console.warn('intake pull failed', res.status);
    const data = await res.json();
    if (!data.demandes?.length) return;

    const acked = [];
    for (const p of data.demandes) {
      const r = Store.receiveDemande(p);
      if (!r.duplicate) acked.push(p.id);
      else acked.push(p.id); // ack quand même sinon boucle
    }

    // ack pour retirer de la queue
    if (acked.length) {
      await fetch(url.replace(/\/$/,'') + '/ack', {
        method:'POST',
        headers:{ 'content-type':'application/json', 'x-vision-token': token },
        body: JSON.stringify({ ids: acked })
      });
    }

    updateDemandesBadge();
    // Rafraîchit la vue si on est sur une vue qui affiche les demandes/prospects
    if (['demandes','prospects','dashboard','pipeline'].includes(Router.current)) render();
    if (acked.length > 0) toast(`${acked.length} nouvelle${acked.length>1?'s':''} demande${acked.length>1?'s':''}`);
  } catch (err) {
    console.warn('intake poll error', err);
  }
}

function startIntakePolling(){
  stopIntakePolling();
  pollIntakeOnce();
  intakePollTimer = setInterval(pollIntakeOnce, INTAKE_POLL_INTERVAL_MS);
}
function stopIntakePolling(){
  if (intakePollTimer) { clearInterval(intakePollTimer); intakePollTimer = null; }
}
// démarre automatiquement si configuré
if (localStorage.getItem('v24_intake_url')) startIntakePolling();

/* Auto-import depuis paramètre URL ?intake=<base64json> */
(function autoIntake(){
  const params = new URLSearchParams(location.search);
  const raw = params.get('intake');
  if (!raw) return;
  try {
    const payload = JSON.parse(atob(raw));
    Store.receiveDemande(payload);
    history.replaceState(null, '', location.pathname);
    toast('Nouvelle demande importée depuis l\'URL');
  } catch (e) { console.warn('intake URL invalide', e); }
})();

/* =========================================================
   BOOT
========================================================= */
render();
updateDemandesBadge();
