// Interface copy is editorially translated; user posts and identifiers are never translated.
let current = (() => {
  try {
    return localStorage.getItem('sgia.language') || 'ko';
  } catch {
    return 'ko';
  }
})();
if (!['ko', 'en', 'ja', 'zh'].includes(current)) current = 'ko';
export const language = () => current;
export function setLanguage(value) {
  if (!['ko', 'en', 'ja', 'zh'].includes(value)) return;
  current = value;
  try {
    localStorage.setItem('sgia.language', value);
  } catch {}
  document.documentElement.lang = value;
}
const copy = `통합 관제|Operations|統合管制|综合管制
조직·부서|Departments|組織・部署|组织与部门
각성관 층별 안내|Headquarters directory|覚醒館フロア案内|觉醒馆楼层指南
헌터 엔터테인먼트|Hunter Entertainment|ハンターエンターテインメント|猎人娱乐
엔터테인먼트|Entertainment|エンターテインメント|娱乐
사건 기록실|Incident archive|事件記録室|事件档案室
세계관 안내서|Field handbook|世界観ガイド|世界观指南
세계관 안내|Field handbook|世界観ガイド|世界观指南
커뮤니티|Community|コミュニティ|社区
부서 정보|Department profile|部署情報|部门资料
외부 위협 정보|Threat intelligence|脅威情報|威胁情报
위협 정보 · ORPÉ|Threat intelligence · ORPÉ|脅威情報 · ORPÉ|威胁情报 · ORPÉ
국가 각성자 통합관리청|Sentinel & Guide Integrated Administration|国家覚醒者統合管理庁|国家觉醒者综合管理局
SGIA · 국가 각성자 통합관리청|SGIA · Integrated Administration|SGIA · 国家覚醒者統合管理庁|SGIA · 国家觉醒者综合管理局
직원 로그인|Staff sign in|職員ログイン|职员登录
직원 채널 · 로그아웃|Staff · Sign out|職員チャンネル・ログアウト|职员频道 · 退出
직원 채널 접속|Connect to staff network|職員ネットワークに接続|接入职员网络
사원증 태그 · 접속|Scan badge & connect|職員証をタッチして接続|刷工作证接入
사원증을 태그하여 내부 업무 화면으로 전환합니다.|Scan your badge to open the internal workspace.|職員証をタッチすると内部業務画面に切り替わります。|刷工作证即可进入内部工作界面。
사원증 파장 확인…|Verifying badge signature…|職員証の波長を確認中…|正在核验工作证波长…
직원 채널 연결…|Connecting to staff network…|職員ネットワークに接続中…|正在连接职员网络…
열람 권한 승인|Access granted|閲覧権限を承認|已授予查阅权限
직원 채널에 접속했습니다.|Connected to staff network.|職員ネットワークに接続しました。|已接入职员网络。
사내 통합망 연결|Internal network online|内部ネットワーク接続中|内部网络已连接
접속 로그 ↗|Activity log ↗|操作ログ ↗|活动日志 ↗
접속·활동 로그|Session activity log|接続・操作ログ|会话活动日志
기록 내보내기 ↓|Export log ↓|ログを書き出す ↓|导出日志 ↓
개인정보|Privacy|プライバシー|隐私
접속 대기실|Connection lobby|接続待機室|接入大厅
모션 ON|Motion ON|モーション ON|动画 ON
모션 OFF|Motion OFF|モーション OFF|动画 OFF
라이트모드로 전환|Switch to light mode|ライトモードへ|切换浅色模式
다크모드로 전환|Switch to dark mode|ダークモードへ|切换深色模式
PUBLIC / 공개 열람|PUBLIC / Visitor access|PUBLIC / 一般閲覧|PUBLIC / 公开查阅
INTERNAL / 직원 열람|INTERNAL / Staff access|INTERNAL / 職員閲覧|INTERNAL / 职员查阅
통합 관제 현황|Operations overview|統合管制状況|综合管制概况
국가 각성자 통합관리청 · 서울권 운영 정보|SGIA · Seoul regional operations|SGIA・ソウル圏運用情報|SGIA · 首尔地区运行信息
게이트 관측망|Gate surveillance|ゲート観測網|门扉观测网络
관측 신호|Observed signals|観測信号|观测信号
A급 경계|Class A alert|A級警戒|A级警戒
서울권 재정렬 ↻|Reset Seoul view ↻|ソウル圏に戻る ↻|重置首尔视图 ↻
관측 중인 게이트|Gates under observation|観測中のゲート|正在观测的门扉
기록 ↗|Archive ↗|記録 ↗|档案 ↗
등급별 미해결 게이트 분포|Open gates by class|等級別・未処理ゲート|未处理门扉等级分布
부서 운용 현황|Department activity|部署の稼働状況|部门运行状态
서울 기상 관측|Seoul weather|ソウルの気象観測|首尔天气观测
기상 수신 중|Receiving weather data|気象データ受信中|正在接收天气数据
기상 연결 대기|Waiting for weather data|気象データ待機中|等待天气数据
서울 / 현재 관측|Seoul / Current conditions|ソウル / 現在の観測|首尔 / 当前观测
시간별 기온 자료 수신 대기|Waiting for hourly temperatures|時間別気温データ待機中|等待逐小时气温数据
맑음|Clear|晴れ|晴
구름|Cloudy|曇り|多云
안개|Fog|霧|雾
뇌우|Thunderstorms|雷雨|雷雨
눈|Snow|雪|雪
비|Rain|雨|雨
본부 표준 시각|Headquarters standard time|本部標準時刻|总部标准时间
관제 브리핑|Operations briefing|管制ブリーフィング|管制简报
새 연락 수신 ↻|Receive update ↻|新着連絡を受信 ↻|接收新消息 ↻
수신|Received|受信済み|已接收
각성자 등록증 ↗|Awakener registration ↗|覚醒者登録証 ↗|觉醒者登记证 ↗
괴물 관리 기록 ↗|Entity record ↗|怪物管理記録 ↗|怪物管理档案 ↗
팀 프로필 ↗|Unit profile ↗|チームプロフィール ↗|团队资料 ↗
오늘의 부서 일정|Today's duty schedule|本日の部署スケジュール|今日部门日程
부서 브리핑|Department briefing|部署ブリーフィング|部门简报
소속 요원|Assigned personnel|所属隊員|所属干员
크루 구성원|Crew members|クルーメンバー|组合成员
클릭하여 프로필 열람 · 좌우로 밀어 회전|Click for profile · Swipe sideways to rotate|クリックで詳細・左右にスワイプで回転|点击查看资料 · 左右滑动翻转
업무 채널|Work channel|業務チャンネル|工作频道
업무 채널 최소화|Minimize channels|チャンネルを最小化|最小化频道
메시지 보내기|Send message|メッセージを送信|发送消息
전송|Send|送信|发送
나|You|自分|我
기상 · 기본 점검|Wake-up & checks|起床・基本点検|起床与基础检查
아침 식사|Breakfast|朝食|早餐
전투 · 능력 제어 훈련|Combat & ability training|戦闘・能力制御訓練|战斗与能力控制训练
외부 임무 · 출동 대기|Field duty & standby|外勤・出動待機|外勤与出动待命
점심 식사|Lunch|昼食|午餐
감각 안정 검사|Sensory stability assessment|感覚安定検査|感官稳定检查
저녁 식사|Dinner|夕食|晚餐
타겟 정보 브리핑|Target briefing|対象情報ブリーフィング|目标情报简报
정보 조사 · 외근|Research & fieldwork|情報調査・外勤|情报调查与外勤
추적 · 대상 접촉|Tracking & contact|追跡・対象との接触|追踪与接触目标
일일 보고서 작성|Daily reports|日報作成|编写日报
교육 · 사회 적응|Education & social adjustment|教育・社会適応|教育与社会适应
팬 소통 · 개인 스케줄|Fan engagement & solo schedules|ファン交流・個別スケジュール|粉丝互动与个人行程
업무 외 시간|Off duty|勤務時間外|非工作时间
취침|Rest hours|就寝|就寝
자유시간|Personal time|自由時間|自由时间
비상 출동|Emergency deployment|緊急出動|紧急出动
비상 출동 종료|End emergency deployment|緊急出動を終了|结束紧急出动
신원 비공개|Identity protected|身元非公開|身份保密
제한 열람 · 상세 정보 비공개|Restricted personnel file|詳細情報は閲覧制限中|详细资料限制查阅
직원 열람|Staff access|職員閲覧|职员查阅
개인 식별 정보는 직원 채널에서 열람하십시오.|Personnel details require staff access.|個人情報は職員チャンネルで閲覧してください。|请通过职员频道查阅个人资料。
소속|Affiliation|所属|所属
등급|Class|等級|等级
나이|Age|年齢|年龄
역할|Role|役割|职责
위치|Location|場所|位置
능력|Ability|能力|能力
외형|Appearance|外見|外貌
관찰 기록|Observations|観察記録|观察记录
캐릭터 접속 ↗|Open character ↗|キャラクターへ ↗|前往角色 ↗
과거 기록 이미지|Historical photographs|過去の記録画像|历史档案图片
비콘|비콘 · BEACON|비콘 · BEACON|비콘 · BEACON
오리진|오리진 · ORIGIN|오리진 · ORIGIN|오리진 · ORIGIN
실드|실드 · SHIELD|실드 · SHIELD|실드 · SHIELD
럭키트릭|LUCKY TRICK|럭키트릭 · LUCKY TRICK|럭키트릭 · LUCKY TRICK
옵시더스|OBSIDUS|옵시더스 · OBSIDUS|옵시더스 · OBSIDUS
중앙 통제 본부|Central command|中央統制本部|中央管制总部
센티넬 관리국|Sentinel administration|センチネル管理局|哨兵管理局
가이드 관리국|Guide administration|ガイド管理局|向导管理局
일반 행정·대외 협력|Administration & external affairs|一般行政・対外協力|行政与对外合作
직원 열람 채널|Staff access channel|職員閲覧チャンネル|职员查阅频道
신고 수신 채널|Incident receiver|通報受信チャンネル|报案接收频道
수신 주파수|Receiver frequency|受信周波数|接收频率
수신 양호|Signal locked|受信良好|信号稳定
신호 불안정|Signal unstable|受信不安定|信号不稳定
수신음 OFF|Audio OFF|受信音 OFF|接收音 OFF
수신음 ON|Audio ON|受信音 ON|接收音 ON
유형|Type|種類|类型
처리|Status|処理状況|状态
전체|All|すべて|全部
처리 대기|Open|対応待ち|待处理
종결|Closed|終結|已结案
신고서 작성 ＋|File a report ＋|通報書を作成 ＋|填写报案 ＋
수신 갱신 ↻|Refresh receiver ↻|受信を更新 ↻|刷新接收 ↻
접수|Received|受理|已受理
미해결|Open|未解決|未解决
← 이전|← Previous|← 前へ|← 上一页
다음 →|Next →|次へ →|下一页 →
다시 열기|Reopen|再開|重新开启
종결 승인 ↗|Approve closure ↗|終結を承認 ↗|批准结案 ↗
해당 기록이 없습니다.|No matching records.|該当する記録はありません。|没有符合条件的档案。
게이트|Gate|ゲート|门扉
괴물|Entity|怪物|怪物
사건 발생|Incident|事件|事件
미등록 각성자|Unregistered awakener|未登録覚醒者|未登记觉醒者
테러|Terror incident|テロ|恐怖袭击
신고자|Reported by|通報者|报案人
발생 위치|Incident location|発生場所|事发地点
구역|Zone|区域|区域
지원 요청 팀|Requested unit|応援要請先|请求支援部门
필요 인원|Personnel required|必要人数|所需人数
추가 요청사항|Additional requests|追加要請|其他请求
상황 설명|Situation report|状況説明|情况说明
위험 등급|Threat class|危険度|危险等级
신고 접수|Submit report|通報を送信|提交报案
접수 시각|Received at|受理日時|受理时间
발생 시각|Occurred at|発生日時|发生时间
확인 · 경보 해제|Acknowledge & dismiss|確認・警報解除|确认并解除警报
현장 지원 요청|Field support requested|現場支援要請|请求现场支援
동선 추적|Movement tracking|移動経路の追跡|行动轨迹追踪
추적 일시정지|Pause tracking|追跡を一時停止|暂停追踪
추적 재개|Resume tracking|追跡を再開|恢复追踪
신호 재탐색 ↻|Scan for signal ↻|信号を再探索 ↻|重新扫描信号 ↻
감청·침입 로그 열람 ↗|Open interception log ↗|傍受・侵入ログを閲覧 ↗|查阅监听与入侵日志 ↗
발화 동기화|Speech synchronization|発話同期|言语同步
주요 위험|Primary threat|主な危険|主要危险
대응 원칙|Response protocol|対応方針|应对原则
단독 접촉 금지 · 교차 검증|No solo contact · Cross-check all reports|単独接触禁止・情報を相互検証|禁止单独接触 · 交叉核验情报
청사 단면도|Building section|庁舎断面図|大楼剖面图
부서 배치|Department locations|部署配置|部门分布
접근 제한 시설|Restricted facility|立入制限施設|限制访问设施
제한 시설|Restricted|制限施設|限制区域
직원 채널에서 시설 분류를 열람할 수 있습니다.|Switch to staff access to view facility details.|職員チャンネルで施設情報を閲覧できます。|切换到职员频道以查阅设施详情。
부서 페이지 ↗|Department page ↗|部署ページ ↗|部门页面 ↗
럭키트릭 팬 커뮤니티|LUCKY TRICK fan board|LUCKY TRICK ファン掲示板|LUCKY TRICK 粉丝社区
옵시더스 팬 커뮤니티|OBSIDUS fan board|OBSIDUS ファン掲示板|OBSIDUS 粉丝社区
SGIA 익명 게시판|SGIA anonymous board|SGIA 匿名掲示板|SGIA 匿名版
SGIA 사내 게시판 ◇|SGIA staff board ◇|SGIA 社内掲示板 ◇|SGIA 内部论坛 ◇
SGIA 직원 채널|SGIA staff channel|SGIA 職員チャンネル|SGIA 职员频道
글쓰기 ＋|New post ＋|投稿する ＋|发帖 ＋
검색|Search|検索|搜索
제목·내용 검색|Search titles and content|タイトル・本文を検索|搜索标题与内容
공유 데이터베이스 연결 중…|Connecting to community…|掲示板に接続中…|正在连接社区…
채널 연결됨 · 실시간 게시판|Channel online · Community board|接続済み・共有掲示板|频道已连接 · 社区论坛
기록을 불러오는 중…|Loading records…|記録を読み込み中…|正在加载档案…
아직 등록된 글이 없습니다. 첫 이야기를 남겨 보세요.|No posts yet. Start the conversation.|投稿はまだありません。最初の話題をどうぞ。|还没有帖子，来开启第一段话题吧。
게시판 이용 안내|Board guidelines|掲示板のご案内|社区使用说明
제목|Title|タイトル|标题
닉네임|Display name|ニックネーム|昵称
비밀번호 · 숫자 4자리|Password · 4 digits|パスワード・数字4桁|密码 · 4位数字
비밀번호 · 4자리|Password · 4 digits|パスワード・4桁|密码 · 4位数字
내용|Content|本文|内容
등록|Publish|投稿|发布
댓글 등록|Post comment|コメントを投稿|发表评论
댓글|Comments|コメント|评论
수정|Edit|編集|编辑
삭제|Delete|削除|删除
좋아요|Like|いいね|赞
좋아요 취소|Unlike|いいねを取り消す|取消点赞
작성 비밀번호|Author password|投稿時のパスワード|发帖密码
작성 기록 삭제|Delete entry|投稿を削除|删除内容
작성 기록 수정|Edit entry|投稿を編集|编辑内容
삭제 확인|Confirm deletion|削除を確認|确认删除
수정 저장|Save changes|変更を保存|保存修改
직접 입력|Custom|直接入力|自定义
익명|Anonymous|匿名|匿名
일반 행정|Administration|一般行政|行政部门
비밀번호는 분실 시 복구할 수 없습니다.|Lost passwords cannot be recovered.|パスワードを忘れた場合は復元できません。|密码丢失后无法找回。
게시물이 저장되었습니다.|Post published.|投稿を保存しました。|帖子已发布。
댓글을 저장했습니다.|Comment published.|コメントを保存しました。|评论已发布。
삭제했습니다.|Deleted.|削除しました。|已删除。
수정했습니다.|Updated.|更新しました。|已更新。
수정됨|Edited|編集済み|已编辑
세계관|World|世界観|世界观
각성관|Headquarters|覚醒館|觉醒馆
각성자|Awakeners|覚醒者|觉醒者
헌터|Hunters|ハンター|猎人
센티넬|Sentinels|センチネル|哨兵
가이드·가이딩|Guides & guiding|ガイド・ガイディング|向导与引导
매칭|Compatibility|マッチング|匹配
페어|Pairs|ペア|配对
각인|Imprinting|刻印|烙印
제3의 각성자|Third awakeners|第三の覚醒者|第三类觉醒者
팀별 안내|Teams|チーム案内|团队指南
등급 체계|Classification|等級体系|等级体系
명령어|Commands|コマンド|指令
용어·내용 검색|Search terms and content|用語・内容を検索|搜索术语与内容
성수동 폐공장|Seongsu abandoned factory|聖水洞の廃工場|圣水洞废弃工厂
강남 지하 연결로|Gangnam underground passage|江南地下連絡通路|江南地下通道
용산 철도 구역|Yongsan rail zone|龍山鉄道区域|龙山铁路区域
마포 한강변|Mapo riverside|麻浦・漢江沿い|麻浦汉江边
종로 상업 지구|Jongno commercial district|鍾路商業地区|钟路商业区
서초 연구 시설|Seocho research facility|瑞草研究施設|瑞草研究设施
송파 물류 구역|Songpa logistics zone|松坡物流区域|松坡物流区
은평 산림 경계|Eunpyeong forest boundary|恩平森林境界|恩平森林边界
특수목적팀|Special operations|特殊目的チーム|特种任务组
추적관리팀|Tracking & registration|追跡管理チーム|追踪管理组
전술대응팀|Tactical response|戦術対応チーム|战术应对组
여성 헌터 크루|Female hunter crew|女性ハンタークルー|女子猎人组合
남성 헌터 크루|Male hunter crew|男性ハンタークルー|男子猎人组合
`;
const dictionary = new Map(
  copy
    .trim()
    .split('\n')
    .map((row) => {
      const [ko, en, ja, zh] = row.split('|');
      return [ko, { ko, en, ja, zh }];
    }),
);
export function registerCopy(ko, en, ja, zh) {
  dictionary.set(ko, { ko, en, ja, zh });
}
export function tr(value) {
  if (current === 'ko') return value;
  if (dictionary.has(value)) return dictionary.get(value)[current];
  if (value.endsWith(' ↗') && dictionary.has(value.slice(0, -2)))
    return tr(value.slice(0, -2)) + ' ↗';
  const composition = value.match(/^(글쓰기|댓글) · (.+)$/);
  if (composition)
    return { en: 'New post', ja: '投稿', zh: '发帖' }[current] + ' · ' + tr(composition[2]);
  if (/^[A-D] \/ /.test(value)) return value.slice(0, 4) + tr(value.slice(4));
  if (/^습도 /.test(value))
    return value
      .replace('습도', { en: 'Humidity', ja: '湿度', zh: '湿度' }[current])
      .replace('바람', { en: 'Wind', ja: '風速', zh: '风速' }[current]);
  if (/KST 기준$/.test(value)) return value.replace(' 기준', '');
  const channel = value.match(/^(.+) 업무 채널$/);
  if (channel) return tr(channel[1]) + ' / ' + tr('업무 채널');
  if (/^SGIA MESSENGER/.test(value))
    return value.replace('명', { en: ' members', ja: '人', zh: '人' }[current]);
  if (/^접수 \d/.test(value)) return value.replace('접수', tr('접수'));
  if (/^\d+ \/ \d+ · \d+건$/.test(value))
    return value.replace('건', { en: ' records', ja: '件', zh: '条' }[current]);
  if (value.includes('INTEGRITY WARNING /'))
    return value.replace(
      '신호 교차 검증 중',
      { en: 'Cross-checking signal', ja: '信号を相互検証中', zh: '正在交叉核验信号' }[current],
    );
  if (value.includes(' · KST 일별 중복 제외'))
    return value
      .replace('오늘', { en: 'Today', ja: '本日', zh: '今日' }[current])
      .replace(
        'KST 일별 중복 제외',
        { en: 'Unique per KST day', ja: 'KST日別重複除外', zh: '按KST日期去重' }[current],
      );
  if (/^댓글 \d+$/.test(value)) return tr('댓글') + ' ' + value.split(' ')[1];
  if (/^모션 /.test(value))
    return value.replace('모션', { en: 'Motion', ja: 'モーション', zh: '动画' }[current]);
  if (/^(오늘|누적) /.test(value))
    return value
      .replace('오늘', { en: 'Today', ja: '本日', zh: '今日' }[current])
      .replace('누적', { en: 'Total', ja: '累計', zh: '累计' }[current]);
  if (/^\d+세$/.test(value))
    return value.replace('세', { en: ' years', ja: '歳', zh: '岁' }[current]);
  return value;
}
export function personName(c) {
  return current === 'en' ? c.code : c.name.split(' · ')[0];
}
const originals = new WeakMap();
function textNode(n) {
  const now = n.nodeValue,
    prev = originals.get(n);
  const original = prev && now === prev.output ? prev.original : now;
  const core = original.trim();
  const translated = tr(core);
  const out = original.replace(core, translated);
  if (now !== out) n.nodeValue = out;
  originals.set(n, { original, output: out });
}
export function translateDOM(root = document.body) {
  if (!root) return;
  root.querySelectorAll?.('option:not([value])').forEach((o) => (o.value = o.textContent));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.parentElement?.closest('script,style,[data-user-content],textarea,[data-no-translate]')
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(textNode);
  root.querySelectorAll?.('[placeholder],[aria-label],[title]').forEach((el) => {
    for (const attr of ['placeholder', 'aria-label', 'title']) {
      if (!el.hasAttribute(attr)) continue;
      const key = 'i18n' + attr.replace('-', '');
      const original = el.dataset[key] || el.getAttribute(attr);
      el.dataset[key] = original;
      el.setAttribute(attr, tr(original));
    }
  });
  document
    .querySelectorAll('[data-lang]')
    .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === current)));
}
export function initI18n() {
  setLanguage(current);
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      observer.disconnect();
      translateDOM();
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      queued = false;
    });
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  translateDOM();
}
