import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import {
  getProfileApi,
  updateProfileApi,
  changePasswordApi,
} from "../../api/profileApi";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await getProfileApi();
    setProfile(res.data);
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateProfileApi(profile);

      // update password nếu có nhập
      if (
        passwordForm.currentPassword &&
        passwordForm.newPassword
      ) {
        await changePasswordApi(passwordForm);
      }

      setEditing(false);
      setPasswordForm({ currentPassword: "", newPassword: "" });

      setToast("Profile updated successfully");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setToast(err.response?.data?.message || "Update failed");
      setTimeout(() => setToast(""), 3000);
    }
  };

  if (!profile) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-100">

      {/* HEADER */}
      <Header />

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN */}
        <div className="flex-1 p-10 overflow-y-auto">

          <div className="grid grid-cols-12 gap-10">

            {/* LEFT CARD */}
            <div className="col-span-3 bg-white rounded-2xl shadow-md p-8 text-center">
              <img
                src={profile.avatar || "https://i.pravatar.cc/200"}
                alt="avatar"
                className="w-36 h-36 mx-auto rounded-full object-cover border-4 border-pink-500"
              />

              <h2 className="mt-5 text-lg font-bold">
                {profile.fullName}
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                {profile.location || "No location"}
              </p>
            </div>

            {/* PROFILE INFO */}
            <div className="col-span-9 bg-white rounded-2xl shadow-md p-10 relative">

              <h1 className="text-2xl font-bold mb-8">
                Profile Information
              </h1>

              <div className="space-y-6">

                {/* FULL NAME */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    value={profile.fullName}
                    disabled={!editing}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg transition-all
                      ${
                        editing
                          ? "border border-black bg-white focus:ring-2 focus:ring-black"
                          : "border border-gray-200 bg-gray-100 cursor-not-allowed"
                      }`}
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={profile.phone || ""}
                    disabled={!editing}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg transition-all
                      ${
                        editing
                          ? "border border-black bg-white focus:ring-2 focus:ring-black"
                          : "border border-gray-200 bg-gray-100 cursor-not-allowed"
                      }`}
                  />
                </div>

                {/* LOCATION */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <input
                    name="location"
                    value={profile.location || ""}
                    disabled={!editing}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg transition-all
                      ${
                        editing
                          ? "border border-black bg-white focus:ring-2 focus:ring-black"
                          : "border border-gray-200 bg-gray-100 cursor-not-allowed"
                      }`}
                  />
                </div>

                {/* BIO */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Short Bio
                  </label>
                  <textarea
                    name="bio"
                    rows={4}
                    value={profile.bio || ""}
                    disabled={!editing}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg transition-all
                      ${
                        editing
                          ? "border border-black bg-white focus:ring-2 focus:ring-black"
                          : "border border-gray-200 bg-gray-100 cursor-not-allowed"
                      }`}
                  />
                </div>

                {/* PASSWORD (only when editing) */}
                {editing && (
                  <div className="border-t pt-8 mt-8">
                    <h2 className="font-semibold mb-5">
                      Change Password
                    </h2>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full border border-black rounded-lg p-3 bg-white focus:ring-2 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full border border-black rounded-lg p-3 bg-white focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BUTTONS */}
              <div className="mt-10">
                {editing ? (
                  <div className="flex gap-4">
                    <button
                      onClick={handleSave}
                      className="bg-black text-white px-8 py-2 rounded-lg hover:opacity-90"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="border px-8 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-black text-white px-8 py-2 rounded-lg hover:opacity-90"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {/* TOAST */}
              {toast && (
                <div className="absolute top-6 right-6 bg-black text-white px-5 py-2 rounded-lg shadow-lg">
                  {toast}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}