// Lucky Trick introduction page data (approved page design, 2026-11-27).
export const luckyMembers = [
  {
    id: 'jaein',
    nameKo: '재인',
    nameEn: 'JAEIN',
    grade: 'S급 Sentinel',
    gradeShort: 'S',
    age: '25세',
    role: '리더, 원거리 딜러',
    appearance: '168cm · 붉은 장발 · 보라색 눈',
    ability: '유도형 표창 · 마력 탐지',
    weapon: '표창',
    location: 'SGIA 헌터 크루 생활 구역 기획사 엘리시안 (ELYSIAN)',
    notes: [
      '특수 합금 표창을 사용. 파괴되지 않은 표창은 회수 가능.',
      '정확한 궤도 제어와 화려한 전투로 팀을 이끄는 리더. 동료를 세심하게 챙기며 대중 앞에서도 당당하다.'
    ],
    accent: '#D8B4FE',
    glowRgba: 'rgba(216, 180, 254, 0.42)',
    // Red & Purple signature collect-book binder palette
    binderBg: 'linear-gradient(145deg, #9F1239 0%, #701A75 50%, #4C1D95 100%)',
    binderStrapBg: 'linear-gradient(135deg, #BE123C 0%, #6D28D9 100%)',
    binderGlow: 'rgba(192, 132, 252, 0.46)',
    // Cute Shuriken, Crown, Crimson-Violet Hearts & Sparkle Stickers
    stickersHtml: `
      <!-- Top-left Royal Leader Crown -->
      <svg class="polco-sticker w-11 h-11 top-4 left-11" style="--st-rot: -14deg; transform: rotate(-14deg);" viewBox="0 0 64 64">
        <path d="M10 46 L14 20 L26 32 L32 14 L38 32 L50 20 L54 46 Z" fill="#FDE047" stroke="#A16207" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="10" y="46" width="44" height="7" rx="3.5" fill="#FACC15" stroke="#A16207" stroke-width="2.5"/>
        <circle cx="32" cy="36" r="3.5" fill="#E11D48"/>
        <circle cx="20" cy="39" r="2.5" fill="#A855F7"/>
        <circle cx="44" cy="39" r="2.5" fill="#A855F7"/>
      </svg>
      <!-- Top-right Metallic 4-Point Shuriken Star -->
      <svg class="polco-sticker w-12 h-12 top-5 right-5" style="--st-rot: 18deg; transform: rotate(18deg);" viewBox="0 0 64 64">
        <path d="M32 4 L39 25 L60 32 L39 39 L32 60 L25 39 L4 32 L25 25 Z" fill="#E9D5FF" stroke="#6B21A8" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="32" cy="32" r="5" fill="#F43F5E" stroke="#6B21A8" stroke-width="2"/>
      </svg>
      <!-- Bottom-left Glossy Crimson & Purple Double Hearts -->
      <svg class="polco-sticker w-12 h-12 bottom-5 left-11" style="--st-rot: -10deg; transform: rotate(-10deg);" viewBox="0 0 64 64">
        <path d="M24 44 C12 35 8 28 8 21 C8 15 13 11 18 11 C21 11 23 13 24 15 C25 13 27 11 30 11 C35 11 40 15 40 21 C40 28 36 35 24 44 Z" fill="#FB7185" stroke="#9F1239" stroke-width="2.2"/>
        <path d="M42 54 C33 47 30 42 30 37 C30 33 33 30 37 30 C39 30 41 31 42 33 C43 31 45 30 47 30 C51 30 54 33 54 37 C54 42 51 47 42 54 Z" fill="#C084FC" stroke="#581C87" stroke-width="2.2"/>
      </svg>
      <!-- Bottom-right Small Shuriken & Sparkle Cluster -->
      <svg class="polco-sticker w-10 h-10 bottom-6 right-6" style="--st-rot: 12deg; transform: rotate(12deg);" viewBox="0 0 64 64">
        <path d="M22 10 L26 22 L38 26 L26 30 L22 42 L18 30 L6 26 L18 22 Z" fill="#FDA4AF"/>
        <path d="M46 32 L49 40 L57 43 L49 46 L46 54 L43 46 L35 43 L43 40 Z" fill="#F3E8FF"/>
      </svg>
    `,
    cutoutPhoto: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim/375d5cfc-4151-4df6-af2b-dc8644be4c0b?v=948ece',
    heroBgPhoto: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-1920x/b22dfb0d-817b-407e-9f90-18b4532a06fe?v=60dc4f',
    editorialPhotos: [
      {
        url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-1920x/b22dfb0d-817b-407e-9f90-18b4532a06fe?v=60dc4f'
      },
      {
        url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/34551e15-2d95-4a69-a6fe-55c4025bd8c6?v=daae56'
      },
      {
        url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/d3606b99-33ed-458b-9d84-6193f167280d?v=5b1b97'
      }
    ],
    photocards: [
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/bb519434-f56f-4ac2-8f33-dfb1821c1cbe?v=79bcf4', label: 'DEBUT SHOWCASE EDITION' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/f508ec8d-d657-46f3-8e54-adabe826ee70?v=dea79b', label: 'HALLOWEEN SPECIAL EDITION' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/989b7686-9e5c-447f-9e45-70992a17ff29?v=3f94f2', label: 'PRIVATE SELFIE ARCHIVE' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/75e6b740-987c-4565-b0e9-83106ab41658?v=1cf00f', label: '1ST MINI ALBUM VER. A' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/392e6961-3173-433c-8e61-73ad4bd5237b?v=01b7e8', label: '1ST MINI ALBUM VER. B' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/a3dc6197-6a31-45b9-bea3-78f6432f9da1?v=7a89f7', label: 'ELYSIAN STUDIO FILM' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/cfd30210-9539-4e21-b5bf-821b6c14707a?v=2a9b34', label: 'CRIMSON LEADER EDITION' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/9fb44e03-4267-4f5e-9c80-26a9f14e749e?v=18b50c', label: 'LUCKY TRICK FANMEETING' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/7ccbb53b-3020-40f8-93ad-e060b3792d26?v=e28f25', label: 'NOCTURNE CONCEPT VER.' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/8fc4d025-a7a2-4fe9-821f-f6e01f2bf1c9?v=748114', label: 'DIRECTOR’S CUT EDITION' }
    ]
  },
  {
    id: 'danjo',
    nameKo: '단조',
    nameEn: 'DANJO',
    grade: 'B급 Sentinel',
    gradeShort: 'B',
    age: '20세',
    role: '근접 서포터 / 탱커',
    appearance: '회색빛 흑발 단발 · 벽안',
    ability: '신체 내구도 · 재생 · 맨몸 타격',
    weapon: 'X',
    location: 'SGIA 헌터 크루 생활 구역 - 기획사 엘리시안 (ELYSIAN)',
    notes: [
      '잠재력은 S급으로 평가. 거대한 괴물 앞에서도 좀처럼 표정이 바뀌지 않는다.',
      '작은 체구와 달리 압도적인 내구도를 지닌 막내. 동료가 위험할 때 가장 먼저 몸을 던진다.'
    ],
    accent: '#93C5FD',
    glowRgba: 'rgba(147, 197, 253, 0.42)',
    // Grey & Blue signature collect-book binder palette
    binderBg: 'linear-gradient(145deg, #64748B 0%, #3B5575 50%, #1E3A8A 100%)',
    binderStrapBg: 'linear-gradient(135deg, #94A3B8 0%, #2563EB 100%)',
    binderGlow: 'rgba(96, 165, 250, 0.44)',
    // Cute Black Cat, Paw Pad, Red Hood & Silver-Blue Star Stickers
    stickersHtml: `
      <!-- Top-left Cute Black Cat Head Sticker -->
      <svg class="polco-sticker w-12 h-12 top-3.5 left-11" style="--st-rot: -12deg; transform: rotate(-12deg);" viewBox="0 0 64 64">
        <path d="M14 26 L12 10 L25 18 Q32 16 39 18 L52 10 L50 26 Q54 34 50 44 Q42 52 32 52 Q22 52 14 44 Q10 34 14 26 Z" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
        <circle cx="24" cy="33" r="3.5" fill="#60A5FA"/>
        <circle cx="40" cy="33" r="3.5" fill="#60A5FA"/>
        <path d="M29 40 L32 42 L35 40" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <!-- Top-right Cute Cat Paw Pad Sticker -->
      <svg class="polco-sticker w-11 h-11 top-5 right-5" style="--st-rot: 16deg; transform: rotate(16deg);" viewBox="0 0 64 64">
        <ellipse cx="32" cy="40" rx="13" ry="10" fill="#CBD5E1"/>
        <circle cx="18" cy="25" r="5" fill="#CBD5E1"/>
        <circle cx="27" cy="19" r="5" fill="#CBD5E1"/>
        <circle cx="37" cy="19" r="5" fill="#CBD5E1"/>
        <circle cx="46" cy="25" r="5" fill="#CBD5E1"/>
        <ellipse cx="32" cy="41" rx="7" ry="5" fill="#93C5FD"/>
      </svg>
      <!-- Bottom-left Little Red Hood & Pixel Heart Sticker -->
      <svg class="polco-sticker w-12 h-12 bottom-5 left-11" style="--st-rot: -8deg; transform: rotate(-8deg);" viewBox="0 0 64 64">
        <path d="M32 12 C20 12 14 24 14 42 L50 42 C50 24 44 12 32 12 Z" fill="#EF4444" stroke="#991B1B" stroke-width="2"/>
        <circle cx="32" cy="31" r="9" fill="#F8FAFC"/>
        <circle cx="29" cy="30" r="1.6" fill="#0F172A"/>
        <circle cx="35" cy="30" r="1.6" fill="#0F172A"/>
      </svg>
      <!-- Bottom-right Steel Blue & Silver Stars -->
      <svg class="polco-sticker w-11 h-11 bottom-5 right-6" style="--st-rot: 14deg; transform: rotate(14deg);" viewBox="0 0 64 64">
        <polygon points="24,10 28,21 40,21 30,28 34,39 24,32 14,39 18,28 8,21 20,21" fill="#93C5FD" stroke="#1D4ED8" stroke-width="1.8"/>
        <polygon points="46,34 49,41 56,41 50,45 52,52 46,48 40,52 42,45 36,41 43,41" fill="#E2E8F0"/>
      </svg>
    `,
    cutoutPhoto: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim/4932dabd-3572-41d7-934b-9c31c4126801?v=acc2fd',
    heroBgPhoto: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/d5f9f9d6-a69f-427c-97cf-b624c0f4b9d1?v=4d830a',
    editorialPhotos: [
      {
        url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/d5f9f9d6-a69f-427c-97cf-b624c0f4b9d1?v=4d830a'
      },
      {
        url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/deae41a6-63c4-4f24-b94a-d07cdc4c8e5a?v=fe85f1'
      },
      {
        url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/b247bb99-3480-4087-ac7f-6929ec6e3d32?v=714ec9'
      }
    ],
    photocards: [
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/aaf6bab9-c6c8-4dd6-8736-8834b6b3b7d1?v=98f74b', label: 'DEBUT OFFICIAL EDITION' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/8a6e760e-b507-40a9-b1f3-b61093446df9?v=7a8571', label: 'ELYSIAN ARCHIVE VER. A' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/9c6f3a32-6d8e-407d-b272-25a2989b123d?v=c88c0a', label: 'ELYSIAN ARCHIVE VER. B' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/b8e4f8d4-b67f-4306-b09c-80dfb615ba98?v=879ca6', label: 'SURPRISE LIVE MOMENT' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/58abd5a4-bfed-4b4a-ae21-4d45f094fb60?v=307d07', label: 'TRAINING LOG SELFIE' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/64b109d1-f816-44fe-bf9d-fd01511f0ef9?v=74dc19', label: 'FIELD DISPATCH CUT' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/2aa88228-3650-4b47-92b4-4ac5b6555f4c?v=695951', label: 'BLACK CAT HOODIE VER.' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/507868c4-a68a-444e-96bd-ceba3aa48cb0?v=cd5520', label: 'DAILY POLAROID EDITION' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/10b246ce-3dd7-40ac-9692-99aba80b44b5?v=9a5eaa', label: 'HALLOWEEN RED HOOD I' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/8006ba75-a7a2-4bbb-b856-228b635e70db?v=3bd8e2', label: 'HALLOWEEN RED HOOD II' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/e4424b75-201b-4e3e-9635-b6cb3fa511a3?v=956b4a', label: 'HALLOWEEN WOLF SPECIAL' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/86faa1a0-c3d9-46d3-82ad-3999900f2b59?v=3c475c', label: 'MIDNIGHT FAIRYTALE VER.' }
    ]
  },
  {
    id: 'unsae',
    nameKo: '운새',
    nameEn: 'UNSAE',
    grade: 'A급 Sentinel',
    gradeShort: 'A',
    age: '23세',
    role: '브루저 / 스트라이커',
    appearance: '연한 초록색 장발 · 노란 눈',
    ability: '대형 특수 건틀렛',
    weapon: '대형 특수 건틀렛',
    location: 'SGIA 헌터 크루 생활 구역 - 기획사 엘리시안 (ELYSIAN)',
    notes: [
      '평소의 수줍고 나른한 모습과 전투 중의 폭발적인 힘이 공존하는 근접 요원.',
      '전투 시 과감하게 돌진한다. 관심을 받는 일은 부담스러워하지만 강력한 현장 영상으로 유명하다.'
    ],
    accent: '#86EFAC',
    glowRgba: 'rgba(134, 239, 172, 0.42)',
    // Yellow & Green signature collect-book binder palette
    binderBg: 'linear-gradient(145deg, #CA8A04 0%, #65A30D 48%, #15803D 100%)',
    binderStrapBg: 'linear-gradient(135deg, #EAB308 0%, #16A34A 100%)',
    binderGlow: 'rgba(134, 239, 172, 0.45)',
    // Cute Four-Leaf Clover, Sleepy Chick/Cloud, Sprout Leaf & Yellow Star Stickers
    stickersHtml: `
      <!-- Top-left Lucky Four-Leaf Clover Sticker -->
      <svg class="polco-sticker w-12 h-12 top-3.5 left-11" style="--st-rot: -15deg; transform: rotate(-15deg);" viewBox="0 0 64 64">
        <circle cx="24" cy="24" r="10" fill="#4ADE80" stroke="#15803D" stroke-width="2"/>
        <circle cx="40" cy="24" r="10" fill="#4ADE80" stroke="#15803D" stroke-width="2"/>
        <circle cx="24" cy="40" r="10" fill="#4ADE80" stroke="#15803D" stroke-width="2"/>
        <circle cx="40" cy="40" r="10" fill="#4ADE80" stroke="#15803D" stroke-width="2"/>
        <path d="M32 32 Q36 50 28 58" fill="none" stroke="#15803D" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <!-- Top-right Cute Sleepy Chick & Zzz Sticker -->
      <svg class="polco-sticker w-12 h-12 top-4 right-5" style="--st-rot: 14deg; transform: rotate(14deg);" viewBox="0 0 64 64">
        <circle cx="30" cy="36" r="16" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
        <path d="M23 34 Q25 37 27 34" fill="none" stroke="#854D0E" stroke-width="2" stroke-linecap="round"/>
        <path d="M33 34 Q35 37 37 34" fill="none" stroke="#854D0E" stroke-width="2" stroke-linecap="round"/>
        <polygon points="28,38 32,38 30,42" fill="#F97316"/>
        <path d="M44 16 L52 16 L44 24 L52 24" fill="none" stroke="#FEF08A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <!-- Bottom-left Fresh Sprout & Pastel Yellow Stars -->
      <svg class="polco-sticker w-12 h-12 bottom-5 left-11" style="--st-rot: -10deg; transform: rotate(-10deg);" viewBox="0 0 64 64">
        <path d="M32 52 L32 30" stroke="#166534" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M32 32 C18 32 14 20 26 16 C32 14 32 26 32 32 Z" fill="#86EFAC" stroke="#166534" stroke-width="2"/>
        <path d="M32 28 C46 28 50 16 38 12 C32 10 32 22 32 28 Z" fill="#BEF264" stroke="#166534" stroke-width="2"/>
      </svg>
      <!-- Bottom-right Power Spark & Star Sticker -->
      <svg class="polco-sticker w-11 h-11 bottom-5 right-6" style="--st-rot: 12deg; transform: rotate(12deg);" viewBox="0 0 64 64">
        <polygon points="32,8 38,24 56,24 41,34 46,50 32,40 18,50 23,34 8,24 26,24" fill="#FDE047" stroke="#A16207" stroke-width="2"/>
      </svg>
    `,
    cutoutPhoto: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim/7cbc05d6-9ff6-4061-bdc9-87db8478f439?v=6725c4',
    heroBgPhoto: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/c29b6008-b93d-42cd-b2c6-2a0395682436?v=2235f6',
    editorialPhotos: [
      {
        url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/c29b6008-b93d-42cd-b2c6-2a0395682436?v=2235f6'
      },
      {
        url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/53ca9384-89a8-474c-8e68-f96c35e4e25a?v=ed4c29'
      },
      {
        url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/4bacaa47-8dce-41a7-91f4-df9546535f65?v=886bab'
      }
    ],
    photocards: [
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/643f05c4-17b2-4bb0-84f7-334e6646bf8a?v=f2603f', label: 'DEBUT CONCEPT EDITION' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/5cfb6807-7cda-4741-a208-6639d6bc3e82?v=5b5395', label: 'EMERALD GAZE VER.' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/ffba777a-43c5-49c0-aceb-cf0f99501897?v=2f3ab6', label: 'AFTERNOON REPOSE FILM' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/ca4bc0ad-a746-4d45-9459-261746ddecd0?v=6f3e3d', label: 'STRIKER ARCHIVE VER. A' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/a2d0e365-7ef2-4850-afab-c55c4827fa81?v=c893c9', label: 'STRIKER ARCHIVE VER. B' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/042579b2-e298-42c4-851a-5761a9d55d6f?v=bbb2dd', label: 'ELYSIAN STUDIO CUT' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/f7d16f84-0491-42af-9436-840de747637a?v=89e867', label: 'HALLOWEEN CURSED DOLL I' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/4694400d-a150-45f6-aef9-8deec3cf2d8a?v=992952', label: 'HALLOWEEN CURSED DOLL II' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/f9a79e3b-fe82-4cdd-9ec2-963f54dcddde?v=bb6e35', label: 'HALLOWEEN MARIONETTE' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/a43b9f2f-396d-42fe-a97b-f96e3388766e?v=17abae', label: 'VELVET NIGHT EDITION' }
    ]
  },
  {
    id: 'ujin',
    nameKo: '유진',
    nameEn: 'U-JIN',
    grade: 'A급 Sentinel',
    gradeShort: 'A',
    age: '24세',
    role: '서브 딜러 / 특수 기술',
    appearance: '172cm · 푸른빛 백발 · 연파랑 눈',
    ability: '클로 형태의 변이형 기계팔',
    weapon: '변이형 기계팔 (클로)',
    location: 'SGIA 헌터 크루 생활 구역 - 기획사 엘리시안 (ELYSIAN)',
    notes: [
      '차분하고 기품 있는 인상 속에 털털한 성격을 지녔다. 날카로운 금속 클로로 근접전을 지원한다.',
      '옵시더스 유환의 동생. 능력 발동 전에는 팔이 평범한 사람과 같은 형태를 유지한다.'
    ],
    accent: '#BAE6FD',
    glowRgba: 'rgba(186, 230, 253, 0.42)',
    // Pearl White & Icy Sky Blue signature collect-book binder palette
    binderBg: 'linear-gradient(145deg, #F8FAFC 0%, #BAE6FD 52%, #7DD3FC 100%)',
    binderStrapBg: 'linear-gradient(135deg, #FFFFFF 0%, #38BDF8 100%)',
    binderGlow: 'rgba(186, 230, 253, 0.5)',
    // Cute White Ribbon Bow, Snowflake Crystal, Icy Butterfly & Pearl Wing Stickers
    stickersHtml: `
      <!-- Top-left Satin Ribbon Bow Sticker -->
      <svg class="polco-sticker w-12 h-12 top-3.5 left-11" style="--st-rot: -14deg; transform: rotate(-14deg);" viewBox="0 0 64 64">
        <path d="M32 30 C18 16 8 22 12 34 C16 42 26 36 32 32 Z" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
        <path d="M32 30 C46 16 56 22 52 34 C48 42 38 36 32 32 Z" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
        <path d="M28 34 L20 52 L27 49 L32 36 Z" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.8"/>
        <path d="M36 34 L44 52 L37 49 L32 36 Z" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.8"/>
        <circle cx="32" cy="31" r="4.5" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
      </svg>
      <!-- Top-right Ice Crystal Snowflake Sticker -->
      <svg class="polco-sticker w-11 h-11 top-4 right-5" style="--st-rot: 15deg; transform: rotate(15deg);" viewBox="0 0 64 64">
        <g stroke="#0369A1" stroke-width="2.6" stroke-linecap="round">
          <line x1="32" y1="8" x2="32" y2="56"/>
          <line x1="11" y1="20" x2="53" y2="44"/>
          <line x1="53" y1="20" x2="11" y2="44"/>
        </g>
        <circle cx="32" cy="32" r="5" fill="#FFFFFF" stroke="#0369A1" stroke-width="2"/>
      </svg>
      <!-- Bottom-left Icy Sky Butterfly Sticker -->
      <svg class="polco-sticker w-12 h-12 bottom-5 left-11" style="--st-rot: -10deg; transform: rotate(-10deg);" viewBox="0 0 64 64">
        <path d="M32 32 C16 14 8 24 16 36 C10 44 20 52 32 38 Z" fill="#7DD3FC" stroke="#0369A1" stroke-width="2"/>
        <path d="M32 32 C48 14 56 24 48 36 C54 44 44 52 32 38 Z" fill="#7DD3FC" stroke="#0369A1" stroke-width="2"/>
        <line x1="32" y1="22" x2="32" y2="44" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <!-- Bottom-right Angel Wing & Pearl Star Sticker -->
      <svg class="polco-sticker w-12 h-12 bottom-5 right-5" style="--st-rot: 10deg; transform: rotate(10deg);" viewBox="0 0 64 64">
        <path d="M14 38 C16 22 30 16 48 20 C42 28 36 30 44 32 C36 38 30 38 36 42 C26 46 16 44 14 38 Z" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
        <circle cx="48" cy="44" r="4" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.8"/>
      </svg>
    `,
    cutoutPhoto: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim/9b97bb7d-31b6-415c-9e10-8e32974d3fe6?v=d9cf0b',
    heroBgPhoto: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/1d13f86c-3001-4f45-8085-69cdb980b2ce?v=6a34c8',
    editorialPhotos: [
      {
        url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/1d13f86c-3001-4f45-8085-69cdb980b2ce?v=6a34c8'
      },
      {
        url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/0a9f8bb0-5239-41f3-b6c2-0948b8047fc3?v=96baad'
      },
      {
        url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/f4109098-fdc9-4aa9-8d37-e7f42c7aeaef?v=d247fb'
      }
    ],
    photocards: [
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/eb6ed7f9-0547-473f-b3d3-ebff85e0fa12?v=153d89', label: 'DEBUT OFFICIAL PORTRAIT' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/46796052-e628-428d-8430-936d388bad14?v=6c1d60', label: 'SILVER FROST EDITION' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/6242f420-bf27-4175-84df-8cc1d1ece42a?v=f2c2ad', label: 'HALLOWEEN SPECIMEN 01' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/2bf180e1-3ef5-4832-b071-e236abbaed65?v=405240', label: 'HALLOWEEN SPECIMEN 02' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/3a41f1e9-5c80-4610-9682-3e0aaae3d169?v=5aa631', label: 'HALLOWEEN LAB ARCHIVE' },
      { url: 'https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/charim-standard/08774dae-85aa-430f-8091-afba0b02e5eb?v=83dd27', label: 'ELYSIAN STAGE FILM' }
    ]
  }
];
