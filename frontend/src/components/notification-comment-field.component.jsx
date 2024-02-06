import { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCommentfield = ({
  _id,
  blog_author,
  index = undefined,
  replyingTo = undefined,
  setReplying,
  notification_id,
  notificationData,
}) => {
  const [comment, setComment] = useState("");
  const { _id: user_id } = blog_author;
  const {
    userAuth: { token },
  } = useContext(UserContext);
  const {
    notifications,
    notifications: { results },
    setNotifications,
  } = notificationData;
  const handleComment = async () => {
    try {
      if (!comment.length) {
        return toast.error("Write something to leave a comment");
      }
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/comment/add-comment",
        {
          _id,
          blog_author: user_id,
          comment,
          replying_to: replyingTo,
          notification_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setReplying(false);
        results[index].reply = { comment, _id: response.data._id };
        setNotifications({ ...notifications, results });
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
        placeholder="Leave a reply..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>
      <button className="btn-dark mt-5 px-10" onClick={handleComment}>
        Reply
      </button>
    </>
  );
};
export default NotificationCommentfield;
