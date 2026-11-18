/* =========================================================
   A. 데이터
   ========================================================= */
var STEPS = ['작업 방식과 시간', '목과 몸통', '시선과 화면', '의자와 하체', '팔과 손목', '불편한 신체 부위'];

/* 분석 영역. meaning = 위험도가 높을 때 사용자에게 보여 줄 쉬운 설명 */
var CATEGORIES = [
  { id: 'habit',   name: '작업 시간·휴식', meaning: '같은 자세로 오래 있어 근육이 쉴 틈이 부족합니다.' },
  { id: 'posture', name: '목·몸통 자세',   meaning: '목과 몸통이 권장 각도에서 벗어나 목·허리 근육이 계속 긴장합니다.' },
  { id: 'view',    name: '시선·화면',      meaning: '보는 대상의 높이·거리·빛 때문에 고개와 눈에 부담이 갑니다.' },
  { id: 'seat',    name: '의자·하체',      meaning: '의자가 하체와 허리를 제대로 받쳐 주지 못하고 있습니다.' },
  { id: 'arm',     name: '팔·손목',        meaning: '팔과 손목이 지지 없이 꺾이거나 들려 있습니다.' }
];

/* 주로 보는 대상(첫 질문)에 따라 '높이 올리는 방법'을 다르게 안내합니다 */
var RAISE = [
  '모니터 받침대나 두꺼운 책으로 화면 윗부분을 눈높이까지 올립니다.',
  '노트북을 거치대에 올리고 별도 키보드와 마우스를 연결합니다.',
  '독서대에 책을 세우고, 필기는 경사가 있는 필기 받침 위에서 합니다.',
  '태블릿을 거치대에 세워서 보고, 필기할 때만 눕힙니다.'
];

/* ---------------------------------------------------------
   설문 질문
   - cat   : 속한 분석 영역 (null이면 점수에 넣지 않음)
   - short : 결과 화면에서 원인을 말할 때 쓰는 짧은 이름
   - why   : 이 질문을 묻는 근거 (설문 화면에 표시)
   - pic   : 'pose' 또는 'wrist'이면 선택지마다 예시 그림을 그림
   - score : 0이면 권장 자세, 클수록 위험
   - tip   : 점수가 1 이상일 때의 개선 행동
             risk(왜 위험한지) / today(오늘 할 일) / daily(매일 할 일) / check(확인 방법)
   --------------------------------------------------------- */
