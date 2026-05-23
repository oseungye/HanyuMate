/* ════════════════════════════════════════════════
   나만의 중국어 AI 친구 - script.js
   (데이터 + 분석 엔진 + UI 제어를 한 파일에 정리)
   ════════════════════════════════════════════════ */

/* ─────────────────────────────────────────
   [1] 상황(맥락) 데이터
   맥락 기반 학습이 핵심이므로, 상황별 말투 기준값을 둔다.
   ───────────────────────────────────────── */
const SITUATIONS = {
  friend: { label: '친구와 대화', tone: '편하고 친근한 반말체' },
  school: { label: '학교 발표', tone: '정중하고 또렷한 발표체' },
  travel: { label: '여행', tone: '간단하고 실용적인 여행 회화체' },
  sns: { label: 'SNS', tone: '짧고 트렌디한 인터넷 말투' },
  formal: { label: '공식 표현', tone: '예의 바르고 격식 있는 표현' },
};

/* ─────────────────────────────────────────
   [2] 미리 작성한 예문 분석 데이터
   입력 문장이 아래 key 와 일치하면 이 정교한 분석을 보여준다.
   결과 항목(=카드 9개):
     natural, naturalPinyin, literal, literalNote, grammar,
     errors[], situations[], conversation[], culture, hsk, recommend[]
   ───────────────────────────────────────── */
const SAMPLE_DATA = {
  '밥 먹었어?': {
    natural: '你吃饭了吗？',
    naturalPinyin: 'Nǐ chī fàn le ma?',
    literal: '饭吃了吗？',
    literalNote:
      '한국어 "밥 먹었어?"를 그대로 옮기면 주어(你)가 빠져 어색합니다. 중국어는 안부 인사로 이 표현을 자주 쓰며, 주어를 넣는 것이 자연스럽습니다.',
    grammar:
      '"了"는 동작의 완료를 나타내고, 문장 끝 "吗"는 의문을 만듭니다. "동사 + 了 + 吗?" 구조로 "~했니?"를 표현합니다.',
    errors: [
      {
        type: '한국어식 어순',
        desc: '한국어는 주어를 자주 생략하지만, 중국어 안부 인사에서는 "你"를 넣어야 자연스럽습니다.',
        isGood: false,
      },
      {
        type: '문화적 맥락',
        desc: '"밥 먹었어?"는 중국에서 실제 식사 여부보다 "잘 지내?"에 가까운 인사로 쓰입니다.',
        isGood: false,
      },
    ],
    situations: [
      { tag: '친구 사이', cn: '吃了吗？', py: 'Chī le ma?' },
      { tag: '공식적', cn: '您用过餐了吗？', py: 'Nín yòng guò cān le ma?' },
      { tag: 'SNS', cn: '干饭了没？', py: 'Gàn fàn le méi?' },
    ],
    conversation: [
      { cn: '吃了吗您？', py: 'Chī le ma nín?', ko: '식사하셨어요? (정겨운 안부 인사)' },
      { cn: '还没呢，你呢？', py: 'Hái méi ne, nǐ ne?', ko: '아직요, 당신은요?' },
    ],
    culture:
      '중국에서 "你吃饭了吗？"는 글자 그대로의 질문이라기보다 친근한 안부 인사입니다. 한국의 "잘 지내?"와 비슷한 역할을 하므로, 정말 밥 먹었는지 답하지 않아도 됩니다.',
    hsk: { level: 1, label: 'HSK 1급', desc: '가장 기초적인 일상 인사 표현입니다.' },
    recommend: [
      { cn: '你吃了吗？', py: 'Nǐ chī le ma?' },
      { cn: '吃饭了没？', py: 'Chī fàn le méi?' },
    ],
  },

  '주말에 같이 영화 볼래?': {
    natural: '周末要不要一起看电影？',
    naturalPinyin: 'Zhōumò yào bú yào yìqǐ kàn diànyǐng?',
    literal: '周末一起电影看吗？',
    literalNote:
      '"영화 보다"를 "电影看"으로 옮기면 어순이 틀립니다. 중국어는 "동사(看) + 목적어(电影)" 순서이므로 "看电影"이 맞습니다.',
    grammar:
      '"要不要"는 "~할래?"라는 권유 표현입니다. "一起"는 "함께"라는 뜻으로 동사 앞에 옵니다. 어순은 "시간 + 要不要 + 一起 + 동사 + 목적어"입니다.',
    errors: [
      {
        type: '한국어식 어순',
        desc: '"电影看"처럼 목적어를 동사 앞에 두면 안 됩니다. 중국어는 "看电影" (동사+목적어) 순서입니다.',
        isGood: false,
      },
    ],
    situations: [
      { tag: '친구 사이', cn: '周末一起看电影呗？', py: 'Zhōumò yìqǐ kàn diànyǐng bei?' },
      { tag: '공식적', cn: '周末方便一起观影吗？', py: 'Zhōumò fāngbiàn yìqǐ guānyǐng ma?' },
      { tag: 'SNS', cn: '周末约个电影？', py: 'Zhōumò yuē ge diànyǐng?' },
    ],
    conversation: [
      { cn: '周末有空吗？一起看电影呗。', py: 'Zhōumò yǒu kòng ma? Yìqǐ kàn diànyǐng bei.', ko: '주말에 시간 있어? 같이 영화 보자.' },
      { cn: '好啊，看什么？', py: 'Hǎo a, kàn shénme?', ko: '좋아, 뭐 볼래?' },
    ],
    culture:
      '중국 젊은이들은 약속을 잡을 때 "约"(약속을 잡다)라는 동사를 자주 씁니다. "约个电影"처럼 명사 앞에 "约"을 붙이면 캐주얼하고 자연스럽게 들립니다.',
    hsk: { level: 2, label: 'HSK 2급', desc: '권유와 일상 약속에 쓰는 기초 표현입니다.' },
    recommend: [{ cn: '周末一起去看电影吧！', py: 'Zhōumò yìqǐ qù kàn diànyǐng ba!' }],
  },

  我吃饭了: {
    natural: '나 밥 먹었어.',
    naturalPinyin: 'Wǒ chī fàn le.',
    literal: '나는 밥을 먹었다.',
    literalNote:
      '문법적으로 틀리진 않지만, 일상 대화에서는 조사를 줄여 "나 밥 먹었어"가 더 자연스럽습니다.',
    grammar:
      '"了"는 동작 완료를 나타냅니다. "我(나) + 吃(먹다) + 饭(밥) + 了(완료)" 구조로, 한국어로는 과거형 "먹었어"가 됩니다.',
    errors: [
      {
        type: '잘 쓴 표현',
        desc: '주어 + 동사 + 목적어 + 了 의 어순이 정확합니다. 기초 문장을 잘 구성했어요!',
        isGood: true,
      },
    ],
    situations: [
      { tag: '친구 사이', cn: '吃过啦！', py: 'Chī guò la!' },
      { tag: '공식적', cn: '我已经用过餐了。', py: 'Wǒ yǐjīng yòng guò cān le.' },
      { tag: 'SNS', cn: '干完饭了～', py: 'Gàn wán fàn le~' },
    ],
    conversation: [
      { cn: '我吃过了，你吃了吗？', py: 'Wǒ chī guò le, nǐ chī le ma?', ko: '나 먹었어, 너는 먹었어?' },
    ],
    culture:
      '"了"의 위치에 따라 의미가 달라집니다. "吃了饭"과 "吃饭了"는 모두 가능하지만, 문장 끝의 "了"는 "이제 막 ~했다"는 변화의 느낌을 줍니다.',
    hsk: { level: 1, label: 'HSK 1급', desc: '완료를 나타내는 가장 기본적인 문장입니다.' },
    recommend: [{ cn: '我刚吃完饭。', py: 'Wǒ gāng chī wán fàn.' }],
  },
};

