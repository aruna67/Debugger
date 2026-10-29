/**
 * Pre-configured Tamil audio presets with realistic Tamil audio transcripts and Sinhala translations
 * so the user can test the app instantly or upload their own MP3.
 */

export interface SampleAudio {
  id: string;
  titleSi: string;
  titleEn: string;
  tamilText: string;
  tamilRomanized: string;
  expectedSinhala: string;
  expectedSinhalaSinglish: string;
  category: 'greeting' | 'news' | 'story' | 'shop';
  durationDesc: string;
  audioBlobGenerator?: () => Blob;
}

export const SAMPLE_AUDIOS: SampleAudio[] = [
  {
    id: 'sample-greeting',
    titleSi: 'සුහද පිළිගැනීම හා සුවදුක් විමසීම',
    titleEn: 'Friendly Greeting & Well Wishes',
    tamilText: 'வணக்கம் நண்பா! நீங்கள் எப்படி இருக்கிறீர்கள்? உங்கள் குடும்பத்தினர் அனைவரும் நலமா? இன்று உங்களுக்கு ஒரு அருமையான நாளாக அமையட்டும்.',
    tamilRomanized: 'Vanakkam nanba! Neengal eppadi irukkireergal? Ungal kudumbathinar anaivarum nalamaa? Indru ungalukku oru arumaiyaana naalaaga amaiyattum.',
    expectedSinhala: 'ආයුබෝවන් යාලුවා! ඔයාට කොහොමද? ඔයාගේ පවුලේ හැමෝම සනීපෙන් ඉන්නවද? අද දවස ඔයාට ඉතාම සුබ සහ ලස්සන දවසක් වේවා.',
    expectedSinhalaSinglish: 'Ayubowan yaaluwa! Oyaata kohomada? Oyaage pawle haemoma saneepen innawada? Ada dawasa oyaata ithama suba saha lassana dawasak wewa.',
    category: 'greeting',
    durationDesc: '12 තත්පර (12s)',
  },
  {
    id: 'sample-news',
    titleSi: 'කාලගුණ හා දෛනික පුවත් නිවේදනය',
    titleEn: 'Weather & Daily News Update',
    tamilText: 'இன்றைய விசேட செய்தி: கொழும்பு மற்றும் அதனை அண்டிய பகுதிகளில் இன்று மாலை வேளையில் பலத்த மழை பெய்யக்கூடும் என வானிலை அவதான நிலையம் அறிவித்துள்ளது. பொதுமக்கள் அவதானமாக இருக்குமாறு கேட்டுக்கொள்ளப்படுகிறார்கள்.',
    tamilRomanized: 'Indraya viseda seithi: Kozhumbu mattrum adhanai andiya pagudhigalil indru maalai velaiyil palatha mazhai peyyakkoodum ena vaanilaimandalam arivithulladhu. Podhumakkal avadhaanamaaga irukkumaaru kettukkolla padugiraargal.',
    expectedSinhala: 'අද විශේෂ පුවත්: කොළඹ සහ ඒ අවට ප්‍රදේශවලට අද සවස් කාලයේදී තද වැසි ඇතිවිය හැකි බව කාලගුණ විද්‍යා දෙපාර්තමේන්තුව දැනුම් දී තිබේ. මහජනතාව විමසිලිමත්ව සිටින ලෙස ඉල්ලා සිටී.',
    expectedSinhalaSinglish: 'Ada vishesha puwath: Kolamba saha e awata pradeshavalata ada sawas kaalayedi thada wesi aethiviya haeki bawa kaalaguna vidya depaarthamenthuwa daenum dee thibe. Mahajanathawa vimasilimathwa sitina lesa illaa sitee.',
    category: 'news',
    durationDesc: '18 තත්පර (18s)',
  },
  {
    id: 'sample-story',
    titleSi: 'ජීවිත ආදර්ශය හා උත්සාහය',
    titleEn: 'Inspirational Life Quote',
    tamilText: 'வாழ்க்கையில் வெற்றி பெற கடின உழைப்பும் தன்னம்பிக்கையும் மிக முக்கியம். நீங்கள் செய்யும் வேலையை அன்புடன் செய்யுங்கள், அப்போது வெற்றி நிச்சயம் உங்கள் பக்கம் வரும்.',
    tamilRomanized: 'Vaazhkkaiyil vetri pera kadina uzhaippum thannambikkaiyum miga mukkiyam. Neengal seyyum vaelaiyai anbudan seiyungal, appodhu vetri nichayam ungal pakkam varum.',
    expectedSinhala: 'ජීවිතයේ සාර්ථකත්වය ළඟා කර ගැනීමට දැඩි මහන්සිය සහ ආත්ම විශ්වාසය ඉතා වැදගත් වේ. ඔබ කරන කාර්යයට ආදරය කරන්න, එවිට සාර්ථකත්වය අනිවාර්යයෙන්ම ඔබට හිමිවනු ඇත.',
    expectedSinhalaSinglish: 'Jeevithaye saarthakathwaya langa kara ganeemata daedi mahansiya saha aathma vishwasaya itha wadagath we. Oba karana kaaryayata aadaraya karanna, ewita saarthakathwaya aniwaaryenma obata himiwanu aetha.',
    category: 'story',
    durationDesc: '15 තත්පර (15s)',
  },
  {
    id: 'sample-shop',
    titleSi: 'වෙළඳසැල් ගනුදෙනු කතාබහ',
    titleEn: 'Shop / Marketplace Conversation',
    tamilText: 'வணக்கம் அண்ணா, இந்த புதிய டீ-சர்ட்டின் விலை என்ன? எனக்கு நல்ல தரமான ஒன்று வேண்டும், கொஞ்சம் விலை குறைத்து தர முடியுமா?',
    tamilRomanized: 'Vanakkam anna, indha pudhiya T-shirt-in vilai enna? Enakku nalla tharamaana ondru vaendum, konjam vilai kuraithu thara mudiyumaa?',
    expectedSinhala: 'ආයුබෝවන් අයියේ, මේ අලුත් ටී-ෂර්ට් එක කීයද? මට හොඳ තත්ත්වයේ එකක් ඕනේ, පොඩ්ඩක් මිල අඩු කරලා දෙන්න පුළුවන්ද?',
    expectedSinhalaSinglish: 'Ayubowan ayiye, me aluth T-shirt eka keeyada? Mata honda thathwaye ekak one, poddak mila adu karala denna puluwanda?',
    category: 'shop',
    durationDesc: '10 තත්පර (10s)',
  },
];