var QUESTIONS = [
  { id: 'device', step: 0, cat: null, short: '작업 대상', text: '가장 오래 보면서 작업하는 대상은 무엇인가요?',
    why: '보는 대상에 따라 높이를 맞추는 방법이 달라서 개선 방법을 고르는 데만 씁니다. 점수에는 들어가지 않습니다.',
    options: [{ label: '모니터 (데스크톱)', score: 0 }, { label: '노트북 화면', score: 0 }, { label: '책·노트 (읽기와 필기)', score: 0 }, { label: '태블릿', score: 0 }] },

  { id: 'hours', step: 0, cat: 'habit', short: '하루 작업 시간', text: '하루에 앉아서 작업하는 시간은 모두 합쳐 얼마나 되나요?',
    why: 'ROSA는 하루 4시간 넘게 앉아 작업하면 같은 자세라도 위험 점수를 올립니다.',
    tip: { title: '서서 하는 작업 한 가지 정하기',
      risk: '하루 4시간 넘게 앉아 있으면 목과 허리 근육이 쉬지 못해 피로가 쌓입니다.',
      today: '통화, 암기, 자료 읽기 중 서서 할 일 한 가지를 정합니다.',
      daily: '정한 일은 매번 일어나서 합니다.',
      check: '하루에 서서 작업한 시간이 30분을 넘는지 봅니다.' },
    options: [{ label: '1시간 미만', score: 0 }, { label: '1~4시간', score: 1 }, { label: '4~8시간', score: 2 }, { label: '8시간 이상', score: 3 }] },

  { id: 'cont', step: 0, cat: 'habit', short: '연속 작업 시간', text: '한 번 앉으면 일어나지 않고 얼마나 계속 작업하나요?',
    why: 'ROSA는 쉬지 않고 1시간 넘게 앉아 있으면, RULA는 같은 자세를 오래 유지하면 점수를 더합니다. 좋은 자세도 오래 고정되면 부담이 됩니다.',
    tip: { title: '50분마다 일어나기',
      risk: '같은 자세로 1시간 넘게 있으면 근육이 계속 긴장하고 혈액순환이 줄어 통증이 생기기 쉽습니다.',
      today: '휴대폰에 50분 반복 타이머를 맞춥니다.',
      daily: '타이머가 울리면 1~2분 일어나 걷거나 기지개를 켭니다.',
      check: '하루에 일어난 횟수가 5회를 넘는지 셉니다.' },
    options: [{ label: '30분 이내', score: 0 }, { label: '30분~1시간', score: 1 }, { label: '1~2시간', score: 2 }, { label: '2시간 이상', score: 3 }] },

  { id: 'neck', step: 1, cat: 'posture', short: '고개 각도', pic: 'pose', text: '작업할 때 고개는 어느 쪽에 가깝나요? 옆모습 사진을 찍어 보면 정확합니다.',
    why: 'RULA는 고개 숙임이 10° 이하일 때 가장 안전하게, 20° 이상이거나 뒤로 젖혀질 때 높은 위험으로 봅니다.',
    tip: { title: '고개를 20° 안쪽으로 세우기',
      risk: '고개를 20° 넘게 숙이거나 턱을 내밀면 목 뒤 근육과 목뼈 디스크가 받는 힘이 커져 목 통증과 긴장성 두통으로 이어질 수 있습니다.',
      today: function (a) { return RAISE[a.device]; },
      daily: '턱을 뒤로 당겨 5초 버티기를 하루 10회 합니다.',
      check: '옆모습 사진에서 귀가 어깨 위에 오는지 봅니다.' },
    options: [{ label: '거의 세우고 있다', score: 0 }, { label: '조금 숙인다', score: 1 }, { label: '많이 숙인다', score: 2 }, { label: '턱을 내밀거나 들고 본다', score: 3 }] },

  { id: 'trunk', step: 1, cat: 'posture', short: '몸통 자세', pic: 'pose', text: '몸통(등과 허리)은 어느 쪽에 가깝나요?',
    why: 'RULA는 등받이에 기대어 곧게 세운 몸통을 가장 안전하게, 20° 넘게 숙인 자세를 높은 위험으로 봅니다.',
    tip: { title: '등받이에 기대어 몸통 세우기',
      risk: '몸을 숙이거나 눕듯이 앉으면 허리의 자연스러운 곡선이 사라져 허리 디스크와 근육의 부담이 커집니다.',
      today: '의자를 책상 가까이 당기고 엉덩이를 등받이 끝까지 넣어 앉습니다.',
      daily: '자세가 무너진 것을 알아챌 때마다 엉덩이부터 다시 넣습니다.',
      check: '타이머가 울릴 때 등이 등받이에 닿아 있는지 봅니다.' },
    options: [{ label: '등받이에 기대어 곧게', score: 0 }, { label: '조금 앞으로 숙인다', score: 1 }, { label: '엉덩이를 빼고 눕듯이', score: 2 }, { label: '책상 쪽으로 많이 숙인다', score: 3 }] },

  { id: 'twist', step: 1, cat: 'posture', short: '비틀림', text: '고개나 몸통을 한쪽으로 돌리거나 기울인 채 작업하나요?',
    why: 'RULA는 목이나 몸통이 돌아가거나 옆으로 기울면 점수를 1점씩 더합니다. 한쪽 근육만 계속 쓰게 되기 때문입니다.',
    tip: { title: '작업 대상을 몸 정면에 두기',
      risk: '몸을 돌린 채 오래 있으면 한쪽 근육만 계속 일해 좌우 불균형과 통증이 생깁니다.',
      today: '가장 오래 보는 화면이나 책을 코 정면으로 옮깁니다.',
      daily: '참고 자료는 주 화면 바로 옆에 붙여 둡니다.',
      check: '작업 중 코와 배꼽이 같은 방향을 향하는지 봅니다.' },
    options: [{ label: '정면을 보고 한다', score: 0 }, { label: '가끔 돌리거나 기울인다', score: 1 }, { label: '대부분 돌리거나 기울인 채 한다', score: 2 }] },

  { id: 'view', step: 2, cat: 'view', short: '보는 높이', pic: 'pose', text: '보는 대상(화면이나 책)의 윗부분은 눈과 비교해 어디에 있나요?',
    why: 'ROSA는 화면이 낮아 고개를 숙이거나, 높아서 턱을 들게 되는 경우를 위험 요인으로 봅니다.',
    tip: { title: '보는 대상을 눈높이 가까이 올리기',
      risk: '보는 대상이 낮으면 고개를 숙이고 높으면 턱을 들게 되어 목에 부담이 갑니다.',
      today: function (a) { return RAISE[a.device]; },
      daily: '앉을 때마다 대상의 윗부분이 눈높이 근처인지 봅니다.',
      check: '정면을 봤을 때 시선이 대상의 위쪽 3분의 1에 닿는지 확인합니다.' },
    options: [{ label: '눈높이와 비슷하다', score: 0 }, { label: '눈보다 조금 낮다', score: 1 }, { label: '눈보다 높다', score: 2 }, { label: '책상 위에 놓여 훨씬 낮다', score: 3 }] },

  { id: 'dist', step: 2, cat: 'view', short: '보는 거리', text: '눈과 보는 대상 사이 거리는 어느 정도인가요?',
    why: 'ROSA의 적정 거리는 팔을 뻗은 길이(40~75cm)입니다.',
    tip: { title: '눈과 40~75cm 거리 두기',
      risk: '너무 가까우면 눈의 초점 근육이 쉬지 못해 눈이 피로하고 건조해지며, 너무 멀면 몸을 앞으로 숙이게 됩니다.',
      today: '팔을 뻗어 손끝이 닿는 거리로 옮깁니다.',
      daily: '글자가 작으면 당기지 말고 글자 크기를 키웁니다.',
      check: '팔을 뻗어 거리를 다시 재 봅니다.' },
    options: [{ label: '팔을 뻗은 길이 정도 (40~75cm)', score: 0 }, { label: '그보다 멀다', score: 1 }, { label: '그보다 가깝다', score: 2 }] },

  { id: 'glare', step: 2, cat: 'view', short: '빛 반사·조명', text: '빛이 반사되거나 눈이 부시거나 어두워서 눈을 찡그릴 때가 있나요?',
    why: 'ROSA는 화면의 빛 반사를 추가 위험 요인으로 셉니다. 잘 안 보이면 몸을 기울여 보게 됩니다.',
    tip: { title: '빛 반사와 어두운 조명 없애기',
      risk: '반사나 눈부심이 있으면 눈을 찡그리고 몸을 기울여 보게 되어 눈 피로와 목 부담이 함께 늘어납니다.',
      today: '창문이 화면 옆쪽에 오도록 자리를 돌리고, 필기할 때는 스탠드를 쓰는 손 반대쪽에 둡니다.',
      daily: '20분마다 먼 곳을 20초 동안 바라봅니다.',
      check: '화면을 끈 상태에서 창문이나 조명이 비치는지 봅니다.' },
    options: [{ label: '없다', score: 0 }, { label: '가끔 있다', score: 1 }, { label: '자주 있다', score: 2 }] },

  { id: 'feet', step: 3, cat: 'seat', short: '발과 무릎', pic: 'pose', text: '앉았을 때 발과 무릎은 어느 쪽에 가깝나요?',
    why: 'ROSA 의자 높이 항목의 기준은 무릎 90°와 발바닥 접지이며, 발이 바닥에 닿지 않으면 가장 높은 점수를 줍니다.',
    tip: { title: '발바닥 전체를 받치고 무릎 90° 만들기',
      risk: '발이 뜨면 허벅지 아래가 눌려 혈액순환이 줄고 다리가 붓거나 저리며, 체중이 허리로 쏠립니다.',
      today: '의자 높이를 조절하거나 발밑에 발받침이나 상자를 둡니다.',
      daily: '앉을 때 두 발을 바닥이나 발받침에 나란히 둡니다.',
      check: '옆에서 봤을 때 무릎이 엉덩이와 같은 높이인지 봅니다.' },
    options: [{ label: '발바닥이 닿고 무릎이 약 90°', score: 0 }, { label: '의자가 낮아 무릎이 올라온다', score: 2 }, { label: '발끝만 닿는다', score: 2 }, { label: '발이 떠 있다', score: 3 }] },

  { id: 'depth', step: 3, cat: 'seat', short: '앉는 깊이', text: '깊숙이 앉았을 때 무릎 뒤와 의자 끝 사이에 틈이 얼마나 있나요?',
    why: 'ROSA 좌판 깊이 항목의 기준은 무릎 뒤와 의자 끝 사이 약 7.5cm(주먹 하나)입니다.',
    tip: { title: '무릎 뒤에 주먹 하나 틈 만들기',
      risk: '의자 끝이 무릎 뒤를 누르면 혈관과 신경이 눌려 다리가 저리고, 끝에 걸터앉으면 등받이를 쓸 수 없습니다.',
      today: '좌판이 깊으면 등 뒤에 쿠션을 대고, 걸터앉아 있었다면 깊숙이 들어가 앉습니다.',
      daily: '앉을 때 무릎 뒤에 주먹을 넣어 봅니다.',
      check: '주먹 하나가 딱 들어가는지 확인합니다.' },
    options: [{ label: '주먹 하나 정도', score: 0 }, { label: '틈이 없어 무릎 뒤가 눌린다', score: 2 }, { label: '의자 끝에 걸터앉아 틈이 아주 넓다', score: 2 }] },

  { id: 'lumbar', step: 3, cat: 'seat', short: '허리 받침', text: '허리의 오목한 부분을 등받이가 받쳐 주나요?',
    why: 'ROSA 등받이 항목은 허리 받침이 없거나 등받이를 쓰지 않으면 점수를 올립니다.',
    tip: { title: '허리 오목한 곳 받치기',
      risk: '허리를 받쳐 주지 않으면 허리 근육이 혼자 버티다 지쳐 구부정해지고 요통이 생기기 쉽습니다.',
      today: '수건을 말거나 허리 쿠션을 벨트 높이에 댑니다.',
      daily: '등받이에 기대어 작업합니다.',
      check: '허리 뒤에 손을 넣어 빈틈이 없는지 봅니다.' },
    options: [{ label: '받쳐 준다', score: 0 }, { label: '등받이는 있지만 허리가 뜬다', score: 2 }, { label: '등받이가 없거나 기대지 않는다', score: 3 }] },

  { id: 'elbow', step: 4, cat: 'arm', short: '팔과 어깨', text: '타이핑하거나 필기할 때 팔과 어깨는 어떤가요?',
    why: 'ROSA 팔걸이·키보드 항목과 RULA 위팔 항목은 어깨가 들리거나 팔을 멀리 뻗으면 점수를 올립니다.',
    tip: { title: '팔꿈치 90°, 어깨 힘 빼기',
      risk: '어깨가 들리거나 팔이 떠 있으면 어깨와 목 근육이 팔 무게를 계속 들고 있어 뭉치고 결립니다.',
      today: '팔꿈치와 작업면 높이가 같아지게 의자를 맞추고 키보드나 노트를 몸 가까이 당깁니다.',
      daily: '아래팔을 책상이나 팔걸이에 올려놓고 작업합니다.',
      check: '어깨를 으쓱했다 내렸을 때 높이가 그대로인지 봅니다.' },
    options: [{ label: '팔꿈치 약 90°, 아래팔을 올려놓고 어깨가 편하다', score: 0 }, { label: '팔이 받침 없이 떠 있다', score: 1 }, { label: '팔을 멀리 뻗어야 닿는다', score: 2 }, { label: '작업면이 높아 어깨가 들린다', score: 2 }] },

  { id: 'wrist', step: 4, cat: 'arm', short: '손목 각도', pic: 'wrist', text: '타이핑하거나 필기할 때 손목은 어느 쪽에 가깝나요?',
    why: 'RULA는 손목이 일자일 때 가장 낮은 점수를, 15° 넘게 꺾이면 가장 높은 점수를 줍니다. ROSA도 15° 넘는 꺾임을 위험으로 봅니다.',
    tip: { title: '손목 일자로 펴기',
      risk: '손목이 15° 넘게 꺾이거나 모서리에 눌리면 손목 안 신경 통로(손목터널)의 압력이 올라 저림과 통증이 생길 수 있습니다.',
      today: '키보드 뒤쪽 받침 다리를 접고, 손목이 닿는 모서리에 손목 받침이나 수건을 댑니다.',
      daily: '작업 중 손등과 아래팔이 일직선인지 봅니다.',
      check: '옆에서 봤을 때 손등과 아래팔이 한 선인지 확인합니다.' },
    options: [{ label: '아래팔과 일자다', score: 0 }, { label: '조금 위로 꺾인다', score: 1 }, { label: '많이 꺾인다 (15° 이상)', score: 2 }, { label: '손목을 책상 모서리에 눌러 댄다', score: 2 }] }
];

