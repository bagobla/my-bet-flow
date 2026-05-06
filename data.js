const bookmakers = [
  "Stake",
  "Betify",
  "Lolly Bet",
  "Winamax",
  "Betclic",
  "Unibet",
  "Autre"
];

const teamsByCompetition = {
  "Premier League": [
    "Arsenal",
    "Aston Villa",
    "Bournemouth",
    "Brentford",
    "Brighton",
    "Burnley",
    "Chelsea",
    "Crystal Palace",
    "Everton",
    "Fulham",
    "Leeds",
    "Liverpool",
    "Manchester City",
    "Manchester United",
    "Newcastle",
    "Nottingham Forest",
    "Sunderland",
    "Tottenham",
    "West Ham",
    "Wolves"
  ],

  "Bundesliga": [
    "Augsburg",
    "Bayer Leverkusen",
    "Bayern Munich",
    "Borussia Dortmund",
    "Borussia Mönchengladbach",
    "Cologne",
    "Eintracht Francfort",
    "Fribourg",
    "Hambourg",
    "Heidenheim",
    "Hoffenheim",
    "Mayence",
    "RB Leipzig",
    "St. Pauli",
    "Stuttgart",
    "Union Berlin",
    "Werder Brême",
    "Wolfsburg"
  ],

  "La Liga": [
    "Alavés",
    "Athletic Bilbao",
    "Atlético Madrid",
    "Barcelona",
    "Betis",
    "Celta Vigo",
    "Elche",
    "Espanyol",
    "Getafe",
    "Girona",
    "Levante",
    "Mallorca",
    "Osasuna",
    "Rayo Vallecano",
    "Real Madrid",
    "Real Oviedo",
    "Real Sociedad",
    "Sevilla",
    "Valencia",
    "Villarreal"
  ],

  "Ligue 1": [
    "Angers",
    "Auxerre",
    "Brest",
    "Le Havre",
    "Lens",
    "Lille",
    "Lorient",
    "Lyon",
    "Marseille",
    "Metz",
    "Monaco",
    "Nantes",
    "Nice",
    "Paris FC",
    "PSG",
    "Rennes",
    "Strasbourg",
    "Toulouse"
  ],

  "Ligue 2": [
    "Annecy",
    "Bastia",
    "Boulogne",
    "Clermont",
    "Dunkerque",
    "Grenoble",
    "Guingamp",
    "Laval",
    "Le Mans",
    "Montpellier",
    "Nancy",
    "Pau FC",
    "Reims",
    "Red Star",
    "Rodez",
    "Saint-Étienne",
    "Troyes"
  ],

  "Serie A": [
    "AC Milan",
    "AS Rome",
    "Atalanta",
    "Bologne",
    "Cagliari",
    "Como",
    "Cremonese",
    "Fiorentina",
    "Genoa",
    "Hellas Vérone",
    "Inter",
    "Juventus",
    "Lazio",
    "Lecce",
    "Naples",
    "Parme",
    "Pisa",
    "Sassuolo",
    "Torino",
    "Udinese"
  ],

  "Liga Portugal": [
    "AFS",
    "Alverca",
    "Arouca",
    "Benfica",
    "Braga",
    "Casa Pia",
    "Estoril",
    "Estrela",
    "Famalicão",
    "Gil Vicente",
    "Guimarães",
    "Moreirense",
    "Nacional",
    "Porto",
    "Rio Ave",
    "Santa Clara",
    "Sporting",
    "Tondela"
  ],

  "Coupe du Monde": [
    "Afrique du Sud",
    "Algérie",
    "Allemagne",
    "Angleterre",
    "Arabie Saoudite",
    "Argentine",
    "Australie",
    "Autriche",
    "Belgique",
    "Bosnie-Herzégovine",
    "Brésil",
    "Canada",
    "Cap-Vert",
    "Colombie",
    "Corée du Sud",
    "Côte d'Ivoire",
    "Croatie",
    "Curaçao",
    "Écosse",
    "Égypte",
    "Équateur",
    "Espagne",
    "États-Unis",
    "France",
    "Ghana",
    "Haïti",
    "Irak",
    "Iran",
    "Japon",
    "Jordanie",
    "Maroc",
    "Mexique",
    "Norvège",
    "Nouvelle-Zélande",
    "Ouzbékistan",
    "Panama",
    "Paraguay",
    "Pays-Bas",
    "Portugal",
    "Qatar",
    "RD Congo",
    "République tchèque",
    "Sénégal",
    "Suède",
    "Suisse",
    "Tunisie",
    "Turquie",
    "Uruguay"
  ],

  "Ligue des champions": [],
  "Europa League": [],
  "Conference League": [],
  "Autre": []
};

const pronoData = {
  general: {
    "Résultat": [
      "match nul"
    ],

    "Buts": [],

    "Cartons": [],

    "VAR": [],

    "Autre": [
      "but sur penalty",
      "but sur coup franc",
      "expulsion dans le match",
      "Autre / personnalisé"
    ]
  },

  both: {
    "BTTS": [
      "les deux équipes marquent",
      "les deux équipes ne marquent pas"
    ],

    "Mi-temps": [
      "les deux équipes marquent en 1ère mi-temps",
      "les deux équipes marquent en 2ème mi-temps",
      "les deux équipes marquent dans les deux périodes"
    ],

    "Type de but": [
      "les deux équipes marquent sur penalty",
      "les deux équipes marquent sur coup franc"
    ],

    "Autre": [
      "Autre / personnalisé"
    ]
  },

  home: {
    "Résultat": [
      "gagne le match",
      "gagne par au moins 2 buts d’écart",
      "gagne par au moins 3 buts d’écart",
      "mène d’1 but dans le match (1UP)",
      "mène de 2 buts dans le match (2UP)",
      "ne perd pas le match",
      "ne perd pas ou perd d’un but"
    ],

    "Qualification": [
      "se qualifie",
      "se qualifie en prolongation",
      "se qualifie aux tirs au but"
    ],

    "Buts": [
      "marque 1 but",
      "marque 2 buts",
      "marque 3 buts",
      "marque 4 buts",
      "marque en 1ère mi-temps",
      "marque sur penalty",
      "marque sur coup franc"
    ],

    "Mi-temps": [
      "gagne la 1ère mi-temps",
      "ne perd pas la 1ère mi-temps",
      "gagne une des mi-temps",
      "gagne les deux mi-temps"
    ],

    "Discipline": [
      "un joueur est exclu"
    ],

    "Autre": [
      "Autre / personnalisé"
    ]
  },

  away: {
    "Résultat": [
      "gagne le match",
      "gagne par au moins 2 buts d’écart",
      "gagne par au moins 3 buts d’écart",
      "mène d’1 but dans le match (1UP)",
      "mène de 2 buts dans le match (2UP)",
      "ne perd pas le match",
      "ne perd pas ou perd d’un but"
    ],

    "Qualification": [
      "se qualifie",
      "se qualifie en prolongation",
      "se qualifie aux tirs au but"
    ],

    "Buts": [
      "marque 1 but",
      "marque 2 buts",
      "marque 3 buts",
      "marque 4 buts",
      "marque en 1ère mi-temps",
      "marque sur penalty",
      "marque sur coup franc"
    ],

    "Mi-temps": [
      "gagne la 1ère mi-temps",
      "ne perd pas la 1ère mi-temps",
      "gagne une des mi-temps",
      "gagne les deux mi-temps"
    ],

    "Discipline": [
      "un joueur est exclu"
    ],

    "Autre": [
      "Autre / personnalisé"
    ]
  }
};