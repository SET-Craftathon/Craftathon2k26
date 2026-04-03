import fs from 'fs';
import path from 'path';

const map = {
  'text-white': 'text-gray-900 dark:text-white',
  'text-gray-200': 'text-gray-800 dark:text-gray-200',
  'text-gray-300': 'text-gray-700 dark:text-gray-300',
  'text-gray-400': 'text-gray-500 dark:text-gray-400',
  'text-gray-500': 'text-gray-400 dark:text-gray-500',
  'text-gray-600': 'text-gray-400 dark:text-gray-600',
  'text-gray-700': 'text-gray-300 dark:text-gray-700',
  'bg-white/5': 'bg-black/5 dark:bg-white/5',
  'bg-white/10': 'bg-black/10 dark:bg-white/10',
  'bg-white/\\[0\\.02\\]': 'bg-black/[0.02] dark:bg-white/[0.02]',
  'bg-white/\\[0\\.03\\]': 'bg-black/[0.03] dark:bg-white/[0.03]',
  'bg-white/\\[0\\.04\\]': 'bg-black/[0.04] dark:bg-white/[0.04]',
  'bg-black/20': 'bg-black/5 dark:bg-black/20',
  'bg-black/30': 'bg-black/10 dark:bg-black/30',
  'bg-black/60': 'bg-black/20 dark:bg-black/60',
  'bg-\\[#0B0F1A\\]': 'bg-white dark:bg-[#0B0F1A]',
  'border-white/5': 'border-black/5 dark:border-white/5',
  'border-white/10': 'border-black/10 dark:border-white/10',
  'bg-indigo-500/5': 'bg-indigo-500/10 dark:bg-indigo-500/5',
  'ring-\\[#0B0F1A\\]': 'ring-white dark:ring-[#0B0F1A]',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Tailwind classings
  for (const [key, val] of Object.entries(map)) {
    const rx = new RegExp(`\\b${key}\\b(?!.*\\bdark:${key.replace(/\\/g, '')}\\b)`, 'g');
    content = content.replace(rx, val);
  }

  // Replace oklch inlines with CSS variables
  content = content.replace(/background:\s*'oklch\(13% 0\.01 260 \/ 0\.95\)'/g, "background: 'var(--bg-surface)'");
  content = content.replace(/background:\s*'oklch\(10% 0\.008 260 \/ 0\.8\)'/g, "background: 'var(--bg-surface-trans)'");
  content = content.replace(/background:\s*'oklch\(10% 0\.008 260 \/ 0\.6\)'/g, "background: 'var(--bg-surface-trans-more)'");
  content = content.replace(/borderColor:\s*'oklch\(100% 0 0 \/ 0\.([0-9]+)\)'/g, "borderColor: 'var(--border-$1)'");
  content = content.replace(/border:\s*'1px solid oklch\(100% 0 0 \/ 0\.([0-9]+)\)'/g, "border: '1px solid var(--border-$1)'");

  // Recharts text colors
  content = content.replace(/fill:\s*'#6b7280'/g, "fill: 'var(--chart-text)'");

  fs.writeFileSync(filePath, content);
  console.log(`Processed ${filePath}`);
}

const dirs = [
  'c:/Users/ahadd/OneDrive/Documents/ppt/Craftathon 2k26/security-command-center/src/components/dashboard',
  'c:/Users/ahadd/OneDrive/Documents/ppt/Craftathon 2k26/security-command-center/src/components/layout',
  'c:/Users/ahadd/OneDrive/Documents/ppt/Craftathon 2k26/security-command-center/src/app',
];

dirs.forEach(dir => {
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(path.join(dir, file));
    }
  });
});
