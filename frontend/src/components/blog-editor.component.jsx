import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { useContext, useEffect } from "react";
import { EditorContext } from "../pages/editor.pages";
import uploadImage from "../common/cloudinary";
import toast, { Toaster } from "react-hot-toast";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import axios from "axios";
import { UserContext } from "../App";
const BlogEditor = () => {
  const { blog_id } = useParams();
  const navigate = useNavigate();
  let {
    userAuth: { token },
  } = useContext(UserContext);
  const {
    blog,
    blog: { title, banner, content, tags, des } = {},
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);
  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: "textEditor",
          data: Array.isArray(content) ? content[0] : content,
          tools: tools,
          placeholder: "Let's write an awesome story",
        })
      );
    }
  }, []);
  const handleBannerUpload = async (e) => {
    const img = e.target.files[0];
    if (img) {
      const loadingToast = toast.loading("Uploading...");
      const url = await uploadImage(img);
      if (url) {
        toast.dismiss(loadingToast);
        toast.success("Uploaded!");
        setBlog({ ...blog, banner: url });
      }
    }
  };
  const handleTitleKeyDown = (e) => {
    if (e.keycode === 13) {
      e.preventDefault();
    }
  };
  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };
  const handleError = (e) => {
    let img = e.target;
    img.src = defaultBanner;
  };
  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("Upload a blog banner to publish it");
    }
    if (!title.length) {
      return toast.error("Write blog title to publish it");
    }
    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Write something in your blog to publish it");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSaveDaft = async (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("Write blog title before saving it as a draft");
    }

    let loadingToast = toast.loading("Saving Draft....");
    e.target.classList.add("disable");
    if (textEditor.isReady) {
      const content = await textEditor.save();
      if (content) {
        const blogData = {
          title,
          banner,
          des,
          content,
          tags,
          draft: true,
        };
        try {
          const response = await axios.post(
            import.meta.env.VITE_SERVER_DOMAIN + "/blog/create-blog",
            { ...blogData, id: blog_id },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response) {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.success("Saved!");
            setTimeout(() => {
              navigate("/dashboard/blogs?tab=draft");
            }, 500);
          }
        } catch ({ response }) {
          console.log("response", response);
          e.target.classList.remove("disable");
          toast.dismiss(loadingToast);
          return toast.error(response.data.message);
        }
      }
    }
  };
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
        </p>
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Publish
          </button>
          <button className="btn-light py-2" onClick={handleSaveDaft}>
            Save Draft
          </button>
        </div>
      </nav>
      <Toaster />
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video bg-white border-4 border-grey hover:opacity-80">
              <label htmlFor="uploadBanner">
                <img src={banner} className="z-20" onError={handleError} />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>
            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>
            <hr className="w-full opacity-10 my-5" />
            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
