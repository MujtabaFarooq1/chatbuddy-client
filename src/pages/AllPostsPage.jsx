import { Button } from "antd";
import PostFeedItem from "../components/PostFeedItem";
import { DingtalkOutlined } from "@ant-design/icons";
import CreatePostModel from "./../components/CreatePostModel";
import { useState } from "react";
import { useEffect } from "react";
import { getAllPosts } from "../actions/dbHelper";
import { useAuth } from "../context/auth-context";
import { nanoid } from "nanoid";

const wordsToShow = 200;

const isFav = true;

const postParagraph = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
enim ad minim veniam, quis nostrud exercitation ullamco laboris
nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
in reprehenderit in voluptate velit esse cillum dolore eu fugiat
nulla pariatur. Excepteur sint occaecat cupidatat non proident,
sunt in culpa qui officia deserunt mollit anim id est laborum.`;

// const postData = {
//   id: 1,
//   postTitle: "Some Title of the Post !",
//   postDescription: postParagraph,
//   authorName: "John Doe",
//   authorImage:
//     "https://image.shutterstock.com/image-photo/confident-person-portrait-smiling-asian-600w-1849899991.jpg",
//   createdAt: 123432423,
//   likes: 10,
//   comments: 10,
//   postImages: [
//     "https://image.shutterstock.com/image-photo/smiling-male-student-open-book-600w-248773558.jpg",
//     "https://image.shutterstock.com/image-photo/home-office-dress-code-girl-600w-1719984745.jpg",
//     "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
//   ],
// };

const AllPostsPage = () => {
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

  // return (
  //   <>
  //     {!allPostsLoading ? (
  //       <h1> {postData ? "Posts Found" : "No Post Found"} </h1>
  //     ) : (
  //       <h1>Loading ....</h1>
  //     )}
  //   </>
  // );

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

      <h1> Recent Posts </h1>

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
                  />
                ))}
              </>
            ) : (
              <h1> No Posts Found ! </h1>
            )}
          </>
        ) : (
          <h1>Loading Posts ...</h1>
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
