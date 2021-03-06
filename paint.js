var canvas = document.getElementById('canvas');
var context=canvas.getContext('2d');


// create backing canvas
var backCanvas = document.createElement('canvas');
backCanvas.width = canvas.width;
backCanvas.height = canvas.height;
var backCtx = backCanvas.getContext('2d');





function initial(){
  if (localStorage.savedPaintCanvas){ 
    var dataURL = JSON.parse(localStorage.savedPaintCanvas);
    var img = new Image;
    img.src = dataURL;
    img.onload = function () {
      context.drawImage(img, 0, 0);
    };
  }
}

initial();

var     dragging = false,
    dragStartLocation,
  snapshot, savedSnapshot;

function getCanvasCoordinates(event) {
    var x = event.clientX - canvas.getBoundingClientRect().left,
        y = event.clientY - canvas.getBoundingClientRect().top;

    return {x: x, y: y};
}

function takeSnapshot() {

    snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
   
}

function deleteStep() {
  console.log("time to draw");
context.clearRect(0, 0, canvas.width, canvas.height);
context.drawImage(backCanvas, 0,0);
}


function restoreSnapshot() {
   context.putImageData(snapshot, 0, 0);
}

function drawLine(position) {
   context.beginPath();
     context.moveTo(dragStartLocation.x, dragStartLocation.y);
    context.lineTo(position.x, position.y);
    context.stroke();
    localStorage.savedPaintCanvas =JSON.stringify(canvas.toDataURL());
   

}

function drawQCurve(position) {
   context.beginPath();
     context.moveTo(dragStartLocation.x, dragStartLocation.y);
     var cpx =  dragStartLocation.x;  var cpy=  position.x/2;
     context.quadraticCurveTo(cpx, cpy, position.x, position.y);
    context.stroke();
    localStorage.savedPaintCanvas =JSON.stringify(canvas.toDataURL());
    
}



function erase(position, esize) {
  if(dragging==true){
      context.clearRect(position.x, position.y, esize, esize);
      localStorage.savedPaintCanvas =JSON.stringify(canvas.toDataURL());
    takeSnapshot();
}
}


function drawFree(position) {
  if(dragging==true){
    context.lineTo(position.x, position.y);
    context.stroke();
    localStorage.savedPaintCanvas =JSON.stringify(canvas.toDataURL());
    takeSnapshot();
}
}

function drawCircle(position) {
    var radius = Math.sqrt(Math.pow((dragStartLocation.x - position.x), 2) + Math.pow((dragStartLocation.y - position.y), 2));
    context.beginPath();
    context.arc(dragStartLocation.x, dragStartLocation.y, radius, 0, 2 * Math.PI, false);
localStorage.savedPaintCanvas =JSON.stringify(canvas.toDataURL());

}

function drawPolygon(position, sides, angle) {
    var coordinates = [],
        radius = Math.sqrt(Math.pow((dragStartLocation.x - position.x), 2) + Math.pow((dragStartLocation.y - position.y), 2)),
        index = 0;

    for (index = 0; index < sides; index++) {
        coordinates.push({x: dragStartLocation.x + radius * Math.cos(angle), y: dragStartLocation.y - radius * Math.sin(angle)});
        angle += (2 * Math.PI) / sides;
    }

      context.beginPath();
    context.moveTo(coordinates[0].x, coordinates[0].y);
    for (index = 1; index < sides; index++) {
        context.lineTo(coordinates[index].x, coordinates[index].y);
localStorage.savedPaintCanvas =JSON.stringify(canvas.toDataURL());
    }

    context.closePath();
}

