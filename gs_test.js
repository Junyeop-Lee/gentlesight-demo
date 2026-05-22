const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });

  let pass = 0, fail = 0;
  const check = (label, cond) => {
    const icon = cond ? '✓' : '✗';
    console.log(`   ${icon} ${label}`);
    if (cond) pass++; else fail++;
  };

  // ── 1. 랩톱 뷰포트 (1280×800) ──────────────────────────────────────────
  console.log('\n[1] 랩톱 뷰포트 (1280×800)');
  const ctx1 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pg1 = await ctx1.newPage();
  const errs1 = [];
  pg1.on('pageerror', e => errs1.push(e.message));
  await pg1.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 25000 });
  await pg1.waitForTimeout(1500);

  const promptDisplay = await pg1.$eval('.landscapePrompt', e => getComputedStyle(e).display);
  check('landscapePrompt 숨김', promptDisplay === 'none');

  const hintBox = await pg1.$eval('.demoInputHint', e => {
    const r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), inView: r.top >= 0 && r.bottom <= window.innerHeight };
  });
  check('demoInputHint 표시됨', hintBox.w > 0 && hintBox.h > 0);
  check('demoInputHint viewport 내', hintBox.inView);

  const pillCount1 = await pg1.$$eval('.demoStatusPill', els => els.length);
  check('demoStatusPill 1개 (상태 동일 시)', pillCount1 === 1);
  await pg1.screenshot({ path: '/tmp/gs_01_laptop.png' });
  console.log('   📸 /tmp/gs_01_laptop.png');
  await ctx1.close();

  // ── 2. 폰 오버레이 열기/닫기 ────────────────────────────────────────────
  console.log('\n[2] 폰 오버레이 열기');
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pg2 = await ctx2.newPage();
  await pg2.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 25000 });
  await pg2.waitForTimeout(1500);
  await pg2.click('.phoneToggleButton');
  await pg2.waitForTimeout(600);
  const phoneVisible = await pg2.$eval('.phoneOverlay', e => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }).catch(() => false);
  check('phoneOverlay 표시됨', phoneVisible);
  await pg2.screenshot({ path: '/tmp/gs_02_phone_open.png' });
  console.log('   📸 /tmp/gs_02_phone_open.png');

  // ── 3. 상호 배타: 패널 열면 폰 닫힘 ────────────────────────────────────
  console.log('\n[3] 상호 배타 — 패널 열기 시 폰 닫힘');
  const actionBtns = await pg2.$$('.bottomAppLayout button');
  if (actionBtns.length > 0) {
    await actionBtns[0].click();
    await pg2.waitForTimeout(600);
    const phoneAfter = await pg2.$eval('.phoneOverlay', e => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).catch(() => false);
    const panelAfter = await pg2.$('.floatingDetailPanel') !== null;
    check('패널 열릴 때 폰 닫힘', !phoneAfter);
    check('floatingDetailPanel 표시됨', panelAfter);
    await pg2.screenshot({ path: '/tmp/gs_03_mutual_exclusion.png' });
    console.log('   📸 /tmp/gs_03_mutual_exclusion.png');
  } else {
    console.log('   ⚠ action bar 버튼 없음 — 건너뜀');
  }
  await ctx2.close();

  // ── 4. 좁은 데스크톱 창 (700×900) — hover:hover 강제 설정으로 laptoprompt 숨김 검증 ──────
  console.log('\n[4] 좁은 데스크톱 창 (700×900) — CDP hover:hover 강제');
  const ctx4 = await browser.newContext({ viewport: { width: 700, height: 900 }, hasTouch: false });
  const pg4 = await ctx4.newPage();
  // Headless Chrome defaults to hover:none; forcibly set hover:hover to simulate a real laptop browser
  const cdp4 = await ctx4.newCDPSession(pg4);
  await cdp4.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'hover', value: 'hover' }, { name: 'pointer', value: 'fine' }]
  });
  await pg4.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 25000 });
  await pg4.waitForTimeout(1000);
  const promptNarrow = await pg4.$eval('.landscapePrompt', e => getComputedStyle(e).display);
  check('좁은 창에서 landscapePrompt 숨김', promptNarrow === 'none');
  await pg4.screenshot({ path: '/tmp/gs_04_narrow.png' });
  console.log('   📸 /tmp/gs_04_narrow.png');
  await ctx4.close();

  // ── 5. roleCurrentPill 클리핑 없음 ──────────────────────────────────────
  console.log('\n[5] roleCurrentPill 클리핑 없음 (폰 열기 → 역할 선택)');
  const ctx5 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pg5 = await ctx5.newPage();
  await pg5.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 25000 });
  await pg5.waitForTimeout(1500);
  await pg5.click('.phoneToggleButton');
  await pg5.waitForTimeout(500);
  // 역할 선택 (사회복지사 — 가장 긴 텍스트)
  const socialBtn = pg5.locator('.socialWorkerRoleOption').first();
  if (await socialBtn.count() > 0) {
    await socialBtn.click();
    await pg5.waitForTimeout(400);
    const pillEls = await pg5.$$('.roleCurrentPill');
    if (pillEls.length > 0) {
      const overflow = await pillEls[0].evaluate(e => {
        return e.scrollWidth > e.clientWidth;
      });
      check('사회복지사 roleCurrentPill 잘림 없음', !overflow);
    } else {
      console.log('   ⚠ roleCurrentPill 없음');
    }
  }
  await pg5.screenshot({ path: '/tmp/gs_05_role_pill.png' });
  console.log('   📸 /tmp/gs_05_role_pill.png');
  await ctx5.close();

  await browser.close();

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`결과: ${pass} 통과 / ${fail} 실패`);
  if (fail > 0) process.exit(1);
})().catch(err => { console.error('FAIL:', err.message); process.exit(1); });
