import { test, expect, type Page, type Route } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

const heroVote = {
  voteId: 1,
  title: '차기 지도자를 위한 사전 모의투표',
  details: '차세대 리더를 뽑는 가상 투표입니다.',
  status: 'ongoing',
  endsAt: '2099-01-01T00:00:00.000Z',
  totalCount: 1234,
  options: [
    {
      id: 101,
      name: '기호 1번 미래 후보',
      imageUrl: 'https://dummyimage.com/400x600/1e40af/ffffff&text=Candidate+A',
      count: 692,
      percent: 56,
    },
    {
      id: 102,
      name: '기호 2번 변화 후보',
      imageUrl: 'https://dummyimage.com/400x600/b91c1c/ffffff&text=Candidate+B',
      count: 542,
      percent: 44,
    },
  ],
};

const feedVotes = [
  {
    voteId: 1,
    title: heroVote.title,
    status: 'ongoing',
    endsAt: heroVote.endsAt,
    totalCount: heroVote.totalCount,
    options: heroVote.options,
  },
  {
    voteId: 2,
    title: '지난 이슈 결선 투표',
    status: 'closed',
    endsAt: '2023-01-01T00:00:00.000Z',
    totalCount: 982,
    options: [
      {
        id: 201,
        name: '기호 A 시민 연합',
        imageUrl: 'https://dummyimage.com/400x600/2563eb/ffffff&text=Candidate+C',
        count: 589,
        percent: 60,
      },
      {
        id: 202,
        name: '기호 B 혁신당',
        imageUrl: 'https://dummyimage.com/400x600/f97316/ffffff&text=Candidate+D',
        count: 393,
        percent: 40,
      },
    ],
  },
];

const voteDetailsById: Record<number, unknown> = {
  1: {
    voteId: 1,
    title: heroVote.title,
    status: 'ongoing',
    details: heroVote.details,
    endsAt: heroVote.endsAt,
    totalCount: heroVote.totalCount,
    isUserVoted: false,
    userVotedOptionId: null,
    options: heroVote.options,
  },
  2: {
    voteId: 2,
    title: feedVotes[1].title,
    status: 'closed',
    details: '지난 이슈에 대한 최종 결과입니다.',
    endsAt: feedVotes[1].endsAt,
    totalCount: feedVotes[1].totalCount,
    isUserVoted: true,
    userVotedOptionId: feedVotes[1].options[0].id,
    options: feedVotes[1].options,
  },
};

const commentsResponse = { success: true, data: { comments: [], totalCount: 0 } };

const statisticsById: Record<number, unknown> = {
  1: {
    totalCount: heroVote.totalCount,
    candidates: heroVote.options.map((option) => ({ ...option })),
    ageDistribution: [
      {
        age: '20s',
        totalCount: 200,
        totalPercent: 16.2,
        results: [
          { id: heroVote.options[0].id, count: 120, percent: 60 },
          { id: heroVote.options[1].id, count: 80, percent: 40 },
        ],
      },
    ],
    genderDistribution: [
      {
        gender: 'male',
        totalCount: 600,
        totalPercent: 48.6,
        results: [
          { id: heroVote.options[0].id, count: 320, percent: 53.3 },
          { id: heroVote.options[1].id, count: 280, percent: 46.7 },
        ],
      },
      {
        gender: 'female',
        totalCount: 634,
        totalPercent: 51.4,
        results: [
          { id: heroVote.options[0].id, count: 372, percent: 58.7 },
          { id: heroVote.options[1].id, count: 262, percent: 41.3 },
        ],
      },
    ],
    overallDistribution: [
      {
        group: '20s male',
        totalCount: 120,
        totalPercent: 9.7,
        results: [
          { id: heroVote.options[0].id, count: 70, percent: 58.3 },
          { id: heroVote.options[1].id, count: 50, percent: 41.7 },
        ],
      },
    ],
    timeline: [
      {
        date: '2024-01-01',
        results: [
          { id: heroVote.options[0].id, count: 30, percent: 60 },
          { id: heroVote.options[1].id, count: 20, percent: 40 },
        ],
      },
      {
        date: '2024-01-02',
        results: [
          { id: heroVote.options[0].id, count: 40, percent: 57 },
          { id: heroVote.options[1].id, count: 30, percent: 43 },
        ],
      },
    ],
    summary: {
      voteDifference: 150,
      participationRate: 0,
      commentCount: 18,
    },
  },
  2: {
    totalCount: feedVotes[1].totalCount,
    candidates: feedVotes[1].options.map((option) => ({ ...option })),
    ageDistribution: [
      {
        age: '20s',
        totalCount: 180,
        totalPercent: 18.3,
        results: [
          { id: feedVotes[1].options[0].id, count: 110, percent: 61.1 },
          { id: feedVotes[1].options[1].id, count: 70, percent: 38.9 },
        ],
      },
      {
        age: '30s',
        totalCount: 240,
        totalPercent: 24.4,
        results: [
          { id: feedVotes[1].options[0].id, count: 130, percent: 54.2 },
          { id: feedVotes[1].options[1].id, count: 110, percent: 45.8 },
        ],
      },
    ],
    genderDistribution: [
      {
        gender: 'male',
        totalCount: 520,
        totalPercent: 52.9,
        results: [
          { id: feedVotes[1].options[0].id, count: 300, percent: 57.7 },
          { id: feedVotes[1].options[1].id, count: 220, percent: 42.3 },
        ],
      },
      {
        gender: 'female',
        totalCount: 462,
        totalPercent: 47.1,
        results: [
          { id: feedVotes[1].options[0].id, count: 260, percent: 56.3 },
          { id: feedVotes[1].options[1].id, count: 202, percent: 43.7 },
        ],
      },
    ],
    overallDistribution: [
      {
        group: '20s male',
        totalCount: 80,
        totalPercent: 8.1,
        results: [
          { id: feedVotes[1].options[0].id, count: 46, percent: 57.5 },
          { id: feedVotes[1].options[1].id, count: 34, percent: 42.5 },
        ],
      },
      {
        group: '30s female',
        totalCount: 100,
        totalPercent: 10.2,
        results: [
          { id: feedVotes[1].options[0].id, count: 52, percent: 52 },
          { id: feedVotes[1].options[1].id, count: 48, percent: 48 },
        ],
      },
    ],
    timeline: [
      {
        date: '2024-01-10',
        results: [
          { id: feedVotes[1].options[0].id, count: 80, percent: 61.5 },
          { id: feedVotes[1].options[1].id, count: 50, percent: 38.5 },
        ],
      },
      {
        date: '2024-01-11',
        results: [
          { id: feedVotes[1].options[0].id, count: 90, percent: 60 },
          { id: feedVotes[1].options[1].id, count: 60, percent: 40 },
        ],
      },
    ],
    summary: {
      voteDifference: feedVotes[1].options[0].count - feedVotes[1].options[1].count,
      participationRate: 0,
      commentCount: 27,
    },
  },
};

