// services/robot-exec/index.js
import http from "http";

const PORT = process.env.ROBOT_EXEC_PORT || 8095;

function send(res,code,data){
  res.writeHead(code,{ "Content-Type":"application/json","Access-Control-Allow-Origin":"*" });
  res.end(JSON.stringify(data));
}

const server=http.createServer((req,res)=>{
  if(req.method==="OPTIONS"){
    res.writeHead(204,{
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods":"POST,OPTIONS",
      "Access-Control-Allow-Headers":"Content-Type"
    }); return res.end();
  }

  if(req.url==="/run" && req.method==="POST"){
    let body=""; req.on("data",c=>body+=c);
    req.on("end",()=>{
      try{
        const data=JSON.parse(body||"{}");
        console.log("[robot-exec] event:",data);
        return send(res,200,{ ok:true });
      }catch{ return send(res,400,{ code:"BAD_REQUEST" }); }
    });
    return;
  }

  if(req.url==="/healthz"){ res.writeHead(200); return res.end("ok"); }

  send(res,404,{ code:"NOT_FOUND" });
});

server.listen(PORT,()=>console.log(`robot-exec on :${PORT}`));
