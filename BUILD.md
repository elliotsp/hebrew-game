# Ivrit × Fauda — how a daily run adds a lesson

Static site on GitHub Pages (`https://elliotsp.github.io/hebrew-game/`, repo `elliotsp/hebrew-game`, branch `main`).
A daily run adds **one small data file**, one 15-line HTML shell, and one catalog entry. Never edit `assets/lesson.js`
in a daily run unless fixing a bug.

```
assets/lesson.js     shared engine v5: mobile stepper (one screen per step, pinned video, bottom action bar), player, recorder,
                     dictation diff, Scene-recall review, home/review/rewatch pages
assets/ivx.css       shared styles
data/catalog.js      home-page list (one entry per day)
data/lesson-N.js     one lesson's content (calls IVX.register({...}))
lesson-N.html        shell: loads lesson.js, data/lesson-N.js, then IVX.lessonPage(N)
index.html  review.html  rewatch.html?week=W
v2/                  old story game (leave alone)
```

## 0. How the site works now (v5, Oct 21 2026)
Elliot uses it on his iPhone every morning. Design rules — keep them when you touch anything:
* **One step per screen.** The YouTube player is pinned under a thin progress bar; the content scrolls in between; one big primary button
  sits in the bottom bar (with Back on the left and a small Skip/Retry on the right). The primary button's label always says what happens next
  ("▶ Listen" → "Show the line" → "Next line"). Every tap's result is scrolled into view.
* Lesson screens are generated from the data file — 17 screens for a 5-line lesson: Watch (intro + gist) → 5 key lines (listen 1× then 0.75×, say it back,
  then reveal) → 2 dictation → 3 shadow (hear → record → compare) → 3 say-it situations (record answer → model answer + actor clip) → rewatch + rating →
  chat challenge + Finish. Progress resumes where he left off.
* **Daily review = “Scene recall”** (review.html), not flashcards: max 6 items/day (~3 min). *Catch it*: the real clip moment plays; he says what
  was said and what it means, then checks. *Use it*: one of the lesson's `say` situations; he answers out loud, then sees the model answer + the clip.
  He self-grades Missed / Got it / Instantly (→ the same SRS intervals). Misses come back once at the end of the round.
* Home: greeting, streak/XP, week strip, a big **Today** card with one button (Start / Continue · step N of 7 / Do it again), the review tile, then the library.
* No new UI chrome per lesson. If a lesson needs a heads-up, use `warnings`.

## 1. Which day is it? What to build today?
`day` = calendar day: Day 1 = 2026-10-15 (America/New_York), `day = days since 2026-10-15 + 1`. It is only a label (the home page's
**Today** marker and week strip match it to the date), so days can skip — Oct 24–25 (days 10–11) had no run because the box was down.
**Never back-fill missed days, never build more than one lesson per run.**

What to build is decided by the **catalog**, not the date:
* Count the `type:"lesson"` entries after the last `type:"rewatch"` entry in `data/catalog.js`.
  * **6 or more → rewatch day.** Don't add a new clip. Append
    `{day, type:"rewatch", week: W, href:"rewatch.html?week=W", title:"Rewatch week W", lessons:[those lesson ids]}` with W = last rewatch week + 1.
    (Week 1 = day 7, lessons 1–6. Week 2 = lessons 7–12, due the run after Lesson 12 is published.) Then just announce it.
  * **Fewer than 6 → add lesson `N = (highest lesson id) + 1`** with `day = today's day`.
* If the catalog already has an entry with today's `day`, today's run already happened: don't build anything, just re-announce it.
* Lesson ids don't equal day numbers.

