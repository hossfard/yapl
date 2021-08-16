'use strict';


export class EventEmitter{
   constructor(){
      this._subscribers = {};
   }

   subscribe(event, observer){
      if (!(event in this._subscribers)){
         this._subscribers[event] = [];
      }
      this._subscribers[event].push(observer);
   }

   notify(event, data){
      let observers = this._subscribers[event];
      if (observers === undefined){
         return;
      }

      for (let obs of observers){
         obs(data);
      }
   }

   unsubscribe(event, cb){
      let observers = this._subscribers[event];
      if (observers === undefined){
         return false;
      }
      let obsIndex = observers.indexOf(cb);
      if (obsIndex < 0){
         return false;
      }
      observers.splice(obsIndex, 1);
      return true;
   }
}

