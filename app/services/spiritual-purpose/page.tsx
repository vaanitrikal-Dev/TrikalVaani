/**
 * TRIKAAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/services/spiritual-purpose/page.tsx
 * Version: 5.0 (06 Sep 2026) — CALCULATOR CONVERSION + keyword content
 *
 * WHAT CHANGED
 *   1. All three CTAs pointed at /?segment=spiritual-purpose. Nothing in this
 *      repo reads the `segment` query parameter — category selection is React
 *      state set by CLICKING a homepage card, so the visitor landed on the
 *      plain homepage and had to find the card again.
 *   2. The page led with the price while BirthForm has a free tier.
 *   3. Title 72 chars + app/layout.tsx's "%s | Trikaal Vaani" template = 88
 *      rendered, cut by Google at ~58.
 *   The real BirthForm now sits on the page, preselected to
 *   genx_spiritual_innings.
 *
 * DOMAIN: genx_spiritual_innings — SINGLE chart, not in DUAL_CHART_DOMAINS.
 *   Note the label: "Spiritual 2nd Innings", a Gen X (47+) domain. This page
 *   is NOT a generic "what is my soul purpose" page — it is written for the
 *   second half of life, after the career and the raising is largely done.
 *   That framing is the whole differentiator and should not be flattened.
 *   If this id is ever changed, /api/predict falls back to 'mill_karz_mukti'
 *   (BirthForm L998) and the reader silently receives a DEBT reading.
 *
 * HONEST NOTE ON WHY THIS PAGE EXISTS AT ALL
 *   GSC, 3 months to 4 Sep 2026: 41 impressions, 1 click, position 12.5 —
 *   the weakest of all /services/ pages and the only one on page two. The
 *   Supabase counts look worse still (1 reading ever) but they are NOT a
 *   demand signal: the ?segment= funnel never worked, so 432 of ~495 readings
 *   fell through to the Karz Mukti default. Nobody could reach this domain.
 *   Rohiit's call, 06 Sep 2026: build it properly and judge it on 30 days of
 *   real data once the funnel works.
 *
 * CANNIBALISATION — the theory side is already covered:
 *   /blog/spiritual-purpose-astrology-kundli-reading (3,788 words),
 *   /blog/what-is-ketu (3,013), /blog/ketu-mahadasha-vairagya-symptoms (2,902),
 *   /blog/past-life-karmic-bond-8th-12th-house-astrology (+hindi),
 *   /blog/guru-mahadasha-wisdom-growth (3,359), /spirituality (1,775).
 *   THIS PAGE OWNS the second-innings decision: what now, what is mine to do,
 *   and which practice actually fits this chart. Theory is handed off by link.
 *
 * ⛔ THE SECTION THAT MUST NEVER BE REMOVED — 'vairagya-ya-udaasi'
 *   The classic reading of Ketu, a strong 12th house or a Moksha-trikona
 *   emphasis is "detachment, withdrawal, turning inward". At 50+, those same
 *   words describe depression. A page that tells a withdrawn, low, isolated
 *   reader that this is their spiritual awakening can keep them from help they
 *   need. That section names the difference plainly and says where to go. It
 *   is not a disclaimer and it is not optional.
 *
 * v4.1 CHANGES vs v4.0:
 *   ❌ REMOVED fake testimonials (fabricated reviews + ★★★★★ + "Verified Experiences")
 *   ❌ REMOVED phantom ₹499 / Rs 499 (hero call button, step 04, card strike-through, CTA button)
 *   ✅ /about → /founder (correct author URL — 3 spots)
 *   ✅ KEPT Maa Divine Seva (real Arzi/Dhanyewaad dakshina feature)
 *   ✅ Brand/Jini/Prokerala/vendor already clean — left intact
 *   ✅ Real price on this page = ₹51 (reading)
 */
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import ServiceReadingForm from '@/components/services/ServiceReadingForm';

export const metadata: Metadata = {
  title: { absolute: "Jeevan Ka Uddeshya — Free Kundli Jaanch | Trikaal Vaani" },
  description: "Chief Vedic Architect Rohiit Gupta reads your Ketu, Atmakaraka and 12th House to reveal past-life karma, your dharmic mission, and the soul lesson you were born to complete. ₹51 reading.",
  keywords: ["soul purpose astrology vedic", "spiritual path astrology India", "Ketu astrology past life", "12th house spiritual astrology", "Atmakaraka soul purpose", "moksha astrology reading"],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  openGraph: { title: "What Is My Soul Purpose? | Trikaal Vaani", description: "Rohiit Gupta decodes your Ketu, Atmakaraka and past-life karma.", url: "https://trikalvaani.com/services/spiritual-purpose", siteName: "Trikaal Vaani", type: "website", locale: "en_IN" },
  alternates: { canonical: "https://trikalvaani.com/services/spiritual-purpose" },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", name: "Spiritual Purpose — Soul Mission Reading", provider: { "@type": "Person", name: "Rohiit Gupta", jobTitle: "Chief Vedic Architect", url: "https://trikalvaani.com/founder" }, offers: [{ "@type": "Offer", price: "51", priceCurrency: "INR" }], areaServed: "IN" },
    { "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "What is Atmakaraka in Vedic astrology?", acceptedAnswer: { "@type": "Answer", text: "Atmakaraka is the planet with the highest degree in your birth chart. It represents the soul's primary lesson in this lifetime. When you live in alignment with your Atmakaraka's energy, life feels purposeful. When misaligned, existential emptiness persists regardless of material success." } },
      { "@type": "Question", name: "What does Ketu represent in a birth chart?", acceptedAnswer: { "@type": "Answer", text: "Ketu represents where your soul has already mastered in past lifetimes. Its house and sign show your natural gifts and karmic completions. Ketu's placement explains unexplained fears, instant mastery in certain areas, and the sense of already knowing things never taught." } },
      { "@type": "Question", name: "What is Moksha Yoga in Vedic astrology?", acceptedAnswer: { "@type": "Answer", text: "Moksha Yoga refers to planetary combinations indicating a soul on a path toward liberation. These include Ketu in the 12th house, Jupiter aspecting the 12th house, or the Moon-Ketu conjunction in spiritual houses." } },
    ]},
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://trikalvaani.com" }, { "@type": "ListItem", position: 2, name: "Services", item: "https://trikalvaani.com/services" }, { "@type": "ListItem", position: 3, name: "Spiritual Purpose", item: "https://trikalvaani.com/services/spiritual-purpose" }] },
  ],
};


// ════════════════════════════════════════════════════════════════════════════
// v5.0 CONTENT — the SECOND-INNINGS decision, not generic soul-purpose theory.
// Theory lives in the blog pages listed in the file header.
// The 'vairagya-ya-udaasi' section is load-bearing. Do not remove it.
// ════════════════════════════════════════════════════════════════════════════

type V6Section = { id: string; h2: string; paras: string[] };
type V6Link    = { href: string; label: string; note: string };

