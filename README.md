# SOGA Backend API

Backend API custom pour le site institutionnel SOGA Senegal.

## Stack Technique

- **Runtime** : Node.js 20.x LTS
- **Framework** : Express.js
- **ORM** : Prisma
- **Base de données** : PostgreSQL
- **Authentification** : JWT
- **Validation** : Zod
- **Upload** : Multer

## Installation

### Prérequis

- Node.js 20.x LTS
- PostgreSQL 15.x
- npm ou yarn

### Étapes

1. Installer les dépendances :
```bash
cd backend
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

Éditez `.env` avec vos configurations :
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/soga_db"
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_ORIGINS=https://sogasenegal.com,https://www.sogasenegal.com,http://localhost:3000
```

3. Créer la base de données PostgreSQL :
```sql
CREATE DATABASE soga_db;
CREATE USER soga_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE soga_db TO soga_user;
```

4. Exécuter les migrations Prisma :
```bash
npm run prisma:migrate
```

5. Générer le client Prisma :
```bash
npm run prisma:generate
```

6. (Optionnel) Exécuter le seed pour créer un utilisateur admin :
```bash
npm run seed
```

## Développement

### Lancer le serveur en mode développement
```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`

### Lancer Prisma Studio (interface visuelle de la base de données)
```bash
npm run prisma:studio
```

## Build pour production

```bash
npm run build
npm start
```

## API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription (admin only)
- `GET /api/auth/me` - Obtenir l'utilisateur courant

### Collections
- `GET/POST /api/formations` - Liste/Créer formations
- `GET/PUT/DELETE /api/formations/:id` - Gérer une formation
- `GET/POST /api/articles` - Liste/Créer articles
- `GET/PUT/DELETE /api/articles/:id` - Gérer un article
- `GET/POST /api/evenements` - Liste/Créer événements
- `GET/PUT/DELETE /api/evenements/:id` - Gérer un événement
- `GET/POST /api/partenaires` - Liste/Créer partenaires
- `GET/PUT/DELETE /api/partenaires/:id` - Gérer un partenaire
- `GET/POST /api/temoignages` - Liste/Créer témoignages
- `GET/PUT/DELETE /api/temoignages/:id` - Gérer un témoignage
- `GET/POST /api/equipe` - Liste/Créer équipe
- `GET/PUT/DELETE /api/equipe/:id` - Gérer un membre
- `GET/POST /api/experts` - Liste/Créer experts
- `GET/PUT/DELETE /api/experts/:id` - Gérer un expert
- `GET/POST /api/publications` - Liste/Créer publications
- `GET/PUT/DELETE /api/publications/:id` - Gérer une publication
- `GET/POST /api/thematiques` - Liste/Créer thématiques
- `GET/PUT/DELETE /api/thematiques/:id` - Gérer une thématique
- `GET/PUT /api/institution` - Gérer institution (singleton)

### Upload
- `POST /api/upload` - Upload d'image ou fichier

### Health
- `GET /api/health` - Health check

## Authentification

La plupart des endpoints nécessitent un token JWT dans le header :

```
Authorization: Bearer <token>
```

Les endpoints DELETE nécessitent le rôle `admin`.

## Migration des données depuis TinaCMS

Un script de migration est disponible pour migrer les données depuis les fichiers JSON de TinaCMS vers PostgreSQL.

```bash
npm run migrate
```

## Déploiement

### Sur VPS avec PM2

1. Build le projet :
```bash
npm run build
```

2. Configurer PM2 :
```bash
pm2 start dist/server.js --name soga-api
pm2 save
pm2 startup
```

3. Configurer Nginx comme reverse proxy vers `http://localhost:3000`

## Structure du projet

```
backend/
├── src/
│   ├── lib/
│   │   └── prisma.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── formations.ts
│   │   ├── articles.ts
│   │   ├── evenements.ts
│   │   ├── partenaires.ts
│   │   ├── temoignages.ts
│   │   ├── equipe.ts
│   │   ├── experts.ts
│   │   ├── publications.ts
│   │   ├── thematiques.ts
│   │   ├── institution.ts
│   │   └── upload.ts
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── uploads/
├── package.json
├── tsconfig.json
└── .env
```

## Support

Pour toute question ou problème, consultez le cahier des charges technique : `CAHIER_DES_CHARGES_BACKEND.md`
