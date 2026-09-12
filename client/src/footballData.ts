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

const corePlayers: Player[] = [
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

const makePlayer = (id: string, name: string, nameEn: string, country: string, position: string, number: number, club: string, color: string): Player => ({
  id, name, nameEn, country, position, number, club, color, image: avatar(nameEn), stats: { goals: "—", assists: "—", trophies: "—", followers: "—" }, medals: ["ملف لاعب قيد التوثيق"]
});

const extendedPlayers: Player[] = [
  makePlayer("alisson", "أليسون بيكر", "Alisson Becker", "البرازيل", "حارس", 1, "ليفربول", "#75b9d2"),
  makePlayer("courtois", "تيبو كورتوا", "Thibaut Courtois", "بلجيكا", "حارس", 1, "ريال مدريد", "#6e91d8"),
  makePlayer("terstegen", "مارك أندريه تير شتيغن", "Marc-Andre ter Stegen", "ألمانيا", "حارس", 1, "برشلونة", "#c374d8"),
  makePlayer("ramos", "سيرخيو راموس", "Sergio Ramos", "إسبانيا", "مدافع", 4, "مونتيري", "#d6aa62"),
  makePlayer("van-dijk", "فيرجيل فان دايك", "Virgil van Dijk", "هولندا", "مدافع", 4, "ليفربول", "#67c598"),
  makePlayer("ruben-dias", "روبن دياز", "Ruben Dias", "البرتغال", "مدافع", 3, "مانشستر سيتي", "#6ab9d4"),
  makePlayer("hakimi", "أشرف حكيمي", "Achraf Hakimi", "المغرب", "ظهير", 2, "باريس سان جيرمان", "#52c99a"),
  makePlayer("cancelo", "جواو كانسيلو", "Joao Cancelo", "البرتغال", "ظهير", 7, "الهلال", "#78a7ed"),
  makePlayer("alphonso", "ألفونسو ديفيز", "Alphonso Davies", "كندا", "ظهير", 19, "بايرن ميونخ", "#df7b62"),
  makePlayer("kroos", "توني كروس", "Toni Kroos", "ألمانيا", "وسط", 8, "ريال مدريد", "#d2b765"),
  makePlayer("pedri", "بيدري", "Pedri", "إسبانيا", "وسط", 8, "برشلونة", "#82b8ed"),
  makePlayer("gavi", "غافي", "Gavi", "إسبانيا", "وسط", 6, "برشلونة", "#dd6c7f"),
  makePlayer("odegaard", "مارتن أوديغارد", "Martin Odegaard", "النرويج", "وسط", 8, "أرسنال", "#e29f61"),
  makePlayer("bruno", "برونو فرنانديز", "Bruno Fernandes", "البرتغال", "وسط", 8, "مانشستر يونايتد", "#d67973"),
  makePlayer("rodri", "رودري", "Rodri", "إسبانيا", "وسط", 16, "مانشستر سيتي", "#72c4c8"),
  makePlayer("bernardo", "برناردو سيلفا", "Bernardo Silva", "البرتغال", "وسط", 20, "مانشستر سيتي", "#b789dc"),
  makePlayer("leao", "رافاييل لياو", "Rafael Leao", "البرتغال", "جناح", 10, "ميلان", "#de777c"),
  makePlayer("son", "سون هيونغ مين", "Son Heung-min", "كوريا الجنوبية", "جناح", 7, "توتنهام", "#78bfe2"),
  makePlayer("saka", "بوكايو ساكا", "Bukayo Saka", "إنجلترا", "جناح", 7, "أرسنال", "#e1b45d"),
  makePlayer("foden", "فيل فودين", "Phil Foden", "إنجلترا", "جناح", 47, "مانشستر سيتي", "#79d0c0"),
  makePlayer("griezmann", "أنطوان غريزمان", "Antoine Griezmann", "فرنسا", "مهاجم", 7, "أتلتيكو مدريد", "#9b8bd9"),
  makePlayer("kane", "هاري كين", "Harry Kane", "إنجلترا", "مهاجم", 9, "بايرن ميونخ", "#6ea5dc"),
  makePlayer("lewandowski", "روبرت ليفاندوفسكي", "Robert Lewandowski", "بولندا", "مهاجم", 9, "برشلونة", "#d88b63"),
  makePlayer("osimhen", "فيكتور أوسيمين", "Victor Osimhen", "نيجيريا", "مهاجم", 9, "غلطة سراي", "#72cbb2"),
  makePlayer("lautaro", "لاوتارو مارتينيز", "Lautaro Martinez", "الأرجنتين", "مهاجم", 10, "إنتر ميلان", "#70a9db"),
  makePlayer("kvaratskhelia", "خفيتشا كفاراتسخيليا", "Khvicha Kvaratskhelia", "جورجيا", "جناح", 77, "باريس سان جيرمان", "#d38adb"),
  makePlayer("dembélé", "عثمان ديمبيلي", "Ousmane Dembele", "فرنسا", "جناح", 10, "باريس سان جيرمان", "#d98d67"),
  makePlayer("mahrez", "رياض محرز", "Riyad Mahrez", "الجزائر", "جناح", 7, "الأهلي", "#6ccca8"),
  makePlayer("mane", "ساديو ماني", "Sadio Mane", "السنغال", "جناح", 10, "النصر", "#db7964"),
  makePlayer("hakim", "حكيم زياش", "Hakim Ziyech", "المغرب", "جناح", 7, "الوداد", "#6eaad8"),
  makePlayer("talisca", "أندرسون تاليسكا", "Anderson Talisca", "البرازيل", "مهاجم", 94, "النصر", "#bf8be0"),
  makePlayer("mitrovic", "ألكسندر ميتروفيتش", "Aleksandar Mitrovic", "صربيا", "مهاجم", 9, "الهلال", "#dcae61"),
  makePlayer("kanno", "محمد كنو", "Mohamed Kanno", "السعودية", "وسط", 28, "الهلال", "#62caa8"),
  makePlayer("almowallad", "فهد المولد", "Fahad Al-Muwallad", "السعودية", "جناح", 8, "الاتفاق", "#d98175"),
  makePlayer("toney", "إيفان توني", "Ivan Toney", "إنجلترا", "مهاجم", 17, "الأهلي", "#7bb9d9"),
  makePlayer("donnarumma", "جيانلويجي دوناروما", "Gianluigi Donnarumma", "إيطاليا", "حارس", 99, "باريس سان جيرمان", "#72c8c1"),
  makePlayer("bonmati", "أيتانا بونماتي", "Aitana Bonmati", "إسبانيا", "وسط", 14, "برشلونة للسيدات", "#e19963"),
  makePlayer("putellas", "أليكسيا بوتياس", "Alexia Putellas", "إسبانيا", "وسط", 11, "برشلونة للسيدات", "#9e8cdd"),
  makePlayer("sam-kerr", "سام كير", "Sam Kerr", "أستراليا", "مهاجم", 20, "تشيلسي للسيدات", "#70b6db"),
  makePlayer("marta", "مارتا فييرا", "Marta Vieira", "البرازيل", "مهاجم", 10, "أورلاندو برايد", "#d7ad5e"),
];

export const players: Player[] = [...corePlayers, ...extendedPlayers];

export const samplePosts: Record<string, string[]> = {
  ronaldo: ["العمل، الإيمان، والاستمرارية. لا شيء يأتي من دون تضحيات.", "فخور بكل لحظة أرتدي فيها قميص بلادي. القادم أجمل.", "شكراً لجماهير النصر على الطاقة التي تمنحونها لنا كل يوم."],
  messi: ["كل بطولة تبدأ بحلم صغير وإيمان كبير بالفريق.", "الأرجنتين دائماً في القلب. شكراً لكل من يساندنا."],
  salah: ["الحمد لله على كل خطوة. نواصل العمل من أجل القادم.", "جمهور ليفربول، أنتم تعرفون معنى أن نكون معاً."]
};
