import { registerCopy } from './i18n.js';
const rows = `중앙 상황실|Operations center|中央状況室|中央情况室
지휘관실|Commander|指揮官室|指挥官室
승인 회의실|Approval chamber|承認会議室|审批会议室
통신실|Communications|通信室|通信室
보안 대기실|Secure waiting|保安待機室|安保候室
등급 심의실|Classification review|等級審議室|等级审议室
정책 회의실|Policy chamber|政策会議室|政策会议室
자료 검토실|Review room|資料検討室|资料审阅室
기준 기록실|Standards archive|基準記録室|标准档案室
위원 대기실|Panel lounge|委員控室|委员休息室
공개 연구실|Public research|公開研究室|公开研究室
협력 연구실|Joint research|共同研究室|合作研究室
시료 접수|Sample intake|試料受付|样本接收
분석실|Analysis lab|分析室|分析室
면담실|Interview room|面談室|面谈室
민원 지원|Public support|民願支援|公众服务
행정 사무실|Administration|行政事務室|行政办公室
대외 협력|External affairs|対外協力|对外合作
서류 보관|Document storage|書類保管|文件保管
회의실|Meeting room|会議室|会议室
보호 라운지|Protected lounge|保護ラウンジ|保护休息区
안정실 A|Stabilization A|安定室 A|稳定室 A
안정실 B|Stabilization B|安定室 B|稳定室 B
교육실|Classroom|教育室|教学室
상담실|Counseling|相談室|咨询室
배치 관리실|Assignments|配置管理室|调配管理室
매칭 검사실|Compatibility lab|適合検査室|匹配检查室
가이딩실 A|Guiding A|ガイディング室 A|引导室 A
가이딩실 B|Guiding B|ガイディング室 B|引导室 B
대기실|Waiting room|待合室|候室
민원 로비|Public lobby|民願ロビー|公众服务大厅
등록 창구|Registration|登録窓口|登记窗口
비콘 사무실|BEACON office|ビコン事務室|BEACON办公室
장비 보관|Equipment storage|装備保管|装备存放
방문자 검색|Visitor screening|来訪者確認|访客安检
출입 통제실|Access control|入退室管理室|出入管制室
보안 검색대|Security checkpoint|保安検査場|安检区
안내 데스크|Information desk|案内デスク|服务台
승강기 홀|Lift lobby|エレベーターホール|电梯厅
건강 관리실|Health services|健康管理室|健康管理室
식당|Dining hall|食堂|食堂
휴게실|Break room|休憩室|休息室
생활 지원실|Residential support|生活支援室|生活支援室
검진실|Examination room|診察室|体检室
대형 훈련장|Main training hall|大型訓練場|大型训练场
능력 제어실|Ability control|能力制御室|能力控制室
관측실|Observation|観測室|观测室
장비실|Equipment room|装備室|装备室
탈의실|Changing room|更衣室|更衣室
전술 시뮬레이터|Tactical simulator|戦術シミュレーター|战术模拟器
관제석|Control booth|管制席|管制席
기록실|Records|記録室|档案室
작전 검토실|Debrief room|作戦検討室|作战研讨室
대기 구역|Standby area|待機区域|待命区
공용 거실|Shared lounge|共用リビング|公共客厅
벡스|IBEX|벡스|벡스
슬런|SLUN|슬런|슬런
신재신|JAESHIN|신재신|신재신
버그|BUG|버그|버그
생활 지원|Residential support|生活支援|生活支援
위험도 분석실|Risk analysis|危険度分析室|风险分析室
임무 배치실|Mission assignment|任務配置室|任务分配室
배치 명령실|Deployment command|配置命令室|部署指挥室
자료실|Reference room|資料室|资料室
보안실|Security|保安室|安保室
격리실 01|Containment 01|隔離室 01|隔离室 01
격리실 02|Containment 02|隔離室 02|隔离室 02
격리실 03|Containment 03|隔離室 03|隔离室 03
이중 차폐 통로|Double-shielded corridor|二重遮蔽通路|双层屏蔽通道
감시실|Surveillance|監視室|监视室
긴급 안정실|Emergency stabilization|緊急安定室|紧急稳定室
원본 기록고|Original archive|原本記録庫|原始档案库
열람실|Reading room|閲覧室|阅览室
접근 심사|Access screening|入室審査|访问审核
파장 기록실|Wavelength archive|波長記録室|波长档案室
보존 장비실|Preservation equipment|保存装備室|保存设备室
잔류 파장 분석|Residual-wave analysis|残留波長分析|残留波长分析
게이트 실험실|Gate testing lab|ゲート実験室|门扉实验室
시료 격리|Sample quarantine|試料隔離|样本隔离
관측 부스|Observation booth|観測ブース|观测舱
실험실 A|Laboratory A|実験室 A|实验室 A
실험실 B|Laboratory B|実験室 B|实验室 B
실험실 C|Laboratory C|実験室 C|实验室 C
차폐 전실|Shielded antechamber|遮蔽前室|屏蔽前室
기록 통제|Records control|記録統制|档案管制
수용 구획 A|Holding A|収容区画 A|收容区 A
수용 구획 B|Holding B|収容区画 B|收容区 B
수용 구획 C|Holding C|収容区画 C|收容区 C
심층 통제 통로|Deep access corridor|深層統制通路|深层管制通道
신원 기록실|Identity records|身元記録室|身份档案室
차폐실|Shielded room|遮蔽室|屏蔽室
출입 구분|Access level|入室区分|出入级别
담당 구역|Assigned area|担当区域|负责区域
방문 시 해당 층 안내 데스크를 통해 담당자에게 연락하십시오.|Contact the floor desk before visiting the assigned officer.|訪問の際は、その階の案内デスクから担当者にご連絡ください。|来访时请通过该楼层服务台联系负责人。
최고 의사결정 · 전투 투입 승인|Executive decisions · Combat authorization|最高意思決定・戦闘投入承認|最高决策 · 战斗部署审批
등급 판정 기준 · 정책 심의|Classification standards · Policy review|等級判定基準・政策審議|等级评定标准 · 政策审议
대외 연구 업무|External research operations|対外研究業務|对外研究工作
행정 업무 · 대외 협력|Administration · External cooperation|行政業務・対外協力|行政工作 · 对外合作
가이드 보호와 교육|Guide protection and education|ガイドの保護と教育|向导保护与教育
가이드 배치 및 관리|Guide assignment and oversight|ガイドの配置と管理|向导调配与管理
출입 확인 · 보안 통제|Access verification · Security control|入退室確認・保安統制|出入核验 · 安保管制
일상 생활 및 건강 관리|Daily living and health services|日常生活・健康管理|日常生活与健康管理
작전 훈련 및 시뮬레이션|Operational training and simulation|作戦訓練・シミュレーション|作战训练与模拟
팀 오리진 생활 공간|ORIGIN residential quarters|オリジンの生活空間|ORIGIN团队生活空间
배치 명령 · 위험도 관리|Deployment orders · Risk management|配置命令・危険度管理|部署指令 · 风险管理
통제 불가 개체의 격리|Containment of uncontrollable entities|制御不能個体の隔離|隔离无法控制的个体
제3의 각성자 기록|Third awakener records|第三の覚醒者記録|第三类觉醒者档案
게이트·잔류 파장 연구|Gate and residual-wave research|ゲート・残留波長研究|门扉与残留波长研究
접근 제한 연구|Restricted research|立入制限研究|限制访问研究
비공식 수용 기록|Unofficial containment records|非公式収容記録|非正式收容记录
`;
export function installFacilityTranslations() {
  rows
    .trim()
    .split('\n')
    .forEach((r) => registerCopy(...r.split('|')));
}
