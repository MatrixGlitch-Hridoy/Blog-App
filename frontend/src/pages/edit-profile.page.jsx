import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import toast, { Toaster } from "react-hot-toast";
import InputBox from "../components/input.component";
import uploadImage from "../common/cloudinary";
import { storeInSession } from "../common/session";

const EditProfile = () => {
  const bioLimit = 150;
  const profileImgEle = useRef();
  const editProfileForm = useRef();
  const {
    userAuth,
    userAuth: { token, user: { personal_info: { username } = {} } = {} },
    setUserAuth,
  } = useContext(UserContext);
  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [charactersLeft, setCharactersLeft] = useState(bioLimit);
  const [updatedProfileImg, setUpdatedProfileImg] = useState(null);
  const {
    personal_info: {
      fullname,
      username: profile_username,
      profile_img,
      email,
      bio,
    },
    social_links,
  } = profile;
  const getUserProfile = async () => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user/profile",
        {
          username,
        }
      );
      if (response.data) {
        setProfile(response.data);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (token) {
      getUserProfile();
    }
  }, [token]);
  const handleCharacterChange = (e) => {
    setCharactersLeft(bioLimit - e.target.value.length);
  };
  const handleImagePreview = (e) => {
    const img = e.target.files[0];
    profileImgEle.current.src = URL.createObjectURL(img);
    setUpdatedProfileImg(img);
  };
  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (updatedProfileImg) {
      const loadingToast = toast.loading("Uploading...");
      e.target.setAttribute("disabled", true);
      const url = await uploadImage(updatedProfileImg);
      if (url) {
        try {
          const response = await axios.post(
            import.meta.env.VITE_SERVER_DOMAIN + "/user/update-profile-img",
            { url },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.data) {
            const newUserAuth = {
              ...userAuth,
              user: {
                ...userAuth.user,
                personal_info: {
                  ...userAuth.user.personal_info,
                  profile_img: response.data.profile_img,
                },
              },
            };
            storeInSession("user", JSON.stringify(newUserAuth));
            setUserAuth(newUserAuth);
            setUpdatedProfileImg(null);
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disbaled");
            toast.success("Uploaded!");
          }
        } catch (err) {
          toast.dismiss(loadingToast);
          e.target.removeAttribute("disbaled");
          console.log(err);
        }
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(editProfileForm.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }
    const {
      username: formUser,
      bio,
      youtube,
      instagram,
      facebook,
      twitter,
      github,
      website,
    } = formData;
    if (formUser.length < 3) {
      return toast.error("username should be at least 3 letters long");
    }
    if (bio.length > bioLimit) {
      return toast.error(`Bio should not be more than ${bioLimit} characters`);
    }
    const loadingToast = toast.loading("Updating...");
    e.target.setAttribute("disabled", true);
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user/update-profile",
        {
          username: formUser,
          bio,
          social_links: {
            youtube,
            instagram,
            facebook,
            twitter,
            github,
            website,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data) {
        if (username !== response.data.username) {
          const newUserAuth = {
            ...userAuth,
            user: {
              ...userAuth.user,
              personal_info: {
                ...userAuth.user.personal_info,
                username: response.data.username,
              },
            },
          };
          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
        }
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.success("Profile Updated");
      }
    } catch ({ response }) {
      toast.dismiss(loadingToast);
      e.target.removeAttribute("disabled");
      toast.error(response.data.error);
    }
  };
  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={editProfileForm}>
          <Toaster />
          <h1 className="max-md:hidden">Edit Profile</h1>
          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:center mb-5">
              <label
                htmlFor="uploadImg"
                id="profileImgLabel"
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
              >
                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer">
                  Upload Image
                </div>
                <img src={profile_img} ref={profileImgEle} />
              </label>
              <input
                type="file"
                id="uploadImg"
                accept=".jpeg, .png, .jpg"
                hidden
                onChange={handleImagePreview}
              />
              <button
                className="btn-light mt-5 max-lg:center lg:w-full px-10"
                onClick={handleImageUpload}
              >
                Upload
              </button>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <InputBox
                    name="fullname"
                    type="text"
                    value={fullname}
                    placeholder="Full Name"
                    disable={true}
                    icon="fi-rr-user"
                  />
                </div>
                <div>
                  <InputBox
                    name="email"
                    type="email"
                    value={email}
                    placeholder="Email"
                    disable={true}
                    icon="fi-rr-envelope"
                  />
                </div>
              </div>
              <InputBox
                type="text"
                name="username"
                value={profile_username}
                placeholder="Username"
                icon="fi-rr-at"
              />
              <p className="text-dark-grey -mt-3">
                Username will use to search user and will be visible to all
                users
              </p>
              <textarea
                name="bio"
                maxLength={bioLimit}
                defaultValue={bio}
                className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                placeholder="Bio"
                onChange={handleCharacterChange}
              ></textarea>
              <p className="mt-1 text-dark-grey">
                {charactersLeft} characters left
              </p>
              <p className="my-6 text-dark-grey">
                Add your social handles below
              </p>
              <div className="md:grid md:grid-cols-2 gap-x-6">
                {Object.keys(social_links).map((key, i) => {
                  const link = social_links[key];
                  return (
                    <InputBox
                      key={i}
                      name={key}
                      type="text"
                      value={link}
                      placeholder="https://"
                      icon={
                        "fi " +
                        (key !== "website" ? "fi-brands-" + key : "fi-rr-globe")
                      }
                    />
                  );
                })}
              </div>
              <button
                className="btn-dark w-auto px-10"
                type="submit"
                onClick={handleSubmit}
              >
                Update
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};
export default EditProfile;
