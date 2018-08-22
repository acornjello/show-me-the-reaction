var config = {
    apiKey: "AIzaSyAkbj4f7iIGRql-0tZbIo05L1VWyFdh9ao",
    authDomain: "embeddedapplication2017-2.firebaseapp.com",
    databaseURL: "https://embeddedapplication2017-2.firebaseio.com",
    projectId: "embeddedapplication2017-2",
    storageBucket: "embeddedapplication2017-2.appspot.com",
    messagingSenderId: "697808371848"
};
var chart_data = {
  "type": "pie",
  "theme": "light",
  "titles": [ {
    "text": "MY RESULTS",
    "size": 16
  } ],
  "dataProvider": [{
	"emotion": "joy",
	"value": 0
  }, {
	"emotion": "surprise",
	"value": 0
  }, {
	"emotion": "sorrow",
	"value": 0
  }, {
	"emotion": "anger",
	"value": 0
  }, {
	"emotion": "none",
	"value": 0
  }],
  "valueField": "value",
  "titleField": "emotion",
  "startEffect": "elastic",
  "startDuration": 2,
  "labelRadius": 15,
  "innerRadius": "50%",
  "depth3D": 10,
  "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
  "angle": 15,
  "export": {
    "enabled": true
  }
};
var chart_data2 = {
  "type": "pie",
  "theme": "light",
  "titles": [ {
    "text": "OTHER PEOPLE's RESULTS",
    "size": 16
  } ],
  "dataProvider": [{
	"emotion": "joy",
	"value": 0
  }, {
	"emotion": "surprise",
	"value": 0
  }, {
	"emotion": "sorrow",
	"value": 0
  }, {
	"emotion": "anger",
	"value": 0
  }, {
	"emotion": "none",
	"value": 0
  }],
  "valueField": "value",
  "titleField": "emotion",
  "startEffect": "elastic",
  "startDuration": 2,
  "labelRadius": 15,
  "innerRadius": "50%",
  "depth3D": 10,
  "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
  "angle": 15,
  "export": {
    "enabled": true
  }
};

var chart = AmCharts.makeChart("chartdiv", chart_data);
var chart2 = AmCharts.makeChart("chartdiv2", chart_data2);

firebase.initializeApp(config);
var database = firebase.database();
var usr_anger, usr_joy, usr_surprise, usr_sorrow, usr_none;
var firebase_anger, firebase_joy, firebase_surprise, firebase_sorrow, firebase_none, firebase_cnt, firebase_viewnum;
var firebase_child_idx = 0;
var category, video;
var result_btn_click = false;

function setVideoName (category_name, video_name) {
    category = category_name;
    video = video_name;
}

