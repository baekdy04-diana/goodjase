/* =========================================================
   A. 데이터
   ========================================================= */
var STEPS = ['작업 방식과 시간', '목과 몸통', '시선과 화면', '의자와 하체', '팔과 손목', '불편한 신체 부위'];

/* ---------------------------------------------------------
   분석 영역
   - short  : 몸 그림에 붙는 짧은 이름
   - meaning: 점수가 낮을 때 보여 줄 쉬운 설명
   - parts  : 이 영역이 무리를 주는 몸 부위 (아래 BODY의 id)
   - harm   : 몸 부위가 따로 없는 영역(작업 시간)의 설명
   --------------------------------------------------------- */
var CATEGORIES = [
  { id: 'habit',   name: '작업 시간·휴식', short: '시간·휴식', parts: [],
    meaning: '같은 자세로 오래 있어 근육이 쉴 틈이 부족합니다.',
    harm: '자세가 좋아도 오래 고정되면 근육이 계속 긴장하고 혈액순환이 줄어 목·허리·다리에 피로가 쌓입니다.' },
  { id: 'posture', name: '목·몸통 자세',   short: '목·몸통',   parts: ['neck', 'back'],
    meaning: '목과 몸통이 권장 각도에서 벗어나 목·허리 근육이 계속 긴장합니다.' },
  { id: 'view',    name: '시선·화면',      short: '시선·화면', parts: ['eye'],
    meaning: '보는 대상의 높이·거리·빛 때문에 고개와 눈에 부담이 갑니다.' },
  { id: 'seat',    name: '의자·하체',      short: '의자·하체', parts: ['leg'],
    meaning: '의자가 하체와 허리를 제대로 받쳐 주지 못하고 있습니다.' },
  { id: 'arm',     name: '팔·손목',        short: '팔·손목',   parts: ['shoulder', 'wrist'],
    meaning: '팔과 손목이 지지 없이 꺾이거나 들려 있습니다.' }
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
   - why   : 이 질문을 묻는 근거 (설문에서 '왜 묻나요?'를 누르면 보임)
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
      // 보는 높이도 문제라면 '높이 올리기'는 그쪽 행동에 나오므로, 여기서는 다른 행동을 안내합니다
      today: function (a) { return a.view > 0 ? '턱을 살짝 당기고, 아래를 볼 때는 고개 대신 눈만 내려 봅니다.' : RAISE[a.device]; },
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
   몸 부위: '불편한 부위' 질문과 결과 페이지 설명 창에 씁니다
   - cats   : 이 부위가 이미 불편하면 고칠 순서를 앞당길 영역
   - harm   : 지금 자세를 유지할 때 생길 수 있는 문제
   - stretch: 개선 가이드에 보여 줄 스트레칭
   --------------------------------------------------------- */
var BODY = [
  { id: 'eye', label: '눈', cats: ['view', 'habit'],
    harm: '초점 근육이 쉬지 못하고 눈 깜빡임이 줄어 눈 피로, 건조함, 두통이 생길 수 있습니다.',
    stretch: '20분마다 6m 이상 먼 곳을 20초 동안 바라봅니다.' },
  { id: 'neck', label: '목', cats: ['posture', 'view'],
    harm: '머리 무게를 목 뒤 근육이 계속 버텨 목 통증, 거북목, 긴장성 두통으로 이어질 수 있습니다.',
    stretch: '턱을 당긴 채 고개를 좌우로 천천히 기울여 15초씩 늘립니다.' },
  { id: 'shoulder', label: '어깨', cats: ['arm', 'posture'],
    harm: '어깨 근육이 팔 무게를 계속 들고 있어 뭉치고 결리며, 팔이 저릴 수 있습니다.',
    stretch: '양손을 등 뒤에서 깍지 끼고 가슴을 펴며 15초 버팁니다.' },
  { id: 'back', label: '허리', cats: ['posture', 'seat'],
    harm: '허리 곡선이 무너져 디스크에 압력이 몰리고 허리 통증이 만성화될 수 있습니다.',
    stretch: '일어서서 양손을 허리에 대고 상체를 살짝 뒤로 젖혀 5초, 5회 반복합니다.' },
  { id: 'wrist', label: '손목', cats: ['arm'],
    harm: '손목 안 신경 통로가 눌려 손 저림이나 손목터널증후군, 힘줄 염증 위험이 커집니다.',
    stretch: '팔을 앞으로 뻗고 반대 손으로 손등을 몸 쪽으로 당겨 15초 버팁니다.' },
  { id: 'leg', label: '다리', cats: ['seat', 'habit'],
    harm: '허벅지 아래와 무릎 뒤가 눌려 혈액순환이 줄고 다리가 붓거나 저릴 수 있습니다.',
    stretch: '앉은 채 한쪽 다리를 펴고 발끝을 몸 쪽으로 당겨 15초 버팁니다.' }
];

/* ---------------------------------------------------------
   점수 단계 4가지 (점수가 높을수록 좋음)
   RULA가 결과를 4단계 조치 수준(수용 가능 · 추가 조사 · 곧 개선 · 즉시 개선)으로
   나누는 방식을 본떴습니다. 구간 경계 85·65·40점은 ErgoFit이 정한 값이라 여기서 바꿀 수 있습니다.
   cls 는 CSS의 색 이름(blue / green / yellow / red)과 같습니다.
   --------------------------------------------------------- */
var LEVELS = [
  { min: 85, cls: 'blue',   text: '좋음',      advice: '지금 자세를 유지하세요.' },
  { min: 65, cls: 'green',  text: '양호',      advice: '작은 부분만 손보면 됩니다.' },
  { min: 40, cls: 'yellow', text: '주의',      advice: '가까운 시일 안에 고치는 것이 좋습니다.' },
  { min: 0,  cls: 'red',    text: '개선 필요', advice: '바로 고쳐야 합니다.' }
];

/* 예시 응답: '예시 결과 보기'에서 사용 (SAMPLE_PREV는 2주 전 기록 예시) */
var SAMPLE      = { device: 1, hours: 1, cont: 0, neck: 2, trunk: 1, twist: 0, view: 3, dist: 2, glare: 1, feet: 0, depth: 0, lumbar: 0, elbow: 1, wrist: 2, pain: ['neck', 'eye'] };
var SAMPLE_PREV = { device: 1, hours: 2, cont: 3, neck: 3, trunk: 3, twist: 1, view: 3, dist: 2, glare: 2, feet: 2, depth: 0, lumbar: 1, elbow: 1, wrist: 2, pain: ['neck', 'eye', 'back'] };

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
function scoreOf(q, answers) { return q.options[answers[q.id]].score; }
function maxOf(q) { return Math.max.apply(null, q.options.map(function (o) { return o.score; })); }

/* 점수(0~100)가 어느 단계인지 찾습니다 */
function levelOf(score) {
  for (var i = 0; i < LEVELS.length; i++) {
    if (score >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[LEVELS.length - 1];
}
/* 단계 색의 글자용 색 (노랑만 진한 글자색을 씁니다) */
function inkOf(cls) { return cls === 'yellow' ? 'var(--yellow-ink)' : 'var(--' + cls + ')'; }

/* 받침에 맞는 조사 붙이기: josa('어깨', '과', '와') → '어깨와', josa('목', '과', '와') → '목과' */
function josa(word, withFinal, withoutFinal) {
  var code = word.charCodeAt(word.length - 1) - 0xAC00;          // 한글 글자 번호
  var hasFinal = code >= 0 && code <= 11171 && code % 28 !== 0;  // 받침이 있으면 true
  return word + (hasFinal ? withFinal : withoutFinal);
}

/* 영역별 점수와 고칠 순서 계산
   - risk    : 위험도 (높을수록 나쁨, 계산용)
   - score   : 화면에 보여 주는 점수 = 100 - 위험도 (높을수록 좋음)
   - priority: 고칠 순서. 이미 불편한 부위와 관련 있으면 10점씩 올립니다 */
function analyze(answers) {
  var cats = CATEGORIES.map(function (cat) {
    var sum = 0, max = 0;
    QUESTIONS.forEach(function (q) {
      if (q.cat !== cat.id) return;
      sum += scoreOf(q, answers); max += maxOf(q);
    });
    var risk = Math.round(sum / max * 100);
    var related = BODY.filter(function (b) { return answers.pain.indexOf(b.id) !== -1 && b.cats.indexOf(cat.id) !== -1; });
    return { id: cat.id, name: cat.name, short: cat.short, meaning: cat.meaning, parts: cat.parts, harm: cat.harm,
             risk: risk, score: 100 - risk, level: levelOf(100 - risk),
             priority: Math.min(100, risk + related.length * 10), pains: related };
  });
  var avgRisk = cats.reduce(function (t, c) { return t + c.risk; }, 0) / cats.length;
  var overall = Math.round(100 - avgRisk);
  var levels = {};
  cats.forEach(function (c) { levels[c.id] = c.level.cls; });
  return { overall: overall, level: levelOf(overall), cats: cats, levels: levels,
           sorted: cats.slice().sort(function (a, b) { return b.priority - a.priority; }) };
}

/* 개선 행동 목록. 위험한 것부터 정렬하고, 앞의 3개가 '먼저 고칠 3가지'가 됩니다.
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
      title: q.tip.title, risk: q.tip.risk, today: today, daily: q.tip.daily, check: q.tip.check });
  });
  return actions.sort(function (a, b) { return b.weight - a.weight; });
}

/* =========================================================
   D. 그림
   ========================================================= */

/* 그림 1: 앉은 자세 (옆모습 막대 사람)
   a   : 응답 중 neck / trunk / view / feet 값(0~3)에 따라 자세가 바뀝니다
   opt : levels(영역별 색 이름), badges(번호 표시), focus(강조할 부분) */
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
    var textColor = lv[cat] === 'yellow' ? '#3B2F00' : '#fff';
    return '<circle cx="' + r(x) + '" cy="' + r(y) + '" r="12" fill="' + col(cat) + '" stroke="#fff" stroke-width="2"/>' +
           '<text x="' + r(x) + '" y="' + r(y + 4.5) + '" text-anchor="middle" font-size="13" font-weight="700" fill="' + textColor + '">' + n + '</text>';
  }

  var svg = '<svg viewBox="0 0 420 290" role="img" aria-label="책상에 앉은 사람의 옆모습">' +
    '<line x1="20" y1="268" x2="400" y2="268" stroke="var(--line)" stroke-width="3"/>' +
    '<g stroke="var(--ink-soft)" stroke-width="7" stroke-linecap="round" fill="none">' +
      '<line x1="99" y1="100" x2="96" y2="188"/><line x1="96" y1="193" x2="172" y2="193"/>' +
      '<line x1="132" y1="197" x2="132" y2="258"/><line x1="104" y1="262" x2="160" y2="262"/></g>' +
    '<rect x="205" y="160" width="185" height="9" rx="3" fill="var(--accent-dark)"/>' +
    '<rect x="374" y="169" width="8" height="97" fill="var(--accent-dark)"/>' +
    '<rect x="224" y="153" width="44" height="6" rx="2" fill="var(--ink-soft)"/>' +
    screen +
    '<line x1="' + r(nose.x) + '" y1="' + r(nose.y) + '" x2="' + target[0] + '" y2="' + target[1] + '" stroke="var(--ink-soft)" stroke-width="1.5" stroke-dasharray="5 5"/>' +
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
    (i === 3 ? '<rect x="38" y="41" width="30" height="13" fill="var(--accent-dark)"/><circle cx="60" cy="38" r="6" fill="var(--red)" opacity="0.5"/>' : '') +
    '<line x1="8" y1="34" x2="62" y2="34" stroke="var(--ink)" stroke-width="10" stroke-linecap="round"/>' +
    '<line x1="62" y1="34" x2="' + hx.toFixed(1) + '" y2="' + hy.toFixed(1) + '" stroke="var(--accent)" stroke-width="9" stroke-linecap="round"/>' +
    '</svg>';
}

/* 그림 3: 종합 점수 게이지 (빈 원 + 채워지는 원 + 가운데 숫자) */
var GAUGE_LENGTH = 2 * Math.PI * 52;   // 게이지 원의 둘레 (반지름 52)
function drawGauge(score, level) {
  var len = GAUGE_LENGTH.toFixed(1);
  return '<div class="gauge" data-gauge="' + score + '" role="img" aria-label="종합 점수 ' + score + '점, ' + level.text + '">' +
    '<svg viewBox="0 0 120 120" aria-hidden="true">' +
      '<circle cx="60" cy="60" r="52" fill="none" stroke="var(--track)" stroke-width="11"/>' +
      '<circle class="gauge-arc" cx="60" cy="60" r="52" fill="none" stroke="var(--red)" stroke-width="11" stroke-linecap="round"' +
      ' stroke-dasharray="' + len + '" stroke-dashoffset="' + len + '" transform="rotate(-90 60 60)"/></svg>' +
    '<div class="gauge-center" aria-hidden="true"><span class="gauge-num">0</span><span class="gauge-max">/ 100점</span></div></div>';
}

/* ---------------------------------------------------------
   그림 4: 결과 페이지의 몸 그림 (영역별 점수와 몸 부위를 한 그림에)
   영역마다 점수 단계 색으로 칠하고, 누르면 아래에서 설명 창이 올라옵니다.
   - glows : 색을 칠할 타원 [중심x, 중심y, 가로반지름, 세로반지름]
   - hits  : 누를 수 있는 투명한 사각형 [x, y, 너비, 높이] (손가락으로 누르기 쉽게 넉넉하게)
   - label : 이름표. side 'right'는 오른쪽, 'left'는 왼쪽 / y 높이 / from 선이 시작하는 x
   --------------------------------------------------------- */
var ZONES = {
  view:    { glows: [[170, 36, 24, 15]], hits: [[138, 4, 64, 60]], label: { side: 'right', y: 36, from: 196 } },
  posture: { glows: [[170, 69, 15, 13], [170, 160, 30, 54]], hits: [[140, 64, 60, 168]], label: { side: 'right', y: 150, from: 205 } },
  seat:    { glows: [[152, 292, 18, 58], [188, 292, 18, 58]], hits: [[128, 232, 84, 168]], label: { side: 'right', y: 300, from: 208 } },
  arm:     { glows: [[139, 92, 16, 12], [201, 92, 16, 12], [104, 236, 13, 16], [236, 236, 13, 16]],
             hits: [[86, 76, 54, 190], [200, 76, 54, 190]], label: { side: 'left', y: 236, from: 88 } },
  habit:   { clock: [50, 52] }
};
/* 불편하다고 답한 부위에 찍는 '!' 표시 위치 */
var PAIN_MARKS = { eye: [192, 18], neck: [188, 62], shoulder: [214, 82], back: [192, 200], wrist: [250, 222], leg: [207, 262] };
/* 단계별로 색을 얼마나 진하게 칠할지 */
var GLOW = { red: 1, yellow: 0.95, green: 0.6, blue: 0.5 };

function drawZones(a, answers) {
  var defs = LEVELS.map(function (lv) {
    var c = 'var(--' + lv.cls + ')';
    return '<radialGradient id="glow-' + lv.cls + '"><stop offset="0" stop-color="' + c + '" stop-opacity="0.95"/>' +
      '<stop offset="0.6" stop-color="' + c + '" stop-opacity="0.55"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>';
  }).join('');

  /* 사람 모양: 다리 → 팔 → 발·손 → 몸통 → 목 → 머리 순서로 겹쳐 그립니다 */
  var svg = '<svg viewBox="0 0 340 420" aria-label="영역별 점수를 색으로 표시한 몸 그림">' + '<defs>' + defs + '</defs>' +
    '<g fill="none" stroke="var(--skin)" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline stroke-width="34" points="153,212 151,290"/><polyline stroke-width="26" points="151,290 151,385"/>' +
      '<polyline stroke-width="34" points="187,212 189,290"/><polyline stroke-width="26" points="189,290 189,385"/>' +
      '<polyline stroke-width="21" points="130,94 115,165"/><polyline stroke-width="17" points="115,165 104,232"/>' +
      '<polyline stroke-width="21" points="210,94 225,165"/><polyline stroke-width="17" points="225,165 236,232"/></g>' +
    '<g fill="var(--skin)">' +
      '<ellipse cx="148" cy="402" rx="15" ry="9"/><ellipse cx="192" cy="402" rx="15" ry="9"/>' +
      '<ellipse cx="102" cy="249" rx="9" ry="14"/><ellipse cx="238" cy="249" rx="9" ry="14"/>' +
      '<path d="M128,82 Q170,70 212,82 Q222,86 218,100 L204,150 Q201,178 207,214 Q170,226 133,214 Q139,178 136,150 L122,100 Q118,86 128,82 Z"/>' +
      '<rect x="161" y="56" width="18" height="24" rx="6"/>' +
      '<ellipse cx="170" cy="38" rx="20" ry="25"/></g>';

  /* 점수 글자: 큰 숫자 + 작은 '점' */
  function scoreText(x, y, anchor, c) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '" fill="' + inkOf(c.level.cls) + '" font-weight="700">' +
      '<tspan font-size="20">' + c.score + '</tspan><tspan font-size="14" dx="2">점</tspan></text>';
  }

  var first = a.sorted[0];
  a.cats.forEach(function (c) {
    var z = ZONES[c.id], cls = c.level.cls;
    var hint = c.id === first.id && cls !== 'blue' ? ' hint' : '';
    svg += '<g class="zone' + hint + '" data-zone="' + c.id + '" role="button" tabindex="0" aria-label="' + c.name + ' ' + c.score + '점, ' + c.level.text + '. 자세히 보기">';

    if (c.id === 'habit') {   // 작업 시간은 몸 부위가 아니라서 시계로 표시합니다
      var x = z.clock[0], y = z.clock[1];
      svg += '<circle class="zone-ring" cx="' + x + '" cy="' + y + '" r="34" fill="transparent"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="24" fill="var(--surface)" stroke="var(--' + cls + ')" stroke-width="6"/>' +
        '<polyline points="' + x + ',' + (y - 13) + ' ' + x + ',' + y + ' ' + (x + 9) + ',' + (y + 6) + '" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>' +
        '<text x="' + x + '" y="' + (y + 50) + '" text-anchor="middle" font-size="15" fill="var(--ink-soft)">' + c.short + '</text>' +
        scoreText(x, y + 72, 'middle', c);
    } else {
      z.hits.forEach(function (h) {
        svg += '<rect class="zone-ring" x="' + h[0] + '" y="' + h[1] + '" width="' + h[2] + '" height="' + h[3] + '" rx="16" fill="transparent"/>';
      });
      z.glows.forEach(function (g) {
        svg += '<ellipse cx="' + g[0] + '" cy="' + g[1] + '" rx="' + (g[2] + 6) + '" ry="' + (g[3] + 6) + '" fill="url(#glow-' + cls + ')" opacity="' + GLOW[cls] + '"/>';
      });
      var L = z.label;
      if (L.side === 'right') {
        svg += '<line x1="' + L.from + '" y1="' + L.y + '" x2="250" y2="' + L.y + '" stroke="var(--ink-soft)" stroke-width="1.2"/>' +
          '<circle cx="' + L.from + '" cy="' + L.y + '" r="3" fill="var(--ink-soft)"/>' +
          '<text x="256" y="' + (L.y - 4) + '" font-size="15" fill="var(--ink-soft)">' + c.short + '</text>' +
          scoreText(256, L.y + 18, 'start', c);
      } else {
        svg += '<line x1="76" y1="' + L.y + '" x2="' + L.from + '" y2="' + L.y + '" stroke="var(--ink-soft)" stroke-width="1.2"/>' +
          '<circle cx="' + L.from + '" cy="' + L.y + '" r="3" fill="var(--ink-soft)"/>' +
          '<text x="72" y="' + (L.y - 4) + '" text-anchor="end" font-size="15" fill="var(--ink-soft)">' + c.short + '</text>' +
          scoreText(72, L.y + 18, 'end', c);
      }
    }
    // 불편하다고 답한 부위에 '!' 표시
    c.parts.forEach(function (pid) {
      if (answers.pain.indexOf(pid) === -1) return;
      var m = PAIN_MARKS[pid];
      svg += '<circle cx="' + m[0] + '" cy="' + m[1] + '" r="9" fill="var(--ink)" stroke="#fff" stroke-width="2"/>' +
        '<text x="' + m[0] + '" y="' + (m[1] + 4) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">!</text>';
    });
    svg += '</g>';
  });
  return svg + '</svg>';
}

