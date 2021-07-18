import React, { useEffect, useState } from "react";
import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Player(props) {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(2);
  const playerColor = { color: props.color };

  function updateTime() {
    if (props.isActive) {
      if (minutes === 0 && seconds === 0) {
        //reset
        setSeconds(0);
        setMinutes(2);
      } else {
        if (seconds === 0) {
          setMinutes((minutes) => minutes - 1);
          setSeconds(59);
        } else {
          setSeconds((seconds) => seconds - 1);
        }
      }
    } else {
      setSeconds(0);
      setMinutes(2);
    }
  }

  useEffect(() => {
    const token = setTimeout(updateTime, 1000);

    return function cleanUp() {
      clearTimeout(token);
    };
  });

  return (
    <div className="player" style={playerColor}>
      <span>{props.name} </span>
      <FontAwesomeIcon icon={faHistory} />
      {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}

export default Player;
