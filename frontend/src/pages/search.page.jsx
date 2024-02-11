import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import BlogPostCard from "../components/blog-post.component";
import { useEffect, useState } from "react";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import UserCard from "../components/usercard.component";
import BlogCardSkeleton from "../components/blog-card-skeleton.component";
import UserCardSkeleton from "../components/user-card-skeleton.component";

const SearchPage = () => {
  const { query } = useParams();
  const [blogs, setBlogs] = useState(null);
  const [users, setUsers] = useState(null);
  const searchBlogs = async ({ page = 1, create_new_arr = false }) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blog/search-blogs",
        { query, page }
      );
      if (response) {
        const formateData = await filterPaginationData({
          state: blogs,
          data: response?.data?.blogs,
          page,
          countRoute: "/blog/search-blogs-count",
          data_to_send: { query },
          create_new_arr,
        });
        setBlogs(formateData);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const searchUsers = async () => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user/search-users",
        { query }
      );
      if (response) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
    searchUsers();
  }, [query]);

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  };
  const UserCardWrapper = () => {
    return (
      <>
        {users === null ? (
          [...Array(2)].map((_, index) => <UserCardSkeleton key={index} />)
        ) : users?.length ? (
          users.map((user, i) => {
            return (
              <AnimationWrapper
                key={i}
                transition={{ duration: 1, delay: i * 0.08 }}
              >
                <UserCard user={user} />
              </AnimationWrapper>
            );
          })
        ) : (
          <NoDataMessage message="No user found" />
        )}
      </>
    );
  };
  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`Search Results for "${query}"`, "Accounts Matched"]}
          defaultHidden={["Accounts Matched"]}
        >
          <>
            {blogs === null ? (
              [...Array(5)].map((_, index) => <BlogCardSkeleton key={index} />)
            ) : blogs?.results?.length ? (
              blogs?.results?.map((blog, i) => {
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
            ) : (
              <NoDataMessage message="No blogs published" />
            )}
            <LoadMoreDataBtn state={blogs} fetchDataFunc={searchBlogs} />
          </>
          <UserCardWrapper />
        </InPageNavigation>
      </div>
      <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
        <h1 className="font-medium text-xl mb-8">
          User related to search <i className="fi fi-rr-user mt-1"></i>
        </h1>
        <UserCardWrapper />
      </div>
    </section>
  );
};
export default SearchPage;
