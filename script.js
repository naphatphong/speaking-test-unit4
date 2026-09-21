/* =========================================================
   Speaking Test Unit 4 — Pitching a Documentary Idea
   Pure HTML/CSS/JS · no backend · no external API
   ========================================================= */
'use strict';

/* ---------- 1. HELPERS ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const K  = 'su4_';
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const store = {
  get(key, fb) { try { const v = localStorage.getItem(K + key); return v === null ? fb : JSON.parse(v); } catch (e) { return fb; } },
  set(key, val) { try { localStorage.setItem(K + key, JSON.stringify(val)); } catch (e) {} },
  del(key) { try { localStorage.removeItem(K + key); } catch (e) {} },
  clearAll() { try { Object.keys(localStorage).filter(k => k.indexOf(K) === 0).forEach(k => localStorage.removeItem(k)); } catch (e) {} }
};

function toast(msg) {
  const wrap = $('#toastWrap');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 2100);
}

function copyText(text) {
  const done = () => toast(L() === 'th' ? 'คัดลอกแล้ว' : 'Copied');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallback());
  } else fallback();
  function fallback() {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed'); }
    ta.remove();
  }
}

const countWords = t => (String(t).trim().match(/[A-Za-z0-9'’\-]+/g) || []).length;

let audioCtx = null;
function beep(freq, dur, vol) {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = freq || 880;
    g.gain.setValueAtTime(vol || 0.16, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (dur || 0.18));
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + (dur || 0.18));
  } catch (e) {}
}
let soundOn = store.get('sound', true);

/* ---------- 2. DATA: STEPS / PHRASES ---------- */
const STEPS = [
  { k: 'O', c: 'var(--c-o)', en: 'Opening', th: 'เปิดเรื่อง',
    descEn: 'Introduce the piece of news. Get attention with a question.',
    descTh: 'แนะนำข่าวที่จะพูดถึง เปิดด้วยคำถามเพื่อดึงความสนใจ',
    ex: ['Have you heard about the story …?', 'Did you hear the news about …?', 'Are you following the story about …?'] },
  { k: 'P', c: 'var(--c-p)', en: 'Purpose', th: 'จุดประสงค์',
    descEn: 'Use indirect and negative questions to show your purpose for a documentary.',
    descTh: 'ใช้คำถามเชิงลบ/คำถามอ้อม เพื่อบอกจุดประสงค์ของสารคดี',
    ex: ['Wouldn’t it be good to film a dramatic documentary about this?', 'Don’t you think it might be better to create a powerful documentary about …?', 'Isn’t it time to talk about …?', 'Wouldn’t you like to know more?'] },
  { k: 'C', c: 'var(--c-c)', en: 'Core News', th: 'สรุปข่าว',
    descEn: 'Summarise the news. Use “Apparently…”, “It was all over the news”, and past intention.',
    descTh: 'สรุปรายละเอียดข่าว ใช้ “Apparently…”, “It was all over the news” และรูปความตั้งใจในอดีต',
    ex: ['Apparently, …', 'It was all over the news.', 'They intended to …, but shockingly, …', 'I can’t remember the details, but basically …'] },
  { k: 'D', c: 'var(--c-d)', en: 'Documentary Idea', th: 'ไอเดียสารคดี',
    descEn: 'Develop the idea: focus, angle and the people involved.',
    descTh: 'ขยายไอเดีย: โฟกัส มุมมอง และคนที่จะสัมภาษณ์',
    ex: ['The documentary would focus on …', 'It would include interviews with …', 'First, … Also, … However, …'] },
  { k: 'I', c: 'var(--c-i)', en: 'Impact', th: 'ผลกระทบ',
    descEn: 'Say what happens after watching: the result for the audience.',
    descTh: 'บอกผลที่เกิดกับผู้ชมหลังดูจบ',
    ex: ['After watching it, viewers may …', 'Viewers would understand how to …', 'They would learn to …'] }
];

const PHRASES = [
  { t_en: 'Initiating a discussion', t_th: 'เปิดบทสนทนา', c: 'var(--c-o)', items: [
    'Have you heard about the story on …?', 'Did you hear the news about …?',
    'Are you following the news about …?', 'Have you seen the headline about …?'] },
  { t_en: 'Showing your purpose', t_th: 'บอกจุดประสงค์', c: 'var(--c-p)', items: [
    'Wouldn’t it be good to film a dramatic documentary about this?',
    'Don’t you think it might be better to create a powerful documentary about …?',
    'Wouldn’t you like to know more about …?', 'Isn’t it time to have a serious conversation about …?',
    'Wouldn’t you say this deserves a full documentary?'] },
  { t_en: 'Summarising the news', t_th: 'สรุปข่าว', c: 'var(--c-c)', items: [
    'So, basically, what happened was …', 'Apparently, …', 'It seems / appears that …',
    'I can’t remember the details, but basically …', 'It was all over the news.',
    'It received a lot of coverage.', 'They intended to …, but shockingly, …'] },
  { t_en: 'Commenting & reacting', t_th: 'แสดงความเห็น', c: 'var(--c-i)', items: [
    'It’s all over the news.', 'It’s on all the news channels.', 'Really? I had no idea.',
    'I can hardly believe it.', 'That’s a relief.', 'That sounds scary.'] },
  { t_en: 'Developing the idea', t_th: 'ขยายไอเดีย', c: 'var(--c-d)', items: [
    'The documentary would focus on …', 'It would include interviews with …',
    'First, we would follow …', 'Also, we would show …', 'However, we would never …',
    'Finally, the film would ask one simple question: …'] },
  { t_en: 'Purpose & impact', t_th: 'ผลกระทบ', c: 'var(--c-i)', items: [
    'After watching it, viewers may become more careful about …',
    'Viewers would understand how to …', 'They would learn to …',
    'The film would help people think twice before …'] }
];

const TIPS = [
  { en: 'Memorise the structure, not every word.', th: 'จำโครงสร้าง ไม่ต้องจำทุกคำ — จำ O-P-C-D-I ก็พูดได้ทั้งนาที' },
  { en: 'Use short, clear sentences.', th: 'ใช้ประโยคสั้นและชัดเจน ประโยคยาวมักพังกลางทาง' },
  { en: 'Use First, Also, However and Finally.', th: 'ใช้คำเชื่อม First, Also, However, Finally เพื่อให้ฟังเป็นระบบ' },
  { en: 'Aim for 110–140 words in one minute.', th: 'พูดประมาณ 110–140 คำใน 1 นาที (ราว 2 คำ/วินาที)' },
  { en: 'Stuck? Say “The documentary would focus on…”', th: 'ถ้าคิดไม่ออก ให้พูด “The documentary would focus on…” แล้วเล่าต่อ' },
  { en: 'Always end with Purpose and Impact.', th: 'จบด้วย Purpose & Impact เสมอ อย่าปล่อยให้เวลาหมดกลางประโยค' },
  { en: 'Name three groups of interviewees.', th: 'ระบุผู้ให้สัมภาษณ์อย่างน้อย 3 กลุ่ม ทำให้ไอเดียดูเป็นมืออาชีพ' },
  { en: 'Slow down at the first and last sentence.', th: 'พูดช้าลงตรงประโยคแรกและประโยคสุดท้าย เพื่อให้กรรมการจับใจความได้' }
];

const PLAN = [
  { t: '0–5s', c: 'var(--c-o)', en: 'Find the main problem', th: 'หาปัญหาหลักของข่าวให้ได้ 1 ประโยค' },
  { t: '6–10s', c: 'var(--c-p)', en: 'Think of the opening question', th: 'คิดคำถามเปิด “Have you heard about…?”' },
  { t: '11–15s', c: 'var(--c-c)', en: 'Summarise the news', th: 'สรุปข่าวสั้น ๆ ด้วย “Apparently…”' },
  { t: '16–20s', c: 'var(--c-d)', en: 'Choose the interviewees', th: 'เลือกคนที่จะสัมภาษณ์ 3 กลุ่ม' },
  { t: '21–25s', c: 'var(--c-d)', en: 'Choose the documentary angle', th: 'เลือกมุมของสารคดี (จะเล่าผ่านใคร/อะไร)' },
  { t: '26–30s', c: 'var(--c-i)', en: 'Think of the impact', th: 'คิดผลกระทบต่อผู้ชมตอนจบ' }
];

