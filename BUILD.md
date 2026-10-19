# Ivrit × Fauda — how a daily run adds a lesson

Static site on GitHub Pages (`https://elliotsp.github.io/hebrew-game/`, repo `elliotsp/hebrew-game`, branch `main`).
A daily run adds **one small data file**, one 15-line HTML shell, and one catalog entry. Never edit `assets/lesson.js`
in a daily run unless fixing a bug.

```
assets/lesson.js     shared engine (7-step flow, player, recorder, dictation diff, spaced review, home/review/rewatch pages)
assets/ivx.css       shared styles
data/catalog.js      home-page list (one entry per day)
data/lesson-N.js     one lesson's content (calls IVX.register({...}))
lesson-N.html        shell: loads lesson.js, data/lesson-N.js, then IVX.lessonPage(N)
index.html  review.html  rewatch.html?week=W
v2/                  old story game (leave alone)
```

## 1. Which day is it?
Day 1 = 2026-10-15 (America/New_York). `day = days since 2026-10-15 + 1`.
* **day % 7 == 0 → rewatch day.** Don't add a new clip. Make sure `data/catalog.js` has
  `{day, type:"rewatch", week: day/7, href:"rewatch.html?week=W", title:"Rewatch week W", lessons:[the ids of that week's lessons]}`
  (week 1 = day 7, already added, lessons 1–6). Add the next one (day 14, 21, …) the same way. Then just announce it.
* Otherwise add lesson `N = (last lesson id) + 1` with `day = today's day`. Lesson ids don't equal day numbers after day 7.

## 2. Picking the clip (rules)
1. **Official yes tv / Fauda uploads only** (the yes channel on YouTube). Embeddable (no error 101/150). No reuploads, fan edits or Netflix rips.
2. **Prefer clips with a YouTube Hebrew caption track and no Hebrew subtitles burned into the video.** Burned-in subtitles undermine the
   ears-first steps, and we're **not allowed to cover them** (see policies below). If you have to use a burned-in clip, set `"burnedIn": true`
   (the engine then tells him to look away while lines play).
3. **More dialogue is better:** at least 5 clear Hebrew lines, everyday register. Skip clips that are mostly Arabic, music, or action with no talking.
4. Don't repeat a video already used in `data/lesson-*.js`.

## 3. Getting the lines and times
* Source of truth, in order: YouTube Hebrew caption track (manual > auto) → burned-in subtitles read off frames. Record which one you used in `source`.
* Pick **exactly 4–5 lines**: short, reusable chunks a 23-year-old would actually say in Israel. Each line should be a quote from the clip, not a paraphrase.
* `start` = the line's onset **minus ~0.5–1 s**; `end` = the line's end **plus ~0.5 s**. Keep segments ≤ ~6 s. With captions, use cue start/start+dur.
  Times read off burned-in frames are approximate. Say so in `source`. Elliot has ± nudge buttons, but aim for a window he doesn't need to fix.
* `note`: **one line**, mostly Hebrew examples, minimal English. Gender: if a line is addressed to a man or woman, say so in `en` or `note`.
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
Don't add TTS, fill-the-gap, or more multiple choice. Transliteration is hidden by default (the user can toggle it).

## 5. Shell + catalog
* `lesson-N.html`: copy `lesson-5.html` and change the title, `data/lesson-N.js`, and `IVX.lessonPage(N)`. Keep the `?v=` cache-buster equal to the other pages.
* `data/catalog.js`: append `{day, type:"lesson", id:N, href:"lesson-N.html", title, clip:"<yes Hebrew title without the פאודה: prefix>", mins:duration}`.
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
```
Then the headless run: `cd /tmp/ytt && NODE_PATH=/tmp/ytt/node_modules node /workspace/hebrew-game/tools/e2e.js` (needs `npm i playwright-core` in /tmp/ytt and /usr/bin/google-chrome; it serves the repo on an ephemeral port and tests lessons 1–5 deeply on lesson 5. Extend the lesson loop to include N).
Check: no page errors; player reaches ready (`IVX._player.ready`); `IVX._go(0..6)` each renders cards; one `P.seg()` stops within ~0.2 s of `end`.
Also play every segment once and confirm it contains the line (adjust times if not).

## 8. Publish
```bash
git add -A && git commit -m "Daily Lesson N: Fauda \"…\" (yes tv)" && git push origin main
```
Wait about 1 min, then `curl -s https://elliotsp.github.io/hebrew-game/data/lesson-N.js | head` until it returns the new file.
Message Elliot with: the clip title, 2–3 of the lines, a link to `lesson-N.html`, and honest notes (caption vs burned-in source, untested timings).
