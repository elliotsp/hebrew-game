// word|translit|meaning|note   (phrases allowed; exact match first, then prefix-stripping ו ה ב ל מ ש כ)
const DICT_RAW=`
אהלן|ahlan|hi, hey|From Arabic. Casual everyday greeting.
אתה|ata|you (m.)
את|at / et|you (f.) · or the direct-object marker|
החדש|he-chadash|the new one (m.)|"החדש" = the new guy in a unit.
חדש|chadash|new (m.)
שב|shev|sit! (m.)
מאחורה|me'achora|in the back|Spoken form of מאחור.
ותשתוק|ve-tishtok|and shut up (m.)|Blunt, commander-style.
תשתוק|tishtok|shut up / keep quiet (m.)
אל תתרגש|al titragesh|don't get worked up / chill (m.)|lit. 'don't get excited'. Also used to deflate someone's ego.
אל|al|don't (with a verb)
תתרגש|titragesh|get excited / emotional (m.)
הוא|hu|he
תמיד|tamid|always
ככה|kakha|like this, this way
בא לך|ba lekha|do you feel like…? (to m.)|Super common: 'בא לי' = I feel like.
בא|ba|comes / came (m.)
לך|lekha / lakh|to you · for you
קפה|kafe|coffee
וואלה|wallah|really / honestly / sure|From Arabic. Tone decides: surprise, agreement, 'I swear'.
בכיף|be-keif|gladly, with pleasure|lit. 'with fun'. Natural answer to any request.
תודה|toda|thanks
סבבה|sababa|cool, fine, OK
שחור|shachor|black (m.)
בלי|bli|without
סוכר|sukar|sugar
ככה שותים פה|kakha shotim po|that's how we drink here
שותים|shotim|(people) drink
פה|po|here
כן|ken|yes
אני|ani|I
מבקש|mevakesh|request, ask for (m.)
בבקשה|bevakasha|please / you're welcome
כוס|kos|cup, glass
אחת|achat|one (f.)
מה זה|ma ze|what is this?
מה|ma|what
זה|ze|this, it (m.)
אולפן|ulpan|ulpan (Hebrew school for immigrants)|Teasing: 'you sound like a textbook'.
דבר|daber|talk! (m.) · also 'thing'
נורמלי|normali|normal
אחי|achi|bro, my brother|The #1 word among Israeli guys.
אין לי כוח|ein li ko'ach|I can't be bothered / I'm fed up|lit. 'I have no strength'. 'אין לי כוח אליך' = I'm fed up with you.
אין|ein|there isn't / there's no
לי|li|to me, I have
כוח|ko'ach|strength, energy
אלייך|elayikh|to you (f.)
יום ראשון|yom rishon|first day · also Sunday
יום|yom|day
ראשון|rishon|first
וכבר|ve-kvar|and already
כבר|kvar|already
עם|im|with
גישה|gisha|attitude · access
יופי|yofi|great, nice (often sarcastic)
שקט|sheket|quiet!
רכב|rekhev|car, vehicle
לבן|lavan|white (m.)
נכנס|nikhnas|enters, comes in (m.)
לחנייה|la-chanaya|into the parking (lot)
חנייה|chanaya|parking spot / lot
יוצא|yotse|goes out, gets out (m.) · (price) comes to|'יוצא תשעים שקל' = it comes to ninety shekels.
מהרכב|me-ha-rekhev|from the car
לרכב|la-rekhev|into the car
מהבית|me-ha-bayit|from the house
הבית|ha-bayit|the house
תיק|tik|bag
כובע|kova|hat
יפה|yafe|nice, good · pretty
תעקבו|ta'akvu|follow (pl.)
אחריו|acharav|after him
העיניים|ha-einayim|the eyes
לא|lo|no, not
הראש|ha-rosh|the head
מסתכל|mistakel|looking (m.)
לכיוון|le-kivun|toward, in the direction of
שלנו|shelanu|ours
עושים|osim|(we/they) do|'מה עושים?' = what do we do?
תתכופפו|titkofefu|duck! bend down! (pl.)
עכשיו|akhshav|now
לחשוב|lachshov|to think
יותר מדי|yoter midai|too much
יותר|yoter|more
מדי|midai|too (much)
בואו|bo'u|come on, let's (pl.)
נצא|netse|we'll go out
להגיד|lehagid|to say
לו|lo|to him
שלום|shalom|hi, bye, peace
חי בסרט|chai be-seret|living in a fantasy|lit. 'lives in a movie'.
חי|chai|lives, alive (m.)
אנחנו|anachnu|we
במארב|be-ma'arav|on a stakeout / in an ambush
מארב|ma'arav|ambush, stakeout
רגע|rega|wait, a moment
צריך|tsarikh|need, must (m.)
על|al|on, about
זמן|zman|time
מאוחר|me'uchar|late
ראה|ra'a|saw (m.)
אותנו|otanu|us
עוד פעם|od pa'am|again, one more time
עוד|od|more, another, still
פעם|pa'am|time (occurrence), once
תכלס|tachles|bottom line, basically, for real|From Yiddish. 'Get to the point'.
יש|yesh|there is, have
אינסטינקטים|instinktim|instincts
אולי|ulai|maybe
יצא ממך משהו|yetse mimkha mashehu|something will come of you
יצא|yatsa / yetse|went out · will turn out
ממך|mimkha|from you (m.)
משהו|mashehu|something
וואו|wow|wow
זו|zo|this (f.)
מחמאה|machma'a|compliment
ממנו|mimenu|from him
תשמור|tishmor|keep, guard, watch (m.)|'תשמור לי על המקום' = save my spot.
אותה|ota|her, it (f.)
בדיוק|be-diyuk|exactly
בקטנה|be-ktana|no biggie, no worries|lit. 'in small'. Also 'easy, piece of cake'.
ברוך הבא|barukh ha-ba|welcome (to m.)
לצוות|la-tsevet|to the team
צוות|tsevet|team, crew
תביא|tavi|bring (m.)|'תביא לי' = get me… — normal when ordering.
הפוך|hafukh|latte (Israeli café hafukh)|lit. 'upside down'.
גדול|gadol|big, large (m.)
וקרואסון|ve-kruason|and a croissant
אם|im|if
בטח|betach|sure, of course
מגיע|magi'a|coming up · deserves (m.)
אדוני|adoni|sir|Formal — sounds stiff in a café.
ברצוני|bi-rtsoni|I would like (formal/written)
להזמין|lehazmin|to order · to invite
משקה|mashke|drink, beverage
חם|cham|hot (m.)
בבנק|ba-bank|at the bank
יאללה|yalla|come on, let's go, OK|From Arabic. Hebrew's all-purpose 'go'.
תן|ten|give (m.)
אוכל|okhel|food · eat (m.)
תפריט|tafrit|menu
תבחר|tivchar|choose (m.)
תקשיב|takshiv|listen (m.)
לשולחן|la-shulchan|to the table
ליד|leyad|next to, by
רוצה|rotse / rotsa|want (m./f.)
לדעת|lada'at|to know
כל|kol|every, all
מילה|mila|word
הפגישה|ha-pgisha|the meeting
זזה|zaza|moved (f.)
למחר|le-machar|to tomorrow
מחר|machar|tomorrow
בבוקר|ba-boker|in the morning
הנמל|ha-namal|the port
היום|ha-yom|today
בערב|ba-erev|in the evening
הים|ha-yam|the sea
השוק|ha-shuk|the market
קיבלתי|kibalti|copy, received|lit. 'I received'. Radio + everyday 'got it'.
עבודה|avoda|work
טובה|tova|good (f.)
תשב|teshev|sit (m.)
רגוע|ragu'a|calm (m.)
סליחה|slicha|excuse me, sorry
יש לך אש|yesh lekha esh|got a light?|lit. 'do you have fire?'
אש|esh|fire · a light
סורי|sori|sorry|Borrowed from English, totally normal.
מעשן|me'ashen|smoke(s) (m.)
בעיה|be'aya|problem
אין בעיה|ein be'aya|no problem
איפה|eifo|where
כבאים|kaba'im|firefighters
לסיגריה|la-sigarya|for the cigarette
סוכן|sokhen|agent
סתם|stam|just, merely · kidding|'סתם' alone = 'just kidding'.
סטודנט|student|student (m.)
עושה|ose|doing (m.)
אף אחד|af echad|nobody
שאל|sha'al|asked (m.)
ראיתי|ra'iti|I saw
אותך|otkha / otakh|you (object)
היית|hayita|you were (m.)
בצבא|ba-tsava|in the army
אח|ach|brother
שלי|sheli|mine, my
מה פתאום|ma pit'om|no way! what are you talking about?|Strong, natural denial.
באתי|bati|I came
לכתוב|likhtov|to write
בשקט|be-sheket|quietly, in peace
אה|ah|ah
דמיינתי|dimyanti|I imagined
איך|eikh|how
ידעת|yada'ta|you knew (m.)
אכלנו אותה|akhalnu ota|we're screwed|lit. 'we ate it'. Also 'אכלתי אותה' = I'm screwed.
אכלנו|akhalnu|we ate
תחשוב|tachshov|think (m.)
לפני|lifnei|before
שאתה|she-ata|that you
מדבר|medaber|speaking (m.)
אממ|umm|umm
זוכר|zokher|remember (m.)
שתקת|shatakta|you were silent (m.)
חשוד|chashud|suspicious
סחתיין|sachtein|well done! kudos!|From Arabic 'sahtein'.
שמרת|shamarta|you kept (m.)
קור רוח|kor ru'ach|composure, cool|lit. 'coldness of spirit'.
שבע|sheva|seven
כאן|kan|here · 'this is' (on radio)
המצב|ha-matsav|the situation|'מה המצב?' = what's up?
אצלך|etslekha|at your place, with you (m.)
עבור|avor|over (radio)|Ends each transmission.
אצלי|etsli|at my end, with me
תנועה|tnu'a|movement · traffic
תודיע|todi'a|inform, report (m.)
ברגע שיש|be-rega she-yesh|the moment there's
תזוזה|tzuza|movement|'בתזוזה' = on the move.
סוף|sof|end · 'out' (radio)
היי|hai|hi
אבנר|Avner|Avner (name)
הכל טוב|ha-kol tov|all good
טוב|tov|good, okay
איתך|itkha / itakh|with you
מה איתך|ma itkha|how are you?
שמות|shemot|names
בקשר|ba-kesher|on the radio · in touch
קשר|kesher|radio · connection
כלום|klum|nothing
ותסיים|ve-tesayem|and finish (m.)
בכניסה|ba-knisa|at the entrance
כניסה|knisa|entrance
הצפונית|ha-tsfonit|the northern (f.)
הדרומית|ha-dromit|the southern (f.)
שני|shnei|two (m., before noun)
אנשים|anashim|people
שלושה|shlosha|three (m.)
רואה|ro'e|see (m.)
אותם|otam|them
חיובי|chiyuvi|affirmative · positive
שניים|shnayim|two
תישאר|tisha'er|stay (m.)
עליהם|aleihem|on them
הם|hem|they
ממש|mamash|really, totally
קרובים|krovim|close (pl.)
תירגע|teraga|calm down (m.)
מדברים|medabrim|(we/people) talk
קצר|katsar|short
שלילי|shlili|negative
שנייה|shniya|a second, one sec
בשירותים|ba-sherutim|in the bathroom
באמת|be-emet|really, seriously
שומע|shome'a|hear (m.)
אותי|oti|me
תענה|ta'ane|answer (m.)
מהר|maher|fast
מאוד|me'od|very
לומד|lomed|learn (m.)
חוזרים|chozrim|we're heading back
לבסיס|la-basis|to the base
תיכנס|tikanes|come in (m.)
שבת|shabbat|Shabbat
שבת שלום|shabbat shalom|Shabbat greeting
וואי|wai|wow, oh my|Very spoken. 'וואי וואי' = oh dear.
רזה|raze|skinny (m.)
תאכל|tokhal|eat (m.)
נו|nu|so? come on, well?|Pushes for action/answer.
תתחיל|tatchil|start (m.)
הסלטים|ha-salatim|the salads
חומוס|chumus|hummus
מטבוחה|matbucha|matbucha (cooked tomato–pepper salad)
חצילים|chatsilim|eggplants
טיפ|tip|tip
תתמלא|titmale|fill up (m.)
מהסלטים|me-ha-salatim|from the salads
רק|rak|only, just
ההתחלה|ha-hatchala|the beginning
מי|mi|who
שניצל|shnitsel|schnitzel
מלא|male|full · tons, loads (slang)|'יש מלא' = there's loads.
במטבח|ba-mitbach|in the kitchen
סלט|salat|salad
נגמר|nigmar|ran out, ended
קצת|ktsat|a little
חתיכה|chatikha|piece · (slang) hottie
קטנה|ktana|small (f.)
אורנה|Orna|Orna (name)
היה|haya|was
מדהים|mad'him|amazing
אבל|aval|but
מפוצץ|mefotsats|stuffed (full) · packed|lit. 'exploded'.
אז|az|so, then
אארוז|e'eroz|I'll pack
הביתה|ha-bayta|home(ward)
דיאטה|di'eta|diet
בשבת|be-shabbat|on Shabbat
אין דבר כזה|ein davar kaze|there's no such thing
כזה|kaze|such, like that
לאמא|le-ima|to Mom
אמא|ima|Mom
ספר|saper|tell (m.) · book (sefer)
חברה|chavera|girlfriend · friend (f.)
עובד|oved|work(s) (m.)
מישהי|mishehi|someone (f.)
בשבילך|bishvilkha|for you (m.)
הבת|ha-bat|the daughter
השכנה|ha-shkhena|the neighbor (f.)
עניינך|inyanekh|your business|'זה לא עניינך' = none of your business.
איזו|eizo|what a… (f.)
חוצפה|chutzpa|nerve, cheek
יכול|yakhol|can (m.)
לדבר|ledaber|to talk
סודי|sodi|secret, classified
תגיד|tagid|say, tell (m.)|Also a conversation opener: 'תגיד, …'
היא|hi|she
תפסיק|tafsik|stop (f. 'she will stop' / m. 'stop!')
לשאול|lish'ol|to ask
די|dai|enough!
תעזבי אותו|ta'azvi oto|leave him alone (to f.)|m.: תעזוב אותו.
תעזבי|ta'azvi|leave (f.)
אותו|oto|him
תני|tni|give (f.)
לאכול|le'ekhol|to eat
בתיאבון|be-te'avon|bon appétit|Said before/while eating.
חמוד|chamud|cute, sweetie (m.)
טרי|tari|fresh
תטעם|tit'am|taste (m.)
כמה|kama|how much, how many
התמרים|ha-tmarim|the dates (fruit)
שלושים|shloshim|thirty
לקילו|la-kilo|per kilo
קילו|kilo|kilo
המחיר|ha-mechir|the price
מחיר|mechir|price|'תעשה לי מחיר' = give me a (better) price.
אפשר|efshar|possible · can I…?
נשמה|neshama|sweetheart (lit. soul)
פותח|pote'ach|open(s) (m.)
חנות|chanut|store
מיוחד|meyuchad|special
משוגע|meshuga|crazy (m.)
תעשה לי מחיר|ta'ase li mechir|give me a price (a discount)|Classic shuk line.
תעשה|ta'ase|do, make (m.)
עשרים וחמש|esrim ve-chamesh|twenty-five
עשרים|esrim|twenty
בגללך|biglalkha|because of you
בסדר|be-seder|okay, fine
מצוין|metsuyan|excellent
שילמת|shilamta|you paid (m.)
הראשון|ha-rishon|the first
יצאת|yatsata|you came out (as) (m.)
פראייר|frayer|sucker, pushover|Being a frayer is the Israeli nightmare.
קונה|kone|buy (m.)
חכה|chake|wait (m.)
לאן|le'an|where to
הולך|holekh|go, going (m.)
בוא נדבר|bo nedaber|let's talk
בוא|bo|come (m.) · let's
נדבר|nedaber|we'll talk
בארבעים|be-arba'im|for forty
וזה|ve-ze|and that's
אחרון|acharon|last, final
בשלושים|bi-shloshim|for thirty
מחכה|mechake|waiting (m.)
סגרנו|sagarnu|deal! done!|lit. 'we closed'.
לבדוק|livdok|to check
ביי|bai|bye
עולה|ole|costs · goes up (m.)
בתור|ba-tor|in line|'הבא בתור' = next in line.
הבא|ha-ba|the next
וראיתי|ve-ra'iti|and I saw
שרציתי|she-ratsiti|that I wanted
לראות|lir'ot|to see
לזוז|lazuz|to move, get going|'צריך לזוז' = gotta go.
תזכור|tizkor|remember (m.)
זוג|zug|couple
תהיה|tihye|be (m.)
טבעי|tiv'i|natural
ערב טוב|erev tov|good evening
ערב|erev|evening
שותים|shotim|drinking (pl.)|'מה שותים?' = what are we drinking?
שתי|shtei|two (f., before noun)
בירות|birot|beers
מהחבית|me-ha-chavit|on draft (from the barrel)
לכם|lakhem|to you (pl.)
מיץ|mits|juice
תפוזים|tapuzim|oranges
בבר|ba-bar|at the bar
ביום חמישי|be-yom chamishi|on Thursday|Thursday night = Tel Aviv's big night out.
בולט|bolet|stand out (m.)
הדבר|ha-davar|the thing
הכי|hakhi|the most
חזק|chazak|strong
בעבודה|ba-avoda|at work, working
גאון|ga'on|genius
לחיים|le-chayim|cheers!|lit. 'to life'.
איזה קטע|eize keta|what a thing! how funny/weird|Reaction to anything surprising.
איזה|eize|what a… (m.) · which
קטע|keta|thing, bit, situation|'מה הקטע?' = what's the deal?
הזמין|hizmin|ordered (m.)
וודקה|vodka|vodka
כמו|kmo|like, as
שאבנר|she-Avner|that Avner
אמר|amar|said (m.)
לעשן|le'ashen|to smoke
המקום|ha-makom|the place, the spot
תזמין|tazmin|order (m.)
הטלפון|ha-telefon|the phone
זז|zaz|moving (m.)
תישארי|tisha'ari|stay (f.)
תיזהר|tizaher|be careful (m.)
שנזמין|she-nazmin|shall we order
סיבוב|sivuv|round
בחופש|ba-chofesh|on vacation
יודע|yode'a|know (m.)
חושבת|choshevet|think (f.)
תחליט|tachlit|decide (m.)
כמעט|kim'at|almost
איבדנו|ibadnu|we lost
חבל על הזמן|chaval al ha-zman|awesome, incredible|lit. 'a waste of time' — but means amazing!
חבל|chaval|too bad, a shame
הזמן|ha-zman|the time
שעשית|she-asita|that you did (m.)
מהיום|me-ha-yom|from today
חלק|chelek|part
מהצוות|me-ha-tsevet|of the team
כבוד|kavod|honor, respect
בשבילי|bishvili|for me
בשש|be-shesh|at six
ואני|ve-ani|and I
ידעתי|yada'ti|I knew
שאני|she-ani|that I
הנה|hine|here, look
עף על עצמו|af al atsmo|full of himself|lit. 'flies on himself'.
עף|af|flies (m.)
עצמו|atsmo|himself
משכורת|maskoret|salary
חחח|chachacha|haha
תדחוף|tidchof|push (m.)
המזל|ha-mazal|the luck
הפעם|ha-pa'am|the time (this time)
הראשונה|ha-rishona|the first (f.)
שלך|shelkha / shelakh|yours
בהופעה|ba-hofa'a|at the show
הופעה|hofa'a|show, concert
עומר אדם|Omer Adam|Omer Adam
מת עליו|met alav|crazy about him|'אני מת על…' = I love…
מת על|met al|crazy about, love (m.)|f.: מתה על.
מתה על|meta al|crazy about, love (f.)
מת|met|dead, dying (m.)
עליו|alav|on him, about him
לזה|le-ze|for this
חודשים|chodashim|months
איזה כיף|eize keif|so fun!
כיף|keif|fun
תעוף|ta'uf|you'll love it (lit. you'll fly)|'עפתי על זה' = I loved it.
מבטיחה|mavticha|promise (f.)
לומד עברית|lomed ivrit|learning Hebrew (m.)
עברית|ivrit|Hebrew
מהשירים|me-ha-shirim|from the songs
שלו|shelo|his
מתוק|matok|sweet (m.)
והעברית|ve-ha-ivrit|and the Hebrew
מעולה|me'ule|excellent
מים|mayim|water
שיר|shir|song
לשמוע|lishmo'a|to hear
משוגעים|meshuga'im|crazy (pl.)
ברור|barur|obviously, of course
הקהל|ha-kahal|the crowd, audience
להשתגע|lehishtage'a|to go crazy
תל אביב|Tel Aviv|Tel Aviv
אי אפשר בלי|i efshar bli|can't do without
אי אפשר|i efshar|impossible, can't
נכון|nakhon|right, true
ההמנון|ha-himnon|the anthem
העיר|ha-ir|the city
מלכת הדור|malkat ha-dor|queen of the generation
בחירה|bchira|choice
רומנטית|romantit|romantic (f.)
בראש|ba-rosh|in (your) head, on your mind
כרטיס|kartis|ticket · card
ותעודה מזהה|ve-te'uda mezaha|and ID
תעודה מזהה|te'uda mezaha|ID card
ותפתח|ve-tiftach|and open (m.)
התיק|ha-tik|the bag
בקבוקים|bakbukim|bottles
אסור|asur|forbidden, not allowed
להכניס|lehakhnis|to bring in
תזרוק|tizrok|throw (m.)
לפח|la-pach|in the trash
מותר|mutar|allowed
תשאיר|tash'ir|leave (m.)
בתיק|ba-tik|in the bag
כרטיסים|kartisim|tickets
לצלם|letsalem|to film, photograph
תשים|tasim|put (m.)
בכיס|ba-kis|in the pocket
תיהנה|tehane|enjoy (m.)
מצטער|mitsta'er|sorry (m.)
אלה|ele|these
הכללים|ha-klalim|the rules
בפנים|bifnim|inside
נכנסים|nikhnasim|we're going in
בלגן|balagan|chaos, mess|Israeli life in one word.
ובקבוק|u-vakbuk|and a bottle
לשתות|lishtot|to drink
בירה|bira|beer
קולה|kola|cola
אלף|elef|thousand
איש|ish|man, people (with numbers)
מאחוריך|me'achorekha|behind you (m.)
תשעים|tish'im|ninety
שקל|shekel|shekel
אשראי|ashrai|credit (card)|'אפשר באשראי?' = can I pay by card?
תעביר|ta'avir|swipe / tap (card), pass (m.)
לעבור|la'avor|to pass, get by
החברים|ha-chaverim|the friends
מקדימה|mikadima|up front|Spoken.
לשבת|lashevet|to sit
מחכים|mechakim|waiting (pl.)
תעבור|ta'avor|go through (m.)
יקר|yakar|dear · expensive
תחכה|techake|wait (m.)
תתעצבן|tit'atsben|get annoyed (m.)
לבמה|la-bama|to the stage
תצלם|tetsalem|film, take a picture (m.)
מצלם|metsalem|filming (m.)
לחיות|lichyot|to live
הרגע|ha-rega|the moment
צודק|tsodek|right (m.)
אמרתי|amarti|I said
לשמור|lishmor|to keep, watch
פספסת|fisfasta|you missed (m.)
הכניסה|ha-knisa|the entrance
לא נורא|lo nora|no big deal
הדרן|hadran|encore
אתם|atem|you (pl.)
איתי|iti|with me
אין עליך|ein alekha|you're the best!|lit. 'there's none above you'.
עליך|alekha|on you
תצעק|titsak|shout (m.)
בערך|be-erekh|about, sort of
בספרייה|ba-sifriya|in the library
אתכם|etkhem|you (pl., object)
הידיים למעלה|ha-yadayim le-ma'la|hands up!
הידיים|ha-yadayim|the hands
למעלה|le-ma'la|up
שהשיר|she-ha-shir|that the song
מוקדש|mukdash|dedicated
לכל|le-khol|to all
הזוגות|ha-zugot|the couples
האמהות|ha-imahot|the moms
שזה|she-ze|that this is
השיר|ha-shir|the song
האחרון|ha-acharon|the last
הערב|ha-erev|tonight
הזה|ha-ze|this (m.)
שר|shar|sings (m.)
איתו|ito|with him
חוזר|chozer|coming back (m.)
להדרן|le-hadran|for an encore
האמת|ha-emet|the truth
בחיים|ba-chayim|in life · ever
רציני|retsini|serious (m.)
שלוש|shalosh|three (f.)
שעות|sha'ot|hours
משעמם|mesha'amem|boring
מדברת|medaberet|talking (f.)
שתעוף|she-ta'uf|that you'd love it
על הכיפאק|al ha-kefak|excellent, top-notch|From Arabic kefak.
ירד לי האסימון|yarad li ha-asimon|the penny dropped|asimon = old phone token.
שם פס|sam pas|doesn't give a damn
אכלתי אותה|akhalti ota|I'm screwed|lit. 'I ate it'.
בלי לחץ|bli lachats|no pressure
אין לחץ|ein lachats|no rush, no pressure
יהיה בסדר|yihye be-seder|it'll be OK|National motto.
חלאס|khalas|enough! done!|From Arabic.
מה הקטע|ma ha-keta|what's the deal?
עזוב|azov|forget it (m.)
של|shel|of
ב|be-|in, at, with (prefix)
ל-ע-ב-ו-ר|la'avor|to pass (spelled out)
מתה|meta|dead, dying (f.)
פתאום|pit'om|suddenly
אחד|echad|one (m.)
אף|af|nose · (not) even
ברוך|barukh|blessed
בסרט|be-seret|in a movie
וחמש|ve-chamesh|and five
חמישי|chamishi|fifth · Thursday
נורא|nora|terrible · terribly
אדם|adam|person · Adam
`;
const DICT={};DICT_RAW.trim().split("\n").forEach(l=>{const[w,t,e,n]=l.split("|");if(w)DICT[w]={t,e,n:n||""}});
