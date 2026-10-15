/**
 * components/report/upayBhasha.ts — v1.0 — 15 October 2026
 *
 * PARAMPARIK UPAY ka Hindi (aur saaf English). Ye upay VM ka
 * template_engine.py / remedy_master.py ENGLISH mein banata hai aur wahi
 * report ke saath predictions.prediction_json.remedyPlan mein save hota hai —
 * Supabase mein inki koi master table nahi. Isliye anuvaad YAHAN, report
 * dikhate waqt: purani aur nayi DONO reports par chalta hai, aur VM/Supabase
 * ko chhoona nahi padta.
 *
 * Dictionary ANDAAZE se nahi bani: 15 Oct 2026 ko Supabase se pichhle 60 din
 * ki saari reports ke remedyPlan ke har khaane ki DISTINCT values nikaali gayi
 * (9 grah, 7 din, 12 lagna, 9+7 ratna, 9 vrat/daan/prasad/yantra...). Jo value
 * yahan nahi hai wo waisi hi dikhegi — kuch tootega nahi.
 *
 * Do badlaav jo sirf anuvaad nahi hain (Rohiit ko bataya gaya):
 *   1. "Poor disabled or lower caste" → "ज़रूरतमंद या दिव्यांग" / "The needy
 *      or the disabled" — jaati ka zikr paid report par nahi.
 *   2. "<Lagna> - Lifelong protection" → "जीवन भर के लिए" / "lifelong stone" —
 *      "protection" ek vaada tha jo granth nahi deta.
 * Vedic logic (kaun sa grah, kaun sa ratna, kaun sa din) — kuch nahi badla.
 */

import type { Lang } from './theme'
import { grahL, rashiL } from './theme'

