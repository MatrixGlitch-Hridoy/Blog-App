const sendAccessToken = (user, statusCode, res) => {
  const accessToken = user.getAccessToken();
  return accessToken;
};

export default sendAccessToken;