## 2. Picking the clip (rules)
1. **Official yes tv / Fauda uploads only** (the yes channel on YouTube). Embeddable (no error 101/150). No reuploads, fan edits or Netflix rips.
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
   If paused frames come out black, play ~1.8 s after `seekTo` before pausing (the paused seek doesn't always render a frame).
   With 1280×720 frames (`sed 's/width:854,height:480/width:1280,height:720/g' tools/frames.js`) the “More videos” overlay no longer covers paused subtitles.
   Skip: `UHRvXIjmrPc` (Arabic), `4-SDJiLIi7M` (no speech), `cQFObQ_CDOo` (Arabic), `GwLRP2Uh5hw` (montage, almost no dialogue), `oqqocVtXziE` (Marwa/Samir, likely Arabic audio), `XHVvR6198Zg` (Arabic audio), `GMSUiAMFEIc` (romance scene, no captions/subs), `27vlXpKSfb0` (behind-the-scenes promo), `oWXZOFo7NGk` (mostly Kaddish), `pszLgOWThGM` (trailer monologue over music), `l4oucZa2PT4` (33 s, one long political rant).

## 3. Getting the lines and times
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

## 4. Data schema (`data/lesson-N.js`)
```js
IVX.register({
 "id": 6, "day": 6, "burnedIn": false,
 "title": "“Short English title”",            // shown as H1
 "heTitle": "פאודה: …",                        // yes's own Hebrew video title, verbatim
 "video": "YouTubeId11c", "duration": "1:12",
 "blurb": "One or two sentences: what happens. Minimal English.",
 "source": "<b>About the Hebrew.</b> Where the lines came from (caption track / burned-in frames), what was NOT checked (no official script, no native-speaker review), whether timings are approximate, names seen in subtitles, transliteration approximate, summary is my reading.",
 "warnings": [],                                // HTML strings, e.g. crude-language heads-up
 "gist": {"q":"…?","o":["correct","wrong","wrong"],"a":0,"f":"why, quoting a line"},   // the only multiple-choice item
 "lines": [ {"he":"…","tr":"…","en":"…","note":"…","start":24.5,"end":28.5}, … ],      // 4–5
 "dictation": [3,4],                            // 2 line indexes (short, clearly audible)
 "shadow": [1,2,4],                             // 3 line indexes (good rhythm/attitude)
 "say": [ {"sit":"English situation, 1 sentence:","he":"model answer (may adapt the line)","en":"meaning","line":2}, … ],  // exactly 3; "line" = which clip line the actor plays
 "chat": "One-sentence prompt for the Hebrew chat challenge."
});
```
Don't add TTS, fill-the-gap, flashcards, or more multiple choice. Each `say` situation doubles as a *Use it* prompt in the daily review, so write
situations that are fresh, concrete and from his life (Tel Aviv, roommates, gym, army friends, the shuk) — not a restatement of the clip.

## 5. Shell + catalog
* `lesson-N.html`: copy `lesson-5.html` and change the title, `data/lesson-N.js`, and `IVX.lessonPage(N)`. Keep the `?v=` cache-buster equal to the other pages (currently `v=6`).
* `data/catalog.js`: append `{day, type:"lesson", id:N, video:"<YouTube id>", href:"lesson-N.html", title, clip:"<yes Hebrew title without the פאודה: prefix>", mins:duration}`.
  `video` is used for the home-page thumbnail (official i.ytimg.com thumbnail, links to the lesson).
  The home page puts the **Today** marker on the entry whose `day` equals today's day (otherwise the latest past entry). Entries with a future `day` show as "Soon".
* Spaced review needs no edits: lines join the deck when he finishes the lesson.

## 6. Policies (YouTube API Services)
* Use only the official IFrame player and API (`seekTo`, `setPlaybackRate`, `pauseVideo`, `loadVideoById`). **Never cover, overlay, crop, hide or shrink the player
  below 200×200**, never play audio with the video hidden (no audio-only mode), and never download or cache clips.
* Keep the YouTube Terms / Google Privacy footer (the engine renders it).
* No browser speechSynthesis/TTS anywhere. The actors are the only Hebrew voice.

## 7. Test before pushing
```bash
cd /workspace/hebrew-game
node -e "global.window={navigator:{}};global.navigator={};global.document={getElementById:()=>null};global.localStorage={getItem:()=>null,setItem:()=>{}};require('./assets/lesson.js');global.IVX=window.IVX;require('./data/lesson-N.js');const L=IVX._LESSONS[N];if(L.lines.length<4||L.lines.length>5||L.dictation.length!==2||L.shadow.length!==3||L.say.length!==3)throw 'schema';L.lines.forEach(l=>{if(!(l.end>l.start)||l.end-l.start>8)throw 'times '+l.he});console.log('ok')"
cd /tmp/ytt && NODE_PATH=/tmp/ytt/node_modules node /workspace/hebrew-game/tools/e2e.js N     # N = the new lesson id
```
(needs `mkdir -p /tmp/ytt && cd /tmp/ytt && npm init -y && npm i playwright-core` — /tmp is wiped on box restarts — and /usr/bin/google-chrome.) `e2e.js` serves the repo on an ephemeral port, emulates an iPhone (390×844, touch),
smoke-tests every lesson + speech page (player ready, every screen renders, primary button present), then **taps through lesson N end-to-end like a user**
(listen, reveal, dictation, record with a fake mic, compare, say-it, rewatch rating, finish), runs the Scene-recall review and the rewatch page,
and prints `ERRORS: none` when clean. Screenshots go to `/tmp/ytt/e2e/`. Look at a couple (`lesson-*.png`) — nothing should be cut off or overlapping.
Also play every segment once and confirm it contains the line (adjust times if not).

## 8. Publish
```bash
git add -A && git commit -m "Daily Lesson N: Fauda \"…\" (yes tv)" && git push origin main
```
Wait about 1 min, then `curl -s https://elliotsp.github.io/hebrew-game/data/lesson-N.js | head` until it returns the new file.
Message Elliot with: the clip title, 2–3 of the lines, a link to `lesson-N.html`, and honest notes (caption vs burned-in source, untested timings).

## 9. Speeches track (formal Hebrew) — not part of the daily run
Separate, on-demand track for formal / news / ceremonial Hebrew (e.g. Netanyahu speeches). **Daily runs don't touch it.**
* Ids start at **101**: speech K = id `100+K`, data in `data/speech-K.js`, shell `speech-K.html` (copy `speech-1.html`, change title, data file, `IVX.lessonPage(100+K)`).
  The engine maps ids > 100 to `data/speech-*.js`, labels them "Speech K", and they share XP, streak and the review deck (keys `l101:i`).
* Home-page list: `data/speeches.js` (`window.IVX_SPEECHES`), rendered as a "Speeches" section above the daily list. Don't add speeches to `data/catalog.js`.
* Extra fields: `"track":"speech"`, `"credit"` (shown instead of "Official yes tv clip"), per-line `"reg"` (one-line register note: formal vs street),
  and optional per-`say` `"street"` (casual equivalent shown after the model answer).
* Clip rules: Hebrew-language speech from an **official** channel only (PMO `@IsraeliPM`, `@Netanyahu`, GPO). Verify with oEmbed `author_url`.
  Prefer non-partisan addresses (holiday greetings, ceremonies, national statements); keep the blurb neutral — language, not politics.
* Getting text when yt-dlp is bot-blocked: load the video in the IFrame player in headless Chrome with `cc_load_policy:1, cc_lang_pref:'iw'` and capture the
  `/api/timedtext` response (json3 with word offsets): `cd /tmp/ytt && NODE_PATH=/tmp/ytt/node_modules node /workspace/hebrew-game/tools/cap.js ID` → `ID.0.json`.
  Read burned-in subtitles off frames: `node /workspace/hebrew-game/tools/frames.js ID 2 6.5 13 …` → `f_ID_T.png`. Same tools work for Fauda clips.
  YouTube rate-limits timedtext after ~10 videos in a row (returns a “Sorry…” HTML page) — wait, don't hammer.
