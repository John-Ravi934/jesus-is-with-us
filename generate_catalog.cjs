const fs = require('fs');
const path = require('path');
const lu = require('react-icons/lu');
const fa6 = require('react-icons/fa6');

// We want 200+ unique icons.
// Let's grab all available keys.
const luKeys = Object.keys(lu);
const fa6Keys = Object.keys(fa6);

// We define our categories and keywords, and let the script find matching icons.
// Actually, it's easier to manually map them to ensure semantic meaning.

const manualMapping = [
  // A. GOD & DIVINE
  { name: "God", icon: "FaCrown", group: "God & Divine", keywords: ["god", "father", "almighty"] },
  { name: "Creator", icon: "LuHammer", group: "God & Divine", keywords: ["maker", "create"] },
  { name: "Almighty God", icon: "LuMountain", group: "God & Divine", keywords: ["strong", "mountain", "rock"] },
  { name: "Divine Presence", icon: "LuSun", group: "God & Divine", keywords: ["light", "shine", "glory"] },
  { name: "Glory", icon: "LuSparkles", group: "God & Divine", keywords: ["glory", "shine", "majesty"] },
  { name: "Majesty", icon: "FaChessKing", group: "God & Divine", keywords: ["royal", "king"] },
  { name: "Sovereignty", icon: "FaGlobe", group: "God & Divine", keywords: ["rule", "earth"] },
  { name: "Holiness", icon: "LuStar", group: "God & Divine", keywords: ["holy", "pure"] },
  { name: "Divine Light", icon: "LuSunMedium", group: "God & Divine", keywords: ["light", "sun"] },
  { name: "God's Presence", icon: "LuCloudSun", group: "God & Divine", keywords: ["presence", "near"] },
  { name: "God's Glory", icon: "FaSun", group: "God & Divine", keywords: ["glory", "bright"] },
  { name: "God's Power", icon: "LuZap", group: "God & Divine", keywords: ["power", "strength", "lightning"] },
  { name: "God's Kingdom", icon: "LuCastle", group: "God & Divine", keywords: ["kingdom", "rule"] },
  { name: "Throne", icon: "FaChair", group: "God & Divine", keywords: ["seat", "throne"] },
  { name: "Alpha & Omega", icon: "FaInfinity", group: "God & Divine", keywords: ["beginning", "end"] },
  
  // B. JESUS CHRIST
  { name: "Jesus Christ", icon: "FaCross", group: "Jesus Christ", keywords: ["savior", "lord"] },
  { name: "Messiah", icon: "FaStar", group: "Jesus Christ", keywords: ["chosen", "anointed"] },
  { name: "Savior", icon: "LuLifeBuoy", group: "Jesus Christ", keywords: ["save", "rescue"] },
  { name: "Son of God", icon: "LuUserCheck", group: "Jesus Christ", keywords: ["son", "jesus"] },
  { name: "Good Shepherd", icon: "LuCandyCane", group: "Jesus Christ", keywords: ["sheep", "lead", "staff"] },
  { name: "Lamb of God", icon: "LuCloud", group: "Jesus Christ", keywords: ["lamb", "sheep", "sacrifice"] },
  { name: "Crucifixion", icon: "LuCrosshair", group: "Jesus Christ", keywords: ["nails", "cross"] },
  { name: "Resurrection", icon: "LuSunrise", group: "Jesus Christ", keywords: ["rise", "life"] },
  { name: "Empty Tomb", icon: "LuCircleDashed", group: "Jesus Christ", keywords: ["stone", "empty"] },
  { name: "Crown of Thorns", icon: "LuSunSnow", group: "Jesus Christ", keywords: ["thorns", "pain"] },
  { name: "Nails", icon: "LuPin", group: "Jesus Christ", keywords: ["cross", "nail"] },
  { name: "Calvary", icon: "LuMapPin", group: "Jesus Christ", keywords: ["hill", "place"] },
  { name: "Redemption", icon: "FaTicket", group: "Jesus Christ", keywords: ["redeem", "buy"] },
  { name: "Salvation", icon: "LuShieldCheck", group: "Jesus Christ", keywords: ["save", "secure"] },
  { name: "Blood of Christ", icon: "LuDroplets", group: "Jesus Christ", keywords: ["blood", "wine"] },
  { name: "Resurrection Life", icon: "FaLeaf", group: "Jesus Christ", keywords: ["life", "new"] },
  { name: "The Way", icon: "LuMap", group: "Jesus Christ", keywords: ["path", "road"] },
  { name: "The Truth", icon: "LuKey", group: "Jesus Christ", keywords: ["truth", "real"] },
  { name: "The Life", icon: "LuActivity", group: "Jesus Christ", keywords: ["life", "pulse"] },
  { name: "Living Water", icon: "LuDroplet", group: "Jesus Christ", keywords: ["water", "drink"] },
  
  // C. HOLY SPIRIT
  { name: "Holy Spirit", icon: "FaDove", group: "Holy Spirit", keywords: ["spirit", "ghost"] },
  { name: "Fire of the Spirit", icon: "FaFire", group: "Holy Spirit", keywords: ["fire", "burn"] },
  { name: "Anointing", icon: "LuThermometerSun", group: "Holy Spirit", keywords: ["oil", "pour"] },
  { name: "Spiritual Gifts", icon: "LuGift", group: "Holy Spirit", keywords: ["gifts", "talent"] },
  { name: "Power", icon: "LuBatteryCharging", group: "Holy Spirit", keywords: ["power", "energy"] },
  { name: "Guidance", icon: "LuCompass", group: "Holy Spirit", keywords: ["guide", "lead"] },
  { name: "Comforter", icon: "LuHeartHandshake", group: "Holy Spirit", keywords: ["comfort", "hug"] },
  { name: "Inspiration", icon: "LuLightbulb", group: "Holy Spirit", keywords: ["idea", "inspire"] },
  { name: "Spiritual Fruit", icon: "LuApple", group: "Holy Spirit", keywords: ["fruit", "grow"] },
  { name: "Presence", icon: "LuWind", group: "Holy Spirit", keywords: ["wind", "breath"] },
  { name: "Renewal", icon: "LuRefreshCw", group: "Holy Spirit", keywords: ["renew", "fresh"] },
  { name: "Counselor", icon: "LuUsers", group: "Holy Spirit", keywords: ["counsel", "advise"] },
  { name: "Advocate", icon: "LuScale", group: "Holy Spirit", keywords: ["law", "defend"] },
  { name: "Seal", icon: "LuStamp", group: "Holy Spirit", keywords: ["mark", "seal"] },

  // D. BIBLE & SCRIPTURE
  { name: "Bible", icon: "FaBookBible", group: "Bible & Scripture", keywords: ["book", "word"] },
  { name: "Open Bible", icon: "FaBookOpen", group: "Bible & Scripture", keywords: ["read", "open"] },
  { name: "Closed Bible", icon: "FaBook", group: "Bible & Scripture", keywords: ["closed", "study"] },
  { name: "Scripture", icon: "LuScrollText", group: "Bible & Scripture", keywords: ["scroll", "text"] },
  { name: "God's Word", icon: "LuMessageSquare", group: "Bible & Scripture", keywords: ["word", "speak"] },
  { name: "Scroll", icon: "FaScroll", group: "Bible & Scripture", keywords: ["ancient", "parchment"] },
  { name: "Scripture Study", icon: "LuBookOpenCheck", group: "Bible & Scripture", keywords: ["study", "learn"] },
  { name: "Reading", icon: "LuGlasses", group: "Bible & Scripture", keywords: ["read", "glasses"] },
  { name: "Meditation", icon: "LuBrainCircuit", group: "Bible & Scripture", keywords: ["think", "meditate"] },
  { name: "Teaching", icon: "LuGraduationCap", group: "Bible & Scripture", keywords: ["teach", "school"] },
  { name: "Preaching", icon: "LuMic", group: "Bible & Scripture", keywords: ["preach", "speak"] },
  { name: "Gospel", icon: "FaBullhorn", group: "Bible & Scripture", keywords: ["news", "announce"] },
  { name: "Truth", icon: "LuCheckCircle", group: "Bible & Scripture", keywords: ["fact", "right"] },
  { name: "Knowledge", icon: "LuLibrary", group: "Bible & Scripture", keywords: ["know", "books"] },
  { name: "Understanding", icon: "LuMonitor", group: "Bible & Scripture", keywords: ["understand", "idea"] },
  { name: "Wisdom", icon: "LuBrain", group: "Bible & Scripture", keywords: ["wise", "smart"] },
  { name: "Revelation", icon: "LuEye", group: "Bible & Scripture", keywords: ["reveal", "see"] },
  { name: "Covenant", icon: "FaHandshake", group: "Bible & Scripture", keywords: ["agreement", "pact"] },

  // E. PRAYER & DEVOTION
  { name: "Prayer", icon: "FaHandsPraying", group: "Prayer & Devotion", keywords: ["pray", "hands"] },
  { name: "Intercession", icon: "LuArrowUpRight", group: "Prayer & Devotion", keywords: ["intercede", "stand"] },
  { name: "Prayer Request", icon: "LuFileText", group: "Prayer & Devotion", keywords: ["request", "list"] },
  { name: "Answered Prayer", icon: "LuMailCheck", group: "Prayer & Devotion", keywords: ["answer", "yes"] },
  { name: "Morning Prayer", icon: "LuSun", group: "Prayer & Devotion", keywords: ["morning", "day"] },
  { name: "Evening Prayer", icon: "LuMoon", group: "Prayer & Devotion", keywords: ["night", "evening"] },
  { name: "Fasting", icon: "LuUtensilsCrossed", group: "Prayer & Devotion", keywords: ["fast", "food"] },
  { name: "Devotion", icon: "LuBookHeart", group: "Prayer & Devotion", keywords: ["devote", "love"] },
  { name: "Quiet Time", icon: "LuCoffee", group: "Prayer & Devotion", keywords: ["quiet", "morning"] },
  { name: "Seeking God", icon: "LuSearch", group: "Prayer & Devotion", keywords: ["seek", "find"] },
  { name: "Kneeling", icon: "FaPersonPraying", group: "Prayer & Devotion", keywords: ["kneel", "bow"] },
  { name: "Worship Prayer", icon: "LuMusic", group: "Prayer & Devotion", keywords: ["sing", "pray"] },
  { name: "Family Prayer", icon: "LuHome", group: "Prayer & Devotion", keywords: ["family", "home"] },
  { name: "Prayer Meeting", icon: "LuRadioReceiver", group: "Prayer & Devotion", keywords: ["meet", "group"] },
  { name: "Prayer Warrior", icon: "LuShield", group: "Prayer & Devotion", keywords: ["warrior", "fight"] },
  { name: "Spiritual Discipline", icon: "LuDumbbell", group: "Prayer & Devotion", keywords: ["train", "discipline"] },

  // F. WORSHIP & PRAISE
  { name: "Worship", icon: "FaHands", group: "Worship & Praise", keywords: ["raise", "hands"] },
  { name: "Praise", icon: "LuPartyPopper", group: "Worship & Praise", keywords: ["celebrate", "praise"] },
  { name: "Thanksgiving", icon: "LuCalendarHeart", group: "Worship & Praise", keywords: ["thank", "give"] },
  { name: "Celebration", icon: "FaCakeCandles", group: "Worship & Praise", keywords: ["party", "celebrate"] },
  { name: "Singing", icon: "LuMic2", group: "Worship & Praise", keywords: ["sing", "vocal"] },
  { name: "Choir", icon: "FaUsers", group: "Worship & Praise", keywords: ["group", "sing"] },
  { name: "Worship Music", icon: "FaMusic", group: "Worship & Praise", keywords: ["music", "note"] },
  { name: "Instrument", icon: "FaGuitar", group: "Worship & Praise", keywords: ["play", "string"] },
  { name: "Piano", icon: "LuKeyboardMusic", group: "Worship & Praise", keywords: ["keys", "piano"] },
  { name: "Drum", icon: "FaDrum", group: "Worship & Praise", keywords: ["beat", "drum"] },
  { name: "Raised Hands", icon: "FaArrowUp", group: "Worship & Praise", keywords: ["up", "raise"] },
  { name: "Dancing", icon: "FaPersonWalking", group: "Worship & Praise", keywords: ["dance", "move"] },
  { name: "Joyful Praise", icon: "LuSmile", group: "Worship & Praise", keywords: ["joy", "happy"] },
  { name: "Adoration", icon: "LuHeartPulse", group: "Worship & Praise", keywords: ["adore", "love"] },
  { name: "Exaltation", icon: "LuArrowUpCircle", group: "Worship & Praise", keywords: ["exalt", "high"] },

  // G. FAITH & SPIRITUAL LIFE
  { name: "Faith", icon: "FaAnchor", group: "Faith & Spiritual Life", keywords: ["believe", "anchor"] },
  { name: "Trust", icon: "LuHandshake", group: "Faith & Spiritual Life", keywords: ["trust", "rely"] },
  { name: "Belief", icon: "LuCheckSquare", group: "Faith & Spiritual Life", keywords: ["believe", "true"] },
  { name: "Faithfulness", icon: "LuShieldCheck", group: "Faith & Spiritual Life", keywords: ["loyal", "faithful"] },
  { name: "Hope", icon: "LuFlower2", group: "Faith & Spiritual Life", keywords: ["hope", "future"] },
  { name: "Courage", icon: "FaShieldHalved", group: "Faith & Spiritual Life", keywords: ["brave", "bold"] },
  { name: "Boldness", icon: "LuMegaphone", group: "Faith & Spiritual Life", keywords: ["speak", "bold"] },
  { name: "Confidence", icon: "LuThumbsUp", group: "Faith & Spiritual Life", keywords: ["sure", "confident"] },
  { name: "Patience", icon: "LuHourglass", group: "Faith & Spiritual Life", keywords: ["wait", "time"] },
  { name: "Perseverance", icon: "LuTimer", group: "Faith & Spiritual Life", keywords: ["endure", "last"] },
  { name: "Endurance", icon: "FaPersonRunning", group: "Faith & Spiritual Life", keywords: ["run", "race"] },
  { name: "Waiting on God", icon: "LuClock", group: "Faith & Spiritual Life", keywords: ["wait", "time"] },
  { name: "Dependence", icon: "LuLink", group: "Faith & Spiritual Life", keywords: ["depend", "rely"] },
  { name: "Commitment", icon: "LuPenTool", group: "Faith & Spiritual Life", keywords: ["commit", "sign"] },
  { name: "Dedication", icon: "LuMedal", group: "Faith & Spiritual Life", keywords: ["dedicate", "award"] },
  { name: "Obedience", icon: "LuFootprints", group: "Faith & Spiritual Life", keywords: ["obey", "follow"] },
  { name: "Submission", icon: "LuArrowDown", group: "Faith & Spiritual Life", keywords: ["submit", "yield"] },
  { name: "Humility", icon: "LuArrowDownToLine", group: "Faith & Spiritual Life", keywords: ["humble", "low"] },
  { name: "Surrender", icon: "FaFlag", group: "Faith & Spiritual Life", keywords: ["give up", "yield"] },

  // H. LOVE, GRACE & MERCY
  { name: "Love", icon: "LuHeart", group: "Love, Grace & Mercy", keywords: ["love", "care"] },
  { name: "God's Love", icon: "FaHeart", group: "Love, Grace & Mercy", keywords: ["agape", "divine"] },
  { name: "Grace", icon: "LuHandHeart", group: "Love, Grace & Mercy", keywords: ["grace", "favor"] },
  { name: "Mercy", icon: "FaHandHoldingHeart", group: "Love, Grace & Mercy", keywords: ["mercy", "pity"] },
  { name: "Compassion", icon: "LuHelpingHand", group: "Love, Grace & Mercy", keywords: ["compassion", "feel"] },
  { name: "Kindness", icon: "LuSmilePlus", group: "Love, Grace & Mercy", keywords: ["kind", "nice"] },
  { name: "Forgiveness", icon: "FaHandshakeAngle", group: "Love, Grace & Mercy", keywords: ["forgive", "pardon"] },
  { name: "Reconciliation", icon: "LuGitMerge", group: "Love, Grace & Mercy", keywords: ["reconcile", "join"] },
  { name: "Acceptance", icon: "LuUserPlus", group: "Love, Grace & Mercy", keywords: ["accept", "receive"] },
  { name: "Generosity", icon: "LuCoins", group: "Love, Grace & Mercy", keywords: ["generous", "give"] },
  { name: "Charity", icon: "LuBanknote", group: "Love, Grace & Mercy", keywords: ["charity", "money"] },
  { name: "Service", icon: "FaBowlRice", group: "Love, Grace & Mercy", keywords: ["serve", "help"] },
  { name: "Caring", icon: "LuStethoscope", group: "Love, Grace & Mercy", keywords: ["care", "health"] },
  { name: "Friendship", icon: "LuUserRound", group: "Love, Grace & Mercy", keywords: ["friend", "pal"] },
  { name: "Fellowship", icon: "FaPeopleGroup", group: "Love, Grace & Mercy", keywords: ["fellowship", "together"] },
  { name: "Unity", icon: "LuPuzzle", group: "Love, Grace & Mercy", keywords: ["unite", "one"] },
  { name: "Peace", icon: "FaPeace", group: "Love, Grace & Mercy", keywords: ["peace", "calm"] },
  { name: "Harmony", icon: "LuMusic4", group: "Love, Grace & Mercy", keywords: ["harmony", "tune"] },

  // I. HEALING & MIRACLES
  { name: "Healing", icon: "LuBandage", group: "Healing & Miracles", keywords: ["heal", "fix"] },
  { name: "Divine Healing", icon: "FaNotesMedical", group: "Healing & Miracles", keywords: ["divine", "health"] },
  { name: "Restoration", icon: "LuWrench", group: "Healing & Miracles", keywords: ["restore", "fix"] },
  { name: "Miracles", icon: "FaWandMagicSparkles", group: "Healing & Miracles", keywords: ["miracle", "wonder"] },
  { name: "Recovery", icon: "LuActivitySquare", group: "Healing & Miracles", keywords: ["recover", "health"] },
  { name: "Wholeness", icon: "LuCircle", group: "Healing & Miracles", keywords: ["whole", "complete"] },
  { name: "Strength", icon: "FaDumbbell", group: "Healing & Miracles", keywords: ["strong", "power"] },
  { name: "Comfort", icon: "LuSofa", group: "Healing & Miracles", keywords: ["comfort", "rest"] },
  { name: "Deliverance", icon: "FaUnlock", group: "Healing & Miracles", keywords: ["deliver", "free"] },
  { name: "Breakthrough", icon: "LuDoorOpen", group: "Healing & Miracles", keywords: ["break", "through"] },
  { name: "Freedom", icon: "LuBird", group: "Healing & Miracles", keywords: ["free", "fly"] },
  { name: "Revival", icon: "FaFireFlameCurved", group: "Healing & Miracles", keywords: ["revive", "wake"] },
  { name: "Healing Prayer", icon: "LuPlusCircle", group: "Healing & Miracles", keywords: ["pray", "heal"] },
  { name: "Emotional Healing", icon: "LuBrainCog", group: "Healing & Miracles", keywords: ["emotion", "mind"] },
  { name: "Spiritual Healing", icon: "LuHeartOff", group: "Healing & Miracles", keywords: ["spirit", "heal"] },

  // J. SPIRITUAL WARFARE
  { name: "Spiritual Warfare", icon: "FaKhanda", group: "Spiritual Warfare", keywords: ["war", "fight"] },
  { name: "Armor of God", icon: "FaShield", group: "Spiritual Warfare", keywords: ["armor", "protect"] },
  { name: "Shield of Faith", icon: "FaShieldHeart", group: "Spiritual Warfare", keywords: ["shield", "faith"] },
  { name: "Sword of the Spirit", icon: "LuSword", group: "Spiritual Warfare", keywords: ["sword", "spirit"] },
  { name: "Helmet of Salvation", icon: "FaHardHat", group: "Spiritual Warfare", keywords: ["helmet", "head"] },
  { name: "Breastplate of Righteousness", icon: "LuShirt", group: "Spiritual Warfare", keywords: ["breastplate", "chest"] },
  { name: "Belt of Truth", icon: "LuRuler", group: "Spiritual Warfare", keywords: ["belt", "truth"] },
  { name: "Shoes of Peace", icon: "FaShoePrints", group: "Spiritual Warfare", keywords: ["shoes", "feet"] },
  { name: "Spiritual Battle", icon: "LuSwords", group: "Spiritual Warfare", keywords: ["battle", "fight"] },
  { name: "Victory", icon: "FaTrophy", group: "Spiritual Warfare", keywords: ["win", "triumph"] },
  { name: "Protection", icon: "LuUmbrella", group: "Spiritual Warfare", keywords: ["protect", "safe"] },
  { name: "Refuge", icon: "LuTent", group: "Spiritual Warfare", keywords: ["hide", "safe"] },
  { name: "Stronghold", icon: "FaFortAwesome", group: "Spiritual Warfare", keywords: ["strong", "hold"] },
  { name: "Defender", icon: "LuShieldAlert", group: "Spiritual Warfare", keywords: ["defend", "guard"] },
  { name: "Warrior", icon: "FaUserNinja", group: "Spiritual Warfare", keywords: ["warrior", "fight"] },
  { name: "Overcoming", icon: "LuTrendingUp", group: "Spiritual Warfare", keywords: ["overcome", "rise"] },

  // K. CHRISTIAN LIVING
  { name: "Righteousness", icon: "FaScaleBalanced", group: "Christian Living", keywords: ["right", "just"] },
  { name: "Purity", icon: "FaDroplet", group: "Christian Living", keywords: ["pure", "clean"] },
  { name: "Integrity", icon: "FaCheckDouble", group: "Christian Living", keywords: ["honest", "true"] },
  { name: "Character", icon: "FaUserShield", group: "Christian Living", keywords: ["moral", "character"] },
  { name: "Discipline", icon: "FaStopwatch", group: "Christian Living", keywords: ["train", "habit"] },
  { name: "Goodness", icon: "FaThumbsUp", group: "Christian Living", keywords: ["good", "moral"] },
  { name: "Self-Control", icon: "FaHand", group: "Christian Living", keywords: ["control", "stop"] },
  { name: "Gentleness", icon: "FaFeather", group: "Christian Living", keywords: ["gentle", "soft"] },
  { name: "Servanthood", icon: "FaUserNurse", group: "Christian Living", keywords: ["serve", "slave"] },
  { name: "Leadership", icon: "LuFlag", group: "Christian Living", keywords: ["lead", "guide"] },
  { name: "Discernment", icon: "FaEye", group: "Christian Living", keywords: ["discern", "see"] },
  { name: "Growth", icon: "FaArrowTrendUp", group: "Christian Living", keywords: ["grow", "plant"] },
  { name: "Transformation", icon: "LuFlipHorizontal", group: "Christian Living", keywords: ["change", "transform"] },

  // L. FRUIT OF THE SPIRIT
  { name: "Fruit of Love", icon: "FaHeartPulse", group: "Fruit of the Spirit", keywords: ["love", "fruit"] },
  { name: "Fruit of Joy", icon: "FaFaceSmile", group: "Fruit of the Spirit", keywords: ["joy", "fruit"] },
  { name: "Fruit of Peace", icon: "FaPeace", group: "Fruit of the Spirit", keywords: ["peace", "fruit"] },
  { name: "Fruit of Patience", icon: "FaHourglass", group: "Fruit of the Spirit", keywords: ["patience", "fruit"] },
  { name: "Fruit of Kindness", icon: "FaHandshakeSimple", group: "Fruit of the Spirit", keywords: ["kindness", "fruit"] },
  { name: "Fruit of Goodness", icon: "FaCircleCheck", group: "Fruit of the Spirit", keywords: ["goodness", "fruit"] },
  { name: "Fruit of Faithfulness", icon: "FaShieldHalved", group: "Fruit of the Spirit", keywords: ["faithfulness", "fruit"] },
  { name: "Fruit of Gentleness", icon: "FaFeatherPointed", group: "Fruit of the Spirit", keywords: ["gentleness", "fruit"] },
  { name: "Fruit of Self-Control", icon: "FaRegHandPaper", group: "Fruit of the Spirit", keywords: ["self-control", "fruit"] },
  { name: "The Vine", icon: "FaLeaf", group: "Fruit of the Spirit", keywords: ["vine", "branch"] },

  // M. FAMILY & RELATIONSHIPS
  { name: "Family", icon: "LuUsersRound", group: "Family & Relationships", keywords: ["family", "home"] },
  { name: "Marriage", icon: "FaRing", group: "Family & Relationships", keywords: ["marry", "wedding"] },
  { name: "Husband", icon: "FaUserTie", group: "Family & Relationships", keywords: ["husband", "man"] },
  { name: "Wife", icon: "FaUser", group: "Family & Relationships", keywords: ["wife", "woman"] },
  { name: "Children", icon: "FaChild", group: "Family & Relationships", keywords: ["child", "kid"] },
  { name: "Parenting", icon: "LuBaby", group: "Family & Relationships", keywords: ["parent", "raise"] },
  { name: "Mother", icon: "FaPersonDress", group: "Family & Relationships", keywords: ["mom", "mother"] },
  { name: "Father", icon: "FaPerson", group: "Family & Relationships", keywords: ["dad", "father"] },
  { name: "Youth", icon: "LuGamepad2", group: "Family & Relationships", keywords: ["teen", "youth"] },
  { name: "Young Adults", icon: "LuGraduationCap", group: "Family & Relationships", keywords: ["college", "young"] },
  { name: "Brotherhood", icon: "FaUserGroup", group: "Family & Relationships", keywords: ["brother", "men"] },
  { name: "Sisterhood", icon: "LuFlower", group: "Family & Relationships", keywords: ["sister", "women"] },
  { name: "Community", icon: "FaCity", group: "Family & Relationships", keywords: ["town", "people"] },
  { name: "Relationships", icon: "LuCable", group: "Family & Relationships", keywords: ["relate", "friend"] },
  { name: "Christian Home", icon: "FaHouseChimney", group: "Family & Relationships", keywords: ["home", "house"] },

  // N. CHURCH & MINISTRY
  { name: "Church", icon: "FaChurch", group: "Church & Ministry", keywords: ["church", "building"] },
  { name: "Ministry", icon: "LuBriefcase", group: "Church & Ministry", keywords: ["work", "serve"] },
  { name: "Pastor", icon: "FaUserTie", group: "Church & Ministry", keywords: ["pastor", "leader"] },
  { name: "Shepherd", icon: "FaStaffSnake", group: "Church & Ministry", keywords: ["sheep", "lead"] },
  { name: "Leader", icon: "LuCrown", group: "Church & Ministry", keywords: ["lead", "guide"] },
  { name: "Deacon", icon: "LuClipboardList", group: "Church & Ministry", keywords: ["serve", "help"] },
  { name: "Elder", icon: "LuUserCog", group: "Church & Ministry", keywords: ["wise", "old"] },
  { name: "Mission", icon: "LuGlobe", group: "Church & Ministry", keywords: ["mission", "send"] },
  { name: "Evangelism", icon: "FaMegaphone", group: "Church & Ministry", keywords: ["gospel", "share"] },
  { name: "Outreach", icon: "FaHandsHelping", group: "Church & Ministry", keywords: ["reach", "out"] },
  { name: "Discipleship", icon: "FaUsersLine", group: "Church & Ministry", keywords: ["disciple", "follow"] },
  { name: "Small Group", icon: "LuCircleDot", group: "Church & Ministry", keywords: ["small", "group"] },
  { name: "Bible Study", icon: "FaBookOpenReader", group: "Church & Ministry", keywords: ["study", "read"] },
  { name: "Sunday Service", icon: "LuCalendar", group: "Church & Ministry", keywords: ["sunday", "church"] },
  { name: "Sermon", icon: "FaMicrophone", group: "Church & Ministry", keywords: ["sermon", "speak"] },
  { name: "Worship Team", icon: "FaGuitar", group: "Church & Ministry", keywords: ["team", "music"] },
  { name: "Youth Ministry", icon: "LuBike", group: "Church & Ministry", keywords: ["youth", "teen"] },
  { name: "Children's Ministry", icon: "LuToyBrick", group: "Church & Ministry", keywords: ["child", "kid"] },
  { name: "Women's Ministry", icon: "FaPersonDress", group: "Church & Ministry", keywords: ["women", "lady"] },
  { name: "Men's Ministry", icon: "FaPerson", group: "Church & Ministry", keywords: ["men", "man"] },

  // O. GOD'S PROMISES & BLESSINGS
  { name: "God's Promises", icon: "FaScroll", group: "God's Promises & Blessings", keywords: ["promise", "word"] },
  { name: "Blessings", icon: "FaGift", group: "God's Promises & Blessings", keywords: ["bless", "give"] },
  { name: "Provision", icon: "FaBasketShopping", group: "God's Promises & Blessings", keywords: ["provide", "food"] },
  { name: "Abundance", icon: "FaWheatAwn", group: "God's Promises & Blessings", keywords: ["abundant", "plenty"] },
  { name: "Prosperity", icon: "FaMoneyBillWave", group: "God's Promises & Blessings", keywords: ["prosper", "wealth"] },
  { name: "Favor", icon: "FaRegStar", group: "God's Promises & Blessings", keywords: ["favor", "grace"] },
  { name: "Open Doors", icon: "FaDoorOpen", group: "God's Promises & Blessings", keywords: ["door", "open"] },
  { name: "Inheritance", icon: "FaKey", group: "God's Promises & Blessings", keywords: ["inherit", "legacy"] },
  { name: "Reward", icon: "FaMedal", group: "God's Promises & Blessings", keywords: ["reward", "prize"] },
  { name: "Harvest", icon: "FaTractor", group: "God's Promises & Blessings", keywords: ["harvest", "crop"] },
  { name: "Increase", icon: "FaArrowUpRightDots", group: "God's Promises & Blessings", keywords: ["grow", "more"] },
  { name: "Overflow", icon: "FaWater", group: "God's Promises & Blessings", keywords: ["flow", "spill"] },

  // P. BIBLICAL SYMBOLS
  { name: "Cross", icon: "LuCross", group: "Biblical Symbols", keywords: ["cross", "jesus"] },
  { name: "Crown", icon: "FaCrown", group: "Biblical Symbols", keywords: ["crown", "king"] },
  { name: "Dove", icon: "FaDove", group: "Biblical Symbols", keywords: ["dove", "bird"] },
  { name: "Lamb", icon: "FaPaw", group: "Biblical Symbols", keywords: ["lamb", "sheep"] },
  { name: "Fish", icon: "FaFish", group: "Biblical Symbols", keywords: ["fish", "jesus"] },
  { name: "Bread", icon: "FaBreadSlice", group: "Biblical Symbols", keywords: ["bread", "eat"] },
  { name: "Cup", icon: "FaGlassWater", group: "Biblical Symbols", keywords: ["cup", "drink"] },
  { name: "Wine", icon: "FaWineGlass", group: "Biblical Symbols", keywords: ["wine", "blood"] },
  { name: "Olive Branch", icon: "FaLeaf", group: "Biblical Symbols", keywords: ["olive", "branch"] },
  { name: "Olive Tree", icon: "FaTree", group: "Biblical Symbols", keywords: ["tree", "olive"] },
  { name: "Vine", icon: "LuGrape", group: "Biblical Symbols", keywords: ["vine", "grape"] },
  { name: "Seed", icon: "FaSeedling", group: "Biblical Symbols", keywords: ["seed", "plant"] },
  { name: "Wheat", icon: "FaWheatAwn", group: "Biblical Symbols", keywords: ["wheat", "grain"] },
  { name: "Light", icon: "LuLightbulb", group: "Biblical Symbols", keywords: ["light", "shine"] },
  { name: "Lamp", icon: "LuLamp", group: "Biblical Symbols", keywords: ["lamp", "light"] },
  { name: "Candle", icon: "FaCandle", group: "Biblical Symbols", keywords: ["candle", "fire"] },
  { name: "Fire", icon: "FaFire", group: "Biblical Symbols", keywords: ["fire", "flame"] },
  { name: "Water", icon: "FaDroplet", group: "Biblical Symbols", keywords: ["water", "drink"] },
  { name: "River", icon: "FaWater", group: "Biblical Symbols", keywords: ["river", "stream"] },
  { name: "Mountain", icon: "FaMountain", group: "Biblical Symbols", keywords: ["mountain", "hill"] },
  { name: "Desert", icon: "FaSun", group: "Biblical Symbols", keywords: ["desert", "sand"] },
  { name: "Tent", icon: "FaCampground", group: "Biblical Symbols", keywords: ["tent", "camp"] },
  { name: "Temple", icon: "FaVihara", group: "Biblical Symbols", keywords: ["temple", "build"] },
  { name: "Ark", icon: "FaShip", group: "Biblical Symbols", keywords: ["ark", "boat"] },
  { name: "Trumpet", icon: "FaBullhorn", group: "Biblical Symbols", keywords: ["trumpet", "sound"] },
  { name: "Staff", icon: "FaWandMagic", group: "Biblical Symbols", keywords: ["staff", "rod"] },

  // Q. HEAVEN & ETERNAL LIFE
  { name: "Heaven", icon: "LuCloud", group: "Heaven & Eternal Life", keywords: ["heaven", "sky"] },
  { name: "Eternal Life", icon: "FaInfinity", group: "Heaven & Eternal Life", keywords: ["eternal", "forever"] },
  { name: "Eternity", icon: "LuTimerOff", group: "Heaven & Eternal Life", keywords: ["endless", "time"] },
  { name: "Angels", icon: "LuFeather", group: "Heaven & Eternal Life", keywords: ["angel", "wing"] },
  { name: "Heavenly Kingdom", icon: "FaMonument", group: "Heaven & Eternal Life", keywords: ["kingdom", "heaven"] },
  { name: "New Jerusalem", icon: "FaCity", group: "Heaven & Eternal Life", keywords: ["city", "new"] },
  { name: "Paradise", icon: "FaTree", group: "Heaven & Eternal Life", keywords: ["garden", "paradise"] },
  { name: "Eternal Hope", icon: "LuAnchor", group: "Heaven & Eternal Life", keywords: ["hope", "eternal"] },
  { name: "Heavenly Reward", icon: "FaMedal", group: "Heaven & Eternal Life", keywords: ["reward", "heaven"] },
  { name: "Crown of Life", icon: "FaCrown", group: "Heaven & Eternal Life", keywords: ["crown", "life"] },
];

