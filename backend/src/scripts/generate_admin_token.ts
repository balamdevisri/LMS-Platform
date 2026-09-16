import { adminAuth } from '../firebase';

async function main() {
  const token = await adminAuth.createCustomToken('rSEI8e1pOCP1LNuuKXskkHLbzB03', {
    role: 'admin',
    email: 'admin@gmail.com'
  });
  console.log('Custom Admin Token:', token);
}

main().catch(console.error);
