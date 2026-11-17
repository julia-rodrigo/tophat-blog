# Log Day5

Log your day by voice. Tap once, talk, tap stop. Day5 turns it into text, stamps the time, and adds it to that day's page.

Android first (React Native + Expo SDK 58). iPhone and web can come later from the same code.

## What's in version 1 (all free)

- **Talk to record**: tap once and it keeps listening hands-free (it restarts itself after silences) until you tap stop. Pause and resume. English and Japanese.
- **Voice commands**: "add to my to-do …", "remind me to …", "idea: …", or 「…をやることに追加」.
- **Day pages**: every entry in time order. The day names itself from what you said; rename it any time, like a chat.
- **Edit and delete**: change the words or the time. The entry keeps its created date, shows when it was last updated, and "See changes" shows what changed.
- **Photos, videos, sound around you, songs** (Spotify link that opens in Spotify).
- **Mood colours**: pale colour per entry. Auto, one colour, or off.
- **Diary calendar** with streaks, and a daily reminder you can change.
- **To-do list** fed by voice, or typed.
- **Drive mode**: one huge button, same recording.
- **Download a day**: one .zip with the day as text plus its photos (song as a link).
- **Backup**: saved automatically on the phone after every change (latest + last 7 days). "Back up now" saves a .zip with everything to any folder; "Restore" reads it back. The app's files are also covered by Android's own backup to the user's Google account.
- **Plans screen** with the agreed prices (purchases not wired yet).

## Coming in version 2 (needs sign-in and a server)

Email sign-in, cloud backup sized by plan, Google Play subscriptions (€4 / €7 / €10 a month, €27.99 / €40 a year), the 14-day AI trial (once per account), AI day names, autocorrect, personality types, screenshot import, AI pictures with credits, share cards with the small logo, Spotify sign-in.

## Run it

You need a development build (speech recognition is native code, so Expo Go won't work).

```bash
cd mobile
npm install
npx eas-cli@latest build --profile development --platform android   # installable test APK
npx expo start --dev-client
```

Or with Android Studio installed: `npx expo run:android`.

A shareable test APK: `npx eas-cli@latest build --profile preview --platform android`.

## Checks

```bash
npm run typecheck
npm test          # voice commands, mood, day names, edit diff, streaks, day text
```

## Code map

- `src/app/` screens: Today (`(tabs)/index`), Diary calendar, To-do, You (settings, backup), `day/[date]`, `drive`, `plans`
- `src/components/useRecorder.ts` hands-free speech recording
- `src/lib/store.ts` the diary data (saved on the phone)
- `src/lib/text.ts` voice commands, mood guess, day names, word diff
- `src/lib/files.ts` media, auto backup, backup/restore .zip, day download
- `src/lib/plans.ts` prices and credit packs
