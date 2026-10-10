'use client';

// ============================================================
// File: app/calculators/free-upay-calculator/page.tsx
// Version: v2.0 — Upay Calculator — 10 Oct 2026
//   v2.0 (10 Oct, UpayCalculator v1.1 ke saath): ₹51 mein samasya ke saath
//         DOSH (Kaal Sarp, Manglik, Sade Sati) aur 9 GRAH bhi chune ja sakte
//         hain + "apni baat" box — copy usi hisaab se.
//         8 H2 / ~1,500 shabd → 50+ H2 / 4,500+ shabd. Keyword base:
//         radar.gsc_queries + radar.keyword_volume (solution intent) —
//         navagraha (9 grah), Rahu/Shani/Ketu mahadasha, sade sati, dhaiya,
//         pitra dosh, kaal sarp, mangal dosh, jaldi vivah, karz mukti, naukri,
//         santan, naya ghar. Har udaharan Supabase upay_phala ki asli row se.
//         Table of contents + #upay-form CTA. FAQ 8 → 14.
//   v1.0: pehla page (10 Oct 2026).
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// API: /api/calc/upay · Engine: VM granth_api v4.2 upay_calculator()
// Data: Supabase upay_phala (910 granth upay)
//
// ROHIIT KE NIYAM:
//   * Atharva upay sirf Kaushika Sutra se; maans / sura / bali kabhi nahi
//   * Lal Kitab ke totke nahi; shatru-maran upay band
//   * Har internal link ka folder repo mein maujood (10 Oct 2026 jaancha)
// ============================================================
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';
import UpayCalculator from '@/components/calculators/UpayCalculator';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

function renderRich(text: string, keyBase: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <Link key={`${keyBase}-l-${i}`} href={link[2]} style={{ color: GOLD }}
          className="font-semibold underline underline-offset-2 hover:opacity-80 transition">{link[1]}</Link>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyBase}-b-${i}`} style={{ color: GOLD }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyBase}-t-${i}`}>{part}</span>;
  });
}

type Section = { id: string; h2: string; paras: string[] };

