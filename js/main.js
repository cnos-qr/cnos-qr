// URL 파라미터 가져오기
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// 콘텐츠 데이터 로드 및 페이지 업데이트
function loadContent(contentId) {
  console.log('=== 콘텐츠 로드 시작 ===');
  console.log('요청 ID:', contentId);

  // contentData에서 데이터 가져오기
  if (typeof contentData !== 'undefined' && contentData[contentId]) {
    console.log('✓ content-data.js에서 데이터 로드 성공');
    console.log('데이터:', contentData[contentId]);

    // 페이지 업데이트
    updatePage(contentData[contentId]);

    console.log('✓ 콘텐츠 로드 완료:', contentId);
  } else {
    console.error('✗ 콘텐츠를 찾을 수 없습니다:', contentId);
    console.error('사용 가능한 콘텐츠 ID:', Object.keys(contentData || {}));
    showError('콘텐츠 ID를 찾을 수 없습니다: ' + contentId);
  }
}

// 페이지 콘텐츠 업데이트
function updatePage(data) {
  // 기존 오디오 정리
  const existingAudio = document.getElementById('backgroundAudio');
  if (existingAudio) {
    existingAudio.pause();
    existingAudio.remove();
  }

  // 오디오 버튼 초기화 (일단 숨김)
  const playButton = document.getElementById('audioPlayButton');
  if (playButton) {
    playButton.style.display = 'none';
    // 기존 이벤트 리스너 제거를 위해 복제
    const newPlayButton = playButton.cloneNode(true);
    playButton.parentNode.replaceChild(newPlayButton, playButton);
  }

  // 타이틀 업데이트
  const titleElement = document.getElementById('pageTitle');
  if (titleElement) {
    titleElement.textContent = data.title || '제목 없음';

    // 폰트 크기를 초기값으로 리셋
    titleElement.style.fontSize = '1.9rem';

    // 타이틀이 두 줄이 되는지 확인하고 폰트 크기 조절
    setTimeout(function() {
      var parentHeight = titleElement.parentElement.offsetHeight;
      var titleHeight = titleElement.scrollHeight;

      // scrollHeight가 부모 높이보다 크면 두 줄 이상이라는 의미
      if (titleHeight > parentHeight || titleElement.scrollWidth > titleElement.offsetWidth) {
        // 폰트 크기를 점진적으로 줄임
        var fontSize = 1.9;
        while ((titleElement.scrollHeight > parentHeight || titleElement.scrollWidth > titleElement.offsetWidth) && fontSize > 1.2) {
          fontSize -= 0.1;
          titleElement.style.fontSize = fontSize + 'rem';
        }
        console.log('타이틀 폰트 크기 조정:', fontSize + 'rem');
      }
    }, 10);
  }

  // 미디어 영역 업데이트
  const mediaArea = document.getElementById('mediaArea');
  if (mediaArea) {
    // 오디오 재생 버튼을 제외한 미디어만 제거
    const existingMedia = mediaArea.querySelectorAll('.main-image, .main-video');
    existingMedia.forEach(function(el) {
      el.remove();
    });

    if (data.mediaType === 'video') {
      // 비디오 생성
      const video = document.createElement('video');
      video.className = 'main-video';
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'metadata'; // 메타데이터만 먼저 로드하여 스트리밍 재생
      video.controls = false; // 컨트롤 바 숨김

      const source = document.createElement('source');
      source.src = data.videoUrl;
      source.type = 'video/mp4';

      video.appendChild(source);
      mediaArea.appendChild(video);

      // 비디오 자동 재생 시도
      video.play().catch(function(err) {
        console.log('비디오 자동 재생 실패:', err);
      });

    } else if (data.mediaType === 'image+audio') {
      // 이미지 + 오디오 생성
      const img = document.createElement('img');
      img.className = 'main-image';
      img.src = data.imageUrl;
      img.alt = data.title || 'Main Visual';

      // 이미지 로드 에러 처리
      img.addEventListener('error', function() {
        console.log('이미지 로드 실패:', data.imageUrl);
        this.style.backgroundColor = '#e0e0e0';
      });

      mediaArea.appendChild(img);

      // 오디오 백그라운드 재생
      if (data.audioUrl) {
        const audio = document.createElement('audio');
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 1.0;
        audio.id = 'backgroundAudio';

        const audioSource = document.createElement('source');
        audioSource.src = data.audioUrl;

        // 파일 확장자에 따라 type 설정
        const extension = data.audioUrl.split('.').pop().toLowerCase();
        if (extension === 'mp3') {
          audioSource.type = 'audio/mpeg';
        } else if (extension === 'wav') {
          audioSource.type = 'audio/wav';
        } else if (extension === 'ogg') {
          audioSource.type = 'audio/ogg';
        }

        audio.appendChild(audioSource);
        document.body.appendChild(audio); // body에 추가 (백그라운드)

        // 재생 버튼 상시 표시
        const playButton = document.getElementById('audioPlayButton');
        if (playButton) {
          playButton.style.display = 'block';

          // play/pause 토글 기능
          playButton.addEventListener('click', function() {
            if (audio.paused) {
              // 일시정지 상태 -> 재생
              audio.play().then(function() {
                console.log('✓ 오디오 재생');
              }).catch(function(err) {
                console.log('✗ 오디오 재생 실패:', err);
                alert('오디오 재생에 실패했습니다.');
              });
            } else {
              // 재생 중 -> 일시정지
              audio.pause();
              console.log('✓ 오디오 일시정지');
            }
          });
        }

        // 자동 재생 시도
        audio.play().then(function() {
          console.log('✓ 오디오 자동 재생 성공');
        }).catch(function(err) {
          console.log('✗ 오디오 자동 재생 실패 - 버튼 클릭 필요:', err.name);
        });
      }

    } else {
      // 이미지 생성 (기본값)
      const img = document.createElement('img');
      img.className = 'main-image';
      img.src = data.imageUrl;
      img.alt = data.title || 'Main Visual';

      // 이미지 로드 에러 처리
      img.addEventListener('error', function() {
        console.log('이미지 로드 실패:', data.imageUrl);
        this.style.backgroundColor = '#e0e0e0';
      });

      mediaArea.appendChild(img);
    }
  }

  // 개요 업데이트 (개행문자를 <br>로 치환)
  const overviewElement = document.getElementById('overview');
  if (overviewElement) {
    var overview = data.overview || '';
    // 개행문자(\n)를 <br> 태그로 치환
    overview = overview.replace(/\n/g, '<br>');
    overviewElement.innerHTML = overview;
  }

  // 섹션들 업데이트
  const sectionTitleElement = document.getElementById('sectionTitle');
  const descriptionElement = document.getElementById('description');

  if (data.sections && data.sections.length > 0) {
    // sections 배열이 있는 경우
    var sectionsHTML = '';

    data.sections.forEach(function(section) {
      if (section.sectionTitle) {
        sectionsHTML += '<h2>' + section.sectionTitle + '</h2>';
      }
      if (section.description) {
        // 개행문자(\n)를 <br> 태그로 치환
        var description = section.description.replace(/\n/g, '<br>');
        sectionsHTML += '<p class="description">' + description + '</p>';
      }
    });

    // sectionTitle 요소를 숨기고 description 요소에 모든 섹션 내용 표시
    if (sectionTitleElement) {
      sectionTitleElement.style.display = 'none';
    }
    if (descriptionElement) {
      descriptionElement.innerHTML = sectionsHTML;
    }
  } else {
    // sections 배열이 없는 경우 (빈 배열)
    if (sectionTitleElement) {
      sectionTitleElement.style.display = 'none';
    }
    if (descriptionElement) {
      descriptionElement.innerHTML = '';
    }
  }

  // 페이지 타이틀도 업데이트
  document.title = data.title ? `${data.title} - 국립청주해양과학관` : '국립청주해양과학관';
}