function draw(position) {
  
    var fillBox = document.getElementById("fillBox"),
        shape = document.querySelector('input[type="radio"][name="shape"]:checked').value,
        polygonSides = document.getElementById("polygonSides").value,
        polygonAngle = document.getElementById("polygonAngle").value,
      lineCap = document.querySelector('input[type="radio"][name="lineCap"]:checked').value,
      eraseDim = document.getElementById("eraseArea").value,
        composition = document.querySelector('input[type="radio"][name="composition"]:checked').value;
   
    context.lineCap = lineCap;
    context.globalCompositeOperation = composition;
    
    if (shape === "eraser") {
      erase(position, eraseDim);
    }

    if (shape === "free") {
        drawFree(position);
    }

    if (shape === "circle") {
        drawCircle(position);
    }
    if (shape === "line") {
        drawLine(position);
    }

    if (shape === "qcurve") {
        drawQCurve(position);
    }

    if (shape === "polygon") {
        drawPolygon(position, polygonSides, polygonAngle * (Math.PI / 180));
    }

    if (shape !== "line" && shape !== "free" && shape!=="bcurve") {
        if (fillBox.checked) {
            context.fill();
            localStorage.savedPaintCanvas =JSON.stringify(canvas.toDataURL());

        } else {
            context.stroke();
            localStorage.savedPaintCanvas =JSON.stringify(canvas.toDataURL());

        }
    }
  
}


function dragStart(event) {
 
     dragging = true;
    dragStartLocation = getCanvasCoordinates(event);
  backCtx.drawImage(canvas, 0,0);
    takeSnapshot();
    context.beginPath();
    context.moveTo(dragStartLocation.x, dragStartLocation.y);
    canvas.addEventListener('mousemove', drag, false);

}

function drag(event) {
 
    var position;
    if (dragging === true) {

    
        restoreSnapshot();
        position = getCanvasCoordinates(event);
        draw(position);
       
    }
}

function dragStop(event) {
  
    dragging = false;
    restoreSnapshot();
    var position = getCanvasCoordinates(event);
    draw(position);

}

function changeLineWidth() {
    context.lineWidth = this.value;
    event.stopPropagation();
}

function changeFillStyle() {
    context.fillStyle = this.value;
    event.stopPropagation();
}

function changeStrokeStyle() {
    context.strokeStyle = this.value;
    event.stopPropagation();
}

function changeBackgroundColor() {
    context.save();
    context.fillStyle = document.getElementById("backgroundColor").value;
    context.fillRect(0, 0, canvas.width, canvas.height);
    localStorage.savedPaintCanvas =JSON.stringify(canvas.toDataURL());
    context.restore();
}

function eraseCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
 backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
}

function init() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    var lineWidth = document.getElementById("lineWidth"),
        fillColor = document.getElementById("fillColor"),
        strokeColor = document.getElementById("strokeColor"),
        canvasColor = document.getElementById("backgroundColor"),
        clearCanvas = document.getElementById("clearCanvas");
    deleteLastStep = document.getElementById("deleteLastStep");
    context.strokeStyle = strokeColor.value;
    context.fillStyle = fillColor.value;
    context.lineWidth = lineWidth.value;


    canvas.addEventListener('mousedown', dragStart, false);
    canvas.addEventListener('mousemove', drag, false);
    canvas.addEventListener('mouseup', dragStop, false);
    lineWidth.addEventListener("input", changeLineWidth, false);
    fillColor.addEventListener("input", changeFillStyle, false);
    strokeColor.addEventListener("input", changeStrokeStyle, false);
    canvasColor.addEventListener("input", changeBackgroundColor, false);
    clearCanvas.addEventListener("click", eraseCanvas, false);
    deleteLastStep.addEventListener("click", deleteStep, false);
}


window.addEventListener('load', init, false);


function slideOpen(el){
el.style.transition="height 0.5s linear 0s";
el.style.height="100%";
el.style.visibility="visible";
}

function slideClose(el){
  
 
el.style.transition="height 1.0s linear 0s";
el.style.height="0px";
el.style.border="none";
}


function loadImageFileAsURL()
{

  

    var filesSelected = document.getElementById("inputFileToLoad").files;
    if (filesSelected.length > 0)
    {
        var fileToLoad = filesSelected[0];

        if (fileToLoad.type.match("image.*"))
        {
            var fileReader = new FileReader();
            fileReader.onload = function(fileLoadedEvent) 
            {
                var imageLoaded = document.createElement("img");
                imageLoaded.src = fileLoadedEvent.target.result;
                //   canvas.appendChild(imageLoaded);     
                context.drawImage(imageLoaded,10,10,200,200);  
localStorage.savedPaintCanvas =JSON.stringify(canvas.toDataURL());
                
            };
            fileReader.readAsDataURL(fileToLoad);
        }
    }

}
