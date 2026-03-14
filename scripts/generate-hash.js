import { hash as _hash } from 'bcrypt';

async function main() {
  const users = [
    { username: 'admin', password: 'Admin123*' },
    { username: 'agente', password: 'Agente123*' },
    { username: 'supervisor', password: 'Supervisor123*' },
    { username: 'ciudadano', password: 'Ciudadano123*' },
  ];

  for (const user of users) {
    const hash = await _hash(user.password, 10);
    console.log(`${user.username}: ${hash}`);
  }
}

main().catch(console.error);