import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";

const CommentField = ({
  action,
  index = undefined,
  replyingTo = undefined,
  setReplying,
}) => {
  const {
    blog,
    blog: {
      _id,
      author: { _id: blog_author },
      comments,
      comments: { results: commentsArr },
      activity,
      activity: { total_comments, total_parent_comments },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);
  const {
    userAuth: {
      token,
      user: { personal_info: { username, fullname, profile_img } = {} } = {},
    },
  } = useContext(UserContext);
  const [comment, setComment] = useState("");
  const handleComment = async () => {
    try {
      if (!token) {
        return toast.error("Please login to leave a comment");
      }
      if (!comment.length) {
        return toast.error("Write something to leave a comment");
      }
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/comment/add-comment",
        {
          _id,
          blog_author,
          comment,
          replying_to: replyingTo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setComment("");
        const commented_by = {
          personal_info: { username, fullname, profile_img },
        };
        let newData = { ...response.data, commented_by };
        let newCommentArr;
        if (replyingTo) {
          commentsArr[index].children.push(newData._id);
          newData.childrenLevel = commentsArr[index].childrenLevel + 1;
          newData.parentIndex = index;
          commentsArr[index].isReplyLoaded = true;
          commentsArr.splice(index + 1, 0, newData);
          newCommentArr = commentsArr;
          setReplying(false);
        } else {
          newData.childrenLevel = 0;
          newCommentArr = [newData, ...commentsArr];
        }

        let parentCommentIncrementVal = replyingTo ? 0 : 1;
        setBlog({
          ...blog,
          comments: { ...comments, results: newCommentArr },
          activity: {
            ...activity,
            total_comments: total_comments + 1,
            total_parent_comments:
              total_parent_comments + parentCommentIncrementVal,
          },
        });
        setTotalParentCommentsLoaded(
          (prev) => prev + parentCommentIncrementVal
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>
      <button className="btn-dark mt-5 px-10" onClick={handleComment}>
        {action}
      </button>
    </>
  );
};
export default CommentField;
