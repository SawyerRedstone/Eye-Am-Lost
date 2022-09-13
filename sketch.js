var sound, amplitude;
var volumeHistory = [];
var bandDistance;
var fft;

var eye = {
  x:0,
  display : function() {  
    push();
    translate(width/2, height/2);
    scale(0.6, 0.6);
    noStroke();
    
    // Sclera
    fill(255);
    ellipse(0, 0, 300, 300);
    noFill();
    
    // Rest of eye should move with mouse movement.
    push();
    translate(this.x, 0);
    
    // iris
    color1 = color(166, 179, 195);
    color2 = color(17, 49, 88);
    for (let i = 50; i < 150; i++) {
      sizeColor = map(i, 50, 150, 0, 1);
      stroke(lerpColor(color1, color2, sizeColor));
      ellipse(0, 0, i - min(i, abs(this.x)), i);   
    }

    // Dancing iris lines
    lineColor1 = color(255);
    lineColor2 = color(17, 49, 88);
    
    for (let i = 0; i < 360; i++) {
      let r = map(volumeHistory[i], 0, 1, 0, 250);
      stroke(lerpColor(lineColor1, lineColor2, volumeHistory[i]));
      if (r > 70) {
        r = 70;
      }
      let x = (r - min(r, abs(this.x)/2)) * cos(i);
      let y = r * sin(i);
      line(0, 0, x, y);
    }
    
    // pupil
    stroke(166, 179, 195);
    fill(0);
    ellipse(0, 0, 50 - min(40, abs(this.x)/2), 50);
    pop();
    
    // Reflection
    noStroke();
    fill(255, 200);
    ellipse(40, -25, 80, 30);
    pop();
  },
}

function preload(){
  sound = loadSound('Cycles.mp3');
}

function setup() {
  let cnv = createCanvas(512, 512);  // 512 = 2**9
  textAlign(CENTER);
  angleMode(DEGREES);
  
  cnv.mouseClicked(togglePlay);
  amplitude = new p5.Amplitude();
  
  // Make sure there are never less than 360 sounds stored.
  for (let i = 0; i < 360; i++){
    volumeHistory.push(0);
  }
  
  fft = new p5.FFT(0, 64);  // 512/64 = 4, so bands can be spread apart.
  bandDistance = width/64;
}

function draw() {
  
  background(50);
  
  // Sound lines
  let spectrum = fft.analyze();
  noFill();
  for (let i = 0; i < spectrum.length; i++){
    let amp = spectrum[i];
    let y = map(amp, 0, 256, height, height/2);
    stroke(56, 237, 255-i*i);
    line(i*bandDistance, height, i*bandDistance, y);
    line(width-i*bandDistance, 0, width-i*bandDistance, height-y);
  }
  
  let volume = amplitude.getLevel();
  stroke(166, 179, 195);
  if (volume == 0) {
    textSize(50);
    text("Where am I?", width/2, 60);
    textSize(40);
    text("It's so quiet...", width/2, 110);

    text("Maybe clicking will help.", width/2, height-60);
  }
  else {
    text("Ahh... sound.", width/2, 60);
    text("Now if only I had ears.", width/2, height-60);
  }
  
  // Add volume so iris can dance with the beat.
  volumeHistory.push(volume);
  if (volumeHistory.length > 360) {
    volumeHistory.splice(0, 1);
  }
  
  // Make iris only move within the eye.
  eye.x = min(120, map(mouseX, 0, width, -120, 120));
  eye.display();
}


function togglePlay() {
  if (sound.isPlaying() ){
    sound.pause();
  } else {
    sound.loop();
		amplitude = new p5.Amplitude();
		amplitude.setInput(sound);
  }
}

