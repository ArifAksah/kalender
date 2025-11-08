import React, { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './AvatarUpload.css';

function AvatarUpload({ currentAvatar, onAvatarChange }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 90, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setShowCrop(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) return;

    const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
    const file = new File([croppedImageBlob], 'avatar.jpg', { type: 'image/jpeg' });
    
    onAvatarChange(file);
    setShowCrop(false);
    setImageSrc(null);
    setCompletedCrop(null);
  };

  const handleCancel = () => {
    setShowCrop(false);
    setImageSrc(null);
    setCompletedCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        {currentAvatar ? (
          <img src={currentAvatar} alt="Avatar" className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">
            <span>👤</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        style={{ display: 'none' }}
        id="avatar-input"
      />

      <label htmlFor="avatar-input" className="avatar-upload-button">
        {currentAvatar ? 'Change Avatar' : 'Upload Avatar'}
      </label>

      {showCrop && imageSrc && (
        <div className="crop-modal">
          <div className="crop-modal-content">
            <h3>Crop Avatar</h3>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                style={{ maxWidth: '100%' }}
              />
            </ReactCrop>
            <div className="crop-actions">
              <button onClick={handleCancel} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleCropComplete} className="btn-confirm">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvatarUpload;

