(function(){
  "use strict";
  const paths={
    gcse:["gcse",["gcse-bidmas","gcse-fractions","gcse-percentages","gcse-linear-equations","gcse-statistics"]],
    ml:["ml",["ml-dot-product","ml-matrix-vectors","ml-linear-regression","ml-gradient-descent"]]
  };
  let saved={};
  try{saved=JSON.parse(localStorage.getItem("mathmaster-rooms")||"{}");}catch(error){saved={};}
  let activity={};
  try{activity=JSON.parse(localStorage.getItem("mathmaster_activity")||"{}");}catch(error){activity={};}
  const rooms=saved&&saved.rooms&&typeof saved.rooms==="object"?saved.rooms:{};
  Object.keys(paths).forEach(function(key){
    const path=paths[key],complete=path[1].filter(function(id){return rooms[id]&&rooms[id].complete===true;}).length;
    const label=document.getElementById("home-"+key+"-progress-label"),progress=document.getElementById("home-"+key+"-progress");
    if(label)label.textContent=complete+" of "+path[1].length+" guided rooms complete";
    if(progress){progress.value=complete;progress.setAttribute("aria-valuetext",complete+" of "+path[1].length+" rooms complete");}
  });
  const points=document.getElementById("home-points");if(points)points.textContent=String(Number.isFinite(activity.points)?activity.points:(Number.isFinite(saved.points)?saved.points:0));
  const streak=document.getElementById("home-streak");
  if(streak){const days=Array.isArray(activity.days)?activity.days:(Array.isArray(saved.days)?saved.days:[]);let count=0;const cursor=new Date();cursor.setHours(0,0,0,0);if(days.includes(cursor.toLocaleDateString("en-CA"))||days.includes(new Date(cursor.getTime()-86400000).toLocaleDateString("en-CA"))){while(days.includes(cursor.toLocaleDateString("en-CA"))){count++;cursor.setDate(cursor.getDate()-1);}}streak.textContent=String(count);}
  const last=document.getElementById("home-last-room");
  if(last){const ids=Object.keys(rooms),room=ids.map(id=>({id,record:rooms[id]})).filter(item=>item.record&&item.record.lastOpened).sort((a,b)=>b.record.lastOpened-a.record.lastOpened)[0];if(room)last.textContent=room.id.replace(/^(gcse|ml)-/i,"").replace(/-/g," ");}
})();
