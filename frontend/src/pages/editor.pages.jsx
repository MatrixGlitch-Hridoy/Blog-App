import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import Loader from "../components/loader.component";
import axios from "axios";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: { personal_info: {} },
};

export const EditorContext = createContext({});

const Editor = () => {
  const { blog_id } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });
  const [loading, setLoading] = useState(true);
  const {
    userAuth: { token },
  } = useContext(UserContext);
  const getBlogById = async () => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blog/blog-details",
        { blog_id, draft: true, mode: "edit" }
      );
      if (response) {
        setBlog(response?.data?.blog);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setBlog(null);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!blog_id) {
      return setLoading(false);
    }
    getBlogById();
  }, []);
  return (
    <EditorContext.Provider
      value={{
        blog,
        setBlog,
        editorState,
        setEditorState,
        textEditor,
        setTextEditor,
      }}
    >
      {token === null ? (
        <Navigate to="/signin" />
      ) : loading ? (
        <Loader />
      ) : editorState === "editor" ? (
        <BlogEditor />
      ) : (
        <PublishForm />
      )}
    </EditorContext.Provider>
  );
};

export default Editor;
