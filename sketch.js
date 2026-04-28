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

  // 計算影像寬高為畫布的 50%
  let vWidth = width * 0.5;
  let vHeight = height * 0.5;
  // 計算置中位移
  let offsetX = (width - vWidth) / 2;
  let offsetY = (height - vHeight) / 2;

  // 繪製置中的影像
  image(video, offsetX, offsetY, vWidth, vHeight);

  // Ensure at least one hand is detected
  if (hands.length > 0 && video.width > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 根據左右手設定顏色
        if (hand.handedness == "Left") {
          stroke(255, 0, 255);
          fill(255, 0, 255);
        } else {
          stroke(255, 255, 0);
          fill(255, 255, 0);
        }

        // 繪製手指連線 (0-4, 5-8, 9-12, 13-16, 17-20)
        let segments = [[0, 4], [5, 8], [9, 12], [13, 16], [17, 20]];
        strokeWeight(5);
        for (let seg of segments) {
          for (let i = seg[0]; i < seg[1]; i++) {
            let p1 = hand.keypoints[i];
            let p2 = hand.keypoints[i + 1];

            // 將攝影機座標映射到畫布上的影像區域
            let x1 = map(p1.x, 0, video.width, offsetX, offsetX + vWidth);
            let y1 = map(p1.y, 0, video.height, offsetY, offsetY + vHeight);
            let x2 = map(p2.x, 0, video.width, offsetX, offsetX + vWidth);
            let y2 = map(p2.y, 0, video.height, offsetY, offsetY + vHeight);
            line(x1, y1, x2, y2);
          }
        }

        // 繪製關鍵點圓圈 (維持原本功能)
        noStroke();
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];
          let x = map(keypoint.x, 0, video.width, offsetX, offsetX + vWidth);
          let y = map(keypoint.y, 0, video.height, offsetY, offsetY + vHeight);
          circle(x, y, 16);
        }
      }
    }
  }
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}
