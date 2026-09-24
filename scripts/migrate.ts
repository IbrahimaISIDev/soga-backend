import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// The frontend/backend repos are no longer a single monorepo checkout, so the
// content/ directory's location relative to this script isn't fixed — override
// with CONTENT_DIR when the two repos aren't checked out as siblings.
const CONTENT_DIR =
  process.env.CONTENT_DIR || path.join(__dirname, '../../frontend/content');

async function migrateFormations() {
  console.log('📚 Migrating Formations...');
  const formationsDir = path.join(CONTENT_DIR, 'formations');

  if (!fs.existsSync(formationsDir)) {
    console.log('  ⚠️  Formations directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(formationsDir);
  let count = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(formationsDir, file), 'utf-8'));

      const fields = {
        titre: data.titre,
        slug: data.slug,
        codeFiliere: data.code || '',
        pole: data.pole || '',
        niveau: data.niveau || '',
        rythme: data.mode || '',
        duree: data.duree || '',
        description: data.description || '',
        image: data.image || '',
        published: true,
        rentree: data.rentree || null,
        placesLimitees: data.placesLimitees || false,
        capacite: data.capacite ?? null,
        brochureUrl: data.brochureUrl || null,
        objectifs: data.objectifs || '',
        conditionsAdmission: data.conditionsAdmission || '',
        publicConcerne: data.publicConcerne || '',
        debouches: data.debouches || [],
        semestres: data.semestres && data.semestres.length > 0 ? data.semestres : null
      };

      await prisma.formation.upsert({
        where: { slug: data.slug },
        update: fields,
        create: fields
      });
      count++;
    } catch (error) {
      console.error(`  ❌ Error migrating ${file}:`, error);
    }
  }

  console.log(`  ✅ Migrated ${count} formations`);
}

async function migrateArticles() {
  console.log('📰 Migrating Articles...');
  const articlesDir = path.join(CONTENT_DIR, 'articles');

  if (!fs.existsSync(articlesDir)) {
    console.log('  ⚠️  Articles directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(articlesDir);
  let count = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(articlesDir, file), 'utf-8'));

      const fields = {
        titre: data.titre,
        slug: data.slug,
        resume: data.extrait || '',
        contenu: Array.isArray(data.contenu) ? data.contenu.join('\n\n') : data.contenu || '',
        categorie: data.categorie || '',
        image: data.image || '',
        date: data.date ? new Date(data.date) : new Date(),
        published: true
      };

      await prisma.article.upsert({
        where: { slug: data.slug },
        update: fields,
        create: fields
      });
      count++;
    } catch (error) {
      console.error(`  ❌ Error migrating ${file}:`, error);
    }
  }

  console.log(`  ✅ Migrated ${count} articles`);
}

async function migrateEvenements() {
  console.log('📅 Migrating Evenements...');
  const evenementsDir = path.join(CONTENT_DIR, 'evenements');

  if (!fs.existsSync(evenementsDir)) {
    console.log('  ⚠️  Evenements directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(evenementsDir);
  let count = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(evenementsDir, file), 'utf-8'));

      const fields = {
        titre: data.titre,
        slug: data.slug,
        description: data.description || '',
        date: data.date ? new Date(data.date) : new Date(),
        lieu: data.lieu || '',
        image: data.image || '',
        published: data.published ?? true
      };

      await prisma.evenement.upsert({
        where: { slug: data.slug },
        update: fields,
        create: fields
      });
      count++;
    } catch (error) {
      console.error(`  ❌ Error migrating ${file}:`, error);
    }
  }

  console.log(`  ✅ Migrated ${count} evenements`);
}

async function migratePartenaires() {
  console.log('🤝 Migrating Partenaires...');
  const partenairesDir = path.join(CONTENT_DIR, 'partenaires');

  if (!fs.existsSync(partenairesDir)) {
    console.log('  ⚠️  Partenaires directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(partenairesDir);
  let count = 0;

  // Partenaire has no unique slug column — matched by nom instead, which is
  // unique across the real content (unlike several other collections here,
  // whose provisional entries currently share "Contenu provisoire" as nom).
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(partenairesDir, file), 'utf-8'));

      const fields = {
        nom: data.nom,
        logo: data.logo || '',
        description: data.description || '',
        published: true
      };

      const existing = await prisma.partenaire.findFirst({ where: { nom: data.nom } });
      if (existing) {
        await prisma.partenaire.update({ where: { id: existing.id }, data: fields });
      } else {
        await prisma.partenaire.create({ data: fields });
      }
      count++;
    } catch (error) {
      console.error(`  ❌ Error migrating ${file}:`, error);
    }
  }

  console.log(`  ✅ Migrated ${count} partenaires`);
}

async function migrateTemoignages() {
  console.log('💬 Migrating Temoignages...');
  const temoignagesDir = path.join(CONTENT_DIR, 'temoignages');

  if (!fs.existsSync(temoignagesDir)) {
    console.log('  ⚠️  Temoignages directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(temoignagesDir);
  let count = 0;

  // Temoignage has no unique slug column, and several entries currently
  // share "Contenu provisoire" as auteur — matched by role (the JSON's
  // "titre", e.g. "Ingénieur de production") instead, which is unique.
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(temoignagesDir, file), 'utf-8'));

      const fields = {
        nom: data.auteur || '',
        role: data.titre || '',
        contenu: data.texte || '',
        image: data.photo || '',
        published: true
      };

      const existing = await prisma.temoignage.findFirst({ where: { role: data.titre } });
      if (existing) {
        await prisma.temoignage.update({ where: { id: existing.id }, data: fields });
      } else {
        await prisma.temoignage.create({ data: fields });
      }
      count++;
    } catch (error) {
      console.error(`  ❌ Error migrating ${file}:`, error);
    }
  }

  console.log(`  ✅ Migrated ${count} temoignages`);
}

