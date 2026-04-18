import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import { Calendar, CircleCheck as CheckCircle, Circle as XCircle, Star } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const events = [
  {
    date: 'Apr 30, 2026',
    name: 'Akshaya Tritiya',
    hindi: 'अक्षय तृतीया',
    planet: 'Venus + Sun',
    significance: 'Most auspicious day of the year for new beginnings. Akshaya means "never diminishing" — any action started today is blessed with eternal growth. Gold purchases, property deals, and new ventures carry divine backing.',
    dos: ['Buy gold or silver', 'Start a new business or project', 'Donate to the needy (annadaan)', 'Perform ancestral rituals (pitru tarpan)', 'Begin spiritual practice or mantra sadhana'],
    donts: ['Avoid conflicts or ego clashes', 'Do not take loans on this day', 'Avoid non-vegetarian food', 'Do not speak harshly to parents or elders'],
    type: 'major',
  },
  {
    date: 'May 12, 2026',
    name: 'Buddha Purnima',
    hindi: 'बुद्ध पूर्णिमा',
    planet: 'Moon (Full)',
    significance: 'The full moon of Vaishakha marks the birth, enlightenment, and Mahaparinirvana of Gautama Buddha. Purnima energy amplifies compassion, forgiveness, and spiritual receptivity.',
    dos: ['Meditate and practice silence (mouna)', 'Donate food and clothes to the poor', 'Light ghee diyas at home and temples', 'Chant peace mantras and Om', 'Fast if health permits'],
    donts: ['Avoid arguments and negative speech', 'Do not consume alcohol or intoxicants', 'Avoid starting new ventures (wait 24 hours)', 'Do not harbour resentment'],
    type: 'major',
  },
  {
    date: 'Jun 7, 2026',
    name: 'Nirjala Ekadashi',
    hindi: 'निर्जला एकादशी',
    planet: 'Jupiter',
    significance: 'The most rigorous of all 24 Ekadashis — a full waterless fast. Observing this single Ekadashi is said to grant the merit of all 24 Ekadashis combined. Jupiter\'s grace for wealth, wisdom, and progeny is activated.',
    dos: ['Fast completely (nirjala — no water, for the devout)', 'Recite Vishnu Sahasranama', 'Donate yellow cloth, turmeric, and gram dal', 'Stay awake all night in devotion (jaagaran)', 'Perform Tulsi puja'],
    donts: ['Avoid rice and grains', 'Do not cut hair or nails', 'Avoid sensual pleasures', 'Do not sleep during the day'],
    type: 'major',
  },
  {
    date: 'Jul 3, 2026',
    name: 'Guru Purnima',
    hindi: 'गुरु पूर्णिमा',
    planet: 'Jupiter (Brihaspati)',
    significance: 'The sacred day to honour the Guru-Shishya tradition. Vyasa Purnima — birth of Maharishi Veda Vyasa. Jupiter\'s blessings for knowledge, wisdom, and spiritual lineage are at their annual peak.',
    dos: ['Honour your teacher, mentor, or guru', 'Read Guru Gita or Bhagavad Gita', 'Donate books and educational materials', 'Begin a new course of study', 'Perform pada puja of an elder'],
    donts: ['Avoid ego and self-importance', 'Do not disrespect any teacher figure', 'Avoid indulgent entertainment', 'Do not break a promise made to a mentor'],
    type: 'major',
  },
  {
    date: 'Aug 9, 2026',
    name: 'Nag Panchami',
    hindi: 'नाग पंचमी',
    planet: 'Rahu + Ketu',
    significance: 'The festival of serpent deities (Nag Devata), symbolising the Rahu-Ketu karmic axis. Propitiating the Nag Devata on this day removes Kaal Sarp Dosha and past-life serpent curses from the horoscope.',
    dos: ['Offer milk to snake idols or anthills', 'Perform Rahu-Ketu shanti puja', 'Fast and pray for family protection', 'Chant "Om Namah Shivaya" 108 times', 'Feed Brahmins'],
    donts: ['Never harm a snake today (or any day)', 'Avoid ploughing soil or digging', 'Do not fry food in oil (avoid fire rituals)', 'Avoid conflict with brothers and sisters'],
    type: 'special',
  },
  {
    date: 'Aug 28, 2026',
    name: 'Janmashtami',
    hindi: 'जन्माष्टमी',
    planet: 'Moon (8th Tithi)',
    significance: 'The birth of Lord Sri Krishna — the complete avatar of Vishnu. The Ashtami of Krishna Paksha in Bhadrapada month. Midnight celebration of divine love, wisdom, and cosmic protection.',
    dos: ['Fast until midnight and break it after Krishna\'s birth', 'Sing bhajans and recite Bhagavad Gita', 'Decorate the cradle (Jhula) of Bal Krishna', 'Feed 8 children (representing the 8 Ashtami)', 'Prepare panchamrit and offer to the deity'],
    donts: ['Avoid non-vegetarian food', 'Do not consume alcohol', 'Avoid sleeping before midnight puja', 'Do not show greed or dishonesty today'],
    type: 'major',
  },
  {
    date: 'Sep 17, 2026',
    name: 'Pitru Paksha Begins',
    hindi: 'पितृ पक्ष प्रारम्भ',
    planet: 'Saturn + Sun',
    significance: '15-day period for ancestral propitiation (Shraddha). Saturn governs karma and ancestry. Performing tarpan during this period resolves ancestral debts that block wealth, marriage, and progeny in your chart.',
    dos: ['Perform daily tarpan for ancestors', 'Donate food, clothing, and money in their name', 'Cook their favourite foods as offering', 'Visit sacred rivers for ritual bathing', 'Chant Pitru Stotram'],
    donts: ['Avoid auspicious ceremonies (weddings, griha pravesh)', 'Do not purchase new clothes or jewellery', 'Avoid celebrating birthdays during this period', 'Do not waste food'],
    type: 'special',
  },
  {
    date: 'Oct 2, 2026',
    name: 'Navratri (Sharad) Begins',
    hindi: 'शारदीय नवरात्रि',
    planet: 'Moon + Venus',
    significance: 'Nine nights of the Divine Mother (Durga, Lakshmi, Saraswati). The most powerful period for feminine energy, wealth manifestation, and spiritual awakening. The veil between worlds is thinnest during Navratri.',
    dos: ['Fast and observe purity', 'Perform Devi puja with red flowers', 'Recite Durga Saptashati (700 shlokas)', 'Light an Akhand Jyoti (unbroken flame)', 'Begin new positive habits (vratas)'],
    donts: ['Avoid non-veg, alcohol, and tamasic food', 'Do not cut hair during the 9 days', 'Avoid sexual activity if observing strict vrata', 'Do not speak ill of women — Shakti is everywhere'],
    type: 'major',
  },
  {
    date: 'Oct 21, 2026',
    name: 'Diwali — Lakshmi Puja',
    hindi: 'दीपावली — लक्ष्मी पूजा',
    planet: 'Venus + Jupiter',
    significance: 'The festival of light and the supreme night for Lakshmi Puja. The new moon of Kartika month — Venus and Jupiter aligned for maximum wealth manifestation. Every diya lit invites Lakshmi\'s permanent residence.',
    dos: ['Perform Lakshmi-Ganesha puja at midnight', 'Light oil diyas in every corner of the home', 'Open business ledgers (Chopda Puja)', 'Donate to the poor before puja', 'Buy gold, silver, or new utensils'],
    donts: ['Do not gamble beyond symbolic tradition', 'Avoid loud quarrels during puja time', 'Do not leave the house dark at night', 'Avoid debt on this day — repay instead'],
    type: 'major',
  },
  {
    date: 'Nov 5, 2026',
    name: 'Chhath Puja',
    hindi: 'छठ पूजा',
    planet: 'Sun (Surya)',
    significance: 'The ancient solar festival of Bihar — the only Vedic puja performed to the setting and rising sun. Surya\'s direct blessing for health, vitality, and divine light. One of the most austere and powerful Vedic observances.',
    dos: ['Offer arghya to setting sun (Sandhya Arghya)', 'Offer arghya to rising sun next morning', 'Fast for 36 hours (nirjala for the devout)', 'Prepare thekua and fresh fruit offerings', 'Bathe in river or natural water body'],
    donts: ['Avoid any impurity or negative speech', 'Do not use onion, garlic in prasad', 'Avoid synthetic clothing during the puja', 'Do not disrespect the sun at any time'],
    type: 'special',
  },
];