/* ─────────────────────────────────────────
   [3] 분석 엔진
   샘플에 있으면 그대로, 없으면 규칙 기반으로 한국어식 오류를 탐지한다.
   ───────────────────────────────────────── */

// 입력이 한국어인지 중국어인지 간단 판별
function detectLanguage(text) {
  if (/[\uac00-\ud7a3]/.test(text)) return 'ko';
  if (/[\u4e00-\u9fff]/.test(text)) return 'cn';
  return 'ko';
}

// 한국어식 중국어 오류 탐지 규칙
const KO_STYLE_RULES = [
  {
    test: (t) => /(을|를)\s*(보|먹|마시|하)/.test(t),
    type: '직역 위험',
    desc: '한국어 "목적어 + 동사" 어순을 그대로 옮기면 어색합니다. 중국어는 "동사 + 목적어" 순서입니다. (예: 看电影)',
  },
  {
    test: (t) => /너무|진짜|완전/.test(t),
    type: '부자연스러운 강조',
    desc: '"너무/진짜"를 매번 "很"으로 옮기면 단조롭습니다. 상황에 따라 "太…了", "非常", "特别" 등으로 다양하게 표현하세요.',
  },
  {
    test: (t) => /(요|습니다|합니다)$/.test(t.trim()),
    type: '존댓말 처리',
    desc: '한국어 존댓말은 중국어에서 어미 변화가 아니라 "您", "请", 정중한 어휘 선택으로 표현됩니다.',
  },
];

