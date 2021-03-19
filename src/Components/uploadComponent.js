/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component } from "react";
import firebase from 'firebase';
import db from '../firebase';
import moment from 'moment';
import LoadingGif from '../assets/img/loadingBlue.gif';

function removeSpaces (Text) {
    return Text
        .toLowerCase()
        .replace(/\s/g,'-')
}
export class UploadComponent extends Component {
    state = {
        imgBlob: '',
        showLoadingGif: false,
        allAvatars: []
    };

    componentDidMount() {
        const dropArea = document.getElementById("drop-area");
        ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
        dropArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ["dragenter", "dragover"].forEach(eventName => {
        dropArea.addEventListener(eventName, this.highlight, false);
        });

        ["dragleave", "drop"].forEach(eventName => {
        dropArea.addEventListener(eventName, this.unHightLight, false);
        });

        dropArea.addEventListener("drop", this.handleDrop, false);


        this.getAllAvatars();
    }
    componentWillUnmount() {
        const dropArea = document.getElementById("drop-area");
        ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
        dropArea.removeEventListener(eventName, this.preventDefaults, false);
        });

        ["dragenter", "dragover"].forEach(eventName => {
        dropArea.removeEventListener(eventName, this.highlight, false);
        });

        ["dragleave", "drop"].forEach(eventName => {
        dropArea.removeEventListener(eventName, this.unHightLight, false);
        });

        dropArea.removeEventListener("drop", this.handleDrop, false);
    }
    preventDefaults = e => {
        e.preventDefault();
        e.stopPropagation();
    };

    highlight = () => {
        const ele = document.querySelector(".upload-label");
        if (ele) {
        ele.style.backgroundColor = "#e9e9e9";
        ele.style.border = "2px dotted #999";
        }
    };

    unHightLight = () => {
        const ele = document.querySelector(".upload-label");
        if (ele) {
        ele.style.backgroundColor = "#f6f6f6";
        ele.style.border = "unset";
        }
    };

    handleDrop = e => {
        const dt = e.dataTransfer;
        const { files } = dt;
        this.handleFiles(files);
    };

    handleFiles = files => {
        let reader = new FileReader();
        if(this.validateImage(files[0])) {
            reader.readAsDataURL(files[0]);
            reader.onloadend = (e) => {
                document.getElementById('fileerror').innerHTML = '';
                this.setState({ imgBlob: files[0]})
                document.getElementById("image-upload").src = e.target.result;
            };
        }
    };

    validateImage = (image) => {

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


    saveFile = async (e) => {
        e.preventDefault();
        this.setState({ showLoadingGif: true });
        try {
            const { imgBlob } = this.state;
            if(imgBlob) {
                let imageName = Date.now() + removeSpaces(imgBlob.name);
                const storageRef = firebase.storage().ref();
                const fileRef = storageRef.child(`/avatars/${imageName}`);
                fileRef.put(imgBlob).then(snapshot => {
                    snapshot.ref.getDownloadURL().then(async url => {
                        await this.saveItemToDB(url, imageName);
                    });
                    this.setState({ showLoadingGif: false });
                }).catch((error) => {
                    document.getElementById('fileerror').innerHTML = error.message;
                    this.setState({ showLoadingGif: false });
                });
            } 
            
            document.getElementById("image-upload")
            .src = "https://i.pinimg.com/originals/51/f6/fb/51f6fb256629fc755b8870c801092942.png";
            this.setState({ imgBlob: ''});
            
        } catch(error) {
            this.setState({ showLoadingGif: false });
            console.log('error:', error);
        }
    }

    saveItemToDB = async (url, imageName) => {
        let data = {
            imageName,
            imageUrl: url,
            createdAt: Date.now()
        }
        try {
            const avatarRef = db.firestore().collection('avatars');
            await avatarRef.add(data);
            await this.getAllAvatars();
        } catch(error) {
            console.log('error:', error);
        }
    }

    getAllAvatars = async () => {
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
            return this.setState({ allAvatars });
        } catch(error) {
            console.log('error:', error);
        }
    }

    render() {
        let { imgBlob, allAvatars, showLoadingGif } = this.state;

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
                        this.handleFiles(e.target.files);
                    }}
                    />
                    <label className="upload-label" htmlFor="fileElem">
                    <div className="upload-text">Drag and Drop your photo here or click to upload</div>
                    </label>
                    <div className="uploaded-image">
                        <img src="https://i.pinimg.com/originals/51/f6/fb/51f6fb256629fc755b8870c801092942.png" id="image-upload" className="image" alt="default avatar"/> 
                    </div>
                    <label id="fileerror"></label>
                    {imgBlob && <button className="save-btn" onClick={this.saveFile}>Save avatar</button>}
                </div>

                {showLoadingGif && <img src={LoadingGif} alt="loading image" className="loading-gif"/> }

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
}
