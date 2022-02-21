import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getSinglePost } from "../actions/dbHelper";
import AllComments from "../components/AllComments";
import AppScreenLoading from "../components/AppScreenLoading";

import PostFeedItem from "../components/PostFeedItem";
import { useAuth } from "../context/auth-context";

const cardCustomStyles = {
  maxWidth: "100%",
  boxShadow: "none",
  border: "none",
  background: "none",
};

const itemWrapperCustomStyles = {
  padding: "0",
  margin: "0",
};

function SinglePostPage() {
  const { postId } = useParams();
  const history = useHistory();
  const { curAuth } = useAuth();

  //States
  const [postData, setPostData] = useState();

  useEffect(() => {
    getSinglePostData();
  }, []);

  // ------- Functions
  const getSinglePostData = async () => {
    const data = await getSinglePost(postId, curAuth.uid);
    if (!data) {
      history.push("/");
    }
    setPostData(data);
  };

  // ------- The JSX
  return (
    <div className="single-post-page" style={{ paddingBottom: "2rem" }}>
      {postData ? (
        <>
          <PostFeedItem
            isFav={postData.isFav}
            postData={postData}
            cardCustomStyles={cardCustomStyles}
            itemWrapperCustomStyles={itemWrapperCustomStyles}
            noCommentCount={true}
          />
          <AllComments
            comments={postData?.comments || []}
            postId={postData.postId}
          />
        </>
      ) : (
        <AppScreenLoading LoadingDescription={"Loading Post"} />
      )}
    </div>
  );
}

export default SinglePostPage;
