import axios from "axios";
import toast from "react-hot-toast";

const uploadImage = async (img) => {
  let imgUrl = null;
  const data = new FormData();
  data.append("file", img);
  data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
  data.append("folder", "blog-app");
  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/image/upload`,
      data
    );
    imgUrl = response.data.url;
  } catch (err) {
    toast.error("File Upload Failed. Please Try Again.");
  }
  return imgUrl;
};

export default uploadImage;
