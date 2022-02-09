const checkIfPostIsMyFav = (postData, uid) => {
  if (postData?.likes && postData?.length) {
    return postData.includes(uid);
  }

  return false;
};

export default checkIfPostIsMyFav;
