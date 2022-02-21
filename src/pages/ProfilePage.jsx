import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getUserFromUid } from "../actions/dbHelper";
import AppScreenLoading from "../components/AppScreenLoading";
import Profile from "../components/Profile/index";
import { useAuth } from "../context/auth-context";

function ProfilePage() {
  let { userId } = useParams();
  const { curAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  const getProfileData = async () => {
    if (!userId) {
      userId = "me";
    }
    const curUser = await getUserFromUid(
      userId === "me" ? curAuth.uid : userId
    );
    if (curUser) {
      setProfileData(curUser);
    }
  };

  useEffect(() => {
    getProfileData().finally(() => setLoading(false));
  }, []);

  return (
    <>
      {!loading ? (
        <Profile profileData={profileData} userId={userId} />
      ) : (
        <AppScreenLoading LoadingDescription={"Getting Profile ..."} />
      )}
    </>
  );
}

export default ProfilePage;
