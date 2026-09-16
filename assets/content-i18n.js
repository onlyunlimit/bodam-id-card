import { registerCopy } from './i18n.js';
import { guideEntries } from './guide.js';
import { floors } from './guide.js';
import { teams } from './model.js';
const handbook = [
  [
    [
      'Decades ago, the first unexplained gates appeared alongside the first sentinel awakenings. Society developed systems to protect, deploy and control these powers.',
      'Awakeners are classified as sentinels or guides. Appearance and scent cannot distinguish them; contact between awakeners or formal testing can. Annual screening for unawakened citizens takes place in June.',
    ],
    [
      '数十年前、原因不明のゲート出現とほぼ同時に、最初のセンチネルの覚醒が観測された。社会はその力を保護・活用・統制する制度を築いていった。',
      '覚醒者はセンチネルとガイドに分類される。匂いや外見では判別できず、覚醒者同士の接触または検査で確認する。未覚醒者の定期検査は毎年6月に行われる。',
    ],
    [
      '数十年前，不明原因的门扉出现，几乎同时观测到了首批哨兵觉醒。社会逐步建立起保护、运用与管制这股力量的制度。',
      '觉醒者分为哨兵与向导，无法凭气味或外貌区分，须通过觉醒者之间的接触或检测确认。未觉醒者的例行检查于每年6月进行。',
    ],
  ],
  [
    [
      'Rifts leading to other dimensions or uncharted realms. They may appear as circular portals, enormous doors or pillars of light.',
      'Animal disturbances, electronic failures and abnormal weather may precede a gate. Persistent gates erode reality and transform their surroundings. Monsters may emerge within, or the environment itself may behave like a living organism.',
    ],
    [
      '異次元や未知の領域につながる裂け目。円形のポータル、巨大な扉、光の柱など、さまざまな姿で現れる。',
      '出現前には動物の異常行動、電子機器の誤作動、異常気象が観測されることがある。長期間維持されると現実を侵食し、周辺を異界化させる。内部では怪物が自然発生したり、環境自体が生物のように振る舞ったりする。',
    ],
    [
      '通往其他维度或未知领域的裂隙，可能呈现为圆形传送门、巨门或光柱等形态。',
      '出现前可能伴随动物异常行为、电子设备故障和异常天气。长期存在的门扉会侵蚀现实，使周边异界化。内部可能自然产生怪物，环境本身也可能如同生物般活动。',
    ],
  ],
  [
    [
      'SGIA prevents sentinel overload, assigns and protects guides, coordinates national deployment and regulates unregistered awakeners and unauthorized guiding.',
      'Central command sets policy, compatibility and grading standards, and approves combat deployment. Sentinel administration handles classification, regular screening, overload-risk forecasting and assignments.',
    ],
    [
      '国家覚醒者統合管理庁。センチネルの暴走防止、ガイドの配置と保護、覚醒者の国家運用、違法覚醒者と無許可ガイディングの取り締まりを担う。',
      '中央統制本部は政策・マッチング・等級基準と戦闘投入を決定する。センチネル管理局は等級判定、定期検査、暴走リスクの予測、任務配置を担当する。',
    ],
    [
      '国家觉醒者综合管理局负责预防哨兵暴走、安排与保护向导、统筹觉醒者的国家调度，并管制非法觉醒者及未经许可的引导。',
      '中央管制总部制定政策、匹配与等级标准，并决定战斗部署。哨兵管理局负责等级评定、定期检查、暴走风险预测和任务分配。',
    ],
  ],
  [
    [
      'A small minority of humans possess extraordinary abilities. All awakeners must register; remaining unregistered is illegal.',
      'Above certain grades, movement and employment are restricted, and refusing assignments may be punishable. Their rights as citizens sit uneasily beside their treatment as national assets.',
    ],
    [
      '異能を持つ、ごく少数の人間。すべての覚醒者に登録義務があり、未登録状態は違法となる。',
      '一定等級以上では移動や職業が制限され、任務拒否が処罰の対象となる場合がある。国民としての法的地位と、国家資産としての扱いの間には緊張がある。',
    ],
    [
      '拥有异能的极少数人类。所有觉醒者均有登记义务，未登记状态属于违法。',
      '达到一定等级后，行动和职业选择会受到限制，拒绝任务可能受到处罚。作为公民的法律地位与被视为国家资产的待遇之间存在矛盾。',
    ],
  ],
  [
    [
      'Awakeners deployed on operations. Field appointments include agent, senior agent, commanding agent and special agent.',
      'Senior agents lead small teams; commanding agents oversee larger hunter forces. Special agents handle S-class assignments, with records kept classified. Higher grades bring tighter state control.',
    ],
    [
      '作戦に投入される覚醒者戦力。現場職位は隊員・先任隊員・指揮隊員・特殊隊員に分かれる。',
      '先任隊員は小規模チームを、指揮隊員は多数のハンターを率いる。特殊隊員はS級専任で、関連記録は非公開。等級が高いほど国家統制も強まる。',
    ],
    [
      '投入作战的觉醒者力量，现场职务分为干员、资深干员、指挥干员和特殊干员。',
      '资深干员带领小队，指挥干员统领多名猎人。特殊干员专职负责S级事务，相关档案不公开。等级越高，受到的国家管制越严格。',
    ],
  ],
  [
    [
      'Individuals granted superhuman senses and combat abilities, at the cost of sensory overload and psychological collapse.',
      'Going without guiding for too long increases the risk of going berserk. The range and danger of an outbreak depend on grade. Regular mental and sensory assessments are required.',
    ],
    [
      '超人的な感覚と戦闘能力を得る代わりに、感覚過負荷や精神崩壊の危険を抱える存在。',
      '一定期間ガイディングを受けないと暴走の危険が高まる。暴走の範囲と危険度は等級によって異なり、精神・感覚の定期検査が義務付けられる。',
    ],
    [
      '获得超人感官与战斗能力的同时，也承受感官过载和精神崩溃风险的存在。',
      '长期未接受引导会面临暴走风险。暴走的范围与危险程度因等级而异，须定期接受精神与感官检查。',
    ],
  ],
  [
    [
      'Awakeners who stabilize a sentinel’s senses and mind. Guiding is effective only between guides and sentinels.',
      'Radiant guiding can reach multiple sentinels without contact, but stabilization takes longer. Contact guiding is one-to-one. Excessive guiding places physical strain on the guide.',
    ],
    [
      'センチネルの感覚と精神を安定させる覚醒者。ガイディングはガイドとセンチネルの間でのみ効果を発揮する。',
      '放射ガイディングは接触せず複数のセンチネルに作用するが、安定までに時間を要する。接触ガイディングは1対1で行う。過度なガイディングはガイドの身体に負担をかける。',
    ],
    [
      '能够稳定哨兵感官与精神的觉醒者。引导仅在向导与哨兵之间有效。',
      '辐射引导无需接触即可影响多名哨兵，但达到稳定状态需要更长时间。接触引导以一对一方式进行。过度引导会给向导的身体带来负担。',
    ],
  ],
  [
    [
      'Compatibility measures how well a sentinel and guide match. Higher compatibility makes guiding more effective.',
      'At 70% or above, a stable partnership is possible; 90% or above is rare and highly compatible. A 100% match has not been confirmed. Low compatibility may cause discomfort and rejection.',
    ],
    [
      'センチネルとガイドの相性をマッチング率で測定する。数値が高いほどガイディングの効果も高い。',
      '70%以上は安定したパートナー、90%以上は希少な高適合ペア。100%の存在は確認されていない。低いマッチング率では不快感や拒絶反応が生じる場合がある。',
    ],
    [
      '匹配率用于衡量哨兵与向导的相性。匹配率越高，引导效果越好。',
      '70%以上可形成稳定搭档，90%以上属于罕见的高适配配对，尚未确认存在100%的匹配。匹配率过低可能引发不适与排斥反应。',
    ],
  ],
  [
    [
      'A partnership formed through agency assignment based on compatibility, or by application from the people involved.',
      'Registered pairs can link their smartwatches to share the sentinel’s guiding readings. Pair registration is distinct from the lifelong bond of imprinting.',
    ],
    [
      '機関による高マッチング率の割り当て、または当事者の申請によって結ばれるパートナー関係。',
      'ペアになるとスマートウォッチを相互登録し、センチネルのガイディング数値を共有できる。ペア登録と、生涯にわたり帰属する刻印は別の制度である。',
    ],
    [
      '由机构依据高匹配率安排，或由当事人申请建立的搭档关系。',
      '配对后可相互登记智能手表，共享哨兵的引导数值。配对登记与终身绑定的烙印是不同概念。',
    ],
  ],
  [
    [
      'A lifelong bond that restricts guiding to the imprinted partner.',
      'Imprinting must be reported to the agency. Guiding efficiency rises greatly, but receiving guiding from anyone else can cause nausea, dizziness and other adverse effects. One-sided imprinting occasionally occurs.',
    ],
    [
      '生涯にわたり、刻印した相手からしかガイディングを受けられなくなる帰属状態。',
      '機関への届出手続きがある。刻印後はガイディング効率が大きく上昇するが、別の相手から受けると嘔吐やめまいなどの副作用が生じる。まれに一方的な刻印も起こる。',
    ],
    [
      '一种终身绑定状态，此后只能接受烙印对象的引导。',
      '须向机构履行申报手续。烙印后引导效率大幅提升，但接受其他人的引导会产生呕吐、眩晕等副作用。少数情况下也会出现单方面烙印。',
    ],
  ],
  [
    [
      'Beings that cannot be explained by the existing sentinel–guide classification.',
      'Passers enter a gate and return in human form. Eroded beings suffer irreversible changes to mind and body. Returnees come back after contact with something inside. ORIGIN comprises four gate survivors.',
    ],
    [
      '既存のセンチネル・ガイド分類では説明できない存在。',
      '通過者はゲートに入り人の姿で戻った者、侵食者は精神と身体が不可逆的に変質した者、帰還体は内部の何かと接触して戻った者を指す。オリジンはゲート生還者4名で構成される。',
    ],
    [
      '无法以现有哨兵与向导分类体系解释的存在。',
      '通行者指进入门扉后以人类形态归来者；侵蚀者的精神与身体发生不可逆变化；归还体则在接触内部某种存在后归来。ORIGIN由四名门扉生还者组成。',
    ],
  ],
  [
    [
      'ORIGIN handles third awakeners and variant gates. BEACON tracks and secures unregistered awakeners and investigates illegal guiding. SHIELD responds to high-risk gates and uncontrollable entities.',
      'BEACON’s signature color is gray; SHIELD’s is white. SHIELD runs the entity rehabilitation project. LUCKY TRICK and OBSIDUS are hunter crews affiliated with separate agencies and housed at headquarters.',
    ],
    [
      'オリジンは第三の覚醒者と変異ゲート、ビコンは未登録覚醒者の追跡・身柄確保と違法ガイディングの取り締まり、シールドは高危険度ゲートと制御不能個体への対応を担う。',
      'ビコンの代表色は灰色、シールドは白。シールドは怪物更生プロジェクトを進めている。LUCKY TRICKとOBSIDUSはそれぞれ別の事務所と提携するハンタークルーで、覚醒館で生活する。',
    ],
    [
      'ORIGIN负责第三类觉醒者与变异门扉；BEACON负责追踪、控制未登记觉醒者及查处非法引导；SHIELD负责高危门扉与失控个体。',
      'BEACON的代表色为灰色，SHIELD为白色。SHIELD开展怪物改造项目。LUCKY TRICK和OBSIDUS是分别与独立经纪机构合作的猎人组合，居住于觉醒馆。',
    ],
  ],
  [
    [
      'LUCKY TRICK is affiliated with Elysian; OBSIDUS with Hunterwind.',
      'Hunter work supports fandoms on the scale of the idol industry. These are not singing or dancing groups: agencies plan combat outfits, ability showcases, interviews and fan engagement. Public support and popularity affect earnings and the maintenance of team grades.',
    ],
    [
      'LUCKY TRICKはエリシアン、OBSIDUSはハンターウィンドと提携している。',
      'ハンター活動にアイドル市場規模のファンダムが形成された仕組み。歌やダンスのためのグループではなく、戦闘服・技の演出・インタビュー・ファン交流が企画される。大衆の支持と人気は収益やチーム等級の維持に影響する。',
    ],
    [
      'LUCKY TRICK与Elysian合作，OBSIDUS则与Hunterwind合作。',
      '猎人活动形成了堪比偶像产业规模的粉丝群体。组合并非以歌舞为目的，经纪机构负责战斗服、技能演出、采访及粉丝互动的策划。公众支持与人气会影响收益和团队等级的维持。',
    ],
  ],
  [
    [
      'An extremist criminal organization formed by deserter sentinels, unregistered guides and illicit researchers opposed to strict registration and grading.',
      'While claiming to seek freedom for awakeners, ORPÉ is implicated in exploitative unauthorized guiding, gate poaching, illegal human modification, biological weapons and intrusions into SGIA systems. It is not an SGIA department.',
    ],
    [
      '厳格な登録・等級制度に反発する脱走センチネル、未登録ガイド、違法研究者が結集した過激派犯罪組織。',
      '覚醒者の自由と解放を掲げる一方、無許可ガイディングの搾取、ゲートの密猟、違法な人体改造、生体兵器製造、覚醒館システムへの侵入に関与する。SGIAの所属部署ではない。',
    ],
    [
      '由反对严格登记与等级制度的逃亡哨兵、未登记向导及非法研究者组成的极端犯罪组织。',
      '虽标榜觉醒者的自由与解放，却涉及未经许可的引导剥削、门扉偷猎、非法人体改造、生物兵器制造及入侵SGIA系统，并非SGIA所属部门。',
    ],
  ],
];
const floorNames = [
  ['Central command', '中央統制本部', '中央管制总部'],
  ['Policy & classification review', '政策・等級審議室', '政策与等级审议室'],
  ['External research & cover facilities', '対外研究・偽装施設', '对外研究与掩护设施'],
  ['Administration & external affairs', '一般行政・対外協力', '行政与对外合作'],
  ['Guide protection & education', 'ガイド保護・教育区域', '向导保护与教育区'],
  ['Guide administration', 'ガイド管理局', '向导管理局'],
  ['Public services & registration lobby', '民願・登録ロビー', '公众服务与登记大厅'],
  ['Security lobby', '保安統制ロビー', '安保管制大厅'],
  ['Sentinel daily care', 'センチネル日常管理区域', '哨兵日常管理区'],
  ['Sentinel training', 'センチネル訓練区域', '哨兵训练区'],
  ['Tactical simulation', '戦術シミュレーション', '战术模拟区'],
  ['ORIGIN quarters', 'オリジン生活区域', 'ORIGIN生活区'],
  ['Sentinel command core', 'センチネル管理局中枢', '哨兵管理局核心区'],
  ['High-risk containment', '高危険度隔離区域', '高危隔离区'],
  ['ORIGIN records', 'オリジン専用記録区域', 'ORIGIN专属档案区'],
  ['Gate laboratory', 'ゲート研究所', '门扉研究所'],
  ['Classified experiments', '極秘実験区域', '绝密实验区'],
  ['Unofficial holding area', '非公式収容区域', '非正式收容区'],
];
export function installContentTranslations() {
  guideEntries.forEach((entry, i) =>
    [3, 4].forEach((field, j) =>
      registerCopy(entry[field], handbook[i][0][j], handbook[i][1][j], handbook[i][2][j]),
    ),
  );
  floors.forEach((f, i) => registerCopy(f[1], ...floorNames[i]));
}
