// updateImage.mjs

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default async function updateImage(file) {
    const storage = getStorage();
    const storageRef = ref(storage, 'avatars/' + file.name);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
            (snapshot) => {
                // Fortschritt-Funktion ...
            }, 
            (error) => {
                // Fehlerbehandlung ...
                reject(error);
            }, 
            () => {
                // Komplett-Funktion ...
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
}