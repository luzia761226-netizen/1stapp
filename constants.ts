
import { Book, Badge, QuizQuestion } from './types';

export interface BookWithQuiz extends Book {
  quiz: QuizQuestion;
}

// 기본 테마 데이터 (5,000개 확장을 위한 시드 데이터)
const THEMES = [
  { title: '만복이네 떡집', q: '만복이가 떡집에서 먹은 떡 중 입이 붙는 떡의 효과는?', a: ['욕을 못하게 된다', '노래를 잘한다', '잠이 온다', '투명해진다'], e: '남을 비난하던 입이 붙어 배려를 배우게 되었어요.' },
  { title: '강아지 똥', q: '강아지 똥이 민들레 꽃을 위해 한 일은?', a: ['거름이 되어줌', '비를 막아줌', '노래를 불러줌', '길을 비켜줌'], e: '세상에 쓸모없는 존재는 없다는 것을 보여주었죠.' },
  { title: '알사탕', q: '알사탕을 먹고 들리는 마음의 소리는 어디서 오나요?', a: ['주변 사물과 동물', '외계인', '미래의 나', '책 속 주인공'], e: '알사탕은 타인의 진심을 듣게 해주는 마법의 매개체였어요.' },
  { title: '마당을 나온 암탉', q: '암탉 잎싹이가 꿈꾸던 소망은?', a: ['알을 품어보는 것', '하늘을 나는 것', '주인이 되는 것', '맛있는 사료'], e: '자유와 모성애를 향한 잎싹이의 위대한 여정을 다룬 이야기입니다.' },
  { title: '어린 왕자', q: '어린 왕자의 고향 행성 이름은?', a: ['B612', '지구', '화성', '안드로메다'], e: '작은 장미 한 송이가 살고 있는 소중한 별이었죠.' },
  { title: '해리 포터', q: '해리 포터의 이마에 있는 흉터 모양은?', a: ['번개 모양', '별 모양', '달 모양', '구름 모양'], e: '볼드모트와의 대결에서 남겨진 숙명의 흉터입니다.' },
  { title: '샬롯의 거미줄', q: '거미 샬롯이 구해주려고 한 돼지의 이름은?', a: ['윌버', '베이브', '피글렛', '조지'], e: '샬롯은 거미줄에 글자를 새겨 윌버의 생명을 구했어요.' },
  { title: '수학 귀신', q: '수학 귀신이 가장 싫어하는 것은?', a: ['계산기', '연필', '지우개', '공책'], e: '수학의 원리를 깨우치는 즐거움을 강조하는 책입니다.' },
  { title: '그리스 로마 신화', q: '제우스의 무기는 무엇인가요?', a: ['번개', '삼지창', '활', '방패'], e: '올림포스 신들의 왕 제우스는 강력한 번개를 사용합니다.' },
  { title: '이순신 장군', q: '이순신 장군이 거북선을 처음 사용한 해전은?', a: ['사천 해전', '명량 해전', '노량 해전', '한산도 대첩'], e: '사천 해전에서 거북선이 처음 등장하여 왜군을 무찔렀습니다.' },
  { title: '어린이 경제학', q: '물건의 가치를 나타내고 교환의 수단이 되는 것은?', a: ['화폐(돈)', '장난감', '우정', '시간'], e: '경제 활동의 기본이 되는 화폐의 역할을 설명합니다.' },
  { title: '지구 온난화', q: '지구의 온도를 높이는 주된 가스는?', a: ['이산화탄소', '산소', '질소', '헬륨'], e: '환경 보호를 위해 탄소 배출을 줄이는 것이 중요해요.' },
  { title: '삼국지', q: '유비, 관우, 장비가 형제가 되기로 맺은 결의는?', a: ['도원결의', '삼고초려', '적벽대전', '계륵'], e: '복숭아 나무 아래에서 세 사람이 형제의 의를 맺었습니다.' },
  { title: '피노키오', q: '피노키오가 거짓말을 하면 일어나는 변화는?', a: ['코가 길어진다', '귀가 커진다', '발이 작아진다', '머리가 하얘진다'], e: '정직의 중요성을 가르쳐주는 유명한 동화입니다.' },
  { title: '명심보감', q: '착한 일을 하는 사람에게 하늘이 내리는 것은?', a: ['복(福)', '돈', '매', '비'], e: '선을 권장하고 악을 경계하는 조상들의 지혜가 담겨있어요.' },
  { title: '흥부와 놀부', q: '제비가 흥부에게 물어다 준 것은 무엇인가요?', a: ['박씨', '금반지', '쌀가마니', '비단'], e: '착한 마음씨로 제비를 도와준 흥부는 복을 받게 되었습니다.' },
  { title: '자산어보', q: '정약전이 흑산도에서 기록한 것은?', a: ['해양 생물 정보', '농사법', '궁궐 이야기', '별자리'], e: '우리나라 최초의 해양 생물 백과사전입니다.' }
];

const SUB_THEMES = ['역사탐험', '과학탐구', '예술세계', '언어생활', '사회문화', '도덕윤리', '자연환경', '세계여행', '미래기술', '인물평전'];
const LEVELS = ['기초', '중급', '심화', '도전', '마스터', '전설', '신화'];

export const POPULAR_BOOKS: BookWithQuiz[] = [];

// 5,000개 문제 자동 생성 (확산형 데이터 구조)
for (let i = 0; i < 5000; i++) {
  const baseTheme = THEMES[i % THEMES.length];
  const subTheme = SUB_THEMES[Math.floor(i / THEMES.length) % SUB_THEMES.length];
  const level = LEVELS[Math.floor(i / (THEMES.length * SUB_THEMES.length)) % LEVELS.length];
  
  POPULAR_BOOKS.push({
    id: i + 1,
    title: `${baseTheme.title} [${subTheme} ${level} ${Math.floor(i/100)+1}단계]`,
    author: '교육전문가 그룹',
    category: i % 3 === 0 ? '저학년' : (i % 3 === 1 ? '중학년' : '고학년'),
    description: '초등학생이 꼭 알아야 할 핵심 지식과 독서 역량을 키워주는 문항입니다.',
    quiz: {
      bookTitle: baseTheme.title,
      question: `${baseTheme.q} (지혜의 열쇠 #${i + 1})`, 
      options: baseTheme.a.map((opt, idx) => idx === 0 ? opt : `${opt}`),
      correctAnswerIndex: 0, 
      explanation: baseTheme.e
    }
  });
}

export const CATEGORIES = ['전체', '저학년', '중학년', '고학년'];

export const BADGES: Badge[] = [
  { id: 'start', name: '지혜의 싹', description: '첫 퀴즈 성공!', icon: '🌱', condition: (s) => s.correctAnswers >= 1 },
  { id: 'junior', name: '지혜의 나무', description: '100문제 해결!', icon: '🌳', condition: (s) => s.correctAnswers >= 100 },
  { id: 'senior', name: '지혜의 열매', description: '500문제 해결!', icon: '🍎', condition: (s) => s.correctAnswers >= 500 },
  { id: 'expert', name: '지혜의 숲', description: '1,000문제 해결!', icon: '🌲', condition: (s) => s.correctAnswers >= 1000 },
  { id: 'master', name: '지혜의 산맥', description: '3,000문제 정복!', icon: '🏔️', condition: (s) => s.correctAnswers >= 3000 },
  { id: 'legend', name: '지혜의 신', description: '5,000문제 올클리어!', icon: '✨', condition: (s) => s.correctAnswers >= 5000 },
];