/* ---------------------------------------------------------
   신체 부위: 통증 지도와 '불편 부위' 질문에 함께 씁니다
   - qs   : 이 부위에 부담을 주는 질문들
   - cats : 이 부위가 이미 불편하면 우선순위를 올릴 영역
   - harm : 지금 자세를 유지할 때 생길 수 있는 문제
   --------------------------------------------------------- */
var BODY = [
  { id: 'eye', label: '눈', qs: ['dist', 'glare', 'cont'], cats: ['view', 'habit'],
    harm: '초점 근육이 쉬지 못하고 눈 깜빡임이 줄어 눈 피로, 건조함, 두통이 생길 수 있습니다.',
    stretch: '20분마다 6m 이상 먼 곳을 20초 동안 바라봅니다.' },
  { id: 'neck', label: '목', qs: ['neck', 'view', 'twist'], cats: ['posture', 'view'],
    harm: '머리 무게를 목 뒤 근육이 계속 버텨 목 통증, 거북목, 긴장성 두통으로 이어질 수 있습니다.',
    stretch: '턱을 당긴 채 고개를 좌우로 천천히 기울여 15초씩 늘립니다.' },
  { id: 'shoulder', label: '어깨', qs: ['elbow', 'twist', 'trunk'], cats: ['arm', 'posture'],
    harm: '어깨 근육이 팔 무게를 계속 들고 있어 뭉치고 결리며, 팔이 저릴 수 있습니다.',
    stretch: '양손을 등 뒤에서 깍지 끼고 가슴을 펴며 15초 버팁니다.' },
  { id: 'back', label: '허리', qs: ['trunk', 'lumbar', 'cont'], cats: ['posture', 'seat'],
    harm: '허리 곡선이 무너져 디스크에 압력이 몰리고 허리 통증이 만성화될 수 있습니다.',
    stretch: '일어서서 양손을 허리에 대고 상체를 살짝 뒤로 젖혀 5초, 5회 반복합니다.' },
  { id: 'wrist', label: '손목', qs: ['wrist', 'elbow'], cats: ['arm'],
    harm: '손목 안 신경 통로가 눌려 손 저림이나 손목터널증후군, 힘줄 염증 위험이 커집니다.',
    stretch: '팔을 앞으로 뻗고 반대 손으로 손등을 몸 쪽으로 당겨 15초 버팁니다.' },
  { id: 'leg', label: '다리', qs: ['feet', 'depth', 'cont'], cats: ['seat', 'habit'],
    harm: '허벅지 아래와 무릎 뒤가 눌려 혈액순환이 줄고 다리가 붓거나 저릴 수 있습니다.',
    stretch: '앉은 채 한쪽 다리를 펴고 발끝을 몸 쪽으로 당겨 15초 버팁니다.' }
];

/* 예시 응답: '예시 결과 보기'에서 사용 (PREV는 2주 전 기록 예시) */
var SAMPLE      = { device: 1, hours: 2, cont: 2, neck: 2, trunk: 3, twist: 0, view: 3, dist: 2, glare: 1, feet: 0, depth: 0, lumbar: 1, elbow: 1, wrist: 2, pain: ['neck', 'eye'] };
var SAMPLE_PREV = { device: 1, hours: 2, cont: 3, neck: 3, trunk: 3, twist: 1, view: 3, dist: 2, glare: 2, feet: 2, depth: 0, lumbar: 2, elbow: 1, wrist: 2, pain: ['neck', 'eye', 'back'] };

/* =========================================================
   B. 저장소: localStorage를 안전하게 읽고 쓰는 함수
   ========================================================= */
var memory = {};
function load(key, fallback) {
  try {
    var text = localStorage.getItem('ergofit2_' + key);
    return text ? JSON.parse(text) : (key in memory ? memory[key] : fallback);
  } catch (e) { return key in memory ? memory[key] : fallback; }
}
function save(key, value) {
  memory[key] = value;
  try { localStorage.setItem('ergofit2_' + key, JSON.stringify(value)); } catch (e) { /* 저장 실패 시 memory만 사용 */ }
}

/* =========================================================
   C. 분석 로직
   ========================================================= */
