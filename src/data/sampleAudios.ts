/**
 * Pre-configured audio presets for both Tamil ➔ Sinhala and Sinhala ➔ Tamil
 * so the user can test both directions instantly or upload their own MP3.
 */

export interface SampleAudio {
  id: string;
  titleSi: string;
  titleEn: string;
  titleTa?: string;
  sourceText: string;
  sourceRomanized: string;
  expectedTarget: string;
  expectedTargetRomanized: string;
  category: 'greeting' | 'news' | 'story' | 'shop' | 'travel';
  durationDesc: string;
  // Legacy aliases for backward compatibility
  tamilText?: string;
  tamilRomanized?: string;
  expectedSinhala?: string;
  expectedSinhalaSinglish?: string;
}

// Tamil ➔ Sinhala Presets
export const SAMPLE_AUDIOS_TA_TO_SI: SampleAudio[] = [
  {
    id: 'sample-ta-greeting',
    titleSi: 'සුහද පිළිගැනීම හා සුවදුක් විමසීම',
    titleEn: 'Friendly Greeting & Well Wishes',
    titleTa: 'நட்பான வாழ்த்துக்கள்',
    sourceText: 'வணக்கம் நண்பா! நீங்கள் எப்படி இருக்கிறீர்கள்? உங்கள் குடும்பத்தினர் அனைவரும் நலமா? இன்று உங்களுக்கு ஒரு அருமையான நாளாக அமையட்டும்.',
    sourceRomanized: 'Vanakkam nanba! Neengal eppadi irukkireergal? Ungal kudumbathinar anaivarum nalamaa? Indru ungalukku oru arumaiyaana naalaaga amaiyattum.',
    expectedTarget: 'ආයුබෝවන් යාලුවා! ඔයාට කොහොමද? ඔයාගේ පවුලේ හැමෝම සනීපෙන් ඉන්නවද? අද දවස ඔයාට ඉතාම සුබ සහ ලස්සන දවසක් වේවා.',
    expectedTargetRomanized: 'Ayubowan yaaluwa! Oyaata kohomada? Oyaage pawle haemoma saneepen innawada? Ada dawasa oyaata ithama suba saha lassana dawasak wewa.',
    tamilText: 'வணக்கம் நண்பா! நீங்கள் எப்படி இருக்கிறீர்கள்? உங்கள் குடும்பத்தினர் அனைவரும் நலமா? இன்று உங்களுக்கு ஒரு அருமையான நாளாக அமையட்டும்.',
    tamilRomanized: 'Vanakkam nanba! Neengal eppadi irukkireergal? Ungal kudumbathinar anaivarum nalamaa? Indru ungalukku oru arumaiyaana naalaaga amaiyattum.',
    expectedSinhala: 'ආයුබෝවන් යාලුවා! ඔයාට කොහොමද? ඔයාගේ පවුලේ හැමෝම සනීපෙන් ඉන්නවද? අද දවස ඔයාට ඉතාම සුබ සහ ලස්සන දවසක් වේවා.',
    expectedSinhalaSinglish: 'Ayubowan yaaluwa! Oyaata kohomada? Oyaage pawle haemoma saneepen innawada? Ada dawasa oyaata ithama suba saha lassana dawasak wewa.',
    category: 'greeting',
    durationDesc: '12 තත්පර (12s)',
  },
  {
    id: 'sample-ta-news',
    titleSi: 'කාලගුණ හා දෛනික පුවත් නිවේදනය',
    titleEn: 'Weather & Daily News Update',
    titleTa: 'வானிலை மற்றும் அன்றாட செய்தி',
    sourceText: 'இன்றைய விசேட செய்தி: கொழும்பு மற்றும் அதனை அண்டிய பகுதிகளில் இன்று மாலை வேளையில் பலத்த மழை பெய்யக்கூடும் என வானிலை அவதான நிலையம் அறிவித்துள்ளது. பொதுமக்கள் அவதானமாக இருக்குமாறு கேட்டுக்கொள்ளப்படுகிறார்கள்.',
    sourceRomanized: 'Indraya viseda seithi: Kozhumbu mattrum adhanai andiya pagudhigalil indru maalai velaiyil palatha mazhai peyyakkoodum ena vaanilaimandalam arivithulladhu. Podhumakkal avadhaanamaaga irukkumaaru kettukkolla padugiraargal.',
    expectedTarget: 'අද විශේෂ පුවත්: කොළඹ සහ ඒ අවට ප්‍රදේශවලට අද සවස් කාලයේදී තද වැසි ඇතිවිය හැකි බව කාලගුණ විද්‍යා දෙපාර්තමේන්තුව දැනුම් දී තිබේ. මහජනතාව විමසිලිමත්ව සිටින ලෙස ඉල්ලා සිටී.',
    expectedTargetRomanized: 'Ada vishesha puwath: Kolamba saha e awata pradeshavalata ada sawas kaalayedi thada wesi aethiviya haeki bawa kaalaguna vidya depaarthamenthuwa daenum dee thibe. Mahajanathawa vimasilimathwa sitina lesa illaa sitee.',
    tamilText: 'இன்றைய விசேட செய்தி: கொழும்பு மற்றும் அதனை அண்டிய பகுதிகளில் இன்று மாலை வேளையில் பலத்த மழை பெய்யக்கூடும் என வானிலை அவதான நிலையம் அறிவித்துள்ளது. பொதுமக்கள் அவதானமாக இருக்குமாறு கேட்டுக்கொள்ளப்படுகிறார்கள்.',
    tamilRomanized: 'Indraya viseda seithi: Kozhumbu mattrum adhanai andiya pagudhigalil indru maalai velaiyil palatha mazhai peyyakkoodum ena vaanilaimandalam arivithulladhu. Podhumakkal avadhaanamaaga irukkumaaru kettukkolla padugiraargal.',
    expectedSinhala: 'අද විශේෂ පුවත්: කොළඹ සහ ඒ අවට ප්‍රදේශවලට අද සවස් කාලයේදී තද වැසි ඇතිවිය හැකි බව කාලගුණ විද්‍යා දෙපාර්තමේන්තුව දැනුම් දී තිබේ. මහජනතාව විමසිලිමත්ව සිටින ලෙස ඉල්ලා සිටී.',
    expectedSinhalaSinglish: 'Ada vishesha puwath: Kolamba saha e awata pradeshavalata ada sawas kaalayedi thada wesi aethiviya haeki bawa kaalaguna vidya depaarthamenthuwa daenum dee thibe. Mahajanathawa vimasilimathwa sitina lesa illaa sitee.',
    category: 'news',
    durationDesc: '18 තත්පර (18s)',
  },
  {
    id: 'sample-ta-story',
    titleSi: 'ජීවිත ආදර්ශය හා උත්සාහය',
    titleEn: 'Inspirational Life Quote',
    titleTa: 'வாழ்க்கை தத்துவம் மற்றும் முயற்சி',
    sourceText: 'வாழ்க்கையில் வெற்றி பெற கடின உழைப்பும் தன்னம்பிக்கையும் மிக முக்கியம். நீங்கள் செய்யும் வேலையை அன்புடன் செய்யுங்கள், அப்போது வெற்றி நிச்சயம் உங்கள் பக்கம் வரும்.',
    sourceRomanized: 'Vaazhkkaiyil vetri pera kadina uzhaippum thannambikkaiyum miga mukkiyam. Neengal seyyum vaelaiyai anbudan seiyungal, appodhu vetri nichayam ungal pakkam varum.',
    expectedTarget: 'ජීවිතයේ සාර්ථකත්වය ළඟා කර ගැනීමට දැඩි මහන්සිය සහ ආත්ම විශ්වාසය ඉතා වැදගත් වේ. ඔබ කරන කාර්යයට ආදරය කරන්න, එවිට සාර්ථකත්වය අනිවාර්යයෙන්ම ඔබට හිමිවනු ඇත.',
    expectedTargetRomanized: 'Jeevithaye saarthakathwaya langa kara ganeemata daedi mahansiya saha aathma vishwasaya itha wadagath we. Oba karana kaaryayata aadaraya karanna, ewita saarthakathwaya aniwaaryenma obata himiwanu aetha.',
    tamilText: 'வாழ்க்கையில் வெற்றி பெற கடின உழைப்பும் தன்னம்பிக்கையும் மிக முக்கியம். நீங்கள் செய்யும் வேலையை அன்புடன் செய்யுங்கள், அப்போது வெற்றி நிச்சயம் உங்கள் பக்கம் வரும்.',
    tamilRomanized: 'Vaazhkkaiyil vetri pera kadina uzhaippum thannambikkaiyum miga mukkiyam. Neengal seyyum vaelaiyai anbudan seiyungal, appodhu vetri nichayam ungal pakkam varum.',
    expectedSinhala: 'ජීවිතයේ සාර්ථකත්වය ළඟා කර ගැනීමට දැඩි මහන්සිය සහ ආත්ම විශ්වාසය ඉතා වැදගත් වේ. ඔබ කරන කාර්යයට ආදරය කරන්න, එවිට සාර්ථකත්වය අනිවාර්යයෙන්ම ඔබට හිමිවනු ඇත.',
    expectedSinhalaSinglish: 'Jeevithaye saarthakathwaya langa kara ganeemata daedi mahansiya saha aathma vishwasaya itha wadagath we. Oba karana kaaryayata aadaraya karanna, ewita saarthakathwaya aniwaaryenma obata himiwanu aetha.',
    category: 'story',
    durationDesc: '15 තත්පර (15s)',
  },
];

