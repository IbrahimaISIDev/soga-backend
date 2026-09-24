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
  const articlesDir = path.join(__dirname, '../../content/articles');
  
  if (!fs.existsSync(articlesDir)) {
    console.log('  ⚠️  Articles directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(articlesDir);
  let count = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(articlesDir, file), 'utf-8'));
      
      await prisma.article.upsert({
        where: { slug: data.slug },
        update: {},
        create: {
          titre: data.titre,
          slug: data.slug,
          resume: data.extrait || '',
          contenu: Array.isArray(data.contenu) ? data.contenu.join('\n\n') : data.contenu || '',
          image: data.image || '',
          date: data.date ? new Date(data.date) : new Date(),
          published: true
        }
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
  const evenementsDir = path.join(__dirname, '../../content/evenements');
  
  if (!fs.existsSync(evenementsDir)) {
    console.log('  ⚠️  Evenements directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(evenementsDir);
  let count = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(evenementsDir, file), 'utf-8'));
      
      await prisma.evenement.create({
        data: {
          titre: data.titre,
          slug: data.slug,
          description: data.description,
          date: data.date ? new Date(data.date) : new Date(),
          lieu: data.lieu,
          image: data.image,
          published: data.published || false
        }
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
  const partenairesDir = path.join(__dirname, '../../content/partenaires');
  
  if (!fs.existsSync(partenairesDir)) {
    console.log('  ⚠️  Partenaires directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(partenairesDir);
  let count = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(partenairesDir, file), 'utf-8'));
      
      await prisma.partenaire.create({
        data: {
          nom: data.nom,
          slug: data.itemId,
          logo: data.logo || '',
          description: data.description || '',
          published: true
        }
      }).catch(() => {});
      count++;
    } catch (error) {
      console.error(`  ❌ Error migrating ${file}:`, error);
    }
  }

  console.log(`  ✅ Migrated ${count} partenaires`);
}

async function migrateTemoignages() {
  console.log('💬 Migrating Temoignages...');
  const temoignagesDir = path.join(__dirname, '../../content/temoignages');
  
  if (!fs.existsSync(temoignagesDir)) {
    console.log('  ⚠️  Temoignages directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(temoignagesDir);
  let count = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(temoignagesDir, file), 'utf-8'));
      
      await prisma.temoignage.create({
        data: {
          nom: data.auteur || '',
          slug: data.itemId,
          role: data.titre || '',
          contenu: data.texte || '',
          image: data.photo || '',
          published: true
        }
      }).catch(() => {});
      count++;
    } catch (error) {
      console.error(`  ❌ Error migrating ${file}:`, error);
    }
  }

  console.log(`  ✅ Migrated ${count} temoignages`);
}

async function migrateEquipe() {
  console.log('👥 Migrating Equipe...');
  const equipeDir = path.join(__dirname, '../../content/equipe');
  
  if (!fs.existsSync(equipeDir)) {
    console.log('  ⚠️  Equipe directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(equipeDir);
  let count = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(equipeDir, file), 'utf-8'));
      
      await prisma.equipe.create({
        data: {
          nom: data.nom || '',
          prenom: '',
          slug: data.slug,
          role: data.titre || '',
          bio: data.biographie || '',
          email: '',
          image: data.portrait || '',
          linkedin: '',
          published: true
        }
      }).catch(() => {});
      count++;
    } catch (error) {
      console.error(`  ❌ Error migrating ${file}:`, error);
    }
  }

  console.log(`  ✅ Migrated ${count} equipe members`);
}

async function migrateExperts() {
  console.log('🎓 Migrating Experts...');
  const expertsDir = path.join(__dirname, '../../content/experts');
  
  if (!fs.existsSync(expertsDir)) {
    console.log('  ⚠️  Experts directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(expertsDir);
  let count = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(expertsDir, file), 'utf-8'));
      
      await prisma.expert.create({
        data: {
          nom: data.nom || '',
          prenom: '',
          slug: data.itemId,
          specialite: data.specialite || '',
          bio: data.institution || '',
          image: data.portrait || '',
          published: true
        }
      }).catch(() => {});
      count++;
    } catch (error) {
      console.error(`  ❌ Error migrating ${file}:`, error);
    }
  }

  console.log(`  ✅ Migrated ${count} experts`);
}

async function migratePublications() {
  console.log('📄 Migrating Publications...');
  const publicationsDir = path.join(__dirname, '../../content/publications');
  
  if (!fs.existsSync(publicationsDir)) {
    console.log('  ⚠️  Publications directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(publicationsDir);
  let count = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(publicationsDir, file), 'utf-8'));
      
      await prisma.publication.create({
        data: {
          titre: data.titre,
          slug: data.slug,
          description: data.description,
          fichier: data.fichier,
          date: data.date ? new Date(data.date) : new Date(),
          published: data.published || false
        }
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
  const thematiquesDir = path.join(__dirname, '../../content/thematiques');
  
  if (!fs.existsSync(thematiquesDir)) {
    console.log('  ⚠️  Thematiques directory not found, skipping...');
    return;
  }

  const files = fs.readdirSync(thematiquesDir);
  let count = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(thematiquesDir, file), 'utf-8'));
      
      await prisma.thematique.create({
        data: {
          nom: data.titre || '',
          slug: data.itemId,
          description: data.description || '',
          published: true
        }
      }).catch(() => {});
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
