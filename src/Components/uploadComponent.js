/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component } from "react";

export class UploadComponent extends Component {
    state = {};

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

  render() {
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
                <button className="save-btn">Save avatar</button>
            </div>

            

            <div className="list-avatars">
                <h2>List of avatars</h2>
                <ul className="list">
                    <li>
                        <img src="https://i.pinimg.com/originals/51/f6/fb/51f6fb256629fc755b8870c801092942.png" id="image-id" alt="avatar"/> 
                        <label className="date-uploaded">5 Jan 2021</label>
                    </li>
                    <li>
                        <img src="https://i.pinimg.com/originals/51/f6/fb/51f6fb256629fc755b8870c801092942.png" id="image-id" alt="avatar"/> 
                        <label className="date-uploaded">5 Jan 2021</label>
                    </li>
                    <li>
                        <img src="https://i.pinimg.com/originals/51/f6/fb/51f6fb256629fc755b8870c801092942.png" id="image-id" alt="avatar"/> 
                        <label className="date-uploaded">5 Jan 2021</label>
                    </li>
                    <li>
                        <img src="https://i.pinimg.com/originals/51/f6/fb/51f6fb256629fc755b8870c801092942.png" id="image-id" alt="avatar"/> 
                        <label className="date-uploaded">5 Jan 2021</label>
                    </li>
                </ul>
            </div>
        </div>
    );
  }
}
