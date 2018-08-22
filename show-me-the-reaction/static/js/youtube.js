    var buttonState = "NONE"; // PLAY, PAUSE, STOP
	var player, played;
    var playerState, tempPlayerState;
	var tag, firstScriptTag;
	var requestNum, detectNum, startCapture, isStopCapture, interval, cnt;
	var anger, joy, surprise, sorrow, none;
    var challenge_result = true, is_check_result = false;

    tag = document.createElement('script');
    tag.src = "http://www.youtube.com/iframe_api";
    firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


    function onYouTubeIframeAPIReady() {
        player = new YT.Player('youtube', {
            height: '315',
            width: '560',
            videoId: '9bZkp7q19f0',
            playerVars: {
                controls: '2'
            },
            events: {
                'onReady': onPlayerReady,               // 플레이어 로드가 >완료되고 API 호출을 받을 준비가 될 때마다 실행
                'onStateChange': onPlayerStateChange    // 플레이어의 상태가 변경될 때마다 실행
            }
        });
    }
    function onPlayerReady(event) {
        console.log('onPlayerReady 실행');
    }

    requestNum = 0, detectNum = 0;
    isStopCapture = false;
    interval = 5000;
    anger=[0, 0];	// idx 0:가능성없음 1:있음
    joy=[0, 0];
    surprise=[0, 0];
    sorrow=[0, 0];
    none = 0;

    function onPlayerStateChange(event) {
        playerState = event.data == YT.PlayerState.ENDED ? '종료됨' :
                    event.data == YT.PlayerState.PLAYING ? '재생 중' :
                    event.data == YT.PlayerState.PAUSED ? '일시중지 됨' :
                    event.data == YT.PlayerState.BUFFERING ? '버퍼링 중' :
                    event.data == YT.PlayerState.CUED ? '재생준비 완료됨' :
                    event.data == -1 ? '시작되지 않음' : '예외';

        console.log('onPlayerStateChange 실행: ' + playerState + " btn: " + buttonState);

        //printPlayerState();

        if ( playerState == '재생 중' ) {
            if ( tempPlayerState !== '재생 중' ) {
                // 결과를 보고 다시 재생한 경우
                if(is_check_result == true){
                    is_check_result = false;
                    requestNum = 0;detectNum = 0;
                    anger=[0, 0];joy=[0, 0];surprise=[0, 0];sorrow=[0, 0];none = 0;
                    firebase_child_idx = 0;
                }
                // 재생중이 아니었는데, 재생중으로 바뀌었을 때 => 캡처 시작해야함.
                // 그런데 이미 캡처를 하고 있을 경우 => 캡처를 중단?
                if ( startCapture ) clearInterval(startCapture);
                console.log('[ startCapture ] request : ' + requestNum + ', detect : ' + detectNum);
                isStopCapture = false;

                startCapture = setInterval(
                    function() {
                        if(isStopCapture == true) {
                            isStopCapture = false;
                            console.log('isStopCapture return');
                            return;
                        }

                        $.ajax({
                            type: "GET",
                            url: $SCRIPT_ROOT + "/echo",
                            contentType: "application/json; charset=utf-8",
                            data: { echoValue : requestNum },
                            success: function(data) {

                                if ( data.neutral[0] > 3 ) {
								    none++;
                                }
                                else {
                                    if (data.anger[0] > 3)	anger[1]++;
                                    else    anger[0]++;

                                    if (data.joy[0] > 3) joy[1]++;
                                    else    joy[0]++;

                                    if (data.surprise[0] > 3)	surprise[1]++;
                                    else    surprise[0]++;

                                    if (data.sorrow[0] > 3) sorrow[1]++;
                                    else    sorrow[0]++;

                                    if ( data.anger[0] < 4 && data.joy[0] < 4
										&& data.surprise[0] < 4 && data.sorrow[0] < 4 )
								        none++;
                                }

                                // 실제 face detect 결과를 얻었으면 1증가
                                if(data.detect == 1) {
                                    detectNum = detectNum + 1;
                                    console.log('detectNum : ' + detectNum);
                                }
                                if (detectNum == requestNum) {
									// detect가 멈추고, 처리를 완료했을 때 해당 결과까지를 출력
									var element = document.getElementById("result");

									if (category == "joy" && joy[1] > 0) challenge_result = false;
									if (category == "angry" && anger[1] > 0) challenge_result = false;
                                    if (category == "sorrow" && sorrow[1] > 0) challenge_result = false;
                                    if (category == "surprise" && surprise[1] > 0) challenge_result = false;

                                    if (challenge_result == false) console.log('도전실패');

									console.log('결과 볼 수 있음');
									if(result_btn_click == true) {
									    console.log("result_btn_click : true");
                                        var event = document.createEvent("HTMLEvents");
                                        event.initEvent("click", true, false);
                                        document.getElementById("result_btn").dispatchEvent(event);
                                    }
								}

                            }
                        });
						requestNum = requestNum+1;
                        console.log('requestNum : ' + requestNum);
                    }, interval
                );
            }
        }
        else {
            isStopCapture = true;
            clearInterval(startCapture);
            console.log('[ stopCapture ] request : ' + requestNum + ', detect : ' + detectNum);
        }

        tempPlayerState = playerState;
        collectPlayCount(event.data);

    }
	function collectPlayCount(data) {
        if ( (data == YT.PlayerState.PLAYING) && (played == false)) {
            played = true;
            console.log('statistics');
        }
    }

    function playYoutube() {
        buttonState = "PLAY"
        player.playVideo();
    }
    function pauseYoutube() {
        buttonState = "PAUSE"
        player.pauseVideo();
    }
    function stopYoutube() {
        buttonState = "STOP"
        player.seekTo(0, true);     // 영상의 시간을 0초로 이동시킨다.
        player.stopVideo();
    }
