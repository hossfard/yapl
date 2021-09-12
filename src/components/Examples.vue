<template>
<div class="hello">
  <h1> Examples </h1>
  <div class="plot-container">
    <div id="plot1"></div>
    <div id="plot2"></div>
  </div>
</div>
</template>

<script>


import * as plt from '../yapl/Plot.js';


function generateRandomPoints(count, x0=4, A=3){
   let ret_x = [];
   let ret_y = [];
   let xlim = [0, 10];
   let ylim = [0, 1];
   let dx = (xlim[1] - xlim[0])/count;
   for (let i=0; i<count; ++i){
      let x = xlim[0] + dx*i;
      let y = x0 + A*Math.sin(x) + 1.5*Math.random() * (ylim[1] - ylim[0]) + ylim[0];
      ret_x.push(x);
      ret_y.push(y);
   }
   return {x: ret_x, y: ret_y};
}


export default {
   name: 'Examples',
   props: {
   },
   mounted: function(){
      this._plot1 = new plt.Plot('plot1', {
         width: 1400,
         height: 500
      });

      let d = generateRandomPoints(100)
      this._plot1.plot(d.x, d.y, {
         stroke: 'blue', strokeWidth: 3, label: 'p1'
      });

      d = generateRandomPoints(100, 3, 2)
      this._plot1.plot(
         d.x, d.y,
         {
            stroke: 'red',
            strokeWidth: 1,
            label: 'p2',
            dash: [5, 5]
         }
      );
      this._lpPoints = generateRandomPoints(100, 2, 3)
      this._lp = this._plot1.plot(
         this._lpPoints.x, this._lpPoints.y,
         {stroke: 'green', label: 'p4', markersize: 3}
      );

      this._plot2 = new plt.Plot('plot2', {
         width: 1400,
         height: 500,
         showTooltip: false
      });

      this._plot2.plot(generateRandomPoints(100), {
         stroke: 'blue', strokeWidth: 3, label: 'p1'
      });
      this._plot2.plot(
         generateRandomPoints(100, 3, 2),
         {
            stroke: 'red',
            strokeWidth: 1,
            label: 'p2',
            dash: [5, 5]
         }
      );
      this._plot2.plot(
         generateRandomPoints(100, 2, 3),
         {stroke: 'green', label: 'p4', markersize: 3}
      );
      // window.setTimeout(()=>{
      //    this._plot.setExtent(
      //       [-5, 15],
      //       [-2, 10]
      //    );
      // }, 2000);

   }
}
</script>

<style scoped lang="scss">
h3 {
    margin: 40px 0 0;
}
ul {
    list-style-type: none;
    padding: 0;
}
li {
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #42b983;
}

.plot-container{
    white-space: nowrap;
}

</style>