$(function() {

    $('.close').click(function() {
        $('.modal').removeClass('active2');
        result_btn_click = false;
    })


    $('#result_btn').click(function() {
        console.log('result button click');
        result_btn_click = true;
        $('.modal').addClass('active2');

        // anger[1] 초기화?
        stopYoutube();

        var element = document.getElementById("challenge_result");
        var element2 = document.getElementById("firebase_result");

        if(requestNum == 0) {
            console.log('request를 하지 않음');
            $('.chart').addClass('active3');
            element.innerHTML = "";
            element2.innerHTML = "영상을 먼저 감상해주세요!";
        }
        else if(detectNum !== requestNum) {
            console.log('아직 다 detect 하지 않음');
            $('.chart').addClass('active3');
            element.innerHTML = ""
            element2.innerHTML = "<br/><br/><br/><br/><br/><br/>처리 중입니다.<br/> 잠시만 기다려주세요.";

        } else {
            console.log('REACTION 결과!');

            element.innerHTML = "[내 결과]";
            element2.innerHTML = "<br/>[다른 사람들의 결과]";


            // usr의 결과 계산하기
            console.log('anger :' + anger[1] + " joy : " + joy[1] + "\nsurprise : " + surprise[1] + " sorrow : " + sorrow[1] + " none : " + none);

            cnt = 0;
            cnt += anger[1];
            cnt += joy[1];
            cnt += surprise[1];
            cnt += sorrow[1];
            cnt += none;

            usr_anger = anger[1];
            usr_joy = joy[1];
            usr_surprise = surprise[1];
            usr_sorrow = sorrow[1];
            usr_none = none;

            chart_data["dataProvider"][0]["value"] = usr_joy;
            chart_data["dataProvider"][1]["value"] = usr_surprise;
            chart_data["dataProvider"][2]["value"] = usr_sorrow;
            chart_data["dataProvider"][3]["value"] = usr_anger;
            chart_data["dataProvider"][4]["value"] = usr_none;
            chart = AmCharts.makeChart("chartdiv", chart_data);

            console.log('uAnger : ' + usr_anger + 'uJoy : ' + usr_joy + 'uSurprise : ' + usr_surprise +'\n'
            + 'uSorrow : ' + usr_sorrow + 'uNone : ' + usr_none);

            // firebase의 결과 가져오기 & update
            doFirebaseService(database.ref('/'+category+'/'+video));

        }

    })


    function doFirebaseService(postRef) {
       postRef.transaction( function(post) {
		if (post) {
		      console.log('post has data');
		      getCurVideoInfo(category, video);
		} else {
		    console.log('post is null');
		}
		return post;
	  });

    }
    function getCurVideoInfo(category, videoName) {
        var message;

        database.ref().child('/'+category+'/'+videoName).on('child_added', function(dataSnapshot) {
            message = dataSnapshot.val();
            switch (firebase_child_idx) {
                case 0:
                    firebase_anger = message; break;
                case 1:
                    firebase_cnt = message;break;
                case 2:
                    firebase_joy = message;break;
                case 3:
                    firebase_none = message;break;
                case 4:
                    firebase_sorrow = message;break;
                case 5:
                    firebase_surprise = message;break;
                case 6:
                    firebase_viewnum = message;
                    chart_data2["dataProvider"][0]["value"] = firebase_joy;
                    chart_data2["dataProvider"][1]["value"] = firebase_surprise;
                    chart_data2["dataProvider"][2]["value"] = firebase_sorrow;
                    chart_data2["dataProvider"][3]["value"] = firebase_anger;
                    chart_data2["dataProvider"][4]["value"] = firebase_none;
                    chart2 = AmCharts.makeChart("chartdiv2", chart_data2);


                    console.log('Fanger :' + firebase_anger + " Fjoy : " + firebase_joy + "\nFsurprise : " + firebase_surprise + " Fsorrow : " + firebase_sorrow + " Fnone : " + firebase_none);

                    // 둘의 결과 띄우기
                    $('.chart').removeClass('active3');
                    var element = document.getElementById("result");
                    // firebase 결과 업데이트하기 -- 트랜잭션으로
                    if(is_check_result !== true) // 파이어베이스에 한번만 업로드하기
                        updateResult( database.ref('/'+category+'/'+videoName) );

                    is_check_result = true;
                    break;
            }
            //console.log('firebase_child_idx :' + firebase_child_idx);
            firebase_child_idx++;
        })
		return message;
	}

	function updateResult(postRef) {
	  postRef.transaction( function(post) {
		if (post) {
		      console.log('updateResult : post has data');
		      post.anger += usr_anger;
		      post.joy += usr_joy;
		      post.surprise += usr_surprise;
		      post.sorrow += usr_sorrow;
		      post.none += usr_none;
		      post.view_num += 1;
		      post.cnt += cnt;
		} else {
		    console.log('updateResult : post is null');
		}
		return post;
	  });
	}

    function includeJS()
    {
       document.write('<script src="https://www.gstatic.com/firebasejs/4.7.0/firebase.js"></script>');
       document.write('<script scr="https://www.gstatic.com/firebasejs/4.7.0/firebase-app.js"></script>');
       document.write('<script scr="https://www.gstatic.com/firebasejs/4.7.0/firebase-auth.js"></script>');
       document.write('<script scr="https://www.gstatic.com/firebasejs/4.7.0/firebase-database.js"></script>');
    }
});


