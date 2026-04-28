// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  // 設定背景顏色
  background('#e7c6ff');

  // 計算顯示影像的尺寸 (畫布寬高的 60%)
  let vWidth = width * 0.6;
  let vHeight = height * 0.6;
  // 計算置中位移
  let xOff = (width - vWidth) / 2;
  let yOff = (height - vHeight) / 2;

  // 在畫布中央繪製影像
  image(video, xOff, yOff, vWidth, vHeight);

  // Ensure at least one hand is detected
  if (hands.length > 0 && video.width > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 設定線條顏色（根據左右手）
        if (hand.handedness == "Left") {
          stroke(255, 0, 255);
        } else {
          stroke(255, 255, 0);
        }
        strokeWeight(4);

        // 定義需要串接的指尖路徑
        let fingerParts = [
          [0, 1, 2, 3, 4],    // 大拇指
          [5, 6, 7, 8],       // 食指
          [9, 10, 11, 12],    // 中指
          [13, 14, 15, 16],   // 無名指
          [17, 18, 19, 20]    // 小指
        ];

        // 繪製手指連線
        for (let part of fingerParts) {
          for (let i = 0; i < part.length - 1; i++) {
            let p1 = hand.keypoints[part[i]];
            let p2 = hand.keypoints[part[i + 1]];

            let x1 = map(p1.x, 0, video.width, xOff, xOff + vWidth);
            let y1 = map(p1.y, 0, video.height, yOff, yOff + vHeight);
            let x2 = map(p2.x, 0, video.width, xOff, xOff + vWidth);
            let y2 = map(p2.y, 0, video.height, yOff, yOff + vHeight);

            line(x1, y1, x2, y2);
          }
        }

        // 繪製關鍵點圓圈
        noStroke();
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];
          let displayX = map(keypoint.x, 0, video.width, xOff, xOff + vWidth);
          let displayY = map(keypoint.y, 0, video.height, yOff, yOff + vHeight);
          fill(hand.handedness == "Left" ? [255, 0, 255] : [255, 255, 0]);
          circle(displayX, displayY, 16);
        }
      }
    }
  }
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}
