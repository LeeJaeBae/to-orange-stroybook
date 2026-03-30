import Link from 'next/link';

const nameLayers = [
  { label: 'TO', title: '아직 닿지 않았지만, 분명한 방향', body: 'To는 완료가 아니라 지향입니다. 결과를 보장하지 않아도, 그 사람을 향해 기록을 보내겠다는 선택 자체를 뜻합니다.', surfaceClass: 'bg-[#fff5ea]', borderClass: 'border-[#f1d1ae]' },
  { label: 'ORANGE', title: '결과가 아닌, 자라나는 시간의 단위', body: '오렌지는 성과나 보상이 아닙니다. 한 번에 완성되지 않고, 천천히 잎을 쌓으며 자라는 존재를 보는 방식입니다.', surfaceClass: 'bg-[#fff7dd]', borderClass: 'border-[#edd8a0]' },
  { label: 'CIRCLE', title: '끊어지지 않도록 설계한 원형의 구조', body: '투오렌지는 관계를 직선으로 소비하지 않습니다. 한 번의 접촉이 끝이 아니라, 다시 이어질 수 있는 시간의 구조를 만듭니다.', surfaceClass: 'bg-[#edf6f2]', borderClass: 'border-[#c6ddd6]' },
];

const timeline = [
  { step: '01', title: '보내는 행위를 멈추지 않게 한다', body: '회신이 늦고 변화가 더딜수록, 누군가를 향한 기록은 더 쉽게 끊깁니다. 투오렌지는 그 멈춤을 줄이는 쪽을 선택합니다.' },
  { step: '02', title: '관계가 버틸 시간을 남긴다', body: '편지 한 통은 작지만, 쌓이면 사람은 자신이 완전히 지워지지 않았다는 사실을 알게 됩니다. 우리는 그 시간을 제품 안에 남깁니다.' },
  { step: '03', title: '성장을 강요하지 않는다', body: '투오렌지는 변화를 서두르지 않습니다. 나무를 베는 시점을 앞당기지 않고, 필요한 동안 존재할 수 있는 구조를 먼저 생각합니다.' },
  { step: '04', title: '그 이후의 삶까지 끊기지 않게 본다', body: '현실을 마주한 이후에도 사람은 혼자일 수 있습니다. 그래서 투오렌지는 지금의 안부와 이후의 삶을 따로 보지 않습니다.' },
];

const invisibleValues = [
  { title: '잊지 않았다는 증거', body: '누군가 나를 여전히 생각하고 있다는 사실은 수치로 환산되지 않아도 사람을 오늘로 붙듭니다.' },
  { title: '기록으로 남는 관계', body: '감정은 흔들려도 기록은 남습니다. 투오렌지는 그 흔적이 사라지지 않게 구조로 다룹니다.' },
  { title: '버틸 수 있었던 시간', body: '더 강한 말보다, 무너지지 않게 붙들어준 시간이 먼저 필요할 때가 있습니다. 우리는 그 시간을 설계합니다.' },
];

const promises = [
  '결과를 약속하지 않습니다.',
  '변화를 강요하지 않습니다.',
  '보내는 선택이 끊기지 않도록 돕습니다.',
  '나무를 베지 않는 쪽의 제품을 만듭니다.',
];

