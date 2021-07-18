import React, { useRef, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Player from "./Player";

function getCanvasSize() {
  const { innerWidth: width, innerHeight: height } = window;
  const minDimension = Math.min(width, height, 600);
  return minDimension;
}

export default function Board() {
  const IDLE = 0; // in idle status, can not place chesses
  const WAITING = 1;
  const LINECOLOR = "black";
  const [chessBoard, setChessBoard] = useState({
    localColor: "grey",
    remoteColor: "grey",
    localActive: false,
    remoteActive: false,
    buttonText: "Click to start",
    status: IDLE,
    chessArr: new Array(24).fill(0),
    size: getCanvasSize()
  });
  const movingDir = [];
  const canvas = useRef();
  const padPercent = 0.08;
  const chessSize = Math.floor(chessBoard.size / 16);
  const startPos = Math.floor(chessBoard.size * padPercent);
  const roundGap = Math.floor((chessBoard.size * (1 - padPercent * 2)) / 6);
  const nodeArr = [
    [startPos, startPos], // 1st loop
    [startPos + roundGap * 3, startPos],
    [startPos + roundGap * 6, startPos],
    [startPos + roundGap * 6, startPos + roundGap * 3],
    [startPos + roundGap * 6, startPos + roundGap * 6],
    [startPos + roundGap * 3, startPos + roundGap * 6],
    [startPos, startPos + roundGap * 6],
    [startPos, startPos + roundGap * 3],
    [startPos + roundGap, startPos + roundGap], // 2nd loop
    [startPos + roundGap * 3, startPos + roundGap],
    [startPos + roundGap * 5, startPos + roundGap],
    [startPos + roundGap * 5, startPos + roundGap * 3],
    [startPos + roundGap * 5, startPos + roundGap * 5],
    [startPos + roundGap * 3, startPos + roundGap * 5],
    [startPos + roundGap, startPos + roundGap * 5],
    [startPos + roundGap, startPos + roundGap * 3],
    [startPos + roundGap * 2, startPos + roundGap * 2], // 3rd loop
    [startPos + roundGap * 3, startPos + roundGap * 2],
    [startPos + roundGap * 4, startPos + roundGap * 2],
    [startPos + roundGap * 4, startPos + roundGap * 3],
    [startPos + roundGap * 4, startPos + roundGap * 4],
    [startPos + roundGap * 3, startPos + roundGap * 4],
    [startPos + roundGap * 2, startPos + roundGap * 4],
    [startPos + roundGap * 2, startPos + roundGap * 3]
  ];

  // initialize the canvas context
  useEffect(() => {
    // dynamically assign the width and height to canvas
    const canvasEle = canvas.current;
    canvasEle.width = chessBoard.size;
    canvasEle.height = chessBoard.size;
    // get context of the canvas
    let ctx = canvasEle.getContext("2d");

    // draw lines
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 8; j++) {
        const fromIdx = i * 8 + j;
        const sameLoopIdx = i * 8 + ((j + 1) % 8);
        const diffLoopIdx = ((i + 1) % 3) * 8 + j;
        const fromNode = nodeArr[fromIdx];
        const sameLoopNode = nodeArr[sameLoopIdx];
        const diffLoopNode = nodeArr[diffLoopIdx];
        // draw 3 loops
        drawLine(
          {
            x: fromNode[0],
            y: fromNode[1],
            x1: sameLoopNode[0],
            y1: sameLoopNode[1]
          },
          ctx,
          {
            color: LINECOLOR,
            width: 5
          }
        );

        // draw lines between loop
        drawLine(
          {
            x: fromNode[0],
            y: fromNode[1],
            x1: diffLoopNode[0],
            y1: diffLoopNode[1]
          },
          ctx,
          {
            color: LINECOLOR,
            width: 5
          }
        );
      }
    }

    // draw moving lines
    for (let i = 0; i < movingDir.length; i++) {
      const fromNode = nodeArr[movingDir[i][0]];
      const toNode = nodeArr[movingDir[i][1]];
      drawLine(
        {
          x: fromNode[0],
          y: fromNode[1],
          x1: toNode[0],
          y1: toNode[1]
        },
        ctx,
        {
          color: "yellow",
          width: 5
        }
      );
    }

    // draw chess
    const colors = { "-3": "grey", "-1": "blue", "1": "red", "3": "grey" };
    for (let i = 0; i < chessBoard.chessArr.length; i++) {
      const colorIdx = chessBoard.chessArr[i];
      if (colorIdx !== 0) {
        const style = { color: colors[colorIdx.toString()], size: chessSize };
        drawChess(nodeArr[i], ctx, style);
      }
    }

    //Re-draw canvas when window size change
    function handleResize() {
      setChessBoard({
        ...chessBoard,
        size: getCanvasSize()
      });
    }
    window.addEventListener("resize", handleResize);
  }); // end of useEffect

  function changeChess(event) {
    if (chessBoard.status === WAITING) {
      const minX = event.target.offsetLeft;
      const minY = event.target.offsetTop;
      const postX = event.pageX;
      const postY = event.pageY;
      const nodeIdx = getNodeIdx(
        postX - minX,
        postY - minY,
        nodeArr,
        chessSize
      );
      if (nodeIdx < nodeArr.length) {
        //node found
        const chess = Math.floor(Math.random() * 4) * 2 - 3;
        chessBoard.chessArr[nodeIdx] = chess;
        setChessBoard({
          ...chessBoard,
          chessArr: [...chessBoard.chessArr]
        });
      }
    }
  } // end of changeChess

  function changeControl(event) {
    let localActive;
    let remoteActive;
    let localColor;
    let remoteColor;
    let buttonText;
    let status;
    switch (chessBoard.status) {
      case IDLE:
        [localActive, localColor, remoteActive, remoteColor] = [
          true,
          "red",
          false,
          "blue"
        ];
        buttonText = "Start to play";
        status = WAITING;
        // window.open("mailto:?subject=Let's play Triplex&body=body");
        setChessBoard({
          ...chessBoard,
          localActive,
          remoteActive,
          localColor,
          remoteColor,
          buttonText,
          status
        });
        break;
      default:
        localActive = !chessBoard.localActive;
        remoteActive = !chessBoard.remoteActive;
        buttonText = "playing";
        setChessBoard({
          ...chessBoard,
          localActive,
          remoteActive,
          buttonText
        });
    }
  } // end of changeControl

  // draw a chess
  const drawChess = (node, ctx, style) => {
    const [x, y] = node;
    const { color, size } = style;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.closePath();

    var gradient = ctx.createRadialGradient(x, y, size, x, y, 0);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "white");
    ctx.fillStyle = gradient;
    ctx.fill();
  };

  // draw a line
  const drawLine = (info, ctx, style) => {
    const { x, y, x1, y1 } = info;
    const { color = "black", width = 1 } = style;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  };

  // get node index(0~23 or none) base on mouse click position
  function getNodeIdx(x, y, nodeArr, chessSize) {
    let i = 0;
    for (; i < nodeArr.length; i++) {
      const centX = nodeArr[i][0];
      const centY = nodeArr[i][1];
      const radius = Math.sqrt(Math.pow(x - centX, 2) + Math.pow(y - centY, 2));
      if (radius <= chessSize) {
        return i;
      }
    }
    return i;
  }

  return (
    <div className="App">
      <Player
        name="Remote"
        isActive={chessBoard.remoteActive}
        color={chessBoard.remoteColor}
      />
      <canvas onClick={changeChess} ref={canvas} id="chess"></canvas>
      <Player
        name="Local"
        isActive={chessBoard.localActive}
        color={chessBoard.localColor}
      />
      <Button
        onClick={changeControl}
        className="controlButton"
        variant="primary"
        size="lg"
      >
        {chessBoard.buttonText}
      </Button>
    </div>
  );
}