const SECTIONS: Section[] = [
  // ───────── 1. Calculator ki buniyaad ─────────
  {
    id: 'upay-calculator-kaise-kaam-karta-hai',
    h2: 'Upay Calculator by Date of Birth — ye kaise kaam karta hai',
    paras: [
      'Aap **janm-tithi, samay aur sthan** dete hain. Swiss Ephemeris (Lahiri ayanamsha) par kundali banti hai aur **Shadbala (BPHS adhyay 27)** se dekha jaata hai ki kaunsa grah kamzor hai. Saath mein chalti **Vimshottari dasha** — mahadasha aur antardasha — bhi nikalti hai.',
      'Phir upay chune jaate hain — apne mann se nahi, granth ki table se. Hamari library mein 910 upay hain: Atharvaveda (Kaushika Sutra), Rigveda (Rgvidhana aur Grihya Sutra), BPHS, Phaladeepika aur Jataka Parijata. Har upay ke saath uska shlok-hawala likha hai, taaki aap ya koi bhi pandit use granth mein khol kar dekh sake.',
      'Free mein 3 BPHS upay milte hain. ₹51 mein aap apni 2 samasya chunte hain aur 10 upay milte hain — har ek alag kism ka. Apni kundali ka kamzor grah alag se dekhna ho to [Weak Planet Finder](/calculators/free-weak-planet-finder) bhi muft hai.',
    ],
  },
  {
    id: 'janm-tithi-se-upay-rashi-se-kyun-nahi',
    h2: 'Janm tithi se upay kyun — sirf rashi anusar upay kyun nahi?',
    paras: [
      'Internet par "rashi anusar upay" bahut milte hain — jaise **rashi anusar karz mukti ke upay**. Lekin ek hi rashi ke crore log hain, aur sabki kundali mein kamzor grah alag hai. Kisi ka Shani kamzor hai, kisi ka Chandra. Rashi se upay dena aisa hai jaise ek hi dawa poore mohalle ko de dena.',
      'Janm-tithi, samay aur sthan se **lagna, grahon ke bhaav aur unka bal** nikalta hai. Isi se pata chalta hai ki pareshani kis grah se hai aur kis daur (dasha) mein hai. Isliye Trikaal Vaani ka calculator pehle aapki kundali ka hisaab lagata hai, phir upay chunta hai. Apni rashi aur nakshatra jaanne ke liye [Rashi Calculator](/calculators/free-rashi-calculator) dekhein.',
    ],
  },
  {
    id: 'kamzor-grah-shadbala',
    h2: 'Kamzor grah kaise pata chalta hai? — Shadbala, BPHS 27',
    paras: [
      'Parashar har grah ka bal chhah hisson mein ginte hain — **sthana, dig, kala, cheshta, naisargika aur drik bala**. Kul bal granth ki nyuntam seema se kam ho to grah kamzor hai (BPHS 27). Isi ka poora hisaab [Graha Bal Calculator](/calculators/free-graha-bal-calculator) mein hai.',
      '**Shadbala sirf batata hai ki kaunsa grah kamzor hai — upay hamesha granth se aata hai.** Agar koi bhi grah seema se neeche nahi hai, to calculator sabse kam bal wale 2 grah leta hai. Rahu aur Ketu ka Shadbala granth mein hai hi nahi, isliye unke upay tab aate hain jab unki mahadasha ya antardasha chal rahi ho — ya jab aap khud unhe chunte hain.',
    ],
  },

  // ───────── 2. Navagraha — 9 grah ke upay ─────────
  {
    id: 'navagraha-ke-upay',
    h2: 'Navagraha ke upay — 9 grah, har grah ka alag raasta',
    paras: [
      'BPHS ka graha-shanti prasang (BPHS 85.18-27) har grah ke liye teen cheezein deta hai: **naam-mantra ka jap, havan ki samidha (lakdi) aur daan**. Jap ki kul ginti bhi granth ne di hai — Surya 7,000, Chandra 11,000, Mangal 10,000, Budh 9,000, Guru 19,000, Shukra 16,000, Shani 23,000, Rahu 18,000 aur Ketu 17,000.',
      'Itna jap ek din mein nahi hota — roz 108 ya 11 baar se shuru karein aur ginti likhte jaayein. Neeche har grah ka alag hissa hai: mantra, samidha, din aur sasta daan. Calculator mein "Kisi grah ke upay dekhein" mein Surya se Ketu tak koi bhi grah chun kar uske upay seedhe dekh sakte hain.',
    ],
  },
  {
    id: 'surya-ke-upay',
    h2: 'सूर्य के उपाय — Surya kamzor ho to kya karein',
    paras: [
      'Surya aatma, pita, sarkar aur maan-samman ka karak hai. Kamzor Surya mein aatmavishwas ghatna, pita se doori ya sarkari kaam mein rukawat jaise anubhav log batate hain. BPHS ka mantra: **«ॐ सूर्याय नमः»**, Ravivaar ko, aak (arka) ki samidha se chhota havan ya ghee ka diya.',
      'Sabse saral upay: roz subah ugte Surya ko ek lota jal aur 11 baar mantra. Daan: gud-gehun, ya gaushala mein ₹11-21. Phaladeepika (12.20) santan ke prasang mein Surya ke liye Shiv aaradhana aur pitron ka smaran bhi batata hai. Surya ka ratna Manik hai, par pehle [Manik pehnein ya nahi](/calculators/free-should-i-wear-manik) zaroor jaanchein.',
    ],
  },
  {
    id: 'chandra-ke-upay',
    h2: 'चंद्र के उपाय — Chandra kamzor ho to mann aur maata',
    paras: [
      'Chandra mann, maata, neend aur bhavnaon ka karak hai. Kamzor Chandra mein bechaini, neend na aana ya jaldi ghabra jaana aam shikayat hai. BPHS ka mantra **«ॐ सोमाय नमः»** — Somvaar ko, palash ki samidha se havan ya diya.',
      'Daan bahut sasta hai: chaawal, doodh ya safed vastra (₹11-21). Phaladeepika (12.20) Chandra ke liye Devi aaradhana batata hai. Ketu mahadasha mein Chandra antardasha ho to BPHS 59.35-36 alag Chandra-shanti kehta hai — calculator ye apne aap jodta hai. Chandra ka ratna Moti hai; [Moti pehnein ya nahi](/calculators/free-should-i-wear-moti) pehle dekhein.',
    ],
  },
  {
    id: 'mangal-ke-upay',
    h2: 'मंगल के उपाय — Mangal ke upay aur chaturth bhaav ka Mangal',
    paras: [
      'Mangal saahas, bhai, zameen aur khoon ka karak hai. BPHS mantra **«ॐ भौमाय नमः»**, Mangalvaar ko, khair (khadira) ki samidha. Daan: laal masoor daal ya gud (₹11-21). Phaladeepika (12.20) Mangal ke liye gram-devta aur Kartikeya ki pooja batata hai.',
      'Bahut log poochte hain **"chaturth bhaav mein Mangal ke upay"** — chautha ghar sukh, maata aur ghar ka hai. Yahan bhi upay wahi BPHS wala hai; fark ye hai ki Mangal 6, 8 ya 12 ghar mein ho to BPHS ki shanti zyada zaroori maani jaati hai. Mangal ka ratna Moonga hai — [Moonga pehnein ya nahi](/calculators/free-should-i-wear-moonga) yahan jaanchein.',
    ],
  },
  {
    id: 'budh-ke-upay',
    h2: 'बुध के उपाय — Budh, buddhi aur vyapar',
    paras: [
      'Budh buddhi, vaani, hisaab-kitaab aur vyapar ka karak hai. BPHS mantra **«ॐ बुधाय नमः»**, Budhvaar ko, apamarg (chirchita) ki samidha. Daan: hara moong ya hari sabzi (₹11-21) — sabse sasta upay.',
      'Phaladeepika (12.20) Budh ke liye Vishnu aaradhana kehta hai, aur BPHS bhi Rahu ya Shani mahadasha mein Budh antardasha ho to Vishnu mantra **«इदं विष्णुर् वि चक्रमे»** batata hai (BPHS 55.39, 57.15). Padhai ya exam ki chinta ho to neeche "padhai ke upay" bhi padhein. Budh ka ratna Panna hai — [Panna pehnein ya nahi](/calculators/free-should-i-wear-panna).',
    ],
  },
  {
    id: 'guru-brihaspati-ke-upay',
    h2: 'गुरु (बृहस्पति) के उपाय — Guru, gyaan aur santan',
    paras: [
      'Guru gyaan, dharm, santan aur stree ki kundali mein pati ka karak hai. BPHS mantra **«ॐ बृहस्पतये नमः»**, Guruvaar ko, peepal ki samidha. Daan: peela vastra, chane ki daal ya haldi (₹11-21).',
      'Phaladeepika (12.21) Guru ke liye ped lagaana batata hai — ye sabse sundar upay hai: ek paudha lagaayein aur use paani dein. Jataka Parijata (13.2) Guru ke liye Shiv aaradhana kehta hai. Vivah mein deri ho aur Guru kamzor ho, to ye upay khaas taur par dekhe jaate hain. Guru ka ratna Pukhraj — [Pukhraj pehnein ya nahi](/calculators/free-should-i-wear-pukhraj).',
    ],
  },
  {
    id: 'shukra-ke-upay',
    h2: 'शुक्र के उपाय — Shukra, vivah aur sukh',
    paras: [
      'Shukra vivah, prem, sukh-suvidha aur kala ka karak hai. BPHS mantra **«ॐ शुक्राय नमः»**, Shukravaar ko, gular (udumbara) ki samidha. Daan: safed mithai, chaawal ya safed vastra (₹11-21).',
      'Phaladeepika (12.21) Shukra ke liye gau-seva aur phool ka paudha lagaana batata hai; Jataka Parijata (13.2) Gauri aaradhana. Rahu, Shani ya Ketu ki mahadasha mein Shukra antardasha ho to BPHS Durga mantra **«जातवेदसे सुनवाम सोमम्»** kehta hai (55.59, 57.35, 59.15). Shukra ka ratna Heera — [Heera pehnein ya nahi](/calculators/free-should-i-wear-heera).',
    ],
  },
  {
    id: 'shani-ke-upay',
    h2: 'शनि के उपाय — Shani dev ko prasann karne ke upay',
    paras: [
      '"Shani dev ko khush karne ke upay" sabse zyada khoje jaate hain. BPHS ka mantra **«ॐ शनैश्चराय नमः»** hai — Shanivaar ko, shami ki samidha se havan ya sarson ke tel ka diya. Granth ne Shani ke liye sabse lambi ginti di hai: 23,000 jap.',
      'Daan: kaale til, sarson ka tel ya kaala kambal (₹11-21). Phaladeepika (12.21) Shani ke liye **peepal ki seva** kehta hai — peepal ko jal dena. Ye sab sasta hai aur roz ho sakta hai. Shani ka ratna Neelam sabse tez maana jaata hai; bina jaanch pehnna theek nahi — [Neelam pehnein ya nahi](/calculators/free-should-i-wear-neelam) pehle dekhein.',
    ],
  },
  {
    id: 'rahu-ke-upay',
    h2: 'राहु के उपाय — Rahu ke granth upay',
    paras: [
      'Rahu chaaya grah hai — bhram, achanak badlav, videsh aur nashe jaisi pravritti se joda jaata hai. BPHS mantra **«ॐ राहवे नमः»**, Shanivaar ko, doob (durva) ki samidha. Daan: loha (kil, chimta) ya kaale til (₹11-21).',
      'Phaladeepika (12.22) santan ke prasang mein Rahu ke liye naag-devta ki pooja batata hai. Rahu ka Shadbala nahi hota, isliye calculator Rahu ke upay tab deta hai jab Rahu ki mahadasha/antardasha chal rahi ho, ya aap 9 grah mein se Rahu chunein. Rahu ka ratna Gomed — [Gomed pehnein ya nahi](/calculators/free-should-i-wear-gomed).',
    ],
  },
  {
    id: 'ketu-ke-upay',
    h2: 'केतु के उपाय — Ketu kya hai aur iske upay',
    paras: [
      '**Ketu kya hai?** Rahu ki tarah Ketu bhi chaaya grah hai — Chandra ke path ka dakshini sira (south node). Iska koi pind nahi, isliye ise moksha, vairagya aur achanak ghatnaon se joda jaata hai. BPHS mantra **«ॐ केतवे नमः»**, kusha ki samidha.',
      'Daan: kambal ya til-gud (₹11-21). Granth Ketu ke kai prasang mein pashu-daan kehta hai; hum uski jagah pashu-seva ya gaushala mein chaara ka vikalp dete hain. Phaladeepika (12.22) Ketu ke liye vidwan ka samman aur daan batata hai. Ketu ka ratna Lehsuniya — [Cat\'s Eye pehnein ya nahi](/calculators/free-should-i-wear-cats-eye).',
    ],
  },
  {
    id: 'kisi-bhi-grah-ke-upay-dekhein',
    h2: 'Kisi bhi ek grah ke upay kaise dekhein — Surya se Ketu tak',
    paras: [
      'Kai baar aapko pehle se pata hota hai ki pareshani kis grah se hai — jaise pandit ji ne kaha "Shani ka upay karo" ya "Rahu ki dasha chal rahi hai". Iske liye calculator mein **"Kisi grah ke upay dekhein"** hai: Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu aur Ketu — koi bhi chunein.',
      'Form mein hi "Kis grah ke upay chahiye?" mein grah chun lein — free nateeje ke saath us grah ke 3 upay bhi aa jaate hain. ₹51 ki report mein grah ko samasya ki jagah bhi chun sakte hain; granth mein us grah ke jitne upay hain (daan, havan, aaradhana, seva) sab aate hain, baaki jagah aapki doosri samasya ke upay. [Upar form bharein](#upay-form).',
    ],
  },

  // ───────── 3. Dasha ke upay ─────────
  {
    id: 'mahadasha-ke-upay-bphs',
    h2: 'Mahadasha aur antardasha ke upay — BPHS ki dasha-shanti',
    paras: [
      'BPHS mein har mahadasha ke andar har antardasha ka phal diya hai, aur jahan phal bura hai wahan **shanti** bhi batayi hai — kahin jap, kahin daan, kahin devta ki pooja. Hamari library mein ye dasha-shanti upay alag rakhe gaye hain, aur har ek ke saath granth ki shart bhi (jaise "antardasha ka grah 6/8/12 ghar mein ho").',
      'Calculator aapki chalti mahadasha aur antardasha nikaal kar dekhta hai ki granth ki shart aapki kundali par lagti hai ya nahi. Lagti hai to wahi upay sabse pehle aata hai. Apni poori dasha-soochi [Dasha Calculator](/calculators/free-dasha-calculator) mein dekh sakte hain.',
    ],
  },
  {
    id: 'rahu-mahadasha-ke-upay',
    h2: 'राहु की महादशा के उपाय — Rahu mahadasha remedies',
    paras: [
      'Rahu ki mahadasha 18 saal ki hoti hai. BPHS (adhyay 55) kehta hai ki Rahu mahadasha mein Rahu antardasha mein **vidhi se shanti** karne par aarogya aur sampatti dono milte hain (55.7). Saral roop: roz shaam diya jalaa kar **«ॐ राहवे नमः»** 108 baar (ya 11).',
      'Rahu mahadasha mein Guru antardasha ho to BPHS (55.19-20) Shiv ji ka Rudra mantra **«इमा रुद्राय तवसे कपर्दिने»** batata hai. Surya antardasha mein ugte Surya ko jal aur pranaam (55.67). Ketu antardasha mein granth pashu-daan kehta hai; hamari report mein uska sasta vikalp — pashu-seva ya anaaj-daan — likha hota hai.',
    ],
  },
  {
    id: 'rahu-mahadasha-shani-antardasha',
    h2: 'राहु की महादशा में शनि की अंतर्दशा के उपाय',
    paras: [
      'Ye combination log sabse zyada poochte hain, kyunki dono grah dheeme aur bhaari maane jaate hain. BPHS (55.29) is antardasha ke liye **kaali gaay aur bhains ka daan** batata hai aur kehta hai isse aarogya milta hai. Saath mein Shanivaar ko diya jalaa kar **«ॐ शनैश्चराय नमः»** 11 baar.',
      'Aaj har koi gaay daan nahi kar sakta — isliye report mein sasta vikalp hai: gaushala mein ₹21-51 ka chaara, ya kaale til/kambal ka daan. Granth ka arth seva aur tyaag hai, keemat nahi. Rahu mahadasha mein Budh antardasha ho to Vishnu mantra (55.39), aur Shukra antardasha ho to Durga mantra (55.59).',
    ],
  },
  {
    id: 'shani-mahadasha-ke-upay',
    h2: 'शनि की महादशा के उपाय — Shani mahadasha effects aur upay',
    paras: [
      'Shani mahadasha 19 saal ki hoti hai. **Shani mahadasha effects** har kundali mein alag hote hain — Shani lagna ke liye yogkaarak ho to ye daur unnati bhi deta hai. Pareshani tab badhti hai jab Shani kamzor ho ya 6/8/12 ghar mein ho.',
      'BPHS (57.7) Shani mahadasha mein Shani antardasha ke liye **Mahamrityunjaya jap** batata hai — **«त्र्यम्बकं यजामहे सुगन्धिम्»**, roz subah 108 (ya 11) baar, ek diya jalaa kar. Budh antardasha mein Vishnu Sahasranama aur anna-daan (57.15); Shukra antardasha mein Durga jap (57.35); Ketu antardasha mein pashu-seva (57.22-23).',
    ],
  },
  {
    id: 'ketu-mahadasha-ke-upay',
    h2: 'केतु की महादशा के उपाय — Ketu dasha remedies',
    paras: [
      'Ketu mahadasha 7 saal ki hoti hai. BPHS (59.5-6) Ketu mahadasha mein Ketu antardasha ke liye **Durga devi ka jap aur Mrityunjaya jap** dono batata hai. Saral roop: roz subah diya jalaa kar **«त्र्यम्बकं यजामहे सुगन्धिम्»** 11 baar.',
      'Ketu mahadasha mein Rahu antardasha ho to Durga jap (59.50), Shukra antardasha mein Durga jap aur safed gaay-bhains ka daan (59.15) — iska sasta vikalp chaawal-doodh jaisi safed vastu ka daan hai. Chandra antardasha mein vidhi se Chandra-shanti (59.35-36). Calculator in sabko aapki dasha se apne aap jodta hai.',
    ],
  },
  {
    id: 'antardasha-ke-upay-alag-kyun',
    h2: 'Antardasha ke upay alag kyun hote hain?',
    paras: [
      'Ek hi Rahu mahadasha mein 9 antardasha aati hain, aur BPHS har ek ka alag phal kehta hai. Isliye "Rahu mahadasha ka ek upay" sab par fit nahi hota. Jab Rahu mahadasha mein Guru chal raha ho to Shiv ki pooja, aur Shani chal raha ho to Shani ka daan — granth yahi sikhata hai.',
      'Antardasha badalte hi upay bhi badal sakta hai. Isliye har 1-2 saal mein calculator dobara chalaana achha hai. Kab kaunsi antardasha shuru ho rahi hai, ye [Dasha Calculator](/calculators/free-dasha-calculator) mein tareekh ke saath milta hai.',
    ],
  },

  // ───────── 4. Gochar ─────────
  {
    id: 'shani-sade-sati-ke-upay',
    h2: 'शनि की साढ़ेसाती के उपाय — Sade Sati remedies',
    paras: [
      'Jab gochar ka Shani aapki **Chandra rashi se 12ve, pehle aur doosre** ghar se guzarta hai, to lagbhag saadhe saat saal ka ye daur **Sade Sati** kehlata hai. Har Sade Sati buri nahi hoti — ye Shani ki kundali mein sthiti par nirbhar hai.',
      'Granth ke hisaab se Shani ke upay wahi hain: **«ॐ शनैश्चराय नमः»** ka jap, shami ki samidha, kaale til/tel ka daan, aur peepal ki seva. Calculator mein 9 grah mein se Shani chun kar ye upay seedhe dekh sakte hain. Aapki Sade Sati chal rahi hai ya nahi, aur kab khatam hogi — [Sade Sati Calculator](/calculators/free-sade-sati-calculator) batata hai.',
    ],
  },
  {
    id: 'shani-dhaiya-ke-upay',
    h2: 'शनि की ढैय्या के उपाय — Shani ki dhaiya',
    paras: [
      'Gochar ka Shani jab Chandra rashi se **chauthe ya aathve** ghar mein hota hai, to lagbhag dhaai saal ka ye daur **Dhaiya** (laghu kalyani ya ashtam Shani) kehlata hai. Isme ghar, maata, sehat ya kaam mein rukawat ki baat parampara mein kahi jaati hai.',
      'Upay Sade Sati wale hi hain — Shani ka jap, Shanivaar ko sarson ke tel ka diya, kaale til ka daan aur peepal ko jal. Agar saath mein Shani ki mahadasha ya antardasha bhi chal rahi ho, to BPHS ka dasha-shanti upay zyada zaroori ho jaata hai — calculator use pehle rakhta hai.',
    ],
  },
  {
    id: 'rahu-ketu-gochar-upay',
    h2: 'Rahu-Ketu transit (gochar) mein kya karein?',
    paras: [
      'Rahu aur Ketu lagbhag har 18 mahine mein rashi badalte hain, aur hamesha ek doosre ke saamne (7ve) rehte hain. **Rahu Ketu transit 2026** jaisi khabrein har baar dar failaati hain — lekin gochar ka asar aapki janm-kundali mein un rashiyon ke bhaav par nirbhar hai, sab par ek jaisa nahi.',
      'Granth gochar ke liye alag upay nahi badalta: Rahu ke liye **«ॐ राहवे नमः»** aur doob, Ketu ke liye **«ॐ केतवे नमः»** aur kusha. Rahu ya Ketu ki dasha bhi saath chal rahi ho to dasha-shanti upay pehle karein. Aaj ka grah-gochar aur tithi [Aaj ka Panchang](/panchang) mein dekhein.',
    ],
  },

  // ───────── 5. Dosh ke upay ─────────
  {
    id: 'pitra-dosh-ke-lakshan-aur-upay',
    h2: 'पितृ दोष के लक्षण और उपाय — granth kya kehta hai',
    paras: [
      '**Pitra dosh ke lakshan** jo parampara mein ginaaye jaate hain — santan mein rukawat, ghar mein baar-baar kalesh, mehnat ke baad bhi tarakki na hona. BPHS (Santhanam sanskaran, adhyay 83) "purva-janm ke shaap" mein pitra, maata, bhai, maama, patni aur sarp ke shaap ke yog ginta hai — wo bhi santan ke prasang mein — aur unke upay deta hai, jaise Gayatri jap, peepal ki parikrama aur Vishnu pratima ki sthaapna.',
      'Aapki kundali mein pitra dosh ke yog hain ya nahi, ye [Pitra Dosh Calculator](/calculators/free-pitra-dosh-calculator) muft batata hai. Upay ke liye ₹51 report mein "pitra dosh" samasya chunein.',
    ],
  },
  {
    id: 'pitra-dosh-nivaran-saral-upay',
    h2: 'पितृ दोष निवारण के सरल उपाय — Atharvaveda se',
    paras: [
      'Kaushika Sutra (138) ashtaka shraaddh ki vidhi deta hai. Uska saral roop: **Magh krishna ashtami, ya har maas ki krishna ashtami** ko Atharvaveda 3.10 ke mantra **«सा न आयुष्मतीं प्रजां»** ke saath diye ya havan-kund mein ghee aur kheer ya til-chaawal ki 21 aahuti.',
      'Doosra saral upay Kaushika 59.21 se: roz subah ghee ka diya jalaa kar Atharvaveda 2.34 **«य ईशे पशुपतिः पशूनाम्»** 11 baar, ghar-parivar ki raksha ki kaamna se. Dono mein kharcha sirf ghee, til aur chaawal ka hai. Amavasya aur ashtami ki tareekh [Panchang](/panchang) mein dekh lein.',
    ],
  },
  {
    id: 'kaal-sarp-dosh-ke-upay',
    h2: 'कालसर्प दोष के उपाय — aur "1 rambaan upay" ka sach',
    paras: [
      'Saaf baat: **BPHS, Phaladeepika aur Jataka Parijata mein "Kaal Sarp" naam se koi yog nahi milta.** Ye naam baad ki parampara ka hai — jab saare grah Rahu aur Ketu ke beech aa jaayein. Isliye "kaalsarp dosh door karne ka 1 rambaan upay" jaisa daava kisi granth se nahi aata.',
      'Granth jo kehta hai wo Rahu-Ketu ki shanti hai: Rahu ke liye **«ॐ राहवे नमः»** aur doob, Ketu ke liye **«ॐ केतवे नमः»** aur kusha. BPHS 83 aur Phaladeepika (12.22) sarp-shaap ki baat santan ke prasang mein karte hain, aur upay naag-devta ki pooja batate hain. Aapki kundali mein ye yog hai ya nahi — [Kaal Sarp Dosh Calculator](/calculators/free-kaal-sarp-dosh-calculator). ₹51 report mein "Dosh" mein Kaal Sarp chunne par Rahu-Ketu ke yahi granth upay aate hain.',
    ],
  },
  {
    id: 'kaal-sarp-dosh-ke-lakshan',
    h2: 'कालसर्प दोष के लक्षण — darein nahi, jaanchein',
    paras: [
      'Kaalsarp ke naam par jo lakshan bataaye jaate hain — sapne mein saanp, kaam mein baar-baar rukawat, mann mein anjaana dar — ye aam zindagi mein kisi ko bhi ho sakte hain. Sirf inke bharose mehenge anushthan karvaana theek nahi.',
      'Behtar raasta: pehle kundali mein dekhein ki Rahu-Ketu kis ghar mein hain aur kya unki dasha chal rahi hai. Agar haan, to BPHS ki dasha-shanti aur Rahu-Ketu ke saste upay — jap, doob/kusha, til-kambal ka daan — kaafi hain. Bure sapne aate hon to neeche "bure sapne ke upay" bhi dekhein.',
    ],
  },
  {
    id: 'mangal-dosh-manglik-upay',
    h2: 'मंगल दोष / मांगलिक दोष के उपाय — Manglik remedies',
    paras: [
      'Parampara mein Mangal lagna se **1, 2, 4, 7, 8 ya 12** ghar mein ho to "Manglik dosh" kaha jaata hai. BPHS mein "Manglik" naam se koi adhyay nahi hai — ye vivah-milan ki baad ki parampara hai, aur iske kai apvaad (cancellation) bhi maane jaate hain.',
      'Upay ke liye granth Mangal ki hi shanti deta hai: **«ॐ भौमाय नमः»**, Mangalvaar ko khair ki samidha, laal masoor/gud ka daan. Aap Manglik hain ya nahi, aur dosh bhang hota hai ya nahi — [Manglik Dosh Calculator](/calculators/free-manglik-dosh-calculator). Rishta milaana ho to [Kundali Milan](/kundali-milan) bhi dekhein.',
    ],
  },

  // ───────── 6. Vivah aur rishte ─────────
  {
    id: 'jaldi-shaadi-ke-upay',
    h2: 'चट मंगनी पट विवाह के उपाय — vivah mein deri',
    paras: [
      '**Chat mangni pat vivah ke upay** aur **turant shaadi ke upay** sabse zyada khoje jaate hain. Hamari library mein vivah-deri ke 36 upay hain. Ek misaal Kaushika Sutra (9.6-9.7) se: roz subah kaanse ya peetal ke lote mein jal lein, Atharvaveda 1.6 **«शं नो देवीर् अभिष्टय»** shuru aur ant mein bol kar abhimantrit karein, phir piyein.',
      'Doosra — snaan ka upay (Kaushika 9.7, 54.5): Atharvaveda 1.33 **«शिवेन मा चक्षुषा पश्यतापः»** se snaan-jal abhimantrit karke nahaayein, baad mein chandan lagaayein. Shaadi ka yog kab ban raha hai, ye [Shadi Kab Hogi Calculator](/calculators/free-shadi-kab-hogi-calculator) se dekhein.',
    ],
  },
  {
    id: 'vivah-mein-vilamb-ke-upay',
    h2: 'विवाह में विलंब के उपाय — rishte aane ke upay',
    paras: [
      'Vivah mein vilamb ke peeche aksar Guru, Shukra ya saatve ghar ke swami ki kamzori hoti hai. Isliye ₹51 report mein "vivah-deri" chunne par upay sirf vivah wale mantra nahi — kamzor grah ka daan ya seva bhi aata hai, taaki jad par kaam ho.',
      '**Rishte aane ke upay** mein sabse aasaan Guruvaar ko peeli vastu (chane ki daal, haldi) ka daan aur Shukravaar ko safed mithai ka daan hai — dono ₹11-21 mein. Shubh tareekh chahiye to [Vivah Muhurat](/vivah-muhurat) dekhein.',
    ],
  },
  {
    id: 'love-marriage-ke-upay',
    h2: 'Love marriage ke upay — prem aur ghar walon ki sahmati',
    paras: [
      'Prem vivah mein sabse badi rukawat aksar parivar ki asahmati hoti hai. Atharvaveda 3.30 **«सहृदयं सांमनस्यम्»** — "ek hriday, ek mann, bina dwesh" — isi ke liye hai. Kaushika (12.6, 12.9): roz subah 11 baar bolein, phir ek lote jal ko abhimantrit karke ghar ki chaaron dishaon mein ghumaa kar Tulsi mein daal dein.',
      'Mithaas ke liye Kaushika 38.17 se Atharvaveda 1.34 **«मधुमन् मे निक्रमणं»**: mulethi laal dhaage mein baandh kar anaamika ungli par. Pyaar ya arrange — aapki kundali kya kehti hai, [Love ya Arranged Marriage Calculator](/calculators/free-love-or-arranged-marriage-calculator) dekhein.',
    ],
  },
  {
    id: 'parivar-klesh-talaq-upay',
    h2: 'Pati-patni ka jhagda, talaq aur parivar mein kalesh ke upay',
    paras: [
      'Ghar ke kalesh ke liye Atharvaveda ka sabse prasiddh sukta wahi **«सहृदयं सांमनस्यम्»** (AV 3.30) hai. Kaushika kehta hai ki us din ka bhojan-paani bhi isi mantra se abhimantrit karein. Kharcha kuch nahi.',
      'Hamari library mein talaq se bachav ke 33 aur parivar-klesh ke 30 upay hain. Kisi par jhootha aarop ya nirasha chhaayi ho to Kaushika (28.12) se Atharvaveda 5.1 — abhimantrit bhojan. Rishte ki gaharai mein jaana ho to [Ex Back Reading](/services/ex-back-reading) ya [Compatibility](/services/compatibility) bhi hai.',
    ],
  },

  // ───────── 7. Dhan, karz, naukri ─────────
  {
    id: 'karz-mukti-ke-upay',
    h2: 'कर्ज मुक्ति के उपाय — Atharvaveda ka anrin sukta',
    paras: [
      'Atharvaveda mein karz se mukti ka seedha sukta hai — **«इदं तद् अग्ने अनृणो भवामि»** (AV 6.117), yaani "Agni, main rin-mukt ho jaaun". Kaushika Sutra (133.1) iska viniyoga deta hai. Saral roop: roz subah diya jalaa kar 11 baar bolein, ek mutthi mila-jula anaaj abhimantrit karke pakshiyon ko daal dein.',
      'Saath ka sukta AV 6.118 **«उग्रंपश्ये उग्रजितौ»** — diye mein ghee ki ek boond aahuti. Granth yahin ek shart bhi jodta hai: **juye-satte se door rahein.** Ye **karz mukti ka ramban upay** isliye hai kyunki ye seedha granth se hai — koi totka nahi.',
    ],
  },
  {
    id: 'rashi-anusar-karz-mukti',
    h2: 'राशि अनुसार कर्ज मुक्ति के उपाय — kundali anusar behtar kyun',
    paras: [
      'Karz chhathe ghar (rin, rog, ripu) se dekha jaata hai, aur ye ghar har lagna ke liye alag grah ka hota hai. Isliye "rashi anusar" ek hi upay sabke liye kaam nahi karta — kundali anusar karz ke ghar ka swami aur kamzor grah dekhna padta hai.',
      '₹51 report mein "karz-mukti" chunein: Atharvaveda ke anrin sukte ke saath aapke kamzor grah ka BPHS daan bhi aata hai. Dhan ke yog kab ban rahe hain, iske liye ₹499 [Wealth Reading](/services/wealth-reading) mein Rohiit Gupta khud kundali dekhte hain.',
    ],
  },
  {
    id: 'dhan-vyapar-ke-upay',
    h2: 'Dhan aur vyapar badhane ke upay — Rigveda aur Atharvaveda',
    paras: [
      'Rgvidhana (1.13.66) kehta hai ki dhan ki ichchha se Rigveda ka pehla sukta **«अग्निम् ईळे पुरोहितं»** japa jaaye — roz subah 11 baar. Atharvaveda 1.4 **«अप्स्व् अन्तर् अमृतम्»** (Kaushika 9.1-9.7): kaanse ke katore mein jal abhimantrit karke thoda aachman, baaki ghar mein chhidkaav.',
      'Dhan-vyapar hamari library ki sabse badi samasya hai — 165 upay, 10 alag kism ke. Isliye ₹51 report mein yahan sabse zyada vividhta aati hai: jap, jal-arpan, daan, seva, raksha-dhaaga.',
    ],
  },
  {
    id: 'naukri-mein-rukawat-ke-upay',
    h2: 'नौकरी में रुकावट के उपाय — naukri aur pramotion',
    paras: [
      '**Naukri mein rukawat ke upay** ke liye Atharvaveda 1.9 **«अस्मिन् वसु वसवो धारयन्तु»** (Kaushika 11.19, 52.20): roz subah 11 baar; koi sone ki cheez kheer ke bartan mein rakh kar abhimantrit karein, laal dhaage mein pehnein aur kheer prasad khaayein.',
      'Doosra — Atharvaveda 1.29 **«अभीवर्तेन मणिना»** (Kaushika 16.29), jo unnati ki mani ka sukta hai. Naukri badalni hai ya nahi, iska samay [Career Pivot](/services/career-pivot) reading mein dekha jaata hai. Sarkari naukri ka yog — [IAS Astrology Calculator](/calculators/free-ias-astrology-calculator).',
    ],
  },
  {
    id: 'bete-ki-naukri-ke-upay',
    h2: 'बेटे या बेटी की नौकरी के लिए उपाय',
    paras: [
      'Bahut maa-baap apne bachche ki naukri ke liye upay poochte hain. Sabse sahi tarika: **upay usi ki janm-tithi se nikaalein jiski naukri hai** — calculator mein bachche ka janm-vivaran daalein. Uska kamzor grah aur dasha alag hogi.',
      'Kai Atharva upay aise hain jo parivar ka koi bhi sadasya kar sakta hai — jaise jal abhimantrit karke dena ya abhimantrit bhojan khilaana. Report mein har upay ke saath likha hota hai ki kya chahiye aur kaise karna hai.',
    ],
  },
  {
    id: 'office-jhagda-jhootha-ilzaam',
    h2: 'Office ka jhagda, toxic boss aur jhootha ilzaam',
    paras: [
      'Rgvidhana (2.30.157-158) ek khaas sthiti batata hai: **jab aap par jhootha ilzaam lage ya kai log milkar ghere.** Upay: teen din roz shaam ghee ka diya jalaa kar Rigveda 7.104.1 **«इन्द्रासोमा तपतं रक्ष उब्जतं»** 11 baar bolein aur lau mein ghee ki boond daalein.',
      'Sath kaam karne walon se mel ke liye wahi **«सहृदयं सांमनस्यम्»**. Hamari library mein office-jhagde ke 49 upay hain, 9 alag kism ke. Boss ke saath samay kaisa rahega — [Toxic Boss Radar](/services/toxic-boss-radar).',
    ],
  },
  {
    id: 'court-case-ke-upay',
    h2: 'Court case aur vivaad mein jeet ke upay',
    paras: [
      'Court-kacheri ke liye Kaushika (38.17, 76.8) Atharvaveda 1.34 **«मधुमन् मे निक्रमणं»** deta hai: roz subah 11 baar, aur sunvaai, interview ya vivaad mein jaate samay mulethi ka chhota tukda chabaayein. Kharcha ₹10 se kam.',
      'Jhoothe mukadme mein Rgvidhana wala Rigveda 7.104.1 ka upay bhi aata hai. **Zaroori baat: upay vakeel ki salaah ke saath karein, uski jagah nahi.** Hum kisi ka nuksaan karne wale (shatru-maran) upay nahi dete — sirf apni raksha aur saty ki jeet ke.',
    ],
  },

  // ───────── 8. Santan, sehat, ghar ─────────
  {
    id: 'santan-prapti-ke-upay',
    h2: 'संतान प्राप्ति के उपाय — granth ke prachin upay',
    paras: [
      '**Jaldi santan prapti ke upay** ke liye do granth seedhe baat karte hain. Phaladeepika adhyay 12 batata hai ki santan mein rukawat kis grah se hai, aur us grah ki aaradhana: Surya — Shiv; Chandra — Devi; Mangal — Kartikeya; Budh — Vishnu; Guru — ped lagaana; Shukra — gau-seva; Shani — peepal ki seva; Rahu — naag-devta. BPHS 83 purva-janm ke shaap aur unke upay deta hai.',
      'Atharvaveda 1.11 (Kaushika 33) garbh ke aakhri mahine ka upay hai. Santan ka yog [Santan Yog Calculator](/calculators/free-santan-yog-calculator) se dekhein. **Doctor ki salaah ke saath hi upay karein.** Hum beta-beti mein fark nahi karte — har upay santan ke liye hai.',
    ],
  },
  {
    id: 'swasthya-ke-upay',
    h2: 'Swasthya aur rog ke upay — Atharvaveda ka bhaishajya',
    paras: [
      'Atharvaveda ka bada hissa rog-nivaran (bhaishajya) ka hai. Misaal: Atharvaveda 1.2 **«एवा रोगं चास्रावं»** (Kaushika 25.6-25.9) — roz subah 11 baar; munj ki dori (na mile to kalawa) abhimantrit karke rogi ki kalai par baandhein.',
      'Hamari library mein swasthya ke 128 upay hain. **Har upay doctor ke ilaaj ke saath hai, uski jagah kabhi nahi** — ye report mein bhi likha hota hai. Kundali mein sehat ke kamzor bindu [Health Prediction Calculator](/calculators/free-health-prediction-calculator) mein dekh sakte hain.',
    ],
  },
  {
    id: 'lambi-aayu-ke-upay',
    h2: 'Lambi aayu aur Mrityunjaya — aayu ke upay',
    paras: [
      'Aayu ke liye granth ka sabse jaana-maana upay **Mahamrityunjaya mantra «त्र्यम्बकं यजामहे सुगन्धिम्»** hai, jo BPHS Shani aur Ketu ki dasha mein bhi batata hai (57.7, 59.5-6). Roz subah diya jalaa kar 108 ya 11 baar.',
      'Atharvaveda 1.9 (Kaushika 11.19) bhi aayu aur tej ke liye diya gaya hai. Library mein aayu ke 99 upay hain. Kundali ke hisaab se aayu-khand [Life Span Calculator](/calculators/free-life-span-calculator) mein dekhein — par yaad rakhein, ye sirf ek jyotish anumaan hai.',
    ],
  },
  {
    id: 'naya-ghar-kharidne-ke-upay',
    h2: 'नया घर खरीदने के उपाय — ghar, zameen aur griha-pravesh',
    paras: [
      'Ghar ke liye Atharvaveda 3.12 **«इहैव ध्रुवां नि मिनोमि शालाम्»** — "yahin main sthir ghar banaata hoon" — Kaushika (43.8-43.15) mein neev, nirmaan aur griha-pravesh ke din bola jaata hai. Pravesh ke samay ghar ki stree jal-kalash aur jalta diya le kar aage chalti hai.',
      'Ghar ke kalesh ke liye Atharvaveda 2.14 (Kaushika 72.4): roz shaam abhimantrit jal dehri par chhidkein. Ghar ka yog kab hai — [Property Yog](/services/property-yog). Griha-pravesh ki shubh tareekh — [Shubh Muhurat Calculator](/calculators/free-shubh-muhurat-calculator).',
    ],
  },
  {
    id: 'padhai-ke-upay',
    h2: 'Padhai, exam aur yaad-shakti ke upay',
    paras: [
      'Atharvaveda ka **pehla hi sukta — «वाचस्पतिर् नि यच्छतु»** (AV 1.1, Kaushika 10) — medha aur yaad-shakti ke liye hai. Padhai se pehle roz subah 11 baar; ghee mile bhune jau-til ki ek chutki aahuti, baaki prasad.',
      'Rgvidhana (1.17.85) padhai ke liye Rigveda ka **«सदसस् पतिम् अद्भुतम्»** batata hai. Library mein padhai ke 62 upay hain. Exam ke dino mein Budh ke upay bhi madad karte hain — upar "Budh ke upay" dekhein.',
    ],
  },

  // ───────── 9. Mann aur raksha ─────────
  {
    id: 'bure-sapne-ke-upay',
    h2: 'Bure sapne aur raat ka dar — upay',
    paras: [
      'Atharvaveda 4.17 apamarg ka sukta hai (Kaushika 39): roz subah 11 baar, phir gaadhi chhaachh abhimantrit karke takhnon par 3 baar chhidkein. Raksha ke liye Atharvaveda 4.9 (Kaushika 58.8) — kaala dhaaga abhimantrit karke kalaai par.',
      'Kaunsa sapna kya sanket deta hai, ye [Swapna Shastra](/swapna) mein granth ke hawale se padhein.',
    ],
  },
  {
    id: 'nazar-dosh-ke-upay',
    h2: 'Nazar dosh aur negativity ke upay',
    paras: [
      'Nazar aur ghar ki nakaratmakta ke liye Atharvaveda ke shuruaati sukte 1.7 aur 1.8 hain (Kaushika 8.25, 14.15): roz shaam 11 baar, dhoop-daani ki aag mein chutki bhar chaawal ki bhoosi daalte hue.',
      'Library mein nazar ke 119 upay hain — zyadatar diya, dhoop aur jal se. Kisi ko nuksaan pahunchaane wala koi upay hum nahi dete; sirf raksha ke.',
    ],
  },
  {
    id: 'tanav-ghabrahat-ke-upay',
    h2: 'Tanav, ghabrahat aur dar ke upay',
    paras: [
      'Darne wale vyakti ke liye Kaushika (26.26) Atharvaveda 1.28 deta hai: khas ki chaar seenkein, sire halke jalaa kar, abhimantrit karke kalaai par. Raat ki bechaini ke liye Atharvaveda 1.31 **«स्वस्ति मात्र उत पित्रे»** — sone se pehle 11 baar.',
      'Kamzor Chandra bhi tanav ka bada kaaran hota hai — upar "Chandra ke upay" dekhein. **Lagaataar tanav ya udaasi ho to doctor ya counsellor se zaroor milein.**',
    ],
  },
  {
    id: 'yatra-videsh-ke-upay',
    h2: 'Yatra aur videsh jaane ke upay',
    paras: [
      'Surakshit yatra ke liye Atharvaveda 1.21 **«स्वस्तिदा विशां पतिः»** (Kaushika 50.1-50.2): ghar se nikalne se pehle 11 baar bolein aur daayaan pair pehle bahar rakhein.',
      'Videsh mein basne ka yog hai ya nahi — [Foreign Settlement Calculator](/calculators/free-foreign-settlement-calculator).',
    ],
  },
  {
    id: 'adhyatm-manokamna-ke-upay',
    h2: 'Adhyatm, manokamna aur aatmavishwas ke upay',
    paras: [
      'Library mein adhyatm ke 91 upay hain — 12 alag kism ke, sabse zyada vividhta. Atharvaveda 1.10 (Kaushika 25.37) mann ke bojh se mukti ka sukta hai. Manokamna, aatmavishwas aur prasiddhi ke liye Atharvaveda 1.9 sabse zyada aata hai.',
      'Jeevan ka uddeshya aur sadhana ki disha jaanni ho to [Spiritual Purpose](/services/spiritual-purpose) reading dekhein.',
    ],
  },

  // ───────── 10. Granth ─────────
  {
    id: 'atharvaveda-kaushika-upay',
    h2: 'Atharvaveda ke upay — Kaushika Sutra kya kehta hai',
    paras: [
      'Atharvaveda ke mantra kis kaam mein kaise lagte hain, ye **Kaushika Sutra** batata hai — isse viniyoga kehte hain. Hamare Atharva upay sirf Kaushika se hain, taaki har upay ki vidhi granth mein likhi ho, kisi ke anumaan se nahi.',
      'Granth ki vidhi ka jo hissa aaj ke ghar mein mushkil hai (bada yajna, khet), uska saral roop diya gaya hai — jaise yajna ki jagah ghee ka diya. Har badlav report mein likha rehta hai. **Maans, sura, bali ya kisi ka nuksaan — kabhi kisi upay mein nahi.**',
    ],
  },
  {
    id: 'rigveda-rgvidhana-upay',
    h2: 'Rigveda ke upay — Rgvidhana aur Grihya Sutra',
    paras: [
      '**Rgvidhana** (Shaunaka) batata hai ki Rigveda ka kaunsa sukta kis ichchha ke liye japa jaaye — dhan, vidya, raksha, sehat. Hamari library mein Rgvidhana ke lagbhag 200 upay hain.',
      'Grihya Sutra (Ashvalayana, Shankhayana, Manava aadi) ghar ke shanti-karm dete hain. Unme se sirf wo upay liye gaye jo kisi samasya ka seedha phal kehte hain — sanskar wale (upanayan, chudakarma) nahi.',
    ],
  },
  {
    id: 'bphs-graha-shanti-upay',
    h2: 'BPHS ke graha-shanti upay — jap, samidha aur daan',
    paras: [
      'BPHS har grah ka **jap, samidha aur daan** deta hai: Surya — aak, Chandra — palash, Mangal — khair, Budh — apamarg, Guru — peepal, Shukra — gular, Shani — shami, Rahu — doob, Ketu — kusha. Ye shanti khaas taur par tab kahi gayi hai jab grah **6, 8 ya 12 ghar** mein ho.',
      'Dasha ke daur mein BPHS alag shanti batata hai — Rahu mahadasha (adhyay 55), Shani mahadasha (57), Ketu mahadasha (59) aadi. Aapki chalti dasha par wo shart lagti hai to wo upay bhi aata hai.',
    ],
  },
  {
    id: 'phaladeepika-jataka-parijata-upay',
    h2: 'Phaladeepika aur Jataka Parijata ke upay',
    paras: [
      'Mantreshwar ki **Phaladeepika** (adhyay 12) aur Vaidyanath ki **Jataka Parijata** (adhyay 13) santan-bhaav ke prasang mein batate hain ki kaaran-grah ke hisaab se kis devta ki aaradhana karein. Ye upay bahut saral hain — ped lagaana, gau-seva, peepal ko jal, vidwan ka samman.',
      'Isliye hamari report mein upay sirf mantra nahi hote — seva aur vriksharopan jaise upay bhi aate hain, jo bina kharche ke roz ho sakte hain.',
    ],
  },
  {
    id: 'asli-daan-sasta-vikalp',
    h2: 'Asli daan aur sasta vikalp — har koi kar sake',
    paras: [
      'Granth kai jagah bada daan kehta hai — gaay, bail, sona, bhains. Hum granth ko chhupaate nahi: report mein **asli daan** likha hota hai, aur neeche **sasta vikalp** — jaise gaushala mein ₹21-51 ka chaara, ya ₹11-21 ka anaaj.',
      'Rohiit Gupta ka niyam hai ki har report mein kam se kam 2-3 upay aise hon jo lagbhag muft hon — jal, diya, jap. Upay ki taakat shraddha aur niyam mein hai, keemat mein nahi.',
    ],
  },
  {
    id: 'ratna-ya-upay',
    h2: 'Ratna pehnein ya upay karein?',
    paras: [
      'Kamzor grah ka ratna har baar sahi nahi hota — agar wo grah aapke lagna ke liye **maarak ya paap** hai to ratna uski kathinai bhi badhata hai. Aise mein jap, havan aur daan surakshit raasta hai.',
      'Kaunsa ratna aapki kundali ke liye theek hai, ye [Gemstone Suitability Calculator](/calculators/free-gemstone-suitability-calculator) Parashar ki lagna-dar-lagna soochi se batata hai.',
    ],
  },
  {
    id: 'rambaan-upay-sach',
    h2: '"Ramban upay" aur totke — sach kya hai?',
    paras: [
      'Internet par "1 ramban upay", "6 upay se Shani khush" jaise daave bahut hain. Granth aisa koi ek jaadu nahi deta. Granth grah, dasha aur samasya ke hisaab se alag-alag upay deta hai — aur unhe niyam se karne ko kehta hai.',
      'Isliye hamare har upay ke saath granth ka hawala hai — Kaushika, Rgvidhana, BPHS ka adhyay aur shlok. Jo upay kisi granth mein nahi milta, wo hamari report mein nahi aata.',
    ],
  },

  // ───────── 11. Upay karne ki vidhi ─────────
  {
    id: 'upay-kaise-karein',
    h2: 'Upay kaise karein — 5 saral niyam',
    paras: [
      '**1.** Roz ek hi samay par karein — subah naha kar sabse achha. **2.** Mantra jaisa Sanskrit mein likha hai waisa padhein; ginti 11 se shuru karein. **3.** Ek saath sab nahi — sabse aasaan 2-3 se shuru karein. **4.** Daan apni shakti ke hisaab se; sasta vikalp bhi utna hi maanya hai. **5.** Rog ke upay doctor ke ilaaj ke saath, uski jagah nahi.',
    ],
  },
  {
    id: 'upay-kitne-din-karein',
    h2: 'Upay kitne din aur kitni baar karein?',
    paras: [
      'Jahan granth ne ginti di hai, wo upay ke saath likhi hai — jaise BPHS mein Shani ke liye 23,000 jap, ya Rgvidhana mein "teen din". Baaki upay roz ek hi samay par niyam se karein jab tak samasya chal rahi ho, ya chalti antardasha khatam na ho.',
      'Kram aur avadhi aapki kundali ke hisaab se chahiye to [Rohiit Gupta](/founder) se ₹499 ki seedhi consultation le sakte hain.',
    ],
  },
  {
    id: 'upay-mein-kya-na-karein',
    h2: 'Upay karte samay kya na karein',
    paras: [
      'Kisi ka bura chahne wala upay na karein — granth bhi raksha aur shanti ke upay ko pehle rakhta hai. Upay ke naam par hazaaron rupaye ke anushthan ke dabaav mein na aayein. Ek saath das upay shuru karke beech mein na chhodein.',
      'Mantra ka uchchaaran saaf rakhein; samajh na aaye to dheere-dheere padhein. Aur sabse zaroori — **doctor, vakeel ya counsellor ki salaah ko upay se na badlein.**',
    ],
  },

  // ───────── 12. Pricing, samasya, vishwas ─────────
  {
    id: 'free-51-499-mein-fark',
    h2: 'Free, ₹51 aur ₹499 — kis mein kya milta hai',
    paras: [
      '**Free:** Shadbala se kamzor grah, chalti dasha, aur 3 BPHS upay. Kisi bhi grah ke 3 upay bhi muft. **₹51:** koi 2 chuniye — samasya, dosh (Kaal Sarp, Manglik, Sade Sati) ya grah — aur 10 upay paayein, alag-alag kism aur granth se. Website report, PDF download aur WhatsApp share. Form mein apni baat bhi likh sakte hain — wo report mein aur Rohiit Gupta tak pahunchti hai.',
      '**₹499:** [Rohiit Gupta](/founder) ke saath seedhi baat — kaunsa upay pehle, kab tak, aur kundali ki poori padhaai. Saare plan [Pricing](/pricing) par.',
    ],
  },
  {
    id: '27-samasya',
    h2: '27 samasya — naukri, karz, vivah, santan, court aur bahut kuch',
    paras: [
      'Naukri, office ka jhagda, dhan-vyapar, karz se mukti, vivah mein deri, rishta toota, santan, swasthya, lambi aayu, court-kacheri, ghar-zameen, yatra, padhai, bure sapne, nazar, pitra dosh, grah peeda, adhyatm, manokamna, prem, parivar klesh, talaq se bachav, tanav, pati/patni ka doosra sambandh, live-in, aatmavishwas aur prasiddhi.',
      'Inke alawa teen dosh — **Kaal Sarp, Manglik aur Shani Sade Sati/Dhaiya** — aur 9 grah bhi chune ja sakte hain. Koi bhi 2 chun kar ₹51 report banaayein. [Upar form bharein](#upay-form).',
    ],
  },
  {
    id: 'trikaal-vaani-upay-kyun',
    h2: 'Trikaal Vaani ka upay calculator alag kyun hai',
    paras: [
      'Zyadatar websites ya to ek hi rashi-phal wala upay dikhaati hain, ya phone par per-minute baat karvaati hain. Trikaal Vaani mein pehle **Swiss Ephemeris** par aapki kundali ka asli ganit hota hai — Shadbala, Vimshottari dasha — phir upay granth ki table se aate hain, har ek shlok-hawale ke saath.',
      'Is library ko [Rohiit Gupta](/founder), Chief Vedic Architect, ne granth se chun kar banaya hai. Aur bhi muft calculator [yahan](/calculators) hain — jaise [Janam Kundali](/calculators/free-janam-kundali-calculator).',
    ],
  },
];

