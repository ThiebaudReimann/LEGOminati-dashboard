"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import React from "react";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import updateGitHubRepository from "@/app/api/updateRepo.mjs";
import updateImage from "./api/updateImage.mjs";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [user] = useAuthState(auth);
  const [userSession, setUserSession] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [bioDE, setBioDE] = useState("");
  const [bioEN, setBioEN] = useState("");
  const [avatar, setAvatar] = useState("");
  const [currentindex, setCurrentIndex] = useState("");
  const [file, setFile] = useState("");
  const router = useRouter(); // Move the useRouter hook inside useEffect

  // Load user session from sessionStorage when component mounts
  useEffect(() => {
    const sessionUser = sessionStorage.getItem("user");
    setUserSession(sessionUser);
  }, []);

  // Load GitHub file when user.displayName changes
  useEffect(() => {
    const loadGitHubFile = async () => {
      const fileUrl =
        "https://raw.githubusercontent.com/ThiebaudReimann/LEGOminati/Website/json/team-members.json";
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(
            `Fehler beim Abrufen der Datei. Status: ${response.status}`
          );
        }
        const fileContent = await response.json();
        const members = fileContent.members;
        const index = members.findIndex((item) => item.id === user.index);
        const gitDisplayName = members[index].name;
        const gitRole = members[index].description;
        const gitBioDE = members[index].biographie.de;
        const gitBioEN = members[index].biographie.en;
        const gitImg = members[index].img;
        if (index !== -1) {
          setDisplayName(gitDisplayName || "");
          setRole(gitRole || "");
          setBioDE(gitBioDE || "");
          setBioEN(gitBioEN || "");
          setCurrentIndex(index || "");
          const inputPath = gitImg;
          const baseUrl = "https://www.letsgominati.de/";

          // Verwenden Sie die URL-Klasse, um den vollständigen Pfad zu erstellen
          const fullPath = inputPath.replace("../", baseUrl);
          setAvatar(fullPath);
        }
        return { gitDisplayName, gitRole, gitBioDE, gitBioEN, gitImg };
      } catch (error) {
        toast.error(error.message);
      }
    };
    if (user && user.displayName) {
      loadGitHubFile();
    }else {
      router.replace("/sign-in");
    }
  }, [user, router]); // Include router as a dependency
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    setAvatar(url);
    setFile(file);
    // Hier können Sie den Dateiupload-Code hinzufügen
  };
  const handleUploadtoGithub = async (index, fields, img) => {
    // Hier können Sie den Dateiupload-Code hinzufügen
    try {
      let link = avatar;
      if (file) {
        const uploadFile = file;
        const newFileNameWithoutExtension = "avatar-" + index; // Ersetzen Sie dies durch den gewünschten Dateinamen ohne Endung

        const extension = uploadFile.type.split("/")[1];
        const newFileName = `${newFileNameWithoutExtension}.${extension}`;

        const newFile = new File([uploadFile], newFileName, {
          type: uploadFile.type,
        });
        link = await updateImage(newFile);
      }
      const build = {
        id: index + 1,
        name: fields.name,
        description: fields.role,
        img: link || "",
        biographie: {
          de: fields.biographie.de,
          en: fields.biographie.en,
        },
      };

      await updateGitHubRepository(
        "ThiebaudReimann",
        "LEGOminati",
        "Website",
        "json/team-members.json",
        `members.${index}`,
        build,
        process.env.NEXT_PUBLIC_GITHUB_API_KEY
      );
      toast.success("Erfolgreich Hochgeladen!");
    } catch (error) {
      toast.error("Fehler beim Hochladen!");
    }
  };
  return (
    <>
      <ToastContainer />
      <header className="bg-gray-900 p-4 flex justify-between items-center text-white">
        <div>LEGOminati Dashboard</div>
        <div className="flex">
          <button
            className="mr-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            onClick={() => router.push("/settings")}
          >
            Settings
          </button>
          <button
            className="mr-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            onClick={() => {
              signOut(auth);
              sessionStorage.removeItem("user");
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <main className="flex bg-gray-900 mx-10">
        <div className="text-white w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h1 className="text-2xl mb-5">
              Willkommen { user ? user.displayName : "undefined"},
            </h1>
            <img src={avatar} alt="" width="100px" className="p-3 mb-4" />
            <input
              type="file"
              id="file_input"
              onChange={handleFileUpload}
              className="p-3 mb-4 block w-full text-lg text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              accept=".jpg, .jpeg, .png, .gif, .svg, .webp"
            />
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            />
            <input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea
                id="bioDE"
                value={bioDE}
                onChange={(e) => setBioDE(e.target.value)}
                className="resize-none w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
              />
              <textarea
                id="bioEN"
                value={bioEN}
                onChange={(e) => setBioEN(e.target.value)}
                className="resize-none w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              onClick={() => {
                handleUploadtoGithub(
                  currentindex,
                  {
                    name: displayName,
                    role: role,
                    img: avatar,
                    biographie: { de: bioDE, en: bioEN },
                  },
                  "img"
                );
              }}
              className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
            >
              Submit
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