export default function UpcomingEventsPage() {
  return (
    <div className="min-h-screen bg-[#080B12]">
      <SiteNav />

      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-12">
            <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: GOLD_RGBA(0.6) }}>
              Vedic Festival Calendar 2026
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">
              Upcoming{' '}
              <span
                className="font-serif"
                style={{
                  background: `linear-gradient(135deg, #FFEF99 0%, ${GOLD} 50%, #A8820A 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Sacred Events
              </span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
              Vedic festival almanac with astrological significance, Do&apos;s &amp; Don&apos;ts for each occasion — curated by Rohiit Gupta, Chief Vedic Architect.
            </p>
          </div>

          <div className="space-y-5">
            {events.map((ev, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(11,16,26,0.85)',
                  border: `1px solid ${ev.type === 'major' ? GOLD_RGBA(0.2) : 'rgba(148,163,184,0.12)'}`,
                }}
              >
                <div
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{
                    borderBottom: `1px solid ${ev.type === 'major' ? GOLD_RGBA(0.12) : 'rgba(148,163,184,0.08)'}`,
                    background: ev.type === 'major' ? GOLD_RGBA(0.05) : 'rgba(148,163,184,0.03)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: ev.type === 'major' ? GOLD_RGBA(0.12) : 'rgba(148,163,184,0.08)',
                        border: `1px solid ${ev.type === 'major' ? GOLD_RGBA(0.3) : 'rgba(148,163,184,0.15)'}`,
                      }}
                    >
                      <Calendar className="w-4 h-4" style={{ color: ev.type === 'major' ? GOLD : '#94a3b8' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-serif font-bold text-white text-base">{ev.name}</h2>
                        <span className="text-sm text-slate-400">({ev.hindi})</span>
                        {ev.type === 'major' && (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: GOLD_RGBA(0.12), color: GOLD, border: `1px solid ${GOLD_RGBA(0.25)}` }}
                          >
                            Major
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Star className="w-3 h-3" style={{ color: GOLD_RGBA(0.5) }} />
                          {ev.date}
                        </span>
                        <span className="text-xs text-slate-600">· Planetary Ruler: {ev.planet}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-5">
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">{ev.significance}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      className="rounded-xl p-4"
                      style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">
                          Do&apos;s — क्या करें
                        </p>
                      </div>
                      <ul className="space-y-1.5">
                        {ev.dos.map((d, j) => (
                          <li key={j} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div
                      className="rounded-xl p-4"
                      style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-xs font-semibold text-red-300 uppercase tracking-wide">
                          Don&apos;ts — क्या न करें
                        </p>
                      </div>
                      <ul className="space-y-1.5">
                        {ev.donts.map((d, j) => (
                          <li key={j} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
              Festival dates computed using Parashara Vedic Panchang methodology for the Indian subcontinent (IST).
              Verified and curated by Rohiit Gupta, Chief Vedic Architect.
            </p>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
