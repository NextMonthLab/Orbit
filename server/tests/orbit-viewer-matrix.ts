interface ViewerContextTest {
  scenario: string;
  viewerRole: 'admin' | 'public';
  isClaimed: boolean;
  planTier: 'free' | 'grow' | 'insight' | 'intelligence';
  expected: {
    isFirstRun: boolean;
    canEditAppearance: boolean;
    canDeepScan: boolean;
    canSeeClaimCTA: boolean;
    canAccessHub: boolean;
  };
}

const testMatrix: ViewerContextTest[] = [
  {
    scenario: 'Admin + unclaimed (first-run)',
    viewerRole: 'admin',
    isClaimed: false,
    planTier: 'free',
    expected: {
      isFirstRun: true,
      canEditAppearance: true,
      canDeepScan: false,
      canSeeClaimCTA: false,
      canAccessHub: false,
    },
  },
  {
    scenario: 'Admin + claimed + free tier',
    viewerRole: 'admin',
    isClaimed: true,
    planTier: 'free',
    expected: {
      isFirstRun: false,
      canEditAppearance: true,
      canDeepScan: false,
      canSeeClaimCTA: false,
      canAccessHub: true,
    },
  },
  {
    scenario: 'Admin + claimed + paid tier',
    viewerRole: 'admin',
    isClaimed: true,
    planTier: 'grow',
    expected: {
      isFirstRun: false,
      canEditAppearance: true,
      canDeepScan: true,
      canSeeClaimCTA: false,
      canAccessHub: true,
    },
  },
  {
    scenario: 'Public + unclaimed',
    viewerRole: 'public',
    isClaimed: false,
    planTier: 'free',
    expected: {
      isFirstRun: false,
      canEditAppearance: false,
      canDeepScan: false,
      canSeeClaimCTA: true,
      canAccessHub: false,
    },
  },
  {
    scenario: 'Public + claimed',
    viewerRole: 'public',
    isClaimed: true,
    planTier: 'grow',
    expected: {
      isFirstRun: false,
      canEditAppearance: false,
      canDeepScan: false,
      canSeeClaimCTA: false,
      canAccessHub: false,
    },
  },
];

function resolveViewerContext(
  viewerRole: 'admin' | 'public',
  isClaimed: boolean,
  planTier: string
) {
  const PAID_TIERS = ['grow', 'insight', 'intelligence'];
  const isPaidTier = PAID_TIERS.includes(planTier);

  return {
    isFirstRun: viewerRole === 'admin' && !isClaimed,
    canEditAppearance: viewerRole === 'admin',
    canDeepScan: viewerRole === 'admin' && isClaimed && isPaidTier,
    canSeeClaimCTA: viewerRole === 'public' && !isClaimed,
    canAccessHub: viewerRole === 'admin' && isClaimed,
  };
}

function runTests() {
  console.log('='.repeat(60));
  console.log('  ORBIT VIEWER CONTEXT STATE MATRIX TEST');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const test of testMatrix) {
    const result = resolveViewerContext(test.viewerRole, test.isClaimed, test.planTier);
    const allMatch = Object.keys(test.expected).every(
      key => result[key as keyof typeof result] === test.expected[key as keyof typeof test.expected]
    );

    if (allMatch) {
      console.log(`✓ ${test.scenario}`);
      passed++;
    } else {
      console.log(`✗ ${test.scenario}`);
      console.log(`  Expected: ${JSON.stringify(test.expected)}`);
      console.log(`  Got:      ${JSON.stringify(result)}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