const V6_SECTIONS: V6Section[] = [
  {
    id: 'kaise-kaam',
    h2: 'Ye reading kaam kaise karti hai',
    paras: [
      'Upar wale form mein **janm tithi, sateek samay aur sthan** daaliye. Reading aapke apne chart se banti hai.',
      'Dekha kya jaata hai: **Ketu** (vairagya aur poorv-janm ka kaarak), **Atmakaraka** — wo graha jiski degree aapke chart mein sabse zyada ho, jo aatma ki ichha darshata hai, **navam bhaav** (dharm aur guru), **barahvaan** (moksha aur ekaant), aur **chal rahi dasha**.',
      '**Pehla reading free hai.** Poora vishleshan chahiye to uske baad ₹51 ka vikalp aata hai.',
    ],
  },
  {
    id: 'doosri-pari',
    h2: 'Doosri pari — ye page kis daur ke liye hai',
    paras: [
      'Ye page un logon ke liye likha gaya hai jinki **pehli pari khatm ho chuki hai** — career ka bada hissa nikal gaya, bachche bade ho gaye, zimmedari ka bojh halka hua.',
      'Us daur mein ek sawaal apne aap uthta hai, aur wo sabse pehle chup-chaap aata hai: **"ab kya?"** Kaam abhi bhi chal raha hai, ghar bhi theek hai, par kuch adhoora lagta hai — aur kisi se kehna mushkil hai kyunki bahar se sab theek dikhta hai.',
      'Shastra is daur ko pehchanta hai. Paramparik jeevan ke char aashram mein — brahmacharya, grihastha, vanaprastha, sanyasa — **teesra aashram theek yahi hai.** Ye koi nayi khoj nahi, ye us kram ka hissa hai.',
      'Isliye ye page 25 saal ke "soul purpose" wale sawaal ka nahi hai. Wo alag cheez hai. **Ye us mod ka hai jahan aap abhi khade hain.**',
    ],
  },
  {
    id: 'atmakaraka',
    h2: 'Atmakaraka — aapki aatma kis cheez ke peeche hai',
    paras: [
      'Ye is reading ka mool hai, aur Jaimini paddhati ka sabse gehra hissa.',
      '**Atmakaraka wo graha hai jiski degree aapke chart mein sabse zyada hai** — chahe wo kisi bhi bhaav mein ho. Jaimini kehte hain wahi graha aatma ki mool ichha darshata hai; wo cheez jiske peeche aap jeevan bhar chalte rahe, chahe aapko pata ho ya nahi.',
      'Kaunsa graha kya kehta hai: **Surya** — pehchan aur adhikaar; **Chandra** — bhaav aur poshan; **Mangal** — sangharsh aur saahas; **Budh** — samajh aur sanvaad; **Guru** — gyaan aur dharm; **Shukra** — prem aur saundarya; **Shani** — sewa, dheeraj aur zimmedari; **Rahu** — ichha aur asaamanya raste.',
      'Aur ek baat jo Jaimini saaf kehte hain: **Atmakaraka wahi jagah hai jahan sabse zyada kasauti aati hai.** Jis cheez ki aatma sabse zyada chaah rakhti hai, wahi jeevan bhar sabse zyada mushkil se milti hai — aur wahi seekhne ka vishay hoti hai.',
    ],
  },
  {
    id: 'ketu',
    h2: 'Ketu — adhoore karm aur vairagya ka kaarak',
    paras: [
      'Adhyatm ke prashn mein **Ketu** sabse zyada bolta hai, aur uska swabhav samajh lena zaroori hai.',
      '**Ketu chhod dene ka kaarak hai.** Jahan wo baithta hai, us kshetra mein vyakti nipun hota hai par usse santushti nahi milti — kyunki shastra ke anusar wo kaam **poorv janm mein poora ho chuka** hai. Isi liye Ketu ke bhaav mein safalta bhi aati hai aur khaalipan bhi.',
      'Kahan baitha hai, iska seedha arth: **barahve mein** — moksha ki taraf swabhavik jhukav; **navam mein** — dharm aur guru ki khoj; **panchma mein** — mantra aur sadhana mein sahaj gati; **aathve mein** — gehri, chhupi hui khoj.',
      'Aur ek baat jo raahat deti hai: **Ketu ka matlab sab chhod dena nahi hai.** Uska matlab hai ki us kshetra ki pakadd dheeli hoti hai — jo asal mein aazadi hai, kami nahi. Ketu ka poora swabhav [What is Ketu](/blog/what-is-ketu) mein khola gaya hai.',
    ],
  },
  {
    id: 'vairagya-ya-udaasi',
    h2: 'Vairagya hai ya udaasi — ye antar sabse zaroori hai',
    paras: [
      'Is page ka sabse zaroori section yahi hai, aur ise saaf bol dena chahiye.',
      'Jyotish jab Ketu, barahve bhaav ya moksha-trikona ki baat karta hai, to shabd wahi aate hain — **"doori", "andar ki taraf mudna", "cheezon se mann hatna"**. Aur 50 ki umar mein bilkul yahi shabd **udaasi** ke bhi hote hain.',
      'Antar kya hai: **vairagya mein shanti hoti hai** — cheezein chhoti lagne lagti hain par mann halka rehta hai, neend theek rehti hai, aur logon se milne ka mann hota hai chahe zaroorat kam ho. **Udaasi mein bhaaripan hota hai** — neend tootne lagti hai, kuch achha nahi lagta, khud se bhi door lagta hai, aur uthna mushkil ho jaata hai.',
      'Ye baat kehna is page ke apne vyapaar ke khilaf jaata hai, par kehni hai: **agar aap doosri wali sthiti mein hain, to wo aapka adhyatmik jagran nahi hai** — aur us waqt reading padhna madad nahi karega. Wahan pehla kadam kisi apne se baat karna hai, ya kisi doctor se.',
      'Koi bhi jyotishiya vyakhya us baat ki jagah nahi le sakti, aur jo koi udaasi ko "spiritual awakening" bata kar upay beche, wo galat kar raha hai.',
    ],
  },
  {
    id: 'moksha-trikona',
    h2: 'Moksha trikona — chautha, aathvaan aur barahvaan',
    paras: [
      'Shastra mein baarah bhaavon ko char shreniyon mein baanta gaya hai, aur unme se ek poori tarah adhyatm ki hai.',
      '**Moksha trikona = chautha, aathvaan aur barahvaan bhaav.** Chautha — antar ki shanti aur mann ka thikana. Aathvaan — gehrai, parivartan, chhupi hui vidya. Barahvaan — tyag, ekaant, aur moksha.',
      'Agar aapke chart mein in teen bhaavon mein graha bhare hain, ya inke swami balwan hain, to shastra ise **adhyatmik jhukav** maanta hai — yaani ye vishay aapke liye swabhavik hai, thopa hua nahi.',
      'Par yahan ek zaroori sudhar: **ye teeno "dusthana" bhi kehlaate hain**, aur bahut jagah inhe bura bata diya jaata hai. Ye adhoora hai. Aathvaan bhaav gehri khoj deta hai aur barahvaan wo shanti jo bheed mein nahi milti. Yahi bhaav **Vipreet Raj Yoga** bhi banate hain — [vistaar se yahan](/learn/vipreet-raj-yoga).',
    ],
  },
  {
    id: 'ishta-devata',
    h2: 'Ishta Devata — aapka apna devta kaun hai',
    paras: [
      'Ye Jaimini paddhati ka sabse sundar hissa hai aur bahut kam jagah milta hai.',
      'Vidhi ye hai: Atmakaraka ka Navamsa (D-9) mein jo sthaan hai use **Karakamsa** kehte hain. Us Karakamsa se **barahvaan bhaav** dekha jaata hai — aur us bhaav ka swami ya usme baitha graha **Ishta Devata** darshata hai. Yaani wo devta jinki upasana aapke liye sabse sahaj aur sabse phaldayi hai.',
      'Grahon ke devta: **Surya — Ram ya Shiv; Chandra — Parvati, Krishna; Mangal — Hanuman, Kartikeya; Budh — Vishnu; Guru — Vishnu, Dattatreya; Shukra — Lakshmi, Mahalakshmi; Shani — Hanuman, Shiv; Rahu — Durga, Kali; Ketu — Ganesh.**',
      'Ye jaankari kyun kaam ki hai: **log saalon tak wo pooja karte rehte hain jo ghar mein chali aa rahi hai, aur usme mann nahi lagta.** Ishta Devata pata chalne par sadhana apne aap sahaj ho jaati hai — kyunki wo aapke chart se aaya hai, riwaz se nahi.',
      'Ye poore reading mein alag se aata hai.',
    ],
  },
  {
    id: 'kaunsa-marg',
    h2: 'Kaunsa marg — bhakti, gyaan, karm ya dhyan',
    paras: [
      'Shastra char marg batata hai, aur chart ishara karta hai ki kaunsa aapke liye sahaj hai. Ye jaan lena saalon ki bhatkan bacha deta hai.',
      '**Bhakti marg** — balwan **Chandra ya Shukra**, ya Guru ka chauthe bhaav se sambandh. Aise logon ko naam, keertan aur murti-pooja se sahaj gati milti hai; darshan ki kitabein prayah bhaari lagti hain.',
      '**Gyaan marg** — balwan **Guru aur Budh**, navam bhaav mazboot. Inhe padhna, samajhna aur sawal karna chahiye; keval ratna hua paath khaali lagta hai.',
      '**Karm marg** — balwan **Shani ya Mangal**, chhathaa aur dasham mazboot. Inke liye sewa hi sadhana hai — anna-daan, kisi sanstha ka kaam, kisi ki madad. Baith kar dhyan karna in par prayah nahi chalta, aur wo unki kami nahi hai.',
      '**Dhyan aur raja marg** — balwan **Ketu**, barahvaan aur aathvaan bhaav sakriy. Inhe ekaant aur maun se hi gati milti hai.',
    ],
  },
  {
    id: 'guru-kab-milega',
    h2: 'Guru kab milega — aur kaise pehchanein',
    paras: [
      'Ye sawaal is umar mein bahut aata hai, aur uska jyotishiya uttar asli hai.',
      '**Navam bhaav guru ka bhaav hai** — aur uska swami tatha Guru graha dono batate hain ki aapke jeevan mein raah dikhane wala kaun aur kab aayega. Balwan navam ke saath guru apne aap milte hain; kamzor navam ke saath khojna padta hai.',
      'Samay dasha se aata hai: **Guru ki Mahadasha ya Antardasha**, ya navam ke swami ka daur — inhi mein prayah wo mulakat hoti hai.',
      'Aur ek baat jo shastra bhi kehta hai aur anubhav bhi: **jo guru aapse paisa, aapki sampatti ya aapka faisla maange — wo guru nahi hai.** Ye is umar mein sabse zaroori chetavni hai, kyunki nishchay ki khoj mein log sabse aasaani se pakde jaate hain.',
    ],
  },
  {
    id: 'sanyas-yog',
    h2: 'Sanyas yog — iska matlab ghar chhodna nahi hai',
    paras: [
      'Classical granthon mein "Pravrajya Yoga" ya sanyas yog ka zikr hai, aur uska arth aksar bahut galat samjha jaata hai.',
      'Wo yog tab bataya gaya hai jab **char ya usse zyada graha ek hi bhaav mein** ho jaayein, ya Ketu-Shani jaise sanyog banein. Shastra kehta hai aisa vyakti **sansaar se thodi doori** rakh kar jeeta hai.',
      'Par uska vyavharik arth ye **nahi** hai ki wo ghar chhod dega. Aaj ke sandarbh mein wo aksar aisa dikhta hai: bheed pasand nahi, dikhawa pasand nahi, kam cheezon mein santushti, aur ek andar ka kona jo kisi ko nahi dikhata. **Ye poori tarah grihastha jeevan ke andar rehta hai.**',
      'Isliye agar reading mein ye yog aaye to ghabraiye mat. **Aaj ke yug mein sanyas ka arth tyag nahi, saralta hai** — aur wo kisi bhi ghar mein sambhav hai.',
    ],
  },
  {
    id: 'poorv-janm',
    h2: 'Poorv janm ke sanket — kitna maanein',
    paras: [
      'Ye vishay is page par aata hai aur uspar imandari zaroori hai.',
      'Shastra mein **Ketu, aathvaan aur barahvaan bhaav** poorv-janm ke karm se jode gaye hain. Ketu jahan hai, wahan ka kaam "poora ho chuka" maana jaata hai — isi liye wahan nipunta hoti hai par ruchi nahi.',
      'Isi tarah **Rahu wo dikhata hai jo is janm mein seekhna hai** — Ketu ke bilkul saamne. Rahu ke bhaav mein sab kuch naya, ulajhan bhara aur khinchne wala lagta hai, kyunki wo anubhav pehli baar aa raha hai.',
      'Par seema saaf: **koi chart ye nahi bata sakta ki aap pichle janm mein kaun the.** Jo koi naam, jagah ya kahani batae, wo kalpana bech raha hai. Jo shastra deta hai wo **pravritti** hai — kaunsa kshetra sahaj hai aur kaunsa nayi seekh ka. Vistaar se [Past life aur karmic bond](/blog/past-life-karmic-bond-8th-12th-house-astrology) mein.',
    ],
  },
  {
    id: 'ketu-dasha',
    h2: 'Ketu ki dasha — jab sab kuch chhota lagne lagta hai',
    paras: [
      'Agar aap is page par isi haal mein aaye hain, to shayad yahi wajah hai.',
      '**Ketu ki Mahadasha 7 saal ki hoti hai**, aur uska anubhav ek jaisa bataya jaata hai — jo cheezein pehle bahut zaroori lagti thi, wo achanak chhoti lagne lagti hain. Kaam, pad, log, jodna — sab par pakadd dheeli padti hai.',
      'Us daur mein log prayah do mein se ek karte hain: ya to kuch bada chhod dete hain (naukri, sheher, koi rishta), ya pehli baar adhyatm ki taraf mudte hain. **Dono is dasha ke swabhav mein hain.**',
      'Aur do baatein saath mein. **Ek — ye daur khatm hota hai**, aur uske baad Shukra ki 20 saal ki dasha aati hai, jo bilkul ulta swabhav rakhti hai. **Do — us daur mein liya gaya bada aur na-palatne wala faisla baad mein bhaari pad sakta hai.** Vistaar se [Ketu Mahadasha aur vairagya ke lakshan](/blog/ketu-mahadasha-vairagya-symptoms) mein.',
    ],
  },
  {
    id: 'sadhana-kaunsi',
    h2: 'Kaunsi sadhana shuru karein — aur kitni',
    paras: [
      'Ye sabse vyavharik sawaal hai aur uska uttar chart se nikalta hai.',
      'Chart batata hai ki aapke liye kya **tikega**. Balwan Chandra wale ko naam-jaap sahaj lagta hai; balwan Budh wale ko paath aur adhyayan; Mangal wale ko koi kriya ya seva; Ketu wale ko maun aur dhyan. Ishta Devata ka mantra sabse sahaj rehta hai.',
      'Aur ek niyam jo har parampara deti hai: **ek cheez, roz, chhoti si.** Das minute ka jaap jo roz ho, us ek ghante se behtar hai jo mahine mein ek baar ho. Shastra mein bhi **niyamitta** ko hi bal kaha gaya hai.',
      'Jo nahi karna chahiye: ek saath paanch cheezein shuru karna, ya kisi aise anushthan mein utarna jo aapke ghar aur sehat ke saath na chale. **Sadhana jeevan ke andar chalni chahiye, uske khilaf nahi.**',
    ],
  },
  {
    id: 'teerth-yatra',
    h2: 'Teerth yatra ka yog aur samay',
    paras: [
      'Is umar mein ye yojana bahut banti hai, aur chart usme kaam aata hai.',
      'Dekhe jaate hain **navam bhaav** (lambi yatra aur dharm) aur **barahvaan** (door ka sthaan, tyag). In dono ka swami aur unki dasha batati hai ki kab wo yatra sahaj banegi.',
      'Anukool daur: **Guru ka navam par gochar**, navam ke swami ki dasha, ya **Ketu ki antardasha** — Ketu teerth aur maun dono ka kaarak hai.',
      'Vyavharik salah, aur ye shastra ke khilaf nahi: **sehat pehle.** Kai teerth kathin hain, aur is umar mein anukool daur ka matlab surakshit yatra nahi hota. Panchang aur muhurat [yahan](/panchang) free hai.',
    ],
  },
  {
    id: 'daan-seva',
    h2: 'Daan aur sewa — sabse kam bola jaane wala marg',
    paras: [
      'Bahut se logon ke chart mein sadhana ka rasta baith kar dhyan karna nahi hai — aur wo unki kami nahi hai.',
      '**Balwan Shani** wale logon ke liye shastra **sewa** ko hi sadhana kehta hai. Anna-daan, kisi bimaar ki madad, kisi sanstha ka kaam, ya wo vidya baantna jo aapne jeevan bhar jodi. In logon ko mandir se zyada shanti kisi ke kaam aane mein milti hai.',
      '**Balwan Guru** wale ke liye vidya-daan — padhana, salah dena, kisi naye ko raasta dikhana. Is umar mein ye sabse sahaj bhi hai, kyunki dene layak anubhav paas mein hai.',
      'Aur ek baat jo is daur mein sabse zyada kaam ki hai: **sewa akelapan bhi kaat deti hai.** Doosri pari ka sabse bada khatra khaali samay hai, aur uska sabse achha jawab kisi ke kaam aana hai — shastra aur anubhav dono yahi kehte hain.',
    ],
  },
  {
    id: 'kaam-chhod-dun',
    h2: 'Sab chhod kar adhyatm mein jaana chahiye?',
    paras: [
      'Ye sawaal aata hai, aur uska uttar saaf hona chahiye — chahe wo romanchak na ho.',
      '**Nahi, aur shastra bhi yahi kehta hai.** Char aashram ka kram hi ye batata hai: grihastha ke baad vanaprastha, aur wo bhi dheere. Achanak sab chhod dena kisi granth mein nahi kaha gaya.',
      'Vyavharik roop se: **Ketu ya Shani ke daur mein sab chhod dene ka mann sabse zyada karta hai** — aur wahi wo daur hai jab aisa faisla sabse zyada pachhtava deta hai, kyunki daur badalte hi mann badal jaata hai.',
      'Jo shastra kehta hai wo ye: **karm chalte rahiye, pakadd dheeli kijiye.** Yahi Gita ka mool hai. Aur is umar mein wo poori tarah sambhav hai — kaam bhi chale, aur usse bandhe hue bhi na rahein.',
    ],
  },
  {
    id: 'parivaar-samajhta-nahi',
    h2: 'Ghar mein koi samajhta nahi — ye bhi chart mein hai',
    paras: [
      'Ye is daur ka sabse chhupa hua dard hai aur bahut kam bola jaata hai.',
      'Jab barahvaan bhaav ya Ketu sakriy hota hai, to vyakti apne andar mudta hai — aur ghar walon ko lagta hai ki wo "door ho gaya" ya "ab kisi cheez mein mann nahi lagata". **Dono taraf koi galat nahi hota**, bas do alag daur chal rahe hote hain.',
      'Chart mein ye dikhta hai: **chautha bhaav** (ghar aur mann ka thikana) aur **barahvaan** (ekaant) ke beech ka takrav. Jab dono sakriy hon, to yahi sthiti banti hai.',
      'Vyavharik salah: **apni sadhana ko ghar par thopiye mat, aur usse chhupaiye bhi mat.** Jo log is daur ko chup-chaap nibhaate hain, unhe akelapan zyada lagta hai; jo ise sabpar lagu karna chahte hain, unhe virodh milta hai. Beech ka rasta hi tikta hai.',
    ],
  },
  {
    id: 'ratna-adhyatm',
    h2: 'Adhyatm ke liye ratna — savdhaani ki jagah',
    paras: [
      'Ye poochha jaata hai aur is par saaf hona zaroori hai.',
      '**Ketu ke liye Lehsunia** aur **Rahu ke liye Gomed** — dono adhyatm se jode jaate hain. Aur dono **sabse tez asar dene wale ratnon mein** hain, jinka phal jaldi dikhta hai chahe anukool ho ya nahi.',
      'Isliye niyam wahi hai jo har ratna par lagta hai: **faisla lagna se hota hai, ichha se nahi.** Ketu ka ratna tabhi jab wo aapke lagna ke liye anukool ho — aur kai lagno ke liye wo nahi hai.',
      'Aur is vishay mein ek baat khaas: **adhyatm ke liye ratna zaroori nahi hai.** Mantra, maun, sewa aur daan — chaaron mein paisa nahi lagta aur chaaron ka koi ulta asar nahi hai. Jaanch karni ho to [Gemstone Suitability Calculator](/calculators/free-gemstone-suitability-calculator) free hai.',
    ],
  },
  {
    id: 'kya-nahi-batata',
    h2: 'Ye reading kya nahi bata sakti',
    paras: [
      'Ye seema is page ke apne vyapaar ke khilaf jaati hai, par likhni chahiye.',
      'Ye **nahi** bata sakti: aapko moksha milega ya nahi, aap pichle janm mein kaun the, aapka guru kaun hoga, ya aapki aayu. Ye chaaron aise daawe hain jo koi shastra nahi karta, aur jo koi karta hai wo bech raha hai.',
      'Aur ye **nahi hai**: kisi manasik sthiti ka nidaan, na hi kisi doctor ya salahkaar ki jagah. Wo baat upar `vairagya-ya-udaasi` mein saaf likhi hai aur wo is page ka sabse zaroori hissa hai.',
      'Jo ye deti hai: **aapka Atmakaraka, aapka Ishta Devata, kaunsa marg aapke chart mein sahaj hai, aur abhi kaunsa daur chal raha hai.** Char jaankariyaan — aur is mod par chaaron kaafi hoti hain.',
    ],
  },
  {
    id: 'free-vs-paid',
    h2: 'Free mein kya milta hai aur ₹51 mein kya',
    paras: [
      '**Free — Trikaal Ka Sandesh.** Aapka Ketu kahan hai, barahvaan aur navam bhaav ki sthiti, chal rahi dasha, aur ek seedha sanket ki abhi ka daur andar ki taraf le ja raha hai ya bahar. 150-200 shabd, turant, bina signup.',
      '**₹51 — poora vishleshan.** **Atmakaraka** aur uska arth, **Karakamsa se nikla Ishta Devata**, moksha trikona ka vishleshan, kaunsa marg (bhakti/gyaan/karm/dhyan) aapke chart mein sahaj hai, dasha ka aane wala kram, aur **paanch saral upay** — jinme paisa nahi lagta.',
      'Jo yahan nahi hai: koi dar, koi "aapke poorv janm ka shraap", koi mehnga anushthan. Is kshetra mein wahi sabse zyada becha jaata hai, aur wahi sabse khokhla hai.',
    ],
  },
  {
    id: 'kis-ke-liye',
    h2: 'Ye reading kiske liye hai',
    paras: [
      '**Sabse zyada kaam ki:** jinki pehli pari poori ho chuki hai aur "ab kya" ka sawaal andar chal raha hai; jinhone kai jagah sadhana try ki par kahin tik nahi paye; aur jinhe lagta hai kuch adhoora hai par bata nahi paate ki kya.',
      '**Kam kaam ki:** jo koi nishchit bhavishyavani chahte hain — wo yahan nahi milegi. Aur jinke paas sateek janm samay nahi hai, kyunki bina samay ke Navamsa nahi banta aur Ishta Devata usi se nikalta hai.',
      'Aur **ek jagah jahan ye page sahi jagah nahi hai:** agar aap lagatar bhaari, akela ya khaali mehsoos kar rahe hain. Wo upar wala section padhiye — aur uspar amal kijiye. Ye reading us baat ki jagah nahi le sakti.',
    ],
  },
  {
    id: 'result-kaise-padhein',
    h2: 'Report padhne ka sahi kram',
    paras: [
      'Ye reading baaki sab se alag padhi jaati hai, isliye kram bata dena zaroori hai.',
      '**Pehle Atmakaraka dekhiye** — wo ek graha aapke poore jeevan ki disha ka saar hai. Uspar thoda ruk kar sochiye ki wo aapke anubhav se mel khaata hai ya nahi.',
      '**Phir Ketu** — kis bhaav mein hai, aur kya us kshetra mein sach mein aapko nipunta ke saath khaalipan bhi mila hai. Ye pehchan aksar turant hoti hai.',
      '**Phir Ishta Devata aur marg** — aur yahi hissa aap kal se istemaal kar sakte hain. **Sabse aakhir mein dasha**, kyunki wo batati hai ki abhi kaunsa daur chal raha hai aur wo kab badlega.',
    ],
  },
  {
    id: 'kitni-baar',
    h2: 'Ye reading kitni baar leni chahiye',
    paras: [
      '**Ek baar kaafi hai.** Atmakaraka, Ishta Devata, Ketu ki sthiti, moksha trikona — ye kabhi nahi badalte. Ye is page ki khaas baat hai: baaki readings samay ke saath badalti hain, ye nahi.',
      '**Dasha wala hissa** kuch saal mein ek baar dekh lijiye, jab daur badle.',
      'Aur ek baat jo is vishay mein khaas hai: **is reading ko ek baar padh kar rakh dijiye, aur kuch mahine baad dobara padhiye.** Adhyatm ke prashn mein wo baat jo pehli baar samajh nahi aati, wo aage chal kar apne aap khul jaati hai.',
    ],
  },
  {
    id: 'verify',
    h2: 'Reading ki buniyad khud parakhiye',
    paras: [
      'Kisi bhi reading par bharosa karne se pehle uski ganana parakhni chahiye.',
      'Wahi janm vivaran kisi doosre bharose-mand software mein daaliye. **Lagna, Ketu ki rashi aur bhaav, aur barahve bhaav ki rashi** bilkul milni chahiye — dono taraf Lahiri ayanamsha ho to antar nahi aayega.',
      '**Atmakaraka bhi khud gin sakte hain** — jis graha ki degree (rashi ke andar) sabse zyada ho, wahi hai. Rahu ko kuch paramparaein ulta ginti hain, isliye wahan thoda antar aa sakta hai.',
      'Aur **dasha** milaiye — wo janm nakshatra se nikalti hai aur usme koi vyakhya nahi hai, isliye bilkul milni chahiye. Poori kundali [Kundali Calculator](/calculators/free-kundali-calculator) par free hai.',
    ],
  },
  {
    id: 'graha-shanti-nahi',
    h2: 'Graha shanti aur adhyatm — do alag cheezein',
    paras: [
      'Ye antar is page par zaroori hai, kyunki dono ko ek maan lena bahut aam hai.',
      '**Graha shanti** ek samasya ka upay hai — kisi peedit graha ko sahara dena taaki uska dabav kam ho. Wo ek zaroorat hai aur uska apna sthaan hai.',
      '**Adhyatm** ka lakshya alag hai. Wahan graha ko badalna nahi, **apni pakadd dheeli karni** hoti hai. Isi liye adhyatmik sadhana mein "phal" ki baat nahi ki jaati — jo phal maang kar kiya jaaye wo pooja hai, sadhana nahi.',
      'Vyavharik matlab: agar aapka sawaal koi rukavat hai — naukri, sehat, rishta — to **wo is page ka vishay nahi hai**, aur uske liye alag pages behtar uttar denge. Ye page tab ke liye hai jab bahar sab theek ho aur andar sawaal ho.',
    ],
  },
  {
    id: 'kya-badal-jayega',
    h2: 'Is reading ke baad kya badlega — imandar uttar',
    paras: [
      'Ye kah dena chahiye, kyunki umeed sahi jagah rakhni chahiye.',
      '**Aapka chart nahi badlega.** Ketu wahi rahega, Atmakaraka wahi. Ye reading kuch theek nahi karti — wo naksha deti hai.',
      'Jo sach mein badalta hai wo do cheezein hain. **Ek — bhatkan kam hoti hai.** Bahut log saalon tak alag-alag sadhana try karte hain aur kahin tik nahi paate. Jab pata chal jaata hai ki apne chart ke hisaab se kaunsa marg sahaj hai, to wo khoj rukti hai.',
      '**Do — apne aap par narmi aati hai.** Jab pata chalta hai ki jo mehsoos ho raha hai wo ek daur hai aur uska naam hai, to wo kami nahi lagta. Bahut logon ke liye yahi is reading ka poora faayda hota hai — aur wo chhota nahi hai.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Aage kya padhein',
    paras: [
      '**Poora vishay** — [Spiritual purpose astrology](/blog/spiritual-purpose-astrology-kundli-reading) (3,788 shabd), [What is Ketu](/blog/what-is-ketu), aur [Ketu Mahadasha aur vairagya](/blog/ketu-mahadasha-vairagya-symptoms).',
      '**Gehri baatein** — [Past life aur karmic bond](/blog/past-life-karmic-bond-8th-12th-house-astrology), Hindi mein [पूर्व जन्म का कर्म बंधन](/blog/past-life-karmic-bond-8th-12th-house-astrology-hindi), [Guru Mahadasha](/blog/guru-mahadasha-wisdom-growth), aur [Vipreet Raj Yoga](/learn/vipreet-raj-yoga).',
      '**Muft jaanch** — [Kundali Calculator](/calculators/free-kundali-calculator), [Dasha Calculator](/calculators/free-dasha-calculator), [Nakshatra Calculator](/calculators/free-nakshatra-calculator), [Gemstone Suitability](/calculators/free-gemstone-suitability-calculator), aur roz ka [Panchang](/panchang).',
    ],
  },
  {
    id: 'navam-bhaav',
    h2: 'Navam bhaav — dharm, bhagya aur guru ka ghar',
    paras: [
      'Moksha trikona ke saath **navam bhaav** hi wo jagah hai jahan se adhyatm ka rasta khulta hai.',
      'Shastra mein navam **dharm, bhagya, pita, guru aur lambi yatra** ka bhaav hai. Balwan navam wale logon ko jeevan mein raasta dikhane wale apne aap milte hain — koi shikshak, koi kitaab, koi ghatna jo sahi samay par aa jaaye.',
      'Dekha jaata hai: **navam ka swami kahan hai**, uska bal, aur kya **Guru** ki drishti us par hai. Guru ki drishti navam par shastra mein bahut shubh maani gayi hai — wo dharm ke prashn mein sahaj samajh deti hai.',
      'Aur ek baat is umar ke liye: **navam ke swami ki dasha prayah jeevan ke uttarardh mein aati hai** — aur bahut logon ka adhyatmik mod theek wahin se shuru hota hai. Apna kram [Dasha Calculator](/calculators/free-dasha-calculator) par dekh lijiye.',
    ],
  },
  {
    id: 'barahvaan-bhaav',
    h2: 'Barahvaan bhaav — ekaant, vyay aur moksha',
    paras: [
      'Ye bhaav sabse zyada galat samjha jaata hai, aur adhyatm ke prashn mein sabse zyada mayne rakhta hai.',
      'Barahvaan **vyay (kharch), videsh, ekaant, neend, aur moksha** ka bhaav hai. Bahut jagah ise sirf "hani ka bhaav" bata diya jaata hai, jo bahut adhoora hai.',
      'Adhyatm ke sandarbh mein iska arth seedha hai: **jahan aap kharch karte hain, wahin aap chhodte bhi hain** — aur chhodna hi moksha ka pehla kadam hai. Balwan barahvaan wale logon ko ekaant se dar nahi lagta; unhe usme aaram milta hai.',
      'Sanket: **Ketu barahve mein** — moksha ki taraf swabhavik jhukav; **Guru barahve mein** — daan aur vidya ka rasta; **Chandra barahve mein** — gehri kalpana par kabhi akelepan ka bhaari asar. Aakhri sthiti mein upar wala `vairagya-ya-udaasi` section dobara padhna chahiye.',
    ],
  },
  {
    id: 'jaap-ka-tarika',
    h2: 'Mantra jaap — kitna, kab aur kaise',
    paras: [
      'Sadhana ka faisla ho jaane ke baad ye vyavharik sawaal aata hai.',
      '**Sankhya** — ek mala yaani 108, roz. Shastra mein sankhya se zyada **niyamitta** ko bal kaha gaya hai. Ek mala jo roz ho, wo gyarah mala se behtar hai jo kabhi-kabhi ho.',
      '**Samay** — **Brahma muhurat** (suryoday se lagbhag do ghante pehle) sabse anukool maana jaata hai. Na ho sake to suryoday ke aas-paas, ya sandhya. Us graha ka **vaar** aur uski **hora** aur behtar rehti hai.',
      '**Tarika** — ek hi jagah, ek hi samay, poorv ya uttar ki taraf mukh. Aur ek baat jo sab granth kehte hain: **jaap ka arth samajh kar karna** uske bina karne se kai guna behtar hai. Roz ka Brahma muhurat aur hora [Panchang](/panchang) par free hai.',
    ],
  },
  {
    id: 'shani-adhyatm',
    h2: 'Shani — sabse kathin guru',
    paras: [
      'Adhyatm ke prashn mein Shani ka naam kam liya jaata hai, aur ye chook badi hai.',
      'Shastra mein **Shani vairagya, dheeraj aur sewa ka kaarak** hai — Ketu ke baad sabse adhyatmik graha. Antar itna hai ki **Ketu chhudata hai, Shani sikhata hai** — aur Shani ka tarika dheema, kathin aur lamba hota hai.',
      'Isi liye kaha gaya hai ki **Shani sabse kathin guru hai par sabse pakka.** Jo Shani ke daur se guzar kar aata hai, uski samajh kitaabon se nahi aati.',
      'Vyavharik sanket: **Shani ki dasha mein sewa aur anushasan hi sadhana ban jaate hain** — aur us daur mein baith kar dhyan karne se zyada, kisi ke kaam aane se shanti milti hai. Shani ka poora swabhav [Shani Mahadasha](/blog/shani-mahadasha-effects-guide) mein hai.',
    ],
  },
  {
    id: 'akelapan',
    h2: 'Akelapan aur ekaant — do alag cheezein',
    paras: [
      'Ye antar `vairagya-ya-udaasi` wale antar jaisa hi hai, par rozmarra mein aur bhi kaam ka.',
      '**Ekaant chuna jaata hai.** Aap logon ke beech se uth kar apne kamre mein aate hain kyunki wahan aapko shanti milti hai — aur jab chahein wapas ja sakte hain.',
      '**Akelapan thopa jaata hai.** Aap logon ke beech baith kar bhi akela mehsoos karte hain, aur wapas judne ka rasta nahi dikhta.',
      'Chart mein dono ka source alag hai: **ekaant barahve bhaav aur Ketu se aata hai; akelapan prayah peedit Chandra ya kamzor ekadash bhaav (mitrata ka bhaav) se.** Aur unke upay bilkul alag hain — pehle mein sadhana chahiye, doosre mein log. Ye antar reading mein alag likha jaata hai.',
    ],
  },
  {
    id: 'kya-ab-der-ho-gayi',
    h2: 'Kya ab der ho gayi hai',
    paras: [
      'Ye sawaal is umar mein sabse zyada chubhta hai, aur uska uttar shastra mein saaf hai.',
      '**Nahi.** Aur ye sirf dilaasa nahi hai — kram hi aisa hai. Char aashram mein adhyatm ka aashram **teesra** hai, pehla nahi. Shastra maanta hai ki wo samay grihastha ke **baad** aata hai.',
      'Aur dasha ke aankde bhi yahi kehte hain: **Guru ki dasha 16 saal ki, Shani ki 19, Ketu ki 7.** Bahut logon ka adhyatmik daur 50 ke baad hi shuru hota hai, aur wo daur chhota nahi hota.',
      'Jo sach mein der karta hai wo umar nahi — wo **shuru na karna** hai. Aur uska hal aaj se das minute mein shuru ho sakta hai.',
    ],
  },
  {
    id: 'do-minute',
    h2: 'Do minute — aur disha saaf',
    paras: [
      'Aap yahan tak padh aaye hain, to sawaal andar chal hi raha hai.',
      '**Upar form mein apna janm vivaran daaliye.** Do minute lagenge, aur Trikaal Ka Sandesh turant saamne aa jaayega — aapka Ketu, aapka barahvaan bhaav, aur chal rahe daur ka seedha sanket.',
      'Koi signup nahi, koi card nahi. **Pehla reading bilkul free hai.**',
      'Aur jo mile, uspar jaldi mat kijiye. **Ye wo reading hai jise ek baar padh kar rakh dena chahiye, aur kuch mahine baad dobara khol lena chahiye.** Is vishay mein samajh apne samay par aati hai.',
    ],
  },
  {
    id: 'kyun-yahi',
    h2: 'Yahi page kyun — aur kya farak hai',
    paras: [
      '**Ganana** — Swiss Ephemeris aur Lahiri Ayanamsha, wahi jo peshevar software chalate hain. Har graha ki degree dikhti hai, chhupayi nahi jaati — aur **Atmakaraka degree par hi tikta hai**, isliye yahan wo mayne rakhta hai.',
      '**Ishta Devata Karakamsa se** — yaani Navamsa ke aadhaar par, jaise Jaimini kehte hain. Adhikansh tool sirf rashi dekh kar devta bata dete hain, jo alag aur kamzor tarika hai.',
      '**Doosri pari ka framing** — ye page 25 saal ke soul-purpose sawaal ka nahi hai. Wo alag daur hai aur uski zarooratein alag hain.',
      'Aur **jo yahan nahi hai** — koi poorv-janm ki kahani, koi shraap, koi mehnga anushthan, aur koi daawa ki moksha milega. Is kshetra mein sabse zyada yahi becha jaata hai, aur yahi sabse khokhla hai.',
    ],
  },
  {
    id: 'panch-upay',
    h2: 'Paanch upay jo aaj se ho sakte hain',
    paras: [
      'Reading ke saath paanch vyaktigat upay aate hain. Unka aakar kya hota hai, ye jaan lijiye — kyunki chaaron mein paisa nahi lagta.',
      '**Ishta Devata ka mantra** — roz ek mala. **Us graha ka vaar** — jis graha ki dasha chal rahi hai, uske din ka sanyam ya vrat. **Daan** — us graha se judi vastu, usi din, bina dikhawe ke.',
      '**Sewa** — jo aapke chart ke hisaab se sahaj ho: anna, vidya, ya samay. Aur **paancha** — koi ek saral niyam jo aap sach mein nibha sakein.',
      'Jo yahan nahi hoga: koi mehnga anushthan, koi ratna jo zaroori bataya jaaye, aur koi aisi vidhi jiske liye kisi ko paisa dena pade. **Adhyatm ka koi bhi asli upay bikta nahi hai** — aur ye is page ka poora rukh hai.',
    ],
  },
];

const V6_HUB_READ: V6Link[] = [
  { href: '/blog/spiritual-purpose-astrology-kundli-reading', label: 'Spiritual purpose astrology', note: 'Poora vishay, 3,788 shabd' },
  { href: '/blog/what-is-ketu', label: 'What is Ketu', note: 'Ketu ka swabhav' },
  { href: '/blog/ketu-mahadasha-vairagya-symptoms', label: 'Ketu Mahadasha aur vairagya', note: 'Us daur ke lakshan' },
  { href: '/blog/past-life-karmic-bond-8th-12th-house-astrology', label: 'Past life karmic bond', note: 'Aathvaan aur barahvaan' },
  { href: '/blog/past-life-karmic-bond-8th-12th-house-astrology-hindi', label: 'पूर्व जन्म का कर्म बंधन', note: 'हिंदी में' },
  { href: '/blog/guru-mahadasha-wisdom-growth', label: 'Guru Mahadasha', note: 'Gyaan ka daur' },
  { href: '/blog/shani-mahadasha-effects-guide', label: 'Shani Mahadasha', note: 'Sabse kathin guru' },
  { href: '/learn/vipreet-raj-yoga', label: 'Vipreet Raj Yoga', note: '6, 8, 12 ka yog' },
  { href: '/spirituality', label: 'Spirituality hub', note: 'Saare vishay ek jagah' },
];

const V6_HUB_CALC: V6Link[] = [
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Abhi kaunsa daur' },
  { href: '/calculators/free-nakshatra-calculator', label: 'Nakshatra Calculator', note: 'Dasha ka aadhaar' },
  { href: '/calculators/free-lagna-calculator', label: 'Lagna Calculator', note: 'Bhaav isi se bante hain' },
  { href: '/calculators/free-graha-bal-calculator', label: 'Graha Bal Calculator', note: 'Ketu aur Guru ka bal' },
  { href: '/calculators/free-gemstone-suitability-calculator', label: 'Gemstone Suitability', note: 'Ratna se pehle jaanch' },
  { href: '/calculators/free-pitra-dosh-calculator', label: 'Pitra Dosh Calculator', note: 'Poorvajon ka prashn' },
  { href: '/karmic-background-reading', label: 'Karmic Reading', note: 'Gehra karmic vishleshan' },
  { href: '/panchang', label: 'Panchang', note: 'Brahma muhurat aur hora' },
];

function V6Rich({ text, k }: { text: string; k: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <Link key={`${k}-l-${i}`} href={link[2]} className="font-semibold underline underline-offset-2 hover:opacity-80 text-[#D4AF37]">
              {link[1]}
            </Link>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${k}-b-${i}`} className="text-[#D4AF37]">{part.slice(2, -2)}</strong>;
        }
        return <span key={`${k}-s-${i}`}>{part}</span>;
      })}
    </>
  );
}

function V6Hub({ items }: { items: V6Link[] }) {
  return (
    <ul className="space-y-2 m-0 p-0 list-none">
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className="group block rounded-lg px-3 py-2 transition hover:bg-white/5">
            <span className="block text-sm font-semibold text-[#D4AF37]">{i.label}</span>
            <span className="block text-xs text-slate-500">{i.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function V6Content() {
  return (
    <>
      <nav aria-label="Is page par kya hai" className="mt-16 mb-12 max-w-4xl mx-auto rounded-2xl p-5 md:p-6 bg-white/[0.03] border border-[#D4AF37]/20">
        <h2 className="text-lg font-serif font-bold mb-3 text-[#D4AF37]">Is Page Par Kya Hai</h2>
        <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal pl-5 text-slate-300">
          {V6_SECTIONS.map((sec) => (
            <li key={sec.id}><a href={`#${sec.id}`} className="hover:underline underline-offset-2 text-slate-300">{sec.h2}</a></li>
          ))}
        </ol>
      </nav>
      <section className="max-w-4xl mx-auto">
        {V6_SECTIONS.map((sec, si) => (
          <div key={sec.id} id={sec.id} className="scroll-mt-24 mb-10">
            <h2 className="text-2xl font-serif font-bold mb-4 text-[#D4AF37]">{sec.h2}</h2>
            {sec.paras.map((p, pi) => (
              <p key={pi} className="text-slate-300 leading-relaxed mb-4"><V6Rich text={p} k={`v6-${si}-${pi}`} /></p>
            ))}
          </div>
        ))}
      </section>
      <section className="max-w-4xl mx-auto mt-12 rounded-2xl p-5 md:p-6 bg-[#0B0F1A] border border-white/[0.07]">
        <h2 className="text-base font-bold m-0 mb-2 text-[#D4AF37]">Adhyatm ke poore vishay — sab free</h2>
        <p className="text-xs leading-relaxed mb-4 text-slate-400">
          Ye page doosri pari ke faisle ka hai. Ketu, poorv janm aur dasha ke poore lekh alag pages par hain.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 pb-1.5 text-sm font-bold border-b border-[#D4AF37]/25 text-slate-200">Padhne ke liye</h3>
            <V6Hub items={V6_HUB_READ} />
          </div>
          <div>
            <h3 className="mb-2 pb-1.5 text-sm font-bold border-b border-[#D4AF37]/25 text-slate-200">Muft calculators</h3>
            <V6Hub items={V6_HUB_CALC} />
          </div>
        </div>
      </section>
    </>
  );
}

