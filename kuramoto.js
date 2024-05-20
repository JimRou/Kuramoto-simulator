/*
Modèle de Kuramoto
 dec. 2023 - © J.ROUSSSEL
 */
let oscillateurs=[];
var time;// variable temporelle
const h=0.01;//pas temporel
let K;//couplage
let n;//nombre d'oscillateurs
let sigma;//dispersion (écart-types) des fréquences propres autour de w0=1 rad/s
let Scos, Ssin;//somme des cos et des sin
let p;//paramètre d'ordre (vecteur)
let pprec;//paramètre d'ordre précédent
//-------- GUI
var FS1, FS2; //taille de police
let pauseButton, resetButton;
let sliderN;//slider pour régler le nombre d'oscillateurs
let sliderD;//slider pour régler la dispersion des fréquences propres
let sliderK;//slider pour régler la constante de couplage
let Ptitre, Poscillateur, Psynchronisation;//balises <p>
var stop=false;//booléen pour mettre en pause
//------ graphe
var Gp;// calque pour |p|=f(t)
var ww, hh;// width et height du calque


function setup() {
  createCanvas(windowWidth, windowWidth/2);//on impose un format 2x1
  angleMode(RADIANS);
  textAlign(LEFT, TOP);
  rectMode(LEFT, CENTER);
  FS1=int(12+height/50);
  FS2=int(8+height/100);
  textSize(FS2);
  time=0;
  K=1;
  n=400;
  sigma=.5;
  Scos=0;
  Ssin=0;
  for (let i = 0; i < n; i++) {
    oscillateurs.push(new Osc(lorentz(1, sigma)));
  }
  // -- Calcul du paramètre d'ordre --
  for (let i = 0; i < oscillateurs.length; i++) {
    Scos+=cos(oscillateurs[i].theta);
    Ssin+=sin(oscillateurs[i].theta);
  }
  pprec=createVector(Scos/n, Ssin/n);
  Ptitre=createP();
  Ptitre.html('<img width=\"50%\" src=\"kuramoto.png"  alt=\"Formule de Kuramoto\">');
  Ptitre.position(width/20, 0);
  Ptitre.style('color:white;font-weight: bold;font-family:-apple-system,BlinkMacSystemFont,Roboto,Oxygen-Sans,Ubuntu,Cantarell,sans-serif;');
  pauseButton=createButton("Play/Pause");
  pauseButton.mousePressed(togglePause);
  pauseButton.position(11*width/20, FS1+FS2);
  pauseButton.style('font-size:'+FS2+'px;');
  resetButton=createButton("Reset");
  resetButton.style('font-size:'+FS2+'px;');
  resetButton.position(pauseButton.x+pauseButton.width+FS1, pauseButton.y);
  resetButton.mousePressed(toggleReset);
  Poscillateur=createP('OSCILLATEURS');
  Poscillateur.position(11*width/20, resetButton.y+FS1);
  Poscillateur.style('color:white;font-weight: bold;font-family: -apple-system,BlinkMacSystemFont,Roboto,Oxygen-Sans,Ubuntu,Cantarell,sans-serif;');
  sliderN = createSlider(10, 1000, n, 10);
  sliderN.position(11*width/20, resetButton.y+3*FS1);
  sliderN.size(width/5);
  sliderN.input(changeN);
  sliderD = createSlider(0, 1, sigma, '.1');
  sliderD.position(11*width/20, sliderN.y+2*FS2);
  sliderD.size(width/5);
  sliderD.input(changeD);
  Psynchronisation=createP('SYNCHRONISATION');
  Psynchronisation.position(11*width/20, sliderD.y+2*FS2);
  Psynchronisation.style('color:white;font-weight: bold;font-family: -apple-system,BlinkMacSystemFont,Roboto,Oxygen-Sans,Ubuntu,Cantarell,sans-serif;');
  sliderK = createSlider(0, 10, K, '.1');
  sliderK.position(11*width/20, Psynchronisation.y+2*FS1);
  sliderK.size(width/5);
  sliderK.input(changeK);
  Gp = createGraphics('.4'*width, '.4'*height);
  initCourbe();
}


function draw() {
  background(64);
  // -- mise à jour des phases des oscillateurs (équation de Kuramoto) --
  for (let i = 0; i < oscillateurs.length; i++) {
    oscillateurs[i].theta+=h*(oscillateurs[i].w+K*pprec.mag()*sin(pprec.heading()-oscillateurs[i].theta));
    oscillateurs[i].display();
  }
  // Calcul du paramètre d'ordre
  Scos=0;
  Ssin=0;
  for (let i = 0; i < oscillateurs.length; i++) {
    Scos+=cos(oscillateurs[i].theta);
    Ssin+=sin(oscillateurs[i].theta);
  }
  p=createVector(Scos/n, Ssin/n);
  time+=1;
  displayPO();
  pprec=p;
  //GUI
  fill(255);
  text('N = '+n, sliderN.x  + sliderN.width + 10, sliderN.y);
  text('Dispersion des fréquences', sliderD.x  + sliderD.width+10, sliderD.y-0.5*FS2);
  text('\u03B3 = '+sigma+' rad/s', sliderD.x  + sliderD.width+10, sliderD.y+0.5*FS2);
  text('Couplage K = '+K, sliderK.x  + sliderK.width+10, sliderK.y);
  image(Gp, sliderN.x, '.6'*height);
}

