(function(root){
  "use strict";

  const STORAGE_KEY="mathmaster-rooms";
  const EXAM_SIZE=25;
  const PASS_MARK=0.8;
  const EXAM_LEVELS={M:8,H:10,VH:7};
  const UNITS=["cm","m","kg","%","£"];
  const round=value=>Math.round((value+Number.EPSILON)*10000)/10000;
  const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
  const fraction=(a,b)=>{
    const common=gcd(a,b);
    const sign=b<0?-1:1;
    return String(sign*a/common)+"/"+String(sign*b/common);
  };
  const poolQuestion=(q,answer,level,explain,tolerance)=>({
    id:"",
    q:String(q),
    answer:String(answer),
    accept:[],
    type:"number",
    tolerance:tolerance===undefined?0.00001:tolerance,
    level:level,
    explain:explain
  });

  function makePool(kind){
    const pool=[];
    for(let family=0;family<8;family+=1){
      for(let v=1;v<=5;v+=1){
        const a=v+1;
        const b=v+2;
        const c=v+3;
        let q="";
        let answer="";
        let explain=[];
        if(kind==="bidmas"){
          if(family===0){
            q="Work out "+a+" + "+b+" × "+c+".";
            answer=String(a+b*c);
            explain=["Use BIDMAS: multiply before adding.","Multiply "+b+" × "+c+" = "+b*c+".","Then add "+a+": "+a+" + "+b*c+" = "+answer+"."];
          }else if(family===1){
            q="Work out ("+a+" + "+b+") × "+c+".";
            answer=String((a+b)*c);
            explain=["Brackets come first in BIDMAS.","Add inside: "+a+" + "+b+" = "+(a+b)+".","Multiply by "+c+": "+(a+b)+" × "+c+" = "+answer+"."];
          }else if(family===2){
            q="Work out "+c+"² − "+a+" × "+b+".";
            answer=String(c*c-a*b);
            explain=["Use BIDMAS: powers, then multiplication, then subtraction.","Square "+c+": "+c+"² = "+c*c+"; multiply "+a+" × "+b+" = "+a*b+".","Subtract: "+c*c+" − "+a*b+" = "+answer+"."];
          }else if(family===3){
            q="Work out ("+a+" + "+b+")² ÷ "+c+".";
            answer=fraction((a+b)*(a+b),c);
            explain=["Brackets and powers come before division.","Add and square: ("+a+" + "+b+")² = "+(a+b)*(a+b)+".","Divide by "+c+": "+(a+b)*(a+b)+" ÷ "+c+" = "+answer+"."];
          }else if(family===4){
            q="Work out "+(a*b)+" ÷ "+a+" + "+c+" × 2.";
            answer=String(b+c*2);
            explain=["Do division and multiplication before addition.","Calculate "+(a*b)+" ÷ "+a+" = "+b+" and "+c+" × 2 = "+c*2+".","Add: "+b+" + "+c*2+" = "+answer+"."];
          }else if(family===5){
            q="Work out "+(a+b)+" − ("+c+" − "+a+") × 2.";
            answer=String(a+b-(c-a)*2);
            explain=["Work inside brackets first: "+c+" − "+a+" = "+(c-a)+".","Multiply that result by 2: "+(c-a)+" × 2 = "+(c-a)*2+".","Subtract from "+(a+b)+": the answer is "+answer+"."];
          }else if(family===6){
            q="Work out "+(c*c)+" ÷ "+c+" + "+a+"².";
            answer=String(c+a*a);
            explain=["Powers are evaluated before division and addition.","Calculate "+c+"² ÷ "+c+" = "+c+" and "+a+"² = "+a*a+".","Add: "+c+" + "+a*a+" = "+answer+"."];
          }else{
            q="Work out "+a+" × ("+b+" + "+c+") − "+b+".";
            answer=String(a*(b+c)-b);
            explain=["Brackets come before multiplication and subtraction.","Add inside: "+b+" + "+c+" = "+(b+c)+" then multiply by "+a+" to get "+a*(b+c)+".","Subtract "+b+": "+a*(b+c)+" − "+b+" = "+answer+"."];
          }

        }else if(kind==="fractions"){
          const n1=v+1;
          const d1=v+3;
          const n2=v+2;
          const d2=v+4;
          if(family===0){
            q="Work out "+n1+"/"+d1+" + "+n2+"/"+d2+".";
            answer=fraction(n1*d2+n2*d1,d1*d2);
            explain=["Use a common denominator: "+d1+" × "+d2+" = "+d1*d2+".","The new numerators are "+n1*d2+" and "+n2*d1+".","Add: "+(n1*d2+n2*d1)+"/"+(d1*d2)+" = "+answer+"."];
          }else if(family===1){
            q="Work out "+n2+"/"+d2+" − "+n1+"/"+d1+".";
            answer=fraction(n2*d1-n1*d2,d1*d2);
            explain=["Use the common denominator "+(d1*d2)+".","Subtract the equivalent numerators: "+n2*d1+" − "+n1*d2+" = "+(n2*d1-n1*d2)+".","Simplify "+(n2*d1-n1*d2)+"/"+(d1*d2)+" to "+answer+"."];
          }else if(family===2){
            q="Work out "+n1+"/"+d1+" × "+n2+"/"+d2+".";
            answer=fraction(n1*n2,d1*d2);
            explain=["Multiply the numerators: "+n1+" × "+n2+" = "+n1*n2+".","Multiply the denominators: "+d1+" × "+d2+" = "+d1*d2+".","Simplify "+(n1*n2)+"/"+(d1*d2)+" to "+answer+"."];
          }else if(family===3){
            q="Work out "+n1+"/"+d1+" ÷ "+n2+"/"+d2+".";
            answer=fraction(n1*d2,d1*n2);
            explain=["Divide by multiplying by the reciprocal.","Change to "+n1+"/"+d1+" × "+d2+"/"+n2+".","Multiply and simplify: "+(n1*d2)+"/"+(d1*n2)+" = "+answer+"."];
          }else if(family===4){
            const scale=v+2;
            q="Work out "+scale+" − "+n1+"/"+d1+".";
            answer=fraction(scale*d1-n1,d1);
            explain=["Write the whole number "+scale+" with denominator "+d1+": "+(scale*d1)+"/"+d1+".","Subtract the numerators: "+(scale*d1)+" − "+n1+" = "+(scale*d1-n1)+".","Simplify "+(scale*d1-n1)+"/"+d1+" to "+answer+"."];
          }else if(family===5){
            q="Work out "+n1+"/"+d1+" + 1/"+d1+".";
            answer=fraction(n1+1,d1);
            explain=["The denominators match, so keep "+d1+".","Add the numerators: "+n1+" + 1 = "+(n1+1)+".","Simplify "+(n1+1)+"/"+d1+" to "+answer+"."];
          }else if(family===6){
            q="Work out "+n2+"/"+d2+" − 1/"+d2+".";
            answer=fraction(n2-1,d2);
            explain=["The denominators match, so keep "+d2+".","Subtract the numerators: "+n2+" − 1 = "+(n2-1)+".","Simplify "+(n2-1)+"/"+d2+" to "+answer+"."];
          }else{
            const whole=v+1;
            q="Work out "+whole+" + "+n1+"/"+d1+".";
            answer=fraction(whole*d1+n1,d1);
            explain=["Change "+whole+" into "+(whole*d1)+"/"+d1+".","Add the fractions: ("+(whole*d1)+" + "+n1+")/"+d1+" = "+(whole*d1+n1)+"/"+d1+".","The result in simplest form is "+answer+"."];
          }
        }else if(kind==="percentages"){
          const amount=20+v*10;
          const p=5+v*5;
          if(family===0){
            q="Find "+p+"% of "+amount+".";
            answer=String(amount*p/100);
            explain=["Convert "+p+"% to a decimal: "+p+"/100 = "+p/100+".","Multiply by the amount: "+amount+" × "+p/100+" = "+answer+".","So "+p+"% of "+amount+" is "+answer+"."];
          }else if(family===1){
            q="Find "+p+"% of "+(amount*2)+".";
            answer=String(amount*2*p/100);
            explain=["Write "+p+"% as "+p/100+".","Multiply: "+(amount*2)+" × "+p/100+" = "+answer+".","Therefore the requested percentage is "+answer+"."];
          }else if(family===2){
            q="Increase "+amount+" by "+p+"%.";
            answer=String(amount*(1+p/100));
            explain=["An increase uses multiplier 1 + "+p+"/100 = "+(1+p/100)+".","Multiply the start value: "+amount+" × "+(1+p/100)+" = "+answer+".","The increased amount is "+answer+"."];
          }else if(family===3){
            q="Decrease "+(amount*2)+" by "+p+"%.";
            answer=String(amount*2*(1-p/100));
            explain=["A decrease leaves "+(100-p)+"%, or multiplier "+(1-p/100)+".","Multiply: "+(amount*2)+" × "+(1-p/100)+" = "+answer+".","The decreased amount is "+answer+"."];
          }else if(family===4){
            const original=amount;
            const final=amount*(1+p/100);
            q="A price of £"+original+" rises by "+p+"%. Find the new price in pounds.";
            answer=String(final);
            explain=["Find the multiplier: 1 + "+p+"/100 = "+(1+p/100)+".","Multiply £"+original+" by "+(1+p/100)+": "+original+" × "+(1+p/100)+" = "+final+".","The new price is £"+final+"."];
          }else if(family===5){
            const fractionValue=p;
            q="What percentage is "+fractionValue+" out of 100?";
            answer=String(fractionValue);
            explain=["Percent means out of 100.","The amount is "+fractionValue+" per 100.","So the percentage is "+fractionValue+"%."];
          }else if(family===6){
            const total=amount*2;
            q="A student gets "+amount+" marks out of "+total+". Find the percentage.";
            answer="50";
            explain=["Percentage = part ÷ whole × 100.","Calculate "+amount+" ÷ "+total+" = 0.5.","Then 0.5 × 100 = 50%."];
          }else{
            q="After a "+p+"% increase, an amount is "+amount+". Find the original amount.";
            answer=fraction(amount*100,100+p);
            explain=["The final value equals original × multiplier.","The multiplier is 1 + "+p+"/100 = "+(1+p/100)+".","Original = "+amount+" ÷ "+(1+p/100)+" = "+answer+"."];
          }
        }else if(kind==="equations"){
          const x=v+2;
          const m=v+2;
          const k=v+3;
          if(family===0){
            q="Solve "+m+"x + "+k+" = "+(m*x+k)+".";
            answer=String(x);
            explain=["Subtract "+k+" from both sides: "+m+"x = "+m*x+".","Divide both sides by "+m+".","Therefore x = "+answer+"."];
          }else if(family===1){
            q="Solve "+m+"x − "+k+" = "+(m*x-k)+".";
            answer=String(x);
            explain=["Add "+k+" to both sides: "+m+"x = "+m*x+".","Divide both sides by "+m+".","Therefore x = "+answer+"."];
          }else if(family===2){
            q="Solve "+m+"(x + "+k+") = "+(m*(x+k))+".";
            answer=String(x);
            explain=["Divide both sides by "+m+": x + "+k+" = "+(x+k)+".","Subtract "+k+" from both sides.","Therefore x = "+answer+"."];
          }else if(family===3){
            const n=m+2;
            const constant=k-(n-m)*x;
            q="Solve "+m+"x + "+k+" = "+n+"x + "+constant+".";
            answer=String(x);
            explain=["Subtract "+m+"x from both sides, then subtract "+constant+" from both sides.","This gives "+(k-constant)+" = "+(n-m)+"x.","Divide by "+(n-m)+": x = "+answer+"."];
          }else if(family===4){
            q="Solve (x + "+k+") ÷ "+m+" = "+((x+k)/m)+".";
            answer=String(x);
            explain=["Multiply both sides by "+m+": x + "+k+" = "+(x+k)+".","Subtract "+k+" from both sides.","Therefore x = "+answer+"."];
          }else if(family===5){
            q="Solve "+m+"x = "+(m*x)+".";
            answer=String(x);
            explain=["The coefficient of x is "+m+".","Divide both sides by "+m+": x = "+(m*x)+" ÷ "+m+".","So x = "+answer+"."];
          }else if(family===6){
            q="Solve "+(m+1)+"x − "+m+" = "+((m+1)*x-m)+".";
            answer=String(x);
            explain=["Add "+m+" to both sides: "+(m+1)+"x = "+((m+1)*x)+".","Divide both sides by "+(m+1)+".","So x = "+answer+"."];
          }else{
            const n=m+1;
            const constant=m*(x-k)-n*x;
            q="Solve "+m+"(x − "+k+") = "+n+"x + ("+constant+").";
            answer=String(x);
            explain=["Expand the left side: "+m+"x − "+m*k+".","Collect x terms: "+(n-m)+"x = "+(-m*k-constant)+".","Divide by "+(n-m)+": x = "+answer+"."];
          }
        }else if(kind==="statistics"){
          const data=[v,v+2,v+4];
          if(family===0){
            q="Find the mean of "+data.join(", ")+".";
            answer=String((data[0]+data[1]+data[2])/3);
            explain=["Mean = total ÷ count.","Add: "+data.join(" + ")+" = "+(data[0]+data[1]+data[2])+".","Divide by 3: "+(data[0]+data[1]+data[2])+" ÷ 3 = "+answer+"."];
          }else if(family===1){
            const values=[v,v+1,v+3,v+4];
            q="Find the median of "+values.join(", ")+".";
            answer=String((values[1]+values[2])/2);
            explain=["The values are in order: "+values.join(", ")+".","With 4 values, average the middle pair: ("+values[1]+" + "+values[2]+") ÷ 2.","The median is "+answer+"."];
          }else if(family===2){
            const values=[v,v,v+2,v+3];
            q="Find the mode of "+values.join(", ")+".";
            answer=String(v);
            explain=["Count how often each value appears.","The value "+v+" appears twice; the others appear once.","The mode is "+answer+"."];
          }else if(family===3){
            const values=[v,v+2,v+5,v+8];
            q="Find the range of "+values.join(", ")+".";
            answer="8";
            explain=["Range = largest − smallest.","Largest is "+(v+8)+" and smallest is "+v+".","Subtract: "+(v+8)+" − "+v+" = "+answer+"."];
          }else if(family===4){
            const mean=v+4;
            q="The mean of 4 values is "+mean+". Find their total.";
            answer=String(mean*4);
            explain=["Total = mean × count.","Multiply "+mean+" × 4 = "+mean*4+".","The total is "+answer+"."];
          }else if(family===5){
            const values=[v,v+1,v+2,v+3,v+4];
            q="Find the median of "+values.join(", ")+".";
            answer=String(v+2);
            explain=["The values are already in order.","There are 5 values, so the third is the middle.","The median is "+answer+"."];
          }else if(family===6){
            const values=[v,v+2,v+2,v+4,v+6];
            q="Find the range of "+values.join(", ")+".";
            answer="6";
            explain=["Range = maximum − minimum.","Maximum is "+(v+6)+"; minimum is "+v+".","Subtract: "+(v+6)+" − "+v+" = "+answer+"."];
          }else{
            const values=[v,v+1,v+1,v+4];
            q="Find the mean of "+values.join(", ")+".";
            answer=String((values[0]+values[1]+values[2]+values[3])/4);
            explain=["Mean = sum ÷ number of values.","Sum: "+values.join(" + ")+" = "+(values[0]+values[1]+values[2]+values[3])+".","Divide by 4: "+(values[0]+values[1]+values[2]+values[3])+" ÷ 4 = "+answer+"."];
          }
        }else if(kind==="matrix-vectors"){
          const x=v+1,y=v+2,a=v+2,b=v+1,c=v+1,d=v+3;
          if(family===0){
            q="Find the first coordinate of [["+a+", "+b+"], ["+c+", "+d+"]] × ("+x+", "+y+").";
            answer=String(a*x+b*y);
            explain=["Use the first matrix row: ("+a+", "+b+").","Multiply matching entries: "+a+"×"+x+" + "+b+"×"+y+" = "+(a*x)+" + "+(b*y)+".","Add to get the first coordinate "+answer+"."];
          }else if(family===1){
            q="Find the second coordinate of [["+a+", "+b+"], ["+c+", "+d+"]] × ("+x+", "+y+").";
            answer=String(c*x+d*y);
            explain=["Use the second matrix row: ("+c+", "+d+").","Multiply matching entries: "+c+"×"+x+" + "+d+"×"+y+" = "+(c*x)+" + "+(d*y)+".","Add to get the second coordinate "+answer+"."];
          }else if(family===2){
            q="A scale matrix multiplies each coordinate by "+(v+1)+". Find the first coordinate of ("+x+", "+y+") after scaling.";
            answer=String((v+1)*x);
            explain=["A scale matrix multiplies both coordinates by the scale factor.","First coordinate: "+(v+1)+" × "+x+" = "+answer+".","The transformed first coordinate is "+answer+"."];
          }else if(family===3){
            q="Find the determinant of [["+a+", 1], [1, "+d+"]].";
            answer=String(a*d-1);
            explain=["For [[a,b],[c,d]], determinant = ad−bc.","Main diagonal: "+a+" × "+d+" = "+(a*d)+"; other diagonal: 1 × 1 = 1.","Subtract: "+(a*d)+" − 1 = "+answer+"."];
          }else if(family===4){
            q="The identity matrix transforms ("+x+", "+y+"). Find the second coordinate.";
            answer=String(y);
            explain=["The identity matrix leaves each coordinate unchanged.","The input second coordinate is "+y+".","So the output second coordinate is "+answer+"."];
          }else if(family===5){
            q="For [[1, 0], [0, 1]] × ("+x+", "+y+"), find the first coordinate.";
            answer=String(x);
            explain=["Use the first row (1, 0).","Calculate 1 × "+x+" + 0 × "+y+" = "+x+" + 0.","The first coordinate is "+answer+"."];
          }else if(family===6){
            q="A scale factor of 2 transforms ("+x+", "+y+"). Find the second coordinate.";
            answer=String(2*y);
            explain=["Multiply each coordinate by 2.","Second coordinate: 2 × "+y+" = "+answer+".","The answer is "+answer+"."];
          }else{
            q="Find the determinant of [[2, 1], [1, "+d+"]].";
            answer=String(2*d-1);
            explain=["Determinant = product of the main diagonal minus product of the other diagonal.","Calculate 2 × "+d+" = "+(2*d)+" and 1 × 1 = 1.","Subtract: "+(2*d)+" − 1 = "+answer+"."];
          }
        }else if(kind==="linear-regression"){
          const x=v+1;
          if(family===0){
            q="A fitted line is y = 2x + "+v+". Predict y when x = "+x+".";
            answer=String(2*x+v);
            explain=["Substitute x = "+x+" into y = 2x + "+v+".","Multiply: 2 × "+x+" = "+(2*x)+".","Add the intercept: "+(2*x)+" + "+v+" = "+answer+"."];
          }else if(family===1){
            q="Find the gradient between (1, "+v+") and (3, "+(v+4)+").";
            answer="2";
            explain=["Gradient = change in y ÷ change in x.","Change in y = "+(v+4)+" − "+v+" = 4; change in x = 3 − 1 = 2.","Gradient = 4 ÷ 2 = 2."];
          }else if(family===2){
            q="For y = 2x + c, the line passes through ("+x+", "+(2*x+v)+"). Find c.";
            answer=String(v);
            explain=["Substitute x and y into y = 2x + c.",""+(2*x+v)+" = 2 × "+x+" + c = "+(2*x)+" + c.","Subtract "+(2*x)+": c = "+answer+"."];
          }else if(family===3){
            const actual=2*x+v+3,predicted=2*x+v;
            q="A fitted line predicts "+predicted+" and the actual value is "+actual+". Find the residual.";
            answer="3";
            explain=["Residual = actual value − predicted value.","Subtract: "+actual+" − "+predicted+".","The residual is 3."];
          }else if(family===4){
            q="A fitted line is y = 3x + "+v+". Predict y when x = 2.";
            answer=String(6+v);
            explain=["Substitute x = 2 into the model.","Multiply: 3 × 2 = 6.","Add the intercept "+v+": y = "+answer+"."];
          }else if(family===5){
            q="A fitted line is y = x + "+v+". Predict y when x = 4.";
            answer=String(4+v);
            explain=["Substitute x = 4.","The gradient is 1, so the x term is 4.","Add the intercept "+v+": y = "+answer+"."];
          }else if(family===6){
            q="A fitted line is y = 2x + "+v+". Find its y-intercept.";
            answer=String(v);
            explain=["The y-intercept is the value of y when x = 0.","In y = mx + c, the intercept is c.","Here c = "+answer+"."];
          }else{
            q="A fitted line predicts "+(x+v)+" and the actual value is "+(x+v-2)+". Find the residual.";
            answer="-2";
            explain=["Residual = actual − predicted.","Calculate "+(x+v-2)+" − "+(x+v)+".","The residual is −2, so the point is below the line."];
          }
        }else if(kind==="gradient-descent"){
          const target=v+1;
          const cases=[
            {w:v+5,t:target,rate:0.1}, {w:v+1,t:v+5,rate:0.2},
            {w:v+6,t:v+2,rate:0.1}, {w:v+2,t:v+6,rate:0.2},
            {w:v+4,t:v,rate:0.05}, {w:v+3,t:v+1,rate:0.25},
            {w:v+1,t:v+4,rate:0.1}, {w:v+5,t:v+2,rate:0.05}
          ];
          const item=cases[family];
          const gradient=2*(item.w-item.t);
          const newWeight=Number((item.w-item.rate*gradient).toFixed(4));
          q="For L(w)=(w−"+item.t+")², start at w="+item.w+" with learning rate "+item.rate+". Find the new w after one gradient-descent step.";
          answer=String(newWeight);
          explain=["Gradient = 2(w−target) = 2("+item.w+"−"+item.t+") = "+gradient+".","Update rule: new w = old w − learning rate × gradient.","New w = "+item.w+" − "+item.rate+"×("+gradient+") = "+answer+"."];
        }else if(kind==="dot-product"){
          const u1=v;
          const u2=v+1;
          const w1=v+2;
          const w2=v+3;
          if(family===0){
            q="Find ("+u1+", "+u2+") · ("+w1+", "+w2+").";
            answer=String(u1*w1+u2*w2);
            explain=["Dot product = multiply matching components and add.","Calculate "+u1+" × "+w1+" = "+u1*w1+" and "+u2+" × "+w2+" = "+u2*w2+".","Add: "+u1*w1+" + "+u2*w2+" = "+answer+"."];
          }else if(family===1){
            q="Find ("+u1+", −"+u2+") · ("+w1+", "+w2+").";
            answer=String(u1*w1-u2*w2);
            explain=["Multiply matching components.","Calculate "+u1+" × "+w1+" = "+u1*w1+" and (−"+u2+") × "+w2+" = −"+u2*w2+".","Add the products: "+u1*w1+" − "+u2*w2+" = "+answer+"."];
          }else if(family===2){
            q="Find ("+u1+", "+u2+", 1) · ("+w1+", 1, "+w2+").";
            answer=String(u1*w1+u2+w2);
            explain=["Multiply matching components in all 3 positions.","Products: "+u1+"×"+w1+" = "+u1*w1+", "+u2+"×1 = "+u2+", and 1×"+w2+" = "+w2+".","Add: "+u1*w1+" + "+u2+" + "+w2+" = "+answer+"."];
          }else if(family===3){
            q="Find (2, "+u1+") · ("+u2+", −1).";
            answer=String(2*u2-u1);
            explain=["Multiply matching components.","Products: 2×"+u2+" = "+2*u2+" and "+u1+"×(−1) = −"+u1+".","Add: "+2*u2+" − "+u1+" = "+answer+"."];
          }else if(family===4){
            q="Find (−"+u1+", "+u2+") · ("+w1+", "+w2+").";
            answer=String(-u1*w1+u2*w2);
            explain=["Multiply corresponding components, keeping signs.","Products: (−"+u1+")×"+w1+" = −"+(u1*w1)+"; "+u2+"×"+w2+" = "+(u2*w2)+".","Add: −"+(u1*w1)+" + "+(u2*w2)+" = "+answer+"."];
          }else if(family===5){
            q="Find ("+u1+", 0) · (0, "+w2+").";
            answer="0";
            explain=["Multiply components in matching positions.","The products are "+u1+"×0 = 0 and 0×"+w2+" = 0.","Their sum is 0, so the dot product is 0."];
          }else if(family===6){
            q="Find (1, "+u1+", "+u2+") · ("+w1+", "+w2+", 2).";
            answer=String(w1+u1*w2+2*u2);
            explain=["Multiply all matching components.","Products: 1×"+w1+" = "+w1+", "+u1+"×"+w2+" = "+u1*w2+", and "+u2+"×2 = "+2*u2+".","Add: "+w1+" + "+u1*w2+" + "+2*u2+" = "+answer+"."];
          }else{
            q="Find (2, "+u1+", −1) · ("+w1+", 2, "+w2+").";
            answer=String(2*w1+u1*2-w2);
            explain=["Multiply each component pair.","Products: 2×"+w1+" = "+2*w1+", "+u1+"×2 = "+u1*2+", and (−1)×"+w2+" = −"+w2+".","Add: "+2*w1+" + "+u1*2+" − "+w2+" = "+answer+"."];
          }
        }else{
          throw new Error("Unknown room exam pool: "+kind);
        }
        const index=pool.length;
        const level=index<13?"M":index<30?"H":"VH";
        const item=poolQuestion(q,answer,level,explain);
        item.id=kind+"-"+String(index+1).padStart(2,"0");
        pool.push(item);
      }
    }
    return pool;
  }

  function normalizeAnswer(value){
    return String(value==null?"":value)
      .trim()
      .toLowerCase()
      .replace(/[−–—]/g,"-")
      .replace(/[£]/g,"")
      .replace(/,/g,"")
      .replace(/,/g,".")
      .replace(/(?:cm|mm|km|kg|m|units?)\b/gi,"")
      .replace(/\s+/g,"");
  }

  function numericValue(value){
    let text=normalizeAnswer(value);
    text=text.replace(/^[a-z]\s*=/i,"");
    const isPercentage=text.endsWith("%");
    if(isPercentage)text=text.slice(0,-1);
    const fractionMatch=text.match(/^([+-]?\d+(?:\.\d+)?)\/([+-]?\d+(?:\.\d+)?)$/);
    if(fractionMatch){
      const denominator=Number(fractionMatch[2]);
      return denominator===0?null:Number(fractionMatch[1])/denominator/(isPercentage?100:1);
    }
    if(/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(text)){
      return Number(text)/(isPercentage?100:1);
    }
    return null;
  }

  function checkAnswer(question,response){
    const submitted=String(response==null?"":response).trim();
    if(!submitted)return false;
    const candidates=[question.answer].concat(Array.isArray(question.accept)?question.accept:[]);
    const actualNumber=numericValue(submitted);
    for(const expected of candidates){
      const expectedNumber=numericValue(expected);
      if(actualNumber!==null&&expectedNumber!==null){
        const configuredTolerance=Number.isFinite(Number(question.tolerance))?Math.abs(Number(question.tolerance)):0;
        const tolerance=Math.max(configuredTolerance,0.000001);
        if(Math.abs(actualNumber-expectedNumber)<=tolerance)return true;
      }
      if(normalizeAnswer(submitted)===normalizeAnswer(expected))return true;
    }
    return false;
  }

  function getState(storage){
    let saved={};
    try{
      saved=JSON.parse(storage.getItem(STORAGE_KEY)||"{}");
    }catch(error){
      saved={};
    }
    if(!saved||typeof saved!=="object"||Array.isArray(saved))saved={};
    return {
      rooms:saved.rooms&&typeof saved.rooms==="object"?saved.rooms:{},
      practiceMode:saved.practiceMode===true,
      points:Number.isFinite(saved.points)?saved.points:0,
      badges:Array.isArray(saved.badges)?saved.badges:[],
      days:Array.isArray(saved.days)?saved.days:[]
    };
  }

  function saveState(storage,state){
    storage.setItem(STORAGE_KEY,JSON.stringify(state));
  }

  function roomRecord(state,roomId){
    if(!state.rooms[roomId]){
      state.rooms[roomId]={tasks:[],taskAttempts:{},complete:false,attempts:0,bestScore:0,seen:[],activeExam:null,pointsAwarded:false};
    }
    const record=state.rooms[roomId];
    if(!record.taskAttempts||typeof record.taskAttempts!=="object")record.taskAttempts={};
    if(!record.taskResponses||typeof record.taskResponses!=="object")record.taskResponses={};
    if(!record.taskAnswers||typeof record.taskAnswers!=="object")record.taskAnswers={};
    return record;
  }

  function isRoomOpen(rooms,state,room){
    if(state.practiceMode)return true;
    if(room.order===1)return true;
    const previous=rooms.find(item=>item.path===room.path&&item.order===room.order-1);
    return Boolean(previous&&roomComplete(previous,state.rooms[previous.id]));
  }

  function roomAccess(rooms,state,roomId){
    const room=rooms.find(item=>item.id===roomId)||null;
    const previous=room?roomPreviousForAccess(rooms,room):null;
    return {room:room,previous:previous,allowed:Boolean(room&&isRoomOpen(rooms,state,room))};
  }

  function roomPreviousForAccess(rooms,room){
    return rooms.find(item=>item.path===room.path&&item.order===room.order-1)||null;
  }

  function canOpenTask(room,record,index){
    if(index<0||index>=room.tasks.length)return false;
    if(index===0)return true;
    return taskDone(room,record,index-1);
  }

  function taskQuestionAttempted(record,taskIndex,questionIndex){
    const key=String(taskIndex)+"-"+String(questionIndex);
    return Boolean(record.taskAnswers&&record.taskAnswers[key]===true);
  }

  function canOpenQuestion(room,record,taskIndex,questionIndex){
    if(!canOpenTask(room,record,taskIndex)||questionIndex<0||questionIndex>=room.tasks[taskIndex].questions.length)return false;
    if(questionIndex===0)return true;
    return taskQuestionAttempted(record,taskIndex,questionIndex-1);
  }

  function awardCorrectAnswer(state,record,key){
    record.answerRewards=record.answerRewards||{};
    if(record.answerRewards[key])return 0;
    record.answerRewards[key]=true;
    state.points+=10;
    root.dispatchEvent(new root.CustomEvent("mm2:points",{detail:{pointsEarned:10,source:"room-question"}}));
    if(!state.badges.includes("First Correct Answer"))state.badges.push("First Correct Answer");
    return 10;
  }

  function calculatePoints(state,rooms){
    return rooms.reduce((sum,room)=>{
      const record=state.rooms[room.id];
      if(!record)return sum;
      const roomPoints=record.pointsAwarded?room.points:0;
      const answerPoints=Object.keys(record.answerRewards||{}).length*10;
      return sum+roomPoints+answerPoints;
    },0);
  }

  function updateStreak(state,now){
    const date=now.toISOString().slice(0,10);
    if(!state.days.includes(date))state.days.push(date);
    state.days.sort();
  }

  function seededRandom(seed){
    let value=seed>>>0;
    return function(){
      value+=0x6D2B79F5;
      let t=value;
      t=Math.imul(t^(t>>>15),t|1);
      t^=t+Math.imul(t^(t>>>7),t|61);
      return ((t^(t>>>14))>>>0)/4294967296;
    };
  }

  function shuffle(items,random){
    const result=items.slice();
    for(let i=result.length-1;i>0;i-=1){
      const j=Math.floor(random()*(i+1));
      [result[i],result[j]]=[result[j],result[i]];
    }
    return result;
  }

  function selectExam(room,seen,seed){
    const random=seededRandom(seed);
    const previous=new Set(seen||[]);
    const selected=[];
    Object.keys(EXAM_LEVELS).forEach(level=>{
      const eligible=room.examPool.filter(question=>question.level===level);
      const fresh=eligible.filter(question=>!previous.has(question.id));
      const required=EXAM_LEVELS[level];
      const chosen=shuffle(fresh,random).slice(0,required);
      if(chosen.length<required){
        const chosenIds=new Set(chosen.map(question=>question.id));
        const remaining=shuffle(eligible.filter(question=>!chosenIds.has(question.id)),random);
        chosen.push(...remaining.slice(0,required-chosen.length));
      }
      selected.push(...chosen);
    });
    return shuffle(selected,random);
  }

  function earnedBadges(state,rooms){
    const completed=rooms.filter(room=>roomComplete(room,state.rooms[room.id]));
    const badges=new Set(state.badges);
    if(completed.length>=1)badges.add("First Room");
    if(completed.length>=3)badges.add("3 Rooms Done");
    if(completed.length>=1)badges.add("Exam Pass");
    if(completed.some(room=>state.rooms[room.id].bestScore===EXAM_SIZE))badges.add("Perfect Exam 25/25");
    if(streakLength(state.days)>=5)badges.add("5 Day Streak");
    ["gcse","ml"].forEach(path=>{
      const pathRooms=rooms.filter(room=>room.path===path);
      if(pathRooms.length&&pathRooms.every(room=>roomComplete(room,state.rooms[room.id])))badges.add("Path Complete");
    });
    state.badges=Array.from(badges);
    return state.badges;
  }

  function streakLength(days){
    if(!days.length)return 0;
    const sorted=days.slice().sort();
    let count=1;
    for(let i=sorted.length-1;i>0;i-=1){
      const current=new Date(sorted[i]+"T00:00:00Z");
      const previous=new Date(sorted[i-1]+"T00:00:00Z");
      if((current-previous)/86400000===1)count+=1;
      else break;
    }
    return count;
  }

  const api={
    STORAGE_KEY:STORAGE_KEY,
    EXAM_SIZE:EXAM_SIZE,
    PASS_MARK:PASS_MARK,
    EXAM_LEVELS:EXAM_LEVELS,
    UNITS:UNITS,
    normalizeAnswer:normalizeAnswer,
    checkAnswer:checkAnswer,
    getState:getState,
    saveState:saveState,
    roomRecord:roomRecord,
    roomComplete:roomComplete,
    isRoomOpen:isRoomOpen,
    roomAccess:roomAccess,
    canOpenTask:canOpenTask,
    canOpenQuestion:canOpenQuestion,
    taskDone:taskDone,
    tasksComplete:tasksComplete,
    taskQuestionAttempted:taskQuestionAttempted,
    awardCorrectAnswer:awardCorrectAnswer,
    calculatePoints:calculatePoints,
    selectExam:selectExam,
    seededRandom:seededRandom,
    earnedBadges:earnedBadges,
    streakLength:streakLength,
    makePool:makePool
  };
  root.ROOMS_ENGINE=api;
  root.ROOMS_DATA={makePool:makePool};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;

  if(typeof document!=="undefined"&&document.getElementById("rooms-list")){
    document.addEventListener("DOMContentLoaded",function(){initialize().catch(function(error){showFatal(error);});});
  }

  async function loadRoomFiles(){
    const files=root.ROOM_FILES||[];
    for(const file of files){
      await new Promise(function(resolve,reject){
        const script=document.createElement("script");
        script.src=root.MATH_MASTER_ASSETS?.[file]||file;
        script.onload=resolve;
        script.onerror=function(){reject(new Error("Could not load room file "+file));};
        document.head.appendChild(script);
      });
    }
    return root.ROOMS||[];
  }

  function escapeHTML(value){
    return String(value==null?"":value)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#39;");
  }
  function decodeTopicText(value){
    return String(value==null?"":value).replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'");
  }

  function wolframQuestionLink(question){
    const plain=String(question==null?"":question).replace(/<[^>]*>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&times;/gi,"×").replace(/&minus;/gi,"−").replace(/&divide;/gi,"÷").replace(/\s+/g," ").trim();
    const url="https://www.wolframalpha.com/input?i="+encodeURIComponent(plain);
    return "<a class=\"wolfram-question-link\" href=\""+escapeHTML(url)+"\" target=\"_blank\" rel=\"noopener noreferrer\">Check this question with Wolfram|Alpha ↗</a>";
  }

  function roomPrevious(rooms,room){
    return rooms.find(item=>item.path===room.path&&item.order===room.order-1)||null;
  }

  function roomNext(rooms,room){
    return rooms.find(item=>item.path===room.path&&item.order===room.order+1)||null;
  }

  function taskDone(room,record,index){
    const task=room.tasks[index];
    return Boolean(task&&task.questions.every((_,questionIndex)=>taskQuestionAttempted(record,index,questionIndex)));
  }

  function roomComplete(room,record){
    return Boolean(record&&record.complete===true&&tasksComplete(room,record));
  }

  function tasksComplete(room,record){
    return room.tasks.every((_,index)=>taskDone(room,record,index));
  }

  function completedTaskCount(room,record){
    return room.tasks.reduce((count,_,index)=>count+Number(taskDone(room,record,index)),0);
  }

  function currentStreak(state){
    return streakLength(state.days);
  }

  function formatTime(milliseconds){
    const total=Math.max(0,Math.floor(milliseconds/1000));
    const minutes=String(Math.floor(total/60)).padStart(2,"0");
    const seconds=String(total%60).padStart(2,"0");
    return minutes+":"+seconds;
  }

  function initialize(){
    return loadRoomFiles().then(function(loadedRooms){
      rooms=loadedRooms;
      state=getState(localStorage);
      for(const room of rooms)roomRecord(state,room.id);
      saveState(localStorage,state);
      cacheElements();
      bindHomeControls();
      updatePathView();
      if(selectedPath==="gcse")return loadGCSERoadmap();
      refresh();
      window.addEventListener("hashchange",route);
    });
  }

  let rooms=[];
  let state=null;
  let timerId=null;
  let dom={};
  let selectedPath="";
  let gcseRoadmapLoaded=false;
  let topicSpy=null;
  let filters={tier:"all",type:"all",status:"all"};
  const ROOM_TOPIC_IDS={
    "gcse-bidmas":"bidmas-calculator-skills",
    "gcse-fractions":"fractions",
    "gcse-percentages":"percentages",
    "gcse-linear-equations":"solving-linear-equations",
    "gcse-statistics":"averages",
    "ml-dot-product":"Vectors",
    "ml-matrix-vectors":"Linear Algebra",
    "ml-linear-regression":"Statistics",
    "ml-gradient-descent":"Numerical & Applied Maths"
  };

  function cacheElements(){
    ["rooms-hero","room-path-picker","room-path-content","room-path-kicker","rooms-start-title","rooms-start-copy","rooms-list","room-view","practice-banner","room-search","room-grade-filter","topic-jump-list","topic-jump-select","room-results-count","continue-room","practice-mode","practice-mode-help","export-progress","import-progress","reset-all","rooms-materials","path-progress-label","path-progress-percent","path-overall-progress","path-points","path-streak","path-rooms-done"].forEach(function(id){
      dom[id]=document.getElementById(id);
    });
  }

  function showFatal(error){
    const container=document.getElementById("rooms-list");
    if(container)container.innerHTML="<div class=\"room-notice\" role=\"alert\">Rooms could not load. "+escapeHTML(error.message)+"</div>";
  }

  function bindHomeControls(){
    dom["room-search"].addEventListener("input",renderRoadmaps);
    dom["room-grade-filter"].addEventListener("change",renderRoadmaps);
    document.querySelectorAll("[data-filter-group]").forEach(function(button){
      button.addEventListener("click",function(){
        const group=button.dataset.filterGroup;
        filters[group]=button.dataset.filter;
        document.querySelectorAll("[data-filter-group=\""+group+"\"]").forEach(function(item){
          const selected=item===button;
          item.classList.toggle("is-selected",selected);
          item.setAttribute("aria-pressed",String(selected));
        });
        renderRoadmaps();
      });
    });
    dom["topic-jump-list"].addEventListener("click",function(event){
      const link=event.target.closest("[data-jump-topic]");
      if(!link)return;
      const target=document.getElementById(link.dataset.jumpTopic);
      if(target)target.scrollIntoView({behavior:"smooth",block:"start"});
    });
    dom["topic-jump-select"].addEventListener("change",function(){
      const target=document.getElementById(dom["topic-jump-select"].value);
      if(target)target.scrollIntoView({behavior:"smooth",block:"start"});
    });
    dom["practice-mode"].addEventListener("change",function(event){
      const requested=event.target.checked;
      if(!window.confirm(requested?"Turn on practice mode and unlock all rooms? This is only for practice or fixing a lock issue.":"Turn off practice mode and restore room locks?")){
        event.target.checked=state.practiceMode;
        return;
      }
      state.practiceMode=requested;
      saveState(localStorage,state);
      const gcseState=readStored("mathmaster-gcse");gcseState.practiceMode=requested;localStorage.setItem("mathmaster-gcse",JSON.stringify(gcseState));
      refresh();
    });
    dom["export-progress"].addEventListener("click",exportProgress);
    dom["import-progress"].addEventListener("change",importProgress);
    dom["reset-all"].addEventListener("click",resetEverything);
    dom["rooms-list"].addEventListener("click",function(event){
      const link=event.target.closest("[data-room-link]");
      if(link){
        event.preventDefault();
        window.location.hash="room="+encodeURIComponent(link.dataset.roomLink);
      }
    });
    dom["rooms-list"].addEventListener("toggle",function(event){
      const section=event.target;
      if(!(section instanceof HTMLDetailsElement)||!section.matches("[data-topic-section]"))return;
      section.querySelector("summary")?.setAttribute("aria-expanded",String(section.open));
      const saved=readStored(sectionStorageKey());
      saved[section.dataset.topicSection]=section.open;
      localStorage.setItem(sectionStorageKey(),JSON.stringify(saved));
    },true);
    dom["room-view"].addEventListener("click",handleRoomClick);
    dom["room-view"].addEventListener("input",handleRoomInput);
    dom["room-view"].addEventListener("change",handleRoomInput);
  }

  function refresh(){
    updatePathView();
    dom["practice-mode"].checked=state.practiceMode;
    dom["practice-mode-help"].textContent=state.practiceMode
      ?"On · room locks are off. Tasks inside a room still unlock in order."
      :"Off · finish a room to unlock the next one.";
    renderSummary();
    renderRoadmaps();
    route();
  }

  function renderSummary(){
    const sections=getCatalogSections();
    const entries=sections.flatMap(section=>section.items);
    const completed=entries.filter(item=>item.done).length;
    const percent=entries.length?Math.round(completed/entries.length*100):0;
    dom["path-progress-label"].textContent=completed+" of "+entries.length+" rooms complete";
    dom["path-progress-percent"].textContent=percent+"%";
    dom["path-overall-progress"].value=percent;
    dom["path-overall-progress"].setAttribute("aria-valuetext",percent+"% of rooms complete");
    dom["path-points"].textContent=String(state.points);
    dom["path-streak"].textContent=String(currentStreak(state));
    dom["path-rooms-done"].textContent=String(completed);
  }

  function updatePathView(){
    const requested=new URLSearchParams(window.location.search).get("path");
    const match=window.location.hash.match(/(?:^#|&)room=([^&]+)/);
    let hashPath="";
    if(match){
      let id="";
      try{id=decodeURIComponent(match[1]);}catch(error){id=match[1];}
      hashPath=(rooms.find(room=>room.id===id)||{}).path||"";
    }
    selectedPath=["gcse","ml"].includes(requested)?requested:(hashPath||(/(?:^#|&)room=/.test(window.location.hash)?"ml":""));
    const hasPath=Boolean(selectedPath);
    dom["rooms-hero"].hidden=hasPath;
    dom["room-path-picker"].hidden=hasPath;
    dom["room-path-content"].hidden=!hasPath;
    if(!hasPath)return;
    const gcse=selectedPath==="gcse";
    document.body.classList.toggle("path-is-ml",!gcse);
    dom["room-path-kicker"].textContent=gcse?"GCSE LEARNING PATH":"MACHINE LEARNING PATH";
    dom["rooms-start-title"].textContent=gcse?"GCSE maths":"Maths for machine learning";
    dom["rooms-start-copy"].textContent=gcse
      ?"Build your skills across the GCSE curriculum, from number foundations to advanced topics."
      :"Follow the core maths sequence, then explore further topics when you’re ready.";
    dom["rooms-materials"].hidden=gcse;
    document.title=(gcse?"GCSE Rooms":"ML Rooms")+" | Math Master";
    dom["practice-banner"].hidden=!state.practiceMode;
  }

  function progressPercent(room){
    const record=state.rooms[room.id];
    return Math.round(completedTaskCount(room,record)/room.tasks.length*100);
  }

  function readStored(key){
    try{return JSON.parse(localStorage.getItem(key)||"{}");}catch(error){return {};}
  }

  function sectionStorageKey(){
    return "mathmaster-room-sections-"+selectedPath;
  }

  function topicSlug(title){
    if(String(title).trim().toLowerCase().startsWith("basic arithmetic"))return "basic-arithmetic";
    return String(title).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  }
  async function loadGCSERoadmap(){
    if(gcseRoadmapLoaded){refresh();return;}
    try{
      const asset=path=>root.MATH_MASTER_ASSETS?.[path]||path;
      const response=await fetch(asset("js/gcse/index.js"));
      if(!response.ok)throw new Error("Could not load GCSE topics.");
      const files=(await response.text()).split(/\r?\n/).map(line=>line.trim().replace(/^[\"']|[\"']$/g,"")).filter(Boolean);
      if(files.some(file=>!/^[\w-]+\.js$/.test(file)))throw new Error("The GCSE topic list contains an invalid file name.");
      root.GCSE=[];
      for(const file of files){
        await new Promise(function(resolve,reject){
          const script=document.createElement("script");script.src=asset("js/gcse/topics/"+file);script.onload=resolve;script.onerror=function(){reject(new Error("Could not load GCSE topic: "+file));};document.head.appendChild(script);
        });
      }
      root.GCSE_ROADMAP_TOPICS=root.GCSE||[];
      gcseRoadmapLoaded=true;
      refresh();
      window.addEventListener("hashchange",route);
      if(location.hash==="#rooms-list")dom["rooms-list"].scrollIntoView();
    }catch(error){
      dom["rooms-list"].innerHTML="<p class=\"room-notice\" role=\"alert\">"+escapeHTML(error.message)+" Refresh the page to try again.</p>";
      window.addEventListener("hashchange",route);
    }
  }

  function renderRoadmaps(){
    if(!selectedPath){dom["rooms-list"].innerHTML="";return;}
    const query=dom["room-search"].value.trim().toLowerCase();
    const grade=dom["room-grade-filter"].value;
    const sections=getCatalogSections();
    const visibleSections=[];
    let matchingCount=0;
    const savedSections=readStored(sectionStorageKey());
    sections.forEach(function(section){
      const allItems=section.items;
      section.items=allItems.filter(function(item){
        const text=(item.title+" "+item.description+" "+section.title+" "+(item.tier||"")+" "+(item.grade||"")).toLowerCase();
        const tierMatch=filters.tier==="all"||item.tier==="FH"||item.tier==="all"||item.tier===filters.tier;
        const typeMatch=filters.type==="all"||item.kind===filters.type;
        const statusMatch=filters.status==="all"||entryProgressStatus(item)===filters.status;
        const matchesGrade=grade==="all"||gradeMatches(item.grade,grade);
        return (!query||text.includes(query))&&tierMatch&&typeMatch&&statusMatch&&matchesGrade;
      });
      matchingCount+=section.items.length;
      if(section.items.length){
        section.complete=allItems.length>0&&allItems.every(item=>item.done);
        section.count=sectionProgress({items:allItems});
        section.isOpen=Object.prototype.hasOwnProperty.call(savedSections,section.id)
          ?savedSections[section.id]
          :!visibleSections.some(item=>!item.complete)&&!section.complete;
        visibleSections.push(section);
      }
    });
    dom["room-results-count"].textContent=matchingCount+" room"+(matchingCount===1?"":"s")+" shown";
    if(!matchingCount){
      dom["rooms-list"].innerHTML="<p class=\"room-empty room-no-results\">No rooms found. Try another search or filter.</p>";
      renderTopicJump([]);
      dom["continue-room"].href="#rooms-list";
      dom["continue-room"].textContent="No rooms to continue";
      return;
    }
    const coreSections=visibleSections.filter(section=>!section.optional);
    const optionalSections=visibleSections.filter(section=>section.optional);
    dom["rooms-list"].innerHTML=coreSections.map(renderTopicSection).join("")+
      (optionalSections.length?"<section class=\"optional-topic-group\" aria-labelledby=\"optional-topics-title\"><header><span>OPTIONAL / ADVANCED</span><h2 id=\"optional-topics-title\">Explore beyond the core path</h2><p>These topics are extra depth; complete the core path first to unlock them.</p></header>"+optionalSections.map(renderTopicSection).join("")+"</section>":"");
    renderTopicJump(visibleSections);
    const next=sections.flatMap(section=>section.items).find(item=>!item.done&&item.open);
    if(next){
      dom["continue-room"].href=next.kind==="guided"?"#room="+encodeURIComponent(next.id):next.href;
      dom["continue-room"].innerHTML="Continue <span aria-hidden=\"true\">→</span>";
      dom["continue-room"].setAttribute("aria-label","Continue to "+next.title);
    }else{
      dom["continue-room"].href="#rooms-list";
      dom["continue-room"].innerHTML="Review rooms <span aria-hidden=\"true\">→</span>";
      dom["continue-room"].setAttribute("aria-label","Review completed rooms");
    }
    renderSummary();
  }

  function gradeMatches(value,range){
    const wanted=range.match(/\d+/g).map(Number);
    const actual=String(value||"").match(/\d+/g);
    return Boolean(actual&&Number(actual.at(-1))>=wanted[0]&&Number(actual[0])<=wanted[1]);
  }

  function decodeTopicText(value){
    const node=document.createElement("textarea");
    node.innerHTML=String(value||"");
    return node.value;
  }

  function gcseTopicComplete(topic,progress){
    const answers=progress.answers||{};
    return ["practice","exam"].every(function(which){
      return (topic[which]||[]).every(function(_,index){
        const answer=answers[topic.id+":"+which+":"+index];
        return Boolean(answer&&(answer.attempted||answer.right>0||answer.wrong>0));
      });
    });
  }

  function getCatalogSections(){
    if(selectedPath==="gcse"){
      const topics=root.GCSE_ROADMAP_TOPICS||[];
      const progress=readStored("mathmaster-gcse");
      const sections=[];
      const groups=new Map();
      topics.forEach(function(topic,index){
        const area=decodeTopicText(topic.area)||"Other topics";
        if(!groups.has(area)){
          const section={id:"topic-"+topicSlug(area),title:area,description:"GCSE "+area.toLowerCase()+" rooms and lessons.",items:[]};
          groups.set(area,section);
          sections.push(section);
        }
        const previous=topics[index-1];
        const done=gcseTopicComplete(topic,progress);
        const open=Boolean(progress.practiceMode)||index===0||!previous||gcseTopicComplete(previous,progress);
        groups.get(area).items.push({
          kind:"lesson",id:topic.id,title:decodeTopicText(topic.title),description:"A focused lesson with examples and practice.",
          icon:"📘",href:"/gcse.html#topic="+encodeURIComponent(topic.id),tier:topic.tier,grade:topic.grade,
          done:done,open:open,progress:done?100:0,section:area,topic:topic,index:index
        });
      });
      return addGuidedRooms(sections,topics,"gcse");
    }
    const topics=root.MATH_MASTER_TOPICS||[];
    const progress=readStored("mathmaster");
    const roomProgress=readStored(STORAGE_KEY);
    const core=topics.filter(topic=>topic[2]==="core");
    const coreComplete=core.every(function(topic){
      const index=topics.indexOf(topic);
      return Boolean(progress.done&&progress.passed&&progress.done[index]&&progress.passed[index]);
    });
    const orderedTopics=core.concat(topics.filter(topic=>topic[2]!=="core"));
    const sections=orderedTopics.map(function(topic){
      const index=topics.indexOf(topic);
      const isCore=topic[2]==="core";
      const coreIndex=isCore?core.indexOf(topic):-1;
      const previous=coreIndex>0?topics.indexOf(core[coreIndex-1]):-1;
      const done=Boolean(progress.done&&progress.passed&&progress.done[index]&&progress.passed[index]);
      const open=isCore
        ?coreIndex===0||Boolean(roomProgress.practiceMode)||(previous>=0&&Boolean(progress.done&&progress.passed&&progress.done[previous]))
        :coreComplete||Boolean(roomProgress.practiceMode);
      const title=topic[1].replace(/&amp;/g,"&");
      const item={
        kind:"lesson",id:"ml-topic-"+index,title:title,description:topic[3],icon:topic[0],
        href:"/topic/"+topicSlug(title)+"/?path=ml-fast",done:done,open:open,progress:done?100:0,
        optional:!isCore,section:title,tier:"all",grade:"",topic:topic,index:index
      };
      return {id:"topic-"+topicSlug(title),title:title,description:topic[3],items:[item],optional:!isCore};
    });
    return addGuidedRooms(sections,topics,"ml");
  }

  function addGuidedRooms(sections,topics,pathName){
    rooms.filter(room=>room.path===pathName).sort((a,b)=>a.order-b.order).forEach(function(room){
      const anchor=ROOM_TOPIC_IDS[room.id];
      const anchorTopic=pathName==="gcse"?(topics||[]).find(item=>item.id===anchor):null;
      let section;
      if(pathName==="gcse"){
        const area=anchorTopic&&decodeTopicText(anchorTopic.area);
        section=sections.find(item=>item.title===area)||sections.find(item=>item.title===room.area);
      }else{
        const target=String(anchor||"").toLowerCase();
        section=sections.find(item=>item.title.toLowerCase()===target)||
          sections.find(item=>item.title.toLowerCase().includes(target));
      }
      if(!section)section=sections.find(item=>item.title===room.area)||sections[0];
      if(!section)return;
      const record=roomRecord(state,room.id);
      const guidedIndex=section.items.findIndex(item=>item.kind!=="guided");
      section.items.splice(guidedIndex<0?section.items.length:guidedIndex,0,{
        kind:"guided",id:room.id,title:room.title,description:room.blurb,icon:room.icon,
        room:room,done:roomComplete(room,record),open:isRoomOpen(rooms,state,room),
        progress:progressPercent(room),optional:Boolean(section.optional),tier:room.tier||"all",
        grade:anchorTopic&&anchorTopic.grade||"",section:section.title
      });
    });
    return sections;
  }

  function entryProgressStatus(item){
    if(item.done)return "complete";
    if(item.kind==="guided"){
      const record=state.rooms[item.id];
      return record&&(record.attempts||record.tasks.some(Boolean))?"progress":"open";
    }
    return itemProgress(item)>0?"progress":"open";
  }

  function entryStatus(item){
    const progress=entryProgressStatus(item);
    return progress==="complete"?progress:item.open?progress:"locked";
  }

  function itemProgress(item){
    if(item.done)return 100;
    if(item.kind==="guided")return item.progress;
    if(selectedPath==="gcse"){
      const progress=readStored("mathmaster-gcse");
      const answerMap=progress.answers||{};
      let total=0,attempted=0;
      ["practice","exam"].forEach(which=>(item.topic[which]||[]).forEach((_,index)=>{
        total+=1;
        const answer=answerMap[item.topic.id+":"+which+":"+index];
        if(answer&&(answer.attempted||answer.right>0||answer.wrong>0))attempted+=1;
      }));
      return total?Math.round(attempted/total*100):0;
    }
    const progress=readStored("mathmaster");
    return progress.done&&progress.done[item.index]?50:0;
  }

  function sectionProgress(section){
    const completed=section.items.filter(item=>item.done).length;
    return {completed:completed,total:section.items.length};
  }

  function renderTopicJump(sections){
    dom["topic-jump-select"].innerHTML="<option value=\"\">Jump to topic</option>"+sections.map(section=>"<option value=\""+escapeHTML(section.id)+"\">"+escapeHTML(section.title)+"</option>").join("");
    dom["topic-jump-list"].innerHTML=sections.map(section=>{
      const count=section.count||sectionProgress(section),percent=count.total?Math.round(count.completed/count.total*100):0;
      return "<a href=\"#"+escapeHTML(section.id)+"\" data-jump-topic=\""+escapeHTML(section.id)+"\"><span>"+escapeHTML(section.title)+"</span><small>"+count.completed+"/"+count.total+"</small><span class=\"topic-jump-meter\" aria-hidden=\"true\"><span style=\"width:"+percent+"%\"></span></span></a>";
    }).join("");
    topicSpy?.disconnect();
    if("IntersectionObserver" in window){
      topicSpy=new IntersectionObserver(entries=>{
        const current=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
        if(!current)return;
        dom["topic-jump-list"].querySelectorAll("[data-jump-topic]").forEach(link=>{
          const active=link.dataset.jumpTopic===current.target.id;
          link.classList.toggle("is-current",active);
          if(active)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");
        });
      },{rootMargin:"-18% 0px -68% 0px",threshold:[0,.2,.5,1]});
      dom["rooms-list"].querySelectorAll(".topic-section").forEach(section=>topicSpy.observe(section));
    }
  }

  function renderTopicSection(section){
    section.items.forEach((item,index)=>{item.roadmapIndex=index;});
    const count=section.count||sectionProgress(section);
    const percent=count.total?Math.round(count.completed/count.total*100):0;
    const points=section.items.reduce((sum,item)=>sum+(item.room?item.room.points:lessonQuestionCount(item)*10),0);
    const minutes=section.items.reduce((sum,item)=>sum+(item.room?item.room.minutes:Math.max(10,lessonQuestionCount(item)*2)),0);
    const levels=[...new Set(section.items.map(item=>item.tier).filter(tier=>tier&&tier!=="all"))];
    const completed=count.total>0&&count.completed===count.total;
    const available=section.items.some(item=>item.open&&!item.done);
    const started=section.items.some(item=>entryProgressStatus(item)==="progress");
    const status=completed?"Completed":available?started?"In progress":"Available":"Locked";
    const firstAvailable=section.items.find(item=>item.open&&!item.done)||section.items.find(item=>item.done)||section.items[0];
    const action=completed?"Review topic":started?"Continue topic":available?"Start topic":"Preview topic";
    const icon=section.icon||topicIcon(section.title);
    const accent=topicAccent(section.title);
    const combinedLevels=levels.includes("FH")||(levels.includes("F")&&levels.includes("H"));
    const levelBadges=combinedLevels
      ?"<span class=\"topic-level-chip\">Foundation &amp; Higher</span>"
      :levels.map(level=>"<span class=\"topic-level-chip\">"+(level==="F"?"Foundation":level==="H"?"Higher":"Level "+escapeHTML(level))+"</span>").join("");
    const optional=section.optional?"<span class=\"topic-optional-ribbon\">Optional / Advanced</span>":"";
    const firstHref=firstAvailable.kind==="guided"?"#room="+encodeURIComponent(firstAvailable.id):firstAvailable.href;
    const firstLinkAttributes=firstAvailable.kind==="guided"?" data-room-link=\""+escapeHTML(firstAvailable.id)+"\"":"";
    const sectionAction="<a class=\"topic-start-button\" href=\""+escapeHTML(firstHref)+"\""+firstLinkAttributes+">"+action+" <span aria-hidden=\"true\">→</span></a>";
    return "<details class=\"topic-section"+(section.optional?" is-optional":"")+"\" id=\""+escapeHTML(section.id)+"\" data-topic-section=\""+escapeHTML(section.id)+"\" data-topic-accent=\""+accent+"\""+(section.isOpen?" open":"")+">"+
      "<summary aria-expanded=\""+String(Boolean(section.isOpen))+"\"><span class=\"topic-section-icon\" aria-hidden=\"true\">"+escapeHTML(icon)+"</span>"+
      "<span class=\"topic-section-heading\"><h3>"+escapeHTML(section.title)+"</h3>"+optional+"<small>"+escapeHTML(section.description||"")+"</small>"+
      "<span class=\"topic-section-chips\">"+levelBadges+"<span class=\"topic-status-chip is-"+status.toLowerCase().replace(/\s/g,"-")+"\">"+status+"</span></span></span>"+
      "<span class=\"topic-section-progress\"><span class=\"topic-progress-ring\" role=\"progressbar\" aria-label=\""+escapeHTML(section.title)+" progress\" aria-valuemin=\"0\" aria-valuemax=\""+count.total+"\" aria-valuenow=\""+count.completed+"\" style=\"--topic-progress:"+percent+"%\"><strong>"+count.completed+"/"+count.total+"</strong></span>"+
      "<small>"+points.toLocaleString()+" pts · "+minutes.toLocaleString()+" min</small></span><span class=\"topic-section-chevron\" aria-hidden=\"true\">⌄</span></summary>"+
      "<div class=\"topic-section-body\"><footer class=\"topic-section-footer\">"+sectionAction+"</footer>"+
      "<div class=\"room-card-grid\" role=\"list\" aria-label=\""+escapeHTML(section.title)+" learning roadmap\">"+section.items.map(renderRoomCard).join("")+
      "</div></div></details>";
  }

  function lessonQuestionCount(item){
    if(selectedPath==="gcse")return (item.topic.practice||[]).length+(item.topic.exam||[]).length;
    return (item.topic[5]||[]).length;
  }

  function topicAccent(title){
    const normalized=String(title).toLowerCase();
    if(normalized.includes("algebra")||normalized.includes("calculus"))return "purple";
    if(normalized.includes("geometry")||normalized.includes("vector")||normalized.includes("coordinate"))return "blue";
    if(normalized.includes("probability")||normalized.includes("combinatorics"))return "orange";
    if(normalized.includes("statistics"))return "teal";
    if(normalized.includes("ratio")||normalized.includes("fraction"))return "pink";
    return "green";
  }

  function topicIcon(title){
    const accent=topicAccent(title);
    return {purple:"ƒ",blue:"◇",orange:"◉",teal:"▥",pink:"⇄",green:"＋"}[accent];
  }

  function renderRoomCard(item){
    const status=entryStatus(item);
    const locked=status==="locked",complete=status==="complete",inProgress=status==="progress";
    const room=item.room;
    const description=locked
      ?item.kind==="guided"?"Finish: "+(roomPrevious(rooms,room)?.title||"the previous room")+" first"
        :item.optional?"Finish the 12 core topics to unlock this optional lesson"
          :"Finish the previous topic first"
      :item.description;
    const badges="<span class=\"room-badge badge-type\">"+(item.kind==="guided"?"Guided":"Lesson")+"</span>"+
      (item.optional?"<span class=\"room-badge badge-optional\">Optional</span>":"")+
      (item.tier&&item.tier!=="all"?"<span class=\"room-badge badge-tier\">"+(item.tier==="F"?"Foundation":item.tier==="H"?"Higher":"Foundation &amp; Higher")+"</span>":"")+
      (item.grade?"<span class=\"room-badge badge-grade\">Grade "+escapeHTML(item.grade)+"</span>":"");
    const stateText=complete?"Completed":inProgress?"In progress · "+item.progress+"%":locked?"Locked · Preview":"Not started";
    const marker=complete?"<span class=\"room-card-check\" aria-hidden=\"true\">✓</span>":locked?"<span class=\"room-card-lock\" aria-hidden=\"true\">🔒</span>":"";
    const href=item.kind==="guided"?"#room="+encodeURIComponent(item.id):item.href;
    const attributes=item.kind==="guided"?" data-room-link=\""+escapeHTML(item.id)+"\"":"";
    const classes="room-card"+(locked?" is-locked":"")+(complete?" is-complete":"")+(inProgress?" is-in-progress":"")+(item.kind==="guided"?" is-guided":"");
    const progress=itemProgress(item);
    const tasks=room?room.tasks.length:lessonQuestionCount(item);
    const minutes=room?room.minutes:Math.max(10,tasks*2);
    const points=room?room.points:tasks*10;
    const action=locked?"Preview":complete?"Review":inProgress?"Continue":"Start room";
    const roadmapNode=item.roadmapIndex==null?"":String(item.roadmapIndex+1).padStart(2,"0");
    return "<a role=\"listitem\" class=\""+classes+"\" href=\""+escapeHTML(href)+"\""+attributes+" aria-label=\""+(locked?"Preview locked ":"Open ")+escapeHTML(item.title)+"\"><span class=\"roadmap-node\" aria-hidden=\"true\">"+(complete?"✓":locked?"🔒":roadmapNode)+"</span><span class=\"room-card-top\"><span class=\"room-icon\" aria-hidden=\"true\">"+escapeHTML(item.icon||"📘")+"</span>"+marker+"</span><span class=\"room-card-title\">"+escapeHTML(item.title)+"</span><span class=\"room-card-description\">"+escapeHTML(description)+"</span><span class=\"room-card-badges\">"+badges+"</span><span class=\"room-card-meta\">◷ "+minutes+" min · ✦ "+points+" pts · "+tasks+" tasks</span><span class=\"room-card-footer\"><span>"+stateText+"</span><span class=\"room-card-progress\" role=\"progressbar\" aria-label=\""+escapeHTML(item.title)+" progress\" aria-valuemin=\"0\" aria-valuemax=\"100\" aria-valuenow=\""+progress+"\"><span style=\"width:"+progress+"%\"></span></span><span class=\"room-card-action\">"+action+" <span aria-hidden=\"true\">→</span></span></span></a>";
  }

  function route(){
    if(!dom["room-view"]||!state)return;
    if(timerId){clearInterval(timerId);timerId=null;}
    const match=window.location.hash.match(/(?:^#|&)room=([^&]+)/);
    if(!match){
      document.body.classList.remove("rooms-room-open");
      dom["room-view"].hidden=true;
      dom["room-view"].innerHTML="";
      return;
    }
    let id="";
    try{id=decodeURIComponent(match[1]);}catch(error){id=match[1];}
    const routedRoom=rooms.find(item=>item.id===id);
    if(routedRoom&&selectedPath!==routedRoom.path){
      selectedPath=routedRoom.path;
      history.replaceState({},"",window.location.pathname+"?path="+selectedPath+window.location.hash);
      updatePathView();
      renderSummary();
      renderRoadmaps();
    }
    const access=roomAccess(rooms,state,id);
    const room=access.room;
    document.body.classList.add("rooms-room-open");
    if(!room){
      showRoomNotice("Room not found","Choose a room from one of the paths above.");
      return;
    }
    const roomState=roomRecord(state,room.id);
    if(!roomState.lastOpened||Date.now()-roomState.lastOpened>60000){roomState.lastOpened=Date.now();saveState(localStorage,state);}
    renderRoom(room,!access.allowed);
  }

  function showRoomNotice(title,message){
    dom["room-view"].hidden=false;
    const pathLink="/rooms.html?path="+encodeURIComponent(selectedPath||"ml")+"#rooms-list";
    dom["room-view"].innerHTML="<section class=\"room-locked-page\"><h1>"+escapeHTML(title)+"</h1><p>"+escapeHTML(message)+"</p><a class=\"room-primary\" href=\""+pathLink+"\">Back to the "+(selectedPath==="gcse"?"GCSE":"ML")+" path</a></section>";
    dom["room-view"].scrollIntoView({behavior:"smooth",block:"start"});
  }

  function renderRoom(room,previewLocked){
    const record=roomRecord(state,room.id);
    renderSummary();
    renderRoadmaps();
    const previous=roomPrevious(rooms,room);
    const next=roomNext(rooms,room);
    const objectives=room.objectives.map(item=>"<li>"+escapeHTML(item)+"</li>").join("");
    const badges=roomComplete(room,record)?"<span class=\"room-pill\">🏅 Room complete</span>":"";
    const visualPractice=root.VisualMap?root.VisualMap.render({id:room.id,title:room.title,area:room.area,description:room.blurb,topics:room.objectives.join(" ")}):"";
    const allDone=tasksComplete(room,record);
    const requestedStep=window.location.hash.match(/(?:^#|&)step=(\d+)/);
    const firstOpenStep=room.tasks.findIndex((task,index)=>!taskDone(room,record,index));
    const fallbackStep=firstOpenStep===-1?Math.max(0,room.tasks.length-1):firstOpenStep;
    const requestedStepIndex=requestedStep?Number(requestedStep[1]):fallbackStep;
    const activeStep=previewLocked||canOpenTask(room,record,requestedStepIndex)
      ?Math.min(room.tasks.length-1,Math.max(0,requestedStepIndex))
      :fallbackStep;
    const taskHTML=room.tasks.map(function(task,index){
      const done=taskDone(room,record,index);
      const open=previewLocked||canOpenTask(room,record,index);
      const title=done?"✓ Task "+(index+1):open?"Task "+(index+1):"🔒 Task "+(index+1);
      return "<details class=\"room-task-accordion"+(done?" is-complete":"")+(index===activeStep?" is-current":"")+(open?"":" is-locked")+"\""+(index===activeStep?" open":"")+" data-task-accordion=\""+index+"\"><summary><span class=\"task-accordion-number\">"+title+"</span><strong>"+escapeHTML(task.title)+"</strong><span class=\"task-accordion-state\">"+(done?"Completed":open?"Open":"Locked")+"</span></summary>"+renderTask(room,record,task,index,previewLocked)+"</details>";
    }).join("");
    const taskNavigation=room.tasks.map(function(task,index){
      const done=taskDone(room,record,index);
      const open=previewLocked||canOpenTask(room,record,index);
      const current=index===activeStep;
      const status=done?"Complete":open?"Ready":"Locked";
      const link="<a href=\"#room="+encodeURIComponent(room.id)+"&step="+index+"\""+(current?" aria-current=\"step\"":"")+"><span class=\"room-step-number\">"+String(index+1).padStart(2,"0")+"</span><span class=\"room-step-label\"><strong>"+escapeHTML(task.title)+"</strong><small>"+(done?"Complete":open?"Open":"Locked")+"</small></span></a>";
      return "<li class=\"room-step-item"+(done?" is-complete":"")+(current?" is-current":"")+(!open?" is-locked":"")+"\">"+(open?link:"<span class=\"room-step-locked\" aria-disabled=\"true\"><span class=\"room-step-number\">"+String(index+1).padStart(2,"0")+"</span><span class=\"room-step-label\"><strong>"+escapeHTML(task.title)+"</strong><small>🔒 "+status+"</small></span></span>")+"</li>";
    }).join("");
    const examStepStatus=record.lastResult
      ?(record.lastResult.passed?"Complete":"Review")
      :record.activeExam?"In progress":allDone?"Ready":"Locked";
    const examStepClass=record.lastResult&&record.lastResult.passed?" is-complete":"";
    const examNavigation="<li class=\"room-step-item room-exam-step"+examStepClass+"\"><span class=\"room-step-number\">★</span><span class=\"room-step-label\"><strong>Hard Exam</strong><small>"+(allDone?"Open · ":"🔒 ")+examStepStatus+"</small></span></li>";
    const examHTML=previewLocked?"<section class=\"room-exam\"><h2>Hard Exam 🔒</h2><p class=\"room-muted\">Preview only. Pass the previous room to unlock this room's tasks and exam.</p></section>":
      record.activeExam?renderExam(room,record):
      record.lastResult?renderResult(room,record,record.lastResult,next):
      allDone?renderExamReady(room):"";
    const resourceQuery=encodeURIComponent(room.title);
    const links=(room.links||[]).map(link=>[link[0],link[1]]).concat([
      ["Explore "+room.title+" with Wolfram|Alpha","https://www.wolframalpha.com/input?i="+encodeURIComponent(room.title+" mathematics")],
      ["YouTube search","https://www.youtube.com/results?search_query="+resourceQuery],
      ["Khan Academy search","https://www.khanacademy.org/search?page_search_query="+resourceQuery],
      ["Corbettmaths search","https://corbettmaths.com/?s="+resourceQuery]
    ]);
    dom["room-view"].hidden=false;
    dom["room-view"].innerHTML=
      (previewLocked?"<p class=\"room-notice\" role=\"status\">Preview only: finish and pass "+escapeHTML(previous?previous.title:"the previous room")+" to unlock these tasks and the exam. You can read the lesson and questions now.</p>":"")+
      "<a class=\"room-back-link\" href=\"#rooms-list\">← All learning rooms</a><section class=\"room-panel\"><div class=\"room-title-row\"><div><span class=\"eyebrow dark\">"+escapeHTML(room.path==="gcse"?"GCSE room":"Machine learning room")+" · Room "+room.order+"</span><h1><span class=\"room-page-icon\" aria-hidden=\"true\">"+escapeHTML(room.icon)+"</span>"+escapeHTML(room.title)+"</h1></div><div class=\"room-badges\"><span class=\"room-pill\">Guided</span><span class=\"room-pill\">"+escapeHTML(room.difficulty)+"</span><span class=\"room-pill\">"+room.minutes+" minutes</span><span class=\"room-pill\">"+room.points+" points</span>"+badges+"</div></div>"+
      "<p class=\"room-earned-points\" role=\"status\">⭐ "+state.points+" points earned</p>"+
      "<p>"+escapeHTML(room.blurb)+"</p><div data-room-ai-guide></div><details class=\"room-goals\"><summary>What you’ll learn</summary><ul class=\"room-objectives\">"+objectives+"</ul></details>"+
      "<div class=\"room-progress\" role=\"progressbar\" aria-label=\"Room task progress\" aria-valuemin=\"0\" aria-valuemax=\""+room.tasks.length+"\" aria-valuenow=\""+completedTaskCount(room,record)+"\"><span style=\"width:"+progressPercent(room)+"%\"></span></div>"+
      "<p class=\"room-muted\">"+completedTaskCount(room,record)+" of "+room.tasks.length+" steps complete · "+(record.attempts?"Best exam: "+record.bestScore+"/"+EXAM_SIZE:"Final check at the end")+"</p>"+
      "<details class=\"room-options\"><summary>Room options</summary><button type=\"button\" class=\"room-danger\" data-action=\"reset-room\" aria-label=\"Reset "+escapeHTML(room.title)+" and later rooms on this path\">Reset this room and later rooms</button></details></section>"+
      (record.lastTaskAttempt?"<p class=\"room-step-feedback "+(record.lastTaskAttempt.correct?"is-correct":"is-wrong")+"\" role=\"status\">"+(record.lastTaskAttempt.correct?"✅ Correct! "+(record.lastTaskAttempt.points?"+"+record.lastTaskAttempt.points+" points earned.":"Points already earned for this question.")+" Your next step is unlocked.":"❌ Not correct yet. No points earned. This step stays open until you get it right.")+"</p>":"") +
      "<div class=\"room-learning-layout\"><aside class=\"room-sidebar\" aria-label=\"Room progress\"><strong>Room progress</strong><ol>"+taskNavigation+examNavigation+"</ol><p>"+completedTaskCount(room,record)+" of "+room.tasks.length+" tasks complete</p><div class=\"room-sidebar-progress\"><span style=\"width:"+progressPercent(room)+"%\"></span></div></aside><div class=\"room-step-main\"><div class=\"room-task-list\">"+taskHTML+"</div>"+
      "<nav class=\"room-step-navigation\" aria-label=\"Room step navigation\">"+(activeStep>0?"<a class=\"room-secondary\" href=\"#room="+encodeURIComponent(room.id)+"&step="+(activeStep-1)+"\">← Previous step</a>":"<span></span>")+(activeStep<room.tasks.length-1?(canOpenTask(room,record,activeStep+1)?"<a class=\"room-primary\" href=\"#room="+encodeURIComponent(room.id)+"&step="+(activeStep+1)+"\">Next step →</a>":"<span class=\"room-next-locked\" aria-disabled=\"true\">🔒 Answer this step to continue</span>"):"")+"</nav>"+examHTML+
      "<details class=\"room-resource-details\"><summary>Optional extra help</summary><section class=\"room-panel\"><p class=\"room-muted\">Use these if you want another explanation or more practice. You can finish the room without opening them.</p>"+(visualPractice?"<div class=\"room-visual-extra\">"+visualPractice+"</div>":"")+"<div class=\"room-links\">"+links.map(link=>"<a href=\""+escapeHTML(link[1])+"\" target=\"_blank\" rel=\"noopener noreferrer\">"+escapeHTML(link[0])+"</a>").join("")+"</div></section></details></div></div>"+
      "<nav class=\"room-path-navigation\" aria-label=\"Previous and next room\">"+(previous?"<a class=\"room-secondary\" href=\"#room="+encodeURIComponent(previous.id)+"\">← Previous room</a>":"<span></span>")+(next?"<a class=\"room-primary\" href=\"#room="+encodeURIComponent(next.id)+"\">Next room →</a>":"<a class=\"room-secondary\" href=\"/rooms.html?path="+room.path+"\">Back to path</a>")+"</nav>";
    if(!previewLocked)window.AITutor?.attach(dom["room-view"].querySelector("[data-room-ai-guide]"),{
      question:"Explain the main idea of "+room.title+" in this context: "+room.blurb+" Learning goals: "+room.objectives.join(" "),
      topic:room.title,
      level:room.tier||room.difficulty,
      compact:true,
      isBlocked:()=>Boolean(roomRecord(state,room.id).activeExam)
    });
    if(!previewLocked&&!record.activeExam){
      dom["room-view"].querySelectorAll(".room-question[data-task-index]").forEach(card=>{
        const task=room.tasks[Number(card.dataset.taskIndex)];
        const question=task&&task.questions[Number(card.dataset.questionIndex)];
        if(!question)return;
        window.AITutor?.attach(card,{
          question:question.q,
          studentAnswer:card.querySelector(".room-answer")?.value||roomRecord(state,room.id).taskResponses?.[`${card.dataset.taskIndex}-${card.dataset.questionIndex}`]||"",
          topic:room.title,
          level:room.tier||room.difficulty,
          responseElement:card.querySelector(".room-answer"),
          compact:true,
          roomLocked:false,
          isBlocked:()=>!roomAccess(rooms,state,room.id).allowed||Boolean(roomRecord(state,room.id).activeExam)
        });
      });
    }
    if(!previewLocked&&!record.activeExam&&record.lastResult){
      dom["room-view"].querySelectorAll(".room-review-item").forEach((card,index)=>{
        const question=record.lastResult.review[index];
        if(!question)return;
        window.AITutor?.attach(card,{
          question:question.q,
          studentAnswer:question.userAnswer,
          topic:room.title,
          level:room.tier||room.difficulty,
          compact:true,
          wolframLink:card.querySelector(".wolfram-question-link")?.href,
          isBlocked:()=>!roomAccess(rooms,state,room.id).allowed||Boolean(roomRecord(state,room.id).activeExam)
        });
      });
    }
    if(record.activeExam)startTimer(room,record);
    dom["room-view"].scrollIntoView({behavior:"smooth",block:"start"});
  }

  function renderTask(room,record,task,index,previewLocked){
    const open=!previewLocked&&canOpenTask(room,record,index);
    const done=taskDone(room,record,index);
    const questionHTML=(task.questions||[]).map(function(question,qIndex){
      const key=String(index)+"-"+String(qIndex);
      const isCorrect=record.taskAnswers&&record.taskAnswers[key]===true;
      const response=record.taskResponses&&record.taskResponses[key]||"";
      const attempted=taskQuestionAttempted(record,index,qIndex);
      if(attempted)return "<details class=\"room-question room-question-reviewed mm-question\" data-task-index=\""+index+"\" data-question-index=\""+qIndex+"\"><summary>"+(isCorrect?"✅":"↺")+" Question "+(qIndex+1)+" · "+(isCorrect?"Correct":"Answered; review")+"</summary><p><b>"+escapeHTML(question.q)+"</b></p><p class=\"room-feedback "+(isCorrect?"is-correct":"is-wrong")+"\" role=\"status\">"+(isCorrect?"✓ Correct answer · "+(record.answerRewards&&record.answerRewards["task:"+key]?"Points saved.":"No points for a revealed answer."):"Not yet. Try again; review the worked steps.")+"</p><ol class=\"room-explanation\">"+question.explain.map(step=>"<li>"+escapeHTML(step)+"</li>").join("")+"</ol></details>";
      if(!open||!canOpenQuestion(room,record,index,qIndex))return "<div class=\"room-question room-question-preview\" aria-disabled=\"true\"><p><b>🔒 Question "+(qIndex+1)+"</b></p><p class=\"room-muted\">"+(previewLocked?"Pass the previous room to unlock this question.":open?"Answer the previous question to unlock this step.":"Finish the previous task to answer this question.")+"</p></div>";
      return "<article class=\"room-question mm-question\" data-task-index=\""+index+"\" data-question-index=\""+qIndex+"\"><header class=\"mm-question-header\"><b class=\"mm-question-number\">Q"+(qIndex+1)+"</b><p class=\"mm-question-prompt\">"+escapeHTML(question.q)+"</p></header><label for=\"task-answer-"+index+"-"+qIndex+"\">Your answer</label>"+
        wolframQuestionLink(question.q)+
        "<input class=\"room-answer\" id=\"task-answer-"+index+"-"+qIndex+"\" data-task-answer=\""+key+"\" type=\"text\" autocomplete=\"off\" value=\""+escapeHTML(response)+"\" aria-label=\"Answer for "+escapeHTML(question.q)+"\">"+
        "<div class=\"mm-question-actions\"><button type=\"button\" class=\"mm-button mm-button-primary\" data-action=\"check-task\" data-task=\""+index+"\" data-question=\""+qIndex+"\" aria-label=\"Check your answer to "+escapeHTML(question.q)+"\">Check answer</button> "+
        "<button type=\"button\" class=\"mm-button mm-button-secondary\" data-action=\"toggle-hint\" data-key=\"hint-"+index+"-"+qIndex+"\" aria-label=\"Show or hide the hint for "+escapeHTML(question.q)+"\">Hint</button><button type=\"button\" class=\"mm-button mm-button-ghost\" data-action=\"show-task-answer\" data-key=\"task-answer-reveal-"+index+"-"+qIndex+"\">Show answer</button></div>"+
        "<p class=\"room-hint\" id=\"hint-"+index+"-"+qIndex+"\" hidden>"+escapeHTML(question.hint)+"</p>"+
        "<div class=\"room-hint mm-question-final\" id=\"task-answer-reveal-"+index+"-"+qIndex+"\" hidden><strong>Final answer:</strong> "+escapeHTML(question.answer)+"<p class=\"mm-revealed-note\">No points for a revealed answer.</p><ol>"+question.explain.map(step=>"<li>"+escapeHTML(step)+"</li>").join("")+"</ol></div></article>";
    }).join("");
    return "<section class=\"room-task"+(open?"":" room-task-preview")+"\" id=\"room-task-"+index+"\" data-task-index=\""+index+"\""+(open?"":" aria-disabled=\"true\"")+"><h3>"+(open?"":"🔒 Preview · ")+"Task "+(index+1)+": "+escapeHTML(task.title)+(done?" ✓":"")+"</h3>"+
      "<p class=\"room-muted\">"+escapeHTML(task.story)+"</p><p class=\"room-task-learn\">"+escapeHTML(task.learn)+"</p>"+
      "<div class=\"room-example\"><b>Worked example:</b> "+escapeHTML(task.example)+"</div>"+questionHTML+
      (done?"<p class=\"room-feedback is-correct\">Task complete. The next task is open.</p>":"")+"</section>";
  }

  function renderExamReady(room){
    return "<section class=\"room-exam\"><h2>Hard Exam</h2><p>This exam has "+EXAM_SIZE+" questions: 8 medium, 10 hard and 7 very hard. Pass mark: "+Math.round(PASS_MARK*100)+"%. You can move between questions before finishing. The timer does not stop you.</p>"+
      "<button type=\"button\" class=\"exam-submit\" data-action=\"start-exam\" aria-label=\"Start the hard exam for "+escapeHTML(room.title)+"\">Start Hard Exam</button></section>";
  }

  function renderExam(room,record){
    const exam=record.activeExam;
    const index=Math.max(0,Math.min(exam.current||0,exam.questions.length-1));
    const question=exam.questions[index];
    const submitted=exam.submitted[index]===true;
    const response=exam.answers[index]||"";
    const done=exam.submitted.filter(Boolean).length;
    const elapsed=Date.now()-exam.startedAt;
    return "<section class=\"room-exam\" aria-label=\"Hard exam\"><h2>Hard Exam</h2><div class=\"exam-meter\"><span>Question "+(index+1)+" of "+EXAM_SIZE+"</span><span>"+done+" submitted</span><span class=\"exam-timer\" data-timer>Time: "+formatTime(elapsed)+"</span></div>"+
      "<div class=\"exam-track\" role=\"progressbar\" aria-label=\"Questions submitted\" aria-valuemin=\"0\" aria-valuemax=\""+EXAM_SIZE+"\" aria-valuenow=\""+done+"\"><span style=\"width:"+(done/EXAM_SIZE*100)+"%\"></span></div>"+
      "<div class=\"exam-question\"><h3>"+escapeHTML(question.q)+"</h3><label for=\"exam-answer\">Type your final answer</label><input id=\"exam-answer\" class=\"room-answer\" data-exam-answer=\""+index+"\" type=\"text\" autocomplete=\"off\" value=\""+escapeHTML(response)+"\" "+(submitted?"disabled":"")+" aria-label=\"Answer to exam question "+(index+1)+"\">"+
      (submitted?"<p class=\"room-feedback "+(exam.correct[index]?"is-correct":"is-wrong")+"\" role=\"status\">"+(exam.correct[index]?"✅ Correct! "+(exam.pointsEarned&&exam.pointsEarned[index]?"+10 points earned.":"Points already earned for this question.")+" Next question unlocked.":"❌ Not correct yet. No points earned. The next question is unlocked; review the answer.")+"</p>":"<button type=\"button\" class=\"room-secondary\" data-action=\"submit-exam-answer\" aria-label=\"Submit answer to question "+(index+1)+" once\">Submit this answer</button>")+"</div>"+
      "<div class=\"exam-nav\"><button type=\"button\" class=\"room-secondary\" data-action=\"exam-prev\" aria-label=\"Go to previous exam question\" "+(index===0?"disabled":"")+">Previous</button><button type=\"button\" class=\"room-secondary\" data-action=\"exam-next\" aria-label=\"Go to next exam question\" "+(index===EXAM_SIZE-1||!submitted?"disabled":"")+">Next</button></div>"+
      "<button type=\"button\" class=\"exam-submit\" data-action=\"finish-exam\" aria-label=\"Finish and submit the hard exam\" "+(done<EXAM_SIZE?"disabled":"")+">Finish exam</button></section>";
  }

  function renderResult(room,record,result,next){
    const passed=result.passed;
    const earned=passed?earnedBadges(state,rooms):[];
    const reward=passed
      ?"<section class=\"room-completion-reward\" role=\"status\" tabindex=\"-1\"><span>ROOM COMPLETE</span><h2>🏆 "+escapeHTML(room.title)+" completed!</h2><p>You passed the Hard Exam with "+result.score+"/"+EXAM_SIZE+" ("+result.percentage+"%).</p><p class=\"room-completion-reward-points\">+"+(record.pointsAwarded?room.points:0)+" points earned</p><div class=\"room-completion-reward-badges\" aria-label=\"Your badges\">"+earned.map(function(badge){return "<span class=\"room-pill\">🏅 "+escapeHTML(badge)+"</span>";}).join("")+"</div></section>"
      :"";
    const review=result.review.map(function(item,index){
      return "<article class=\"room-review-item\"><h3>Question "+escapeHTML(item.number)+": "+escapeHTML(item.q)+"</h3>"+
        wolframQuestionLink(item.q)+
        "<p><b>Your answer:</b> "+(item.userAnswer?escapeHTML(item.userAnswer):"Blank")+"</p><p><b>Correct answer:</b> "+escapeHTML(item.answer)+"</p>"+
        "<ol>"+item.explain.map(step=>"<li>"+escapeHTML(step)+"</li>").join("")+"</ol></article>";
    }).join("");
    const transition=passed&&next?"<p class=\"room-notice\" role=\"status\">Next room unlocked: "+escapeHTML(next.title)+"</p><a class=\"room-primary\" href=\"#room="+encodeURIComponent(next.id)+"\" data-room-link=\""+escapeHTML(next.id)+"\">Go to next room</a>":
      passed?"<p class=\"room-notice\">You passed the final room on this path.</p>":"<p class=\"room-muted\">Weak spots: review the missed questions below, then try a new set.</p><button type=\"button\" class=\"exam-submit\" data-action=\"retake-exam\" aria-label=\"Retake the hard exam with a new question set\">Retake exam</button>";
    return "<section class=\"room-result\">"+reward+"<h2>Exam result</h2><p class=\"room-result-score\">"+result.score+"/"+EXAM_SIZE+" · "+result.percentage+"% · "+(passed?"PASS":"NOT YET")+"</p>"+
      "<p>Time taken: "+escapeHTML(result.time)+" · Attempts: "+record.attempts+" · Best score: "+record.bestScore+"/"+EXAM_SIZE+"</p>"+
      transition+"<h3>Review missed questions ("+review.length+")</h3>"+(review?"<div class=\"room-review\">"+review+"</div>":"<p class=\"room-feedback is-correct\">No wrong answers. Perfect work.</p>")+"</section>";
  }

  function showFeedback(element,text,correct){
    element.textContent=text;
    element.classList.toggle("is-correct",correct);
    element.classList.toggle("is-wrong",!correct);
  }

  function handleRoomInput(event){
    const input=event.target.closest("[data-task-answer]");
    if(input){
      const room=getCurrentRoom();
      if(!room)return;
      const record=roomRecord(state,room.id);
      record.taskResponses=record.taskResponses||{};
      record.taskResponses[input.dataset.taskAnswer]=input.value;
      saveState(localStorage,state);
      return;
    }
    const examInput=event.target.closest("[data-exam-answer]");
    if(examInput){
      const room=getCurrentRoom();
      if(!room)return;
      const exam=roomRecord(state,room.id).activeExam;
      const index=Number(examInput.dataset.examAnswer);
      if(exam&&!exam.submitted[index]){
        exam.answers[index]=examInput.value;
        saveState(localStorage,state);
      }
    }
  }

  function getCurrentRoom(){
    const match=window.location.hash.match(/(?:^#|&)room=([^&]+)/);
    if(!match)return null;
    let id="";
    try{id=decodeURIComponent(match[1]);}catch(error){id=match[1];}
    return rooms.find(room=>room.id===id)||null;
  }

  function handleRoomClick(event){
    const actionButton=event.target.closest("[data-action]");
    if(!actionButton)return;
    const action=actionButton.dataset.action;
    const room=getCurrentRoom();
    if(action==="toggle-hint"){
      const hint=document.getElementById(actionButton.dataset.key);
      if(hint)hint.hidden=!hint.hidden;
      return;
    }
    if(action==="show-task-answer"){
      const answer=document.getElementById(actionButton.dataset.key);
      if(answer){answer.hidden=!answer.hidden;actionButton.textContent=answer.hidden?"Show answer":"Hide answer";if(!answer.hidden)answer.closest(".room-question").dataset.answerRevealed="true";}
      return;
    }
    if(!room)return;
    const record=roomRecord(state,room.id);
    if(action==="check-task"){
      checkTaskAnswer(room,record,Number(actionButton.dataset.task),Number(actionButton.dataset.question));
    }else if(action==="reset-room"){
      resetRoom(room);
    }else if(action==="start-exam"||action==="retake-exam"){
      startExam(room,record);
    }else if(action==="submit-exam-answer"){
      submitExamAnswer(room,record);
    }else if(action==="exam-prev"||action==="exam-next"){
      moveExam(room,record,action==="exam-prev"?-1:1);
    }else if(action==="finish-exam"){
      finishExam(room,record);
    }
  }

  function checkTaskAnswer(room,record,taskIndex,questionIndex){
    if(!canOpenQuestion(room,record,taskIndex,questionIndex))return;
    const question=room.tasks[taskIndex].questions[questionIndex];
    const key=String(taskIndex)+"-"+String(questionIndex);
    const input=dom["room-view"].querySelector("[data-task-answer=\""+key+"\"]");
    if(!input.value.trim()){
      input.focus();
      return;
    }
    const correct=checkAnswer(question,input.value);
    record.taskAttempts[key]=true;
    record.taskResponses[key]=input.value;
    let pointsEarned=0;
    if(correct){
      record.taskAnswers[key]=true;
      updateStreak(state,new Date());
      pointsEarned=input.closest(".room-question")?.dataset.answerRevealed==="true"?0:awardCorrectAnswer(state,record,"task:"+key);
    }
    if(room.tasks[taskIndex].questions.every((item,index)=>taskQuestionAttempted(record,taskIndex,index))){
      record.tasks[taskIndex]=true;
    }
    record.lastTaskAttempt={correct:correct,points:pointsEarned,taskIndex:taskIndex,questionIndex:questionIndex};
    saveState(localStorage,state);
    if(correct)window.MathMasterFeedback?.correct();
    renderSummary();
    renderRoom(room);
    window.MathMasterFeedback?.answered(correct,pointsEarned);
  }

  function startExam(room,record){
    if(!tasksComplete(room,record))return;
    const attemptSeed=(Date.now()>>>0)^((record.attempts+1)*2654435761);
    const questions=selectExam(room,record.seen,attemptSeed);
    record.activeExam={
      questions:questions,
      answers:Array(EXAM_SIZE).fill(""),
      submitted:Array(EXAM_SIZE).fill(false),
      correct:Array(EXAM_SIZE).fill(false),
      current:0,
      startedAt:Date.now(),
      seed:attemptSeed
    };
    record.lastResult=null;
    saveState(localStorage,state);
    renderRoom(room);
  }

  function submitExamAnswer(room,record){
    const exam=record.activeExam;
    if(!exam)return;
    const index=exam.current;
    if(exam.submitted[index])return;
    const response=exam.answers[index]||"";
    if(!response.trim())return;
    exam.correct[index]=checkAnswer(exam.questions[index],response);
    exam.submitted[index]=true;
    exam.pointsEarned=exam.pointsEarned||[];
    if(exam.correct[index]){
      exam.pointsEarned[index]=awardCorrectAnswer(state,record,"exam:"+exam.questions[index].id);
      updateStreak(state,new Date());
      window.MathMasterFeedback?.correct();
    }else{
      exam.pointsEarned[index]=0;
    }
    renderSummary();
    saveState(localStorage,state);
    renderRoom(room);
    window.MathMasterFeedback?.answered(exam.correct[index],exam.pointsEarned[index]);
  }

  function moveExam(room,record,direction){
    const exam=record.activeExam;
    if(!exam)return;
    if(direction>0&&!exam.submitted[exam.current])return;
    exam.current=Math.max(0,Math.min(EXAM_SIZE-1,exam.current+direction));
    saveState(localStorage,state);
    renderRoom(room);
  }

  function finishExam(room,record){
    const exam=record.activeExam;
    if(!exam||exam.submitted.some(answer=>!answer))return;
    const blank=exam.answers.filter(answer=>!String(answer||"").trim()).length;
    if(blank&&!window.confirm("There are "+blank+" empty answer(s). Empty answers will be marked wrong. Finish the exam now?"))return;
    const score=exam.correct.filter(Boolean).length;
    const percentage=Math.round(score/EXAM_SIZE*100);
    const passed=score/EXAM_SIZE>=PASS_MARK;
    const timeMilliseconds=Date.now()-exam.startedAt;
    const review=exam.questions.map(function(question,index){
      return exam.correct[index]?null:{
        number:index+1,
        q:question.q,
        userAnswer:exam.answers[index]||"",
        answer:question.answer,
        explain:question.explain
      };
    }).filter(Boolean);
    record.attempts+=1;
    record.bestScore=Math.max(record.bestScore,score);
    record.seen=Array.from(new Set((record.seen||[]).concat(exam.questions.map(question=>question.id))));
    const wasComplete=record.complete;
    record.complete=wasComplete||passed;
    record.lastResult={score:score,percentage:percentage,passed:passed,time:formatTime(timeMilliseconds),review:review};
    record.activeExam=null;
    if(passed&&!record.pointsAwarded){
      record.pointsAwarded=true;
      state.points+=room.points;
      root.dispatchEvent(new root.CustomEvent("mm2:points",{detail:{pointsEarned:room.points,source:"room-complete"}}));
    }
    if(passed)updateStreak(state,new Date());
    earnedBadges(state,rooms);
    saveState(localStorage,state);
    refresh();
    if(passed&&!wasComplete){
      const nextRoom=rooms.find(item=>item.path===room.path&&item.order===room.order+1);
      root.dispatchEvent(new root.CustomEvent("mm2:complete",{detail:{id:`room:${room.id}:${record.attempts}`,points:state.points,badge:state.badges.at(-1)||"Room complete",nextUrl:nextRoom?`/rooms.html#room=${encodeURIComponent(nextRoom.id)}`:"/index.html#topics",message:"You passed the room exam."}}));
    }
    if(passed&&!wasComplete){
      const nextRoom=rooms.find(item=>item.path===room.path&&item.order===room.order+1);
      root.dispatchEvent(new root.CustomEvent("mm2:complete",{detail:{id:`room:${room.id}:${record.attempts}`,points:state.points,badge:state.badges.at(-1)||"Room complete",nextUrl:nextRoom?`/rooms.html#room=${encodeURIComponent(nextRoom.id)}`:"/index.html#topics",message:"You passed the room exam."}}));
    }
    window.location.hash="room="+encodeURIComponent(room.id);
  }

  function startTimer(room,record){
    const render=function(){
      const display=dom["room-view"].querySelector("[data-timer]");
      if(display&&record.activeExam)display.textContent="Time: "+formatTime(Date.now()-record.activeExam.startedAt);
    };
    render();
    timerId=window.setInterval(render,1000);
  }

  function resetRoom(room){
    if(!window.confirm("Reset "+room.title+" and any later rooms that depend on it? This cannot be undone."))return;
    rooms.filter(item=>item.path===room.path&&item.order>=room.order).forEach(function(item){delete state.rooms[item.id];});
    roomRecord(state,room.id);
    state.points=calculatePoints(state,rooms);
    state.badges=[];
    saveState(localStorage,state);
    refresh();
  }

  function resetEverything(){
    if(!window.confirm("Reset all room tasks, exams, points, badges, and streaks? This cannot be undone."))return;
    state={rooms:{},practiceMode:false,points:0,badges:[],days:[]};
    saveState(localStorage,state);
    const gcseState=readStored("mathmaster-gcse");gcseState.practiceMode=false;localStorage.setItem("mathmaster-gcse",JSON.stringify(gcseState));
    refresh();
  }

  function exportProgress(){
    const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;
    link.download="mathmaster-rooms-progress.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function importProgress(event){
    const file=event.target.files&&event.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=function(){
      try{
        const imported=JSON.parse(String(reader.result||""));
        if(!imported||typeof imported!=="object"||Array.isArray(imported)||!imported.rooms||typeof imported.rooms!=="object"||typeof imported.practiceMode!=="boolean"){
          throw new Error("This file is not room progress JSON.");
        }
        if(!window.confirm("Replace the current room progress with this file?"))return;
        const next={rooms:{},practiceMode:imported.practiceMode,points:0,badges:Array.isArray(imported.badges)?imported.badges:[],days:Array.isArray(imported.days)?imported.days:[]};
        rooms.forEach(room=>{
          const item=imported.rooms[room.id];
          if(item&&typeof item==="object"){
            next.rooms[room.id]={
              tasks:Array.isArray(item.tasks)?item.tasks.slice(0,room.tasks.length).map(Boolean):[],
              complete:item.complete===true,
              attempts:Number.isFinite(item.attempts)?Math.max(0,item.attempts):0,
              bestScore:Number.isFinite(item.bestScore)?Math.max(0,Math.min(EXAM_SIZE,item.bestScore)):0,
              seen:Array.isArray(item.seen)?item.seen.filter(id=>room.examPool.some(question=>question.id===id)):[],
              activeExam:validActiveExam(room,item.activeExam)?item.activeExam:null,
              lastResult:item.lastResult&&typeof item.lastResult==="object"?item.lastResult:null,
              taskAnswers:item.taskAnswers&&typeof item.taskAnswers==="object"?item.taskAnswers:{},
              taskAttempts:item.taskAttempts&&typeof item.taskAttempts==="object"?item.taskAttempts:{},
              taskResponses:item.taskResponses&&typeof item.taskResponses==="object"?item.taskResponses:{},
              answerRewards:item.answerRewards&&typeof item.answerRewards==="object"?item.answerRewards:{},
              pointsAwarded:item.pointsAwarded===true
            };
          }
        });
        next.points=calculatePoints(next,rooms);
        state=next;
        earnedBadges(state,rooms);
        saveState(localStorage,state);
        const gcseState=readStored("mathmaster-gcse");gcseState.practiceMode=state.practiceMode;localStorage.setItem("mathmaster-gcse",JSON.stringify(gcseState));
        refresh();
      }catch(error){
        window.alert("Could not import progress: "+error.message);
      }finally{
        event.target.value="";
      }
    };
    reader.onerror=function(){window.alert("Could not read the selected progress file.");};
    reader.readAsText(file);
  }

  function validActiveExam(room,exam){
    return Boolean(exam&&Array.isArray(exam.questions)&&exam.questions.length===EXAM_SIZE&&
      exam.questions.every(question=>room.examPool.some(item=>item.id===question.id))&&
      Array.isArray(exam.answers)&&exam.answers.length===EXAM_SIZE&&
      Array.isArray(exam.submitted)&&exam.submitted.length===EXAM_SIZE&&
      Array.isArray(exam.correct)&&exam.correct.length===EXAM_SIZE);
  }
})(typeof window!=="undefined"?window:globalThis);
