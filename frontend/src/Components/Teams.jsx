import { createContext, useState } from "react";
import TeamPanel from "./TeamPanel";
export const JoinContext = createContext();

const Teams = ({onDataReceived}) => {

  const [joinedTeam, setJoinedTeam] = useState("");
  const [joinedTitle, setJoinedTitle] = useState("");

  const handleJoin=(teamJoin, titleJoin) =>{
    // console.log(`Joined as ${titleJoin} in team ${teamJoin}`);
    setJoinedTeam(teamJoin);
    setJoinedTitle(titleJoin);
    onDataReceived(teamJoin,titleJoin);
  }

  const redTeam = {
    score: 8,
    concealers: ['Viper', 'Blaze'],
    revealers: ['Shadow', 'Scorch']
  };

  const blueTeam = {
    score: 7,
    concealers: ['Tide', 'Aqua'],
    revealers: ['Frost', 'Mist']
  };

  return (
    <JoinContext.Provider value={{teamInfo: [joinedTeam, setJoinedTeam], titleInfo: [joinedTitle,setJoinedTitle], handleJoin: handleJoin}}>
      <div className="absolute top-[50%] left-8 translate-y-[-50%]">
        <TeamPanel team="red" score={redTeam.score} concealers={redTeam.concealers} revealers={redTeam.revealers}/>
      </div>
      <div className="absolute top-[50%] right-8 translate-y-[-50%]">
        <TeamPanel team="blue" score={blueTeam.score} concealers={blueTeam.concealers} revealers={blueTeam.revealers}/>
      </div>
    </JoinContext.Provider>
  );
};

export default Teams;