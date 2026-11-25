# Ivrit — three tracks, 2-minute sessions. How the site works and how a daily run adds one item

Static site on GitHub Pages (`https://elliotsp.github.io/hebrew-game/`, repo `elliotsp/hebrew-game`, branch `main`).
A daily run adds **one small data file**, one 15-line HTML shell, and one catalog entry. Never edit `assets/app.js` / `assets/app.css`
in a daily run unless fixing a bug.

```
assets/app.js        engine v7: home, track pages, sessions, speech recognition + record fallback, Quick replay, rewatch
assets/app.css       styles (dark, iPhone-first; track accent via body class t-fauda / t-speech / t-song)
data/catalog.js      THE content list for every track (window.IVX_CATALOG) — home, track pages, Today, rewatch all read it
data/lesson-N.js     Fauda lesson N   (id N)          → shell lesson-N.html   → IVX.lessonPage(N)
data/speech-K.js     Netanyahu speech K (id 100+K)   → shell speech-K.html   → IVX.lessonPage(100+K)
data/song-K.js       Omer Adam song K (id 200+K)     → shell song-K.html     → IVX.lessonPage(200+K)
index.html (home)  track.html?t=fauda|speech|song  review.html (Quick replay)  rewatch.html?week=W
tools/e2e.js         headless iPhone test (fake he-IL recognizer + fake mic), screenshots
v2/                  old story game (leave alone; no longer linked)
```

## 0. Design note — v7 redesign (Nov 19 2026) and why
Elliot (Nov 18): the v5 site wasn't intuitive and didn't make him want to come back. He's busy and gives it a couple of minutes;
he wants the speaking and the quiz to be much better, and three sections: **Fauda** (TV / street Hebrew), **Netanyahu** (key speeches, formal
and political Hebrew for following the news), **Omer Adam** (songs, young people's language).

What changed:
* **Home = one decision.** Brand + streak, one big **Today** card (thumbnail, track, title, one Start button), a 7-day streak strip,
  an optional *Quick replay* row when lines are due, then three track cards with progress. Library lists moved to `track.html?t=…`.
  Settings were cut (transliteration is always shown under the Hebrew; the v2 link is gone).
* **A session is 9 short screens, ~2–3 min**, same for every track: Intro → for 3 focus lines: **Hear it** (the real clip segment auto-plays,
  then a comprehension question; answering reveals the line, transliteration, meaning and a one-line why) → **Say it** (tap the mic, say the line;
  the browser's he-IL speech recognition transcribes it, the line is shown with matched / almost / missed words and a % score; Try again / Next)
  → **Real life** (an English situation; he answers out loud and is scored against the model answer *and* accepted variants, then sees a natural
  answer, the casual version for speeches, and can replay the original) → **Done** (streak, XP, the 3 lines, the chat challenge, optional full clip).
  Cut from v5 as busywork: the separate gist question, dictation typing, 0.75× auto-loop, rewatch-and-rate inside each lesson, self-grading.
  Watching the whole clip is now an optional chip (intro and done screens), not a mandatory 1–3 minute step.
* **Speaking:** `webkitSpeechRecognition` / `SpeechRecognition`, `lang:'he-IL'`, `interimResults`, `maxAlternatives:5`. Comparison ignores nikud,
  punctuation, final-letter forms and ו/י plene spelling, tolerates one-letter slips, and takes the best score over every target × recognizer
  alternative. ≥85 % = Nailed it, ≥60 % = Close, else Not yet. If recognition is missing or permission is denied it falls back for the session to
  record-and-compare (MediaRecorder: ▶ You / ▶ Original). No TTS anywhere.
* **Quiz:** no fill-in-the-blank, no flashcards. Each focus line gets one listening question: authored in `quiz` (types `meaning`, `implies`,
  `vibe`, `reply`, `casual`, `when`) with plausible distractors and an explanation; if a line has no authored question the engine generates
  “What did you just hear?” from the lesson's other lines' meanings (good enough for old Fauda lessons, but new items must author `quiz`).
* **Review is light:** *Quick replay* = max 5 due lines; the real moment plays, he says it, it's graded automatically from the score (same SRS
  intervals as v5). Only the 3 focus lines of a session join the deck. **Rewatch week** = each scene once, one tap to rate (Most / Some / Not much).
* Old URLs still work: `lesson-N.html`, `speech-1.html`, `rewatch.html?week=N`, `review.html` are the same files on the new engine.
  Progress carries over (same localStorage key `ivx1`; done/streak/XP/deck/timing nudges kept).

## 1. Which day is it? What to build today? (rotation across the three tracks)
`day` = calendar day: Day 1 = 2026-10-15 (America/New_York), `day = days since 2026-10-15 + 1`. It's a label (the home page's **Today** card
shows the entry whose `day` equals today). Days can skip. **Never back-fill missed days, never build more than one item per run.**
Decide in this order:
1. If `data/catalog.js` already has an entry with today's `day` → today's run already happened: build nothing, just re-announce it.
   (Day 36 = Thu Nov 19 2026 is already taken by Song 1, published with the redesign.)
2. **Fauda rewatch due?** Count `type:"lesson"` entries after the last `type:"rewatch"` entry. **6 or more → rewatch day**: append
   `{day, type:"rewatch", week: W, href:"rewatch.html?week=W", title:"Rewatch week W", lessons:[those lesson ids]}` with W = last week + 1.
   (Week 4 = lessons 19–24, day 32. Week 5 = lessons 25–30, day 41 (Nov 24). Next rewatch (week 6) after lessons 31–36.)