const FAQS = [
  { q: 'Upay calculator by date of birth kya hai?', a: 'Ye janm-tithi, samay aur sthan se kundali banakar Shadbala (BPHS 27) se kamzor grah nikalta hai aur granth se upay deta hai — free mein 3 BPHS upay, ₹51 mein 2 samasya ke 10 alag upay.' },
  { q: 'Kya ye upay AI likhta hai?', a: 'Nahi. Har upay Trikaal Vaani ki granth library se hai — Atharvaveda (Kaushika Sutra), Rigveda (Rgvidhana), BPHS, Phaladeepika aur Jataka Parijata — aur har upay ke saath uska shlok-hawala likha hai.' },
  { q: 'Kya main sirf Shani, Rahu ya kisi ek grah ke upay dekh sakta hoon?', a: 'Haan. Nateeje ke neeche "Kisi grah ke upay dekhein" mein Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu aur Ketu — koi bhi chunein. Free mein 3 upay, ₹51 report mein saare.' },
  { q: '₹51 mein kya milta hai?', a: 'Aapki chuni hui 2 samasya, dosh ya grah ke 10 upay — mantra, daan, seva, snaan, raksha-dhaaga jaise alag-alag kism ke. Report website par khulti hai, PDF download hoti hai aur WhatsApp par share ho sakti hai.' },
  { q: 'Kya upay mehenge hain?', a: 'Zyadatar upay mein kharcha nahi ya sirf diya, jal, ghee lagta hai. Jahan granth bada daan kehta hai, wahan ₹11-51 ka sasta vikalp bhi diya hai.' },
  { q: 'Rahu ki mahadasha ke upay kya hain?', a: 'BPHS adhyay 55 Rahu mahadasha ki har antardasha ka alag upay deta hai — Rahu antardasha mein «ॐ राहवे नमः» ka jap, Guru antardasha mein Rudra mantra, Shani antardasha mein Shani ka daan. Calculator aapki chalti antardasha dekh kar sahi upay deta hai.' },
  { q: 'Sade Sati ke upay kya hain?', a: 'Shani ke granth upay: «ॐ शनैश्चराय नमः» ka jap, Shanivaar ko shami ki samidha ya sarson ke tel ka diya, kaale til ka daan aur peepal ki seva (Phaladeepika 12.21). Calculator mein Shani chun kar dekhein.' },
  { q: 'Kya Kaal Sarp dosh granth mein hai?', a: 'BPHS, Phaladeepika aur Jataka Parijata mein "Kaal Sarp" naam se yog nahi milta. Granth Rahu-Ketu ki shanti deta hai, aur sarp-shaap ki baat santan ke prasang mein karta hai (BPHS 83, Phaladeepika 12.22).' },
  { q: 'Pitra dosh ka sabse saral upay kya hai?', a: 'Kaushika Sutra 138 se — har maas ki krishna ashtami ko Atharvaveda 3.10 ke mantra se ghee aur til-chaawal ki 21 aahuti. Kharcha sirf ghee aur til ka.' },
  { q: 'Janm samay nahi pata to?', a: '12:00 maana jaata hai aur report mein likha jaata hai. Lagna badal sakta hai, isliye kamzor grah ka nateeja badal sakta hai — samay pata ho to zaroor dein.' },
  { q: 'Rahu-Ketu ke upay apne aap kab aate hain?', a: 'Rahu aur Ketu ka Shadbala granth mein nahi hai. Isliye unke upay tab aate hain jab unki mahadasha ya antardasha chal rahi ho — ya aap khud 9 grah mein se unhe chunein.' },
  { q: 'Kya upay doctor ya vakeel ki jagah le sakte hain?', a: 'Nahi. Swasthya ke upay ilaaj ke saath, aur court ke upay vakeel ki salaah ke saath karein. Upay sahayak hain, vikalp nahi.' },
  { q: 'Upay kitne din karne chahiye?', a: 'Jahan granth ne ginti ya avadhi di hai (jaise BPHS mein Shani ke liye 23,000 jap), wo upay ke saath likhi hai. Baaki upay roz ek hi samay par niyam se karein; kram aur avadhi personal chahiye to ₹499 consultation le sakte hain.' },
  { q: 'Kya ratna pehnna zaroori hai?', a: 'Nahi. Kamzor grah maarak ya paap ho to ratna nuksaan bhi kar sakta hai. Jap, daan aur seva har kundali ke liye surakshit hain. Ratna ke liye pehle Gemstone Suitability Calculator dekhein.' },
];

