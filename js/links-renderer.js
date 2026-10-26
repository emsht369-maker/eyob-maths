(function () {
  "use strict";
  const escapeHtml=value=>String(value==null?"":value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  const order=["Start here","Notes","Problem sets","Exams","Videos","Practice","More"];
  const metadata=window.MATH_MASTER_PDF_METADATA||{};
  const pdfUrl=url=>/\.pdf(?:$|[?#])/i.test(url);
  const category=(title,label)=>{
    const text=`${title} ${label}`.toLowerCase();
    if(/start here|about and attribution|course overview|course page/.test(text))return "Start here";
    if(/exam|final exam/.test(text))return "Exams";
    if(/problem set|exercise sheet|worksheet/.test(text))return "Problem sets";
    if(/video/.test(text))return "Videos";
    if(/practice|question bank|questions and practice/.test(text))return "Practice";
    if(/note|lecture|textbook|zoomnotes|worked example|review/.test(text))return "Notes";
    if(/^start here$/i.test(title))return "Start here";
    return "More";
  };
  const fileInfo=url=>{
    const path=url.split(/[?#]/,1)[0];
    const info=metadata[path]||{};
    return {pages:info.pages,bytes:info.bytes};
  };
  const sizeLabel=bytes=>{
    if(!bytes)return "";
    if(bytes<1024*1024)return `${Math.round(bytes/1024)} KB`;
    return `${(bytes/(1024*1024)).toFixed(1)} MB`;
  };
  const examMatch=label=>label.match(/^(Exam\s*\d+|Final exam)(?:\s*[—–:-]\s*|\s+)(question paper|questions|solutions|answers)$/i);
  const roleFor=label=>/solution|answer/i.test(label)?"Solutions":"Questions";

  window.renderResourceGroups=function(groups){
    const used=new Set();
    const buckets=new Map(order.map(name=>[name,[]]));
    (groups||[]).forEach(group=>(group.items||[]).forEach(link=>{
      if(!Array.isArray(link)||!link[0]||!link[1]||used.has(link[1]))return;
      used.add(link[1]);
      const label=String(link[0]).trim();
      const url=String(link[1]);
      const note=String(link[2]||"");
      buckets.get(category(group.title,label)).push({label,url,note,groupTitle:group.title});
    }));

    const renderRow=item=>{
      const isPdf=pdfUrl(item.url);
      const info=isPdf?fileInfo(item.url):{};
      const details=[info.pages?`${info.pages} page${info.pages === 1 ? "" : "s"}`:"",sizeLabel(info.bytes)||item.note].filter(Boolean).join(" · ");
      const readLabel=window.MathMasterReading?.isRead(item.url)?"Read ✓":"Read";
      const readingId=escapeHtml(item.url);
      const readerId=readingId.split(/[?#]/,1)[0].split("/").pop().replace(/\.pdf$/i,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
      const content=isPdf
        ? `<a class="resource-title" data-pdf-id="${readerId}" data-kind="${escapeHtml(category(item.groupTitle,item.label))}" href="${escapeHtml(item.url)}"><span class="resource-icon" aria-hidden="true">PDF</span><strong>${escapeHtml(item.label)}</strong></a><span class="resource-meta">${escapeHtml(details)}</span><a class="resource-read resource-action resource-action-primary mm-button mm-button-primary" data-pdf-id="${readerId}" data-kind="${escapeHtml(category(item.groupTitle,item.label))}" data-reading-id="${readingId}" href="${escapeHtml(item.url)}">${readLabel}</a>`
        : `<a class="resource-title" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer"><span class="resource-icon" aria-hidden="true">WEB</span><strong>${escapeHtml(item.label)}</strong></a><span class="resource-meta resource-description">${escapeHtml(item.note||"External learning resource")}</span><a class="resource-web-action resource-action resource-action-outline" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Visit ↗</a>`;
      return `<li class="resource-row">${content}</li>`;
    };

    const result=order.map(name=>{
      let items=buckets.get(name);
      if(!items.length)return "";
      if(name==="Exams"){
        const exams=new Map(), remaining=[];
        items.forEach(item=>{
          const match=examMatch(item.label);
          if(!match){remaining.push(item);return;}
          const base=match[1].replace(/\s+/g," ");
          const row=exams.get(base)||{title:base,links:{},groupTitle:item.groupTitle};
          row.links[roleFor(match[2])]=item;
          row.groupTitle=row.groupTitle||item.groupTitle;
          exams.set(base,row);
        });
        items=[...Array.from(exams.values(),row=>{
          const question=row.links.Questions,solution=row.links.Solutions;
          return `<li class="resource-row resource-exam-row"><strong class="resource-exam-title">${escapeHtml(row.title)}</strong><div class="resource-exam-actions">${question?`<a class="mm-button mm-button-primary resource-action resource-action-primary" data-pdf-id="${question.url.split(/[?#]/,1)[0].split("/").pop().replace(/\.pdf$/i,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}" data-kind="Questions" aria-label="Open ${escapeHtml(row.title)} questions PDF" href="${escapeHtml(question.url)}">Questions</a>`:""}${solution?`<a class="mm-button mm-button-secondary resource-action resource-action-outline" data-pdf-id="${solution.url.split(/[?#]/,1)[0].split("/").pop().replace(/\.pdf$/i,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}" data-kind="Solutions" aria-label="Open ${escapeHtml(row.title)} solutions PDF" href="${escapeHtml(solution.url)}">Solutions</a>`:""}</div></li>`;
        }),...remaining.map(renderRow)];
      }else items=items.map(renderRow);
      return `<details class="resource-group"${name==="Start here"?" open":""}><summary>${escapeHtml(name)} <span class="resource-count">${buckets.get(name).length}</span></summary><ul>${items.join("")}</ul></details>`;
    }).join("");
    return result;
  };
})();
