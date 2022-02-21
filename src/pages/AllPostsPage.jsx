import { Button } from "antd";
import PostFeedItem from "../components/PostFeedItem";
import AppScreenLoading from "../components/AppScreenLoading";
import { DingtalkOutlined } from "@ant-design/icons";
import CreatePostModel from "./../components/CreatePostModel";
import { useState } from "react";
import { useEffect } from "react";
import { getAllPosts } from "../actions/dbHelper";
import { useAuth } from "../context/auth-context";
import { nanoid } from "nanoid";

const AllPostsPage = ({ wordsToShow = 200 }) => {
  const [createPostModelOpen, setCreatePostModelOpen] = useState(false);
  const [allPosts, setAllPosts] = useState();
  const [allPostsLoading, setAllPostsLoading] = useState(true);
  const {
    curAuth: { uid },
  } = useAuth();
  //----------------------------------

  useEffect(() => {
    getAllPosts(uid).then((res) => {
      if (res?.length > 0 && res[0]) {
        setAllPosts(res);
      } else {
        setAllPosts([]);
      }

      setAllPostsLoading(false);
    });
  }, []);

  return (
    <div className="allPostsPage">
      <div className="newPostStickyBar">
        <Button
          type="primary"
          className="addPostButton"
          onClick={() => {
            setCreatePostModelOpen(true);
          }}
        >
          <DingtalkOutlined style={{ fontSize: "1.3rem" }} /> Create Post
        </Button>
      </div>

      <h1 className="secondaryHeading"> Recent Posts </h1>

      <div className="postFeed">
        {!allPostsLoading ? (
          <>
            {allPosts?.length > 0 ? (
              <>
                {allPosts.map((post) => (
                  <PostFeedItem
                    key={nanoid()}
                    postData={post}
                    wordsToShow={wordsToShow}
                    isFav={post.isFav}
                    clickToRedirect={true}
                    hoverEffect={true}
                  />
                ))}
              </>
            ) : (
              <h1> No Posts Found ! </h1>
            )}
          </>
        ) : (
          <AppScreenLoading
            LoadingDescription={"Kindly Wait While We Load Post Feed!"}
          />
        )}
      </div>

      {
        <CreatePostModel
          isVisible={createPostModelOpen}
          closeModel={() => {
            setCreatePostModelOpen(false);
          }}
        />
      }
    </div>
  );
};

export default AllPostsPage;
