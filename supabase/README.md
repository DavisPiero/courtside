# Setting up Supabase for Courtside (about 5 minutes, once)

Project: https://qbmxlihuqjehemhgioah.supabase.co. The game's code holds the project URL and the
**publishable** key; both are meant to be public. Never put the **secret / service role** key anywhere in the game.

1. **Make the tables.** In Supabase, open **SQL Editor**, click **New query**, paste all of `setup.sql`, click **Run**.
   It should say "Success. No rows returned".
2. **Where emails send people back to.** **Authentication > URL Configuration**:
   - Site URL: `https://davispiero.github.io/courtside/`
   - Redirect URLs, add both: `https://davispiero.github.io/courtside/**` and `http://localhost:8791/**`
3. **Email sign-in rules.** **Authentication > Sign In / Providers > Email**:
   - Email provider: on. Confirm email: on.
   - Minimum password length: 8.
   - Password requirements: "Lowercase, uppercase letters and digits" is fine; the game asks for at least 8 characters
     with a letter and a number.
4. **Leave off:** anonymous sign-ins, phone sign-in, and all the social logins.

That's it. To check it worked: **Table Editor** should show `profiles` and `saves`, each with a green "RLS enabled".

## If emails stop arriving
Supabase's free email sender only sends a few emails an hour. If friends sign up at the same time and the
confirmation emails don't come, set up a free sender (Resend) under **Authentication > Emails > SMTP Settings**.

## Deleting a player by hand
**Authentication > Users**, find them, **Delete user**. Their profile and save go with them.
