import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data...');

  // Formations
  await prisma.formation.create({
    data: {
      titre: 'Formation Gestion Pétrolière',
      slug: 'formation-gestion-petroliere',
      codeFiliere: 'GP',
      pole: 'Technique',
      niveau: 'Avancé',
      rythme: 'Temps plein',
      duree: '3 mois',
      description: 'Formation complète sur la gestion du secteur pétrolier',
      published: true
    }
  }).catch(() => {});

  await prisma.formation.create({
    data: {
      titre: 'Formation Énergies Renouvelables',
      slug: 'formation-energies-renouvelables',
      codeFiliere: 'ER',
      pole: 'Technique',
      niveau: 'Intermédiaire',
      rythme: 'Temps partiel',
      duree: '2 mois',
      description: 'Formation sur les énergies renouvelables et leur gestion',
      published: true
    }
  }).catch(() => {});

  // Articles
  await prisma.article.create({
    data: {
      titre: 'Visite au Ministère de l\'Énergie',
      slug: 'visite-ministere-energie',
      resume: 'Visite pédagogique des étudiants au Ministère',
      contenu: 'Le 23 juillet 2026, la Senegal Oil and Gas Academy a organisé une visite intégrale du Building Mamadou Dia. Cette visite a permis aux étudiants de découvrir l\'institution qui pilote la politique énergétique nationale.',
      image: '/media/actualite-ministere-energie.jpg',
      date: new Date('2026-07-23'),
      published: true
    }
  }).catch(() => {});

  await prisma.article.create({
    data: {
      titre: 'Nouveau partenariat stratégique',
      slug: 'nouveau-partenariat',
      resume: 'Signature d\'un accord avec un partenaire international',
      contenu: 'SOGA signe un nouveau partenariat pour renforcer ses formations.',
      image: '/media/partenariat.jpg',
      date: new Date('2026-08-15'),
      published: true
    }
  }).catch(() => {});

  // Événements
  await prisma.evenement.create({
    data: {
      titre: 'Conférence sur le Pétrole',
      slug: 'conference-petrole',
      description: 'Conférence internationale sur l\'industrie pétrolière',
      date: new Date('2026-10-15'),
      lieu: 'Dakar',
      published: true
    }
  }).catch(() => {});

  await prisma.evenement.create({
    data: {
      titre: 'Journée Portes Ouvertes',
      slug: 'journee-portes-ouvertes',
      description: 'Découverte des formations SOGA',
      date: new Date('2026-11-20'),
      lieu: 'Campus SOGA',
      published: true
    }
  }).catch(() => {});

  // Partenaires
  await prisma.partenaire.create({
    data: {
      nom: 'Pétrosen',
      slug: 'petrosen',
      logo: '/media/petrosen-logo.png',
      description: 'Société Nationale des Pétroles du Sénégal',
      published: true
    }
  }).catch(() => {});

  await prisma.partenaire.create({
    data: {
      nom: 'COS-Petrogaz',
      slug: 'cos-petrogaz',
      logo: '/media/cos-petrogaz-logo.png',
      description: 'Comité d\'Orientation Stratégique du Pétrole et du Gaz',
      published: true
    }
  }).catch(() => {});

  // Témoignages
  await prisma.temoignage.create({
    data: {
      nom: 'Amadou Diallo',
      slug: 'amadou-diallo',
      role: 'Ancien étudiant',
      contenu: 'La formation SOGA m\'a permis de décrocher un poste dans une grande compagnie pétrolière.',
      image: '/media/temoignage1.jpg',
      published: true
    }
  }).catch(() => {});

  await prisma.temoignage.create({
    data: {
      nom: 'Fatou Ndiaye',
      slug: 'fatou-ndiaye',
      role: 'Ancienne étudiante',
      contenu: 'Excellent programme avec des formateurs compétents.',
      image: '/media/temoignage2.jpg',
      published: true
    }
  }).catch(() => {});

  // Équipe
  await prisma.equipe.create({
    data: {
      nom: 'Sow',
      prenom: 'Mouhamadou',
      role: 'Directeur Général',
      bio: 'Expert en gestion pétrolière avec 20 ans d\'expérience',
      email: 'dg@sogasenegal.com',
      image: '/media/dg.jpg',
      linkedin: 'https://linkedin.com/in/dg-soga',
      published: true
    }
  }).catch(() => {});

  await prisma.equipe.create({
    data: {
      nom: 'Diop',
      prenom: 'Aminata',
      role: 'Responsable Pédagogique',
      bio: 'Spécialiste en ingénierie pédagogique',
      email: 'pedago@sogasenegal.com',
      image: '/media/pedago.jpg',
      linkedin: 'https://linkedin.com/in/pedago-soga',
      published: true
    }
  }).catch(() => {});

  // Experts
  await prisma.expert.create({
    data: {
      nom: 'Fall',
      prenom: 'Ibrahima',
      slug: 'ibrahima-fall',
      specialite: 'Gestion Pétrolière',
      bio: 'Expert international en gestion pétrolière',
      image: '/media/expert1.jpg',
      published: true
    }
  }).catch(() => {});

  await prisma.expert.create({
    data: {
      nom: 'Kane',
      prenom: 'Mariama',
      slug: 'mariama-kane',
      specialite: 'Énergies Renouvelables',
      bio: 'Spécialiste en énergies renouvelables',
      image: '/media/expert2.jpg',
      published: true
    }
  }).catch(() => {});

  // Thématiques
  await prisma.thematique.create({
    data: {
      nom: 'Gouvernance',
      slug: 'gouvernance',
      description: 'Cadres légaux, fonds souverains, transparence fiscale',
      published: true
    }
  }).catch(() => {});

  await prisma.thematique.create({
    data: {
      nom: 'Transition Énergétique',
      slug: 'transition-energetique',
      description: 'Trajectoires de décarbonation, mix énergétique souverain',
      published: true
    }
  }).catch(() => {});

  console.log('✅ Test data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
