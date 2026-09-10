/* 언어 전환 + 측면 목차 활성 표시 */
(function () {
  var root = document.documentElement;
  var bKo = document.getElementById('btn-ko');
  var bEn = document.getElementById('btn-en');
  var KEY = 'jaen-guide-lang';

  function setLang(l) {
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l === 'ko' ? 'ko' : 'en');
    if (bKo) bKo.setAttribute('aria-pressed', String(l === 'ko'));
    if (bEn) bEn.setAttribute('aria-pressed', String(l === 'en'));
    try { localStorage.setItem(KEY, l); } catch (e) {}
    // 언어가 바뀌면 보이는 섹션 집합이 바뀐다. 관찰 대상을 다시 잡는다.
    watch();
  }

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  setLang(saved === 'en' ? 'en' : 'ko');

  if (bKo) bKo.addEventListener('click', function () { setLang('ko'); });
  if (bEn) bEn.addEventListener('click', function () { setLang('en'); });

  /* ── 목차 활성 표시 ──
     보이는 언어의 섹션만 관찰한다. 숨은 쪽은 높이가 0 이라 잘못 잡힌다. */
  var observer = null;

  function watch() {
    if (observer) { observer.disconnect(); observer = null; }

    var lang = root.getAttribute('data-lang');
    var pane = document.querySelector('article > .' + lang);
    var nav = document.querySelector('.sidetoc nav.' + lang);
    if (!pane || !nav) return;

    var links = {};
    var targets = [];
    nav.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (!el) return;
      links[id] = a;
      targets.push(el);
      a.classList.remove('active');
    });
    if (!targets.length) return;

    var visible = {};

    function paint() {
      var best = null;
      for (var i = 0; i < targets.length; i++) {
        var id = targets[i].id;
        if (visible[id]) { best = id; break; }   // 문서 순서상 가장 위에 보이는 것
      }
      Object.keys(links).forEach(function (id) {
        links[id].classList.toggle('active', id === best);
      });
    }

    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      paint();
    }, {
      // 상단 바 높이만큼 위를 잘라내고, 화면 아래 60% 는 무시한다.
      rootMargin: '-120px 0px -60% 0px',
      threshold: 0
    });

    targets.forEach(function (t) { observer.observe(t); });
  }

  /* 목차 링크를 누르면 상단 바에 가리지 않게 여유를 둔다 */
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('.sidetoc a[href^="#"]');
    if (!a) return;
    var el = document.getElementById(a.getAttribute('href').slice(1));
    if (!el) return;
    ev.preventDefault();
    var y = el.getBoundingClientRect().top + window.pageYOffset - 110;
    window.scrollTo({ top: y, behavior: 'smooth' });
    history.replaceState(null, '', a.getAttribute('href'));
  });
})();