function findQ(id) { return QUESTIONS.filter(function (q) { return q.id === id; })[0]; }
function scoreOf(q, answers) { return q.options[answers[q.id]].score; }
function maxOf(q) { return Math.max.apply(null, q.options.map(function (o) { return o.score; })); }

function levelOf(value) {
  if (value < 25) return { cls: 'ok', text: '양호' };
  if (value < 60) return { cls: 'warn', text: '주의' };
  return { cls: 'bad', text: '개선 필요' };
}

/* 영역별 위험도(0~100)와 우선순위 계산 */
function analyze(answers) {
  var cats = CATEGORIES.map(function (cat) {
    var sum = 0, max = 0;
    QUESTIONS.forEach(function (q) {
      if (q.cat !== cat.id) return;
      sum += scoreOf(q, answers); max += maxOf(q);
    });
    var risk = Math.round(sum / max * 100);
    // 이미 불편한 부위와 관련된 영역은 우선순위를 10점씩 올립니다
    var related = BODY.filter(function (b) { return answers.pain.indexOf(b.id) !== -1 && b.cats.indexOf(cat.id) !== -1; });
    var priority = Math.min(100, risk + related.length * 10);
    return { id: cat.id, name: cat.name, meaning: cat.meaning, risk: risk, priority: priority, level: levelOf(priority), pains: related };
  });
  var avg = cats.reduce(function (t, c) { return t + c.risk; }, 0) / cats.length;
  var levels = {};
  cats.forEach(function (c) { levels[c.id] = c.level.cls; });
  return { overall: Math.round(100 - avg), cats: cats, levels: levels,
           sorted: cats.slice().sort(function (a, b) { return b.priority - a.priority; }) };
}

/* 개선 행동 목록. 위험한 것부터 정렬하고, 앞의 3개가 '핵심 실천 계획'이 됩니다.
   weight = 선택지 점수 + (이미 불편한 부위와 관련 있으면 0.5) */
function getActions(answers, analysis) {
  var actions = [];
  QUESTIONS.forEach(function (q) {
    if (!q.cat) return;
    var score = scoreOf(q, answers);
    if (score === 0) return;
    var cat = analysis.cats.filter(function (c) { return c.id === q.cat; })[0];
    var today = typeof q.tip.today === 'function' ? q.tip.today(answers) : q.tip.today;
    actions.push({ id: q.id, q: q, cat: cat, score: score, answer: q.options[answers[q.id]].label,
      weight: score + (cat.pains.length ? 0.5 : 0) + cat.priority / 1000,
      must: score === 3 || (score === 2 && cat.pains.length > 0),
      title: q.tip.title, risk: q.tip.risk, today: today, daily: q.tip.daily, check: q.tip.check });
  });
  return actions.sort(function (a, b) { return b.weight - a.weight; });
}

/* 부위별 통증 위험: 0 없음 / 1 주의 / 2 높음 */
function bodyRisk(answers) {
  return BODY.map(function (b) {
    var sum = 0, max = 0, causes = [];
    b.qs.forEach(function (id) {
      var q = findQ(id), s = scoreOf(q, answers);
      sum += s; max += maxOf(q);
      if (s > 0) causes.push(q.short + '(' + q.options[answers[id]].label + ')');
    });
    var ratio = sum / max;
    var level = ratio < 0.2 ? 0 : ratio < 0.5 ? 1 : 2;
    var reported = answers.pain.indexOf(b.id) !== -1;
    if (reported && level === 0) level = 1;
    return { id: b.id, label: b.label, harm: b.harm, level: level, reported: reported, causes: causes };
  });
}

/* =========================================================
   D. 그림 1: 앉은 자세 (옆모습 막대 사람)
   a   : 응답 중 neck / trunk / view / feet 값(0~3)에 따라 자세가 바뀝니다
   opt : levels(영역별 색), badges(번호 표시), focus(강조할 부분)
   ========================================================= */
