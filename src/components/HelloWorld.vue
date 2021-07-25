<template>
<div class="hello">
  <h1>{{ msg }}</h1>
  <div id="container"></div>
</div>
</template>

<script>


import {Plot} from './Plot.js';


export default {
   name: 'HelloWorld',
   props: {
      msg: String
   },
   mounted: function(){
      this._canvas = new Plot();
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