/* ---------- 3. DATA: 10 TOPICS ---------- */
const TOPICS = [
{
  id: 1, level: 'Normal',
  en: 'AI-generated videos make it harder to tell real news from fake news.',
  th: 'วิดีโอที่สร้างด้วย AI ทำให้แยกข่าวจริงออกจากข่าวปลอมได้ยากขึ้น',
  sumTh: 'เทคโนโลยี AI สร้างคลิปปลอมได้เนียนจนคนทั่วไปแยกไม่ออก ข่าวลวงจึงแพร่เร็วกว่าข่าวจริง',
  title: 'Seeing Is Not Believing',
  angle: 'Follow ONE fake clip for seven days and see how far a lie can travel.',
  angleTh: 'ตามรอยคลิปปลอม 1 คลิปตลอด 7 วัน เพื่อดูว่าคำโกหกเดินทางได้ไกลแค่ไหน',
  people: ['Fact-checkers and journalists', 'AI engineers who build the tools', 'Teenagers who share clips every day', 'A person whose face was used in a deepfake'],
  peopleTh: ['นักตรวจสอบข่าวและนักข่าว', 'วิศวกร AI ที่สร้างเครื่องมือ', 'วัยรุ่นที่แชร์คลิปทุกวัน', 'คนที่ถูกนำหน้าไปทำ deepfake'],
  vocab: [
    ['deepfake', 'คลิปปลอมที่สร้างด้วย AI'], ['misinformation', 'ข้อมูลผิด/ข่าวลวง'],
    ['verify', 'ตรวจสอบความจริง'], ['credibility', 'ความน่าเชื่อถือ'],
    ['manipulate', 'บิดเบือน/ตัดต่อ'], ['algorithm', 'อัลกอริทึม'],
    ['source', 'แหล่งที่มา'], ['go viral', 'แพร่กระจายอย่างรวดเร็ว']],
  cues: {
    O: 'Have you heard about the story on AI-generated videos?',
    P: 'Wouldn’t it be good to film a documentary about how easily we are fooled?',
    C: 'Apparently, a fake video of a politician was shared millions of times overnight.',
    D: 'Focus: one fake clip, seven days. Interviews: fact-checkers, AI engineers, teenagers.',
    I: 'Viewers may verify sources and think twice before sharing.'
  },
  model: {
    O: 'Have you heard about the news story on AI-generated videos?',
    P: 'Wouldn’t it be good to film a dramatic documentary about this? Don’t you think people should know how easily they can be fooled?',
    C: 'Apparently, a fake video of a famous politician was shared millions of times in one night. It was all over the news. The creators intended to prove a point, but shockingly, almost nobody checked the source first.',
    D: 'The documentary would focus on one fake clip and follow it for seven days. It would include interviews with fact-checkers, AI engineers, and teenagers who share videos every day. First, we show how the clip is built. Also, we test real people on the street. However, we never explain the tools step by step.',
    I: 'After watching it, viewers may become more careful, verify what they see, and think twice before pressing share.'
  },
  easy: 'Have you heard about AI videos and fake news? Wouldn’t it be good to make a documentary about this? Apparently, a fake video of a politician was shared millions of times. It was all over the news. The documentary would focus on one fake clip. It would include interviews with fact-checkers, AI engineers, and teenagers. After watching it, viewers may check the source before they share.',
  challenge: [
    ['Wouldn’t you say the truth now needs a bodyguard?', 'คำถามเชิงลบแบบมีภาพเปรียบเทียบ ทำให้พิตช์น่าจดจำ'],
    ['a chilling, fast-paced investigation', 'อัปเกรดคำคุณศัพท์แทนคำว่า interesting'],
    ['The film would end with one uncomfortable question.', 'ปิดท้ายแบบมืออาชีพ'],
    ['blur the line between fact and fiction', 'คอลโลเคชันระดับสูง'],
    ['They had intended to entertain, not to deceive.', 'Past perfect + past intention ใช้โชว์แกรมมาร์']
  ]
},
{
  id: 2, level: 'Easy',
  en: 'Posts on social media encourage risky behaviour among teenagers.',
  th: 'โพสต์บนโซเชียลมีเดียกระตุ้นให้วัยรุ่นทำพฤติกรรมเสี่ยง',
  sumTh: 'ชาเลนจ์อันตรายบนโซเชียลกลายเป็นเทรนด์ เพราะยอดไลก์ทำให้วัยรุ่นกล้าเสี่ยงมากขึ้น',
  title: 'Dare to Post',
  angle: 'Why a “like” is strong enough to make a careful teenager do something dangerous.',
  angleTh: 'ทำไมยอดไลก์ถึงมีพลังพอจะทำให้วัยรุ่นที่ระวังตัวยอมทำเรื่องอันตราย',
  people: ['Teenagers who tried a viral challenge', 'Parents and school counsellors', 'Emergency room doctors', 'Content moderators from a social platform'],
  peopleTh: ['วัยรุ่นที่เคยทำชาเลนจ์ไวรัล', 'ผู้ปกครองและครูแนะแนว', 'แพทย์ห้องฉุกเฉิน', 'ทีมคัดกรองเนื้อหาของแพลตฟอร์ม'],
  vocab: [
    ['peer pressure', 'แรงกดดันจากเพื่อน'], ['viral challenge', 'ชาเลนจ์ที่แพร่ไว'],
    ['reckless', 'ประมาท/ไม่คิดถึงผลเสีย'], ['influencer', 'ผู้มีอิทธิพลบนโซเชียล'],
    ['consequence', 'ผลที่ตามมา'], ['self-esteem', 'ความภูมิใจในตัวเอง'],
    ['moderation', 'การคัดกรองเนื้อหา'], ['attention', 'ความสนใจ/ยอดวิว']],
  cues: {
    O: 'Have you heard about the story on risky posts and teenagers?',
    P: 'Don’t you think it might be better to create a powerful documentary about this?',
    C: 'Apparently, a group of students copied a dangerous challenge and two of them ended up in hospital.',
    D: 'Focus: one challenge from the first post to the hospital. Interviews: teens, parents, doctors.',
    I: 'Viewers may understand peer pressure and say no more easily.'
  },
  model: {
    O: 'Have you heard about the story on social media posts and risky teenage behaviour?',
    P: 'Don’t you think it might be better to create a powerful documentary about this? Wouldn’t you like to know why a like is worth more than safety?',
    C: 'Apparently, a group of students copied a dangerous challenge from a short video, and two of them ended up in hospital. It was all over the news. They intended to make a funny clip for their friends, but shockingly, the video reached half a million people in a day.',
    D: 'The documentary would follow one challenge from the very first post to the hospital bed. It would include interviews with teenagers, worried parents, and emergency doctors. First, we show the fun side. However, we also show the hidden cost.',
    I: 'After watching it, viewers may recognise peer pressure, protect their friends, and refuse to film something dangerous.'
  },
  easy: 'Have you heard about risky posts on social media? Don’t you think we should make a documentary about this? Apparently, some students copied a dangerous challenge and two of them were hurt. It was all over the news. The documentary would focus on one challenge. It would include interviews with teenagers, parents, and doctors. After watching it, viewers may say no to dangerous trends.',
  challenge: [
    ['Isn’t it time we asked what a “like” really costs?', 'คำถามเชิงลบที่ทรงพลัง'],
    ['a raw, emotional portrait of teenage life', 'อัปเกรดคำบรรยายสารคดี'],
    ['They had never intended for it to go this far.', 'past perfect + intention'],
    ['peer pressure dressed up as fun', 'สำนวนเปรียบเทียบระดับสูง'],
    ['The film would refuse to name the challenge.', 'แสดงจริยธรรมการทำสารคดี']
  ]
},
{
  id: 3, level: 'Normal',
  en: 'More people get news only from headlines, not full articles.',
  th: 'ผู้คนจำนวนมากอ่านข่าวแค่พาดหัว ไม่ได้อ่านเนื้อข่าวทั้งหมด',
  sumTh: 'คนอ่านแค่พาดหัวแล้วเชื่อทันที ทำให้เข้าใจข่าวผิดและถกเถียงกันด้วยข้อมูลไม่ครบ',
  title: 'Beyond the Headline',
  angle: 'What we lose when a whole story is squeezed into eight words.',
  angleTh: 'เราสูญเสียอะไรเมื่อข่าวทั้งเรื่องถูกบีบให้เหลือแค่แปดคำ',
  people: ['Newspaper editors who write headlines', 'Commuters reading on the train', 'Media studies lecturers', 'People who were misjudged by a headline'],
  peopleTh: ['บรรณาธิการที่เขียนพาดหัว', 'คนอ่านข่าวบนรถไฟฟ้า', 'อาจารย์ด้านสื่อสารมวลชน', 'คนที่ถูกตัดสินผิดเพราะพาดหัวข่าว'],
  vocab: [
    ['headline', 'พาดหัวข่าว'], ['clickbait', 'พาดหัวล่อคลิก'],
    ['skim', 'อ่านผ่าน ๆ'], ['context', 'บริบท'],
    ['misleading', 'ชวนให้เข้าใจผิด'], ['attention span', 'ช่วงความสนใจ'],
    ['in-depth', 'เชิงลึก'], ['coverage', 'การรายงานข่าว']],
  cues: {
    O: 'Have you heard about the story on people reading only headlines?',
    P: 'Wouldn’t it be good to film a documentary about what we miss?',
    C: 'Apparently, a study found most readers share an article after reading eight words.',
    D: 'Focus: one headline vs the full story. Interviews: editors, commuters, lecturers.',
    I: 'Viewers may open the article before forming an opinion.'
  },
  model: {
    O: 'Have you heard about the news story on people who read only headlines?',
    P: 'Wouldn’t it be good to film a dramatic documentary about this? Isn’t it time to ask what we are missing every morning?',
    C: 'Apparently, a recent study found that most readers share an article after reading only the first eight words. It received a lot of coverage. Editors intended to save our time with short headlines, but shockingly, those headlines now replace the news completely.',
    D: 'The documentary would focus on one true story and its misleading headline. It would include interviews with newspaper editors, ordinary commuters, and media lecturers. First, we show the headline. Also, we read the full article aloud. However, the two versions tell completely different stories.',
    I: 'After watching it, viewers may slow down, open the article, and form an opinion only when they know the whole story.'
  },
  easy: 'Have you heard about people who read only headlines? Wouldn’t it be good to make a documentary about this? Apparently, many readers share a story after reading only eight words. It was all over the news. The documentary would focus on one headline and the real story behind it. It would include interviews with editors, readers, and teachers. After watching it, viewers may read the full article first.',
  challenge: [
    ['Don’t you think a headline is a promise the article often breaks?', 'คำถามเชิงลบ + อุปมา'],
    ['a quietly devastating look at modern reading', 'ภาษาสไตล์นักวิจารณ์'],
    ['The editors had intended to inform, not to mislead.', 'past perfect + intention'],
    ['strip a story of its context', 'คอลโลเคชันระดับสูง'],
    ['Finally, the film would print the same news twice.', 'ไอเดียโครงสร้างแปลกใหม่']
  ]
},
{
  id: 4, level: 'Challenge',
  en: 'Online influencers accused of spreading false health information.',
  th: 'อินฟลูเอนเซอร์ออนไลน์ถูกกล่าวหาว่าเผยแพร่ข้อมูลสุขภาพที่ผิด',
  sumTh: 'อินฟลูฯ ขายอาหารเสริมและวิธีรักษาที่ไม่มีหลักฐาน ทำให้ผู้ป่วยบางคนหยุดการรักษาจริง',
  title: 'Doctor Follower',
  angle: 'Why a stranger with a ring light sounds more convincing than a real doctor.',
  angleTh: 'ทำไมคนแปลกหน้าหน้ากล้องถึงฟังดูน่าเชื่อกว่าหมอตัวจริง',
  people: ['Doctors and pharmacists', 'Patients who stopped their real treatment', 'A former health influencer', 'Health regulators and lawyers'],
  peopleTh: ['แพทย์และเภสัชกร', 'ผู้ป่วยที่หยุดการรักษาจริง', 'อดีตอินฟลูฯ สายสุขภาพ', 'หน่วยงานกำกับดูแลและนักกฎหมาย'],
  vocab: [
    ['remedy', 'วิธีรักษา/ยาแก้'], ['side effect', 'ผลข้างเคียง'],
    ['evidence', 'หลักฐาน'], ['sponsorship', 'การสนับสนุนจากแบรนด์'],
    ['diagnosis', 'การวินิจฉัยโรค'], ['supplement', 'อาหารเสริม'],
    ['regulate', 'กำกับดูแล'], ['misleading claim', 'คำกล่าวอ้างที่ชวนเข้าใจผิด']],
  cues: {
    O: 'Have you heard about the story on influencers and false health advice?',
    P: 'Wouldn’t you like to know why we trust them more than doctors?',
    C: 'Apparently, an influencer sold a drink he claimed could replace medicine.',
    D: 'Focus: one product from studio to hospital. Interviews: doctors, patients, an ex-influencer.',
    I: 'Viewers may ask for evidence before believing health advice.'
  },
  model: {
    O: 'Have you heard about the news story on influencers who spread false health information?',
    P: 'Wouldn’t it be good to film a powerful documentary about this? Wouldn’t you like to know why we trust a stranger online more than a trained doctor?',
    C: 'Apparently, a popular influencer sold a herbal drink and claimed it could replace real medicine. It was all over the news. He intended to promote a healthy lifestyle, but shockingly, several followers stopped taking their prescriptions.',
    D: 'The documentary would focus on one product and follow it from the filming studio to a hospital ward. It would include interviews with doctors, patients who were harmed, and a former influencer who now regrets his videos. Also, we would show how sponsorship money works. However, we would let the influencers explain themselves.',
    I: 'After watching it, viewers may ask for evidence, check with a pharmacist, and stop believing advice that comes with a discount code.'
  },
  easy: 'Have you heard about influencers and wrong health information? Wouldn’t it be good to make a documentary about this? Apparently, one influencer sold a drink and said it could replace medicine. It was all over the news. The documentary would focus on that product. It would include interviews with doctors, patients, and a former influencer. After watching it, viewers may ask their doctor first.',
  challenge: [
    ['Isn’t it frightening that trust is now for sale?', 'คำถามเชิงลบเชิงวิพากษ์'],
    ['an uncomfortable, carefully balanced investigation', 'บรรยายโทนสารคดี'],
    ['She had intended to help, not to harm.', 'past perfect + intention'],
    ['evidence-based advice', 'ศัพท์วิชาการที่ใช้ได้จริง'],
    ['The film would end in a real pharmacy, not a studio.', 'ภาพปิดที่ทรงพลัง']
  ]
},
{
  id: 5, level: 'Normal',
  en: 'People prioritize mental health over career success.',
  th: 'ผู้คนให้ความสำคัญกับสุขภาพจิตมากกว่าความสำเร็จในอาชีพ',
  sumTh: 'คนรุ่นใหม่ยอมลาออกหรือลดตำแหน่งเพื่อรักษาสุขภาพจิต เปลี่ยนนิยามของคำว่าสำเร็จ',
  title: 'The Quiet Resignation',
  angle: 'A new generation is redefining success — and the older one does not understand yet.',
  angleTh: 'คนรุ่นใหม่กำลังนิยามความสำเร็จใหม่ ขณะที่คนรุ่นก่อนยังไม่เข้าใจ',
  people: ['Employees who resigned from good jobs', 'HR managers and company owners', 'Psychologists and therapists', 'Parents from an older generation'],
  peopleTh: ['พนักงานที่ลาออกจากงานดี ๆ', 'ฝ่ายบุคคลและเจ้าของบริษัท', 'นักจิตวิทยาและนักบำบัด', 'พ่อแม่รุ่นก่อน'],
  vocab: [
    ['burnout', 'ภาวะหมดไฟ'], ['work-life balance', 'สมดุลชีวิตและงาน'],
    ['ambition', 'ความทะเยอทะยาน'], ['therapy', 'การบำบัด'],
    ['promotion', 'การเลื่อนตำแหน่ง'], ['well-being', 'ความเป็นอยู่ที่ดี'],
    ['stigma', 'ตราบาป/อคติทางสังคม'], ['priority', 'สิ่งที่สำคัญที่สุด']],
  cues: {
    O: 'Have you heard about the story on mental health and career success?',
    P: 'Isn’t it time to have a serious conversation about burnout?',
    C: 'Apparently, a young manager refused a promotion to protect her health.',
    D: 'Focus: three workers for six months. Interviews: employees, HR, psychologists.',
    I: 'Viewers may rest without guilt and talk about stress at work.'
  },
  model: {
    O: 'Have you heard about the news story on people who now choose mental health over career success?',
    P: 'Wouldn’t it be good to film an honest documentary about this? Isn’t it time to have a serious conversation about burnout at work?',
    C: 'Apparently, a young manager turned down a big promotion because she could not sleep for three months. It received a lot of coverage. Her company intended to reward her hard work, but shockingly, the reward was exactly what made her ill.',
    D: 'The documentary would follow three workers for six months, from the office to the therapy room. It would include interviews with employees who resigned, HR managers, and psychologists. First, we show the salary. Also, we show the cost. However, we never say that ambition is wrong.',
    I: 'After watching it, viewers may rest without feeling guilty, talk openly about stress, and define success in their own way.'
  },
  easy: 'Have you heard about people who choose mental health over career success? Isn’t it time to make a documentary about this? Apparently, a young manager said no to a promotion because she was exhausted. It was all over the news. The documentary would focus on three workers for six months. It would include interviews with employees, HR managers, and psychologists. After watching it, viewers may take care of themselves.',
  challenge: [
    ['Don’t you think we measure success with the wrong ruler?', 'คำถามเชิงลบ + อุปมา'],
    ['a tender, slow-burning portrait of modern work', 'ภาษาระดับนักวิจารณ์'],
    ['They had intended to reward her, not to break her.', 'past perfect + intention'],
    ['a culture of quiet exhaustion', 'นามวลีระดับสูง'],
    ['Finally, the film would ask her boss to watch it.', 'ไอเดียปิดเรื่องแบบคม']
  ]
},
{
  id: 6, level: 'Easy',
  en: 'Grades matter less as students focus on practical skills.',
  th: 'เกรดสำคัญน้อยลง เพราะนักเรียนหันไปสนใจทักษะที่ใช้ได้จริง',
  sumTh: 'บริษัทเริ่มดูผลงานจริงมากกว่าเกรด นักเรียนจึงสร้างพอร์ตโฟลิโอแทนการไล่ล่าเกรด',
  title: 'What Is Your GPA Worth?',
  angle: 'Two students, one transcript and one portfolio — who gets the job?',
  angleTh: 'นักเรียนสองคน คนหนึ่งมีเกรด อีกคนมีผลงาน ใครได้งาน',
  people: ['Employers and HR recruiters', 'Students with high grades', 'Self-taught young workers', 'Teachers and school directors'],
  peopleTh: ['นายจ้างและฝ่ายสรรหา', 'นักเรียนที่เกรดสูง', 'คนทำงานรุ่นใหม่ที่เรียนรู้เอง', 'ครูและผู้บริหารโรงเรียน'],
  vocab: [
    ['transcript', 'ใบแสดงผลการเรียน'], ['portfolio', 'แฟ้มผลงาน'],
    ['hands-on', 'ลงมือทำจริง'], ['employability', 'ความพร้อมในการทำงาน'],
    ['curriculum', 'หลักสูตร'], ['internship', 'การฝึกงาน'],
    ['assess', 'ประเมิน'], ['skill gap', 'ช่องว่างของทักษะ']],
  cues: {
    O: 'Have you heard about the story on grades and practical skills?',
    P: 'Wouldn’t it be good to film a documentary about what employers really want?',
    C: 'Apparently, a company hired a student with a B average and refused a student with a perfect score.',
    D: 'Focus: two students for one year. Interviews: employers, students, teachers.',
    I: 'Viewers may build a portfolio and stop fearing one bad grade.'
  },
  model: {
    O: 'Have you heard about the news story on grades and practical skills?',
    P: 'Don’t you think it might be better to create an honest documentary about this? Wouldn’t you like to know what employers really look at?',
    C: 'Apparently, a technology company hired a student with average grades and rejected a student with a perfect transcript. It was all over the news. The school intended to celebrate its top student, but shockingly, the top student had never built anything.',
    D: 'The documentary would follow two students for one year, from the classroom to the job interview. It would include interviews with employers, students, and teachers who are changing their curriculum. Also, we would film a real interview. However, we would not pretend that grades are useless.',
    I: 'After watching it, viewers may start a portfolio, join an internship, and stop panicking about one bad grade.'
  },
  easy: 'Have you heard about grades and practical skills? Wouldn’t it be good to make a documentary about this? Apparently, a company hired a student with average grades, not the top student. It was all over the news. The documentary would focus on two students for one year. It would include interviews with employers, students, and teachers. After watching it, viewers may build real skills, not only grades.',
  challenge: [
    ['Isn’t it strange that we still rank children with a number?', 'คำถามเชิงลบเชิงตั้งคำถามกับระบบ'],
    ['a sharp, surprisingly hopeful film', 'อัปเกรดการบรรยาย'],
    ['The school had intended to motivate them, not to limit them.', 'past perfect + intention'],
    ['bridge the skill gap', 'คอลโลเคชันวิชาการ'],
    ['Finally, the film would show both of them five years later.', 'โครงสร้างเล่าข้ามเวลา']
  ]
},
{
  id: 7, level: 'Normal',
  en: 'Gap years become more popular among high school graduates.',
  th: 'การหยุดพัก 1 ปีก่อนเรียนต่อ (Gap Year) ได้รับความนิยมมากขึ้นในหมู่เด็กจบ ม.ปลาย',
  sumTh: 'เด็กจบใหม่เลือกพัก 1 ปีเพื่อทำงาน เดินทาง หรือหาตัวเอง ก่อนตัดสินใจเรียนต่อ',
  title: 'The Year Between',
  angle: 'Is a gap year a luxury for rich kids, or the most useful year of your life?',
  angleTh: 'Gap Year คือความฟุ่มเฟือยของเด็กมีเงิน หรือปีที่มีประโยชน์ที่สุดในชีวิต',
  people: ['Students taking a gap year', 'University admissions officers', 'Worried Thai parents', 'Employers who hire young staff'],
  peopleTh: ['นักเรียนที่กำลังทำ Gap Year', 'เจ้าหน้าที่รับเข้ามหาวิทยาลัย', 'พ่อแม่ชาวไทยที่เป็นห่วง', 'นายจ้างที่รับเด็กจบใหม่'],
  vocab: [
    ['gap year', 'ปีเว้นว่างก่อนเรียนต่อ'], ['defer', 'เลื่อนการเข้าเรียน'],
    ['independence', 'ความเป็นตัวของตัวเอง'], ['maturity', 'วุฒิภาวะ'],
    ['budget', 'งบประมาณ'], ['volunteer', 'อาสาสมัคร'],
    ['perspective', 'มุมมอง'], ['drop out', 'เลิกเรียนกลางคัน']],
  cues: {
    O: 'Have you heard about the story on gap years?',
    P: 'Don’t you think it might be better to show both sides in a documentary?',
    C: 'Apparently, more students are deferring university for a year.',
    D: 'Focus: three students, three different years. Interviews: students, parents, admissions officers.',
    I: 'Viewers may plan a gap year with a purpose, not just a holiday.'
  },
  model: {
    O: 'Have you heard about the news story on gap years becoming popular?',
    P: 'Wouldn’t it be good to film a documentary about this? Don’t you think parents and students should hear both sides of the story?',
    C: 'Apparently, one student deferred a top university place to work in a small hotel for twelve months. It received a lot of coverage. His parents intended to stop him, but shockingly, he came back with better grades and a clear plan.',
    D: 'The documentary would focus on three students and three very different gap years: one working, one volunteering, one travelling. It would include interviews with the students, their parents, and university admissions officers. However, we would also film the student whose gap year went wrong.',
    I: 'After watching it, viewers may plan a gap year with a real purpose, or decide honestly that university straight away is better for them.'
  },
  easy: 'Have you heard about gap years? Wouldn’t it be good to make a documentary about this? Apparently, one student waited a year before university and worked in a hotel. It was all over the news. The documentary would focus on three students with three different gap years. It would include interviews with students, parents, and university officers. After watching it, viewers may plan their year with a clear purpose.',
  challenge: [
    ['Wouldn’t you say a year of living is also an education?', 'คำถามเชิงลบ + แนวคิด'],
    ['a warm but unsentimental film', 'คำบรรยายระดับสูง'],
    ['His parents had intended to protect him, not to trap him.', 'past perfect + intention'],
    ['a year of deliberate uncertainty', 'นามวลีเชิงวรรณศิลป์'],
    ['Finally, we would meet all three on their first day at university.', 'ปิดเรื่องแบบร้อยเรียง']
  ]
},
{
  id: 8, level: 'Challenge',
  en: 'Young people spend more time talking to AI chatbots than to friends.',
  th: 'คนรุ่นใหม่ใช้เวลาคุยกับแชตบอต AI มากกว่าคุยกับเพื่อน',
  sumTh: 'คนรุ่นใหม่หันไปคุยกับ AI เพราะไม่ถูกตัดสินและตอบตลอด 24 ชั่วโมง จนความสัมพันธ์จริงลดลง',
  title: 'My Best Friend Has No Face',
  angle: 'Loneliness meets a machine that never judges, never sleeps and never says no.',
  angleTh: 'ความเหงาเจอกับเครื่องจักรที่ไม่ตัดสิน ไม่หลับ และไม่เคยปฏิเสธ',
  people: ['Young people who chat with AI daily', 'Psychologists studying loneliness', 'AI developers and designers', 'Friends and family who feel replaced'],
  peopleTh: ['คนรุ่นใหม่ที่คุยกับ AI ทุกวัน', 'นักจิตวิทยาที่ศึกษาความเหงา', 'นักพัฒนาและนักออกแบบ AI', 'เพื่อนและครอบครัวที่รู้สึกถูกแทนที่'],
  vocab: [
    ['loneliness', 'ความเหงา'], ['companion', 'เพื่อนคู่คิด'],
    ['empathy', 'ความเห็นอกเห็นใจ'], ['dependence', 'การพึ่งพา'],
    ['privacy', 'ความเป็นส่วนตัว'], ['isolation', 'การแยกตัว'],
    ['comfort', 'ความสบายใจ'], ['human contact', 'การสัมผัสกับคนจริง']],
  cues: {
    O: 'Have you heard about the story on young people and AI chatbots?',
    P: 'Isn’t it time to ask what a friend really is?',
    C: 'Apparently, a survey found many teenagers talk to a chatbot more than to their families.',
    D: 'Focus: one week with the phone, one week without. Interviews: users, psychologists, developers.',
    I: 'Viewers may message a real friend tonight.'
  },
  model: {
    O: 'Have you heard about the news story on young people who talk to AI chatbots more than to their friends?',
    P: 'Wouldn’t it be good to film a thoughtful documentary about this? Isn’t it time to ask what a real friend actually is?',
    C: 'Apparently, a national survey found that many teenagers now speak to a chatbot more often than to their own families. It was all over the news. The developers intended to build a helpful study tool, but shockingly, users started sharing their deepest secrets with it.',
    D: 'The documentary would focus on three young users for two weeks: one week with the app, one week without it. It would include interviews with the users, psychologists who study loneliness, and the developers themselves. However, we would never mock anyone for feeling lonely.',
    I: 'After watching it, viewers may understand why the app feels safe, and still choose to message a real friend tonight.'
  },
  easy: 'Have you heard about young people talking to AI chatbots? Isn’t it time to make a documentary about this? Apparently, many teenagers talk to a chatbot more than to their family. It was all over the news. The documentary would focus on three users for two weeks. It would include interviews with users, psychologists, and AI developers. After watching it, viewers may call a real friend.',
  challenge: [
    ['Don’t you think comfort without risk is not really friendship?', 'คำถามเชิงลบเชิงปรัชญา'],
    ['an intimate, quietly unsettling film', 'บรรยายโทนหนัง'],
    ['They had intended to build a tutor, not a confidant.', 'past perfect + intention'],
    ['emotional outsourcing', 'ศัพท์ใหม่ที่ฟังดูฉลาด'],
    ['Finally, the film would let the chatbot answer the last question.', 'ไอเดียตอนจบที่คม']
  ]
},
{
  id: 9, level: 'Normal',
  en: 'Fast fashion creates growing environmental problems around the world.',
  th: 'แฟชั่นด่วน (Fast Fashion) สร้างปัญหาสิ่งแวดล้อมที่รุนแรงขึ้นทั่วโลก',
  sumTh: 'เสื้อผ้าราคาถูกถูกผลิตและทิ้งเร็วมาก กลายเป็นภูเขาขยะและมลพิษในแม่น้ำ',
  title: 'The Price of Cheap',
  angle: 'Follow one 99-baht T-shirt from the factory to the landfill.',
  angleTh: 'ตามเสื้อยืดราคา 99 บาทหนึ่งตัว จากโรงงานจนถึงกองขยะ',
  people: ['Garment factory workers', 'Environmental scientists', 'Second-hand market sellers', 'Shoppers who post haul videos'],
  peopleTh: ['คนงานโรงงานเสื้อผ้า', 'นักวิทยาศาสตร์สิ่งแวดล้อม', 'พ่อค้าแม่ค้าตลาดมือสอง', 'คนที่โพสต์คลิปรีวิวเสื้อผ้าที่ซื้อมา'],
  vocab: [
    ['landfill', 'หลุมฝังกลบขยะ'], ['microplastics', 'ไมโครพลาสติก'],
    ['textile waste', 'ขยะสิ่งทอ'], ['supply chain', 'ห่วงโซ่อุปทาน'],
    ['sustainable', 'ยั่งยืน'], ['dye', 'สีย้อมผ้า'],
    ['overconsumption', 'การบริโภคเกินจำเป็น'], ['second-hand', 'มือสอง']],
  cues: {
    O: 'Have you heard about the story on fast fashion and the environment?',
    P: 'Wouldn’t it be good to film a documentary about the real price of cheap clothes?',
    C: 'Apparently, tonnes of unsold clothes were dumped in a desert.',
    D: 'Focus: one 99-baht T-shirt. Interviews: factory workers, scientists, second-hand sellers.',
    I: 'Viewers may buy less and wear clothes longer.'
  },
  model: {
    O: 'Have you heard about the news story on fast fashion and the environment?',
    P: 'Don’t you think it might be better to create a powerful documentary about this? Wouldn’t you like to know the real price of a cheap T-shirt?',
    C: 'Apparently, thousands of tonnes of unsold clothes were dumped in a desert, and the pile was so large it could be seen from space. It was all over the news. The brands intended to make fashion affordable, but shockingly, most of those clothes were never worn once.',
    D: 'The documentary would follow one ninety-nine-baht T-shirt from the factory to the landfill. It would include interviews with garment workers, environmental scientists, and second-hand market sellers. Also, we would film the river beside the dye factory. However, we would not blame ordinary shoppers.',
    I: 'After watching it, viewers may buy less, repair more, and look at a cheap price tag with completely different eyes.'
  },
  easy: 'Have you heard about fast fashion and the environment? Wouldn’t it be good to make a documentary about this? Apparently, tonnes of unsold clothes were dumped in a desert. It was all over the news. The documentary would follow one cheap T-shirt from the factory to the landfill. It would include interviews with workers, scientists, and second-hand sellers. After watching it, viewers may buy less and wear clothes longer.',
  challenge: [
    ['Isn’t it shocking that a T-shirt can outlive the person who wore it?', 'คำถามเชิงลบที่สร้างภาพจำ'],
    ['a visually stunning, uncomfortable journey', 'บรรยายสไตล์สารคดีจริง'],
    ['The brands had intended to democratise fashion, not to poison rivers.', 'past perfect + intention'],
    ['a throwaway culture', 'นามวลีเชิงสังคม'],
    ['Finally, the film would weigh one year of our own clothes.', 'ไอเดียตอนจบเชิงทดลอง']
  ]
},
{
  id: 10, level: 'Easy',
  en: 'Schools debate whether smartphones should be completely banned in classrooms.',
  th: 'โรงเรียนถกเถียงกันว่าควรห้ามใช้สมาร์ตโฟนในห้องเรียนโดยสิ้นเชิงหรือไม่',
  sumTh: 'บางโรงเรียนล็อกโทรศัพท์ทั้งเทอมแล้วพบว่าเด็กตั้งใจเรียนขึ้น แต่บางคนมองว่าเป็นการลิดรอนสิทธิ',
  title: 'Phones Down',
  angle: 'One school locked every phone for a term. Film what changed — and what was lost.',
  angleTh: 'โรงเรียนหนึ่งล็อกโทรศัพท์ทั้งเทอม ถ่ายให้เห็นว่าอะไรเปลี่ยน และอะไรที่หายไป',
  people: ['Teachers who support the ban', 'Students on both sides', 'Parents who want to contact their children', 'School principals and researchers'],
  peopleTh: ['ครูที่สนับสนุนการแบน', 'นักเรียนทั้งฝ่ายเห็นด้วยและไม่เห็นด้วย', 'ผู้ปกครองที่อยากติดต่อลูกได้', 'ผู้อำนวยการโรงเรียนและนักวิจัย'],
  vocab: [
    ['distraction', 'สิ่งรบกวนสมาธิ'], ['concentration', 'สมาธิ'],
    ['ban', 'การห้าม'], ['policy', 'นโยบาย'],
    ['screen time', 'เวลาอยู่หน้าจอ'], ['discipline', 'วินัย'],
    ['trial', 'การทดลองใช้'], ['argue', 'โต้แย้ง']],
  cues: {
    O: 'Have you heard about the story on banning smartphones in classrooms?',
    P: 'Wouldn’t it be good to film a documentary showing both sides?',
    C: 'Apparently, one school locked all phones for a whole term.',
    D: 'Focus: one school, one term. Interviews: teachers, students, parents.',
    I: 'Viewers may make a fair school phone policy together.'
  },
  model: {
    O: 'Have you heard about the news story on schools that want to ban smartphones completely?',
    P: 'Wouldn’t it be good to film a balanced documentary about this? Don’t you think students should be part of the decision?',
    C: 'Apparently, one school locked every phone in a box for a whole term. It received a lot of coverage. The teachers intended to improve concentration, but shockingly, the biggest change was in the playground, where students started talking to each other again.',
    D: 'The documentary would focus on that single school for one term. It would include interviews with teachers, students from both sides of the argument, and parents who still want to reach their children. First, we film day one. Also, we film the final exam. However, we would give the students the last word.',
    I: 'After watching it, viewers may understand both sides and help their own school write a fair, realistic phone policy.'
  },
  easy: 'Have you heard about schools banning smartphones? Wouldn’t it be good to make a documentary about this? Apparently, one school locked all the phones for a whole term. It was all over the news. The documentary would focus on that school for one term. It would include interviews with teachers, students, and parents. After watching it, viewers may understand both sides of the argument.',
  challenge: [
    ['Don’t you think a rule without a reason never lasts?', 'คำถามเชิงลบเชิงตรรกะ'],
    ['a fair-minded, observational documentary', 'คำศัพท์สายสารคดีจริง'],
    ['The school had intended to remove a distraction, not a lifeline.', 'past perfect + intention'],
    ['digital self-control', 'ศัพท์ที่ฟังดูเป็นผู้ใหญ่'],
    ['Finally, the students themselves would write the new rule.', 'ตอนจบที่ให้พลังกับผู้เรียน']
  ]
}
];

