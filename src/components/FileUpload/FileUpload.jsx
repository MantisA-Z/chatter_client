import React, { useState } from "react";
import { FaFile as FileUploadIcon } from "react-icons/fa6";
import { useFetchContext } from "../../contexts/FetchContext";
import "./fileUpload.css";

const FileUpload = ({
  selectedFile,
  setSelectedFile,
  socket,
  selectedGroup,
  connectionId,
}) => {
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [captions, setCaptions] = useState("");
  const sendReq = useFetchContext();
  const senReq = useFetchContext();
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

  const handleInputChange = (e) => {
    setCaptions(e.target.value);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];

    if (file.size > MAX_FILE_SIZE) {
      alert("Too large file");
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setFileType(file.type);

    //set preview if file type is image or video
    if (file.type.startsWith("image") || file.type.startsWith("video")) {
      const fileUrl = URL.createObjectURL(file);
      setFilePreviewUrl(fileUrl);
    }
  };

  const sendFileMsg = async () => {
    if (!selectedFile || !selectedGroup || !sendReq) return;
    const reader = new FileReader();
    reader.onload = () => {
      const fileUrl = reader.result;

      socket.emit("user:file-msg", {
        connectionId,
        groupId: selectedGroup._id,
        msg: { captions, file: fileUrl, fileType },
      });

      setFileType("");

      console.log(reader.result);
    };
    reader.readAsDataURL(selectedFile);

    /* await sendReq(
      "http://127.0.0.1:8000/api/fileMsg",
      {},
      JSON.stringify({
        connectionId,
        groupId: selectedGroup._id,
        msg: { captions, file: selectedFile, fileType },
      })
    ); */
  };
  return (
    <div className="upload-file-container">
      <div className="file-upload-accordion">
        {fileType.startsWith("image") && (
          <div className="image-preview">
            <div className="name">{fileName}</div>
            <img src={filePreviewUrl} alt="" />
            <input
              className="captions"
              value={captions}
              onChange={handleInputChange}
              type="text"
              placeholder="Captions"
            />
            <button className="sendFile" onClick={sendFileMsg}>
              Send
            </button>
          </div>
        )}
        {fileType.startsWith("video") && (
          <div className="video-preview">
            <div className="name">{fileName}</div>
            <video src={filePreviewUrl} autoPlay loop></video>
            <input
              className="captions"
              value={captions}
              onChange={handleInputChange}
              type="text"
              placeholder="Captions"
            />
            <button className="sendFile" onClick={sendFileMsg}>
              Send
            </button>
          </div>
        )}
      </div>
      <label htmlFor="file-upload" className="label-file-upload">
        <FileUploadIcon />
      </label>
      <input
        type="file"
        id="file-upload"
        className="file-upload"
        onChange={onFileChange}
      />
    </div>
  );
};

export default FileUpload;
