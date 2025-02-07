function createVideoDiv() {
    let videoDiv = document.createElement('div');
    videoDiv.className = "videoDiv";
    document.body.appendChild(videoDiv);

    let son = document.createElement('div');
    son.className = "son";
    videoDiv.appendChild(son);

    let span = document.createElement('span');
    span.textContent = "请把驾驶证边框和视频边框对齐";
    span.style.textAlign = "center";
    span.style.display = "block";
    span.style.verticalAlign = "top";
    span.style.color = "red";
    span.style.fontSize = "18px";
    son.appendChild(span);

    let viewport = document.createElement('div');
    viewport.className = "viewport";
    son.appendChild(viewport);


    let video = document.createElement('video');
    video.className = "drawingBuffer";
    viewport.appendChild(video);

    let canvas = document.createElement('canvas');
    canvas.className = "drawingBuffer";
    viewport.appendChild(canvas);

    let buttonDiv = document.createElement('div');
    buttonDiv.className = "buttonDiv";
    son.appendChild(buttonDiv);

    let capture = document.createElement("input");
    capture.id = "btncapture";
    capture.type = "button";
    capture.value = "拍照";
    capture.className = "buttonEnabled";
    capture.addEventListener("click", onProcessCapture);
    buttonDiv.appendChild(capture);

    let recognition = document.createElement("input");
    recognition.id = "recognition";
    recognition.type = "button";
    recognition.className = "buttonDisabled";
    recognition.value = "识别";
    recognition.disabled = true;
    //recognition.style.display="none";
    recognition.addEventListener("click", recognitionDriving);
    buttonDiv.appendChild(recognition);

    let cancel = document.createElement("input");
    cancel.type = "button";
    cancel.value = "取消";
    cancel.className = "buttonEnabled";
    cancel.addEventListener("click", closeCapture);
    buttonDiv.appendChild(cancel);

}

createVideoDiv();

let buffer;
let capture_type = 0; //0:等待拍照 1:拍照完成
let viewport = document.querySelector('.viewport');
let video = document.querySelector('video');
let canvas = document.querySelector('canvas');
let context = canvas.getContext("2d");
let recognition = document.querySelector('#recognition');
let recognition_callback_function;

const ASPECT_RATIO = 1.4667; //88mm/60mm
const CANVAS_HEIGHT = Math.round($(window).width() / ASPECT_RATIO);
viewport.style.width = $(window).width() + 'px';
viewport.style.height = CANVAS_HEIGHT + 'px';
console.log("viewport.style.width="+viewport.style.width+" viewport.style.height="+viewport.style.height);

video.onclick = function () {
    onProcessCapture();
}
canvas.onclick = function () {
    onProcessCapture();
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

var exArray = []; //存储设备源ID
if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices()
        .then(function (devices) {
            devices.forEach(function (device) {
                // 这里会遍历 audioinput, audiooutput, videoinput，所以要加以区分
                if (device.kind === 'videoinput') {
                    exArray.push(device.deviceId);
                }
            });
            console.log("exArray length:", exArray.length);
        })
        .catch(function (err) {
            console.log(err.name + ": " + err.message);
        });
} else {
    console.log("enumerateDevices is not supported.");
}

function getMedia() {
    console.log("exArray=" + exArray.length);
    // console.log("mediaDevices:"+navigator.mediaDevices+",getUserMedia:"+navigator.mediaDevices.getUserMedia)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log("navigator.mediaDevices.getUserMedia ok");
        let isiOS = /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent);
        // let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
        console.log("userAgent=" + navigator.userAgent);
        // let constraints_video_width = isiOS ? 1920:1300;
        // let constraints_video_height = isiOS ? 1300:1920;
        let constraints_video_width = isiOS ? 880 : 600;
        let constraints_video_height = isiOS ? 600 : 880;
        let constraints_video_width_min = isiOS ? 640 : 480;
        let constraints_video_height_min = isiOS ? 480 : 640;
        let constraints_video = {
            'width': {
                'min': constraints_video_width_min,
                'ideal': constraints_video_width,
                'max': constraints_video_width
            },
            'height': {
                'min': constraints_video_height_min,
                'ideal': constraints_video_height,
                'max': constraints_video_height
            },
            'facingMode': "environment"
        };

        navigator.mediaDevices.getUserMedia({
            'audio': false,
            //'width': 640*4,
            //'height': 480*4,
            'video': constraints_video //调用前置摄像头，后置摄像头使用video: { facingMode: { exact: "environment" } }
        })
            .then(function (mediaStream) {
                getVideoStream(mediaStream);
            })
            .catch(function (error) {
                console.log(error);
            })
    } else if (navigator.getUserMedia) {
        console.log("navigator.getUserMedia ok");
        navigator.getUserMedia({
                'video': {
                    'optional': [{
                        'sourceId': exArray[1] //0为前置摄像头，1为后置
                    }]
                },
                'audio': false
            },
            function (mediaStream) { //success是获取成功的回调函数
                getVideoStream(mediaStream);
            },
            function (error) {
                console.log(error);
            });
    } else {
        alert('不支持摄像头调用！');
        return false;
    }
    return true;
}

