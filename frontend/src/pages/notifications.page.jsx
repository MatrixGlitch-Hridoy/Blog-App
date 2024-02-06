import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";
import LoadMoreDataBtn from "../components/load-more.component";

const Notifications = () => {
  const {
    userAuth,
    userAuth: { token, new_notification_available },
    setUserAuth,
  } = useContext(UserContext);
  const [filter, setFilter] = useState("all");
  const filters = ["all", "like", "comment", "reply"];
  const [notifications, setNotifications] = useState(null);
  const fetchNotifications = async ({ page, deleteDocCount = 0 }) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/notification/notifications",
        { page, filter, deleteDocCount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        const {
          data: { notifications: data },
        } = response;
        if (new_notification_available) {
          setUserAuth({ ...userAuth, new_notification_available: false });
        }
        const formatedData = await filterPaginationData({
          state: notifications,
          data,
          page,
          countRoute: "/notification/all-notifications-count",
          data_to_send: { filter },
          user: token,
        });
        if (formatedData) {
          setNotifications(formatedData);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleFilter = (filterName) => {
    setFilter(filterName);
    setNotifications(null);
  };
  useEffect(() => {
    if (token) {
      fetchNotifications({ page: 1 });
    }
  }, [token, filter]);
  return (
    <div>
      <h1 className="max-md:hidden">Recent Notifications</h1>
      <div className="my-8 flex gap-6">
        {filters.map((filterName, i) => {
          return (
            <button
              key={i}
              className={
                "py-2 " + (filter === filterName ? "btn-dark" : "btn-light")
              }
              onClick={() => handleFilter(filterName)}
            >
              {filterName}
            </button>
          );
        })}
      </div>
      {notifications === null ? (
        <Loader />
      ) : (
        <>
          {notifications.results.length ? (
            notifications.results.map((notification, i) => {
              return (
                <AnimationWrapper
                  key={notification._id}
                  transition={{ delay: i * 0.08 }}
                >
                  <NotificationCard
                    data={notification}
                    index={i}
                    notificationState={{ notifications, setNotifications }}
                  />
                </AnimationWrapper>
              );
            })
          ) : (
            <NoDataMessage message="No notifications found" />
          )}
          <LoadMoreDataBtn
            state={notifications}
            fetchDataFunc={fetchNotifications}
            additionalParam={{ deleteDocCount: notifications.deleteDocCount }}
          />
        </>
      )}
    </div>
  );
};
export default Notifications;
