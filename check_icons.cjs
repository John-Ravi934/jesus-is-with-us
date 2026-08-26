const lu = require('react-icons/lu');
const fa6 = require('react-icons/fa6');

const expectedLu = [
  'LuBaby', 'LuShieldCheck', 'LuUsersRound', 'LuHandHeart', 'LuHeartPulse', 
  'LuFlower2', 'LuHeart', 'LuStar', 'LuTag', 'LuBrain', 'LuShield', 'LuCompass', 
  'LuFootprints', 'LuRefreshCw', 'LuScale', 'LuDumbbell', 'LuSmile', 'LuHeartHandshake', 
  'LuCloudSun', 'LuWings', 'LuDoorOpen', 'LuSparkles', 'LuHandCoins', 
  'LuWheat', 'LuGift', 'LuSunrise'
];

const expectedFa6 = [
  'FaChurch', 'FaDove', 'FaHandsPraying', 'FaCross', 'FaTrophy', 
  'FaBookBible', 'FaScroll', 'FaSeedling', 'FaInfinity', 'FaCrown', 'FaUnlock'
];

const missingLu = expectedLu.filter(i => !lu[i]);
const missingFa6 = expectedFa6.filter(i => !fa6[i]);

console.log('Missing in LU:', missingLu);
console.log('Missing in FA6:', missingFa6);