/* ---------- 4. DATA: QUIZ (26 items) ---------- */
const QUIZ = [
 {type:'mcq', q:'Which sentence is the BEST opening (Step 1) for a documentary pitch?',
  qth:'ประโยคใดเหมาะเป็น “Opening” ที่สุด',
  ch:['Have you heard about the story on fast fashion?','I will talk about fast fashion now.','Thank you for listening to my pitch.','Fast fashion is bad, the end.'],
  a:0, exp:'Step 1 ต้องเปิดด้วยคำถามชวนสนทนา เช่น Have you heard about…? / Did you hear the news about…?'},
 {type:'mcq', q:'Which is an indirect / negative question showing PURPOSE (Step 2)?',
  qth:'ข้อใดคือคำถามเชิงลบ/คำถามอ้อมที่ใช้บอกจุดประสงค์',
  ch:['I want to make a documentary.','Wouldn’t it be good to film a documentary about this?','A documentary is interesting.','Do you like documentaries?'],
  a:1, exp:'Step 2 ใช้ Wouldn’t it be good to…? / Don’t you think…? เพื่อเสนอไอเดียอย่างสุภาพและโน้มน้าว'},
 {type:'fill', q:'____ you think it might be better to create a powerful documentary?',
  qth:'เติมคำให้เป็นคำถามเชิงลบ', ans:["don't","dont","do not"],
  exp:'Don’t you think…? คือคำถามเชิงลบมาตรฐานของ Step 2 (Purpose)'},
 {type:'fill', q:'Wouldn’t it ____ good to film a dramatic documentary about stray dogs?',
  qth:'เติมกริยาให้ถูกต้อง', ans:['be'],
  exp:'หลัง Wouldn’t it ต้องตามด้วย be เสมอ → Wouldn’t it be good to…'},
 {type:'mcq', q:'“Apparently, a dog attacked two people.” — What does “Apparently” show?',
  qth:'คำว่า Apparently สื่อถึงอะไร',
  ch:['I saw it myself and I am sure.','I heard it from a source; this is what people say.','It is my personal opinion.','It will happen in the future.'],
  a:1, exp:'Apparently = “เท่าที่ทราบ/ได้ยินมาว่า” ใช้เล่าข่าวที่เราไม่ได้เห็นเอง เหมาะกับ Step 3'},
 {type:'fill', q:'It was all ____ the news.', qth:'เติมคำบุพบท', ans:['over'],
  exp:'It was all over the news. = ข่าวนี้ดังไปทั่ว เป็นวลีมาตรฐานของ Step 3'},
 {type:'fill', q:'The dog owner ____ to let people pet his dog. (past intention)',
  qth:'เติมกริยาแสดงความตั้งใจในอดีต', ans:['intended'],
  exp:'intended to + V1 = ตั้งใจจะทำ (แต่ผลลัพธ์มักไม่เป็นอย่างนั้น) เป็นแกรมมาร์หลักของ Unit นี้'},
 {type:'mcq', q:'Which sentence expresses PAST INTENTION correctly?',
  qth:'ข้อใดแสดง “ความตั้งใจในอดีต” ถูกต้อง',
  ch:['He intends to let people pet his dog.','He is letting people pet his dog.','He intended to let people pet his dog.','He will intend to let people pet his dog.'],
  a:2, exp:'Past intention ใช้ intended / had intended / was going to + V1'},
 {type:'mcq', q:'Which phrase belongs to Step 4 (Developing the idea)?',
  qth:'ข้อใดอยู่ในขั้นที่ 4 ขยายไอเดียสารคดี',
  ch:['Have you heard about…?','It was all over the news.','It would include interviews with…','After watching it, viewers may…'],
  a:2, exp:'Step 4 พูดถึงเนื้อหา มุมมอง และผู้ให้สัมภาษณ์ → It would include interviews with…'},
 {type:'fill', q:'After watching it, viewers ____ become more careful. (modal of possibility)',
  qth:'เติม modal verb แสดงความเป็นไปได้', ans:['may','might','will'],
  exp:'Step 5 นิยมใช้ may / might + V1 เพื่อบอกผลที่น่าจะเกิดกับผู้ชม'},
 {type:'order', q:'Arrange the opening question.', qth:'เรียงประโยคเปิดเรื่องให้ถูกต้อง',
  words:['Have','you','heard','about','the','news','story','?'],
  exp:'รูปคำถาม Present Perfect: Have + you + V3 + about + …'},
 {type:'order', q:'Arrange the purpose question.', qth:'เรียงคำถามบอกจุดประสงค์',
  words:['Wouldn’t','it','be','good','to','film','a','documentary','about','this','?'],
  exp:'Wouldn’t it be good to + V1 … ? เป็นสูตรตายตัวของ Step 2'},
 {type:'order', q:'Arrange the Step-4 sentence.', qth:'เรียงประโยคขั้นที่ 4',
  words:['It','would','include','interviews','with','experts','and','victims','.'],
  exp:'It would include interviews with + กลุ่มคน (ใช้ would เพราะยังเป็นไอเดีย ไม่ใช่เรื่องจริง)'},
 {type:'mcq', q:'What is the correct order of the 5 steps?',
  qth:'ลำดับ 5 ขั้นตอนที่ถูกต้องคือข้อใด',
  ch:['Impact → Opening → Purpose → News → Idea','Opening → Purpose → Core News → Documentary Idea → Impact','News → Opening → Impact → Purpose → Idea','Purpose → Opening → Idea → News → Impact'],
  a:1, exp:'จำว่า O-P-C-D-I: Opening, Purpose, Core News, Documentary Idea, Impact'},
 {type:'mcq', q:'“misinformation” means…', qth:'คำว่า misinformation แปลว่าอะไร',
  ch:['ข้อมูลที่ผิดหรือข่าวลวง','ข้อมูลลับของราชการ','ข้อมูลทางสถิติ','การให้ข้อมูลซ้ำ'],
  a:0, exp:'misinformation = ข้อมูลผิด/ข่าวลวงที่แพร่กระจายออกไป'},
 {type:'mcq', q:'“burnout” means…', qth:'คำว่า burnout แปลว่าอะไร',
  ch:['การเลื่อนตำแหน่ง','ภาวะหมดไฟจากการทำงานหนัก','การลาพักร้อน','ไฟไหม้ในที่ทำงาน'],
  a:1, exp:'burnout = ภาวะหมดไฟ เหนื่อยล้าทั้งกายและใจจากงาน'},
 {type:'mcq', q:'“landfill” means…', qth:'คำว่า landfill แปลว่าอะไร',
  ch:['ที่ดินเปล่า','หลุมฝังกลบขยะ','โรงงานรีไซเคิล','พื้นที่เกษตร'],
  a:1, exp:'landfill = หลุมฝังกลบขยะ ใช้บ่อยในหัวข้อสิ่งแวดล้อม'},
 {type:'mcq', q:'“clickbait” means…', qth:'คำว่า clickbait แปลว่าอะไร',
  ch:['โฆษณาที่จ่ายเงินแล้ว','พาดหัวล่อให้คนกดเข้าไปอ่าน','ปุ่มแชร์บนเว็บ','ข่าวเชิงลึก'],
  a:1, exp:'clickbait = พาดหัวเกินจริงเพื่อล่อยอดคลิก'},
 {type:'mcq', q:'Which connector shows CONTRAST in your pitch?',
  qth:'คำเชื่อมใดใช้แสดงความขัดแย้ง',
  ch:['Also','First','However','Finally'],
  a:2, exp:'However = แต่อย่างไรก็ตาม ใช้หักมุมในขั้นที่ 4'},
 {type:'mcq', q:'About how many words should you speak in one minute?',
  qth:'ใน 1 นาทีควรพูดประมาณกี่คำ',
  ch:['40–60 words','70–90 words','110–140 words','200–250 words'],
  a:2, exp:'ความเร็วพูดที่ฟังรู้เรื่องคือราว 2 คำ/วินาที → 110–140 คำต่อนาที'},
 {type:'fill', q:'The documentary would ____ on how deepfakes spread.',
  qth:'เติมกริยาให้เป็นวลีมาตรฐาน', ans:['focus'],
  exp:'focus on = มุ่งเน้นไปที่ เป็นวลีช่วยชีวิตเมื่อคิดไม่ออกกลางการพูด'},
 {type:'mcq', q:'Which sentence is the BEST ending (Step 5)?',
  qth:'ประโยคใดเหมาะปิดท้ายที่สุด',
  ch:['That’s all, thank you.','After watching it, viewers may think twice before sharing a video.','I don’t know what else to say.','The documentary is one hour long.'],
  a:1, exp:'Step 5 ต้องบอก “ผลที่เกิดกับผู้ชม” ไม่ใช่แค่กล่าวขอบคุณ'},
 {type:'order', q:'Arrange the impact sentence.', qth:'เรียงประโยคบอกผลกระทบ',
  words:['After','watching','it','viewers','may','think','twice','before','sharing','.'],
  exp:'After watching it, viewers may + V1 … เป็นสูตรปิดท้ายที่ปลอดภัยที่สุด'},
 {type:'fill', q:'Isn’t it ____ to talk about mental health at work?',
  qth:'เติมคำให้ได้สำนวน “ถึงเวลาหรือยังที่…”', ans:['time'],
  exp:'Isn’t it time to + V1? = ถึงเวลาแล้วหรือยังที่จะ… ใช้ใน Step 2'},
 {type:'mcq', q:'“Shockingly,” at the start of a sentence is used to…',
  qth:'คำว่า Shockingly, ใช้เพื่ออะไร',
  ch:['บอกเวลาที่เกิดเหตุ','เน้นว่าผลลัพธ์น่าตกใจ/พลิกความคาดหมาย','ขอโทษผู้ฟัง','สรุปจบการพูด'],
  a:1, exp:'Shockingly, ใช้เน้นการหักมุมของข่าวใน Step 3 ให้ดูน่าติดตาม'},
 {type:'mcq', q:'In Step 4, how many groups of interviewees should you mention?',
  qth:'ในขั้นที่ 4 ควรระบุผู้ให้สัมภาษณ์กี่กลุ่ม',
  ch:['ไม่ต้องระบุเลย','อย่างน้อย 3 กลุ่ม','เพียง 1 คนก็พอ','10 กลุ่มขึ้นไป'],
  a:1, exp:'ระบุอย่างน้อย 3 กลุ่ม เช่น ผู้เชี่ยวชาญ ผู้เสียหาย และคนทั่วไป ทำให้ไอเดียน่าเชื่อถือ'}
];