// [hindi, english-saaf]. English khaali ('') ho to engine ka English hi chalega.
const T: Record<string, [string, string]> = {
  // din
  Sunday: ['रविवार', ''], Monday: ['सोमवार', ''], Tuesday: ['मंगलवार', ''], Wednesday: ['बुधवार', ''],
  Thursday: ['गुरुवार', ''], Friday: ['शुक्रवार', ''], Saturday: ['शनिवार', ''],
  // ginti
  '108x': ['108 बार', '108 times'], '108x daily': ['रोज़ 108 बार', '108 times daily'],
  // samay
  'Evening or Monday morning': ['शाम, या सोमवार सुबह', ''], 'Friday morning': ['शुक्रवार सुबह', ''],
  'Saturday morning before sunrise': ['शनिवार, सूर्योदय से पहले', ''],
  'Saturday or Wednesday evening': ['शनिवार या बुधवार शाम', ''],
  'Sunrise facing East': ['सूर्योदय पर, पूर्व की ओर मुख करके', ''],
  'Thursday morning': ['गुरुवार सुबह', ''], 'Tuesday morning': ['मंगलवार सुबह', ''],
  'Tuesday or Saturday': ['मंगलवार या शनिवार', ''], 'Wednesday morning': ['बुधवार सुबह', ''],
  // focus
  'Courage and energy': ['साहस और ऊर्जा', ''],
  'Discipline and karmic resolution': ['अनुशासन और कर्म-बन्धन का निवारण', ''],
  'Intelligence and communication': ['बुद्धि और वाणी', ''],
  'Love and prosperity': ['प्रेम और समृद्धि', ''],
  'Mental peace and emotional balance': ['मन की शान्ति और भावनात्मक सन्तुलन', ''],
  'Overall strength and clarity': ['समग्र बल और स्पष्टता', ''],
  'Spiritual liberation and karma resolution': ['आध्यात्मिक मुक्ति और कर्म-निवारण', ''],
  'Transformation and hidden opportunities': ['परिवर्तन और छिपे अवसर', ''],
  'Wisdom and prosperity': ['ज्ञान और समृद्धि', ''],
  // mantra — Hindi report par Devanagari
  'Om Angarakaya Namah': ['ॐ अङ्गारकाय नमः', ''], 'Om Budhaya Namah': ['ॐ बुधाय नमः', ''],
  'Om Chandraya Namah': ['ॐ चन्द्राय नमः', ''], 'Om Gurave Namah': ['ॐ गुरवे नमः', ''],
  'Om Ketave Namah': ['ॐ केतवे नमः', ''], 'Om Rahave Namah': ['ॐ राहवे नमः', ''],
  'Om Shanaye Namah': ['ॐ शनये नमः', ''], 'Om Shukraya Namah': ['ॐ शुक्राय नमः', ''],
  'Om Suryaya Namah': ['ॐ सूर्याय नमः', ''],
  // vishesh upay
  'Light mustard oil diya to Shani on Saturday': ['शनिवार को शनि देव के आगे सरसों के तेल का दीया जलाएँ', ''],
  'Offer coconut to Rahu at Rahu kaal on Saturday': ['शनिवार को राहु काल में राहु को नारियल अर्पित करें', ''],
  'Offer green flowers to Mercury on Wednesday': ['बुधवार को बुध को हरे फूल अर्पित करें', ''],
  'Offer red flowers to Mars deity on Tuesday': ['मंगलवार को मंगल देव को लाल फूल अर्पित करें', ''],
  'Offer sesame to Ketu on Tuesday': ['मंगलवार को केतु को तिल अर्पित करें', ''],
  'Offer water to rising Sun daily': ['रोज़ उगते सूर्य को जल (अर्घ्य) दें', ''],
  'Offer white flowers to Moon on Purnima': ['पूर्णिमा को चन्द्र को सफ़ेद फूल अर्पित करें', ''],
  'Offer white lotus to Lakshmi on Friday': ['शुक्रवार को लक्ष्मी जी को सफ़ेद कमल अर्पित करें', ''],
  'Offer yellow flowers to Jupiter on Thursday': ['गुरुवार को गुरु (बृहस्पति) को पीले फूल अर्पित करें', ''],
  // vrat
  'Budhvar Vrat': ['बुधवार व्रत', ''], 'Guruvar Vrat': ['गुरुवार व्रत', ''], 'Ketu Shanti': ['केतु शान्ति', ''],
  'Mangalvar Vrat': ['मंगलवार व्रत', ''], 'Rahu Shanti': ['राहु शान्ति', ''], 'Ravivar Vrat': ['रविवार व्रत', ''],
  'Shanivar Vrat': ['शनिवार व्रत', ''], 'Shukravar Vrat': ['शुक्रवार व्रत', ''], 'Somvar Vrat': ['सोमवार व्रत', ''],
  // devta
  'Goddess Durga': ['माँ दुर्गा', ''], 'Goddess Lakshmi': ['माँ लक्ष्मी', ''], 'Lord Ganesha': ['श्री गणेश', ''],
  'Lord Hanuman': ['श्री हनुमान', ''], 'Lord Shani': ['शनि देव', ''], 'Lord Shiva': ['भगवान शिव', ''],
  'Lord Surya': ['सूर्य देव', ''], 'Lord Vishnu': ['भगवान विष्णु', ''],
  // prasad
  'Black sesame urad dal mustard oil diya': ['काले तिल, उड़द दाल, सरसों के तेल का दीया', 'Black sesame, urad dal, mustard-oil diya'],
  'Coconut urad dal': ['नारियल, उड़द दाल', 'Coconut, urad dal'],
  'Green items milk sweets': ['हरी चीज़ें, दूध की मिठाई', 'Green items, milk sweets'],
  'Milk white rice white flowers': ['दूध, सफ़ेद चावल, सफ़ेद फूल', 'Milk, white rice, white flowers'],
  'Red lentils jaggery red flowers': ['मसूर दाल, गुड़, लाल फूल', 'Red lentils, jaggery, red flowers'],
  'Sesame laddoo banana': ['तिल के लड्डू, केला', 'Sesame laddoo, banana'],
  'Wheat jaggery red flowers': ['गेहूँ, गुड़, लाल फूल', 'Wheat, jaggery, red flowers'],
  'White sweets white flowers kheer': ['सफ़ेद मिठाई, सफ़ेद फूल, खीर', 'White sweets, white flowers, kheer'],
  'Yellow chickpeas turmeric banana': ['पीले चने, हल्दी, केला', 'Yellow chickpeas, turmeric, banana'],
  // yantra ki jagah
  'East wall or puja ghar': ['पूर्वी दीवार या पूजा घर', ''],
  'North or study room': ['उत्तर दिशा या पढ़ाई का कमरा', ''],
  'North wall or bedroom': ['उत्तरी दीवार या शयनकक्ष', ''],
  'Northeast Ishanya corner': ['ईशान (उत्तर-पूर्व) कोना', ''],
  'South wall': ['दक्षिणी दीवार', ''],
  'Southeast corner or spiritual room': ['आग्नेय (दक्षिण-पूर्व) कोना या पूजा का कमरा', ''],
  'Southeast or bedroom': ['आग्नेय (दक्षिण-पूर्व) दिशा या शयनकक्ष', ''],
  'Southwest corner': ['नैऋत्य (दक्षिण-पश्चिम) कोना', ''],
  'West wall': ['पश्चिमी दीवार', ''],
  // daan ki cheezein
  'Black sesame urad dal iron black cloth mustard oil shoes': ['काले तिल, उड़द दाल, लोहा, काला कपड़ा, सरसों का तेल, जूते', 'Black sesame, urad dal, iron, black cloth, mustard oil, shoes'],
  'Coconut blue cloth iron urad dal mustard oil black sesame': ['नारियल, नीला कपड़ा, लोहा, उड़द दाल, सरसों का तेल, काले तिल', 'Coconut, blue cloth, iron, urad dal, mustard oil, black sesame'],
  'Green moong dal green cloth bronze vessel books': ['हरी मूँग दाल, हरा कपड़ा, काँसे का बर्तन, किताबें', 'Green moong dal, green cloth, bronze vessel, books'],
  'Multi-colored cloth sesame iron blanket': ['रंग-बिरंगा कपड़ा, तिल, लोहा, कम्बल', 'Multi-coloured cloth, sesame, iron, blanket'],
  'Red lentils red cloth copper jaggery': ['मसूर दाल, लाल कपड़ा, ताँबा, गुड़', 'Red lentils, red cloth, copper, jaggery'],
  'Wheat copper vessel red cloth jaggery': ['गेहूँ, ताँबे का बर्तन, लाल कपड़ा, गुड़', 'Wheat, copper vessel, red cloth, jaggery'],
  'White rice ghee white cloth silver perfume curd': ['सफ़ेद चावल, घी, सफ़ेद कपड़ा, चाँदी, इत्र, दही', 'White rice, ghee, white cloth, silver, perfume, curd'],
  'White rice milk silver white cloth camphor': ['सफ़ेद चावल, दूध, चाँदी, सफ़ेद कपड़ा, कपूर', 'White rice, milk, silver, white cloth, camphor'],
  'Yellow chickpeas turmeric yellow cloth gold books banana': ['पीले चने, हल्दी, पीला कपड़ा, सोना, किताबें, केला', 'Yellow chickpeas, turmeric, yellow cloth, gold, books, banana'],
  // kise dein
  'Brahmin or poor woman': ['ब्राह्मण या ज़रूरतमंद स्त्री', ''],
  'Brahmin or soldier': ['ब्राह्मण या सैनिक', ''],
  'Brahmin or temple': ['ब्राह्मण या मन्दिर', ''],
  'Brahmin teacher or poor': ['ब्राह्मण, शिक्षक या ज़रूरतमंद', 'Brahmin, teacher or the needy'],
  'Poor disabled or lower caste': ['ज़रूरतमंद या दिव्यांग', 'The needy or the disabled'],
  'Poor or orphanage': ['ज़रूरतमंद या अनाथालय', 'The needy or an orphanage'],
  'Spiritual persons or ashram': ['साधु-सन्त या आश्रम', ''],
  'Students or teachers': ['विद्यार्थी या शिक्षक', ''],
  'Young woman or Brahmin woman': ['कन्या या ब्राह्मणी', ''],
  // note / ashirwad
  'Dana should be given with full devotion. Maa Shakti witnesses every act of giving.':
    ['दान पूरी श्रद्धा से दें। माँ शक्ति हर दान की साक्षी हैं।', ''],
  'Jai Maa Shakti - Trikal Vaani ke anusar yeh upay aapke liye specifically chune gaye hain':
    ['जय माँ शक्ति — त्रिकाल वाणी के अनुसार ये उपाय ख़ास आपके लिए चुने गए हैं', 'Jai Maa Shakti — Trikaal Vaani chose these remedies specifically for you'],
  'Wear on birth nakshatra day after purifying in raw milk':
    ['जन्म नक्षत्र वाले दिन, कच्चे दूध में शुद्ध करके पहनें', ''],
  // ratna
  'Blue Sapphire (Neelam)': ['नीलम (Blue Sapphire)', ''], 'Cat Eye (Lehsunia)': ['लहसुनिया (Cat’s Eye)', ''],
  'Diamond (Heera)': ['हीरा (Diamond)', ''], 'Emerald (Panna)': ['पन्ना (Emerald)', ''],
  'Hessonite (Gomed)': ['गोमेद (Hessonite)', ''], 'Pearl (Moti)': ['मोती (Pearl)', ''],
  'Red Coral (Moonga)': ['मूँगा (Red Coral)', ''], 'Ruby (Manik)': ['माणिक (Ruby)', ''],
  'Yellow Sapphire (Pukhraj)': ['पुखराज (Yellow Sapphire)', ''],
  'Diamond / White Sapphire': ['हीरा / सफ़ेद पुखराज', ''],
  // upratna (substitute)
  Amethyst: ['कटैला (Amethyst)', ''], Carnelian: ['कार्नेलियन (Carnelian)', ''], Citrine: ['सुनैला (Citrine)', ''],
  'Green Tourmaline': ['हरा टूरमलीन', ''], Moonstone: ['चन्द्रकान्त मणि (Moonstone)', ''],
  'Red Garnet': ['तामड़ा (Red Garnet)', ''], 'Spessartine Garnet': ['स्पेसार्टिन गार्नेट', ''],
  'Tiger Eye': ['टाइगर आई', ''], 'White Sapphire': ['सफ़ेद पुखराज', ''],
  // dhaatu / ungli
  Gold: ['सोना', ''], Silver: ['चाँदी', ''],
  'Index finger': ['तर्जनी', ''], 'Little finger': ['कनिष्ठा (छोटी उँगली)', ''],
  'Middle finger': ['मध्यमा', ''], 'Ring finger': ['अनामिका', ''],
  'Minimum 1 carat': ['कम से कम 1 कैरेट', ''],
}