const MORE_CALC = [
  { href: '/calculators/free-weak-planet-finder', t: 'Weak Planet Finder' },
  { href: '/calculators/free-graha-bal-calculator', t: 'Graha Bal Calculator' },
  { href: '/calculators/free-dasha-calculator', t: 'Dasha Calculator' },
  { href: '/calculators/free-sade-sati-calculator', t: 'Sade Sati Calculator' },
  { href: '/calculators/free-pitra-dosh-calculator', t: 'Pitra Dosh Calculator' },
  { href: '/calculators/free-manglik-dosh-calculator', t: 'Manglik Dosh Calculator' },
  { href: '/calculators/free-kaal-sarp-dosh-calculator', t: 'Kaal Sarp Dosh Calculator' },
  { href: '/calculators/free-gemstone-suitability-calculator', t: 'Gemstone Suitability Calculator' },
  { href: '/calculators/free-janam-kundali-calculator', t: 'Janam Kundali Calculator' },
];

export default function FreeUpayCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-upay-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Upay Calculator by Date of Birth — ग्रंथ के उपाय',
    description:
      'Free upay calculator by date of birth: weak planet from Shadbala (BPHS Ch.27) and 3 BPHS graha-shanti remedies free; remedies for any of the 9 planets; Rahu, Shani and Ketu mahadasha remedies from BPHS; for Rs 51, 10 different remedies for 2 chosen problems from Atharvaveda (Kaushika Sutra), Rigveda (Rgvidhana), BPHS and Phaladeepika. No AI.',
    breadcrumbName: 'Upay Calculator',
    aboutEntities: [
      'Shadbala', 'Navagraha', 'Atharvaveda', 'Kaushika Sutra', 'Rigveda', 'Rgvidhana', 'Brihat Parashara Hora Shastra',
      'Phaladeepika', 'Jataka Parijata', 'Graha Shanti', 'Vimshottari Dasha', 'Sade Sati', 'Pitra Dosha',
      'Mangal Dosha', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu',
    ],
    knowsAbout: ['Vedic Astrology', 'Jyotish Remedies', 'Atharvaveda Viniyoga', 'BPHS Graha Shanti', 'Shadbala', 'Dasha Remedies'],
    howToName: 'How to find astrological remedies by date of birth',
    howToSteps: [
      { name: 'Enter birth details', text: 'Date, time and place of birth; the chart is computed on Swiss Ephemeris with Lahiri ayanamsha.' },
      { name: 'See the weak planet and 3 free remedies', text: 'Shadbala (BPHS Ch.27) finds the weak planet; three BPHS graha-shanti remedies are shown with their verse reference. Remedies for any one of the 9 planets can also be opened.' },
      { name: 'Choose 2 problems for 10 remedies', text: 'For Rs 51, choose two problems; ten remedies of different kinds come from Atharvaveda, Rigveda, BPHS and Phaladeepika, with PDF download and WhatsApp share.' },
    ],
    faqs: FAQS,
    dateModified: '2026-10-10',
  });

  return (
    <>
      <SiteNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link><span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link><span className="mx-2">›</span>
            <span style={{ color: '#94a3b8' }}>Upay Calculator</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2" style={{ color: GOLD }}>
              Upay Calculator by Date of Birth — ग्रंथ के उपाय
            </h1>
            <p className="text-sm m-0" style={{ color: '#94a3b8' }}>
              Shadbala se kamzor grah · 9 grah mein se kisi ke bhi upay · BPHS ke 3 upay muft · ₹51 mein 2 samasya ke 10 alag upay — Atharvaveda, Rigveda, BPHS se। Koi AI nahi।
            </p>
          </header>

          {/* ── AEO / GEO direct answer (52 shabd) ── */}
          <div className="rounded-xl p-5 mb-6" style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="text-base md:text-lg leading-relaxed m-0">
              <strong style={{ color: GOLD }}>Upay by date of birth</strong> ke liye kundali se pehle{' '}
              <strong style={{ color: GOLD }}>kamzor grah (Shadbala, BPHS 27)</strong> aur chalti dasha nikalti hai, phir granth se upay.{' '}
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Upay Calculator</strong> free mein BPHS ke 3 graha-shanti upay deta hai, aur ₹51 mein
              aapki 2 samasya ke 10 alag upay — Atharvaveda (Kaushika Sutra), Rigveda (Rgvidhana) aur BPHS se, har ek shlok-hawale ke saath.
            </p>
          </div>

          {/* ── E-E-A-T ── */}
          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
              style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>
                <Link href="/founder" className="hover:underline">Rohiit Gupta</Link>
              </div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Shadbala (BPHS 27) · Granth library — 910 upay</div>
            </div>
          </div>

          <div id="upay-form" className="scroll-mt-24">
            <UpayCalculator />
          </div>

          {/* ── Table of contents ── */}
          <details className="mt-12 rounded-xl p-4" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <summary className="cursor-pointer text-sm font-semibold" style={{ color: GOLD }}>
              Is page par — {SECTIONS.length} vishay (grah, dasha, dosh, samasya)
            </summary>
            <ol className="mt-3 text-xs space-y-1 pl-5" style={{ color: '#94a3b8' }}>
              {SECTIONS.map((s) => (
                <li key={s.id}><a href={`#${s.id}`} className="hover:text-slate-200">{s.h2}</a></li>
              ))}
            </ol>
          </details>

          <section className="mt-10">
            {SECTIONS.map((s, si) => (
              <div key={s.id} id={s.id} className="scroll-mt-24 mb-10">
                <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>{s.h2}</h2>
                {s.paras.map((p, pi) => (
                  <p key={pi} className="text-slate-300 leading-relaxed mb-4">{renderRich(p, `s${si}-p${pi}`)}</p>
                ))}
              </div>
            ))}
          </section>

          <section className="mt-4 rounded-2xl p-5 md:p-6 mb-8"
            style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Aksar puche jaane wale sawaal — Upay Calculator</h2>
            {FAQS.map((f, i) => (
              <details key={i} className="mb-2 last:mb-0">
                <summary className="text-sm font-semibold cursor-pointer py-2" style={{ color: '#e2e8f0' }}>{f.q}</summary>
                <p className="text-xs leading-relaxed mt-1 mb-2" style={{ color: '#94a3b8' }}>{f.a}</p>
              </details>
            ))}
          </section>

          <section className="rounded-2xl p-5" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <ul className="text-sm space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
              {MORE_CALC.map((l) => (
                <li key={l.href}><Link href={l.href} style={{ color: '#94a3b8' }} className="hover:text-slate-200">{l.t}</Link></li>
              ))}
            </ul>
          </section>

        </div>
      </main>
    </>
  );
}
// END — app/calculators/free-upay-calculator/page.tsx v2.0
