// Shared tag identifiers used by the browser and API.
export const staffTags = [
  {id:'team:blackjack',label:'팀 · 블랙잭'},
  {id:'member:poker',label:'인물 · 포커'},
  {id:'member:dealer',label:'인물 · 딜러'},
  {id:'member:rear',label:'인물 · 리어'},
  {id:'member:panden',label:'인물 · 판덴'},
  {id:'member:siso',label:'인물 · 시소'},

  {
    id: 'team:origin',
    label: '팀 · 오리진',
  },
  {
    id: 'team:beacon',
    label: '팀 · 비콘',
  },
  {
    id: 'team:shield',
    label: '팀 · 실드',
  },
  {
    id: 'team:lucky',
    label: '팀 · 럭키트릭',
  },
  {
    id: 'team:obsidus',
    label: '팀 · 옵시더스',
  },
  {
    id: 'team:orpe',
    label: '팀 · ORPÉ',
  },
  {
    id: 'member:ibex',
    label: '인물 · 벡스',
  },
  {
    id: 'member:slun',
    label: '인물 · 슬런',
  },
  {
    id: 'member:jaeshin',
    label: '인물 · 신재신',
  },
  {
    id: 'member:bug',
    label: '인물 · 버그',
  },
  {
    id: 'member:binjo',
    label: '인물 · 빈조',
  },
  {
    id: 'member:levit',
    label: '인물 · 레빗',
  },
  {
    id: 'member:shepherd',
    label: '인물 · 셰퍼드',
  },
  {
    id: 'member:seowon',
    label: '인물 · 서원',
  },
  {
    id: 'member:yeomyeong',
    label: '인물 · 여명',
  },
  {
    id: 'member:wonhyeol',
    label: '인물 · 원혈',
  },
  {
    id: 'member:dain',
    label: '인물 · 데인',
  },
  {
    id: 'member:jion',
    label: '인물 · 지온',
  },
  {
    id: 'member:sando',
    label: '인물 · 산도',
  },
  {
    id: 'member:baekjin',
    label: '인물 · 백진',
  },
  {
    id: 'member:jaein',
    label: '인물 · 재인',
  },
  {
    id: 'member:danjo',
    label: '인물 · 단조',
  },
  {
    id: 'member:unsae',
    label: '인물 · 운새',
  },
  {
    id: 'member:yujin',
    label: '인물 · 유진',
  },
  {
    id: 'member:chabin',
    label: '인물 · 차빈',
  },
  {
    id: 'member:hanho',
    label: '인물 · 한호',
  },
  {
    id: 'member:mohyun',
    label: '인물 · 모현',
  },
  {
    id: 'member:yuhwan',
    label: '인물 · 유환',
  },
  {
    id: 'member:az',
    label: '인물 · 에이지',
  },
];

export function staffTagInfo(id) {
  const known = staffTags.find(t => t.id === id);
  const kind = id.startsWith('team:') || id.startsWith('custom-team:') ? 'team' : id.startsWith('member:') ? 'member' : 'custom';
  return { kind, label: known ? known.label.replace(/^(팀|인물) · /, '') : id.replace(/^custom(?:-team)?:/, '') };
}
export function validStaffTag(id) {
  if (typeof id !== 'string') return false;
  if (staffTags.some(t => t.id === id)) return true;
  const match = id.match(/^custom(?:-team)?:([^\x00-\x1f\x7f]{1,40})$/u);
  return !!match && !!match[1].trim() && match[1] === match[1].trim();
}
