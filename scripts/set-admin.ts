/**
 * Promote or demote an account.
 *
 *   npm run set-admin -- someone@example.com
 *   npm run set-admin -- someone@example.com farmer
 *
 * The role has to be written in two places and this keeps them together:
 *
 *   * the profile document, which the app reads
 *   * a custom claim on the Firebase Auth token, which is the only thing
 *     Realtime Database rules can see — they cannot query Firestore
 *
 * An admin without the claim can sign in and use the app but will find the
 * live sensor panel empty, because the database refuses the read. If someone
 * reports that, this script is the fix.
 *
 * Claims are baked into the token at sign-in, so the person must sign out and
 * back in before the change takes effect.
 */

import { cert, initializeApp, type ServiceAccount } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

import { credentialHelp, findServiceAccount, loadEnv } from "./load-env.ts"

const report = loadEnv()

let credential: ServiceAccount
try {
  credential = findServiceAccount().account
} catch (cause) {
  const message = cause instanceof Error ? cause.message : String(cause)
  console.error("\n" + (message === "NO_CREDENTIAL" ? credentialHelp(report) : message) + "\n")
  process.exit(1)
}

const [email, roleArg = "admin"] = process.argv.slice(2)

if (!email) {
  console.error(
    "\nUsage:  npm run set-admin -- <email> [admin|farmer]\n\n" +
      "  npm run set-admin -- patrick@agrivault.ng\n" +
      "  npm run set-admin -- joy@agrivault.ng farmer\n",
  )
  process.exit(1)
}

if (roleArg !== "admin" && roleArg !== "farmer") {
  console.error(`\nRole must be "admin" or "farmer" — got "${roleArg}".\n`)
  process.exit(1)
}

initializeApp({ credential: cert(credential) })

const auth = getAuth()
const db = getFirestore()

try {
  const user = await auth.getUserByEmail(email)

  await auth.setCustomUserClaims(user.uid, { role: roleArg })
  await db
    .collection("profiles")
    .doc(user.uid)
    .set({ role: roleArg, updatedAt: new Date().toISOString() }, { merge: true })

  console.log(`\n${email} is now ${roleArg}.`)
  console.log(`  uid:     ${user.uid}`)
  console.log(`  claim:   role=${roleArg}`)
  console.log(`  profile: role=${roleArg}`)
  console.log(
    `\nThey must sign out and back in — the role is carried in the token,\n` +
      `and the one they are holding was issued before this change.\n`,
  )
} catch (cause) {
  const code = (cause as { code?: string }).code

  if (code === "auth/user-not-found") {
    console.error(
      `\nNo account for ${email}.\n\n` +
        `They need to sign up first, or be created by npm run seed.\n`,
    )
  } else {
    console.error(`\n${cause instanceof Error ? cause.message : String(cause)}\n`)
  }
  process.exit(1)
}

process.exit(0)
