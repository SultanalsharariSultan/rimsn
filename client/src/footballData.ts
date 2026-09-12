export type Player = {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  position: string;
  number: number;
  club: string;
  color: string;
  image: string;
  verified?: boolean;
  stats: { goals: string; assists: string; trophies: string; followers: string };
  medals: string[];
};

const avatar = (name: string) => `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0b1725,132d41&fontFamily=Arial&fontWeight=700&fontSize=42`;

export const players: Player[] = [
  { id: "ronaldo", name: "كريستيانو رونالدو", nameEn: "Cristiano Ronaldo", country: "البرتغال", position: "مهاجم", number: 7, club: "النصر", color: "#e9b949", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Cristiano%20Ronaldo%2020120609.jpg?width=700", verified: true, stats: { goals: "891", assists: "283", trophies: "35", followers: "636M" }, medals: ["كرة ذهبية ×5", "دوري الأبطال ×5", "يورو 2016"] },
  { id: "messi", name: "ليونيل ميسي", nameEn: "Lionel Messi", country: "الأرجنتين", position: "مهاجم", number: 10, club: "إنتر ميامي", color: "#64b5d8", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Lionel%20Messi%2020180626.jpg?width=700", verified: true, stats: { goals: "838", assists: "372", trophies: "45", followers: "505M" }, medals: ["كرة ذهبية ×8", "كأس العالم 2022", "كوبا أمريكا"] },
  { id: "mbappe", name: "كيليان مبابي", nameEn: "Kylian Mbappé", country: "فرنسا", position: "مهاجم", number: 9, club: "ريال مدريد", color: "#78a8ff", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Picture%20with%20Mbapp%C3%A9%20%28cropped%20and%20rotated%29.jpg?width=700", verified: true, stats: { goals: "331", assists: "157", trophies: "19", followers: "120M" }, medals: ["كأس العالم 2018", "الحذاء الذهبي 2022", "الدوري الفرنسي"] },
  { id: "neymar", name: "نيمار جونيور", nameEn: "Neymar Jr", country: "البرازيل", position: "جناح", number: 10, club: "الهلال", color: "#42d1a8", image: avatar("Neymar Jr"), stats: { goals: "439", assists: "256", trophies: "31", followers: "220M" }, medals: ["كأس القارات", "أبطال أمريكا الجنوبية", "الدوري الفرنسي"] },
  { id: "salah", name: "محمد صلاح", nameEn: "Mohamed Salah", country: "مصر", position: "جناح", number: 11, club: "ليفربول", color: "#df5364", image: avatar("Mohamed Salah"), verified: true, stats: { goals: "356", assists: "173", trophies: "11", followers: "64M" }, medals: ["دوري الأبطال", "الدوري الإنجليزي", "الحذاء الذهبي ×3"] },
  { id: "haaland", name: "إيرلينغ هالاند", nameEn: "Erling Haaland", country: "النرويج", position: "مهاجم", number: 9, club: "مانشستر سيتي", color: "#a98cff", image: avatar("Erling Haaland"), stats: { goals: "276", assists: "62", trophies: "8", followers: "38M" }, medals: ["دوري الأبطال", "الثلاثية التاريخية", "الحذاء الذهبي"] },
  { id: "vinicius", name: "فينيسيوس جونيور", nameEn: "Vinícius Júnior", country: "البرازيل", position: "جناح", number: 7, club: "ريال مدريد", color: "#ef7865", image: avatar("Vinicius Junior"), stats: { goals: "105", assists: "80", trophies: "13", followers: "52M" }, medals: ["دوري الأبطال ×2", "أفضل لاعب شاب", "الليغا"] },
  { id: "bellingham", name: "جود بيلينغهام", nameEn: "Jude Bellingham", country: "إنجلترا", position: "وسط", number: 5, club: "ريال مدريد", color: "#d7a15a", image: avatar("Jude Bellingham"), stats: { goals: "75", assists: "36", trophies: "7", followers: "38M" }, medals: ["الليغا", "كأس السوبر", "أفضل لاعب شاب"] },
  { id: "debruyne", name: "كيفن دي بروين", nameEn: "Kevin De Bruyne", country: "بلجيكا", position: "وسط", number: 17, club: "مانشستر سيتي", color: "#65c8cf", image: avatar("Kevin De Bruyne"), stats: { goals: "153", assists: "249", trophies: "19", followers: "26M" }, medals: ["دوري الأبطال", "الدوري الإنجليزي ×6", "أفضل صانع ألعاب"] },
  { id: "modric", name: "لوكا مودريتش", nameEn: "Luka Modrić", country: "كرواتيا", position: "وسط", number: 10, club: "ريال مدريد", color: "#e5c862", image: avatar("Luka Modric"), stats: { goals: "112", assists: "148", trophies: "36", followers: "29M" }, medals: ["كرة ذهبية", "دوري الأبطال ×6", "وصيف كأس العالم"] },
  { id: "benzema", name: "كريم بنزيما", nameEn: "Karim Benzema", country: "فرنسا", position: "مهاجم", number: 9, club: "الاتحاد", color: "#e78d55", image: avatar("Karim Benzema"), stats: { goals: "479", assists: "202", trophies: "35", followers: "76M" }, medals: ["كرة ذهبية", "دوري الأبطال ×5", "الدوري الإسباني"] },
  { id: "alowairan", name: "سالم الدوسري", nameEn: "Salem Al-Dawsari", country: "السعودية", position: "جناح", number: 29, club: "الهلال", color: "#55c68a", image: avatar("Salem Al Dawsari"), verified: true, stats: { goals: "118", assists: "71", trophies: "16", followers: "3.2M" }, medals: ["كأس آسيا", "دوري أبطال آسيا", "الدوري السعودي"] },
];

export const samplePosts: Record<string, string[]> = {
  ronaldo: ["العمل، الإيمان، والاستمرارية. لا شيء يأتي من دون تضحيات.", "فخور بكل لحظة أرتدي فيها قميص بلادي. القادم أجمل.", "شكراً لجماهير النصر على الطاقة التي تمنحونها لنا كل يوم."],
  messi: ["كل بطولة تبدأ بحلم صغير وإيمان كبير بالفريق.", "الأرجنتين دائماً في القلب. شكراً لكل من يساندنا."],
  salah: ["الحمد لله على كل خطوة. نواصل العمل من أجل القادم.", "جمهور ليفربول، أنتم تعرفون معنى أن نكون معاً."]
};