function drawPose(a, opt) {
  opt = opt || {};
  var lv = opt.levels || {};
  function col(cat) { return lv[cat] ? 'var(--' + lv[cat] + ')' : (opt.focus === cat ? 'var(--accent)' : 'var(--ink)'); }
  function r(n) { return Math.round(n * 10) / 10; }
  var rad = Math.PI / 180;
  var trunk = a.trunk || 0, neck = a.neck || 0, view = a.view || 0, feet = a.feet || 0;

  // 몸통: 엉덩이에서 어깨까지. tAng = 수직에서 앞으로 기운 각도
  var hipX = trunk === 2 ? 146 : 128, hipY = 182;
  var tAng = [-6, 10, -24, 30][trunk];
  var sh = { x: hipX + 86 * Math.sin(tAng * rad), y: hipY - 86 * Math.cos(tAng * rad) };

  // 머리: 어깨에서 nAng만큼 더 기울어진 위치. gaze = 시선 방향(아래가 +)
  var nAng = tAng + [4, 24, 52, 30][neck] + (trunk === 2 ? 26 : 0);
  var hd = { x: sh.x + 34 * Math.sin(nAng * rad), y: sh.y - 34 * Math.cos(nAng * rad) };
  var gaze = [4, 18, 48, -20][neck] * rad;
  var eye = { x: hd.x + 17 * Math.cos(gaze), y: hd.y + 17 * Math.sin(gaze) };
  var nose = { x: hd.x + 25 * Math.cos(gaze), y: hd.y + 25 * Math.sin(gaze) };

  // 팔과 다리
  var elbow = { x: Math.min(sh.x + 14, 200), y: 158 };
  var knee = { x: hipX + (trunk === 2 ? 62 : 76), y: feet === 1 ? 164 : 184 };
  var shin, foot;
  if (feet === 2)      { shin = [knee.x - 4, 240]; foot = [knee.x - 4, 244, knee.x + 14, 259]; }   // 발끝만 닿음
  else if (feet === 3) { shin = [knee.x + 2, 230]; foot = [knee.x + 2, 236, knee.x + 28, 236]; }   // 발이 뜸
  else                 { shin = [knee.x + 2, 252]; foot = [knee.x + 2, 258, knee.x + 28, 258]; }   // 바닥에 닿음

  // 보는 대상(화면)
  var top = [58, 82, 18, 122][view];
  var screen = view === 3
    ? '<line x1="334" y1="122" x2="318" y2="157" stroke="' + col('view') + '" stroke-width="9" stroke-linecap="round"/>'
    : '<line x1="330" y1="' + (top + 60) + '" x2="330" y2="160" stroke="var(--ink-soft)" stroke-width="5"/>' +
      '<line x1="310" y1="158" x2="350" y2="158" stroke="var(--ink-soft)" stroke-width="4"/>' +
      '<line x1="322" y1="' + top + '" x2="322" y2="' + (top + 74) + '" stroke="' + col('view') + '" stroke-width="9" stroke-linecap="round"/>';
  var target = view === 3 ? [330, 128] : [318, top + 8];

  function badge(x, y, n, cat) {
    return '<circle cx="' + r(x) + '" cy="' + r(y) + '" r="12" fill="' + col(cat) + '" stroke="#fff" stroke-width="2"/>' +
           '<text x="' + r(x) + '" y="' + r(y + 4.5) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">' + n + '</text>';
  }

  var svg = '<svg viewBox="0 0 420 290" role="img" aria-label="책상에 앉은 사람의 옆모습">' +
    '<line x1="20" y1="268" x2="400" y2="268" stroke="var(--line)" stroke-width="3"/>' +
    /* 의자 */
    '<g stroke="var(--ink-soft)" stroke-width="7" stroke-linecap="round" fill="none">' +
      '<line x1="99" y1="100" x2="96" y2="188"/><line x1="96" y1="193" x2="172" y2="193"/>' +
      '<line x1="132" y1="197" x2="132" y2="258"/><line x1="104" y1="262" x2="160" y2="262"/></g>' +
    /* 책상과 키보드 */
    '<rect x="205" y="160" width="185" height="9" rx="3" fill="var(--accent-dark)"/>' +
    '<rect x="374" y="169" width="8" height="97" fill="var(--accent-dark)"/>' +
    '<rect x="224" y="153" width="44" height="6" rx="2" fill="var(--ink-soft)"/>' +
    screen +
    /* 시선 */
    '<line x1="' + r(nose.x) + '" y1="' + r(nose.y) + '" x2="' + target[0] + '" y2="' + target[1] + '" stroke="var(--ink-soft)" stroke-width="1.5" stroke-dasharray="5 5"/>' +
    /* 사람 */
    '<g stroke="var(--ink)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none">' +
      '<line stroke="' + col('posture') + '" x1="' + r(sh.x) + '" y1="' + r(sh.y) + '" x2="' + hipX + '" y2="' + hipY + '"/>' +
      '<line stroke="' + (opt.focus === 'neck' ? 'var(--accent)' : col('posture')) + '" stroke-width="9" x1="' + r(sh.x) + '" y1="' + r(sh.y) + '" x2="' + r(hd.x) + '" y2="' + r(hd.y) + '"/>' +
      '<polyline points="' + hipX + ',' + hipY + ' ' + knee.x + ',' + knee.y + ' ' + shin[0] + ',' + shin[1] + '"/>' +
      '<line stroke="' + col('seat') + '" x1="' + foot[0] + '" y1="' + foot[1] + '" x2="' + foot[2] + '" y2="' + foot[3] + '"/>' +
      '<polyline stroke="' + col('arm') + '" stroke-width="9" points="' + r(sh.x + 2) + ',' + r(sh.y + 12) + ' ' + r(elbow.x) + ',' + elbow.y + ' 228,150"/></g>' +
    '<circle cx="' + r(hd.x) + '" cy="' + r(hd.y) + '" r="18" fill="' + (opt.focus === 'neck' ? 'var(--accent)' : 'var(--ink)') + '"/>' +
    '<line x1="' + r(eye.x) + '" y1="' + r(eye.y) + '" x2="' + r(nose.x) + '" y2="' + r(nose.y) + '" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>';

  if (opt.badges) {
    svg += '<circle cx="46" cy="50" r="22" fill="var(--surface)" stroke="' + col('habit') + '" stroke-width="5"/>' +
           '<polyline points="46,36 46,50 56,56" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>' +
           badge(78, 30, 1, 'habit') + badge(sh.x - 30, sh.y + 30, 2, 'posture') + badge(356, target[1] + 6, 3, 'view') +
           badge(foot[2] + 22, foot[3] - 14, 4, 'seat') + badge(244, 128, 5, 'arm');
  }
  return svg + '</svg>';
}

/* 그림 2: 손목 확대 (선택지 예시용) */
function drawWrist(i) {
  var ang = [6, -12, -36, 6][i] * Math.PI / 180;
  var hx = 62 + 34 * Math.cos(ang), hy = 34 + 34 * Math.sin(ang);
  return '<svg viewBox="0 0 120 64" role="img" aria-label="손목 각도 예시">' +
    '<line x1="0" y1="54" x2="120" y2="54" stroke="var(--line)" stroke-width="3"/>' +
    '<rect x="68" y="44" width="46" height="8" rx="2" fill="var(--ink-soft)"/>' +
    (i === 3 ? '<rect x="38" y="41" width="30" height="13" fill="var(--accent-dark)"/><circle cx="60" cy="38" r="6" fill="var(--pain)" opacity="0.5"/>' : '') +
    '<line x1="8" y1="34" x2="62" y2="34" stroke="var(--ink)" stroke-width="10" stroke-linecap="round"/>' +
    '<line x1="62" y1="34" x2="' + hx.toFixed(1) + '" y2="' + hy.toFixed(1) + '" stroke="var(--accent)" stroke-width="9" stroke-linecap="round"/>' +
    '</svg>';
}

/* 그림 3: 통증 지도 (사람 모양 위에 빨간색으로 부담 부위 표시) */
function drawBody(risks) {
  // 부위별 빨간 영역의 위치: [중심x, 중심y, 가로반지름, 세로반지름]
  var zones = {
    eye: [[150, 36, 16, 8]], neck: [[150, 68, 14, 12]], shoulder: [[119, 88, 18, 13], [181, 88, 18, 13]],
    back: [[150, 180, 30, 22]], wrist: [[83, 234, 13, 13], [217, 234, 13, 13]], leg: [[131, 318, 16, 44], [169, 318, 16, 44]]
  };
  var skin = 'var(--skin)';
  var svg = '<svg viewBox="0 0 300 420" role="img" aria-label="통증이 생길 수 있는 부위를 빨간색으로 표시한 인체 그림">' +
    '<defs><radialGradient id="painGrad"><stop offset="0" stop-color="var(--pain)" stop-opacity="1"/><stop offset="0.6" stop-color="var(--pain)" stop-opacity="0.75"/><stop offset="1" stop-color="var(--pain)" stop-opacity="0"/></radialGradient></defs>' +
    /* 사람 모양: 다리 → 팔 → 몸통 → 목 → 머리 순서로 겹쳐 그립니다 */
    '<g fill="none" stroke="' + skin + '" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline stroke-width="34" points="133,212 131,290"/><polyline stroke-width="26" points="131,290 131,385"/>' +
      '<polyline stroke-width="34" points="167,212 169,290"/><polyline stroke-width="26" points="169,290 169,385"/>' +
      '<polyline stroke-width="21" points="110,94 95,165"/><polyline stroke-width="17" points="95,165 84,232"/>' +
      '<polyline stroke-width="21" points="190,94 205,165"/><polyline stroke-width="17" points="205,165 216,232"/></g>' +
    '<g fill="' + skin + '">' +
      '<ellipse cx="128" cy="402" rx="15" ry="9"/><ellipse cx="172" cy="402" rx="15" ry="9"/>' +
      '<ellipse cx="82" cy="249" rx="9" ry="14"/><ellipse cx="218" cy="249" rx="9" ry="14"/>' +
      '<path d="M108,82 Q150,70 192,82 Q202,86 198,100 L184,150 Q181,178 187,214 Q150,226 113,214 Q119,178 116,150 L102,100 Q98,86 108,82 Z"/>' +
      '<rect x="141" y="56" width="18" height="24" rx="6"/>' +
      '<ellipse cx="150" cy="38" rx="20" ry="25"/></g>';

  risks.forEach(function (rk) {
    if (rk.level === 0) return;
    var op = rk.level === 2 ? 0.95 : 0.5;
    zones[rk.id].forEach(function (z) {
      svg += '<ellipse cx="' + z[0] + '" cy="' + z[1] + '" rx="' + (z[2] + 4) + '" ry="' + (z[3] + 4) + '" fill="url(#painGrad)" opacity="' + op + '"/>';
    });
    // 오른쪽에 부위 이름표
    var last = zones[rk.id][zones[rk.id].length - 1];
    svg += '<line x1="' + (last[0] + last[2]) + '" y1="' + last[1] + '" x2="246" y2="' + last[1] + '" stroke="var(--pain)" stroke-width="1.5"/>' +
           '<text x="250" y="' + (last[1] + 5) + '" font-size="15" font-weight="700" fill="var(--pain)">' + rk.label + '</text>';
  });
  return svg + '</svg>';
}