function jsonFulfill(body: unknown, status = 200): Parameters<Route['fulfill']>[0] {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  };
}

async function setupPublicFlowMocks(page: Page) {
  await page.route('**/api/votes/hero', async (route) => {
    await route.fulfill(jsonFulfill({ success: true, data: heroVote }));
  });

  await page.route('**/api/votes/feed', async (route) => {
    await route.fulfill(jsonFulfill({ success: true, data: feedVotes }));
  });

  for (const voteId of Object.keys(voteDetailsById)) {
    const numericId = Number(voteId);
    await page.route(`**/api/votes/${voteId}`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill(jsonFulfill({ success: true, data: voteDetailsById[numericId] }));
      } else {
        await route.fulfill(jsonFulfill({ success: true, data: { success: true } }));
      }
    });

    await page.route(`**/api/votes/${voteId}/comments`, async (route) => {
      await route.fulfill(jsonFulfill(commentsResponse));
    });

    await page.route(`**/api/votes/${voteId}/statistics`, async (route) => {
      await route.fulfill(
        jsonFulfill({ success: true, data: statisticsById[numericId] ?? statisticsById[1] })
      );
    });
  }
}

test.describe('핵심 사용자 플로우', () => {
  test('비로그인 사용자가 투표를 탐색하고 결과를 확인할 수 있다', async ({ page }) => {
    await setupPublicFlowMocks(page);

    await page.goto(`${BASE_URL}/`);

    await expect(page.getByRole('heading', { name: '실시간 인기 투표🔥' })).toBeVisible();
    const heroSection = page.locator('[data-testid="hero-vote-section"]');
    await expect(heroSection.getByRole('heading', { name: heroVote.title })).toBeVisible();

    await page.getByRole('button', { name: '투표 참여하기' }).first().click();

    await expect(page).toHaveURL(new RegExp(`/vote/${heroVote.voteId}`));
    await expect(page.getByRole('heading', { name: heroVote.title })).toBeVisible();
    await expect(page.getByRole('button', { name: '후보를 선택해주세요' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '댓글' })).toBeVisible();
    await expect(page.getByText('투표 후 댓글을 작성할 수 있습니다.')).toBeVisible();

    await page.getByRole('button', { name: '돌아가기' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/`);

    const resultButton = page.getByRole('button', { name: '투표 결과보기' }).first();
    await expect(resultButton).toBeVisible();
    await resultButton.click();

    await expect(page).toHaveURL(new RegExp(`/result/${feedVotes[1].voteId}`));
    await expect(page.getByRole('heading', { name: '최종 결과 분석' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '상세 분석' })).toBeVisible();
    await expect(page.getByText('표 차이')).toBeVisible();
  });
});
