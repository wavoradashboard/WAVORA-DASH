export interface MusicFact {
  id: string;
  category: 'Physics & Science' | 'History & Legends' | 'Cosmic & Space' | 'Studio Secrets' | 'Human Brain' | 'Records & Vinyl';
  emoji: string;
  tagline: string;
  title: string;
  fact: string;
  mindBlowLevel: number; // 1 to 5
  color: string;
}

export const MUSIC_FACTS: MusicFact[] = [
  {
    id: 'fact-1',
    category: 'Human Brain',
    emoji: '🫀',
    tagline: 'Cardiovascular Synchronization',
    title: 'Your Heartbeat Literally Syncs with the Music You Hear',
    fact: 'Cardiologists and neuroscientists discovered that your blood pressure, heart rate, and respiration rate unconsciously speed up or slow down to mimic the tempo and crescendo of whatever song you are listening to!',
    mindBlowLevel: 5,
    color: 'from-rose-500 via-pink-600 to-red-500'
  },
  {
    id: 'fact-2',
    category: 'Cosmic & Space',
    emoji: '🌌',
    tagline: 'Deep Universe Acoustics',
    title: 'Black Holes Sing in B-Flat, 57 Octaves Below Middle C',
    fact: 'NASA’s Chandra X-ray Observatory detected acoustic sound waves rippling through the Perseus galaxy cluster, emitted by a supermassive black hole. The note is a B-flat that vibrates once every 10 million years—far below the threshold of human hearing!',
    mindBlowLevel: 5,
    color: 'from-purple-600 via-indigo-600 to-blue-700'
  },
  {
    id: 'fact-3',
    category: 'Studio Secrets',
    emoji: '🛢️',
    tagline: 'Accidental Tech Revolutions',
    title: 'Auto-Tune Was Invented by an Exxon Oil Geophysicist',
    fact: 'Dr. Andy Hildebrand originally developed algorithms using autocorrelation to map underground oil reservoirs using seismic acoustic soundwaves. When a colleague joked that she needed help singing in key, he realized the exact same seismic math could snap vocal pitch into tune!',
    mindBlowLevel: 5,
    color: 'from-amber-500 via-orange-600 to-yellow-500'
  },
  {
    id: 'fact-4',
    category: 'History & Legends',
    emoji: '🎹',
    tagline: 'The Ultimate Resonant Defiance',
    title: 'Deaf Beethoven Composed with a Wooden Rod in His Teeth',
    fact: 'When Ludwig van Beethoven lost his hearing, he clamped one end of a wooden rod between his teeth and pressed the other end against the soundboard of his piano. The sound vibrations traveled through his jawbone directly into his inner ear via bone conduction!',
    mindBlowLevel: 5,
    color: 'from-amber-600 via-amber-700 to-stone-800'
  },
  {
    id: 'fact-5',
    category: 'Studio Secrets',
    emoji: '🥁',
    tagline: 'The 6-Second History Changer',
    title: 'The "Amen Break" Powers Thousands of Modern Hits',
    fact: 'A 6-second drum solo played by Gregory Sylvester Coleman in 1969 on The Winstons’ song "Amen, Brother" became the foundation for Drum & Bass, Jungle, Hip-Hop, and breakbeat music—sampled in over 6,000 commercially released tracks!',
    mindBlowLevel: 4,
    color: 'from-emerald-500 via-teal-600 to-cyan-600'
  },
  {
    id: 'fact-6',
    category: 'Records & Vinyl',
    emoji: '💿',
    tagline: 'Classical Format Mandates',
    title: 'CDs Were Engineered to 74 Minutes Specifically for Beethoven',
    fact: 'Sony Vice President Norio Ohga and conductor Herbert von Karajan insisted that a compact disc must be able to hold Beethoven’s 9th Symphony without changing discs. The longest known recording was Wilhelm Furtwängler’s 1951 performance at 74 minutes, setting the worldwide CD standard!',
    mindBlowLevel: 4,
    color: 'from-cyan-500 via-blue-600 to-indigo-600'
  },
  {
    id: 'fact-7',
    category: 'Human Brain',
    emoji: '⚡',
    tagline: 'Neuro-Musical Phenomenon',
    title: 'Getting "Chills" from Music is a Dopamine Super-Release',
    fact: 'Only about 50% of the global population experiences frisson (musical chills or goosebumps). Brain scans show it activates the exact same evolutionary reward and dopamine pathways as eating delicious food or falling in love!',
    mindBlowLevel: 5,
    color: 'from-fuchsia-500 via-purple-600 to-pink-500'
  },
  {
    id: 'fact-8',
    category: 'History & Legends',
    emoji: '🎸',
    tagline: 'Virtuoso Superhuman Feat',
    title: 'Prince Played 27 Instruments on His Debut Album at Age 19',
    fact: 'On his 1978 debut album "For You", 19-year-old Prince played all 27 instruments listed in the liner notes, including grand piano, electric bass, Clavinet, synthesized brass, bongos, congas, fuzz bass, and water-drop acoustics, while producing and arranging the entire master!',
    mindBlowLevel: 5,
    color: 'from-violet-600 via-purple-700 to-fuchsia-600'
  },
  {
    id: 'fact-9',
    category: 'Physics & Science',
    emoji: '🌿',
    tagline: 'Botanical Frequency Resonance',
    title: 'Plants Grow Significantly Faster Listening to Jazz & Classical',
    fact: 'Extensive agricultural acoustic studies show that continuous sound vibrations between 115Hz and 250Hz stimulate cellular protoplasm in plants, speeding up metabolism, nutrient intake, and accelerating growth by up to 20% compared to silent environments!',
    mindBlowLevel: 4,
    color: 'from-emerald-600 via-green-600 to-lime-500'
  },
  {
    id: 'fact-10',
    category: 'Cosmic & Space',
    emoji: '🛰️',
    tagline: 'Interstellar Mixtape',
    title: 'Voyager 1 is Carrying Chuck Berry and Bach Past Our Solar System',
    fact: 'NASA’s Voyager 1 & 2 spacecraft carry gold-plated copper phonograph records containing 90 minutes of music from Earth—including Chuck Berry’s "Johnny B. Goode", traditional pygmy songs, and Beethoven. It is now over 15 billion miles away in interstellar space!',
    mindBlowLevel: 5,
    color: 'from-amber-400 via-orange-500 to-indigo-900'
  },
  {
    id: 'fact-11',
    category: 'Physics & Science',
    emoji: '👻',
    tagline: 'The Ghost Frequency',
    title: 'The 18.9 Hz Infrasound Frequency Triggers Hallucinations and Fear',
    fact: 'Sound vibrating at 18.98 Hz matches the resonant frequency of the human eyeball. It causes optical vibrations that can produce visual grey smudges in your peripheral vision, as well as inexplicable chills, panic, and hyperventilation—often creating "haunted house" illusions!',
    mindBlowLevel: 5,
    color: 'from-slate-700 via-purple-950 to-indigo-900'
  },
  {
    id: 'fact-12',
    category: 'Studio Secrets',
    emoji: '🎛️',
    tagline: 'From Flop to Foundation',
    title: 'The Roland TR-808 Was a Commercial Failure Before Defining Hip-Hop',
    fact: 'When Roland released the TR-808 drum machine in 1980, professional drummers laughed at its synthetic "boomy" bass and robotic claps. It was discontinued in 1983, allowing young hip-hop and techno producers in New York and Detroit to buy them cheap at pawn shops, sparking entire genres!',
    mindBlowLevel: 4,
    color: 'from-orange-500 via-red-600 to-yellow-500'
  },
  {
    id: 'fact-13',
    category: 'Records & Vinyl',
    emoji: '🏃',
    tagline: 'Continuous Groove Geometry',
    title: 'A Single Vinyl Record Side Contains Over 1,500 Feet of Groove',
    fact: 'If you were to uncoil the microscopic spiral audio groove cut into one side of a standard 12-inch 33⅓ RPM vinyl LP, it would stretch approximately 1,500 to 2,000 feet (about 500 meters)—nearly twice the height of the Eiffel Tower!',
    mindBlowLevel: 4,
    color: 'from-zinc-800 via-neutral-900 to-black'
  },
  {
    id: 'fact-14',
    category: 'History & Legends',
    emoji: '📜',
    tagline: 'The World’s Oldest Complete Melody',
    title: 'The Oldest Known Song in Human History is Over 3,400 Years Old',
    fact: 'Carved into clay cuneiform tablets in Ugarit (modern-day Syria) around 1400 BCE, the "Hurrian Hymn to Nikkal" is the oldest surviving complete musical composition with tuning instructions and notation for a 9-string lyre!',
    mindBlowLevel: 5,
    color: 'from-yellow-600 via-amber-700 to-orange-800'
  },
  {
    id: 'fact-15',
    category: 'Physics & Science',
    emoji: '🐬',
    tagline: 'Acoustic Oceanography',
    title: 'Fin Whales Sing with Such Low Power They Pierce 1,000 Miles of Ocean',
    fact: 'Whale vocalizations reach up to 188 decibels in low infrasonic frequencies. Before modern shipping engine noise, their songs could travel unobstructed across entire ocean basins for over 1,000 to 2,500 miles through deep sound SOFAR channels!',
    mindBlowLevel: 5,
    color: 'from-blue-600 via-cyan-600 to-teal-700'
  },
  {
    id: 'fact-16',
    category: 'Human Brain',
    emoji: '👂',
    tagline: 'Auditory Paradoxes',
    title: 'The "Shepard Tone" Illusion Sounds Like It Rises Infinitely Forever',
    fact: 'A Shepard Tone is an auditory illusion created by layering sine waves separated by octaves. As the pitch ascends, higher frequencies fade in while lower ones fade out, creating an endless, rising tension loop used in film scores like Dunkirk and The Dark Knight!',
    mindBlowLevel: 4,
    color: 'from-indigo-500 via-purple-600 to-rose-600'
  },
  {
    id: 'fact-17',
    category: 'Studio Secrets',
    emoji: '🎤',
    tagline: 'Record-Breaking Mic Sessions',
    title: 'Michael Jackson’s "Billie Jean" Was Mixed 91 Times in the Studio',
    fact: 'Legendary audio engineer Bruce Swedien mixed "Billie Jean" 91 times on analog boards trying to get the perfect kick drum and bass resonance. In the end, Michael Jackson and producer Quincy Jones chose Mix #2 for the final master on Thriller!',
    mindBlowLevel: 4,
    color: 'from-red-600 via-rose-700 to-amber-600'
  },
  {
    id: 'fact-18',
    category: 'History & Legends',
    emoji: '🎻',
    tagline: 'The Little Ice Age Theory',
    title: 'Stradivarius Violins Sound Magical Because of 17th Century Mini-Winter',
    fact: 'Antonio Stradivari built his master violins during the "Maunder Minimum" (1645-1715), a period of severe cold in Europe. The cold caused Alpine spruce trees to grow exceptionally dense, uniform wood rings, creating acoustic resonance impossible to replicate today!',
    mindBlowLevel: 5,
    color: 'from-amber-700 via-orange-800 to-yellow-900'
  },
  {
    id: 'fact-19',
    category: 'Physics & Science',
    emoji: '🔊',
    tagline: 'The Absolute Zero of Sound',
    title: 'The Quietest Room on Earth Will Make You Hear Your Own Organs',
    fact: 'The anechoic chamber at Orfield Laboratories in Minneapolis measures at -9.4 decibels. In complete silence, within 15 minutes you can clearly hear your own lungs breathing, blood surging through your veins, and your digestive enzymes digesting food!',
    mindBlowLevel: 5,
    color: 'from-slate-800 via-cyan-950 to-slate-900'
  },
  {
    id: 'fact-20',
    category: 'Human Brain',
    emoji: '🧠',
    tagline: 'The Involuntary Musical Imagery',
    title: 'Earworms Happen Because Your Brain Treats Songs Like Unfinished Puzzles',
    fact: 'When a song gets stuck in your head, cognitive scientists call it the "Zeigarnik Effect." Your brain loops a catchy melodic fragment because it is trying to remember and resolve the remaining harmonic progression!',
    mindBlowLevel: 4,
    color: 'from-pink-500 via-rose-500 to-yellow-500'
  },
  {
    id: 'fact-21',
    category: 'Cosmic & Space',
    emoji: '🪐',
    tagline: 'Planetary Radio Harmonics',
    title: 'Saturn Emits Complex Eerie Choirs of Radio Waves',
    fact: 'Cassini spacecraft audio converters recorded intense kilometric radio emissions from Saturn’s polar auroras. The sounds resemble eerie science fiction theremins and choir oscillations shifting between 100 kHz and 500 kHz!',
    mindBlowLevel: 4,
    color: 'from-violet-700 via-indigo-800 to-blue-900'
  },
  {
    id: 'fact-22',
    category: 'Studio Secrets',
    emoji: '🎚️',
    tagline: 'The Secret Distortion Trick',
    title: 'Guitar Distortion Was Born from Slashing a Speaker Cone with a Razor',
    fact: 'In 1961, Link Wray wanted a raw, dirtier guitar sound for his instrumental track "Rumble". He took a razor blade and punched holes in the cone of his amplifier speaker—inventing modern rock power chords and distorted fuzzy guitar!',
    mindBlowLevel: 5,
    color: 'from-red-600 via-amber-600 to-stone-900'
  },
  {
    id: 'fact-23',
    category: 'History & Legends',
    emoji: '🏆',
    tagline: 'Billboard Immortality',
    title: 'Dark Side of the Moon Stayed on the Billboard 200 for 950+ Weeks',
    fact: 'Pink Floyd’s 1973 masterpiece "The Dark Side of the Moon" remained continuously charted on the Billboard Top 200 for over 18 years (950+ weeks)—making it the longest charting studio album in human history!',
    mindBlowLevel: 4,
    color: 'from-indigo-600 via-purple-700 to-pink-600'
  },
  {
    id: 'fact-24',
    category: 'Human Brain',
    emoji: '👶',
    tagline: 'Pre-Natal Auditory Memory',
    title: 'Babies Recognize and Prefer Melodies Heard in the Womb',
    fact: 'Studies show that newborn infants retain memory of songs their mothers played regularly during the third trimester. When played those exact tracks after birth, their breathing calms and stress cortisol levels drop immediately!',
    mindBlowLevel: 4,
    color: 'from-teal-400 via-emerald-500 to-blue-500'
  },
  {
    id: 'fact-25',
    category: 'Records & Vinyl',
    emoji: '🪄',
    tagline: 'Microscopic Physics Magic',
    title: 'Vinyl Needles Generate Temperatures of 300°F (150°C) While Playing',
    fact: 'Because a diamond stylus exerts a pressure of over 20,000 pounds per square inch in the microscopic vinyl groove, friction causes instantaneous heat exceeding 300°F! The vinyl melts microscopically and re-hardens behind the needle in milliseconds!',
    mindBlowLevel: 5,
    color: 'from-orange-600 via-red-600 to-rose-700'
  }
];

export function getRandomMusicFact(excludeId?: string): MusicFact {
  const available = excludeId ? MUSIC_FACTS.filter(f => f.id !== excludeId) : MUSIC_FACTS;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex] || MUSIC_FACTS[0];
}