/* =========================================================
   E. 화면 그리기 (페이지별 render 함수)
   ========================================================= */
function $(id) { return document.getElementById(id); }
function formatDate(iso) { var d = new Date(iso); return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate(); }

var SOURCES = '<div class="card stack tight"><h3>점검 기준의 근거</h3>' +
  '<p class="small">질문과 점수는 아래 두 평가 도구의 항목과 기준 각도를 참고해 일반 사용자가 스스로 답할 수 있게 줄인 것입니다. 공식 평가 점수와 같지 않습니다.</p>' +
  '<ul class="small muted"><li><strong>RULA</strong> (Rapid Upper Limb Assessment): 목, 몸통, 팔, 손목의 각도로 상체 부담을 평가합니다. McAtamney &amp; Corlett, Applied Ergonomics, 1993.</li>' +
  '<li><strong>ROSA</strong> (Rapid Office Strain Assessment): 의자, 모니터, 키보드, 사용 시간으로 사무 작업환경을 평가합니다. Sonne, Villalta &amp; Andrews, Applied Ergonomics, 2012.</li></ul></div>';

function emptyState(message) {
  return '<div class="card stack"><h2>아직 점검 결과가 없습니다</h2><p class="muted">' + message + '</p>' +
         '<div class="row"><a class="btn" href="#survey">설문 시작하기</a>' +
         '<button class="btn ghost" type="button" onclick="useSample()">예시 결과 보기</button></div></div>';
}

/* 점검 기록 한 건 만들기 */
function makeRecord(answers, date) {
  var a = analyze(answers), risks = {};
  a.cats.forEach(function (c) { risks[c.id] = c.risk; });
  return { date: date.toISOString(), overall: a.overall, risks: risks, answers: answers };
}

/* 예시 보기: 응답을 채우고, 기록이 비어 있으면 2주 전·오늘 예시 기록 두 건을 넣습니다 */
function useSample() {
  save('answers', SAMPLE);
  if (!load('history', []).length) {
    var before = new Date(); before.setDate(before.getDate() - 14);
    save('history', [makeRecord(SAMPLE_PREV, before), makeRecord(SAMPLE, new Date())]);
  }
  render();
}

/* ---------- 1. 메인 ---------- */
function renderHome() {
  $('home-figure').innerHTML = drawPose({}, { levels: { habit: 'ok', posture: 'ok', view: 'ok', seat: 'ok', arm: 'ok' }, badges: true }) +
    '<p class="small muted">점검하는 다섯 곳: ① 시간·휴식 ② 목·몸통 ③ 시선·화면 ④ 의자·하체 ⑤ 팔·손목</p>';
  var history = load('history', []);
  $('home-last').textContent = history.length
    ? '마지막 점검: ' + formatDate(history[history.length - 1].date) + ' · 종합 ' + history[history.length - 1].overall + '점'
    : '';
}

/* ---------- 2. 설문 ---------- */
var currentStep = 0;
var draft = {};

function optionPicture(q, i) {
  if (q.pic === 'wrist') return drawWrist(i);
  if (q.pic === 'pose') {
    var pose = {}; pose[q.id] = i;
    var focus = { neck: 'neck', trunk: 'posture', view: 'view', feet: 'seat' }[q.id];
    return drawPose(pose, { focus: focus });
  }
  return '';
}

function renderSurvey() {
  $('survey-title').textContent = STEPS[currentStep];
  $('survey-count').textContent = (currentStep + 1) + ' / ' + STEPS.length + ' 단계';
  $('survey-progress').style.width = ((currentStep + 1) / STEPS.length * 100) + '%';
  $('survey-error').textContent = '';
  $('btn-prev').style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  $('btn-next').textContent = currentStep === STEPS.length - 1 ? '결과 보기' : '다음';

  var html = '';
  if (currentStep < STEPS.length - 1) {
    QUESTIONS.filter(function (q) { return q.step === currentStep; }).forEach(function (q) {
      html += '<fieldset class="question"><legend>' + q.text + '</legend>' +
              '<p class="basis">왜 묻나요? ' + q.why + '</p><div class="options' + (q.pic ? ' pics' : '') + '">';
      q.options.forEach(function (o, i) {
        var checked = draft[q.id] === i ? ' checked' : '';
        html += '<label class="option"><input type="radio" id="' + q.id + '-' + i + '" name="' + q.id + '" value="' + i + '"' + checked + '>' +
                '<span>' + optionPicture(q, i) + o.label + '</span></label>';
      });
      html += '</div></fieldset>';
    });
  } else {
    html += '<fieldset class="question"><legend>최근 한 달 동안 불편했던 부위를 모두 고르세요. 없으면 그대로 넘어가세요.</legend>' +
            '<p class="basis">왜 묻나요? 이미 불편한 부위와 관련된 영역을 먼저 고치도록 우선순위를 올립니다.</p><div class="options pics">';
    BODY.forEach(function (b) {
      var checked = (draft.pain || []).indexOf(b.id) !== -1 ? ' checked' : '';
      html += '<label class="option"><input type="checkbox" id="pain-' + b.id + '" name="pain" value="' + b.id + '"' + checked + '><span>' + b.label + '</span></label>';
    });
    html += '</div></fieldset>';
  }
  $('survey-form').innerHTML = html;
}

/* 현재 단계에서 고른 값을 draft에 옮깁니다. 빠진 질문이 있으면 false */
function collectStep() {
  var form = $('survey-form');
  if (currentStep === STEPS.length - 1) {
    draft.pain = Array.prototype.map.call(form.querySelectorAll('input[name="pain"]:checked'), function (el) { return el.value; });
    return true;
  }
  var complete = true;
  QUESTIONS.filter(function (q) { return q.step === currentStep; }).forEach(function (q) {
    var picked = form.querySelector('input[name="' + q.id + '"]:checked');
    if (picked) draft[q.id] = Number(picked.value); else complete = false;
  });
  return complete;
}

$('btn-next').addEventListener('click', function () {
  if (!collectStep()) { $('survey-error').textContent = '모든 질문에 답한 뒤 다음으로 넘어가세요.'; return; }
  if (currentStep < STEPS.length - 1) { currentStep++; renderSurvey(); window.scrollTo(0, 0); return; }
  // 마지막 단계: 응답 저장 + 점검 기록 추가 + 결과 페이지로 이동
  save('answers', draft);
  var history = load('history', []);
  history.push(makeRecord(draft, new Date()));
  save('history', history);
  currentStep = 0;
  location.hash = 'result';
});
$('btn-prev').addEventListener('click', function () {
  collectStep();
  if (currentStep > 0) { currentStep--; renderSurvey(); }
});

