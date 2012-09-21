// Author: Takeharu.Oshida<br>
// repository: https://github.com/georgeOsdDev/chrome-app-storage-sample<br>
// Licence: MIT<br>

// __Namespace of App__
window.App ={
  sessionKey:null,
  objNo:0,
  objList:{},
  draggableOption:{
    scroll:false,
    opacity: 0.5,
    start:function(event,ui){
      startMoving(event,ui);
    },
    stop:function(event,ui){
      stopMoving(event,ui);
    }
  },
}

// __`onChange` eventListener__
// when data was updated by other device,
// Refresh Application
chrome.storage.onChanged.addListener(function(changes, namespace) {
  console.log("storage updated");
  if (changes["lastUpdUser"] 
      && changes["lastUpdUser"].newValue.sessionKey != App.sessionKey){
    // console.log("by another device");
    refreshApp(changes);
  } else {
    //console.log("by myself");
  }
});


// Dom ready
$(function(){

  // Bind `createObj` function to buttons
  // create object based on `data` attribute.
  $("#menu > a").each(function(index,domEle){
    var that = this;
    $(that).bind('click',function(){
      var dataJson = $.parseJSON($(that).attr('data'));
      createObj(dataJson,false);
    });
  });

  // bind `clearAll` function
  $("#clearBtn").bind('click',function(){
    clearAll();
  });

  // initialize Application.
  initialize();

})

// __Create Object__
// @param obj
// @param isInitialize
//
// Create DOM object.
// If it was triggerd by initailization phase, We don't save the new object to storage.
// Only it was triggerd by user, We save the new data to storage.
function createObj(obj,isInitialize){
  if(!obj) return;
  if ($('#'+obj.id)){
    console.log("!!!" +obj.id);
    $('#'+obj.id).remove();
  }
  var conts =""
      ,id = ""
      ,styleClass = obj.styleClass || ""
      ,color = obj.color || "";

  // if it is not Initialization phase,
  // get unique id.
  if(!isInitialize){
    obj.id = 'obj'+App.objNo;
    obj.body = "Edit and Drag Me.";
    App.objNo +=1;
  }
  id = obj.id;
  //switch inner element by its styleClass
  switch(styleClass){
    case "postit":
      var text = obj.body;
      conts = "<textarea class='post-"+color+"' col='5' row='10'>"+text+"</textarea>";
      break;
    case "stamp":
      conts ="<p style='color:"+color+"'>&"+obj.stamp+";</p>";
      break;
    default:
      console.log("ignore");
      return;
  }

  // Create DOM Element
  var elm = "<div id='"+id+"' class='"+styleClass+" btn-"+ color + " obj-init'>"
            +"<button type='button' class='close close-margin' data-dismiss='alert'><i class='icon-remove'></i></button>"
            +conts
            +"</div>";
  $('#mainboardDiv').append(elm);

  // watch inner text of postit
  $('#'+id+'> textarea').bind('keyup',function(){
    obj.body = $('#'+id+'> textarea').val();
    editObj(obj);
  });

  // bind jquery.UI's `draggable` and TwitterBootstrap's `closed` event
  $('#'+id)
  .draggable(App.draggableOption)
  .bind('closed',function(){
    console.log("closed");
    removeObj(obj);
  });

  // If it was initailized phase, apply position of object from storage
  if (isInitialize) {
    $('#'+id).css('top',obj.top).css('left',obj.left);
    App.objList[id] = obj;
  }else {
    // Else save on storage.
    obj.top = $('#'+id).css('top');
    obj.left = $('#'+id).css('left');    
    obj.body = $('#'+id+'> textarea').val();
    App.objList[id] = obj;
    save();
  }
  // And last, show element.
  $('#'+id).fadeIn();
}

// __startMoving__
// @param event
// @param ui
// do nothing when it start moving
function startMoving(event,ui){
}

// __stopMoving__
// @param event
// @param ui
// save object position when it stop moving.
function stopMoving(event,ui){
  var id = ui.helper.context.id;
  App.objList[id].top = ui.position.top;
  App.objList[id].left = ui.position.left;
  save();
}


// __removeObj__
// @param data
// When object was `removed`
function removeObj(data){
  console.log("remove");
  var id = data.id;
  // remove from DOM.
  $("#" + id).remove();
  // remove from Memory.
  App.objList[id] = null;
  // save change
  save();
}

// __editObj__
// @param data
// When object was `edited`
function editObj(data){
  var id = data.id;
  App.objList[id] = data;
  // save change
  save();
}

// __clearAll__
// Remove all objects
function clearAll(){
  // from DOM
  $("#mainboardDiv").empty();
  // from Memory
  App.objList = {};
  App.objNo = 0;
  // save change
  save();
}

// __Initialize__
function initialize(){
  console.log("initialize");
  // set sessionKey per device
  if (!App.sessionKey) App.sessionKey = navigator.platform+'#'+(+new Date());
  // get objects from Storage
  chrome.storage.sync.get(function(items){
    App.objNo = items.objNo || 0;
    App.objList = items.objList || {};
    for (var key in App.objList) {
      createObj(App.objList[key],true);
    }
  });
}

// __refreshApp__
function refreshApp(changes){
  if (!changes["objList"]) return;
  var newObjList = changes["objList"].newValue;
  var oldObjList = changes["objList"].oldValue;
  for (var key1 in newObjList){
    if (!oldObjList[key1]){
      createObj(newObjList[key1],true);      
    }else {
      for (var key2 in newObjList[key1]){
        if(newObjList[key1][key2] != oldObjList[key1][key2]){
          createObj(newObjList[key1],true);
          break;
        }
      }      
    }
  }
  for (key3 in oldObjList){
    if (!newObjList[key3]){
      $("#" + key3).remove();
      // remove from Memory.
      App.objList[key3] = null;
    }
  }  
}

// __save__
function save(){
  chrome.storage.sync.set({
    "objList":App.objList,
    "objNo":App.objNo,
    "lastUpdUser":{
      "sessionKey":App.sessionKey,
      "time":+new Date()
    }
  },function(){
    // console.log("saved");
  });
}
