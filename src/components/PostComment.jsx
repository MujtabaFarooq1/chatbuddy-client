import React, { useEffect, useState } from "react";
import moment from "moment";
import { Comment, Tooltip, Avatar, Button } from "antd";
import { getUserFromUid } from "../actions/dbHelper";
import { Link } from "react-router-dom";

function PostComment({ commentData }) {
  const [commentDataState, setCommentDataSate] = useState(commentData);
  const commentedBy = commentData.commentedBy;

  useEffect(() => {
    getUserFromUid(commentData?.commentedBy).then((res) => {
      const { userName, email, img } = res;
      setCommentDataSate({
        ...commentData,
        commentedBy: {
          commentedBy,
          userName: userName || "Anonymous",
          email: email || "anonymoys@chabuddy.com",
          img: img || "https://joeschmoe.io/api/v1/male/random",
        },
      });
    });
  }, []);

  return (
    <div className="post-comment">
      {commentDataState ? (
        <>
          <Comment
            style={{ marginBottom: "1rem" }}
            author={
              <Link
                style={{ fontSize: "1rem", fontWeight: "bold" }}
                to={`/profile/${commentDataState.commentedBy}`}
              >
                {commentDataState?.commentedBy?.userName}
              </Link>
            }
            avatar={
              <Avatar
                src={commentDataState?.commentedBy?.img}
                alt={"user image"}
              />
            }
            content={<p>{commentDataState?.comment || ""}</p>}
            datetime={
              <Tooltip
                title={moment(commentDataState.createdAt * 1000).format(
                  "YYYY-MM-DD HH:mm:ss"
                )}
              >
                <span>
                  {moment(commentDataState.createdAt * 1000).fromNow()}
                </span>
              </Tooltip>
            }
          />
        </>
      ) : (
        <h2>Loading Comment ...</h2>
      )}
    </div>
  );
}

export default PostComment;