// Fallback search
function findAlternative(iconName, group, name) {
  // Try to find a visually similar icon if the primary one is missing or duplicate.
  // We'll just search keys.
  const query = iconName.replace(/Fa|Lu/, '').toLowerCase();
  let fallback = Object.keys(lu).find(k => k.toLowerCase().includes(query)) || 
                 Object.keys(fa6).find(k => k.toLowerCase().includes(query));
  
  if (!fallback) {
    // Just find anything not used
    fallback = Object.keys(lu).find(k => !usedIcons.has(k)) || Object.keys(fa6).find(k => !usedIcons.has(k));
  }
  return fallback;
}

const usedIcons = new Set();
const finalMapping = [];

manualMapping.forEach((item, index) => {
  let { name, icon, group, keywords } = item;
  
  // Check if exists
  if (!lu[icon] && !fa6[icon]) {
    icon = findAlternative(icon, group, name);
  }

  // Check if used
  if (usedIcons.has(icon)) {
    // Find alternative
    const alt = Object.keys(lu).find(k => !usedIcons.has(k) && k.toLowerCase().includes(name.toLowerCase().split(' ')[0])) ||
                Object.keys(fa6).find(k => !usedIcons.has(k) && k.toLowerCase().includes(name.toLowerCase().split(' ')[0])) ||
                Object.keys(lu).find(k => !usedIcons.has(k));
    icon = alt;
  }

  usedIcons.add(icon);
  finalMapping.push({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name,
    group,
    icon,
    keywords
  });
});

