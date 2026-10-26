(function () {
  "use strict";
  const messages=["Great work!","Nice one!","You got it!"];
  let messageIndex=0;
  let toastTimer=0;

  function getSound(){try{return localStorage.getItem("mm2-sound")==="on";}catch(error){return false;}}
  function syncSoundToggle(){
    const button=document.querySelector("[data-mm2-sound]");
    if(!button)return;
    const on=getSound();
    button.textContent=on?"♫":"♪";
    button.title=on?"Sound on":"Sound off";
    button.setAttribute("aria-label",on?"Turn sound off":"Turn sound on");
    button.setAttribute("aria-pressed",String(on));
  }
  function playSound(){
    if(!getSound()||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return;
    const context=new Audio();
    const oscillator=context.createOscillator();
    const gain=context.createGain();
    oscillator.type="sine";
    oscillator.frequency.setValueAtTime(660,context.currentTime);
    oscillator.frequency.setValueAtTime(880,context.currentTime+.1);
    gain.gain.setValueAtTime(.04,context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.26);
    oscillator.connect(gain);gain.connect(context.destination);
    oscillator.onended=()=>context.close();oscillator.start();oscillator.stop(context.currentTime+.27);
  }
  function showToast(points){
    let toast=document.querySelector("[data-mm2-toast]");
    if(!toast){toast=document.createElement("div");toast.className="mm-toast";toast.dataset.mm2Toast="";toast.setAttribute("role","status");toast.setAttribute("aria-live","polite");document.body.append(toast);}
    const message=messages[messageIndex++%messages.length];
    const start=performance.now();
    toast.hidden=false;
    const tick=now=>{
      const amount=Math.min(1,(now-start)/450);
      toast.innerHTML=`<strong>+${Math.round(points*Math.max(.06,amount))} points</strong><span>${message}</span>`;
      if(amount<1)requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.hidden=true;},2600);
  }
  function burst(){
    if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const layer=document.createElement("div");layer.className="mm2-confetti";layer.setAttribute("aria-hidden","true");
    for(let i=0;i<18;i++){
      const piece=document.createElement("i");
      piece.style.setProperty("--x",`${Math.round((Math.random()-.5)*260)}px`);
      piece.style.setProperty("--r",`${Math.round(Math.random()*540-270)}deg`);
      piece.style.setProperty("--d",`${Math.random()*.2}s`);
      piece.style.setProperty("--c",["#88cc14","#f5a623","#58a6ff","#ff7d9c"][i%4]);
      layer.append(piece);
    }
    document.body.append(layer);setTimeout(()=>layer.remove(),900);
  }
  function showComplete(detail){
    let dialog=document.getElementById("mm2-complete-dialog");
    if(!dialog){
      dialog=document.createElement("dialog");dialog.id="mm2-complete-dialog";dialog.className="mm-modal mm2-complete-dialog";dialog.setAttribute("aria-labelledby","mm2-complete-title");
      dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
      dialog.addEventListener("cancel",event=>{event.preventDefault();dialog.close();});
      document.body.append(dialog);
    }
    dialog.innerHTML=`<button type="button" class="mm-complete-close" aria-label="Close">×</button><span class="eyebrow">Study room</span><h2 id="mm2-complete-title">Room complete!</h2><p>${detail.message||"You finished this study step."}</p><p class="mm-complete-reward">⭐ ${Number(detail.points)||0} points · 🏅 ${detail.badge||"Great work"}</p><div class="mm-complete-actions"><a class="mm-button mm-button-primary" href="${detail.nextUrl||"/index.html#topics"}">Next room</a><button class="mm-button mm-button-secondary" type="button" data-mm2-complete-close>Stay here</button></div>`;
    dialog.querySelector(".mm-complete-close").onclick=()=>dialog.close();
    dialog.querySelector("[data-mm2-complete-close]").onclick=()=>dialog.close();
    if(!dialog.open)dialog.showModal();
  }

  document.addEventListener("click",event=>{
    const toggle=event.target.closest("[data-mm2-sound]");
    if(!toggle)return;
    try{localStorage.setItem("mm2-sound",getSound()?"off":"on");}catch(error){}
    syncSoundToggle();
  });
  window.addEventListener("mm2:points",event=>{
    const points=Math.max(0,Number(event.detail?.pointsEarned)||0);
    if(!points)return;
    showToast(points);burst();playSound();
    const pill=document.querySelector("[data-nav-points]");
    if(pill){pill.classList.remove("is-pulsing");void pill.offsetWidth;pill.classList.add("is-pulsing");setTimeout(()=>pill.classList.remove("is-pulsing"),700);}
  });
  window.addEventListener("mm2:complete",event=>showComplete(event.detail||{}));
  syncSoundToggle();
})();