3. **Sunday → Netanyahu speech** (Israel's week starts Sunday; news day). Build `speech-K` (K = highest speech number + 1) per §8.
   If no accurate, embeddable, official speech with a Hebrew text source can be built today, fall through to step 5 and say so.
4. **Wednesday → Omer Adam song.** Build `song-K` per §7. Same fall-through rule.
5. Otherwise → **Fauda lesson** `N = (highest lesson id) + 1` per §2–§4.
Default mix per week: ~4–5 Fauda, 1 song, 1 speech; a rewatch about every 1.5 weeks. Speeches and songs never count toward the rewatch.
Library items (`day: 0`) are on the track pages but were never a daily item (Speech 1–3 and Song 2 at launch).

## 2. Fauda: picking the clip (rules)
1. **Official uploads only:** the yes channel on YouTube, and (since Nov 19 2026, because the yes pool is nearly exhausted) **Netflix’s official channels** (e.g. `@Netflix`, `@NetflixIsrael`, “Fauda | Netflix” clip uploads; verify with oEmbed `author_url`). Embeddable (no error 101/150). No reuploads, fan edits or rips. Netflix clips may have English burned-in subs or English-dubbed audio: use only Hebrew-audio clips, and take the Hebrew from a Hebrew caption track (or say so clearly in `source` if you had to transcribe from audio-matched Hebrew subs). Set `"credit":"Official Netflix clip"` on those.
   Netflix leads (Nov 18 search, channel “Netflix”, unchecked for embedding/audio): `k-tILBxRiQ4` Season 2 official trailer (1:42), `op_cGQtFgYU` Season 3 official trailer (1:32),
   `24D2M8Aajxs` Season 2 “Lior’s True Story” (1:25, likely English interview — skip if so). Search `ytsearch40:Fauda Netflix` / `Fauda clip Netflix` and keep only channel “Netflix” / “Netflix Israel”
   (fan accounts like “fauda TV”, “NBK”, “Showtime Sherpa” are not official). Trailers are montage-heavy: prefer actual scene clips.
2. **Prefer clips with a YouTube Hebrew caption track and no Hebrew subtitles burned into the video.** Burned-in subtitles undermine the
   ears-first steps, and we're **not allowed to cover them** (see policies below). If you have to use a burned-in clip, set `"burnedIn": true`
   (the engine then tells him to look away while lines play).
3. **More dialogue is better:** at least 5 clear Hebrew lines, everyday register. Skip clips that are mostly Arabic, music, or action with no talking.
4. Don't repeat a video already used in `data/lesson-*.js`.
5. **Candidate pool** (official yes, Hebrew dialogue, not yet used; /tmp is wiped when the box restarts, so this list lives here). Find more with
   `yt-dlp --flat-playlist --print "%(id)s|%(title)s|%(channel_id)s|%(duration)s" "ytsearch40:פאודה yes דורון"` (flat search still works; yes = `UCiqesVwAsxUYZx9nBYItCyQ`).
   No caption track (Oct 28 check via tools/cap.js; burned-in Hebrew subs only — check audio language before using): `-QkGLhLN_LE` שירין דואגת לבועז (Shirin on the phone, may be Arabic audio),
   `5RpppLC1rwc` דורון מקבל סיוע בדרכים, `HfKdeyU0uDI` דורון בחיפוש אחר הפנתר, `1fAJNvf8Htc` "ככה הוא לא יוכל לנשום", `66VyGIZdHnc` תפילה אחרונה של דורון.
   Unchecked yes uploads from the Oct 28 search: `xSbyaxUe1H0`, `1V1fMx3_jxo`, `mLxZ-GWS7rU`, `9DeNm_JFNfo`, `MZJ20IPHpjU`, `ysMPopAJGi4`, `OjkTBNFfhl0` (sitcom parody), `pvIIskH-Fek` (דורון בדקה).
   Also yes uploads with Hebrew dialogue seen Oct 29 (unchecked): `mezJiOlEMn8` מה זה פאודה?, `D-yhEgweMlk` סופרים את הימים (no caption track), `ciXyjft2QHo` מתכוננים למשימה (31 s), `iUQIUi4z2ok`, `1niSbwMQ8BQ`, `1V0dPm4BP-s`. Used Oct 29: `uUzrMw6zBAk` (Lesson 12).
   Oct 31: used `kWH1x5tYFHM` גלי ודורון (Lesson 13; no Hebrew caption track, burned-in subs read with a live-play capture: play muted, screenshot the bottom strip every 0.25 s with `getCurrentTime()` — far more reliable timings than seek+pause). No caption track either: `mezJiOlEMn8` (behind-the-scenes interview, no subs — skip), `iUQIUi4z2ok`, `1niSbwMQ8BQ`, `xSbyaxUe1H0`, `1V1fMx3_jxo` (all likely Arabic audio with Hebrew subs), `1FEWV4Dcr7g` “או שאתה לוחם או שאתה ילד” (42 s, unchecked frames, likely Hebrew). Other likely-Hebrew yes clips from Oct 31 search: `XHf58idfYZ8` “ההחלטות שלך הם חרא” (crude title), `QxdgeLQBXXI` (Moreno’s sister), `WaanqHgUNo0` רגע אחרי הפיצוץ.
   Nov 2: used `ML7kEq1vJBM` פאודה 3 | הצצה לפרק 8 (Lesson 14; burned-in subs only, read with `tools/live.js` live-play capture + `tools/sheets.py <dir> <step>` contact sheets; set `until` ≈ duration − 1 s or live.js hangs). Tip: `yt-dlp -j --skip-download -- ID` gives a `language` field that reliably flags Arabic ("ar"); Hebrew often shows None/"es".
   Nov 2 skips: Arabic per metadata `1FEWV4Dcr7g`, `HfKdeyU0uDI`, `1fAJNvf8Htc`, `66VyGIZdHnc`, `XHf58idfYZ8`, `_1f7eJ87jiY`, `ysMPopAJGi4`, `mLxZ-GWS7rU`, `1V0dPm4BP-s`, `frvmJT7DhbY`, `1V1fMx3_jxo`, `-QkGLhLN_LE`, `mhNp-0bUtk0`; not embeddable (error 150) `RI9cYDyBApc`, `V2nWxQDfY8A`; too little dialogue `5RpppLC1rwc`, `WaanqHgUNo0`, `NIAloNLDd2I` (peek ep 7); interview/promo `D-yhEgweMlk`, `QxdgeLQBXXI`; `wpeElOhnsKE` (peek ep 6, sparse + crude); `QhNWHDYZQUM` (peek ep 3, Hebrew subs over likely Arabic audio).
   Nov 3: used `DzM7likc1wk` הצצה לפרק 5 (Lesson 15; burned-in subs only, live.js until 125). Skipped by description (Arabic-language scenes): `zz4ekxOJzl0` (peek ep 9, Hamas at Abu Ayad’s), `Y1b5ldXaAUI` (peek ep 4, Bashar).
   Next to check: the yes תקציר recaps (`v4cq1X05i-o` ep 6, `bwceW_66UPc` ep 5, `GVTd3ZqvXfo` ep 3, `QurQ-Dg2BMs` ep 8, `C16lmNCx-Oc` ep 7, `3tj1yEmXMFo` ep 4 — recaps may be montage/music), `MZJ20IPHpjU` נסרין ברגע משפיל, `IWl9J_uWGMc`.
   Nov 4: used `yvzxKztD09Y` בתחבולות תעשה לך מלחמה (Lesson 16; S1 promo, yt-dlp language "iw", burned-in subs, live.js until 59; English-sub twin `j77JoBDt624` confirms meanings). Skipped: `MZJ20IPHpjU` (checkpoint humiliation, little dialogue), `C16lmNCx-Oc` recap ep 7 and `otTFa5WVb_I` recap (mostly Gaza/ISIS scenes, likely Arabic), `MUIIIQ9pxhA` and `r24iRDbmsZk` (language "ar"). Still unchecked: `JjzhBK_02n8`, `CfWerDEdEsY` (S1/S2 recaps), `vGMovxR11-4` (S3 first look), other S3 recaps. The yes pool of Hebrew-dialogue clips is running thin — search new terms (character names) each run.
   Nov 5: used `gCb-DY2osyE` רוצים לדעת מתי? (Lesson 17; Ayub S3-date tease promo, burned-in subs, live.js until 39; no caption track; language field empty). Skipped: `ciXyjft2QHo` מתכוננים למשימה (Nurit/Doron prep, ~31 s, almost no readable dialogue/subs), `vGMovxR11-4` S3 first look (montage, one “וולקאם טו עזה”), `pvIIskH-Fek` דורון בדקה (English “Doron” montage subs only), `PFNa-bGlNoo` מתחילים צילומים (BTS cast interview, iw auto-captions — not show dialogue), `9DeNm_JFNfo` דורון יורה בפנתר (unchecked frames), `OF_KY3BM9P0`/`fvs7TuFFXTE`/`kTZDxgIX-pM`/`VBchJBEhMGc`/`mezJiOlEMn8` (language "ar"). Still thin on unused Hebrew-dialogue yes clips — next: `-XhhQIpqUwI` מאחורי הקלעים, `IWl9J_uWGMc`, `D2Q5a_dl-og` לא עושים ספוילר, remaining S3 תקציר/`H7VT7Depwz4` teaser; keep searching character names.
   Nov 7: used `OjkTBNFfhl0` אם פאודה היתה... סיטקום (Lesson 18; yes sitcom parody, burned-in subs, live.js until 116; no caption track; language field empty). Skipped: `9DeNm_JFNfo` (action, no readable Hebrew dialogue/subs), `H7VT7Depwz4` teaser (montage + ברוכים הבאים לעזה), `TJg8JeBcgR4` 80s parody (credits/montage, lang "en"), `Y_XaKCamKmE`/`D-yhEgweMlk`/`76hoR7J3RO0` סופרים את הימים (promo/interview or sparse Nidal lines), `IWl9J_uWGMc` אל מקדסי (BTS interview), `q6Xrh7KKBG0` ערבית? אנא עארף (English cast interview), `-XhhQIpqUwI`/`wXmD5KjNq_I`/`RlsAr2EKeI8`/`mezJiOlEMn8` BTS, `1FEWV4Dcr7g`/`iUQIUi4z2ok`/`1niSbwMQ8BQ`/`xSbyaxUe1H0`/`1V1fMx3_jxo`/`2zxl2Kv6y2U` (lang "ar"). Checked but unused: `D2Q5a_dl-og` לא עושים ספוילר (Hebrew burned-in lines in a Nidal bag-drop scene — kept as backup; sitcom had clearer everyday register). Pool still thin — next unused Hebrew-leaning: remaining S3 תקציר, `wB9JfMpkeTM`, `pszLgOWThGM` (iw trailer monologue, previously skipped).
   Nov 9: used `lKwrcd_Mv5I` פאודה! (Lesson 19; 30 s S2 promo, burned-in subs, live.js until 29; language "es", YouTube lists an iw auto-caption track but yt-dlp timedtext returned 429). Not used: `D2Q5a_dl-og` (Nidal bag-drop with תסמוך על אללה — audio is very likely Arabic under Hebrew subs; skip). New candidates from Nov 9 search: `lcUd-3VMGfk` עת לאבד ועת לנקום (35 s, iw auto-captions, burned-in lines like זה ברור לך שלא נפסיק עד שנתפוס אותו — next up), `DameGQplunw` (S2, 74 s), `-AqB26LJLlM` מודיעין בלעדי, `lR94WiQXUT0`, `8o7WJaVskY0`, `z5yRDmhiN0o` recap (all unchecked). `3RtRkZ7_EjA` is lang "ar".
   Nov 10: used `DameGQplunw` למקומות, היכון, אש! פאודה, עונה 2 (Lesson 20; S2 trailer, burned-in subs, live.js until 72.5; no caption track at all, yt-dlp bot-blocked so no language field — audio language unverified; Arabic-looking scenes (סאמיר/נידאל/אבו סמארה) left off the cards). Not embeddable (error 150): `lcUd-3VMGfk`, `8o7WJaVskY0`, `-AqB26LJLlM`, `lR94WiQXUT0`. Watch pages (curl) show `"playableInEmbed"` and `captionTracks` even when yt-dlp is bot-blocked. Still unchecked, embeddable: `z5yRDmhiN0o` recap, `CfWerDEdEsY` recap, S3 תקציר `v4cq1X05i-o`/`bwceW_66UPc`/`QurQ-Dg2BMs`/`3tj1yEmXMFo`, `c3t9IVef0wo`, `vR2M0B4idhA` (26–31 s promos), `wB9JfMpkeTM`.
   Nov 11: used `v4cq1X05i-o` פאודה 3 | תקציר פרק 6 (Lesson 21; S3 recap, burned-in subs, live.js until 109; no caption track, yt-dlp language None — cards only from the Israeli second half, 47–76 s; first half Bashar/Jihad, likely Arabic). Skipped (mostly Arabic-side scenes under Hebrew subs): `z5yRDmhiN0o`, `JjzhBK_02n8`, `CfWerDEdEsY` (S1/S2 recaps — Samir/Marwa/Shirin/Walid/Hamas), `3tj1yEmXMFo` (S3 recap ep 4 — Bashar/Jihad/Nasser). Running two live.js captures in parallel stalled at ~44 s / timed out — run them one at a time. Still unchecked, embeddable: `GVTd3ZqvXfo` (S3 recap ep 3, Doron worries about Bashar — mixed), `QurQ-Dg2BMs` (S3 recap ep 8, mostly Hamas side), `c3t9IVef0wo`, `vR2M0B4idhA` (25–30 s promos); `bwceW_66UPc`, `wB9JfMpkeTM` watch pages returned no player data (check again). Pool nearly empty — search new terms (S4, נורית, גלי, אלי, סטיב, אביחי, קפטן איוב) next run.
   Nov 12: used `sH1W3RYuV9E` כפרה על שירין! (Lesson 22; S1 Shirin montage, 132 s, burned-in subs, live.js until 131; no caption track, oEmbed author yes tv; cards only from Shirin/Gabi and Doron scenes — kidnapping/Walid/martyr-speech parts likely Arabic). New yes uploads found Nov 12 (searches נורית / קפטן איוב / עונה 4): `Rnq4aCbdufU` עונה שלמה חיכינו (41 s), `YIEtVA0zUKk` שום דבר לא יכין אתכם לזה! (46 s promo), `vR2M0B4idhA` (embeddable) — all unchecked; skip BTS/interviews `L4UIOzW8GIE`, `LoHtwCn7WFg`, `VyHQC7z0EuY`, `WInsw7l9m-s`, openings `VCyhTY1m6Yc`/`exkFUMka4bw`. `GVTd3ZqvXfo`, `c3t9IVef0wo`, `wB9JfMpkeTM` watch pages again showed no playableInEmbed field. e2e screenshots sometimes show “Video unavailable” in headless right after a live.js run; a separate IFrame test played fine (state 1).
   Nov 13: used `7D6VrW2ZLiQ` פאודה 3 | תקציר פרק 2 (Lesson 23; S3 recap ep 2, 100 s, burned-in subs, live.js until 99; no caption track; cards only from Israeli-side lines at 2–26 s and 43–47 s — Bashar/Abu Fadi/Fauzi parts likely Arabic). Checked and skipped (almost no dialogue/subs): `Rnq4aCbdufU` (6 short lines, one crude — weak backup), `YIEtVA0zUKk`, `vR2M0B4idhA`. `KK4xeh1tZCI` (S3 recap ep 1, embeddable) — live.js timed out waiting for playback; retry (Doron as boxing coach in Hebron, likely mixed Arabic). Skip BTS/promo: `al0WlEMi7Ac`, `VbXMvXpNwbU`, `3vMsZcgTqGs`, `eJKDaO1DC2w`, `QruGOsEpHiE`, `KXklXOrYx4o`, `hjwN-JV4hi0`, `lDRPmPC23PA`, `aBkuJHf-9GM`, `3uYiH3iBZH4`. Search tip: titles contain “|”, so yt-dlp `--print` splits them; use oEmbed for the full title.
   Nov 14: used `KK4xeh1tZCI` פאודה 3 | תקציר פרק 1 (Lesson 24; S3 recap ep 1, 130 s, burned-in subs, live.js until 129 worked this time (~2 min); no caption track; cards from the Gabi line at 18 s and the supervised-visit/Ido home scene at 68–83 s — Hebron/Abu Fadi/Fauzi/Jihad parts likely Arabic). Rechecked Nov 14 (oEmbed author yes tv): embeddable per watch page `QurQ-Dg2BMs` (S3 recap ep 8, 85 s, mostly Hamas side), `bwceW_66UPc` (S3 recap ep 5, 79 s), `wB9JfMpkeTM` קבלו מתכון לסדרה מנצחת (118 s, likely promo/BTS); no playableInEmbed field again: `GVTd3ZqvXfo` (recap ep 3), `c3t9IVef0wo` פאודה 3 רק ב-yes! (promo). Next to try: `bwceW_66UPc`, then `GVTd3ZqvXfo`; then search new terms.
   Nov 16: used `bwceW_66UPc` פאודה 3 | תקציר פרק 5 (Lesson 25; recap of eps 1–5, 79 s, burned-in subs, live.js until 78; no caption track, yt-dlp language None, playable_in_embed True; cards from the kitchen, the unit office and the night tunnel op — interrogation, hostage car scene and the Safa’ phone call left off as likely partly Arabic). frames.js paused frames came out black again; a full-frame live capture (live.js without the `clip`, 1.5 s interval, temp copy in /tmp) shows faces + subs together. New unused yes uploads from the S3 playlist `PLAr10z7QNUYHHpLT1aMjPJhJzbg5ftYwS` (unchecked; yt-dlp -j started failing after a few calls): S3 recaps `Pgsx6cYffpc` (ep 9), `00bQQiEnfTA` (ep 10), `yY6v6KTDsII` (ep 11); peeks `GJLdgyXF1uI` (ep 10), `-9OqBOq2cWY` (ep 11), `9tQ5ZzPqn9M` (ep 12); `92TDIAXKGCo` Who Will Clean Up Nurit’s Bike? (53 s). Full episodes on the yes channel (oEmbed author yes tv; long, lots of Hebrew dialogue, embeddability unchecked): `G0Ufp7aOqJ0` (S3E1), `V8Ms0vRQEjQ` (S3E2), `8k1QnX7LGw0` (S1E1), `7AiQJcW09vo` (S2E1). Skip: `7_y5nbMbfzg` (BTS doc), `tim05YgTNgY` (theme song), `oufdU9b16HQ` (memorial), `2n2Pw9jfGjw` (yes promo).
   Nov 17: used `tAO2WLzcR0I` פאודה: הולכים להרוג בן-אדם מת? (Lesson 26; S1 briefing scene, 159 s, **no burned-in subs**, yt-dlp language "iw", auto-generated iw caption track only — fetched with `yt-dlp --skip-download --write-auto-subs --sub-langs iw --sub-format json3` when cap.js got the “Sorry…” page; word timings from json3 `tOffsetMs`). **All Nov 16 S3-playlist candidates are error 150 in the IFrame player** (not embeddable): `Pgsx6cYffpc`, `00bQQiEnfTA`, `yY6v6KTDsII`, `GJLdgyXF1uI`, `-9OqBOq2cWY`, `9tQ5ZzPqn9M`, `92TDIAXKGCo`, full episodes `G0Ufp7aOqJ0`, `V8Ms0vRQEjQ`, `8k1QnX7LGw0`, `7AiQJcW09vo`; also `sprtdXLhBD0` דריה ובועז (150), `kuoPhk7xn1Q` (152). Quick embed check: load the IFrame player headless and wait for `onError` vs state 1 (watch-page curl says UNPLAYABLE for these). Embeddable, unchecked: `J9n_wL8iNuI` יאללה כבר! (90 s S2 promo, auto iw captions), `o4l-yuB4ewE` במלחמה הזאת הכול אישי (28 s, lang iw), `JoEV-aQyA40` (35 s), `TfAxh8eMD1o` ליסה מגיעה לפאודה (84 s, likely fan/promo); still embeddable backups `D2Q5a_dl-og`, `GVTd3ZqvXfo`, `QurQ-Dg2BMs`. Searches on yes’s Fauda playlists (`PLAr10z7QNUYGtDWD_9omxBH-el7iKGLbZ`, `PLAr10z7QNUYGArSw4q1sOrH5KMY25XdR1`) are now exhausted; skip `JGoDIEx3W-c` (creators’ commentary), `BuJ9b62yDvo`/`ykcuk4tnzuk`/`TZGOrfKmePo` (theme song), `yLNGvdP0ziI`, `gKdRao4Y6vU`, `hKRfGY2_CEU`, `i3asvfDv4Jw`, `OQMrDHUiyug` (promo/BTS/awards), `2hpLtKeH2-8`, `JmyWNGvsNHw`, `mexqX8yD2Z4` (≤20 s promos). Clips with an auto iw track and no burned-in subs (like this one) are the best format — look for more S1/S2 scene clips.
   Nov 18: used `TfAxh8eMD1o` ליסה מגיעה לפאודה (Lesson 27; 84 s yes promo from Mar 2018 — campfire scene, team sings a “Lisa” song about Doron/Nurit coming back; burned-in subs, no caption track, live.js until 80; 2 spoken lines + 3 sung lines). IFrame embed check passes (state 1) for `J9n_wL8iNuI`, `o4l-yuB4ewE`, `JoEV-aQyA40`, `TfAxh8eMD1o`, and now also `GVTd3ZqvXfo`, `QurQ-Dg2BMs`, `D2Q5a_dl-og` (GVTd3ZqvXfo is no longer error 150). Checked and skipped: `J9n_wL8iNuI` יאללה כבר! (S2 trailer, asr track tagged "es", mostly Arabic-side scenes + title cards; a few Hebrew lines like הם ירו עליי, גבי! / תעשה מבצע! — weak backup), `o4l-yuB4ewE` (28 s, auto iw captions fragmentary, mostly music), `JoEV-aQyA40` הם מעולם לא היו קרובים כל כך (35 s next-episode promo, burned-in, ~6 short lines incl. אתה צריך להרוג אותו / יאללה בואו נעשה את זה זריז ונעוף משם — usable backup), `GVTd3ZqvXfo` (S3 recap ep 3, 80 s, mostly Bashar/Arab-side scenes; Israeli-ish lines כנראה שהילד נמצא על הכוונת של מישהו, זה זוועת עולם אבל זה קורה — backup). New searches (פאודה 4, ליאור רז, בועז, מורנו, אלי, נורית/מאיה, תקציר, Fauda yes tv) found **no unused yes Fauda uploads** — the yes pool is essentially exhausted. Next: `JoEV-aQyA40`, then `GVTd3ZqvXfo`, `J9n_wL8iNuI`; after that consider other official sources (e.g. Netflix's official Fauda channel clips) only if Elliot okays relaxing the yes-only rule.
   Nov 20: used `GVTd3ZqvXfo` פאודה 3 | תקציר פרק 3 (Lesson 28; S3 recap ep 3, 80 s, burned-in subs, live.js until 79 played fine (embeddable, oEmbed author yes tv); no caption track; cards only from the ops-room/radio scene at 10–17 s (תקשיב טוב, אתה לא פושע / זה זוועת עולם, אבל זה קורה / אף אחד לא מאשים אותך בכלום) and the monitor scene at 34–37 s (כנראה שהילד נמצא על הכוונת של מישהו). Bashar/family/village lines left off (likely Arabic). Full-frame contact sheets (live.js without `clip`, 1.2 s interval) helped tell Israeli-side scenes from Arab-side ones. Netflix trailers `k-tILBxRiQ4`/`op_cGQtFgYU` have no caption tracks at all (no Hebrew text source; skip). Found `F67yrqy5itk` Fauda Season 5 teaser on the “yes Studios” channel (76 s, unchecked; yt-dlp bot-blocked). Remaining backups: `JoEV-aQyA40` (only ~3 usable Hebrew lines: הוא לא יפסיק עד שנעשה לזה סטופ / יאללה בואו נעשה את זה זריז ונעוף משם / ברגע שהוא יגיע לשם; skip אתה צריך להרוג אותו and the Arabic-side speech), `QurQ-Dg2BMs`, `J9n_wL8iNuI`. In e2e screenshots the player can show “Sign in to confirm you’re not a bot”: that’s YouTube blocking the box’s headless browser, not an embed error.
   Nov 21: used `JoEV-aQyA40` הם מעולם לא היו קרובים כל כך (Lesson 29; 35 s S2 next-episode promo, Mar 2018, burned-in subs, live.js until 34; no caption track; only 3 usable lines: הוא לא יפסיק עד שנעשה לזה סטופ (3.9–5.7 s), יאללה בואו נעשה את זה זריז ונעוף משם (ops room, 10.4–12.6 s), ברגע שהוא יגיע לשם (14.4–15.8 s, speaker’s side unclear) — so the lesson has 3 cards). **Skip `epiZMlt5Ocg`** פאודה: עונה 5 | קליפ רשמי (Netflix Israel, embeddable, no caption track): it’s the S5E4 Marseille jewelry-heist scene and the audio is **English** (per the episode transcript) with Hebrew burned-in subs — not Hebrew audio. Netflix Israel (`@NetflixIsrael`, channel `UCWf6fxz4OrF3woGgou8BBpg`) does upload official Fauda S5 clips; check each one’s audio language via a transcript before using. `MCrMy90M59w` (yes Studios S4 first look) is LOGIN_REQUIRED. Remaining backups: `QurQ-Dg2BMs`, `J9n_wL8iNuI`, `F67yrqy5itk` (yes Studios S5 teaser, embeddable, YouTube asr tagged "en" — likely English/montage). The yes pool is now exhausted; Monday’s Fauda lesson needs a new source (search Netflix Israel “פאודה” clips with Hebrew audio).
   Nov 23: used `OFmH2fyAuoE` כשהמשימה קוראת - דורון מתייצב… (Lesson 30; **first Netflix Israel clip**, 27 s vertical Short from Fauda S5, oEmbed author Netflix Israel, plays in the IFrame player (state 1); yt-dlp -j worked for it: no caption tracks, language None; burned-in Hebrew subs read with live-play full-frame capture (`/tmp/ytt/livefull2.js ID until`, 0.34 s steps) + 2× subtitle-strip contact sheets (crop 420,520,860,620 on 1280×720 — vertical Shorts are pillarboxed, subs sit lower than on 16:9 clips) + a white-pixel count per frame for cue on/off times. Office argument with Gabi/Doron addressed by name — Hebrew audio very likely but unverified by ear. Left off: the last line (…משהו שיגמור לו את החיים) and סטיב שכפ"ץ של אוליגרכים בלונדון (unsure of the slang meaning). Netflix Israel Fauda uploads found via `yt-dlp --flat-playlist "https://www.youtube.com/@NetflixIsrael/search?query=פאודה"`: **next up `M4zkV0f45Hs`** פעולה אחת. אפס מקום לטעויות. (48 s S5 Short, embeddable, no caption track, burned-in Hebrew: briefing with Gabi/Ayub — המשימה שלנו זה להביא מודיעין, אנחנו ניקח את הסיכון, איוב, אנחנו מדברים רק איתך; skip the terror-attack and ‘20 years in jail’ lines), `Uw640jjEQjY` הרגע שבו הכול השתנה. (36 s; yt-dlp bot-blocked and live.js timed out waiting for playback on Nov 23 — retry once), `b_F6UgQ8xsA`/`qhnhy-KKoj0` are a different show (חופים של סודות); `epiZMlt5Ocg` is English audio (skip). Search @Netflix/@NetflixIsrael again for more S5 Shorts each run.
   If paused frames come out black, play ~1.8 s after `seekTo` before pausing (the paused seek doesn't always render a frame).
   With 1280×720 frames (`sed 's/width:854,height:480/width:1280,height:720/g' tools/frames.js`) the “More videos” overlay no longer covers paused subtitles.
   Skip: `UHRvXIjmrPc` (Arabic), `4-SDJiLIi7M` (no speech), `cQFObQ_CDOo` (Arabic), `GwLRP2Uh5hw` (montage, almost no dialogue), `oqqocVtXziE` (Marwa/Samir, likely Arabic audio), `XHVvR6198Zg` (Arabic audio), `GMSUiAMFEIc` (romance scene, no captions/subs), `27vlXpKSfb0` (behind-the-scenes promo), `oWXZOFo7NGk` (mostly Kaddish), `pszLgOWThGM` (trailer monologue over music), `l4oucZa2PT4` (33 s, one long political rant).

## 3. Getting the lines and times (every track)
* Source of truth, in order: YouTube Hebrew caption track (manual > auto) → burned-in subtitles read off frames. Record which one you used in `source`.
* Pick **exactly 4–5 lines**: short, reusable chunks a 23-year-old would actually say in Israel. Each line should be a quote from the clip, not a paraphrase.
* `start` = the line's onset **minus ~0.5–1 s**; `end` = the line's end **plus ~0.5 s**. Keep segments ≤ ~6 s. With captions, use cue start/start+dur.
  Times read off burned-in frames are approximate. Say so in `source`. Elliot has ± nudge buttons, but aim for a window he doesn't need to fix.
* `note`: **one line**, mostly Hebrew examples, minimal English. Gender: if a line is addressed to a man or woman, say so in `en` or `note`.
  Don't put Latin placeholders (X, Y) inside Hebrew — write `לא רק… אלא גם…`, not `לא רק X אלא גם Y` (it breaks right-to-left display).
* **Hebrew accuracy checklist (every card, every `say` answer, every note):** spelling (full spelling: הכול, מאוד, תיזהר), gender and
  conjugation agree with who's addressed (לך → לֵךְ / לְךָ / לָךְ), the model answers are things an Israeli would actually say (not
  word-for-word English), Hebrew geresh ׳ not ’ (חבר׳ה). Never "fix" a quote away from what's said in the clip — if a subtitle looks wrong, keep it and say so in `source`.
* **Nikud:** no full nikud, but add it on the one word whose reading is ambiguous or non-obvious: gendered pronoun suffixes (עָלֶיךָ, לָךְ, לְךָ, שָׁתִיתָ),
  imperatives that look like other words (לֵךְ), and easy-to-misread verbs (אִימְּנוּ, תָנוּחַ). Wording stays verbatim. The dictation check ignores nikud.
* **Transliteration (`tr`) convention** — real modern Israeli pronunciation: ח and fricative כ/ך = `kh`, צ = `ts`, ש = `sh`, ע/א between vowels = `’` only where
  it separates vowels (me’od). Prefixes hyphenated (ha-, ve-, le-, be-, she-, mi-). **Stress is on the last syllable unless marked with an acute accent**:
  `lekh ha-báyta`, `shatíta`, `kélev`, `ákhi`, `beséder`, furtive patah `tanúakh`, `lishmóa`, `bitsúa`. Arabic loans: `yálla`, `áywa`, `álak`.
  Transliteration is hidden by default (he can toggle "Show pronunciation"), so anything about pronunciation he must see goes in `note` too.
* Crude or sexual lines: don't make them cards. Mention them in `warnings` (see lesson 4). Mild insults are OK as cards with a warning (lesson 5).
* Don't assign lines to characters unless the subtitle or the yes title names them.

## 4. Data schema v7 (all three tracks)
```js
IVX.register({
 "id": 28, "day": 36, "track": "fauda",          // "fauda" | "speech" | "song"  (ids: lessons N, speeches 100+K, songs 200+K)
 "burnedIn": false,                              // true if Hebrew subtitles are burned into the video
 "title": "“Short English title”",               // shown as H1 + on the Today card
 "heTitle": "…",                                 // the channel's own Hebrew video title, verbatim
 "credit": "yes tv",                             // e.g. "Official Netflix clip", "Official Prime Minister’s Office clip (IsraeliPM)", "Official music video · Omer Adam’s channel"
 "video": "YouTubeId11c", "duration": "1:12",
 "blurb": "One or two sentences: what happens / why this matters. Minimal English.",
 "source": "<b>About the Hebrew.</b> Where the lines came from, what was NOT checked, timings approximate, nobody named unless verified, …",
 "warnings": [],                                 // HTML strings (crude language, heavy subject)
 "lines": [ {"he":"…","tr":"…","en":"… (to a man)","note":"one line, gender variant","start":24.5,"end":28.5,
             "alt":["other acceptable spoken form, e.g. numbers as words"],          // optional, for scoring
             "casual":"…","casualTr":"…"}, … ],                                   // casual/casualTr REQUIRED on speech lines
 "focus": [0, 2, 3],                             // exactly 3 line indexes = the session (Hear it + Say it each)
 "quiz": [                                       // exactly one per focus line, vary the types
   {"line":0,"type":"implies","q":"What is she really saying?","o":["correct","plausible wrong","plausible wrong"],"a":0,"f":"why, quoting the Hebrew"} ],
 "say": [ {"sit":"English situation from his life:","he":"model answer","alt":["accepted variant", "shorter variant"],"en":"meaning (gender)",
           "street":"even more casual version (speeches: REQUIRED)","line":2}, … ],  // 2–3; "line" = which clip line it uses; sessions rotate through them
 "chat": "One-sentence prompt for the Hebrew chat challenge (he replies in chat; we correct there)."
});
```
* Quiz types: `meaning` (what did you hear), `implies` (what is the speaker really saying), `vibe` (tone / feeling), `reply` (pick the natural
  Israeli reply — options in Hebrew), `casual` (pick the casual equivalent of a formal line — options in Hebrew), `when` (which situation fits).
  Options are rendered as Hebrew (right-aligned) when they're Hebrew-only. Distractors must be plausible to someone who *half* heard it
  (literal readings of slang, a similar-sounding word, the opposite tone) — never silly. `f` says why in one or two short sentences.
* `alt`: add the forms a recognizer will produce (numbers as digits/words, ת/ט spellings of loanwords like סחתיין/סחטיין, with/without אחי).
* Old Fauda lessons (1–27) still have `gist`, `dictation`, `shadow` and no `focus`/`quiz`; the engine uses `shadow` as the focus and generates the quiz.
  New lessons: add `focus` + `quiz`; `gist`/`dictation`/`shadow` are no longer needed.
* Write `say` situations that are fresh, concrete and from his life (Tel Aviv, roommates, gym, army friends, the shuk, a date) — not a restatement.

## 5. Shell + catalog
* Shell: copy an existing one of the same track (`lesson-27.html`, `speech-2.html`, `song-1.html`) and change the `<title>`, the data file and the
  `IVX.lessonPage(id)` call. Keep `?v=` equal to the other pages (currently **`v=7`**) on `assets/app.css`, `assets/app.js` and the data file.
* `data/catalog.js`: append one entry (keep the array valid JSON-ish, one entry per line):
  * Fauda: `{day, type:"lesson", id:N, video, href:"lesson-N.html", title, clip:"<Hebrew title without the פאודה: prefix>", mins:duration}`
  * Speech: `{day, type:"speech", track:"speech", id:100+K, video, href:"speech-K.html", title, clip:"<short Hebrew label>", credit:"Prime Minister’s Office", mins}`
  * Song: `{day, type:"song", track:"song", id:200+K, video, href:"song-K.html", title, clip:"<song name in Hebrew>", credit:"Omer Adam (official)", mins}`
  `video` gives the thumbnail. The Today card = entry whose `day` is today; otherwise the newest unfinished item ("Up next").
* Review needs no edits: the 3 focus lines join the deck when he finishes the session.

## 6. Policies (YouTube API Services)
* Use only the official IFrame player and API (`seekTo`, `setPlaybackRate`, `pauseVideo`, `loadVideoById`). **Never cover, overlay, crop, hide or shrink the player
  below 200×200**, never play audio with the video hidden (no audio-only mode), and never download or cache clips.
* Keep the YouTube Terms / Google Privacy footer (the engine renders it).
* No browser speechSynthesis/TTS anywhere. The actors / speakers / singers are the only Hebrew voice. Speech *recognition* (he-IL) is fine: it only listens.

## 7. Omer Adam songs
* **Official, embeddable videos only:** Omer Adam's channel `@OmerAdamOfficial` (channel id `UCo4y7A6EF2tZ1Q2Oxx64HNQ`; verify with oEmbed `author_url`)
  or his label's official channel. Check `"playableInEmbed":true` on the watch page (curl) or play it once in the IFrame player.
* **Copyright: quote at most 3 short lines per song** (2–3 cards). Never paste full lyrics anywhere (data, notes, messages).
* Lyrics source, in order: an uploaded (non-auto) Hebrew caption track on the official video (`yt-dlp --skip-download --write-subs --sub-langs iw --sub-format json3`)
  → a published lyric page, ideally 2+ lyric sites that agree (shironet blocks curl; nagnu.co.il, mizrahit.co, songish.co work via search) cross-checked
  with the auto `iw` captions for timing → otherwise **label every card as unverified** in `source` and say so in the message. Name the source in `source`.
* Times: caption cue times (or auto-caption word offsets `tOffsetMs`) minus ~0.4 s / plus ~0.2 s; songs are tight, check the next cue's start.
* Pick lines for **slang and young-people expressions** (בדוק, פיצוץ, באיזי, סחתיין, יא חביבי, רג׳אל, מגזים…), explain each in `note`
  with one usage example, and write `say` situations where he'd actually use them. Skip crude lines (mention in `warnings`). Don't name which
  singer sings a line unless the video makes it unambiguous.
* Candidate pool (official, embeddable per Nov 18 check; captions: **subs** = uploaded iw track, **asr** = auto only, **none**):
  `dFqAtitDNvs` צמוד צמוד (subs — used, Song 1), `nMQw29nfzpg` תל אביב (asr — used, Song 2), `7PE611GuMAk` בן 32 (asr, 2026),
  `Ld4gUCnsZ4I` משפחה וכבוד (asr), `E39srf6DWU8` וואי לי (asr — used, Song 3, day 42), `fIPDoLUk5JQ` הופה (asr), `Hq1XJbrXvg4` מאמי זה נגמר (asr),
  `WLMmX17D2uw` שני משוגעים (none, 69M views), `31DIsGbFVgY` אוהבת אותי אמיתי (none), `XE3hTnD5Kwo` חברות שלך (none), `AwjhMPbeD0Y` חצי דפוק (none),
  `8krJL1tuRVI` יעשו לנו כבוד (none), `TPs0Fbw1-WY` טקילה (none), `w6vEE4NxlYw` פרצופים (none), `gpHrr-he4vA` בן 30 (none).
  Nov 25 (Song 3): `E39srf6DWU8` וואי לי — oEmbed author `@OmerAdamOfficial`, yt-dlp -j `playable_in_embed` True, language iw, no uploaded subs (auto `iw-orig` only; yt-dlp `--write-auto-subs --sub-langs iw-orig` worked, plain `iw` hit a 429). Lyrics from Tab4U + mako’s 2012 article (agree; daletra/songlyrics/hebrewerry match); asr hears חבר for the lyric’s חברה. Video opens with a ~40 s spoken skit (0:15–0:57). Checked, not used: `Hq1XJbrXvg4` מאמי זה נגמר (asr decent, clean everyday lines: ואמרת לי מאמי זה נגמר / זה היה ממש קשה / לא רוצה להתעורר ולחזור למציאות — good next pick), `fIPDoLUk5JQ` הופה (asr messy; lines: הופה איזו מסיבה / כולם יפים, אין אחד שלא רוקד; one ‘body dripping sweat’ line to skip), `7PE611GuMAk` בן 32 (asr messy, heavier themes). Next: `Hq1XJbrXvg4` or `fIPDoLUk5JQ`.
  Skip `fXFLjct5agw` קאקדילה (asr is garbage, mostly vocalizing) and `XLVqaDqMFU4` (crude title). Full list: `yt-dlp --flat-playlist --print "%(id)s|%(title)s" https://www.youtube.com/@OmerAdamOfficial/videos`.

## 8. Netanyahu speeches
* Hebrew-language statements from **official** channels only (PMO `@IsraeliPM`, `@Netanyahu`, GPO). Verify with oEmbed `author_url`.
* Prefer the speeches that matter for following Israeli news (war statements, national addresses, holiday addresses) and **short** clips (≤ ~3 min).
* Text source: the PMO usually uploads a Hebrew caption track and puts the full statement in the description — use both and say so in `source`.
  Auto captions alone are noisy (see Speech 1 notes); use them only for timing.
* Every focus line gets a `casual` version (how he'd say it to a friend) and a `casual`-type or `implies` quiz. Keep the blurb neutral
  (what was said, when, why the phrase matters) — language, not politics. Leave violent lines (killing, destroying) off the cards.
* Candidates (Nov 18 check, all IsraeliPM, embeddable): `DSOTek88dt4` Rosh Hashana 5786 greeting (2:22, **iw subs**), `jeZJulgUuD8` statement from the Kirya (4:14),
  `UBHoTORv-KA` June 13 2025 statement (Iran operation, 6:52, asr only), `CRt-v0bLg7o` Nov 1 2023 “a hard war” (0:46, en subs + asr; mentions fallen soldiers),
  `oRItZJSAuOo` statement to the press (2:57), `a4YNEK3lZMA` May 2021 (0:39, no captions — description text only). Used: `14n0-TbZQnM` (1), `eNbtl_0Q6Rg` (2), `y2IgggCbx-o` (3), `DSOTek88dt4` (4, day 39, Nov 22: Rosh Hashana 5786 greeting — uploaded iw caption track via tools/cap.js, matches the description; Hebrew subs show on the video so `burnedIn:true`; yt-dlp bot-blocked, and the first cap.js run returned error 150 but a re-run a few seconds later played fine — retry once before skipping a clip as non-embeddable).
  Next candidates: `oRItZJSAuOo` statement to the press (2:57), `jeZJulgUuD8` Kirya statement (4:14, long), `CRt-v0bLg7o` (0:46); unchecked from the Nov 22 channel list: `eNberf2OjHE` Sigd greeting (0:43), `zpTFdm7ehR8` Rosh Hashana toast at the cabinet meeting (2:01), `bKS-1mzdZSQ` Rosh Hashana toast with the General Staff (1:46) — `yt-dlp --flat-playlist --print "%(id)s|%(title)s|%(duration)s" https://www.youtube.com/@IsraeliPM/videos` still works.

## 9. Test, publish, announce
```bash
cd /workspace/hebrew-game
node -e "global.IVX={register:d=>{if(d.focus.length!==3||d.quiz.length!==3)throw 'focus/quiz';d.quiz.forEach(q=>{if(!d.focus.includes(q.line)||q.o.length<3||!(q.a in q.o))throw 'quiz '+q.line});if(!d.say.length)throw 'say';d.lines.forEach(l=>{if(!(l.end>l.start)||l.end-l.start>8)throw 'times '+l.he;if(d.track==='speech'&&!l.casual)throw 'casual'});console.log('ok')}};require('./data/<file>.js')"
mkdir -p /tmp/ytt && cd /tmp/ytt && [ -d node_modules/playwright-core ] || (npm init -y && npm i playwright-core)
NODE_PATH=/tmp/ytt/node_modules node /workspace/hebrew-game/tools/e2e.js <new id>        # ~4 min; prints ERRORS: none
```
`e2e.js` (iPhone 390×844, fake he-IL recognizer, fake mic) smoke-tests home, the 3 track pages and every session screen, taps through the given
session(s) like a user (Hear → answer → Say → Real life → Done), runs Quick replay, rewatch weeks 1 and 4, the old URLs, and one session with speech
recognition removed (record fallback). Screenshots → `/tmp/ytt/e2e/` (`NOW=2026-11-19T07:05:00-05:00` fakes the clock). Look at a couple.
Also play every new segment once and confirm it contains the whole line.

Publish: `git add -A && git commit -m "Daily <Lesson N: Fauda | Speech K: Netanyahu | Song K: Omer Adam> \"…\"" && git push origin main`,
wait ~1 min, `curl -s https://elliotsp.github.io/hebrew-game/data/<file>.js | head` until it's live.
Message Elliot: track + title, 2–3 lines (Hebrew, transliteration, meaning), the link (`lesson-N.html` / `speech-K.html` / `song-K.html`), the chat
challenge, and honest notes (text source, what wasn't verified, approximate timings).

## 10. Netanyahu track notes (history)
Formal / news Hebrew. Since v7 it **is** part of the daily rotation (§1). Still true:
* Ids start at **101**: speech K = id `100+K`, data in `data/speech-K.js`, shell `speech-K.html` (copy `speech-1.html`, change title, data file, `IVX.lessonPage(100+K)`).
  The engine maps ids > 100 to `data/speech-*.js`, labels them "Speech K", and they share XP, streak and the review deck (keys `l101:i`).
* v7: `data/speeches.js` is gone. Speeches are `type:"speech"` entries in `data/catalog.js`.
* Fields: see §4. Every speech line needs `casual` (+ `casualTr`). `reg` (old register note) is only shown when a line has no `casual`.
* Clip rules: Hebrew-language speech from an **official** channel only (PMO `@IsraeliPM`, `@Netanyahu`, GPO). Verify with oEmbed `author_url`.
  Prefer non-partisan addresses (holiday greetings, ceremonies, national statements); keep the blurb neutral — language, not politics.
* Getting text when yt-dlp is bot-blocked: load the video in the IFrame player in headless Chrome with `cc_load_policy:1, cc_lang_pref:'iw'` and capture the
  `/api/timedtext` response (json3 with word offsets): `cd /tmp/ytt && NODE_PATH=/tmp/ytt/node_modules node /workspace/hebrew-game/tools/cap.js ID` → `ID.0.json`.
  Read burned-in subtitles off frames: `node /workspace/hebrew-game/tools/frames.js ID 2 6.5 13 …` → `f_ID_T.png`. Same tools work for Fauda clips.
  YouTube rate-limits timedtext after ~10 videos in a row (returns a “Sorry…” HTML page) — wait, don't hammer.

