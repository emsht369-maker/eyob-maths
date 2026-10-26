"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {spawnSync}=require("node:child_process");
const {chromium}=require("./node_modules/playwright-core");
const servePagesPreview=require("./serve-pages-preview");

const root=path.resolve(__dirname,"..");
const output=fs.mkdtempSync(path.join(os.tmpdir(),"math-master-course-locks-"));

async function run(){
  const build=spawnSync(process.execPath,[path.join(root,"worker/build-site.mjs"),output],{encoding:"utf8"});
  assert.equal(build.status,0,build.stderr||build.stdout);
  const server=await servePagesPreview(output);
  const base=`http://127.0.0.1:${server.address().port}`;
  const executablePath=["/usr/bin/chromium","/usr/bin/google-chrome","/usr/bin/google-chrome-stable"]
    .find(candidate=>fs.existsSync(candidate));
  const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
  const page=await browser.newPage();
  const pageErrors=[];
  page.on("pageerror",error=>pageErrors.push(error.message));

  try{
    await page.goto(`${base}/courses.html`);
    const cards=page.locator(".roadmap-card[data-index]");
    assert.equal(await cards.count(),9,"The course roadmap has nine ordered courses.");
    assert.equal(await page.locator(".roadmap-card.current").count(),1,
      `Only the first course is initially available. Page errors: ${pageErrors.join("; ")}`);
    assert.equal(await page.locator(".roadmap-card.locked-course").count(),8,"All later courses start locked.");
    assert.equal(await page.locator("#course-count").textContent(),"1/9","The progress summary counts only the available course.");
    assert.equal(await page.locator('.roadmap-card[data-index="2"] .secondary-link').getAttribute("aria-disabled"),"true",
      "Algebra is locked until the foundation course is passed.");
    assert.equal(await page.locator('.roadmap-card[data-index="2"] .university-course-links').isHidden(),true,
      "External course materials on a locked card are not presented as unlocked entry points.");

    await page.evaluate(()=>{
      localStorage.setItem("mathmaster-rooms",JSON.stringify({
        rooms:{"gcse-bidmas":{complete:true,tasks:[true],taskAttempts:{"0-0":true}}},
        practiceMode:false
      }));
    });
    await page.reload();
    assert.equal(await page.locator('.roadmap-card[data-index="0"] .secondary-link').textContent(),"Review course",
      "A passed course remains available for review.");
    assert.equal(await page.locator('.roadmap-card[data-index="2"]').evaluate(card=>card.classList.contains("current")),true,
      "Passing the prerequisite opens Algebra.");
    assert.equal(await page.locator('.roadmap-card[data-index="4"]').evaluate(card=>card.classList.contains("locked-course")),true,
      "Geometry stays locked until Algebra is passed.");
    assert.match(await page.locator("#course-summary").textContent(),/Complete Algebra to unlock the next course/);

    await page.evaluate(()=>{
      localStorage.setItem("mathmaster-rooms",JSON.stringify({rooms:{},practiceMode:true}));
    });
    await page.reload();
    assert.equal(await page.locator(".roadmap-card.locked-course").count(),0,
      "Explicit practice mode opens the roadmap without changing completion state.");
    assert.equal(await page.locator("#course-count").textContent(),"9/9",
      "Practice mode reports every course as available.");

    await page.goto(`${base}/index.html?topic=Algebra&from=courses`);
    await page.waitForURL(/\/topic\/algebra\?from=courses&topic=Algebra$/);
    await page.locator("#topic-mount .room-header h1").waitFor({state:"visible"});
    assert.match(await page.locator("#topic-mount .room-header h1").textContent(),/Algebra/,
      "A direct course link respects prerequisite completion.");

    await page.evaluate(()=>{
      localStorage.setItem("mathmaster-rooms",JSON.stringify({rooms:{},practiceMode:false}));
    });
    await page.reload();
    await page.goto(`${base}/index.html?topic=Algebra&from=courses`);
    await page.waitForURL(/\/topic\/algebra\?from=courses&topic=Algebra$/);
    await page.locator(".topic-locked-notice").waitFor({state:"visible"});
    const lockedNotice=await page.locator(".topic-locked-notice").textContent();
    assert.match(lockedNotice,/locked/i,
      "Editing or sharing the direct course URL cannot bypass locks.");
    assert.match(lockedNotice,/Basic Arithmetic & Number Skills/,
      "The lock explains the correct prerequisite from the course roadmap.");

    await page.goto(`${base}/index.html?path=ml-fast`);
    await page.locator("#grid .topic-open").first().waitFor({state:"visible"});
    assert.ok(await page.locator("#grid .locked-card").count()>0,
      "The ML-fast topic path shows locked core topics instead of opening the entire course.");
    await page.evaluate(()=>{
      const allTopics=Object.fromEntries(Array.from({length:25},(_,index)=>[index,true]));
      localStorage.setItem("mathmaster",JSON.stringify({done:allTopics,passed:allTopics}));
      const completedRoom=()=>({complete:true,tasks:[true],taskAttempts:{"0-0":true}});
      localStorage.setItem("mathmaster-rooms",JSON.stringify({
        practiceMode:false,
        rooms:Object.fromEntries([
          "gcse-bidmas","gcse-fractions","gcse-percentages",
          "gcse-linear-equations","gcse-statistics","ml-dot-product"
        ].map(roomId=>[roomId,completedRoom()]))
      }));
    });
    await page.reload();
    const startNext=page.locator("#start-next-topic");
    await startNext.waitFor({state:"visible"});
    assert.equal(await startNext.isDisabled(),true,"The ML next-lesson action is disabled when every ML core topic is complete.");
    assert.equal(await startNext.textContent(),"Learning path complete");
    const completedPathUrl=page.url();
    await page.evaluate(()=>document.querySelector("#start-next-topic").onclick());
    assert.equal(page.url(),completedPathUrl,"Repeated Next activation after completion must not route to the final unrelated topic.");
    assert.deepEqual(pageErrors,[],"The course and topic navigation must not raise browser errors.");
    console.log("Course lock Playwright checks passed: ordered roadmap, prerequisite completion, direct-link protection, and ML path locks.");
  }finally{
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
    fs.rmSync(output,{recursive:true,force:true});
  }
}

run().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
