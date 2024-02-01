import { useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

const CommentCard = ({ index, leftVal, commentData }) => {
  const {
    commented_by: {
      personal_info: { profile_img, fullname, username: commented_by_username },
    },
    commentedAt,
    comment,
    _id,
    children,
  } = commentData;
  const {
    userAuth: { token, user: { personal_info: { username } = {} } = {} },
  } = useContext(UserContext);
  const {
    blog,
    blog: {
      comments,
      activity,
      activity: { total_parent_comments },
      comments: { results: commentsArr },
      author: {
        personal_info: { username: blog_author },
      },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);
  const [isReplying, setIsReplying] = useState(false);
  const getParentIndex = () => {
    let startingPoint = index - 1;
    try {
      while (
        commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch {
      startingPoint = undefined;
    }
    return startingPoint;
  };
  const removeCommentsCards = (startingPoint, isDelete = false) => {
    if (commentsArr[startingPoint]) {
      while (
        commentsArr[startingPoint].childrenLevel > commentData.childrenLevel
      ) {
        commentsArr.splice(startingPoint, 1);
        if (!commentsArr[startingPoint]) {
          break;
        }
      }
    }
    if (isDelete) {
      const parentIndex = getParentIndex();
      if (parentIndex !== undefined) {
        commentsArr[parentIndex].children = commentsArr[
          parentIndex
        ].children.filter((child) => child !== _id);
        if (!commentsArr[parentIndex].children.length) {
          commentsArr[parentIndex].isReplyLoaded = false;
        }
      }
      commentsArr.splice(index, 1);
    }
    if (commentData.childrenLevel === 0 && isDelete) {
      setTotalParentCommentsLoaded((prev) => prev - 1);
    }
    setBlog({
      ...blog,
      comments: { results: commentsArr },
      activity: {
        ...activity,
        total_parent_comments:
          total_parent_comments -
          (commentData.childrenLevel === 0 && isDelete ? 1 : 0),
      },
    });
  };
  const handleReplyClick = () => {
    if (!token) {
      return toast.error("Please login to leave a reply");
    }
    setIsReplying((prev) => !prev);
  };
  const hideReplies = () => {
    commentData.isReplyLoaded = false;
    removeCommentsCards(index + 1);
  };
  const loadReplies = async ({ skip = 0 }) => {
    try {
      if (children.length) {
        hideReplies();
        const response = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/comment/get-replies",
          { _id, skip }
        );
        if (response) {
          let replies = [...response.data.replies];
          commentData.isReplyLoaded = true;
          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel = commentData.childrenLevel + 1;
            commentsArr.splice(index + 1 + i + skip, 0, replies[i]);
          }
          setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleDeleteComments = async (e) => {
    e.target.setAttribute("disabled", true);
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/comment/delete-comments",
        { _id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response) {
        e.target.removeAttribute("disabled");
        removeCommentsCards(index + 1, true);
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className="my-5 p-6 rounded-md border border-grey">
        <div className="flex gap-3 items-center mb-8">
          <img src={profile_img} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1">
            {fullname} @{commented_by_username}
          </p>
          <p className="min-w-fit">{getDay(commentedAt)}</p>
        </div>
        <p className="font-gelasio text-xl ml-3">{comment}</p>
        <div className="flex gap-5 items-center mt-5">
          {commentData.isReplyLoaded ? (
            <button
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
              onClick={hideReplies}
            >
              <i className="fi fi-rs-comment-dots"></i>Hide Reply
            </button>
          ) : (
            <button
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
              onClick={loadReplies}
            >
              <i className="fi fi-rs-comment-dots"></i>
              {children.length} Reply
            </button>
          )}
          <button className="underline" onClick={handleReplyClick}>
            Reply
          </button>
          {username === commented_by_username || username === blog_author ? (
            <button
              className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center"
              onClick={handleDeleteComments}
            >
              <i className="fi fi-rr-trash pointer-events-none"></i>
            </button>
          ) : (
            ""
          )}
        </div>
        {isReplying ? (
          <div className="mt-8">
            <CommentField
              action="reply"
              index={index}
              replyingTo={_id}
              setReplying={setIsReplying}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};
export default CommentCard;
