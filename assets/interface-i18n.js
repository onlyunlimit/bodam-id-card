import { registerCopy } from './i18n.js';
const rows = `본문 바로가기|Skip to content|本文へ移動|跳转至正文
비콘|BEACON|비콘 · BEACON|비콘 · BEACON
오리진|ORIGIN|오리진 · ORIGIN|오리진 · ORIGIN
실드|SHIELD|실드 · SHIELD|실드 · SHIELD
오르페|ORPÉ|오르페 · ORPÉ|오르페 · ORPÉ
에이지|AZ|에이지 · AZ|에이지 · AZ
집계 연결 대기|Waiting for visitor count|訪問集計を接続中|等待访问统计
© onlyunlimit · SGIA는 창작 세계관을 기반으로 한 가상의 서비스입니다.|© onlyunlimit · SGIA is a fictional service set in an original world.|© onlyunlimit · SGIAは創作世界に基づく架空のサービスです。|© onlyunlimit · SGIA是基于原创世界观的虚构服务。
임무와 전문성에 따라 구성된 국가 각성자 통합관리청의 현장 조직.|SGIA field divisions, organized by mission and expertise.|任務と専門性に応じて編成されたSGIAの現場組織。|按任务与专长编制的SGIA现场部门。
각성관과 기획사가 함께 운용하는 공식 헌터 크루.|Official hunter crews operated jointly by SGIA and their agencies.|覚醒館と事務所が共同運用する公式ハンタークルー。|由觉醒馆与经纪机构共同运营的官方猎人组合。
오리진 게이트 생환자 4명으로 이루어진 특수목적팀. 제3의 각성자를 관리하며 변종 게이트에 대응합니다.|A special operations team of four gate survivors. Manages third awakeners and responds to variant gates.|ゲート生還者4名による特殊目的チーム。第三の覚醒者を管理し、変異ゲートに対応します。|由四名门扉生还者组成的特种任务组，管理第三类觉醒者并应对变异门扉。
미등록 각성자의 추적, 접촉, 등록과 신병 확보를 담당합니다. 가이드 중심의 팀에 현장 보호 전력을 배치합니다.|Tracks, contacts, registers and secures unregistered awakeners. Field protection supports a guide-led team.|未登録覚醒者の追跡・接触・登録・身柄確保を担当。ガイド中心のチームに現場護衛戦力を配置します。|负责未登记觉醒者的追踪、接触、登记与控制，为以向导为核心的团队配备现场护卫力量。
원혈이 이끄는 최상위 전투팀. 게이트 대응과 함께 괴물 갱생 프로젝트의 보호 및 사회 적응 교육을 수행합니다.|WONHYEOL leads this elite combat team. Alongside gate response, it provides protection and social education for the entity rehabilitation project.|原血が率いる最上位戦闘チーム。ゲート対応に加え、怪物更生プロジェクトの保護と社会適応教育を行います。|由WONHYEOL带领的顶尖战斗组，在应对门扉的同时，为怪物改造项目提供保护与社会适应教育。
재인, 단조, 운새, 유진으로 구성된 여성 헌터 크루. 담당 연구원 케니와 함께 전투 및 대중 소통 활동을 수행합니다.|JAEIN, DANJO, UNSAE and YUJIN form this female hunter crew. Researcher Kenny supports their combat and public engagement.|재인・단조・운새・유진による女性ハンタークルー。担当研究員ケニーとともに戦闘と広報活動を行います。|由JAEIN、DANJO、UNSAE和YUJIN组成的女子猎人组合，与负责研究员Kenny共同开展战斗及公众交流活动。
차빈, 한호, 모현, 유환으로 구성된 남성 헌터 크루. 담당 연구원 에반이 장비 개발과 각성 상태 관리를 지원합니다.|CHABIN, HANHO, MOHYUN and YUHWAN form this male hunter crew. Researcher Evan supports equipment development and awakening management.|チャビン・ハンホ・モヒョン・ユファンによる男性ハンタークルー。担当研究員エヴァンが装備開発と覚醒状態の管理を支援します。|由CHABIN、HANHO、MOHYUN和YUHWAN组成的男子猎人组合，研究员Evan协助装备研发与觉醒状态管理。
B4 · 오리진 생활 구역|B4 · ORIGIN quarters|B4・オリジン生活区域|B4 · ORIGIN生活区
2F · 추적관리팀 사무실|2F · Tracking division office|2F・追跡管理チーム事務室|2F · 追踪管理组办公室
각성관 · 전술대응팀 (전용 층 미지정)|Headquarters · Tactical response (floor unassigned)|覚醒館・戦術対応チーム（専用階未指定）|觉醒馆 · 战术应对组（未指定专属楼层）
앨리시안 기획사 · 각성관 생활|Elysian Agency · Headquarters residence|エリシアン事務所・覚醒館居住|Elysian经纪机构 · 觉醒馆居住
헌터윈드 기획사 · 각성관 생활|Hunterwind Agency · Headquarters residence|ハンターウィンド事務所・覚醒館居住|Hunterwind经纪机构 · 觉醒馆居住
팬 커뮤니티 방문하기 ↗|Visit the fan community ↗|ファン掲示板へ ↗|前往粉丝社区 ↗
정책 수립 · 매칭·등급 기준 · 전투 투입 승인 · 극비 프로젝트 관리|Policy · Compatibility and grading · Deployment approval · Classified projects|政策立案・適合率と等級基準・戦闘投入承認・極秘計画管理|政策制定 · 匹配与等级标准 · 战斗部署审批 · 绝密项目管理
청사 내 부서 위치 확인 ↗|Find departments in the building ↗|庁舎内の部署位置を確認 ↗|查看楼内部门位置 ↗
비상 출동은 시간표와 별도로 표시합니다.|Emergency deployments override the regular schedule.|緊急出動は通常スケジュールと別に表示します。|紧急出动独立于常规日程显示。
비상 출동은 시간표와 별도로 표시합니다. 보고 일정은 18:30까지이며 현장 상황에 따라 퇴근이 달라질 수 있습니다.|Emergency deployments override the schedule. Reports run until 18:30; field conditions may extend duty.|緊急出動は別途表示。報告業務は18:30までですが、現場状況により退勤時刻が変わる場合があります。|紧急出动另行显示。报告工作至18:30，实际下班时间可能随现场情况调整。
지상 8층 · 지하 10층의 통합 청사. 층을 선택해 시설과 배치 부서를 확인하십시오.|Eight floors above ground, ten below. Select a floor to view facilities and assigned departments.|地上8階・地下10階の統合庁舎。階を選択すると施設と配置部署を確認できます。|地上8层、地下10层的综合大楼。选择楼层查看设施与部门分布。
2F · 추적관리 사무실 ↗|2F · Tracking office ↗|2F・追跡管理事務室 ↗|2F · 追踪管理办公室 ↗
B4 생활 / B7 기록 ↗|B4 quarters / B7 records ↗|B4 生活 / B7 記録 ↗|B4 生活 / B7 档案 ↗
각성관 · 전용 층 미지정 ↗|Headquarters · No dedicated floor ↗|覚醒館・専用階未指定 ↗|觉醒馆 · 未指定专属楼层 ↗
각성관 생활 · 전용 층 미지정 ↗|HQ residence · No dedicated floor ↗|覚醒館居住・専用階未指定 ↗|觉醒馆居住 · 未指定专属楼层 ↗
헌터 크루|Hunter crews|ハンタークルー|猎人组合
실드와 크루의 전용 층은 공개 설정에 지정되지 않았습니다. 훈련·행정 시설은 용도별로 표시합니다.|SHIELD and hunter crews have no assigned floor in the published records. Training and administrative facilities are shown by function.|公開記録ではシールドとクルーの専用階は未指定です。訓練・行政施設は用途別に表示します。|公开资料未指定SHIELD及组合的专属楼层，训练与行政设施按用途标示。
비콘 사무실 · 각성자 등록|BEACON office · Awakener registration|ビコン事務室・覚醒者登録|BEACON办公室 · 觉醒者登记
신고 접수 · 현장 대응 · 종결 기록|Reports · Field response · Case closure|通報受理・現場対応・終結記録|报案受理 · 现场应对 · 结案记录
단말 기록은 현재 브라우저에 보관됩니다.|Terminal records are saved in this browser.|端末記録はこのブラウザーに保存されます。|终端记录保存在当前浏览器中。
비인가 조직 · 관측 자료의 외부 반출을 금합니다.|Unauthorized organization · Intelligence must not leave this network.|非認可組織・観測資料の外部持ち出しを禁じます。|未经许可的组织 · 禁止对外传递观测资料。
극단주의 범죄 집단 ORPÉ 소속 미등록 각성자.|Unregistered awakener affiliated with extremist organization ORPÉ.|過激派犯罪組織ORPÉ所属の未登録覚醒者。|隶属极端犯罪组织ORPÉ的未登记觉醒者。
증언의 일치가 정보의 진실성을 보증하지 않습니다.|Matching testimonies do not guarantee reliable intelligence.|証言の一致は情報の真実性を保証しません。|证词一致不代表情报真实。
추정 영향 반경 약 2km|Estimated influence radius: 2 km|推定影響半径：約2km|估计影响半径约2公里
불법 단체의 장비 탈취 정황 발견. 관련 동선 조사.|Suspected equipment theft by an illegal organization. Investigating movements.|違法組織による装備強奪の疑い。関連動線を調査中。|发现非法组织抢夺装备的迹象，正在调查行动路线。
민간 지역에서 미등록 파장 포착. 담당 요원 배정 대기.|Unregistered wavelength detected in a civilian area. Awaiting agent assignment.|民間区域で未登録波長を捕捉。担当隊員の割り当て待ち。|在民用区域捕捉到未登记波长，等待分配负责干员。
각성 파장 급상승으로 시설 일부 정전. 현장 안전 점검 요청.|Awakening surge caused a partial power failure. Site safety inspection requested.|覚醒波長の急上昇で施設が一部停電。現場安全点検を要請。|觉醒波长骤升导致设施局部停电，请求现场安全检查。
야간 감지기에 비정상 생체 반응 기록. 인근 순찰 강화.|Night sensors recorded abnormal biological activity. Increasing nearby patrols.|夜間センサーが異常な生体反応を記録。周辺巡回を強化。|夜间传感器记录到异常生命反应，已加强周边巡逻。
공간 균열과 전자기 이상 감지. 현장 통제선 설치 요청.|Spatial rift and electromagnetic anomalies detected. Establish a cordon.|空間亀裂と電磁異常を検知。現場の規制線設置を要請。|检测到空间裂隙与电磁异常，请求建立现场警戒线。
마력 증폭 장치 설치 의심 신고. 현장 봉쇄 및 제거반 요청.|Suspected mana amplifier reported. Cordon and disposal team requested.|魔力増幅装置の設置疑惑を通報。現場封鎖と撤去班を要請。|接报疑似安装魔力增幅装置，请求封锁现场并派遣拆除组。
미확인 차원 경계 형성. 인근 주민 대피 및 등급 측정 진행.|Unknown dimensional boundary forming. Evacuation and classification underway.|未確認の次元境界が形成。周辺住民の避難と等級測定を実施中。|未确认的维度边界正在形成，正在疏散周边居民并测定等级。
경계 구역 밖에서 미확인 생명체 목격. 추적 장비 배치.|Unidentified life form sighted beyond the perimeter. Tracking equipment deployed.|境界外で未確認生物を目撃。追跡装備を配置。|在边界外目击不明生物，已部署追踪设备。
관리 시설 내 경보 오작동. 잔류 마력과 장비 손상 조사.|Facility alarm malfunction. Investigating residual mana and equipment damage.|管理施設内で警報が誤作動。残留魔力と装備損傷を調査。|管理设施内警报误触发，正在调查残留魔力与设备损坏。
정기 검사 미응답자에게 각성 반응 확인. 비콘 접촉 요청.|Awakening response confirmed in a screening absentee. BEACON contact requested.|定期検査未応答者に覚醒反応。ビコンに接触を要請。|在未回应定期检查者身上确认觉醒反应，请求BEACON接触。
감청 채널에서 동일 발화가 중복 수신됨.|Duplicate speech received on the interception channel.|傍受チャンネルで同一発話を重複受信。|监听频道重复接收到相同言语。
비인가 장비 거래 정황. 목격자 진술 대조 중.|Suspected unauthorized equipment trade. Cross-checking witness accounts.|非認可装備の取引疑惑。目撃証言を照合中。|发现未经许可的装备交易迹象，正在核对目击证词。
CCTV 시각과 출입 기록 불일치. 흔적 복원 중.|CCTV timestamps conflict with access logs. Reconstructing the trail.|監視映像の時刻と入退室記録が不一致。痕跡を復元中。|监控时间与出入记录不符，正在复原踪迹。
대상 파장 소실. 2km 반경 접촉을 제한함.|Subject wavelength lost. Restrict contact within 2 km.|対象波長が消失。半径2km内の接触を制限。|目标波长消失，限制半径2公里内的接触。
응원과 일상을 나누는 공간. 닉네임으로 글을 남기고 작성 비밀번호로 관리하세요.|Share your support and everyday stories. Post under a display name and manage entries with your author password.|応援や日常を分かち合う場所。ニックネームで投稿し、投稿時のパスワードで管理できます。|分享应援与日常，以昵称发帖，用发帖密码管理内容。
사내 게시판을 열려면 직원 채널에 접속하세요.|Connect to the staff channel to open this board.|職員チャンネルに接続すると社内掲示板を開けます。|接入职员频道即可打开内部论坛。
게시물 운영과 악성 작성 대응을 위한 IP 암호화 보관(30일), 관리자 열람에 동의합니다.|I consent to encrypted IP storage for 30 days and owner access for abuse moderation.|不正投稿への対応のため、IPの暗号化保存（30日間）と管理者による閲覧に同意します。|我同意为处理恶意内容加密保存IP地址30天，并允许管理员查阅。
국가 각성자 통합관리청의 제도·분류·용어와 세계관 이용 명령어|SGIA systems, classifications, terminology and character-chat commands|SGIAの制度・分類・用語とキャラクター会話用コマンド|SGIA制度、分类、术语与角色聊天指令
안내서 검색|Search handbook|ガイドを検索|搜索指南
팀별 운용|Department operations|チーム別運用|团队运作
각성관 구조도 열람 ↗|Open headquarters plans ↗|覚醒館の構造図を閲覧 ↗|查阅觉醒馆结构图 ↗
부서별 업무·시간표 열람 ↗|View duties and schedules ↗|部署別業務・時間割を閲覧 ↗|查阅部门职责与日程 ↗
70% · 안정적 파트너|70% · Stable partnership|70%・安定したパートナー|70% · 稳定搭档
90% · 희귀 고적합|90% · Rare high compatibility|90%・希少な高適合|90% · 罕见高适配
100% · 이론상 존재 불명|100% · Unconfirmed|100%・存在未確認|100% · 存在尚未确认
게이트 대응|Gate response|ゲート対応|门扉应对
헌터 관리|Hunter oversight|ハンター管理|猎人管理
인류 문명에 직접적 위협 · 세계 최고 전력 대응|Threat to civilization · Highest global response|人類文明への直接的脅威・世界最高戦力で対応|直接威胁人类文明 · 全球最高战力应对
재난 병기 수준 · 이동·생활 전면 통제|Strategic disaster-level asset · Full movement and lifestyle control|災害兵器級・移動と生活を全面統制|灾难兵器级 · 全面管制行动与生活
최정예 헌터 · 국제 협력|Elite hunters · International cooperation|最精鋭ハンター・国際協力|顶尖猎人 · 国际合作
고위험 전투 자산 · 가이드 필수|High-risk combat asset · Guide required|高危険度戦闘資産・ガイド必須|高危战斗资产 · 必须配备向导
고급 헌터·특수 장비 · 주변 봉쇄|Advanced hunters and equipment · Area lockdown|上級ハンター・特殊装備・周辺封鎖|高级猎人与特殊装备 · 周边封锁
전투 투입 · 전속 가이드 권장|Combat deployment · Dedicated guide recommended|戦闘投入・専属ガイド推奨|投入战斗 · 建议配备专属向导
숙련 헌터팀 · 전용 시설 관리|Experienced hunter teams · Dedicated facilities|熟練ハンターチーム・専用施設管理|熟练猎人小队 · 专用设施管理
비전투 임무 · 비상시 가이딩|Noncombat duties · Guiding in emergencies|非戦闘任務・緊急時ガイディング|非战斗任务 · 紧急时引导
일반 헌터팀 관리 가능|Standard hunter team response|一般ハンターチームで管理可能|普通猎人小队可处理
미세 감각 각성 · 민간 생활·정기 검진|Minor sensory awakening · Civilian life and screening|微細な感覚覚醒・民間生活と定期検診|轻微感官觉醒 · 平民生活与定期体检
훈련용 · 24–48시간 내 자연 소멸|Training level · Dissipates in 24–48 hours|訓練用・24〜48時間以内に自然消滅|训练用 · 24至48小时内自然消散
일반 등급 언급은 있으나 상세 기준 미기재|Recognized grade; detailed criteria unpublished|等級の記載はあるが詳細基準は未記載|等级有记载，详细标准未公布
개별 인물의 SS·ERROR 표기는 원본 프로필의 별도 표기를 유지합니다.|Individual SS and ERROR designations follow the original personnel files.|人物ごとのSS・ERROR表記は原プロフィールの特記を維持しています。|个别人物的SS、ERROR标记沿用原始档案中的特殊分类。
캐릭터 대화창에서 사용하는 명령어입니다. 홈페이지에서는 복사만 수행합니다.|These commands are used in character chats. Click to copy them here.|キャラクターとの会話で使うコマンドです。このサイトではクリックでコピーできます。|这些指令用于角色聊天，点击即可在本站复制。
C급 게이트 출현과 대응 임무|Class C gate and response mission|C級ゲート出現と対応任務|C级门扉出现与应对任务
지정 인물 또는 팀의 단독 임무|Solo mission for a selected person or team|指定人物・チームの単独任務|指定人物或团队的独立任务
지정 센티넬의 폭주 상태|Selected sentinel enters a berserk state|指定センチネルの暴走状態|指定哨兵进入暴走状态
팀 단톡방 HTML 출력|Generate a team group-chat view|チームチャットをHTMLで出力|以HTML输出团队群聊
각성관 익명 커뮤니티|Headquarters anonymous community|覚醒館匿名コミュニティ|觉醒馆匿名社区
내용에 맞는 HTML 출력|Generate HTML for the requested content|内容に合ったHTMLを出力|根据内容生成HTML
새 에피소드를 텍스트로 출력|Generate a new episode as text|新しいエピソードをテキストで出力|以文本输出新篇章
새 에피소드를 HTML로 출력|Generate a new episode as HTML|新しいエピソードをHTMLで出力|以HTML输出新篇章
해당 인물에게 문자 전송|Send a text to the character|対象の人物にメッセージを送信|向对应人物发送短信
해당 인물의 단말기로 내용 전송|Send content to the character’s terminal|対象の端末に内容を送信|向对应人物的终端发送内容
복사 ↗|Copy ↗|コピー ↗|复制 ↗
여러 명령어를 혼합할 수 있습니다. /html을 함께 입력하면 HTML 출력 반영을 요청할 수 있습니다.|Combine commands as needed. Include /html to request an HTML response.|複数コマンドを組み合わせられます。/htmlを添えるとHTML形式の出力を依頼できます。|可组合多条指令，加入/html即可请求HTML格式输出。
명령어를 복사했습니다.|Command copied.|コマンドをコピーしました。|已复制指令。
검색 결과가 없습니다.|No results found.|検索結果がありません。|没有搜索结果。
접속하시겠습니까?|Establish connection?|接続しますか？|是否接入？
국가 각성자|Sentinel & Guide|国家覚醒者|国家觉醒者
통합관리청|Integrated Administration|統合管理庁|综合管理局
국가 각성자 통합관리청 정보서비스에 접속합니다.|Connect to the SGIA information network.|SGIA情報サービスに接続します。|接入SGIA信息服务网络。
통합 포털 접속|Enter the portal|統合ポータルに接続|进入综合门户
보안 채널 대기 · PUBLIC ACCESS|Secure channel ready · PUBLIC ACCESS|保安チャンネル待機 · PUBLIC ACCESS|安全频道待命 · PUBLIC ACCESS
연출 건너뛰기 →|Skip intro →|演出をスキップ →|跳过开场 →
접속음 ON|Connection sound ON|接続音 ON|连接音 ON
접속음 OFF|Connection sound OFF|接続音 OFF|连接音 OFF
CHANNEL 01 / 신호 확인 · 외부인 열람 권한 승인|CHANNEL 01 / Signal verified · Visitor access granted|CHANNEL 01 / 信号確認・一般閲覧権限を承認|CHANNEL 01 / 信号确认 · 已授予访客权限
`;
export function installInterfaceTranslations() {
  for (const row of rows.trim().split('\n')) registerCopy(...row.split('|'));
}
const additional = `민원·등록실|Public services & registration|民願・登録室|公众服务与登记室
미각성자 정기 검사는 매년 6월 시행됩니다. 등록 안내서를 확인하십시오.|Annual screening for unawakened citizens takes place in June. Consult the registration guide.|未覚醒者の定期検査は毎年6月に実施します。登録案内をご確認ください。|未觉醒者例行检查于每年6月进行，请查阅登记指南。
한강권 잔류 파장 관측을 유지합니다. 통제선 내 접근 제한을 확인하십시오.|Maintain residual-wave monitoring along the Han River. Observe cordon restrictions.|漢江圏の残留波長観測を継続。規制線内への立入制限を確認してください。|持续观测汉江区域残留波长，请确认警戒线内的进入限制。
비콘 상황실|BEACON control|ビコン状況室|BEACON情况室
실드 상황실|SHIELD control|シールド状況室|SHIELD情况室
오리진 상황실|ORIGIN control|オリジン状況室|ORIGIN情况室
미등록 각성자 접촉 전 신원 대조를 완료하십시오. 민원 기록은 별도 제출 바랍니다.|Complete identity checks before contacting unregistered awakeners. File civilian-contact reports separately.|未登録覚醒者との接触前に身元照合を完了してください。民願記録は別途提出してください。|接触未登记觉醒者前请完成身份核对，公众接触记录请另行提交。
보호 개체의 사회 적응 교육 결과를 갱신했습니다. 담당 요원 열람 바랍니다.|Social-adjustment reports for protected entities have been updated. Assigned agents should review them.|保護個体の社会適応教育結果を更新しました。担当隊員はご確認ください。|已更新受保护个体的社会适应教育结果，请负责干员查阅。
현장 장비에서 수집된 잔류 파장 분석 중입니다. 이상 신호는 별도 분류하십시오.|Analyzing residual waves collected by field equipment. Flag anomalous signals separately.|現場装備が収集した残留波長を分析中。異常信号は別途分類してください。|正在分析现场设备采集的残留波长，请将异常信号单独分类。
기상 연결 대기 · 재시도|Weather unavailable · Retry|気象データ待機・再試行|天气连接等待 · 重试
메시지 입력|Type a message|メッセージを入力|输入消息
팀에 메시지|Message your team|チームへのメッセージ|给团队发消息
부서 대화|Department conversation|部署の会話|部门对话
같은 네트워크 IP는 하루 한 번 집계합니다. 누적은 일별 방문 합계이며 실제 사람 수와 다를 수 있습니다.|One count per network each day. The total is daily visits, not a count of individual people.|同じネットワークは1日1回集計。累計は日別訪問数の合計で、実人数とは異なります。|同一网络每天计数一次，累计值为每日访问之和，并非实际人数。
STAFF-001 / 발급된 사원증|STAFF-001 / Issued identity badge|STAFF-001 / 発行済み職員証|STAFF-001 / 已签发工作证
본부 사원증 / 001|Headquarters ID / 001|本部職員証 / 001|总部工作证 / 001
신고 기록과 처리 업무는 직원 채널에서 열람할 수 있습니다.|Reports and response tools are available through the staff channel.|通報記録と対応業務は職員チャンネルで閲覧できます。|请通过职员频道查阅报案与处理工作。
SGIA 자동 관측망|SGIA automated surveillance|SGIA自動観測網|SGIA自动观测网络
서울권 / 현장 통제선|Seoul / Field cordon|ソウル圏 / 現場規制線|首尔地区 / 现场警戒线
현장 접근 전 파장 측정. 주민 통제선 확보.|Measure wavelengths before approach. Secure a civilian cordon.|接近前に波長測定。住民の規制線を確保。|接近现场前测量波长，建立居民警戒线。
신고서 작성|File an incident report|通報書を作成|填写报案
기록별 15분에 최대 5회 확인합니다.|Up to five attempts per record every 15 minutes.|記録ごとに15分間で最大5回確認できます。|每条记录每15分钟最多验证5次。
삭제하면 본문을 복구할 수 없습니다. 글 삭제 시 댓글도 함께 삭제됩니다.|Deleted content cannot be restored. Deleting a post also deletes its comments.|削除した本文は復元できません。投稿を削除するとコメントも削除されます。|删除后无法恢复正文，删除帖子时评论也会一并删除。
보안 확인이 만료되었습니다. 다시 시도해 주세요.|Verification expired. Please try again.|認証の有効期限が切れました。再試行してください。|安全验证已过期，请重试。
게시물이 없거나 숨김 처리되었습니다.|Post unavailable or hidden.|投稿が存在しないか、非表示にされています。|帖子不存在或已被隐藏。
공유 서버 연결 대기 · 잠시 후 새로고침해 주세요.|Server unavailable. Please refresh shortly.|サーバー接続待機中。しばらくして更新してください。|服务器连接等待中，请稍后刷新。
작성 비밀번호가 일치하지 않습니다.|Incorrect author password.|投稿時のパスワードと一致しません。|发帖密码不正确。
요청이 많습니다. 잠시 후 다시 시도해 주세요.|Too many requests. Please try again shortly.|リクエストが多すぎます。しばらくして再試行してください。|请求过多，请稍后重试。
보안 확인을 다시 완료해 주세요.|Please complete verification again.|もう一度認証を完了してください。|请重新完成安全验证。
`;
additional
  .trim()
  .split('\n')
  .forEach((r) => registerCopy(...r.split('|')));
