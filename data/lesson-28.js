/* Lesson 28 data (Fauda track) — schema in BUILD.md §4 */
IVX.register({
 "id": 28,
 "track": "fauda",
 "day": 37,
 "burnedIn": true,
 "title": "“Nobody blames you”",
 "heTitle": "פאודה 3 | תקציר פרק 3",
 "credit": "yes tv",
 "video": "GVTd3ZqvXfo",
 "duration": "1:20",
 "blurb": "A yes recap of Season 3, episode 3. In the first scene someone on the radio talks a shaken shooter down after a shot goes wrong; later the team looks at a screen and realizes a kid is in someone’s sights. Three lines you’ll use: זוועת עולם, אף אחד לא מאשים אותך, על הכוונת.",
 "source": "<b>About the Hebrew.</b> Official yes tv recap (“פאודה 3 | תקציר פרק 3”, oEmbed author yes tv). The cards are copied from the Hebrew subtitles burned into the video, read off frames captured while it played (live.js). YouTube has no Hebrew caption track for this clip, so <b>I couldn’t confirm by ear that the audio is Hebrew and matches the subtitles word for word</b>. I took the cards only from scenes that look like the Israeli side (a headset/ops-room scene and an office with a monitor). The Bashar, family and village scenes are left off because they’re likely Arabic. Nobody checked the cards against the audio, a script, or a native speaker. I’m not naming who speaks; neither the subtitles nor the title say. The scene descriptions are my reading of the frames, not an official synopsis. Segment times come from when each subtitle was on screen, so they’re approximate. Use ± if a line is clipped. Transliteration is approximate.",
 "warnings": ["Heavy scenes: a shooting goes wrong and a child is in danger. The cards are everyday phrases, nothing violent."],
 "lines": [
  {"he": "תקשיב טוב, אתה לא פושע.", "tr": "takshív tov, atá lo poshéa.", "en": "Listen carefully, you’re not a criminal. (to a man)",
   "note": "תקשיב טוב = listen carefully (to a man). To a woman: תקשיבי טוב (takshívi). פושע = criminal (poshéa).", "start": 10.1, "end": 13.1},
  {"he": "זה זוועת עולם, אבל זה קורה.", "tr": "ze zva’át olám, avál ze koré.", "en": "It’s horrible, but it happens.",
   "alt": ["זה זוועת עולם אבל זה קורה", "זוועת עולם אבל זה קורה"],
   "note": "זוועת עולם (zva’át olám) = really awful. Used for big things and small ones: הפקק היום היה זוועת עולם. Said zva’át, not zva’ót.", "start": 12.8, "end": 15.4},
  {"he": "אף אחד לא מאשים אוֹתְךָ בכלום.", "tr": "af ekhád lo ma’ashím otkhá bikhlúm.", "en": "Nobody blames you for anything. (to a man)",
   "alt": ["אף אחד לא מאשים אותך בכלום", "אף אחד לא מאשים אותך"],
   "note": "To a woman: אף אחד לא מאשים אוֹתָךְ (otákh). לא… בכלום = not… for anything, a double negative that’s normal in Hebrew.", "start": 14.7, "end": 17.1},
  {"he": "כנראה שהילד נמצא על הַכַּוֶּנֶת של מישהו.", "tr": "kanir’é she-ha-yéled nimtsá al ha-kavénet shel míshehu.", "en": "Apparently the kid is in someone’s sights.",
   "alt": ["כנראה שהילד נמצא על הכוונת של מישהו", "הילד נמצא על הכוונת של מישהו"],
   "note": "על הכוונת (al ha-kavénet, “in the crosshairs”) = targeted, on someone’s radar: אנחנו על הכוונת שלהם. כנראה (kanir’é) = apparently / probably.", "start": 33.9, "end": 37.2}
 ],
 "focus": [1, 2, 3],
 "quiz": [
  {"line": 1, "type": "vibe", "q": "What’s the tone of this line?", "o": ["It’s awful, but these things happen. He’s facing it, not making it bigger", "It’s no big deal, forget about it", "It’s outrageous and someone has to pay"], "a": 0,
   "f": "זוועת עולם = really awful, so he isn’t playing it down. אבל זה קורה = but it happens: he accepts it, he doesn’t excuse it."},
  {"line": 2, "type": "implies", "q": "What is he really telling him?", "o": ["Don’t beat yourself up, this isn’t on you", "We’re still finding out who’s to blame", "Don’t tell anyone what happened"], "a": 0,
   "f": "אף אחד לא מאשים אותך בכלום = nobody blames you for anything, a reassurance. Israelis say it to calm a friend who feels guilty."},
  {"line": 3, "type": "meaning", "q": "What did you just hear?", "o": ["Apparently the kid is in someone’s sights", "Apparently the kid is aiming at someone", "Apparently the kid is looking for someone"], "a": 0,
   "f": "נמצא על הכוונת של מישהו = is in someone’s crosshairs. The kid is the target, not the one aiming. Day to day it means “targeted” or “on someone’s radar”."}
 ],
 "say": [
  {"sit": "Your roommate (a man) borrowed your car and scraped it in a tight Tel Aviv parking garage. He keeps apologizing. Tell him it happens and nobody blames him for anything:", "he": "זה קורה, אחי. אף אחד לא מאשים אוֹתְךָ בכלום.",
   "alt": ["זה קורה אחי אף אחד לא מאשים אותך בכלום", "אף אחד לא מאשים אותך בכלום", "זה קורה, אף אחד לא מאשים אותך"], "en": "It happens, bro. Nobody blames you for anything. (to a man; to a woman: אוֹתָךְ)", "street": "עזוב, זה קורה. אף אחד לא מאשים אוֹתְךָ.", "line": 2},
  {"sit": "A friend tells you her landlord in Florentin just raised the rent by 40%. React: it’s horrible, but it happens:", "he": "זוועת עולם, אבל זה קורה.",
   "alt": ["זה זוועת עולם אבל זה קורה", "זוועת עולם אבל זה קורה", "זוועת עולם"], "en": "That’s horrible, but it happens.", "street": "וואו, זוועת עולם.", "line": 1},
  {"sit": "Your coworker says the startup down the street has hired three people off your team this month. Say apparently you’re in their sights:", "he": "כנראה שאנחנו על הַכַּוֶּנֶת שלהם.",
   "alt": ["כנראה שאנחנו על הכוונת שלהם", "אנחנו על הכוונת שלהם", "כנראה אנחנו על הכוונת שלהם"], "en": "Apparently we’re in their sights.", "street": "אנחנו על הכוונת שלהם, אחי.", "line": 3}
 ],
 "chat": "Text a friend (a man) who failed his driving test: tell him זה זוועת עולם, אבל זה קורה, that אף אחד לא מאשים אוֹתְךָ בכלום, and that next time he’ll pass."
});
