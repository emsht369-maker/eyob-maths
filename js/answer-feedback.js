(function(root){
  "use strict";

  let toastTimer=0;

  function answered(isCorrect,pointsEarned){
    if(isCorrect&&pointsEarned>0)return;
    let toast=document.querySelector(".answer-feedback-toast");
    if(!toast){
      toast=document.createElement("div");
      toast.className="answer-feedback-toast";
      toast.setAttribute("role","status");
      toast.setAttribute("aria-live","polite");
      toast.setAttribute("aria-atomic","true");
      document.body.appendChild(toast);
    }
    toast.classList.toggle("is-correct",isCorrect);
    toast.classList.toggle("is-wrong",!isCorrect);
    toast.textContent=isCorrect
      ?`✓ Correct! ${pointsEarned?`+${pointsEarned} points earned.`:"Points already earned for this answer."}`
      :"✕ Not correct yet. No points earned.";
    toast.hidden=false;
    window.clearTimeout(toastTimer);
    toastTimer=window.setTimeout(()=>{toast.hidden=true;},4200);
  }

  function correct(){
    if(typeof navigator!=="undefined"&&typeof navigator.vibrate==="function")navigator.vibrate(35);
  }

  root.MathMasterFeedback=Object.freeze({answered,correct});
})(window);