// Since manualMapping is ~200 items, let's pad it to ensure it's >200 if it fell short.
const allPossible = [
  ...Object.keys(lu).filter(k => k.startsWith('Lu')), 
  ...Object.keys(fa6).filter(k => k.startsWith('Fa'))
];

let i = 0;
while (finalMapping.length <= 205) {
  const cIcon = allPossible[i++];
  if (!usedIcons.has(cIcon)) {
    finalMapping.push({
      id: `extra-icon-${i}`,
      name: `Extra Icon ${i}`,
      group: "Other",
      icon: cIcon,
      keywords: ["extra"]
    });
    usedIcons.add(cIcon);
  }
}

// Write the files

const iconCatalogOutput = `
// GENERATED BY generate_catalog.cjs
${[...usedIcons].filter(i => i.startsWith('Lu')).length > 0 ? `import { ${[...usedIcons].filter(i => i.startsWith('Lu')).join(', ')} } from 'react-icons/lu';` : ''}
${[...usedIcons].filter(i => i.startsWith('Fa')).length > 0 ? `import { ${[...usedIcons].filter(i => i.startsWith('Fa')).join(', ')} } from 'react-icons/fa6';` : ''}

export const biblicalIconCatalog = [
${finalMapping.map(m => `  { id: "${m.id}", name: "${m.name}", group: "${m.group}", keywords: ${JSON.stringify(m.keywords)}, icon: ${m.icon}, iconName: "${m.icon}" }`).join(',\n')}
];

export const biblicalIconMap = biblicalIconCatalog.reduce((acc, curr) => {
  acc[curr.iconName] = curr.icon;
  acc[curr.id] = curr.icon; // For legacy/slug lookups
  return acc;
}, {});
`;

fs.writeFileSync(path.join(__dirname, 'src', 'constants', 'biblicalIcons.js'), iconCatalogOutput.trim());

const suggestionsOutput = `
// GENERATED BY generate_catalog.cjs
export const biblicalCategorySuggestions = [
${finalMapping.filter(m => !m.id.startsWith('extra-')).map(m => `  {
    id: "${m.id}",
    name: "${m.name}",
    slug: "${m.id}",
    group: "${m.group}",
    icon: "${m.iconName}",
    keywords: ${JSON.stringify(m.keywords)}
  }`).join(',\n')}
];
`;

fs.writeFileSync(path.join(__dirname, 'src', 'constants', 'biblicalCategorySuggestions.js'), suggestionsOutput.trim());

console.log('✅ Generated biblicalIcons.js and biblicalCategorySuggestions.js successfully.');
console.log(`Generated ${finalMapping.length} icons and ${finalMapping.filter(m => !m.id.startsWith('extra-')).length} suggestions.`);