const DIN_HI: Record<string, string> = {
  Sunday: 'रविवार', Monday: 'सोमवार', Tuesday: 'मंगलवार', Wednesday: 'बुधवार',
  Thursday: 'गुरुवार', Friday: 'शुक्रवार', Saturday: 'शनिवार',
}

/** Ek upay-khaane ka anuvaad. Hinglish par English hi (jaise pehle tha), sirf saaf kiya hua. */
export function upayL(v: unknown, lang: Lang): string {
  const x = String(v ?? '').trim()
  if (!x) return x
  const t = T[x]
  if (lang === 'hindi') {
    if (t) return t[0]
    let m = /^Minimum (\d+) rattis?$/i.exec(x)
    if (m) return `कम से कम ${m[1]} रत्ती`
    m = /^Most effective during (\w+) morning$/i.exec(x)
    if (m && DIN_HI[m[1]]) return `${DIN_HI[m[1]]} सुबह सबसे प्रभावी`
    m = /^(\w+) Yantra$/i.exec(x)
    if (m) return `${grahL(m[1], 'hindi')} यन्त्र`
    m = /^(\w+) Lagna - Lifelong protection$/i.exec(x)
    if (m) return `${rashiL(m[1], 'hindi')} लग्न — जीवन भर के लिए`
    m = /^(\w+) Mahadasha - Current period booster$/i.exec(x)
    if (m) return `${grahL(m[1], 'hindi')} महादशा — चल रहे दौर के लिए`
    return x
  }
  if (t && t[1]) return t[1]
  let m = /^(\w+) Lagna - Lifelong protection$/i.exec(x)
  if (m) return `${m[1]} Lagna — ${lang === 'english' ? 'lifelong stone' : 'jeevan bhar ke liye'}`
  m = /^(\w+) Mahadasha - Current period booster$/i.exec(x)
  if (m) return `${grahL(m[1], lang)} Mahadasha — ${lang === 'english' ? 'for the current period' : 'chal rahe daur ke liye'}`
  return x
}
