import { useState } from "react";

export default function Robots(){
  const [robots,setRobots]=useState([]);
  const [name,setName]=useState("Yeni Robot");
  const add=()=>{
    setRobots([...robots,{id:Date.now(),name}]);
    setName("Yeni Robot");
  }
  return (
    <div style={{maxWidth:1000,margin:"40px auto",padding:20}}>
      <h1>🤖 Robotlar</h1>
      <div style={{marginBottom:20}}>
        <input value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={add}>Robot Ekle</button>
      </div>
      <ul>
        {robots.map(r=>(<li key={r.id}>{r.name} <button>Durdur</button></li>))}
      </ul>
    </div>
  );
}
