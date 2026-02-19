const banks = [
  {id:"chase",name:"Chase",ach:"17:00",wire:"16:00"},
  {id:"bofa",name:"Bank of America",ach:"17:00",wire:"17:00"},
  {id:"wells",name:"Wells Fargo",ach:"17:00",wire:"16:00"}
];

const bankSelect = document.getElementById("bank");
banks.forEach(b=>{
  const o=document.createElement("option");
  o.value=b.id;o.textContent=b.name;
  bankSelect.appendChild(o);
});

function isWeekend(d){
  const day=d.getUTCDay();
  return day===0||day===6;
}

function check(){
  const bank = banks.find(b=>b.id===bankSelect.value);
  const rail=document.getElementById("rail").value;
  const date=document.getElementById("date").value;
  const time=document.getElementById("time").value;

  if(!date||!time){return}

  const cutoff=bank[rail];
  const result=document.getElementById("result");

  if(time>cutoff){
    result.textContent="After cutoff — processes next business day.";
  }else{
    result.textContent="Before cutoff — processes today.";
  }
}