/* ---------- 3. 분석 결과 ---------- */
/* 이전 점검과 비교하는 카드 (기록이 2건 이상일 때만) */
function compareCard(history) {
  if (history.length < 2) return '';
  var prev = history[history.length - 2], now = history[history.length - 1];
  var diff = now.overall - prev.overall;
  var diffText = diff > 0 ? '<span class="delta-up">+' + diff + '점 좋아졌습니다</span>'
               : diff < 0 ? '<span class="delta-down">' + diff + '점 낮아졌습니다</span>' : '점수가 같습니다';

  var rows = CATEGORIES.map(function (c) {
    var d = now.risks[c.id] - prev.risks[c.id];   // 위험도는 낮아질수록 좋음
    var txt = d < 0 ? '<span class="delta-up">' + d + ' 개선</span>' : d > 0 ? '<span class="delta-down">+' + d + ' 악화</span>' : '변화 없음';
    return '<tr class="num"><td>' + c.name + '</td><td>' + prev.risks[c.id] + '</td><td>' + now.risks[c.id] + '</td><td>' + txt + '</td></tr>';
  }).join('');

  function side(rec, title) {
    return '<div class="figure stack tight"><p class="small muted">' + title + ' · ' + formatDate(rec.date) + '</p>' +
           drawPose(rec.answers, { levels: analyze(rec.answers).levels }) +
           '<p class="num"><strong style="font-size:1.5rem">' + rec.overall + '</strong> 점</p></div>';
  }
  return '<div class="card stack"><div class="cat-head"><h3>이전 점검과 비교</h3><span>' + diffText + '</span></div>' +
         '<div class="compare">' + side(prev, '이전') + '<span class="arrow">→</span>' + side(now, '이번') + '</div>' +
         '<div class="table-wrap"><table><thead><tr><th>영역</th><th>이전 위험도</th><th>이번 위험도</th><th>변화</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
}

function renderResult() {
  var answers = load('answers', null);
  if (!answers) { $('result-body').innerHTML = emptyState('설문을 마치면 영역별 위험도, 통증 예상 부위, 개선 우선순위가 여기에 표시됩니다.'); return; }
  var a = analyze(answers);
  var top = a.sorted[0];
  var overallLevel = levelOf(100 - a.overall);
  var summary = top.level.cls === 'ok' ? '모든 영역이 권장 기준에 가깝습니다.' : '가장 먼저 고칠 부분은 <strong>' + top.name + '</strong>입니다.';

  // 영역별 우선순위 + 쉬운 말 피드백
  var rows = a.sorted.map(function (c, i) {
    var fb = c.level.cls === 'ok' ? '권장 기준에 가깝습니다. 지금 상태를 유지하세요.' : c.meaning;
    if (c.pains.length) fb += ' 불편하다고 답한 ' + c.pains.map(function (p) { return p.label; }).join('·') + '과 관련이 있어 순위를 올렸습니다.';
    return '<div class="cat-row"><div class="cat-head"><span><span class="rank">' + (i + 1) + '</span><strong>' + c.name + '</strong></span>' +
           '<span class="pill ' + c.level.cls + '">' + c.level.text + '</span></div>' +
           '<div class="bar"><div class="' + c.level.cls + '" style="width:' + Math.max(c.priority, 4) + '%"></div></div>' +
           '<p class="small">' + fb + '</p><p class="small muted num">위험도 ' + c.risk + ' / 100</p></div>';
  }).join('');

  var legend = [['habit', '① 시간·휴식'], ['posture', '② 목·몸통'], ['view', '③ 시선·화면'], ['seat', '④ 의자·하체'], ['arm', '⑤ 팔·손목']]
    .map(function (x) { return '<span class="pill ' + a.levels[x[0]] + '">' + x[1] + '</span>'; }).join(' ');

  // 통증 지도
  var risks = bodyRisk(answers);
  var shown = risks.filter(function (rk) { return rk.level > 0; }).sort(function (x, y) { return y.level - x.level; });
  var bodyList = shown.length ? shown.map(function (rk) {
    return '<div class="body-item"><p><span class="dot' + (rk.level === 1 ? ' mild' : '') + '"></span><strong>' + rk.label + '</strong> ' +
           '<span class="pill ' + (rk.level === 2 ? 'bad' : 'warn') + '">' + (rk.level === 2 ? '부담 큼' : '부담 있음') + '</span>' +
           (rk.reported ? ' <span class="tag">이미 불편함</span>' : '') + '</p>' +
           '<p class="small">' + rk.harm + '</p>' +
           (rk.causes.length ? '<p class="small muted">원인이 된 응답: ' + rk.causes.join(', ') + '</p>' : '') + '</div>';
  }).join('') : '<p class="muted">지금 자세에서는 특별히 부담이 몰리는 부위가 없습니다.</p>';

  $('result-body').innerHTML =
    '<div class="card result-top"><div><p class="muted small">종합 점수</p><p class="score-big num">' + a.overall + '<span class="small muted"> / 100</span></p>' +
    '<span class="pill ' + overallLevel.cls + '">' + overallLevel.text + '</span></div>' +
    '<div class="stack"><h2>' + summary + '</h2><p class="muted">점수가 높을수록 권장 자세에 가깝습니다.</p>' +
    '<div class="row"><a class="btn" href="#guide">실천 계획 보기</a><a class="btn ghost" href="#survey">다시 점검하기</a></div></div></div>' +

    '<div class="two-col"><div class="card stack figure"><h3>내 응답으로 그린 자세</h3>' + drawPose(answers, { levels: a.levels, badges: true }) + '<div class="row">' + legend + '</div></div>' +
    '<div class="card"><h3>개선 우선순위</h3>' + rows + '</div></div>' +

    '<div class="card stack"><div><h3>이 자세를 계속 유지하면</h3><p class="small muted">빨간색이 진할수록 부담이 큰 부위입니다. 통증을 진단하는 것이 아니라 자세가 부담을 주는 곳을 보여 줍니다.</p></div>' +
    '<div class="body-grid"><div class="figure">' + drawBody(risks) + '</div><div>' + bodyList + '</div></div></div>' +

    compareCard(load('history', [])) + SOURCES;
}

