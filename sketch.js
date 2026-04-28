let capture;

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏原始的 HTML 影片元件，只顯示在畫布上
  capture.hide();
}

function draw() {
  // 設定背景顏色
  background('#e7c6ff');

  // 計算影像寬高為畫布的 50%
  let vWidth = width * 0.5;
  let vHeight = height * 0.5;
  // 計算置中位置
  let x = (width - vWidth) / 2;
  let y = (height - vHeight) / 2;

  // 繪製影像
  image(capture, x, y, vWidth, vHeight);
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}