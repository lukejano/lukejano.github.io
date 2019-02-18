var song, canvas;
var bars = 128, circleBars = 256;
var yOffset = -40;
var xBorder = $(window).width(); //1024
var yBorder = $(window).height()+yOffset; //660
var loops = 0;
var visType="bar";
var fft, amp;
var barBorders;
var c1, c2;
var spacing = 1; 
var removedbars = 0;
var innerCircleMain = 150;
var polygon_points = 3;
var polygon_speed = 10;
var polyRot = 0;
var polygon_style = 1;
var polygon_maxSize = 400;
var bg_color = 0;
var selectedColor = 1;
var waveform_size = .8;
var sine_size = .8;
var sine_freq = .5;

/* global p5 $ TWO_PI resizeCanvas createCanvas Slider loadSound URL color background 
fill stroke lerpColor line PI push translate pop rotate beginShape vertex endShape map 
rect lerpColor CLOSE sin cos */

/*
==============
Setup Stuffs
==============
*/

function windowResized() {
  xBorder = $(window).width(); //1024
  yBorder = $(window).height()+yOffset; //660
  resizeCanvas(xBorder, yBorder);
}

function setup() {
  canvas = createCanvas(xBorder, yBorder);
  /*c1 = color(255, 255, 0);
  c2 = color(255, 102, 0);*/
  setColor1("#FFFF00");
  setColor2("#FF6600");
  hideEverything();
  $("#bar-options").removeClass("options-hidden");
  $("#startup-modal").modal('toggle');

  fft = new p5.FFT();
  amp = new p5.Amplitude();
}

/*
==============
DOM Stuffs
==============
*/

var volumeSlider = new Slider("#volume-slider", {});
volumeSlider.on('slide', changeVolume);

var barsSlider = new Slider("#bars-slider", {});
barsSlider.on('slide', changeBars);

var circleBarsSlider = new Slider("#circle-bars-slider", {});
circleBarsSlider.on('slide', changeCircleBars);

var circleOffsetSlider = new Slider("#circle-offset-slider", {});
circleOffsetSlider.on('slide', changeCircleOffset);

var polygonPointsSlider = new Slider("#polygon-points-slider", {});
polygonPointsSlider.on('slide', changePolyPoints);

var polygonRotationSlider = new Slider("#polygon-rotation-slider", {});
polygonRotationSlider.on('slide', changePolyRot);

var waveformSizeSlider = new Slider("#waveform-size-slider", {
  formatter: function(v) {
    return v + "%";
  }
});
waveformSizeSlider.on('slide', changeWaveformSize);

var sineSizeSlider = new Slider("#sine-size-slider", {
  formatter: function(v) {
    return v + "%";
  }
});
sineSizeSlider.on('slide', changeSineSize);

var sineFreqSlider = new Slider("#sine-freq-slider", {
  formatter: function(v) {
    return v + "%";
  }
});
sineFreqSlider.on('slide', changeSineFreq);

function changeVolume() {
  if (typeof song != "undefined") {
    song.setVolume(volumeSlider.getValue()/11);
  }
}

function changeBars() {
  if (barsSlider.getValue()+3 <= 10) {
    bars = Math.pow(2, barsSlider.getValue()+3);
  } else {
    bars = 1024;
  }
  //console.log(Math.pow(2, barsSlider.getValue()+3));
}

function changeCircleBars() {
  if (circleBarsSlider.getValue()+4 <= 10) {
    circleBars = Math.pow(2, circleBarsSlider.getValue()+4);
  } else {
    circleBars = 1024;
  }
}

function changeCircleOffset() {
  spacing = circleOffsetSlider.getValue();
}

function changePolyPoints() {
  polygon_points = polygonPointsSlider.getValue();
}

function changePolyRot() {
  polygon_speed = polygonRotationSlider.getValue();
}

function changeWaveformSize() {
  waveform_size = waveformSizeSlider.getValue()/100;
}

function changeSineSize() {
  sine_size = sineSizeSlider.getValue()/100;
}

function changeSineFreq() {
  sine_freq = sineFreqSlider.getValue()/100;
}

$("#border-box").change(function() {
  barBorders = ($(this).is(":checked"));
});