/* ---------- 4. 개선 가이드 ---------- */
function renderGuide() {
  var answers = load('answers', null);
  if (!answers) { $('guide-body').innerHTML = emptyState('설문 응답에 맞춘 실천 계획이 여기에 표시됩니다.'); return; }
  var actions = getActions(answers, analyze(answers));
  var html = '';

  if (!actions.length) {
    html += '<div class="card soft"><h2>고칠 항목이 없습니다</h2><p>모든 응답이 권장 기준에 맞습니다. 2주 뒤 다시 점검해 유지되는지 확인하세요.</p></div>';
  } else {
    // 핵심 3가지 실천 계획
    html += '<div class="card plan stack"><div><h2>먼저 고칠 ' + Math.min(3, actions.length) + '가지 실천 계획</h2>' +
            '<p class="muted">위험 점수가 가장 높고 이미 불편한 부위와 관련된 행동을 골랐습니다. 2주 동안 이것만 지켜도 됩니다.</p></div><div>';
    actions.slice(0, 3).forEach(function (act, i) {
      html += '<div class="plan-item"><div class="plan-no">' + (i + 1) + '</div><div>' +
              '<div class="cat-head"><h3>' + act.title + '</h3><span class="pill ' + (act.must ? 'bad' : 'warn') + '">' + (act.must ? '반드시 개선' : '우선 개선') + '</span></div>' +
              '<p class="small">' + act.risk + '</p><p class="small muted">내 응답: ' + act.answer + '</p>' +
              '<div class="plan-steps"><div><strong>오늘 (10분)</strong>' + act.today + '</div><div><strong>매일</strong>' + act.daily + '</div><div><strong>확인 방법</strong>' + act.check + '</div></div>' +
              '</div></div>';
    });
    html += '</div><div class="row"><a class="btn" href="#checklist">체크리스트로 실천하기</a><span class="small muted">2주 뒤 재점검해 점수 변화를 확인하세요.</span></div></div>';

    // 전체 행동 목록
    html += '<div><h2>전체 개선 행동 ' + actions.length + '가지</h2><p class="muted">위험한 순서대로 정렬했습니다. 핵심 계획이 습관이 되면 다음 항목으로 넘어가세요.</p></div>';
    actions.forEach(function (act, i) {
      html += '<div class="card guide-item ' + act.cat.level.cls + ' stack tight"><div class="cat-head"><h3><span class="rank">' + (i + 1) + '</span>' + act.title +
              (i < 3 ? ' <span class="tag">핵심</span>' : '') + '</h3><span class="pill ' + act.cat.level.cls + '">' + act.cat.name + '</span></div>' +
              '<p class="small muted">내 응답: ' + act.answer + '</p><p>' + act.risk + '</p>' +
              '<ul><li>' + act.today + '</li><li>' + act.daily + '</li></ul>' +
              '<p class="basis">근거: ' + act.q.why + '</p></div>';
    });
  }

  var pains = BODY.filter(function (b) { return answers.pain.indexOf(b.id) !== -1; });
  if (pains.length) {
    html += '<div class="card"><h3>불편 부위 스트레칭</h3><ul>' +
            pains.map(function (p) { return '<li><strong>' + p.label + '</strong>: ' + p.stretch + '</li>'; }).join('') + '</ul></div>';
  }
  $('guide-body').innerHTML = html + SOURCES;
}

/* ---------- 5. 체크리스트·기록 ---------- */
var clearArmed = false;

function renderChecklist() {
  var answers = load('answers', null);
  var history = load('history', []);
  var checks = load('checks', {});
  var html = '';

  if (!answers) {
    html += emptyState('설문을 마치면 실천 체크리스트가 만들어집니다.');
  } else {
    var actions = getActions(answers, analyze(answers));
    var done = actions.filter(function (x) { return checks[x.id]; }).length;
    var pct = actions.length ? Math.round(done / actions.length * 100) : 100;
    html += '<div class="card stack"><div class="cat-head"><h2>실천 체크리스트</h2><span class="num"><strong>' + done + '</strong> / ' + actions.length + ' 완료</span></div>' +
            '<div class="bar"><div style="width:' + pct + '%"></div></div><div>';
    actions.forEach(function (act, i) {
      var on = checks[act.id];
      html += '<label class="check' + (on ? ' done' : '') + '"><input type="checkbox" id="check-' + act.id + '" data-id="' + act.id + '"' + (on ? ' checked' : '') + '>' +
              '<span><span class="check-title"><strong>' + act.title + '</strong></span>' + (i < 3 ? ' <span class="tag">핵심</span>' : '') +
              '<br><span class="small muted">' + act.cat.name + ' · ' + act.today + '</span></span></label>';
    });
    if (!actions.length) html += '<p class="muted">실천할 항목이 없습니다.</p>';
    html += '</div><div class="row"><a class="btn" href="#survey">재점검하기</a><span class="small muted">재점검하면 분석 결과에서 이전 자세와 나란히 비교됩니다.</span></div></div>';
  }

  html += '<div class="card stack"><h2>점검 기록</h2>';
  if (!history.length) {
    html += '<p class="muted">설문을 마칠 때마다 날짜와 점수가 여기에 쌓입니다.</p>';
  } else {
    html += '<div class="history-chart" aria-label="점검 회차별 종합 점수">' + history.map(function (h, i) {
      return '<div class="col"><span class="num">' + h.overall + '</span><div class="v" style="height:' + h.overall + '%"></div><span>' + (i + 1) + '회</span></div>';
    }).join('') + '</div>';
    html += '<div class="table-wrap"><table><thead><tr><th>회차</th><th>날짜</th><th>종합 점수</th><th>이전 대비</th></tr></thead><tbody>';
    history.forEach(function (h, i) {
      var d = i === 0 ? null : h.overall - history[i - 1].overall;
      var txt = d === null ? '–' : d > 0 ? '<span class="delta-up">+' + d + '</span>' : d < 0 ? '<span class="delta-down">' + d + '</span>' : '0';
      html += '<tr class="num"><td>' + (i + 1) + '</td><td>' + formatDate(h.date) + '</td><td><strong>' + h.overall + '</strong></td><td>' + txt + '</td></tr>';
    });
    html += '</tbody></table></div>';
    html += '<div class="row"><button class="btn danger" type="button" id="btn-clear">' + (clearArmed ? '한 번 더 누르면 모든 기록이 삭제됩니다' : '기록 모두 지우기') + '</button></div>';
  }
  $('checklist-body').innerHTML = html + '</div>';
}

$('checklist-body').addEventListener('change', function (event) {
  var id = event.target.getAttribute('data-id');
  if (!id) return;
  var checks = load('checks', {});
  checks[id] = event.target.checked;
  save('checks', checks);
  renderChecklist();
});
$('checklist-body').addEventListener('click', function (event) {
  if (event.target.id !== 'btn-clear') return;
  if (clearArmed) { save('history', []); clearArmed = false; } else { clearArmed = true; }
  renderChecklist();
});

/* =========================================================
   F. 페이지 전환: 주소 끝의 #이름 에 따라 해당 section만 보여 줍니다
   ========================================================= */
var PAGES = ['home', 'survey', 'result', 'guide', 'checklist'];

function render() {
  var name = location.hash.replace('#', '');
  if (PAGES.indexOf(name) === -1) name = 'home';

  PAGES.forEach(function (p) { $('page-' + p).classList.toggle('active', p === name); });
  Array.prototype.forEach.call($('nav').querySelectorAll('a'), function (a) {
    a.classList.toggle('active', a.getAttribute('href') === '#' + name);
  });

  if (name === 'home') renderHome();
  if (name === 'survey') { draft = JSON.parse(JSON.stringify(load('answers', {}))); renderSurvey(); }
  if (name === 'result') renderResult();
  if (name === 'guide') renderGuide();
  if (name === 'checklist') { clearArmed = false; renderChecklist(); }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);
render();
