// Author: Takeharu.Oshida<br>
// repository: https://github.com/georgeOsdDev/chrome-app-storage-sample<br>
// Licence: MIT<br>

// __Namespace of App__
window.App ={
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

// Dom ready
$(function(){

  // Bind create Object function to buttons
  // create object based on `data` attribute.
  $("#menu > a").each(function(index,domEle){
    var dataStr = $(this).attr('data');
    if (dataStr){
      var dataJson = $.parseJSON($(this).attr('data'));
      $(this).bind('click',function(){
        createObj(dataJson);
      })
    }
  });

  // bind clear All function
  $("#clearBtn").bind('click',function(){
    clearAll();
  });

  // initialize app.
  initialize();

})

// Create Object
function createObj(obj,isInitialize){
  var conts ="",
      id = "",
      styleClass = obj.type || "",
      color = obj.color || "";

  //switch inner element
  switch(styleClass){
    case "postit":
      var text = obj.body || "Edit and Drag Me."
      conts = "<textarea class='post-"+color+"' col='5' row='10'>"+text+"</textarea>";
      break;
    case "stamp":
      conts ="<p style='color:"+color+"'>&"+obj.stamp+";</p>";
      break;
    default:
      console.log("ignore");
      return;
  }

  if(!isInitialize){
    obj.id = 'obj'+App.objNo;
    obj.objNo = App.objNo;
  }
  id = obj.id;

  // Crreate Element
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

  // bind jquery.UI event
  $('#'+id)
  .draggable(App.draggableOption)
  .bind('closed',function(){
    removeObj(obj);
  });


  if (isInitialize) {
    // if it was created at initialized phase, set position.
    $('#'+id).css('top',obj.top).css('left',obj.left);
  }else {
    // save
    App.objList[id] = obj;
    App.objNo++;
    chrome.storage.sync.set({"objNo":App.objNo});
    chrome.storage.sync.set({"objList":App.objList});    
  }
  $('#'+id).fadeIn();
}

// do nothing when it start moving
function startMoving(event,ui){
}

// save object position when it stop moving
function stopMoving(event,ui){
  var id = ui.helper.context.id;
  App.objList[id].top = ui.position.top;
  App.objList[id].left = ui.position.left;
  chrome.storage.sync.set({"objList":App.objList},function(){
    // console.log("objList updated");
  });
}

// remove object 
function removeObj(data){
  var id = data.id;
  $("#" + id).remove();
  App.objList[id] = null;
  chrome.storage.sync.set({"objList":App.objList},function(){
    // console.log("objList updated");
  });
}

// edit object's inner text
function editObj(data){
  var id = data.id;
  App.objList[id] = data;
  chrome.storage.sync.set({"objList":App.objList},function(){
    // console.log("objList updated");
  });
}

// remove all objects
function clearAll(){
  $("#mainboardDiv").empty();
  App.objList = {};
  App.objNo = 0;
  chrome.storage.sync.clear(function(){
    // console.log("clear storage");
  });
}

// initialize objects
function initialize(){
  console.log("initialize");
  chrome.storage.sync.get("objNo", function(val){
    App.objNo = val.objNo || 0;
    chrome.storage.sync.get("objList", function(val){
      App.objList = val.objList || {};
      for (var key in App.objList) {
        createObj(App.objList[key],true);
      }
    });
  });
}