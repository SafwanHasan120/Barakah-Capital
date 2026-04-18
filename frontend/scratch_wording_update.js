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

  // page.tsx replacements
  content = content.replace(/Shariah-Compliant/g, 'Ethical');
  content = content.replace(/a Mudarabah investment/g, 'an ethical profit-sharing investment');
  content = content.replace(/no interest, no fixed returns, no Riba\./g, 'no interest or fixed returns.');
  content = content.replace(/No interest\. No Riba\./g, 'No interest.');
  content = content.replace(/Mudarabah-compliant/g, 'Ethically-compliant');
  
  // layout.tsx & others
  content = content.replace(/Mudarabah-native/g, 'Ethical');
  
  // register
  content = content.replace(/Mudarabah principles\. No interest\. No Riba\./g, 'transparent profit-sharing principles. No interest.');
  
  // dashboard
  content = content.replace(/Assalamu Alaikum/g, 'Hello');
  content = content.replace(/Mudarabah investment dashboard/g, 'profit-sharing investment dashboard');
  content = content.replace(/Shariah-compliant/g, 'ethical');
  content = content.replace(/Mudaraba profit-sharing/g, 'transparent profit-sharing');
  content = content.replace(/Mudarabah contracts/g, 'profit-sharing contracts');
  content = content.replace(/Mudaraba-compliant/g, 'ethically-compliant');
  
  // generic replacements for any left over
  content = content.replace(/Mudarabah/g, 'profit-sharing');
  content = content.replace(/Mudaraba/g, 'profit-sharing');
  
  fs.writeFileSync(file, content);
});
console.log('Wording updated');
