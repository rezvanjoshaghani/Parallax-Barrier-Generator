
var val;
var ppi;
var resW;
var resH;
var d;
var ps;
var w;
var spGrid;
var spResW;
var spResH;
var dpi;
var dpiMc;

function fillExampleData(){
    ppi=326;
    resW=1334;
    resH=750;
    spGrid=5;
    d=5;
    dpi=1200;
    document.getElementById('pr:ppi').value=ppi;
    document.getElementById('pr:resW').value=resW;
    document.getElementById('pr:resH').value=resH;
    document.getElementById('pr:spg').value=spGrid;
    document.getElementById('pr:d').value=d;
    document.getElementById('pr:dpi').value=dpi;

    calculateValues();
    updateUI();
}


function calculateValues(){
    // convert pixel per inch to mm -> 25.4 mm/inch / ppi pixels/inch)
    ps=25.4/ ppi;
    w=ps*spGrid;
    fov=2*Math.atan(w/2*d)
    spResW=Math.floor(resW/spGrid);
    spResH=Math.floor(resH/spGrid);
    dpiMc=25.4/ dpi;
}

function procInputData(){
    ppi=document.getElementById('pr:ppi').value;
    resW=document.getElementById('pr:resW').value;
    resH=document.getElementById('pr:resH').value;
    spGrid=document.getElementById('pr:spg').value;
    d=document.getElementById('pr:d').value;
    dpi=document.getElementById('pr:dpi').value;
    calculateValues()
    updateUI();
    writeBarrierFile();
}




function updateUI(){
    document.getElementById('calc:ps').innerHTML=ps.toFixed(4);
    document.getElementById('calc:psMic').innerHTML=Math.ceil(ps*1000);
    document.getElementById('calc:w').innerHTML=w.toFixed(4);
    document.getElementById('calc:wm').innerHTML=Math.ceil(w*1000);
    document.getElementById('calc:fov').innerHTML=(fov*180/Math.PI).toFixed(2) +" degrees";
    document.getElementById('calc:srw').innerHTML=spResW;
    document.getElementById('calc:srh').innerHTML=spResH;
    document.getElementById('calc:dpi').innerHTML=dpiMc.toFixed(4);
    document.getElementById('calc:dpiMc').innerHTML=(dpiMc*1000).toFixed(1);
}

function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}

function writeBarrierFile(){
    let output='newpath\n';
    scale = ((1/ppi)/(1/72));
    scale=roundToTwo(scale)
    console.log("Scale:"+scale);
    startX = 100;
    startY = 100;
    endpointX=roundToTwo((resW/ppi)*72);
    endpointY=roundToTwo((resH/ppi)*72);
    console.log(endpointX);

    let count;
    for (let j=0;j<endpointY;j += scale*5) {
        count = 0
        startY += scale*5;
        for (let i = 0; i < endpointX; i += scale) {

            if (count % 5 === 2) {
                x1 = roundToTwo(startX + i);
                y1 = startY;
                x2 = x1;
                y2 = roundToTwo(startY + 2 * scale)
                output += x1 + " " + y1 + " " + "moveto\n"
                output += x2 + " " + y2 + " " + "lineto\n"

                y1 = roundToTwo(y2 + scale)
                y2 = roundToTwo(y2 + 3 * scale)

                output += x1 + " " + y1 + " " + "moveto\n"
                output += x2 + " " + y2 + " " + "lineto\n"
            } else {
                x1 = roundToTwo(startX + i);
                y1 = startY;
                x2 = x1;
                y2 = roundToTwo(startY + 5 * scale)
                output += x1 + " " + y1 + " " + "moveto\n"
                output += x2 + " " + y2 + " " + "lineto\n"
            }


            count++;
        }
    }
    console.log(count)

    output+= scale + ' setlinewidth\n';
    output+='stroke\n';

    console.log(output);

}