import { hash } from "bcrypt";

async function main() {
  const users = [
    // ADMIN
    {
      role: "admin",
      email: "admin@simcomp.gov.co",
      password: "Admin123*",
    },

    // SUPERVISORES
    {
      role: "supervisor",
      email: "laura.martinez@simcomp.gov.co",
      password: "Super123*",
    },
    {
      role: "supervisor",
      email: "diego.ramirez@simcomp.gov.co",
      password: "Super123*",
    },

    // AGENTES
    {
      role: "agente",
      email: "carlos.gomez@transito.gov.co",
      password: "Agente123*",
    },
    {
      role: "agente",
      email: "andrea.lopez@transito.gov.co",
      password: "Agente123*",
    },
    {
      role: "agente",
      email: "jhon.mosquera@transito.gov.co",
      password: "Agente123*",
    },
    {
      role: "agente",
      email: "paola.ruiz@transito.gov.co",
      password: "Agente123*",
    },
    {
      role: "agente",
      email: "felipe.torres@transito.gov.co",
      password: "Agente123*",
    },

    // CIUDADANOS (password = documento)
    {
      role: "ciudadano",
      email: "juan.perez@gmail.com",
      password: "1010001001",
    },
    {
      role: "ciudadano",
      email: "maria.garcia@gmail.com",
      password: "1010001002",
    },
    {
      role: "ciudadano",
      email: "andres.rodriguez@gmail.com",
      password: "1010001003",
    },
    {
      role: "ciudadano",
      email: "sofia.hernandez@gmail.com",
      password: "1010001004",
    },
    {
      role: "ciudadano",
      email: "camilo.castillo@gmail.com",
      password: "1010001005",
    },
    {
      role: "ciudadano",
      email: "valentina.moreno@gmail.com",
      password: "1010001006",
    },
  ];

  console.log("\n🔐 HASHES GENERADOS:\n");

  for (const user of users) {
    const hashed = await hash(user.password, 10);

    console.log(`
-- ${user.role.toUpperCase()}
-- ${user.email}
'${hashed}',
`);
  }
}

main().catch(console.error);