export default function SpiritualPurposePage() {
  return (
    <>
      <Script id="schema-spiritual" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />
        <section className="relative overflow-hidden pt-28 pb-20 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-[#D4AF37]/8 rounded-full blur-[120px]" />
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">Soul Purpose Intelligence · by Rohiit Gupta</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">What Is Your <span className="text-[#D4AF37]">Soul&apos;s Purpose</span><br />in This Lifetime?</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-3 leading-relaxed">Trikaal AI reads your Ketu, Atmakaraka and 12th House to decode your past-life karma, present dharmic mission, and the <span className="text-[#D4AF37] font-semibold">soul lesson</span> you were born to complete.</p>
            <p className="text-sm text-gray-500 mb-10">Reading designed by <Link href="/founder" className="text-[#D4AF37] hover:underline">Rohiit Gupta</Link> — Chief Vedic Architect · Swiss Ephemeris (self-hosted)</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#birth-form" className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_30px_rgba(212,175,55,0.3)]">Get My Soul Purpose Reading — ₹51</Link>
            </div>
          </div>
        </section>
        {/* ── v5.0: the real reading form, preselected to
            genx_spiritual_innings. Replaces the dead /?segment= hop. */}
        <section className="px-4 pb-10 -mt-2">
          <ServiceReadingForm
            domain="spiritual-purpose"
            heading="Apna adhyatmik marg dekhiye"
            subheading="Ketu, Atmakaraka, navam aur barahvaan bhaav, aur chal rahi dasha — aapke apne chart se."
          />
        </section>

        <AuthorStrip />
        <section className="py-20 px-4 bg-[#0D1020]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Ancient Wisdom. Modern Precision.</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Why Vedic Astrology Reveals <span className="text-[#D4AF37]">Your Soul&apos;s Mission</span></h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "☊", title: "Ketu and the 12th House Reveal Past-Life Karma", desc: "Ketu represents where your soul has already mastered — your accumulated past-life wisdom. The 12th house governs spiritual liberation and the dissolution of ego. Together, they map the karmic curriculum your soul enrolled in before birth." },
                { icon: "🌟", title: "Atmakaraka Is Your Soul's Deepest Longing", desc: "The Atmakaraka (planet with the highest degree in your chart) is your soul's primary lesson in this lifetime. When you live in alignment with your Atmakaraka's energy, life feels meaningful. When you don't — no amount of achievement satisfies." },
                { icon: "🕉", title: "Rahu Shows Your Soul's Growth Direction", desc: "While Ketu shows where you have been, Rahu shows where your soul is reaching — its growth edge in this lifetime. The Rahu house and sign reveal the new territory your soul chose to explore, often feeling alien and compelling simultaneously." },
              ].map((r, i) => (
                <div key={i} className="border border-white/10 rounded-2xl p-7 bg-white/[0.03] hover:border-[#D4AF37]/40 transition-all duration-300 group">
                  <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">{r.icon}</div>
                  <h3 className="font-serif text-xl font-bold text-[#D4AF37] mb-3">{r.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                {[
                  { step: "01", title: "Enter Your Birth Details", desc: "Date, exact time, and place. Your Atmakaraka degree is calculated to the arc-minute — precision is essential for soul-level readings." },
                  { step: "02", title: "Trikaal Reads Your Soul Blueprint", desc: "Atmakaraka identification, Ketu house and sign past-life analysis, 12th house spiritual indicators, and Rahu growth direction mapping." },
                  { step: "03", title: "Receive Your Soul Curriculum", desc: "₹51 reading: Your soul's past-life mastery, present dharmic mission, spiritual path (Bhakti, Jnana, Karma, Raja), and moksha indicators." },
                ].map((s, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{s.step}</div>
                    <div><h4 className="font-semibold text-white mb-1">{s.title}</h4><p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p></div>
                  </div>
                ))}
              </div>
              <DeliverableCard segment="spiritual-purpose" items={["Atmakaraka soul purpose decoding", "Ketu past-life mastery analysis", "Rahu soul growth direction", "12th house spiritual liberation map", "Your dharmic path — Bhakti, Jnana, etc.", "Moksha yoga identification", "4-week spiritual energy forecast"]} />
            </div>
          </div>
        </section>
        <MaaDivineSeva />
        <section className="px-4 pb-4"><V6Content /></section>

        <FaqSection items={[
          { q: "What is Atmakaraka in Vedic astrology?", a: "Atmakaraka is the planet with the highest degree in your birth chart. It represents the soul's primary lesson in this lifetime. When you live in alignment with your Atmakaraka's energy, life feels purposeful. When misaligned, existential emptiness persists regardless of material success." },
          { q: "What does Ketu represent in a birth chart?", a: "Ketu represents where your soul has already mastered in past lifetimes. Its house and sign show your natural gifts and karmic completions. Ketu's placement explains unexplained fears, instant mastery in certain areas, and the sense of already knowing things never taught." },
          { q: "What is the 12th house in Vedic astrology?", a: "The 12th house governs spiritual liberation (moksha), retreat from the world, and the dissolution of ego. A strong 12th house often indicates a soul drawn to meditation, service, or spiritual practice. Jupiter in the 12th is considered highly auspicious for spiritual growth." },
          { q: "What is Moksha Yoga in Vedic astrology?", a: "Moksha Yoga refers to planetary combinations indicating a soul on a path toward liberation. These include Ketu in the 12th house, Jupiter aspecting the 12th house, or the Moon-Ketu conjunction in spiritual houses." },
        ]} />
        <CtaSection headline="You Came Here for a" highlight="Reason." body="The fact that you are asking this question is itself a karmic signal. ₹51 to read your soul's blueprint and finally understand why you are here." segment="spiritual-purpose" />
        <SiteFooter />
      </main>
    </>
  );
}
/* ─── SHARED COMPONENTS (inlined) ─────────────── */

function AuthorStrip() {
  return (
    <section className="py-12 px-4 border-y border-white/5 bg-[#0A0D18]">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0 w-20 h-20 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-3xl font-serif text-[#D4AF37] font-bold">RG</div>
        <div>
          <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-medium mb-1">About Your Vedic Architect</p>
          <h2 className="font-serif text-xl font-bold text-white mb-2">Rohiit Gupta — Chief Vedic Architect, Trikaal Vaani</h2>
          <p className="text-gray-400 text-sm leading-relaxed">Rohiit Gupta has studied Vedic astrology for over 15 years under the Parashara BPHS tradition. As founder of Trikaal Vaani, he built India&apos;s first AI-powered Vedic platform combining Swiss Ephemeris precision with premium AI reasoning. All readings are designed by Rohiit — Trikaal AI applies his framework to your unique birth chart.</p>
          <div className="flex gap-3 mt-3 flex-wrap">
            {["15+ Years Vedic Study", "Parashara BPHS Tradition", "Swiss Ephemeris Precision", "India Based"].map((t) => (
              <span key={t} className="text-xs border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DeliverableCard({ segment, items }: { segment: string; items: string[] }) {
  return (
    <div className="border border-[#D4AF37]/30 rounded-2xl p-8 bg-gradient-to-br from-[#D4AF37]/10 to-[#7C3AED]/10">
      <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-medium mb-6">What You Receive</p>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span className="text-[#D4AF37] text-lg">✦</span>
            <span className="text-gray-300">{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
        <div>
          <p className="text-[#D4AF37] text-2xl font-bold">₹51</p>
          <p className="text-gray-500 text-xs">Introductory price</p>
        </div>
        <Link href="#birth-form" className="bg-[#D4AF37] text-[#080B12] font-bold px-6 py-3 rounded-lg hover:bg-[#e8c84a] transition-all duration-200">Unlock Now</Link>
      </div>
    </div>
  );
}

function MaaDivineSeva() {
  const arziAmounts = [101, 201, 501, 1001, 2101, 5001, 11000, 21000, 51000, 108000];
  const dhanyeAmounts = [101, 251, 501, 1008, 2501, 5001, 10001, 21000, 51000, 108000];
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#D4AF37]/4 rounded-full blur-[160px]" />
      </div>
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-5xl mb-4">🙏</div>
          <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Divya Seva · Divine Offering</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Maa Shakti Ki <span className="text-[#D4AF37]">Divya Seva</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            These are not fees. They are <span className="text-[#D4AF37] font-semibold">dakshina</span> — an offering from the heart, placed at Maa Shakti&apos;s feet through Trikaal Vaani. <span className="text-white font-semibold">There is no ceiling on devotion.</span> Starting ₹101, with absolutely no upper limit.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* ARZI */}
          <div className="border border-[#D4AF37]/25 rounded-3xl p-8 bg-gradient-to-b from-[#D4AF37]/8 to-transparent flex flex-col">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🪔</div>
              <h3 className="font-serif text-2xl font-bold text-[#D4AF37] mb-2">Arzi to Maa</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Place your deepest prayer at Maa Shakti&apos;s feet. Rohiit ji personally transmits your Arzi during Vedic prayer. <span className="text-[#D4AF37] font-semibold">Starting ₹101 — no upper limit.</span></p>
            </div>
            <div className="mb-6">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 text-center">Suggested dakshina — or offer any amount from your heart</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {arziAmounts.map((amt) => (
                  <a key={amt} href={`https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20Arzi%20to%20Maa%20dakshina%20%E2%82%B9${amt}.%20Jai%20Maa%20Shakti!`} target="_blank" rel="noopener noreferrer" className="border border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200 font-medium">
                    ₹{amt.toLocaleString("en-IN")}
                  </a>
                ))}
                <a href="https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20I%20want%20to%20submit%20Arzi%20to%20Maa%20with%20my%20own%20dakshina.%20Jai%20Maa%20Shakti!" target="_blank" rel="noopener noreferrer" className="border border-dashed border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200">My own amount ✦</a>
              </div>
              <p className="text-center text-gray-600 text-xs mt-2">No amount too large. Devotion has no ceiling.</p>
            </div>
            <ul className="space-y-2 mb-8 flex-1">
              {["Your prayer submitted to Maa Shakti", "Rohiit ji performs Vedic mantra recitation on your behalf", "WhatsApp confirmation of prayer transmission", "For love, health, protection, success, peace, family", "No prayer too big · No dakshina too large"].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400"><span className="text-[#D4AF37] mt-0.5 flex-shrink-0">✦</span>{item}</li>
              ))}
            </ul>
            <a href="https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20I%20want%20to%20submit%20my%20Arzi%20to%20Maa%20Shakti.%20Please%20guide%20me.%20Jai%20Maa%20Shakti!" target="_blank" rel="noopener noreferrer" className="block text-center bg-[#D4AF37] text-[#080B12] font-bold px-6 py-4 rounded-xl hover:bg-[#e8c84a] transition-all duration-200 text-base">🙏 Submit My Arzi to Maa</a>
            <p className="text-center text-gray-600 text-xs mt-3">Starts ₹101 · No upper limit · Pure devotion</p>
          </div>
          {/* DHANYEWAAD */}
          <div className="border border-[#D4AF37]/25 rounded-3xl p-8 bg-gradient-to-b from-[#7C3AED]/10 to-transparent flex flex-col">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🌺</div>
              <h3 className="font-serif text-2xl font-bold text-[#D4AF37] mb-2">Maa Ka Dhanyewaad</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Your prayer was answered. Return gratitude to Maa Shakti — gratitude is the highest form of worship. <span className="text-[#D4AF37] font-semibold">Starting ₹101 — no upper limit.</span></p>
            </div>
            <div className="mb-6">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 text-center">Gratitude offering — give freely from the heart</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {dhanyeAmounts.map((amt) => (
                  <a key={amt} href={`https://wa.me/919211804111?text=Jai%20Maa%20Shakti!%20Maa%20ne%20meri%20sun%20li.%20Dhanyewaad%20dakshina%20%E2%82%B9${amt}.%20Jai%20Maa!`} target="_blank" rel="noopener noreferrer" className="border border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200 font-medium">
                    ₹{amt.toLocaleString("en-IN")}
                  </a>
                ))}
                <a href="https://wa.me/919211804111?text=Jai%20Maa%20Shakti!%20I%20want%20to%20offer%20Dhanyewaad%20to%20Maa%20with%20my%20own%20dakshina%20amount.%20Jai%20Maa!" target="_blank" rel="noopener noreferrer" className="border border-dashed border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200">From my heart ✦</a>
              </div>
              <p className="text-center text-gray-600 text-xs mt-2">The bigger the gratitude, the bigger the next blessing.</p>
            </div>
            <ul className="space-y-2 mb-8 flex-1">
              {["Your gratitude prayer delivered to Maa Shakti", "Rohiit ji performs Vedic thanksgiving puja on your behalf", "WhatsApp confirmation with blessings for your next chapter", "For answered prayers in love, health, career, family", "Gratitude to Maa multiplies blessings — no ceiling"].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400"><span className="text-[#D4AF37] mt-0.5 flex-shrink-0">✦</span>{item}</li>
              ))}
            </ul>
            <a href="https://wa.me/919211804111?text=Jai%20Maa%20Shakti!%20Maa%20ne%20meri%20baat%20suni.%20Main%20Maa%20ka%20Dhanyewaad%20dena%20chahta%20hoon.%20Jai%20Maa!" target="_blank" rel="noopener noreferrer" className="block text-center border border-[#D4AF37] text-[#D4AF37] font-bold px-6 py-4 rounded-xl hover:bg-[#D4AF37]/10 transition-all duration-200 text-base">🌺 Offer My Dhanyewaad to Maa</a>
            <p className="text-center text-gray-600 text-xs mt-3">Starts ₹101 · No upper limit · Jai Maa Shakti</p>
          </div>
        </div>
        <div className="text-center mt-10 border-t border-white/5 pt-8">
          <p className="text-gray-600 text-xs leading-relaxed max-w-lg mx-auto">Trikaal Vaani does not profit from dakshina offerings. All Arzi and Dhanyewaad dakshinas are used for Vedic puja samagri, mantra recitation costs, and charitable givings in Maa Shakti&apos;s name. Rohiit Gupta is the intermediary — Maa is the recipient.</p>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="py-20 px-4 bg-[#0D1020]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Common Questions</p>
          <h2 className="font-serif text-3xl font-bold">Frequently Asked <span className="text-[#D4AF37]">Questions</span></h2>
        </div>
        <div className="space-y-4">
          {items.map((f, i) => (
            <details key={i} className="border border-white/10 rounded-xl p-5 bg-white/[0.02] group cursor-pointer">
              <summary className="font-semibold text-white text-sm md:text-base list-none flex justify-between items-center gap-4">
                {f.q}
                <span className="text-[#D4AF37] text-lg flex-shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
              </summary>
              <p className="text-gray-400 text-sm leading-relaxed mt-4">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ headline, highlight, body, segment }: { headline: string; highlight: string; body: string; segment: string }) {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/10 to-transparent" />
      </div>
      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">{headline} <span className="text-[#D4AF37]">{highlight}</span></h2>
        <p className="text-gray-400 mb-10 leading-relaxed">{body}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="#birth-form" className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_40px_rgba(212,175,55,0.25)]">Enter Birth Details → Get Reading</Link>
        </div>
        <p className="text-gray-600 text-xs mt-6">Powered by Swiss Ephemeris · Lahiri Ayanamsha · Reading framework by Rohiit Gupta</p>
      </div>
    </section>
  );
}
