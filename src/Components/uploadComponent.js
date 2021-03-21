import React, { useEffect, useState } from "react";
import firebase from 'firebase';
import db from '../firebase';
import moment from 'moment';
import LoadingGif from '../assets/img/loadingBlue.gif';

const removeSpaces = (Text) => {
    return Text
        .toLowerCase()
        .replace(/\s/g,'-')
}

export const UploadComponent = () => {

    const [imgBlob, setImgBlob] = useState('');
    const [showLoadingGif, setShowLoadingGif] = useState(false);
    const [allAvatars, setAllAvatars] = useState([]);

    useEffect(() => {
        const dropArea = document.getElementById("drop-area");
        ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        ["dragenter", "dragover"].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ["dragleave", "drop"].forEach(eventName => {
            dropArea.addEventListener(eventName, unHightLight, false);
        });

        dropArea.addEventListener("drop", handleDrop, false);

        getAllAvatars();

        return () => {
            const dropArea = document.getElementById("drop-area");
            ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
                dropArea.removeEventListener(eventName, preventDefaults, false);
            });
    
            ["dragenter", "dragover"].forEach(eventName => {
                dropArea.removeEventListener(eventName, highlight, false);
            });
    
            ["dragleave", "drop"].forEach(eventName => {
                dropArea.removeEventListener(eventName, unHightLight, false);
            });
    
            dropArea.removeEventListener("drop", handleDrop, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const preventDefaults = e => {
        e.preventDefault();
        e.stopPropagation();
    };

    const highlight = () => {
        const ele = document.querySelector(".upload-label");
        if (ele) {
        ele.style.backgroundColor = "#e9e9e9";
        ele.style.border = "2px dotted #999";
        }
    };

    const unHightLight = () => {
        const ele = document.querySelector(".upload-label");
        if (ele) {
        ele.style.backgroundColor = "#f6f6f6";
        ele.style.border = "unset";
        }
    };

    const handleDrop = e => {
        const dt = e.dataTransfer;
        const { files } = dt;
        handleFiles(files);
    };

    const validateImage = (image) => {

        // check the type
        const allowedFileTypes = ["image/png", "image/jpeg", "image/gif"];
        if (allowedFileTypes.indexOf(image.type) === -1) {
            document.getElementById('fileerror').innerHTML = 'Invalid File Type';
            return false;
        }

        // check the size
        let maxSizeInBytes = 4e6; // 4MB
        if (image.size > maxSizeInBytes) {
            document.getElementById('fileerror').innerHTML = 'File too large, should not be more than 5MB in size';
            return false;
        }
        return true;
    }

    const handleFiles = files => {
        let reader = new FileReader();
        if(validateImage(files[0])) {
            document.getElementById('fileerror').innerHTML = '';

            // Resize the uploaded image
            reader.readAsArrayBuffer(files[0]);
            reader.onloadend = function (event) {
                // blob stuff
                let blob = new Blob([event.target.result]); // create blob...
                window.URL = window.URL || window.webkitURL;
                let blobURL = window.URL.createObjectURL(blob); // and get it's URL

                let image = new Image();
                image.src = blobURL;
                image.onload = function() {
                    var resized = resizeMe(image); // send it to canvas
                    var file = dataURLtoFile(resized,files[0].name);
                    setImgBlob(file)
                    document.getElementById("image-upload").src = resized;
                }
            };
        }
    };

    const dataURLtoFile = (dataurl, filename) => {
 
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), 
            n = bstr.length, 
            u8arr = new Uint8Array(n);
            
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new File([u8arr], filename, {type:mime});
    }
    
  

    // RESIZE: conversion to avatar 100x100
    function resizeMe(img) {    
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext("2d");
        canvas.width=100;
        canvas.height=100;
        ctx.drawImage(img,0,0,img.width,img.height,0,0,100,100);
        // get the data from canvas as 100% JPG (can be also PNG, etc.)
        return canvas.toDataURL("image/jpeg",1); 
    }


    const saveFile = async (e) => {
        e.preventDefault();
        setShowLoadingGif(true);
        try {
            if(imgBlob) {
                let imageName = Date.now() + removeSpaces(imgBlob.name);
                const storageRef = firebase.storage().ref();
                const fileRef = storageRef.child(`/avatars/${imageName}`);
                fileRef.put(imgBlob).then(snapshot => {
                    snapshot.ref.getDownloadURL().then(async url => {
                        await saveItemToDB(url, imageName);
                    });
                    setShowLoadingGif(false);
                }).catch((error) => {
                    document.getElementById('fileerror').innerHTML = error.message;
                    setShowLoadingGif(false);
                });
            } 

            // defaults
            document.getElementById("image-upload")
            .src = "https://i.pinimg.com/originals/51/f6/fb/51f6fb256629fc755b8870c801092942.png";
            setImgBlob('');
            
        } catch(error) {
            setShowLoadingGif(false);
            console.log('error:', error);
        }
    }

    const saveItemToDB = async (url, imageName) => {
        let data = {
            imageName,
            imageUrl: url,
            createdAt: Date.now()
        }
        try {
            const avatarRef = db.firestore().collection('avatars');
            await avatarRef.add(data);
            await getAllAvatars();
        } catch(error) {
            console.log('error:', error);
        }
    }

    const getAllAvatars = async () => {
        try {
            const avatarRef = db.firestore().collection('avatars');
            const snapshot = (await avatarRef.get()).docs;
            const avatars = {};
            snapshot.forEach((doc) => {
                avatars[doc.id] = doc.data();
            });
            let allAvatars = [];
            allAvatars = Object.keys(avatars).map((key) => {
                return { id: key, ...avatars[key]};
            });
            return setAllAvatars(allAvatars);
        } catch(error) {
            console.log('error:', error);
        }
    }


    // Sort avatars by datetime
    if(allAvatars.length > 0) {
        allAvatars.sort(function(x, y){
            return y.createdAt - x.createdAt;
        })
    }

    return (
        <div className="avatars-app">
            <div id="drop-area">
                <input
                type="file"
                id="fileElem"
                accept="image/*"
                onChange={e => {
                    handleFiles(e.target.files);
                }}
                />
                <label className="upload-label" htmlFor="fileElem">
                <div className="upload-text">Drag and Drop your photo here or click to upload</div>
                </label>
                <div className="uploaded-image">
                    <img src="https://i.pinimg.com/originals/51/f6/fb/51f6fb256629fc755b8870c801092942.png" id="image-upload" className="image" alt="default avatar"/> 
                </div>
                <label id="fileerror"></label>
                {imgBlob && <button className="save-btn" onClick={saveFile}>Save avatar</button>}
            </div>

            {showLoadingGif && <img src={LoadingGif} alt="loading" className="loading-gif"/> }

            <div className={`list-avatars ${!showLoadingGif ? 'mt-100': ''}`}>
                <h2>List of avatars</h2>
                <ul className="list">
                    {allAvatars.map((item, index)=> {
                        return (<li key={index}>
                            <img src={item.imageUrl} id={`image-${item.id}`} alt="avatar"/> 
                            <label className="date-uploaded">{moment(item.createdAt).format('LLL')}</label>
                        </li>)
                    })}
                </ul>
            </div>
        </div>
    );
    
}