/* ---------- 5. LANGUAGE / THEME / FONT ---------- */
let lang = store.get('lang', 'th');
const L = () => lang;

function applyLang(root) {
  const scope = root || document;
  $$('[data-en]', scope).forEach(el => {
    const v = el.getAttribute('data-' + lang);
    if (v !== null) el.textContent = v;
  });
  $$('[data-en-ph]', scope).forEach(el => {
    const v = el.getAttribute('data-' + lang + '-ph');
    if (v !== null) el.placeholder = v;
  });
  document.documentElement.lang = lang;
  $('#langLabel').textContent = lang === 'th' ? 'EN' : 'ไทย';
}

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  store.set('theme', t);
}
let fontLevel = store.get('font', 1);
function setFont(n) {
  fontLevel = Math.max(0, Math.min(4, n));
  document.documentElement.style.fontSize = [14.5, 16, 17.5, 19, 20.5][fontLevel] + 'px';
  store.set('font', fontLevel);
}

/* ---------- 6. ROUTER ---------- */
function go(page) {
  $$('.page').forEach(p => p.classList.toggle('is-active', p.id === 'page-' + page));
  $$('.nav-btn').forEach(b => b.classList.toggle('is-active', b.dataset.page === page));
  $$('.mnav').forEach(b => b.classList.toggle('is-active', b.dataset.page === page));
  window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
  store.set('page', page);
  if (page === 'progress') renderProgress();
  if (page === 'home') renderHomeStats();
}

