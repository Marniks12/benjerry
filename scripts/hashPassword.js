// Gebruik de bestaande bcrypt dependency uit package.json.
// bcrypt is bedoeld om wachtwoorden veilig te hashen:
// het gebruikt automatisch een salt, waardoor hetzelfde wachtwoord niet
// telkens dezelfde hash oplevert.
const bcrypt = require("bcrypt");

// Gebruik Node.js readline voor interactieve terminal input.
// Zo hoeft het wachtwoord niet als argument in het commando te staan
// en komt het dus niet als plaintext in de command history terecht.
const readline = require("readline");

// Cost factor 12 betekent dat bcrypt 2^12 interne rondes gebruikt.
// Een hogere cost factor maakt het hashen trager, wat brute-force aanvallen
// moeilijker maakt. 12 is een praktische, sterke keuze voor admin passwords.
const BCRYPT_COST_FACTOR = 12;

const askHiddenQuestion = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stderr,
      terminal: true,
    });

    // Verberg de ingetypte tekens. Het wachtwoord wordt niet naar de terminal
    // teruggeschreven en wordt alleen kort in memory gebruikt om de hash te maken.
    rl._writeToOutput = () => {};

    process.stderr.write(question);

    rl.question("", (answer) => {
      rl.close();
      process.stderr.write("\n");
      resolve(answer);
    });
  });

const hashPassword = async () => {
  try {
    const password = await askHiddenQuestion("Admin password: ");

    if (!password) {
      process.stderr.write("Password cannot be empty.\n");
      process.exit(1);
    }

    const hash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);

    // Print alleen de bcrypt hash naar stdout.
    // Het script schrijft de hash niet automatisch naar .env of een ander bestand.
    console.log(hash);
  } catch (error) {
    process.stderr.write("Could not generate password hash.\n");
    process.exit(1);
  }
};

hashPassword();
