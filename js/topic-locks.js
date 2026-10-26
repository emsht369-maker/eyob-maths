(function(root){
  "use strict";

  const STORAGE_KEY="mathmaster-rooms";
  const QUIZ_SIZE=20;
  const PASS_MARK=0.8;
  const escapeHtml=value=>String(value==null?"":value).replace(/[&<>"']/g,char=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    "\"":"&quot;",
    "'":"&#39;"
  })[char]);

  function readRoomProgress(storage){
    let saved={};
    try{
      saved=JSON.parse(storage.getItem(STORAGE_KEY)||"{}");
    }catch(error){
      saved={};
    }
    if(!saved||typeof saved!=="object"||Array.isArray(saved))saved={};
    return {
      practiceMode:saved.practiceMode===true,
      rooms:saved.rooms&&typeof saved.rooms==="object"&&!Array.isArray(saved.rooms)?saved.rooms:{}
    };
  }

  function setPracticeMode(storage,enabled){
    const defaults={
      rooms:{},
      practiceMode:false,
      points:0,
      badges:[],
      days:[]
    };
    const raw=storage.getItem(STORAGE_KEY);
    let saved=defaults;
    if(raw){
      try{
        const parsed=JSON.parse(raw);
        if(!parsed||typeof parsed!=="object"||Array.isArray(parsed)){
          throw new Error("Saved room progress has an invalid format.");
        }
        saved=Object.assign(defaults,parsed);
      }catch(error){
        throw new Error("Could not update practice mode: "+error.message);
      }
    }
    saved.practiceMode=enabled===true;
    storage.setItem(STORAGE_KEY,JSON.stringify(saved));
    return saved.practiceMode;
  }

  function isTopicPassed(index,roomLinks,roomProgress,topicProgress){
    const linkedRooms=roomLinks[index]||[];
    if(linkedRooms.length){
      return linkedRooms.every(roomId=>{
        const room=roomProgress.rooms[roomId];
        if(!room||room.complete!==true||!Array.isArray(room.tasks)||!room.tasks.length||!room.tasks.every(Boolean))return false;
        const attempts=room.taskAttempts;
        return attempts&&typeof attempts==="object"&&room.tasks.every((_,taskIndex)=>
          Object.keys(attempts).some(key=>key.startsWith(String(taskIndex)+"-")&&attempts[key]===true)
        );
      });
    }
    return Boolean(topicProgress.done[index]&&topicProgress.passed[index]);
  }

  function isTopicOpen(index,roomLinks,roomProgress,topicProgress,enabled){
    if(!enabled||roomProgress.practiceMode||index===0)return true;
    return isTopicPassed(index-1,roomLinks,roomProgress,topicProgress);
  }

  function recordQuizResult(index,correct,total,finished,topicProgress){
    if(!finished||total!==QUIZ_SIZE||correct/total<PASS_MARK)return false;
    topicProgress.passed[index]=true;
    return true;
  }

  function lockedCard(index,topic,previousTitle){
    return `<article class="card compact-card locked-card" aria-label="Locked topic ${index+1}: ${escapeHtml(topic[1])}">
      <span class="card-topline"><span class="em">${escapeHtml(topic[0])}</span><span class="topic-lock-icon" aria-hidden="true">🔒</span></span>
      <h3>${index+1}. ${escapeHtml(topic[1])}</h3>
      <div class="locked-topic-placeholder" aria-hidden="true"><span></span><span></span><span></span></div>
      <p class="topic-lock-message"><strong>🔒 Locked</strong><br>Finish: ${escapeHtml(previousTitle)} to unlock</p>
    </article>`;
  }

  root.TOPIC_LOCKS_API={
    readRoomProgress:readRoomProgress,
    setPracticeMode:setPracticeMode,
    isTopicPassed:isTopicPassed,
    isTopicOpen:isTopicOpen,
    recordQuizResult:recordQuizResult,
    lockedCard:lockedCard,
    QUIZ_SIZE:QUIZ_SIZE,
    PASS_MARK:PASS_MARK
  };
  if(typeof module!=="undefined"&&module.exports)module.exports=root.TOPIC_LOCKS_API;
})(typeof window!=="undefined"?window:globalThis);
