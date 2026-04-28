// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let bubbles = []; // 儲存泡泡物件的陣列
let statusMessage = "正在初始化系統...";

function preload() {
  // 模型載入移至 setup 處理，以便捕捉載入狀態與錯誤
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

  // 1. 判斷 WebGL 支援度
  let canvasTest = document.createElement('canvas');
  let gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');

  if (!gl) {
    statusMessage = "❌ 錯誤：此裝置或瀏覽器不支援 WebGL，AI 功能無法執行。";
  } else {
    video = createCapture(VIDEO, { flipped: true });
    video.hide();

    // 2. 說明 ml5 模型載入成功與否
    statusMessage = "⏳ 正在載入 AI 模型，請稍候...";
    
    // 初始化模型並設定成功回呼函式
    handPose = ml5.handPose({ flipped: true }, () => {
      statusMessage = "✅ 模型載入成功！";
      // 模型確認載入後，才啟動偵測功能
      handPose.detectStart(video, gotHands);
    });

    // 嘗試捕捉 Promise 失敗的情況（如果 ml5 版本支援）
    if (handPose && typeof handPose.catch === 'function') {
      handPose.catch(err => {
        statusMessage = "❌ 模型載入失敗：" + err;
      });
    }
  }
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

  // 顯示狀態診斷訊息
  push();
  fill(255);
  stroke(0);
  strokeWeight(2);
  textSize(20);
  textAlign(CENTER);
  text(statusMessage, width / 2, 50);
  pop();

  // 顯示指定文字：414730654魏伯諺
  push();
  fill(0); // 黑色文字
  noStroke();
  textSize(32);
  textAlign(CENTER);
  text("414730654魏伯諺", width / 2, 100);
  pop();

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

          // 在指尖 (4, 8, 12, 16, 20) 產生水泡
          if ([4, 8, 12, 16, 20].includes(i)) {
            // 每隔幾幀產生一個泡泡，避免過多
            if (frameCount % 2 === 0) {
              bubbles.push(new Bubble(displayX, displayY));
            }
          }
        }
      }
    }
  }

  // 更新並繪製所有泡泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    // 如果泡泡生命結束或超出邊界，則移除 (破掉)
    if (bubbles[i].isFinished()) {
      bubbles.splice(i, 1);
    }
  }
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}

// 水泡類別
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(8, 20);
    this.speedY = random(2, 5); // 向上升的速度
    this.vx = random(-1, 1);    // 左右微震
    this.life = 255;            // 透明度，代表生命力
  }

  update() {
    this.y -= this.speedY;      // 向上飄
    this.x += this.vx;          // 左右晃動
    this.life -= 5;             // 逐漸變透明
  }

  display() {
    push();
    stroke(255, this.life);     // 白色邊框隨生命值變淡
    strokeWeight(1);
    fill(255, this.life * 0.3); // 淡淡的填充色
    circle(this.x, this.y, this.size);
    // 加一個亮點讓它看起來更像水泡
    noStroke();
    fill(255, this.life * 0.8);
    circle(this.x - this.size * 0.2, this.y - this.size * 0.2, this.size * 0.2);
    pop();
  }

  isFinished() {
    return this.life <= 0 || this.y < -this.size;
  }
}