// Sinhala ➔ Tamil Presets
export const SAMPLE_AUDIOS_SI_TO_TA: SampleAudio[] = [
  {
    id: 'sample-si-greeting',
    titleSi: 'සුහද හමුවීම හා සුභ පැතුම්',
    titleEn: 'Friendly Sinhala Greeting & Best Wishes',
    titleTa: 'நட்பான சிங்கள வாழ்த்துக்கள்',
    sourceText: 'ආයුබෝවන් යාලුවා! ඔයාට කොහොමද? අද දවස ඔයාට සාර්ථක, සතුටුදායක ලස්සන දවසක් වේවා කියලා මම ප්‍රාර්ථනා කරනවා.',
    sourceRomanized: 'Ayubowan yaaluwa! Oyaata kohomada? Ada dawasa oyaata saarthaka, sathudayaka lassana dawasak wewa kiyala mama praarthana karanawa.',
    expectedTarget: 'வணக்கம் நண்பா! நீங்கள் எப்படி இருக்கிறீர்கள்? இன்றைய நாள் உங்களுக்கு ஒரு வெற்றிகரமான, மகிழ்ச்சியான மற்றும் அழகான நாளாக அமைய வாழ்த்துகிறேன்.',
    expectedTargetRomanized: 'Vanakkam nanba! Neengal eppadi irukkireergal? Indraya naal ungalukku oru vetrigaramaana, magizhchiyaana mattrum azhagana naalaaga amaiya vaazhthukiren.',
    category: 'greeting',
    durationDesc: '11 තත්පර (11s)',
  },
  {
    id: 'sample-si-train',
    titleSi: 'දුම්රිය ගමන් නිවේදනය',
    titleEn: 'Railway Travel Announcement',
    titleTa: 'ரயில் பயண அறிவிப்பு',
    sourceText: 'විශේෂ නිවේදනයයි: කොළඹ කොටුව සිට මහනුවර සහ බදුල්ල බලා ධාවනය වන සීඝ්‍රගාමී දුම්රිය තවත් සුළු මොහොතකින් දෙවන වේදිකාවට ළඟා වනු ඇත.',
    sourceRomanized: 'Vishesha nivedanayayi: Kolamba kotuwa sita Mahanuwara saha Badulla balaa dhaawanaya wana seeghragaamee dumriya thwath sulu mohothakin dewani vedikaawata langaa wanu aetha.',
    expectedTarget: 'விசேட அறிவித்தல்: கொழும்பு கோட்டையிலிருந்து கண்டி மற்றும் பதுளை நோக்கி செல்லும் அதிவிரைவு ரயில் இன்னும் சில நிமிடங்களில் இரண்டாவது நடைமேடைக்கு வந்து சேரும்.',
    expectedTargetRomanized: 'Viseda arivithal: Kozhumbu Kottaiyilirundhu Kandy mattrum Badulla nokki sellum adhiviraivu rail innum sila nimidangalil irandavadhu nadaimaidaikku vandhu serum.',
    category: 'travel',
    durationDesc: '14 තත්පර (14s)',
  },
  {
    id: 'sample-si-tourism',
    titleSi: 'ශ්‍රී ලංකා සංචාරක පිළිගැනීම',
    titleEn: 'Sri Lanka Tourism Welcome',
    titleTa: 'இலங்கை சுற்றுலா வரவேற்பு',
    sourceText: 'අපගේ සුන්දර ශ්‍රී ලංකාවට පැමිණි ඔබ සැම ඉතා ආදරයෙන් සාදරයෙන් පිළිගනිමු! මෙහි ඇති ඓතිහාසික උරුමයන් සහ රමණීය වෙරළ තීරයන් නරඹා විනෝද වන්න.',
    sourceRomanized: 'Apage sundara Sri Lankaawata paemini oba saema itha aadarayen saadarayen piliganimu! Mehi aethi aithihaasika urumayan saha ramaneeya werala theerayan narambaa vinoda wanna.',
    expectedTarget: 'எங்கள் அழகான இலங்கைக்கு வருகை தந்த உங்கள் அனைவரையும் அன்புடன் வரவேற்கிறோம்! இங்குள்ள வரலாற்று பாரம்பரியங்களையும் அழகிய கடற்கரைகளையும் கண்டு மகிழுங்கள்.',
    expectedTargetRomanized: 'Engal azhagana Ilangaikku varugai thandha ungal anaivaraiyum anbudan varavaerkrom! Ingulla varalaatru paaranpariyangalaiyum azhagiya kadarkaraiyaiyum kandu magizhungal.',
    category: 'story',
    durationDesc: '16 තත්පර (16s)',
  },
];

export const SAMPLE_AUDIOS = SAMPLE_AUDIOS_TA_TO_SI;