// 에러 표시
function showError(errorMessage) {
  const titleElement = document.getElementById('pageTitle');
  if (titleElement) {
    titleElement.textContent = '콘텐츠를 찾을 수 없습니다';
  }

  const overviewElement = document.getElementById('overview');
  if (overviewElement) {
    var message = '요청하신 콘텐츠를 불러올 수 없습니다.\n\n';
    message += '사용 가능한 콘텐츠:\n';
    message += '- gangchi (독도 강치)\n';
    message += '- sample (샘플 동영상)\n\n';
    message += '예: ?id=gangchi\n';

    overviewElement.textContent = message;
    overviewElement.style.whiteSpace = 'pre-line';
  }

  const sectionTitleElement = document.getElementById('sectionTitle');
  if (sectionTitleElement) {
    sectionTitleElement.style.display = 'none';
  }

  const descriptionElement = document.getElementById('description');
  if (descriptionElement) {
    descriptionElement.textContent = '';
  }
}

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {

  // URL 파라미터에서 ID 가져오기
  const contentId = getUrlParameter('id');

  if (contentId) {
    // ID가 있으면 해당 콘텐츠 로드
    loadContent(contentId);
  } else {
    // ID가 없으면 기본 콘텐츠 로드 (gangchi)
    loadContent('gangchi');
  }

  // 화면 방향 및 크기 변경 감지
  let currentOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

  window.addEventListener('resize', function() {
    const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

    if (newOrientation !== currentOrientation) {
      currentOrientation = newOrientation;
      console.log(`화면 방향 변경: ${currentOrientation}`);
    }
  });

  // 초기 로딩 메시지
  console.log('반응형 모바일 템플릿이 로드되었습니다.');
  console.log(`현재 화면 방향: ${currentOrientation}`);
  console.log(`뷰포트 크기: ${window.innerWidth}x${window.innerHeight}`);
  console.log(`콘텐츠 ID: ${contentId || 'gangchi (기본값)'}`);
});

