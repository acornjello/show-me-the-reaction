from flask import Flask, request, jsonify, render_template

import RPi.GPIO as GPIO
import time
import picamera
import datetime
import io
import socket
import httplib, urllib, base64
import json

GPIO.setmode(GPIO.BCM)
GPIO.setup(4, GPIO.IN)

app = Flask(__name__)


def getDatetime():
    date = datetime.datetime.now()
    year = str(date.year)
    month = str(date.month)
    day = str(date.day)
    hour = str(date.hour)
    min = str(date.minute)
    sec = str(date.second)

    if int(month) < 10:
        month = '0' + month
    if int(day) < 10:
        day = '0' + day
    if int(hour) < 10:
        hour = '0' + hour
    if int(min) < 10:
        min = '0' + min

    t = year + month + day + hour + min + sec

    return t

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/echo', methods=['GET'])
def perform_main_function():
    request_num = request.args.get('echoValue', 0, type=int)

    print ('capture : '+str(request_num))
    filename = getDatetime() + '.jpg'
    with picamera.PiCamera() as camera:
        camera.resolution = (320, 240)
        camera.capture('./static/' + filename)

    headers = {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': '1074e426e29c43f78fbce55a8516829d'
    }
    params = urllib.urlencode({ })
    try:
        body = open('./static/' + filename, "rb").read()
        conn = httplib.HTTPSConnection('westus.api.cognitive.microsoft.com')
        conn.request("POST", "/emotion/v1.0/recognize?%s" % params, body, headers)
        response = conn.getresponse()
        data = response.read()
        parsed = json.loads(data)
        print ("Response:")
        print (json.dumps(parsed, sort_keys=True, indent=2))
        conn.close()

    except Exception as e:
        print("[Errno {0}] {1}".format(e.errno, e.strerror))

    anger = []; joy = []; surprise = []; sorrow = []; neutral = []

    num_anger       = float('{0:f}'.format(parsed[0]["scores"]["anger"]))
    num_contempt    = float('{0:f}'.format(parsed[0]["scores"]["contempt"]))
    num_disgust     = float('{0:f}'.format(parsed[0]["scores"]["disgust"]))
    num_happiness   = float('{0:f}'.format(parsed[0]["scores"]["happiness"]))
    num_neutral     = float('{0:f}'.format(parsed[0]["scores"]["neutral"]))
    num_sadness     = float('{0:f}'.format(parsed[0]["scores"]["sadness"]))
    num_surprise    = float('{0:f}'.format(parsed[0]["scores"]["surprise"]))

    if num_happiness >= 0.6:    joy.append(5)
    else:                       joy.append(1)
    if num_surprise >= 0.6:     surprise.append(5)
    else:                       surprise.append(1)
    if num_anger > 0.4 or num_contempt > 0.4 or num_disgust > 0.4:
            anger.append(5)
    else:   anger.append(1)
    if num_sadness > 0.65:  sorrow.append(5)
    else:                   sorrow.append(1)
    if num_neutral > 0.5:   neutral.append(5)
    else:                   neutral.append(1)

    ret_data = {"anger": anger,
                "joy": joy,
                "surprise": surprise,
                "sorrow": sorrow,
                "neutral" : neutral,
                "detect": 1
                }

    return jsonify(ret_data)

@app.route("/challenge")
def challenge():
    return render_template('challenge.html');

@app.route("/joy")
def challenge_joy():
    return render_template('joy.html')

@app.route("/joy1")
def challenge_joy1():
    return render_template('joy1.html')

@app.route("/joy2")
def challenge_joy2():
    return render_template('joy2.html')

@app.route("/joy3")
def challenge_joy3():
    return render_template('joy3.html')

@app.route("/joy4")
def challenge_joy4():
    return render_template('joy4.html')

@app.route("/sorrow")
def challenge_sorrow():
    return render_template('sorrow.html')

@app.route("/sorrow1")
def challenge_sorrow1():
    return render_template('sorrow1.html')

@app.route("/sorrow2")
def challenge_sorrow2():
    return render_template('sorrow2.html')

@app.route("/sorrow3")
def challenge_sorrow3():
    return render_template('sorrow3.html')

@app.route("/sorrow4")
def challenge_sorrow4():
    return render_template('sorrow4.html')

@app.route("/surprise")
def challenge_surprise():
    return render_template('surprise.html')

@app.route("/surprise1")
def challenge_surprise1():
    return render_template('surprise1.html')

@app.route("/surprise2")
def challenge_surprise2():
    return render_template('surprise2.html')

@app.route("/surprise3")
def challenge_surprise3():
    return render_template('surprise3.html')

@app.route("/surprise4")
def challenge_surprise4():
    return render_template('surprise4.html')

@app.route("/angry")
def challenge_angry():
    return render_template('angry.html')

@app.route("/angry1")
def challenge_angry1():
    return render_template('angry1.html')

@app.route("/angry2")
def challenge_angry2():
    return render_template('angry2.html')

@app.route("/angry3")
def challenge_angry3():
    return render_template('angry3.html')

@app.route("/angry4")
def challenge_angry4():
    return render_template('angry4.html')

@app.route("/reaction")
def reaction():
    return render_template('reaction.html')

@app.route("/reaction1")
def reaction1():
    return render_template('reaction1.html')

@app.route("/reaction2")
def reaction2():
    return render_template('reaction2.html')

@app.route("/reaction3")
def reaction3():
    return render_template('reaction3.html')

@app.route("/reaction4")
def reaction4():
    return render_template('reaction4.html')

if __name__ == "__main__":
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    s.connect(('google.com', 0))
    ipAddress = s.getsockname()[0]
    print ipAddress;
    app.run(host=ipAddress, port=8888, debug=True)
    s.close()