// 규칙 기반 분석 결과 생성
function ruleBasedAnalysis(text, situationId) {
  const lang = detectLanguage(text);
  const situ = SITUATIONS[situationId] || SITUATIONS.friend;

  const errors = [];
  if (lang === 'ko') {
    KO_STYLE_RULES.forEach((rule) => {
      if (rule.test(text)) errors.push({ type: rule.type, desc: rule.desc, isGood: false });
    });
  }
  if (errors.length === 0) {
    errors.push({
      type: '잘 쓴 표현',
      desc: '눈에 띄는 한국어식 오류가 보이지 않아요. 아래 상황별 표현으로 더 자연스럽게 다듬어 보세요!',
      isGood: true,
    });
  }

  return {
    natural: lang === 'ko' ? '（예시 번역）这句话可以这样表达。' : '（예시 번역）이 문장은 이렇게 표현할 수 있어요.',
    naturalPinyin: lang === 'ko' ? 'Zhè jù huà kěyǐ zhèyàng biǎodá.' : '',
    literal:
      lang === 'ko'
        ? '직역하면 어순이나 조사가 어색해질 수 있습니다.'
        : '글자 그대로 옮기면 한국어 어순과 맞지 않을 수 있습니다.',
    literalNote: '직역은 단어를 1:1로 바꾸기 때문에, 문장의 맥락과 자연스러움을 놓치기 쉽습니다.',
    grammar:
      '선택한 상황은 "' + situ.label + '"(' + situ.tone + ')입니다. 같은 뜻이라도 상황에 따라 어휘와 말투를 바꿔야 합니다. ' +
      '중국어 기본 어순은 "주어 + 동사 + 목적어"이며, 시간·장소 표현은 동사 앞에 옵니다.',
    errors,
    situations: [
      { tag: '친구 사이', cn: '（편한 말투 표현）', py: '' },
      { tag: '공식적', cn: '（정중한 표현, 您/请 사용）', py: '' },
      { tag: 'SNS', cn: '（짧고 트렌디한 인터넷 말투）', py: '' },
    ],
    conversation: [
      { cn: '这个用中文怎么说？', py: 'Zhège yòng zhōngwén zěnme shuō?', ko: '이거 중국어로 어떻게 말해요? (모를 때 쓰는 만능 표현)' },
    ],
    culture:
      '중국어는 같은 의미라도 관계와 상황에 따라 표현이 크게 달라집니다. 친구에게 쓰는 말투와 공식 자리에서 쓰는 말투를 구분하는 것이 자연스러운 회화의 핵심입니다.',
    hsk: { level: 2, label: 'HSK 2급', desc: '문장 구성에 따라 난이도가 달라질 수 있습니다.' },
    recommend: [{ cn: '请帮我看看这句话对不对。', py: 'Qǐng bāng wǒ kànkan zhè jù huà duì bú duì.' }],
  };
}

// 메인 분석 함수 (로딩 UX를 위해 약간의 지연을 둠)
function analyzeSentence(text, situationId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const key = text.trim();
      if (SAMPLE_DATA[key]) {
        const d = SAMPLE_DATA[key];
        resolve(Object.assign({}, d, { recommend: d.recommend || [] }));
      } else {
        resolve(ruleBasedAnalysis(text, situationId));
      }
    }, 600);
  });
}

/* ─────────────────────────────────────────
   [4] UI 상태 & 이벤트 제어
   ───────────────────────────────────────── */
const state = { direction: 'ko2cn', situation: 'friend' };

// 방향 토글
document.querySelectorAll('.direction-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.direction-btn').forEach((b) => b.classList.remove('direction-btn--active'));
    btn.classList.add('direction-btn--active');
    state.direction = btn.dataset.dir;
    const ta = document.getElementById('inputText');
    ta.placeholder =
      state.direction === 'ko2cn'
        ? '예) 밥 먹었어? / 주말에 같이 영화 볼래? / 만나서 반가워요'
        : '예) 我吃饭了 / 你周末有空吗？/ 很高兴认识你';
  });
});

// 상황 선택
document.querySelectorAll('.situation-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.situation-btn').forEach((b) => b.classList.remove('situation-btn--active'));
    btn.classList.add('situation-btn--active');
    state.situation = btn.dataset.situ;
  });
});

/* ─────────────────────────────────────────
   [5] 결과 렌더링
   ───────────────────────────────────────── */

// XSS 방지용 간단 이스케이프
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 결과 카드 공통 틀
function card(icon, bg, title, bodyHtml) {
  return (
    '<div class="result-card">' +
    '<div class="result-card-head">' +
    '<div class="result-card-icon" style="background:' + bg + '">' + icon + '</div>' +
    '<div class="result-card-title">' + title + '</div>' +
    '</div>' +
    '<div class="result-card-body">' + bodyHtml + '</div>' +
    '</div>'
  );
}

