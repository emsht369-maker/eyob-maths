"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const http=require("node:http");
const path=require("node:path");
const {chromium}=require("./node_modules/playwright-core");

const root=path.resolve(__dirname,"..");
const mime={".css":"text/css",".html":"text/html",".js":"text/javascript",".svg":"image/svg+xml"};

function serve(){
  const server=http.createServer((request,response)=>{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname);
    const filename=path.resolve(root,`.${pathname}`);
    if(!filename.startsWith(root+path.sep))return response.writeHead(403).end();
    fs.readFile(filename,(error,content)=>{
      if(error)return response.writeHead(404).end();
      response.writeHead(200,{"Content-Type":mime[path.extname(filename)]||"application/octet-stream"});
      response.end(content);
    });
  });
  return new Promise(resolve=>server.listen(0,"127.0.0.1",()=>resolve(server)));
}

function localDate(offset){
  const date=new Date();
  date.setHours(12,0,0,0);
  date.setDate(date.getDate()+offset);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

async function run(){
  const server=await serve();
  const browser=await chromium.launch({headless:true,executablePath:"/usr/bin/google-chrome"});
  try{
    const page=await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/gcse.html`);
    await page.waitForFunction(()=>document.querySelectorAll("#topic-list .gcse-topic").length>0);

    assert.match(await page.locator("#daily-plan").innerText(),/Choose your exam date above/);
    assert.doesNotMatch(await page.locator("#daily-plan").innerText(),/Study 91 topics each day/);

    await page.locator("#exam-date").fill(localDate(100));
    let plan=await page.locator("#daily-plan").innerText();
    assert.match(plan,/Study 1 topic each day/);
    assert.match(plan,/Averages & Range/);
    assert.doesNotMatch(plan,/&amp;/);

    await page.locator("#exam-date").fill(localDate(1));
    plan=await page.locator("#daily-plan").innerText();
    assert.match(plan,/full review may not fit/);
    assert.doesNotMatch(plan,/Study 91 topics each day/);

    await page.locator("#exam-date").fill(localDate(0));
    assert.match(await page.locator("#daily-plan").innerText(),/exam is today or has passed/);
    console.log("GCSE daily-plan checks passed: no-date, future, short-notice, and today cases.");
  }finally{
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
}

run().catch(error=>{console.error(error);process.exitCode=1;});
