import { Button, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Input } from "react-grid-system";
import { getAllGames, getUserFromUid } from "../actions/dbHelper";
import AppScreenLoading from "../components/AppScreenLoading";
import SingleGameCard from "../components/SingleGameCard";
import AddGameModal from "../components/AddGameModal";
import { useAuth } from "../context/auth-context";

const jsx = `
<iframe
        title="takken-3"
        src="https://www.retrogames.cc/embed/40238-tekken-3.html"
        width={600}
        height={450}
        frameBorder="no"
        allowFullScreen="true"
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        scrolling="no"
      />

`;

const gameImg = `https://i.987967.xyz/screenshot/72/2018/09/04/40238_0ae25ae7f0f2fdd2ff1546d5c92cc5dabe06095c.png`;

const dummyGameDataArray = [
  {
    gameId: "somegameId",
    gameImg,
    gameCode: jsx,
    gameTitle: "Takken 3",
  },
  {
    gameId: "somegameId",
    gameImg,
    gameCode: jsx,
    gameTitle: "Takken 3",
  },
  {
    gameId: "somegameId",
    gameImg,
    gameCode: jsx,
    gameTitle: "Takken 3",
  },
  {
    gameId: "somegameId",
    gameImg,
    gameCode: jsx,
    gameTitle: "Takken 3",
  },
  {
    gameId: "somegameId",
    gameImg,
    gameCode: jsx,
    gameTitle: "Takken 3",
  },
  {
    gameId: "somegameId",
    gameImg,
    gameCode: jsx,
    gameTitle: "Takken 3",
  },
  {
    gameId: "somegameId",
    gameImg,
    gameCode: jsx,
    gameTitle: "Takken 3",
  },
  {
    gameId: "somegameId",
    gameImg,
    gameCode: jsx,
    gameTitle: "Takken 3",
  },
  {
    gameId: "somegameId",
    gameImg,
    gameCode: jsx,
    gameTitle: "Takken 3",
  },
  {
    gameId: "somegameId",
    gameImg,
    gameCode: jsx,
    gameTitle: "Takken 3",
  },
  {
    gameId: "somegameId",
    gameImg,
    gameCode: jsx,
    gameTitle: "Takken 3",
  },
  {
    gameId: "somegameId",
    gameImg,
    gameCode: jsx,
    gameTitle: "Takken 3",
  },
  {
    gameId: "somegameId",
    gameImg,
    gameCode: jsx,
    gameTitle: "Takken 3",
  },
];

function AllGames() {
  const { curAuth } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [games, setGames] = useState([]);
  const [gameDataLoading, setGameDataLoading] = useState(true);

  useEffect(() => {
    getAllGames().then((res) => {
      setGames(res);
      setGameDataLoading(false);
    });

    getUserFromUid(curAuth.uid)
      .then((res) => {
        setIsAdmin(!!res?.admin);
      })
      .then(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      {loading ? (
        <AppScreenLoading LoadingDescription={"Getting Games"} />
      ) : (
        <>
          {!loading && (
            <>
              {isAdmin && (
                <div className="allGamesAdminSection">
                  <p className="allGamesAdminSection__message">
                    {" "}
                    Hey Anonymous Welcome Add new Games here 👉{" "}
                  </p>
                  <Button
                    onClick={() => {
                      setIsModalVisible(true);
                    }}
                  >
                    {" "}
                    Add New Game{" "}
                  </Button>
                </div>
              )}
              {!gameDataLoading && (
                <Container>
                  <Row>
                    {" "}
                    <h3> Play Games With Just Single Click! </h3>{" "}
                  </Row>
                  <Row
                    debug
                    style={{ paddingTop: "15px", justifyContent: "center" }}
                  >
                    {games.map((item) => (
                      <Col
                        key={item.gameId}
                        className="gutter-row"
                        sm={12}
                        lg={4}
                        md={6}
                      >
                        <SingleGameCard {...item} />
                      </Col>
                    ))}
                  </Row>
                </Container>
              )}

              {/* / Modal Will come here/ */}
              <AddGameModal
                isModalVisible={isModalVisible}
                setIsModalVisible={setIsModalVisible}
              />
            </>
          )}
        </>
      )}
    </>
  );
}

// return <div dangerouslySetInnerHTML={{ __html: jsx }}></div>;
export default AllGames;
