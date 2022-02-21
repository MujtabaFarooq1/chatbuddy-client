import { useEffect, useState } from "react";
import { Carousel, Image, Card } from "antd";
import {
  HeartOutlined,
  HeartFilled,
  LikeFilled,
  CommentOutlined,
  LoadingOutlined,
  DeleteFilled,
} from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { nanoid } from "nanoid";
import { useAuth } from "../context/auth-context";
import { getUserFromUid, handlePostLike } from "../actions/dbHelper";
import ReactTimeAgo from "react-time-ago";
import { getPostImageUrl, deletePost } from "../actions/dbHelper";

// createdBy: uid,
// createdAt: currentTimeStamp,
// postDescription: description,
// postTitle: title,
// postImages: imgNames,
// authorId: uid,

//postid will be computed
//isFav will be computed

const PostFeedItem = ({
  postData,
  isFav,
  wordsToShow,
  cardCustomStyles,
  itemWrapperCustomStyles,
  clickToRedirect,
  noCommentCount,
  hoverEffect,
}) => {
  //----------------------------------
  const {
    curAuth: { uid },
  } = useAuth();

  const history = useHistory();

  const [authorData, setAuthorData] = useState();
  const [authorDataLoading, setAuthorDataLoading] = useState(true);
  const [postImageUrls, setPostImageUrls] = useState([]);
  const [isFavState, setIsFavState] = useState(isFav || false);
  const [isFavLoading, setIsFavLoading] = useState(false);
  const [postLikes, setPostLikes] = useState(postData?.likes || []);
  const [wordsToShowState, setWordsToShowState] = useState(wordsToShow || -1);

  useEffect(() => {
    getUserFromUid(postData.authorId).then((res) => {
      setAuthorData(res);
      setAuthorDataLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!postImageUrls.length > 0) {
      postData?.postImages.map((imgPath) => {
        getPostImageUrl(imgPath).then((res) =>
          setPostImageUrls((prev) => [...prev, res])
        );
        return imgPath;
      });
    }
  }, []);

  // functions
  const toggleIsFav = () => {
    setIsFavState((prev) => {
      return !prev;
    });
  };

  const handleToggleLike = () => {
    setIsFavLoading(true);
    handlePostLike(postData.postId, uid)
      .then((res) => {
        toggleIsFav();
        setPostLikes(res);
      })
      .finally(() => {
        setIsFavLoading(false);
      });
  };

  const handlePostItemClick = (e) => {
    if (
      clickToRedirect &&
      e.target.className !== "postFeedAuthorName" &&
      e.target.className !== "heartIconContainer" &&
      !e.target.parentNode.parentNode.classList.contains("heartFilledIcon") &&
      !e.target.parentNode.parentNode.classList.contains(
        "heartIconContainer"
      ) &&
      !e.target.parentNode.parentNode.classList.contains(
        "postFeedImageContainer"
      ) &&
      e.target.className !== "postFeedImageContainer" &&
      postData.postId &&
      !e.target.parentNode.parentNode.parentNode.classList.contains(
        "postDeleteIcon"
      )
    ) {
      history.push(`/post/${postData.postId}`);
    }
  };

  const handleDeletePost = () => {
    if (!postData.postId || !postData.authorId === uid) {
      return console.log(
        "Sorry You Don't Have the permission to Perform this action!"
      );
    }

    deletePost(postData.postId).then(() => {
      history.push(history.location.pathname);
    });
  };

  return (
    <div
      className={`postFeedCartContainer ${
        hoverEffect ? "postFeedCartContainerHoverEffect" : ""
      }`}
      style={{ ...itemWrapperCustomStyles }}
    >
      <Card
        onClick={handlePostItemClick}
        hoverable
        style={{ maxWidth: 600, width: "100%", ...cardCustomStyles }}
        cover={
          <>
            {!authorDataLoading ? (
              <div className="postFeedAuthorContainer">
                <Image
                  width={60}
                  height={60}
                  style={{
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                  src={
                    authorData.img ||
                    "https://image.shutterstock.com/image-photo/confident-person-portrait-smiling-asian-600w-1849899991.jpg"
                  }
                />
                <div className="postFeedAuthorDescription">
                  <div>
                    <h1
                      className="postFeedAuthorName"
                      onClick={() => {
                        history.push(`/profile/${postData.authorId}`);
                      }}
                    >
                      {authorData.userName || "Anonymous"}
                    </h1>
                    <p className="postFeedTimeAgo">
                      Created{" "}
                      <ReactTimeAgo
                        date={new Date(postData.createdAt * 1000)}
                        locale="en-US"
                      />
                    </p>
                  </div>

                  <div
                    className="heartIconContainer"
                    onClick={handleToggleLike}
                  >
                    {isFavLoading ? (
                      <>
                        {" "}
                        <LoadingOutlined />{" "}
                      </>
                    ) : (
                      <>
                        {isFavState ? (
                          <HeartFilled className="heartFilledIcon" />
                        ) : (
                          <HeartOutlined className="heartHollow" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>Loading Author Profile ...</div>
            )}

            <div className="postFeedItemDescription">
              <h1> {postData.postTitle} </h1>

              {postData?.postImages && (
                <Carousel autoplay={true}>
                  {postImageUrls.map((img) => (
                    <div key={nanoid()} className="postFeedImageContainer">
                      <Image
                        width={"100%"}
                        style={{
                          objectFit: "cover",
                        }}
                        height={300}
                        src={img}
                      />
                    </div>
                  ))}
                </Carousel>
              )}

              <p>
                {wordsToShowState !== -1 &&
                postData.postDescription.length > wordsToShowState ? (
                  <span>
                    {postData.postDescription.slice(0, wordsToShowState)} ...
                    <span
                      style={{ color: "blue", display: "block" }}
                      onClick={() => {
                        console.log("clidked read more");
                        setWordsToShowState(-1);
                      }}
                    >
                      read more
                    </span>
                  </span>
                ) : (
                  postData.postDescription
                )}
              </p>

              <div className="postFeedItemStatsContainer">
                <div>
                  <LikeFilled />
                  <span className="postFeedItemStatNumber">
                    {postLikes.length}
                  </span>
                </div>

                {!noCommentCount && (
                  <div>
                    <CommentOutlined />
                    <span className="postFeedItemStatNumber">
                      {postData?.comments?.length || 0}
                    </span>
                  </div>
                )}

                {postData.authorId === uid && (
                  <div className="postDeleteIcon">
                    <DeleteFilled onClick={handleDeletePost} />
                  </div>
                )}
              </div>
            </div>
          </>
        }
      ></Card>
    </div>
  );
};

export default PostFeedItem;