async function migrateEquipe() {
  console.log('👥 Migrating Equipe...');
  const equipeDir = path.join(CONTENT_DIR, 'equipe');

  if (!fs.existsSync(equipeDir)) {
    console.log('  ⚠️  Equipe directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(equipeDir);
  let count = 0;

  // Equipe has no unique slug column, and every current entry shares
  // "Contenu provisoire" as nom (names not yet confirmed) — matched by
  // role (the JSON's "titre", e.g. "Directeur Académique") instead, which
  // is unique. No source field exists yet for prenom/email/linkedin.
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(equipeDir, file), 'utf-8'));

      const fields = {
        nom: data.nom || '',
        prenom: '',
        role: data.titre || '',
        bio: data.biographie || '',
        email: '',
        image: data.portrait || '',
        linkedin: '',
        published: true
      };

      const existing = await prisma.equipe.findFirst({ where: { role: data.titre } });
      if (existing) {
        await prisma.equipe.update({ where: { id: existing.id }, data: fields });
      } else {
        await prisma.equipe.create({ data: fields });
      }
      count++;
    } catch (error) {
      console.error(`  ❌ Error migrating ${file}:`, error);
    }
  }

  console.log(`  ✅ Migrated ${count} equipe members`);
}

async function migrateExperts() {
  console.log('🎓 Migrating Experts...');
  const expertsDir = path.join(CONTENT_DIR, 'experts');

  if (!fs.existsSync(expertsDir)) {
    console.log('  ⚠️  Experts directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(expertsDir);
  let count = 0;

  // Expert has no unique slug column, and most current entries share
  // "Contenu provisoire" as nom — matched by (nom, specialite) instead,
  // which is unique. The source content has no biography field, so bio is
  // left empty rather than (as the previous version of this script did)
  // filling it with the expert's institution, which isn't a biography.
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(expertsDir, file), 'utf-8'));

      const fields = {
        nom: data.nom || '',
        prenom: '',
        specialite: data.specialite || '',
        bio: '',
        image: data.portrait || '',
        published: true
      };

      const existing = await prisma.expert.findFirst({
        where: { nom: data.nom, specialite: data.specialite }
      });
      if (existing) {
        await prisma.expert.update({ where: { id: existing.id }, data: fields });
      } else {
        await prisma.expert.create({ data: fields });
      }
      count++;
    } catch (error) {
      console.error(`  ❌ Error migrating ${file}:`, error);
    }
  }

  console.log(`  ✅ Migrated ${count} experts`);
}

async function migratePublications() {
  console.log('📄 Migrating Publications...');
  const publicationsDir = path.join(CONTENT_DIR, 'publications');

  if (!fs.existsSync(publicationsDir)) {
    console.log('  ⚠️  Publications directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(publicationsDir);
  let count = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(publicationsDir, file), 'utf-8'));

      const fields = {
        titre: data.titre,
        slug: data.slug,
        description: data.description || '',
        fichier: data.fichier || '',
        date: data.date ? new Date(data.date) : new Date(),
        published: data.published ?? true
      };

      await prisma.publication.upsert({
        where: { slug: data.slug },
        update: fields,
        create: fields
      });
      count++;
    } catch (error) {
      console.error(`  ❌ Error migrating ${file}:`, error);
    }
  }

  console.log(`  ✅ Migrated ${count} publications`);
}

async function migrateThematiques() {
  console.log('🏷️  Migrating Thematiques...');
  const thematiquesDir = path.join(CONTENT_DIR, 'thematiques');

  if (!fs.existsSync(thematiquesDir)) {
    console.log('  ⚠️  Thematiques directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(thematiquesDir);
  let count = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(thematiquesDir, file), 'utf-8'));

      // Thematique.slug is unique in the schema but the source JSON has no
      // slug field, only itemId (e.g. "th01") — used as the slug value.
      const fields = {
        nom: data.titre || '',
        description: data.description || '',
        published: true
      };

      await prisma.thematique.upsert({
        where: { slug: data.itemId },
        update: fields,
        create: { ...fields, slug: data.itemId }
      });
      count++;
    } catch (error) {
      console.error(`  ❌ Error migrating ${file}:`, error);
    }
  }

  console.log(`  ✅ Migrated ${count} thematiques`);
}

async function migrateInstitution() {
  console.log('🏛️  Migrating Institution...');
  const institutionDir = path.join(__dirname, '../../content/institution');
  
  if (!fs.existsSync(institutionDir)) {
    console.log('  ⚠️  Institution directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(institutionDir);
  
  if (files.length === 0) {
    console.log('  ⚠️  No institution files found, skipping...');
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(path.join(institutionDir, files[0]), 'utf-8'));
    
    await prisma.institution.create({
      data: {
        nom: data.nom,
        slogan: data.slogan,
        description: data.description,
        adresse: data.adresse,
        email: data.email,
        telephone: data.telephone,
        logo: data.logo,
        imageHero: data.imageHero,
        facebook: data.facebook,
        linkedin: data.linkedin,
        twitter: data.twitter
      }
    });
    console.log('  ✅ Migrated institution');
  } catch (error) {
    console.error('  ❌ Error migrating institution:', error);
  }
}

async function main() {
  console.log('🚀 Starting migration from TinaCMS to PostgreSQL...\n');

  try {
    await migrateFormations();
    await migrateArticles();
    await migrateEvenements();
    await migratePartenaires();
    await migrateTemoignages();
    await migrateEquipe();
    await migrateExperts();
    await migratePublications();
    await migrateThematiques();
    await migrateInstitution();

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
