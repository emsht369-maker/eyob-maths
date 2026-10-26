(function(){
  "use strict";

  const search=document.getElementById("material-search");
  const course=document.getElementById("material-course");
  const type=document.getElementById("material-type");
  const list=document.getElementById("materials-list");
  const count=document.getElementById("materials-count");
  const error=document.getElementById("materials-error");
  const escapeHTML=value=>String(value==null?"":value).replace(/[&<>"']/g,char=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[char]);
  const normalize=value=>String(value==null?"":value).toLocaleLowerCase()
    .replace(/([a-z])(\d)/g,"$1 $2")
    .replace(/([0-9])([a-z])/g,"$1 $2")
    .replace(/[^a-z0-9]+/g," ").trim();

  function displayType(resource){
    if(resource.category)return resource.category;
    return ({
      exam:"Exam papers",
      "exam-solutions":"Exam solutions",
      notes:"Notes and tutorials",
      solutions:"Problem-set solutions"
    })[resource.type]||resource.type.replace(/-/g," ");
  }

  function materialId(resource){
    return String(resource.title||resource.file||"pdf").toLowerCase()
      .replace(/\.pdf$/,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  }

  function makeCard(resource){
    const review=resource.status==="needs-review";
    const details=[
      resource.pages?resource.pages+" page"+(resource.pages===1?"":"s"):"",
      resource.bytes?Math.round(resource.bytes/1024)+" KB":""
    ].filter(Boolean).join(" · ");
    const note=review
      ?"<p>Some extracted questions from this source are under review. The original PDF is available here.</p>"
      :"";
    return "<article class=\"material-card\"><h3>"+escapeHTML(resource.title)+"</h3>"+
      "<div class=\"material-tags\"><span class=\"material-tag\">"+escapeHTML(resource.subject)+"</span>"+
      "<span class=\"material-tag\">"+escapeHTML(displayType(resource))+"</span>"+
      (review?"<span class=\"material-tag is-review\">Source review</span>":"")+"</div>"+
      (details?"<p>"+escapeHTML(details)+"</p>":"")+note+
      "<a class=\"material-link\" data-pdf-id=\""+escapeHTML(materialId(resource))+"\" data-kind=\""+escapeHTML(displayType(resource))+"\" href=\""+escapeHTML(resource.url)+"\">Open original PDF <span aria-hidden=\"true\">↗</span></a></article>";
  }

  function render(resources){
    const terms=normalize(search.value).split(/\s+/).filter(Boolean);
    const selectedCourse=course.value;
    const selectedType=type.value;
    const visible=resources.filter(resource=>{
      const matchesCourse=selectedCourse==="all"||resource.subject===selectedCourse;
      const matchesType=selectedType==="all"||displayType(resource)===selectedType;
      const haystack=normalize(resource.title+" "+resource.subject+" "+displayType(resource)+" "+resource.file);
      const matchesSearch=terms.every(term=>haystack.includes(term));
      return matchesCourse&&matchesType&&matchesSearch;
    });
    const groups=new Map();
    visible.forEach(resource=>{
      const key=resource.subject+"|"+displayType(resource);
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(resource);
    });
    list.innerHTML=groups.size
      ?Array.from(groups.entries()).map(([key,items])=>{
        const [subject,category]=key.split("|");
        return "<details class=\"material-group\""+(terms.length||selectedCourse!=="all"||selectedType!=="all"?" open":"")+"><summary>"+escapeHTML(subject)+" · "+escapeHTML(category)+"<span>"+items.length+"</span></summary><div class=\"material-cards\">"+items.map(makeCard).join("")+"</div></details>";
      }).join("")
      :"<p class=\"materials-empty\">No materials match your search. Try a shorter search or choose “All courses”.</p>";
    count.textContent="Showing "+visible.length+" of "+resources.length+" unique course PDFs. Duplicate copies are included once.";
    document.dispatchEvent(new CustomEvent("materials:rendered"));
  }

  async function load(){
    try{
      const [calculusResponse,linearResponse]=await Promise.all([
        fetch("data/calculus-pdf-inventory.json"),
        fetch("data/import-manifest.json")
      ]);
      if(!calculusResponse.ok||!linearResponse.ok){
        throw new Error("The course-material catalog could not be loaded. Refresh the page to try again.");
      }
      const [calculus,linear]=await Promise.all([calculusResponse.json(),linearResponse.json()]);
      const resources=[
        ...calculus.resources.map(item=>({
          ...item,
          subject:"Calculus",
          kind:item.category,
          url:"assets/mit-calculus/"+encodeURIComponent(item.file)
        })),
        ...linear.files.filter(item=>item.status!=="skip-duplicate").map(item=>({
          ...item,
          subject:"Linear Algebra",
          kind:item.category||item.type,
          url:"assets/mit-linear-algebra/"+encodeURIComponent(item.file)
        }))
      ];
      const categories=Array.from(new Set(resources.map(displayType))).sort();
      type.innerHTML="<option value=\"all\">All types</option>"+categories.map(category=>"<option value=\""+escapeHTML(category)+"\">"+escapeHTML(category)+"</option>").join("");
      [search,course,type].forEach(control=>control.addEventListener(control===search?"input":"change",()=>render(resources)));
      render(resources);
    }catch(loadError){
      console.error("Could not load the course-material catalog.",loadError);
      count.textContent="Course materials are unavailable right now.";
      error.textContent=loadError.message;
      error.hidden=false;
    }
  }

  load();
})();
