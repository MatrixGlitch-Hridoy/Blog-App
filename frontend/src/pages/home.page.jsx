import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";

const Homepage = () => {
  const [blogs, setBlogs] = useState(null);
  const fetchLatestBlogs = async () => {
    try {
      const blogs = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + "/blog/latest-blogs"
      );
      setBlogs(blogs?.data?.blogs);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchLatestBlogs();
  }, []);
  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* latest blogs */}
        <div className="w-full">
          <InPageNavigation
            routes={["home", "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogs === null ? (
                <Loader />
              ) : (
                blogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={blog.blog_id}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              )}
            </>
            <h1>Latest Blogs</h1>
            <h1>Trending Blogs</h1>
          </InPageNavigation>
        </div>
        {/* filters and trending blogs */}
        <div></div>
      </section>
    </AnimationWrapper>
  );
};

export default Homepage;
