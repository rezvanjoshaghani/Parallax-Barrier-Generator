// Authors: Rezvan Joshaghani   rezvanjoshaghani@u.boisestate.edu

// main stage that contains the canvas
var stage = new Konva.Stage({
    container: 'container',   // id of container <div>
    width: 2000,
    height: 1000
});

// The main layer that will contain all the shapes
// We need to all all the shapes to the layer after creating them so they get drawn
var layer = new Konva.Layer();

stage.add(layer);





for (let i=10;i<1000;i++){
    if (i%9<4){
        let l1 = new Konva.Line({
            points: [i,10,i,500],
            stroke: 'black',
            strokeWidth: 4px,
        });
        layer.add(l1);

        let l2 = new Konva.Line({
            points: [10,i,500,i],
            stroke: 'black',
            strokeWidth: 4
        });
        layer.add(l2);
    }



}

layer.batchDraw()