(function () {
  'use strict';

  /* ── 현재 페이지 메타 정보 추출 ── */
  function getMeta() {
    var title = (document.querySelector('meta[property="og:title"]') || {}).content
             || document.title;
    var description = (document.querySelector('meta[property="og:description"]') || {}).content
                   || (document.querySelector('meta[name="description"]') || {}).content
                   || '';
    var image = (document.querySelector('meta[property="og:image"]') || {}).content || '';
    var url = (document.querySelector('link[rel="canonical"]') || {}).href
           || window.location.href;
    return { title: title, description: description, image: image, url: url };
  }

  /* ── 토스트 알림 ── */
  function showToast(msg) {
    var t = document.getElementById('bs-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 3000);
  }

  /* ── 플랫폼별 공유 함수 ── */
  function shareKakao(meta) {
    var u = 'https://sharer.kakao.com/talk/friends/picker/link?url=' + encodeURIComponent(meta.url);
    window.open(u, '_blank', 'width=420,height=540,noopener');
  }

  function shareBand(meta) {
    var body = meta.title + '\n' + meta.description + '\n' + meta.url;
    var u = 'https://band.us/plugin/share?body=' + encodeURIComponent(body) + '&route=' + encodeURIComponent(meta.url);
    window.open(u, '_blank', 'width=520,height=540,noopener');
  }

  function shareNaver(meta) {
    var u = 'https://blog.naver.com/openapi/share?url=' + encodeURIComponent(meta.url)
          + '&title=' + encodeURIComponent(meta.title);
    window.open(u, '_blank', 'width=520,height=600,noopener');
  }

  function sharePinterest(meta) {
    var u = 'https://pinterest.com/pin/create/button/?url=' + encodeURIComponent(meta.url)
          + '&media=' + encodeURIComponent(meta.image)
          + '&description=' + encodeURIComponent(meta.title + ' — ' + meta.description + ' #빵톡 #건강빵');
    window.open(u, '_blank', 'width=780,height=560,noopener');
  }

  function shareX(meta) {
    var text = meta.title + ' — 무설탕 건강빵 레시피 🍞 #빵톡 #건강빵 #홈베이킹';
    var u = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(meta.url)
          + '&text=' + encodeURIComponent(text);
    window.open(u, '_blank', 'width=600,height=420,noopener');
  }

  function copyLink(meta) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(meta.url).then(function () {
        showToast('✅ 링크가 복사됐어요!');
        closeModal();
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = meta.url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('✅ 링크가 복사됐어요!');
      closeModal();
    }
  }

  function nativeShare(meta) {
    if (!navigator.share) return false;
    navigator.share({ title: meta.title, text: meta.description, url: meta.url }).catch(function () {});
    return true;
  }

  /* ── 모달 열기/닫기 ── */
  function openModal() {
    var meta = getMeta();
    /* 모바일에서 Web Share API 지원하면 네이티브 사용 */
    if (window.matchMedia('(max-width: 768px)').matches && nativeShare(meta)) return;
    var modal = document.getElementById('bs-modal');
    if (modal) {
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('open');
      modal.querySelector('.bs-card').focus();
    }
  }

  function closeModal() {
    var modal = document.getElementById('bs-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  /* ── DOM 삽입 ── */
  function buildUI() {
    var html = [
      /* ── 공유 모달 ── */
      '<div id="bs-modal" role="dialog" aria-modal="true" aria-label="공유하기" aria-hidden="true">',
        '<div class="bs-overlay" id="bs-overlay"></div>',
        '<div class="bs-card" tabindex="-1">',
          '<button class="bs-close" id="bs-close" aria-label="닫기">✕</button>',
          '<div class="bs-header">',
            '<span class="bs-emoji">🍞</span>',
            '<h3 class="bs-title">이 레시피 공유하기</h3>',
            '<p class="bs-sub">건강빵을 소중한 분들과 나눠보세요</p>',
          '</div>',
          '<div class="bs-grid">',
            '<button class="bs-btn bs-kakao" id="bs-kakao">',
              '<span class="bs-btn-icon">💬</span>',
              '<span class="bs-btn-label">카카오톡</span>',
            '</button>',
            '<button class="bs-btn bs-band" id="bs-band">',
              '<span class="bs-btn-icon">📣</span>',
              '<span class="bs-btn-label">밴드</span>',
            '</button>',
            '<button class="bs-btn bs-naver" id="bs-naver">',
              '<span class="bs-btn-icon bs-n">N</span>',
              '<span class="bs-btn-label">네이버</span>',
            '</button>',
            '<button class="bs-btn bs-pinterest" id="bs-pinterest">',
              '<span class="bs-btn-icon bs-p">P</span>',
              '<span class="bs-btn-label">Pinterest</span>',
            '</button>',
            '<button class="bs-btn bs-x" id="bs-xbtn">',
              '<span class="bs-btn-icon">𝕏</span>',
              '<span class="bs-btn-label">X</span>',
            '</button>',
            '<button class="bs-btn bs-copy" id="bs-copy">',
              '<span class="bs-btn-icon">🔗</span>',
              '<span class="bs-btn-label">링크 복사</span>',
            '</button>',
          '</div>',
          navigator.share
            ? '<button class="bs-native-btn" id="bs-native">📱 더 많은 앱으로 공유하기</button>'
            : '',
        '</div>',
      '</div>',

      /* ── 플로팅 버튼 ── */
      '<button id="bs-float" aria-label="공유하기" title="공유하기">',
        '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
          '<path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>',
          '<polyline points="16 6 12 2 8 6"/>',
          '<line x1="12" y1="2" x2="12" y2="15"/>',
        '</svg>',
        '<span class="bs-float-label">공유</span>',
      '</button>',

      /* ── 토스트 ── */
      '<div id="bs-toast" role="status" aria-live="polite"></div>'
    ].join('');

    document.body.insertAdjacentHTML('beforeend', html);

    /* 이벤트 연결 */
    document.getElementById('bs-overlay').addEventListener('click', closeModal);
    document.getElementById('bs-close').addEventListener('click', closeModal);
    document.getElementById('bs-float').addEventListener('click', openModal);
    document.getElementById('bs-kakao').addEventListener('click', function () { shareKakao(getMeta()); });
    document.getElementById('bs-band').addEventListener('click', function () { shareBand(getMeta()); });
    document.getElementById('bs-naver').addEventListener('click', function () { shareNaver(getMeta()); });
    document.getElementById('bs-pinterest').addEventListener('click', function () { sharePinterest(getMeta()); });
    document.getElementById('bs-xbtn').addEventListener('click', function () { shareX(getMeta()); });
    document.getElementById('bs-copy').addEventListener('click', function () { copyLink(getMeta()); });
    if (navigator.share) {
      document.getElementById('bs-native').addEventListener('click', function () {
        nativeShare(getMeta());
      });
    }

    /* ESC 닫기 */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    /* 스크롤 후 플로팅 버튼 표시 */
    var floatBtn = document.getElementById('bs-float');
    function onScroll() {
      if (window.scrollY > 120) {
        floatBtn.classList.add('visible');
      } else {
        floatBtn.classList.remove('visible');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* 레시피 페이지 스크롤 트리거 */
    var isRecipe = !!document.querySelector('.recipe-detail-section, .recipe-hero-photo');
    if (isRecipe) {
      var triggered = false;
      window.addEventListener('scroll', function () {
        if (triggered) return;
        var pct = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
        if (pct > 0.72) {
          triggered = true;
          setTimeout(function () {
            showToast('💡 레시피가 도움이 됐다면 친구에게 공유해보세요!');
          }, 800);
        }
      }, { passive: true });
    }
  }

  /* ── 공개 API ── */
  window._bs = {
    open: openModal,
    close: closeModal,
    kakao: function () { shareKakao(getMeta()); },
    band: function () { shareBand(getMeta()); },
    naver: function () { shareNaver(getMeta()); },
    pinterest: function () { sharePinterest(getMeta()); },
    x: function () { shareX(getMeta()); },
    copy: function () { copyLink(getMeta()); }
  };

  /* ── 초기화 ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildUI);
  } else {
    buildUI();
  }
})();
