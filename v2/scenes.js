// Characters
const CH={
 avner:{n:"Avner",he:"אבנר",c:"#f5a524",a:"🧔",v:0.85,p:0.8},
 maya:{n:"Maya",he:"מאיה",c:"#ff6b9a",a:"👩🏻",v:1,p:1.15},
 waiter:{n:"Waiter",he:"מלצר",c:"#7cc4ff",a:"🧑🏽‍🍳",v:1,p:1},
 stranger:{n:"Guy at next table",he:"בחור",c:"#b28dff",a:"🧔🏽",v:1,p:0.9},
 radio:{n:"Radio · One",he:"קשר",c:"#3ddc97",a:"📻",v:1,p:0.8},
 orna:{n:"Orna (Avner's mom)",he:"אורנה",c:"#ffb86b",a:"👵🏼",v:0.95,p:1.2},
 vendor:{n:"Shuk vendor",he:"מוכר",c:"#ffd166",a:"🧑🏽‍🌾",v:1.05,p:0.95},
 bartender:{n:"Bartender",he:"ברמן",c:"#7cc4ff",a:"🍸",v:1,p:1},
 target:{n:"Target",he:"המטרה",c:"#ff5d5d",a:"🕶️",v:1,p:0.8},
 noa:{n:"Noa (fan)",he:"נועה",c:"#ff6b9a",a:"💃🏻",v:1.05,p:1.2},
 guard:{n:"Security",he:"מאבטח",c:"#9aa4b2",a:"👮🏻",v:1,p:0.85},
 barista:{n:"Bar stand",he:"ברמנית",c:"#7cc4ff",a:"🍺",v:1,p:1.15},
 fan:{n:"Fan",he:"מעריץ",c:"#b28dff",a:"🙋🏽‍♂️",v:1.05,p:1},
 singer:{n:"On stage",he:"על הבמה",c:"#f5a524",a:"🎤",v:0.95,p:0.95}
};
/* step types:
 n: narration {n:"..."}
 m: message {m:who, he, en, learn:[dict keys]}
 c: choice {c:"prompt", timer?, timeout?:[who,he,en], o:[{he,en,r:"ok"|"meh"|"bad", re:[who,he,en], why}]}
 l: listen {l:who, he, en, o:[...he], a:index}
 t: type {t:"prompt", a:[accepted], alt:[translit], hint, learn}
*/
const SCENES=[
{id:"s1",mode:"unit",icon:"🚗",title:"Night Stakeout",he:"מארב ברכב",sub:"First night with Avner's team",steps:[
 {n:"Night. A parked car on a quiet side street. You're the new recruit — first night with Avner's undercover team."},
 {m:"avner",he:"אהלן. אתה החדש? שב מאחורה ותשתוק.",en:"Hey. You the new guy? Sit in the back and keep quiet.",learn:["אהלן","מאחורה"]},
 {m:"maya",he:"אל תתרגש, הוא תמיד ככה. בא לך קפה?",en:"Don't stress, he's always like this. Want some coffee?",learn:["אל תתרגש","בא לך"]},
 {c:"Answer Maya",o:[
  {he:"וואלה, בכיף. תודה!",en:"Sure, gladly. Thanks!",r:"ok",re:["maya","סבבה. שחור, בלי סוכר. ככה שותים פה.","Cool. Black, no sugar. That's how we drink here."]},
  {he:"כן, אני מבקש בבקשה כוס קפה אחת.",en:"Yes, I request please one cup of coffee.",r:"meh",re:["maya","מה זה, אולפן? דבר נורמלי, אחי.","What is this, ulpan? Talk normal, bro."],why:"Way too textbook. Between friends Israelis drop the stiff politeness — 'בכיף' does the job."},
  {he:"אין לי כוח אלייך.",en:"I can't deal with you.",r:"bad",re:["maya","יום ראשון וכבר עם גישה? יופי.","First day and already with an attitude? Great."],why:"'אין לי כוח אלייך' = 'I'm fed up with you'. Rude, not casual."}]},
 {m:"avner",he:"שקט. רכב לבן נכנס לחנייה.",en:"Quiet. A white car is pulling into the lot.",learn:["חנייה"]},
 {l:"maya",he:"הוא יוצא מהרכב עם תיק שחור.",en:"He's getting out of the car with a black bag.",o:["הוא יוצא מהרכב עם תיק שחור.","הוא נכנס לרכב עם תיק שחור.","הוא יוצא מהבית עם כובע שחור."],a:0},
 {m:"avner",he:"יפה. תעקבו אחריו עם העיניים, לא עם הראש.",en:"Good. Follow him with your eyes, not your head."},
 {m:"avner",he:"הוא מסתכל לכיוון שלנו! מה עושים?",en:"He's looking our way! What do we do?"},
 {c:"Quick!",timer:8,timeout:["avner","מאוחר מדי, הוא ראה אותנו. עוד פעם.","Too late, he saw us. Again."],o:[
  {he:"תתכופפו, עכשיו!",en:"Get down, now!",r:"ok",re:["avner","יופי. בלי לחשוב יותר מדי.","Good. Without overthinking."]},
  {he:"בואו נצא להגיד לו שלום.",en:"Let's get out and say hi.",r:"bad",re:["avner","אתה חי בסרט? אנחנו במארב!","Are you living in a movie? We're on a stakeout!"],why:"'חי בסרט' = living in a fantasy. Which you are."},
  {he:"רגע, אני צריך לחשוב על זה...",en:"Wait, I need to think about it...",r:"bad",re:["maya","אין זמן לחשוב, אחי!","No time to think, bro!"]}]},
 {m:"avner",he:"תכלס, יש לך אינסטינקטים. אולי יצא ממך משהו.",en:"Bottom line, you've got instincts. Maybe something'll come of you.",learn:["תכלס"]},
 {m:"maya",he:"וואו, זו מחמאה ממנו. תשמור אותה.",en:"Wow, that's a compliment from him. Hold on to it."},
 {t:"Maya tests you: say 'no biggie / no worries' in slang.",a:["בקטנה","אין בעיה","אין לחץ","בלי לחץ","סבבה","הכל טוב","הכול טוב"],alt:["bektana","bektana","ein beaya","ein bea'ya","sababa","bli lachats","ein lachats"],hint:"Starts with ב… literally 'in small'"},
 {m:"maya",he:"בדיוק. בקטנה. ברוך הבא לצוות.",en:"Exactly. No biggie. Welcome to the team.",learn:["בקטנה","ברוך הבא"]}
]},
{id:"s2",mode:"unit",icon:"☕",title:"Jaffa Café",he:"בית קפה ביפו",sub:"Blend in. Listen. Don't get made.",steps:[
 {n:"Jaffa, morning. You're undercover as a student with a laptop. Earpiece in — Avner is in a van around the corner."},
 {m:"waiter",he:"אהלן אחי, מה בא לך?",en:"Hey bro, what can I get you?"},
 {c:"Order",o:[
  {he:"תביא לי הפוך גדול וקרואסון, אם יש.",en:"Get me a large latte and a croissant, if you have one.",r:"ok",re:["waiter","יש, בטח. מגיע.","We do, sure. Coming up."]},
  {he:"שלום אדוני, ברצוני להזמין משקה חם.",en:"Hello sir, I would like to order a hot beverage.",r:"meh",re:["waiter","אדוני? מה, אנחנו בבנק? יאללה, הפוך?","Sir? What, are we at a bank? So — a latte?"],why:"'ברצוני' and 'אדוני' are formal/written Hebrew. A café is casual: 'תביא לי…' is normal, not rude."},
  {he:"תן לי אוכל.",en:"Give me food.",r:"meh",re:["waiter","אוכל... יש תפריט, אחי. תבחר משהו.","Food... there's a menu, bro. Pick something."]}]},
 {m:"avner",he:"תקשיב לשולחן ליד. אני רוצה לדעת כל מילה.",en:"(earpiece) Listen to the next table. I want every word."},
 {l:"stranger",he:"הפגישה זזה למחר בבוקר, ליד הנמל.",en:"The meeting moved to tomorrow morning, by the port.",o:["הפגישה היום בערב, ליד הים.","הפגישה זזה למחר בבוקר, ליד הנמל.","הפגישה זזה למחר בערב, ליד השוק."],a:1},
 {t:"Avner: 'When's the meeting? Write it in Hebrew.'",a:["מחר","מחר בבוקר","למחר בבוקר","למחר"],alt:["machar","machar baboker"],hint:"tomorrow (morning)"},
 {m:"avner",he:"קיבלתי. עבודה טובה. עכשיו תשב רגוע.",en:"Copy. Good work. Now sit tight.",learn:["קיבלתי"]},
 {m:"stranger",he:"סליחה, אחי, יש לך אש?",en:"Excuse me bro, got a light?",learn:["יש לך אש"]},
 {c:"Reply",o:[
  {he:"לא, סורי, אני לא מעשן.",en:"No, sorry, I don't smoke.",r:"ok",re:["stranger","סבבה, אין בעיה.","Cool, no problem."]},
  {he:"אש?! איפה? להזמין כבאים?",en:"Fire?! Where? Should I call the firefighters?",r:"bad",re:["stranger","מה?... אחי, אש. לסיגריה.","What?... Bro, a light. For a cigarette."],why:"'יש לך אש?' = 'got a light?' Nobody's burning."},
  {he:"אני לא סוכן, אני סתם סטודנט!",en:"I'm not an agent, I'm just a student!",r:"bad",re:["avner","מה אתה עושה?! אף אחד לא שאל!","What are you doing?! Nobody asked!"]}]},
 {m:"stranger",he:"רגע... ראיתי אותך פעם. לא היית בצבא עם אח שלי?",en:"Wait... I've seen you before. Weren't you in the army with my brother?"},
 {c:"Keep your cover!",timer:9,timeout:["avner","שתקת יותר מדי. זה חשוד. עוד פעם.","You went quiet too long. That's suspicious. Again."],o:[
  {he:"מה פתאום, אחי. אני סטודנט, באתי לכתוב פה בשקט.",en:"No way, bro. I'm a student, came here to write in peace.",r:"ok",re:["stranger","אה, סורי. דמיינתי.","Ah, sorry. My imagination."]},
  {he:"איך ידעת?!",en:"How did you know?!",r:"bad",re:["avner","אכלנו אותה... תחשוב לפני שאתה מדבר!","We're screwed... think before you talk!"],why:"'אכלנו אותה' = we're screwed (lit. 'we ate it')."},
  {he:"אממ... אולי? לא זוכר.",en:"Umm... maybe? Don't remember.",r:"bad",re:["stranger","אולי? אתה לא זוכר איפה היית בצבא?","Maybe? You don't remember where you served?"]}]},
 {m:"avner",he:"סחתיין. שמרת על קור רוח.",en:"Well done. You kept your cool.",learn:["סחתיין","קור רוח"]}
]},
{id:"s3",mode:"unit",icon:"📻",title:"Radio Call",he:"שיחה בקשר",sub:"Short, strict, no names",steps:[
 {n:"A rooftop overlooking a compound. On the radio you're 'Seven' (שבע). Avner is 'One' (אחת). Radio Hebrew: כאן = this is · עבור = over · קיבלתי = copy · חיובי / שלילי = affirmative / negative · סוף = out."},
 {m:"radio",he:"שבע, כאן אחת. מה המצב אצלך? עבור.",en:"Seven, this is One. What's your status? Over.",learn:["עבור","המצב"]},
 {c:"Report back",o:[
  {he:"אחת, כאן שבע. שקט אצלי, אין תנועה. עבור.",en:"One, this is Seven. Quiet here, no movement. Over.",r:"ok",re:["radio","קיבלתי. תודיע ברגע שיש תזוזה. סוף.","Copy. Report the moment there's movement. Out."]},
  {he:"היי אבנר! הכל טוב, מה איתך?",en:"Hey Avner! All good, how are you?",r:"bad",re:["radio","בלי שמות בקשר! ובלי 'מה איתך'. עוד פעם.","No names on the radio! And no 'how are you'. Again."]},
  {he:"שבע מדבר. אה... אין כלום.",en:"Seven speaking. Uh... nothing.",r:"meh",re:["radio","'כאן שבע', לא 'שבע מדבר'. ותסיים ב'עבור'.","'This is Seven', not 'Seven speaking'. And end with 'over'."]}]},
 {l:"maya",he:"יש תנועה בכניסה הצפונית, שני אנשים.",en:"Movement at the north entrance, two people.",o:["יש תנועה בכניסה הדרומית, שלושה אנשים.","אין תנועה בכניסה הצפונית, הכל שקט.","יש תנועה בכניסה הצפונית, שני אנשים."],a:2},
 {m:"radio",he:"שבע, אתה רואה אותם? עבור.",en:"Seven, do you see them? Over."},
 {c:"Answer fast",timer:8,timeout:["radio","שבע, אתה שומע אותי? תענה מהר יותר.","Seven, do you read me? Answer faster."],o:[
  {he:"חיובי. שניים, אחד עם כובע. עבור.",en:"Affirmative. Two, one with a hat. Over.",r:"ok",re:["radio","קיבלתי. תישאר עליהם.","Copy. Stay on them."]},
  {he:"כן כן, רואה! וואו, הם ממש קרובים!",en:"Yes yes, I see! Wow, they're really close!",r:"meh",re:["radio","תירגע. בקשר מדברים קצר: חיובי, שלילי.","Calm down. On the radio you keep it short: affirmative, negative."]},
  {he:"שנייה, אני בשירותים.",en:"One sec, I'm in the bathroom.",r:"bad",re:["maya","באמת?! עכשיו?!","Seriously?! Now?!"]}]},
 {t:"Type the radio word for 'copy / received'.",a:["קיבלתי"],alt:["kibalti"],hint:"קיב…"},
 {t:"And the word that ends a transmission: 'over'.",a:["עבור"],alt:["avor"],hint:"ע…"},
 {m:"radio",he:"יפה מאוד, שבע. אתה לומד מהר. חוזרים לבסיס. סוף.",en:"Very good, Seven. You learn fast. Heading back to base. Out.",learn:["סוף"]}
]},
{id:"s4",mode:"unit",icon:"🕯️",title:"Shabbat at Avner's Mom",he:"ארוחת שישי",sub:"The most dangerous mission",steps:[
 {n:"Friday night. Avner drags you to his mom's place. The table could feed a battalion."},
 {m:"orna",he:"תיכנס, תיכנס! שבת שלום! וואי, אתה רזה מדי. שב, תאכל.",en:"Come in, come in! Shabbat shalom! Wow, you're too skinny. Sit, eat.",learn:["וואי"]},
 {t:"Greet her back.",a:["שבת שלום"],alt:["shabbat shalom","shabat shalom"],hint:"Same greeting she used"},
 {m:"orna",he:"נו, תתחיל עם הסלטים. יש חומוס, מטבוחה, חצילים...",en:"Go on, start with the salads. There's hummus, matbucha, eggplant...",learn:["נו"]},
 {m:"avner",he:"טיפ: אל תתמלא מהסלטים. זה רק ההתחלה.",en:"Tip: don't fill up on the salads. That's just the beginning."},
 {l:"orna",he:"מי רוצה עוד שניצל? יש מלא במטבח!",en:"Who wants more schnitzel? There's tons in the kitchen!",o:["מי רוצה עוד סלט? אין יותר במטבח.","מי רוצה עוד שניצל? יש מלא במטבח!","מי רוצה עוד שניצל? הכל נגמר."],a:1},
 {m:"orna",he:"עוד קצת? רק חתיכה קטנה!",en:"A little more? Just a small piece!"},
 {c:"Third helping. Decline politely.",o:[
  {he:"תודה, אורנה, היה מדהים, אבל אני מפוצץ.",en:"Thanks Orna, it was amazing, but I'm stuffed.",r:"ok",re:["orna","מפוצץ? טוב... אז אני אארוז לך הביתה.","Stuffed? Fine... then I'll pack you some to take home."]},
  {he:"אני על דיאטה.",en:"I'm on a diet.",r:"meh",re:["orna","דיאטה? בשבת? אין דבר כזה!","A diet? On Shabbat? No such thing!"],why:"Compliment the food first, then 'אני מפוצץ'. A diet is not an excuse at an Israeli mom's table."},
  {he:"לא רוצה.",en:"Don't want.",r:"bad",re:["avner","אחי... ככה מדברים לאמא שלי?","Bro... that's how you talk to my mom?"]}]},
 {m:"orna",he:"נו, ספר לי, יש לך חברה?",en:"So, tell me, do you have a girlfriend?"},
 {c:"The interrogation",o:[
  {he:"עוד לא, אבל אני עובד על זה.",en:"Not yet, but I'm working on it.",r:"ok",re:["orna","יש לי בדיוק מישהי בשבילך! הבת של השכנה...","I have just the girl for you! The neighbor's daughter..."]},
  {he:"זה לא עניינך.",en:"That's none of your business.",r:"bad",re:["orna","וואי וואי... איזו חוצפה!","Oh my... what chutzpah!"],why:"Way too blunt for someone's mom. 'חוצפה' = nerve, cheek."},
  {he:"אני לא יכול לדבר על זה, זה סודי.",en:"I can't talk about it, it's classified.",r:"bad",re:["avner","אחי, אל תגיד 'סודי' ליד אמא שלי. עכשיו היא לא תפסיק לשאול.","Bro, don't say 'classified' around my mom. Now she'll never stop asking."]}]},
 {m:"avner",he:"אמא, די, תעזבי אותו. תני לו לאכול בשקט.",en:"Mom, enough, leave him alone. Let him eat in peace.",learn:["די","תעזבי אותו"]},
 {m:"orna",he:"טוב, טוב. בתיאבון, חמוד!",en:"Okay, okay. Enjoy your meal, sweetie!",learn:["בתיאבון","חמוד"]}
]},
{id:"s5",mode:"unit",icon:"🍅",title:"Shuk Haggling",he:"מיקוח בשוק",sub:"Never pay the first price",steps:[
 {n:"The shuk at noon. Avner needs you to linger near a spice stall — buying something is your excuse. Rule #1: never pay the first price."},
 {m:"vendor",he:"יאללה יאללה, הכל טרי! תטעם, אחי, תטעם!",en:"Come on, come on, everything's fresh! Taste, bro, taste!",learn:["יאללה"]},
 {c:"Ask the price of the dates",o:[
  {he:"כמה זה התמרים, אחי?",en:"How much are the dates, bro?",r:"ok",re:["vendor","בשבילך? שלושים לקילו.","For you? Thirty a kilo."]},
  {he:"מה המחיר של התמרים, אם אפשר לשאול?",en:"What is the price of the dates, if I may ask?",r:"meh",re:["vendor","אפשר, אפשר! שלושים לקילו, נשמה.","You may, you may! Thirty a kilo, sweetheart."],why:"Correct but stiff. In the shuk, short and confident wins."},
  {he:"תן לי את כל התמרים!",en:"Give me all the dates!",r:"bad",re:["vendor","כל התמרים? מה, אתה פותח חנות?","All the dates? What, are you opening a shop?"]}]},
 {m:"vendor",he:"שלושים לקילו. מחיר מיוחד רק בשבילך.",en:"Thirty a kilo. Special price just for you."},
 {c:"Haggle",o:[
  {he:"שלושים?! מה אתה, משוגע? תעשה לי מחיר.",en:"Thirty?! Are you crazy? Give me a price.",r:"ok",re:["vendor","טוב, טוב... עשרים וחמש, רק בגללך.","Okay, okay... twenty-five, only because it's you."]},
  {he:"בסדר, שלושים, מצוין.",en:"Okay, thirty, great.",r:"bad",re:["avner","שילמת את המחיר הראשון? יצאת פראייר, אחי.","You paid the first price? You came off a sucker, bro."],why:"'פראייר' = sucker. The worst thing to be in Israel."},
  {he:"אני לא קונה.",en:"I'm not buying.",r:"meh",re:["vendor","חכה, חכה! לאן אתה הולך? בוא נדבר.","Wait, wait! Where are you going? Let's talk."]}]},
 {l:"vendor",he:"שני קילו בארבעים, וזה אחרון!",en:"Two kilos for forty, and that's final!",o:["קילו בארבעים, וזה אחרון!","שני קילו בשלושים, וזה אחרון!","שני קילו בארבעים, וזה אחרון!"],a:2},
 {m:"vendor",he:"נו? אני לא מחכה כל היום!",en:"Well? I'm not waiting all day!"},
 {c:"Close it!",timer:7,timeout:["vendor","יאללה, הבא בתור!","Okay, next in line!"],o:[
  {he:"סגרנו!",en:"Deal!",r:"ok",re:["vendor","סגרנו! בתיאבון, אחי.","Deal! Enjoy, bro."]},
  {he:"אני צריך לבדוק עם אמא שלי.",en:"I need to check with my mom.",r:"bad",re:["vendor","עם אמא? יאללה, ביי.","With your mom? Okay, bye."]},
  {he:"אולי מחר?",en:"Maybe tomorrow?",r:"bad",re:["vendor","מחר המחיר עולה, אחי!","Tomorrow the price goes up, bro!"]}]},
 {m:"avner",he:"יפה. וראיתי את מי שרציתי לראות. אפשר לזוז.",en:"Nice. And I saw who I wanted to see. We can move.",learn:["לזוז"]},
 {t:"How do you say 'Deal!' in the shuk?",a:["סגרנו","סגור","דיל"],alt:["sagarnu","sagur","deal"],hint:"lit. 'we closed'",learn:["סגרנו"]}
]},
{id:"s6",mode:"unit",icon:"🍻",title:"Tel Aviv Bar Night",he:"לילה בבר",sub:"You and Maya, 'on a date'",steps:[
 {n:"Tel Aviv, Thursday, 23:30. A loud bar off Allenby. You and Maya are posing as a couple to watch a target at the bar."},
 {m:"maya",he:"תזכור, אנחנו זוג. תהיה טבעי.",en:"Remember, we're a couple. Be natural.",learn:["טבעי"]},
 {m:"bartender",he:"ערב טוב! מה שותים?",en:"Good evening! What are we drinking?"},
 {c:"Order",o:[
  {he:"שתי בירות מהחבית, בבקשה.",en:"Two draft beers, please.",r:"ok",re:["bartender","בכיף, מגיע.","Sure thing, coming up."]},
  {he:"יש לכם מיץ תפוזים?",en:"Do you have orange juice?",r:"meh",re:["maya","מיץ? בבר, ביום חמישי? אתה בולט.","Juice? In a bar, on a Thursday? You stand out."]},
  {he:"תן לי את הדבר הכי חזק שיש!",en:"Give me the strongest thing you've got!",r:"bad",re:["maya","אנחנו בעבודה, גאון.","We're working, genius."]}]},
 {m:"bartender",he:"לחיים!",en:"Cheers!"},
 {t:"Answer the toast.",a:["לחיים"],alt:["lechaim","lechayim","lchaim"],hint:"Same word back"},
 {m:"maya",he:"איזה קטע, הוא בדיוק הזמין וודקה. כמו שאבנר אמר.",en:"Funny — he just ordered vodka. Just like Avner said.",learn:["איזה קטע"]},
 {l:"target",he:"אני יוצא לעשן, תשמור לי על המקום.",en:"I'm going out for a smoke, save my spot.",o:["אני יוצא לעשן, תשמור לי על המקום.","אני יוצא לעשן, תזמין לי עוד אחד.","אני הולך הביתה, תשמור לי על הטלפון."],a:0},
 {m:"maya",he:"הוא זז! מה עושים?",en:"He's moving! What do we do?"},
 {c:"Decide!",timer:8,timeout:["maya","כמעט איבדנו אותו... תחליט מהר!","We almost lost him... decide fast!"],o:[
  {he:"תישארי פה, אני אחריו.",en:"Stay here, I'm on him.",r:"ok",re:["maya","סבבה. תיזהר.","Okay. Be careful."]},
  {he:"שנזמין עוד סיבוב?",en:"Should we order another round?",r:"bad",re:["maya","מה אתה, בחופש?!","What, are you on vacation?!"]},
  {he:"לא יודע, מה את חושבת?",en:"Dunno, what do you think?",r:"bad",re:["maya","אין זמן! תחליט!","No time! Decide!"]}]},
 {n:"Outside, the target makes a phone call. You catch every word. Twenty minutes later the team is back in the car."},
 {m:"avner",he:"חבל על הזמן מה שעשית היום. מהיום אתה חלק מהצוות.",en:"What you did today was awesome. From today you're part of the team.",learn:["חבל על הזמן"]},
 {c:"Your reply",o:[
  {he:"תודה, אחי. זה כבוד בשבילי.",en:"Thanks, bro. It's an honor for me.",r:"ok",re:["avner","אל תתרגש. מחר בשש בבוקר. ואני רוצה קפה.","Don't get excited. Tomorrow, six a.m. And I want coffee."]},
  {he:"ידעתי שאני הכי טוב.",en:"I knew I was the best.",r:"meh",re:["maya","הנה, הוא עף על עצמו.","There he goes, full of himself."],why:"'עף על עצמו' = full of himself (lit. 'flies on himself')."},
  {he:"רגע, יש משכורת?",en:"Wait, is there a salary?",r:"meh",re:["avner","חחח. אל תדחוף את המזל.","Haha. Don't push your luck."]}]}
]},
// ---- Concert ----
{id:"c1",mode:"concert",icon:"🎟️",title:"The Line at the Gate",he:"בתור לכניסה",sub:"Make friends with the fans",steps:[
 {n:"Concert night. The line at the gate is huge, and half of it is already singing."},
 {m:"noa",he:"אהלן! זו הפעם הראשונה שלך בהופעה של עומר אדם?",en:"Hi! Is this your first time at an Omer Adam show?"},
 {c:"Answer Noa",o:[
  {he:"כן! אני מת עליו, מחכה לזה כבר חודשים.",en:"Yes! I'm crazy about him, been waiting months for this.",r:"ok",re:["noa","איזה כיף! אתה תעוף, אני מבטיחה לך.","So fun! You're going to love it, I promise."]},
  {he:"כן. אני לומד עברית מהשירים שלו.",en:"Yes. I'm learning Hebrew from his songs.",r:"ok",re:["noa","וואו, איזה מתוק! והעברית שלך מעולה.","Aww, that's sweet! And your Hebrew is great."]},
  {he:"אני מת.",en:"I'm dead.",r:"bad",re:["noa","מה?! אתה בסדר? צריך מים?","What?! Are you okay? Need water?"],why:"'מת על…' = crazy about someone. 'אני מת' alone = 'I'm dying'."}]},
 {m:"noa",he:"איזה שיר אתה הכי מחכה לשמוע?",en:"Which song are you most excited to hear?",},
 {c:"Pick one",o:[
  {he:"שני משוגעים, ברור!",en:"Shnei Meshuga'im, obviously!",r:"ok",re:["noa","ברור! כל הקהל הולך להשתגע.","Obviously! The whole crowd is going to go crazy."]},
  {he:"תל אביב! אי אפשר בלי.",en:"Tel Aviv! Can't do without it.",r:"ok",re:["noa","נכון, זה ההמנון של העיר.","True, it's the city's anthem."]},
  {he:"מלכת הדור.",en:"Malkat HaDor.",r:"ok",re:["noa","וואו, בחירה רומנטית. יש לך מישהי בראש?","Ooh, romantic choice. Someone on your mind?"]}]},
 {m:"guard",he:"כרטיס ותעודה מזהה, בבקשה. ותפתח את התיק.",en:"Ticket and ID, please. And open the bag."},
 {l:"guard",he:"בקבוקים אסור להכניס, תזרוק את זה לפח.",en:"No bottles allowed in, toss that in the trash.",o:["בקבוקים מותר להכניס, תשאיר את זה בתיק.","בקבוקים אסור להכניס, תזרוק את זה לפח.","כרטיסים אסור לצלם, תשים את זה בכיס."],a:1},
 {c:"Reply to security",o:[
  {he:"אין בעיה, הנה.",en:"No problem, here.",r:"ok",re:["guard","תודה. תיהנה.","Thanks. Enjoy."]},
  {he:"אבל זה רק מים!",en:"But it's just water!",r:"meh",re:["guard","מצטער, אחי, אלה הכללים. יש מים בפנים.","Sorry bro, those are the rules. There's water inside."]},
  {he:"אתה יודע מי אני?",en:"Do you know who I am?",r:"bad",re:["guard","לא, ואני לא צריך לדעת. הבא בתור.","No, and I don't need to. Next."]}]},
 {m:"noa",he:"יאללה, נכנסים! תשמור על הטלפון, יש פה בלגן.",en:"Let's go in! Watch your phone, it's chaos in here.",learn:["בלגן"]}
]},
{id:"c2",mode:"concert",icon:"🍺",title:"At the Bar Stand",he:"בדוכן",sub:"Order, pay, get through the crowd",steps:[
 {n:"Twenty minutes to showtime. The bar stand is packed."},
 {m:"barista",he:"היי! מה בשבילך?",en:"Hi! What can I get you?"},
 {c:"Order",o:[
  {he:"שתי בירות ובקבוק מים, בבקשה.",en:"Two beers and a bottle of water, please.",r:"ok",re:["barista","בכיף. עוד משהו?","Sure. Anything else?"]},
  {he:"אני רוצה לשתות.",en:"I want to drink.",r:"meh",re:["barista","כן... אבל מה? יש בירה, מים, קולה.","Yeah... but what? There's beer, water, cola."]},
  {he:"תני לי הכל!",en:"Give me everything!",r:"bad",re:["barista","חחח, הכל? יש פה אלף איש מאחוריך.","Haha, everything? There are a thousand people behind you."]}]},
 {m:"barista",he:"יוצא תשעים שקל.",en:"That comes to ninety shekels.",learn:["יוצא"]},
 {t:"Ask if you can pay by card — type the key word for 'credit (card)'.",a:["אשראי","כרטיס אשראי","באשראי","אפשר באשראי"],alt:["ashrai"],hint:"א…",learn:["אשראי"]},
 {m:"barista",he:"ברור, תעביר פה.",en:"Sure, tap here."},
 {l:"fan",he:"אחי, אפשר לעבור? החברים שלי מקדימה.",en:"Bro, can I get by? My friends are up front.",o:["אחי, אפשר לשבת? החברים שלי מאחורה.","אחי, אפשר לצלם? החברים שלי מחכים.","אחי, אפשר לעבור? החברים שלי מקדימה."],a:2},
 {c:"Reply",o:[
  {he:"בטח, תעבור.",en:"Sure, go ahead.",r:"ok",re:["fan","תודה, אח יקר!","Thanks, dear brother!"]},
  {he:"לא, תחכה בתור.",en:"No, wait in line.",r:"meh",re:["fan","וואלה, סבבה, סבבה. אל תתעצבן.","Okay, okay, fine. Don't get mad."]},
  {he:"מה?",en:"What?",r:"meh",re:["fan","אפשר לעבור? ל-ע-ב-ו-ר.","Can I get by? G-E-T B-Y."]}]},
 {m:"fan",he:"הוא עולה לבמה! מהר, תצלם!",en:"He's coming on stage! Quick, film it!"},
 {c:"Now!",timer:7,timeout:["noa","פספסת את הכניסה... לא נורא, יש עוד הדרן.","You missed the entrance... no biggie, there's still the encore."],o:[
  {he:"יאללה, מצלם!",en:"Yalla, filming!",r:"ok",re:["noa","איזה כיף!!!","Yesss!!!"]},
  {he:"לא, אני רוצה לחיות את הרגע.",en:"No, I want to live in the moment.",r:"ok",re:["fan","וואלה, צודק.","Honestly, you're right."]},
  {he:"רגע, איפה הטלפון שלי?",en:"Wait, where's my phone?",r:"bad",re:["noa","אמרתי לך לשמור עליו!","I told you to watch it!"]}]}
]},
{id:"c3",mode:"concert",icon:"🎤",title:"Singing With the Crowd",he:"שרים עם הקהל",sub:"Israeli crowds talk back",steps:[
 {n:"He's on stage. Between songs he talks to the crowd — and an Israeli crowd answers."},
 {m:"singer",he:"ערב טוב, תל אביב! אתם איתי?",en:"Good evening, Tel Aviv! Are you with me?"},
 {c:"Shout back",o:[
  {he:"כן!!! אין עליך!",en:"Yes!!! You're the best!",r:"ok",re:["noa","אין עליו! תצעק יותר חזק!","He's the best! Shout louder!"]},
  {he:"בערך.",en:"Sort of.",r:"meh",re:["noa","בערך?! איזה בערך, תצעק!","Sort of?! What 'sort of', shout!"]},
  {he:"שקט, אני לא שומע.",en:"Quiet, I can't hear.",r:"bad",re:["noa","אתה בהופעה, אחי, לא בספרייה!","You're at a concert, bro, not a library!"]}]},
 {m:"singer",he:"אני רוצה לשמוע אתכם! כל הידיים למעלה!",en:"I want to hear you! Everybody hands up!",learn:["הידיים למעלה"]},
 {l:"noa",he:"הוא אמר שהשיר הבא מוקדש לכל הזוגות.",en:"He said the next song is dedicated to all the couples.",o:["הוא אמר שהשיר הבא מוקדש לכל האמהות.","הוא אמר שהשיר הבא מוקדש לכל הזוגות.","הוא אמר שזה השיר האחרון הערב."],a:1},
 {m:"noa",he:"וואי, אני מתה על השיר הזה! כל הקהל שר איתו.",en:"Oh wow, I love this song! The whole crowd is singing along.",learn:["מתה על"]},
 {t:"The show ends. Everyone chants for one more song. Type 'more!' in Hebrew.",a:["עוד","עוד שיר","הדרן","עוד עוד עוד"],alt:["od","od shir","hadran"],hint:"ע…"},
 {m:"noa",he:"עוד! עוד! עוד! הנה, הוא חוזר להדרן!",en:"More! More! More! Look, he's coming back for an encore!",learn:["הדרן"]},
 {m:"noa",he:"נו, איך היה? תגיד את האמת.",en:"So, how was it? Tell the truth."},
 {c:"Your verdict",o:[
  {he:"חבל על הזמן! הופעה של פעם בחיים.",en:"Incredible! A once-in-a-lifetime show.",r:"ok",re:["noa","אמרתי לך שתעוף!","Told you you'd love it!"]},
  {he:"היה בסדר.",en:"It was okay.",r:"meh",re:["noa","בסדר?! אתה רציני? הוא שר שלוש שעות!","Okay?! Are you serious? He sang for three hours!"]},
  {he:"היה לי משעמם.",en:"I was bored.",r:"bad",re:["noa","וואו. אני לא מדברת איתך יותר.","Wow. I'm not talking to you anymore."]}]}
]}
];