function render(d) {
  let html = '';

  // 1. 자연 번역 + 병음
  let natHtml = '<div class="translation-main">' + esc(d.natural) + '</div>';
  if (d.naturalPinyin) natHtml += '<div class="translation-pinyin">' + esc(d.naturalPinyin) + '</div>';
  html += card('✓', '#dceee5', '자연스러운 번역', natHtml);

  // 2. 직역
  html += card(
    '↔',
    'var(--color-beige)',
    '직역 (이렇게 말하면 어색해요)',
    '<div class="literal-text">' + esc(d.literal) + '</div>' +
      '<div class="literal-note">💡 ' + esc(d.literalNote) + '</div>'
  );

  // 3. 핵심 문법
  html += card('文', '#e6e0f0', '핵심 문법 설명', '<div class="text-block"><p>' + esc(d.grammar) + '</p></div>');

  // 4. 오류 피드백
  if (d.errors && d.errors.length) {
    const items = d.errors
      .map(
        (x) =>
          '<div class="error-item' + (x.isGood ? ' error-item--good' : '') + '">' +
          '<div class="error-type">' + (x.isGood ? '👍 ' : '') + esc(x.type) + '</div>' +
          '<div class="error-desc">' + esc(x.desc) + '</div>' +
          '</div>'
      )
      .join('');
    html += card('!', 'var(--color-red-soft)', '학습자 오류 피드백', items);
  }

  // 5. 상황별 표현 차이
  if (d.situations && d.situations.length) {
    const rows = d.situations
      .map(
        (s) =>
          '<div class="situation-compare-row">' +
          '<span class="situation-compare-tag">' + esc(s.tag) + '</span>' +
          '<span class="situation-compare-expr"><span class="cn">' + esc(s.cn) + '</span>' +
          (s.py ? '<span class="py"> · ' + esc(s.py) + '</span>' : '') +
          '</span></div>'
      )
      .join('');
    html += card('◑', 'var(--color-blue-soft)', '상황별 표현 차이', '<div class="situation-compare">' + rows + '</div>');
  }

  // 6. 실제 회화 표현
  if (d.conversation && d.conversation.length) {
    const bubbles = d.conversation
      .map(
        (c) =>
          '<div class="conv-bubble">' +
          '<span class="cn">' + esc(c.cn) + '</span> ' +
          (c.py ? '<span class="py">' + esc(c.py) + '</span>' : '') +
          '<span class="ko">' + esc(c.ko) + '</span>' +
          '</div>'
      )
      .join('');
    html += card('话', '#f6e3d6', '실제 중국 회화 표현', bubbles);
  }

  // 7. 문화적 맥락
  html += card('化', '#eee6da', '문화적 맥락 설명', '<div class="text-block"><p>' + esc(d.culture) + '</p></div>');

  // 8. HSK 난이도
  if (d.hsk) {
    const lv = Math.min(6, Math.max(1, d.hsk.level || 1));
    const width = ((lv / 6) * 100).toFixed(0) + '%';
    html += card(
      '级',
      '#f6e3d6',
      'HSK 난이도',
      '<div class="hsk-wrap">' +
        '<span class="hsk-badge">' + esc(d.hsk.label || 'HSK ' + lv + '급') + '</span>' +
        '<div class="hsk-bar"><div class="hsk-fill" style="width:' + width + '"></div></div>' +
        '<div class="hsk-desc">' + esc(d.hsk.desc || '') + '</div>' +
        '</div>'
    );
  }

  // 9. 추천 표현
  if (d.recommend && d.recommend.length) {
    const items = d.recommend
      .map(
        (r) =>
          '<div class="reco-item"><span class="star">★</span>' +
          '<span><span class="cn">' + esc(r.cn) + '</span>' +
          (r.py ? '<span class="py">' + esc(r.py) + '</span>' : '') +
          '</span></div>'
      )
      .join('');
    html += card('☆', '#dceee5', '자연스러운 현지 표현 추천', '<div class="reco-list">' + items + '</div>');
  }

  document.getElementById('results').innerHTML = html;
}

/* ─────────────────────────────────────────
   [6] 제출 핸들러
   ───────────────────────────────────────── */
const submitBtn = document.getElementById('submitBtn');

submitBtn.addEventListener('click', async () => {
  const text = document.getElementById('inputText').value.trim();
  if (!text) {
    document.getElementById('inputText').focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = '분석 중...';
  document.getElementById('results').innerHTML =
    '<div class="loading-state">AI 친구가 문장을 살펴보고 있어요' +
    '<div class="loading-dots"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>' +
    '</div>';

  try {
    const data = await analyzeSentence(text, state.situation);
    render(data);
  } catch (err) {
    console.error(err);
    document.getElementById('results').innerHTML =
      '<div class="empty-state"><span class="empty-state-icon">😅</span>분석 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.</div>';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '학습 분석 받기';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// Ctrl/Cmd + Enter 로 제출
document.getElementById('inputText').addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submitBtn.click();
});
