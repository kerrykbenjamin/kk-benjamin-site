// Generate a bcrypt hash for the admin password.
// Usage:  npm run set-password -- "your password here"
import bcrypt from "bcryptjs";

const pw = process.argv[2];
if (!pw) {
  console.error('Usage: npm run set-password -- "your password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(pw, 10);
// The "$" characters in a bcrypt hash would be treated as variable expansion by
// Next's dotenv loader, so escape each one as "\$".
const escaped = hash.replace(/\$/g, "\\$");
console.log("\nAdd this line to your .env.local EXACTLY as shown (keep the backslashes):\n");
console.log(`ADMIN_PASSWORD_HASH=${escaped}\n`);