export function BrandPhilosophyPage() {
  return (
    <main className="overflow-hidden bg-[#f7f3ec] text-slate-900">
      {/* Hero */}
      <section className="relative isolate border-b border-black/5 bg-[radial-gradient(circle_at_top,#ffe6c8_0%,#f7f3ec_38%,#f7f3ec_100%)]">
        <div className="absolute left-[-8rem] top-20 h-64 w-64 rounded-full bg-[#ff9a48]/[0.16] blur-3xl" />
        <div className="absolute right-[-5rem] top-12 h-72 w-72 rounded-full bg-[#ffd07a]/[0.28] blur-3xl" />
        <div className="absolute right-[14%] top-[32%] h-56 w-56 rounded-full bg-[#8bb8aa]/[0.18] blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/2 h-48 w-48 -translate-x-1/2 rounded-full border border-[#f3bb80]/40" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:px-20 xl:px-28 xl:py-24">
          <div>
            <p className="text-xs font-semibold tracking-[0.34em] text-[#c96b2c] sm:text-sm">BRAND PHILOSOPHY</p>
            <h1 className="mt-5 max-w-4xl text-[38px] font-semibold leading-[1.18] tracking-[-0.05em] text-slate-950 sm:text-[51px] lg:text-[75px]" style={{ fontFamily: '"Nanum Myeongjo", serif' }}>
              아직 닿지 않았지만,<br />그 방향을<br />포기하지 않는 이름.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-9 text-slate-600 sm:text-lg">
              To-Orange는 서비스를 설명하는 이름이 아니라, 한 사람을 향해 가는 태도를 드러내는 이름입니다.
              즉각적인 변화보다 끊기지 않는 기록, 완성된 결과보다 자라나는 시간을 먼저 믿습니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/letter/compose/1" className="inline-flex h-12 items-center justify-center rounded-full bg-[#f97316] px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-[#ea6a11] sm:h-14 sm:px-7 sm:text-base">편지 쓰기 시작</Link>
              <a href="#name" className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white/75 px-6 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-white sm:h-14 sm:px-7 sm:text-base">이름의 뜻 보기</a>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-6 text-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-md sm:p-8">
              <div className="absolute inset-x-0 top-0 h-px bg-[#efdfcf]" />
              <div className="absolute right-[-2.5rem] top-[-2rem] h-32 w-32 rounded-full bg-[#ff9b54]/[0.14] blur-2xl" />
              <div className="absolute bottom-[-1.5rem] left-[-1rem] h-28 w-28 rounded-full bg-[#8bb8aa]/[0.12] blur-2xl" />
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-[#d8cabd] bg-white/70 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-slate-600">TO-ORANGE</span>
                <span className="text-[11px] tracking-[0.2em] text-[#5f897c]">WE DESIGN TIME</span>
              </div>
              <div className="mt-8">
                <p className="text-sm leading-8 text-slate-600">투오렌지는 결과를 약속하지 않습니다. 대신 한 사람을 향한 선택이 중간에서 끊기지 않도록 설계합니다.</p>
                <p className="mt-6 text-[29px] font-semibold leading-[1.55] tracking-[-0.04em] text-slate-950 sm:text-[35px]" style={{ fontFamily: '"Nanum Myeongjo", serif' }}>우리는<br />나무를 베지 않기로 했다.</p>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {promises.map((item) => (
                  <div key={item} className="rounded-[1.25rem] border border-[#eadfd3] bg-[#fffdf9] px-4 py-4 text-sm leading-8 text-slate-700">{item}</div>
                ))}
              </div>
              <div className="mt-8 rounded-[1.5rem] border border-[#d6e3dc] bg-[linear-gradient(135deg,rgba(255,239,219,0.95),rgba(236,246,242,0.92))] p-5">
                <p className="text-xs tracking-[0.2em] text-[#5f897c]">ONE SENTENCE</p>
                <p className="mt-3 text-lg font-semibold leading-10 text-slate-900">아직 닿지 않았지만,<br />그 사람을 향해 보내는 기록. 그리고 그 기록이 자라나는 시간.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Name Layers */}
      <section id="name" className="border-b border-black/5 bg-[#f2ece3] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-20 xl:px-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-[0.24em] text-[#c96b2c]">THE NAME, UNFOLDED</p>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.41] tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[50px]">이름을 풀어보면,<br />투오렌지가 만들고 싶은 시간이 보입니다.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-9 text-slate-600 sm:text-base">To-Orange는 의미를 하나로 고정하지 않습니다. 방향, 성장, 순환. 이 세 가지가 함께 있어야 관계가 단발성 위로가 아니라 살아 있는 구조가 된다고 보기 때문입니다.</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {nameLayers.map((layer, index) => (
              <article key={layer.label} className={`${layer.surfaceClass} ${layer.borderClass} rounded-[2rem] border p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-7 ${index === 1 ? 'lg:-translate-y-5' : ''}`}>
                <p className="text-xs font-semibold tracking-[0.22em] text-[#c96b2c]">{layer.label}</p>
                <h3 className="mt-4 text-2xl font-semibold leading-[1.35] tracking-[-0.03em] text-slate-950">{layer.title}</h3>
                <p className="mt-4 text-sm leading-9 text-slate-700 sm:text-base">{layer.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Declaration */}
      <section className="relative isolate border-b border-black/5 bg-[linear-gradient(180deg,#fffdf9_0%,#edf5f1_100%)] py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_top_left,rgba(255,178,103,0.18),transparent_36%)]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/4 translate-y-1/4 rounded-full bg-[#8bb8aa]/[0.18] blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-20 xl:px-28">
          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-[#5f897c]">THE DECLARATION</p>
            <h2 className="mt-4 max-w-[13ch] text-[28px] font-semibold leading-[1.32] tracking-[-0.05em] text-slate-950 sm:text-[40px] lg:text-[52px]" style={{ fontFamily: '"Nanum Myeongjo", serif' }}>
              오렌지나무는<br />현실을 피하는 장치가 아니라,<br />현실을 마주하기 전까지<br />버틸 수 있게 해주는 시간.
            </h2>
          </div>
          <div className="grid gap-5">
            <article className="rounded-[1.8rem] border border-[#e6ddd2] bg-white/80 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.07)] backdrop-blur-sm">
              <p className="text-sm leading-9 text-slate-600 sm:text-base">투오렌지의 네이밍은 《나의 라임 오렌지나무》에서 출발했습니다. 우리는 그 이야기를 현실을 유예하는 상상이 아니라, 무너지지 않게 붙들어주는 시간으로 읽었습니다.</p>
              <p className="mt-6 border-l-2 border-[#8bb8aa] pl-4 text-lg leading-10 text-slate-950">그래서 우리는 성장을 강요하지 않고, 결과를 앞당기지 않으며,<br />나무를 베는 시점을 정하지 않기로 했습니다.</p>
            </article>
            <article className="rounded-[1.8rem] border border-[#dce6e2] bg-[linear-gradient(135deg,rgba(255,243,229,0.95),rgba(237,246,242,0.92))] p-6">
              <p className="text-xs tracking-[0.22em] text-[#5f897c]">WHAT WE REFUSE</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-white/90 bg-white/70 px-4 py-4 text-sm leading-8 text-slate-700">일회성 위로로 소비되는 관계</div>
                <div className="rounded-[1.25rem] border border-white/90 bg-white/70 px-4 py-4 text-sm leading-8 text-slate-700">빠른 성과만 요구하는 시선</div>
                <div className="rounded-[1.25rem] border border-white/90 bg-white/70 px-4 py-4 text-sm leading-8 text-slate-700">보이지 않는 가치를 지워버리는 구조</div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-b border-black/5 bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-20 xl:px-28">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-[#c96b2c]">THE TIME WE DESIGN</p>
              <h2 className="mt-4 text-3xl font-semibold leading-[1.28] tracking-[-0.04em] text-slate-950 sm:text-4xl">투오렌지는 한순간을 돕는 서비스가 아니라, 시간을 설계하는 브랜드입니다.</h2>
              <p className="mt-5 max-w-md text-sm leading-9 text-slate-600 sm:text-base">편지는 감정의 폭발보다 더 오래 남는 구조여야 합니다. 보내는 시간, 기다리는 시간, 그리고 그 이후의 시간을 하나의 흐름으로 묶는 것. 그게 우리가 하려는 일입니다.</p>
            </div>
            <div className="grid gap-4">
              {timeline.map((item) => (
                <article key={item.step} className="rounded-[1.75rem] border border-black/5 bg-[#fcfaf7] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold leading-9 tracking-[-0.03em] text-slate-950">{item.title}</h3>
                    <span className="text-sm font-semibold tracking-[0.24em] text-[#f97316]">{item.step}</span>
                  </div>
                  <p className="mt-4 text-sm leading-9 text-slate-600 sm:text-base">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Invisible Value */}
      <section className="border-b border-black/5 bg-[#f7f3ec] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-20 xl:px-28">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-[#c96b2c]">INVISIBLE VALUE</p>
              <h2 className="mt-4 text-3xl font-semibold leading-[1.43] tracking-[-0.05em] text-slate-950 sm:text-4xl lg:text-[50px]" style={{ fontFamily: '"Nanum Myeongjo", serif' }}>눈에 보이지 않아도,<br />사람을 무너지지 않게 만드는 것들.</h2>
              <p className="mt-5 max-w-2xl text-sm leading-9 text-slate-600 sm:text-base">누군가 나를 잊지 않았다는 감각은 곧바로 성과가 되지 않습니다. 그래도 그 감각은 분명 사람을 오늘로 붙들고, 내일을 포기하지 않게 합니다.</p>
            </div>
            <div className="rounded-[2rem] border border-[#dde8e3] bg-[linear-gradient(135deg,#ffffff_0%,#f4faf7_100%)] p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)] sm:p-8">
              <p className="text-xs font-semibold tracking-[0.22em] text-[#5f897c]">ONE QUIET TRUTH</p>
              <p className="mt-4 text-[29px] font-semibold leading-[1.62] tracking-[-0.04em] text-slate-950 sm:text-[34px]">편지 한 통에 담긴 가장 큰 메시지는<br />&ldquo;당신을 여전히 생각하고 있다&rdquo;는 사실입니다.</p>
              <p className="mt-5 text-sm leading-9 text-slate-600 sm:text-base">그래서 투오렌지가 말하는 편지는 전달 수단이 아니라 존재의 증거입니다.</p>
            </div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {invisibleValues.map((item) => (
              <article key={item.title} className="rounded-[1.75rem] border border-black/5 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">{item.title}</h3>
                <p className="mt-4 text-sm leading-9 text-slate-600 sm:text-base">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#fff1e2_0%,#ffd9b6_45%,#d8ebe4_100%)] py-16 sm:py-20 lg:py-24">
        <div className="absolute left-0 top-0 h-40 w-40 -translate-x-1/4 -translate-y-1/4 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute bottom-0 right-0 h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-[#8bb8aa]/[0.22] blur-2xl" />
        <div className="relative z-10 mx-auto max-w-5xl px-5 text-center sm:px-8">
          <p className="text-sm font-semibold tracking-[0.24em] text-[#5f897c]">TO THE PERSON</p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.41] tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[52px]">방향은 이미 정해졌으니,<br />이제 보내는 일만 남았습니다.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-9 text-slate-700 sm:text-base">완벽한 문장보다 끊기지 않는 선택이 먼저예요. 쓰는 일은 작아 보여도, 누군가에게는 오늘을 버티게 하는 기록이 될 수 있으니까요.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/letter/compose/1" className="inline-flex h-12 items-center justify-center rounded-full bg-[#f97316] px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-[#ea6a11] sm:h-14 sm:px-7 sm:text-base">편지 쓰러 가기</Link>
            <Link href="/about" className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white/70 px-6 text-sm font-semibold text-slate-800 transition-colors hover:bg-white sm:h-14 sm:px-7 sm:text-base">회사소개 보기</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