$("#vis-selector").change(function() {
  visType = $("#vis-selector").val();
})

$("#options-selector").change(function() {
  if ($("#options-selector").val() === "custom") {
    $("#custom-vis").removeClass("options-hidden");
    $("#premade-vis").addClass("options-hidden");
    $("#input-vis").addClass("options-hidden");
  } else if ($("#options-selector").val() === "premade") {
    $("#custom-vis").addClass("options-hidden");
    $("#premade-vis").removeClass("options-hidden");
    $("#input-vis").addClass("options-hidden");
  } else if ($("#options-selector").val() === "input") {
    $("#custom-vis").addClass("options-hidden");
    $("#premade-vis").addClass("options-hidden");
    $("#input-vis").removeClass("options-hidden");
  }
})

$("#vis-selector").change(function() {
  hideEverything();
  if($("#vis-selector").val() === "bar") {
    $("#bar-options").removeClass("options-hidden");
  }  else if($("#vis-selector").val() === "circle") {
    $("#circle-options").removeClass("options-hidden");
  } else if($("#vis-selector").val() === "polygon") {
    $("#polygon-options").removeClass("options-hidden");
  } else if ($("#vis-selector").val() === "wave") {
    $("#sine-options").removeClass("options-hidden");
  } else if ($("#vis-selector").val() === "waveform") {
    $("#waveform-options").removeClass("options-hidden");
  } else {
    console.log("don't hack this pls")
  }
})

function hideEverything() {
  $("#bar-options,#circle-options,#polygon-options,#sine-options,#waveform-options").addClass("options-hidden");
}

$(document).ready(function(){
  
  //Change made 2-13-19
  //For some reason on firefox, the button wasn't working - hopefully this will fix?
  $("#input-button").click(function() {
    $("#audio-input").click();
  });

  $("#settings-btn,#color-btn,#bar-btn,#circle-btn,#polygon-btn,#sine-btn,#waveform-btn").click(function(){
    collapseAll();
  });

  function collapseAll() {
    $("#settings-collapse,#color-collapse,#bar-collapse,#circle-collapse,#polygon-collapse,#sine-collapse,#waveform-collapse").collapse("hide");
  }
  
  collapseAll();
});

function infoPopup(msg, dly) {
  $.notify({
    message: msg,
    icon: "fas fa-info-circle"
  },{
    type: 'info',
    allow_dismiss: true,
    animate: {
		  enter: 'animated fadeInDown',
		  exit: 'animated fadeOutUp'
	  },
    delay: dly
  })
}

function infoModal() {
  $('#startup-modal').modal('hide');
  $('#info-modal').modal('show');
}

function infoModal2() {
  $('#info-modal').modal('hide');
  $('#info-modal2').modal('show');
}
/*
==============
Color Stuffs
==============
*/
$('#color1').colorpicker({
  color: '#FFFF00',
  format: 'rgb',
  inline: true,
  container: "#colorpicker-container"
}).on('changeColor', function(e) {
  if (selectedColor === 1) {
    setColor1(e.color.toString('rgba'));
  } else if (selectedColor === 2) {
    setColor2(e.color.toString('rgba'));
  }
});

$("#color1-button").click(function() { selectedColor = 1; setColor1($('#color1').colorpicker('getValue')) } );
$("#color2-button").click(function() { selectedColor = 2; setColor2($('#color1').colorpicker('getValue')) } );

function setColor1(s_color) {
  $("#color1-ex").css('background-color', s_color);
  c1 = color(s_color);
  //console.log(s_color)
}

function setColor2(s_color) {
  $("#color2-ex").css('background-color', s_color);
  //console.log(s_color)
  c2 = color(s_color);
}

$("#preloaded-play").click(function(){
  if(typeof song != "undefined") { // Catch already playing songs
    song.disconnect();
    song.stop();
  }
  song = loadSound("/audio/" + $("#preloaded-select").val());
  infoPopup("Note: It may take some time to load preloaded audio samples", 3000);
});

$("#input-play").click(function() {
  song = new p5.AudioIn();
  song.start();
  fft.setInput(song);
})

/*
==============
Audio Input Stuffs
==============
*/

var loader = document.querySelector(".loader");

