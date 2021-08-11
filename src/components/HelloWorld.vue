<template>
<div class="hello">
  <h1>{{ msg }}</h1>
  <div id="container"></div>
</div>
</template>

<script>


import * as plt from './Plot.js';


export default {
   name: 'HelloWorld',
   props: {
      msg: String
   },
   mounted: function(){
      this._plot = new plt.Plot();
      this._plot.plot(plt.generateRandomPoints(100), {
         stroke: 'blue', strokeWidth: 3, label: 'p1'
      });
      this._plot.plot(
         plt.generateRandomPoints(100),
         {stroke: 'red', strokeWidth: 1, label: 'p2'}
      );
      this._plot.plot(
         plt.generateRandomPoints(100),
         {stroke: 'green', label: 'p4'}
      );
      window.setTimeout(()=>{
         this._plot.setExtent(
            [-5, 15],
            [-2, 10]
         );
      }, 2000);

   }
}
</script>

<style scoped>
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
#container{
    border: solid black 1px;
}
</style>