function initCourbe() {
  // pour réinitialiser la courbe
  ww=Gp.width;
  hh=Gp.height;
  const hh0='.8'*hh; //correspondant à p=1
  Gp.strokeWeight(1);
  Gp.stroke(153, 153, 153, 100);
  Gp.line(0, 0, 0, hh);
  Gp.line(0, hh, ww, hh);
  Gp.push();
  Gp.translate(0, hh-hh0);
  for (let i = 0; i < 20; i++) {
    Gp.line(0, 0, 10, 0);
    Gp.translate(ww/20, 0);
  }
  Gp.pop();
  //echelles
  Gp.stroke(255);
  Gp.fill(255);
  Gp.textAlign(CENTER, TOP);
  Gp.textSize(FS2);
  Gp.text("évolution du paramètre d'ordre", ww/2, 0);
  Gp.textAlign(LEFT, TOP);
  Gp.text(" |p|", 0, 0);
  Gp.textAlign(RIGHT, BOTTOM);
  Gp.text("|p| = 1", ww-20, hh-hh0);
  Gp.text("t", ww, hh);
}

function normale(mean, sigma) {
  // Get a gaussian random number w/ mean of 0 and standard deviation of 1.0
  const val = randomGaussian();
  return mean+val*sigma;
}

//f(x)=(1/π)*gamma/[(x-center)^2+gamma^]
//x=gamma* tan[π(y-0,5)]+center avec y une varaible aléatoire uniforme sur [0,1]
function lorentz(center, gamma) {
  const val = random();
  return gamma*tan(PI*(val-0.5))+center;
}

function displayPO() {
  const pmax=height/4;
  strokeWeight(3);
  push();
  translate(width/4, height/2);
  stroke(255, 0, 0);
  line(0, 0, pmax*p.x, pmax*p.y);
  circle(pmax*p.x, pmax*p.y, 5, 5);
  strokeWeight(1);
  stroke(0);
  point(0, 0);
  stroke(128);
  line(-height/4, 0, height/4, 0);
  line(0, -height/4, 0, height/4);
  pop();
  Gp.stroke(0, 168, 255);
  Gp.line((time-1)%ww, map(pprec.mag(), 0, 1, hh, 0.2*hh), time%ww, map(p.mag(), 0, 1, hh, 0.2*hh));
  var I=time%ww-(time-1)%ww;
  if (I<0) {
    Gp.background(64);
    initCourbe();
  }
}



function togglePause() {
  stop=!stop;
  if (stop) {
    noLoop();
  } else {
    loop()
  }
}

function toggleReset() {
  for (let i = 0; i < n; i++) {
    oscillateurs.pop();
  }
  for (let i = 0; i < n; i++) {
    oscillateurs.push(new Osc(lorentz(1, sigma)));
  }
  loop();
}

function changeN() {
  for (let i = 0; i < n; i++) {
    oscillateurs.pop();
  }
  n=sliderN.value();
  for (let i = 0; i < n; i++) {
    oscillateurs.push(new Osc(lorentz(1, sigma)));
  }
}

function changeD() {
  for (let i = 0; i < n; i++) {
    oscillateurs.pop();
  }
  sigma=sliderD.value();
  for (let i = 0; i < n; i++) {
    oscillateurs.push(new Osc(lorentz(1, sigma)));
  }
}

function changeK() {
  K=sliderK.value();
}

function windowResized() {
  resizeCanvas(windowWidth, windowWidth/2);
  FS1=int(12+height/50);
  FS2=int(8+height/100);
  textSize(FS2);
  pauseButton.position(11*width/20, FS1+FS2);
  pauseButton.style('font-size:'+FS2+'px;');
  resetButton.position(pauseButton.x+pauseButton.width+FS1, pauseButton.y);
  resetButton.style('font-size:'+FS2+'px;');
  Ptitre.position(width/20, 0);
  Poscillateur.position(11*width/20, resetButton.y+FS1);
  Poscillateur.style('font-size:'+FS2+'px;');
  sliderN.position(11*width/20, resetButton.y+3*FS1);
  sliderN.size(width/5);
  sliderN.style('font-size:'+FS2+'px;');
  sliderD.position(11*width/20, sliderN.y+2*FS2);
  sliderD.size(width/5);
  sliderD.style('font-size:'+FS2+'px;');
  Psynchronisation.position(11*width/20, sliderD.y+2*FS2);
  Psynchronisation.style('font-size:'+FS2+'px;');
  sliderK.position(11*width/20, Psynchronisation.y+2*FS1);
  sliderK.size(width/5);
  sliderK.style('font-size:'+FS2+'px;');
  Gp = createGraphics('.4'*width, '.4'*height);
  initCourbe();
  toggleReset();
}


/*Objet Oscillateur*/
class Osc {
  constructor(pulsation) {
    this.theta = random(0, TWO_PI);
    this.w = pulsation;
    this.r = random(height/4, height/3);
    this.speed = 1;
  }

  display() {
    //noStroke();
    stroke(255, 40);
    fill(255, 40);
    push();
    translate(width/4, height/2);
    rotate(this.theta);
    ellipse(this.r, 0, 10, 10);
    pop();
  }
}
