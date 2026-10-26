"use strict";

const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const context={window:{GCSE:[]},encodeURIComponent,console};
vm.runInNewContext(fs.readFileSync(path.join(root,"js/data.js"),"utf8")+"\nthis.topicList=TOPICS;",context);
vm.runInNewContext(fs.readFileSync(path.join(root,"js/links.js"),"utf8"),context);
vm.runInNewContext(fs.readFileSync(path.join(root,"js/resources.js"),"utf8"),context);
vm.runInNewContext(fs.readFileSync(path.join(root,"js/gcse-links.js"),"utf8"),context);
const files=fs.readdirSync(path.join(root,"js/gcse/topics")).filter(file=>file.endsWith(".js")).sort();
for(const file of files){
  vm.runInNewContext(fs.readFileSync(path.join(root,"js/gcse/topics",file),"utf8"),context);
}

function uniqueLinkCount(groups){
  return new Set(groups.flatMap(group=>(group.items||[]).map(item=>item[1]))).size;
}
const rows=[];
for(let index=0;index<context.topicList.length;index++){
  const title=context.topicList[index][1];
  const groups=[...context.window.TOPIC_LINKS[String(index)].groups];
  const oldStudy=context.window.MATH_RESOURCES.study[index]||[];
  const oldCourses=context.window.MATH_RESOURCES.courses[index]||[];
  if(oldStudy.length)groups.push({title:"Earlier topic links",items:oldStudy});
  if(oldCourses.length)groups.push({title:"Earlier university courses",items:oldCourses});
  rows.push({type:"Topic",title,links:uniqueLinkCount(groups)});
  rows.push({type:"Room",title,links:uniqueLinkCount(groups)});
}
for(const topic of context.window.GCSE){
  const groups=context.window.buildGCSEResourceGroups(topic.title,topic.area,topic.links);
  rows.push({type:"GCSE topic",title:topic.title,links:uniqueLinkCount(groups)});
}
console.table(rows);
const insufficient=rows.filter(row=>row.links<6);
if(insufficient.length){
  console.error(`${insufficient.length} topic, room, or GCSE topic has fewer than 6 unique links.`);
  process.exitCode=1;
}else{
  console.log(`All ${context.topicList.length} topics, ${context.topicList.length} rooms, and ${context.window.GCSE.length} GCSE topics have at least 6 unique links.`);
}
