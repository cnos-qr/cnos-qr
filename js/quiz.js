// 퀴즈 페이지 - VanillaJS

var currentQuizNo = 1;
var currentQuizData = null;

// URL 파라미터 가져오기
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// 퀴즈 데이터 로드
function loadQuiz(quizNo) {
  console.log('퀴즈 로드:', quizNo);

  if (typeof quizData !== 'undefined' && quizData[quizNo]) {
    currentQuizData = quizData[quizNo];
    currentQuizNo = quizNo;

    // 질문 화면 표시
    showQuestionScreen();

    console.log('✓ 퀴즈 로드 성공:', currentQuizData);
  } else {
    console.error('✗ 퀴즈를 찾을 수 없습니다:', quizNo);
    alert('퀴즈 번호 ' + quizNo + '를 찾을 수 없습니다.');
  }
}

// 질문 화면 표시
function showQuestionScreen() {
  var questionScreen = document.getElementById('questionScreen');
  var resultScreen = document.getElementById('resultScreen');
  var resultBgTop = document.getElementById('resultBgTop');
  var questionText = document.getElementById('questionText');

  if (!currentQuizData) return;

  // 개행 문자를 <br>로 치환
  var question = currentQuizData.question.replace(/\n/g, '<br>');
  questionText.innerHTML = question;

  // 화면 전환
  questionScreen.style.display = 'flex';
  resultScreen.style.display = 'none';
  if (resultBgTop) {
    resultBgTop.style.display = 'none';
  }
}

// 결과 화면 표시
function showResultScreen(isCorrect) {
  var questionScreen = document.getElementById('questionScreen');
  var resultScreen = document.getElementById('resultScreen');
  var resultBgTop = document.getElementById('resultBgTop');
  var starVideo = document.getElementById('starVideo');
  var fishImage = document.getElementById('fishImage');
  var resultTitle = document.getElementById('resultTitle');
  var resultImage = document.getElementById('resultImage');
  var resultDescription = document.getElementById('resultDescription');

  if (!currentQuizData) return;

  // 결과 타이틀 설정
  resultTitle.textContent = isCorrect ? '정답 입니다' : '틀렸습니다';

  // 정답 동영상 또는 오답 이미지 표시
  if (isCorrect) {
    // 정답: 동영상 표시
    if (starVideo) {
      starVideo.style.display = 'block';
      var video = starVideo.querySelector('video');
      if (video) {
        video.currentTime = 0;

        // 비디오 메타데이터 로드 시 정보 출력
        video.addEventListener('loadedmetadata', function() {
          console.log('비디오 로드됨:', video.videoWidth, 'x', video.videoHeight);
          console.log('비디오 소스:', video.currentSrc);
        }, { once: true });

        video.play().catch(function(err) {
          console.log('동영상 재생 실패:', err);
        });

        // 비디오 로드 에러 시 GIF 표시
        video.addEventListener('error', function() {
          console.log('비디오 로드 실패, GIF로 대체');
          var gif = starVideo.querySelector('img');
          if (gif) {
            video.style.display = 'none';
            gif.style.display = 'block';
          }
        }, { once: true });
      }
    }
    if (fishImage) {
      fishImage.style.display = 'none';
    }
  } else {
    // 오답: 물고기 이미지 표시
    if (starVideo) {
      starVideo.style.display = 'none';
    }
    if (fishImage) {
      fishImage.style.display = 'block';
    }
  }

  // 이미지 설정
  resultImage.src = currentQuizData.imageUrl;

  // 설명 설정 (개행 문자를 <br>로 치환)
  var description = currentQuizData.description.replace(/\n/g, '<br>');
  resultDescription.innerHTML = description;

  // 화면 전환
  questionScreen.style.display = 'none';
  resultScreen.style.display = 'flex';
  if (resultBgTop) {
    resultBgTop.style.display = 'block';
  }
}

// O 버튼 클릭 핸들러
function handleOClick() {
  if (!currentQuizData) return;

  var isCorrect = currentQuizData.answer === 'O';
  console.log('O 클릭 - 정답:', currentQuizData.answer, '결과:', isCorrect);

  showResultScreen(isCorrect);
}

// X 버튼 클릭 핸들러
function handleXClick() {
  if (!currentQuizData) return;

  var isCorrect = currentQuizData.answer === 'X';
  console.log('X 클릭 - 정답:', currentQuizData.answer, '결과:', isCorrect);

  showResultScreen(isCorrect);
}


// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('퀴즈 페이지가 로드되었습니다.');

  // URL 파라미터에서 퀴즈 번호 가져오기
  var quizNo = getUrlParameter('no');

  // 퀴즈 번호가 없으면 1번으로 설정
  if (!quizNo) {
    quizNo = 1;
  } else {
    quizNo = parseInt(quizNo);
  }

  // 퀴즈 로드
  loadQuiz(quizNo);

  // 이벤트 리스너 등록
  var btnO = document.getElementById('btnO');
  var btnX = document.getElementById('btnX');

  if (btnO) {
    btnO.addEventListener('click', handleOClick);
  }

  if (btnX) {
    btnX.addEventListener('click', handleXClick);
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

  console.log(`현재 화면 방향: ${currentOrientation}`);
  console.log(`퀴즈 번호: ${quizNo}`);
});

