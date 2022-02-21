import React, { useEffect, useState } from "react";
import { Form, Input, Button } from "antd";
import PostComment from "./PostComment";
import { addComment } from "../actions/dbHelper";
import { useAuth } from "../context/auth-context";

function AllComments({ comments, postId }) {
  // Hooks ?
  const { curAuth } = useAuth();

  // States
  const [postComments, setPostComments] = useState(
    comments.sort((a, b) => b.createdAt - a.createdAt)
  );
  const [comment, setComment] = useState("");
  const [commentSendLoading, setCommentSendLoading] = useState(false);
  const [commentSendError, setCommentSendError] = useState("");

  // functions
  const handlePostComment = async () => {
    setCommentSendLoading(true);
    addComment(postId, curAuth.uid, comment)
      .then((res) => {
        setComment("");
        const newComments = [...postComments, res].sort(
          (a, b) => b.createdAt - a.createdAt
        );
        setPostComments((prev) => [...newComments]);
        setCommentSendError("");
      })
      .catch((err) => {
        console.log(err);
        setCommentSendError(err.message ? err.message : err);
      })
      .finally(() => {
        setCommentSendLoading(false);
      });
  };

  return (
    <div className="post-comments" style={{ padding: "0 1rem" }}>
      <h2> Comments ({postComments.length || 0}) </h2>

      {commentSendLoading && <h3> Please Wait Checking Your Comment </h3>}

      {!!commentSendError && (
        <h3 style={{ color: "red", textTransform: "capitalize" }}>
          {commentSendError}
        </h3>
      )}

      <Form>
        <Form.Item
          label="Post Comment"
          name="comment"
          style={{ display: "flex" }}
        >
          <div className="comments-wrapper" style={{ display: "flex" }}>
            <Input
              onChange={(e) => {
                setComment(e.target.value);
              }}
              value={comment}
              disabled={commentSendLoading}
            />

            <Button
              type="primary"
              htmlType="submit"
              onClick={handlePostComment}
              disabled={commentSendLoading}
            >
              Post
            </Button>
          </div>
        </Form.Item>
      </Form>

      {postComments?.length && postComments?.length > 0 ? (
        postComments.map((commentData, idx) => {
          return (
            <PostComment
              key={idx + commentData.comment}
              commentData={commentData}
            />
          );
        })
      ) : (
        <>
          <h3> Be the first to comment on this post ! </h3>
        </>
      )}
    </div>
  );
}

export default AllComments;