function getVideoStream(stream) {
    console.log("viewport.style.width=" + viewport.style.width + " viewport.style.height=" + viewport.style.height);
    console.log("getVideoStream start");
    console.log("devicePixelRatio=" + $(window).devicePixelRatio + " width=" + $(window).width() + " height=" + $(window).height() +
        " innerWidth=" + $(window).innerWidth() + " innerHeight=" + $(window).innerHeight() +
        " outerWidth=" + $(window).outerWidth() + " outerHeight=" + $(window).outerHeight());

    buffer = stream;
    if (video.mozSrcObject !== undefined) {
        //Firefox中，video.mozSrcObject最初为null，而不是未定义的，我们可以靠这个来检测Firefox的支持
        video.mozSrcObject = stream;
    } else {
        video.srcObject = stream;
    }
    video.setAttribute("autoplay", true);
    video.setAttribute('muted', true);
    video.setAttribute('playsinline', true);
    video.play();
    console.log("viewport-Width=" + viewport.style.width + " viewport-Height=" + viewport.style.height);
    console.log("videoWidth=" + video.videoWidth + " videoHeight=" + video.videoHeight + " video-Width=" + video.width + " video-Height=" + video.height);
    console.log("getVideoStream end");
}

function closeCamera() {
    // buffer&&buffer.getTracks()[1].stop();//关闭摄像头
    var tracks = buffer && buffer.getVideoTracks();
    if (tracks && tracks.length) {
        tracks[0].stop();
    }
    buffer = null;
}

function takePhoto() {
    console.log("takePhoto start");
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 880;//192*5; //1080*1920 1920/1080=1.77 ----8.8/6=1.4667
    canvas.height = 600;//130*5;
    let swidth = 0;
    let sheight = 0;
    let sx = 0;
    let sy = Math.round((video.videoHeight - sheight) / 2);
    if (video.videoWidth <= video.videoHeight) {
        swidth = video.videoWidth;
        sheight = Math.round(swidth / ASPECT_RATIO);
        sx = 0;
        sy = Math.round((video.videoHeight - sheight) / 2);
        context.drawImage(video, sx, sy, swidth, sheight, 0, 0, canvas.width, canvas.height);
    } else {
        sheight = video.videoHeight;
        swidth = Math.round(sheight / ASPECT_RATIO);
        sx = 0;
        sy = 0;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvas.width, canvas.height);
    }
    console.log("videoWidth=" + video.videoWidth + " videoHeight=" + video.videoHeight);
    console.log("sx=" + sx + " sy=" + sy + " swidth=" + swidth + " sheight=" + sheight + " canvas.width=" + canvas.width + " canvas.height=" + canvas.height);
    //canvasToFile(canvas);
    console.log("takePhoto end");
}

function canvasToFile(canvas) {
    const dataurl = canvas.toDataURL('image/png');
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    var d = new Date(); //alert("canvasToFile1");
    // const file = new File([ u8arr ], d.format('yyyyMMddhhmmss')+'.png', { type: mime });
    const file = new File([u8arr], 'xxxx.png', {
        type: mime
    });


    var fd = new FormData(); //alert("canvasToFile2");
    fd.append('file', file);


    $.ajax({
        url: 'upload.php',
        type: 'post',
        data: fd,
        contentType: false,
        processData: false,
        success: function (response) {
            if (response != 0) {
                //alert('file uploaded');
            } else {
                alert('file not uploaded');
            }
            alert(response);
        },
        error: function (error) {
            alert(error);
        },
    });
}

function onProcessCapture() {
    //alert("capture start " + capture_type);
    let btncapture = document.querySelector('#btncapture');
    if (capture_type == 1) {
        video.removeAttribute("hidden");
        canvas.setAttribute('disabled', 'disabled');
        recognition.disabled = true;
        recognition.className = "buttonDisabled";
        btncapture.value = "拍照";
        capture_type = 0;
    } else {
        takePhoto();
        video.setAttribute("hidden", "hidden");
        canvas.removeAttribute("hidden");
        recognition.disabled = false;
        recognition.className = "buttonEnabled";
        btncapture.value = "重新拍照";
        capture_type = 1;
    }
    //alert("capture end");
}

function closeCapture() {
    if (capture_type == 1) {
        onProcessCapture();
    }
    closeCamera();
    let videoDiv = document.querySelector('.videoDiv');
    videoDiv.style.display = 'none';
}

function recognitionDriving() {
    const dataurl = canvas.toDataURL('image/png');
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    var d = new Date(); //alert("canvasToFile1");
    var filename = Math.random().toString(36).slice(-8) + ".png";
    // const file = new File([ u8arr ], d.format('yyyyMMddhhmmss')+'.png', { type: mime });
    const file = new File([u8arr], filename, {
        type: mime
    });
    recognition_callback_function(file);
}

function openCapture(callback) {
    if (getMedia()) {
        recognition_callback_function = callback;
        let videoDiv = document.querySelector('.videoDiv');
        videoDiv.style.display = 'flex';
    }
}