/* ---------- 7. RENDER: FORMULA ---------- */
function renderFormula() {
  $('#mnemo').innerHTML = STEPS.map((s, i) => `
    <div class="mn" style="--sc:${s.c}">
      <span class="mn-no">${String(i + 1).padStart(2, '0')}</span>
      <b>${s.k}</b><span class="mn-lab">${lang === 'th' ? s.th : s.en}</span>
    </div>`).join('');

  $('#stepsWrap').innerHTML = STEPS.map((s, i) => `
    <article class="step" style="--sc:${s.c}">
      <h3><span class="step-badge">${i + 1}</span> ${s.en} <small style="color:var(--muted);font-weight:500">· ${s.th}</small></h3>
      <p class="th">${lang === 'th' ? s.descTh : s.descEn}</p>
      <ul>${s.ex.map(e => `<li class="ex">${e}</li>`).join('')}</ul>
    </article>`).join('');

  $('#phraseBank').innerHTML = PHRASES.map(g => `
    <div class="pb-group" style="--sc:${g.c}">
      <h4><span class="pb-dot"></span>${lang === 'th' ? g.t_th : g.t_en}</h4>
      ${g.items.map(p => `<div class="pb-item"><span>${p}</span>
        <button class="pb-copy" data-copy="${p.replace(/"/g, '&quot;')}" aria-label="คัดลอกประโยค"><svg class="ico" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg></button></div>`).join('')}
    </div>`).join('');
}

function buildTemplate() {
  const v = id => ($('#' + id).value || '').trim();
  const txt =
`Have you heard about ${v('tplNews') || '…'}?
Wouldn’t it be good to film a ${v('tplAdj') || 'dramatic'} documentary about ${v('tplSubject') || '…'}?
Apparently, ${v('tplFact') || '…'}. It was all over the news. They intended to ${v('tplIntent') || '…'}, but shockingly, ${v('tplTwist') || '…'}.
The documentary would focus on ${v('tplFocus') || '…'}. It would include interviews with ${v('tplPeople') || '…'}.
After watching it, viewers may ${v('tplImpact') || '…'}.`;
  $('#tplOut').textContent = txt;
  $('#tplWC').textContent = countWords(txt) + ' words · ~' + Math.round(countWords(txt) / 2.2) + 's';
  store.set('tpl', ['tplNews','tplAdj','tplSubject','tplFact','tplIntent','tplTwist','tplFocus','tplPeople','tplImpact'].map(v2 => $('#' + v2).value));
  return txt;
}

/* ---------- 8. RENDER: TECHNIQUE ---------- */
function renderTechnique() {
  $('#timeline').innerHTML = PLAN.map((p, i) => `
    <div class="tl" data-i="${i}" style="--sc:${p.c}">
      <span class="tl-time">${p.t}</span>
      <div><b>${p.en}</b><small>${p.th}</small></div>
    </div>`).join('');
  $('#tipsWrap').innerHTML = TIPS.map(t => `<div class="tip"><b>${t.en}</b><span>${t.th}</span></div>`).join('');
}

/* ---------- 9. RENDER: EXAMPLES ---------- */
let exFilter = { q: '', level: 'all' };
const exState = {}; // id -> {th:boolean, model:boolean, tab:'normal'}

function renderTopics() {
  const list = $('#topicList');
  const items = TOPICS.filter(t => {
    if (exFilter.level !== 'all' && t.level !== exFilter.level) return false;
    if (!exFilter.q) return true;
    const hay = (t.en + ' ' + t.th + ' ' + t.title + ' ' + t.sumTh + ' ' + t.vocab.map(v => v.join(' ')).join(' ')).toLowerCase();
    return hay.indexOf(exFilter.q.toLowerCase()) > -1;
  });
  $('#topicEmpty').hidden = items.length > 0;

  list.innerHTML = items.map(t => {
    const st = exState[t.id] || (exState[t.id] = { th: false, model: false, tab: 'normal' });
    const wc = countWords(Object.values(t.model).join(' '));
    return `
    <article class="topic-card" data-id="${t.id}">
      <div class="tc-head">
        <div class="tc-num">${t.id}</div>
        <div>
          <h3>${t.en}<span class="lv lv-${t.level}">${t.level}</span></h3>
          <p class="tc-th" ${st.th ? '' : 'hidden'}><span class="th-tag">TH</span> ${t.th} — ${t.sumTh}</p>
        </div>
      </div>
      <div class="tc-body">
        <div class="doc-title"><span>${t.title}</span></div>
        <p class="muted small">${t.angle}</p>
        <p class="muted small" ${st.th ? '' : 'hidden'}>${t.angleTh}</p>

        <div class="mini-h">Interviewees · ผู้ให้สัมภาษณ์</div>
        <div class="people">${t.people.map((p, i) => `<span class="person">${p}${st.th ? ' <i style="color:var(--muted);font-style:normal">· ' + t.peopleTh[i] + '</i>' : ''}</span>`).join('')}</div>

        <div class="mini-h">Key vocabulary · คำศัพท์สำคัญ 8 คำ</div>
        <div class="vocab">${t.vocab.map(v => `<div class="voc"><b>${v[0]}</b><i>${v[1]}</i></div>`).join('')}</div>

        <div class="mini-h">Cues · คำใบ้ตามสูตร 5 ขั้นตอน</div>
        <div class="cue-card">${STEPS.map(s => `
          <div class="cue" style="--sc:${s.c}"><b>${s.k}</b>${t.cues[s.k]}<i>${s.th}</i></div>`).join('')}</div>

        <div class="tabs" role="group" aria-label="ระดับความยาก">
          <button class="tab ${st.tab === 'easy' ? 'is-on' : ''}" data-tab="easy">Easy</button>
          <button class="tab ${st.tab === 'normal' ? 'is-on' : ''}" data-tab="normal">Normal</button>
          <button class="tab ${st.tab === 'challenge' ? 'is-on' : ''}" data-tab="challenge">Challenge</button>
          <span class="wc">${wc} words · ~${Math.round(wc / 2.2)}s</span>
        </div>

        <div class="model-box" ${st.model ? '' : 'hidden'}>${modelHTML(t, st.tab)}</div>

        <div class="tc-actions">
          <button class="btn btn-ghost sm act-th">${st.th ? (lang === 'th' ? 'ซ่อนคำแปล' : 'Hide TH') : (lang === 'th' ? 'ดูคำแปล' : 'Show TH')}</button>
          <button class="btn btn-ghost sm act-model">${st.model ? (lang === 'th' ? 'ซ่อนตัวอย่าง' : 'Hide model') : (lang === 'th' ? 'ดูตัวอย่างบทพูด' : 'Show model')}</button>
          <button class="btn btn-ghost sm act-copy">${lang === 'th' ? 'คัดลอกบทพูด' : 'Copy script'}</button>
          <button class="btn btn-accent sm act-practice">${lang === 'th' ? 'ฝึกหัวข้อนี้' : 'Practise this'}</button>
        </div>
      </div>
    </article>`;
  }).join('');
}

function modelHTML(t, tab) {
  if (tab === 'easy') {
    return `<p class="small muted">${lang === 'th' ? 'เวอร์ชันง่าย: ประโยคสั้น จำง่าย เหมาะกับผู้เริ่มต้น' : 'Easy version: short, simple sentences.'}</p>
      <span class="ms ms-o">${t.easy}</span>
      <p class="wc">${countWords(t.easy)} words</p>`;
  }
  if (tab === 'challenge') {
    return `<p class="small muted">${lang === 'th' ? 'เวอร์ชันท้าทาย: ใช้เวอร์ชัน Normal แล้วอัปเกรดด้วยวลีเหล่านี้' : 'Challenge: upgrade the Normal version with these.'}</p>
      ${t.challenge.map(c => `<div class="up">${c[0]}<i>${c[1]}</i></div>`).join('')}`;
  }
  return STEPS.map(s => `<span class="ms ms-${s.k.toLowerCase()}"><strong>${s.k}.</strong> ${t.model[s.k]}</span>`).join('') +
    `<p class="wc">${countWords(Object.values(t.model).join(' '))} words · ~${Math.round(countWords(Object.values(t.model).join(' ')) / 2.2)}s</p>`;
}

function scriptText(t, tab) {
  if (tab === 'easy') return t.easy;
  if (tab === 'challenge') return Object.values(t.model).join(' ') + '\n\nUpgrades:\n' + t.challenge.map(c => '• ' + c[0]).join('\n');
  return STEPS.map(s => t.model[s.k]).join(' ');
}

/* ---------- 10. TIMER CLASS ---------- */
const CIRC = 339.292;
class CountTimer {
  constructor(onTick, onEnd) {
    this.onTick = onTick; this.onEnd = onEnd;
    this.id = null; this.total = 0; this.remain = 0; this.end = 0; this.state = 'idle';
  }
  start(sec) {
    this.stop();                       // guard: never run two intervals
    this.total = sec; this.remain = sec * 1000;
    this.end = Date.now() + this.remain; this.state = 'running';
    this._loop();
  }
  _loop() {
    if (this.id) { clearInterval(this.id); this.id = null; }
    this.id = setInterval(() => this._tick(), 100);
    this._tick();
  }
  _tick() {
    if (this.state !== 'running') return;
    this.remain = Math.max(0, this.end - Date.now());
    if (this.onTick) this.onTick(this.remain / 1000, this.total);
    if (this.remain <= 0) { this.stop(); this.state = 'done'; if (this.onEnd) this.onEnd(); }
  }
  pause() {
    if (this.state !== 'running') return;
    this.remain = Math.max(0, this.end - Date.now());
    this.state = 'paused';
    if (this.id) { clearInterval(this.id); this.id = null; }
  }
  resume() {
    if (this.state !== 'paused') return;
    this.end = Date.now() + this.remain; this.state = 'running'; this._loop();
  }
  stop() {
    if (this.id) { clearInterval(this.id); this.id = null; }
    if (this.state === 'running' || this.state === 'paused') this.state = 'idle';
  }
  reset() { this.stop(); this.state = 'idle'; this.remain = 0; }
}
function paintRing(ringEl, timeEl, sec, total) {
  const p = total ? sec / total : 0;
  ringEl.style.strokeDashoffset = String(CIRC * (1 - p));
  timeEl.textContent = Math.ceil(sec);
}

/* ---------- 11. PRACTICE ---------- */
let pracTopic = TOPICS[0];
let pracPhase = 'idle';
let pracLastSec = -1;
const pracTimer = new CountTimer(
  (s, t) => {
    paintRing($('#pracRing'), $('#pracTime'), s, t);
    const card = $('#page-practice .timer-card');
    card.classList.toggle('is-warn', s <= 5.4);
    const cur = Math.ceil(s);
    if (cur !== pracLastSec) { pracLastSec = cur; if (cur <= 3 && cur > 0) beep(760, .12, .12); }
  },
  () => {
    if (pracPhase === 'prep') {
      beep(1050, .3, .2);
      pracPhase = 'speak';
      $('#pracPhase').textContent = lang === 'th' ? 'พูดเลย!' : 'SPEAK!';
      $('#page-practice .timer-card').classList.add('is-speak');
      pracTimer.start(60);
    } else if (pracPhase === 'speak') {
      beep(520, .45, .22);
      pracPhase = 'idle';
      $('#pracPhase').textContent = lang === 'th' ? 'จบแล้ว' : 'Finished';
      $('#page-practice .timer-card').classList.remove('is-speak');
      toast(lang === 'th' ? 'ครบ 1 นาทีแล้ว เก่งมาก' : 'One minute done');
      addHistory('practice', pracTopic.id);
    }
  }
);

function fillTopicSelect(sel) {
  sel.innerHTML = TOPICS.map(t => `<option value="${t.id}">${t.id}. ${t.en}</option>`).join('');
}
function setPracTopic(id) {
  pracTopic = TOPICS.find(t => t.id === +id) || TOPICS[0];
  $('#pracTopic').value = pracTopic.id;
  $('#pracTopicText').textContent = pracTopic.en;
  $('#pracTopicTH').textContent = pracTopic.th;
  $('#cueCard').innerHTML = STEPS.map(s => `<div class="cue" style="--sc:${s.c}"><b>${s.k}</b>${pracTopic.cues[s.k]}<i>${lang === 'th' ? s.th : s.en}</i></div>`).join('');
  loadNotes();
  store.set('lastTopic', pracTopic.id);
}
function renderNotes() {
  $('#notesWrap').innerHTML = STEPS.map(s => `
    <div class="note" style="--sc:${s.c}">
      <label for="note${s.k}">${s.k} · ${s.en} (${s.th})</label>
      <textarea id="note${s.k}" data-step="${s.k}" placeholder="${s.ex[0]}" aria-label="โน้ตขั้นตอน ${s.en}"></textarea>
    </div>`).join('');
  $$('#notesWrap textarea').forEach(ta => ta.addEventListener('input', updateNoteWC));
}
function noteKey() { return 'notes_' + pracTopic.id; }
function loadNotes() {
  const data = store.get(noteKey(), {});
  STEPS.forEach(s => { const el = $('#note' + s.k); if (el) el.value = data[s.k] || ''; });
  updateNoteWC();
}
function collectNotes() {
  const o = {}; STEPS.forEach(s => { const el = $('#note' + s.k); o[s.k] = el ? el.value : ''; }); return o;
}
function updateNoteWC() {
  const txt = Object.values(collectNotes()).join(' ');
  const w = countWords(txt);
  $('#noteWC').textContent = w + ' words · ~' + Math.round(w / 2.2) + 's';
}

/* ---------- 12. EXAM ---------- */
let examTopic = null, examPhase = 'idle', examLastSec = -1;
const examTimer = new CountTimer(
  (s, t) => {
    paintRing($('#examRing'), $('#examTime'), s, t);
    $('#examCard').classList.toggle('is-warn', s <= 5.4);
    const cur = Math.ceil(s);
    if (cur !== examLastSec) { examLastSec = cur; if (cur <= 3 && cur > 0) beep(760, .12, .12); }
  },
  () => {
    if (examPhase === 'prep') {
      beep(1050, .3, .2);
      examPhase = 'speak';
      $('#examPhase').textContent = lang === 'th' ? 'พูดเลย!' : 'SPEAK!';
      $('#examState').textContent = lang === 'th' ? 'กำลังพูด (60 วินาที)' : 'Speaking (60s)';
      $('#examCard').classList.add('is-speak');
      examTimer.start(60);
    } else if (examPhase === 'speak') {
      beep(520, .45, .22);
      examPhase = 'done';
      $('#examCard').classList.remove('is-speak');
      $('#examPhase').textContent = lang === 'th' ? 'จบการสอบ' : 'Finished';
      $('#examState').textContent = lang === 'th' ? 'สอบเสร็จแล้ว — ดูเฉลยได้' : 'Finished — answers unlocked';
      $('#examAfter').hidden = false;
      if (recorder && recorder.state === 'recording') stopRecording();
      addHistory('exam', examTopic.id);
      toast(lang === 'th' ? 'จบการสอบ เปิดดูเฉลยได้แล้ว' : 'Exam finished');
    }
  }
);

function rollTopic(target, cb) {
  const el = $(target);
  if (REDUCED) { const t = TOPICS[Math.floor(Math.random() * TOPICS.length)]; el.textContent = t.en; cb && cb(t); return; }
  el.classList.add('rolling');
  let n = 0;
  const iv = setInterval(() => {
    el.textContent = TOPICS[Math.floor(Math.random() * TOPICS.length)].en;
    n++;
    if (n > 13) {
      clearInterval(iv);
      const t = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      el.textContent = t.en;
      el.classList.remove('rolling');
      beep(900, .12, .12);
      cb && cb(t);
    }
  }, 75);
}

/* Recording */
let recorder = null, chunks = [], stream = null;
function recMsg(msg) { const el = $('#recMsg'); el.hidden = false; el.textContent = msg; }
async function startRecording() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
    recMsg(lang === 'th'
      ? 'เบราว์เซอร์นี้อัดเสียงไม่ได้ ลองเปิดผ่าน Chrome/Safari และใช้ https หรือ localhost'
      : 'Recording is not supported here. Use Chrome/Safari over https or localhost.');
    return;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      const url = URL.createObjectURL(blob);
      $('#recAudio').src = url;
      $('#recDownload').href = url;
      $('#recPlayer').hidden = false;
      if (stream) stream.getTracks().forEach(t => t.stop());
      toast(lang === 'th' ? 'อัดเสียงเสร็จแล้ว ฟังย้อนหลังได้' : 'Recording ready');
    };
    recorder.start();
    $('#recBtn').textContent = lang === 'th' ? 'หยุดอัด' : 'Stop';
    $('#recBtn').classList.add('rec-on');
    $('#recMsg').hidden = true;
  } catch (e) {
    recMsg(lang === 'th'
      ? 'ไม่สามารถใช้ไมโครโฟนได้ กรุณาอนุญาตสิทธิ์ไมโครโฟนในเบราว์เซอร์ แล้วลองใหม่ (ฝึกพูดต่อได้ตามปกติ)'
      : 'Microphone unavailable. Please allow mic permission and try again.');
  }
}
function stopRecording() {
  if (recorder && recorder.state !== 'inactive') recorder.stop();
  $('#recBtn').textContent = lang === 'th' ? 'อัดเสียง' : 'Record voice';
  $('#recBtn').classList.remove('rec-on');
}

/* ---------- 13. QUIZ ---------- */
let quizSet = [], quizAnswered = 0, quizCorrect = 0;
function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; }

function startQuiz() {
  const n = +$('#quizLen').value;
  quizSet = shuffle(QUIZ).slice(0, n);
  quizAnswered = 0; quizCorrect = 0;
  updateQuizHead();
  $('#quizBody').innerHTML = quizSet.map((q, i) => qCardHTML(q, i)).join('');
  bindQuiz();
  toast(lang === 'th' ? 'สุ่มข้อสอบใหม่แล้ว' : 'New set generated');
}
function qCardHTML(q, i) {
  const type = q.type === 'mcq' ? 'Multiple choice' : q.type === 'fill' ? 'Fill in' : 'Word order';
  let body = '';
  if (q.type === 'mcq') {
    q._order = shuffle(q.ch.map((c, idx) => ({ c, idx })));
    body = `<div class="choices">${q._order.map((o, k) => `<button class="choice" data-i="${i}" data-k="${k}">${String.fromCharCode(65 + k)}. ${o.c}</button>`).join('')}</div>`;
  } else if (q.type === 'fill') {
    body = `<div class="fill-row">
        <input class="tpl fill-in" data-i="${i}" aria-label="พิมพ์คำตอบ" placeholder="${lang === 'th' ? 'พิมพ์คำตอบ…' : 'type here…'}" />
        <button class="btn btn-primary sm q-check" data-i="${i}">${lang === 'th' ? 'ตรวจ' : 'Check'}</button>
      </div>`;
  } else {
    q._pool = shuffle(q.words);
    body = `<div class="build-box" data-i="${i}" id="build${i}"></div>
      <div class="word-pool" data-i="${i}">${q._pool.map((w, k) => `<button class="wd" data-i="${i}" data-k="${k}">${w}</button>`).join('')}</div>
      <div class="row"><button class="btn btn-primary sm q-check" data-i="${i}">${lang === 'th' ? 'ตรวจ' : 'Check'}</button>
      <button class="btn btn-ghost sm q-undo" data-i="${i}">${lang === 'th' ? 'ย้อนกลับ' : 'Undo'}</button></div>`;
  }
  return `<div class="q-card" id="q${i}">
    <div class="q-top"><span>Q${i + 1}</span><span class="q-type">${type}</span></div>
    <p class="q-text">${q.q}</p><p class="q-th">${q.qth}</p>
    ${body}<div class="exp" id="exp${i}" hidden></div></div>`;
}
function bindQuiz() {
  $$('#quizBody .choice').forEach(b => b.addEventListener('click', onChoice));
  $$('#quizBody .q-check').forEach(b => b.addEventListener('click', onCheck));
  $$('#quizBody .wd').forEach(b => b.addEventListener('click', onWord));
  $$('#quizBody .q-undo').forEach(b => b.addEventListener('click', onUndo));
  $$('#quizBody .fill-in').forEach(inp => inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); onCheck({ currentTarget: { dataset: { i: inp.dataset.i } } }); } }));
}
function lock(i) { $$('#q' + i + ' button').forEach(b => b.disabled = true); const f = $('#q' + i + ' .fill-in'); if (f) f.disabled = true; }
function showExp(i, ok, extra) {
  const el = $('#exp' + i);
  el.hidden = false;
  el.className = 'exp ' + (ok ? 'ok' : 'no');
  el.innerHTML = '<b class="exp-tag">' + (ok ? (lang === 'th' ? 'ถูกต้อง' : 'Correct') : (lang === 'th' ? 'ยังไม่ถูก' : 'Not quite')) + '</b> ' + (extra ? extra + '<br>' : '') + quizSet[i].exp;
  quizAnswered++; if (ok) quizCorrect++;
  updateQuizHead();
  if (quizAnswered === quizSet.length) finishQuiz();
}
function onChoice(e) {
  const i = +e.currentTarget.dataset.i, k = +e.currentTarget.dataset.k, q = quizSet[i];
  if (q._done) return; q._done = true;
  const chosen = q._order[k], ok = chosen.idx === q.a;
  e.currentTarget.classList.add(ok ? 'right' : 'wrong');
  if (!ok) {
    const ci = q._order.findIndex(o => o.idx === q.a);
    const btn = $('#q' + i + ' .choice[data-k="' + ci + '"]');
    if (btn) btn.classList.add('right');
  }
  lock(i); beep(ok ? 880 : 300, .15, .12);
  showExp(i, ok);
}
function onCheck(e) {
  const i = +e.currentTarget.dataset.i, q = quizSet[i];
  if (q._done) return;
  let ok = false, extra = '';
  if (q.type === 'fill') {
    const val = ($('#q' + i + ' .fill-in').value || '').trim().toLowerCase().replace(/[.,!?]/g, '').replace(/’/g, "'");
    ok = q.ans.some(a => a.toLowerCase().replace(/’/g, "'") === val);
    extra = lang === 'th' ? 'คำตอบ: <b>' + q.ans[0] + '</b>' : 'Answer: <b>' + q.ans[0] + '</b>';
  } else {
    const built = (q._built || []).join(' ');
    ok = built === q.words.join(' ');
    extra = (lang === 'th' ? 'ประโยคที่ถูก: ' : 'Correct: ') + '<b>' + q.words.join(' ').replace(/ \?/, '?').replace(/ \./, '.') + '</b>';
  }
  q._done = true; lock(i); beep(ok ? 880 : 300, .15, .12);
  showExp(i, ok, extra);
}
function onWord(e) {
  const i = +e.currentTarget.dataset.i, q = quizSet[i];
  if (q._done) return;
  q._built = q._built || []; q._picked = q._picked || [];
  q._built.push(e.currentTarget.textContent);
  q._picked.push(e.currentTarget);
  e.currentTarget.classList.add('used');
  $('#build' + i).textContent = q._built.join(' ');
}
function onUndo(e) {
  const i = +e.currentTarget.dataset.i, q = quizSet[i];
  if (q._done || !q._built || !q._built.length) return;
  q._built.pop();
  const last = q._picked.pop(); if (last) last.classList.remove('used');
  $('#build' + i).textContent = q._built.join(' ');
}
function updateQuizHead() {
  $('#quizScore').textContent = quizCorrect + ' / ' + quizSet.length;
  $('#quizBar').style.width = (quizSet.length ? (quizAnswered / quizSet.length) * 100 : 0) + '%';
  const best = store.get('quizBest', null);
  $('#quizBestPill').textContent = 'Best: ' + (best === null ? '–' : best + '%');
}
function finishQuiz() {
  const pct = Math.round((quizCorrect / quizSet.length) * 100);
  const best = store.get('quizBest', 0);
  if (pct > best) { store.set('quizBest', pct); toast(lang === 'th' ? 'สถิติใหม่ ' + pct + '%' : 'New best ' + pct + '%'); }
  updateQuizHead();
  const msg = pct >= 90 ? (lang === 'th' ? 'ยอดเยี่ยมมาก! พร้อมสอบแล้ว' : 'Excellent! Exam-ready.')
    : pct >= 70 ? (lang === 'th' ? 'ดีมาก! ทบทวนข้อที่ผิดอีกนิด' : 'Good! Review your mistakes.')
    : (lang === 'th' ? 'ไปทบทวนหน้าสูตรพูดอีกรอบนะ' : 'Review the Formula page again.');
  const div = document.createElement('div');
  div.className = 'card quiz-result';
  div.innerHTML = `<div class="big">${pct}%</div><p>${quizCorrect} / ${quizSet.length}</p><p class="muted">${msg}</p>`;
  $('#quizBody').appendChild(div);
  div.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
  addHistory('quiz', null, pct);
}

/* ---------- 14. PROGRESS ---------- */
const RUBRIC = [
  ['Structure', 'ครบ 5 ขั้นตอน O-P-C-D-I'], ['Content', 'เนื้อหาชัดเจน มีรายละเอียด'],
  ['Grammar', 'คำถามเชิงลบ / past intention ถูกต้อง'], ['Vocabulary', 'ใช้คำศัพท์ของหัวข้อได้ดี'],
  ['Fluency', 'พูดลื่นไหล ไม่ติดขัดนาน'], ['Pronunciation', 'ออกเสียงชัด ฟังเข้าใจ'],
  ['Time Management', 'ใช้เวลาใกล้ 1 นาทีพอดี']
];
function renderRubric() {
  $('#rubric').innerHTML = RUBRIC.map((r, i) => `
    <div class="rub">
      <label for="rub${i}">${r[0]}<small>${r[1]}</small></label>
      <input type="range" id="rub${i}" min="1" max="5" step="1" value="1" aria-label="${r[0]}" />
      <output id="rubo${i}">1</output>
    </div>`).join('');
  $$('#rubric input').forEach((inp, i) => inp.addEventListener('input', () => { $('#rubo' + i).textContent = inp.value; updateRubTotal(); }));
  updateRubTotal();
}
function updateRubTotal() {
  const total = $$('#rubric input').reduce((s, i) => s + (+i.value), 0);
  $('#rubTotal').textContent = total;
  const adv = total >= 31 ? 'พร้อมสอบมาก! รักษาจังหวะการพูดไว้ และลองใช้วลีระดับ Challenge เพิ่ม'
    : total >= 25 ? 'ดีแล้ว! เน้นฝึกให้พูดลื่นขึ้นและจบให้ตรงเวลา 1 นาที'
    : total >= 18 ? 'กำลังไปได้ดี ลองอัดเสียงตัวเองแล้วฟังซ้ำ โฟกัสขั้นที่ยังอ่อน'
    : 'เริ่มจากท่องโครง O-P-C-D-I และใช้ Template เติมคำก่อน แล้วค่อยฝึกจับเวลา';
  $('#rubAdvice').textContent = adv;
}
function addHistory(kind, topicId, score) {
  const h = store.get('history', []);
  h.unshift({ kind, topicId, score: (score === undefined ? null : score), at: Date.now() });
  store.set('history', h.slice(0, 40));
  if (kind === 'practice' || kind === 'exam' || kind === 'rate') {
    store.set('practiceCount', store.get('practiceCount', 0) + 1);
    if (topicId) {
      const done = store.get('doneTopics', []);
      if (done.indexOf(topicId) === -1) { done.push(topicId); store.set('doneTopics', done); }
    }
  }
  renderHomeStats();
}
function renderHomeStats() {
  const done = store.get('doneTopics', []);
  $('#statPractice').textContent = store.get('practiceCount', 0);
  const scores = store.get('scores', []);
  $('#statLastScore').textContent = scores.length ? scores[0] : '–';
  const b = store.get('quizBest', null);
  $('#statQuizBest').textContent = b === null ? '–' : b + '%';
  $('#statTopics').textContent = done.length + '/10';
  $('#homeBar').style.width = (done.length / 10 * 100) + '%';
}
function renderProgress() {
  const done = store.get('doneTopics', []);
  const scores = store.get('scores', []);
  $('#pgPractice').textContent = store.get('practiceCount', 0);
  const b = store.get('quizBest', null);
  $('#pgQuiz').textContent = b === null ? '–' : b + '%';
  $('#pgAvg').textContent = scores.length ? (scores.reduce((a, c) => a + c, 0) / scores.length).toFixed(1) : '–';
  $('#pgBar').style.width = (done.length / 10 * 100) + '%';
  $('#pgBarLab').textContent = done.length + ' / 10 ' + (lang === 'th' ? 'หัวข้อที่ฝึกแล้ว' : 'topics practised');
  $('#pgTopics').innerHTML = TOPICS.map(t => `
    <div class="pg-t ${done.indexOf(t.id) > -1 ? 'done' : ''}">
      <b class="tick${done.indexOf(t.id) > -1 ? ' on' : ''}" aria-hidden="true"></b><span title="${t.en}">${t.id}. ${t.en}</span>
    </div>`).join('');
  const h = store.get('history', []);
  $('#historyList').innerHTML = h.length ? h.map(x => {
    const d = new Date(x.at);
    const when = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const name = x.kind === 'quiz' ? (lang === 'th' ? 'แบบทดสอบ' : 'Quiz')
      : x.kind === 'exam' ? (lang === 'th' ? 'จำลองสอบ' : 'Exam')
      : x.kind === 'rate' ? (lang === 'th' ? 'ประเมินตนเอง' : 'Self-rating')
      : (lang === 'th' ? 'ฝึกพูด' : 'Practice');
    const tp = x.topicId ? ' · ' + (lang === 'th' ? 'หัวข้อ ' : 'Topic ') + x.topicId : '';
    const sc = x.score !== null && x.score !== undefined ? ' · <b>' + x.score + (x.kind === 'quiz' ? '%' : '/35') + '</b>' : '';
    return `<li><span>${name}${tp}${sc}</span><span class="muted">${when}</span></li>`;
  }).join('') : `<li class="muted">${lang === 'th' ? 'ยังไม่มีประวัติการฝึก เริ่มฝึกเลย!' : 'No history yet.'}</li>`;
}

/* ---------- 15. INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  /* theme / font / lang */
  setTheme(store.get('theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  setFont(fontLevel);
  applyLang();

  $('#btnTheme').addEventListener('click', () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
  $('#btnFontInc').addEventListener('click', () => { setFont(fontLevel + 1); toast('A+'); });
  $('#btnFontDec').addEventListener('click', () => { setFont(fontLevel - 1); toast('A−'); });
  $('#btnLang').addEventListener('click', () => {
    lang = lang === 'th' ? 'en' : 'th';
    store.set('lang', lang);
    applyLang();
    renderFormula(); renderTechnique(); renderTopics(); renderNotes();
    setPracTopic(pracTopic.id); renderProgress(); renderHomeStats();
    toast(lang === 'th' ? 'เปลี่ยนเป็นภาษาไทยแล้ว' : 'Switched to English');
  });

  /* nav */
  $$('.nav-btn, .mnav').forEach(b => b.addEventListener('click', () => go(b.dataset.page)));
  $$('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));

  /* render all */
  renderFormula(); renderTechnique(); renderTopics(); renderNotes(); renderRubric();
  fillTopicSelect($('#pracTopic')); fillTopicSelect($('#rubTopic'));
  setPracTopic(store.get('lastTopic', 1));
  renderHomeStats(); renderProgress(); updateQuizHead();

  /* restore template */
  const tpl = store.get('tpl', null);
  if (tpl) ['tplNews','tplAdj','tplSubject','tplFact','tplIntent','tplTwist','tplFocus','tplPeople','tplImpact']
    .forEach((id, i) => { if (tpl[i]) $('#' + id).value = tpl[i]; });

  /* home random */
  $('#homeRandom').addEventListener('click', () => {
    $('#homeRandomBox').hidden = false;
    rollTopic('#homeRandomText', t => { setPracTopic(t.id); toast(lang === 'th' ? 'ได้หัวข้อที่ ' + t.id : 'Topic ' + t.id); });
  });

  /* phrase copy (delegated) */
  document.addEventListener('click', e => {
    const b = e.target.closest('.pb-copy');
    if (b) copyText(b.dataset.copy);
  });

  /* template */
  $('#tplBuild').addEventListener('click', () => { buildTemplate(); toast(lang === 'th' ? 'สร้างบทพูดแล้ว' : 'Pitch built'); });
  $('#tplCopy').addEventListener('click', () => copyText($('#tplOut').textContent || buildTemplate()));
  $('#tplClear').addEventListener('click', () => {
    $$('.template-card .tpl').forEach(i => i.value = '');
    $('#tplOut').textContent = ''; $('#tplWC').textContent = '0 words';
    store.del('tpl'); toast(lang === 'th' ? 'ล้างแล้ว' : 'Cleared');
  });
  $$('.template-card .tpl').forEach(i => i.addEventListener('input', () => { if ($('#tplOut').textContent) buildTemplate(); }));

  /* timeline demo */
  let tlTimer = null, tlSec = 30;
  const tlPaint = () => {
    $('#tlCount').textContent = tlSec;
    const idx = Math.min(5, Math.floor((30 - tlSec) / 5));
    $$('.tl').forEach(el => el.classList.toggle('on', +el.dataset.i === idx));
  };
  $('#tlStart').addEventListener('click', () => {
    if (tlTimer) clearInterval(tlTimer);
    tlSec = 30; tlPaint();
    tlTimer = setInterval(() => {
      tlSec--; tlPaint();
      if (tlSec <= 0) { clearInterval(tlTimer); tlTimer = null; beep(1000, .3, .18); $$('.tl').forEach(el => el.classList.remove('on')); toast(lang === 'th' ? 'หมดเวลาเตรียมตัว — พูดได้เลย!' : 'Time to speak!'); }
    }, 1000);
  });
  $('#tlStop').addEventListener('click', () => { if (tlTimer) clearInterval(tlTimer); tlTimer = null; tlSec = 30; tlPaint(); $$('.tl').forEach(el => el.classList.remove('on')); });

  /* examples filters */
  $('#topicSearch').addEventListener('input', e => { exFilter.q = e.target.value; renderTopics(); });
  $$('.fchip').forEach(c => c.addEventListener('click', () => {
    $$('.fchip').forEach(x => x.classList.remove('is-on'));
    c.classList.add('is-on'); exFilter.level = c.dataset.level; renderTopics();
  }));
  $('#exToggleAllTH').addEventListener('click', () => {
    const any = TOPICS.some(t => !(exState[t.id] && exState[t.id].th));
    TOPICS.forEach(t => { exState[t.id] = exState[t.id] || { th: false, model: false, tab: 'normal' }; exState[t.id].th = any; });
    renderTopics();
  });
  $('#exToggleAllModel').addEventListener('click', () => {
    const any = TOPICS.some(t => !(exState[t.id] && exState[t.id].model));
    TOPICS.forEach(t => { exState[t.id] = exState[t.id] || { th: false, model: false, tab: 'normal' }; exState[t.id].model = any; });
    renderTopics();
  });
  $('#topicList').addEventListener('click', e => {
    const card = e.target.closest('.topic-card'); if (!card) return;
    const id = +card.dataset.id, t = TOPICS.find(x => x.id === id), st = exState[id];
    if (e.target.closest('.act-th')) { st.th = !st.th; renderTopics(); }
    else if (e.target.closest('.act-model')) { st.model = !st.model; renderTopics(); }
    else if (e.target.closest('.act-copy')) { copyText(scriptText(t, st.tab)); }
    else if (e.target.closest('.act-practice')) { setPracTopic(id); go('practice'); toast(lang === 'th' ? 'พร้อมฝึกหัวข้อ ' + id : 'Ready: topic ' + id); }
    else if (e.target.closest('.tab')) { st.tab = e.target.closest('.tab').dataset.tab; st.model = true; renderTopics(); }
  });

  /* practice */
  $('#pracTopic').addEventListener('change', e => setPracTopic(e.target.value));
  $('#pracRandom').addEventListener('click', () => {
    const t = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    setPracTopic(t.id); beep(900, .12, .12);
    toast(lang === 'th' ? 'สุ่มได้หัวข้อ ' + t.id : 'Topic ' + t.id);
  });
  $('#pracStart').addEventListener('click', () => {
    pracPhase = 'prep'; pracLastSec = -1;
    $('#page-practice .timer-card').classList.remove('is-speak');
    $('#pracPhase').textContent = lang === 'th' ? 'เตรียมตัว 30 วิ' : 'Prepare 30s';
    pracTimer.start(30); beep(660, .14, .14);
  });
  $('#pracPause').addEventListener('click', () => { pracTimer.pause(); $('#pracPhase').textContent = lang === 'th' ? 'พักอยู่' : 'Paused'; });
  $('#pracResume').addEventListener('click', () => { pracTimer.resume(); $('#pracPhase').textContent = pracPhase === 'speak' ? (lang === 'th' ? 'พูดเลย!' : 'SPEAK!') : (lang === 'th' ? 'เตรียมตัว' : 'Prepare'); });
  $('#pracReset').addEventListener('click', () => {
    pracTimer.reset(); pracPhase = 'idle';
    paintRing($('#pracRing'), $('#pracTime'), 30, 30);
    $('#pracPhase').textContent = lang === 'th' ? 'พร้อม' : 'Ready';
    $('#page-practice .timer-card').classList.remove('is-speak', 'is-warn');
  });
  $('#pracSound').addEventListener('click', e => {
    soundOn = !soundOn; store.set('sound', soundOn);
    e.currentTarget.setAttribute('aria-pressed', String(soundOn));
    e.currentTarget.textContent = soundOn ? (lang === 'th' ? 'เสียง: เปิด' : 'Sound: On') : (lang === 'th' ? 'เสียง: ปิด' : 'Sound: Off');
  });
  $('#cueToggle').addEventListener('click', e => {
    const c = $('#cueCard'); const hide = c.style.display !== 'none';
    c.style.display = hide ? 'none' : 'grid';
    e.currentTarget.textContent = hide ? (lang === 'th' ? 'แสดง' : 'Show') : (lang === 'th' ? 'ซ่อน' : 'Hide');
  });
  $('#noteSave').addEventListener('click', () => { store.set(noteKey(), collectNotes()); toast(lang === 'th' ? 'บันทึกโน้ตแล้ว' : 'Notes saved'); });
  $('#noteCopy').addEventListener('click', () => {
    const n = collectNotes();
    copyText(STEPS.map(s => s.k + ': ' + (n[s.k] || '-')).join('\n'));
  });
  $('#noteClear').addEventListener('click', () => {
    STEPS.forEach(s => { const el = $('#note' + s.k); if (el) el.value = ''; });
    store.del(noteKey()); updateNoteWC(); toast(lang === 'th' ? 'ล้างโน้ตแล้ว' : 'Notes cleared');
  });
  $('#pracDone').addEventListener('click', () => {
    addHistory('practice', pracTopic.id);
    toast(lang === 'th' ? 'บันทึกว่าฝึกหัวข้อนี้แล้ว' : 'Marked as practised');
  });

  /* exam */
  paintRing($('#examRing'), $('#examTime'), 30, 30);
  paintRing($('#pracRing'), $('#pracTime'), 30, 30);
  $('#examStart').addEventListener('click', () => {
    $('#examAfter').hidden = true; $('#examCue').hidden = true; $('#examModel').hidden = true;
    $('#examState').textContent = lang === 'th' ? 'กำลังสุ่มหัวข้อ…' : 'Picking a topic…';
    examTimer.reset();
    rollTopic('#examTopic', t => {
      examTopic = t; examPhase = 'prep'; examLastSec = -1;
      $('#examCard').classList.remove('is-speak');
      $('#examPhase').textContent = lang === 'th' ? 'เตรียมตัว' : 'Prepare';
      $('#examState').textContent = lang === 'th' ? 'เตรียมตัว 30 วินาที' : 'Preparing (30s)';
      examTimer.start(30);
    });
  });
  $('#examPause').addEventListener('click', () => { examTimer.pause(); $('#examPhase').textContent = lang === 'th' ? 'พักอยู่' : 'Paused'; });
  $('#examResume').addEventListener('click', () => { examTimer.resume(); $('#examPhase').textContent = examPhase === 'speak' ? (lang === 'th' ? 'พูดเลย!' : 'SPEAK!') : (lang === 'th' ? 'เตรียมตัว' : 'Prepare'); });
  $('#examReset').addEventListener('click', () => {
    examTimer.reset(); examPhase = 'idle'; examTopic = null;
    paintRing($('#examRing'), $('#examTime'), 30, 30);
    $('#examTopic').textContent = '— — —';
    $('#examPhase').textContent = lang === 'th' ? 'เตรียมตัว' : 'Prepare';
    $('#examState').textContent = lang === 'th' ? 'พร้อมสอบ' : 'Ready';
    $('#examCard').classList.remove('is-speak', 'is-warn');
    $('#examAfter').hidden = true;
  });
  $('#examFS').addEventListener('click', () => {
    const el = $('#page-exam');
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen().then(() => document.body.classList.add('fs-mode')).catch(() => document.body.classList.add('fs-mode'));
      else document.body.classList.add('fs-mode');
    } else {
      document.exitFullscreen().catch(() => {});
      document.body.classList.remove('fs-mode');
    }
  });
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) document.body.classList.remove('fs-mode'); });
  $('#examShowCue').addEventListener('click', () => {
    if (!examTopic) return;
    const box = $('#examCue');
    box.innerHTML = STEPS.map(s => `<div class="cue" style="--sc:${s.c}"><b>${s.k}</b>${examTopic.cues[s.k]}<i>${s.th}</i></div>`).join('');
    box.hidden = !box.hidden;
  });
  $('#examShowModel').addEventListener('click', () => {
    if (!examTopic) return;
    const box = $('#examModel');
    box.innerHTML = `<div class="doc-title"><span>${examTopic.title}</span></div>` + modelHTML(examTopic, 'normal') +
      `<div class="row" style="margin-top:.6rem"><button class="btn btn-ghost sm" id="examCopy">${lang === 'th' ? 'คัดลอกบทพูด' : 'Copy script'}</button></div>`;
    box.hidden = !box.hidden;
    const cp = $('#examCopy'); if (cp) cp.addEventListener('click', () => copyText(scriptText(examTopic, 'normal')));
  });
  $('#recBtn').addEventListener('click', () => {
    if (recorder && recorder.state === 'recording') stopRecording(); else startRecording();
  });

  /* quiz */
  $('#quizStart').addEventListener('click', startQuiz);

  /* progress */
  $('#rubSave').addEventListener('click', () => {
    const total = $$('#rubric input').reduce((s, i) => s + (+i.value), 0);
    const scores = store.get('scores', []); scores.unshift(total); store.set('scores', scores.slice(0, 40));
    addHistory('rate', +$('#rubTopic').value, total);
    renderProgress();
    toast(lang === 'th' ? 'บันทึกผลประเมิน ' + total + '/35 แล้ว' : 'Saved ' + total + '/35');
  });
  /* ---------- MODAL HELPERS (bug fix) ---------- */
  function openConfirm() {
    const m = $('#confirmModal');
    m.hidden = false;
    m.style.display = 'grid';
    $('#cfNo').focus();
  }
  function closeConfirm() {
    const m = $('#confirmModal');
    m.hidden = true;
    m.style.display = 'none';
  }

  $('#clearBtn').addEventListener('click', openConfirm);
  $('#cfNo').addEventListener('click', closeConfirm);
  $('#cfYes').addEventListener('click', () => {
    store.clearAll();
    closeConfirm();
    renderHomeStats(); renderProgress(); updateQuizHead(); loadNotes();
    toast(lang === 'th' ? 'ล้างข้อมูลทั้งหมดแล้ว' : 'All data cleared');
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeConfirm(); });

  /* restore last page */
  go(store.get('page', 'home'));
  applyLang();
});
/* =========================================================
   ============ 14. MOTION LAYER (AURA-style) ==============
   Scroll reveal · custom cursor · marquee · magnetic buttons
   · sliding tab indicator · counters · page transitions
   ========================================================= */
(function motionLayer() {
  if (REDUCED) return;
  // only now is it safe for CSS to hide things for animation
  document.documentElement.classList.add('motion-on');

  /* ---------- 14.1 scroll progress bar ---------- */
  const prog = document.createElement('div');
  prog.className = 'scroll-prog';
  document.body.appendChild(prog);

  /* ---------- 14.2 custom cursor ---------- */
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  let dot, ring;
  if (fine) {
    dot  = document.createElement('div'); dot.className  = 'cur-dot';
    ring = document.createElement('div'); ring.className = 'cur-ring';
    document.body.append(dot, ring);

    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px)`;
    }, { passive: true });

    document.addEventListener('mouseleave', () => document.body.classList.add('cur-hide'));
    document.addEventListener('mouseenter', () => document.body.classList.remove('cur-hide'));

    const HOT = 'a,button,input,select,textarea,.choice,.wd,.tl,.fchip,.tab,.pb-item,.topic-card';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(HOT)) document.body.classList.add('cur-hot');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(HOT)) document.body.classList.remove('cur-hot');
    });

    (function ringLoop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(ringLoop);
    })();
  }

  /* ---------- 14.3 scroll reveal ---------- */
  const REVEAL_SEL = [
    '.card', '.step', '.mn', '.pb-group', '.topic-card', '.tip', '.tl',
    '.q-card', '.sec-title', '.sec-h', '.stat', '.model-box',
    '.disc', '.eyebrow', '.acc-item', '.cta-big h2', '.cta-big .btn', '.foot-col', '.foot-brand'
  ].join(',');

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const d = +(el.dataset.rvDelay || 0);
      setTimeout(() => el.classList.add('rv-in'), d);
      countUp(el);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  function scan() {
    document.querySelectorAll(REVEAL_SEL).forEach(el => {
      if (el.classList.contains('rv') || el.classList.contains('rv-in')) return;
      el.classList.add('rv');
      io.observe(el);
    });
    // stagger siblings inside the same container
    document.querySelectorAll('.grid-2,.grid-3,.mnemo,.steps,.phrase-bank,.topic-list,.timeline,.stat-row,.disc-list,.acc,.foot-grid')
      .forEach(wrap => {
        [...wrap.children].forEach((child, i) => {
          if (child.classList.contains('rv') && !child.dataset.rvDelay) {
            child.dataset.rvDelay = Math.min(i * 70, 420);
          }
        });
      });
  }

  /* ---------- 14.4 number count-up ---------- */
  function countUp(el) {
    const targets = el.matches('.stat-num,.rule-num,.big-count')
      ? [el] : [...el.querySelectorAll('.stat-num,.rule-num,.big-count')];

    targets.forEach(n => {
      if (n.dataset.counted) return;
      const raw = n.textContent.trim();
      const m = raw.match(/^(\d+)(.*)$/);      // leading integer only
      if (!m) return;
      const end = +m[1], suffix = m[2] || '';
      if (end === 0 || end > 100000) return;
      n.dataset.counted = '1';
      const dur = 900, t0 = performance.now();
      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        n.textContent = Math.round(end * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }

  /* ---------- 14.5 sliding tab indicator ---------- */
  const navWrap = $('.nav-desktop');
  let ind = null;
  if (navWrap) {
    ind = document.createElement('span');
    ind.className = 'nav-ind idle';
    navWrap.appendChild(ind);
  }
  function moveIndicator() {
    if (!navWrap || !ind) return;
    const act = navWrap.querySelector('.nav-btn.is-active');
    if (!act || !act.offsetParent) { ind.classList.add('idle'); return; }
    ind.classList.remove('idle');
    ind.style.width = act.offsetWidth + 'px';
    ind.style.transform = `translateX(${act.offsetLeft}px)`;
  }
  addEventListener('resize', moveIndicator);

  /* ---------- 14.6 magnetic buttons ---------- */
  function magnetize(el) {
    if (el.dataset.mag) return;
    el.dataset.mag = '1';
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  }
  function scanMagnets() {
    if (!fine) return;
    document.querySelectorAll('.btn-primary,.btn-accent,.tool-btn').forEach(magnetize);
  }

  /* ---------- 14.7 topbar auto-hide + progress ---------- */
  let lastY = 0, ticking = false;
  function onScroll() {
    const y = scrollY;
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;

    if (y > lastY && y > 220) document.body.classList.add('nav-up');
    else document.body.classList.remove('nav-up');
    litManifesto();
    lastY = y;
    ticking = false;
  }
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* ---------- 14.7b manifesto word-by-word reveal ---------- */
  function splitWords(text) {
    const bySpace = text.trim().split(/(\s+)/).filter(Boolean);
    const wordCount = bySpace.filter(t => !/^\s+$/.test(t)).length;
    // Thai has almost no spaces — fall back to proper word segmentation
    if (wordCount < 12 && text.length > 60 && typeof Intl !== 'undefined' && Intl.Segmenter) {
      try {
        const seg = new Intl.Segmenter(document.documentElement.lang || 'th', { granularity: 'word' });
        return [...seg.segment(text.trim())].map(s => s.segment);
      } catch (e) { /* fall through */ }
    }
    return bySpace;
  }

  function wrapManifesto() {
    document.querySelectorAll('[data-manifesto]').forEach(el => {
      if (el.querySelector('.w')) return;          // already wrapped
      const parts = splitWords(el.textContent);
      el.textContent = '';
      parts.forEach(part => {
        if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(part)); return; }
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = part;
        el.appendChild(s);
      });
    });
  }
  function litManifesto() {
    document.querySelectorAll('[data-manifesto]').forEach(el => {
      const words = [...el.querySelectorAll('.w')];
      if (!words.length) return;
      const r = el.getBoundingClientRect();
      // map scroll position across the element to how many words are lit
      const start = innerHeight * 0.85, end = innerHeight * 0.25;
      const p = Math.max(0, Math.min(1, (start - r.top) / (start - end)));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < lit));
    });
  }

  /* ---------- 14.8 hero entrance ---------- */
  function litHero() {
    const h = document.querySelector('.page.is-active .hero');
    if (!h) return;
    h.classList.remove('lit');
    void h.offsetWidth;          // force reflow so the animation replays
    h.classList.add('lit');
  }

  /* ---------- 14.9 hook into the router ---------- */
  const rawGo = window.go;
  if (typeof rawGo === 'function') {
    window.go = function (page) {
      rawGo(page);
      requestAnimationFrame(() => {
        moveIndicator();
        litHero();
        scan();
        scanMagnets();
        wrapManifesto();
        litManifesto();
        setTimeout(revealInView, 450);
      });
    };
  }

  /* ---------- 14.10 watch for dynamically rendered content ---------- */
  let pending = null;
  new MutationObserver(() => {
    clearTimeout(pending);
    pending = setTimeout(() => { scan(); scanMagnets(); wrapManifesto(); litManifesto(); }, 90);
  }).observe(document.getElementById('main'), { childList: true, subtree: true });

  /* ---------- 14.11 failsafe: nothing may stay invisible ---------- */
  function revealInView() {
    document.querySelectorAll('.page.is-active .rv:not(.rv-in)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) { el.classList.add('rv-in'); countUp(el); }
    });
  }
  addEventListener('load', () => setTimeout(revealInView, 600));

  /* ---------- 14.12 boot ---------- */
  function boot() {
    wrapManifesto();
    scan(); scanMagnets(); moveIndicator(); litHero(); onScroll();
    setTimeout(revealInView, 500);
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', () => setTimeout(boot, 60));
  else setTimeout(boot, 60);
})();
