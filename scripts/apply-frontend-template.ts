import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

const template = Bun.argv[2];
const repoRoot = resolve(import.meta.dir, '..');
const demoRoot = resolve(repoRoot, 'demo');

const demoOnlyFiles = [
  'apps/frontend/src/components/CreateUserForm.tsx',
  'apps/frontend/src/components/DashboardMenuCard.tsx',
  'apps/frontend/src/components/DemoLoginPanel.tsx',
  'apps/frontend/src/components/ProtectedRoute.tsx',
  'apps/frontend/src/components/UsersPreview.tsx',
  'apps/frontend/src/components/shop/buttonStyles.ts',
  'apps/frontend/src/components/shop/shopStore.ts',
  'apps/frontend/src/components/shop/useOptimisticCart.ts',
  'apps/frontend/src/lib/shop.ts',
  'apps/frontend/src/pages/DashboardPage.tsx',
  'apps/frontend/src/pages/ShopCartPage.tsx',
  'apps/frontend/src/pages/ShopLayout.tsx',
  'apps/frontend/src/pages/ShopPage.tsx',
  'apps/frontend/src/pages/ShopProductPage.tsx',
];

if (template !== 'base' && template !== 'demo') {
  console.error('Usage: bun run scripts/apply-frontend-template.ts <base|demo>');
  process.exit(1);
}

const templateRoot = resolve(demoRoot, template);

const walkFiles = (dir: string): string[] => {
  return readdirSync(dir).flatMap((entry) => {
    const entryPath = resolve(dir, entry);

    if (statSync(entryPath).isDirectory()) {
      return walkFiles(entryPath);
    }

    return [entryPath];
  });
};

const copyTemplateFiles = () => {
  for (const sourcePath of walkFiles(templateRoot)) {
    const relativePath = relative(templateRoot, sourcePath);
    const targetPath = resolve(repoRoot, relativePath);

    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, readFileSync(sourcePath));
    console.log(`copied ${relativePath}`);
  }
};

copyTemplateFiles();

if (template === 'base') {
  for (const relativePath of demoOnlyFiles) {
    const targetPath = resolve(repoRoot, relativePath);

    if (!existsSync(targetPath)) {
      continue;
    }

    rmSync(targetPath, { force: true, recursive: true });
    console.log(`removed ${relativePath}`);
  }
}

console.log(`frontend template applied: ${template}`);