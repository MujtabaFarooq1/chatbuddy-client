import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getGameByGameId } from "../actions/dbHelper";

function SingleGamePage() {
  const { gameId } = useParams();
  const history = useHistory();
  const [gameData, setGameData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGameByGameId(gameId)
      .then((res) => {
        setGameData(res);
        setLoading(false);
      })
      .catch(() => {
        history.push("/");
      });
  }, []);
  return (
    <>
      {loading ? (
        <p> Loading </p>
      ) : (
        <div
          className="singleGamePlay"
          dangerouslySetInnerHTML={{ __html: gameData.gameCode }}
        ></div>
      )}
    </>
  );
}

export default SingleGamePage;