document.getElementById("audio-input").onchange = function(event) {
    if(event.target.files[0]) {
        if(typeof song != "undefined") { // Catch already playing songs
            song.disconnect();
            song.stop();
        }
        song = loadSound(URL.createObjectURL(event.target.files[0]));
    }
}

/*
==============
Draw Stuffs
==============
*/

function condenseArray(ary, scaleDown) {
  if (scaleDown < 1) {
    scaleDown = 1;
  }
  var newAry = [];
  for(var i = 0; i<ary.length; i+= scaleDown) {
    var sum = 0;
    for (var j = 0; j<scaleDown;j++) {
      sum += ary[i+j];
    }
    newAry.push(sum/scaleDown);
  }
  return newAry;
}

function regularPolygon(x, y, radius, npoints) {
  /* Algorithm from p5 documentation - https://p5js.org/examples/form-regular-polygon.html */
  var angle = TWO_PI / npoints;
  beginShape();
  for (var a = 0; a < TWO_PI; a += angle) {
    var sx = x + cos(a) * radius;
    var sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function draw() {
    try {
      if (typeof song != "undefined" && song.isLoaded() && !song.isPlaying()) { // Do once
          loader.classList.remove("loading");
  
          changeVolume();
          song.play();
  
          //fft.waveform();
          //fft.smooth(0.85);
  
      }
    } catch (e) {
      //console.log("expected")
      
    }

    loops += 1;
    polyRot += polygon_speed;
    background(bg_color);

    var spectrum = fft.analyze();
    var waveform = fft.waveform();

    //Coloring
    //var c1 = color(255, 255, 0);
    //var c2 = color(255, 102, 0);
    //var c1 = color(100, 255, 255);
    //var c2 = color(0, 255, 0);
    //Bars
    if (visType === "circle") {
        if (typeof song == "undefined") {
          return;
        }
        if (circleBars < 1) {
          circleBars = 1;
        }
        var circle_maxSize = xBorder>yBorder?yBorder/2:xBorder/2;
        var adjBar = circleBars - removedbars > 0?circleBars - removedbars:1;
        //Data In
        var cSpect = condenseArray(spectrum, Math.floor(1024 / circleBars));
        var data = cSpect; //Change this for different analysis
        //Circles
        var multiplier = 1;
        //Rhythm Cirlce
        var audioLvl = amp.getLevel() * 2000 + innerCircleSize * 2;
        //Properties
        var lim = 0; //Set Lim to -1 for no limit
        //Set spacing to 1 for normally spaced bars/187 for opposite bars    
        for(var i = 1; i < adjBar; i++) {
          var innerCircleSize = innerCircleMain;
          var adjHeight = map(data[i], 0, 255, 0, circle_maxSize-(innerCircleSize/2));
          var adjPrevHeight = data[i - 1] * (yBorder / 255) * 1.2;
          var baseX = Math.cos(i * (360 / adjBar) * spacing / 180 * PI) * innerCircleSize + xBorder / 2;
          var baseY = Math.sin(i * (360 / adjBar) * spacing / 180 * PI) * innerCircleSize + yBorder / 2;
          var deltaX = Math.cos(i * (360 / adjBar) * spacing / 180 * PI) * (innerCircleSize + adjHeight) + xBorder / 2;
          var deltaY = Math.sin(i * (360 / adjBar) * spacing / 180 * PI) * (innerCircleSize + adjHeight) + yBorder / 2;
          if (Math.abs(baseX - deltaX) > Math.abs(lim && baseY - deltaY) > lim) {
              stroke(lerpColor(c1, c2, data[i] * 1.5 / 255));
              line(baseX, baseY, deltaX, deltaY);
          }
        }
    } else if (visType === "bar") {
        if (typeof song == "undefined") {
          return;
        }
        if (bars < 1) {
          bars = 1;
        }
        adjBar = bars - removedbars > 0 ? bars - removedbars:1;
        var barWidth = xBorder / bars;
        //Data In
        cSpect = condenseArray(spectrum, Math.floor(1024 / bars)); 
        data = cSpect; //Change this for different analysis
        for (var i = 0; i < bars; i++) {
            adjHeight = data[i] * (yBorder / 255);
            if (!barBorders) {
              stroke(lerpColor(c1, c2, data[i] * 1.5 / 255));
            } else {
              stroke(0);
            }
            fill(lerpColor(c1, c2, data[i] * 1.5 / 255));
            rect(i * barWidth, yBorder - Math.abs(adjHeight), barWidth, yBorder + 500);
        }
    } else if (visType == "wave") {
      var ampli = fft.getEnergy($("#sine-freq-selector").val());
      var points = xBorder;
      var ccolor = lerpColor(c1, c2, map(ampli, 0, 255, 0, 1));
      if ($("#sine-filled-box").is(":checked")) {
        fill(ccolor);
      } else {
        fill(bg_color);
      }
      stroke(ccolor);
      beginShape();
      if (typeof song == "undefined") {
        return;
      }
      var amplitude = map(ampli, 0, 255, 0, map(sine_size, 0, 1, 0, yBorder/2));//5*(loops%200)>99?-(loops%100)+50:(loops%100)-50;
      var frequency = map(sine_freq, 0, 1, 0, 300);//5*(loops%200)>99?-(loops%100)+50:(loops%100)-50;
      for (var i = 0; i < points; i++) {
          vertex(i, yBorder/2+sin(i/frequency+loops/5)*amplitude);
      }
      vertex(xBorder, yBorder);
      vertex(0, yBorder);
      endShape(CLOSE);
    } else if (visType == "polygon") {
      polygon_maxSize = xBorder>yBorder?yBorder/2:xBorder/2;
      var npoints = polygon_points;
      var polySize = map(fft.getEnergy($("#polygon-freq-selector").val()), 0, 255, 0, polygon_maxSize);
      //fill(lerpColor(c1, c2, map(fft.getEnergy("bass"), 0, 255, 0, yBorder/2)));
      if ($("#polygon-style-selector").val() == "inverse") {
        polygon_style = 1;
      } else if ($("#polygon-style-selector").val() == "contract") {
        polygon_style = 2;
      } else {
        polygon_style = 3;
      }
      var colorChange = lerpColor(c1, c2, map(polySize, 0, polygon_maxSize, 0, 1));
      if (polygon_style === 1) {
        fill(colorChange);
        stroke(colorChange);
        push();
        translate(xBorder*0.5, yBorder*0.5);
        rotate(polyRot/1000);
        regularPolygon(0,0,polygon_maxSize,npoints);
        pop();
        fill(bg_color);
        push();
        translate(xBorder*0.5, yBorder*0.5);
        rotate(polyRot/1000);
        regularPolygon(0, 0, polygon_maxSize-polySize, npoints);
        pop();
      } else if (polygon_style === 2) {
        fill(colorChange);
        stroke(colorChange);
        push();
        translate(xBorder*0.5, yBorder*0.5);
        rotate(polyRot/1000);
        regularPolygon(0,0,polygon_maxSize,npoints);
        pop();
        fill(bg_color);
        push();
        translate(xBorder*0.5, yBorder*0.5);
        rotate(polyRot/1000);
        regularPolygon(0, 0, polySize, npoints);
        pop();
      } else {
        fill(colorChange);
        stroke(colorChange);
        push();
        translate(xBorder*0.5, yBorder*0.5);
        rotate(polyRot / 1000);
        /*map(amp.getLevel(), 0, song.getVolume())*/
        regularPolygon(0, 0, polySize, npoints);
        pop();
      }
    } else if (visType == "waveform") {
      var wave = fft.waveform();
      var w_points = xBorder;
      var lcolor = lerpColor(c1, c2, amp.getLevel()*1.8);
      if ($("#waveform-filled-box").is(":checked")) {
        fill(lcolor);
      } else {
        fill(bg_color);
      }
      stroke(lcolor);
      beginShape();
      if (typeof song == "undefined") {
        return;
      }
      var wave_shown = map(waveform_size, 0, 1, 0, wave.length);
      for (var i = 0; i < wave_shown; i++) {
          vertex(map(i, 0, wave_shown, 0, w_points), map(wave[i], -1, 1, yBorder, 0));
      }
      vertex(xBorder, yBorder);
      vertex(0, yBorder);
      endShape(CLOSE);
    } else {
      console.log("Don't hack this pls");
    }
}