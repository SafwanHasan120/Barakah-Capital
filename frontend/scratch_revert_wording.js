const fs = require('fs');

const filesToUpdate = [
  'c:/NiyyahHacks/PotLaunch/frontend/app/page.tsx',
  'c:/NiyyahHacks/PotLaunch/frontend/app/layout.tsx',
  'c:/NiyyahHacks/PotLaunch/frontend/app/(auth)/login/page.tsx',
  'c:/NiyyahHacks/PotLaunch/frontend/app/(auth)/register/page.tsx',
  'c:/NiyyahHacks/PotLaunch/frontend/app/(app)/dashboard/page.tsx',
  'c:/NiyyahHacks/PotLaunch/frontend/app/(app)/investor/pitches/page.tsx',
  'c:/NiyyahHacks/PotLaunch/frontend/app/(app)/investor/contracts/page.tsx',
  'c:/NiyyahHacks/PotLaunch/frontend/app/(app)/contracts/[id]/page.tsx',
  'c:/NiyyahHacks/PotLaunch/frontend/app/(app)/campaigns/page.tsx',
  'c:/NiyyahHacks/PotLaunch/frontend/app/(app)/campaigns/[id]/page.tsx',
  'c:/NiyyahHacks/PotLaunch/frontend/app/(app)/campaigns/[id]/pitch/page.tsx'
];

filesToUpdate.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Reverts based on exact string modifications made in previous script
  
  // page.tsx
  content = content.replace(/Ethical · Blockchain-Backed/g, 'Shariah-Compliant · Blockchain-Backed');
  content = content.replace(/an ethical profit-sharing platform/g, 'a Mudarabah investment platform');
  content = content.replace(/Ethically-compliant · Blockchain-backed · Stripe-verified/g, 'Mudarabah-compliant · Blockchain-backed · Stripe-verified');
  
  // layout.tsx
  content = content.replace(/Ethical investment platform/g, 'Mudarabah-native investment platform');
  
  // login/page.tsx
  content = content.replace(/Ethical investing, powered by community/g, 'Mudarabah-native investing, powered by community');
  
  // register/page.tsx
  content = content.replace(/transparent profit-sharing principles\. No interest\./g, 'Mudarabah principles. No interest.');
  
  // dashboard/page.tsx
  content = content.replace(/profit-sharing investment dashboard/g, 'Mudarabah investment dashboard');
  content = content.replace(/ethical startups via transparent profit-sharing/g, 'Shariah-compliant startups via Mudaraba profit-sharing');
  content = content.replace(/profit-sharing contracts/g, 'Mudarabah contracts');
  
  // campaigns/page.tsx
  content = content.replace(/ethically-compliant businesses/g, 'Mudaraba-compliant businesses');
  
  // contracts and pitches
  content = content.replace(/profit-sharing contract/g, 'Mudarabah contract');
  content = content.replace(/Profit-Sharing Contract/g, 'Mudarabah Contract');
  content = content.replace(/Under profit-sharing principles you bear/g, 'Under Mudarabah principles you bear');
  content = content.replace(/Under profit-sharing principles, you bear/g, 'Under Mudarabah principles, you bear');

  fs.writeFileSync(file, content);
});
console.log('Restored Shariah-Compliant terms');