/* =========================================================
   E. 움직임
   - 막대  : HTML에 data-fill="목표값"을 적어 두면 0에서 그 값까지 늘어납니다
             (세로 막대는 data-dir="up"을 함께 적습니다)
   - 숫자  : data-count="목표값"을 적어 두면 0부터 그 값까지 올라갑니다
   - 게이지: data-gauge="종합 점수"
   컴퓨터에서 '애니메이션 효과'를 끈 사용자에게는 움직임 없이 바로 보여 줍니다.
   ========================================================= */
var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 0에서 target까지 duration(밀리초) 동안 값을 올리면서, 화면이 바뀔 때마다 onStep(현재값)을 부릅니다 */
function countUp(target, duration, onStep, onDone) {
  if (reduceMotion) { onStep(target); if (onDone) onDone(); return; }
  var start = null;
  function frame(now) {
    if (start === null) start = now;
    var t = Math.min((now - start) / duration, 1);   // 진행률 0 → 1
    var eased = 1 - Math.pow(1 - t, 3);              // 처음엔 빠르게, 끝에서 천천히
    onStep(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(frame);
    else if (onDone) onDone();
  }
  requestAnimationFrame(frame);
}

/* 종합 점수 게이지: 숫자가 올라가는 동안 색이 빨강 → 노랑 → 초록 → 파랑 순서로 바뀝니다 */
function playGauge(gauge) {
  var target = Number(gauge.getAttribute('data-gauge'));
  var arc = gauge.querySelector('.gauge-arc');
  var num = gauge.querySelector('.gauge-num');
  countUp(target, 1600, function (value) {
    var lv = levelOf(value);
    num.textContent = value;
    num.style.color = inkOf(lv.cls);
    arc.style.stroke = 'var(--' + lv.cls + ')';
    arc.style.strokeDashoffset = (GAUGE_LENGTH * (1 - value / 100)) + 'px';
  }, function () { gauge.classList.add('landed'); });
}

/* root 안의 막대·숫자·게이지를 한꺼번에 움직입니다 (화면을 그린 직후에 부릅니다) */
function playAnimations(root) {
  var fills = root.querySelectorAll('[data-fill]');
  void root.offsetHeight;   // 막대가 0인 상태를 먼저 그리게 합니다. 이 줄이 없으면 움직이지 않고 바로 나타납니다
  Array.prototype.forEach.call(fills, function (el, i) {
    var size = el.getAttribute('data-fill') + '%';
    el.style.transitionDelay = (i % 8) * 0.08 + 's';   // 하나씩 차례로 출발
    if (el.getAttribute('data-dir') === 'up') el.style.height = size;
    else el.style.width = size;
  });
  Array.prototype.forEach.call(root.querySelectorAll('[data-count]'), function (el) {
    countUp(Number(el.getAttribute('data-count')), 1200, function (value) { el.textContent = value; });
  });
  Array.prototype.forEach.call(root.querySelectorAll('[data-gauge]'), playGauge);
}

/* =========================================================
   F. 공통 화면 조각
   ========================================================= */
function $(id) { return document.getElementById(id); }
function formatDate(iso) { var d = new Date(iso); return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate(); }
function shortDate(iso) { var d = new Date(iso); return (d.getMonth() + 1) + '.' + d.getDate(); }

function pageHead(title, sub) {
  return '<div class="page-head stack tight"><h1 class="page-title">' + title + '</h1>' + (sub ? '<p class="muted">' + sub + '</p>' : '') + '</div>';
}
function emptyState(message) {
  return '<div class="card stack"><div class="stack tight"><h2>아직 점검 결과가 없습니다</h2><p class="muted">' + message + '</p></div>' +
    '<a class="btn block" href="#survey">점검 시작하기</a>' +
    '<button class="btn ghost block" type="button" onclick="useSample()">예시 결과 보기</button></div>';
}
/* 단계 범례: ● 85~100 좋음  ● 65~84 양호  ● 40~64 주의  ● 0~39 개선 필요 */
function levelLegend() {
  return LEVELS.map(function (lv, i) {
    var top = i === 0 ? 100 : LEVELS[i - 1].min - 1;
    return '<span><i class="dot-lv ' + lv.cls + '"></i>' + lv.min + '~' + top + ' ' + lv.text + '</span>';
  }).join('');
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

/* =========================================================
   G. 페이지별 화면
   ========================================================= */

/* ---------- 1. 홈 ---------- */
function renderHome() {
  var brand = { habit: 'accent', posture: 'accent', view: 'accent', seat: 'accent', arm: 'accent' };
  $('home-figure').innerHTML = drawPose({}, { levels: brand, badges: true }) +
    '<p class="caption">점검하는 다섯 곳: ① 시간·휴식 ② 목·몸통 ③ 시선·화면 ④ 의자·하체 ⑤ 팔·손목</p>';
  var history = load('history', []);
  var last = history[history.length - 1];
  if (!last) { $('home-last').innerHTML = ''; return; }
  var lv = levelOf(last.overall);
  $('home-last').innerHTML = '<div class="card between"><div class="stack tight"><p class="caption">지난 점검 · ' + formatDate(last.date) + '</p>' +
    '<p class="return-score"><b class="txt ' + lv.cls + '">' + last.overall + '</b>점 <span class="pill ' + lv.cls + '">' + lv.text + '</span></p></div>' +
    '<a class="btn ghost" href="#result">결과 보기</a></div>';
}

/* ---------- 2. 설문 ---------- */
var currentStep = 0;   // 지금 보고 있는 단계 (0부터 셈)
var draft = {};        // 설문 중에 고른 답 (설문을 마치면 저장하고 비웁니다)

/* 설문을 처음 상태로: 고른 답을 지우고 1단계로 돌아갑니다.
   설문을 마쳤을 때와 홈으로 돌아왔을 때 부릅니다. 저장된 결과와 점검 기록은 지우지 않습니다. */
function resetSurvey() {
  draft = {};
  currentStep = 0;
}

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
  $('survey-count').textContent = (currentStep + 1) + ' / ' + STEPS.length;
  $('survey-progress').style.width = ((currentStep + 1) / STEPS.length * 100) + '%';
  $('survey-error').textContent = '';
  $('btn-prev').hidden = currentStep === 0;
  $('btn-next').textContent = currentStep === STEPS.length - 1 ? '결과 보기' : '다음';

  var html = '';
  if (currentStep < STEPS.length - 1) {
    QUESTIONS.filter(function (q) { return q.step === currentStep; }).forEach(function (q) {
      html += '<fieldset class="card question"><legend>' + q.text + '</legend>' +
              '<details class="why"><summary>왜 묻나요?</summary><p>' + q.why + '</p></details>' +
              '<div class="options' + (q.pic ? ' pics' : '') + '">';
      q.options.forEach(function (o, i) {
        var checked = draft[q.id] === i ? ' checked' : '';
        html += '<label class="option"><input type="radio" id="' + q.id + '-' + i + '" name="' + q.id + '" value="' + i + '"' + checked + '>' +
                '<span>' + optionPicture(q, i) + o.label + '</span></label>';
      });
      html += '</div></fieldset>';
    });
  } else {
    html += '<fieldset class="card question"><legend>최근 한 달 동안 불편했던 부위를 모두 고르세요. 없으면 그대로 넘어가세요.</legend>' +
            '<details class="why"><summary>왜 묻나요?</summary><p>이미 불편한 부위와 관련된 영역을 먼저 고치도록 순서를 앞당깁니다.</p></details>' +
            '<div class="options pics">';
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

/* 고를 때마다 바로 draft에 기록합니다 (설문 도중 다른 페이지에 다녀와도 선택이 남도록) */
$('survey-form').addEventListener('change', function () {
  if (collectStep()) $('survey-error').textContent = '';
});

$('btn-next').addEventListener('click', function () {
  if (!collectStep()) {
    $('survey-error').textContent = '답하지 않은 질문이 있습니다.';
    // 답하지 않은 첫 질문으로 화면을 옮겨 줍니다
    var missing = Array.prototype.filter.call($('survey-form').querySelectorAll('fieldset'), function (f) {
      return !f.querySelector('input:checked');
    })[0];
    if (missing) missing.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    return;
  }
  if (currentStep < STEPS.length - 1) { currentStep++; renderSurvey(); window.scrollTo(0, 0); return; }
  // 마지막 단계: 응답 저장 + 점검 기록 추가 + 결과 페이지로 이동
  save('answers', draft);
  var history = load('history', []);
  history.push(makeRecord(draft, new Date()));
  save('history', history);
  resetSurvey();               // 다음 설문은 빈 상태로 시작합니다
  location.hash = 'result';
});
$('btn-prev').addEventListener('click', function () {
  collectStep();
  if (currentStep > 0) { currentStep--; renderSurvey(); window.scrollTo(0, 0); }
});

/* ---------- 3. 결과: 종합 점수 + 몸 그림 + 먼저 고칠 3가지 ---------- */
function renderResult() {
  var answers = load('answers', null);
  if (!answers) {
    $('result-body').innerHTML = pageHead('결과') + emptyState('설문을 마치면 점수와 몸 어디에 무리가 가는지 여기에 나옵니다.');
    return;
  }
  var a = analyze(answers);
  var actions = getActions(answers, a);
  var history = load('history', []);

  // (1) 종합 점수
  var allGood = a.cats.every(function (c) { return c.level.cls === 'blue'; });
  var title = allGood ? '모든 영역이 권장 기준에 가깝습니다.' : '가장 먼저 고칠 부분은 <strong>' + a.sorted[0].name + '</strong>입니다.';
  var delta = '';
  if (history.length >= 2) {
    var d = history[history.length - 1].overall - history[history.length - 2].overall;
    delta = d > 0 ? '<p class="delta">지난 점검보다 ' + d + '점 올랐습니다</p>'
          : d < 0 ? '<p class="delta down">지난 점검보다 ' + (-d) + '점 내려갔습니다</p>'
          : '<p class="delta down">지난 점검과 점수가 같습니다</p>';
  }
  var scoreCard = '<div class="card score-card"><p class="caption">종합 점수</p>' + drawGauge(a.overall, a.level) +
    '<span class="pill ' + a.level.cls + '">' + a.level.text + '</span>' +
    '<h2>' + title + '</h2><p class="muted">' + a.level.advice + '</p>' + delta + '</div>';

  // (2) 몸 그림: 영역을 누르면 설명 창
  var bodyCard = '<div class="card stack"><div class="stack tight"><h2>몸 어디에 무리가 가나요?</h2>' +
    '<p class="muted">색이 칠해진 부분이나 이름을 누르면 영역별 점수와 무리가 가는 이유가 나옵니다.</p></div>' +
    '<div class="figure body-figure">' + drawZones(a, answers) + '</div>' +
    '<div class="legend">' + levelLegend() + (answers.pain.length ? '<span><i class="pain-dot">!</i>불편하다고 답한 부위</span>' : '') + '</div></div>';

  // (3) 먼저 고칠 3가지: 이름만 보여 주고 개선 가이드로 이어 줍니다
  var nextCard;
  if (!actions.length) {
    nextCard = '<div class="card stack tight"><h2>고칠 항목이 없습니다</h2><p class="muted">모든 응답이 권장 기준에 맞습니다. 2주 뒤 다시 점검해 유지되는지 확인하세요.</p></div>';
  } else {
    var top = actions.slice(0, 3);
    nextCard = '<div class="card stack"><div class="stack tight"><h2>먼저 고칠 ' + top.length + '가지</h2><p class="muted">하는 방법은 개선 가이드에 있습니다.</p></div>' +
      '<ol class="next-list">' + top.map(function (act, i) { return '<li><span class="rank">' + (i + 1) + '</span><span>' + act.title + '</span></li>'; }).join('') + '</ol>' +
      '<a class="btn block" href="#guide">개선 가이드 보기</a></div>';
  }

  $('result-body').innerHTML = pageHead('결과') + scoreCard + bodyCard + nextCard +
    '<a class="btn ghost block" href="#survey">다시 점검하기</a>';
  playAnimations($('result-body'));
}

/* 몸 그림을 누르면: 영역 점수 + 무리가 가는 이유 + 원인이 된 응답 + 바로 할 일 + 개선 가이드로 가는 버튼 */
function zoneSheet(catId) {
  var answers = load('answers', null);
  if (!answers) return '';
  var a = analyze(answers), actions = getActions(answers, a);
  var c = a.cats.filter(function (x) { return x.id === catId; })[0];
  var cls = c.level.cls, good = cls === 'blue';
  var parts = BODY.filter(function (b) { return c.parts.indexOf(b.id) !== -1; });
  var reported = parts.filter(function (b) { return answers.pain.indexOf(b.id) !== -1; });
  var causes = QUESTIONS.filter(function (q) { return q.cat === catId && scoreOf(q, answers) > 0; });
  var mine = actions.filter(function (x) { return x.cat.id === catId; });

  var html = '<div class="stack tight"><p class="caption">영역별 점수</p>' +
    '<div class="between"><h2 id="sheet-title">' + c.name + '</h2><span class="pill ' + cls + '">' + c.level.text + '</span></div>' +
    '<p class="sheet-score"><b class="txt ' + cls + '" data-count="' + c.score + '">0</b><span class="muted">/ 100점</span></p></div>' +
    '<div class="bar"><div class="' + cls + '" data-fill="' + Math.max(c.score, 2) + '"></div></div>' +
    '<p>' + (good ? '권장 기준에 가깝습니다. 지금 상태를 유지하세요.' : c.meaning) + '</p>';

  if (reported.length) {
    var names = reported.map(function (b) { return b.label; }).join('·');
    html += '<p class="caption">불편하다고 답한 ' + josa(names, '과', '와') + ' 관련이 있어 고칠 순서를 앞당겼습니다.</p>';
  }
  if (!good) {
    html += '<div class="stack tight"><h3>몸에 무리가 가는 이유</h3><ul class="reasons">' +
      (parts.length ? parts.map(function (b) {
        return '<li><strong>' + b.label + '</strong> ' + b.harm + (answers.pain.indexOf(b.id) !== -1 ? ' <span class="tag">불편하다고 답함</span>' : '') + '</li>';
      }).join('') : '<li>' + c.harm + '</li>') + '</ul></div>';
    html += '<div class="stack tight"><h3>원인이 된 응답</h3><ul class="causes">' +
      causes.map(function (q) { return '<li><span class="muted">' + q.short + '</span><span>' + q.options[answers[q.id]].label + '</span></li>'; }).join('') + '</ul></div>';
  }
  if (mine.length) {
    html += '<div class="today stack tight"><p class="caption">바로 할 수 있는 일</p><h3>' + mine[0].title + '</h3><p>' + mine[0].today + '</p></div>' +
      '<button class="btn block" type="button" data-guide="' + catId + '">이 영역 개선 방법 ' + mine.length + '가지 보기</button>';
  } else {
    html += '<button class="btn ghost block" type="button" data-guide="all">개선 가이드 보기</button>';
  }
  return html;
}

/* ---------- 설명 창 열고 닫기 ---------- */
var sheetTimer = null, sheetReturnFocus = null;
function openSheet(html) {
  var sheet = $('sheet'), back = $('sheet-backdrop');
  clearTimeout(sheetTimer);
  $('sheet-body').innerHTML = html;
  sheetReturnFocus = document.activeElement;
  sheet.hidden = false; back.hidden = false;
  void sheet.offsetHeight;                 // 닫힌 위치를 먼저 그린 뒤 올라오게 합니다
  sheet.classList.add('open'); back.classList.add('open');
  document.body.style.overflow = 'hidden'; // 뒤 화면이 같이 스크롤되지 않게
  sheet.scrollTop = 0;
  sheet.focus();
  playAnimations($('sheet-body'));
}
function closeSheet(instant) {
  var sheet = $('sheet'), back = $('sheet-backdrop');
  if (sheet.hidden) return;
  sheet.classList.remove('open'); back.classList.remove('open');
  document.body.style.overflow = '';
  function hide() { sheet.hidden = true; back.hidden = true; }
  if (instant || reduceMotion) hide(); else sheetTimer = setTimeout(hide, 350);
  if (!instant && sheetReturnFocus) sheetReturnFocus.focus();
}
$('sheet-close').addEventListener('click', function () { closeSheet(); });
$('sheet-backdrop').addEventListener('click', function () { closeSheet(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });

/* 몸 그림의 영역을 누르거나, 키보드로 고르고 Enter·Space를 누르면 설명 창을 엽니다 */
$('result-body').addEventListener('click', function (e) {
  var zone = e.target.closest('[data-zone]');
  if (zone) openSheet(zoneSheet(zone.getAttribute('data-zone')));
});
$('result-body').addEventListener('keydown', function (e) {
  var zone = e.target.closest('[data-zone]');
  if (zone && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openSheet(zoneSheet(zone.getAttribute('data-zone'))); }
});
/* 설명 창의 '개선 방법 보기' → 개선 가이드에서 그 영역만 골라 보여 줍니다 */
$('sheet-body').addEventListener('click', function (e) {
  var btn = e.target.closest('[data-guide]');
  if (!btn) return;
  guideFilter = btn.getAttribute('data-guide');
  guideJump = guideFilter !== 'all';
  location.hash = 'guide';
});

/* ---------- 4. 개선 가이드: 먼저 고칠 3가지 + 영역별 개선 방법 ---------- */
var guideFilter = 'all';   // 지금 고른 영역 ('all'은 전체)
var guideJump = false;     // 설명 창에서 넘어왔으면 '영역별 개선 방법'으로 바로 이동

/* 개선 행동 카드 하나 */
function actionCard(act) {
  return '<div class="card stack tight"><h3>' + act.title + '</h3>' +
    '<p class="caption">' + act.cat.name + ' · 내 응답: ' + act.answer + '</p>' +
    '<div class="today"><p class="caption">오늘 할 일</p><p>' + act.today + '</p></div>' +
    '<details class="more"><summary>왜 고쳐야 하나요?</summary><div class="stack tight"><p>' + act.risk + '</p>' +
    '<p><strong>매일</strong> ' + act.daily + '</p><p><strong>확인 방법</strong> ' + act.check + '</p>' +
    '<p class="basis">근거: ' + act.q.why + '</p></div></details></div>';
}

function renderGuide() {
  var head = pageHead('개선 가이드', '위험한 것부터 정리했습니다. 위에서부터 하나씩 해 보세요.');
  var answers = load('answers', null);
  if (!answers) { $('guide-body').innerHTML = head + emptyState('설문을 마치면 나에게 맞는 개선 방법이 여기에 나옵니다.'); return; }
  var a = analyze(answers), actions = getActions(answers, a);

  // (1) 먼저 고칠 3가지
  var plan;
  if (!actions.length) {
    plan = '<div class="card soft stack tight"><h2>고칠 항목이 없습니다</h2><p>모든 응답이 권장 기준에 맞습니다. 2주 뒤 다시 점검해 유지되는지 확인하세요.</p></div>';
  } else {
    var top = actions.slice(0, 3);
    plan = '<div class="stack tight"><h2>먼저 고칠 ' + top.length + '가지</h2><p class="muted">위험 점수가 가장 높고 이미 불편한 부위와 관련된 행동입니다. 2주 동안 이것부터 지켜 보세요.</p></div>' +
      top.map(function (act, i) {
        return '<div class="card stack tight"><div class="plan-top"><span class="plan-no">' + (i + 1) + '</span>' +
          '<div class="stack tight"><h3>' + act.title + '</h3><p class="caption">' + act.cat.name + ' · 내 응답: ' + act.answer + '</p></div></div>' +
          '<p>' + act.risk + '</p>' +
          '<div class="today"><p class="caption">오늘 할 일</p><p>' + act.today + '</p></div>' +
          '<details class="more"><summary>매일 할 일과 확인 방법</summary><div class="stack tight">' +
          '<p><strong>매일</strong> ' + act.daily + '</p><p><strong>확인 방법</strong> ' + act.check + '</p>' +
          '<p class="basis">근거: ' + act.q.why + '</p></div></details></div>';
      }).join('');
  }

  // (2) 영역별 개선 방법: 영역 버튼(칩)으로 고르기
  var chips = [{ id: 'all', name: '전체', n: actions.length }].concat(a.sorted.map(function (c) {
    return { id: c.id, name: c.name, n: actions.filter(function (x) { return x.cat.id === c.id; }).length };
  }));
  var list = '<section class="stack" id="guide-list"><div class="stack tight"><h2>영역별 개선 방법</h2><p class="muted">영역을 고르면 그 영역의 행동만 보입니다.</p></div>' +
    '<div class="chips" role="group" aria-label="영역 고르기">' + chips.map(function (ch) {
      return '<button type="button" class="chip" data-filter="' + ch.id + '" aria-pressed="' + (ch.id === guideFilter) + '">' + ch.name + '<span class="num"> ' + ch.n + '</span></button>';
    }).join('') + '</div><div class="stack" id="guide-list-body"></div></section>';

  // (3) 불편 부위 스트레칭 + 근거 (근거는 눌러야 펼쳐짐)
  var pains = BODY.filter(function (b) { return answers.pain.indexOf(b.id) !== -1; });
  var stretch = pains.length ? '<div class="card stack tight"><h2>불편 부위 스트레칭</h2><ul>' +
    pains.map(function (p) { return '<li><strong>' + p.label + '</strong> ' + p.stretch + '</li>'; }).join('') + '</ul></div>' : '';
  var sources = '<details class="card more"><summary>점검 기준의 근거</summary><div class="stack tight">' +
    '<p>질문과 점수는 아래 두 평가 도구의 항목과 기준 각도를 참고해 일반 사용자가 스스로 답할 수 있게 줄인 것입니다. 공식 평가 점수와 같지 않습니다.</p>' +
    '<ul class="caption"><li><strong>RULA</strong> (Rapid Upper Limb Assessment): 목, 몸통, 팔, 손목의 각도로 상체 부담을 평가합니다. McAtamney &amp; Corlett, Applied Ergonomics, 1993.</li>' +
    '<li><strong>ROSA</strong> (Rapid Office Strain Assessment): 의자, 모니터, 키보드, 사용 시간으로 사무 작업환경을 평가합니다. Sonne, Villalta &amp; Andrews, Applied Ergonomics, 2012.</li>' +
    '<li><strong>점수 색 4단계</strong>: RULA가 결과를 4단계 조치 수준(수용 가능 · 추가 조사 · 곧 개선 · 즉시 개선)으로 나누는 방식을 본떴습니다. 구간 경계(85·65·40점)는 ErgoFit이 정한 값입니다.</li></ul></div></details>';

  $('guide-body').innerHTML = head + plan + list + stretch + sources + '<a class="btn block" href="#practice">실천 체크리스트로 가기</a>';
  renderGuideList();
  showPressedChip();
}

/* 고른 영역 버튼이 화면 밖에 있으면 옆으로 넘겨서 보이게 합니다 */
function showPressedChip() {
  var chip = $('guide-body').querySelector('.chip[aria-pressed="true"]');
  if (chip) chip.parentNode.scrollLeft = chip.offsetLeft - chip.parentNode.offsetLeft - 16;
}

/* 고른 영역의 행동만 그립니다. '먼저 고칠 3가지'에 있는 행동은 이름만 */
function renderGuideList() {
  var answers = load('answers', null);
  var actions = getActions(answers, analyze(answers));
  var list = guideFilter === 'all' ? actions : actions.filter(function (x) { return x.cat.id === guideFilter; });
  var html = list.length ? '' : '<div class="card soft"><p>이 영역은 고칠 항목이 없습니다. 지금 상태를 유지하세요.</p></div>';
  list.forEach(function (act) {
    var rank = actions.indexOf(act);
    if (rank < 3) {
      html += '<div class="card stack tight"><div class="between"><h3>' + act.title + '</h3><span class="tag">먼저 고칠 ' + (rank + 1) + '번</span></div>' +
        '<p class="caption">' + act.cat.name + ' · 위의 먼저 고칠 3가지에 자세히 있습니다.</p></div>';
    } else {
      html += actionCard(act);
    }
  });
  $('guide-list-body').innerHTML = html;
}

$('guide-body').addEventListener('click', function (e) {
  var chip = e.target.closest('[data-filter]');
  if (!chip) return;
  guideFilter = chip.getAttribute('data-filter');
  Array.prototype.forEach.call($('guide-body').querySelectorAll('[data-filter]'), function (b) {
    b.setAttribute('aria-pressed', String(b === chip));
  });
  renderGuideList();
  showPressedChip();
});

/* ---------- 5. 실천: 해 본 행동에 체크 ---------- */
function renderPractice() {
  var head = pageHead('실천', '해 본 행동에 체크하세요. 2주 뒤 다시 점검하면 변화가 기록됩니다.');
  var answers = load('answers', null);
  if (!answers) { $('practice-body').innerHTML = head + emptyState('설문을 마치면 실천할 행동 목록이 만들어집니다.'); return; }
  var actions = getActions(answers, analyze(answers));
  var checks = load('checks', {});
  var done = actions.filter(function (x) { return checks[x.id]; }).length;
  var pct = actions.length ? Math.round(done / actions.length * 100) : 100;

  function row(act) {
    var on = checks[act.id];
    return '<label class="check' + (on ? ' done' : '') + '"><input type="checkbox" id="check-' + act.id + '" data-id="' + act.id + '"' + (on ? ' checked' : '') + '>' +
      '<span class="stack tight"><span class="check-title">' + act.title + '</span><span class="caption">' + act.cat.name + ' · ' + act.today + '</span></span></label>';
  }

  var html = head + '<div class="card stack tight"><p class="caption">실천 중인 행동</p>' +
    '<p class="big-count"><b class="num" id="check-count">' + done + '</b><span class="muted">/ ' + actions.length + '개</span></p>' +
    '<div class="bar"><div id="check-bar" data-fill="' + pct + '"></div></div></div>';
  if (!actions.length) {
    html += '<div class="card soft"><p>실천할 항목이 없습니다. 지금 상태를 유지하세요.</p></div>';
  } else {
    html += '<div class="card stack tight"><h2>먼저 고칠 ' + Math.min(3, actions.length) + '가지</h2><div>' + actions.slice(0, 3).map(row).join('') + '</div></div>';
    if (actions.length > 3) html += '<div class="card stack tight"><h2>그다음 할 일</h2><div>' + actions.slice(3).map(row).join('') + '</div></div>';
  }
  html += '<div class="card soft stack"><div class="stack tight"><h2>2주 뒤 다시 점검하기</h2><p>실천한 뒤 다시 점검하면 기록 페이지에서 점수 변화를 볼 수 있습니다.</p></div>' +
    '<a class="btn block" href="#survey">다시 점검하기</a></div>';
  $('practice-body').innerHTML = html;
  playAnimations($('practice-body'));
}

/* 체크하면 화면 전체를 다시 그리지 않고 진행률만 바꿉니다 → 진행 막대가 부드럽게 움직입니다 */
$('practice-body').addEventListener('change', function (e) {
  var id = e.target.getAttribute('data-id');
  if (!id) return;
  var checks = load('checks', {});
  checks[id] = e.target.checked;
  save('checks', checks);
  var boxes = $('practice-body').querySelectorAll('input[data-id]');
  var done = 0;
  Array.prototype.forEach.call(boxes, function (box) {
    box.closest('.check').classList.toggle('done', box.checked);
    if (box.checked) done++;
  });
  $('check-count').textContent = done;
  $('check-bar').style.width = Math.round(done / boxes.length * 100) + '%';
});

/* ---------- 6. 기록: 점수 변화 + 지난 점검과 비교 + 목록 ---------- */
var clearArmed = false;

function renderRecord() {
  var head = pageHead('기록', '점검할 때마다 점수가 쌓입니다.');
  var history = load('history', []);
  if (!history.length) { $('record-body').innerHTML = head + emptyState('설문을 마치면 날짜와 점수가 여기에 쌓입니다.'); return; }

  // (1) 점수 변화 그래프
  var chart = '<div class="card stack"><h2>점수 변화</h2><div class="history-chart" role="img" aria-label="점검 회차별 종합 점수">' +
    history.map(function (h) {
      var lv = levelOf(h.overall);
      return '<div class="col"><div class="track"><div class="v ' + lv.cls + '" data-fill="' + Math.max(h.overall, 2) + '" data-dir="up">' +
        '<b class="num txt ' + lv.cls + '" data-count="' + h.overall + '">0</b></div></div><span>' + shortDate(h.date) + '</span></div>';
    }).join('') + '</div></div>';

  // (2) 지난 점검과 비교 (기록이 2건 이상일 때)
  var compare = '';
  if (history.length >= 2) {
    var prev = history[history.length - 2], now = history[history.length - 1];
    var d = now.overall - prev.overall;
    var lp = levelOf(prev.overall), ln = levelOf(now.overall);
    var rows = CATEGORIES.map(function (c) {
      var before = 100 - prev.risks[c.id], after = 100 - now.risks[c.id], diff = after - before;
      return '<div class="cmp-row"><span>' + c.name + '</span>' +
        '<span class="num"><span class="txt ' + levelOf(before).cls + '">' + before + '</span> → <strong class="txt ' + levelOf(after).cls + '">' + after + '</strong></span>' +
        '<span class="change num' + (diff < 0 ? ' down' : '') + '">' + (diff > 0 ? '▲ ' + diff : diff < 0 ? '▼ ' + (-diff) : '–') + '</span></div>';
    }).join('');
    compare = '<div class="card stack"><div class="between"><h2>지난 점검과 비교</h2>' +
      '<span class="delta' + (d < 0 ? ' down' : '') + '">' + (d > 0 ? d + '점 올랐습니다' : d < 0 ? (-d) + '점 내려갔습니다' : '변화 없음') + '</span></div>' +
      '<div class="cmp-top"><div class="stack tight"><p class="caption">' + formatDate(prev.date) + '</p><b class="txt ' + lp.cls + '" data-count="' + prev.overall + '">0</b><span><span class="pill ' + lp.cls + '">' + lp.text + '</span></span></div>' +
      '<span class="muted" aria-hidden="true">→</span>' +
      '<div class="stack tight"><p class="caption">' + formatDate(now.date) + '</p><b class="txt ' + ln.cls + '" data-count="' + now.overall + '">0</b><span><span class="pill ' + ln.cls + '">' + ln.text + '</span></span></div></div>' +
      (prev.answers && now.answers ? '<div class="poses figure"><div>' + drawPose(prev.answers, { levels: analyze(prev.answers).levels }) + '<p class="caption">이전 자세</p></div>' +
        '<div>' + drawPose(now.answers, { levels: analyze(now.answers).levels }) + '<p class="caption">이번 자세</p></div></div>' : '') +
      '<div>' + rows + '</div></div>';
  }

  // (3) 점검 목록 (최근 것이 위)
  var list = '<div class="card stack tight"><h2>점검 목록</h2><div>' + history.slice().reverse().map(function (h, i) {
    var lv = levelOf(h.overall);
    return '<div class="rec-row"><span><strong>' + (history.length - i) + '회</strong> <span class="caption">' + formatDate(h.date) + '</span></span>' +
      '<strong class="num txt ' + lv.cls + '">' + h.overall + '점</strong><span class="pill ' + lv.cls + '">' + lv.text + '</span></div>';
  }).join('') + '</div></div>';

  $('record-body').innerHTML = head + chart + compare + list +
    '<button class="link-danger" type="button" id="btn-clear">기록 모두 지우기</button>';
  playAnimations($('record-body'));
}

/* '기록 모두 지우기'는 실수를 막기 위해 두 번 눌러야 지워집니다 */
$('record-body').addEventListener('click', function (e) {
  if (e.target.id !== 'btn-clear') return;
  if (!clearArmed) { clearArmed = true; e.target.textContent = '한 번 더 누르면 모든 기록이 삭제됩니다'; e.target.classList.add('armed'); return; }
  save('history', []);
  clearArmed = false;
  renderRecord();
});

/* =========================================================
   H. 페이지 전환: 주소 끝의 #이름 에 따라 해당 section만 보여 줍니다
   ========================================================= */
var PAGES = ['home', 'survey', 'result', 'guide', 'practice', 'record'];
var OLD_NAMES = { checklist: 'practice' };   // 예전 주소로 들어와도 새 페이지를 보여 줍니다

function render() {
  closeSheet(true);
  var name = location.hash.replace('#', '');
  if (OLD_NAMES[name]) name = OLD_NAMES[name];
  if (PAGES.indexOf(name) === -1) name = 'home';

  document.body.classList.toggle('focus', name === 'survey');   // 설문 중에는 메뉴 숨김
  PAGES.forEach(function (p) { $('page-' + p).classList.toggle('active', p === name); });
  Array.prototype.forEach.call($('nav').querySelectorAll('a'), function (a) {
    var on = a.getAttribute('data-page') === name;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });

  if (name === 'guide' && !guideJump) guideFilter = 'all';   // 메뉴로 들어오면 '전체'부터

  if (name === 'home') { resetSurvey(); renderHome(); }   // 홈으로 오면 진행 중이던 설문 선택도 지웁니다
  if (name === 'survey') renderSurvey();
  if (name === 'result') renderResult();
  if (name === 'guide') renderGuide();
  if (name === 'practice') renderPractice();
  if (name === 'record') { clearArmed = false; renderRecord(); }

  var jumpTo = name === 'guide' && guideJump ? $('guide-list') : null;
  guideJump = false;
  if (jumpTo) jumpTo.scrollIntoView(); else window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);
render();
