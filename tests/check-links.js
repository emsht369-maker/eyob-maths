"use strict";

const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const context={window:{},encodeURIComponent,console};
vm.runInNewContext(fs.readFileSync(path.join(root,"js/data.js"),"utf8"),context);
vm.runInNewContext(fs.readFileSync(path.join(root,"js/links.js"),"utf8"),context);
vm.runInNewContext(fs.readFileSync(path.join(root,"js/gcse-links.js"),"utf8"),context);
const alphaURL=title=>"https://www.wolframalpha.com/input?i="+encodeURIComponent(title+" mathematics");
const coreTopics=vm.runInNewContext("TOPICS",context);
for(const [id,entry] of Object.entries(context.window.TOPIC_LINKS)){
  const title=coreTopics[Number(id)][1];
  const link=entry.groups.find(group=>group.title==="Find more").items.find(item=>item[0].includes("Wolfram|Alpha"));
  if(!link||link[1]!==alphaURL(title))throw new Error(`Maths/ML topic ${id} is missing its topic-specific Wolfram|Alpha link.`);
}
const gcseAlpha=context.window.buildGCSESearchLinks("Linear equations").find(item=>item[0].includes("Wolfram|Alpha"));
if(!gcseAlpha||gcseAlpha[1]!=="https://www.wolframalpha.com/input?i=Linear%20equations%20GCSE%20maths"){
  throw new Error("GCSE topic links must encode the supplied topic in a Wolfram|Alpha query.");
}
const urls=new Set();
function collect(groups){
  for(const group of groups){
    for(const link of group.items||[]){
      const url=link[1];
      if(typeof url==="string"&&url.startsWith("/")){
        if(!fs.existsSync(path.join(root,url.slice(1))))throw new Error(`Local resource is missing: ${url}`);
      }else if(typeof url==="string"&&!isSearchUrl(url))urls.add(url);
    }
  }
}
function isSearchUrl(value){
  const url=new URL(value);
  return url.hostname==="www.google.com"||
    (url.hostname==="www.youtube.com"&&url.pathname==="/results")||
    (url.hostname==="www.khanacademy.org"&&url.pathname==="/search")||
    (url.hostname==="corbettmaths.com"&&url.searchParams.has("s"));
}
for(const entry of Object.values(context.window.TOPIC_LINKS))collect(entry.groups);
for(const area of Object.keys(context.window.AREA_LINKS))collect(context.window.AREA_LINKS[area].length?[{items:context.window.AREA_LINKS[area]}]:[]);
for(const area of Object.keys(context.window.AREA_LINKS))collect(context.window.buildGCSEResourceGroups("Example GCSE topic",area));

async function request(url,method){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch(url,{
      method,
      headers:{"User-Agent":"Mozilla/5.0"},
      redirect:"follow",
      signal:controller.signal
    });
    if(response.body)await response.body.cancel();
    return response.status;
  }finally{
    clearTimeout(timer);
  }
}

async function check(url){
  let status;
  try{
    status=await request(url,"HEAD");
  }catch(error){
    status=error.name==="AbortError"?"timeout":error.message;
  }
  if(status===200)return null;
  try{
    const getStatus=await request(url,"GET");
    if(getStatus===200)return null;
    return {url,status:`HEAD ${status}; GET ${getStatus}`};
  }catch(error){
    return {url,status:`HEAD ${status}; GET ${error.name==="AbortError"?"timeout":error.message}`};
  }
}

async function run(){
  const pending=[...urls],failures=[];
  const workers=Array.from({length:Math.min(5,pending.length)},async()=>{
    while(pending.length){
      const url=pending.shift();
      const failure=await check(url);
      if(failure)failures.push(failure);
    }
  });
  await Promise.all(workers);
  if(failures.length){
    console.table(failures);
    console.error(`${failures.length} of ${urls.size} fixed URLs failed.`);
    process.exitCode=1;
  }else{
    console.log(`All ${urls.size} fixed URLs returned HTTP 200.`);
  }
}

run().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
